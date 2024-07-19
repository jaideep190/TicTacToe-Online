import React, { useState, useEffect } from 'react';
import Board from './Board';

function Game({ gameId, player, socket, onGoBack }) {
  const [board, setBoard] = useState(Array(9).fill(null));
  const [currentPlayer, setCurrentPlayer] = useState('X');
  const [winner, setWinner] = useState(null);
  const [status, setStatus] = useState('');

  useEffect(() => {
    socket.on('updateGame', ({ board, currentPlayer, winner }) => {
      setBoard(board);
      setCurrentPlayer(currentPlayer);
      if (winner) {
        setWinner(winner);
        setStatus(winner === player ? 'You win!' : winner === 'draw' ? "It's a draw!" : 'You lose!');
      } else {
        setStatus(currentPlayer === player ? 'Your turn' : "Opponent's turn");
      }
    });

    socket.on('gameStart', () => {
      setStatus('Game started!');
    });

    socket.on('waitingForPlayer', () => {
      setStatus('Waiting for another player...');
    });

    socket.on('playerDisconnected', (disconnectedWinner) => {
      setWinner(disconnectedWinner);
      setStatus('Your opponent disconnected. You win!');
    });

    return () => {
      socket.off('updateGame');
      socket.off('gameStart');
      socket.off('waitingForPlayer');
      socket.off('playerDisconnected');
    };
  }, [socket, player]);

  const handleCellClick = (index) => {
    if (board[index] || winner || currentPlayer !== player) return;
    socket.emit('move', { gameId, index, player });
  };

  return (
    <div className="game-container">
      <div className="game-info">
        <p className="game-status">{status}</p>
      </div>
      <Board board={board} onCellClick={handleCellClick} />
      {winner && (
        <button onClick={onGoBack} className="back-button">
          New Game
        </button>
      )}
    </div>
  );
}

export default Game;