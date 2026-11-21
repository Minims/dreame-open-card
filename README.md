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

`map_display: structured` opts into the experimental Canvas renderer. Omit the key (or use `standard`) to keep the camera image. Structured mode uses the Dreame camera's grid, path and positions when its floor and frame match the Home Assistant entity. It draws wood or tile patterns where the integration reports the material. If the map data or calibration is unavailable, the card keeps the camera image. Non-neutral display transforms keep the camera image and disable map picking.

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
- In room mode, select labeled markers, tap room pixels in structured mode, or use the checklist. The card sends rooms in selection order; the robot may choose a different order. Markers require room bounds, a matching map and no display transform.
- In zone mode, pick two opposite corners per zone. Drag either numbered handle or focus it and use the arrow keys to resize the zone. Remove zones individually below the map. The card sends the remaining zones together; it does not detect walls or cleanable floor.
- Open the station sheet to see available tank and bag statuses, start or stop supported wash and dry cycles, or trigger auto-empty. The card falls back to a return-to-dock button if no station entities are found.
- Select and remove multiple points in spot mode. Go-to accepts a single destination. When the structured map is visible, both accept only points that land on mapped floor pixels.
- View consumable estimates in **Accessory usage**, and change exposed device settings through the generic controls. Scheduling controls depend on the entities available on the instance.
- Browse cleaning and cruising history from the integration's history sensors, with inline session maps when the camera supplies a matching image. Preview recovery and Wi-Fi maps when available, open obstacle photos, and use step-by-step remote control.
- Open **Map editor** to preview and add a rectangular no-go or no-mopping area. This requires the active floor and all three current restriction lists: virtual walls, no-go areas and no-mopping areas. Check the confirmation box to apply. After a write or floor switch, the editor waits for Home Assistant to report the new state. If the update cannot be confirmed, verify the map in Home Assistant before reloading the card.
- Map objects with valid calibration data can appear as markers for obstacles, carpets and furniture. Obstacle ignore/restore is available in the advanced action form when supported.
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
