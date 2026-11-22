export const CARD_VERSION = "2026.11.0a";

const DOMAIN = "dreame_vacuum";
const ENTITY_ID = /^[a-z0-9_]+\.[a-z0-9_]+$/;
const SETTING_DOMAINS = new Set(["button", "select", "number", "switch", "time", "sensor", "binary_sensor"]);
const PANEL_FEATURES = ["dock", "maintenance", "history", "remote", "editing"];
const COLOR_SCHEMES = ["dreame_light", "dreame_dark", "dreame_auto", "mijia_light", "mijia_dark", "mijia_auto", "grayscale"];
const ICON_SETS = ["dreame", "dreame_old", "mijia", "material"];
const online = (state) => state && !["unavailable", "unknown"].includes(state.state);
// A Home Assistant button has no last-pressed timestamp before its first press.
const pressable = (state) => state && state.state !== "unavailable";
const hasAction = (hass, action) => {
  const [domain, service] = action.split(".");
  return Object.hasOwn(hass?.services?.[domain] ?? {}, service);
};
const dreame = (name) => DOMAIN + ".vacuum_" + name;
const point = (p) => p && typeof p.x === "number" && Number.isFinite(p.x)
  && typeof p.y === "number" && Number.isFinite(p.y);

const FRENCH = {
  "Global cleaning": "Nettoyage global",
  "Cleaning mode": "Mode de nettoyage",
  "Cleaned area": "Surface nettoyée",
  "Cleaning time": "Durée du nettoyage",
  "Battery": "Batterie",
  "The card configuration determines the target.": "La cible est déterminée par la configuration de la carte.",
  "Device or action unavailable.": "Appareil ou action indisponible.",
  "Required field": "Champ obligatoire",
  "Expected an integer": "Entier attendu",
  "Expected a boolean": "Booléen attendu",
  "Invalid JSON": "JSON invalide",
  "Unexpected JSON format": "Format JSON inattendu",
  "Fill in at least one field.": "Renseignez au moins un champ.",
  "Start": "Démarrer",
  "Clean": "Nettoyer",
  "Resize zone": "Redimensionner la zone",
  "Remove zone": "Retirer la zone",
  "Remove point": "Retirer le point",
  "Choose points on the map.": "Choisissez des points sur la carte.",
  "Dock controls": "Commandes de la station",
  "Wash mops": "Laver les serpillières",
  "Dry mops": "Sécher les serpillières",
  "Dry dust bag": "Sécher le sac",
  "Empty dust bag": "Vider le bac",
  "Wash and dry buttons can also stop the active cycle.": "Les boutons de lavage et de séchage peuvent aussi arrêter le cycle en cours.",
  "Close": "Fermer",
  "Cleaning history": "Historique de nettoyage",
  "Cruising history": "Historique des déplacements",
  "Completed": "Terminé",
  "Interrupted": "Interrompu",
  "Session map": "Plan de la session",
  "Wi-Fi map": "Carte Wi-Fi",
  "Cleaning preferences": "Préférences de nettoyage",
  "Apply room settings": "Appliquer les réglages des pièces",
  "Cleaning sequence": "Ordre de nettoyage",
  "Suction": "Aspiration",
  "Room IDs": "IDs des pièces",
  "Water": "Eau",
  "Repeats": "Passages",
  "Accessory usage": "Entretien",
  "Map objects": "Objets de la carte",
  "No-go areas": "Zones interdites",
  "No-mopping areas": "Zones sans serpillière",
  "Carpets": "Tapis",
  "Virtual walls": "Murs virtuels",
  "Furniture": "Mobilier",
  "Predefined points": "Points prédéfinis",
  "Map editor": "Éditeur de carte",
  "The map changed. Select the area again.": "La carte a changé. Sélectionnez de nouveau la zone.",
  "Choose a point on the mapped floor.": "Choisissez un point au sol sur la carte.",
  "Waiting for the camera to confirm the map edit.": "En attente de la confirmation de la modification par la caméra.",
  "Rotation": "Rotation",
  "Disabled": "Désactivé",
  "Add restricted area": "Ajouter une zone interdite",
  "Remove area": "Supprimer la zone",
  "Confirm removal of the selected area.": "Confirmez la suppression de la zone sélectionnée.",
  "Select two new corners to resize this area.": "Sélectionnez deux nouveaux coins pour redimensionner cette zone.",
  "Add no-mopping area": "Ajouter une zone sans serpillière",
  "Apply map object": "Appliquer l’objet de carte",
  "Edit floor": "Modifier l’étage",
  "Schedules": "Programmation",
  "Shortcuts": "Raccourcis",
  "Start time": "Heure de début",
  "Days": "Jours",
  "Run shortcut": "Lancer le raccourci",
  "Recovery maps": "Cartes de récupération",
  "Invalid coordinate rows": "Coordonnées invalides",
  "Pause": "Pause",
  "Stop": "Arrêter",
  "Return to dock": "Retour à la station",
  "Locate": "Localiser",
  "Refresh map": "Actualiser la carte",
  "Clean a spot": "Point",
  "Clean a zone": "Zone",
  "Choose two corners that enclose an area.": "Choisissez deux coins qui délimitent une surface.",
  "Go to point": "Aller au point",
  "Rename a floor": "Renommer un étage",
  "Delete a floor": "Supprimer un étage",
  "Save the new map": "Enregistrer le nouveau plan",
  "Discard the new map": "Abandonner le nouveau plan",
  "Replace a floor with the new map": "Remplacer un étage par le nouveau plan",
  "Rename a room": "Renommer une pièce",
  "Split a room": "Diviser une pièce",
  "Merge rooms": "Fusionner des pièces",
  "Replace virtual walls and restricted zones": "Remplacer murs virtuels et zones interdites",
  "Replace physical walls and doors": "Remplacer murs physiques et portes",
  "Floor material": "Matériau du sol",
  "Place furniture": "Placer le mobilier",
  "Carpet settings": "Réglages des tapis",
  "Ignore or restore an obstacle": "Ignorer ou réactiver un obstacle",
  "Room cleaning order": "Ordre des pièces",
  "Custom room cleaning": "Nettoyage personnalisé par pièce",
  "Back up a floor": "Sauvegarder un étage",
  "Restore a backup": "Restaurer une sauvegarde",
  "Run a shortcut": "Lancer un raccourci",
  "Reset a consumable": "Réinitialiser un consommable",
  "Docked": "À la station",
  "Cleaning": "Nettoyage",
  "Paused": "En pause",
  "Returning to dock": "Retour à la station",
  "Idle": "Au repos",
  "Error": "Erreur",
  "Unavailable": "Indisponible",
  "Unknown state": "État inconnu",
  "Vacuum controls": "Commandes de l’aspirateur",
  "Robot map": "Carte du robot",
  "Settings, dock and maintenance": "Réglages, station et entretien",
  "History and photos": "Historique et photos",
  "Step-by-step remote control": "Télécommande pas à pas",
  "Map editing and management": "Édition et gestion des cartes",
  "Room": "Pièce",
  "Configure a vacuum entity.": "Configurez une entité vacuum.",
  "map_camera must be a camera entity.": "map_camera doit être une entité camera.",
  "entities must contain entity IDs.": "entities doit contenir des identifiants d’entité.",
  "Command sent.": "Commande envoyée.",
  "The command failed.": "La commande a échoué.",
  "Camera belongs to another device": "Caméra d’un autre appareil",
  "Choose a floor": "Choisir un étage",
  "Map": "Carte",
  "Switch floor": "Changer d’étage",
  "Confirm floor change": "Confirmer le changement d’étage",
  "Cancel": "Annuler",
  "No obstacle photo available": "Aucune photo de cet obstacle",
  "Floor": "Étage",
  "Rooms": "Pièces",
  "Clean rooms": "Nettoyer les pièces",
  "Select at least one room.": "Sélectionnez au moins une pièce.",
  "Choose a point on the map.": "Choisissez un point sur la carte.",
  "Choose two opposite corners.": "Choisissez deux coins opposés.",
  "Choose two opposite corners for each zone.": "Choisissez deux coins opposés pour chaque zone.",
  "Add coordinates": "Ajouter les coordonnées",
  "Enter two whole-number coordinates.": "Saisissez deux coordonnées entières.",
  "Send": "Envoyer",
  "Clear": "Effacer",
  "On the map": "Sur la carte",
  "Complete the selection.": "Complétez la sélection.",
  "Add Dreame entities with the entities option.": "Ajoutez les entités Dreame avec l’option entities.",
  "Invalid value.": "Valeur invalide.",
  "Speed": "Vitesse",
  "Move one step": "Déplacer d’un pas",
  "Advanced action": "Action avancée",
  "Confirm this action on the robot": "Confirmer l’action sur le robot",
  "Apply": "Appliquer",
  "Confirm the action": "Confirmez l’action",
};

export function languageFor(hass) {
  const locale = hass?.locale?.language ?? hass?.language ?? "";
  return /^fr(?:[-_]|$)/i.test(locale) ? "fr" : "en";
}

export function translate(language, message) {
  if (language !== "fr") return message;
  const [label] = message.split(" · ", 1);
  return Object.hasOwn(FRENCH, label) ? FRENCH[label] + message.slice(label.length) : message;
}

function projectPoint(calibration, coords, from, to) {
  if (!Array.isArray(calibration) || calibration.length < 3
    || !calibration.slice(0, 3).every((p) => point(p?.map) && point(p?.vacuum))
    || !Array.isArray(coords) || coords.length !== 2 || !coords.every(Number.isFinite)) return null;
  const [a, b, c] = calibration;
  const bx = b[from].x - a[from].x;
  const by = b[from].y - a[from].y;
  const cx = c[from].x - a[from].x;
  const cy = c[from].y - a[from].y;
  const det = bx * cy - by * cx;
  if (!Number.isFinite(det) || Math.abs(det) < 1e-8) return null;
  const dx = coords[0] - a[from].x;
  const dy = coords[1] - a[from].y;
  const u = (dx * cy - dy * cx) / det;
  const v = (bx * dy - by * dx) / det;
  return ["x", "y"].map((axis) => a[to][axis] + u * (b[to][axis] - a[to][axis]) + v * (c[to][axis] - a[to][axis]));
}

export function mapPoint(calibration, coords) {
  const projected = projectPoint(calibration, coords, "map", "vacuum")?.map(Math.round);
  return projected?.every(Number.isSafeInteger) ? projected : null;
}

export function roomMarkerPosition(calibration, bounds, width, height) {
  if (!bounds || !Number.isFinite(width) || !Number.isFinite(height) || width <= 0 || height <= 0) return null;
  const { x0, y0, x1, y1 } = bounds;
  if (![x0, y0, x1, y1].every(Number.isFinite) || x0 === x1 || y0 === y1) return null;
  const center = projectPoint(calibration, [(x0 + x1) / 2, (y0 + y1) / 2], "vacuum", "map");
  const fraction = center && [center[0] / width, center[1] / height];
  return fraction?.every((axis) => axis >= 0 && axis <= 1) ? fraction : null;
}

export function mapArea(a, b) {
  if (a[0] === b[0] || a[1] === b[1]) return null;
  return [Math.min(a[0], b[0]), Math.min(a[1], b[1]), Math.max(a[0], b[0]), Math.max(a[1], b[1])];
}

