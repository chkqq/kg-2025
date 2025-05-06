import React, { useRef } from 'react';
import { Canvas, useFrame, extend, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { OrbitControls } from '@react-three/drei';

// Аналитическое решение пересечения луча с тором
function intersectTorus(ray: THREE.Ray, R: number, r: number): THREE.Vector3[] {
  const o = ray.origin.clone();
  const d = ray.direction.clone();
  
  o.sub(ray.origin);
  
  const sum_d_sq = d.dot(d);
  const sum_o_sq = o.dot(o);
  const sum_o_d = o.dot(d);
  const R_sq = R * R;
  const r_sq = r * r;
  
  const a = sum_d_sq * sum_d_sq;
  const b = 4 * sum_d_sq * sum_o_d;
  const c = 2 * sum_d_sq * (sum_o_sq - R_sq - r_sq) + 4 * sum_o_d * sum_o_d + 4 * R_sq * d.z * d.z;
  const d_coef = 4 * (sum_o_sq - R_sq - r_sq) * sum_o_d + 8 * R_sq * o.z * d.z;
  const e = (sum_o_sq - R_sq - r_sq) * (sum_o_sq - R_sq - r_sq) - 4 * R_sq * (r_sq - o.z * o.z);
  
  const roots = solveQuartic(b/a, c/a, d_coef/a, e/a);
  
  const points: THREE.Vector3[] = [];
  for (const t of roots) {
    if (t > 0) {
      points.push(o.clone().add(d.clone().multiplyScalar(t)));
    }
  }
  
  return points;
}

function solveQuartic(b: number, c: number, d: number, e: number): number[] {
  return findRootsNumerically(b, c, d, e);
}

function findRootsNumerically(b: number, c: number, d: number, e: number): number[] {
  const roots: number[] = [];
  const step = 0.5;
  const epsilon = 0.0001;
  const maxIterations = 100;
  
  for (let x = -10; x <= 10; x += step) {
    let x0 = x;
    let x1 = x + step;
    
    let y0 = quartic(x0, b, c, d, e);
    let y1 = quartic(x1, b, c, d, e);
    
    if (y0 * y1 >= 0) continue;
    
    for (let i = 0; i < maxIterations; i++) {
      const mid = (x0 + x1) / 2;
      const yMid = quartic(mid, b, c, d, e);
      
      if (Math.abs(yMid) < epsilon) {
        roots.push(mid);
        break;
      }
      
      if (y0 * yMid < 0) {
        x1 = mid;
        y1 = yMid;
      } else {
        x0 = mid;
        y0 = yMid;
      }
    }
  }
  
  return roots;
}

function quartic(x: number, b: number, c: number, d: number, e: number): number {
  return x**4 + b*x**3 + c*x**2 + d*x + e;
}

const TorusWithRaycasting: React.FC<{ R: number; r: number; color: string; matrix?: THREE.Matrix4 }> = 
  ({ R, r, color, matrix }) => {
    const torusRef = useRef<THREE.Mesh>(null);
    const { raycaster } = useThree();
    
    useFrame(({ mouse }) => {
        if (!torusRef.current) return;
        
        if (matrix) {
          // Добавляем поворот на 90 градусов вокруг оси X
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
        
        const material = torusRef.current.material as THREE.MeshPhongMaterial;
        
        if (intersects.length > 0) {
          const distance = intersects[0].distanceTo(raycaster.ray.origin);
          const intensity = 1 - Math.min(distance / 10, 1);
          material.emissive.set(color).multiplyScalar(intensity * 0.5);
        } else {
          material.emissive.setScalar(0);
        }
    });
    
    return (
      <mesh ref={torusRef}>
        <torusGeometry args={[R, r, 32, 32]} />
        <meshPhongMaterial color={color} emissive={color} emissiveIntensity={0} />
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
  return (
    <Canvas camera={{ position: [0, 0, 5], fov: 50 }}>
      <ambientLight intensity={0.8} />
      <pointLight position={[10, 10, 10]} />
      <ChildrensPyramid />
      <OrbitControls />
    </Canvas>
  );
};

export default TorusPyramid;