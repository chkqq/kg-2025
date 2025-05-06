import React from 'react';

interface GameOverProps {
  score: number;
  onReset: () => void;
}

const GameOver: React.FC<GameOverProps> = ({ score, onReset }) => (
  <div style={{
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    padding: '20px',
    borderRadius: '10px',
    color: 'white',
    textAlign: 'center',
    fontFamily: 'Arial',
  }}>
    <h2>Game Over!</h2>
    <p>Your score: {score}</p>
    <button
      onClick={onReset}
      style={{
        padding: '10px 20px',
        fontSize: '18px',
        backgroundColor: '#4CAF50',
        color: 'white',
        border: 'none',
        borderRadius: '5px',
        cursor: 'pointer',
      }}
    >
      Play Again
    </button>
  </div>
);

export default GameOver;