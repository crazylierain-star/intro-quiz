const http = require("http");
const WebSocket = require("ws");
const fs = require("fs");
const path = require("path");

const server = http.createServer((req, res) => {
  const filePath =
    req.url === "/"
      ? "/host.html"
      : req.url;

  const fullPath = path.join(__dirname, "public", filePath);

  fs.readFile(fullPath, (err, data) => {
    if (err) {
      res.writeHead(404);
      res.end("Not found");
      return;
    }

    res.writeHead(200);
    res.end(data);
  });
});

const wss = new WebSocket.Server({ server });

let locked = false;

wss.on("connection", (ws) => {
  console.log("🟢 WebSocket client connected");

  ws.on("message", (msg) => {
    console.log("📩 received:", msg.toString());

    const data = JSON.parse(msg);

    if (data.type === "buzz" && !locked) {
      locked = true;

      wss.clients.forEach((c) => {
        if (c.readyState === WebSocket.OPEN) {
          c.send(JSON.stringify({
            type: "buzz",
            name: data.name
          }));
        }
      });
    }

    if (data.type === "reset") {
      locked = false;
      wss.clients.forEach((c) => {
        if (c.readyState === WebSocket.OPEN) {
          c.send(JSON.stringify({ type: "reset" }));
        }
      });
    }
  });

  ws.on("close", () => {
    console.log("🔴 WebSocket client disconnected");
  });
});

const PORT = process.env.PORT || 8080;
server.listen(PORT, () => {
  console.log("HTTP + WebSocket server running on", PORT);
});
