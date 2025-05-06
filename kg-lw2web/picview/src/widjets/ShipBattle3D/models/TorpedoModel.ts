import * as THREE from 'three';
import { Torpedo } from './interfaces';

export const createTorpedo = (scene: THREE.Scene): Torpedo => {
  const rocketGroup = new THREE.Group();
  
  
    // 1. Основной корпус (цилиндр)
    const bodyGeometry = new THREE.CylinderGeometry(0.2, 0.2, 2, 32);
    const bodyMaterial = new THREE.MeshStandardMaterial({
      color: 0xcccccc,
      metalness: 0.8,
      roughness: 0.4,
    });
    const body = new THREE.Mesh(bodyGeometry, bodyMaterial);
    body.rotation.x = Math.PI / 2; // Горизонтальное положение
    rocketGroup.add(body);
  
    // 2. Наконечник (конус)
    const noseGeometry = new THREE.ConeGeometry(0.1, 0.5, 32);
    const noseMaterial = new THREE.MeshStandardMaterial({
      color: 0xff5555,
      metalness: 0.9,
      roughness: 0.3
    });
    const nose = new THREE.Mesh(noseGeometry, noseMaterial);
    nose.position.z = 1.25; // Смещение к носу
    nose.rotation.x = Math.PI / 2;
    rocketGroup.add(nose);
  
    // 3. Закрылки/стабилизаторы (4 штуки)
    const finGeometry = new THREE.BoxGeometry(0.2, 0.1, 0.5);
    const finMaterial = new THREE.MeshStandardMaterial({
      color: 0x888888,
      metalness: 0.6,
      roughness: 0.5
    });
  
    for (let i = 0; i < 2; i++) {
      const fin = new THREE.Mesh(finGeometry, finMaterial);
      fin.position.z = -0.8;
      
      const angle = i * Math.PI; 
      fin.position.x = Math.cos(angle) * 0.3;
      fin.position.y = Math.sin(angle) * 0.3;
      rocketGroup.add(fin);
    }

    for (let i = 0; i < 2; i++) {
      const fin = new THREE.Mesh(finGeometry, finMaterial);
      fin.position.z = -0.8; 
      const angle = Math.PI / 2 + i * Math.PI; 
      fin.position.x = Math.cos(angle) * 0.3;
      fin.position.y = Math.sin(angle) * 0.3;
      
      fin.rotation.z = Math.PI / 2;
      
      rocketGroup.add(fin);
    }
    // 4. Двигатель (кольцо в хвосте)
    const engineGeometry = new THREE.TorusGeometry(0.15, 0.05, 16, 32);
    const engineMaterial = new THREE.MeshStandardMaterial({
      color: 0xff6600,
      emissive: 0xff3300,
      emissiveIntensity: 0.5
    });
    const engine = new THREE.Mesh(engineGeometry, engineMaterial);
    engine.position.z = -1.1; // Самый хвост
    engine.rotation.z = Math.PI / 2;
    rocketGroup.add(engine);
  

  const torpedo: Torpedo = {
    object: rocketGroup,
    direction: new THREE.Vector3(),
    active: false,
  };

  scene.add(rocketGroup);
  return torpedo;
};