import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, useTexture } from '@react-three/drei';
import * as THREE from 'three';
import { useEffect, useRef, useState } from 'react';

// Текстуры (замените на свои файлы)
import WhiteSquareTexture from "./whiteChessBoard.jpg";
import BlackSquareTexture from "./blackChessBoard.jpg";
import WoodTexture from "./wood.jpg";
import WhitePieceTexture from "./white.jpg";
import BlackPieceTexture from "./black.jpg";

const ChessBoard = () => {
  const whiteTexture = useTexture(WhiteSquareTexture);
  const blackTexture = useTexture(BlackSquareTexture);
  const woodTexture = useTexture(WoodTexture);

  // Создаем 64 клетки (8x8)
  const squares = [];
  for (let i = 0; i < 8; i++) {
    for (let j = 0; j < 8; j++) {
      const isBlack = (i + j) % 2 === 1;
      squares.push(
        <mesh
          key={`${i}-${j}`}
          rotation={[-Math.PI / 2, 0, 0]}
          position={[i - 3.5, 0, j - 3.5]}
          receiveShadow
        >
          <planeGeometry args={[1, 1, 1, 1]} />
          <meshStandardMaterial map={isBlack ? blackTexture : whiteTexture} />
        </mesh>
      );
    }
  }

  return (
    <group>
      {/* Шахматные клетки */}
      {squares}
      
      {/* Деревянное основание доски */}
      <mesh position={[0, -0.101, 0]}>
        <boxGeometry args={[8.4, 0.2, 8.4]} />
        <meshStandardMaterial map={woodTexture} />
      </mesh>
    </group>
  );
};

type PieceType = 'pawn' | 'rook' | 'knight' | 'bishop' | 'queen' | 'king';
type PieceColor = 'white' | 'black';

interface PieceProps {
  type: PieceType;
  color: PieceColor;
  position: [number, number, number];
  animation?: {
    targetPosition: [number, number, number];
    duration: number;
    startTime: number;
  };
  onAnimationComplete?: () => void;
}

