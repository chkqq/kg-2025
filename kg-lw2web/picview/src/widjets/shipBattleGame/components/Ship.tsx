import React, { useMemo } from 'react';
import * as THREE from 'three';
import { useGLTF } from '@react-three/drei';
import { ShipType } from './types';

const Ship: React.FC<{ ship: ShipType }> = ({ ship }) => {
  const { scene: cargoScene } = useGLTF('/models/cargo_ship.glb');
  const { scene: warshipScene } = useGLTF('/models/warship.glb');
  const { scene: speedboatScene } = useGLTF('/models/speedboat.glb');

  const model = useMemo(() => {
    let scene;
    switch (ship.type) {
      case 'warship':
        scene = warshipScene.clone();
        break;
      case 'speedboat':
        scene = speedboatScene.clone();
        break;
      default:
        scene = cargoScene.clone();
    }

    scene.traverse(child => {
      if (child instanceof THREE.Mesh) {
        child.castShadow = true;
        child.receiveShadow = true;
      }
    });

    return scene;
  }, [ship.type, cargoScene, warshipScene, speedboatScene]);

  return (
    <primitive
      object={model}
      position={[ship.position.x, ship.position.y, ship.position.z]}
      rotation={[ship.rotation.x, ship.rotation.y, ship.rotation.z]}
      scale={[ship.size, ship.size, ship.size]}
    />
  );
};

export default Ship;