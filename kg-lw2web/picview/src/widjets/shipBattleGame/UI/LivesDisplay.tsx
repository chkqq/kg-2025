import React from 'react';

const LivesDisplay: React.FC<{ lives: number }> = ({ lives }) => {
  return (
    <div className="lives-display">
      <h3>Lives: {lives}</h3>
      <div className="hearts">
        {Array.from({ length: lives }).map((_, i) => (
          <span key={i} className="heart">❤️</span>
        ))}
      </div>
    </div>
  );
};

export default LivesDisplay;