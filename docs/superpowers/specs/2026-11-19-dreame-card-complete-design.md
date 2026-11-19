# Dreame Open Card — complete feature parity design

## Intent

Extend `dreame-open-card` into an independent Home Assistant Lovelace card that
covers the observable workflows documented by the Dreame Vacuum Card project:
cleaning modes, map/floor management, map objects and editing, dock/settings,
maintenance, history/photos, errors, remote control and responsive panel use.
The implementation remains YAML-configurable, uses Home Assistant entities and
actions, and does not require an activation key.

This is a behavioral reimplementation, not a copy of the vendor's source,
private bundle, branding assets, or license terms. The existing repository
license remains intact.

## Goals

- Preserve the current card's working controls and safety validation.
- Add the missing user-visible workflows exposed by the integration when their
  actions/entities/data are available.
- Keep the current lightweight single-module/no-build-dependency architecture.
- Match the observed product's visual language at the level of layout,
  hierarchy, responsive behavior, control grouping and accent usage, while
  using independent markup and CSS.
- Support explicit YAML configuration plus safe discovery of related entities.
- Make capability absence explicit instead of silently claiming unsupported
  features.
- Add focused tests for new payload builders and validation boundaries.

## Non-goals

- Copying or extracting the vendor's proprietary frontend source.
- Removing or weakening the repository's existing license or attribution.
- Implementing device firmware behavior that is not exposed through Home
  Assistant.
- Guaranteeing identical behavior for unsupported vacuum models.
- Adding a build system or runtime dependency for the card.

## Constraints

- Home Assistant's available states, services, actions and camera attributes
  are the source of truth for runtime capability.
- User-provided entity IDs and action payloads are trust boundaries: validate
  them before calling Home Assistant.
- Camera images must remain local Home Assistant camera endpoints.
- Advanced map edits replace complete lists; the UI must not send partial lists
  when the integration expects full map structures.
- The current public API helpers and test conventions should remain compatible.

## Feature matrix

| Area | Current state | Target |
| --- | --- | --- |
| Start/pause/stop/return/locate | Implemented | Preserve and polish |
| Global/room/zone/spot cleaning | Implemented in capability-driven form | Complete task selector and payload validation |
| Go-to-point | Implemented | Preserve calibration and validation |
| Floor selection | Implemented | Add create/rename/delete/backup/restore flows where actions exist |
| Map display | Camera image + calibration | Add per-floor transform/background/overlay options without external fetches |
| Map objects | Partial action forms | Add object-aware selection/edit forms for walls, doors, zones, carpets, furniture and materials |
| Dock controls | Entity/action discovery | Group dock actions and surface unavailable capabilities |
| Settings/maintenance | Entity discovery | Add typed controls and consumable reset handling |
| History/obstacle photos | Partial | Add local camera image gallery and error-safe loading |
| Errors/faults | Status text | Add structured fault/error presentation and action feedback |
| Remote control | Step commands | Add dual-axis/touch controls when the integration action is available; retain step fallback |
| Scheduling/shortcuts | Partial | Surface discovered schedule/shortcut entities/actions |
| Responsive panel mode | Basic responsive grid | Add explicit panel/full-width configuration and responsive map bounds |
| Localization | English/French | Preserve HA locale and extend strings without changing entity-provided labels |

## Implementation approach

The selected approach is progressive completion on the existing card:

1. Extract small pure helpers for capability inventory, typed action payloads,
   map transforms and local image selection.
2. Complete the Home Assistant state/action inventory and render capability
   groups only when supported.
3. Add map/task interaction modes and payload builders before adding editor UI.
4. Add editor forms for complete map structures with confirmation for destructive
   actions.
5. Add dock/settings/maintenance/history/remote-control panels.
6. Match responsive spacing, colors, button hierarchy and panel behavior using
   independent CSS variables tied to Home Assistant theme variables.
7. Add tests for every new non-trivial parser, coordinate conversion and action
   payload boundary; run the existing test suite after each batch.

## YAML contract

The existing minimal form remains valid:

```yaml
 type: custom:dreame-open-card
 entity: vacuum.dreame
 map_camera: camera.dreame_map
```

Optional configuration will remain additive and explicit:

```yaml
 type: custom:dreame-open-card
 entity: vacuum.dreame
 map_camera: camera.dreame_map
 title: Upstairs vacuum
 mode: panel
 entities:
   - button.dreame_auto_empty
   - select.dreame_cleaning_mode
   - sensor.dreame_main_brush_left
 map:
   background: /local/dreame/floor.png
   rotation: 0
   scale: 1
   offset: [0, 0]
 features:
   dock: true
   maintenance: true
   history: true
   remote: true
   editing: true
```

Only options needed by the implementation will be added. Unknown options must
not change runtime behavior.

## Risks and mitigations

- **Integration variation:** discover actions/entities and hide unsupported
  controls; never assume a model supports every action.
- **Map payload loss:** preserve complete lists and require confirmation before
  replacement actions.
- **Visual drift:** keep all visual decisions in the card CSS and use a small
  set of theme variables; validate with a simulated HA fixture.
- **Scope explosion:** implement only documented workflows that have a stable
  Home Assistant contract; record remaining unknowns instead of inventing APIs.
- **License confusion:** keep existing license files and write independent code.

## Acceptance criteria

- Existing tests pass unchanged.
- The card still loads with only `entity` configured.
- Every displayed action is gated by an advertised Home Assistant capability.
- All documented feature groups have either an implemented control or a clear
  unavailable/unsupported state.
- Destructive map operations require confirmation.
- No remote image or script is loaded by the card.
- YAML examples are valid and documented.
- A final feature matrix records implemented, integration-dependent and
  unresolved items.
