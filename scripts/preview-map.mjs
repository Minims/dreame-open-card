import { createServer } from "node:http";
import { readFile, writeFile } from "node:fs/promises";

const runs = { 1: [], 2: [], 255: [], 512: [] };
for (let y = 1; y < 9; y++) {
  runs[1].push(1, y, 6);
  runs[2].push(8, y, 7);
  runs[255].push(0, y, 1, 15, y, 1);
}
runs[255].push(0, 0, 16, 0, 9, 16);
runs[512].push(9, 3, 4, 9, 4, 4);
const frame = {
  size: [100, 200, 100, 200, 16, 10, 50, 0, [0, 0, 0, 0]],
  data: runs, map_id: 71, saved_map_id: 7, frame_id: 42,
  floor_material: { 2: 3 },
  doors: [[450, 500, 500, 500, 450, 500, 500, 500, 0, 1, 1]],
  walls: { 1: [[150, 600, 400, 600, 150, 610, 400, 610, 0, 1, 0]], 3: [[450, 600, 600, 600]] },
  hidden_segments: [3],
  furnitures: [
    [680, 560, 100, 120, 2, 0, 0, 100, 2, 1],
    [600, 350, 80, 80, 15, 0, 0, 100, 2, 2],
    [285, 420, 70, 70, 25, 0, 0, 100, 1, 3],
    [371, 390, 50, 50, 27, 0, 0, 100, 1, 4],
    [350, 320, 60, 60, 14, 0, 0, 100, 3, 5],
  ],
  charger_position: [225, 595, 90], robot_position: [725, 395, 90],
  path: [[1, 550, 545, 725, 545, 725, 395]],
};
const fallback = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 420 580" width="420" height="580">
  <defs>
    <pattern id="tile" width="16" height="16" patternUnits="userSpaceOnUse">
      <path d="M 16 0 L 0 0 0 16" fill="none" stroke="#2a3b4c" stroke-width="0.8"/>
    </pattern>
    <pattern id="wood" width="24" height="8" patternUnits="userSpaceOnUse">
      <path d="M 0 8 L 24 8 M 12 0 L 12 8" fill="none" stroke="#3d3024" stroke-width="0.8"/>
    </pattern>
  </defs>

  <!-- Floor Fills -->
  <!-- Living Room -->
  <path d="M 35 35 L 210 35 L 210 220 L 35 220 Z" fill="#43361e"/>
  <!-- Kitchen (Navy with tiles) -->
  <path d="M 220 35 L 385 35 L 385 220 L 220 220 Z" fill="#1b2a3a"/>
  <path d="M 220 35 L 385 35 L 385 220 L 220 220 Z" fill="url(#tile)"/>
  <!-- Office (Slate Blue with wood) -->
  <path d="M 35 230 L 210 230 L 210 390 L 35 390 Z" fill="#202c3d"/>
  <path d="M 35 230 L 210 230 L 210 390 L 35 390 Z" fill="url(#wood)"/>
  <!-- Bedroom (Warm Brown) -->
  <path d="M 220 230 L 385 230 L 385 410 L 220 410 Z" fill="#30241b"/>
  <!-- Hallway (Beige/Sand) -->
  <path d="M 35 400 L 210 400 L 210 550 L 35 550 Z" fill="#3a3120"/>
  <!-- Rug in Hallway -->
  <rect x="55" y="425" width="135" height="60" rx="4" fill="#4d3e24" stroke="#c59b27" stroke-width="1.5" stroke-dasharray="4,3"/>
  <!-- Bathroom (Teal Tiles) -->
  <path d="M 220 420 L 385 420 L 385 550 L 220 550 Z" fill="#182d30"/>
  <path d="M 220 420 L 385 420 L 385 550 L 220 550 Z" fill="url(#tile)"/>

  <!-- Furniture silhouettes -->
  <!-- Living room sofa and table -->
  <rect x="65" y="55" width="120" height="42" rx="6" fill="#58482b"/>
  <rect x="95" y="115" width="60" height="32" rx="4" fill="#3d321d"/>
  <!-- Kitchen table & chairs -->
  <rect x="260" y="80" width="85" height="55" rx="6" fill="#36495d"/>
  <rect x="250" y="90" width="6" height="35" rx="3" fill="#475e77"/>
  <rect x="349" y="90" width="6" height="35" rx="3" fill="#475e77"/>
  <!-- Office desk -->
  <rect x="55" y="250" width="90" height="40" rx="4" fill="#32445a"/>
  <!-- Bedroom bed -->
  <rect x="270" y="270" width="95" height="110" rx="6" fill="#423428"/>
  <rect x="280" y="275" width="35" height="22" rx="3" fill="#5a493a"/>
  <rect x="320" y="275" width="35" height="22" rx="3" fill="#5a493a"/>
  <!-- Bathroom tub -->
  <rect x="300" y="440" width="70" height="40" rx="10" fill="#2d4a4d"/>

  <!-- Cleaning Paths (White translucent dashed curves) -->
  <path d="M 60 520 L 60 420 L 90 420 L 90 530 L 120 530 L 120 420 L 150 420 L 150 530 L 180 530 L 180 430
           L 205 320 L 260 320 L 260 250 L 290 250 L 290 330 L 320 330 L 320 250 L 350 250 L 350 330
           L 370 180 L 230 180 L 230 160 L 370 160 L 370 145 L 230 145 L 230 60 L 370 60 L 370 45 L 230 45
           L 180 60 L 180 180 L 150 180 L 150 60 L 120 60 L 120 180 L 90 180 L 90 60 L 60 60 L 60 180"
        fill="none" stroke="#ffffff" stroke-width="1.8" stroke-opacity="0.65" stroke-linecap="round" stroke-linejoin="round"/>

  <!-- Physical Outer Walls -->
  <path d="M 30 30 L 390 30 L 390 555 L 30 555 Z"
        fill="none" stroke="#5a6e85" stroke-width="5" stroke-linejoin="round"/>

  <!-- Interior dividing walls with door openings -->
  <path d="M 215 30 L 215 110 M 215 150 L 215 390 M 215 430 L 215 555" stroke="#495a6d" stroke-width="4" stroke-linecap="round"/>
  <path d="M 30 225 L 110 225 M 150 225 L 390 225" stroke="#495a6d" stroke-width="4" stroke-linecap="round"/>
  <path d="M 30 395 L 120 395 M 160 395 L 390 395" stroke="#495a6d" stroke-width="4" stroke-linecap="round"/>

  <!-- Doors (cyan arcs) -->
  <path d="M 215 110 A 40 40 0 0 1 215 150" fill="none" stroke="#00b4d8" stroke-width="1.5" stroke-dasharray="2,2"/>
  <path d="M 110 225 A 40 40 0 0 1 150 225" fill="none" stroke="#00b4d8" stroke-width="1.5" stroke-dasharray="2,2"/>
  <path d="M 120 395 A 40 40 0 0 1 160 395" fill="none" stroke="#00b4d8" stroke-width="1.5" stroke-dasharray="2,2"/>

  <!-- Dock station in Hallway -->
  <rect x="42" y="515" width="26" height="20" rx="3" fill="#1e293b" stroke="#00bcd4" stroke-width="2"/>
  <path d="M 55 520 L 51 526 L 56 526 L 53 531" fill="none" stroke="#00bcd4" stroke-width="1.5" stroke-linecap="round"/>

  <!-- Robot Position -->
  <circle cx="75" cy="525" r="14" fill="#00bcd4" stroke="#ffffff" stroke-width="2.5"/>
  <polygon points="75,514 81,528 75,524 69,528" fill="#ffffff"/>
