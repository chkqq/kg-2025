import React, { useState, useEffect, useRef } from 'react';
import * as THREE from 'three';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, PerspectiveCamera, useTexture, Text } from '@react-three/drei';
import tileBack from './tile-back.jpg'
import tileOne from './tile-1.jpg'
import tileTwo from './tile-2.jpg'
import tileThree from './tile-3.png'
import tileFour from './tile-4.png'
import tileFive from './tile-5.png'
import tileSix from './tile-6.jpg'
import tileSeven from './tile-7.png'
import tileEight from './tile-8.png'

type Difficulty = 'easy' | 'medium' | 'hard';

interface GameConfig {
  rows: number;
  cols: number;
  imageCount: number;
}

interface TileProps {
  position: [number, number, number];
  imageIndex: number;
  isFlipped: boolean;
  isMatched: boolean;
  onClick: () => void;
}

const Tile: React.FC<TileProps> = ({ position, imageIndex, isFlipped, isMatched, onClick }) => {
  const meshRef = useRef<THREE.Mesh>(null);
  
  // Load textures
  const backTexture = useTexture(tileBack);
  const tex1 = useTexture(tileOne);
  const tex2 = useTexture(tileTwo);
  const tex3 = useTexture(tileThree);
  const tex4 = useTexture(tileFour);
  const tex5 = useTexture(tileFive);
  const tex6 = useTexture(tileSix);
  const tex7 = useTexture(tileSeven);
  const tex8 = useTexture(tileEight);
  
  const frontTextures = [tex1, tex2, tex3, tex4, tex5, tex6, tex7, tex8];
  
  // Animation for flipping
  useFrame(() => {
    if (meshRef.current) {
      const targetRotation = isFlipped ? Math.PI : 0;
      meshRef.current.rotation.y += (targetRotation - meshRef.current.rotation.y) * 0.2;
    }
  });

  if (isMatched) return null;

  return (
    <mesh
  ref={meshRef}
  position={position}
  onClick={onClick}
  castShadow
  receiveShadow
>
  <boxGeometry args={[0.9, 0.9, 0.05]} />
  {[
    backTexture, // Right
    backTexture, // Left
    backTexture, // Top
    backTexture, // Bottom
    isFlipped ? frontTextures[imageIndex % frontTextures.length] : backTexture, // Front
    isFlipped ? frontTextures[imageIndex % frontTextures.length] : backTexture  // Back
  ].map((tex, i) => (
    <meshStandardMaterial key={i} map={tex} />
  ))}
  
</mesh>

  );
};

const GameBoard: React.FC<{ config: GameConfig }> = ({ config }) => {
  const { rows, cols, imageCount } = config;
  const [tiles, setTiles] = useState<{ imageIndex: number; isFlipped: boolean; isMatched: boolean }[]>([]);
  const [flippedIndices, setFlippedIndices] = useState<number[]>([]);
  const [canFlip, setCanFlip] = useState(true);
  const [gameComplete, setGameComplete] = useState(false);
 
  useEffect(() => {
    initializeGame();
  }, [rows, cols, imageCount]);

  const initializeGame = () => {
    const totalTiles = rows * cols;
    const imageIndices: number[] = [];
    
    // Create pairs of image indices
    for (let i = 0; i < totalTiles / 2; i++) {
      const imageIndex = i % imageCount;
      imageIndices.push(imageIndex, imageIndex);
    }
    
    // Shuffle the array
    for (let i = imageIndices.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [imageIndices[i], imageIndices[j]] = [imageIndices[j], imageIndices[i]];
    }
    
    setTiles(imageIndices.map(imageIndex => ({
      imageIndex,
      isFlipped: false,
      isMatched: false
    })));
    setFlippedIndices([]);
    setCanFlip(true);
    setGameComplete(false);
  };

  const handleTileClick = (index: number) => {
    if (!canFlip || gameComplete || tiles[index].isMatched || flippedIndices.includes(index)) return;

    const newTiles = [...tiles];
    newTiles[index].isFlipped = !newTiles[index].isFlipped;
    setTiles(newTiles);

    if (newTiles[index].isFlipped) {
      const newFlippedIndices = [...flippedIndices, index];
      setFlippedIndices(newFlippedIndices);

      if (newFlippedIndices.length === 2) {
        setCanFlip(false);
        const [firstIndex, secondIndex] = newFlippedIndices;
        
        if (tiles[firstIndex].imageIndex === tiles[secondIndex].imageIndex) {
            // Match found
            setTimeout(() => {
              setTiles(prevTiles => {
                const updatedTiles = [...prevTiles];
                updatedTiles[firstIndex].isMatched = true;
                updatedTiles[secondIndex].isMatched = true;
          
                // Проверка на завершение игры здесь, внутри setTiles
                const gameIsComplete = updatedTiles.every(tile => tile.isMatched);
                if (gameIsComplete) {
                  setGameComplete(true);
                }
          
                return updatedTiles;
              });
              setFlippedIndices([]);
              setCanFlip(true);
            }, 1000);
        }
           else {
          // No match
          setTimeout(() => {
            setTiles(prevTiles => {
              const updatedTiles = [...prevTiles];
              updatedTiles[firstIndex].isFlipped = false;
              updatedTiles[secondIndex].isFlipped = false;
              return updatedTiles;
            });
            setFlippedIndices([]);
            setCanFlip(true);
          }, 1000);
        }
      }
    } else {
      setFlippedIndices(flippedIndices.filter(i => i !== index));
    }
  };

  const gridOffsetX = (cols - 1) * 0.5;
  const gridOffsetY = (rows - 1) * 0.5;

  return (
    <>
      {tiles.map((tile, index) => {
        const row = Math.floor(index / cols);
        const col = index % cols;
        return (
          <Tile
            key={index}
            position={[col - gridOffsetX, row - gridOffsetY, 0]}
            imageIndex={tile.imageIndex}
            isFlipped={tile.isFlipped}
            isMatched={tile.isMatched}
            onClick={() => handleTileClick(index)}
          />
        );
      })}
      
      {gameComplete && (
  <Text
  position={[0, 0, 0.1]}
  fontSize={0.5}
  color="black"
  anchorX="center"
  anchorY="middle"
>
  Congratulations! You won!
</Text>
)}

    </>
  );
};

