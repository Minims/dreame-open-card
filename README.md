# Dreame Open Card

An independent, free Lovelace card for Dreame vacuums. It uses Home Assistant entities, actions and camera images without an activation key. The card is MIT-licensed.

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
- In room mode, select labeled markers on the active map or use the room checklist below it. The card sends rooms in selection order; the robot may choose a different order. Markers require room bounds, a matching map and no display transform.
- In zone mode, pick two opposite corners per zone. Drag either numbered handle or focus it and use the arrow keys to resize the zone. Remove zones individually below the map. The card sends the remaining zones together; it does not detect walls or cleanable floor.
- Open the station sheet to see available tank and bag statuses, start or stop supported wash and dry cycles, or trigger auto-empty. The card falls back to a return-to-dock button if no station entities are found.
- Select and remove multiple points in spot mode. Go-to still accepts a single destination.
- View consumable estimates in **Accessory usage**, and change exposed device settings through the generic controls. Scheduling controls depend on the entities available on the instance.
- Browse cleaning and cruising history from the integration's history sensors, with inline session maps when the camera supplies a matching image. Preview recovery and Wi-Fi maps when available, open obstacle photos, and use step-by-step remote control.
- Open the map editor view for floor background/overlay presentation settings, and use the object summary to see which map collections the integration supplied. Destructive object editing remains behind confirmed action forms.
- Map objects with valid calibration data appear as selectable markers for obstacles, carpets and furniture; obstacle markers can use the integration's ignore/restore action when available. Unknown object shapes remain in the summary only.
- View discovered schedules and shortcuts when the integration exposes them. Existing schedule/shortcut content is shown read-only except for supported shortcut execution.
- Remote control uses repeated 250 ms step commands while a slider is active and sends a zeroed stop command on release, change or focus loss. Actual safe continuous steering still depends on the robot model and integration.
- Rename, split and merge rooms, back up and restore maps, and edit walls, restricted zones, carpets, furniture and floor materials through action forms. Advanced actions require confirmation. The field names match the Home Assistant action schema.
- Use responsive panel mode with Home Assistant theme colors, keyboard-focus styles and capability-driven controls. Unsupported model actions remain hidden or disabled instead of producing invalid service calls.

Feature availability depends on the vacuum model, integration version and enabled entities. The card was developed against Dreame Vacuum v2.0.3. Full graphical map editing, custom floor backgrounds, continuous steering and live video are outside the current implementation.

## Development

Run `npm test` with Node.js. The card ships as one JavaScript module and has no build dependencies.

The repository layout follows the [Lovelace boilerplate recommended by HACS](https://github.com/custom-cards/boilerplate-card). CI runs the Node tests and HACS plugin validation. Publishing a GitHub release attaches the JavaScript file from its tag. The tag must match `CARD_VERSION` in the module.

[Reverse-engineering report](docs/reverse-engineering.md) · [MIT license](LICENSE)
