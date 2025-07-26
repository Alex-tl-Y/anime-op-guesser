const socket = io();

let isPlaying = false;

const loginDiv = ` <form id = "user data">
        <input id = "username" placeholder = "Enter Username">
        <button > Enter </button>

      </form>`

const mainScreen = document.getElementById('app');
const playScreenHTML = mainScreen.innerHTML;

// Listener when user enters their username and joins the game 
mainScreen.innerHTML = loginDiv;

const userData = document.getElementById("user data");
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

socket.on("correct", (answer) => {
    let chatHistory = document.getElementById("chat history");
    const guessResult = document.createElement('li');
    guessResult.textContent = answer;
    chatHistory.appendChild(guessResult);
})

socket.on("guess", (message) => {
  let chatHistory = document.getElementById("chat history");
  const chatMessage = document.createElement('li');
  chatMessage.textContent = message;
  chatHistory.appendChild(chatMessage);
})

socket.on("start game", () => {
  const startButton = document.getElementById("start game");
  startButton.innerHTML = ""; 
  playMusic();
})

// Listener for the chatting feature
function guess() {

  const userGuess = document.getElementById("user guess");
  if (userGuess.value) {
    socket.emit('guess', userGuess.value);
  }

}

// Listener to start the game

function startGame() {
  socket.emit("start game");
}

function startRound() {
  
}

function playMusic() {
  // Picks a random song
  const randomNumber = Math.floor(Math.random() * songList.length);

  let song = songList[randomNumber];
  
  // Plays the song
  let frame = document.getElementById('embeded song');
  frame.innerHTML = `<iframe width="0" height="0" src="${song.songLink}&amp;controls=0&autoplay=1" title="YouTube video player" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" referrerpolicy="strict-origin-when-cross-origin" allowfullscreen></iframe>`
}
