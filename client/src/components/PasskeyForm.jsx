import React, { useState } from 'react';

function PasskeyForm({ onSubmit, error }) {
  const [passkey, setPasskey] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(passkey);
  };

  return (
    <div className="passkey-form-container">
      <h2 className="passkey-title">Enter Game Passkey</h2>
      <p className="passkey-subtitle">Join an existing game or create a new one</p>
      <form onSubmit={handleSubmit} className="passkey-form">
        <div className="input-container">
          <input
            type="text"
            value={passkey}
            onChange={(e) => setPasskey(e.target.value)}
            placeholder="Enter passkey"
            className="passkey-input"
            required
          />
        </div>
        <button type="submit" className="passkey-submit">
          Join Game
        </button>
      </form>
      {error && <p className="error-message">{error}</p>}
    </div>
  );
}

export default PasskeyForm;