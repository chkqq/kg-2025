import { useState, useRef, Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Sky, Environment, useTexture, useGLTF, ContactShadows, Html } from '@react-three/drei';
import { EffectComposer, DepthOfField, Bloom, Noise, Vignette } from '@react-three/postprocessing';
import { BrickWall, BrickWallWithGraffiti } from './BrickWall';
import { Roof } from './Roof';
import { Ground } from './Ground';
import { Fence } from './Fence';
import { LampPost } from './LampPost';
import { Garage } from './Garage';
import { Porch } from './Porch';

function Cottage() {
  return (
    <group position={[0, 0, 0]}>
      {/* Основной дом */}
      <group position={[0, 0, 0]}>
        {/* Передняя стена */}
        <BrickWall position={[0, 1.5, -5]} rotation={[0, 0, 0]} size={[10, 3, 0.3]} />
        
        {/* Задняя стена */}
        <BrickWall position={[0, 1.5, 5]} rotation={[0, Math.PI, 0]} size={[10, 3, 0.3]} />
        
        {/* Левая стена */}
        <BrickWall position={[-5, 1.5, 0]} rotation={[0, Math.PI/2, 0]} size={[10, 3, 0.3]} />
        
        {/* Правая стена с граффити */}
        <BrickWallWithGraffiti 
          position={[5, 1.5, 0]} 
          rotation={[0, -Math.PI/2, 0]} 
          size={[10, 3, 0.3]} 
          graffitiPosition={[0, 1.5, 0.31]}
        />
        
        {/* Крыша */}
        <Roof position={[0, 3, 0]} size={[10.5, 0.5, 10.5]} />
        
        {/* Окна */}
        <Window position={[-2, 2, -5.1]} rotation={[0, 0, 0]} size={[1.5, 1, 0.1]} />
        <Window position={[2, 2, -5.1]} rotation={[0, 0, 0]} size={[1.5, 1, 0.1]} />
        <Window position={[5.1, 2, -2]} rotation={[0, Math.PI/2, 0]} size={[1.5, 1, 0.1]} />
        <Window position={[5.1, 2, 2]} rotation={[0, Math.PI/2, 0]} size={[1.5, 1, 0.1]} />
        
        {/* Дверь */}
        <Door position={[0, 0.5, -5.1]} rotation={[0, 0, 0]} size={[1.5, 2, 0.1]} />
      </group>
      
      {/* Гараж */}
      <Garage position={[-8, 0, 3]} />
      
      {/* Крыльцо */}
      <Porch position={[0, -0.5, -5.5]} />
      
      {/* Забор */}
      <Fence position={[0, 0, 0]} />
      
      {/* Фонари */}
      <LampPost position={[8, 0, 8]} />
      <LampPost position={[-8, 0, -8]} />
    </group>
  );
}

function Window({ position, rotation, size }: { position: [number, number, number], rotation: [number, number, number], size: [number, number, number] }) {
  return (
    <mesh position={position} rotation={rotation}>
      <boxGeometry args={size} />
      <meshStandardMaterial color="#a0d0ff" transparent opacity={0.7} />
    </mesh>
  );
}

function Door({ position, rotation, size }: { position: [number, number, number], rotation: [number, number, number], size: [number, number, number] }) {
  const texture = useTexture({
    map: 'https://raw.githubusercontent.com/mrdoob/three.js/dev/examples/textures/door/wood.jpg',
  });
  
  return (
    <mesh position={position} rotation={rotation}>
      <boxGeometry args={size} />
      <meshStandardMaterial {...texture} color="#8B4513" />
      <mesh position={[0.7, 0, 0.06]}>
        <sphereGeometry args={[0.05, 16, 16]} />
        <meshStandardMaterial color="#888888" />
      </mesh>
    </mesh>
  );
}

function Scene() {
  const [fogEnabled, setFogEnabled] = useState(false);
  const controlsRef = useRef<any>();
  
  return (
    <div style={{ width: '100vw', height: '100vh' }}>
      <Canvas shadows camera={{ position: [15, 10, 15], fov: 50 }}>
        {/* Освещение */}
        <ambientLight intensity={0.3} />
        <directionalLight
          position={[10, 10, 5]}
          intensity={1}
          castShadow
          shadow-mapSize-width={2048}
          shadow-mapSize-height={2048}
        />
        <pointLight position={[0, 10, 0]} intensity={0.5} />
        
        {/* Небо */}
        <Sky sunPosition={[100, 20, 100]} turbidity={0.1} rayleigh={0.5} mieCoefficient={0.005} mieDirectionalG={0.8} />
        <Environment preset="park" />
        
        {/* Туман */}
        {fogEnabled && <fog attach="fog" args={['#ffffff', 5, 20]} />}
        
        {/* Сцена */}
        <Suspense fallback={null}>
          <Cottage />
          <Ground />
          <ContactShadows frames={1} position={[0, -0.5, 0]} blur={1} opacity={0.75} />
        </Suspense>
        
        {/* Эффекты */}
        <EffectComposer>
          <DepthOfField focusDistance={0} focalLength={0.02} bokehScale={2} height={480} />
          <Bloom luminanceThreshold={0} luminanceSmoothing={0.9} height={300} />
          <Noise opacity={0.02} />
          <Vignette eskil={false} offset={0.1} darkness={1.1} />
        </EffectComposer>
        
        {/* Управление камерой */}
        <OrbitControls 
          ref={controlsRef}
          enablePan={true}
          enableZoom={true}
          enableRotate={true}
          minDistance={5}
          maxDistance={50}
        />
      </Canvas>
      
      {/* UI элементы */}
      <div style={{ position: 'absolute', top: 20, left: 20, color: 'white', zIndex: 100 }}>
        <h1>Кирпичный Коттедж</h1>
        <button onClick={() => setFogEnabled(!fogEnabled)}>
          {fogEnabled ? 'Выключить туман' : 'Включить туман'}
        </button>
      </div>
    </div>
  );
}

export default Scene;