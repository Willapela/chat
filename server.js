const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const path = require("path");

const app = express();
const server = http.createServer(app);
const io = new Server(server);

// Serve os arquivos estáticos da pasta public
app.use(express.static(path.join(__dirname, "public")));

// Quando alguém conecta
io.on("connection", (socket) => {
  console.log("Usuário conectado:", socket.id);

  // Recebe mensagem do cliente
  socket.on("mensagem", (data) => {
    // data = { nome, texto, hora }
    // Reenvia para TODOS (incluindo quem enviou)
    io.emit("mensagem", data);
  });

  // Avisa quando alguém desconecta
  socket.on("disconnect", () => {
    console.log("Usuário desconectado:", socket.id);
  });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Servidor rodando em http://localhost:${PORT}`);
});
