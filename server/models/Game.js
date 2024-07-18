const mongoose = require('mongoose');

const gameSchema = new mongoose.Schema({
  passkey: { type: String, required: true },
  players: [{ type: String, required: true }],
  board: {
    type: [String],
    default: Array(9).fill(null),
  },
  currentPlayer: {
    type: String,
    default: 'X',
  },
  winner: {
    type: String,
    default: null,
  },
});

module.exports = mongoose.model('Game', gameSchema);