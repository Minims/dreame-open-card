# Dreame Vacuum Card reverse engineering

## Target and evidence

The target is Tasshack’s Dreame Vacuum Card for Home Assistant. Its public site describes the product and its workflows. The installation guide places the card inside the Dreame Vacuum integration, where Lovelace exposes it as **Dreame Vacuum Card**. The live REA browser capture followed the French landing page to the activation guide. It recorded one document request and 135 total transactions during that navigation. [Product site](https://dvc.tasshack.com/) · [Installation](https://dvc.tasshack.com/getting-started/installation-and-usage)

The Home Assistant attachment is stronger evidence of what ships. The local `frontend.js` matched the gzip-decoded `FRONTEND` constant in the public Dreame Vacuum v2.0.3 source byte for byte. The integration’s `frontend.py` serves that resource as a versioned JavaScript module. It registers the resource in Lovelace storage mode and has a WebSocket-based module-loading path for YAML mode. A separate authenticated handler serves the activated component. The vendor documentation describes that component as license-gated. [Embedded frontend](https://github.com/Tasshack/dreame-vacuum/blob/v2.0.3/custom_components/dreame_vacuum/const.py) · [Lovelace registration](https://github.com/Tasshack/dreame-vacuum/blob/v2.0.3/custom_components/dreame_vacuum/frontend.py) · [Activation](https://dvc.tasshack.com/get-dvc)

REA parsed the shipped 660,645-byte resource as JavaScript and visited 152,314 syntax nodes. Its output contains 289 static findings. An independent syntax pass also found two explicit `customElements.define` call sites. Dynamic relationships remain partly unresolved. The shipped resource was inspected statically, and the separately delivered activated bundle was unavailable for runtime or static analysis. The premium workflows below are grounded in the vendor’s walkthroughs and public Home Assistant interfaces.

## Product behavior and Home Assistant contracts

| Product workflow | Evidence and implementation implications |
| --- | --- |
| Global, room, zone and spot cleaning, plus navigation | The product has a task-type selector. The integration exposes segment IDs for room cleaning, rectangular coordinate arrays for zone cleaning, point arrays for spot cleaning, and a separate `x`/`y` pair for navigation. The map camera gives three `calibration_points` pairs in image and vacuum coordinates. [Product guide](https://dvc.tasshack.com/guide/home-screen/task-type) · [Public actions](https://github.com/Tasshack/dreame-vacuum/blob/v2.0.3/custom_components/dreame_vacuum/services.yaml) |
| Floors and object editing | The vacuum publishes saved maps and an active map ID. The product documents selecting and editing restricted areas, carpets, furniture, thresholds, ramps, curtains, low-lying areas and predefined points. Several provide complete lists to the integration, so an editor needs to keep the displayed map and the action payload in sync before replacing a list. [Object editor](https://dvc.tasshack.com/guide/map-management/map-edit) · [Registered action schemas](https://github.com/Tasshack/dreame-vacuum/blob/v2.0.3/custom_components/dreame_vacuum/vacuum.py) |
| Object interaction and imagery | The product exposes context actions for obstacles, carpets and furniture. The integration camera exports obstacle photos and history images through local camera proxy URLs. Its attributes and supported models determine which images are available. [Object selection](https://dvc.tasshack.com/guide/home-screen/object-selection) · [Camera implementation](https://github.com/Tasshack/dreame-vacuum/blob/v2.0.3/custom_components/dreame_vacuum/camera.py) |
| Floor plans and visual configuration | The product documents floor plan rendering and per-map centering, scaling, background and overlay images. An independent editor needs to preserve the transform that maps displayed coordinates back to the robot. The current card uses the rendered camera image and its calibration data. [Display modes](https://dvc.tasshack.com/configuration/basic-configuration#map-display) · [Per-map configuration](https://dvc.tasshack.com/configuration/custom-map-configuration) |
| Robot settings and remote control | The product exposes device settings and dual controls for movement. The public integration has domain entities for settings and a `vacuum_remote_control_move_step` action. The current card uses discrete movement commands. The activated card’s continuous-control behavior was not captured. [Settings](https://dvc.tasshack.com/guide/device-settings) · [Remote control](https://dvc.tasshack.com/guide/remote-control) · [Action schema](https://github.com/Tasshack/dreame-vacuum/blob/v2.0.3/custom_components/dreame_vacuum/services.yaml) |

## Implementation reference

Piotr Machowski’s MIT-licensed Xiaomi Vacuum Map Card already models room, rectangle and point selections as separate map modes. Its Tasshack preset shows how to build the corresponding Dreame payloads, including per-task repeats. This is an implementation reference for interaction design. The product behavior in the report comes from Tasshack’s card and documentation. [Dreame platform preset](https://github.com/piotrmachowski/lovelace-xiaomi-vacuum-map-card/blob/045c3ac946d4ef0a01201f306e9949643984a155/src/model/generators/platform_templates/Tasshack_dreame-vacuum.json) · [Map mode implementation](https://github.com/piotrmachowski/lovelace-xiaomi-vacuum-map-card/blob/045c3ac946d4ef0a01201f306e9949643984a155/src/model/map_mode/map-mode.ts)

## Follow-up: screen parity and public data contracts

Scope: the public DVC guide and its screenshots, the Dreame integration source at
`v2.0.3`, and the local Open Card source including the uncommitted home-screen
redesign, inspected on 2026-11-20. Screenshots establish placement and appearance,
not the exact runtime behavior of the activated card. “Documented” below means
the vendor describes the behavior; “verified contract” means it is present in the
public integration source, not that a particular robot supports it. The gap
column is the baseline from that inspection; the notes beneath the table track
subsequent implementation changes.

| Screen | Reference and observed or documented behavior | Open Card gap |
| --- | --- | --- |
| Home and full-width panel | [Home guide](https://dvc.tasshack.com/guide/home-screen) shows centered name and status, a telemetry row, map-first layout, round cyan shortcuts on the right, and a segmented mode bar above two primary pill buttons. The wide screenshot has a landscape map with compact room labels; the compact screenshot has a portrait map with named chips. | The local redesign has the main arrangement. Room and object controls are not overlaid. The camera supplies the map orientation and artwork; `mode: panel` does not itself reproduce the reference map. |
| Room mode | [Room screenshot](https://dvc.tasshack.com/light/room-cleaning.png) shows selected rooms with numbered markers and checkmarks. The [task guide](https://dvc.tasshack.com/guide/home-screen/task-type) documents pixel-based selection and tap-order execution where supported. | Room checkboxes are below the map, and submission follows display order, not tap order. No room mask or pixel-based hit testing verified. |
| Zone, spot and go-to | [Zone screenshot](https://dvc.tasshack.com/light/zone-cleaning.png) shows a size label, dashed outline, resize handles and a delete control. The [task guide](https://dvc.tasshack.com/guide/home-screen/task-type) documents multiple zones and spots, floor-only target placement, furniture/carpet shortcuts and predefined go-to points. | One zone from two corners, one spot or go-to point, plus a coordinate form. No graphical resize, multi-selection, floor mask, or in-map contextual actions. |
| Cleaning settings and sequences | [Action buttons](https://dvc.tasshack.com/guide/home-screen/actions) and [custom room cleaning](https://dvc.tasshack.com/guide/custom-room-cleaning) document repeats, cleaning settings, per-room customization, order and mop type. | Generic entities and advanced action forms do not provide the mode-specific settings sheets or an ordered room editor. |
| Dock | [Dock screenshot](https://dvc.tasshack.com/light/dock.png) shows a bottom sheet over a dimmed map, with water, bag and detergent status, then four separate action buttons. | Return-to-base is a direct action; exposed dock entities are mixed in with other settings. The dock sheet, status indicators and grouped commands are not implemented. |
| Objects and errors | [Object selection](https://dvc.tasshack.com/guide/home-screen/object-selection) documents contextual obstacle, carpet and furniture interactions. [Errors](https://dvc.tasshack.com/guide/home-screen/error-reporting) illustrates error and warning states. | Some advanced commands and photo links exist, plus header fault text. No object hit targets, contextual popup or dedicated warning presentation. |
| Saved maps and editor | [Saved map editing](https://dvc.tasshack.com/guide/map-management/saved-map-editing) covers names, visibility, materials, split/merge, walls and doors. The [wall screenshot](https://dvc.tasshack.com/light/wall-edit.png) shows a dedicated map-first editor with a back button, highlighted walls, a right-hand action rail and a bottom tools strip. [Object editing](https://dvc.tasshack.com/guide/map-management/map-edit) covers restrictions, carpets, furniture, thresholds, ramps, curtains, low-lying areas and points. | Floor switch and a subset of confirmed JSON forms exist. No graphical editor or safe read–modify–write preservation of unrelated objects. |
| Recovery and Wi-Fi | [Recovery and backup](https://dvc.tasshack.com/guide/map-management/map-recovery-and-backup) and [Wi-Fi map](https://dvc.tasshack.com/guide/map-management/saved-wifi-map) show separate previews. | Backup/restore forms and recovery picture links exist. There is no Wi-Fi map view or visual comparison before restore. |
| History | [History screenshot](https://dvc.tasshack.com/light/cleaning-history.png) shows cumulative stats, colored status dots and date, mode, area and duration per row. [Details guide](https://dvc.tasshack.com/guide/cleaning-details-and-history/cleaning-details) documents the session view. | Cleaning and cruising snapshots are links, not a structured history list or session detail screen. |
| Settings and maintenance | The [settings guide](https://dvc.tasshack.com/guide/device-settings) groups audio, carpet, mopping, camera/obstacles, DnD, battery and device information. The [schedule](https://dvc.tasshack.com/guide/device-settings/scheduled-cleanup) and [shortcut](https://dvc.tasshack.com/guide/device-settings/shortcuts) guides explicitly label parts of those editors incomplete. [Accessory usage](https://dvc.tasshack.com/guide/accessory-usage) shows the consumable life and reset workflow. | Exposed entities provide basic controls. Dedicated navigation, schedule/shortcut screens, consumable presentation and maintenance badges are missing. Do not infer full schedule or shortcut editing from the reference. |
| Remote control | [Remote screenshot](https://dvc.tasshack.com/light/remote-control.png) shows two circular slider regions beneath the map, one vertical and one horizontal. The [guide](https://dvc.tasshack.com/guide/remote-control) documents combined axes, landscape layout, keyboard input and haptics. | Two sliders and explicit step execution. Press/release behavior, movement cadence and stop semantics have not been measured on an activated card or robot. |
| YAML and appearance | [Basic configuration](https://dvc.tasshack.com/configuration/basic-configuration) documents entity-only device discovery, `color_scheme`, `icon_set`, `map_display` and `locked`. [Custom maps](https://dvc.tasshack.com/configuration/custom-map-configuration) documents per-map adjustments and independent background/overlay placement. | The YAML type is `custom:dreame-open-card`; `map_camera` is needed for a map. Existing display transforms affect the image; interactive picking is disabled with non-neutral transforms. No drop-in DVC YAML compatibility, floor-plan renderer, background or overlay. The local `features` key is validated as an object but not wired to panel visibility. |

### Verified contracts and implementation order

1. **Room selection first.** The [image camera attributes](https://github.com/Tasshack/dreame-vacuum/blob/v2.0.3/custom_components/dreame_vacuum/camera.py#L1196-L1267)
   include calibration and may include `rooms` keyed by segment ID. A
   [serialized segment](https://github.com/Tasshack/dreame-vacuum/blob/v2.0.3/custom_components/dreame_vacuum/dreame/types.py#L3937)
   inherits the [`Zone` rectangle](https://github.com/Tasshack/dreame-vacuum/blob/v2.0.3/custom_components/dreame_vacuum/dreame/types.py#L3759-L3783)
   (`x0`, `y0`, `x1`, `y1`) and can include `room_id`, name, icon and color
   index. Use the inverse of the calibrated image-to-robot transform to place
   named, keyboard-accessible markers. Do not treat a bounding box as a room
   mask: boxes can overlap or include a different room. Retain checklist
   fallback when calibration, image dimensions, room bounds or map identity
   cannot be verified. The implementation now offers labeled markers and a
   synchronized checklist, sends the selection order and resets on a map
   change. Unit and simulated browser checks cover rotated calibration,
   missing bounds, mismatched floors and the emitted segment IDs.
2. **Task bar and overlays.** [Registered cleaning actions](https://github.com/Tasshack/dreame-vacuum/blob/v2.0.3/custom_components/dreame_vacuum/vacuum.py#L203-L269)
   accept `segments` as an integer or list, `zone` as one rectangle or a list
   of rectangles and `points` as one pair or a list of pairs. They also
   register repeat, suction and water-volume fields. Implement resize/remove
   and multiple picks against those schemas, with one contextual primary
   button. Open Card now draws, resizes and removes multiple zones and sends
   them together; spot accepts multiple removable points, and go-to accepts
   one destination. Never submit `vacuum.start` from a targeted mode. A valid affine
   projection does not establish that a target is on cleanable floor.
3. **Dock, history and obstacle screens.** The
   [camera source](https://github.com/Tasshack/dreame-vacuum/blob/v2.0.3/custom_components/dreame_vacuum/camera.py#L1271-L1374)
   confirms distinct cleaning, cruising, obstacle, recovery and Wi-Fi image
   sources. Use local Home Assistant URLs and never display their access
   tokens or include them in test fixtures. Keep dock controls conditional on
   the actual device entities. Compare both compact and wide presentations
   with the screenshots before claiming parity.
   Open Card now has a station sheet, consumable gauges and a history list.
   Session previews join the history timestamp to the `v` parameter of the
   matching local camera image; ambiguous matches remain unpaired. The dock
   and maintenance views depend on enabled device entities. Recovery and Wi-Fi
   previews do not alter the map or automatically restore a backup.
4. **Editor after object identity and coordinate handling.** The
   [action registrations](https://github.com/Tasshack/dreame-vacuum/blob/v2.0.3/custom_components/dreame_vacuum/vacuum.py#L305)
   include actions not listed in `services.yaml`. Use the registered schemas:
   `vacuum_set_restricted_zone` accepts nested coordinate arrays (not arbitrary
   objects), and [`vacuum_set_walls`](https://github.com/Tasshack/dreame-vacuum/blob/v2.0.3/custom_components/dreame_vacuum/vacuum.py#L872-L899)
   takes a wall dictionary and six-value door rows. Open Card now validates
   individual integer rows for these actions and preserves the difference
   between omission and an explicit empty list. Graphical writes still need
   stale-map checks and read–modify–write preservation of unrelated objects.
5. **Model-dependent controls last.** The
   [remote step schema](https://github.com/Tasshack/dreame-vacuum/blob/v2.0.3/custom_components/dreame_vacuum/vacuum.py#L574-L582)
   accepts velocity and rotation in one call. That is not evidence that
   repeating the action gives safe continuous steering. Keep step mode until
   stop-on-release, focus loss and disconnect behavior can be verified. Treat
   schedule editing, shortcut editing and alert badges as separate coverage
   items, not consequences of discovering generic entities.

6. **Remaining four implementation tracks.** Open Card now exposes the first
   safe slice of each remaining track: floor background/overlay presentation
   settings and a map-object inventory; schedule and shortcut summaries; a
   repeated-step remote slider with a zeroed stop on release/change/blur; and
   per-room aligned custom-cleaning payloads. These are not claims of full DVC
   parity: graphical wall/room/object mutation, schedule creation/editing,
   haptic feedback, keyboard mapping and model-specific continuous steering
   remain unverified or intentionally withheld.

### New REA evidence

- The saved-map-editing **documentation page** loaded in an owned browser
  profile. The capture recorded 109 network transactions, including one
  document and 29 images; one transaction failed and no events were dropped.
  REA terminated its browser process. Evidence:
  `ev_1d2ed20c771ba4eb06689a771ef7281c9c1ac43f92eabf124db3f0a6f7ecfb82`.
  The bundle `dvc-saved-map-editor-evidence.json` is stored alongside the
  repository in the workspace, not in the card package.
- The six linked compact screenshots were inspected separately; they are
  visual references only and are not embedded in the implementation.
- No activated DVC instance, private bundle or real robot was used in this
  pass. The exact room hit mask, capability rules by model, and the timing
  and failure behavior of advanced interactions remain unverified.

## Evidence identifiers

- Public site capture · `ev_4a1786cb475a11c5a6e7ffe90be75e79a89747effd628990d1cab316da337acf`
- Shipped frontend static analysis · `ev_78564440b4da28765b31ec1c477dbea6b4bfa9a73acdb57b07f4e12e67da3909`
- Shipped frontend SHA-256 · `161cc7c47696d40a2c0cf16c65327dd38bc027aded429af0df3605358aa486d2`
