import assert from "node:assert/strict";
import test from "node:test";
import { mapPoint, mapArea, localImage, deviceEntities, callAction, parseFields, availableActions, capabilityEntities, buildCleaningTask, mapEditPayload } from "../dreame-open-card.js";

const calibration = [
  { map: { x: 20, y: 30 }, vacuum: { x: 0, y: 0 } },
  { map: { x: 20, y: 50 }, vacuum: { x: 1000, y: 0 } },
  { map: { x: 0, y: 30 }, vacuum: { x: 0, y: 1000 } },
];

test("structured map checks frame identity and resolves rooms by floor pixel", async () => {
  const { decodeMapScene, scenePixel } = await import("../dreame-open-card.js");
  const frame = { size: [100, 200, 100, 200, 4, 2, 50, 90, [0, 0, 0, 0]], saved_map_id: 7, map_id: 71, frame_id: 42,
    data: { 1: [0, 0, 2], 2: [2, 0, 1], 255: [1, 1, 2], 512: [0, 0, 1] } };
  const scene = decodeMapScene(frame, { floor: 7, frame: 42 });
  assert.equal(scenePixel(scene, [124, 212]), 1);
  assert.equal(scenePixel(scene, [224, 212]), 2);
  assert.equal(scenePixel(scene, [174, 262]), 255);
  assert.equal(scenePixel(scene, [299, 212]), 0);
  assert.equal(scenePixel(scene, [99, 212]), 0);
  assert.equal(decodeMapScene(frame, { floor: 8, frame: 42 }), null);
  assert.equal(decodeMapScene(frame, { floor: 7, frame: 43 }), null);
  assert.equal(decodeMapScene(frame, { floor: 7, mapId: 72, frame: 42 }), null);
  assert.equal(decodeMapScene({ ...frame, data: { 1: [3, 0, 2] } }, { floor: 7, frame: 42 }), null);
  assert.equal(decodeMapScene({ ...frame, data: { 1: [0, 0, 2], 2: [1, 0, 2] } }, { floor: 7, frame: 42 }), null);
});

test("structured map URLs preserve only the current camera authentication and version", async () => {
  const { mapDataURL } = await import("../dreame-open-card.js");
  assert.equal(mapDataURL("/api/camera_proxy/camera.eve_map?token=demo&v=42&resources=1", "camera.eve_map"),
    "/api/camera_map_data_proxy/camera.eve_map?token=demo&v=42");
  assert.equal(mapDataURL("/api/camera_proxy/camera.other?token=demo", "camera.eve_map"), null);
  assert.equal(mapDataURL("/api/camera_proxy/camera.eve_map?token=demo", "camera.eve_map"), null);
});

test("structured maps exclude hidden and obstacle cells from targeting", async () => {
  const { decodeMapScene, scenePixel, cleanablePixel } = await import("../dreame-open-card.js");
  const size = [100, 200, 100, 200, 6, 1, 50];
  const data = { 1: [0, 0, 1], 2: [1, 0, 1], 103: [5, 0, 1], 201: [2, 0, 1], 251: [3, 0, 1], 254: [4, 0, 1] };
  assert.equal(decodeMapScene({ size, data, saved_map_id: 7, temporary_map: true }, { floor: 7 }), null);
  const scene = decodeMapScene({ size, data, saved_map_id: 7, hidden_segments: [2] }, { floor: 7 });
  assert.deepEqual([125, 175, 225, 275, 325, 375].map(x => cleanablePixel(scenePixel(scene, [x, 225]))),
    [true, false, false, false, true, false]);
});

test("graphical restricted-area edits preserve all three lists and reject stale or incomplete maps", async () => {
  const { restrictionSnapshot, appendRestriction } = await import("../dreame-open-card.js");
  const attrs = { virtual_walls: [[0, 0, 3, 3]], no_go_areas: [[1, 2, 3, 4]], no_mopping_areas: [] };
  const before = restrictionSnapshot(attrs, 7, 7);
  assert.deepEqual(appendRestriction(before, before, "zones", [[8, 9], [5, 6]]),
    { walls: [[0, 0, 3, 3]], zones: [[1, 2, 3, 4], [5, 6, 8, 9]], no_mops: [] });
  assert.equal(restrictionSnapshot(attrs, 7, 8), null);
  assert.equal(restrictionSnapshot({ ...attrs, virtual_walls: undefined }, 7, 7), null);
  const changed = restrictionSnapshot({ ...attrs, virtual_walls: [] }, 7, 7);
  assert.throws(() => appendRestriction(before, changed, "zones", [[8, 9], [5, 6]]), /changed/);
  const area = { x0: 1, y0: 2, x1: 3, y1: 2, x2: 3, y2: 4, x3: 1, y3: 4 };
  assert.equal(restrictionSnapshot({ ...attrs, no_go_areas: [area] }, 7, 7), before);
  assert.equal(restrictionSnapshot({ ...attrs, no_go_areas: [{ ...area, angle: 15 }] }, 7, 7), null);
  assert.equal(restrictionSnapshot({ ...attrs, no_go_areas: [[0, 0, 3, 1, 2, 4, -1, 3]] }, 7, 7), null);
});

