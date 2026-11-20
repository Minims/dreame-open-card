export const CARD_VERSION = "2026.11.0a";

const DOMAIN = "dreame_vacuum";
const ENTITY_ID = /^[a-z0-9_]+\.[a-z0-9_]+$/;
const SETTING_DOMAINS = new Set(["button", "select", "number", "switch", "time", "sensor", "binary_sensor"]);
const PANEL_FEATURES = ["dock", "maintenance", "history", "remote", "editing"];
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
  "Edit floor": "Modifier l’étage",
  "Background image": "Image de fond",
  "Overlay image": "Image superposée",
  "Save floor view": "Enregistrer la vue de l’étage",
  "Schedules": "Programmation",
  "Shortcuts": "Raccourcis",
  "New schedule": "Nouvelle programmation",
  "New shortcut": "Nouveau raccourci",
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

export function scheduleEntries(attributes = {}) {
  return Object.entries(attributes).flatMap(([name, value]) => value && typeof value === "object"
    ? [{ name, enabled: value.enabled !== false, time: value.time ?? value.start_time ?? null, days: value.days ?? [] }] : []);
}

export function shortcutEntries(attributes = {}) {
  return Object.entries(attributes).flatMap(([name, value]) => value && typeof value === "object"
    ? [{ name, tasks: Array.isArray(value.tasks) ? value.tasks.length : null }] : []);
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
    validateCoordinateRows(payload.zones, "zones", [4, 8]);
    validateCoordinateRows(payload.no_mops, "no_mops", [4, 8]);
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

export function validateCardConfig(config = {}) {
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
    [["walls", "list"], ["zones", "list"], ["no_mops", "list"]]],
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
  .body { position:relative; padding:16px 8px 20px; display:grid; gap:16px; }
  h2,h3,p { margin:0; }
  h2 { font-size:20px; font-weight:500; }
  h3 { font-size:1.025rem; }
  .row, #telemetry { display:flex; flex-wrap:wrap; align-items:center; gap:8px; }
  header { text-align:center; padding-inline:38px; }
  .state { color:var(--secondary-text-color,#505050); margin-top:5px; }
  #telemetry { justify-content:space-evenly; width:min(100%,560px); margin:6px auto 12px; }
  #telemetry:empty, #rail:not(:has(> :not([hidden]))), #quick:empty, #modes:empty { display:none; }
  #telemetry span { display:inline-flex; align-items:center; gap:5px; font-size:20px; }
  #telemetry small { font-size:11px; color:var(--secondary-text-color,#505050); }
  .stage { display:grid; grid-template-columns:40px minmax(0,1fr) 40px; align-items:end; gap:6px; }
  .stage:has(figure[hidden]):has(#quick:empty) { display:none; }
  figure { grid-column:2; display:grid; place-items:center; margin:0; overflow:hidden; }
  #map-layer { position:relative; max-width:100%; width:max-content; line-height:0; }
  img { display:block; max-width:100%; max-height:68vh; height:auto; object-fit:contain; }
  .panel-mode img { max-width:min(100%,804px); max-height:58vh; }
  #quick { grid-column:3; display:grid; align-content:end; gap:8px; }
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
  #basic button { flex:1 1 auto; font-size:13px; font-weight:600; letter-spacing:.04em; text-transform:uppercase;
    background:#007d9d; box-shadow:0 2px 4px #0004; }
  .body:not([data-mode="global"]) #basic [data-action="vacuum.start"] { display:none; }
  button ha-icon { --mdc-icon-size:20px; vertical-align:middle; }
  #rail, #views:not([hidden]) { display:grid; gap:8px; margin-inline:8px; }
  #map-layer.picking img { cursor:crosshair; }
  .pin { pointer-events:none; position:absolute; width:12px; height:12px; transform:translate(-50%,-50%);
    border:2px solid white; border-radius:50%; background:var(--accent); box-shadow:0 0 0 1px #26352d; }
  #room-markers { position:absolute; inset:0; pointer-events:none; }
  #zone-overlay, #zone-overlay svg { position:absolute; inset:0; width:100%; height:100%; pointer-events:none; }
  #zone-overlay polygon { fill:#008dc53a; stroke:#006ab6; stroke-width:2;
    vector-effect:non-scaling-stroke; stroke-dasharray:5 3; }
  #zone-overlay button { position:absolute; transform:translate(-50%,-50%); pointer-events:auto;
    touch-action:none; cursor:grab; width:28px; height:28px; min-height:0; padding:0;
    border:2px solid #006ab6; border-radius:50%; color:#00588b; background:white; }
  #zone-list:empty { display:none; }
  #dock-dialog { position:fixed; inset:auto 0 0; box-sizing:border-box; width:min(100%,460px); max-height:80vh;
    border:1px solid var(--divider-color,#d9d9d9); border-radius:20px 20px 0 0; padding:16px;
    color:inherit; background:var(--card-background-color,#fff); }
  #dock-dialog::backdrop { background:#0006; }
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
  #editor-detail, #schedule-detail, #shortcut-detail { border-top:1px solid var(--divider-color,#ddd); padding-top:10px; }
  #editor-detail form, #schedule-detail form, #shortcut-detail form { display:grid; gap:8px; }
  #editor-detail input[type=url] { width:100%; }
  .remote-live { display:grid; grid-template-columns:1fr 1fr; gap:10px; }
  .remote-live input { width:100%; }
  #room-markers button { position:absolute; transform:translate(-50%,-50%); pointer-events:auto;
    border-radius:20px; border:2px solid white; background:#253e59; color:white;
    min-height:32px; max-width:85%; overflow:hidden; text-overflow:ellipsis; white-space:nowrap; line-height:1.2; }
  #room-markers button[aria-pressed="true"] { background:#007d9d; z-index:1; }
  #room-markers button[data-order]::before { content:attr(data-order) " · "; }
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
  <header><h2 id="title"></h2><p class="state" id="state"></p></header>
  <details id="menu"><summary aria-label="Menu"><ha-icon icon="mdi:dots-vertical" aria-hidden="true"></ha-icon></summary><div id="menu-items"></div></details>
  <div id="telemetry"></div>
  <div class="stage">
    <figure id="figure" hidden><div id="map-layer"><img id="map" alt="Robot map"><div id="room-markers" hidden></div><div id="zone-overlay" hidden></div></div></figure>
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
  <details id="settings-detail"><summary data-i18n>Settings, dock and maintenance</summary><div id="settings"></div></details>
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
    this.pending = new Set();
    const map = this.part("map");
    map.addEventListener("click", (event) => this.pickOnMap(event));
    for (const event of ["load", "error"]) map.addEventListener(event, () => {
      this.renderRoomMarkers();
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
    this.sections.clear();
    this.scope = undefined;
    this.clearPicks();
    this.update();
  }

  static getStubConfig(hass) {
    const entity = Object.keys(hass.states).find((id) => id.startsWith("vacuum."));
    return entity ? { entity } : {};
  }

  getCardSize() { return this.config?.map_camera ? 8 : 4; }

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
    if (changed) this.clearPicks();
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
    this.renderRoomMarkers();
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
      if (order) marker.dataset.order = order;
      else delete marker.dataset.order;
    }
    this.updateTargetButton();
  }

  renderRoomMarkers() {
    const img = this.part("map");
    const target = this.part("room-markers");
    target.hidden = this.mode !== "room" || !this.mapPicking || !img.complete || !img.naturalWidth;
    if (target.hidden) return;
    const markers = this.markerRooms.flatMap(([id, room, label]) => {
      // shortcut: use labelled bounds centers rather than hit regions until a room mask is available.
      const position = roomMarkerPosition(this.calibration, room, img.naturalWidth, img.naturalHeight);
      return position ? [[id, label, ...position]] : [];
    });
    this.section("room-markers", markers, (node) => node.replaceChildren(...markers.map(([id, label, x, y]) => {
      const button = this.button(label, () => this.toggleRoom(id, !this.roomSelection.has(id)));
      button.dataset.room = id;
      button.style.left = `${x * 100}%`;
      button.style.top = `${y * 100}%`;
      return button;
    })));
    this.syncRoomSelection();
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
    button.disabled = !online(this.ha?.states[this.config.entity]) || !ready;
    button.lastChild.textContent = " " + this.t(this.mode === "goto" ? "Go to point" : "Clean");
  }

  sendTargetTask() {
    if (this.mode === "global") return;
    if (this.mode !== "room") return this.sendPicks();
    if (!this.roomSelection.size) return;
    const { action, data: payload } = buildCleaningTask("room", { rooms: [...this.roomSelection] });
    return this.run(action, payload);
  }

  renderMenu(basic, available) {
    const panels = [["edit-detail", "Map editing and management", "home-edit"], ["photos-detail", "History and photos", "history"],
      ["maintenance-detail", "Accessory usage", "wrench-outline"],
      ["remote-detail", "Step-by-step remote control", "gamepad-variant-outline"], ["settings-detail", "Settings, dock and maintenance", "tune"]]
      .filter(([id]) => !this.part(id).hidden);
    const quick = panels.filter(([id]) => id !== "maintenance-detail" && id !== "objects-detail");
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

  renderFloorEditor(map, available, activeMapId) {
    const hasEdit = this.config.features?.editing !== false && this.config.map?.background !== undefined;
    this.part("editor-detail").hidden = !hasEdit;
    if (!hasEdit) return;
    this.section("editor", [this.config.map, activeMapId], (node) => {
      node.replaceChildren();
      const form = element("form");
      const background = element("input", null, { type: "url", name: "background", value: this.config.map?.background ?? "", placeholder: "/local/floor.png" });
      const overlay = element("input", null, { type: "url", name: "overlay", value: this.config.map?.overlay ?? "", placeholder: "/local/overlay.png" });
      form.append(this.label(this.t("Background image"), background), this.label(this.t("Overlay image"), overlay));
      form.append(this.button(this.t("Save floor view"), () => {
        const next = { ...(this.config.map ?? {}), background: background.value.trim(), overlay: overlay.value.trim() };
        this.config = { ...this.config, map: next };
        this.update();
        this.status("Command sent.");
      }, !available, true));
      form.addEventListener("submit", (event) => event.preventDefault());
      node.append(form, element("p", `${this.t("Floor")} ${activeMapId ?? "1"}`));
    });
  }

  renderCollectionPanel(id, title, entries, action, available, actionLabel) {
    const panel = this.part(id);
    panel.hidden = !entries.length;
    this.section(id, entries, (node) => {
      node.replaceChildren(...entries.map(({ name, enabled, time, days, tasks }) => {
        const row = element("div", null, { class: "history-row" });
        row.append(element("strong", name));
        if (time) row.append(element("small", `${this.t("Start time")}: ${time}`));
        if (days?.length) row.append(element("small", `${this.t("Days")}: ${days.join(", ")}`));
        if (tasks !== undefined && tasks !== null) row.append(element("small", `${tasks} tasks`));
        const button = this.button(this.t(actionLabel), () => this.run(action, { name }), !available);
        if (enabled === false) row.append(element("small", "Disabled"));
        row.append(button);
        return row;
      }));
      if (!entries.length) node.append(element("p", title));
    });
  }

  renderSchedulesAndShortcuts(ids, available) {
    const schedule = ids.find((id) => id.endsWith("_scheduled_clean") || id.includes("schedule"));
    const shortcut = ids.find((id) => id.endsWith("_shortcuts") || id.includes("shortcut"));
    const schedules = scheduleEntries(schedule ? this.ha.states[schedule]?.attributes : {});
    const shortcuts = shortcutEntries(shortcut ? this.ha.states[shortcut]?.attributes : {});
    const action = hasAction(this.ha, dreame("start_shortcut")) ? dreame("start_shortcut") : "";
    this.renderCollectionPanel("schedules", "Schedules", schedules, action, available && Boolean(action), "New schedule");
    this.renderCollectionPanel("shortcuts", "Shortcuts", shortcuts, action, available && Boolean(action), "Run shortcut");
    this.part("schedule-detail").hidden = !schedules.length;
    this.part("shortcut-detail").hidden = !shortcuts.length;
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

  update() {
    if (!this.config || !this.ha) return;
    this.updateLanguage();
    const { entity, map_camera, title } = this.config;
    const vacuum = this.ha.states[entity];
    const attrs = vacuum?.attributes ?? {};
    const camera = this.ha.states[map_camera];
    const map = camera?.attributes ?? {};
    const available = online(vacuum);
    const can = (action) => hasAction(this.ha, action);
    const activeMapId = attrs.selected_map_id;
    const cameraMapId = map.saved_map_id ?? map.map_id;
    const robotDevice = this.ha.entities?.[entity]?.device_id;
    const cameraDevice = this.ha.entities?.[map_camera]?.device_id;
    const relatedCamera = !(robotDevice && cameraDevice && robotDevice !== cameraDevice);
    const liveMap = relatedCamera && online(camera) && map.selected !== false
      && (activeMapId == null || cameraMapId == null || String(activeMapId) === String(cameraMapId));
    const image = relatedCamera && online(camera) ? localImage(map.entity_picture) : null;
    const imageNode = this.part("map");
    this.part("figure").hidden = !image;
    if (image && imageNode.getAttribute("src") !== image) imageNode.setAttribute("src", image);
    if (image) {
      const display = this.config.map ?? {};
      const [x, y] = display.offset ?? [0, 0];
      imageNode.style.transform = `translate(${x}px, ${y}px) rotate(${display.rotation ?? 0}deg) scale(${display.scale ?? 1})`;
      imageNode.style.transformOrigin = "center";
    } else {
      imageNode.removeAttribute("src");
      imageNode.style.removeProperty("transform");
    }
    this.calibration = image && liveMap ? map.calibration_points : null;
    const scope = JSON.stringify([entity, map_camera, activeMapId, attrs.selected_map, cameraMapId, this.calibration, available]);
    if (scope !== this.scope) {
      this.scope = scope;
      this.roomSelection.clear();
      this.clearPicks();
    }

    this.part("title").textContent = title || caption(vacuum, "Dreame");
    const state = vacuum?.state ?? "unavailable";
    const error = typeof attrs.error === "string" && !/^(none|no_error|unknown|ok)$/i.test(attrs.error) ? attrs.error : null;
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
    this.section("floors", [maps, activeMapId, available, can(dreame("select_map"))], (node) => {
      node.replaceChildren();
      node.hidden = true;
      if (!maps.length || !can(dreame("select_map"))) return;
      const select = element("select");
      const placeholder = element("option", this.t("Choose a floor"), { value: "" });
      placeholder.disabled = true;
      select.append(placeholder, ...maps.map(({ id, name }) => element("option", name || this.t("Map") + " " + id, { value: id })));
      select.value = maps.some((entry) => String(entry.id) === String(activeMapId)) ? String(activeMapId) : "";
      select.disabled = !available;
      const button = this.button(this.t("Switch floor"), () => {
        if (select.value) void this.run(dreame("select_map"), { map_id: Number(select.value) });
      }, !available);
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
    const calibrated = Boolean(mapPoint(this.calibration, [0, 0]));
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
        if (xy.every(Number.isSafeInteger)) this.addPick(xy);
        else this.status("Enter two whole-number coordinates.", true);
      }, !available));
      const clear = this.button(this.t("Clear"), () => this.clearPicks());
      node.append(select, help, fields, clear, element("p", "", { id: "coordinates" }), element("div", null, { id: "zone-list", class: "row" }));
      this.showPicks();
    });
    const display = this.config.map ?? {};
    const transformed = (display.rotation ?? 0) !== 0 || (display.scale ?? 1) !== 1 || (display.offset ?? [0, 0]).some((part) => part !== 0);
    this.mapPicking = calibrated && available && !transformed;

    const ids = deviceEntities(this.ha, this.config);
    const settingActions = ["button.press", "switch.turn_on", "switch.turn_off", "number.set_value",
      "select.select_option", "time.set_value"].map(can);
    const settingsSignature = ids.map((id) => {
      const { state, attributes: a = {} } = this.ha.states[id];
      return [id, state, a.friendly_name, a.options, a.unit_of_measurement, a.min, a.max, a.step];
    });
    this.section("settings", [settingsSignature, settingActions], (node) => this.renderSettings(node, ids));
    this.renderMaintenance();
    this.renderMapObjects(map);
    this.renderFloorEditor(map, available, activeMapId);
    this.renderSchedulesAndShortcuts(ids, available);

    const history = [["cleaning_history", "Cleaning history"], ["cruising_history", "Cruising history"]].map(([key, label]) => {
      const id = dreameEntity(this.ha, this.config, ids, "sensor", key);
      const rows = historyEntries(this.ha.states[id]?.attributes, image ? map[`${key}_picture`] : null, map_camera);
      return [label, rows];
    }).filter(([, rows]) => rows.length);
    const joined = new Set(history.flatMap(([, rows]) => rows.map((row) => row.image)));
    const pictures = image ? ["cleaning_history_picture", "cruising_history_picture", "obstacle_picture"]
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
    this.section("edit", [edits.map(([key]) => key), available, activeMapId], (node) => this.renderEdits(node, edits, available));
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
    if (this.part("tools").hidden || !this.selectedTool()) return;
    const pick = this.mapPointer(event);
    if (pick) this.addPick(pick.coords, pick.pin);
  }

  mapPointer(event) {
    if (!this.mapPicking) return null;
    const img = this.part("map");
    // Avoid using the previous decoded image while the current image is loading.
    if (!img.complete || !img.naturalWidth) return null;
    const rect = img.getBoundingClientRect();
    if (!rect.width || !rect.height) return null;
    const x = (event.clientX - rect.left) / rect.width;
    const y = (event.clientY - rect.top) / rect.height;
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
      const pixels = [img.naturalWidth, img.naturalHeight].map((size, axis) =>
        Math.max(0, Math.min(size, position[axis] * size + delta[axis] * Math.max(1, size / 100))));
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
    this.updateTargetButton();
  }

  async sendPicks() {
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
    let timer;
    const send = () => {
      if (!available) return;
      void this.run(action, { rotation: rotation.valueAsNumber, velocity: velocity.valueAsNumber });
    };
    const stop = () => {
      clearInterval(timer);
      timer = undefined;
      rotation.value = "0";
      velocity.value = "0";
      send();
    };
    for (const control of [rotation, velocity]) {
      control.addEventListener("input", () => {
        if (!timer && available) {
          send();
          timer = setInterval(send, 250);
        }
      });
      control.addEventListener("change", stop);
      control.addEventListener("pointerup", stop);
      control.addEventListener("blur", stop);
    }
    form.className = "remote-live";
    form.append(this.label("Rotation", rotation), this.label(this.t("Speed"), velocity));
    form.append(this.button(this.t("Move one step"), async () => {
      const sent = await this.run(action, { rotation: rotation.valueAsNumber, velocity: velocity.valueAsNumber });
      if (sent) { rotation.value = "0"; velocity.value = "0"; }
    }, !available));
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
          await this.run(dreame(key), data);
        } catch (error) { this.status(error.message, true); }
      }, !available));
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
