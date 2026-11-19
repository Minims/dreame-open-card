import assert from "node:assert/strict";
import test from "node:test";
import { mapPoint, mapArea, localImage, deviceEntities, callAction, parseFields } from "../dreame-open-card.js";

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
