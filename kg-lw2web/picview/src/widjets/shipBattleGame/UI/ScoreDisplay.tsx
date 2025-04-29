import React from 'react';

const ScoreDisplay: React.FC<{ score: number }> = ({ score }) => {
  return (
    <div className="score-display">
      <h2>Score: {score}</h2>
    </div>
  );
};

export default ScoreDisplay;