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

export async function callAction(hass, id, action, data = {}) {
  if (["entity_id", "device_id", "area_id", "floor_id", "label_id", "target"].some((key) => Object.hasOwn(data, key))) {
    throw new Error("La cible est déterminée par la configuration de la carte.");
  }
  if (!ENTITY_ID.test(id) || !online(hass?.states?.[id]) || !hasAction(hass, action)) {
    throw new Error("Appareil ou action indisponible.");
  }
  const [domain, service] = action.split(".");
  await hass.callService(domain, service, data, { entity_id: id });
}

export function parseFields(fields, values) {
  const data = {};
  for (const [key, type, required] of fields) {
    const raw = values[key]?.trim();
    if (!raw && !required) continue;
    if (!raw) throw new Error("Champ obligatoire · " + key);
    if (type === "text") {
      data[key] = raw;
    } else if (type === "int") {
      if (!/^-?\d+$/.test(raw) || !Number.isSafeInteger(Number(raw))) throw new Error("Entier attendu · " + key);
      data[key] = Number(raw);
    } else if (type === "bool") {
      if (!["true", "false"].includes(raw)) throw new Error("Booléen attendu · " + key);
      data[key] = raw === "true";
    } else {
      let parsed;
      try { parsed = JSON.parse(raw); } catch { throw new Error("JSON invalide · " + key); }
      if (type === "list" ? !Array.isArray(parsed) : !parsed || typeof parsed !== "object" || Array.isArray(parsed)) {
        throw new Error("Format JSON inattendu · " + key);
      }
      data[key] = parsed;
    }
  }
  if (fields.length && !Object.keys(data).length) throw new Error("Renseignez au moins un champ.");
  return data;
}

const BASIC = [
  ["vacuum.start", "Démarrer", 8192],
  ["vacuum.pause", "Pause", 4],
  ["vacuum.stop", "Arrêter", 8],
  ["vacuum.return_to_base", "Retour à la station", 16],
  ["vacuum.locate", "Localiser", 512],
  [dreame("request_map"), "Actualiser la carte"],
];

const TOOLS = [
  ["spot", "Point", dreame("clean_spot"), 1, (a) => ({ points: a })],
  ["zone", "Zone", dreame("clean_zone"), 2, (a, b) => {
    const zone = mapArea(a, b);
    if (!zone) throw new Error("Choisissez deux coins qui délimitent une surface.");
    return { zone };
  }],
  ["goto", "Aller au point", dreame("goto"), 1, ([x, y]) => ({ x, y })],
];

const EDITS = [
  ["rename_map", "Renommer un étage", [["map_id", "int", true], ["map_name", "text", true]]],
  ["delete_map", "Supprimer un étage", [["map_id", "int", true]]],
  ["save_temporary_map", "Enregistrer le nouveau plan", []],
  ["discard_temporary_map", "Abandonner le nouveau plan", []],
  ["replace_temporary_map", "Remplacer un étage par le nouveau plan", [["map_id", "int", true]]],
  ["rename_segment", "Renommer une pièce", [["segment_id", "int", true], ["segment_name", "text", true]]],
  ["split_segments", "Diviser une pièce", [["segment", "int", true], ["line", "list", true], ["map_id", "int"]]],
  ["merge_segments", "Fusionner des pièces", [["segments", "list", true], ["map_id", "int"]]],
  ["set_restricted_zone", "Remplacer murs virtuels et zones interdites",
    [["walls", "list"], ["zones", "list"], ["no_mops", "list"]]],
  ["set_walls", "Remplacer murs physiques et portes", [["walls", "object"], ["doors", "list"], ["map_id", "int"]]],
  ["set_floor_material", "Matériau du sol", [["material", "object", true], ["map_id", "int"]]],
  ["set_furniture", "Placer le mobilier", [["furnitures", "list", true], ["map_id", "int"]]],
  ["set_custom_carpet_cleaning", "Réglages des tapis",
    [["id", "int", true], ["object_type", "int", true], ["carpet_cleaning", "int", true]]],
  ["set_obstacle_ignore", "Ignorer ou réactiver un obstacle",
    [["x", "int", true], ["y", "int", true], ["obstacle_ignored", "bool", true]]],
  ["set_cleaning_sequence", "Ordre des pièces", [["cleaning_sequence", "list", true]]],
  ["set_custom_cleaning", "Nettoyage personnalisé par pièce",
    [["segment_id", "list", true], ["suction_level", "list", true], ["repeats", "list", true], ["water_volume", "list"],
      ["cleaning_mode", "list"], ["wetness_level", "list"]]],
  ["backup_map", "Sauvegarder un étage", [["map_id", "int", true]]],
  ["restore_map", "Restaurer une sauvegarde", [["map_id", "int", true], ["recovery_map_index", "int", true]]],
  ["start_shortcut", "Lancer un raccourci", [["shortcut_id", "int", true]]],
  ["reset_consumable", "Réinitialiser un consommable", [["consumable", "text", true]]],
];

