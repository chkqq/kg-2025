import { useTexture } from '@react-three/drei';
import * as THREE from 'three';

export function Ground() {
  const texture = useTexture({
    map: 'https://raw.githubusercontent.com/mrdoob/three.js/dev/examples/textures/grass/grass_color.jpg',
    normalMap: 'https://raw.githubusercontent.com/mrdoob/three.js/dev/examples/textures/grass/grass_normal.jpg',
    roughnessMap: 'https://raw.githubusercontent.com/mrdoob/three.js/dev/examples/textures/grass/grass_roughness.jpg',
  });
  
  texture.map.wrapS = texture.map.wrapT = THREE.RepeatWrapping;
  texture.normalMap.wrapS = texture.normalMap.wrapT = THREE.RepeatWrapping;
  texture.roughnessMap.wrapS = texture.roughnessMap.wrapT = THREE.RepeatWrapping;
  
  texture.map.repeat.set(20, 20);
  texture.normalMap.repeat.set(20, 20);
  texture.roughnessMap.repeat.set(20, 20);
  
  return (
    <mesh rotation={[-Math.PI/2, 0, 0]} position={[0, -0.5, 0]} receiveShadow>
      <planeGeometry args={[100, 100]} />
      <meshStandardMaterial {...texture} />
    </mesh>
  );
}