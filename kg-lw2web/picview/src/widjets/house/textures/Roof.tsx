import { useTexture } from '@react-three/drei';
import * as THREE from 'three';

export function Roof({ position, size }: { position: [number, number, number], size: [number, number, number] }) {
  const texture = useTexture({
    map: 'https://raw.githubusercontent.com/mrdoob/three.js/dev/examples/textures/hardwood2_diffuse.jpg',
    normalMap: 'https://raw.githubusercontent.com/mrdoob/three.js/dev/examples/textures/hardwood2_normal.jpg',
    roughnessMap: 'https://raw.githubusercontent.com/mrdoob/three.js/dev/examples/textures/hardwood2_roughness.jpg',
  });
  
  texture.map.wrapS = texture.map.wrapT = THREE.RepeatWrapping;
  texture.normalMap.wrapS = texture.normalMap.wrapT = THREE.RepeatWrapping;
  texture.roughnessMap.wrapS = texture.roughnessMap.wrapT = THREE.RepeatWrapping;
  
  texture.map.repeat.set(2, 2);
  texture.normalMap.repeat.set(2, 2);
  texture.roughnessMap.repeat.set(2, 2);
  
  return (
    <mesh position={position} rotation={[0, Math.PI/4, 0]} castShadow receiveShadow>
      <boxGeometry args={size} />
      <meshStandardMaterial {...texture} />
    </mesh>
  );
}