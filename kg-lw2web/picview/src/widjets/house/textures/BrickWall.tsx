import { useTexture } from '@react-three/drei';
import * as THREE from 'three';

export function BrickWall({ position, rotation, size }: { position: [number, number, number], rotation: [number, number, number], size: [number, number, number] }) {
  const texture = useTexture({
    map: 'https://raw.githubusercontent.com/mrdoob/three.js/dev/examples/textures/brick_diffuse.jpg',
    normalMap: 'https://raw.githubusercontent.com/mrdoob/three.js/dev/examples/textures/brick_normal.jpg',
    roughnessMap: 'https://raw.githubusercontent.com/mrdoob/three.js/dev/examples/textures/brick_roughness.jpg',
  });

  // Apply wrapping and scaling to each texture
  texture.map.wrapS = texture.map.wrapT = THREE.RepeatWrapping;
  texture.normalMap.wrapS = texture.normalMap.wrapT = THREE.RepeatWrapping;
  texture.roughnessMap.wrapS = texture.roughnessMap.wrapT = THREE.RepeatWrapping;

  const scale = 2;
  texture.map.repeat.set(size[0] / scale, size[1] / scale);
  texture.normalMap.repeat.set(size[0] / scale, size[1] / scale);
  texture.roughnessMap.repeat.set(size[0] / scale, size[1] / scale);

  return (
    <mesh position={position} rotation={rotation} castShadow receiveShadow>
      <boxGeometry args={size} />
      <meshStandardMaterial {...texture} />
    </mesh>
  );
}

export function BrickWallWithGraffiti({ position, rotation, size, graffitiPosition }: { 
  position: [number, number, number], 
  rotation: [number, number, number], 
  size: [number, number, number],
  graffitiPosition: [number, number, number]
}) {
  const brickTexture = useTexture({
    map: 'https://raw.githubusercontent.com/mrdoob/three.js/dev/examples/textures/brick_diffuse.jpg',
    normalMap: 'https://raw.githubusercontent.com/mrdoob/three.js/dev/examples/textures/brick_normal.jpg',
  });

  const graffitiTexture = useTexture({
    map: 'https://images.unsplash.com/photo-1584735422187-378fe51ab675?w=500&auto=format&fit=crop',
  });

  // Apply wrapping and scaling to each texture
  brickTexture.map.wrapS = brickTexture.map.wrapT = THREE.RepeatWrapping;
  brickTexture.normalMap.wrapS = brickTexture.normalMap.wrapT = THREE.RepeatWrapping;

  const scale = 2;
  brickTexture.map.repeat.set(size[0] / scale, size[1] / scale);
  brickTexture.normalMap.repeat.set(size[0] / scale, size[1] / scale);

  return (
    <group>
      <mesh position={position} rotation={rotation} castShadow receiveShadow>
        <boxGeometry args={size} />
        <meshStandardMaterial {...brickTexture} />
      </mesh>
      <mesh position={[position[0] + graffitiPosition[0], position[1] + graffitiPosition[1], position[2] + graffitiPosition[2]]} 
            rotation={rotation} 
            castShadow>
        <planeGeometry args={[3, 2]} />
        <meshStandardMaterial map={graffitiTexture.map} transparent />
      </mesh>
    </group>
  );
}
