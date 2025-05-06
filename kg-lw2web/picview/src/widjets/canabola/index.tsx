import React, { useRef, useEffect } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { OrbitControls } from '@react-three/drei';

// Вершинный шейдер для преобразования линии в Канаболу
const vertexShader = `
  uniform float u_time;
  varying vec3 vPosition;
  
  // Функция для вычисления радиуса Канаболы
  float canabolaR(float x) {
    return (1.0 + sin(x)) * 
           (1.0 + 0.9 * cos(8.0 * x)) * 
           (1.0 + 0.1 * cos(24.0 * x)) * 
           (0.5 + 0.05 * cos(140.0 * x));
  }
  
  void main() {
    // Получаем исходные координаты вершины (x от 0 до 2π)
    float x = position.x;
    
    // Вычисляем радиус по формуле Канаболы
    float R = canabolaR(x);
    
    // Преобразуем координаты
    float x_new = R * cos(x);
    float y_new = R * sin(x);
    float z_new = position.z; // z остается без изменений
    
    // Применяем преобразования
    vec3 transformedPosition = vec3(x_new, y_new, z_new);
    vPosition = transformedPosition;
    
    gl_Position = projectionMatrix * modelViewMatrix * vec4(transformedPosition, 1.0);
  }
`;

// Фрагментный шейдер
const fragmentShader = `
  varying vec3 vPosition;
  
  void main() {
    // Устанавливаем фиксированный зелёный цвет
    vec3 color = vec3(0.0, 1.0, 0.0);
    
    gl_FragColor = vec4(color, 1.0);
  }
`;

const CanabolaCurve = () => {
  const lineRef = useRef<THREE.Line>(null);
  const uniforms = useRef({
    u_time: { value: 0 }
  });

  useFrame(({ clock }) => {
    if (lineRef.current) {
      uniforms.current.u_time.value = clock.getElapsedTime();
    }
  });

   // Создаем геометрию из отрезков прямых (от 0 до 2π)
   useEffect(() => {
     if (!lineRef.current) return;

     const segments = 2000; // Количество отрезков (шаг ~π/1000)
     const geometry = new THREE.BufferGeometry();
     const positions = new Float32Array((segments + 1) * 3);
     
     for (let i = 0; i <= segments; i++) {
       const x = (i / segments) * Math.PI * 2; // от 0 до 2π
       positions[i * 3] = x; // x-координата
       positions[i * 3 + 1] = 0; // y-координата
       positions[i * 3 + 2] = 0; // z-координата
     }
     
     geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
     lineRef.current.geometry.dispose(); // Освобождаем старую геометрию перед установкой новой
     lineRef.current.geometry.copy(geometry); // Копируем новую геометрию в линию
   }, []);

   return (
     <line ref={lineRef}>
       <shaderMaterial
         vertexShader={vertexShader}
         fragmentShader={fragmentShader}
         uniforms={uniforms.current}
         linewidth={2}
       />
     </line>
   );
};

const Canabola = () => {
   return (
     <Canvas camera={{ position: [0, 0, 5], fov: 50 }}>
       <ambientLight intensity={0.5} />
       <CanabolaCurve />
       <OrbitControls enableZoom={true} enablePan={true} />
       {/* Удалены gridHelper и axesHelper */}
     </Canvas>
   );
};

export default Canabola;