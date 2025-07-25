import express from 'express';
import { createServer } from 'node:http';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import { Server } from 'socket.io';

class User {

  name = undefined;
  id = undefined;
  score = 0;

  constructor(name, id) {
    this.name = name;
    this.id = id;
  }
}


let allUsers = [];

const app = express();
const server = createServer(app);
const io = new Server(server);

const __dirname = dirname(fileURLToPath(import.meta.url));

app.use(express.static('src'));

app.get('/', (req, res) => {
  res.sendFile(join(__dirname, 'index.html'));
});

io.on("connection", (socket) => {
  socket.on("scoreboard", (username) => {
    let user = new User (username, socket.id);
    allUsers.push(user);

    socket.join("playing round");
    io.to("playing round").emit("scoreboard", allUsers);
  })

  socket.on("guess", (guess) => {
    io.to("playing round").emit("guess", guess);
    if (guess === "1") {
      io.to("playing round").emit("correct", "correct");
    }
  })
})
server.listen(3000, () => {
  console.log('server running at http://localhost:3001');
});