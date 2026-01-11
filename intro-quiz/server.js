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
