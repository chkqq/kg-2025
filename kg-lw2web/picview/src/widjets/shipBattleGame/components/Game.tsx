import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import Ship from './Ship';
import Torpedo from './Torpedo';
import { ShipType, TorpedoType } from './types';
import LivesDisplay from '../UI/LivesDisplay';
import ScoreDisplay from '../UI/ScoreDisplay';

const Game: React.FC = () => {
  const mountRef = useRef<HTMLDivElement>(null);
  const [score, setScore] = useState(0);
  const [lives, setLives] = useState(3);
  const [gameOver, setGameOver] = useState(false);
  const [canShoot, setCanShoot] = useState(true);
  const [ships, setShips] = useState<ShipType[]>([]);
  const [torpedoes, setTorpedoes] = useState<TorpedoType[]>([]);

  // Инициализация игры
  useEffect(() => {
    if (!mountRef.current) return;

    // Основные параметры сцены
    const width = mountRef.current.clientWidth;
    const height = mountRef.current.clientHeight;

    // Создание сцены, камеры и рендерера
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, width / height, 0.1, 1000);
    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(width, height);
    renderer.shadowMap.enabled = true;
    mountRef.current.appendChild(renderer.domElement);

    // Настройка камеры
    camera.position.set(0, 5, 15);
    camera.lookAt(0, 0, 0);

    // Добавление элементов управления (для отладки)
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;

    // Освещение
    const ambientLight = new THREE.AmbientLight(0x404040);
    scene.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
    directionalLight.position.set(1, 1, 1);
    directionalLight.castShadow = true;
    scene.add(directionalLight);

    // Небо
    const skyTexture = new THREE.TextureLoader().load('/assets/textures/sky.jpg');
    skyTexture.wrapS = THREE.RepeatWrapping;
    skyTexture.wrapT = THREE.RepeatWrapping;
    skyTexture.repeat.set(1, 1);
    const skyGeometry = new THREE.SphereGeometry(500, 60, 40);
    const skyMaterial = new THREE.MeshBasicMaterial({
      map: skyTexture,
      side: THREE.BackSide,
    });
    const sky = new THREE.Mesh(skyGeometry, skyMaterial);
    scene.add(sky);

    // Вода
    const waterTexture = new THREE.TextureLoader().load('/assets/textures/water.jpg');
    waterTexture.wrapS = THREE.RepeatWrapping;
    waterTexture.wrapT = THREE.RepeatWrapping;
    waterTexture.repeat.set(10, 10);
    const waterGeometry = new THREE.PlaneGeometry(1000, 1000);
    const waterMaterial = new THREE.MeshStandardMaterial({
      map: waterTexture,
      color: 0x1a3a8f,
      metalness: 0.7,
      roughness: 0.1,
    });
    const water = new THREE.Mesh(waterGeometry, waterMaterial);
    water.rotation.x = -Math.PI / 2;
    water.position.y = -2;
    water.receiveShadow = true;
    scene.add(water);

    // Звуки
    const launchSound = new Audio('/assets/sounds/launch.mp3');
    const explosionSound = new Audio('/assets/sounds/explosion.mp3');
    const backgroundSound = new Audio('/assets/sounds/background.mp3');
    backgroundSound.loop = true;
    backgroundSound.volume = 0.3;
    backgroundSound.play();

    // Генерация кораблей
    const shipTypes = ['cargo', 'warship', 'speedboat'];
    const spawnShip = () => {
      if (gameOver) return;

      const type = shipTypes[Math.floor(Math.random() * shipTypes.length)];
      const speed = type === 'speedboat' ? 0.05 : type === 'warship' ? 0.03 : 0.02;
      const size = type === 'cargo' ? 2 : type === 'warship' ? 1.5 : 1;
      const health = type === 'warship' ? 2 : 1;

      const ship: ShipType = {
        id: Date.now(),
        type,
        position: new THREE.Vector3(
          (Math.random() - 0.5) * 30,
          0,
          -50 - Math.random() * 20
        ),
        rotation: new THREE.Euler(0, Math.PI / 2, 0),
        speed,
        size,
        health,
        sunk: false,
        sinkProgress: 0,
      };

      setShips(prev => [...prev, ship]);
    };

    // Интервал появления кораблей
    const shipSpawnInterval = setInterval(spawnShip, 3000);

    // Обработчик клика для запуска торпеды
    const handleClick = (event: MouseEvent) => {
      if (!canShoot || gameOver) return;

      // Получаем позицию клика в нормализованных координатах
      const mouse = new THREE.Vector2(
        (event.clientX / width) * 2 - 1,
        -(event.clientY / height) * 2 + 1
      );

      // Создаем луч из камеры в направлении мыши
      const raycaster = new THREE.Raycaster();
      raycaster.setFromCamera(mouse, camera);

      // Находим точку пересечения с плоскостью воды (y = -2)
      const plane = new THREE.Plane(new THREE.Vector3(0, 1, 0), -2);
      const intersection = new THREE.Vector3();
      raycaster.ray.intersectPlane(plane, intersection);

      // Если пересечение найдено, запускаем торпеду
      if (intersection) {
        launchSound.currentTime = 0;
        launchSound.play();

        const torpedo: TorpedoType = {
          id: Date.now(),
          position: new THREE.Vector3(0, -1, 5),
          target: intersection,
          speed: 0.2,
          active: true,
        };

        setTorpedoes(prev => [...prev, torpedo]);
        setCanShoot(false);
        setTimeout(() => setCanShoot(true), 2000);
      }
    };

    window.addEventListener('click', handleClick);

    // Анимация
    const animate = () => {
      requestAnimationFrame(animate);

      controls.update();

      // Обновление позиций кораблей
      setShips(prevShips => {
        const updatedShips = prevShips.map(ship => {
          if (ship.sunk) {
            // Анимация потопления
            return {
              ...ship,
              position: new THREE.Vector3(
                ship.position.x,
                ship.position.y - 0.02,
                ship.position.z
              ),
              sinkProgress: ship.sinkProgress + 0.01,
            };
          } else {
            // Движение корабля вперед
            return {
              ...ship,
              position: new THREE.Vector3(
                ship.position.x,
                ship.position.y,
                ship.position.z + ship.speed
              ),
            };
          }
        });

        // Удаление кораблей, которые уплыли или утонули
        return updatedShips.filter(ship => {
          if (ship.position.z > 20 && !ship.sunk) {
            setLives(prev => prev - 1);
            return false;
          }
          return ship.sinkProgress < 1;
        });
      });

      // Обновление позиций торпед
      setTorpedoes(prevTorpedoes => {
        return prevTorpedoes
          .map(torpedo => {
            if (!torpedo.active) return torpedo;

            // Направление к цели
            const direction = new THREE.Vector3().subVectors(
              torpedo.target,
              torpedo.position
            ).normalize();

            // Обновление позиции
            const newPosition = new THREE.Vector3().addVectors(
              torpedo.position,
              direction.multiplyScalar(torpedo.speed)
            );

            // Проверка столкновений
            const hitShip = ships.find(ship => {
              if (ship.sunk) return false;
              const distance = newPosition.distanceTo(ship.position);
              return distance < ship.size;
            });

            if (hitShip) {
              explosionSound.currentTime = 0;
              explosionSound.play();

              const updatedShip = {
                ...hitShip,
                health: hitShip.health - 1,
                sunk: hitShip.health - 1 <= 0,
              };

              setShips(prev => prev.map(s => (s.id === hitShip.id ? updatedShip : s)));

              if (updatedShip.sunk) {
                setScore(prev => prev + (updatedShip.type === 'warship' ? 3 : 1));
              }

              return { ...torpedo, active: false };
            }

            // Проверка достижения цели
            const distanceToTarget = newPosition.distanceTo(torpedo.target);
            if (distanceToTarget < 0.5) {
              return { ...torpedo, active: false };
            }

            return { ...torpedo, position: newPosition };
          })
          .filter(torpedo => torpedo.active);
      });

      // Проверка окончания игры
      if (lives <= 0 && !gameOver) {
        setGameOver(true);
        clearInterval(shipSpawnInterval);
        backgroundSound.pause();
      }

      renderer.render(scene, camera);
    };

    animate();

    // Очистка
    return () => {
      clearInterval(shipSpawnInterval);
      window.removeEventListener('click', handleClick);
      mountRef.current?.removeChild(renderer.domElement);
      backgroundSound.pause();
    };
  }, [canShoot, gameOver, lives]);

  return (
    <div className="game-container">
      <div ref={mountRef} className="game-canvas" />
      <div className="game-ui">
        <ScoreDisplay score={score} />
        <LivesDisplay lives={lives} />
        {gameOver && <div className="game-over">GAME OVER</div>}
      </div>
    </div>
  );
};

export default Game;