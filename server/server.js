const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const http = require('http');
const socketIo = require('socket.io');
const Game = require('./models/Game');

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: 'https://tic-tac-toe-online-client.vercel.app',
    methods: ['GET', 'POST'],
    credentials: true
  },
});

app.use(cors({
    origin: 'https://tic-tac-toe-online-client.vercel.app',
    methods: ['GET', 'POST'],
    credentials: true
}));
app.use(express.json());

mongoose.connect('mongodb+srv://jaideep:jaideep@cluster0.jxrrdcm.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const db = mongoose.connection;
db.on('error', console.error.bind(console, 'MongoDB connection error:'));
db.once('open', () => console.log('Connected to MongoDB'));

const games = new Map();

io.on('connection', (socket) => {
  console.log('New client connected');

  socket.on('joinGame', async (passkey) => {
    try {
      let game = await Game.findOne({ passkey });

      if (!game) {
        game = new Game({ passkey, players: [socket.id] });
        await game.save();
        socket.join(game._id.toString());
        socket.emit('gameJoined', { gameId: game._id, player: 'X' });
        socket.emit('waitingForPlayer');
      } else if (game.players.length === 1) {
        game.players.push(socket.id);
        await game.save();
        socket.join(game._id.toString());
        socket.emit('gameJoined', { gameId: game._id, player: 'O' });
        io.to(game._id.toString()).emit('gameStart');
        setTimeout(() => {
          io.to(game._id.toString()).emit('updateGame', {
            board: game.board,
            currentPlayer: game.currentPlayer,
            winner: game.winner,
          });
        }, 3000);
      } else {
        socket.emit('error', 'Game is full');
      }
    } catch (error) {
      console.error('Error joining game:', error);
      socket.emit('error', 'Failed to join game');
    }
  });

  socket.on('move', async ({ gameId, index, player }) => {
    try {
      const game = await Game.findById(gameId);
      if (!game) return;

      if (game.board[index] || game.winner || game.currentPlayer !== player) return;

      game.board[index] = player;
      game.currentPlayer = player === 'X' ? 'O' : 'X';

      const winner = checkWinner(game.board);
      if (winner) {
        game.winner = winner;
      }

      await game.save();

      io.to(gameId).emit('updateGame', {
        board: game.board,
        currentPlayer: game.currentPlayer,
        winner: game.winner,
      });
    } catch (error) {
      console.error('Error making move:', error);
    }
  });

  socket.on('disconnect', async () => {
    console.log('Client disconnected');
    try {
      const game = await Game.findOne({ players: socket.id });
      if (game) {
        game.winner = game.players[0] === socket.id ? 'O' : 'X';
        await game.save();
        io.to(game._id.toString()).emit('playerDisconnected');
      }
    } catch (error) {
      console.error('Error handling disconnect:', error);
    }
  });
});

function checkWinner(board) {
  const winPatterns = [
    [0, 1, 2],
    [3, 4, 5],
    [6, 7, 8],
    [0, 3, 6],
    [1, 4, 7],
    [2, 5, 8],
    [0, 4, 8],
    [2, 4, 6],
  ];

  for (const pattern of winPatterns) {
    const [a, b, c] = pattern;
    if (board[a] && board[a] === board[b] && board[a] === board[c]) {
      return board[a];
    }
  }

  if (board.every((cell) => cell !== null)) {
    return 'draw';
  }

  return null;
}

const PORT = process.env.PORT || 3001;
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));

module.exports = server;
