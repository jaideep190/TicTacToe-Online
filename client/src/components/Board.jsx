import React from 'react';

function Board({ board, onCellClick }) {
  return (
    <div className="board">
      {board.map((cell, index) => (
        <div
          key={index}
          className={`cell ${cell}`}
          onClick={() => onCellClick(index)}
        >
          {cell}
        </div>
      ))}
    </div>
  );
}

export default Board;