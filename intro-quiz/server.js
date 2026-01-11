const WebSocket = require("ws");

const wss = new WebSocket.Server({
  port: process.env.PORT || 8080
});

let buzzerLocked = false;
let buzzerWinner = null;

wss.on("connection", (ws) => {
  ws.on("message", (msg) => {
    const data = JSON.parse(msg);

    // 早押し
    if (data.type === "buzz") {
      if (!buzzerLocked) {
        buzzerLocked = true;
        buzzerWinner = data.name;

        broadcast({
          type: "buzz",
          name: buzzerWinner
        });
      }
    }

    // 司会者操作
    if (data.type === "reset") {
      buzzerLocked = false;
      buzzerWinner = null;
      broadcast({ type: "reset" });
    }
  });
});

function broadcast(obj) {
  const msg = JSON.stringify(obj);
  wss.clients.forEach((client) => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(msg);
    }
  });
}

console.log("WebSocket server running");
