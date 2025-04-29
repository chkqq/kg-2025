import * as THREE from 'three';

export function Fence({ position }: { position: [number, number, number] }) {
  const posts = [];
  const planks = [];
  
  // Создаем столбы забора
  for (let i = -15; i <= 15; i += 2) {
    for (let j = -15; j <= 15; j += 2) {
      // Размещаем забор только по периметру
      if (Math.abs(i) === 15 || Math.abs(j) === 15) {
        posts.push(
          <mesh key={`post-${i}-${j}`} position={[i, 0, j]}>
            <boxGeometry args={[0.2, 1, 0.2]} />
            <meshStandardMaterial color="#8B4513" />
          </mesh>
        );
      }
    }
  }
  
  // Создаем горизонтальные планки
  for (let i = -14.5; i <= 14.5; i += 2) {
    for (let j = -14.5; j <= 14.5; j += 2) {
      if (Math.abs(i) >= 14 || Math.abs(j) >= 14) {
        // Горизонтальные планки
        if (Math.abs(j) === 15) {
          planks.push(
            <mesh key={`plank-h-${i}-${j}`} position={[i, 0.3, j]}>
              <boxGeometry args={[1.8, 0.1, 0.05]} />
              <meshStandardMaterial color="#CD853F" />
            </mesh>
          );
          planks.push(
            <mesh key={`plank-h2-${i}-${j}`} position={[i, 0.7, j]}>
              <boxGeometry args={[1.8, 0.1, 0.05]} />
              <meshStandardMaterial color="#CD853F" />
            </mesh>
          );
        }
        // Вертикальные планки
        if (Math.abs(i) === 15) {
          planks.push(
            <mesh key={`plank-v-${i}-${j}`} position={[i, 0.3, j]} rotation={[0, Math.PI/2, 0]}>
              <boxGeometry args={[1.8, 0.1, 0.05]} />
              <meshStandardMaterial color="#CD853F" />
            </mesh>
          );
          planks.push(
            <mesh key={`plank-v2-${i}-${j}`} position={[i, 0.7, j]} rotation={[0, Math.PI/2, 0]}>
              <boxGeometry args={[1.8, 0.1, 0.05]} />
              <meshStandardMaterial color="#CD853F" />
            </mesh>
          );
        }
      }
    }
  }
  
  return (
    <group position={position}>
      {posts}
      {planks}
    </group>
  );
}