import React from 'react';

const LoadingIndicator: React.FC = () => (
  <div style={{
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    color: 'white',
    fontFamily: 'Arial',
    fontSize: '24px',
  }}>
    Loading textures...
  </div>
);

export default LoadingIndicator;