export function localImage(url) {
  return typeof url === "string" && /^\/api\/camera(?:_history_map|_map_obstacle|_recovery_map|_wifi_map)?_proxy\/camera\.[a-z0-9_]+(?:\?[^\r\n#]*)?$/.test(url)
    ? url : null;
}

export function mapDataURL(image, camera) {
  if (!localImage(image)) return null;
  const [path, query] = image.split("?", 2);
  if (path !== `/api/camera_proxy/${camera}`) return null;
  const params = new URLSearchParams(query);
  const version = params.get("v");
  if (!version) return null;
  const request = new URLSearchParams();
  if (params.get("token")) request.set("token", params.get("token"));
  request.set("v", version);
  return `/api/camera_map_data_proxy/${camera}?${request}`;
}

export function decodeMapScene(raw, { floor, mapId, frame } = {}) {
  const [left, top, , , width, height, step] = Array.isArray(raw?.size) ? raw.size : [];
  if (raw?.empty_map || raw?.temporary_map || raw?.wifi_map || ![left, top, width, height, step].every(Number.isSafeInteger)
    || width <= 0 || height <= 0 || step <= 0 || width * height > 1_000_000
    || floor == null || String(raw.saved_map_id ?? raw.map_id) !== String(floor)
    || (mapId != null && String(raw.map_id) !== String(mapId))
    || (frame != null && String(raw.frame_id) !== String(frame))
    || !raw.data || typeof raw.data !== "object" || Array.isArray(raw.data)) return null;
  const pixels = new Uint16Array(width * height);
  const layers = Object.entries(raw.data);
  const hiddenRooms = new Set(Array.isArray(raw.hidden_segments) ? raw.hidden_segments : []);
  let covered = 0;
  for (const [key, runs] of layers) {
    const type = Number(key);
    if (String(type) !== key || !Number.isInteger(type) || type < 1 || (type > 255 && type !== 512)
      || !Array.isArray(runs) || runs.length % 3) return null;
    for (let i = 0; i < runs.length; i += 3) {
      const x = runs[i], y = runs[i + 1], count = runs[i + 2];
      if (![x, y, count].every(Number.isSafeInteger) || x < 0 || y < 0 || count < 1
        || y >= height || x + count > width || (covered += count) > 2 * pixels.length) return null;
      if (type === 512) continue;
      const start = y * width + x;
      for (let j = start; j < start + count; j++) {
        if (pixels[j]) return null;
        pixels[j] = type;
      }
    }
  }
  if (!pixels.some(Boolean)) return null;
  const walls = Object.entries(raw.walls ?? {}).flatMap(([room, rows]) => {
    if (hiddenRooms.has(Number(room)) || !Array.isArray(rows)) return [];
    return rows.flatMap((row) => {
      const line = Array.isArray(row) && lineCoordinates(row.slice(0, 4));
      return line && (line[0] !== line[2] || line[1] !== line[3]) ? [line] : [];
    });
  });
  return { left, top, width, height, step, pixels, layers, hiddenRooms, materials: raw.floor_material,
    robot: raw.robot_position, dock: raw.charger_position, path: raw.path, walls, doors: raw.doors, furniture: raw.furnitures };
}

const roomPixel = (type) => type > 100 && type < 200 ? type - 100 : type;
const isRoomFloor = (type) => type > 0 && type < 100;
export const cleanablePixel = (type) => isRoomFloor(type) || type === 253 || type === 254;

function unrotateMapPoint(x, y, rotation, extent = 1) {
  if (rotation === 90) return [y, extent - x];
  if (rotation === 180) return [extent - x, extent - y];
  if (rotation === 270) return [extent - y, x];
  return [x, y];
}

export function scenePixel(scene, [x, y]) {
  const col = Math.floor((x - scene.left) / scene.step);
  const row = Math.floor((y - scene.top) / scene.step);
  const type = col >= 0 && col < scene.width && row >= 0 && row < scene.height ? scene.pixels[row * scene.width + col] : 0;
  return scene.hiddenRooms.has(roomPixel(type)) ? 0 : type;
}

const ROOM_COLORS = {
  light: ["#a4c2f4", "#aed59b", "#91cce7", "#f4d877", "#b3a4da", "#efb997"],
  dark: ["#42638c", "#4e7248", "#366c81", "#8a753c", "#675686", "#8f6247"],
};

function roomColor(id, palette) {
  return palette[(id - 1) % palette.length];
}

function mapPresentation(config, index) {
  const floor = config.map_config?.[`map_${index}`];
  return { ...floor, hidden_objects: floor?.hidden_objects ?? config.hidden_objects };
}

function paintedRoomColor(room, palette, placement) {
  const pairs = placement.colors.segment;
  if (!pairs?.length) return roomColor(room, palette);
  const index = placement.rooms?.[room]?.color_index;
  const pair = pairs[Number.isSafeInteger(index) && index >= 0 ? index % pairs.length : (room - 1) % pairs.length];
  return pair[placement.selected.has(room) ? 1 : 0];
}

function floorPattern(ctx, material, dark) {
  const tile = document.createElement("canvas");
  tile.width = tile.height = 32;
  const ink = tile.getContext("2d");
  ink.fillStyle = dark ? "#ffffff32" : "#24354a32";
  ink.fillRect(0, 0, 32, 1);
  if (material === 3) ink.fillRect(0, 0, 1, 32);
  else {
    ink.fillRect(0, 16, 32, 1);
    ink.fillRect(0, 0, 1, 16);
    ink.fillRect(16, 16, 1, 16);
  }
  const pattern = ctx.createPattern(tile, "repeat");
  const transform = new DOMMatrix().scale(.125);
  if (material === 2) transform.rotateSelf(90);
  pattern.setTransform(transform);
  return pattern;
}

function fillMapRuns(ctx, runs) {
  for (let i = 0; i < runs.length; i += 3) ctx.fillRect(runs[i], runs[i + 1], runs[i + 2], 1);
}

function paintMapCells(ctx, scene, dark, placement) {
  const { colors, hidden } = placement;
  const palette = ROOM_COLORS[dark ? "dark" : "light"];
  const patterns = new Map();
  for (const [key, runs] of scene.layers) {
    const type = Number(key);
    const room = roomPixel(type);
    const wall = [251, 255].includes(type) || (type > 100 && type < 200);
    if ((type >= 200 && type <= 232) || scene.hiddenRooms.has(room)
      || hidden.has(wall ? "walls" : type === 512 ? "carpet" : "floor")) continue;
    if (type === 512) ctx.globalCompositeOperation = "source-atop";
    ctx.fillStyle = type === 512 ? colors.carpet ?? "#b891574d" : wall ? colors.wall ?? (dark ? "#96a6bb" : "#47566a")
      : isRoomFloor(type) ? paintedRoomColor(room, palette, placement) : colors.floor ?? (dark ? "#46515e" : "#cfdae5");
    fillMapRuns(ctx, runs);
    const material = scene.materials?.[type];
    if (hidden.has("material") || !isRoomFloor(type) || ![1, 2, 3].includes(material)) continue;
    if (!patterns.has(material)) patterns.set(material, floorPattern(ctx, material, dark));
    ctx.fillStyle = patterns.get(material);
    fillMapRuns(ctx, runs);
  }
  ctx.globalCompositeOperation = "source-over";
}

function paintScene(canvas, scene, calibration, presentation) {
  const { left, top, width, height, step } = scene;
  const [origin, right, up] = [[left, top], [left + step, top], [left, top + step]]
    .map((coords) => projectPoint(calibration, coords, "vacuum", "map"));
  const { naturalWidth, naturalHeight } = presentation.image;
  if (![origin, right, up].every((coords) => coords?.every(Number.isFinite))
    || !naturalWidth || !naturalHeight || naturalWidth * naturalHeight > 4_000_000) return false;
  const ctx = canvas.getContext("2d");
  if (!ctx) return false;
  canvas.width = naturalWidth;
  canvas.height = naturalHeight;
  ctx.setTransform(right[0] - origin[0], right[1] - origin[1], up[0] - origin[0], up[1] - origin[1], ...origin);
  const dark = canvas.closest(".body").classList.contains("scheme-dreame-dark");
  const hidden = new Set(presentation.hidden_objects ?? []);
  paintMapCells(ctx, scene, dark, { ...presentation, hidden });
  if (!hidden.has("path")) paintMapPaths(ctx, scene, presentation.colors.path ?? (dark ? "#c0edff" : "#178cb5"));
  ctx.globalAlpha = presentation.object_opacity ?? 1;
  if (!hidden.has("furniture") && !hidden.has("furniture_image")) paintMapFurniture(ctx, scene, dark);
  paintMapPositions(ctx, scene, hidden);
  return true;
}

const furnitureOval = (x, y, width, height) => [x, y, width, height, "oval"];
const furnitureBox = [[-.5, -.5, 1, 1]];
const FURNITURE_ART = new Map([
  [[1], furnitureBox, [[-.37, .17, .74, .23]]],
  [[2], furnitureBox, [[-.37, .17, .34, .23], [.03, .17, .34, .23]]],
  [[3, 4, 5, 29, 30], furnitureBox, [[-.5, .29, 1, .16], [-.47, -.36, .13, .65], [.34, -.36, .13, .65]]],
  [[6, 8, 26], furnitureBox, [[-.38, -.36, .76, .72]]],
  [[7, 18, 19, 20, 21], furnitureBox, [[-.4, -.38, .37, .76], [.03, -.38, .37, .76]]],
  [[9, 13], [[-.48, .13, .96, .37], furnitureOval(-.42, -.5, .84, .78)], [furnitureOval(-.24, -.35, .48, .47)]],
  [[10, 16], furnitureBox, [[-.34, -.34, .68, .68]]],
  [[11, 12, 25], [furnitureOval(-.5, -.5, 1, 1)], [furnitureOval(-.36, -.36, .72, .72)]],
  [[14], furnitureBox, [[-.46, .1, .92, .08], [.25, -.33, .07, .34]]],
  [[15], furnitureBox, [furnitureOval(-.27, -.32, .54, .54), [-.38, .29, .76, .08]]],
  [[17], furnitureBox, [[-.37, -.28, .74, .13]]],
  [[22], [furnitureOval(-.5, -.5, 1, 1)], [furnitureOval(-.29, -.1, .45, .4), furnitureOval(-.12, -.29, .43, .46)]],
  [[23], furnitureBox, [[-.36, -.38, .72, .76]]],
  [[24], [[-.5, -.06, 1, .56], [-.5, -.5, .42, 1]], [[-.45, .31, .9, .13], [-.45, -.42, .13, .75]]],
  [[31], [[-.5, -.06, 1, .56], [.08, -.5, .42, 1]], [[-.45, .31, .9, .13], [.32, -.42, .13, .75]]],
].flatMap(([types, body, details]) => types.map(type => [type, { body, details }])));

function paintMapFurniture(ctx, scene, dark) {
  if (!Array.isArray(scene.furniture)) return;
  for (const row of scene.furniture) {
    if (!Array.isArray(row)) continue;
    const [x, y, width, height, type, , angle = 0, , room] = row;
    if (![x, y, width, height, angle].every(Number.isFinite) || width <= 0 || height <= 0
      || width > scene.width * scene.step || height > scene.height * scene.step || scene.hiddenRooms.has(room)) continue;
    const art = FURNITURE_ART.get(type);
    if (!art) continue;
    const col = (x - scene.left) / scene.step, line = (y - scene.top) / scene.step;
    if (col < 0 || col >= scene.width || line < 0 || line >= scene.height) continue;
    ctx.save();
    ctx.translate(col, line);
    ctx.scale(width / scene.step, height / scene.step);
    ctx.rotate(-(angle % 360) * Math.PI / 180);
    paintFurnitureShape(ctx, art, dark);
    ctx.restore();
  }
}

// shortcut: use silhouettes for supported furniture families until exact independent artwork is available.
function paintFurnitureShape(ctx, { body, details }, dark) {
  ctx.fillStyle = dark ? "#9eabb7" : "#eff3ee";
  paintFurnitureParts(ctx, body);
  ctx.fillStyle = dark ? "#677787" : "#ccd9d8";
  paintFurnitureParts(ctx, details);
}

function paintFurnitureParts(ctx, parts) {
  for (const [x, y, width, height, shape] of parts) {
    ctx.beginPath();
    if (shape === "oval") ctx.ellipse(x + width / 2, y + height / 2, width / 2, height / 2, 0, 0, 2 * Math.PI);
    else ctx.roundRect(x, y, width, height, Math.min(width, height, .16) / 2);
    ctx.fill();
  }
}

function paintMapPaths(ctx, { path, left, top, step }, color) {
  if (!Array.isArray(path)) return;
  ctx.strokeStyle = color;
  ctx.lineWidth = .16;
  for (const route of path) {
    if (!Array.isArray(route) || route.length < 5 || route.length % 2 !== 1 || !route.slice(1).every(Number.isFinite)) continue;
    ctx.beginPath();
    ctx.moveTo((route[1] - left) / step, (route[2] - top) / step);
    for (let i = 3; i < route.length; i += 2) ctx.lineTo((route[i] - left) / step, (route[i + 1] - top) / step);
    ctx.stroke();
  }
}

function paintMapPositions(ctx, scene, hidden) {
  const { left, top, step, width, height } = scene;
  const transform = ctx.getTransform();
  const radius = Math.min(ctx.canvas.width, ctx.canvas.height) * .033;
  ctx.resetTransform();
  for (const [position, paint, key] of [[scene.dock, paintDockIcon, "charger"], [scene.robot, paintRobotIcon, "vacuum"]]) {
    if (hidden.has(key)) continue;
    if (!Array.isArray(position) || !position.slice(0, 2).every(Number.isFinite) || position.length < 2) continue;
    const x = (position[0] - left) / step, y = (position[1] - top) / step;
    if (x < 0 || x >= width || y < 0 || y >= height) continue;
    const screen = transform.transformPoint({ x, y });
    ctx.save();
    ctx.translate(screen.x, screen.y);
    ctx.scale(radius, radius);
    ctx.strokeStyle = "#fff";
    ctx.lineWidth = .16;
    paint(ctx, mapHeading(transform, position[2]));
    ctx.restore();
  }
}

function mapHeading({ a, b, c, d }, heading) {
  if (!Number.isFinite(heading) || heading === 32767) return null;
  // Dreame measures from +X in robot coordinates; the calibration can rotate or flip the axes.
  const angle = (heading % 360) * Math.PI / 180;
  const x = Math.cos(angle), y = Math.sin(angle);
  return Math.atan2(b * x + d * y, a * x + c * y);
}

function paintDockIcon(ctx) {
  ctx.beginPath();
  ctx.roundRect(-.65, -.82, 1.3, 1.64, .24);
  ctx.fillStyle = "#007d68";
  ctx.fill();
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(.08, -.6);
  ctx.lineTo(-.34, .1);
  ctx.lineTo(-.05, .1);
  ctx.lineTo(-.14, .56);
  ctx.lineTo(.34, -.12);
  ctx.lineTo(.05, -.12);
  ctx.fillStyle = "#fff";
  ctx.fill();
}

function paintRobotIcon(ctx, heading) {
  ctx.beginPath();
  ctx.arc(0, 0, .94, 0, 2 * Math.PI);
  ctx.fillStyle = "#007d9d";
  ctx.fill();
  ctx.stroke();
  ctx.beginPath();
  if (heading === null) ctx.arc(0, 0, .22, 0, 2 * Math.PI);
  else {
    ctx.rotate(heading);
    ctx.moveTo(.75, 0);
    ctx.lineTo(-.35, -.36);
    ctx.lineTo(-.13, 0);
    ctx.lineTo(-.35, .36);
  }
  ctx.fillStyle = "#fff";
  ctx.fill();
}

export function deviceEntities(hass, config) {
  const registry = hass.entities ?? {};
  const device = registry[config.entity]?.device_id;
  const ids = config.entities ?? (device
    ? Object.keys(registry).filter((id) => registry[id].device_id === device) : []);
  return [...new Set(ids)].filter((id) => SETTING_DOMAINS.has(id.split(".")[0]) && hass.states[id]).sort();
}

export function availableActions(hass, actions) {
  return [...new Set(actions)].filter((action) => hasAction(hass, action));
}

function dreameEntity(hass, config, ids, domain, key) {
  const registry = hass.entities ?? {};
  const device = registry[config.entity]?.device_id;
  const matches = ids.filter((id) => {
    const entry = registry[id];
    return id.startsWith(domain + ".") && (!device || !entry?.device_id || entry.device_id === device)
      && (!entry?.platform || entry.platform === DOMAIN)
      && (entry?.translation_key ? entry.translation_key === key : id.endsWith(`_${key}`));
  });
  return matches.length === 1 ? matches[0] : undefined;
}

const DOCK_ACTIONS = [
  ["self_clean", "Wash mops", "water"], ["manual_drying", "Dry mops", "weather-sunny"],
  ["manual_dust_bag_drying", "Dry dust bag", "fire"], ["start_auto_empty", "Empty dust bag", "delete-empty"],
];
const DOCK_SENSORS = ["clean_water_tank_status", "dirty_water_tank_status", "dust_bag_status", "detergent_status"];
const CLEANING_CONTROLS = [
  ["cleaning_mode", "Cleaning mode", "select", { sweeping: "broom", mopping: "water", sweeping_and_mopping: "hydro-power", mopping_after_sweeping: "broom" }],
  ["suction_level", "Suction level", "select", { quiet: "fan-speed-1", standard: "fan-speed-2", strong: "fan-speed-3", turbo: "fan-alert" }],
  ["mop_pad_humidity", "Water level", "select", { low: "water-low", standard: "water", high: "water-percent" }],
  ["wetness_level", "Wetness level", "number"],
  ["cleaning_route", "Route", "select", { standard: "vector-polyline", quick: "fast-forward", deep: "repeat" }],
  ["cleangenius", "CleanGenius", "select", { off: "close", routine_cleaning: "shield-check", deep_cleaning: "shield-star" }],
  ["customized_cleaning", "Customized cleaning", "switch"],
];
const CONSUMABLES = ["main_brush", "side_brush", "filter", "sensor_dirty", "tank_filter", "mop_pad", "silver_ion", "detergent",
  "squeegee", "onboard_dirty_water_tank", "dirty_water_channel_dirty", "deodorizer", "wheel_dirty",
  "scale_inhibitor", "fluffing_roller_dirty", "roller_mop_filter_dirty", "water_outlet_filter_dirty", "washboard_cleaning"];

export function dockEntities(hass, config) {
  const ids = deviceEntities(hass, config);
  const commands = hasAction(hass, "button.press") ? DOCK_ACTIONS.map(([key]) => ["button", key]) : [];
  return Object.fromEntries([...commands, ...DOCK_SENSORS.map((key) => ["sensor", key])].flatMap(([domain, key]) => {
    const id = dreameEntity(hass, config, ids, domain, key);
    return id ? [[key, id]] : [];
  }));
}

export function maintenanceEntries(hass, config) {
  const ids = deviceEntities(hass, config);
  return CONSUMABLES.flatMap((key) => {
    const id = dreameEntity(hass, config, ids, "sensor", `${key}_left`);
    const timeId = dreameEntity(hass, config, ids, "sensor", `${key}_time_left`);
    const life = hass.states[id];
    const estimate = hass.states[timeId];
    const percent = online(life) && /^\d+(?:\.\d+)?$/.test(life.state) ? Number(life.state) : null;
    const time = online(estimate) ? [estimate.state, estimate.attributes?.unit_of_measurement].filter(Boolean).join(" ") : null;
    if ((percent === null || percent > 100) && !time) return [];
    return [{ name: caption(life ?? estimate, id ?? timeId), percent: percent !== null && percent <= 100 ? percent : null, time }];
  });
}

export function customCleaningPayload(values) {
  const fields = ["segment_id", "suction_level", "repeats", "water_volume", "wetness_level", "cleaning_mode", "mop_temperature", "mop_pressure"];
  const payload = {};
  for (const field of fields) {
    if (values[field] == null || values[field] === "") continue;
    let parsed;
    try { parsed = typeof values[field] === "string" ? JSON.parse(values[field]) : values[field]; } catch { throw new Error("Invalid JSON · " + field); }
    if (!Array.isArray(parsed) || !parsed.every(Number.isSafeInteger)) throw new Error("Expected integer list · " + field);
    payload[field] = parsed;
  }
  for (const field of ["segment_id", "suction_level", "repeats"]) {
    if (!Array.isArray(payload[field]) || !payload[field].length) throw new Error("Required field · " + field);
  }
  const lengths = new Set([payload.segment_id.length, payload.suction_level.length, payload.repeats.length,
    ...["water_volume", "wetness_level", "cleaning_mode", "mop_temperature", "mop_pressure"].filter((field) => payload[field]).map((field) => payload[field].length)]);
  if (lengths.size !== 1) throw new Error("Room settings lists must have equal lengths.");
  return payload;
}

export function historyEntries(attributes, pictures, camera) {
  const images = new Map();
  for (const url of Object.values(pictures ?? {})) {
    if (!localImage(url)) continue;
    const [path, query] = url.split("?", 2);
    if (path !== `/api/camera_history_map_proxy/${camera}`) continue;
    const time = new URLSearchParams(query).get("v");
    if (!time || !/^\d+$/.test(time)) continue;
    const timestamp = Number(time);
    images.set(timestamp, images.has(timestamp) ? null : url);
  }
  return Object.entries(attributes ?? {}).flatMap(([date, entry]) => {
    if (!Number.isFinite(entry?.timestamp) || entry.timestamp <= 0) return [];
    return [{ date, timestamp: entry.timestamp, status: entry.status,
      summary: [entry.cleaned_area, entry.cleaning_time ?? entry.cruising_time].filter((text) => typeof text === "string"),
      completed: entry.completed, image: images.get(Math.trunc(entry.timestamp)) ?? null }];
  }).sort((a, b) => b.timestamp - a.timestamp);
}

export function mapObjectSummary(attributes = {}) {
  const groups = [["no_go_areas", "No-go areas"], ["no_mopping_areas", "No-mopping areas"], ["carpets", "Carpets"],
    ["virtual_walls", "Virtual walls"], ["virtual_thresholds", "Virtual thresholds"], ["passable_thresholds", "Passable thresholds"],
    ["impassable_thresholds", "Impassable thresholds"], ["ramps", "Ramps"], ["curtains", "Curtains"],
    ["low_lying_areas", "Low-lying areas"], ["obstacles", "Obstacles"], ["furnitures", "Furniture"], ["predefined_points", "Predefined points"]];
  return groups.flatMap(([key, label]) => Array.isArray(attributes[key]) || (attributes[key] && typeof attributes[key] === "object")
    ? [{ key, label, count: Array.isArray(attributes[key]) ? attributes[key].length : Object.keys(attributes[key]).length }] : []);
}

export function mapObjectMarkers(attributes, calibration, width, height) {
  const markers = [];
  const project = (point) => {
    if (!Array.isArray(point) || point.length !== 2 || !point.every(Number.isSafeInteger)) return null;
    const result = projectPoint(calibration, point, "vacuum", "map");
    const position = result && [result[0] / width, result[1] / height];
    return position?.every((axis) => axis >= 0 && axis <= 1) ? position : null;
  };
  const addPoint = (kind, key, point, label) => {
    const position = project(point);
    if (position) markers.push({ kind, key, label: label ?? key, x: position[0], y: position[1] });
  };
  for (const [key, object] of Object.entries(attributes?.obstacles ?? {})) addPoint("obstacles", key, [object?.x, object?.y], object?.type);
  for (const [index, rectangle] of (attributes?.carpets ?? []).entries()) {
    if (Array.isArray(rectangle) && rectangle.length === 4 && rectangle.every(Number.isSafeInteger)
      && rectangle[0] !== rectangle[2] && rectangle[1] !== rectangle[3]) {
      addPoint("carpets", String(index), [(rectangle[0] + rectangle[2]) / 2, (rectangle[1] + rectangle[3]) / 2], "Carpet");
    }
  }
  for (const [index, object] of (attributes?.furnitures ?? attributes?.furniture ?? []).entries()) {
    if ([object?.x0, object?.y0, object?.x1, object?.y1].every(Number.isSafeInteger)) {
      addPoint("furniture", String(index), [(object.x0 + object.x1) / 2, (object.y0 + object.y1) / 2], object.type ?? "Furniture");
    }
  }
  return markers;
}

export function appendMapRectangle(existing, first, second, field) {
  if (!Array.isArray(existing) || !Array.isArray(first) || !Array.isArray(second)
    || first.length !== 2 || second.length !== 2 || !first.every(Number.isSafeInteger) || !second.every(Number.isSafeInteger)) {
    throw new Error("Invalid rectangle.");
  }
  const rectangle = mapArea(first, second);
  if (!rectangle) throw new Error("Invalid rectangle.");
  if (!["zones", "no_mops", "walls"].includes(field)) throw new Error("Unsupported rectangle list.");
  return [...existing, rectangle];
}

export function restrictionSnapshot(map, activeFloor, cameraFloor) {
  if (activeFloor == null || String(activeFloor) !== String(cameraFloor)) return null;
  const { virtual_walls, no_go_areas, no_mopping_areas } = map;
  if (![virtual_walls, no_go_areas, no_mopping_areas].every(Array.isArray)) return null;
  const walls = virtual_walls.map(lineCoordinates);
  const zones = no_go_areas.map(rectangleCoordinates);
  const no_mops = no_mopping_areas.map(rectangleCoordinates);
  return [...walls, ...zones, ...no_mops].every(Boolean) ? JSON.stringify({ floor: activeFloor, walls, zones, no_mops }) : null;
}

const RESTRICTION_LISTS = [
  { field: "zones", attr: "no_go_areas", label: "No-go areas", add: "Add restricted area" },
  { field: "no_mops", attr: "no_mopping_areas", label: "No-mopping areas", add: "Add no-mopping area" },
];

function lineCoordinates(line) {
  const coords = Array.isArray(line) ? line : [line?.x0, line?.y0, line?.x1, line?.y1];
  return coords.length === 4 && coords.every(Number.isSafeInteger) ? coords : null;
}

function rectangleCoordinates(area) {
  if (!area || area.angle || area.hidden) return null;
  const coords = Array.isArray(area) ? area : [area.x0, area.y0, area.x1, area.y1, area.x2, area.y2, area.x3, area.y3];
  if (coords.length === 4 && coords.every(Number.isSafeInteger)) return mapArea(coords.slice(0, 2), coords.slice(2));
  if (coords.length !== 8 || !coords.every(Number.isSafeInteger)) return null;
  const xs = [coords[0], coords[2], coords[4], coords[6]], ys = [coords[1], coords[3], coords[5], coords[7]];
  const rect = mapArea([Math.min(...xs), Math.min(...ys)], [Math.max(...xs), Math.max(...ys)]);
  if (!rect || new Set(xs).size !== 2 || new Set(ys).size !== 2
    || new Set(xs.map((x, i) => `${x}:${ys[i]}`)).size !== 4) return null;
  return rect;
}

export function appendRestriction(before, current, field, corners) {
  return editRestriction(before, current, field, { corners });
}

export function editRestriction(before, current, field, { index = null, corners }) {
  if (!before || before !== current) throw new Error("The map changed. Select the area again.");
  if (!["zones", "no_mops"].includes(field)) throw new Error("Unsupported rectangle list.");
  const restrictions = JSON.parse(current);
  const rows = restrictions[field];
  if (index === null) restrictions[field] = appendMapRectangle(rows, corners?.[0], corners?.[1], field);
  else {
    if (!Number.isInteger(index) || index < 0 || index >= rows.length) throw new Error("The map changed. Select the area again.");
    const replacement = corners === undefined ? [] : appendMapRectangle([], corners?.[0], corners?.[1], field);
    rows.splice(index, 1, ...replacement);
  }
  return mapEditPayload("set_restricted_zone", {
    walls: JSON.stringify(restrictions.walls), zones: JSON.stringify(restrictions.zones),
    no_mops: JSON.stringify(restrictions.no_mops), confirm: true,
  });
}

export function scheduleEntries(attributes = {}) {
  if (Array.isArray(attributes)) return attributes.flatMap((task) => typeof task?.time === "string"
    ? [{ name: task.time, enabled: task.enabled === true && !task.invalid, time: null, days: [] }] : []);
  return Object.entries(attributes).flatMap(([name, value]) => value && typeof value === "object"
    ? [{ name, enabled: value.enabled !== false, time: value.time ?? value.start_time ?? null, days: value.days ?? [] }] : []);
}

export function shortcutEntries(attributes = {}) {
  return Object.entries(attributes).flatMap(([key, shortcut]) => {
    if (!shortcut || typeof shortcut !== "object") return [];
    const id = shortcut.id ?? (/^\d+$/.test(key) ? Number(key) : null);
    return [{ ...(Number.isSafeInteger(id) && id >= 25 && id <= 128 ? { id } : {}),
      name: typeof shortcut.name === "string" && shortcut.name ? shortcut.name : key,
      tasks: Array.isArray(shortcut.tasks) ? shortcut.tasks.length : null }];
  });
}

export function buildCleaningTask(mode, selection = {}) {
  const integerPoint = (value) => Array.isArray(value) && value.length === 2
    && Number.isSafeInteger(value[0]) && Number.isSafeInteger(value[1]) ? value : null;
  if (mode === "global") return { action: "vacuum.start", data: {} };
  if (mode === "room") {
    if (!Array.isArray(selection.rooms) || !selection.rooms.length || !selection.rooms.every((id) => Number.isSafeInteger(id) && id > 0)) {
      throw new Error("Choose at least one room.");
    }
    return { action: dreame("clean_segment"), data: { segments: [...selection.rooms] } };
  }
  if (mode === "zone") {
    const zones = selection.zones ?? [selection.corners];
    const rectangles = Array.isArray(zones) && Array.from(zones, (corners) =>
      Array.isArray(corners) && corners.length === 2 && integerPoint(corners[0]) && integerPoint(corners[1])
      && mapArea(...corners));
    if (!rectangles?.length || !rectangles.every(Boolean)) throw new Error("Choose two corners for the zone.");
    return { action: dreame("clean_zone"), data: { zone: rectangles.length === 1 ? rectangles[0] : rectangles } };
  }
  if (mode === "spot") {
    const points = selection.points ?? [selection.point];
    if (!Array.isArray(points) || !points.length || !Array.from(points).every(integerPoint)) throw new Error("Choose a valid spot point.");
    return { action: dreame("clean_spot"), data: { points } };
  }
  if (mode === "goto") {
    const pointValue = integerPoint(selection.point);
    if (!pointValue) throw new Error("Choose a valid destination point.");
    return { action: dreame("goto"), data: { x: pointValue[0], y: pointValue[1] } };
  }
  throw new Error("Unknown cleaning task.");
}

export function capabilityEntities(hass, config) {
  return Object.fromEntries(deviceEntities(hass, config).map((id) => [id, hass.states[id]]));
}

export function mapEditPayload(operation, values = {}) {
  const destructive = new Set(["delete_map", "replace_temporary_map", "restore_map", "set_restricted_zone", "set_walls", "set_floor_material", "set_furniture", "set_custom_carpet_cleaning", "set_obstacle_ignore", "set_cleaning_sequence", "set_custom_cleaning"]);
  if (destructive.has(operation) && values.confirm !== true && values.confirm !== "true") throw new Error("Confirm this action before applying the map edit.");
  const definitions = Object.fromEntries(EDITS.map(([key, , fields]) => [key, fields]));
  if (!definitions[operation]) throw new Error("Unknown map edit.");
  const payload = parseFields(definitions[operation], values);
  if (operation === "set_restricted_zone") {
    validateCoordinateRows(payload.walls, "walls", [4]);
    for (const field of ["zones", "no_mops"]) {
      const rows = payload[field];
      validateCoordinateRows(rows, field, [4, 5]);
      if (!rows.every((row) => row.length === rows[0].length)) throw new Error("Mixed coordinate rows · " + field);
    }
  } else if (operation === "set_walls") {
    validateCoordinateRows(payload.doors, "doors", [6]);
    if (payload.walls) validateCoordinateRows(Object.values(payload.walls), "walls");
  }
  return payload;
}

function validateCoordinateRows(rows, field, lengths) {
  if (rows && !rows.every((row) => Array.isArray(row) && (!lengths || lengths.includes(row.length))
    && row.every(Number.isSafeInteger))) throw new Error("Invalid coordinate rows · " + field);
}

function validateMapPresentation(maps) {
  if (!maps || typeof maps !== "object" || Array.isArray(maps)) throw new Error("map_config must be an object.");
  for (const [key, floor] of Object.entries(maps)) {
    if (!/^map_[1-9]\d*$/.test(key) || !floor || typeof floor !== "object" || Array.isArray(floor)) {
      throw new Error("map_config is invalid.");
    }
    if (floor.rotation != null && ![0, 90, 180, 270].includes(floor.rotation)) throw new Error(`map_config.${key}.rotation is invalid.`);
    for (const name of ["left", "top", "width", "height", "scale", "object_scale", "font_size"]) {
      if (floor[name] != null && (!Number.isFinite(floor[name]) || (["width", "height", "scale", "object_scale"].includes(name) && floor[name] <= 0)
        || (name === "scale" && (floor[name] < .1 || floor[name] > 20)) || (name === "font_size" && (floor[name] < 0 || floor[name] > 12)))) {
        throw new Error(`map_config.${key}.${name} is invalid.`);
      }
    }
    for (const name of ["background_image", "overlay_image"]) {
      if (floor[name] != null) validateMapAsset(floor[name], `map_config.${key}.${name}`);
    }
    for (const name of ["opacity", "object_opacity"]) {
      if (floor[name] != null && (!Number.isFinite(floor[name]) || floor[name] < 0 || floor[name] > 1)) {
        throw new Error(`map_config.${key}.${name} must be between 0 and 1.`);
      }
    }
    if (floor.hidden_objects != null && (!Array.isArray(floor.hidden_objects)
      || !floor.hidden_objects.every((item) => typeof item === "string"))) throw new Error("map_config hidden_objects is invalid.");
  }
}

function validateMapAsset(asset, name) {
  const url = typeof asset?.url === "string" && asset.url;
  if (!url || !url.startsWith("/local/") || !url.slice(7).split("?", 1)[0].split("/")
    .every((part) => /^[\w.-]+$/.test(part) && part !== "." && part !== "..")) throw new Error(`${name}.url must be a /local/ image.`);
  for (const key of ["left", "top", "width", "height", "opacity"]) {
    const number = asset[key];
    if (number == null) continue;
    if (!Number.isFinite(number) || (["width", "height"].includes(key) && number <= 0)
      || (key === "opacity" && (number < 0 || number > 1))) throw new Error(`${name}.${key} is invalid.`);
  }
}

function validMapColor(color) {
  if (typeof color !== "string") return false;
  if (/^#(?:[\da-f]{3,4}|[\da-f]{6}|[\da-f]{8})$/i.test(color)) return true;
  const rgb = /^(rgb|rgba)\(([^()]*)\)$/i.exec(color);
  if (!rgb) return false;
  const parts = rgb[2].split(",").map((part) => part.trim());
  const percentages = parts[0].endsWith("%");
  return parts.length === (rgb[1].toLowerCase() === "rgba" ? 4 : 3)
    && parts.slice(0, 3).every((part) => part.endsWith("%") === percentages) && parts.every((part, index) =>
    /^(?:\d+(?:\.\d+)?|\.\d+)%?$/.test(part) && Number.parseFloat(part) <= (part.endsWith("%") ? 100 : index === 3 ? 1 : 255));
}

function validateOverrideColors(colors, theme = false) {
  if (!colors || typeof colors !== "object" || Array.isArray(colors)) throw new Error("override_colors must be an object.");
  for (const [key, value] of Object.entries(colors)) {
    if (key === "dark" && !theme) validateOverrideColors(value, true);
    else if (key === "segment") {
      if (!Array.isArray(value) || !value.every((pair) => Array.isArray(pair) && pair.length === 2 && pair.every(validMapColor))) {
        throw new Error("override_colors.segment must contain pairs of colors.");
      }
    } else if (!validMapColor(value)) throw new Error(`override_colors.${key} is invalid.`);
  }
}

export function validateCardConfig(config = {}) {
  if (config.aspect_ratio != null && (!Number.isFinite(config.aspect_ratio)
    || config.aspect_ratio < .1 || config.aspect_ratio > 100)) throw new Error("aspect_ratio must be between 0.1 and 100.");
  if (config.full_height != null && typeof config.full_height !== "boolean") throw new Error("full_height must be a boolean.");
  if (config.left_handed != null && typeof config.left_handed !== "boolean") throw new Error("left_handed must be a boolean.");
  if (config.scripts != null && (!Array.isArray(config.scripts)
    || !config.scripts.every((id) => typeof id === "string" && /^script\.[a-z0-9_]+$/.test(id)))) {
    throw new Error("scripts must contain script entity IDs.");
  }
  if (config.hidden_card_objects != null && (!Array.isArray(config.hidden_card_objects)
    || !config.hidden_card_objects.every((key) => typeof key === "string"))) throw new Error("hidden_card_objects must be a list of names.");
  if (config.hidden_objects != null && (!Array.isArray(config.hidden_objects)
    || !config.hidden_objects.every((key) => typeof key === "string"))) throw new Error("hidden_objects must be a list of names.");
  if (config.map_config != null) validateMapPresentation(config.map_config);
  if (config.override_colors != null) validateOverrideColors(config.override_colors);
  if (config.map_display != null && !["standard", "structured", "floor_plan"].includes(config.map_display)) throw new Error("map_display is invalid.");
  if (!["default", "panel"].includes(config.mode ?? "default")) throw new Error("mode must be default or panel.");
  const map = config.map ?? {};
  if (map.scale != null && (!Number.isFinite(map.scale) || map.scale <= 0)) throw new Error("map.scale must be positive.");
  if (map.rotation != null && (!Number.isFinite(map.rotation) || map.rotation < -360 || map.rotation > 360)) throw new Error("map.rotation is invalid.");
  if (map.offset != null && (!Array.isArray(map.offset) || map.offset.length !== 2 || !map.offset.every(Number.isFinite))) throw new Error("map.offset must contain two numbers.");
  if (config.features != null && (typeof config.features !== "object" || Array.isArray(config.features))) throw new Error("features must be an object.");
  for (const key of PANEL_FEATURES) {
    if (Object.hasOwn(config.features ?? {}, key) && typeof config.features[key] !== "boolean") {
      throw new Error(`features.${key} must be a boolean.`);
    }
  }
  if (config.color_scheme != null && !COLOR_SCHEMES.includes(config.color_scheme)) throw new Error("color_scheme is invalid.");
  if (config.icon_set != null && !ICON_SETS.includes(config.icon_set)) throw new Error("icon_set is invalid.");
  if (config.locked != null && !["auto", "never", "only_touch", "always"].includes(config.locked)) throw new Error("locked is invalid.");
  if (config.touch_lock != null && (!Number.isSafeInteger(config.touch_lock) || config.touch_lock < 100 || config.touch_lock > 400)) throw new Error("touch_lock must be 100–400.");
  if (config.disable_haptic != null && typeof config.disable_haptic !== "boolean") throw new Error("disable_haptic must be a boolean.");
  return true;
}

export async function callAction(hass, id, action, data = {}) {
  if (["entity_id", "device_id", "area_id", "floor_id", "label_id", "target"].some((key) => Object.hasOwn(data, key))) {
    throw new Error("The card configuration determines the target.");
  }
  const targetReady = action === "button.press" && typeof id === "string" && id.startsWith("button.") ? pressable : online;
  if (!ENTITY_ID.test(id) || !targetReady(hass?.states?.[id]) || !hasAction(hass, action)) {
    throw new Error("Device or action unavailable.");
  }
  const [domain, service] = action.split(".");
  await hass.callService(domain, service, data, { entity_id: id });
}

export function parseFields(fields, values) {
  const data = {};
  for (const [key, type, required] of fields) {
    const raw = values[key]?.trim();
    if (!raw && !required) continue;
    if (!raw) throw new Error("Required field · " + key);
    if (type === "text") {
      data[key] = raw;
    } else if (type === "int") {
      if (!/^-?\d+$/.test(raw) || !Number.isSafeInteger(Number(raw))) throw new Error("Expected an integer · " + key);
      data[key] = Number(raw);
    } else if (type === "bool") {
      if (!["true", "false"].includes(raw)) throw new Error("Expected a boolean · " + key);
      data[key] = raw === "true";
    } else {
      let parsed;
      try { parsed = JSON.parse(raw); } catch { throw new Error("Invalid JSON · " + key); }
      if (type === "list" ? !Array.isArray(parsed) : !parsed || typeof parsed !== "object" || Array.isArray(parsed)) {
        throw new Error("Unexpected JSON format · " + key);
      }
      data[key] = parsed;
    }
  }
  if (fields.length && !Object.keys(data).length) throw new Error("Fill in at least one field.");
  return data;
}

const BASIC = [
  ["vacuum.start", "Start", 8192],
  ["vacuum.pause", "Pause", 4],
  ["vacuum.stop", "Stop", 8],
  ["vacuum.return_to_base", "Return to dock", 16],
  ["vacuum.locate", "Locate", 512],
  [dreame("request_map"), "Refresh map"],
];

const TOOLS = [
  ["spot", "Clean a spot", dreame("clean_spot"), 1],
  ["zone", "Clean a zone", dreame("clean_zone"), 2],
  ["goto", "Go to point", dreame("goto"), 1, ([x, y]) => ({ x, y })],
];

const EDITS = [
  ["rename_map", "Rename a floor", [["map_id", "int", true], ["map_name", "text", true]]],
  ["delete_map", "Delete a floor", [["map_id", "int", true]]],
  ["save_temporary_map", "Save the new map", []],
  ["discard_temporary_map", "Discard the new map", []],
  ["replace_temporary_map", "Replace a floor with the new map", [["map_id", "int", true]]],
  ["rename_segment", "Rename a room", [["segment_id", "int", true], ["segment_name", "text", true]]],
  ["split_segments", "Split a room", [["segment", "int", true], ["line", "list", true], ["map_id", "int"]]],
  ["merge_segments", "Merge rooms", [["segments", "list", true], ["map_id", "int"]]],
  ["set_restricted_zone", "Replace virtual walls and restricted zones",
    [["walls", "list", true], ["zones", "list", true], ["no_mops", "list", true]]],
  ["set_walls", "Replace physical walls and doors", [["walls", "object"], ["doors", "list"], ["map_id", "int"]]],
  ["set_floor_material", "Floor material", [["material", "object", true], ["map_id", "int"]]],
  ["set_furniture", "Place furniture", [["furnitures", "list", true], ["map_id", "int"]]],
  ["set_custom_carpet_cleaning", "Carpet settings",
    [["id", "int", true], ["object_type", "int", true], ["carpet_cleaning", "int", true]]],
  ["set_obstacle_ignore", "Ignore or restore an obstacle",
    [["x", "int", true], ["y", "int", true], ["obstacle_ignored", "bool", true]]],
  ["set_cleaning_sequence", "Room cleaning order", [["cleaning_sequence", "list", true]]],
  ["set_custom_cleaning", "Custom room cleaning",
    [["segment_id", "list", true], ["suction_level", "list", true], ["repeats", "list", true], ["water_volume", "list"],
      ["cleaning_mode", "list"], ["wetness_level", "list"]]],
  ["backup_map", "Back up a floor", [["map_id", "int", true]]],
  ["restore_map", "Restore a backup", [["map_id", "int", true], ["recovery_map_index", "int", true]]],
  ["start_shortcut", "Run a shortcut", [["shortcut_id", "int", true]]],
  ["reset_consumable", "Reset a consumable", [["consumable", "text", true]]],
];

const STATE_LABELS = {
  docked: "Docked", cleaning: "Cleaning", paused: "Paused", returning: "Returning to dock",
  idle: "Idle", error: "Error", unavailable: "Unavailable", unknown: "Unknown state",
};

const MODE_ICONS = { goto: "map-marker-radius", room: "floor-plan", global: "home", zone: "selection-drag", spot: "square-small" };
const CONTROL_ICONS = {
  "vacuum.start": "play", "vacuum.pause": "pause", "vacuum.stop": "stop",
  "vacuum.return_to_base": "ev-station", "vacuum.locate": "map-marker", [dreame("request_map")]: "refresh",
};

const TEMPLATE = `
<style>
  :host { display:block; color:var(--primary-text-color,#151515); }
  ha-card { --accent:#0099bf; --control-bg:var(--dvc-control-bg,#e0e0e0);
    background:var(--ha-card-background,var(--card-background-color,#fff)); }
  .body.scheme-dreame-dark { --accent:#0099bf; --secondary-text-color:#bdbdbd; color:#eee; background:#1b1b1b; }
  .body.scheme-dreame-light { --accent:#0099bf; }
  .body.scheme-grayscale { --accent:#555; filter:grayscale(.85); }
  .body { position:relative; padding:16px 8px 20px; display:grid; gap:16px; }
  h2,h3,p { margin:0; }
  h2 { font-size:20px; font-weight:500; }
  h3 { font-size:1.025rem; }
  .row, #telemetry { display:flex; flex-wrap:wrap; align-items:center; gap:8px; }
  header { text-align:center; padding-inline:38px; }
  .state { color:var(--secondary-text-color,#505050); margin-top:5px; }
  #title[hidden] + .state { color:inherit; font-size:20px; font-weight:500; margin:0; }
  #telemetry { justify-content:space-evenly; width:min(100%,560px); margin:6px auto 12px; }
  #telemetry:empty, #rail:not(:has(> :not([hidden]))), #quick:empty, #modes:empty { display:none; }
  #telemetry span { display:inline-flex; align-items:center; gap:5px; font-size:20px; }
  #telemetry small { font-size:11px; color:var(--secondary-text-color,#505050); }
  .stage { display:grid; grid-template-columns:40px minmax(0,1fr) 40px; align-items:end; gap:6px; }
  .stage:has(figure[hidden]):has(#quick:is(:empty,[hidden])) { display:none; }
  figure { grid-column:2; display:grid; grid-template-columns:minmax(0,1fr); place-items:center; margin:0; overflow:hidden; }
  #map-layer { position:relative; max-width:100%; width:max-content; line-height:0; }
  #map-frame { display:contents; }
  figure.map-fit #map-frame { display:grid; place-items:center; width:100%; aspect-ratio:var(--fit-ratio, var(--map-image-ratio,1)); overflow:hidden; }
  .quarter-turn #map-frame { display:grid; place-items:center; grid-template: minmax(0,1fr) / minmax(0,1fr);
    container-type:size; width:100%; aspect-ratio:calc(1 / var(--map-image-ratio,1)); max-height:68vh; }
  .panel-mode .quarter-turn #map-frame { max-height:58vh; }
  .full-height .quarter-turn #map-frame { max-height:none; }
  figure.ratio-frame.quarter-turn { grid-template-rows:minmax(0,1fr); }
  figure.ratio-frame.quarter-turn #map-frame { height:100%; max-height:100%; aspect-ratio:auto; }
  figure.ratio-frame { width:100%; aspect-ratio:var(--map-aspect-ratio); max-height:68vh; container-type:size; }
  .panel-mode figure.ratio-frame { max-height:58vh; }
  .full-height figure.ratio-frame { max-height:none; }
  .full-height #map-layer { width:100%; }
  figure.ratio-frame #map-layer { width:min(100cqw,calc(100cqh * var(--map-image-ratio,1))); }
  :is(.full-height, .ratio-frame) #map { width:100%; max-width:100%; max-height:none; }
  figure.quarter-turn #map-layer { max-width:none; width:min(100cqh,calc(100cqw * var(--map-image-ratio,1))); }
  figure.quarter-turn #map { width:100%; max-width:none; max-height:none; }
  #map-layer #map { position:relative; opacity:var(--map-opacity,1); }
  #map-layer .map-art { position:absolute; pointer-events:none; max-width:none; max-height:none; object-fit:fill;
    transform:translate(-50%,-50%) rotate(var(--art-angle,0deg)); }
  #structured-map { position:absolute; inset:0; width:100%; height:100%; pointer-events:none; }
  #map-layer.structured #map { opacity:0; }
  #map-layer.room-picking #map { cursor:crosshair; }
  img { display:block; max-width:100%; max-height:68vh; height:auto; object-fit:contain; }
  .panel-mode img { max-width:min(100%,804px); max-height:58vh; }
  #quick { grid-column:3; display:grid; align-content:end; gap:8px; }
  .left-handed #quick { grid-column:1; grid-row:1; }
  #menu { position:absolute; top:11px; right:11px; z-index:2; border:0; padding:0; }
  #menu > summary { display:grid; place-items:center; margin-left:auto; width:36px; height:36px; list-style:none; }
  #menu > summary::-webkit-details-marker { display:none; }
  #menu > div { padding:8px; background:var(--card-background-color,#fff); border-radius:12px;
    box-shadow:0 2px 8px #0003; max-width:calc(100vw - 56px); }
  #menu > div:not([hidden]) { display:grid; }
  #modes, #basic { justify-content:center; margin-inline:auto; width:min(100%,280px); }
  .panel-mode #modes, .panel-mode #basic { width:min(100%,420px); }
  #modes { display:flex; gap:1px; padding:3px; box-sizing:border-box; border-radius:24px;
    background:var(--secondary-background-color,var(--control-bg)); box-shadow:0 1px 3px #0004; }
  #modes button { flex:1; background:none; border:0; min-width:0; min-height:30px; padding:0; }
  #modes button[aria-pressed="true"], #quick button, #basic button { background:var(--accent); color:#fff; }
  #modes button, #quick button, #basic button { border-radius:24px; border:0; }
  #quick button { width:40px; height:40px; padding:0; box-shadow:0 2px 4px #0004; }
  #basic { align-items:stretch; }
  #basic button { flex:1 1 calc(50% - 8px); min-width:0; overflow-wrap:anywhere;
    font-size:13px; font-weight:600; letter-spacing:.04em; text-transform:uppercase;
    background:#007d9d; box-shadow:0 2px 4px #0004; }
  .body:not([data-mode="global"]) #basic [data-action="vacuum.start"] { display:none; }
  button ha-icon { --mdc-icon-size:20px; vertical-align:middle; }
  #rail, #views:not([hidden]) { display:grid; gap:8px; margin-inline:8px; }
  #map-layer.picking img { cursor:crosshair; }
  .pin { pointer-events:none; position:absolute; width:12px; height:12px; transform:translate(-50%,-50%);
    border:2px solid white; border-radius:50%; background:var(--accent); box-shadow:0 0 0 1px #26352d; }
  #room-markers { position:absolute; inset:0; pointer-events:none; opacity:var(--map-object-opacity,1); }
  #zone-overlay, #zone-overlay svg { position:absolute; inset:0; width:100%; height:100%; pointer-events:none; }
  #zone-overlay polygon { fill:var(--map-active-area,#008dc53a); stroke:#006ab6; stroke-width:2;
    vector-effect:non-scaling-stroke; stroke-dasharray:5 3; }
  #zone-overlay button { position:absolute; transform:translate(-50%,-50%) rotate(var(--map-counter-rotation,0deg)); pointer-events:auto;
    touch-action:none; cursor:grab; width:28px; height:28px; min-height:0; padding:0;
    border:2px solid #006ab6; border-radius:50%; color:#00588b; background:white; }
  #zone-list:empty { display:none; }
  #dock-dialog { position:fixed; inset:auto 0 0; box-sizing:border-box; width:min(100%,460px); max-height:80vh;
    border:1px solid var(--divider-color,#d9d9d9); border-radius:20px 20px 0 0; padding:16px;
    color:inherit; background:var(--card-background-color,#fff); }
  #dock-dialog::backdrop { background:#0006; }
  #floor-dialog { color:inherit; background:var(--card-background-color,#fff); border:1px solid var(--divider-color,#ddd);
    border-radius:16px; max-width:calc(100% - 32px); }
  #floor-dialog::backdrop { background:#0006; }
  #obstacle-dialog { color:inherit; background:var(--card-background-color,#fff); border:0;
    border-radius:16px; width:min(520px,calc(100vw - 48px)); }
  #obstacle-dialog::backdrop { background:#0008; backdrop-filter:blur(4px); }
  #obstacle-dialog header { display:flex; justify-content:space-between; align-items:center; gap:8px; padding:0; text-align:start; }
  #obstacle-photo { width:100%; max-height:70dvh; object-fit:contain; }
  #obstacle-no-photo { display:grid; place-items:center; min-height:160px; color:var(--secondary-text-color,#555); }
  @media (max-width:600px) {
    #obstacle-dialog { margin:auto auto 0; border-radius:16px 16px 0 0; }
  }
  #dock-dialog header { display:flex; align-items:center; justify-content:space-between; padding:0; }
  .dock-status, .dock-actions { display:grid; grid-template-columns:repeat(2,minmax(0,1fr)); gap:12px; margin:12px 0; }
  .dock-actions { grid-template-columns:repeat(auto-fit,minmax(80px,1fr)); }
  .dock-actions button { display:grid; place-items:center; gap:5px; border-radius:16px; background:#007d9d; color:white; }
  .history-row { padding:12px 8px; border-bottom:1px solid var(--divider-color,#ddd); }
  .history-row small { display:block; color:var(--secondary-text-color,#555); }
  .consumable { display:grid; grid-template-columns:1fr auto; gap:4px 12px; }
  .consumable progress { grid-column:1/-1; width:100%; accent-color:var(--accent); }
  .consumable progress.low { accent-color:#bd5b00; }
  #object-summary { display:flex; flex-wrap:wrap; gap:6px; margin:8px 0; }
  #object-summary span { padding:5px 9px; border-radius:14px; background:var(--secondary-background-color,#edf0f0); font-size:12px; }
  #editor-detail, #schedule-detail, #shortcut-detail, #cleaning-detail { border-top:1px solid var(--divider-color,#ddd); padding-top:10px; }
  #editor-detail form, #schedule-detail form, #shortcut-detail form { display:grid; gap:8px; }
  .setting-row { display:grid; gap:6px; margin-bottom:12px; }
  .setting-label { font-size:13px; font-weight:500; color:var(--secondary-text-color,#666); }
  .setting-group { display:flex; gap:4px; background:var(--secondary-background-color,#f0f0f0); border-radius:12px; padding:3px; }
  .setting-btn { flex:1; display:flex; align-items:center; justify-content:center; gap:4px; padding:8px;
    border:0; border-radius:10px; background:transparent; color:inherit; cursor:pointer; font:inherit; font-size:12px; }
  .setting-btn[aria-pressed="true"] { background:var(--primary-color,#00bcd4); color:white; }
  .setting-slider { width:100%; accent-color:var(--primary-color,#00bcd4); }
  #editor-detail input[type=url] { width:100%; }
  .remote-live { display:grid; grid-template-columns:1fr 1fr; gap:10px; }
  .remote-live input { width:100%; }
  #room-markers button { position:absolute; transform:translate(-50%,-50%) rotate(var(--map-counter-rotation,0deg)); pointer-events:auto;
    border-radius:20px; border:2px solid white; background:#253e59; color:white;
    min-height:32px; max-width:85%; overflow:hidden; text-overflow:ellipsis; white-space:nowrap; line-height:1.2; }
  #room-markers button[aria-pressed="true"] { background:#007d9d; z-index:1; }
  #room-markers button[data-order]::before { content:attr(data-order) " · "; }
  #room-markers :is(.room-icon, .room-order, .room-check) { display:none; }
  .structured #room-markers button { display:flex; align-items:center; gap:4px; overflow:visible;
    background:var(--map-icon-background,var(--room-color)); color:var(--map-text,#162b40); border:0; padding:4px 9px;
    font-size:var(--map-font-size, 12px); font-weight:600;
    scale:var(--map-object-scale, 1); }
  .structured #room-markers .room-label { min-width:0; overflow:hidden; text-overflow:ellipsis; }
  .structured #room-markers .room-icon { display:block; flex:none; --mdc-icon-size:15px; width:15px; height:15px; }
  .structured #room-markers button[aria-pressed="true"] { background:#fff; color:#162b40; }
  .structured #room-markers button[aria-pressed="true"] .room-check { display:grid; place-items:center; flex:none;
    width:16px; height:16px; border-radius:50%; background:var(--room-color); font-size:12px; line-height:1; }
  .structured #room-markers button[data-order]::before { content:none; }
  .structured #room-markers button[data-order]::after { content:""; position:absolute; bottom:-4px; left:calc(50% - 4px);
    width:8px; height:8px; background:#fff; transform:rotate(45deg); }
  .structured #room-markers .room-order { display:grid; place-items:center; position:absolute; bottom:calc(100% + 4px);
    left:50%; transform:translateX(-50%); min-width:26px; height:26px; box-sizing:border-box; padding:0 4px;
    border:2px solid white; border-radius:999px; background:var(--room-color);
    font-size:14px; font-weight:700; font-variant-numeric:tabular-nums; }
  #map-layer.hide-room-name .room-label, #map-layer.hide-room-order .room-order { display:none; }
  #map-layer.hide-room-order #room-markers button[data-order]::before { content:none; }
  #map-layer.hide-room-background #room-markers button { background:transparent; border-color:transparent; }
  #map-layer.hide-room-background #room-markers button[data-order]::after { content:none; }
  #map-layer.hide-room-name #room-markers .room-icon { display:block; }
  #object-markers { position:absolute; inset:0; pointer-events:none; opacity:var(--map-object-opacity,1); }
  #object-markers button { position:absolute; transform:translate(-50%,-50%) rotate(var(--map-counter-rotation,0deg)); pointer-events:auto; min-height:28px;
    padding:4px 8px; border:2px solid white; border-radius:16px; background:#7b5bad; color:white;
    font-size:var(--map-font-size, 11px); scale:var(--map-object-scale, 1); }
  #object-markers button[aria-pressed="true"] { background:#007d9d; }
  #object-markers button:has(.obstacle-label) { display:flex; align-items:center; gap:4px; padding:4px; }
  #object-markers button[aria-pressed="false"] .obstacle-label { display:none; }
  .simple-obstacle #object-markers button[aria-pressed="false"]:has(.obstacle-label) {
    width:28px; height:28px; justify-content:center; border:0; border-radius:50%; }
  #object-markers button ha-icon { --mdc-icon-size:16px; width:16px; height:16px; }
  #map-objects, #map-objects svg { position:absolute; inset:0; width:100%; height:100%; pointer-events:none; }
  #map-objects polygon, #map-objects line { vector-effect:non-scaling-stroke; }
  #map-objects .wall { stroke:var(--map-virtual-wall,#0b8fe3); stroke-width:4; }
  #map-objects .physical-wall { stroke:var(--map-wall,#47566a); stroke-width:3; opacity:var(--map-opacity,1); }
  .scheme-dreame-dark #map-objects .physical-wall { stroke:var(--map-wall,#96a6bb); }
  #map-objects .threshold { stroke:#8c6b2f; stroke-width:3; stroke-dasharray:5 3; }
  #map-objects .door { stroke:#b65b52; stroke-width:2; stroke-linecap:round; }
  .scheme-dreame-dark #map-objects .door { stroke:#f0a496; }
  #map-objects .restricted { fill:var(--map-no-go,#d9464630); stroke:#d94646; stroke-width:2; }
  #map-objects .restricted.mop { fill:var(--map-no-mop,#d9464630); }
  #map-objects .draft { stroke-dasharray:5 3; }
  #map-objects .selected-restriction { stroke:#007d9d; stroke-width:3; }
  #map-objects .removal { stroke:#c52031; stroke-dasharray:5 3; }
  #map-objects .carpet { fill:var(--map-carpet,#f4cf4d30); stroke:#d8a600; stroke-width:2; }
  details { border-top:1px solid var(--divider-color,#aebcb5); padding:10px 0 0; }
  details > div, form { display:grid; gap:10px; margin-top:10px; }
  summary { cursor:pointer; font-weight:600; }
  button,input,select { font:inherit; color:inherit; box-sizing:border-box; max-width:100%; }
  button, input, select { border:1px solid var(--divider-color,#aebcb5); border-radius:8px;
    background:var(--card-background-color,white); padding:7px 10px; min-height:36px; }
  button { cursor:pointer; }
  button.primary { color:var(--text-primary-color,white); background:var(--accent); border-color:var(--accent); }
  button:disabled { opacity:.55; cursor:default; }
  button:focus-visible, input:focus-visible, select:focus-visible, summary:focus-visible { outline:2px solid var(--accent); outline-offset:2px; }
  label { display:flex; flex-wrap:wrap; align-items:center; gap:8px; min-height:32px; overflow-wrap:anywhere; }
  input[type=number] { width:8rem; }
  output { display:block; margin-inline:8px; }
  output:empty { position:absolute; width:1px; height:1px; overflow:hidden; }
  output[data-error] { color:var(--error-color,#a62222); }
  [hidden] { display:none !important; }
</style>
<ha-card><div class="body" lang="en">
  <header id="home-header"><h2 id="title"></h2><p class="state" id="state"></p></header>
  <details id="menu"><summary aria-label="Menu"><ha-icon icon="mdi:dots-vertical" aria-hidden="true"></ha-icon></summary><div id="menu-items"></div></details>
  <div id="telemetry"></div>
  <div class="stage">
    <figure id="figure" hidden><div id="map-frame"><div id="map-layer">
      <img id="map-background" class="map-art" alt="" hidden>
      <img id="map" alt="Robot map"><canvas id="structured-map" aria-hidden="true" hidden></canvas>
      <img id="map-foreground" class="map-art" alt="" hidden>
      <div id="map-objects" hidden></div><div id="room-markers" hidden></div><div id="object-markers" hidden></div><div id="zone-overlay" hidden></div>
    </div></div></figure>
    <div id="quick"></div>
  </div>
  <div id="modes" role="group" aria-label="Cleaning mode"></div>
  <div class="row" id="basic" aria-label="Vacuum controls"></div>
  <div id="rail">
    <div id="rooms" hidden></div>
    <div id="tools" hidden></div>
    <div id="floors" hidden></div>
  </div>
  <div id="views" hidden>
    <details id="cleaning-detail" hidden><summary data-i18n>Cleaning settings</summary><div id="cleaning-settings"></div></details>
  <details id="settings-detail"><summary data-i18n>Settings, dock and maintenance</summary><div id="settings"></div>
      <details hidden><summary data-i18n>Shortcuts</summary><div id="device-shortcuts"></div></details>
    </details>
  <details id="photos-detail" hidden><summary data-i18n>History and photos</summary><div id="photos"></div></details>
  <details id="maintenance-detail" hidden><summary data-i18n>Accessory usage</summary><div id="maintenance"></div></details>
  <details id="objects-detail" hidden><summary data-i18n>Map objects</summary><div id="objects"></div></details>
  <details id="editor-detail" hidden><summary data-i18n>Map editor</summary><div id="editor"></div></details>
  <details id="schedule-detail" hidden><summary data-i18n>Schedules</summary><div id="schedules"></div></details>
  <details id="shortcut-detail" hidden><summary data-i18n>Shortcuts</summary><div id="shortcuts"></div></details>
  <details id="remote-detail" hidden><summary data-i18n>Step-by-step remote control</summary><div id="remote"></div></details>
  <details id="edit-detail" hidden><summary data-i18n>Map editing and management</summary><div id="edit"></div></details>
  </div>
  <output id="result" role="status" aria-live="polite"></output>
  <dialog id="dock-dialog" aria-labelledby="dock-heading">
    <header><h2 id="dock-heading" data-i18n>Dock controls</h2><form method="dialog"><button data-i18n>Close</button></form></header>
    <div id="dock-content"></div>
    <output id="dock-result" role="status"></output>
  </dialog>
  <dialog id="floor-dialog" aria-labelledby="floor-heading">
    <h2 id="floor-heading" data-i18n>Confirm floor change</h2>
    <p id="floor-warning"></p>
    <form method="dialog" class="row">
      <button value="cancel" autofocus data-i18n>Cancel</button>
      <button value="confirm" class="primary" data-i18n>Switch floor</button>
    </form>
  </dialog>
  <dialog id="obstacle-dialog" aria-labelledby="obstacle-heading">
    <header><h2 id="obstacle-heading"></h2><form method="dialog"><button data-i18n>Close</button></form></header>
    <img id="obstacle-photo" alt="" hidden>
    <p id="obstacle-no-photo" data-i18n>No obstacle photo available</p>
  </dialog>
</div></ha-card>`;

function element(tag, text, attrs = {}) {
  const node = document.createElement(tag);
  if (text != null) node.textContent = text;
  for (const [name, value] of Object.entries(attrs)) node.setAttribute(name, value);
  return node;
}

const icon = (name) => element("ha-icon", null, { icon: `mdi:${name}`, "aria-hidden": "true" });
const caption = (state, id) => state?.attributes?.friendly_name || id;

class DreameOpenCard extends (globalThis.HTMLElement ?? class {}) {
  constructor() {
    super();
    this.attachShadow({ mode: "open" }).innerHTML = TEMPLATE;
    this.sections = new Map();
    this.language = "en";
    this.mode = "global";
    this.picks = [];
    this.zones = [];
    this.roomSelection = new Set();
    this.objectSelection = null;
    this.editPickMode = null;
    this.pending = new Set();
    const map = this.part("map");
    map.addEventListener("click", (event) => this.pickOnMap(event));
    this.part("editor-detail").addEventListener("toggle", () => this.renderMapObjectLayers());
    this.part("floor-dialog").addEventListener("close", () => this.confirmFloorChange());
    const obstacleDialog = this.part("obstacle-dialog");
    const obstaclePhoto = this.part("obstacle-photo");
    obstacleDialog.addEventListener("close", () => {
      if (!obstacleDialog.open) obstaclePhoto.removeAttribute("src");
    });
    obstaclePhoto.addEventListener("load", () => { obstaclePhoto.hidden = false; });
    obstaclePhoto.addEventListener("error", () => {
      obstaclePhoto.hidden = true;
      this.part("obstacle-no-photo").hidden = false;
    });
    for (const event of ["load", "error"]) map.addEventListener(event, () => {
      this.renderStructuredMap();
      this.renderRoomMarkers();
      this.renderObjectMarkers();
      this.renderMapObjectLayers();
      this.renderZones();
    });
    const overlay = this.part("zone-overlay");
    overlay.addEventListener("pointermove", (event) => this.dragZone(event));
    overlay.addEventListener("lostpointercapture", () => {
      this.zoneDrag = null;
      this.updateTargetButton();
    });
  }

  part(id) { return this.shadowRoot.getElementById(id); }

  connectedCallback() { this.update(); }

  disconnectedCallback() {
    this.sceneRequest?.abort();
    this.sceneRequest = null;
    this.sceneKey = null;
    this.mapScene = null;
  }

  t(message) { return translate(this.language, message); }

  updateLanguage() {
    const language = languageFor(this.ha);
    if (language === this.language) return;
    this.language = language;
    this.sections.clear();
    this.shadowRoot.querySelector(".body").lang = language;
    this.part("basic").setAttribute("aria-label", this.t("Vacuum controls"));
    this.part("modes").setAttribute("aria-label", this.t("Cleaning mode"));
    this.part("map").alt = this.t("Robot map");
    for (const summary of this.shadowRoot.querySelectorAll("[data-i18n]")) {
      const message = summary.dataset.i18n || summary.textContent;
      summary.dataset.i18n = message;
      summary.textContent = this.t(message);
    }
    const output = this.part("result");
    if (this.statusMessage) output.textContent = this.t(this.statusMessage);
  }

  setConfig(config) {
    if (!/^vacuum\.[a-z0-9_]+$/.test(config.entity ?? "")) throw new Error(this.t("Configure a vacuum entity."));
    if (config.map_camera != null && !/^camera\.[a-z0-9_]+$/.test(config.map_camera)) {
      throw new Error(this.t("map_camera must be a camera entity."));
    }
    if (config.entities != null && (!Array.isArray(config.entities) || config.entities.some((id) => !ENTITY_ID.test(id)))) {
      throw new Error(this.t("entities must contain entity IDs."));
    }
    validateCardConfig(config);
    this.config = config;
    this.mode = "global";
    this.shadowRoot.querySelector(".body").classList.toggle("panel-mode", config.mode === "panel");
    const scheme = config.color_scheme ?? "dreame_light";
    const body = this.shadowRoot.querySelector(".body");
    body.classList.toggle("left-handed", config.left_handed === true);
    body.classList.toggle("full-height", config.full_height === true);
    const figure = this.part("figure");
    figure.classList.toggle("ratio-frame", config.aspect_ratio != null);
    figure.style.setProperty("--map-aspect-ratio", String(config.aspect_ratio ?? ""));
    this.applyHomeVisibility(config.hidden_card_objects ?? []);
    body.classList.remove("scheme-dreame-dark", "scheme-dreame-light", "scheme-grayscale");
    body.classList.add(`scheme-${scheme === "dreame_dark" ? "dreame-dark" : scheme === "grayscale" ? "grayscale" : "dreame-light"}`);
    this.sections.clear();
    this.scope = undefined;
    this.clearPicks();
    this.update();
  }

  applyHomeVisibility(hiddenObjects) {
    const hidden = new Set(hiddenObjects);
    const targets = {
      title: "title", state: "state", status: "telemetry", menu: "menu",
      task_type: "modes", controls: "basic", action_buttons: "quick",
    };
    for (const [key, id] of Object.entries(targets)) this.part(id).hidden = hidden.has(key);
    if (hidden.has("controls")) this.part("modes").hidden = true;
    this.part("home-header").hidden = hidden.has("title") && hidden.has("state");
    if (hidden.has("menu")) this.part("menu").open = false;
  }

  static getStubConfig(hass) {
    const entity = Object.keys(hass.states).find((id) => id.startsWith("vacuum."));
    return entity ? { entity } : {};
  }

  getCardSize() { return this.config?.map_camera || !this.part("figure").hidden ? 8 : 4; }

  set hass(hass) {
    this.ha = hass;
    this.update();
  }

  section(id, signature, render) {
    const key = JSON.stringify(signature);
    if (this.sections.get(id) !== key) {
      this.sections.set(id, key);
      render(this.part(id));
    }
  }

  button(text, fn, disabled = false, primary = false) {
    const btn = element("button", text, { type: "button" });
    btn.disabled = disabled;
    if (primary) btn.className = "primary";
    btn.addEventListener("click", fn);
    return btn;
  }

  iconButton(label, name, onClick, { disabled = false, iconOnly = false } = {}) {
    const text = this.t(label);
    const button = this.button(iconOnly ? null : " " + text, onClick, disabled);
    button.prepend(icon(name));
    if (iconOnly) {
      button.setAttribute("aria-label", text);
      button.title = text;
    }
    return button;
  }

  renderTelemetry(attrs) {
    const ids = deviceEntities(this.ha, this.config);
    const metrics = [
      ["Cleaned area", "texture-box", "cleaned_area", attrs.cleaned_area, "m²"],
      ["Cleaning time", "timer", "cleaning_time", attrs.cleaning_time, this.t("min")],
      ["Battery", "battery", "battery", attrs.battery_level ?? attrs.battery, "%"],
    ];
    for (const metric of metrics) {
      const [, , key] = metric;
      const id = ids.find((id) => id.startsWith("sensor.") &&
        (this.ha.entities?.[id]?.translation_key === key || id.endsWith(`_${key}`)));
      const sensor = this.ha.states[id];
      if (online(sensor)) {
        metric[3] = sensor.state;
        metric[4] = sensor.attributes?.unit_of_measurement ?? metric[4];
      }
    }
    this.section("telemetry", metrics, (node) => node.replaceChildren(...metrics.flatMap(([label, name, , reading, unit]) => {
      if (!/^\d+(?:\.\d+)?$/.test(String(reading))) return [];
      const metric = element("span", null, { role: "img", "aria-label": `${this.t(label)}: ${reading} ${unit}` });
      metric.append(icon(name), String(reading), element("small", unit));
      return [metric];
    })));
  }

  selectMode(mode) {
    const changed = this.mode !== mode;
    this.mode = mode;
    if (changed && this.editPickMode) this.cancelRestrictionEdit();
    else if (changed) this.clearPicks();
    this.shadowRoot.querySelector(".body").dataset.mode = mode;
    this.part("rooms").hidden = mode !== "room";
    this.part("tools").hidden = mode === "global" || mode === "room";
    if (this.toolSelect && !this.part("tools").hidden && this.toolSelect.value !== mode) {
      this.toolSelect.value = mode;
      this.toolSelect.dispatchEvent(new Event("change"));
    }
    for (const button of this.part("modes").children) {
      button.setAttribute("aria-pressed", String(button.dataset.mode === mode));
    }
    this.part("map-layer").classList.toggle("picking", this.mapPicking && !this.part("tools").hidden);
    this.part("map-layer").classList.toggle("room-picking", Boolean(this.structuredVisible && mode === "room"));
    this.renderRoomMarkers();
    this.renderObjectMarkers();
    this.renderMapObjectLayers();
    this.renderZones();
    this.updateTargetButton();
  }

  renderNavigation(hasRooms, tools, available) {
    const modes = [["goto", "Go to point"], ["room", "Rooms"], ["global", "Global cleaning"],
      ["zone", "Clean a zone"], ["spot", "Clean a spot"]].filter(([mode]) =>
      mode === "global" || (mode === "room" ? hasRooms : tools.some(([key]) => key === mode)));
    this.section("modes", [modes, available], (node) => {
      node.replaceChildren(...modes.map(([mode, label]) => {
        const button = this.iconButton(label, MODE_ICONS[mode], () => this.selectMode(mode), { disabled: !available, iconOnly: true });
        button.dataset.mode = mode;
        return button;
      }));
    });
    this.selectMode(modes.some(([mode]) => mode === this.mode) ? this.mode : "global");
  }

  toggleRoom(id, selected) {
    if (selected) this.roomSelection.add(id);
    else this.roomSelection.delete(id);
    this.syncRoomSelection();
  }

  syncRoomSelection() {
    const ids = [...this.roomSelection];
    for (const box of this.part("rooms").querySelectorAll("input")) box.checked = this.roomSelection.has(Number(box.value));
    for (const marker of this.part("room-markers").children) {
      const order = ids.indexOf(Number(marker.dataset.room)) + 1;
      marker.setAttribute("aria-pressed", String(order > 0));
      const badge = marker.querySelector(".room-order");
      badge.hidden = !order;
      badge.textContent = order || "";
      if (order) marker.dataset.order = order;
      else delete marker.dataset.order;
    }
    if (this.structuredVisible && this.config.override_colors) this.renderStructuredMap();
    this.updateTargetButton();
  }

  renderRoomMarkers() {
    const img = this.part("map");
    const target = this.part("room-markers");
    target.hidden = this.mode !== "room" || !this.mapPicking || !img.complete || !img.naturalWidth;
    if (target.hidden) return;
    const markers = this.markerRooms.flatMap(([id, room, label]) => {
      // shortcut: anchor badges to the bounds center until segment label coordinates are available.
      const position = roomMarkerPosition(this.calibration, room, img.naturalWidth, img.naturalHeight);
      const symbol = typeof room.icon === "string" && /^mdi:[a-z0-9-]+$/.test(room.icon) ? room.icon.slice(4) : "floor-plan";
      return position ? [[id, label, symbol, ...position]] : [];
    });
    this.section("room-markers", markers, (node) => node.replaceChildren(...markers.map(([id, label, symbol, x, y]) => {
      const button = this.button(null, () => this.toggleRoom(id, !this.roomSelection.has(id)));
      button.setAttribute("aria-label", label);
      const roomIcon = icon(symbol);
      roomIcon.className = "room-icon";
      button.append(element("span", "✓", { class: "room-check", "aria-hidden": "true" }),
        roomIcon, element("span", label, { class: "room-label" }),
        element("span", null, { class: "room-order", "aria-hidden": "true" }));
      button.dataset.room = id;
      button.style.left = `${x * 100}%`;
      button.style.top = `${y * 100}%`;
      button.style.setProperty("--room-color", roomColor(id, ROOM_COLORS.light));
      return button;
    })));
    this.syncRoomSelection();
  }

  renderObjectMarkers() {
    const img = this.part("map");
    const target = this.part("object-markers");
    const hidden = new Set(mapPresentation(this.config, this.mapIndex).hidden_objects ?? []);
    const hiddenByKind = { obstacles: "obstacle", carpets: "carpet", furniture: "furniture" };
    const markers = mapObjectMarkers(this.currentMap, this.calibration, img.naturalWidth, img.naturalHeight)
      .filter(({ kind }) => !hidden.has(hiddenByKind[kind]));
    target.hidden = !this.mapPicking || !img.complete || !img.naturalWidth || !markers.length;
    if (target.hidden) return;
    const furnitureIcons = hidden.has("furniture_image");
    this.section("object-markers", [markers, furnitureIcons], (node) => node.replaceChildren(...markers.map((marker) => {
      const obstacle = marker.kind === "obstacles";
      const furnitureIcon = marker.kind === "furniture" && furnitureIcons;
      const button = this.button(obstacle || furnitureIcon ? null : marker.label, () => {
        if (obstacle && button.getAttribute("aria-pressed") === "true") return this.openObstacle(marker);
        this.objectSelection = marker;
        for (const sibling of node.children) sibling.setAttribute("aria-pressed", String(sibling === button));
        this.renderObjectEditor();
      });
      if (obstacle) {
        button.setAttribute("aria-label", marker.label);
        button.append(icon("alert-circle-outline"), element("span", marker.label, { class: "obstacle-label" }));
      } else if (furnitureIcon) {
        button.setAttribute("aria-label", marker.label);
        button.append(icon("sofa-outline"));
      }
      button.dataset.object = `${marker.kind}:${marker.key}`;
      button.setAttribute("aria-pressed", String(this.objectSelection?.kind === marker.kind && this.objectSelection?.key === marker.key));
      button.style.left = `${marker.x * 100}%`;
      button.style.top = `${marker.y * 100}%`;
      return button;
    })));
  }

  openObstacle(marker) {
    const dialog = this.part("obstacle-dialog");
    if (dialog.open) return;
    const photos = Object.entries(this.currentMap.obstacle_picture ?? {}).filter(([name]) => name.startsWith(`${marker.key}:`));
    const url = photos.length === 1 ? localImage(photos[0][1]) : null;
    const photo = this.part("obstacle-photo");
    const matchesCamera = url?.split("?", 1)[0] === `/api/camera_map_obstacle_proxy/${this.mapCamera}`;
    this.part("obstacle-heading").textContent = marker.label;
    photo.hidden = true;
    this.part("obstacle-no-photo").hidden = matchesCamera;
    if (matchesCamera) photo.src = url;
    else photo.removeAttribute("src");
    dialog.showModal();
  }

  renderMapObjectLayers() {
    const img = this.part("map");
    const layer = this.part("map-objects");
    const attrs = this.currentMap ?? {};
    const presentation = mapPresentation(this.config, this.mapIndex);
    const namespace = "http://www.w3.org/2000/svg";
    const project = (point) => {
      const result = projectPoint(this.calibration, point, "vacuum", "map");
      const position = result && [result[0] / img.naturalWidth, result[1] / img.naturalHeight];
      return position?.every((axis) => axis >= 0 && axis <= 1) ? position : null;
    };
    const rectangles = (value, className, field) => (Array.isArray(value) ? value : []).flatMap((area, index) => {
      const row = rectangleCoordinates(area);
      if (!row) return [];
      const points = [[row[0], row[1]], [row[2], row[1]], [row[2], row[3]], [row[0], row[3]]].map(project);
      const selected = field === this.editPickMode && index === this.editIndex;
      const style = selected ? `${className} selected-restriction${this.editRemove ? " removal" : ""}` : className;
      return points.every(Boolean) ? [{ className: style, points }] : [];
    });
    const wallLines = (value, className) => (Array.isArray(value) ? value : []).flatMap((line) => {
      const row = lineCoordinates(Array.isArray(line) ? line.slice(0, 4) : line);
      if (!row) return [];
      const start = project(row.slice(0, 2)); const end = project(row.slice(2, 4));
      return start && end ? [{ className, start, end }] : [];
    });
    const hidden = new Set(presentation.hidden_objects ?? []);
    const editor = this.part("editor-detail");
    const polygons = RESTRICTION_LISTS
      .filter(({ field }) => (editor.open && !editor.hidden) || !hidden.has(field === "zones" ? "no_go" : "no_mop"))
      .flatMap(({ field, attr }) => rectangles(attrs[attr], field === "no_mops" ? "restricted mop" : "restricted", field));
    if (!hidden.has("carpet")) polygons.push(...rectangles(attrs.carpets, "carpet"));
    if (this.editPickMode && this.picks.length === 2) {
      const draft = mapArea(...this.picks.map(({ coords }) => coords));
      polygons.push(...rectangles([draft], this.editPickMode === "no_mops" ? "restricted mop draft" : "restricted draft"));
    }
    const lines = [
      ...(this.structuredVisible && this.config.map_display === "floor_plan" && !hidden.has("walls")
        ? wallLines(this.mapScene.walls, "physical-wall") : []),
      ...(hidden.has("virtual_wall") ? [] : wallLines(attrs.virtual_walls, "wall")),
      ...(hidden.has("virtual_threshold") ? [] : wallLines(attrs.virtual_thresholds, "threshold")),
      ...(hidden.has("passable_threshold") ? [] : wallLines(attrs.passable_thresholds, "threshold")),
      ...(hidden.has("impassable_threshold") ? [] : wallLines(attrs.impassable_thresholds, "threshold")),
      ...(hidden.has("doors") ? [] : wallLines(this.structuredVisible ? this.mapScene.doors : null, "door")),
    ];
    layer.hidden = !this.mapPicking || !img.complete || !img.naturalWidth || (!polygons.length && !lines.length);
    if (layer.hidden) return;
    this.section("map-objects", [polygons, lines, presentation], (node) => {
      const svg = document.createElementNS(namespace, "svg");
      svg.setAttribute("viewBox", "0 0 100 100"); svg.setAttribute("preserveAspectRatio", "none"); svg.setAttribute("aria-hidden", "true");
      for (const { className, points } of polygons) {
        const shape = document.createElementNS(namespace, "polygon");
        shape.setAttribute("class", className); shape.setAttribute("points", points.map(([x, y]) => `${x * 100},${y * 100}`).join(" ")); svg.append(shape);
      }
      for (const { className, start, end } of lines) {
        const line = document.createElementNS(namespace, "line");
        line.setAttribute("class", className); line.setAttribute("x1", start[0] * 100); line.setAttribute("y1", start[1] * 100); line.setAttribute("x2", end[0] * 100); line.setAttribute("y2", end[1] * 100); svg.append(line);
      }
      node.replaceChildren(svg);
    });
  }

  renderObjectEditor() {
    const editor = this.part("editor");
    const canRestricted = this.canEditRestrictions();
    const enabled = this.config.features?.editing !== false && (this.objectSelection || canRestricted);
    this.part("editor-detail").hidden = !enabled;
    if (!enabled) return;
    const signature = JSON.stringify([this.objectSelection, canRestricted, this.restrictions,
      this.editPickMode, this.editIndex, this.editRemove, this.picks]);
    if (editor.dataset.signature === signature) return;
    editor.dataset.signature = signature;
    editor.replaceChildren();
    if (this.objectSelection) {
      editor.append(element("p", `${this.t("Map objects")}: ${this.objectSelection.label}`));
    }
    if (!canRestricted) return;
    const snapshot = this.restrictions;
    editor.append(this.restrictionControls(snapshot));
    if (this.editPickMode && (this.editRemove || this.picks.length === 2)) this.renderRestrictionConfirmation(editor);
  }

  restrictionControls(snapshot) {
    const actions = element("div", null, { class: "row" });
    const lists = JSON.parse(snapshot);
    for (const { field, label, add } of RESTRICTION_LISTS) {
      actions.append(this.button(this.t(add), () => this.startRestrictionEdit(field, null, snapshot)));
      lists[field].forEach((_, index) => {
        const button = this.button(`${this.t(label)} ${index + 1}`, () => this.startRestrictionEdit(field, index, snapshot));
        button.setAttribute("aria-pressed", String(field === this.editPickMode && index === this.editIndex));
        actions.append(button);
      });
    }
    if (this.editPickMode && this.editIndex != null && !this.editRemove) {
      actions.append(this.button(this.t("Remove area"), () => {
        this.editRemove = true;
        this.clearPicks();
        this.renderObjectEditor();
        this.status("Confirm removal of the selected area.");
      }));
    }
    if (this.editPickMode) actions.append(this.button(this.t("Clear"), () => this.cancelRestrictionEdit()));
    return actions;
  }

  startRestrictionEdit(field, index, snapshot) {
    if (!this.canEditRestrictions(snapshot)) return;
    this.editPickMode = field;
    this.editIndex = index;
    this.editRemove = false;
    this.editSnapshot = snapshot;
    this.part("editor-detail").open = true;
    this.clearPicks();
    this.renderObjectEditor();
    this.status(index === null ? "Choose two opposite corners for each zone." : "Select two new corners to resize this area.");
  }

  cancelRestrictionEdit() {
    this.resetRestrictionDraft();
    this.clearPicks();
    this.renderObjectEditor();
  }

  resetRestrictionDraft() {
    this.editPickMode = null;
    this.editIndex = null;
    this.editRemove = false;
    this.editSnapshot = null;
  }

  renderRestrictionConfirmation(editor) {
    const snapshot = this.editSnapshot;
    const field = this.editPickMode, index = this.editIndex;
    const corners = this.editRemove ? undefined : this.picks.map(({ coords }) => coords);
    const confirm = element("input", null, { type: "checkbox" });
    const apply = this.button(this.t("Apply map object"), async () => {
      if (!confirm.checked || !apply.isConnected || snapshot !== this.editSnapshot || !this.canEditRestrictions(snapshot)) return;
      try {
        const payload = editRestriction(snapshot, this.restrictions, field, { index, corners });
        await this.writeRestrictions(snapshot, payload);
      } catch (error) { this.status(error.message, true); }
    }, true);
    confirm.addEventListener("change", () => { apply.disabled = !confirm.checked; });
    editor.append(this.label(this.t("Confirm this action on the robot"), confirm), apply);
  }

  canEditRestrictions(snapshot = this.restrictions) {
    return Boolean(snapshot && snapshot === this.restrictions && this.mapPicking && !this.pendingFloor && !this.pendingRestriction
      && this.config.features?.editing !== false && hasAction(this.ha, dreame("set_restricted_zone")));
  }

  async writeRestrictions(snapshot, payload) {
    if (!this.canEditRestrictions(snapshot)) return;
    const { floor } = JSON.parse(snapshot);
    const expected = restrictionSnapshot({
      virtual_walls: payload.walls, no_go_areas: payload.zones, no_mopping_areas: payload.no_mops,
    }, floor, floor);
    const pending = { expected, finished: false };
    this.pendingRestriction = pending;
    this.cancelRestrictionEdit();
    this.update();
    const sent = await this.run(dreame("set_restricted_zone"), payload);
    pending.finished = true;
    this.update();
    if (sent && this.pendingRestriction === pending) this.status("Waiting for the camera to confirm the map edit.");
  }

  async switchFloor(floor, activeFloor) {
    if (this.pendingFloor || this.pendingRestriction || String(floor) === String(activeFloor)) return;
    const vacuum = this.ha.states[this.config.entity];
    const maps = vacuum?.attributes?.maps;
    if (!online(vacuum) || !hasAction(this.ha, dreame("select_map"))
      || !Array.isArray(maps) || !maps.some((map) => Number(map?.id) === floor)) return;
    this.pendingFloor = floor;
    this.cancelRestrictionEdit();
    this.update();
    const sent = await this.run(dreame("select_map"), { map_id: floor });
    if (!sent && this.pendingFloor === floor) {
      this.pendingFloor = null;
      this.update();
    }
  }

  requestFloorChange(floor, activeFloor, label) {
    if (this.pendingFloor || this.pendingRestriction || String(floor) === String(activeFloor)) return;
    if (this.config.hidden_card_objects?.includes("map_change_confirmation")) return this.switchFloor(floor, activeFloor);
    const dialog = this.part("floor-dialog");
    if (dialog.open) return;
    this.floorChangePrompt = { floor, activeFloor, entity: this.config.entity };
    this.part("floor-warning").textContent = label;
    dialog.returnValue = "";
    dialog.showModal();
  }

  confirmFloorChange() {
    const prompt = this.floorChangePrompt;
    this.floorChangePrompt = null;
    if (!prompt || this.part("floor-dialog").returnValue !== "confirm" || prompt.entity !== this.config.entity) return;
    const activeFloor = this.ha.states[prompt.entity]?.attributes?.selected_map_id;
    if (String(activeFloor) !== String(prompt.activeFloor)) return;
    void this.switchFloor(prompt.floor, activeFloor);
  }

  updateTargetButton() {
    const button = this.part("target-task");
    if (!button) return;
    const room = this.mode === "room";
    const tool = this.selectedTool();
    button.hidden = this.mode === "global" || (!room && !tool);
    const ready = room ? this.roomSelection.size
      : this.mode === "zone" ? this.zones.length && !this.picks.length && !this.zoneDrag
      : this.mode === "spot" ? this.picks.length
      : this.picks.length === tool?.[3];
    button.disabled = !online(this.ha?.states[this.config.entity]) || !ready || Boolean(this.editPickMode);
    button.lastChild.textContent = " " + this.t(this.mode === "goto" ? "Go to point" : "Clean");
  }

  sendTargetTask() {
    if (this.mode === "global" || this.editPickMode) return;
    if (this.mode !== "room") return this.sendPicks();
    if (!this.roomSelection.size) return;
    const { action, data: payload } = buildCleaningTask("room", { rooms: [...this.roomSelection] });
    return this.run(action, payload);
  }

  renderMenu(basic, available) {
    const panels = [["cleaning-detail", "Cleaning settings", "tune-variant"],
      ["editor-detail", "Map editor", "map-outline"], ["edit-detail", "Map editing and management", "home-edit"],
      ["photos-detail", "History and photos", "history"], ["schedule-detail", "Schedules", "calendar-clock"],
      ["shortcut-detail", "Shortcuts", "lightning-bolt-outline"],
      ["maintenance-detail", "Accessory usage", "wrench-outline"],
      ["remote-detail", "Step-by-step remote control", "gamepad-variant-outline"], ["settings-detail", "Settings, dock and maintenance", "tune"]]
      .filter(([id]) => !this.part(id).hidden);
    const quick = panels.filter(([id]) => !["maintenance-detail", "schedule-detail"].includes(id));
    this.section("quick", quick, (node) => node.replaceChildren(...quick.map(([id, label, name]) =>
      this.iconButton(label, name, () => this.openView(id), { iconOnly: true }))));
    const locate = basic.find(([action]) => action === "vacuum.locate");
    const refresh = basic.find(([action]) => action === dreame("request_map"));
    const floors = this.part("floors").childElementCount > 0;
    this.section("menu-items", [panels, locate, refresh, floors, available], (node) => {
      node.replaceChildren(...panels.map(([id, label, name]) => this.iconButton(label, name, () => this.openView(id))));
      for (const entry of [locate, refresh].filter(Boolean)) {
        const [action, label] = entry;
        node.append(this.iconButton(label, CONTROL_ICONS[action], () => this.run(action), { disabled: !available }));
      }
      if (floors) node.append(this.iconButton("Switch floor", "layers", () => {
        this.part("floors").hidden = false;
        this.part("menu").open = false;
        this.part("floors").querySelector("select")?.focus();
      }));
    });
  }

  openView(id) {
    this.part("menu").open = false;
    this.part("views").hidden = false;
    const panel = this.part(id);
    panel.open = true;
    panel.querySelector("summary").focus();
  }

  status(message, error = false) {
    const output = this.part("result");
    this.statusMessage = message;
    output.textContent = this.t(message);
    output.toggleAttribute("data-error", error);
    if (this.part("dock-dialog").open) {
      const feedback = this.part("dock-result");
      feedback.textContent = output.textContent;
      feedback.toggleAttribute("data-error", error);
    }
  }

  renderDock(dock, available, canReturn) {
    const states = Object.values(dock).map((id) => {
      const state = this.ha.states[id];
      return [id, state.state, caption(state, id)];
    });
    this.section("dock-content", [states, dock, available, canReturn], (node) => {
      const indicators = element("div", null, { class: "dock-status" });
      for (const key of DOCK_SENSORS) {
        const id = dock[key];
        if (id) indicators.append(element("p", `${caption(this.ha.states[id], id)} · ${this.ha.states[id].state}`));
      }
      const actions = element("div", null, { class: "dock-actions" });
      for (const [key, label, name] of DOCK_ACTIONS) {
        const id = dock[key];
        if (id) actions.append(this.iconButton(label, name, () => this.run("button.press", {}, id),
          { disabled: !available || !pressable(this.ha.states[id]) }));
      }
      node.replaceChildren();
      if (indicators.childElementCount) node.append(indicators);
      if (actions.childElementCount) node.append(actions);
      if (DOCK_ACTIONS.slice(0, 3).some(([key]) => dock[key])) {
        node.append(element("p", this.t("Wash and dry buttons can also stop the active cycle.")));
      }
      if (canReturn) node.append(this.iconButton("Return to dock", "ev-station", () => this.run("vacuum.return_to_base"),
        { disabled: !available }));
    });
  }

  renderHistory(node, rows) {
    for (const { date, status, completed, summary, image } of rows) {
      const label = [status, ...summary, completed === true ? this.t("Completed") : completed === false ? this.t("Interrupted") : null]
        .filter((text) => typeof text === "string").join(" · ");
      const row = element(image ? "details" : "div", null, { class: "history-row" });
      const heading = element(image ? "summary" : "p", date);
      if (label) heading.append(element("small", label));
      row.append(heading);
      if (image) row.append(element("img", null, { src: image, alt: this.t("Session map"), loading: "lazy", referrerpolicy: "no-referrer" }));
      node.append(row);
    }
  }

  renderMaintenance() {
    const items = this.config.features?.maintenance === false ? [] : maintenanceEntries(this.ha, this.config);
    this.part("maintenance-detail").hidden = !items.length;
    this.section("maintenance", items, (node) => node.replaceChildren(...items.map(({ name, percent, time }) => {
      const row = element("div", null, { class: "consumable" });
      row.append(element("strong", name),
        element("span", [percent === null ? null : `${percent} %`, time].filter(Boolean).join(" · ")));
      if (percent !== null) row.append(element("progress", null, { max: 100, value: percent,
        class: percent < 30 ? "low" : "", "aria-label": name }));
      return row;
    })));
  }

  renderMapObjects(attrs) {
    const objects = mapObjectSummary(attrs);
    this.part("objects-detail").hidden = !objects.length;
    this.section("objects", objects, (node) => {
      node.replaceChildren(element("p", this.t("Map objects")));
      const summary = element("div", null, { id: "object-summary" });
      for (const { label, count } of objects) summary.append(element("span", `${this.t(label)} · ${count}`));
      node.append(summary);
    });
  }

  renderCollectionPanel(id, entries, action) {
    this.part(id).closest("details").hidden = !entries.length;
    this.section(id, [entries, action], (node) => {
      node.replaceChildren(...entries.map(({ id: shortcutId, script, runnable, name, enabled, time, days, tasks }) => {
        const row = element("div", null, { class: "history-row" });
        row.append(element("strong", name));
        if (time) row.append(element("small", `${this.t("Start time")}: ${time}`));
        if (Array.isArray(days) && days.length) row.append(element("small", `${this.t("Days")}: ${days.join(", ")}`));
        if (tasks !== undefined && tasks !== null) row.append(element("small", `${tasks} tasks`));
        if (enabled === false) row.append(element("small", this.t("Disabled")));
        if (script) {
          const runScript = this.button(this.t("Run shortcut"), () => {
            if (runScript.isConnected && this.config.scripts?.includes(script)) void this.run("script.turn_on", {}, script);
          }, !runnable);
          row.append(runScript);
        } else if (action && shortcutId != null) row.append(this.button(this.t("Run shortcut"),
          () => this.run(action, { shortcut_id: shortcutId })));
        return row;
      }));
    });
  }

  renderSchedulesAndShortcuts(ids, attrs, available) {
    const schedule = ids.find((id) => id.endsWith("_scheduled_clean") || id.includes("schedule"));
    const shortcut = ids.find((id) => id.endsWith("_shortcuts") || id.includes("shortcut"));
    const schedules = scheduleEntries(attrs.schedule ?? this.ha.states[schedule]?.attributes);
    const shortcuts = shortcutEntries(attrs.shortcuts ?? this.ha.states[shortcut]?.attributes);
    this.renderCollectionPanel("schedules", schedules);
    const action = dreame("start_shortcut");
    const shortcutAction = available && hasAction(this.ha, action) ? action : null;
    const hideNative = this.config.hidden_card_objects?.includes("shortcuts");
    const scripts = (this.config.scripts ?? []).map((script) => {
      const entity = this.ha.states[script];
      return { script, name: caption(entity, script), runnable: online(entity) && hasAction(this.ha, "script.turn_on") };
    });
    this.renderCollectionPanel("shortcuts", hideNative ? scripts : [...scripts, ...shortcuts], shortcutAction);
    this.renderCollectionPanel("device-shortcuts", hideNative ? shortcuts : [], shortcutAction);
  }

  renderRoomPreferences(node, roomIds, available) {
    if (!hasAction(this.ha, dreame("set_custom_cleaning"))) return;
    const detail = element("details");
    detail.append(element("summary", this.t("Cleaning preferences")));
    const form = element("form");
    const fields = [
      ["segment_id", "Room IDs", JSON.stringify(roomIds)], ["suction_level", "Suction", "[]"],
      ["water_volume", "Water", "[]"], ["repeats", "Repeats", "[]"],
    ];
    const inputs = Object.fromEntries(fields.map(([name, label, value]) => {
      const input = element("input", null, { name, type: "text", value, placeholder: "JSON […]" });
      form.append(this.label(this.t(label), input));
      return [name, input];
    }));
    const confirm = element("input", null, { type: "checkbox" });
    form.append(this.label(this.t("Confirm this action on the robot"), confirm));
    form.append(this.button(this.t("Apply room settings"), async () => {
      if (!confirm.checked) return this.status("Confirm the action", true);
      try {
        const payload = customCleaningPayload(Object.fromEntries(Object.entries(inputs).map(([name, input]) => [name, input.value])));
        await this.run(dreame("set_custom_cleaning"), payload);
        confirm.checked = false;
      } catch (error) { this.status(error.message, true); }
    }, !available, true));
    form.addEventListener("submit", (event) => event.preventDefault());
    detail.append(form);
    node.append(detail);
  }

  async run(action, data = {}, id = this.config.entity) {
    const pendingKey = id + "/" + action;
    if (this.pending.has(pendingKey)) return false;
    this.pending.add(pendingKey);
    try {
      await callAction(this.ha, id, action, data);
      this.status("Command sent.");
      return true;
    } catch (error) {
      this.status(error?.message || "The command failed.", true);
      return false;
    } finally {
      this.pending.delete(pendingKey);
    }
  }

  discoverMapCamera(deviceId) {
    if (!deviceId) return null;
    const matches = Object.entries(this.ha.entities).filter(([id, entry]) => id.startsWith("camera.")
      && entry?.device_id === deviceId && entry.platform === DOMAIN && entry.translation_key === "map");
    return matches.length === 1 ? matches[0][0] : null;
  }

  loadStructuredMap(image, identity, camera) {
    const { background_image, overlay_image } = mapPresentation(this.config, this.mapIndex);
    const canvasMode = ["structured", "floor_plan"].includes(this.config.map_display);
    const url = this.isConnected && (canvasMode || background_image || overlay_image) && this.mapPicking
      && identity.floor != null && identity.frame != null ? mapDataURL(image, camera) : null;
    const key = url ? JSON.stringify([url, identity]) : null;
    if (this.sceneKey === key) {
      this.renderStructuredMap();
      return;
    }
    this.sceneRequest?.abort();
    this.sceneKey = key;
    this.mapScene = null;
    this.renderStructuredMap();
    if (url) void this.fetchStructuredMap(url, identity);
  }

  async fetchStructuredMap(url, identity) {
    const request = new AbortController();
    this.sceneRequest = request;
    try {
      const response = await fetch(url, { signal: request.signal, redirect: "error", cache: "no-store" });
      const raw = response.ok ? await response.json() : null;
      if (request.signal.aborted) return;
      this.mapScene = decodeMapScene(raw, identity);
      this.renderStructuredMap();
    } catch (error) {
      if (!(request.signal.aborted || error instanceof TypeError || error instanceof SyntaxError)) throw error;
    } finally {
      if (this.sceneRequest === request) this.sceneRequest = null;
    }
  }

  renderStructuredMap() {
    const canvas = this.part("structured-map");
    const img = this.part("map");
    const layer = this.part("map-layer");
    const figure = this.part("figure");
    if (img.naturalHeight) figure.style.setProperty("--map-image-ratio", String(img.naturalWidth / img.naturalHeight));
    figure.classList.toggle("quarter-turn", this.mapRotation % 180 === 90);
    layer.style.transform = this.mapRotation ? `rotate(${this.mapRotation}deg)` : "";
    layer.style.setProperty("--map-counter-rotation", `${-(this.mapRotation ?? 0)}deg`);
    const presentation = mapPresentation(this.config, this.mapIndex);
    const hidden = new Set(presentation.hidden_objects ?? []);
    for (const [flag, className] of [["name", "hide-room-name"], ["name_background", "hide-room-background"],
      ["order", "hide-room-order"], ["obstacle_background", "simple-obstacle"]]) {
      layer.classList.toggle(className, hidden.has(flag));
    }
    const { dark, ...overrides } = this.config.override_colors ?? {};
    const colors = { ...overrides, ...(this.ha?.themes?.darkMode ? dark : {}) };
    const rooms = colors.segment ? this.currentMap?.rooms : undefined;
    const selected = this.roomSelection;
    const paintKey = JSON.stringify([this.config.color_scheme, this.config.map_display, this.calibration, img.naturalWidth, img.naturalHeight,
      presentation, colors, rooms, colors.segment ? [...selected] : null]);
    const scene = this.mapPicking && img.complete && (this.config.map_display === "structured"
      || (this.config.map_display === "floor_plan" && this.mapScene?.walls.length))
      ? this.mapScene : null;
    const previous = this.paintedScene;
    const previousKey = this.paintedKey;
    this.structuredVisible = Boolean(scene && ((!canvas.hidden && this.paintedScene === scene && this.paintedKey === paintKey)
      || paintScene(canvas, scene, this.calibration, { ...presentation, image: img, colors, rooms, selected })));
    this.paintedScene = this.structuredVisible ? scene : null;
    this.paintedKey = paintKey;
    canvas.hidden = !this.structuredVisible;
    canvas.style.opacity = String(presentation.opacity ?? 1);
    layer.style.setProperty("--map-opacity", String(presentation.opacity ?? 1));
    layer.style.setProperty("--map-object-opacity", String(presentation.object_opacity ?? 1));
    layer.style.setProperty("--map-object-scale", String(presentation.object_scale ?? 1));
    layer.style.setProperty("--map-font-size", presentation.font_size != null ? `${presentation.font_size}px` : "");
    this.renderMapAsset("map-background", presentation.background_image, img);
    this.renderMapAsset("map-foreground", presentation.overlay_image, img);
    this.applyMapFit(presentation, img);
    for (const key of ["active_area", "no_go", "no_mop", "virtual_wall", "wall", "carpet", "icon_background", "text"]) {
      layer.style.setProperty(`--map-${key.replaceAll("_", "-")}`, colors[key] ?? "");
    }
    layer.classList.toggle("structured", this.structuredVisible);
    layer.classList.toggle("room-picking", this.structuredVisible && this.mode === "room");
    if (this.paintedScene !== previous || previousKey !== paintKey) this.renderMapObjectLayers();
  }

  renderMapAsset(id, asset, image) {
    const node = this.part(id);
    const width = image.naturalWidth, height = image.naturalHeight;
    const step = this.mapScene?.step;
    const geometry = asset && ["left", "top", "width", "height"].some((key) => asset[key] != null);
    const hide = () => {
      node.hidden = true;
      node.removeAttribute("src");
    };
    if (!asset || !this.mapPicking || !image.complete || !width || !height || (geometry && !step)) return hide();
    const project = (point) => projectPoint(this.calibration, point, "vacuum", "map");
    const centerWorld = projectPoint(this.calibration, [width / 2, height / 2], "map", "vacuum");
    const origin = project([0, 0]), right = project([1, 0]), down = project([0, -1]);
    if (!origin || !right || !down || !centerWorld) return hide();
    const center = project([asset.left == null ? centerWorld[0] : asset.left * step,
      asset.top == null ? centerWorld[1] : asset.top * step]);
    const horizontal = [right[0] - origin[0], right[1] - origin[1]];
    const vertical = [down[0] - origin[0], down[1] - origin[1]];
    const quarterTurn = Math.abs(horizontal[1]) > Math.abs(horizontal[0]);
    const size = [asset.width == null ? (quarterTurn ? height : width) : asset.width * step * Math.hypot(...horizontal),
      asset.height == null ? (quarterTurn ? width : height) : asset.height * step * Math.hypot(...vertical)];
    if (!center?.every(Number.isFinite) || !size.every(Number.isFinite)) return hide();
    node.hidden = false;
    Object.assign(node.style, { left: `${center[0] / width * 100}%`, top: `${center[1] / height * 100}%`,
      width: `${size[0] / width * 100}%`, height: `${size[1] / height * 100}%`, opacity: String(asset.opacity ?? 1) });
    node.style.setProperty("--art-angle", `${Math.atan2(horizontal[1], horizontal[0])}rad`);
    if (node.getAttribute("src") !== asset.url) node.setAttribute("src", asset.url);
  }

  applyMapFit(presentation, image) {
    const figure = this.part("figure");
    const frame = this.part("map-frame");
    const step = this.mapScene?.step;
    const hasFit = step && ["left", "top", "width", "height", "scale"].some((key) => presentation[key] != null);
    figure.classList.toggle("map-fit", hasFit);
    if (!hasFit) {
      frame.style.removeProperty("transform");
      figure.style.removeProperty("--fit-ratio");
      return;
    }
    const w = image.naturalWidth, h = image.naturalHeight;
    const project = (point) => projectPoint(this.calibration, point, "vacuum", "map");
    const origin = project([0, 0]), unitX = project([step, 0]), unitY = project([0, -step]);
    if (!origin || !unitX || !unitY) return;
    const pxPerStepX = Math.hypot(unitX[0] - origin[0], unitX[1] - origin[1]);
    const pxPerStepY = Math.hypot(unitY[0] - origin[0], unitY[1] - origin[1]);
    const viewW = (presentation.width ?? w / pxPerStepX) * pxPerStepX;
    const viewH = (presentation.height ?? h / pxPerStepY) * pxPerStepY;
    const centerVac = [(presentation.left ?? w / pxPerStepX / 2) * step,
      (presentation.top ?? h / pxPerStepY / 2) * step];
    const center = project(centerVac);
    if (!center) return;
    const scaleOverride = presentation.scale ?? 1;
    const s = Math.min(viewW / w, viewH / h) / scaleOverride;
    const tx = (w / 2 - center[0]) / w;
    const ty = (h / 2 - center[1]) / h;
    frame.style.transform = `scale(${1 / s}) translate(${tx * 100}%, ${ty * 100}%)`;
    figure.style.setProperty("--fit-ratio", String(viewW / viewH));
  }

  update() {
    if (!this.config || !this.ha) return;
    this.updateLanguage();
    const { entity, title } = this.config;
    const robotDevice = this.ha.entities?.[entity]?.device_id;
    const map_camera = this.config.map_camera ?? this.discoverMapCamera(robotDevice);
    this.mapCamera = map_camera;
    const vacuum = this.ha.states[entity];
    const attrs = vacuum?.attributes ?? {};
    const camera = this.ha.states[map_camera];
    const map = camera?.attributes ?? {};
    const available = online(vacuum);
    const can = (action) => hasAction(this.ha, action);
    const activeMapId = attrs.selected_map_id;
    const cameraMapId = map.saved_map_id ?? map.map_id;
    const cameraDevice = this.ha.entities?.[map_camera]?.device_id;
    const relatedCamera = !(robotDevice && cameraDevice && robotDevice !== cameraDevice);
    const requestedFloor = String(this.pendingFloor);
    const cameraConfirmed = !map_camera || (relatedCamera && online(camera) && map.selected !== false
      && String(cameraMapId) === requestedFloor);
    if (this.pendingFloor && String(activeMapId) === requestedFloor && cameraConfirmed) this.pendingFloor = null;
    const liveMap = !this.pendingFloor && relatedCamera && online(camera) && map.selected !== false
      && (activeMapId == null || cameraMapId == null || String(activeMapId) === String(cameraMapId));
    const image = relatedCamera && online(camera) ? localImage(map.entity_picture) : null;
    const imageNode = this.part("map");
    const display = this.config.map ?? {};
    this.part("figure").hidden = !image;
    if (image && imageNode.getAttribute("src") !== image) imageNode.setAttribute("src", image);
    if (image) {
      const [x, y] = display.offset ?? [0, 0];
      imageNode.style.transform = `translate(${x}px, ${y}px) rotate(${display.rotation ?? 0}deg) scale(${display.scale ?? 1})`;
      imageNode.style.transformOrigin = "center";
    } else {
      imageNode.removeAttribute("src");
      imageNode.style.removeProperty("transform");
    }
    this.calibration = image && liveMap ? map.calibration_points : null;
    this.currentMap = map;
    this.mapIndex = map.map_index ?? ((attrs.maps?.length ?? 0) <= 1 ? 1 : null);
    const rotation = mapPresentation(this.config, this.mapIndex).rotation;
    const nativeRotation = [0, 90, 180, 270].includes(map.rotation) ? map.rotation : 0;
    this.mapRotation = rotation == null ? 0 : (rotation - nativeRotation + 360) % 360;
    const calibrated = Boolean(mapPoint(this.calibration, [0, 0]));
    const transformed = (display.rotation ?? 0) !== 0 || (display.scale ?? 1) !== 1 || (display.offset ?? [0, 0]).some((part) => part !== 0);
    this.mapPicking = calibrated && available && !transformed;
    this.restrictions = this.mapPicking && !attrs.has_temporary_map && restrictionSnapshot(map, activeMapId, cameraMapId);
    const pending = this.pendingRestriction;
    if (pending?.finished && pending.expected && pending.expected === this.restrictions) this.pendingRestriction = null;
    const scope = JSON.stringify([entity, map_camera, activeMapId, attrs.selected_map, cameraMapId, map.map_id, this.calibration, available]);
    if (scope !== this.scope) {
      this.scope = scope;
      this.roomSelection.clear();
      this.objectSelection = null;
      this.part("obstacle-dialog").close();
      this.resetRestrictionDraft();
      this.clearPicks();
    }

    const device = this.ha.devices?.[robotDevice];
    const deviceName = (device?.name_by_user || device?.name)?.trim();
    const vacuumName = caption(vacuum, "Dreame");
    const repeatedDeviceName = deviceName && vacuumName.trim().replace(/\s+/g, " ")
      === `${deviceName} ${deviceName}`.replace(/\s+/g, " ");
    this.part("title").textContent = title || (repeatedDeviceName ? deviceName : vacuumName);
    const state = vacuum?.state ?? "unavailable";
    const error = typeof attrs.error === "string" && !/^(none|no[ _]error|unknown|ok)$/i.test(attrs.error.trim()) ? attrs.error : null;
    const faults = Object.values(attrs.faults ?? {}).filter((fault) => typeof fault === "string");
    this.part("state").textContent = [this.t(STATE_LABELS[state] ?? state),
      ...new Set([error, ...faults]), !relatedCamera ? this.t("Camera belongs to another device") : null].filter(Boolean).join(" · ");
    this.renderTelemetry(attrs);

    const basic = BASIC.filter(([action, , flag]) => can(action)
      && (!flag || attrs.supported_features == null || (attrs.supported_features & flag)));
    const dock = this.config.features?.dock === false ? {} : dockEntities(this.ha, this.config);
    const hasDock = Object.keys(dock).length > 0;
    this.renderDock(dock, available, basic.some(([action]) => action === "vacuum.return_to_base"));
    if (!hasDock && this.part("dock-dialog").open) this.part("dock-dialog").close();
    this.section("basic", [basic, available, state, hasDock], (node) => {
      node.replaceChildren(...basic
        .filter(([action]) => {
          if (action === "vacuum.start") return state !== "cleaning" || !basic.some(([key]) => key === "vacuum.pause");
          if (action === "vacuum.pause") return state === "cleaning";
          if (action === "vacuum.stop") return ["cleaning", "paused", "returning"].includes(state);
          return action === "vacuum.return_to_base" && !hasDock;
        })
        .map(([action, label]) => {
          const button = this.iconButton(label, CONTROL_ICONS[action], () => this.run(action), { disabled: !available });
          button.dataset.action = action;
          return button;
        }));
      if (hasDock) node.append(this.iconButton("Dock controls", "ev-station", () => {
        this.part("dock-result").textContent = "";
        this.part("dock-dialog").showModal();
      }));
      if (!["cleaning", "returning"].includes(state)) {
        const button = this.iconButton("Clean", "play", () => this.sendTargetTask());
        button.id = "target-task";
        button.hidden = true;
        node.insertBefore(button, node.querySelector('[data-action="vacuum.return_to_base"]') ?? (hasDock ? node.lastElementChild : null));
      }
    });

    const maps = Array.isArray(attrs.maps) ? attrs.maps.filter((entry) => Number.isSafeInteger(Number(entry?.id)) && Number(entry.id) > 0) : [];
    const canSwitchFloor = available && !this.pendingFloor && !this.pendingRestriction;
    this.section("floors", [maps, activeMapId, canSwitchFloor, can(dreame("select_map"))], (node) => {
      node.replaceChildren();
      node.hidden = true;
      if (!maps.length || !can(dreame("select_map"))) return;
      const select = element("select");
      const placeholder = element("option", this.t("Choose a floor"), { value: "" });
      placeholder.disabled = true;
      select.append(placeholder, ...maps.map(({ id, name }) => element("option", name || this.t("Map") + " " + id, { value: id })));
      select.value = maps.some((entry) => String(entry.id) === String(activeMapId)) ? String(activeMapId) : "";
      select.disabled = !canSwitchFloor;
      const button = this.button(this.t("Switch floor"), () => {
        if (select.value) void this.requestFloorChange(Number(select.value), activeMapId, select.selectedOptions[0]?.textContent);
      }, !canSwitchFloor);
      node.append(this.label(this.t("Floor"), select), button);
    });

    const cameraRooms = liveMap ? map.rooms : null;
    const selectedRooms = Object.entries(
      cameraRooms ?? (attrs.selected_map ? attrs.rooms?.[attrs.selected_map] : null) ?? {},
    ).map(([key, room]) => [Number(room?.room_id ?? room?.id ?? key), room, room?.name])
      .filter(([id]) => Number.isSafeInteger(id) && id > 0);
    const hasRoomAction = can(dreame("clean_segment"));
    const visibleRoomIds = new Set(hasRoomAction ? selectedRooms.map(([id]) => id) : []);
    for (const id of this.roomSelection) if (!visibleRoomIds.has(id)) this.roomSelection.delete(id);
    this.markerRooms = hasRoomAction && cameraRooms && cameraMapId != null
      ? selectedRooms.map(([id, bounds, label]) => [id, bounds, label || this.t("Room") + " " + id]) : [];
    this.section("rooms", [selectedRooms, available, hasRoomAction], (node) => {
      node.replaceChildren();
      if (!visibleRoomIds.size) return;
      node.append(element("h3", this.t("Rooms")));
      for (const [id, , label] of selectedRooms) {
        const box = element("input", null, { type: "checkbox", value: id });
        box.disabled = !available;
        box.addEventListener("change", () => this.toggleRoom(id, box.checked));
        node.append(this.label(label || this.t("Room") + " " + id, box));
      }
      this.renderRoomPreferences(node, selectedRooms.map(([id]) => id), available);
    });

    const tools = TOOLS.filter(([, , action]) => can(action));
    this.section("tools", [tools.map(([key]) => key), calibrated, available], (node) => {
      node.replaceChildren();
      this.sections.delete("zone-list");
      this.toolSelect = null;
      if (!tools.length || !calibrated) return;
      const select = element("select");
      select.append(...tools.map(([key, label]) => element("option", this.t(label), { value: key })));
      select.hidden = true;
      select.disabled = !available;
      this.toolSelect = select;
      const help = element("p");
      const setHelp = () => {
        const count = this.selectedTool()[3];
        help.textContent = this.t(count === 2 ? "Choose two opposite corners for each zone."
          : select.value === "spot" ? "Choose points on the map." : "Choose a point on the map.");
      };
      select.addEventListener("change", () => {
        setHelp();
      });
      setHelp();
      const coords = [0, 1].map((i) => element("input", null, { type: "number", step: "1", "aria-label": i ? "Y" : "X" }));
      const fields = element("div", null, { class: "row" });
      fields.append(...coords, this.button(this.t("Add coordinates"), () => {
        const xy = coords.map((input) => input.valueAsNumber);
        if (xy.every(Number.isSafeInteger) && !this.editPickMode) this.addPick(xy);
        else this.status("Enter two whole-number coordinates.", true);
      }, !available));
      const clear = this.button(this.t("Clear"), () => this.clearPicks());
      node.append(select, help, fields, clear, element("p", "", { id: "coordinates" }), element("div", null, { id: "zone-list", class: "row" }));
      this.showPicks();
    });
    if (this.editPickMode && (this.editSnapshot !== this.restrictions || this.config.features?.editing === false)) {
      this.cancelRestrictionEdit();
      this.status("The map changed. Select the area again.", true);
    }
    this.loadStructuredMap(image, { floor: activeMapId ?? cameraMapId, mapId: map.map_id, frame: map.frame_id }, map_camera);

    const ids = deviceEntities(this.ha, this.config);
    const settingActions = ["button.press", "switch.turn_on", "switch.turn_off", "number.set_value",
      "select.select_option", "time.set_value"].map(can);
    const settingsSignature = ids.map((id) => {
      const { state, attributes: a = {} } = this.ha.states[id];
      return [id, state, a.friendly_name, a.options, a.unit_of_measurement, a.min, a.max, a.step];
    });
    this.section("settings", [settingsSignature, settingActions], (node) => this.renderSettings(node, ids));
    this.renderCleaningSettings(ids);
    this.renderMaintenance();
    this.renderMapObjects(map);
    this.renderObjectEditor();
    this.renderSchedulesAndShortcuts(ids, attrs, available);

    const historyTypes = [["cleaning_history", "Cleaning history"]];
    if (!this.config.hidden_card_objects?.includes("cruising_history")) historyTypes.push(["cruising_history", "Cruising history"]);
    const history = historyTypes.map(([key, label]) => {
      const id = dreameEntity(this.ha, this.config, ids, "sensor", key);
      const rows = historyEntries(this.ha.states[id]?.attributes, image ? map[`${key}_picture`] : null, map_camera);
      return [label, rows];
    }).filter(([, rows]) => rows.length);
    const joined = new Set(history.flatMap(([, rows]) => rows.map((row) => row.image)));
    const pictures = image ? [...historyTypes.map(([key]) => `${key}_picture`), "obstacle_picture"]
      .flatMap((key) => Object.entries(map[key] ?? {})).filter(([, url]) => localImage(url) && !joined.has(url)) : [];
    const recovery = image ? Object.entries(map.recovery_map_picture ?? {}).filter(([, url]) => localImage(url)) : [];
    const wifi = image && localImage(map.wifi_map_picture);
    this.part("photos-detail").hidden = this.config.features?.history === false
      || (!pictures.length && !history.length && !recovery.length && !wifi);
    this.section("photos", [pictures, history, recovery, wifi], (node) => {
      node.replaceChildren();
      for (const [label, rows] of history) {
        node.append(element("h3", this.t(label)));
        this.renderHistory(node, rows);
      }
      for (const [label, url] of pictures) node.append(element("a", label, { href: url, target: "_blank", rel: "noopener noreferrer" }));
      if (recovery.length) node.append(element("h3", this.t("Recovery maps")));
      for (const [label, url] of [...recovery, ...(wifi ? [[this.t("Wi-Fi map"), wifi]] : [])]) {
        const preview = element("details");
        preview.append(element("summary", label), element("img", null, { src: url, alt: label, loading: "lazy", referrerpolicy: "no-referrer" }));
        node.append(preview);
      }
    });

    const remote = dreame("remote_control_move_step");
    this.part("remote-detail").hidden = this.config.features?.remote === false || !can(remote);
    this.section("remote", [can(remote), available], (node) => this.renderRemote(node, remote, available));
    const edits = EDITS.filter(([key]) => can(dreame(key))
      && (!key.endsWith("temporary_map") || attrs.has_temporary_map === true));
    this.part("edit-detail").hidden = this.config.features?.editing === false || !edits.length;
    this.section("edit", [edits.map(([key]) => key), available, activeMapId, this.restrictions, this.canEditRestrictions()],
      (node) => this.renderEdits(node, edits, available));
    this.renderNavigation(visibleRoomIds.size > 0, calibrated ? tools : [], available);
    this.syncRoomSelection();
    this.renderMenu(basic, available);
  }

  label(text, input) {
    const label = element("label", text);
    label.append(input);
    return label;
  }

  selectedTool() { return TOOLS.find(([key]) => key === this.toolSelect?.value); }

  pickOnMap(event) {
    const editor = this.part("editor-detail");
    if (this.editPickMode && !editor.open) this.cancelRestrictionEdit();
    if (this.editPickMode) {
      const pick = this.mapPointer(event);
      if (pick && !this.editRemove) this.addPick(pick.coords, pick.pin);
      return;
    }
    if (editor.open && !editor.hidden && this.canEditRestrictions()
      && this.selectRestrictionAt(this.mapPointer(event))) return;
    if (this.mode === "room" && this.structuredVisible) {
      const pick = this.mapPointer(event);
      if (!pick) return;
      const pixel = scenePixel(this.mapScene, pick.coords);
      if (isRoomFloor(pixel) && this.markerRooms.some(([room]) => room === pixel)) this.toggleRoom(pixel, !this.roomSelection.has(pixel));
      return;
    }
    if (this.part("tools").hidden || !this.selectedTool()) return;
    const pick = this.mapPointer(event);
    if (!pick) return;
    this.addPick(pick.coords, pick.pin);
  }

  selectRestrictionAt(pick) {
    if (!pick) return false;
    const snapshot = this.restrictions;
    const lists = JSON.parse(snapshot);
    const [x, y] = pick.coords;
    // Prefer the last painted restriction; the editor list can select any overlapping area.
    for (const { field } of [...RESTRICTION_LISTS].reverse()) {
      const index = lists[field].findLastIndex(([x0, y0, x1, y1]) => x >= x0 && x <= x1 && y >= y0 && y <= y1);
      if (index < 0) continue;
      this.startRestrictionEdit(field, index, snapshot);
      return true;
    }
    return false;
  }

  mapPointer(event) {
    if (!this.mapPicking) return null;
    const img = this.part("map");
    // Avoid using the previous decoded image while the current image is loading.
    if (!img.complete || !img.naturalWidth) return null;
    const rect = img.getBoundingClientRect();
    if (!rect.width || !rect.height) return null;
    const [x, y] = unrotateMapPoint((event.clientX - rect.left) / rect.width,
      (event.clientY - rect.top) / rect.height, this.mapRotation);
    if (x < 0 || x > 1 || y < 0 || y > 1) return null;
    const coords = mapPoint(this.calibration, [x * img.naturalWidth, y * img.naturalHeight]);
    return coords && { coords, pin: [x, y] };
  }

  clearPicks() {
    this.picks = [];
    this.zones = [];
    this.zoneDrag = null;
    this.showPicks();
  }

  addPick(coords, pin) {
    if (this.editPickMode) {
      if (this.picks.length >= 2) this.picks = [];
      if (this.picks.length === 1 && !mapArea(this.picks[0].coords, coords)) {
        this.status("Choose two corners that enclose an area.", true);
        return;
      }
      this.picks.push({ coords, pin });
      this.showPicks();
      this.renderObjectEditor();
      return;
    }
    if (!this.canPickPoint(coords)) {
      this.status("Choose a point on the mapped floor.", true);
      return;
    }
    const tool = this.selectedTool();
    if (!tool) return;
    if (tool[0] === "zone" && this.picks.length) {
      const first = this.picks[0].coords;
      if (!mapArea(first, coords)) {
        this.status("Choose two corners that enclose an area.", true);
        return;
      }
      this.zones = [...this.zones, [first, coords]];
      this.picks = [];
    } else if (tool[0] === "spot") {
      this.picks = [...this.picks, { coords, pin }];
    } else {
      this.picks = [{ coords, pin }];
    }
    this.showPicks();
  }

  dragZone(event) {
    if (this.zoneDrag?.pointer !== event.pointerId) return;
    const pick = this.mapPointer(event);
    if (pick) this.resizeZone(this.zoneDrag.index, this.zoneDrag.corner, pick.coords);
  }

  resizeZone(index, corner, coords) {
    const pair = [...this.zones[index]];
    pair[corner] = coords;
    if (!mapArea(...pair)) return;
    this.zones = this.zones.map((zone, i) => i === index ? pair : zone);
    this.showPicks();
  }

  zoneHandle(index, corner, position) {
    const label = `${this.t("Resize zone")} ${index + 1} (${corner + 1})`;
    const handle = element("button", String(index + 1), { type: "button", "aria-label": label });
    handle.style.left = `${position[0] * 100}%`;
    handle.style.top = `${position[1] * 100}%`;
    handle.addEventListener("pointerdown", (event) => {
      if (event.button !== 0 || this.zoneDrag) return;
      event.preventDefault();
      this.part("zone-overlay").setPointerCapture(event.pointerId);
      this.zoneDrag = { pointer: event.pointerId, index, corner };
      this.updateTargetButton();
    });
    handle.addEventListener("keydown", (event) => {
      const delta = { ArrowLeft: [-1, 0], ArrowRight: [1, 0], ArrowUp: [0, -1], ArrowDown: [0, 1] }[event.key];
      if (!Array.isArray(delta)) return;
      event.preventDefault();
      const img = this.part("map");
      const direction = unrotateMapPoint(...delta, this.mapRotation, 0);
      const pixels = [img.naturalWidth, img.naturalHeight].map((size, axis) =>
        Math.max(0, Math.min(size, position[axis] * size + direction[axis] * Math.max(1, size / 100))));
      const coords = mapPoint(this.calibration, pixels);
      if (coords) this.resizeZone(index, corner, coords);
      [...this.part("zone-overlay").querySelectorAll("button")].find((button) => button.getAttribute("aria-label") === label)?.focus();
    });
    return handle;
  }

  renderZones() {
    const img = this.part("map");
    const overlay = this.part("zone-overlay");
    overlay.hidden = this.mode !== "zone" || !this.mapPicking || !img.complete || !img.naturalWidth || !this.zones.length;
    if (overlay.hidden) return;
    this.section("zone-overlay", [this.zones, this.calibration, img.naturalWidth, img.naturalHeight], (node) => {
      const namespace = "http://www.w3.org/2000/svg";
      const svg = document.createElementNS(namespace, "svg");
      svg.setAttribute("viewBox", "0 0 100 100");
      svg.setAttribute("preserveAspectRatio", "none");
      svg.setAttribute("aria-hidden", "true");
      node.replaceChildren(svg);
      const project = (coords) => projectPoint(this.calibration, coords, "vacuum", "map")
        ?.map((axis, i) => axis / [img.naturalWidth, img.naturalHeight][i]);
      this.zones.forEach(([[x0, y0], [x1, y1]], index) => {
        const points = [[x0, y0], [x1, y0], [x1, y1], [x0, y1]].map(project);
        if (!points.every((p) => p?.every(Number.isFinite))) return;
        const polygon = document.createElementNS(namespace, "polygon");
        polygon.setAttribute("points", points.map((p) => p.map((axis) => axis * 100).join(",")).join(" "));
        svg.append(polygon);
        for (const [corner, position] of [points[0], points[2]].entries()) {
          if (position.every((axis) => axis >= 0 && axis <= 1)) node.append(this.zoneHandle(index, corner, position));
        }
      });
    });
  }

  showPicks() {
    const layer = this.part("map-layer");
    for (const marker of layer.querySelectorAll(".pin")) marker.remove();
    for (const { pin } of this.picks) {
      if (!pin) continue;
      const marker = element("span", null, { class: "pin", "aria-hidden": "true" });
      marker.style.left = pin[0] * 100 + "%";
      marker.style.top = pin[1] * 100 + "%";
      layer.append(marker);
    }
    const coords = this.part("coordinates");
    if (coords) coords.textContent = this.picks.map(({ coords }) => coords.join(", ")).join(" · ");
    const spot = this.mode === "spot";
    const selections = spot ? this.picks : this.zones;
    if (this.part("zone-list")) this.section("zone-list", [spot, selections.length], (node) => {
      node.replaceChildren(...selections.map((_, index) => this.button(`${this.t(spot ? "Remove point" : "Remove zone")} ${index + 1}`, () => {
        if (this.zoneDrag) return;
        if (spot) this.picks = this.picks.filter((_, i) => index !== i);
        else this.zones = this.zones.filter((_, i) => index !== i);
        this.showPicks();
        (node.children[index] ?? node.lastElementChild ?? this.part("tools").querySelector("button"))?.focus();
      })));
    });
    this.renderZones();
    this.renderMapObjectLayers();
    this.updateTargetButton();
  }

  canPickPoint(coords) {
    return !this.structuredVisible || !["spot", "goto"].includes(this.mode) || cleanablePixel(scenePixel(this.mapScene, coords));
  }

  async sendPicks() {
    if (this.picks.some(({ coords }) => !this.canPickPoint(coords))) {
      this.status("Choose a point on the mapped floor.", true);
      return;
    }
    const tool = this.selectedTool();
    if (this.mode === "spot") {
      if (!this.picks.length) return;
      const picks = this.picks;
      const { action, data: payload } = buildCleaningTask("spot", { points: picks.map(({ coords }) => coords) });
      if (await this.run(action, payload) && this.picks === picks) this.clearPicks();
      return;
    }
    if (this.mode === "zone") {
      if (!this.zones.length || this.picks.length || this.zoneDrag) return;
      const zones = this.zones;
      const { action, data: payload } = buildCleaningTask("zone", { zones });
      if (await this.run(action, payload) && this.zones === zones && !this.picks.length) this.clearPicks();
      return;
    }
    if (!tool || this.picks.length !== tool[3]) {
      this.status("Complete the selection.", true);
      return;
    }
    const picks = this.picks;
    try {
      const sent = await this.run(tool[2], tool[4](...picks.map(({ coords }) => coords)));
      if (sent && this.picks === picks) {
        this.picks = [];
        this.showPicks();
      }
    } catch (error) { this.status(error.message, true); }
  }

  renderCleaningSettings(ids) {
    const detail = this.part("cleaning-detail");
    const container = this.part("cleaning-settings");
    const controls = CLEANING_CONTROLS.map(([key, label, domain, icons]) => {
      const id = dreameEntity(this.ha, this.config, ids, domain, key);
      return id ? { key, label, domain, icons, id, entity: this.ha.states[id] } : null;
    }).filter(Boolean);
    detail.hidden = !controls.length;
    if (detail.hidden) return;
    container.replaceChildren();
    for (const { key, label, domain, icons, id, entity } of controls) {
      const a = entity.attributes ?? {};
      const row = element("div", null, { class: "setting-row" });
      const current = entity.state;
      row.append(element("span", `${this.t(label)}: ${this.t(current)}`, { class: "setting-label" }));
      if (domain === "select" && Array.isArray(a.options)) {
        const group = element("div", null, { class: "setting-group", role: "group", "aria-label": this.t(label) });
        for (const option of a.options) {
          const btn = element("button", null, { type: "button", class: "setting-btn",
            "aria-label": this.t(option), "aria-pressed": String(option === current) });
          const iconName = icons?.[option];
          if (iconName) btn.append(icon(iconName));
          else btn.textContent = this.t(option);
          btn.addEventListener("click", () => this.run("select.select_option", { option }, id));
          group.append(btn);
        }
        row.append(group);
      } else if (domain === "switch") {
        const toggle = element("input", null, { type: "checkbox", class: "setting-toggle" });
        toggle.checked = current === "on";
        toggle.addEventListener("change", () =>
          this.run(toggle.checked ? "switch.turn_on" : "switch.turn_off", {}, id));
        row.append(toggle);
      } else if (domain === "number") {
        const slider = element("input", null, { type: "range", min: String(a.min ?? 1), max: String(a.max ?? 30),
          step: String(a.step ?? 1), value: current, class: "setting-slider" });
        slider.addEventListener("change", () => this.run("number.set_value", { value: slider.valueAsNumber }, id));
        row.append(slider);
      }
      container.append(row);
    }
  }

  renderSettings(node, ids) {
    node.replaceChildren();
    if (!ids.length) {
      node.append(element("p", this.t("Add Dreame entities with the entities option.")));
      return;
    }
    for (const id of ids) {
      const state = this.ha.states[id];
      const a = state.attributes ?? {};
      const [domain] = id.split(".");
      const name = caption(state, id);
      const available = online(state);
      let control;
      let action;
      let payload;
      if (domain === "button") {
        action = "button.press";
        node.append(this.button(name, () => this.run(action, {}, id), !pressable(state) || !hasAction(this.ha, action)));
        continue;
      }
      if (domain === "switch") {
        action = state.state === "on" ? "switch.turn_off" : "switch.turn_on";
        control = element("input", null, { type: "checkbox" });
        control.checked = state.state === "on";
        payload = () => ({});
      } else if (domain === "select" && Array.isArray(a.options)) {
        action = "select.select_option";
        control = element("select");
        control.append(...a.options.map((option) => element("option", option, { value: option })));
        control.value = state.state;
        payload = () => ({ option: control.value });
      } else if (domain === "number" || domain === "time") {
        const attrs = domain === "time" ? { type: "time", step: "1" } : { type: "number" };
        if (domain === "number") {
          for (const key of ["min", "max", "step"]) if (Number.isFinite(a[key])) attrs[key] = a[key];
        }
        control = element("input", null, attrs);
        control.value = state.state;
        action = domain + ".set_value";
        payload = () => domain === "number" ? { value: control.valueAsNumber }
          : { time: control.value.length === 5 ? control.value + ":00" : control.value };
      }
      if (control) {
        control.disabled = !available || !hasAction(this.ha, action);
        control.addEventListener("change", async () => {
          if (!control.checkValidity() || (domain !== "switch" && !control.value)) {
            this.status("Invalid value.", true);
            return;
          }
          if (!await this.run(action, payload(), id)) {
            if (domain === "switch") control.checked = this.ha.states[id]?.state === "on";
            else control.value = this.ha.states[id]?.state ?? "";
          }
        });
        node.append(this.label(name, control));
      } else {
        node.append(element("p", name + " · " + state.state + (a.unit_of_measurement ? " " + a.unit_of_measurement : "")));
      }
    }
  }

  renderRemote(node, action, available) {
    const rotation = element("input", null, { type: "range", min: "-180", max: "180", step: "5", value: "0" });
    const velocity = element("input", null, { type: "range", min: "-200", max: "200", step: "10", value: "0" });
    const form = element("form");
    form.className = "remote-live";
    form.append(this.label(this.t("Rotation"), rotation), this.label(this.t("Speed"), velocity));
    form.append(this.button(this.t("Move one step"), async () => {
      const sent = await this.run(action, { rotation: rotation.valueAsNumber, velocity: velocity.valueAsNumber });
      if (sent) { rotation.value = "0"; velocity.value = "0"; }
    }, !available));
    form.addEventListener("submit", (event) => event.preventDefault());
    node.replaceChildren(form);
  }

  renderEdits(node, edits, available) {
    node.replaceChildren();
    if (!edits.length) return;
    const select = element("select", null, { "aria-label": this.t("Advanced action") });
    select.append(...edits.map(([value, label]) => element("option", this.t(label), { value })));
    select.disabled = !available;
    const form = element("form");
    const fill = () => {
      form.replaceChildren();
      const [key, title, fields] = edits.find(([value]) => value === select.value);
      const restriction = key === "set_restricted_zone";
      const snapshot = this.restrictions;
      for (const [name, type, required] of fields) {
        const input = element("input", null, { name, type: type === "int" ? "number" : "text" });
        input.required = Boolean(required);
        if (type === "list") input.placeholder = "JSON […]";
        if (type === "object") input.placeholder = "JSON {…}";
        if (type === "bool") input.placeholder = "true / false";
        form.append(this.label(name, input));
      }
      const ack = element("input", null, { type: "checkbox" });
      form.append(this.label(this.t("Confirm this action on the robot"), ack));
      form.append(this.button(this.t("Apply"), async () => {
        if (!form.reportValidity()) return;
        if (!ack.checked) {
          this.status("Confirm the action · " + this.t(title), true);
          return;
        }
        try {
          const values = Object.fromEntries(new FormData(form));
          values.confirm = ack.checked;
          const data = mapEditPayload(key, values);
          ack.checked = false;
          if (restriction) await this.writeRestrictions(snapshot, data);
          else await this.run(dreame(key), data);
        } catch (error) { this.status(error.message, true); }
      }, !available || (restriction && !this.canEditRestrictions(snapshot))));
    };
    select.addEventListener("change", fill);
    form.addEventListener("submit", (event) => event.preventDefault());
    fill();
    node.append(select, form);
  }
}

if (globalThis.customElements && !customElements.get("dreame-open-card")) {
  customElements.define("dreame-open-card", DreameOpenCard);
  globalThis.customCards ??= [];
  globalThis.customCards.push({ type: "dreame-open-card", name: "Dreame Open Card",
    description: "Dreame controls and maps for Home Assistant." });
}
