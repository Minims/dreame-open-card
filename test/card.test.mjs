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

test("a zone has ordered distinct corners", () => {
  assert.deepEqual(mapArea([13, -10], [-8, 5]), [-8, -10, 13, 5]);
  assert.equal(mapArea([13, 1], [13, 3]), null);
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
  assert.deepEqual(mapEditPayload("set_restricted_zone", { walls: "[]", zones: "[{\"x\":1}]", no_mops: "[]", confirm: true }), { walls: [], zones: [{ x: 1 }], no_mops: [] });
  assert.deepEqual(mapEditPayload("rename_map", { map_id: "4", map_name: "Upstairs" }), { map_id: 4, map_name: "Upstairs" });
  assert.throws(() => mapEditPayload("delete_map", { map_id: "4" }), /confirm/i);
  assert.throws(() => mapEditPayload("set_walls", { walls: "[]", doors: "[]", map_id: "4", confirm: true }), /walls/i);
  assert.throws(() => mapEditPayload("unknown", { confirm: "yes" }), /unknown/i);
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
