const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const path = require("path");

const app = express();
const server = http.createServer(app);
const io = new Server(server);

app.use(express.static(path.join(__dirname, "public")));

// socket.id → { id, nome }
const usuarios = new Map();

function emitirOnline() {
  const lista = Array.from(usuarios.values());
  io.emit("usuarios-online", lista);
}

io.on("connection", (socket) => {
  console.log("Conectado:", socket.id);

  // Usuário entra com nome
  socket.on("entrar", (nome) => {
    const nomeLimpo = (nome || "Anônimo").trim().slice(0, 20);
    usuarios.set(socket.id, { id: socket.id, nome: nomeLimpo });
    socket.nome = nomeLimpo;
    socket.join("geral");
    socket.salaAtual = "geral";

    emitirOnline();
    console.log(`${nomeLimpo} entrou`);
  });

  // Trocar de sala
  socket.on("entrar-sala", (sala) => {
    if (socket.salaAtual) {
      socket.leave(socket.salaAtual);
    }
    socket.join(sala);
    socket.salaAtual = sala;
  });

  // Enviar mensagem (só para a sala atual)
  socket.on("mensagem", (data) => {
    // data = { sala, nome, texto, hora }
    if (!data.sala || !data.texto) return;
    io.to(data.sala).emit("mensagem", data);
  });

  // Desconectou
  socket.on("disconnect", () => {
    const user = usuarios.get(socket.id);
    if (user) {
      console.log(`${user.nome} saiu`);
      usuarios.delete(socket.id);
      emitirOnline();
    }
  });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Servidor rodando em http://localhost:${PORT}`);
});
