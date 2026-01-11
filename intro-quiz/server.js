const express = require("express");
const http = require("http");
const WebSocket = require("ws");

const app = express();
app.use(express.static("public"));

const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

const sessions = {};

wss.on("connection", ws => {
  ws.on("message", msg => {
    const data = JSON.parse(msg);

    const session =
      sessions[data.sessionId] ??= {
        locked: false,
        clients: new Set()
      };

    session.clients.add(ws);

    if (data.type === "buzz" && !session.locked) {
      session.locked = true;

      session.clients.forEach(c =>
        c.send(JSON.stringify({
          type: "buzzed",
          winner: data.user
        }))
      );
    }

    if (data.type === "resume") {
      session.locked = false;

      session.clients.forEach(c =>
        c.send(JSON.stringify({ type: "resume" }))
      );
    }
  });

  ws.on("close", () => {
    Object.values(sessions).forEach(s => s.clients.delete(ws));
  });
});

server.listen(process.env.PORT || 3000);
