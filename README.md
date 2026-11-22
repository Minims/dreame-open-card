# Dreame Open Card

An independent, free Lovelace card for Dreame vacuums. It uses Home Assistant entities, actions and map data without an activation key. The card is MIT-licensed.

![Dreame Open Card with simulated Home Assistant entities and a sample floor map](docs/preview.png)

## Install with HACS

1. In HACS, open the menu and choose **Custom repositories**.
2. Add `https://github.com/Minims/dreame-open-card` as a **Dashboard**.
3. Open **Dreame Open Card** and choose **Download**. Under **Need a different version?**, select the `2026.11.0a` prerelease. If your HACS version hides prereleases, enable **Show beta versions** for the repository first.
4. Add the card manually using the YAML below. HACS registers the JavaScript resource in dashboard storage mode. For YAML-managed resources, use the resource URL shown by HACS.

Install and configure [Dreame Vacuum](https://github.com/Tasshack/dreame-vacuum) before adding the card.

## Manual installation

1. Install and configure [Dreame Vacuum](https://github.com/Tasshack/dreame-vacuum). In **Developer tools → States**, find your vacuum entity and, if available, its live map camera entity.
2. Download [dreame-open-card.js](dreame-open-card.js) and copy it to `/config/www/dreame-open-card.js`. Restart Home Assistant if you just created the `www` directory.
3. In **Settings → Dashboards → Resources**, add `/local/dreame-open-card.js` as a **JavaScript module**. Enable Advanced mode in your profile if the Resources menu is hidden.
4. Add a manual card to your dashboard. Replace the example entity IDs with your own.

```yaml
type: custom:dreame-open-card
entity: vacuum.dreame
map_camera: camera.dreame_map
```

`map_camera` and `title` are optional. Use a **Panel** view for a full-width card. The card also supports an internal responsive panel mode and additive map display settings:

```yaml
type: custom:dreame-open-card
entity: vacuum.dreame
map_camera: camera.dreame_map
mode: panel
map_display: structured
features:
  dock: true
  maintenance: true
  history: true
  remote: true
  editing: true
map:
  rotation: 0
  scale: 1
  offset: [0, 0]
```

`map_display: structured` opts into the experimental Canvas renderer. Omit the key (or use `standard`) to keep the camera image. Structured mode uses the Dreame camera's grid, path and positions when its floor and frame match the Home Assistant entity. The robot and dock have distinct icons. The robot shows a directional arrow only when the frame supplies a known heading. It draws wood or tile patterns where the integration reports the material. If the map data or calibration is unavailable, the card keeps the camera image. Non-neutral display transforms keep the camera image and disable map picking.

Set `left_handed: true` to move the map's action rail to the left. `hidden_card_objects` is a YAML list. Supported entries are `title`, `state`, `status` (telemetry), `menu`, `task_type` (mode selector), `controls` (mode selector and primary buttons), `action_buttons` (the map's action rail), `shortcuts` (native shortcuts on the home screen), and `cruising_history`. If you hide only `title`, the state takes its place. Other entries do not yet change the card.

Set `aspect_ratio` to the desired map frame width divided by height (between `0.1` and `100`). The card fits the map inside that frame without stretching it. The normal viewport height limit still applies unless you set `full_height: true`; that option can make the card taller than the screen.

Add Home Assistant `script.*` entities under `scripts` to list them in YAML order before the native shortcuts. When `hidden_card_objects` includes `shortcuts`, scripts remain on the home screen and native shortcuts move to the device settings panel.

Use `hidden_objects` to hide supported map layers: `floor`, `walls`, `material`, `path`, `carpet`, `charger`, `vacuum`, `furniture`, `obstacle`, `doors`, `no_go`, `no_mop`, `virtual_wall`, `virtual_threshold`, `passable_threshold`, and `impassable_threshold`. Layers already drawn into the fallback camera image cannot be removed. Restrictions stay visible while the map editor is open.

`map_config.map_1` applies to the first saved-map index, not map ID 1. For each index, `opacity` sets the map image opacity, `object_opacity` sets the opacity of the robot, dock, furniture and markers, and `hidden_objects` replaces the global list for that floor. Both opacities range from 0 to 1.

`override_colors` accepts hex or comma-separated `rgb()`/`rgba()` colors. Supported keys are `floor`, `wall`, `path`, `carpet`, `active_area`, `no_go`, `no_mop`, `virtual_wall`, `icon_background`, `text`, and `segment`. The `segment` list contains `[normal, selected]` pairs for room fills. Colors in `dark` override the base list when the Home Assistant dashboard uses a dark theme. The fallback camera image cannot be recolored.

If the card cannot discover your settings and maintenance entities, list them explicitly.
Set a `features` entry to `false` to hide its dedicated view. These switches do not change Home Assistant permissions or remove entities from the generic settings list.

```yaml
type: custom:dreame-open-card
entity: vacuum.dreame
map_camera: camera.dreame_map
title: Upstairs vacuum
entities:
  - button.dreame_auto_empty
  - select.dreame_cleaning_mode
  - sensor.dreame_main_brush_left
```

The card follows the Home Assistant frontend language. It displays French for French locales and falls back to English for other locales. Entity names, options, map labels and error details supplied by Home Assistant or the integration keep their original wording.

## Features

- Start, pause, stop, return to dock, locate and see the battery level.
- Clean rooms, zones or spots, send the robot to a point and switch floors. Map selection requires a live map camera with calibration data.
  Floor changes ask for confirmation by default. Add `map_change_confirmation` to `hidden_card_objects` to switch floors without the prompt.
- In room mode, select labeled markers, tap room pixels in structured mode, or use the checklist. Structured mode shows colored room badges with icons. Selected rooms get a checkmark and an order number, which updates when you deselect a room. The robot may choose a different cleaning order. Markers require room bounds, a matching map and no display transform.
- In zone mode, pick two opposite corners per zone. Drag either numbered handle or focus it and use the arrow keys to resize the zone. Remove zones individually below the map. The card sends the remaining zones together; it does not detect walls or cleanable floor.
- Open the station sheet to see available tank and bag statuses, start or stop supported wash and dry cycles, or trigger auto-empty. The card falls back to a return-to-dock button if no station entities are found.
- Select and remove multiple points in spot mode. Go-to accepts a single destination. When the structured map is visible, both accept only points that land on mapped floor pixels.
- View consumable estimates in **Accessory usage**, and change exposed device settings through the generic controls. Scheduling controls depend on the entities available on the instance.
- Browse cleaning and cruising history from the integration's history sensors, with inline session maps when the camera supplies a matching image. Preview recovery and Wi-Fi maps when available, open obstacle photos, and use step-by-step remote control.
- Open **Map editor** to add, resize or remove rectangular no-go and no-mopping areas. Select an existing area on the map or from the numbered list, then pick two new corners to resize it or choose **Remove area**. Review the preview and check the confirmation box before applying. The editor requires the active floor and all three restriction lists (virtual walls, no-go areas and no-mopping areas), and waits for the camera after a write or floor switch. If the update cannot be confirmed, verify the map in Home Assistant before reloading the card.
- Map objects with valid calibration data can appear as markers for obstacles, carpets and furniture. Structured mode draws door segments and simplified silhouettes for known furniture such as beds, sofas, tables, storage, appliances and pet items when the matching frame contains their geometry. Unknown types and furniture in hidden rooms are not drawn as silhouettes. Obstacle ignore/restore is available in the advanced action form when supported.
- View discovered schedules and shortcuts when the integration exposes them. Existing schedule/shortcut content is shown read-only except for supported shortcut execution.
- Remote control sends a single step only when you press **Move one step**. Adjusting the sliders does not send commands.
- Rename, split and merge rooms, back up and restore maps, and edit walls, restricted zones, carpets, furniture and floor materials through action forms. Advanced actions require confirmation. The field names match the Home Assistant action schema.
- Use responsive panel mode with Home Assistant theme colors, keyboard-focus styles and capability-driven controls. Unsupported model actions remain hidden or disabled instead of producing invalid service calls.

Feature availability depends on the vacuum model, integration version and enabled entities. The card was developed against Dreame Vacuum v2.0.3. Full graphical map editing, custom floor backgrounds, continuous steering and live video are outside the current implementation.

## Development

Run `npm test` with Node.js. The card ships as one JavaScript module and has no build dependencies.

To exercise the card in a browser without Home Assistant, run `node scripts/preview-map.mjs`. Open `http://127.0.0.1:4173/?check` for the compact light self-check or `http://127.0.0.1:4173/?check&panel&dark` for wide dark. Omit `check` to leave the fixture on the initial screen for screenshots. The fixture has no real service calls and is not a pixel-parity test against DVC.

The repository layout follows the [Lovelace boilerplate recommended by HACS](https://github.com/custom-cards/boilerplate-card). CI runs the Node tests and HACS plugin validation. Publishing a GitHub release attaches the JavaScript file from its tag. The tag must match `CARD_VERSION` in the module.

[Reverse-engineering report](docs/reverse-engineering.md) · [MIT license](LICENSE)