test("resizing or deleting a restriction changes only the selected rectangle", async () => {
  const { restrictionSnapshot, editRestriction } = await import("../dreame-open-card.js");
  const map = { virtual_walls: [[0, 0, 3, 3]], no_go_areas: [[1, 2, 3, 4], [6, 7, 8, 9]], no_mopping_areas: [[1, 1, 2, 2]] };
  const snapshot = restrictionSnapshot(map, 7, 7);
  assert.deepEqual(editRestriction(snapshot, snapshot, "zones", { index: 0, corners: [[5, 5], [2, 2]] }),
    { walls: map.virtual_walls, zones: [[2, 2, 5, 5], [6, 7, 8, 9]], no_mops: [[1, 1, 2, 2]] });
  assert.deepEqual(editRestriction(snapshot, snapshot, "no_mops", { index: 0 }),
    { walls: map.virtual_walls, zones: map.no_go_areas, no_mops: [] });
  assert.throws(() => editRestriction(snapshot, snapshot, "zones", { index: 2 }), /changed/);
  assert.throws(() => editRestriction(snapshot, restrictionSnapshot(map, 8, 8), "zones", { index: 0 }), /changed/);
});

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

test("projects selectable map objects from point and rectangle contracts", async () => {
  const { mapObjectMarkers } = await import("../dreame-open-card.js");
  const calibration = [{ map: { x: 0, y: 0 }, vacuum: { x: 0, y: 0 } }, { map: { x: 100, y: 0 }, vacuum: { x: 100, y: 0 } }, { map: { x: 0, y: 100 }, vacuum: { x: 0, y: 100 } }];
  const result = mapObjectMarkers({ obstacles: { a: { x: 20, y: 30, type: "obstacle" } }, carpets: [[10, 20, 50, 60]], furniture: [{ x0: 60, y0: 10, x1: 90, y1: 30 }] }, calibration, 100, 100);
  assert.deepEqual(result.map(({ kind, x, y }) => [kind, x, y]), [["obstacles", 0.2, 0.3], ["carpets", 0.3, 0.4], ["furniture", 0.75, 0.2]]);
});

test("ignores map objects without safe coordinates", async () => {
  const { mapObjectMarkers } = await import("../dreame-open-card.js");
  const calibration = [{ map: { x: 0, y: 0 }, vacuum: { x: 0, y: 0 } }, { map: { x: 100, y: 0 }, vacuum: { x: 100, y: 0 } }, { map: { x: 0, y: 100 }, vacuum: { x: 0, y: 100 } }];
  assert.deepEqual(mapObjectMarkers({ obstacles: { bad: { x: "20", y: 30 } }, carpets: [[0, 0, 0, 10]] }, calibration, 100, 100), []);
});

test("builds replacement map-object lists from existing rows plus a new rectangle", async () => {
  const { appendMapRectangle } = await import("../dreame-open-card.js");
  assert.deepEqual(appendMapRectangle([[1, 2, 3, 4]], [8, 9], [5, 6], "zones"), [[1, 2, 3, 4], [5, 6, 8, 9]]);
  assert.deepEqual(appendMapRectangle([], [8, 9], [5, 6], "no_mops"), [[5, 6, 8, 9]]);
  assert.throws(() => appendMapRectangle([[1, 2, 3, 4]], [5, 5], [5, 8], "zones"), /rectangle/i);
});

test("reads schedule and shortcut collections without inventing entries", async () => {
  const { scheduleEntries, shortcutEntries } = await import("../dreame-open-card.js");
  assert.deepEqual(scheduleEntries({ morning: { enabled: true, time: "07:30", days: [1, 3] }, bad: "ignored" }),
    [{ name: "morning", enabled: true, time: "07:30", days: [1, 3] }]);
  assert.deepEqual(scheduleEntries([{ id: 17, enabled: true, invalid: true, time: "07:30" }]),
    [{ name: "07:30", enabled: false, time: null, days: [] }]);
  assert.deepEqual(shortcutEntries({ quick: { tasks: [{ room: 1 }, { room: 2 }] }, bad: false }),
    [{ name: "quick", tasks: 2 }]);
  assert.deepEqual(shortcutEntries({ 25: { id: 25, name: "Kitchen", tasks: [[{ segment_id: 2 }]] }, 12: { id: 12 } }),
    [{ name: "12", tasks: null }, { id: 25, name: "Kitchen", tasks: 1 }]);
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
  const restrictions = { ...confirmed, walls: "[]", zones: "[]", no_mops: "[]" };
  assert.throws(() => mapEditPayload("set_restricted_zone", { ...restrictions, no_mops: "" }), /Required field.*no_mops/);
  assert.throws(() => mapEditPayload("set_restricted_zone", { ...restrictions, zones: "[{\"x\":1}]" }), /zones/);
  assert.throws(() => mapEditPayload("set_restricted_zone", { ...restrictions, walls: "[[0,1,2,4.2]]" }), /walls/);
  assert.doesNotThrow(() => mapEditPayload("set_restricted_zone", { ...restrictions, zones: "[[0,1,2,4,30]]" }));
  assert.throws(() => mapEditPayload("set_restricted_zone", { ...restrictions, zones: "[[0,1,2,4],[0,1,2,4,30]]" }), /zones/);
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
  assert.equal(validateCardConfig({ entity: "vacuum.bot", color_scheme: "dreame_dark", icon_set: "material", locked: "only_touch" }), true);
  assert.throws(() => validateCardConfig({ entity: "vacuum.bot", color_scheme: "unknown" }), /color_scheme/i);
  assert.throws(() => validateCardConfig({ entity: "vacuum.bot", icon_set: "unknown" }), /icon_set/i);
  assert.throws(() => validateCardConfig({ entity: "vacuum.bot", locked: "always" }), /locked/i);
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
