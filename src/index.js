const socket = io();

let isPlaying = false;

const loginDiv = ` <form id = "user-data">
        <input id = "username" placeholder = "Enter Username">
        <button > Enter </button>

      </form>`

const mainScreen = document.getElementById('app');
const playScreenHTML = mainScreen.innerHTML;


// Listener when user enters their username and joins the game 
mainScreen.innerHTML = loginDiv;

const userData = document.getElementById("user-data");
const username = document.getElementById('username');

userData.addEventListener('submit', (e) => {
  e.preventDefault();
  if (username.value) {
    mainScreen.innerHTML = playScreenHTML;
    socket.emit('scoreboard', username.value);
    
  }
})

socket.on("scoreboard", (allUsers) => {
  
  const scoreboard = document.getElementById("scoreboard");
  scoreboard.innerHTML =  `<ul id = "scores"></ul>`;
  let scores = document.getElementById("scores");

  allUsers.forEach((element) => {
    const indvidualScore = document.createElement('li');
    indvidualScore.textContent = element.name + " " + element.score;
    scores.appendChild(indvidualScore);
  })

})

socket.on("correct", (username) => {
    let chatHistory = document.getElementById("chat history");
    const guessResult = document.createElement('li');
    guessResult.textContent = username + " is correct";
    chatHistory.appendChild(guessResult);

})

socket.on("guess", (message) => {
  let chatHistory = document.getElementById("chat history");
  const chatMessage = document.createElement('li');
  chatMessage.textContent = message;
  chatHistory.appendChild(chatMessage);
})

socket.on("start game screen", () => {
  document.getElementById("middle-section").innerHTML = "";
  const startButton = document.getElementById("start game");
  startButton.innerHTML = ""; 
})

socket.on("start game", () => {
  roundsStart();
})

socket.on("play music", (song, underscoreName) => {
  let frame = document.getElementById('embeded song');
  frame.innerHTML = `<iframe width="0" height="0" src="${song.songLink}&amp;controls=0&autoplay=1" title="YouTube video player" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" referrerpolicy="strict-origin-when-cross-origin" allowfullscreen></iframe>`
  document.getElementById("letter-hint").innerHTML = underscoreName;
})

socket.on("stop music", () => {
  let frame = document.getElementById('embeded song');

  frame.innerHTML = '';
})

socket.on("round start", (roundNumber) => {
  document.getElementById("round-number").innerHTML = "Round" + " " + roundNumber;
  playMusic();
  timerCountdown();
})

socket.on("round end", () => {
  roundsStart();
})

socket.on("revealed-answer", (chosenSong) => {
  document.getElementById("letter-hint").innerHTML = chosenSong;
})

socket.on("timer countdown", (sec) => {
  document.getElementById("timer-display").innerHTML = sec;
})

socket.on("game over", () => {
  document.getElementById("middle-section").innerHTML = `<button id = "restart" onclick = "restart()">Play Again</button>`;
})

// Listener for the chatting feature
function guess() {

  const userGuess = document.getElementById("user-guess");
  if (userGuess.value) {
    socket.emit('guess', userGuess.value);
    userGuess.value = '';
  }

}

function guess2(event) {
  
  const userGuess = document.getElementById("user-guess");
  if (userGuess.value && event.key == "Enter") {
    socket.emit('guess', userGuess.value)
    userGuess.value = '';
  }
}

// Listener to start the game
function startGame() {
  socket.emit("start game");
}

// Listener to start the rounds
function roundsStart() {
  socket.emit("round start");
}

// Listener to play music
function playMusic() {
  socket.emit("play music");
}

// Listener to start the timer
function timerCountdown() {
  socket.emit("timer countdown");
}

// Listener to restart the game

function restart() {
  socket.emit("restart");
  
}