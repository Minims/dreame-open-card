export const CARD_VERSION = "2026.11.0a";

const DOMAIN = "dreame_vacuum";
const ENTITY_ID = /^[a-z0-9_]+\.[a-z0-9_]+$/;
const SETTING_DOMAINS = new Set(["button", "select", "number", "switch", "time", "sensor", "binary_sensor"]);
const online = (state) => state && !["unavailable", "unknown"].includes(state.state);
const hasAction = (hass, action) => {
  const [domain, service] = action.split(".");
  return Object.hasOwn(hass?.services?.[domain] ?? {}, service);
};
const dreame = (name) => DOMAIN + ".vacuum_" + name;
const point = (p) => p && typeof p.x === "number" && Number.isFinite(p.x)
  && typeof p.y === "number" && Number.isFinite(p.y);

const FRENCH = {
  "The card configuration determines the target.": "La cible est déterminée par la configuration de la carte.",
  "Device or action unavailable.": "Appareil ou action indisponible.",
  "Required field": "Champ obligatoire",
  "Expected an integer": "Entier attendu",
  "Expected a boolean": "Booléen attendu",
  "Invalid JSON": "JSON invalide",
  "Unexpected JSON format": "Format JSON inattendu",
  "Fill in at least one field.": "Renseignez au moins un champ.",
  "Start": "Démarrer",
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

export function mapPoint(calibration, coords) {
  if (!Array.isArray(calibration) || calibration.length < 3
    || !calibration.slice(0, 3).every((p) => point(p?.map) && point(p?.vacuum))
    || !Array.isArray(coords) || coords.length !== 2 || !coords.every(Number.isFinite)) return null;
  const [a, b, c] = calibration;
  const bx = b.map.x - a.map.x;
  const by = b.map.y - a.map.y;
  const cx = c.map.x - a.map.x;
  const cy = c.map.y - a.map.y;
  const det = bx * cy - by * cx;
  if (!Number.isFinite(det) || Math.abs(det) < 1e-8) return null;
  const dx = coords[0] - a.map.x;
  const dy = coords[1] - a.map.y;
  const u = (dx * cy - dy * cx) / det;
  const v = (bx * dy - by * dx) / det;
  const result = ["x", "y"].map((axis) => Math.round(a.vacuum[axis]
    + u * (b.vacuum[axis] - a.vacuum[axis]) + v * (c.vacuum[axis] - a.vacuum[axis])));
  return result.every(Number.isSafeInteger) ? result : null;
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

export function buildCleaningTask(mode, selection = {}) {
  const integerPoint = (value) => Array.isArray(value) && value.length === 2
    && value.every((part) => Number.isSafeInteger(part)) ? value : null;
  if (mode === "global") return { action: "vacuum.start", data: {} };
  if (mode === "room") {
    if (!Array.isArray(selection.rooms) || !selection.rooms.length || !selection.rooms.every((id) => Number.isSafeInteger(id) && id > 0)) {
      throw new Error("Choose at least one room.");
    }
    return { action: dreame("clean_segment"), data: { segments: [...selection.rooms] } };
  }
  if (mode === "zone") {
    const corners = selection.corners;
    if (!Array.isArray(corners) || corners.length !== 2 || !corners.every(integerPoint)) throw new Error("Choose two corners for the zone.");
    const zone = mapArea(corners[0], corners[1]);
    if (!zone) throw new Error("Choose two corners for the zone.");
    return { action: dreame("clean_zone"), data: { zone } };
  }
  if (mode === "spot") {
    const pointValue = integerPoint(selection.point);
    if (!pointValue) throw new Error("Choose a valid spot point.");
    return { action: dreame("clean_spot"), data: { points: [pointValue] } };
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
  return parseFields(definitions[operation], values);
}

export function validateCardConfig(config = {}) {
  if (!["default", "panel"].includes(config.mode ?? "default")) throw new Error("mode must be default or panel.");
  const map = config.map ?? {};
  if (map.scale != null && (!Number.isFinite(map.scale) || map.scale <= 0)) throw new Error("map.scale must be positive.");
  if (map.rotation != null && (!Number.isFinite(map.rotation) || map.rotation < -360 || map.rotation > 360)) throw new Error("map.rotation is invalid.");
  if (map.offset != null && (!Array.isArray(map.offset) || map.offset.length !== 2 || !map.offset.every(Number.isFinite))) throw new Error("map.offset must contain two numbers.");
  if (config.features != null && (typeof config.features !== "object" || Array.isArray(config.features))) throw new Error("features must be an object.");
  return true;
}

export async function callAction(hass, id, action, data = {}) {
  if (["entity_id", "device_id", "area_id", "floor_id", "label_id", "target"].some((key) => Object.hasOwn(data, key))) {
    throw new Error("The card configuration determines the target.");
  }
  if (!ENTITY_ID.test(id) || !online(hass?.states?.[id]) || !hasAction(hass, action)) {
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
  ["spot", "Clean a spot", dreame("clean_spot"), 1, (a) => ({ points: a })],
  ["zone", "Clean a zone", dreame("clean_zone"), 2, (a, b) => {
    const zone = mapArea(a, b);
    if (!zone) throw new Error("Choose two corners that enclose an area.");
    return { zone };
  }],
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

const TEMPLATE = `
<style>
  :host { display:block; color:var(--primary-text-color,#16251f); }
  ha-card { --accent:var(--primary-color,#187a62); }
  .body { padding:clamp(14px,3vw,24px); display:grid; gap:16px; }
  h2,h3,p { margin:0; }
  h2 { font-size:1.45rem; }
  h3 { font-size:1.025rem; }
  header, .row { display:flex; flex-wrap:wrap; align-items:center; gap:8px; }
  header { justify-content:space-between; }
  .state { color:var(--secondary-text-color,#50635a); }
  .layout { display:grid; grid-template-columns:minmax(0,2fr) minmax(0,1fr); gap:16px; }
  .body.panel-mode { padding:clamp(18px,4vw,34px); }
  .body.panel-mode .layout { grid-template-columns:minmax(0,3fr) minmax(280px,1fr); }
  .layout:has(figure[hidden]) { grid-template-columns:minmax(0,1fr); }
  .panel { min-width:0; display:grid; align-content:start; gap:12px; }
  figure { display:grid; place-items:center; position:relative; margin:0; overflow:hidden; border-radius:14px;
    background:var(--secondary-background-color,#e8efeb); min-height:100px; }
  #map-layer { position:relative; max-width:100%; width:max-content; line-height:0; }
  img { display:block; max-width:100%; max-height:65vh; height:auto; object-fit:contain; }
  #map-layer.picking img { cursor:crosshair; }
  .pin { pointer-events:none; position:absolute; width:12px; height:12px; transform:translate(-50%,-50%);
    border:2px solid white; border-radius:50%; background:var(--accent); box-shadow:0 0 0 1px #26352d; }
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
  output { display:block; min-height:1.25em; }
  output[data-error] { color:var(--error-color,#a62222); }
  [hidden] { display:none !important; }
  @media (max-width:650px) { .layout { grid-template-columns:minmax(0,1fr); } }
</style>
<ha-card><div class="body" lang="en">
  <header><h2 id="title"></h2><p class="state" id="state"></p></header>
  <div class="row" id="basic" aria-label="Vacuum controls"></div>
  <div class="layout">
    <figure id="figure" hidden><div id="map-layer"><img id="map" alt="Robot map"></div></figure>
    <section class="panel">
      <div id="floors"></div>
      <div id="rooms"></div>
      <div id="tools"></div>
    </section>
  </div>
  <details id="settings-detail"><summary data-i18n>Settings, dock and maintenance</summary><div id="settings"></div></details>
  <details id="photos-detail" hidden><summary data-i18n>History and photos</summary><div id="photos"></div></details>
  <details id="remote-detail" hidden><summary data-i18n>Step-by-step remote control</summary><div id="remote"></div></details>
  <details id="edit-detail" hidden><summary data-i18n>Map editing and management</summary><div id="edit"></div></details>
  <output id="result" role="status" aria-live="polite"></output>
</div></ha-card>`;

function element(tag, text, attrs = {}) {
  const node = document.createElement(tag);
  if (text != null) node.textContent = text;
  for (const [name, value] of Object.entries(attrs)) node.setAttribute(name, value);
  return node;
}

const caption = (state, id) => state?.attributes?.friendly_name || id;

class DreameOpenCard extends (globalThis.HTMLElement ?? class {}) {
  constructor() {
    super();
    this.attachShadow({ mode: "open" }).innerHTML = TEMPLATE;
    this.sections = new Map();
    this.language = "en";
    this.picks = [];
    this.pending = new Set();
    this.part("map").addEventListener("click", (event) => this.pickOnMap(event));
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
    this.shadowRoot.querySelector(".body").classList.toggle("panel-mode", config.mode === "panel");
    this.sections.clear();
    this.scope = undefined;
    this.picks = [];
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

  status(message, error = false) {
    const output = this.part("result");
    this.statusMessage = message;
    output.textContent = this.t(message);
    output.toggleAttribute("data-error", error);
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
    const scope = JSON.stringify([entity, map_camera, activeMapId, cameraMapId, this.calibration, available]);
    if (scope !== this.scope) {
      this.scope = scope;
      this.picks = [];
      this.showPicks();
    }

    this.part("title").textContent = title || caption(vacuum, "Dreame");
    const battery = attrs.battery_level ?? attrs.battery;
    const state = vacuum?.state ?? "unavailable";
    const error = typeof attrs.error === "string" && !/^(none|no_error|unknown|ok)$/i.test(attrs.error) ? attrs.error : null;
    const faults = Object.values(attrs.faults ?? {}).filter((fault) => typeof fault === "string");
    this.part("state").textContent = [this.t(STATE_LABELS[state] ?? state),
      (typeof battery === "number" || /^\d+$/.test(battery ?? "")) ? battery + " %" : null,
      ...new Set([error, ...faults]), !relatedCamera ? this.t("Camera belongs to another device") : null].filter(Boolean).join(" · ");

    const basic = BASIC.filter(([action, , flag]) => can(action)
      && (!flag || attrs.supported_features == null || (attrs.supported_features & flag)));
    this.section("basic", [basic, available], (node) => node.replaceChildren(...basic.map(([action, label], i) =>
      this.button(this.t(label), () => this.run(action), !available, i === 0))));

    const maps = Array.isArray(attrs.maps) ? attrs.maps.filter((entry) => Number.isSafeInteger(Number(entry?.id)) && Number(entry.id) > 0) : [];
    this.section("floors", [maps, activeMapId, available, can(dreame("select_map"))], (node) => {
      node.replaceChildren();
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

    const selectedRooms = Object.entries(
      (liveMap ? map.rooms : null) ?? (attrs.selected_map ? attrs.rooms?.[attrs.selected_map] : null) ?? {},
    ).map(([key, room]) => [Number(room?.id ?? key), room])
      .filter(([id]) => Number.isSafeInteger(id) && id > 0);
    this.section("rooms", [selectedRooms, activeMapId, available, can(dreame("clean_segment"))], (node) => {
      node.replaceChildren();
      if (!selectedRooms.length || !can(dreame("clean_segment"))) return;
      const boxes = selectedRooms.map(([id, room]) => {
        const box = element("input", null, { type: "checkbox", value: id });
        box.disabled = !available;
        node.append(this.label(room?.name || this.t("Room") + " " + id, box));
        return box;
      });
      node.prepend(element("h3", this.t("Rooms")));
      node.append(this.button(this.t("Clean rooms"), () => {
        const segments = boxes.filter((box) => box.checked).map((box) => Number(box.value));
        if (!segments.length) {
          this.status("Select at least one room.", true);
          return;
        }
        void this.run(dreame("clean_segment"), { segments });
      }, !available));
    });

    const tools = TOOLS.filter(([, , action]) => can(action));
    const calibrated = Boolean(mapPoint(this.calibration, [0, 0]));
    this.section("tools", [tools.map(([key]) => key), calibrated, available], (node) => {
      node.replaceChildren();
      this.toolSelect = null;
      if (!tools.length || !calibrated) return;
      const select = element("select");
      select.append(...tools.map(([key, label]) => element("option", this.t(label), { value: key })));
      select.disabled = !available;
      this.toolSelect = select;
      const help = element("p");
      const setHelp = () => {
        const count = this.selectedTool()[3];
        help.textContent = this.t(count === 1 ? "Choose a point on the map." : "Choose two opposite corners.");
      };
      select.addEventListener("change", () => {
        this.picks = [];
        this.showPicks();
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
      const buttons = element("div", null, { class: "row" });
      buttons.append(this.button(this.t("Send"), () => this.sendPicks(), !available, true),
        this.button(this.t("Clear"), () => { this.picks = []; this.showPicks(); }));
      node.append(this.label(this.t("On the map"), select), help, fields, buttons, element("p", "", { id: "coordinates" }));
      this.showPicks();
    });
    const display = this.config.map ?? {};
    const transformed = (display.rotation ?? 0) !== 0 || (display.scale ?? 1) !== 1 || (display.offset ?? [0, 0]).some((part) => part !== 0);
    this.part("map-layer").classList.toggle("picking", calibrated && available && !!tools.length && !transformed);

    const ids = deviceEntities(this.ha, this.config);
    const settingActions = ["button.press", "switch.turn_on", "switch.turn_off", "number.set_value",
      "select.select_option", "time.set_value"].map(can);
    const settingsSignature = ids.map((id) => {
      const { state, attributes: a = {} } = this.ha.states[id];
      return [id, state, a.friendly_name, a.options, a.unit_of_measurement, a.min, a.max, a.step];
    });
    this.section("settings", [settingsSignature, settingActions], (node) => this.renderSettings(node, ids));

    const pictures = image ? ["cleaning_history_picture", "cruising_history_picture", "recovery_map_picture", "obstacle_picture"]
      .flatMap((key) => Object.entries(map[key] ?? {}))
      .filter(([, url]) => localImage(url)) : [];
    this.part("photos-detail").hidden = !pictures.length;
    this.section("photos", pictures, (node) => {
      node.replaceChildren();
      for (const [label, url] of pictures) node.append(element("a", label, { href: url, target: "_blank", rel: "noopener noreferrer" }));
    });

    const remote = dreame("remote_control_move_step");
    this.part("remote-detail").hidden = !can(remote);
    this.section("remote", [can(remote), available], (node) => this.renderRemote(node, remote, available));
    const edits = EDITS.filter(([key]) => can(dreame(key))
      && (!key.endsWith("temporary_map") || attrs.has_temporary_map === true));
    this.part("edit-detail").hidden = !edits.length;
    this.section("edit", [edits.map(([key]) => key), available, activeMapId], (node) => this.renderEdits(node, edits, available));
  }

  label(text, input) {
    const label = element("label", text);
    label.append(input);
    return label;
  }

  selectedTool() { return TOOLS.find(([key]) => key === this.toolSelect?.value); }

  pickOnMap(event) {
    const display = this.config.map ?? {};
    const transformed = (display.rotation ?? 0) !== 0 || (display.scale ?? 1) !== 1 || (display.offset ?? [0, 0]).some((part) => part !== 0);
    if (transformed || !this.selectedTool() || !online(this.ha.states[this.config.entity])) return;
    const img = this.part("map");
    // Avoid using the previous decoded image while the current image is loading.
    if (!img.complete || !img.naturalWidth) return;
    const rect = img.getBoundingClientRect();
    if (!rect.width || !rect.height) return;
    const x = (event.clientX - rect.left) / rect.width;
    const y = (event.clientY - rect.top) / rect.height;
    if (x < 0 || x > 1 || y < 0 || y > 1) return;
    const coords = mapPoint(this.calibration, [x * img.naturalWidth, y * img.naturalHeight]);
    if (coords) this.addPick(coords, [x, y]);
  }

  addPick(coords, pin) {
    const tool = this.selectedTool();
    if (!tool) return;
    if (this.picks.length >= tool[3]) this.picks = [];
    this.picks.push({ coords, pin });
    this.showPicks();
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
  }

  async sendPicks() {
    const tool = this.selectedTool();
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
        node.append(this.button(name, () => this.run(action, {}, id), !available || !hasAction(this.ha, action)));
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
