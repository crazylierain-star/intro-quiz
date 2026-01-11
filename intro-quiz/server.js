const WebSocket = require("ws");

const PORT = process.env.PORT || 8080;
const wss = new WebSocket.Server({ port: PORT });

let locked = false;

wss.on("connection", (ws) => {
  ws.on("message", (msg) => {
    const data = JSON.parse(msg);

    // 早押し（最初の1人のみ）
    if (data.type === "buzz" && !locked) {
      locked = true;
      broadcast({
        type: "stop",
        winner: data.user
      });
    }

    // 司会者がスタート
    if (data.type === "start") {
      locked = false;
      broadcast({ type: "start" });
    }
  });
});

function broadcast(obj) {
  const message = JSON.stringify(obj);
  wss.clients.forEach(client => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(message);
    }
  });
}

console.log(`WebSocket server running on port ${PORT}`);
