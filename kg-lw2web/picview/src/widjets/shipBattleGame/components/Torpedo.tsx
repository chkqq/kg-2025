import React from 'react';
import * as THREE from 'three';
import { TorpedoType } from './types';

const Torpedo: React.FC<{ torpedo: TorpedoType }> = ({ torpedo }) => {
  const geometry = new THREE.CylinderGeometry(0.1, 0.1, 1, 16);
  const material = new THREE.MeshStandardMaterial({ color: 0x666666, metalness: 0.8 });

  return (
    <mesh
      geometry={geometry}
      material={material}
      position={[torpedo.position.x, torpedo.position.y, torpedo.position.z]}
      rotation={[Math.PI / 2, 0, 0]}
      castShadow
    />
  );
};

export default Torpedo;