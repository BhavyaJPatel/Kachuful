// improt modules and create the http server
const express = require("express");
const socketio = require("socket.io");
const app = express();

// use static middleware make make html file public
app.use(express.static(`${__dirname}/public`));

// listen server on 8000 port
const expressServer = app.listen(8000, () => {
  console.log(`Server started!!!`);
});

// create socket.io server
const io = socketio(expressServer);

// //room number
let roomNumber = 0;

// object of rooms. key is room name and info is value
let roomMembers = {};
let name = undefined;
let id = undefined;
let isMyTurn = undefined;
let isMyFirstTurn = undefined;
let myGuess = undefined;
let cards = undefined;
let score = undefined;
let isGuessed = undefined;
let currentCard = undefined;
let isCompultion = undefined;
let currentHands = undefined;

// function to generate random cards
const randomCards = (roundNuber) => {
  // function to sort the array
  const sort = (arr) => {
    for (let i = 0; i < arr.length - 1; i++) {
      for (let j = i + 1; j < arr.length; j++) {
        if (arr[i] > arr[j]) {
          let temp = arr[i];
          arr[i] = arr[j];
          arr[j] = temp;
        }
      }
    }
    return arr;
  };

  const cardsForPlayers = [];

  const cards52 = [];
  for (let i = 0; i < 52; i++) {
    cards52.push(i);
  }

  let cards = [];

  for (let i = 0; i < 5; i++) {
    for (let j = 0; j < roundNuber; j++) {
      cards.push(
        cards52.splice(Math.floor((Math.random() * 100) % cards52.length), 1)[0]
      );
    }
    cardsForPlayers.push(sort(cards));
    cards = [];
  }

  return cardsForPlayers;
};

