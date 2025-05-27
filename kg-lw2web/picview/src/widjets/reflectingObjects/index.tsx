import React, { useEffect, useRef } from 'react';

interface Vector2D {
  x: number;
  y: number;
}

interface Ray {
  origin: Vector2D;
  direction: Vector2D;
}

interface Sphere {
  position: Vector2D;
  radius: number;
  color: string;
  reflectivity: number; // 0 - нет отражения, 1 - полное отражение
}

interface Scene {
  spheres: Sphere[];
  width: number;
  height: number;
}

const RayTracingReflections: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const sceneRef = useRef<Scene>({
    width: 0,
    height: 0,
    spheres: [
      {
        position: { x: 200, y: 200 },
        radius: 80,
        color: '#ff5252',
        reflectivity: 0.8,
      },
      {
        position: { x: 400, y: 300 },
        radius: 60,
        color: '#4caf50',
        reflectivity: 0.6,
      },
      {
        position: { x: 150, y: 400 },
        radius: 50,
        color: '#2196f3',
        reflectivity: 0.4,
      },
    ],
  });

  // Функция для вычисления длины вектора
  const length = (v: Vector2D): number => {
    return Math.sqrt(v.x * v.x + v.y * v.y);
  };

  // Нормализация вектора
  const normalize = (v: Vector2D): Vector2D => {
    const len = length(v);
    return { x: v.x / len, y: v.y / len };
  };

  // Скалярное произведение векторов
  const dot = (a: Vector2D, b: Vector2D): number => {
    return a.x * b.x + a.y * b.y;
  };

  // Отражение вектора относительно нормали
  const reflect = (incident: Vector2D, normal: Vector2D): Vector2D => {
    const dotProduct = dot(incident, normal);
    return {
      x: incident.x - 2 * dotProduct * normal.x,
      y: incident.y - 2 * dotProduct * normal.y,
    };
  };

  // Проверка пересечения луча со сферой
  const intersectSphere = (ray: Ray, sphere: Sphere): number | null => {
    const oc = {
      x: ray.origin.x - sphere.position.x,
      y: ray.origin.y - sphere.position.y,
    };

    const a = dot(ray.direction, ray.direction);
    const b = 2 * dot(oc, ray.direction);
    const c = dot(oc, oc) - sphere.radius * sphere.radius;

    const discriminant = b * b - 4 * a * c;

    if (discriminant < 0) {
      return null;
    }

    return (-b - Math.sqrt(discriminant)) / (2 * a);
  };

  // Трассировка луча
  const traceRay = (ray: Ray, depth: number, maxDepth: number): string => {
    if (depth > maxDepth) return '#000000';

    let closestT = Infinity;
    let closestSphere: Sphere | null = null;

    // Поиск ближайшего пересечения
    for (const sphere of sceneRef.current.spheres) {
      const t = intersectSphere(ray, sphere);
      if (t !== null && t > 0 && t < closestT) {
        closestT = t;
        closestSphere = sphere;
      }
    }

    // Если пересечений нет, возвращаем цвет фона
    if (!closestSphere) return '#111122';

    // Вычисляем точку пересечения и нормаль
    const point = {
      x: ray.origin.x + ray.direction.x * closestT,
      y: ray.origin.y + ray.direction.y * closestT,
    };

    const normal = normalize({
      x: point.x - closestSphere.position.x,
      y: point.y - closestSphere.position.y,
    });

    // Вычисляем отраженный луч
    const reflectedDir = reflect(ray.direction, normal);
    const reflectedRay = {
      origin: point,
      direction: reflectedDir,
    };

    // Рекурсивно трассируем отраженный луч
    const reflectedColor = traceRay(reflectedRay, depth + 1, maxDepth);

    // Смешиваем цвет объекта с отраженным цветом
    return mixColors(closestSphere.color, reflectedColor, closestSphere.reflectivity);
  };

  // Смешивание двух цветов
  const mixColors = (color1: string, color2: string, factor: number): string => {
    const r1 = parseInt(color1.substr(1, 2), 16);
    const g1 = parseInt(color1.substr(3, 2), 16);
    const b1 = parseInt(color1.substr(5, 2), 16);

    const r2 = parseInt(color2.substr(1, 2), 16);
    const g2 = parseInt(color2.substr(3, 2), 16);
    const b2 = parseInt(color2.substr(5, 2), 16);

    const r = Math.round(r1 * (1 - factor) + r2 * factor);
    const g = Math.round(g1 * (1 - factor) + g2 * factor);
    const b = Math.round(b1 * (1 - factor) + b2 * factor);

    return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
  };

  // Рендеринг сцены
  const renderScene = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const width = canvas.width;
    const height = canvas.height;
    sceneRef.current.width = width;
    sceneRef.current.height = height;

    // Положение камеры (источника лучей)
    const cameraPos = { x: width / 2, y: height / 2 };

    // Рендерим каждый пиксель
    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        // Создаем луч из камеры в текущий пиксель
        const ray = {
          origin: cameraPos,
          direction: normalize({ x: x - cameraPos.x, y: y - cameraPos.y }),
        };

        // Трассируем луч с максимальной глубиной рекурсии 3
        const color = traceRay(ray, 0, 3);

        // Рисуем пиксель
        ctx.fillStyle = color;
        ctx.fillRect(x, y, 1, 1);
      }
    }

    // Рисуем информационный текст
    ctx.fillStyle = '#ffffff';
    ctx.font = '16px Arial';
    ctx.fillText('Ray Tracing with Reflections', 20, 30);
  };

  // Инициализация и рендеринг
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    // Установка размеров холста
    const updateCanvasSize = () => {
      canvas.width = window.innerWidth * 0.8;
      canvas.height = window.innerHeight * 0.8;
      renderScene();
    };

    updateCanvasSize();
    window.addEventListener('resize', updateCanvasSize);

    return () => {
      window.removeEventListener('resize', updateCanvasSize);
    };
  }, []);

  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', backgroundColor: '#000' }}>
      <canvas 
        ref={canvasRef} 
        style={{ 
          borderRadius: '8px', 
          boxShadow: '0 4px 20px rgba(0, 0, 0, 0.5)',
          margin: '20px'
        }}
      />
    </div>
  );
};

export default RayTracingReflections;