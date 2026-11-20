import assert from "node:assert/strict";
import test from "node:test";
import { mapPoint, mapArea, localImage, deviceEntities, callAction, parseFields, availableActions, capabilityEntities, buildCleaningTask, mapEditPayload } from "../dreame-open-card.js";

const calibration = [
  { map: { x: 20, y: 30 }, vacuum: { x: 0, y: 0 } },
  { map: { x: 20, y: 50 }, vacuum: { x: 1000, y: 0 } },
  { map: { x: 0, y: 30 }, vacuum: { x: 0, y: 1000 } },
];

test("converts rotated map coordinates including the origin", () => {
  assert.deepEqual(mapPoint(calibration, [10, 40]), [500, 500]);
  assert.deepEqual(mapPoint(calibration, [20, 30]), [0, 0]);
  assert.equal(mapPoint([calibration[0], calibration[0], calibration[2]], [0, 0]), null);
  assert.equal(mapPoint(calibration, [NaN, 2]), null);
  assert.equal(mapPoint(calibration, [null, 2]), null);
});

test("projects a room center onto a rotated image without rounding", async () => {
  const { roomMarkerPosition } = await import("../dreame-open-card.js");
  assert.deepEqual(roomMarkerPosition(calibration, { x0: 0, y0: 100, x1: 225, y1: 450 }, 100, 100), [0.145, 0.3225]);
});

test("omits room markers for invalid bounds, calibration or image size", async () => {
  const { roomMarkerPosition } = await import("../dreame-open-card.js");
  const bounds = { x0: 0, y0: 0, x1: 1000, y1: 1000 };
  assert.equal(roomMarkerPosition(calibration, { ...bounds, x1: "1000" }, 100, 100), null);
  assert.equal(roomMarkerPosition(calibration, { ...bounds, x1: 0 }, 100, 100), null);
  assert.equal(roomMarkerPosition(calibration, bounds, 5, 100), null);
  assert.equal(roomMarkerPosition([calibration[0], calibration[0], calibration[2]], bounds, 100, 100), null);
  assert.equal(roomMarkerPosition(calibration, bounds, 0, 100), null);
});

test("a zone has ordered distinct corners", () => {
  assert.deepEqual(mapArea([13, -10], [-8, 5]), [-8, -10, 13, 5]);
  assert.equal(mapArea([13, 1], [13, 3]), null);
});

test("sends multiple normalized zones in selection order without changing the single-zone format", () => {
  const zones = [[[8, 2], [1, 9]], [[-4, 3], [-2, -6]]];
  assert.deepEqual(buildCleaningTask("zone", { zones }), {
    action: "dreame_vacuum.vacuum_clean_zone", data: { zone: [[1, 2, 8, 9], [-4, -6, -2, 3]] },
  });
  assert.deepEqual(buildCleaningTask("zone", { zones: zones.slice(0, 1) }).data.zone, [1, 2, 8, 9]);
});

test("rejects an entire zone task if one rectangle is invalid", () => {
  const valid = [[0, 0], [1, 1]];
  for (const invalid of [[[3, 4], [3, 5]], [[1.5, 2], [3, 4]], [[0, 0], [Infinity, 1]]]) {
    assert.throws(() => buildCleaningTask("zone", { zones: [valid, invalid] }), /zone/i);
  }
  assert.throws(() => buildCleaningTask("zone", { zones: [] }), /zone/i);
});

test("spot cleaning preserves multiple ordered coordinates", () => {
  assert.deepEqual(buildCleaningTask("spot", { points: [[0, 5], [-3, 8]] }).data.points, [[0, 5], [-3, 8]]);
  assert.throws(() => buildCleaningTask("spot", { points: [[0, 5], [2, NaN]] }), /point/i);
});

test("dock discovery uses the selected Dreame device and the registered action", async () => {
  const { dockEntities } = await import("../dreame-open-card.js");
  const hass = { states: { "button.renamed": {}, "button.other_manual_drying": {}, "sensor.bot_dust_bag_status": {} },
    entities: { "vacuum.bot": { device_id: "bot" }, "button.renamed": { device_id: "bot", translation_key: "self_clean" },
      "button.other_manual_drying": { device_id: "other" }, "sensor.bot_dust_bag_status": { device_id: "bot" } },
    services: { button: { press: {} } } };
  const config = { entity: "vacuum.bot", entities: Object.keys(hass.states) };
  assert.equal(dockEntities(hass, config).self_clean, "button.renamed");
  assert.equal(dockEntities(hass, config).manual_drying, undefined);
  assert.equal(dockEntities(hass, config).dust_bag_status, "sensor.bot_dust_bag_status");
  hass.services = {};
  assert.equal(dockEntities(hass, config).self_clean, undefined);
});

