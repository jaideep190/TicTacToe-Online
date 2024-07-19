import React, { useState, useEffect } from 'react';
import io from 'socket.io-client';
import Game from './components/Game';

const socket = io('https://tictactoe-online-api.onrender.com');

function App() {
  const [gameId, setGameId] = useState(null);
  const [player, setPlayer] = useState(null);
  const [passkey, setPasskey] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    socket.on('gameJoined', ({ gameId, player }) => {
      setGameId(gameId);
      setPlayer(player);
    });

    socket.on('error', (message) => {
      setError(message);
    });

    return () => {
      socket.off('gameJoined');
      socket.off('error');
    };
  }, []);

  const handleJoinGame = (e) => {
    e.preventDefault();
    socket.emit('joinGame', passkey);
  };

  const handleGoBack = () => {
    setGameId(null);
    setPlayer(null);
    setError('');
    setPasskey('');
  };

  return (
    <div className="app-container">
      <h1 className="app-title">Tic-Tac-Toe</h1>
      {!gameId ? (
        <div className="game-form">
          <input
            type="text"
            value={passkey}
            onChange={(e) => setPasskey(e.target.value)}
            placeholder="Enter game passkey"
            className="game-input"
          />
          <button onClick={handleJoinGame} className="game-button">
            Join Game
          </button>
          {error && <p className="error-message">{error}</p>}
        </div>
      ) : (
        <Game gameId={gameId} player={player} socket={socket} onGoBack={handleGoBack} />
      )}
    </div>
  );
}

export default App;