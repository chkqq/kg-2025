import React, { useRef } from 'react';
import { Canvas, useFrame, extend, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { OrbitControls } from '@react-three/drei';

// Условие задачи: Реализовать тор с использованием уравнения поверхности:
// (x² + y² + z² + R² - r²)² - 4R²(x² + y²) = 0
// где R - расстояние от центра трубы до центра тора, r - радиус трубы


// Условие задачи: Аналитическое решение уравнения 4-й степени (метод Феррари) для нахождения пересечений
function solveQuarticAnalytical(b: number, c: number, d: number, e: number): number[] {
  // Приводим уравнение к виду x^4 + a x^3 + b x^2 + c x + d = 0
  const a = b;
  b = c;
  c = d;
  d = e;

  // Решаем кубическую резольвенту: y^3 - b y^2 + (ac - 4d) y - (a^2 d + c^2 - 4b d) = 0
  const p = b;
  const q = a * c - 4 * d;
  const r = -(a * a * d + c * c - 4 * b * d);

  // Находим один вещественный корень кубического уравнения
  const yRoot = solveCubic(-p, q, -r)[0];

  // Решаем два квадратных уравнения
  const D0 = Math.sqrt(a * a / 4 - b + yRoot);
  const D1 = Math.sqrt(yRoot * yRoot / 4 - d);
  const D2 = (a * yRoot / 2 - c) / (2 * D0);

  const roots1 = solveQuadratic(1, a / 2 + D0, yRoot / 2 + D2);
  const roots2 = solveQuadratic(1, a / 2 - D0, yRoot / 2 - D2);

  return [...roots1, ...roots2].filter(t => !isNaN(t));
}

function solveCubic(a: number, b: number, c: number): number[] {
  const p = b - a * a / 3;
  const q = c - a * b / 3 + 2 * a * a * a / 27;
  const discriminant = q * q / 4 + p * p * p / 27;

  if (discriminant > 0) {
    const u = Math.cbrt(-q / 2 + Math.sqrt(discriminant));
    const v = Math.cbrt(-q / 2 - Math.sqrt(discriminant));
    return [u + v - a / 3];
  } else {
    const angle = Math.acos(-q / 2 / Math.sqrt(-p * p * p / 27));
    const root1 = 2 * Math.sqrt(-p / 3) * Math.cos(angle / 3) - a / 3;
    const root2 = 2 * Math.sqrt(-p / 3) * Math.cos((angle + 2 * Math.PI) / 3) - a / 3;
    const root3 = 2 * Math.sqrt(-p / 3) * Math.cos((angle + 4 * Math.PI) / 3) - a / 3;
    return [root1, root2, root3];
  }
}

function solveQuadratic(a: number, b: number, c: number): number[] {
  const discriminant = b * b - 4 * a * c;
  if (discriminant < 0) return [];
  const sqrtDiscriminant = Math.sqrt(discriminant);
  return [(-b + sqrtDiscriminant) / (2 * a), (-b - sqrtDiscriminant) / (2 * a)];
}

// Условие задачи: Пересечение луча с тором (аналитическое решение)
function intersectTorus(ray: THREE.Ray, R: number, r: number): THREE.Vector3[] {
  const o = ray.origin.clone();
  const d = ray.direction.clone();

  // Подставляем параметрическое уравнение луча в уравнение тора
  // и получаем уравнение 4-й степени относительно t
  const sum_d_sq = d.dot(d);
  const sum_o_sq = o.dot(o);
  const sum_o_d = o.dot(d);
  const R_sq = R * R;
  const r_sq = r * r;

  // Коэффициенты уравнения 4-й степени
  const a = sum_d_sq * sum_d_sq;
  const b = 4 * sum_d_sq * sum_o_d;
  const c = 2 * sum_d_sq * (sum_o_sq - R_sq - r_sq) + 4 * sum_o_d * sum_o_d + 4 * R_sq * d.z * d.z;
  const d_coef = 4 * (sum_o_sq - R_sq - r_sq) * sum_o_d + 8 * R_sq * o.z * d.z;
  const e = (sum_o_sq - R_sq - r_sq) * (sum_o_sq - R_sq - r_sq) - 4 * R_sq * (r_sq - o.z * o.z);

  // Решаем уравнение аналитически (бонусное задание)
  const roots = solveQuarticAnalytical(b / a, c / a, d_coef / a, e / a);

  // Фильтруем только положительные корни (пересечения перед лучом)
  const points: THREE.Vector3[] = [];
  for (const t of roots) {
    if (t > 0) {
      points.push(o.clone().add(d.clone().multiplyScalar(t)));
    }
  }

  return points;
}

// Компонент тора с возможностью применения матричных преобразований
const TorusWithRaycasting: React.FC<{ R: number; r: number; color: string; matrix?: THREE.Matrix4 }> = 
  ({ R, r, color, matrix }) => {
    const torusRef = useRef<THREE.Mesh>(null);
    const { raycaster } = useThree();
    
    useFrame(({ mouse, clock }) => {
        if (!torusRef.current) return;
        
        if (matrix) {
          const rotation = new THREE.Matrix4().makeRotationX(Math.PI / 2);
          const finalMatrix = matrix.clone().multiply(rotation);
          
          torusRef.current.matrix.copy(finalMatrix);
          torusRef.current.matrix.decompose(
              torusRef.current.position,
              torusRef.current.quaternion,
              torusRef.current.scale
          );
        }
        
        raycaster.setFromCamera(mouse, raycaster.camera);
        const intersects = intersectTorus(raycaster.ray, R, r);
        
        const material = torusRef.current.material as THREE.MeshStandardMaterial;
        
        if (intersects.length > 0) {
          const distance = intersects[0].distanceTo(raycaster.ray.origin);
          const intensity = 1 - Math.min(distance / 10, 1);
          material.emissive.set(color).multiplyScalar(intensity * 0.8);
          material.roughness = 0.2;
          material.metalness = 0.5;
        } else {
          material.emissive.setScalar(0);
          material.roughness = 0.7;
          material.metalness = 0.1;
        }
        
        // Плавное покачивание для демонстрации теней
        torusRef.current.rotation.z = Math.sin(clock.getElapsedTime() * 0.3) * 0.1;
    });
    
    return (
      <mesh ref={torusRef} castShadow receiveShadow>
        <torusGeometry args={[R, r, 32, 32]} />
        <meshStandardMaterial 
          color={color} 
          emissive={color} 
          emissiveIntensity={0} 
          roughness={0.7}
          metalness={0.1}
        />
      </mesh>
    );
  };

const ChildrensPyramid: React.FC = () => {
  const colors = ['#ff0000', '#00ff00', '#0000ff', '#ffff00', '#ff00ff'];
  const sizes = [1.5, 1.2, 0.9, 0.6, 0.3];
  const thicknesses = [0.3, 0.25, 0.2, 0.15, 0.1];
  
  return (
    <group>
      {colors.map((color, i) => {
        const matrix = new THREE.Matrix4().makeTranslation(0, i * 0.5, 0);
        return (
          <TorusWithRaycasting 
            key={i}
            R={sizes[i]} 
            r={thicknesses[i]} 
            color={color}
            matrix={matrix}
          />
        );
      })}
    </group>
  );
};

const TorusPyramid: React.FC = () => {
  const spotLightRef = useRef<THREE.SpotLight>(null);
  
  return (
    <Canvas 
      shadows
      camera={{ position: [0, 0, 5], fov: 50 }}
      gl={{ antialias: true }}
    >
      <color attach="background" args={['#111']} />
      
      {/* Основное освещение */}
      <ambientLight intensity={0.2} />
      
      {/* Точечный свет с тенями */}
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
      
      {/* Заполняющий свет */}
      <pointLight position={[-5, -5, -5]} intensity={0.3} color="#4444ff" />
      
      {/* Подсветка сзади */}
      <directionalLight
        position={[0, 0, -5]}
        intensity={0.5}
        color="#ffffcc"
      />
      
      {/* Пол для отбрасывания теней */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -2, 0]} receiveShadow>
        <planeGeometry args={[10, 10]} />
        <meshStandardMaterial color="#333" roughness={0.8} metalness={0.1} />
      </mesh>
      
      <ChildrensPyramid />
      <OrbitControls />
    </Canvas>
  );
};

export default TorusPyramid;