// on connection
io.on("connection", (socket) => {
  // getting username
  socket.on("userName", (userName) => {
    name = userName;
    id = socket.id;
    isMyTurn = false;
    myGuess = undefined;
    cards = [];
    score = [];
    isMyFirstTurn = false;
    isGuessed = false;
    isCompultion = false;
    currentCard = undefined;
    currentHands = 0;
  });

  // create room
  socket.on("createRoom", () => {
    // join room
    socket.join(`${++roomNumber}`);
    // creating list for object
    roomMembers[roomNumber] = [];
    isMyTurn = true;
    roomMembers[roomNumber].push({
      id,
      name,
      isMyTurn,
      myGuess,
      cards,
      score,
      isMyFirstTurn,
      isGuessed,
      isCompultion,
      currentCard,
      currentHands,
    });
    // sendign room object
    socket.emit("joinTheRoom", { roomCode: roomNumber });
    io.to(`${roomNumber}`).emit("listOFPlayers", roomMembers[roomNumber]);
  });

  // join room
  socket.on("joinRoom", (roomCode) => {
    // if room exist
    if (!io.sockets.adapter.rooms.has(`${roomCode.roomCode}`)) {
      socket.emit("joinRoomFromServer", false);
      // if there are 5 players
    } else if (roomMembers[`${roomCode.roomCode}`].length >= 5) {
      socket.emit("joinRoomFromServer", false);
      // join the list
    } else {
      socket.emit("joinRoomFromServer", true);
      roomMembers[roomCode.roomCode].push({
        id,
        name,
        isMyTurn,
        myGuess,
        cards,
        score,
        isMyFirstTurn,
        isGuessed,
        isCompultion,
        currentCard,
        currentHands,
      });
      socket.join(`${roomCode.roomCode}`);
      io.to(`${roomCode.roomCode}`).emit(
        "listOFPlayers",
        roomMembers[roomCode.roomCode]
      );
    }
  });
  socket.on("start-round-1", (roomNumberForRoud1) => {
    const cardsForRound1 = randomCards(1);
    roomMembers[`${roomNumberForRoud1}`][0].cards = cardsForRound1[0];
    roomMembers[`${roomNumberForRoud1}`][1].cards = cardsForRound1[1];
    roomMembers[`${roomNumberForRoud1}`][2].cards = cardsForRound1[2];
    roomMembers[`${roomNumberForRoud1}`][3].cards = cardsForRound1[3];
    roomMembers[`${roomNumberForRoud1}`][4].cards = cardsForRound1[4];
    roomMembers[`${roomNumberForRoud1}`][4].isCompultion = true;
    io.to(`${roomNumberForRoud1}`).emit(
      "start-round-1",
      roomMembers[`${roomNumberForRoud1}`]
    );
  });
  socket.on("round1guess", (data) => {
    roomMembers[`${data.roomNumber}`][data.index].myGuess = data.guess;
    roomMembers[`${data.roomNumber}`][data.index].isMyTurn = false;
    roomMembers[`${data.roomNumber}`][data.index].isGuessed = true;
    roomMembers[`${data.roomNumber}`][(data.index + 1) % 5].isMyTurn = true;
    io.to(`${data.roomNumber}`).emit(
      "round1guess",
      roomMembers[`${data.roomNumber}`]
    );
    let allGuesses = true;
    for (let i = 0; i < 5; i++) {
      if (roomMembers[`${data.roomNumber}`][i].isGuessed == false) {
        allGuesses = false;
        break;
      }
    }
    if (allGuesses == true) {
      roomMembers[`${data.roomNumber}`][0].isMyFirstTurn = true;
      io.to(`${data.roomNumber}`).emit(
        "start-game-1",
        roomMembers[`${data.roomNumber}`]
      );
    }
  });

  socket.on("card-number", (p_info) => {
    console.log(p_info);
    roomMembers[`${p_info.roomCode}`][p_info.index].isMyTurn = false;
    roomMembers[`${p_info.roomCode}`][p_info.index].currentCard = p_info.card;
    roomMembers[`${p_info.roomCode}`][(p_info.index + 1) % 5].isMyTurn = true;
    io.to(`${p_info.roomCode}`).emit(
      "card-number",
      roomMembers[`${p_info.roomCode}`]
    );
    let allGuessed = true;
    for (let i = 0; i < 5; i++) {
      if (roomMembers[`${p_info.roomCode}`][i].currentCard == undefined) {
        allGuessed = false;
        break;
      }
    }
    if (allGuessed == true) {
      io.to(`${p_info.roomCode}`).emit(
        "completeItetration",
        roomMembers[`${p_info.roomCode}`]
      );
    }
  });

  socket.on("score", (p_info) => {
    roomMembers[p_info.roomCode][p_info.index].currentHands += 1;
    io.to(`${p_info.roomCode}`).emit(
      "score",
      roomMembers[`${p_info.roomCode}`]
    );
  });

  socket.on("completeRound", (p_info) => {
    let firstPlayerIndex = undefined;
    for (let i = 0; i < 5; i++) {
      if (roomMembers[p_info.roomCode][i].isMyFirstTurn == true) {
        firstPlayerIndex = i;
      }
      roomMembers[p_info.roomCode][i].score.push(p_info.obj[i]);
      roomMembers[p_info.roomCode][i].isMyTurn = false;
      roomMembers[p_info.roomCode][i].myGuess = undefined;
      roomMembers[p_info.roomCode][i].isMyFirstTurn = false;
      roomMembers[p_info.roomCode][i].isGuessed = false;
      roomMembers[p_info.roomCode][i].isCompultion = false;
      roomMembers[p_info.roomCode][i].currentCard = undefined;
      roomMembers[p_info.roomCode][i].currentHands = 0;
    }

    roomMembers[p_info.roomCode][
      (firstPlayerIndex + 1) % 5
    ].isMyFirstTurn = true;

    roomMembers[p_info.roomCode][(firstPlayerIndex + 1) % 5].isMyTurn = true;

    roomMembers[p_info.roomCode][firstPlayerIndex].isCompultion = true;

    const cards = randomCards(p_info.roundNumber + 1);

    for (let i = 0; i < 5; i++) {
      roomMembers[p_info.roomCode][i].cards = cards[i];
    }

    console.log(roomMembers[p_info.roomCode]);
    io.to(`${p_info.roomCode}`).emit(
      `start-round-${p_info.roundNumber + 1}`,
      roomMembers[p_info.roomCode]
    );
  });
});

