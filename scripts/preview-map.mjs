import { createServer } from "node:http";
import { readFile } from "node:fs/promises";

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
  furnitures: [[680, 560, 100, 120, 2, 0, 0, 100, 2, 1]],
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
  if (url.pathname === "/api/camera_proxy/camera.fixture_map") {
    response.writeHead(200, { "Content-Type": "image/svg+xml" });
    return response.end(fallback);
  }
  if (url.pathname === "/api/camera_map_data_proxy/camera.fixture_map") {
    if (url.searchParams.get("v") === "43") return response.writeHead(404).end();
    response.writeHead(200, { "Content-Type": "application/json" });
    return response.end(JSON.stringify(frame));
  }
  response.writeHead(404).end();
}).listen(4173, "127.0.0.1", () => console.log("Map fixture: http://127.0.0.1:4173"));
