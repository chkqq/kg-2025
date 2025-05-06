import React, { useRef, useEffect, useState } from 'react';
import { Canvas, useFrame, extend, useThree } from '@react-three/fiber';
import * as THREE from 'three';

const fragmentShader = `
  uniform vec2 u_resolution;
  uniform vec2 u_offset;
  uniform float u_zoom;
  uniform int u_maxIterations;
  uniform float u_escapeRadius;
  
  // Улучшенная цветовая палитра
  vec3 getColor(int iterations, vec2 z) {
    if (iterations == u_maxIterations) return vec3(0.0);
    
    // Нормализованное значение итераций с smoothing
    float t = float(iterations) + 1.0 - log(log(length(z)))/log(2.0);
    t = sqrt(t / float(u_maxIterations));
    
    // Цветовой градиент
    vec3 colors[6];
    colors[0] = vec3(0.0, 0.0, 0.5);
    colors[1] = vec3(0.0, 0.0, 1.0);
    colors[2] = vec3(0.0, 0.5, 1.0);
    colors[3] = vec3(1.0, 1.0, 0.0);
    colors[4] = vec3(1.0, 0.5, 0.0);
    colors[5] = vec3(1.0, 0.0, 0.0);
    
    float index = t * 5.0;
    int i0 = int(floor(index));
    int i1 = min(i0 + 1, 5);
    float f = fract(index);
    
    return mix(colors[i0], colors[i1], f);
  }
  
  void main() {
    vec2 c = (gl_FragCoord.xy - 0.5 * u_resolution) / min(u_resolution.x, u_resolution.y);
    c = c / u_zoom - u_offset;
    
    vec2 z = vec2(0.0);
    int iterations = 0;
    
    for(int i = 0; i < 10000; i++) {
      if (i >= u_maxIterations) break;
      
      z = vec2(
        z.x * z.x - z.y * z.y + c.x,
        2.0 * z.x * z.y + c.y
      );
      
      if (dot(z, z) > u_escapeRadius * u_escapeRadius) {
        iterations = i;
        break;
      }
    }
    
    gl_FragColor = vec4(getColor(iterations, z), 1.0);
  }
`;

const vertexShader = `
  void main() {
    gl_Position = vec4(position, 1.0);
  }
`;

