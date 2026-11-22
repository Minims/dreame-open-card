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
const fallback = `<svg xmlns="http://www.w3.org/2000/svg" width="400" height="290">
  <rect x="20" y="30" width="360" height="230" fill="#94b9d8"/>
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
  if (["/api/camera_proxy/camera.fixture_map", "/api/camera_map_obstacle_proxy/camera.fixture_map",
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
