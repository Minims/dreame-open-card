# Structured Map Implementation Plan

> **For agentic workers:** Execute in order with tests. Do not mark hardware or visual parity verified from simulated data.

**Goal:** Rebuild the map from the public Dreame data contract while keeping Eve’s existing Lovelace YAML working.

**Architecture:** Keep the single-file HACS deliverable. Decode camera runs into a bounded scene, render it in Canvas aligned to the existing camera calibration, and keep HTML controls for accessibility. The camera image remains the fallback while structured mode is experimental.

**Spec and evidence:** [DVC reference and current gaps](../../reverse-engineering.md), [public camera data endpoint](https://github.com/Tasshack/dreame-vacuum/blob/v2.0.3/custom_components/dreame_vacuum/camera.py#L113-L174), [public run encoder](https://github.com/Tasshack/dreame-vacuum/blob/v2.0.3/custom_components/dreame_vacuum/dreame/map.py#L8240-L8407).

| Phase | Deliverable and acceptance |
| --- | --- |
| 1. Model | Decode `{ size, data, map_id, saved_map_id }`; reject invalid bounds and runs. Test world/grid conversion and floor identity. |
| 2. Rendering | Render horizontal runs in calibrated Canvas coordinates; fall back on missing, invalid or stale frames. Keep the existing camera image sizing and interaction coordinates. |
| 3. Appearance | Draw deterministic room colors, walls, detected carpet and position markers with independent assets. Validate light/dark; use identical underlying data before calling any rendering pixel-perfect. |
| 4. Selection/editing | Map taps resolve the actual room pixel and reject invalid destinations when a valid scene is available. Write operations must remain bound to the selected floor and require confirmed current geometry. Never invent shapes for unsupported models. |
| 5. Screens | Reuse the proven station/history/maintenance flows; verify each secondary action against the public contract before implementing schedule, shortcut, and remote changes. |
| 6. Visual comparison | Render deterministic fixture at compact and wide widths; exercise the fallback and mode switching. Compare matching scenes from the original before declaring pixel equality. |
| 7. Home Assistant | Verify the endpoints, capability gates, payloads and floor switches on an authorized instance. Never run destructive or movement actions as part of simulated validation. |

**Review focus:** invalid or excessive runs, calibration/rotation, mismatched floor, asynchronous camera changes, and misleading feature claims.

## Verification and remaining work

| Phase | Evidence / gap |
| --- | --- |
| 1 | Unit tests cover run bounds, overlap, floor and frame identity, room pixels and camera URL validation. |
| 2 | The browser fixture exercises grid, path, positions and fallback. Physical door geometry and other objects not supported by the renderer are outside this slice. |
| 3 | Independent light/dark palettes and procedural wood/tile patterns. The [official room screenshot](https://dvc.tasshack.com/light/room-cleaning.png) still differs in texture details, furniture silhouettes, and room badges. Pixel parity is not established. |
| 4 | Tests cover room hit targets, add-only rectangular restrictions, confirmation, list preservation, waiting for camera acknowledgement and blocking edits during a local floor switch. Full graphical editing and server-side write serialization are not implemented. |
| 5 | Schedule summaries, shortcut IDs and explicit remote step payloads use public contracts. Existing dock, history and generic settings views remain. Full secondary-screen parity is not established. |
| 6 | The browser fixture checks sample room and tile pixels, horizontal clipping, overlay dimensions, calibration-only updates and emitted payloads in compact and panel modes with both palettes. It does not check rotated camera frames or out-of-order replies. No matching original fixture is available for an automated screenshot diff. |
| 7 | No connected Home Assistant instance or robot was available for live validation. |
