const socket = io();

let isPlaying = false;

const loginDiv = ` 
    <div id = "login">
      <form id = "user-data">
        <input id = "username" placeholder = "Enter Username" autocomplete = "off">
        <button id = "enter"> Enter </button>

      </form>
    </div>
    `;

const mainScreen = document.getElementById('app');
const playScreenHTML = mainScreen.innerHTML;


// Listener when user enters their username and joins the game 
mainScreen.innerHTML = loginDiv;

const userData = document.getElementById("user-data");
const username = document.getElementById('username');
const enterButton = document.getElementById("enter");

userData.addEventListener('submit', (e) => {
  e.preventDefault();
  if (username.value) {
    mainScreen.innerHTML = playScreenHTML;
    socket.emit('scoreboard', username.value);

    let sfx = new Audio ("/sfx/select.ogg");
    sfx.play();
    
  }
})

enterButton.addEventListener("mouseenter", (e) => {
  e.preventDefault();
  let sfx = new Audio ("/sfx/hover.ogg");
  sfx.play();

})

socket.on("scoreboard", (allUsers) => {
  
  const scoreboard = document.getElementById("scoreboard");
  scoreboard.innerHTML =  `<ul id = "scores"></ul>`;
  let scores = document.getElementById("scores");

  allUsers.forEach((element) => {
    const indvidualScore = document.createElement('li');
    indvidualScore.textContent = "# " + element.position + "\u00A0\u00A0"+ element.name + " \n Score: " + element.score;
    scores.appendChild(indvidualScore);
  })

})

socket.on("correct", (username) => {
    let chatHistory = document.getElementById("chat-history");
    const guessResult = document.createElement('li');
    guessResult.style.background = 'lightgreen';
    guessResult.textContent = username + " is correct";
    chatHistory.appendChild(guessResult);
    chatHistory.scrollTop = chatHistory.scrollHeight;
    
    let sfx = new Audio ("/sfx/correct-sound.mp3");
    sfx.play();
})

socket.on("green-scoreboard", (user) => {
  const scoreboard = document.getElementById("scoreboard");
  const listItems = scoreboard.querySelectorAll("li");

  listItems.forEach((li) => {
    if (li.textContent.includes(user.name)) {
      li.style.background = 'lightgreen';
    }
  })

})

socket.on("already-correct", () => {
  let chatHistory = document.getElementById("chat-history");
  const chatMessage = document.createElement("li");
  chatMessage.textContent = "You already guessed correctly!";
  chatMessage.style.color = "darkyellow";
  chatHistory.appendChild(chatMessage);
  chatHistory.scrollTop = chatHistory.scrollHeight;

})

socket.on("join-message", (username) => {
  let chatHistory = document.getElementById("chat-history");
  const chatMessage = document.createElement("li");
  chatMessage.textContent = username + " joined the game!";
  chatMessage.style.color = "lightgreen";
  chatHistory.appendChild(chatMessage);
  chatHistory.scrollTop = chatHistory.scrollHeight;
})

socket.on("guess", (message, username) => {
  let chatHistory = document.getElementById("chat-history");
  const chatMessage = document.createElement('li');
  chatMessage.textContent = username + ": " + message;
  chatHistory.appendChild(chatMessage);
  chatHistory.scrollTop = chatHistory.scrollHeight;
})

socket.on("allow-start", () => {
  const startButton = document.getElementById("start-button")
  startButton.id = "host-start-button";
})

socket.on("start game screen", () => {
  document.getElementById("start-game").innerHTML = "";
  const startButton = document.getElementById("start-game");
  startButton.innerHTML = ""; 
})

socket.on("start game", () => {
  roundTransitions();
})

socket.on("round-transitions", (allUsers, firstTransition, songInRound) => {
  if (!firstTransition) {
    allUsers.forEach((element) => {
      document.getElementById("scores-from-round").innerHTML += `<p>${element.name} : + ${element.score_from_round}</p>`;
  })
    document.getElementById("status-message").innerHTML = `<p id = "song-round"> ${songInRound} was the song! </p>`;
  }
  else{
    document.getElementById("status-message").innerHTML += `<p id = "status-message">Loading Song ...<p>`;
  }

  
})

socket.on("finished-round-transitions-screen", () => {
  document.getElementById("status-message").innerHTML = "";  
  document.getElementById("scores-from-round").innerHTML = "";
})

socket.on("finished-round-transitions", () => {
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
  roundTransitions();
})

socket.on("revealed-answer", (chosenSong) => {
  document.getElementById("letter-hint").innerHTML = chosenSong;
})

socket.on("timer-countdown", (sec) => {
  document.getElementById("timer-display").innerHTML = sec;
})

socket.on("game over", (allUsers) => {
  document.getElementById("start-game").innerHTML = `<button id = "start-button" onclick = "restart()">Start Game!</button>`;
  allUsers.forEach((user) => {
    if (user.position == 1) {
      document.getElementById("scores-from-round").innerHTML += `<p> 1st Place (The KING): ${user.name}</p>`

    }

    else if (user.position == 2) {
      document.getElementById("scores-from-round").innerHTML += `<p> 2nd Place (The QUEEN): ${user.name}</p>`
    }

    else if (user.position == 3) {
      document.getElementById("scores-from-round").innerHTML += `<p> 3rd Place (The TENT): ${user.name}</p>`
    }

    else {
      document.getElementById("scores-from-round").innerHTML += `<p> Short Bus Riders (The Village): ${user.name}</p>`
    }
  })
})

socket.on("game-over-host", (allUsers) => {
  document.getElementById("start-game").innerHTML = `<button id = "host-start-button" onclick = "restart()">Start Game!</button>`;

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
  socket.emit("timer-countdown");
}

function roundTransitions() {
  socket.emit("round-transitions");
}
// Listener to restart the game

function restart() {
  document.getElementById("scores-from-round").innerHTML = "";
  socket.emit("restart");
  
}