import * as THREE from 'three';
import { Ship } from './interfaces';

export const createShip = (scene: THREE.Scene, type: number): Ship => {

    let shipGroup = new THREE.Group();
    let scale = 1;
    let hullColor: THREE.Color;
    let deckColor: THREE.Color;
    // Основные параметры для всех кораблей
    const hullMaterial = new THREE.MeshStandardMaterial({
      metalness: 0.3,
      roughness: 0.7,
    });
  
    const deckMaterial = new THREE.MeshStandardMaterial({
      metalness: 0.1,
      roughness: 0.9,
    });
  
    switch (type) {
      case 0: // Военный корабль
        hullColor = new THREE.Color(0x333333);
        deckColor = new THREE.Color(0x555555);
        scale = 1.2;
  
        // Корпус (более обтекаемая форма)
        const hullGeometry =  new THREE.BoxGeometry(1.6, 0.29, 0.5);
        const hull = new THREE.Mesh(hullGeometry, hullMaterial.clone());
        hull.position.set(0, 0.2, 0)
        hull.material.color = hullColor;
        shipGroup.add(hull);
  
        // Палуба
        const deckGeometry = new THREE.BoxGeometry(1.8, 0.1, 0.6);
        const deck = new THREE.Mesh(deckGeometry, deckMaterial.clone());
        deck.material.color = deckColor;
        deck.position.set(0, 0.35, 0);
        shipGroup.add(deck);
  
        // Надстройка
        const towerGeometry = new THREE.BoxGeometry(0.6, 0.4, 0.4);
        const tower = new THREE.Mesh(towerGeometry, hullMaterial.clone());
        tower.position.set(-0.3, 0.55, 0);
        shipGroup.add(tower);
  
        // Пушка
        const gunGeometry = new THREE.CylinderGeometry(0.05, 0.05, 0.5, 8);
        gunGeometry.rotateZ(Math.PI / 2);
        const gun = new THREE.Mesh(gunGeometry, new THREE.MeshStandardMaterial({ color: 0x777777 }));
        gun.position.set(-0.6, 0.6, 0);
        shipGroup.add(gun);
        break;
  
      case 1: // Грузовой корабль
        hullColor = new THREE.Color(0x1a3a6d);
        deckColor = new THREE.Color(0x3a5a8d);

        scale = 1;
  
        // Основной корпус
        const cargoHullGeometry =  new THREE.BoxGeometry(3, 0.59, 1);
        const cargoHull = new THREE.Mesh(cargoHullGeometry, hullMaterial.clone());
        cargoHull.material.color = hullColor;
        cargoHull.position.set(0, 0.6, 0);
        shipGroup.add(cargoHull);
  
        // Палуба
        const cargoDeckGeometry = new THREE.BoxGeometry(3.2, 0.1, 1);
        const cargoDeck = new THREE.Mesh(cargoDeckGeometry, deckMaterial.clone());
        cargoDeck.material.color = deckColor;
        cargoDeck.position.set(0, 0.85, 0);
        shipGroup.add(cargoDeck);
  
        // Грузовые контейнеры
        const containerGeometry = new THREE.BoxGeometry(0.5, 0.4, 0.5);
        for (let i = 0; i < 4; i++) {
          const container = new THREE.Mesh(containerGeometry, new THREE.MeshStandardMaterial({ 
            color: Math.random() * 0xffffff 
          }));
          container.position.set(-1 + i * 0.7, 1.05, 0);
          shipGroup.add(container);
        }
  
        // Капитанский мостик
        const bridgeGeometry = new THREE.BoxGeometry(0.8, 0.5, 0.6);
        const bridge = new THREE.Mesh(bridgeGeometry, hullMaterial.clone());
        bridge.position.set(1, 1.05, 0);
        shipGroup.add(bridge);
        break;
  
      case 2: // Пассажирский корабль
        hullColor = new THREE.Color(0xffffff);
        deckColor = new THREE.Color(0xeeeeee);

        scale = 1.1;
  
        // Корпус (изогнутый)
        const passangerHullGeometry =  new THREE.BoxGeometry(3, 0.59, 1);
        const passangerHull = new THREE.Mesh(passangerHullGeometry, hullMaterial.clone());
        passangerHull.material.color = hullColor;
        passangerHull.position.set(0, 0.6, 0);
        shipGroup.add(passangerHull);
        const passangerDeckGeometry = new THREE.BoxGeometry(3.2, 0.1, 1);
        const passangerDeck = new THREE.Mesh(passangerDeckGeometry, deckMaterial.clone());
        passangerDeck.material.color = deckColor;
        passangerDeck.position.set(0, 0.85, 0);
        shipGroup.add(passangerDeck);

        const passangerHouseGeometry = new THREE.BoxGeometry(2, 0.5, 0.5);
        const passangerHouse = new THREE.Mesh(passangerHouseGeometry, deckMaterial.clone());
        passangerHouse.material.color = new THREE.Color(0x000000);
        passangerHouse.position.set(0, 1, 0);
        shipGroup.add(passangerHouse);
        const chimneyMaterial = new THREE.MeshStandardMaterial({ color: 0xff0000 });

        const chimneyPositions = [-0.8, 0, 0.8]; 

        chimneyPositions.forEach(xPos => {
          const chimneyGeometry = new THREE.CylinderGeometry(0.1, 0.15, 0.4, 8);
          const chimney = new THREE.Mesh(chimneyGeometry, chimneyMaterial);
          chimney.position.set(xPos, 1.3, 0);
          shipGroup.add(chimney);
        });
        break;
    }
  
    shipGroup.scale.set(scale, scale, scale);
    shipGroup.castShadow = true;
    shipGroup.receiveShadow = true;
  
    const z = Math.random() * 20 - 10;
    shipGroup.position.set(15, 0, z);
  

  const ship: Ship = {
    object: shipGroup,
    speed: 0.02 + Math.random() * 0.03,
    health: 1,
    sunk: false,
    sinking: false,
    sinkProgress: 0,
  };

  scene.add(shipGroup);
  return ship;
};