const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const path = require("path");

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  // Permite mensagens com fotos comprimidas pelo navegador sem aceitar payloads enormes.
  maxHttpBufferSize: 6 * 1024 * 1024
});

app.use(express.static(path.join(__dirname, "public")));

// socket.id → { id, nome }
const usuarios = new Map();

// sala → pin (string ou null)
const salasPin = new Map();

function emitirOnline() {
  const lista = Array.from(usuarios.values());
  io.emit("usuarios-online", lista);
}

io.on("connection", (socket) => {
  console.log("Conectado:", socket.id);

  socket.on("entrar", (nome) => {
    const nomeLimpo = (nome || "Anônimo").trim().slice(0, 20);
    usuarios.set(socket.id, { id: socket.id, nome: nomeLimpo });
    socket.nome = nomeLimpo;
    socket.join("geral");
    socket.salaAtual = "geral";
    emitirOnline();
  });

  // Criar / definir PIN de uma sala privada
  socket.on("definir-pin", ({ sala, pin }) => {
    if (!sala || sala === "geral") return;
    if (pin && String(pin).trim()) {
      salasPin.set(sala, String(pin).trim().slice(0, 12));
    } else {
      salasPin.delete(sala);
    }
  });

  // Verificar PIN antes de entrar na sala
  socket.on("entrar-sala", ({ sala, pin }, callback) => {
    if (!sala) return;

    const pinCorreto = salasPin.get(sala);

    // Se a sala tem PIN e o usuário não enviou o certo
    if (pinCorreto && pinCorreto !== String(pin || "").trim()) {
      if (typeof callback === "function") {
        callback({ ok: false, precisaPin: true });
      }
      return;
    }

    // Sai da sala anterior
    if (socket.salaAtual) {
      socket.leave(socket.salaAtual);
    }
    socket.join(sala);
    socket.salaAtual = sala;

    if (typeof callback === "function") {
      callback({ ok: true });
    }
  });

  // Checar se a sala precisa de PIN (sem entrar ainda)
  socket.on("checar-pin", (sala, callback) => {
    const temPin = salasPin.has(sala);
    if (typeof callback === "function") {
      callback({ precisaPin: temPin });
    }
  });

  socket.on("mensagem", (data = {}) => {
    const sala = typeof data.sala === "string" ? data.sala.trim().slice(0, 120) : "";
    const tipo = data.tipo === "imagem" ? "imagem" : "texto";
    const texto = typeof data.texto === "string" ? data.texto.trim().slice(0, 4000) : "";
    const hora = typeof data.hora === "string" ? data.hora.slice(0, 8) : "";

    // Impede que um cliente publique em uma sala em que não está conectado.
    if (!sala || !socket.rooms.has(sala)) return;

    const mensagem = {
      sala,
      nome: socket.nome || "Anônimo",
      tipo,
      texto,
      hora
    };

    if (tipo === "imagem") {
      const imagem = typeof data.imagem === "string" ? data.imagem : "";
      const imagemValida = /^data:image\/(?:jpeg|png|gif|webp);base64,[A-Za-z0-9+/=]+$/.test(imagem);
      if (!imagemValida || imagem.length > 5 * 1024 * 1024) return;
      mensagem.imagem = imagem;
      mensagem.texto = texto || "Foto";
    } else {
      if (!texto) return;
    }

    io.to(sala).emit("mensagem", mensagem);
  });

  socket.on("disconnect", () => {
    if (usuarios.has(socket.id)) {
      usuarios.delete(socket.id);
      emitirOnline();
    }
  });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Servidor rodando em http://localhost:${PORT}`);
});
