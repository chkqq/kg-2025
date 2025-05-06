import React from 'react';

interface ScoreDisplayProps {
  score: number;
  lives: number;
  cooldown: number;
  canShoot: boolean;
}

const ScoreDisplay: React.FC<ScoreDisplayProps> = ({ score, lives, cooldown, canShoot }) => (
  <div style={{
    position: 'absolute',
    top: 20,
    left: 20,
    color: 'white',
    fontFamily: 'Arial',
    fontSize: '24px',
    textShadow: '2px 2px 4px rgba(0, 0, 0, 0.5)',
  }}>
    <div>Score: {score}</div>
    <div>Lives: {lives}</div>
    {!canShoot && <div>Reloading: {cooldown.toFixed(1)}s</div>}
  </div>
);

export default ScoreDisplay;