import { useRef } from 'react';
import { SpotLight } from '@react-three/drei';

export function LampPost({ position }: { position: [number, number, number] }) {
  const lightRef = useRef<any>();
  
  return (
    <group position={position}>
      {/* Столб */}
      <mesh position={[0, 2, 0]} castShadow>
        <cylinderGeometry args={[0.1, 0.1, 4, 16]} />
        <meshStandardMaterial color="#555555" />
      </mesh>
      
      {/* Фонарь */}
      <mesh position={[0, 4, 0]}>
        <boxGeometry args={[0.8, 0.3, 0.8]} />
        <meshStandardMaterial color="#888888" />
      </mesh>
      
      {/* Стекло фонаря */}
      <mesh position={[0, 4, 0.4]} rotation={[Math.PI/2, 0, 0]}>
        <cylinderGeometry args={[0.35, 0.35, 0.01, 32]} />
        <meshStandardMaterial color="#a0d0ff" transparent opacity={0.7} />
      </mesh>
      
      {/* Источник света */}
      <SpotLight
        ref={lightRef}
        position={[0, 3.8, 0.35]}
        distance={10}
        angle={0.5}
        attenuation={5}
        anglePower={5}
        intensity={2}
        color="#ffffaa"
        castShadow
      />
    </group>
  );
}