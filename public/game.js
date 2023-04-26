// connecting to the socket server
const socket = io("https://kachuful.onrender.com/");


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
    <td class="score-p1r${i}">${data[0].score[i - 1]}</td>
    <td class="score-p2r${i}">${data[1].score[i - 1]}</td>
    <td class="score-p3r${i}">${data[2].score[i - 1]}</td>
    <td class="score-p4r${i}">${data[3].score[i - 1]}</td>
    <td class="score-p5r${i}">${data[4].score[i - 1]}</td>
    </tr>`;
    totalScoreOfP1 += data[0].score[i - 1];
    totalScoreOfP2 += data[1].score[i - 1];
    totalScoreOfP3 += data[2].score[i - 1];
    totalScoreOfP4 += data[3].score[i - 1];
    totalScoreOfP5 += data[4].score[i - 1];
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
  }, 1000);
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
          cardCode == "&#9829;" || cardCode == "&#9830;" ? "red" : "black"
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
    <button class='c${cardNuber}b black' value='${cN}'>
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
                    : ` ${players[p1_i].myGuess} `
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

// ///////////////////////////////////////////////////////////////////////////////////////////////////////////

const playCards = (players, roundNumber, rc) => {
  let p1_index = undefined;
  players.forEach((player, index) => {
    if (player.isMyFirstTurn == true) {
      p1_index = index;
    }
  });

  let myIndex = undefined;
  players.forEach((p, i) => {
    if (socket.id == p.id) {
      myIndex = i;
    }
  });

  if (socket.id == players[p1_index].id && players[p1_index].isMyTurn == true) {
    let p1_guessedValue = undefined;
    const cards = document.querySelectorAll(".box .card");
    const buttons = document.querySelectorAll(".box .card button");
    buttons.forEach((btn, index) => {
      btn.disabled = false;
      btn.addEventListener("click", () => {
        p1_guessedValue = btn.value;
        cards[index].style.animation = "slideup 1s ease-out 0s 1 forwards";
        buttons.forEach((b, i) => {
          b.disabled = true;
        });
        socket.emit("card-number", {
          roomCode: rc,
          index: p1_index,
          card: p1_guessedValue,
        });
      });
    });
  } else {
    let p_guessedValue = undefined;
    let firstCard = players[p1_index].currentCard;
    let lower = undefined;
    let upper = undefined;
    if (firstCard < 13) {
      lower = 0;
      upper = 12;
    } else if (firstCard < 26) {
      lower = 13;
      upper = 25;
    } else if (firstCard < 39) {
      lower = 26;
      upper = 38;
    } else {
      lower = 39;
      upper = 51;
    }
    const cards = document.querySelectorAll(".box .card");
    const buttons = document.querySelectorAll(".box .card button");

    let cardExist = false;
    buttons.forEach((btn) => {
      if (btn.value >= lower && btn.value <= upper) {
        cardExist = true;
      }
    });

    if (!cardExist) {
      buttons.forEach((btn, index) => {
        btn.disabled = false;
        btn.addEventListener("click", () => {
          p_guessedValue = btn.value;
          cards[index].style.animation = "slideup 1s ease-out 0s 1 forwards";
          buttons.forEach((b, i) => {
            b.disabled = true;
          });
          socket.emit("card-number", {
            roomCode: rc,
            index: myIndex,
            card: p_guessedValue,
          });
        });
      });
    } else {
      buttons.forEach((btn, index) => {
        if (btn.value >= lower && btn.value <= upper) {
          btn.disabled = false;
          btn.addEventListener("click", () => {
            p_guessedValue = btn.value;
            cards[index].style.animation = "slideup 1s ease-out 0s 1 forwards";
            buttons.forEach((b, i) => {
              b.disabled = true;
            });
            socket.emit("card-number", {
              roomCode: rc,
              index: myIndex,
              card: p_guessedValue,
            });
          });
        }
      });
    }
  }
};

// ///////////////////////////////////////////////////////////////////////////////////////////////////////////

const completeRound = (players, roomCode, roundNumber) => {
  let p1_Index = undefined;
  for (let i = 0; i < 5; i++) {
    if (players[i].isMyFirstTurn == true) {
      p1_Index = i;
      break;
    }
  }
  let p2_Index = (p1_Index + 1) % 5;
  let p3_Index = (p2_Index + 1) % 5;
  let p4_Index = (p3_Index + 1) % 5;
  let p5_Index = (p4_Index + 1) % 5;

  let p1_Score = 0;
  let p2_Score = 0;
  let p3_Score = 0;
  let p4_Score = 0;
  let p5_Score = 0;

  if (players[p1_Index].currentHands == players[p1_Index].myGuess) {
    p1_Score =
      players[p1_Index].currentHands == 0
        ? 10
        : players[p1_Index].currentHands * 10;
  }
  if (players[p2_Index].currentHands == players[p2_Index].myGuess) {
    p2_Score =
      players[p2_Index].currentHands == 0
        ? 10
        : players[p2_Index].currentHands * 10;
  }
  if (players[p3_Index].currentHands == players[p3_Index].myGuess) {
    p3_Score =
      players[p3_Index].currentHands == 0
        ? 10
        : players[p3_Index].currentHands * 10;
  }
  if (players[p4_Index].currentHands == players[p4_Index].myGuess) {
    p4_Score =
      players[p4_Index].currentHands == 0
        ? 10
        : players[p4_Index].currentHands * 10;
  }
  if (players[p5_Index].currentHands == players[p5_Index].myGuess) {
    p5_Score =
      players[p5_Index].currentHands == 0
        ? 10
        : players[p5_Index].currentHands * 10;
  }

  if (socket.id == players[p1_Index].id) {
    socket.emit("completeRound", {
      roomCode: roomCode,
      obj: {
        [p1_Index]: p1_Score,
        [p2_Index]: p2_Score,
        [p3_Index]: p3_Score,
        [p4_Index]: p4_Score,
        [p5_Index]: p5_Score,
      },
      roundNumber: roundNumber,
    });
  }
};

const popWinningPLayer = (name) => {
  document.querySelector(".winModal p").innerHTML = `🥳 ${name} Won!!! 🥳`;
  document.querySelector(".overlay-back").style.display = `block`;
  document.querySelector(".winModal").display = `flex`;
};

const hidePlayer = () => {
  setTimeout(() => {
    documen.querySelector(".winModal p").innerHTML = `🥳 ${name} Won!!! 🥳`;
    documen.querySelector(".overlay-back").style.display = `none`;
    document.querySelector(".winModal").display = `none`;
  }, 3000);
};

// ///////////////////////////////////////////////////////////////////////////////////////////////////////////

const manageHands = (players, lower, upper, roomCode) => {
  let p1_index = undefined;
  players.forEach((p, i) => {
    if (p.isMyFirstTurn == true) {
      p1_index = i;
    }
  });

  console.log(p1_index);
  let p2_index = (p1_index + 1) % 5;
  let p3_index = (p2_index + 1) % 5;
  let p4_index = (p3_index + 1) % 5;
  let p5_index = (p4_index + 1) % 5;

  p1_card = { index: p1_index, card: Number(players[p1_index].currentCard) };
  p2_card = { index: p2_index, card: Number(players[p2_index].currentCard) };
  p3_card = { index: p3_index, card: Number(players[p3_index].currentCard) };
  p4_card = { index: p4_index, card: Number(players[p4_index].currentCard) };
  p5_card = { index: p5_index, card: Number(players[p5_index].currentCard) };

  let firstPlayerCard = p1_card.card;
  let legalupper = undefined;
  let legalLower = undefined;

  if (firstPlayerCard < 13) {
    legalLower = 0;
    legalupper = 12;
  } else if (firstPlayerCard < 26) {
    legalLower = 13;
    legalupper = 25;
  } else if (firstPlayerCard < 39) {
    legalLower = 26;
    legalupper = 38;
  } else {
    legalLower = 39;
    legalupper = 51;
  }

  let itsLegal = [];
  let itsTrump = [];
  let itsUseless = [];

  if (firstPlayerCard >= lower && firstPlayerCard <= upper) {
    itsTrump.push(p1_card);
    if (p2_card.card >= lower && p2_card.card <= upper) {
      itsTrump.push(p2_card);
    } else {
      itsUseless.push(p2_card);
    }
    if (p3_card.card >= lower && p3_card.card <= upper) {
      itsTrump.push(p3_card);
    } else {
      itsUseless.push(p3_card);
    }
    if (p4_card.card >= lower && p4_card.card <= upper) {
      itsTrump.push(p4_card);
    } else {
      itsUseless.push(p4_card);
    }
    if (p5_card.card >= lower && p5_card.card <= upper) {
      itsTrump.push(p5_card);
    } else {
      itsUseless.push(p5_card);
    }
  } else {
    itsLegal.push(p1_card);
    if (p2_card.card >= lower && p2_card.card <= upper) {
      itsTrump.push(p2_card);
    } else if (p2_card.card >= legalLower && p2_card.card <= legalupper) {
      itsLegal.push(p2_card);
    } else {
      itsUseless.push(p2_card);
    }
    if (p3_card.card >= lower && p3_card.card <= upper) {
      itsTrump.push(p3_card);
    } else if (p3_card.card >= legalLower && p3_card.card <= legalupper) {
      itsLegal.push(p3_card);
    } else {
      itsUseless.push(p3_card);
    }
    if (p4_card.card >= lower && p4_card.card <= upper) {
      itsTrump.push(p4_card);
    } else if (p4_card.card >= legalLower && p4_card.card <= legalupper) {
      itsLegal.push(p4_card);
    } else {
      itsUseless.push(p4_card);
    }
    if (p5_card.card >= lower && p5_card.card <= upper) {
      itsTrump.push(p5_card);
    } else if (p5_card.card >= legalLower && p5_card.card <= legalupper) {
      itsLegal.push(p5_card);
    } else {
      itsUseless.push(p5_card);
    }
  }

  let winningCard = { index: -1, card: -1 };

  if (itsTrump.length != 0) {
    itsTrump.forEach((pCard) => {
      if (winningCard.card < pCard.card) {
        winningCard = pCard;
      }
    });
  } else {
    itsLegal.forEach((pCard) => {
      if (winningCard.card < pCard.card) {
        winningCard = pCard;
      }
    });
  }

  popWinningPLayer(players[winningCard.index].name);

  if (socket.id == players[p1_index].id) {
    socket.emit("score", { roomCode: roomCode, index: winningCard.index });
  }
};
// ///////////////////////////////////////////////////////////////////////////////////////////////////////////
// ///////////////////////////////////////////////////////////////////////////////////////////////////////////

socket.on("start-round-1", (players) => {
  //................................................
  document.querySelector(".loby").style.display = "none";
  popPopScoreCard(players, 1);
  hideScoreCard();
  //................................................
  let p1_index = undefined;
  players.forEach((element, index) => {
    if (element.id == socket.id) {
      p1_index = index;
    }
  });
  //................................................
  const scoreCard = document.querySelector(".score");
  players.forEach((player, index) => {
    scoreCard.innerHTML += `<div>
    <div>${player.name}</div>
          <div>${
            player.myGuess == undefined ? "-" : `0/${player.myGuess}`
          }</div>
    </div>`;
  });
  //................................................
  document.querySelector(".game .round .trump span").innerHTML = "&#9824;";
  document.querySelector(".game .round .curentRound p span").textContent = 1;
  //................................................

  let p2_index = (p1_index + 1) % 5;
  let p3_index = (p2_index + 1) % 5;
  let p4_index = (p3_index + 1) % 5;
  let p5_index = (p4_index + 1) % 5;

  //................................................
  const otherPlayers = document.querySelector(".otherPlayers");
  otherPlayers.innerHTML = "";
  otherPlayers.innerHTML = `<div class = "otherPlayerInfo">
                                <div class='player'>
                                  <div class="player-playerInfo">
                                    <p class='player-playerName'>${players[p2_index].name}</p>
                                  </div>
                                </div>
                                <div class='card-for-p2'></div>
                                  <p class="player-playerGuessing" id=${players[p2_index].id} style='font-size:13px'>Guessing</p>
                                </div>
                              <div class = "otherPlayerInfo">
                              <div class='player'>
                              <div class="player-playerInfo">
                              <p class='player-playerName'>${players[p3_index].name}</p>
                              </div>
                              </div>
                              <div class='card-for-p3'></div>
                              <p class="player-playerGuessing" id=${players[p3_index].id} style='font-size:13px'>Guessing</p>
                              </div>
                              <div class = "otherPlayerInfo">
                              <div class='player'>
                              <div class="player-playerInfo">
                              <p class='player-playerName'>${players[p4_index].name}</p>
                              </div>
                              </div>
                              <div class='card-for-p4'></div>
                              <p class="player-playerGuessing" id=${players[p4_index].id} style='font-size:13px'>Guessing</p>
                              </div>
                              <div class = "otherPlayerInfo">
                              <div class='player'>
                              <div class="player-playerInfo">
                              <p class='player-playerName'>${players[p5_index].name}</p>
                              </div>
                              </div>
                              <div class='card-for-p5'></div>
                              <p class="player-playerGuessing" id=${players[p5_index].id} style='font-size:13px'>Guessing</p>
                            </div>`;

  document.querySelector(".game").style.display = `flex`;
  document.querySelector(".box").innerHTML = createCards(
    players[p1_index].cards
  );

  //................................................
  document.querySelectorAll(".box .card button").forEach((btn) => {
    btn.disabled = true;
  });
  //................................................

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
    } else if (
      data[p1_index].isMyTurn == true &&
      data[p1_index].isGuessed == false &&
      data[p1_index].isCompultion == false
    ) {
      guess(data, p1_index, 1, rc);
    } else {
      socket.emit("card1round1", { roundNumber: rc });
    }
    scoreCard.innerHTML = "";
    data.forEach((player, index) => {
      scoreCard.innerHTML += `<div>
      <div>${player.name}</div>
      <div>${player.myGuess == undefined ? "-" : `0/${player.myGuess}`}</div>
      </div>`;
    });
  });

  //................................................
  socket.on("start-game-1", (data) => {
    data.forEach((p, i) => {
      if (p.isMyFirstTurn == true && socket.id == p.id) {
        playCards(data, 1, rc);
      }
    });

    socket.on("card-number", (new_data) => {
      //................................................
      let trueIndex = undefined;
      new_data.forEach((p, i) => {
        if (p.isMyTurn == true) {
          trueIndex = i;
        }
      });
      let beforePlayer = trueIndex - 1 < 0 ? trueIndex - 1 + 5 : trueIndex - 1;
      let caerdId =
        beforePlayer - p1_index < 0
          ? beforePlayer - p1_index + 1 + 5
          : beforePlayer - p1_index + 1;
      if (caerdId != 1) {
        let beforePlayerCard = [];
        beforePlayerCard.push(Number(new_data[beforePlayer].currentCard));
        document.querySelector(`.card-for-p${caerdId}`).innerHTML =
          createCards(beforePlayerCard);
      }
      //................................................
      if (
        socket.id == new_data[trueIndex].id &&
        new_data[trueIndex].currentCard == undefined
      ) {
        const roundWinner = playCards(new_data, 1, rc);
      }
    });
    socket.on("completeItetration", (data) => {
      manageHands(data, 0, 12, rc);
    });
    socket.on("score", (new_data) => {
      completeRound(new_data, rc, 1);
    });
  });
});

socket.on("start-round-2", (players) => {
  // alert("i am round 2");
  popPopScoreCard(players, 2);
});