const ChessPiece = ({ type, color, position, animation, onAnimationComplete }: PieceProps) => {
  const texture = useTexture(color === 'white' ? WhitePieceTexture : BlackPieceTexture);
  const material = new THREE.MeshStandardMaterial({ 
    map: texture,
    roughness: 0.3,
    metalness: color === 'white' ? 0.5 : 0.8
  });
  const groupRef = useRef<THREE.Group>(null);

  // Анимация движения фигуры
  useFrame((state) => {
    if (animation && groupRef.current) {
      const currentTime = state.clock.getElapsedTime();
      const elapsed = currentTime - animation.startTime;
      
      if (elapsed < animation.duration) {
        const progress = elapsed / animation.duration;
        const [startX, startY, startZ] = position;
        const [targetX, targetY, targetZ] = animation.targetPosition;
        
        const liftHeight = 0.5;
        const liftProgress = progress < 0.5 ? progress * 2 : (1 - progress) * 2;
        const yPos = startY + (liftProgress * liftHeight);
        
        const xPos = startX + (targetX - startX) * progress;
        const zPos = startZ + (targetZ - startZ) * progress;
        
        groupRef.current.position.set(xPos, yPos, zPos);
      } else {
        groupRef.current.position.set(
          animation.targetPosition[0],
          animation.targetPosition[1],
          animation.targetPosition[2]
        );
        if (onAnimationComplete) {
          onAnimationComplete();
        }
      }
    }
  });

  const createKnight = () => {
    const isBlack = color === 'black';
    const headRotation = isBlack ? Math.PI : 0;
    
    return (
      <group>
        <mesh castShadow geometry={new THREE.CylinderGeometry(0.15, 0.2, 0.4, 32)} material={material} position={[0, 0.05, 0]} />
        <mesh castShadow geometry={new THREE.CylinderGeometry(0.3, 0.4, 0.2, 32)} material={material} position={[0, -0.2, 0]} />
  
        {/* Голова коня */}
        <group rotation={[0, headRotation, 0]}>
          <mesh castShadow geometry={new THREE.BoxGeometry(0.3, 0.1, 0.5)} material={material} position={[0, 0.3, 0.1]} />
          <mesh castShadow geometry={new THREE.BoxGeometry(0.3, 0.1, 0.25)} material={material} position={[0, 0.4, -0.025]} />
          <mesh castShadow geometry={new THREE.BoxGeometry(0.3, 0.1, 0.5)} material={material} position={[0, 0.5, 0.1]} />
          <mesh castShadow geometry={new THREE.BoxGeometry(0.3, 0.1, 0.25)} material={material} position={[0, 0.6, -0.025]} />
          <mesh castShadow geometry={new THREE.CylinderGeometry(0, 0.075, 0.15, 32)} material={material} position={[0.075, 0.71, 0]} />
          <mesh castShadow geometry={new THREE.CylinderGeometry(0, 0.075, 0.15, 32)} material={material} position={[-0.075, 0.71, 0]} />
        </group>
      </group>
    );
  };
  
  const createPawn = () => (
    <group>
      <mesh castShadow geometry={new THREE.SphereGeometry(0.2, 32, 32)} material={material} position={[0, 0.3, 0]} />
      <mesh castShadow geometry={new THREE.CylinderGeometry(0.1, 0.2, 0.3, 32)} material={material} position={[0, 0, 0]} />
      <mesh castShadow geometry={new THREE.CylinderGeometry(0.25, 0.3, 0.2, 32)} material={material} position={[0, -0.2, 0]} />
    </group>
  );

  const createBishop = () => (
    <group>
      <mesh castShadow geometry={new THREE.SphereGeometry(0.1, 32, 64)} material={material} position={[0, 0.735, 0]} />
      <mesh castShadow geometry={new THREE.CylinderGeometry(0.2, 0.1, 0.3, 32)} material={material} position={[0, 0.3, 0]} />
      <mesh castShadow geometry={new THREE.CylinderGeometry(0.1, 0.2, 0.3, 32)} material={material} position={[0, 0.6, 0]} />
      <mesh castShadow geometry={new THREE.CylinderGeometry(0.1, 0.2, 0.5, 32)} material={material} position={[0, 0.2, 0]} />
      <mesh castShadow geometry={new THREE.CylinderGeometry(0.3, 0.4, 0.3, 32)} material={material} position={[0, -0.2, 0]} />
    </group>
  );

  const createRook = () => (
    <group>
      <mesh castShadow geometry={new THREE.CylinderGeometry(0.25, 0.25, 0.7, 32)} material={material} position={[0, 0.2, 0]} />
      <mesh castShadow geometry={new THREE.CylinderGeometry(0.3, 0.4, 0.2, 32)} material={material} position={[0, -0.2, 0]} />
      <mesh castShadow geometry={new THREE.CylinderGeometry(0.4, 0.3, 0.2, 32)} material={material} position={[0, 0.5, 0]} />
    </group>
  );
  
  const createQueen = () => (
    <group>
      <mesh castShadow geometry={new THREE.CylinderGeometry(0.3, 0.4, 0.2, 32)} material={material} position={[0, -0.2, 0]} />
      <mesh castShadow geometry={new THREE.CylinderGeometry(0.1, 0.2, 0.8, 32)} material={material} position={[0, 0.3, 0]} />
      <mesh castShadow geometry={new THREE.CylinderGeometry(0.23, 0.23, 0.1, 32)} material={material} position={[0, 0.7, 0]} />
      <mesh castShadow geometry={new THREE.SphereGeometry(0.15, 32, 32)} material={material} position={[0, 0.85, 0]} />
    </group>
  );

  const createKing = () => (
    <group>
      <mesh castShadow geometry={new THREE.CylinderGeometry(0.3, 0.4, 0.2, 32)} material={material} position={[0, -0.2, 0]} />
      <mesh castShadow geometry={new THREE.CylinderGeometry(0.15, 0.2, 0.1, 32)} material={material} position={[0, -0.05, 0]} />
      <mesh castShadow geometry={new THREE.CylinderGeometry(0.15, 0.15, 0.7, 32)} material={material} position={[0, 0.3, 0]} />
      <mesh castShadow geometry={new THREE.SphereGeometry(0.19, 32, 32)} material={material} position={[0, 0.7, 0]} />
      <mesh castShadow geometry={new THREE.BoxGeometry(0.15, 0.3, 0.15)} material={material} position={[0, 0.9, 0]} />
    </group>
  );

  const pieceComponents = {
    pawn: createPawn,
    rook: createRook,
    knight: createKnight,
    bishop: createBishop,
    queen: createQueen,
    king: createKing
  };

  return (
    <group ref={groupRef} position={position}>
      {pieceComponents[type]()}
    </group>
  );
};