</svg>`;
const files = {
  "/": ["../test/structured-map.html", "text/html"],
  "/dreame-open-card.js": ["../dreame-open-card.js", "text/javascript"],
};
createServer(async (request, response) => {
  const url = new URL(request.url, "http://localhost");
  if (Object.hasOwn(files, url.pathname)) {
    const [file, contentType] = files[url.pathname];
    response.writeHead(200, { "Content-Type": contentType, "Cache-Control": "no-store" });
    return response.end(await readFile(new URL(file, import.meta.url)));
  }
  if (url.pathname.startsWith("/Assets/")) {
    const filename = decodeURIComponent(url.pathname.slice(8));
    try {
      const data = await readFile(new URL(`../../Assets/${filename}`, import.meta.url));
      const ext = filename.split(".").pop();
      const mime = ext === "mp4" ? "video/mp4" : ext === "png" ? "image/png" : "application/octet-stream";
      response.writeHead(200, { "Content-Type": mime });
      return response.end(data);
    } catch {
      return response.writeHead(404).end();
    }
  }
  if (["/api/camera_proxy/camera.fixture_map", "/api/camera_proxy/camera.robot_map", "/api/camera_map_obstacle_proxy/camera.fixture_map",
    "/local/floor.png", "/local/upper-walls.png"].includes(url.pathname)) {
    response.writeHead(200, { "Content-Type": "image/svg+xml" });
    return response.end(fallback);
  }
  if (url.pathname === "/api/camera_map_data_proxy/camera.fixture_map") {
    const version = url.searchParams.get("v");
    if (version === "43") return response.writeHead(404).end();
    const map = version === "44" ? { ...frame, frame_id: 44, walls: {}, robot_position: [725, 395, 32767] } : frame;
    response.writeHead(200, { "Content-Type": "application/json" });
    return response.end(JSON.stringify(map));
  }
  response.writeHead(404).end();
}).listen(4173, "127.0.0.1", () => console.log("Map fixture: http://127.0.0.1:4173"));
