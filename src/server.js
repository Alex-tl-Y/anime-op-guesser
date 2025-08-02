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
  position = 1;
  score_from_round = 0;

  constructor(name, id) {
    this.name = name;
    this.id = id;
  }
  
  getName () {
    return this.name;
  }

  getID () {
    return this.id;
  }

  getScore () {
    return this.score;
  }

  getIsHost () {
    return this.isHost;
  }

  getPostion () {
    return this.position;
  }

  getScoreFromRound () {
    return this.score_from_round;
  }

}


let allUsers = [];
let chosenSong = '';
let round = 0;
let isPlaying = false;
let correctUsers = [];

const app = express();
const server = createServer(app);
const io = new Server(server);

const __dirname = dirname(fileURLToPath(import.meta.url));

app.use(express.static('src'));
app.use(express.static('public'));

app.get('/', (req, res) => {
  res.sendFile(join(__dirname, 'index.html'));
});

io.on("connection", (socket) => {
  socket.on("scoreboard", (username) => {
    let user = new User (username, socket.id);
    if (allUsers.length === 0){
      user.isHost = true;
      io.to(socket.id).emit("allow-start");
    }

    allUsers.push(user);

    socket.join("playing round");
    io.to("playing round").emit("scoreboard", allUsers);
    io.to("playing round").emit("join-message", username)

    if (isPlaying) {
      io.to("playing round").emit("start game screen");
    }
  })

  socket.on("guess", (guess) => {
    allUsers.forEach((user) => {
      if (socket.id === user.id){
        if (!correctUsers.includes(user)){
          if (guess.toUpperCase() === chosenSong.toUpperCase()) {
            user.score += allUsers.length - correctUsers.length;
            user.score_from_round = allUsers.length - correctUsers.length;
            correctUsers.push(user);
            io.to("playing round").emit("correct", user.name);
            io.to("playing round").emit("green-scoreboard", user);
            io.to(socket.id).emit("revealed-answer", chosenSong);
          } 

          else{
            io.to("playing round").emit("guess", guess, user.name);
          }

        }
        else {
          io.to(socket.id).emit("already-correct");
        }
      }
    })

  })

  socket.on("start game", () => {
    allUsers.forEach((user) => {
      if (socket.id === user.id) {
        if (user.isHost) {
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
          
          chosenSong = song.name;

          // Display the name of the song with underscores
          
          let underscoreName = '';

          for (let i = 0; i < chosenSong.length; i ++) {
            if (chosenSong.charAt(i) !== " ") {
              underscoreName += "_ ";
            }
            else {
              underscoreName += "\u00A0\u00A0\u00A0";
            }
          }

          io.to("playing round").emit("play music", song, underscoreName);        
        }
      }
    })
  })

  socket.on("timer-countdown", () => {
    allUsers.forEach((user) => {
      if (socket.id === user.id){
        if (user.isHost){
          let sec = 25;
          let timer = setInterval(() => {
            io.to("playing round").emit("timer-countdown", sec);
            sec --;
            if (sec < 0 || correctUsers.length === allUsers.length) {
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
            correctUsers = [];
            round ++;
            io.to("playing round").emit("round start", round);
          }

          else{
            io.to("playing round").emit("game over", allUsers);
          }         
        }
      }
    })
    allUsers.forEach((user) => {
      user.score_from_round = 0;
    })
  })

  socket.on("round-transitions", () => {
    allUsers.forEach((user) => {
      if (socket.id === user.id){
        if (user.isHost){
          sortPosition(allUsers);
          io.to("playing round").emit("scoreboard", allUsers);
          if (round == 0) {
            io.to("playing round").emit("round-transitions", allUsers, true);
          }

          else if (0 < round && round < 5){
            let sortedList = sortScoreFromRound(allUsers);
            io.to("playing round").emit("round-transitions", sortedList, false);
          }

          else{
            let sortedList = sortPosition(allUsers)
            io.to("playing round").emit("game over", sortedList);
            io.to(socket.id).emit("game-over-host");
            return;
          }
          
          let sec = 4;
          let timer = setInterval(() => {
            io.to("playing round").emit("timer-countdown", sec);
            sec --;

            if (sec < 0) {
              clearInterval(timer);
              io.to("playing round").emit("finished-round-transitions-screen");
              io.to(socket.id).emit("finished-round-transitions");
            }
          }, 1000)
        }
      }
    })
  })

  socket.on("restart", () => {
      allUsers.forEach((user) => {
        user.score = 0;
        if (socket.id === user.id){
          if (user.isHost){
            round = 0;
            correctUsers = [];
            
            io.to("playing round").emit("scoreboard", allUsers);
            io.to("playing round").emit("start game screen");
            io.to(socket.id).emit('start game');
          }
        }
    })
  })

  socket.on("disconnect", () => {
    allUsers.forEach((user) => {
      if (socket.id === user.id) {
        allUsers = allUsers.filter(element => element !== user);
        io.to("playing round").emit("scoreboard", allUsers);
      }
    })
  })
})

function sortScoreFromRound(userList) {
  let sortedList = userList.slice();

  for (let i = 0; i < sortedList.length; i ++) {
    let largestIndex = i;
    for (let j = i + 1; j < sortedList.length; j ++) {
      if (sortedList[largestIndex].score_from_round < sortedList[j].score_from_round) {
        largestIndex = j;
      }
    }
    let largestValue = sortedList[largestIndex];
    sortedList[largestIndex] = sortedList[i];
    sortedList[i] = largestValue;
  }

  return sortedList;
}

function sortPosition(userList) {
  let sortedList = sortScoreFromRound(userList);
  let userPosition = 1;
  sortedList[0].position = 1;
  for (let i = 1; i < sortedList.length; i ++ ) {
    if (sortedList[i - 1].score != sortedList[i].score) {
      userPosition += 1;
      sortedList[i].position = userPosition;
    }

    else {
      sortedList[i].position = userPosition;
    }
  }
}

server.listen(3000, () => {
  console.log('server running at http://localhost:3001');
});
