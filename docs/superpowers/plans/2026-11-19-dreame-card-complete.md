# Dreame Card Complete Feature Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Extend the independent `dreame-open-card` Lovelace card to cover the documented Dreame workflows while preserving safe Home Assistant capability discovery and YAML compatibility.

**Architecture:** Keep the existing single JavaScript module and Shadow DOM card. Add pure, exported capability/payload helpers first, then render capability-driven panels in the existing card, followed by map/editor and responsive configuration changes. Keep all actions routed through the existing validated `callAction` path.

**Tech Stack:** Native browser JavaScript modules, Home Assistant Lovelace custom card APIs, Node.js built-in test runner, no runtime or build dependencies.

**Spec:** `docs/superpowers/specs/2026-11-19-dreame-card-complete-design.md`

## Global Constraints

- Keep the implementation independent; do not copy vendor source, private bundles or branding assets.
- Keep the existing repository license and attribution files unchanged.
- Preserve the minimal YAML configuration with `entity` and optional `map_camera`.
- Gate every displayed action by an advertised Home Assistant action/entity capability.
- Validate entity IDs, typed fields, coordinates and complete map-list payloads before service calls.
- Do not load remote scripts or remote image URLs from the card.
- Use existing dependencies only; add no dependency or build system.
- Destructive map operations require explicit confirmation.

## Review Focus

- Missing or partially advertised Home Assistant actions must hide controls rather than throw during render; test in Task 1.
- Unavailable/unknown vacuum and camera states must disable actions and avoid stale map interactions; test in Task 1.
- Malformed map calibration, reversed/degenerate zones and unsafe coordinates must be rejected; test in Task 2.
- Complete map editing lists must not be replaced with partial payloads; test in Task 3.
- YAML options must remain additive and invalid values must fail clearly without breaking the card; test in Task 4.

---

### Task 1: Capability inventory and safe action helpers

**Files:**
- Modify: `dreame-open-card/dreame-open-card.js`
- Test: `dreame-open-card/test/card.test.mjs`

**Interfaces:**
- Consumes: existing `hass.states`, `hass.services`, `hass.entities`, `config.entity` and `config.entities`.
- Produces: `availableActions(hass, actions) -> string[]`, `capabilityEntities(hass, config) -> object`, and `actionAvailable(hass, action) -> boolean` while preserving existing `deviceEntities` and `callAction` behavior.

- [ ] **Step 1: Add failing tests** for action filtering, unavailable state handling, explicit entity overrides and missing-service behavior.
- [ ] **Step 2: Run `npm test -- --test-name-pattern="capabil"` and verify the new tests fail.**
- [ ] **Step 3: Implement the minimal pure inventory helpers and use them in render gating.** Keep the existing target validation in `callAction`.
- [ ] **Step 4: Run the focused tests, then `npm test`; expected result: all PASS.**
- [ ] **Step 5: Commit with `feat: add capability-driven card inventory`.**

### Task 2: Complete task modes and map coordinate payloads

**Files:**
- Modify: `dreame-open-card/dreame-open-card.js`
- Test: `dreame-open-card/test/card.test.mjs`

**Interfaces:**
- Consumes: existing `mapPoint`, `mapArea`, calibration data and Dreame action names.
- Produces: `buildCleaningTask(mode, selection, context) -> { action, data }`, supporting global, room, zone, spot and goto modes with validated payloads.

- [ ] **Step 1: Add failing tests** for each task mode, invalid room selections, degenerate zones, invalid points, missing calibration and safe integer conversion.
- [ ] **Step 2: Run the focused task-mode tests and verify failure.**
- [ ] **Step 3: Implement `buildCleaningTask` and replace duplicated task payload assembly in the UI.**
- [ ] **Step 4: Run `npm test`; expected result: all PASS.**
- [ ] **Step 5: Commit with `feat: complete cleaning task modes`.**

### Task 3: Map floors, objects and destructive edit forms

**Files:**
- Modify: `dreame-open-card/dreame-open-card.js`
- Modify: `dreame-open-card/README.md`
- Test: `dreame-open-card/test/card.test.mjs`

**Interfaces:**
- Consumes: `parseFields`, `callAction`, discovered `dreame_vacuum.*` actions and map attributes.
- Produces: `mapEditPayload(operation, values) -> object`, complete-list validation for walls, doors, zones, furniture and materials, plus floor select/rename/delete/backup/restore controls.