test("an unpressed Home Assistant button is usable but an unavailable button is not", async () => {
  const sent = [];
  const id = "button.bot_self_clean";
  const state = { state: "unknown" };
  const hass = { states: { [id]: state }, services: { button: { press: {} } }, callService: (...args) => sent.push(args) };
  await callAction(hass, id, "button.press");
  state.state = "unavailable";
  await assert.rejects(callAction(hass, id, "button.press"), /unavailable/);
  assert.deepEqual(sent, [["button", "press", {}, { entity_id: id }]]);
});

test("history joins only an unambiguous local image for the same camera and timestamp", async () => {
  const { historyEntries } = await import("../dreame-open-card.js");
  const local = "/api/camera_history_map_proxy/camera.map?index=1&v=20";
  const rows = historyEntries({ old: { timestamp: 10 }, newer: { timestamp: 20, cleaned_area: "20 m²" }, metadata: "sensor" },
    { newest: local, wrong: "/api/camera_history_map_proxy/camera.other?v=10", external: "https://other.example/?v=10" }, "camera.map");
  assert.deepEqual(rows.map(({ timestamp, image }) => [timestamp, image]), [[20, local], [10, null]]);
  assert.equal(historyEntries({ newer: { timestamp: 20 } }, { a: local, b: local.replace("index=1", "index=2") }, "camera.map")[0].image, null);
});

test("maintenance groups life and time estimates by consumable without inventing values", async () => {
  const { maintenanceEntries } = await import("../dreame-open-card.js");
  const registry = Object.fromEntries(["vacuum.bot", "sensor.bot_main_brush_left", "sensor.bot_main_brush_time_left",
    "sensor.bot_filter_left", "sensor.bot_drying_left"].map((id) => [id, { device_id: "bot" }]));
  const hass = { entities: registry, states: {
    "sensor.bot_main_brush_left": { state: "18", attributes: { friendly_name: "Brush life" } },
    "sensor.bot_main_brush_time_left": { state: "24", attributes: { unit_of_measurement: "h" } },
    "sensor.bot_filter_left": { state: "unavailable" }, "sensor.bot_drying_left": { state: "65" },
  } };
  assert.deepEqual(maintenanceEntries(hass, { entity: "vacuum.bot" }), [
    { name: "Brush life", percent: 18, time: "24 h" },
  ]);
});

test("validates aligned per-room cleaning settings", async () => {
  const { customCleaningPayload } = await import("../dreame-open-card.js");
  assert.deepEqual(customCleaningPayload({ segment_id: "[1,2]", suction_level: "[2,3]", repeats: "[1,1]", water_volume: "[0,2]" }),
    { segment_id: [1, 2], suction_level: [2, 3], repeats: [1, 1], water_volume: [0, 2] });
  assert.throws(() => customCleaningPayload({ segment_id: "[1]", suction_level: "[2,3]", repeats: "[1]" }), /equal lengths/i);
  assert.throws(() => customCleaningPayload({ segment_id: "{}", suction_level: "[2]", repeats: "[1]" }), /integer list/i);
});

test("summarizes only map object collections supplied by the camera", async () => {
  const { mapObjectSummary } = await import("../dreame-open-card.js");
  assert.deepEqual(mapObjectSummary({ no_go_areas: [[1, 2, 3, 4]], obstacles: { one: {}, two: {} }, unknown: [1] }), [
    { key: "no_go_areas", label: "No-go areas", count: 1 }, { key: "obstacles", label: "Obstacles", count: 2 },
  ]);
});

