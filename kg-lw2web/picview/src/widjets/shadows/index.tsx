import React, { useRef, useMemo, useState } from 'react';
import { Canvas, useFrame, extend, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { OrbitControls } from '@react-three/drei';

// Константы для качества мягких теней
const SHADOW_RAY_COUNT = 16; // Количество лучей для мягких теней
const LIGHT_RADIUS = 0.3;    // Размер источника света для мягких теней

// Вынесенные математические функции (как в предыдущем коде)
const MathUtils = {
  // ... (оставить те же функции solveQuadratic, solveCubic, solveQuarticAnalytical)
};

class TorusSurface {
  // ... (оставить ту же реализацию)
}

function intersectScene(ray: THREE.Ray, objects: THREE.Object3D[]): THREE.Vector3[] {
  const intersections: THREE.Vector3[] = [];
  
  objects.forEach(obj => {
    if (obj instanceof THREE.Mesh && obj.geometry instanceof THREE.TorusGeometry) {
      const [R, r] = obj.geometry.parameters;
      const worldPosition = new THREE.Vector3();
      obj.getWorldPosition(worldPosition);
      
      // Преобразуем луч в локальные координаты объекта
      const inverseMatrix = new THREE.Matrix4().copy(obj.matrixWorld).invert();
      const localRay = ray.clone().applyMatrix4(inverseMatrix);
      
      const hits = intersectTorus(localRay, R, r);
      hits.forEach(hit => {
        hit.applyMatrix4(obj.matrixWorld);
        intersections.push(hit);
      });
    }
  });
  
  return intersections.sort((a, b) => a.distanceTo(ray.origin) - b.distanceTo(ray.origin));
}

function calculateShadow(
  point: THREE.Vector3,
  light: THREE.Light,
  objects: THREE.Object3D[],
  softShadows: boolean
): number {
  let shadowFactor = 0;
  
  if (light instanceof THREE.PointLight || light instanceof THREE.SpotLight) {
    const lightPos = new THREE.Vector3();
    light.getWorldPosition(lightPos);
    const toLight = lightPos.clone().sub(point).normalize();
    const distanceToLight = point.distanceTo(lightPos);
    
    if (softShadows) {
      // Мягкие тени: несколько лучей к разным точкам источника света
      let unblockedRays = 0;
      
      for (let i = 0; i < SHADOW_RAY_COUNT; i++) {
        // Случайное смещение в пределах радиуса источника света
        const offset = new THREE.Vector3(
          (Math.random() - 0.5) * 2 * LIGHT_RADIUS,
          (Math.random() - 0.5) * 2 * LIGHT_RADIUS,
          (Math.random() - 0.5) * 2 * LIGHT_RADIUS
        );
        
        const sampleLightPos = lightPos.clone().add(offset);
        const sampleToLight = sampleLightPos.clone().sub(point).normalize();
        const sampleDistance = point.distanceTo(sampleLightPos);
        
        const shadowRay = new THREE.Ray(point.clone().add(sampleToLight.clone().multiplyScalar(0.001)), sampleToLight);
        const intersections = intersectScene(shadowRay, objects);
        
        if (intersections.length === 0 || intersections[0].distanceTo(point) > sampleDistance) {
          unblockedRays++;
        }
      }
      
      shadowFactor = unblockedRays / SHADOW_RAY_COUNT;
    } else {
      // Жесткие тени: один луч к источнику света
      const shadowRay = new THREE.Ray(point.clone().add(toLight.clone().multiplyScalar(0.001)), toLight);
      const intersections = intersectScene(shadowRay, objects);
      
      if (intersections.length === 0 || intersections[0].distanceTo(point) > distanceToLight) {
        shadowFactor = 1;
      }
    }
  }
  
  return shadowFactor;
}

const TorusWithShadows: React.FC<{ 
  R: number; 
  r: number; 
  color: string; 
  matrix?: THREE.Matrix4;
  softShadows?: boolean;
}> = ({ R, r, color, matrix, softShadows = true }) => {
  const torusRef = useRef<THREE.Mesh>(null);
  const { raycaster, scene } = useThree();
  const [hovered, setHovered] = useState(false);
  
  // Мемоизация объектов для оптимизации
  const tempMatrix = useMemo(() => new THREE.Matrix4(), []);
  const tempRotation = useMemo(() => new THREE.Matrix4().makeRotationX(Math.PI / 2), []);
  const tempVector = useMemo(() => new THREE.Vector3(), []);
  const tempColor = useMemo(() => new THREE.Color(), []);
  
  useFrame(({ mouse, clock }) => {
    if (!torusRef.current) return;
    
    // Применение матричных преобразований
    if (matrix) {
      tempMatrix.copy(matrix).multiply(tempRotation);
      torusRef.current.matrix.copy(tempMatrix);
      torusRef.current.matrix.decompose(
        torusRef.current.position,
        torusRef.current.quaternion,
        torusRef.current.scale
      );
    }
    
    // Проверка пересечения луча с тором
    raycaster.setFromCamera(mouse, raycaster.camera);
    const intersects = intersectTorus(raycaster.ray, R, r);
    
    const material = torusRef.current.material as THREE.MeshStandardMaterial;
    
    if (intersects.length > 0) {
      const point = intersects[0];
      const distance = point.distanceTo(raycaster.ray.origin);
      const intensity = 1 - Math.min(distance / 10, 1);
      
      // Рассчет освещения с учетом теней
      let totalLight = 0;
      scene.traverse(child => {
        if (child instanceof THREE.Light && child.visible) {
          const shadowFactor = calculateShadow(point, child, scene.children, softShadows);
          totalLight += shadowFactor * child.intensity;
        }
      });
      
      // Учет ambient света
      totalLight += 0.2; // ambient light
      
      tempColor.set(color).multiplyScalar(intensity * 0.8 * Math.min(totalLight, 1));
      material.emissive.copy(tempColor);
      material.roughness = 0.2;
      material.metalness = 0.5;
      
      setHovered(true);
    } else {
      material.emissive.setScalar(0);
      material.roughness = 0.7;
      material.metalness = 0.1;
      setHovered(false);
    }
    
    // Плавная анимация
    torusRef.current.rotation.z = Math.sin(clock.getElapsedTime() * 0.3) * 0.1;
  });
  
  return (
    <mesh 
      ref={torusRef} 
      castShadow 
      receiveShadow
      onPointerOver={() => setHovered(true)}
      onPointerOut={() => setHovered(false)}
    >
      <torusGeometry args={[R, r, 32, 32]} />
      <meshStandardMaterial 
        color={color} 
        emissive={color} 
        emissiveIntensity={hovered ? 0.3 : 0} 
        roughness={0.7}
        metalness={0.1}
      />
    </mesh>
  );
};

const ChildrensPyramid: React.FC<{ softShadows?: boolean }> = ({ softShadows = true }) => {
  const colors = ['#ff0000', '#00ff00', '#0000ff', '#ffff00', '#ff00ff'];
  const sizes = [1.5, 1.2, 0.9, 0.6, 0.3];
  const thicknesses = [0.3, 0.25, 0.2, 0.15, 0.1];
  
  return (
    <group>
      {colors.map((color, i) => {
        const matrix = useMemo(() => new THREE.Matrix4().makeTranslation(0, i * 0.5, 0), [i]);
        return (
          <TorusWithShadows 
            key={i}
            R={sizes[i]} 
            r={thicknesses[i]} 
            color={color}
            matrix={matrix}
            softShadows={softShadows}
          />
        );
      })}
    </group>
  );
};

const TorusPyramid: React.FC = () => {
  const spotLightRef = useRef<THREE.SpotLight>(null);
  const [softShadows, setSoftShadows] = useState(true);
  
  return (
    <>
      <Canvas 
        shadows
        camera={{ position: [0, 0, 5], fov: 50 }}
        gl={{ antialias: true }}
      >
        <color attach="background" args={['#111']} />
        
        <ambientLight intensity={0.2} />
        
        <spotLight
          ref={spotLightRef}
          position={[5, 5, 5]}
          angle={0.5}
          penumbra={0.5}
          intensity={1}
          castShadow
          shadow-mapSize-width={2048}
          shadow-mapSize-height={2048}
          shadow-bias={-0.0001}
          color="#ffffff"
        />
        
        <pointLight 
          position={[-5, -5, -5]} 
          intensity={0.5} 
          color="#4444ff"
          castShadow={!softShadows}
        />
        
        <directionalLight
          position={[0, 0, -5]}
          intensity={0.3}
          color="#ffffcc"
        />
        
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -2, 0]} receiveShadow>
          <planeGeometry args={[10, 10]} />
          <meshStandardMaterial color="#333" roughness={0.8} metalness={0.1} />
        </mesh>
        
        <ChildrensPyramid softShadows={softShadows} />
        <OrbitControls />
      </Canvas>
      
      <div style={{
        position: 'absolute',
        top: 20,
        left: 20,
        color: 'white',
        backgroundColor: 'rgba(0,0,0,0.5)',
        padding: '10px',
        borderRadius: '5px'
      }}>
        <label>
          <input 
            type="checkbox" 
            checked={softShadows} 
            onChange={() => setSoftShadows(!softShadows)} 
          />
          Мягкие тени (бонус)
        </label>
      </div>
    </>
  );
};

export default TorusPyramid;