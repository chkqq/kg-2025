import React, { useRef, useEffect } from 'react';
import * as THREE from 'three';

interface WaterProps {
  scene: THREE.Scene;
  waterNormalTexture: THREE.Texture | null;
}

const Water: React.FC<WaterProps> = ({ scene, waterNormalTexture }) => {
  const waterRef = useRef<THREE.Mesh | null>(null);

  useEffect(() => {
    if (!waterNormalTexture) return;

    waterNormalTexture.wrapS = THREE.RepeatWrapping;
    waterNormalTexture.wrapT = THREE.RepeatWrapping;
    waterNormalTexture.repeat.set(8, 8);

    const waterGeometry = new THREE.PlaneGeometry(250, 90);
    waterGeometry.rotateX(-Math.PI / 2);
    
    const waterMaterial = new THREE.MeshStandardMaterial({
      color: 0x00a8ff,
      roughness: 0.4,
      metalness: 0.1,
      normalMap: waterNormalTexture,
      normalScale: new THREE.Vector2(1, 1),
      transparent: true,
      opacity: 0.95,
      envMap: scene.environment,
    });
    
    const water = new THREE.Mesh(waterGeometry, waterMaterial);
    water.position.y = -0.5;
    water.receiveShadow = true;
    water.castShadow = true;
    scene.add(water);
    waterRef.current = water;

    return () => {
      scene.remove(water);
      waterGeometry.dispose();
      waterMaterial.dispose();
    };
  }, [scene, waterNormalTexture]);

  return null;
};

export default Water;