const MandelbrotFractal = () => {
  const meshRef = useRef<THREE.Mesh>(null);
  const { size } = useThree();
  const [zoomLevel, setZoomLevel] = useState(1);
  
  const uniforms = useRef({
    u_resolution: { value: new THREE.Vector2(size.width, size.height) },
    u_offset: { value: new THREE.Vector2(-0.5, 0.0) },
    u_zoom: { value: 1.0 },
    u_maxIterations: { value: 100 },
    u_escapeRadius: { value: 4.0 }
  });

  // Адаптивное количество итераций при зуме
  useEffect(() => {
    uniforms.current.u_maxIterations.value = Math.min(1000, 100 + Math.floor(Math.log2(zoomLevel) * 50));
  }, [zoomLevel]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const moveSpeed = 0.1 / uniforms.current.u_zoom.value;
      const zoomFactor = 1.2;
      
      switch(e.key) {
        case 'ArrowUp':
          uniforms.current.u_offset.value.y -= moveSpeed;
          break;
        case 'ArrowDown':
          uniforms.current.u_offset.value.y += moveSpeed;
          break;
        case 'ArrowLeft':
          uniforms.current.u_offset.value.x += moveSpeed;
          break;
        case 'ArrowRight':
          uniforms.current.u_offset.value.x -= moveSpeed;
          break;
        case 'PageUp':
          if (uniforms.current.u_zoom.value < 1e15) { // Ограничение максимального зума
            uniforms.current.u_zoom.value *= zoomFactor;
            setZoomLevel(zoomLevel * zoomFactor);
          }
          break;
        case 'PageDown':
          uniforms.current.u_zoom.value /= zoomFactor;
          setZoomLevel(zoomLevel / zoomFactor);
          break;
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [zoomLevel]);

  useFrame(() => {
    uniforms.current.u_resolution.value.set(size.width, size.height);
  });

  return (
    <mesh ref={meshRef}>
      <planeGeometry args={[2, 2]} />
      <shaderMaterial
        vertexShader={vertexShader}
        fragmentShader={fragmentShader}
        uniforms={uniforms.current}
      />
    </mesh>
  );
};

const ControlsInfo = () => {
  return (
    <div style={{
      position: 'absolute',
      bottom: '20px',
      left: '20px',
      color: 'white',
      backgroundColor: 'rgba(0,0,0,0.5)',
      padding: '10px',
      borderRadius: '5px',
      fontFamily: 'Arial, sans-serif'
    }}>
      <h3>Управление фракталом:</h3>
      <p>Стрелки: перемещение по фракталу</p>
      <p>Page Up: увеличение (макс. 10^15)</p>
      <p>Page Down: уменьшение</p>
      <p>Глубина прорисовки увеличивается автоматически при зуме</p>
    </div>
  );
};

const Scene = () => {
  return (
    <>
      <Canvas>
        <MandelbrotFractal />
      </Canvas>
      <ControlsInfo />
    </>
  );
};

export default Scene;































// import React, { useRef, useEffect } from 'react';
// import { Canvas, useFrame, extend, useThree } from '@react-three/fiber';
// import * as THREE from 'three';
// import { OrbitControls } from '@react-three/drei';

// // Фрагментный шейдер для фрактала Мандельброта
// const fragmentShader = `
//   uniform vec2 u_resolution;
//   uniform vec2 u_offset;
//   uniform float u_zoom;
//   uniform int u_maxIterations;
  
//   // Функция для вычисления цвета по количеству итераций
//   vec3 getColor(int iterations) {
//     if (iterations == u_maxIterations) return vec3(0.0); // Черный для точек внутри множества
    
//     float t = float(iterations) / float(u_maxIterations);
    
//     // Цветовая палитра
//     vec3 color1 = vec3(0.1, 0.1, 0.3);
//     vec3 color2 = vec3(0.5, 0.2, 0.5);
//     vec3 color3 = vec3(0.9, 0.6, 0.2);
//     vec3 color4 = vec3(0.9, 0.9, 0.5);
    
//     if (t < 0.25) return mix(color1, color2, t * 4.0);
//     else if (t < 0.5) return mix(color2, color3, (t - 0.25) * 4.0);
//     else if (t < 0.75) return mix(color3, color4, (t - 0.5) * 4.0);
//     else return color4;
//   }
  
//   void main() {
//     // Нормализованные координаты с учетом смещения и масштаба
//     vec2 c = (gl_FragCoord.xy - 0.5 * u_resolution) / min(u_resolution.x, u_resolution.y);
//     c = c / u_zoom - u_offset;
    
//     // Параметры фрактала
//     vec2 z = vec2(0.0);
//     int iterations = 0;
    
//     // Вычисление фрактала
//     for(int i = 0; i < 1000; i++) {
//       if (i >= u_maxIterations) break;
      
//       z = vec2(
//         z.x * z.x - z.y * z.y + c.x,
//         2.0 * z.x * z.y + c.y
//       );
      
//       if (length(z) > 2.0) {
//         iterations = i;
//         break;
//       }
//     }
    
//     // Установка цвета
//     gl_FragColor = vec4(getColor(iterations), 1.0);
//   }
// `;

// // Вершинный шейдер (просто отображаем плоскость)
// const vertexShader = `
//   void main() {
//     gl_Position = vec4(position, 1.0);
//   }
// `;

// const MandelbrotFractal = () => {
//   const meshRef = useRef<THREE.Mesh>(null);
//   const { size } = useThree();
  
//   const uniforms = useRef({
//     u_resolution: { value: new THREE.Vector2(size.width, size.height) },
//     u_offset: { value: new THREE.Vector2(-0.5, 0.0) }, // Начальное смещение
//     u_zoom: { value: 1.0 }, // Начальный масштаб
//     u_maxIterations: { value: 100 } // Максимальное количество итераций
//   });

//   // Обработка клавиатуры
//   useEffect(() => {
//     const handleKeyDown = (e: KeyboardEvent) => {
//       const moveSpeed = 0.1 / uniforms.current.u_zoom.value;
//       const zoomFactor = 1.1;
      
//       switch(e.key) {
//         case 'ArrowUp':
//           uniforms.current.u_offset.value.y -= moveSpeed;
//           break;
//         case 'ArrowDown':
//           uniforms.current.u_offset.value.y += moveSpeed;
//           break;
//         case 'ArrowLeft':
//           uniforms.current.u_offset.value.x += moveSpeed;
//           break;
//         case 'ArrowRight':
//           uniforms.current.u_offset.value.x -= moveSpeed;
//           break;
//         case 'PageUp':
//           uniforms.current.u_zoom.value *= zoomFactor;
//           break;
//         case 'PageDown':
//           uniforms.current.u_zoom.value /= zoomFactor;
//           break;
//       }
//     };
    
//     window.addEventListener('keydown', handleKeyDown);
//     return () => window.removeEventListener('keydown', handleKeyDown);
//   }, []);

//   // Обновляем разрешение при изменении размера окна
//   useFrame(() => {
//     if (meshRef.current) {
//       uniforms.current.u_resolution.value.set(size.width, size.height);
//     }
//   });

//   return (
//     <mesh ref={meshRef}>
//       <planeGeometry args={[2, 2]} /> {/* Полноэкранный квад */}
//       <shaderMaterial
//         vertexShader={vertexShader}
//         fragmentShader={fragmentShader}
//         uniforms={uniforms.current}
//       />
//     </mesh>
//   );
// };

// const ControlsInfo = () => {
//   return (
//     <div style={{
//       position: 'absolute',
//       bottom: '20px',
//       left: '20px',
//       color: 'white',
//       backgroundColor: 'rgba(0,0,0,0.5)',
//       padding: '10px',
//       borderRadius: '5px',
//       fontFamily: 'Arial, sans-serif'
//     }}>
//       <h3>Управление:</h3>
//       <p>Стрелки: перемещение</p>
//       <p>Page Up: увеличение</p>
//       <p>Page Down: уменьшение</p>
//     </div>
//   );
// };

// const Fractal = () => {
//   return (
//     <>
//       <Canvas>
//         <MandelbrotFractal />
//       </Canvas>
//       <ControlsInfo />
//     </>
//   );
// };

// export default Fractal;