const ChessScene = () => {
  type PieceConfig = {
    id: string;
    type: PieceType;
    color: PieceColor;
    position: [number, number, number];
    animation?: {
      targetPosition: [number, number, number];
      duration: number;
      startTime: number;
    };
  };

  const [pieces, setPieces] = useState<PieceConfig[]>([]);
  const [gameState, setGameState] = useState<'setup' | 'playing' | 'mate'>('setup');
  const [currentMove, setCurrentMove] = useState(0);
  const clockRef = useRef<THREE.Clock>(new THREE.Clock());

  // Инициализация шахматной доски
  useEffect(() => {
    const initialPieces: PieceConfig[] = [
      // Белые фигуры
      { id: 'wr1', type: 'rook', color: 'white', position: [-3.5, 0.3, -3.5] },
      { id: 'wn1', type: 'knight', color: 'white', position: [-2.5, 0.3, -3.5] },
      { id: 'wb1', type: 'bishop', color: 'white', position: [-1.5, 0.3, -3.5] },
      { id: 'wq', type: 'queen', color: 'white', position: [-0.5, 0.3, -3.5] },
      { id: 'wk', type: 'king', color: 'white', position: [0.5, 0.3, -3.5] },
      { id: 'wb2', type: 'bishop', color: 'white', position: [1.5, 0.3, -3.5] },
      { id: 'wn2', type: 'knight', color: 'white', position: [2.5, 0.3, -3.5] },
      { id: 'wr2', type: 'rook', color: 'white', position: [3.5, 0.3, -3.5] },
      ...Array(8).fill(0).map((_, i) => ({
        id: `wp${i+1}`,
        type: 'pawn' as const,
        color: 'white' as const,
        position: [-3.5 + i, 0.3, -2.5] as [number, number, number]
      })),
      
      // Черные фигуры
      { id: 'br1', type: 'rook', color: 'black', position: [-3.5, 0.3, 3.5] },
      { id: 'bn1', type: 'knight', color: 'black', position: [-2.5, 0.3, 3.5] },
      { id: 'bb1', type: 'bishop', color: 'black', position: [-1.5, 0.3, 3.5] },
      { id: 'bq', type: 'queen', color: 'black', position: [-0.5, 0.3, 3.5] },
      { id: 'bk', type: 'king', color: 'black', position: [0.5, 0.3, 3.5] },
      { id: 'bb2', type: 'bishop', color: 'black', position: [1.5, 0.3, 3.5] },
      { id: 'bn2', type: 'knight', color: 'black', position: [2.5, 0.3, 3.5] },
      { id: 'br2', type: 'rook', color: 'black', position: [3.5, 0.3, 3.5] },
      ...Array(8).fill(0).map((_, i) => ({
        id: `bp${i+1}`,
        type: 'pawn' as const,
        color: 'black' as const,
        position: [-3.5 + i, 0.3, 2.5] as [number, number, number]
      })),
    ];

    setPieces(initialPieces);
    setGameState('setup');
    setCurrentMove(0);
  }, []);

  const moves = [
    { pieceId: 'wp2', targetPosition: [-3.5 + 1, 0.3, -2.5 + 2] }, 
    
    { pieceId: 'bp4', targetPosition: [-3.5 + 3, 0.3, 2.5 - 2] },
    { pieceId: 'wp3', targetPosition: [-3.5 + 2, 0.3, -2.5 + 1] },
    { pieceId: 'bp5', targetPosition: [-3.5 + 4, 0.3, 2.5 - 1] },
    { pieceId: 'wq', targetPosition: [-3.5, 0.3, -0.5] },

  ];

  // Запуск анимации
  const startAnimation = () => {
    setGameState('playing');
    clockRef.current.start();
    playNextMove();
  };

  // Воспроизведение следующего хода
  const playNextMove = () => {
    if (currentMove >= moves.length) {
      setGameState('mate');
      return;
    }

    const move = moves[currentMove];
    const pieceIndex = pieces.findIndex(p => p.id === move.pieceId);
    
    if (pieceIndex !== -1) {
      const newPieces = [...pieces];
      const startTime = clockRef.current.getElapsedTime();
      
      newPieces[pieceIndex] = {
        ...newPieces[pieceIndex],
        animation: {
          targetPosition: move.targetPosition,
          duration: 1.5,
          startTime
        }
      };

      setPieces(newPieces);
      setCurrentMove(currentMove + 1);
    }
  };

  const handleAnimationComplete = (pieceId: string) => {
    const pieceIndex = pieces.findIndex(p => p.id === pieceId);
    if (pieceIndex !== -1 && pieces[pieceIndex].animation) {
      const newPieces = [...pieces];
      newPieces[pieceIndex] = {
        ...newPieces[pieceIndex],
        position: newPieces[pieceIndex].animation!.targetPosition,
        animation: undefined
      };
      setPieces(newPieces);
    }

    setTimeout(playNextMove, 1000);
  };

  return (
    <div style={{ position: 'relative', width: '100%', height: '100vh' }}>
      <Canvas 
        shadows 
        camera={{ position: [10, 10, 10], fov: 45 }}
        gl={{ antialias: true }}
      >
        <ambientLight intensity={0.3} />
        <directionalLight
          position={[10, 10, 5]}
          intensity={1}
          castShadow
          shadow-mapSize-width={2048}
          shadow-mapSize-height={2048}
        />
        <pointLight position={[-5, 5, -5]} intensity={0.5} />
        
        <ChessBoard />
        {pieces.map((piece) => (
          <ChessPiece 
            key={piece.id}
            type={piece.type}
            color={piece.color}
            position={piece.position}
            animation={piece.animation}
            onAnimationComplete={() => handleAnimationComplete(piece.id)}
          />
        ))}
        
        <OrbitControls 
          enableDamping
          dampingFactor={0.05}
          minDistance={5}
          maxDistance={20}
          autoRotate
          autoRotateSpeed={0.5}
        />
      </Canvas>

      {gameState === 'setup' && (
        <button 
          onClick={startAnimation}
          style={{
            position: 'absolute',
            top: '20px',
            left: '50%',
            transform: 'translateX(-50%)',
            padding: '10px 20px',
           
            cursor: 'pointer',
            zIndex: 100
          }}
        >
          start
        </button>
      )}
    </div>
  );
};

export default ChessScene;