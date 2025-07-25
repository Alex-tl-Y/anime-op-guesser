const socket = io();

let isPlaying = false;

const loginDiv = ` <form id = "userData">
        <input id = "Username" placeholder = "Enter Username">
        <button > Enter </button>

      </form>`

const mainScreen = document.getElementById('App');
const playScreenHTML = mainScreen.innerHTML;

// Listener when user enters their username and joins the game 
mainScreen.innerHTML = loginDiv;

const userData = document.getElementById("userData");
const username = document.getElementById('Username');

userData.addEventListener('submit', (e) => {
  e.preventDefault();
  if (username.value) {
    socket.emit('scoreboard', username.value);
    
  }
})

socket.on("scoreboard", (allUsers) => {
  
  mainScreen.innerHTML = playScreenHTML;
  let scores = document.getElementById("scores");

  allUsers.forEach((element) => {
    const indvidualScore = document.createElement('li');
    indvidualScore.textContent = element.name;
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

// Listener for the chatting feature
function guess() {

  const userGuess = document.getElementById("userGuess");
  if (userGuess.value) {
    socket.emit('guess', userGuess.value);;
  }

}


