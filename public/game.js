// connecting to the socket server
const socket = io("http://localhost:8000");

// on connection this code will be executed
socket.on("connect", () => {
  console.log("Connected");
  console.log(`${socket.id} Has been connected!!!`);
});

// entering player name
let playerName = undefined;
const ragister = document.querySelector(".ragister-name");

// apply eventlistener to ragister the code
ragister.addEventListener("click", () => {
  event.preventDefault();
  // if input is empty then give alert
  playerName = document.querySelector(".player-name-input").value;
  if (
    playerName == "" ||
    playerName == "  " ||
    playerName == "   " ||
    playerName == "    " ||
    playerName == "     " ||
    playerName == "      " ||
    playerName == "       " ||
    playerName == "        "
  ) {
    alert("Please enter your name!!");
  } else {
    // send the name to the server
    document.querySelector(".modal").style.display = "none";
    socket.emit("userName", playerName);
  }
});

// create room
const createRoom = document.querySelector(".room .create-room form button");
const playerLsit = document.querySelector(".playersList");

let rc = undefined;
// create room add event listner
createRoom.addEventListener("click", () => {
  event.preventDefault();
  // create request for create the room
  socket.emit("createRoom", "Connect");
  // get room code for other players
  socket.on("joinTheRoom", (roomCode) => {
    document.querySelector(".loby .roomCode p span").innerHTML =
      roomCode.roomCode;
    rc = roomCode.roomCode;
    // create player loby and hide room page
    document.querySelector(".container").style.display = "none";
    document.querySelector(".room").style.display = "none";
    document.querySelector(".loby").style.display = "block";
    // get the list of players
    let dlen = undefined;
    socket.on("listOFPlayers", (data) => {
      dlen = data.length;
      playerLsit.innerHTML = "";
      data.forEach((element) => {
        playerLsit.innerHTML += `<div class="playerNameLoby"><p>${element.name}</p></div>`;
      });
    });
    // if players are less then 5 then we can't start the game
    const letsGo = document.querySelector(".loby .button button");
    // adding button add event listner
    letsGo.addEventListener("click", () => {
      if (dlen < 5) {
        alert("Please waiting for the other players!!!");
      } else {
        socket.emit("start-round-1", roomCode.roomCode);
      }
    });
  });
});

// join room add event listner
const joinRoom = document.querySelector(".room .join-room form button");
joinRoom.addEventListener("click", () => {
  event.preventDefault();

  // get room code from the text input
  let roomCode = document.querySelector(".room .join-room form input").value;

  // check weather the room is exist and room is full or not..
  socket.emit("joinRoom", { roomCode });

  socket.on("joinRoomFromServer", (canWeStart) => {
    // give alert if there is any problem
    if (!canWeStart) {
      alert("Please Enter Valid Code Or Group Is Full!!!");
      // otherwise join the loby
    } else {
      rc = Number(roomCode);
      document.querySelector(".loby .roomCode p span").innerHTML = roomCode;
      document.querySelector(".container").style.display = "none";
      document.querySelector(".room").style.display = "none";
      document.querySelector(".loby").style.display = "block";
      // get playerLsit and itterate it to add each entry
      let dlen = undefined;
      socket.on("listOFPlayers", (data) => {
        dlen = data.length;
        playerLsit.innerHTML = "";
        data.forEach((element) => {
          playerLsit.innerHTML += `<div class="playerNameLoby"><p>${element.name}</p></div>`;
        });
      });
      // if players are less then 5 then we can't start the game
      const letsGo = document.querySelector(".loby .button button");

      // adding button add event listner
      letsGo.addEventListener("click", () => {
        if (dlen < 5) {
          alert("Please waiting for the other players!!!");
        } else {
          socket.emit("start-round-1", roomCode);
        }
      });
    }
  });
});

