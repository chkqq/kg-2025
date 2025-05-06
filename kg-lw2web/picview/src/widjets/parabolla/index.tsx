import React, { useRef } from 'react';
import { Canvas, useFrame, extend, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { OrbitControls } from '@react-three/drei';

// Вершинный шейдер с расчетом нормалей
const vertexShader = `
  uniform float u_time;
  uniform float u_progress;
  varying vec3 vNormal;
  varying vec3 vPosition;
  
  // Параметрическое уравнение сферы
  vec3 spherePosition(float u, float v) {
    float radius = 1.0;
    float theta = u * 2.0 * 3.1415926;
    float phi = (v - 0.5) * 3.1415926;
    
    float x = radius * cos(theta) * sin(phi);
    float y = radius * sin(theta) * sin(phi);
    float z = radius * cos(phi);
    
    return vec3(x, y, z);
  }
  
  // Параметрическое уравнение тора
  vec3 torusPosition(float u, float v) {
    float R = 1.0; // Большой радиус
    float r = 0.3; // Малый радиус
    float theta = u * 2.0 * 3.1415926;
    float phi = v * 2.0 * 3.1415926;
    
    float x = (R + r * cos(phi)) * cos(theta);
    float y = (R + r * cos(phi)) * sin(theta);
    float z = r * sin(phi);
    
    return vec3(x, y, z);
  }
  
  // Нормаль сферы
  vec3 sphereNormal(float u, float v) {
    float theta = u * 2.0 * 3.1415926;
    float phi = (v - 0.5) * 3.1415926;
    
    return vec3(
      cos(theta) * sin(phi),
      sin(theta) * sin(phi),
      cos(phi)
    );
  }
  
  // Нормаль тора
  vec3 torusNormal(float u, float v) {
    float theta = u * 2.0 * 3.1415926;
    float phi = v * 2.0 * 3.1415926;
    
    return vec3(
      cos(theta) * cos(phi),
      sin(theta) * cos(phi),
      sin(phi)
    );
  }
  
  void main() {
    vec2 uv = vec2(position.x, position.y);
    
    // Вычисляем позиции и нормали для обеих фигур
    vec3 spherePos = spherePosition(uv.x, uv.y);
    vec3 torusPos = torusPosition(uv.x, uv.y);
    vec3 morphedPos = mix(spherePos, torusPos, u_progress);
    
    vec3 sphereNorm = sphereNormal(uv.x, uv.y);
    vec3 torusNorm = torusNormal(uv.x, uv.y);
    vec3 morphedNormal = normalize(mix(sphereNorm, torusNorm, u_progress));
    
    // Передаем данные во фрагментный шейдер
    vNormal = normalize(normalMatrix * morphedNormal);
    vPosition = vec3(modelMatrix * vec4(morphedPos, 1.0));
    
    gl_Position = projectionMatrix * modelViewMatrix * vec4(morphedPos, 1.0);
  }
`;

// Фрагментный шейдер с освещением
const fragmentShader = `
varying vec3 vNormal;
varying vec3 vPosition;
  
uniform vec3 u_lightPos;
uniform vec3 u_lightColor;
uniform float u_lightIntensity;
uniform vec3 u_ambientColor;
uniform float u_progress;
uniform float u_time;

// Функция для плавного RGB-перехода
vec3 rgbPalette(float t) {
    // Используем фазу для плавного перехода между цветами
    vec3 a = vec3(0.5, 0.5, 0.5);
    vec3 b = vec3(0.5, 0.5, 0.5);
    vec3 c = vec3(1.0, 1.0, 1.0);
    vec3 d = vec3(0.0, 0.33, 0.67); // Сдвиги фаз для RGB
    
    return a + b * cos(6.28318 * (c * t + d));
}

void main() {
    // Нормализуем нормаль
    vec3 normal = normalize(vNormal);
    
    // Вектор направления к свету
    vec3 lightDir = normalize(u_lightPos - vPosition);
    
    // Диффузное освещение
    float diff = max(dot(normal, lightDir), 0.0);
    vec3 diffuse = u_lightColor * diff * u_lightIntensity;
    
    // Окружающее освещение
    vec3 ambient = u_ambientColor;
    
    // Цвета на основе прогресса морфинга и времени
    float colorTime = u_time * 0.2; // Скорость изменения цвета
    
    // Цвет сферы - меняется по RGB
    vec3 sphereColor = rgbPalette(colorTime);
    
    // Цвет тора - сдвинутая фаза RGB
    vec3 torusColor = rgbPalette(colorTime + 0.5);
    
    // Интерполяция между цветами
    vec3 baseColor = mix(sphereColor, torusColor, u_progress);
    
    // Итоговый цвет с освещением
    vec3 color = (ambient + diffuse) * baseColor;
    
    gl_FragColor = vec4(color, 1.0);
}
`;

const MorphingSurface = () => {
    const meshRef = useRef<THREE.Mesh>(null);
    const uniforms = useRef({
      u_time: { value: 0 },
      u_progress: { value: 0 },
      u_lightPos: { value: new THREE.Vector3(2, 3, 4) },
      u_lightColor: { value: new THREE.Color(0xffffff) },
      u_lightIntensity: { value: 1.0 },
      u_ambientColor: { value: new THREE.Color(0xfefefe) },
    });
  
    useFrame(({ clock }) => {
      if (meshRef.current) {
        uniforms.current.u_progress.value = Math.sin(clock.getElapsedTime() * 0.5) * 0.5 + 0.5;
        uniforms.current.u_time.value = clock.getElapsedTime();
        
        const time = clock.getElapsedTime();
        uniforms.current.u_lightPos.value.x = 3 * Math.sin(time * 0.3);
        uniforms.current.u_lightPos.value.z = 3 * Math.cos(time * 0.3);
      }
    });

  // Создаем плоскость с большим количеством вершин для гладкого морфинга
  const segments = 50;
  const planeGeometry = new THREE.PlaneGeometry(1, 1, segments, segments);

  return (
    <mesh ref={meshRef} geometry={planeGeometry}>
      <shaderMaterial
        vertexShader={vertexShader}
        fragmentShader={fragmentShader}
        uniforms={uniforms.current}
        side={THREE.DoubleSide}
        wireframe={false} // Теперь рисуем сплошную поверхность
      />
    </mesh>
  );
};

const Torus = () => {
  return (
    <Canvas camera={{ position: [0, 0, 3], fov: 50 }}>
      <ambientLight intensity={0.2} />
      <pointLight position={[2, 3, 4]} intensity={1} />
      <MorphingSurface />
      <OrbitControls enableZoom={true} enablePan={true} />
    </Canvas>
  );
};

export default Torus;































// import React, { useRef } from 'react';
// import { Canvas, useFrame, extend, useThree } from '@react-three/fiber';
// import * as THREE from 'three';
// import { OrbitControls } from '@react-three/drei';

// // Вершинный шейдер
// const vertexShader = `
//   uniform float u_time;
//   uniform float u_progress;
//   varying vec3 vNormal;
  
//   // Параметрическое уравнение сферы
//   vec3 spherePosition(float u, float v) {
//     float radius = 1.0;
//     float theta = u * 2.0 * 3.1415926;
//     float phi = (v - 0.5) * 3.1415926;
    
//     float x = radius * cos(theta) * sin(phi);
//     float y = radius * sin(theta) * sin(phi);
//     float z = radius * cos(phi);
    
//     return vec3(x, y, z);
//   }
  
//   // Параметрическое уравнение тора
//   vec3 torusPosition(float u, float v) {
//     float R = 1.0; // Большой радиус
//     float r = 0.3; // Малый радиус
//     float theta = u * 2.0 * 3.1415926;
//     float phi = v * 2.0 * 3.1415926;
    
//     float x = (R + r * cos(phi)) * cos(theta);
//     float y = (R + r * cos(phi)) * sin(theta);
//     float z = r * sin(phi);
    
//     return vec3(x, y, z);
//   }
  
//   void main() {
//     // Получаем исходные координаты вершины (на плоскости)
//     vec2 uv = vec2(position.x, position.y);
    
//     // Вычисляем позиции для сферы и тора
//     vec3 spherePos = spherePosition(uv.x, uv.y);
//     vec3 torusPos = torusPosition(uv.x, uv.y);
    
//     // Интерполируем между сферой и тором
//     vec3 morphedPos = mix(spherePos, torusPos, u_progress);
    
//     // Применяем преобразования
//     vec4 modelViewPosition = modelViewMatrix * vec4(morphedPos, 1.0);
//     gl_Position = projectionMatrix * modelViewPosition;
    
//     // Передаем нормаль для возможного освещения
//     vNormal = normalize(normalMatrix * normal);
//   }
// `;

// // Фрагментный шейдер
// const fragmentShader = `
//   varying vec3 vNormal;
  
//   void main() {
//     // Простой цвет с небольшим затенением по нормали
//     vec3 color = vec3(0.2, 0.5, 0.8);
//     float lighting = dot(vNormal, vec3(0.0, 0.0, 1.0)) * 0.5 + 0.5;
    
//     gl_FragColor = vec4(color * lighting, 1.0);
//   }
// `;

// const MorphingSurface = () => {
//   const meshRef = useRef<THREE.Mesh>(null);
//   const uniforms = useRef({
//     u_time: { value: 0 },
//     u_progress: { value: 0 },
//   });

//   useFrame(({ clock }) => {
//     if (meshRef.current) {
//       // Плавное изменение прогресса от 0 до 1 и обратно
//       uniforms.current.u_progress.value = Math.sin(clock.getElapsedTime() * 0.5) * 0.5 + 0.5;
//       uniforms.current.u_time.value = clock.getElapsedTime();
//     }
//   });

//   // Создаем плоскость с большим количеством вершин для гладкого морфинга
//   const segments = 50;
//   const planeGeometry = new THREE.PlaneGeometry(1, 1, segments, segments);

//   return (
//     <mesh ref={meshRef} geometry={planeGeometry}>
//       <shaderMaterial
//         vertexShader={vertexShader}
//         fragmentShader={fragmentShader}
//         uniforms={uniforms.current}
//         wireframe={true}
//         side={THREE.DoubleSide}
//       />
//     </mesh>
//   );
// };

// const Scene = () => {
//   return (
//     <Canvas camera={{ position: [0, 0, 3], fov: 50 }}>
//       <ambientLight intensity={0.5} />
//       <pointLight position={[10, 10, 10]} />
//       <MorphingSurface />
//       <OrbitControls enableZoom={true} enablePan={true} />
//     </Canvas>
//   );
// };

// export default Scene;