test("reads schedule and shortcut collections without inventing entries", async () => {
  const { scheduleEntries, shortcutEntries } = await import("../dreame-open-card.js");
  assert.deepEqual(scheduleEntries({ morning: { enabled: true, time: "07:30", days: [1, 3] }, bad: "ignored" }),
    [{ name: "morning", enabled: true, time: "07:30", days: [1, 3] }]);
  assert.deepEqual(shortcutEntries({ quick: { tasks: [{ room: 1 }, { room: 2 }] }, bad: false }),
    [{ name: "quick", tasks: 2 }]);
});

test("builds validated cleaning task payloads", () => {
  assert.deepEqual(buildCleaningTask("global", {}, {}), { action: "vacuum.start", data: {} });
  assert.deepEqual(buildCleaningTask("room", { rooms: [3, 7] }, {}), { action: "dreame_vacuum.vacuum_clean_segment", data: { segments: [3, 7] } });
  assert.deepEqual(buildCleaningTask("zone", { corners: [[8, 2], [1, 9]] }, {}), { action: "dreame_vacuum.vacuum_clean_zone", data: { zone: [1, 2, 8, 9] } });
  assert.deepEqual(buildCleaningTask("spot", { point: [12, 14] }, {}), { action: "dreame_vacuum.vacuum_clean_spot", data: { points: [[12, 14]] } });
  assert.deepEqual(buildCleaningTask("goto", { point: [12, 14] }, {}), { action: "dreame_vacuum.vacuum_goto", data: { x: 12, y: 14 } });
  assert.throws(() => buildCleaningTask("room", { rooms: [] }, {}), /room/i);
  assert.throws(() => buildCleaningTask("zone", { corners: [[1, 1], [1, 4]] }, {}), /zone/i);
  assert.throws(() => buildCleaningTask("spot", { point: [1.5, 2] }, {}), /point/i);
});

test("builds complete map edit payloads and rejects unsafe edits", () => {
  assert.deepEqual(mapEditPayload("set_restricted_zone", { walls: "[]", zones: "[[0,1,3,4]]", no_mops: "[]", confirm: true }), { walls: [], zones: [[0, 1, 3, 4]], no_mops: [] });
  assert.deepEqual(mapEditPayload("rename_map", { map_id: "4", map_name: "Upstairs" }), { map_id: 4, map_name: "Upstairs" });
  assert.throws(() => mapEditPayload("delete_map", { map_id: "4" }), /confirm/i);
  assert.throws(() => mapEditPayload("set_walls", { walls: "[]", doors: "[]", map_id: "4", confirm: true }), /walls/i);
  assert.throws(() => mapEditPayload("unknown", { confirm: "yes" }), /unknown/i);
});

test("checks coordinate rows before sending destructive map edits", () => {
  const confirmed = { confirm: true };
  assert.throws(() => mapEditPayload("set_restricted_zone", { ...confirmed, zones: "[{\"x\":1}]" }), /zones/);
  assert.throws(() => mapEditPayload("set_restricted_zone", { ...confirmed, walls: "[[0,1,2,4.2]]" }), /walls/);
  assert.throws(() => mapEditPayload("set_walls", { ...confirmed, doors: "[[0,1,2,3]]" }), /doors/);
  assert.throws(() => mapEditPayload("set_walls", { ...confirmed, walls: "{\"1\":[0,\"invalid\"]}" }), /walls/);
  assert.deepEqual(mapEditPayload("set_walls", { ...confirmed, doors: "[]" }), { doors: [] });
});

test("camera images stay on local HA camera endpoints", () => {
  assert.equal(localImage("/api/camera_proxy/camera.map?token=abc"), "/api/camera_proxy/camera.map?token=abc");
  assert.equal(localImage("/api/camera_map_obstacle_proxy/camera.map?index=1"), "/api/camera_map_obstacle_proxy/camera.map?index=1");
  for (const url of ["//remote.example/a", "https://remote.example/x", "/api/config", "/api/camera_proxy/../private"]) {
    assert.equal(localImage(url), null);
  }
});

test("automatically discovers related device entities only", () => {
  const hass = {
    states: { "button.dock": {}, "select.mode": {}, "button.other": {} },
    entities: {
      "vacuum.bot": { device_id: "a" },
      "button.dock": { device_id: "a" },
      "select.mode": { device_id: "a" },
      "button.other": { device_id: "b" },
    },
  };
  assert.deepEqual(deviceEntities(hass, { entity: "vacuum.bot" }), ["button.dock", "select.mode"]);
  assert.deepEqual(deviceEntities(hass, { entity: "vacuum.bot", entities: [] }), []);
});