- [ ] **Step 1: Add failing tests** for complete list payloads, required map IDs, typed JSON lists/objects, destructive-operation confirmation and malformed edit values.
- [ ] **Step 2: Run focused map-edit tests and verify failure.**
- [ ] **Step 3: Implement the payload helper and render floor/map-object forms only when the matching action exists.** Require confirmation before delete, replace, restore and list-replacement actions.
- [ ] **Step 4: Run `npm test`; expected result: all PASS.**
- [ ] **Step 5: Update the YAML examples and feature matrix in `README.md`; run the documentation test suite if available.**
- [ ] **Step 6: Commit with `feat: add floor and map editing workflows`.**

### Task 4: Dock, settings, maintenance, history and error panels

**Files:**
- Modify: `dreame-open-card/dreame-open-card.js`
- Modify: `dreame-open-card/README.md`
- Test: `dreame-open-card/test/card.test.mjs`

**Interfaces:**
- Consumes: `capabilityEntities`, local image validation, Home Assistant entity states and action availability.
- Produces: grouped renderers for dock/settings/maintenance/history/obstacle images/errors, with no assumptions about model-specific entities.

- [ ] **Step 1: Add failing tests** for local camera URL acceptance, invalid external image rejection, consumable reset payloads, entity grouping and fault text extraction.
- [ ] **Step 2: Run focused panel tests and verify failure.**
- [ ] **Step 3: Implement grouped panel rendering and connect controls through `run`/`callAction`.** Preserve HA-provided names and options.
- [ ] **Step 4: Run `npm test`; expected result: all PASS.**
- [ ] **Step 5: Document integration-dependent availability and examples.**
- [ ] **Step 6: Commit with `feat: add dock maintenance and history panels`.**

### Task 5: Remote control and responsive panel configuration

**Files:**
- Modify: `dreame-open-card/dreame-open-card.js`
- Modify: `dreame-open-card/README.md`
- Test: `dreame-open-card/test/card.test.mjs`

**Interfaces:**
- Consumes: action inventory, remote-control action schema and additive card config.
- Produces: validated `mode: panel`, `features`, and `map` configuration handling; remote step controls with a safe fallback when continuous movement is unavailable.

- [ ] **Step 1: Add failing tests** for valid/invalid `mode`, feature flags, map transform values and remote movement payloads.
- [ ] **Step 2: Run focused configuration tests and verify failure.**
- [ ] **Step 3: Implement config validation, responsive layout classes, map transform application and remote controls.** Do not claim continuous control unless the corresponding action is advertised.
- [ ] **Step 4: Run `npm test`; expected result: all PASS.**
- [ ] **Step 5: Commit with `feat: add panel mode and remote controls`.**

### Task 6: Localization, visual pass and release verification

**Files:**
- Modify: `dreame-open-card/dreame-open-card.js`
- Modify: `dreame-open-card/README.md`
- Modify: `dreame-open-card/docs/reverse-engineering.md` if evidence or coverage changes
- Test: `dreame-open-card/test/card.test.mjs`

**Interfaces:**
- Consumes: all prior renderers and configuration behavior.
- Produces: complete feature matrix, stable French/English labels, accessible controls and final verified card module.

- [ ] **Step 1: Add failing tests** for new translated labels, accessible names, disabled unavailable controls and config compatibility.
- [ ] **Step 2: Run focused localization/accessibility tests and verify failure.**
- [ ] **Step 3: Complete translations, keyboard focus styles, button labels, responsive CSS and empty/unavailable states without changing action semantics.**
- [ ] **Step 4: Run `npm test` from `dreame-open-card`; expected result: all PASS.**
- [ ] **Step 5: Run `git diff --check`, inspect the final diff, and verify no license files or remote asset references were removed/added unexpectedly.**
- [ ] **Step 6: Update the final feature matrix with implemented, integration-dependent and unresolved items.**
- [ ] **Step 7: Commit with `chore: verify complete card feature coverage`.**

## Self-review

- Spec coverage: every feature matrix row maps to Tasks 2–6; safety and capability constraints map to Tasks 1–3; YAML and responsive behavior map to Task 5; localization and acceptance verification map to Task 6.
- Type consistency: helpers are pure JavaScript functions with object return values and are consumed by the existing card class; no new external module boundary is introduced.
- Review focus: each of the five high-risk input classes has an explicit focused test task.
- Proportion: the plan preserves the existing architecture and avoids a rewrite; each task is independently testable.