const Scene: React.FC<{ config: GameConfig }> = ({ config }) => {
  return (
    <Canvas shadows>
      <ambientLight intensity={1.1} />
      <spotLight position={[10, 10, 10]} angle={0.15} penumbra={1} intensity={1} castShadow />
      <PerspectiveCamera makeDefault position={[0, 0, config.cols * 1.5]} />
      <OrbitControls enableZoom={true} enablePan={true} />
      <GameBoard config={config} />
    </Canvas>
  );
};

const MemoryTrainer3D: React.FC = () => {
  const [difficulty, setDifficulty] = useState<Difficulty>('medium');
  const [gameStarted, setGameStarted] = useState(false);

  const difficultyConfigs: Record<Difficulty, GameConfig> = {
    easy: { rows: 4, cols: 4, imageCount: 8 },
    medium: { rows: 6, cols: 6, imageCount: 8 },
    hard: { rows: 8, cols: 8, imageCount: 8 }
  };

  const handleStartGame = () => {
    setGameStarted(true);
  };

  const handleRestart = () => {
    setGameStarted(false);
  };

  return (
    <div style={{ width: '100vw', height: '100vh' }}>
      {!gameStarted ? (
        <div style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          textAlign: 'center',
          zIndex: 100,
          backgroundColor: 'rgba(255, 255, 255, 0.8)',
          padding: '20px',
          borderRadius: '10px'
        }}>
          <h1>Memory Trainer 3D</h1>
          <div style={{ margin: '20px 0' }}>
            <label style={{ marginRight: '10px' }}>Difficulty:</label>
            <select
              value={difficulty}
              onChange={(e) => setDifficulty(e.target.value as Difficulty)}
              style={{ padding: '5px' }}
            >
              <option value="easy">Easy</option>
              <option value="medium">Medium</option>
              <option value="hard">Hard</option>
            </select>
          </div>
          <button
            onClick={handleStartGame}
            style={{
              padding: '10px 20px',
              fontSize: '16px',
              backgroundColor: '#4CAF50',
              color: 'white',
              border: 'none',
              borderRadius: '5px',
              cursor: 'pointer'
            }}
          >
            Start Game
          </button>
        </div>
      ) : (
        <div style={{ position: 'relative', width: '100%', height: '100%' }}>
          <button
            onClick={handleRestart}
            style={{
              position: 'absolute',
              top: '20px',
              right: '20px',
              zIndex: 100,
              padding: '10px 20px',
              backgroundColor: '#f44336',
              color: 'white',
              border: 'none',
              borderRadius: '5px',
              cursor: 'pointer'
            }}
          >
            Restart
          </button>
          <Scene config={difficultyConfigs[difficulty]} />
        </div>
      )}
    </div>
  );
};

export default MemoryTrainer3D;