# Chat em Tempo Real (Socket.io)

Chat simples e funcional com **Socket.io**.  
Várias pessoas abrem o mesmo link e conversam em tempo real.

## Como rodar localmente

1. Instale as dependências:
```bash
npm install
```

2. Inicie o servidor:
```bash
npm start
```

3. Abra no navegador:  
[http://localhost:3000](http://localhost:3000)

## Como colocar online (grátis)

Como o Socket.io precisa de um servidor, use um destes serviços gratuitos:

### Opção 1 – Render.com (mais fácil)

1. Crie uma conta em [https://render.com](https://render.com)
2. Clique em **New → Web Service**
3. Conecte seu repositório do GitHub
4. Configurações:
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
5. Clique em **Create Web Service**
6. Depois de alguns minutos o site ficará online

### Opção 2 – Railway.app

1. Entre em [https://railway.app](https://railway.app)
2. New Project → Deploy from GitHub
3. Selecione o repositório
4. Railway detecta automaticamente e sobe

### Opção 3 – Fly.io / Glitch

Também funcionam bem.

## Estrutura do projeto

```
chat-socket/
├── package.json
├── server.js          ← Backend (Socket.io)
├── public/
│   └── index.html     ← Frontend (chat)
└── README.md
```

## Observações

- O chat é **global** (todos que abrirem o link entram na mesma conversa)
- Não tem histórico salvo (quando o servidor reinicia, as mensagens somem)
- Funciona em celular e computador