const popPopScoreCard = (data, round) => {
  const cardType = ["&#9824;", "&#9830;", "&#9827;", "&#9829;"];
  const scoreTable = document.querySelector(".after-round-score-card");
  const currentRound = round;
  const playerNameHtml = `<tr>
  <th>Card</th>
  <th class="score-p1-name">${data[0].name}</th>
  <th class="score-p2-name">${data[1].name}</th>
  <th class="score-p3-name">${data[2].name}</th>
  <th class="score-p4-name">${data[3].name}</th>
  <th class="score-p5-name">${data[4].name}</th>
  </tr>`;
  let currentScore = "";
  let remaningScore = "";
  let totalScoreOfP1 = 0;
  let totalScoreOfP2 = 0;
  let totalScoreOfP3 = 0;
  let totalScoreOfP4 = 0;
  let totalScoreOfP5 = 0;
  for (let i = 1; i < currentRound; i++) {
    currentScore += `<tr>
    <td class='${i % 2 ? "" : "red"}'>${cardType[(i - 1) % 4]}</td>
    <td class="score-p1r${i}">${data[0].score[i]}</td>
    <td class="score-p2r${i}">${data[1].score[i]}</td>
    <td class="score-p3r${i}">${data[2].score[i]}</td>
    <td class="score-p4r${i}">${data[3].score[i]}</td>
    <td class="score-p5r${i}">${data[4].score[i]}</td>
    </tr>`;
    totalScoreOfP1 += data[0].score[i];
    totalScoreOfP2 += data[1].score[i];
    totalScoreOfP3 += data[2].score[i];
    totalScoreOfP4 += data[3].score[i];
    totalScoreOfP5 += data[4].score[i];
  }
  for (let i = currentRound; i <= 10; i++) {
    remaningScore += `<tr>
    <td class='${i % 2 ? "" : "red"}'>${cardType[(i - 1) % 4]}</td>
    <td class="score-p1r${i}"></td>
    <td class="score-p2r${i}"></td>
    <td class="score-p3r${i}"></td>
    <td class="score-p4r${i}"></td>
    <td class="score-p5r${i}"></td>
    </tr>`;
  }

  const totalScore = ` <tr>
                <td>Total</td>
                <td class="total-score-p1">${totalScoreOfP1}</td>
                <td class="total-score-p2">${totalScoreOfP2}</td>
                <td class="total-score-p3">${totalScoreOfP3}</td>
                <td class="total-score-p4">${totalScoreOfP4}</td>
                <td class="total-score-p5">${totalScoreOfP5}</td>
            </tr>`;
  const table = `<table><div class="overlay"></div>${playerNameHtml}${currentScore}${remaningScore}${totalScore}</table>`;
  // console.log(table);
  scoreTable.style.display = "flex";
  document.querySelector(".overlay-back").style.display = `block`;
  scoreTable.innerHTML = table;
};
const hideScoreCard = () => {
  setTimeout(() => {
    document.querySelector(".after-round-score-card").style.display = "none";
    document.querySelector(".overlay-back").style.display = `none`;
  }, 6000);
};

