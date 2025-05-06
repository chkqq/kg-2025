import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, useTexture } from '@react-three/drei';
import * as THREE from 'three';
import BowlingTexture from "./bowling_pin_texture.jpg"
import RedTexture from "./red.jpg"
const BowlingPin = () => {
  const texture = useTexture(BowlingTexture);
  const redTexture = useTexture(RedTexture)
  texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
  texture.repeat.set(1, 1);

  const material = new THREE.MeshPhongMaterial({ 
    map: texture,
    shininess: 30
  });

  const redMaterial = new THREE.MeshPhongMaterial({
    map: redTexture,
    shininess: 30
  })

  return (
    <group>
      {/* Основание */}
      <mesh position={[0, 0.05, 0]} castShadow receiveShadow material={material}>
        <cylinderGeometry args={[0.5, 0.4, 0.5, 16]} />
      </mesh>
      {/* Средняя часть */}
      <mesh position={[0, 0.75, 0]} castShadow receiveShadow material={material}>
        <cylinderGeometry args={[0.4, 0.5, 0.9, 16]} />
      </mesh>
      {/* Верхняя часть */}
      <mesh position={[0, 1.5, 0]} castShadow receiveShadow material={material}>
        <cylinderGeometry args={[0.2, 0.4, 0.6, 32]} />
      </mesh>
      {/* Шейка */}
      <mesh position={[0, 1.9, 0]} castShadow receiveShadow material={redMaterial}>
        <cylinderGeometry args={[0.25, 0.2, 0.2, 32]} />
      </mesh>
      {/* Голова */}
      <mesh position={[0, 2.3, 0]} castShadow receiveShadow material={material}>
        <sphereGeometry args={[0.4, 32, 32]} />
      </mesh>
    </group>
  );
};

const BowlingPinVisualizer = () => {
  return (
    <Canvas shadows camera={{ position: [0, 0, 5], fov: 75 }}>
      <ambientLight intensity={0.2} />
      <directionalLight
        position={[1, 1, 1]}
        intensity={1}
        castShadow
      />
      <pointLight position={[-2, 2, 2]} intensity={0.5} />
      <BowlingPin />
      <OrbitControls enableDamping dampingFactor={0.05} />
    </Canvas>
  );
};

export default BowlingPinVisualizer;