test("filters actions to advertised services and available targets", () => {
  const hass = {
    states: { "vacuum.bot": { state: "docked" }, "button.dock": { state: "on" }, "sensor.level": { state: "42" } },
    services: { vacuum: { start: {}, stop: {} }, dreame_vacuum: { vacuum_clean_segment: {} } },
    entities: {
      "vacuum.bot": { device_id: "a" }, "button.dock": { device_id: "a" }, "sensor.level": { device_id: "a" },
    },
  };
  assert.deepEqual(availableActions(hass, ["vacuum.start", "vacuum.pause", "dreame_vacuum.vacuum_clean_segment"]), ["vacuum.start", "dreame_vacuum.vacuum_clean_segment"]);
  assert.deepEqual(capabilityEntities(hass, { entity: "vacuum.bot" }), { "button.dock": hass.states["button.dock"], "sensor.level": hass.states["sensor.level"] });
});

test("only calls an advertised HA action with a dedicated target", async () => {
  const sent = [];
  const hass = {
    states: { "vacuum.bot": { state: "docked" } },
    services: { dreame_vacuum: { vacuum_clean_segment: {} } },
    callService: (...args) => sent.push(args),
  };
  await callAction(hass, "vacuum.bot", "dreame_vacuum.vacuum_clean_segment", { segments: [3] });
  assert.deepEqual(sent, [["dreame_vacuum", "vacuum_clean_segment", { segments: [3] }, { entity_id: "vacuum.bot" }]]);
  await assert.rejects(callAction(hass, "vacuum.bot", "dreame_vacuum.vacuum_clean_zone"), /unavailable/);
  await assert.rejects(callAction(hass, "vacuum.bot", "dreame_vacuum.vacuum_clean_segment", { entity_id: "vacuum.other" }), /target/);
  hass.states["vacuum.bot"].state = "unavailable";
  await assert.rejects(callAction(hass, "vacuum.bot", "dreame_vacuum.vacuum_clean_segment"), /unavailable/);
  assert.equal(sent.length, 1);
});

test("validates advanced form fields before they reach HA", () => {
  const fields = [["map_id", "int", true], ["segments", "list", false], ["name", "text", false]];
  assert.deepEqual(parseFields(fields, { map_id: "14", segments: "[3, 2]", name: " " }), { map_id: 14, segments: [3, 2] });
  assert.throws(() => parseFields(fields, { map_id: "1.5" }), /map_id/);
  assert.throws(() => parseFields(fields, { map_id: "1", segments: "{}" }), /segments/);
});

test("validates additive panel and map configuration", async () => {
  const { validateCardConfig } = await import("../dreame-open-card.js");
  assert.equal(validateCardConfig({ features: { dock: false, history: false } }), true);
  assert.throws(() => validateCardConfig({ features: { dock: "false" } }), /features\.dock/);
  assert.deepEqual(validateCardConfig({ entity: "vacuum.bot", mode: "panel", features: { dock: true }, map: { rotation: 90, scale: 1.5, offset: [2, -3] } }), true);
  assert.throws(() => validateCardConfig({ entity: "vacuum.bot", mode: "compact" }), /mode/i);
  assert.throws(() => validateCardConfig({ entity: "vacuum.bot", map: { scale: 0 } }), /scale/i);
  assert.throws(() => validateCardConfig({ entity: "vacuum.bot", map: { offset: [1] } }), /offset/i);
});

test("chooses French for Home Assistant's French locales and English otherwise", async () => {
  const { languageFor, translate } = await import("../dreame-open-card.js");
  assert.equal(languageFor({ locale: { language: "fr-CA" }, language: "en" }), "fr");
  assert.equal(languageFor({ language: "fr_FR" }), "fr");
  assert.equal(languageFor({ locale: { language: "de-DE" } }), "en");
  assert.equal(languageFor(), "en");
  assert.equal(translate("fr", "Clean rooms"), "Nettoyer les pièces");
  assert.equal(translate("en", "Clean rooms"), "Clean rooms");
  assert.equal(translate("fr", "Required field · map_id"), "Champ obligatoire · map_id");
  assert.equal(translate("fr", "Unknown upstream error"), "Unknown upstream error");
});