const createCards = (cards) => {
  let cardsDom = "";
  let lenOfCards = cards.length;
  for (let i = 0; i < lenOfCards; i++) {
    cN = cards[i];
    let cardNuber = undefined;
    let cardCode = undefined;
    let card = "";
    if (cN < 13) {
      cardCode = "&#9824;";
      if (cN < 9) {
        cardNuber = cN + 2;
      } else if (cN == 9) {
        cardNuber = "J";
      } else if (cN == 10) {
        cardNuber = "Q";
      } else if (cN == 11) {
        cardNuber = "K";
      } else if (cN == 12) {
        cardNuber = 1;
      }
    } else if (cN < 26) {
      cardCode = "&#9830;";
      if (cN - 13 < 9) {
        cardNuber = cN - 13 + 2;
      } else if (cN - 13 == 9) {
        cardNuber = "J";
      } else if (cN - 13 == 10) {
        cardNuber = "Q";
      } else if (cN - 13 == 11) {
        cardNuber = "K";
      } else if (cN - 13 == 12) {
        cardNuber = 1;
      }
    } else if (cN < 39) {
      cardCode = "&#9827;";
      if (cN - 26 < 9) {
        cardNuber = cN - 26 + 2;
      } else if (cN - 26 == 9) {
        cardNuber = "J";
      } else if (cN - 26 == 10) {
        cardNuber = "Q";
      } else if (cN - 26 == 11) {
        cardNuber = "K";
      } else if (cN - 26 == 12) {
        cardNuber = 1;
      }
    } else {
      cardCode = "&#9829;";
      if (cN - 39 < 9) {
        cardNuber = cN - 39 + 2;
      } else if (cN - 39 == 9) {
        cardNuber = "J";
      } else if (cN - 39 == 10) {
        cardNuber = "Q";
      } else if (cN - 39 == 11) {
        cardNuber = "K";
      } else if (cN - 39 == 12) {
        cardNuber = 1;
      }
    }
    if (cardNuber <= 10 && cardNuber >= 1) {
      let middleIconsHandler = "";
      for (let i = 1; i <= cardNuber; i++) {
        middleIconsHandler += `<div class="c${cardNuber}${i}">${cardCode}</div>`;
      }
      card = `<div class="card card-number-${lenOfCards}${i + 1}">
        <button class="${
          cardCode == "&#9829;" || cardCode == "&#9830;" ? "red" : ""
        }" value='${cN}'>
        <div class="icon">${cardCode}</div>
        <div class="num ten">${cardNuber == 1 ? "A" : cardNuber}</div>
        ${middleIconsHandler}
        <div class="rev-icon">${cardCode}</div>
        <div class="rev-num ten">${cardNuber == 1 ? "A" : cardNuber}</div>
        </div>
        </button>
        `;
    } else if (cardCode == "&#9824;" || cardCode == "&#9827;") {
      card = `<div class="card card-number-${lenOfCards}${i + 1}">
    <button class='c${cardNuber}b' value='${cN}'>
        <div class="num ten">${cardNuber}</div>
        <div class="icon">${cardCode}</div>
        <div class="rev-icon">${cardCode}</div>
        <div class="rev-num">${cardNuber}</div>
        </div>
        </button>
        `;
    } else {
      card = `<div class="card card-number-${lenOfCards}${i + 1}">
        <button class=' c${cardNuber}r red' value='${cN}'>
        <div class="num ten">${cardNuber}</div>
        <div class="icon">${cardCode}</div>
        <div class="rev-icon">${cardCode}</div>
        <div class="rev-num">${cardNuber}</div>
        </div>
        </button>
        `;
    }
    cardsDom += card;
  }
  console.log(cardsDom);
  return cardsDom;
};

const guess = (players, p1_index, roundNumber, rc, disable = false) => {
  let p1_i = p1_index;
  let p2_i = (p1_i + 1) % 5;
  let p3_i = (p2_i + 1) % 5;
  let p4_i = (p3_i + 1) % 5;
  let p5_i = (p4_i + 1) % 5;

  let btnHtml = "";
  let playersHtml = "";

  if (disable == false) {
    for (let i = 0; i <= roundNumber; i++) {
      btnHtml += `
        <button class="guess${i} guess-btn" value='${i}'>${i}</button>
    `;
    }
  }

  if (disable == true) {
    let total_gusses =
      players[p2_i].myGuess +
      players[p3_i].myGuess +
      players[p4_i].myGuess +
      players[p5_i].myGuess;

    let disableBtnValue = roundNumber - total_gusses;

    if (disableBtnValue < 0) {
      for (let i = 0; i <= roundNumber; i++) {
        btnHtml += `
        <button class="guess${i} guess-btn" value='${i}'>${i}</button>
        `;
      }
    } else {
      for (let i = 0; i <= roundNumber; i++) {
        btnHtml += `
        <button class="guess${i} guess-btn" value='${i}' ${
          i == disableBtnValue ? "disabled" : ""
        }>${i}</button>
        `;
      }
    }
  }
  playersHtml = `<div class="guess-p1">
                <p>${players[p1_i].name}</p>
                <hr>
                <p>${
                  players[p1_i].myGuess == undefined
                    ? "-"
                    : players[p1_i].myGuess
                }</p>
            </div>
            <hr>
            <div class="guess-p2">
                <p>${players[p2_i].name}</p>
                <hr>
                <p>${
                  players[p2_i].myGuess == undefined
                    ? "-"
                    : players[p2_i].myGuess
                }</p>
            </div>
            <hr>
            <div class="guess-p3">
                <p>${players[p3_i].name}</p>
                <hr>
                <p>${
                  players[p3_i].myGuess == undefined
                    ? "-"
                    : players[p3_i].myGuess
                }</p>
            </div>
            <hr>
            <div class="guess-p4">
                <p>${players[p4_i].name}</p>
                <hr>
                <p>${
                  players[p4_i].myGuess == undefined
                    ? "-"
                    : players[p4_i].myGuess
                }</p>
            </div>
            <hr>
            <div class="guess-p5">
                <p>${players[p5_i].name}</p>
                <hr>
                <p>${
                  players[p5_i].myGuess == undefined
                    ? "-"
                    : players[p5_i].myGuess
                }</p>
            </div>`;
  let guessHtml = `<div class="guesses">${btnHtml}</div><div class="palyers-guesses">${playersHtml}</div>`;

  document.querySelector(".guess").style.display = `flex`;
  document.querySelector(".guess").innerHTML = guessHtml;
  document.querySelectorAll(".guesses button").forEach((btn) => {
    btn.addEventListener("click", () => {
      socket.emit(`round1guess`, {
        index: p1_index,
        guess: Number(btn.value),
        roomNumber: rc,
      });

      document.querySelector(".guess").style.display = `none`;
    });
  });
};

