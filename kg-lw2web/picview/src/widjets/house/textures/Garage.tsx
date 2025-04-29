import { BrickWall } from './BrickWall';
import { Roof } from './Roof';

export function Garage({ position }: { position: [number, number, number] }) {
  return (
    <group position={position}>
      {/* Передняя стена с дверью */}
      <BrickWall position={[0, 1.5, -3]} rotation={[0, 0, 0]} size={[6, 2.5, 0.3]} />
      
      {/* Задняя стена */}
      <BrickWall position={[0, 1.5, 3]} rotation={[0, Math.PI, 0]} size={[6, 2.5, 0.3]} />
      
      {/* Левая стена */}
      <BrickWall position={[-3, 1.5, 0]} rotation={[0, Math.PI/2, 0]} size={[6, 2.5, 0.3]} />
      
      {/* Правая стена */}
      <BrickWall position={[3, 1.5, 0]} rotation={[0, -Math.PI/2, 0]} size={[6, 2.5, 0.3]} />
      
      {/* Крыша */}
      <Roof position={[0, 2.75, 0]} size={[6.5, 0.3, 6.5]} />
      
      {/* Дверь гаража */}
      <mesh position={[0, 1.25, -3.1]} rotation={[0, 0, 0]}>
        <boxGeometry args={[4, 2, 0.1]} />
        <meshStandardMaterial color="#333333" metalness={0.8} roughness={0.2} />
      </mesh>
      
      {/* Окно гаража */}
      <mesh position={[0, 2, 3.1]} rotation={[0, Math.PI, 0]}>
        <boxGeometry args={[2, 1, 0.1]} />
        <meshStandardMaterial color="#a0d0ff" transparent opacity={0.7} />
      </mesh>
    </group>
  );
}