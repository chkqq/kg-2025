import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';

import Sky from "./sky.jpg";
import Sea from "./sea.jpg";
import Torpedo from "./metall.jpg";
import Ship1 from "./metall.jpg";
import Ship2 from "./metall.jpg";
import Ship3 from "./metall.jpg";
import Cannon from "./metall.jpg";

interface Ship {
  object: THREE.Group; // меняем mesh на object и тип на Group
  speed: number;
  health: number;
  sunk: boolean;
  sinking: boolean;
  sinkProgress: number;
}
interface Torpedo {
  object: THREE.Object3D; 
  direction: THREE.Vector3;
  active: boolean;
}

const SeaBattle3D: React.FC = () => {
  const mountRef = useRef<HTMLDivElement>(null);
  const [score, setScore] = useState(0);
  const [lives, setLives] = useState(3);
  const [gameOver, setGameOver] = useState(false);
  const [canShoot, setCanShoot] = useState(true);
  const [cooldown, setCooldown] = useState(0);

  // Refs for Three.js objects
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const shipsRef = useRef<Ship[]>([]);
  const torpedoesRef = useRef<Torpedo[]>([]);
  const cannonRef = useRef<THREE.Group | null>(null);
  const lastShipSpawnRef = useRef<number>(0);
  const animationRef = useRef<number>(0);

  // Textures and materials
  const [texturesLoaded, setTexturesLoaded] = useState(false);
  const waterNormalTextureRef = useRef<THREE.Texture | null>(null);
  const skyTextureRef = useRef<THREE.Texture | null>(null);
  const shipTexturesRef = useRef<THREE.Texture[]>([]);
  const torpedoTextureRef = useRef<THREE.Texture | null>(null);
  const cannonTextureRef = useRef<THREE.Texture | null>(null);
  const textureLoadersRef = useRef<THREE.TextureLoader[]>([]);

  // Mouse position
  const mousePositionRef = useRef({ x: 0, y: 0 });

  // Load textures
  useEffect(() => {
    const textureLoader = new THREE.TextureLoader();
    textureLoadersRef.current.push(textureLoader);

    const loadTexture = (url: string): Promise<THREE.Texture> => {
      return new Promise((resolve, reject) => {
        textureLoader.load(
          url,
          (texture) => resolve(texture),
          undefined,
          (error) => reject(error)
        );
      });
    };

    const loadTextures = async () => {
      try {
        const [waterTex, skyTex, torpedoTex, shipTex1, shipTex2, shipTex3, cannonTex] = await Promise.all([
          loadTexture(Sea),
          loadTexture(Sky),
          loadTexture(Torpedo),
          loadTexture(Ship1),
          loadTexture(Ship2),
          loadTexture(Ship3),
          loadTexture(Cannon),
        ]);

        waterNormalTextureRef.current = waterTex;
        skyTextureRef.current = skyTex;
        torpedoTextureRef.current = torpedoTex;
        shipTexturesRef.current = [shipTex1, shipTex2, shipTex3];
        cannonTextureRef.current = cannonTex;

        setTexturesLoaded(true);
      } catch (error) {
        console.error("Failed to load textures:", error);
      }
    };

    loadTextures();

    return () => {
      textureLoadersRef.current.forEach(loader => {
        // Cleanup if needed
      });
    };
  }, []);

  // Initialize Three.js scene
  useEffect(() => {
    if (!texturesLoaded || !mountRef.current) return;

    // Create scene
    const scene = new THREE.Scene();
    if (skyTextureRef.current) {
      scene.background = skyTextureRef.current;
    }
    sceneRef.current = scene;

    // Create camera
    const camera = new THREE.PerspectiveCamera(
      75,
      window.innerWidth / window.innerHeight,
      0.1,
      1000
    );
    camera.position.set(0, 5, -15);
    camera.lookAt(0, 0, 0);
    cameraRef.current = camera;

    // Create renderer
    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.shadowMap.enabled = true;
    rendererRef.current = renderer;

    // Add lights
    const ambientLight = new THREE.AmbientLight(0x404040);
    scene.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
    directionalLight.position.set(1, 1, 1);
    directionalLight.castShadow = true;
    scene.add(directionalLight);

    const waterGeometry = new THREE.PlaneGeometry(250, 90);
    waterGeometry.rotateX(-Math.PI / 2);
    
    if (waterNormalTextureRef.current) {
      waterNormalTextureRef.current.wrapS = THREE.RepeatWrapping;
      waterNormalTextureRef.current.wrapT = THREE.RepeatWrapping;
      waterNormalTextureRef.current.repeat.set(8, 8); 
    }
    
    const waterMaterial = new THREE.MeshStandardMaterial({
      color: 0x00a8ff, 
      roughness: 0.4, 
      metalness: 0.1, 
      normalMap: waterNormalTextureRef.current || undefined,
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
    // Create cannon
    const cannonGroup = new THREE.Group();
    cannonGroup.position.set(0, 0, -12);
  
    const cannonBaseGeometry = new THREE.CylinderGeometry(0.6, 0.6, 0.3, 16);
    const cannonBaseMaterial = new THREE.MeshStandardMaterial({
      map: cannonTextureRef.current || undefined,
      metalness: 0.5,
      roughness: 0.5,
    });
    const cannonBase = new THREE.Mesh(cannonBaseGeometry, cannonBaseMaterial);
    cannonBase.position.set(0, 0.15, 1.5)
    cannonBase.rotation.x = Math.PI / 2;
    
    const cannonBarrelGeometry = new THREE.CylinderGeometry(0.5, 0.5, 1.5, 16);
    const cannonBarrelMaterial = new THREE.MeshStandardMaterial({
      map: cannonTextureRef.current || undefined,
      metalness: 0.7,
      roughness: 0.3,
    });

    const cannonBarrel = new THREE.Mesh(cannonBarrelGeometry, cannonBarrelMaterial);
    cannonBarrel.position.set(0, 0.15, 0.75);
    cannonBarrel.rotation.x = Math.PI / 2;
    
    const cannonGeometry = new THREE.SphereGeometry(0.7,  32, 32);
    const cannonMaterial = new THREE.MeshStandardMaterial({
      map: cannonTextureRef.current || undefined,
      metalness: 0.7,
      roughness: 0.3,
    });

    const cannon = new THREE.Mesh(cannonGeometry, cannonMaterial);
    cannon.position.set(0, 0.15, 0)
    cannonGroup.add(cannonBase);
    cannonGroup.add(cannonBarrel);
    cannonGroup.add(cannon);
    scene.add(cannonGroup);
    cannonRef.current = cannonGroup;

    // Handle window resize
    const handleResize = () => {
      if (!cameraRef.current || !rendererRef.current) return;
      cameraRef.current.aspect = window.innerWidth / window.innerHeight;
      cameraRef.current.updateProjectionMatrix();
      rendererRef.current.setSize(window.innerWidth, window.innerHeight);
    };

    window.addEventListener('resize', handleResize);

    // Mouse move handler for cannon rotation
    const handleMouseMove = (event: MouseEvent) => {
      if (!rendererRef.current?.domElement) return;
      
      const rect = rendererRef.current.domElement.getBoundingClientRect();
      mousePositionRef.current = {
        x: ((event.clientX - rect.left) / rect.width) * 2 - 1,
        y: -((event.clientY - rect.top) / rect.height) * 2 + 1
      };
    };

    window.addEventListener('mousemove', handleMouseMove);

    // Click handler for shooting
    const handleClick = (event: MouseEvent) => {
      if (!canShoot || gameOver) return;
      shootTorpedo();
    };

    window.addEventListener('click', handleClick);

    // Add renderer to DOM
    mountRef.current.appendChild(renderer.domElement);

    // Animation loop
    const animate = () => {
      if (waterNormalTextureRef.current) {
        waterNormalTextureRef.current.offset.x += 0.0001; 
        waterNormalTextureRef.current.offset.y += 0.0001;
      }
      animationRef.current = requestAnimationFrame(animate);
      updateGame();
      if (rendererRef.current && sceneRef.current && cameraRef.current) {
        rendererRef.current.render(sceneRef.current, cameraRef.current);
      }
    };

    animate();

    // Cleanup
    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('click', handleClick);
      cancelAnimationFrame(animationRef.current);
      
      if (sceneRef.current) {
        sceneRef.current.traverse(child => {
          if ((child as THREE.Mesh).isMesh) {
            const mesh = child as THREE.Mesh;
            if (mesh.geometry) mesh.geometry.dispose();
            if (mesh.material) {
              if (Array.isArray(mesh.material)) {
                mesh.material.forEach(m => m.dispose());
              } else {
                mesh.material.dispose();
              }
            }
          }
        });
      }
      
      if (rendererRef.current) {
        rendererRef.current.dispose();
        if (mountRef.current && mountRef.current.contains(rendererRef.current.domElement)) {
          mountRef.current.removeChild(rendererRef.current.domElement);
        }
      }
    };
  }, [texturesLoaded]);

  // Create a ship
  const createShip = (type: number): Ship => {
    let shipGroup = new THREE.Group();
    let scale = 1;
    let hullColor: THREE.Color;
    let deckColor: THREE.Color;
    // Basic parameters for all ships
    const hullMaterial = new THREE.MeshStandardMaterial({
      metalness: 0.3,
      roughness: 0.7,
    });
  
    const deckMaterial = new THREE.MeshStandardMaterial({
      metalness: 0.1,
      roughness: 0.9,
    });
  
    switch (type) {
      case 0: // Warship
        hullColor = new THREE.Color(0x333333);
        deckColor = new THREE.Color(0x555555);
        scale = 1.2;
  
        // Hull (more streamlined shape)
        const hullGeometry =  new THREE.BoxGeometry(1.6, 0.29, 0.5);
        const hull = new THREE.Mesh(hullGeometry, hullMaterial.clone());
        hull.position.set(0, 0.2, 0)
        hull.material.color = hullColor;
        shipGroup.add(hull);
  
        // Deck
        const deckGeometry = new THREE.BoxGeometry(1.8, 0.1, 0.6);
        const deck = new THREE.Mesh(deckGeometry, deckMaterial.clone());
        deck.material.color = deckColor;
        deck.position.set(0, 0.35, 0);
        shipGroup.add(deck);
  
        // Superstructure
        const towerGeometry = new THREE.BoxGeometry(0.6, 0.4, 0.4);
        const tower = new THREE.Mesh(towerGeometry, hullMaterial.clone());
        tower.position.set(-0.3, 0.55, 0);
        shipGroup.add(tower);
  
        // Cannon
        const gunGeometry = new THREE.CylinderGeometry(0.05, 0.05, 0.5, 8);
        gunGeometry.rotateZ(Math.PI / 2);
        const gun = new THREE.Mesh(gunGeometry, new THREE.MeshStandardMaterial({ color: 0x777777 }));
        gun.position.set(-0.6, 0.6, 0);
        shipGroup.add(gun);
        break;
  
      case 1: // Cargo ship
        hullColor = new THREE.Color(0x1a3a6d);
        deckColor = new THREE.Color(0x3a5a8d);

        scale = 1;
  
        // Main body
        const cargoHullGeometry =  new THREE.BoxGeometry(3, 0.59, 1);
        const cargoHull = new THREE.Mesh(cargoHullGeometry, hullMaterial.clone());
        cargoHull.material.color = hullColor;
        cargoHull.position.set(0, 0.6, 0);
        shipGroup.add(cargoHull);
  
        // Deck
        const cargoDeckGeometry = new THREE.BoxGeometry(3.2, 0.1, 1);
        const cargoDeck = new THREE.Mesh(cargoDeckGeometry, deckMaterial.clone());
        cargoDeck.material.color = deckColor;
        cargoDeck.position.set(0, 0.85, 0);
        shipGroup.add(cargoDeck);
  
        // Cargo containers
        const containerGeometry = new THREE.BoxGeometry(0.5, 0.4, 0.5);
        for (let i = 0; i < 4; i++) {
          const container = new THREE.Mesh(containerGeometry, new THREE.MeshStandardMaterial({ 
            color: Math.random() * 0xffffff 
          }));
          container.position.set(-1 + i * 0.7, 1.05, 0);
          shipGroup.add(container);
        }
  
        // Captain's Bridge
        const bridgeGeometry = new THREE.BoxGeometry(0.8, 0.5, 0.6);
        const bridge = new THREE.Mesh(bridgeGeometry, hullMaterial.clone());
        bridge.position.set(1, 1.05, 0);
        shipGroup.add(bridge);
        break;
  
      case 2: // Passenger ship
        hullColor = new THREE.Color(0xffffff);
        deckColor = new THREE.Color(0xeeeeee);

        scale = 1.1;
  
        // Casing (curved)
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
  
    sceneRef.current?.add(shipGroup);
    shipsRef.current.push(ship);
  
    return ship;
  };
  const createTorpedo = (): Torpedo => {
    // Main group for the entire rocket
    const rocketGroup = new THREE.Group();
  
    // 1. Main body (cylinder)
    const bodyGeometry = new THREE.CylinderGeometry(0.2, 0.2, 2, 32);
    const bodyMaterial = new THREE.MeshStandardMaterial({
      color: 0xcccccc,
      metalness: 0.8,
      roughness: 0.4,
    });
    const body = new THREE.Mesh(bodyGeometry, bodyMaterial);
    body.rotation.x = Math.PI / 2;
    rocketGroup.add(body);
  
    // 2. Tip (cone)
    const noseGeometry = new THREE.ConeGeometry(0.1, 0.5, 32);
    const noseMaterial = new THREE.MeshStandardMaterial({
      color: 0xff5555,
      metalness: 0.9,
      roughness: 0.3
    });
    const nose = new THREE.Mesh(noseGeometry, noseMaterial);
    nose.position.z = 1.25;
    nose.rotation.x = Math.PI / 2;
    rocketGroup.add(nose);
  
    // 3. Flaps/stabilisers 
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
    // 4. Engine (ring in the tail)
    const engineGeometry = new THREE.TorusGeometry(0.15, 0.05, 16, 32);
    const engineMaterial = new THREE.MeshStandardMaterial({
      color: 0xff6600,
      emissive: 0xff3300,
      emissiveIntensity: 0.5
    });
    const engine = new THREE.Mesh(engineGeometry, engineMaterial);
    engine.position.z = -1.1; // The very tail
    engine.rotation.z = Math.PI / 2;
    rocketGroup.add(engine);
  
    // Group setting
    rocketGroup.castShadow = true;
    sceneRef.current?.add(rocketGroup);
  
    const torpedo: Torpedo = {
      object: rocketGroup,
      direction: new THREE.Vector3(),
      active: false,
    };
  
    torpedoesRef.current.push(torpedo);
    return torpedo;
  };
  // Shoot torpedo
  const shootTorpedo = () => {
    if (!canShoot || !cameraRef.current || !cannonRef.current || !rendererRef.current?.domElement) return;

    // Find an inactive torpedo or create a new one
    let torpedo = torpedoesRef.current.find(t => !t.active);
    if (!torpedo) {
      torpedo = createTorpedo();
    }

    // Get cannon barrel end position
    const cannonBarrelEnd = new THREE.Vector3(0, 0, -1.5);
    cannonBarrelEnd.applyMatrix4(cannonRef.current.matrixWorld);

    // Set torpedo position and direction
    torpedo.object.position.copy(cannonBarrelEnd);
    torpedo.direction.copy(cannonRef.current.getWorldDirection(new THREE.Vector3()));
    torpedo.active = true;

    // Rotate torpedo to face shooting direction
    torpedo.object.lookAt(
      torpedo.object.position.clone().add(torpedo.direction.clone().multiplyScalar(10))
    );
    // Cooldown
    setCanShoot(false);
    setCooldown(1); // 1 second cooldown

    const cooldownInterval = setInterval(() => {
      setCooldown(prev => {
        const newCooldown = prev - 0.1;
        if (newCooldown <= 0) {
          clearInterval(cooldownInterval);
          setCanShoot(true);
          return 0;
        }
        return newCooldown;
      });
    }, 100);
  };

  // Update game state
  const updateGame = () => {
    if (gameOver) return;

    const now = Date.now();

    // Update cannon rotation based on mouse position
    if (cannonRef.current && cameraRef.current) {
      const raycaster = new THREE.Raycaster();
      raycaster.setFromCamera(new THREE.Vector2(mousePositionRef.current.x, mousePositionRef.current.y), cameraRef.current);
      
      // Calculate where the ray intersects the water plane (y = -0.5)
      const waterPlane = new THREE.Plane(new THREE.Vector3(0, 1, 0), -0.5);
      const targetPoint = new THREE.Vector3();
      raycaster.ray.intersectPlane(waterPlane, targetPoint);
      
      if (targetPoint) {
        // Make cannon look at the target point
        cannonRef.current.lookAt(targetPoint);
        // Reset x and z rotation to keep the cannon base flat
        cannonRef.current.rotation.x = 0;
        cannonRef.current.rotation.z = 0;
      }
    }

    // Spawn new ships
    if (now - lastShipSpawnRef.current > 3000) {
      const shipType = Math.floor(Math.random() * 3);
      createShip(shipType);
      lastShipSpawnRef.current = now;
    }

    // Update ships
    shipsRef.current.forEach((ship, index) => {
      if (ship.sunk) return;
    
      // Get the ship's main group
      const shipObject = ship.object;
    
      if (ship.sinking) {
        ship.sinkProgress += 0.005;
        shipObject.position.y -= 0.02;
        shipObject.rotation.z += 0.01;
    
        if (ship.sinkProgress >= 1) {
          // Удаляем все дочерние элементы и очищаем ресурсы
          shipObject.children.forEach(child => {
            if (child instanceof THREE.Mesh) {
              child.geometry.dispose();
              if (Array.isArray(child.material)) {
                child.material.forEach(m => m.dispose());
              } else {
                child.material.dispose();
              }
            }
          });
          
          sceneRef.current?.remove(shipObject);
          shipsRef.current.splice(index, 1);
          setScore(prev => prev + 100);
        }
      } else {
        shipObject.position.x -= ship.speed;
    
        if (shipObject.position.x < -15) {
          // Удаляем все дочерние элементы и очищаем ресурсы
          shipObject.children.forEach(child => {
            if (child instanceof THREE.Mesh) {
              child.geometry.dispose();
              if (Array.isArray(child.material)) {
                child.material.forEach(m => m.dispose());
              } else {
                child.material.dispose();
              }
            }
          });
          
          sceneRef.current?.remove(shipObject);
          shipsRef.current.splice(index, 1);
          setLives(prev => prev - 1);
        }
      }
    });
    // Update torpedoes
    torpedoesRef.current.forEach((torpedo, index) => {
      if (!torpedo.active) return;
    
      // Обновляем позицию торпеды
      torpedo.object.position.add(torpedo.direction.clone().multiplyScalar(0.5));
    
      // Проверяем столкновения с кораблями
      shipsRef.current.forEach((ship) => {
        if (ship.sunk || ship.sinking) return;
    
        if (torpedo.object.position.distanceTo(ship.object.position) < 1.5) {
          ship.health -= 0.5;
          torpedo.active = false;
          
          // Удаляем и очищаем все детали торпеды
          sceneRef.current?.remove(torpedo.object);
          torpedo.object.traverse(child => {
            if ((child as THREE.Mesh).isMesh) {
              const mesh = child as THREE.Mesh;
              mesh.geometry.dispose();
              if (Array.isArray(mesh.material)) {
                mesh.material.forEach(m => m.dispose());
              } else {
                mesh.material.dispose();
              }
            }
          });
    
          if (ship.health <= 0) {
            ship.sinking = true;
          }
        }
      });
    
      // Проверяем выход за границы
      if (
        torpedo.object.position.x > 20 ||
        torpedo.object.position.x < -20 ||
        torpedo.object.position.y < -10 ||
        torpedo.object.position.z > 20 ||
        torpedo.object.position.z < -20
      ) {
        torpedo.active = false;
        
        // Удаляем и очищаем все детали торпеды
        sceneRef.current?.remove(torpedo.object);
        torpedo.object.traverse(child => {
          if ((child as THREE.Mesh).isMesh) {
            const mesh = child as THREE.Mesh;
            mesh.geometry.dispose();
            if (Array.isArray(mesh.material)) {
              mesh.material.forEach(m => m.dispose());
            } else {
              mesh.material.dispose();
            }
          }
        });
      }
    });

    // Remove inactive torpedoes
    torpedoesRef.current = torpedoesRef.current.filter(t => t.active);

    // Check game over
    if (lives <= 0) {
      setGameOver(true);
    }
  };

  // Reset game
  const resetGame = () => {
    shipsRef.current.forEach(ship => {
      ship.object.children.forEach(child => {
        if (child instanceof THREE.Mesh) {
          child.geometry.dispose();
          if (Array.isArray(child.material)) {
            child.material.forEach(m => m.dispose());
          } else {
            child.material.dispose();
          }
        }
      });
    });

    shipsRef.current = [];

    torpedoesRef.current.forEach(torpedo => {
      sceneRef.current?.remove(torpedo.object);
      
      torpedo.object.traverse(child => {
        if ((child as THREE.Mesh).isMesh) {
          const mesh = child as THREE.Mesh;
          if (mesh.geometry) {
            mesh.geometry.dispose();
          }
          if (mesh.material) {
            if (Array.isArray(mesh.material)) {
              mesh.material.forEach(m => m.dispose());
            } else {
              mesh.material.dispose();
            }
          }
        }
      });
    });
    
    torpedoesRef.current = [];
    setScore(0);
    setLives(3);
    setGameOver(false);
    setCanShoot(true);
    setCooldown(0);
    lastShipSpawnRef.current = Date.now();
  };

  return (
    <div style={{ position: 'relative', width: '100%', height: '100vh' }}>
      <div ref={mountRef} style={{ width: '100%', height: '100%' }} />
      
      {/* UI */}
      <div style={{
        position: 'absolute',
        top: 20,
        left: 20,
        color: 'white',
        fontFamily: 'Arial',
        fontSize: '24px',
        textShadow: '2px 2px 4px rgba(0, 0, 0, 0.5)',
      }}>
        <div>Score: {score}</div>
        <div>Lives: {lives}</div>
        {!canShoot && <div>Reloading: {cooldown.toFixed(1)}s</div>}
      </div>

      {gameOver && (
        <div style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          backgroundColor: 'rgba(0, 0, 0, 0.7)',
          padding: '20px',
          borderRadius: '10px',
          color: 'white',
          textAlign: 'center',
          fontFamily: 'Arial',
        }}>
          <h2>Game Over!</h2>
          <p>Your score: {score}</p>
          <button
            onClick={resetGame}
            style={{
              padding: '10px 20px',
              fontSize: '18px',
              backgroundColor: '#4CAF50',
              color: 'white',
              border: 'none',
              borderRadius: '5px',
              cursor: 'pointer',
            }}
          >
            Play Again
          </button>
        </div>
      )}

      {!texturesLoaded && (
        <div style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          color: 'white',
          fontFamily: 'Arial',
          fontSize: '24px',
        }}>
          Loading textures...
        </div>
      )}
    </div>
  );
};

export default SeaBattle3D;