socket.on("start-round-1", (players) => {
  console.log(players);
  document.querySelector(".loby").style.display = "none";
  popPopScoreCard(players, 1);
  hideScoreCard();

  let p1_index = undefined;
  players.forEach((element, index) => {
    if (element.id == socket.id) {
      p1_index = index;
    }
  });
  const scoreCard = document.querySelector(".score");
  players.forEach((player, index) => {
    scoreCard.innerHTML += `<div>
         <div>${player.name}</div>
         <div>${player.myGuess == undefined ? "-" : player.myGuess}</div>
        </div>`;
  });
  document.querySelector(".game .round .trump span").innerHTML = "&#9824;";
  document.querySelector(".game .round .curentRound p span").textContent = 1;

  let p2_index = (p1_index + 1) % 5;
  let p3_index = (p2_index + 1) % 5;
  let p4_index = (p3_index + 1) % 5;
  let p5_index = (p4_index + 1) % 5;

  const otherPlayers = document.querySelector(".otherPlayers");
  otherPlayers.innerHTML = "";
  otherPlayers.innerHTML = `<div class = "otherPlayerInfo">
                                        <div class='player'>
                                          <div class="player-playerInfo">
                                            <p class='player-playerName'>${players[p2_index].name}</p>
                                          </div>
                                        </div>
                                          <p class="player-playerGuessing" id=${players[p2_index].id} style='font-size:13px'>Guessing</p>
                                  </div>
                                  <div class = "otherPlayerInfo">
                                        <div class='player'>
                                          <div class="player-playerInfo">
                                            <p class='player-playerName'>${players[p3_index].name}</p>
                                          </div>
                                        </div>
                                          <p class="player-playerGuessing" id=${players[p3_index].id} style='font-size:13px'>Guessing</p>
                                  </div>
                                  <div class = "otherPlayerInfo">
                                        <div class='player'>
                                          <div class="player-playerInfo">
                                            <p class='player-playerName'>${players[p4_index].name}</p>
                                          </div>
                                        </div>
                                          <p class="player-playerGuessing" id=${players[p4_index].id} style='font-size:13px'>Guessing</p>
                                  </div>
                                  <div class = "otherPlayerInfo">
                                        <div class='player'>
                                          <div class="player-playerInfo">
                                            <p class='player-playerName'>${players[p5_index].name}</p>
                                          </div>
                                        </div>
                                          <p class="player-playerGuessing" id=${players[p5_index].id} style='font-size:13px'>Guessing</p>
                                  </div>`;

  document.querySelector(".game").style.display = `flex`;
  document.querySelector(".box").innerHTML = createCards(
    players[p1_index].cards
  );
  console.log(rc);
  if (
    players[p1_index].isMyTurn == true &&
    players[p1_index].isGuessed == false
  ) {
    guess(players, p1_index, 1, rc);
  }
  socket.on("round1guess", (data) => {
    if (
      data[p1_index].isMyTurn == true &&
      data[p1_index].isGuessed == false &&
      data[p1_index].isCompultion == true
    ) {
      guess(data, p1_index, 1, rc, true);
      console.log(data);
    } else if (
      data[p1_index].isMyTurn == true &&
      data[p1_index].isGuessed == false &&
      data[p1_index].isCompultion == false
    ) {
      guess(data, p1_index, 1, rc);
      console.log(data);
    } else {
      socket.emit("card1round1", { roundNumber: rc });
    }
    scoreCard.innerHTML = "";
    data.forEach((player, index) => {
      scoreCard.innerHTML += `<div>
         <div>${player.name}</div>
         <div>${player.myGuess == undefined ? "-" : player.myGuess}</div>
        </div>`;
    });
  });
});
