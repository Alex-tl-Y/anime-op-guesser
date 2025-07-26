import express from 'express';
import { createServer } from 'node:http';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import { Server } from 'socket.io';

import { songList } from './songlist.js';

class User {

  name = undefined;
  id = undefined;
  score = 0;
  isHost = false;

  constructor(name, id) {
    this.name = name;
    this.id = id;
  }
}


let allUsers = [];
let chosenSong = '';
let playedSongs = [];
let round = 0;
let isPlaying = false;

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
    if (allUsers.length === 0){
      user.isHost = true;
    }
    allUsers.push(user);

    socket.join("playing round");
    io.to("playing round").emit("scoreboard", allUsers);

    if (isPlaying) {
      io.to("playing round").emit("start game screen");
    }
  })

  socket.on("guess", (guess) => {
    io.to("playing round").emit("guess", guess);
    if (guess === chosenSong) {
      allUsers.forEach((user) => {
        if (socket.id === user.id){
          user.score += 1;
        }
      })
      io.to("playing round").emit("scoreboard", allUsers);
      io.to("playing round").emit("correct", "correct");
    }
  })

  socket.on("start game", () => {
    allUsers.forEach((user) => {
      if (socket.id === user.id){
        if (user.isHost){
          isPlaying = true;
          io.to("playing round").emit("start game screen");
          io.to(socket.id).emit('start game');
        }
      }
    })
  })

  socket.on("play music", () => {
    allUsers.forEach((user) => {
      if (socket.id === user.id){
        if (user.isHost){
          const randomNumber = Math.floor(Math.random() * songList.length);

          let song = songList[randomNumber];
          
          chosenSong = song;

          io.to("playing round").emit("play music", song);        
        }
      }
    })
  })

  socket.on("timer countdown", () => {
    allUsers.forEach((user) => {
      if (socket.id === user.id){
        if (user.isHost){
          let sec = 10;
          let timer = setInterval(() => {
            io.to("playing round").emit("timer countdown", sec);
            sec --;
            if (sec < 0) {
              clearInterval(timer);
              io.to("playing round").emit("stop music");
              io.to("playing round").emit("round end");
            }
          }, 1000)        
        }
      }
    })
  })

  socket.on("round start", () => {
    allUsers.forEach((user) => {
      if (socket.id === user.id){
        if (user.isHost){
          if (round < 5){
            round ++;
            io.to("playing round").emit("round start", round);
          }

          else{
            io.to("playing round").emit("game over");
          }         
        }
      }
    })
  })
})

server.listen(3000, () => {
  console.log('server running at http://localhost:3001');
});