const STATE_LABELS = {
  docked: "À la station", cleaning: "Nettoyage", paused: "En pause", returning: "Retour à la station",
  idle: "Au repos", error: "Erreur", unavailable: "Indisponible", unknown: "État inconnu",
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
<ha-card><div class="body">
  <header><h2 id="title"></h2><p class="state" id="state"></p></header>
  <div class="row" id="basic" aria-label="Commandes de l’aspirateur"></div>
  <div class="layout">
    <figure id="figure" hidden><div id="map-layer"><img id="map" alt="Carte du robot"></div></figure>
    <section class="panel">
      <div id="floors"></div>
      <div id="rooms"></div>
      <div id="tools"></div>
    </section>
  </div>
  <details id="settings-detail"><summary>Réglages, station et entretien</summary><div id="settings"></div></details>
  <details id="photos-detail" hidden><summary>Historique et photos</summary><div id="photos"></div></details>
  <details id="remote-detail" hidden><summary>Télécommande pas à pas</summary><div id="remote"></div></details>
  <details id="edit-detail" hidden><summary>Édition et gestion des cartes</summary><div id="edit"></div></details>
  <output id="result" role="status" aria-live="polite"></output>
</div></ha-card>`;

function element(tag, text, attrs = {}) {
  const node = document.createElement(tag);
  if (text != null) node.textContent = text;
  for (const [name, value] of Object.entries(attrs)) node.setAttribute(name, value);
  return node;
}

const caption = (state, id) => state?.attributes?.friendly_name || id;
const roomName = (room, id) => room?.name || "Pièce " + id;

class DreameOpenCard extends (globalThis.HTMLElement ?? class {}) {
  constructor() {
    super();
    this.attachShadow({ mode: "open" }).innerHTML = TEMPLATE;
    this.sections = new Map();
    this.picks = [];
    this.pending = new Set();
    this.part("map").addEventListener("click", (event) => this.pickOnMap(event));
  }

  part(id) { return this.shadowRoot.getElementById(id); }

  setConfig(config) {
    if (!/^vacuum\.[a-z0-9_]+$/.test(config.entity ?? "")) throw new Error("Configurez une entité vacuum.");
    if (config.map_camera != null && !/^camera\.[a-z0-9_]+$/.test(config.map_camera)) {
      throw new Error("map_camera doit être une entité camera.");
    }
    if (config.entities != null && (!Array.isArray(config.entities) || config.entities.some((id) => !ENTITY_ID.test(id)))) {
      throw new Error("entities doit contenir des identifiants d’entité.");
    }
    this.config = config;
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
    output.textContent = message;
    output.toggleAttribute("data-error", error);
  }

  async run(action, data = {}, id = this.config.entity) {
    const pendingKey = id + "/" + action;
    if (this.pending.has(pendingKey)) return false;
    this.pending.add(pendingKey);
    try {
      await callAction(this.ha, id, action, data);
      this.status("Commande envoyée.");
      return true;
    } catch (error) {
      this.status(error?.message || "La commande a échoué.", true);
      return false;
    } finally {
      this.pending.delete(pendingKey);
    }
  }

  update() {
    if (!this.config || !this.ha) return;
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
    if (!image) imageNode.removeAttribute("src");
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
    this.part("state").textContent = [STATE_LABELS[state] ?? state,
      (typeof battery === "number" || /^\d+$/.test(battery ?? "")) ? battery + " %" : null,
      ...new Set([error, ...faults]), !relatedCamera ? "Caméra d’un autre appareil" : null].filter(Boolean).join(" · ");

    const basic = BASIC.filter(([action, , flag]) => can(action)
      && (!flag || attrs.supported_features == null || (attrs.supported_features & flag)));
    this.section("basic", [basic, available], (node) => node.replaceChildren(...basic.map(([action, label], i) =>
      this.button(label, () => this.run(action), !available, i === 0))));

    const maps = Array.isArray(attrs.maps) ? attrs.maps.filter((entry) => Number.isSafeInteger(Number(entry?.id)) && Number(entry.id) > 0) : [];
    this.section("floors", [maps, activeMapId, available, can(dreame("select_map"))], (node) => {
      node.replaceChildren();
      if (!maps.length || !can(dreame("select_map"))) return;
      const select = element("select");
      const placeholder = element("option", "Choisir un étage", { value: "" });
      placeholder.disabled = true;
      select.append(placeholder, ...maps.map(({ id, name }) => element("option", name || "Carte " + id, { value: id })));
      select.value = maps.some((entry) => String(entry.id) === String(activeMapId)) ? String(activeMapId) : "";
      select.disabled = !available;
      const button = this.button("Changer d’étage", () => {
        if (select.value) void this.run(dreame("select_map"), { map_id: Number(select.value) });
      }, !available);
      node.append(this.label("Étage", select), button);
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
        node.append(this.label(roomName(room, id), box));
        return box;
      });
      node.prepend(element("h3", "Pièces"));
      node.append(this.button("Nettoyer les pièces", () => {
        const segments = boxes.filter((box) => box.checked).map((box) => Number(box.value));
        if (!segments.length) {
          this.status("Sélectionnez au moins une pièce.", true);
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
      select.append(...tools.map(([key, label]) => element("option", label, { value: key })));
      select.disabled = !available;
      this.toolSelect = select;
      const help = element("p");
      const setHelp = () => {
        const count = this.selectedTool()[3];
        help.textContent = count === 1 ? "Choisissez un point sur la carte." : "Choisissez deux coins opposés.";
      };
      select.addEventListener("change", () => {
        this.picks = [];
        this.showPicks();
        setHelp();
      });
      setHelp();
      const coords = [0, 1].map((i) => element("input", null, { type: "number", step: "1", "aria-label": i ? "Y" : "X" }));
      const fields = element("div", null, { class: "row" });
      fields.append(...coords, this.button("Ajouter les coordonnées", () => {
        const xy = coords.map((input) => input.valueAsNumber);
        if (xy.every(Number.isSafeInteger)) this.addPick(xy);
        else this.status("Saisissez deux coordonnées entières.", true);
      }, !available));
      const buttons = element("div", null, { class: "row" });
      buttons.append(this.button("Envoyer", () => this.sendPicks(), !available, true),
        this.button("Effacer", () => { this.picks = []; this.showPicks(); }));
      node.append(this.label("Sur la carte", select), help, fields, buttons, element("p", "", { id: "coordinates" }));
      this.showPicks();
    });
    this.part("map-layer").classList.toggle("picking", calibrated && available && !!tools.length);

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
    if (!this.selectedTool() || !online(this.ha.states[this.config.entity])) return;
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
      this.status("Complétez la sélection.", true);
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
      node.append(element("p", "Ajoutez les entités Dreame avec l’option entities."));
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
            this.status("Valeur invalide.", true);
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
    form.append(this.label("Rotation", rotation), this.label("Vitesse", velocity));
    form.append(this.button("Déplacer d’un pas", async () => {
      const sent = await this.run(action, { rotation: rotation.valueAsNumber, velocity: velocity.valueAsNumber });
      if (sent) { rotation.value = "0"; velocity.value = "0"; }
    }, !available));
    node.replaceChildren(form);
  }

  renderEdits(node, edits, available) {
    node.replaceChildren();
    if (!edits.length) return;
    const select = element("select", null, { "aria-label": "Action avancée" });
    select.append(...edits.map(([value, label]) => element("option", label, { value })));
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
      form.append(this.label("Confirmer l’action sur le robot", ack));
      form.append(this.button("Appliquer", async () => {
        if (!form.reportValidity()) return;
        if (!ack.checked) {
          this.status("Confirmez l’action · " + title, true);
          return;
        }
        try {
          const data = parseFields(fields, Object.fromEntries(new FormData(form)));
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
    description: "Commandes et cartes Dreame pour Home Assistant." });
}
