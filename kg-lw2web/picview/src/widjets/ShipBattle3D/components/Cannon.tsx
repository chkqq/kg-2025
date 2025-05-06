import React, { useRef, useEffect } from 'react';
import * as THREE from 'three';

interface CannonProps {
  scene: THREE.Scene;
  cannonTexture: THREE.Texture | null;
}

const Cannon: React.FC<CannonProps> = ({ scene, cannonTexture }) => {
  const cannonRef = useRef<THREE.Group | null>(null);

  useEffect(() => {
    const cannonGroup = new THREE.Group();
    cannonGroup.position.set(0, 0, -12);

    const cannonBaseMaterial = new THREE.MeshStandardMaterial({
      map: cannonTexture || undefined,
      metalness: 0.5,
      roughness: 0.5,
    });

    const cannonBaseGeometry = new THREE.CylinderGeometry(0.6, 0.6, 0.3, 16);
    const cannonBase = new THREE.Mesh(cannonBaseGeometry, cannonBaseMaterial);
    cannonBase.position.set(0, 0.15, 1.5);
    cannonBase.rotation.x = Math.PI / 2;
    
    const cannonBarrelMaterial = new THREE.MeshStandardMaterial({
      map: cannonTexture || undefined,
      metalness: 0.7,
      roughness: 0.3,
    });

    const cannonBarrelGeometry = new THREE.CylinderGeometry(0.5, 0.5, 1.5, 16);
    const cannonBarrel = new THREE.Mesh(cannonBarrelGeometry, cannonBarrelMaterial);
    cannonBarrel.position.set(0, 0.15, 0.75);
    cannonBarrel.rotation.x = Math.PI / 2;
    
    const cannonMaterial = new THREE.MeshStandardMaterial({
      map: cannonTexture || undefined,
      metalness: 0.7,
      roughness: 0.3,
    });

    const cannonGeometry = new THREE.SphereGeometry(0.7, 32, 32);
    const cannon = new THREE.Mesh(cannonGeometry, cannonMaterial);
    cannon.position.set(0, 0.15, 0);
    
    cannonGroup.add(cannonBase);
    cannonGroup.add(cannonBarrel);
    cannonGroup.add(cannon);
    scene.add(cannonGroup);
    cannonRef.current = cannonGroup;

    return () => {
      scene.remove(cannonGroup);
      cannonBaseGeometry.dispose();
      cannonBaseMaterial.dispose();
      cannonBarrelGeometry.dispose();
      cannonBarrelMaterial.dispose();
      cannonGeometry.dispose();
      cannonMaterial.dispose();
    };
  }, [scene, cannonTexture]);

  return null;
};

export default Cannon;