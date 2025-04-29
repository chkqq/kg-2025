import React, { useRef, useEffect, useState } from 'react';

interface Vector3 {
  x: number;
  y: number;
  z: number;
}

interface Light {
  position: Vector3;
  color: string;
  intensity: number;
}

const RocketVisualization: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [lastMousePos, setLastMousePos] = useState({ x: 0, y: 0 });
  const [rotation, setRotation] = useState({ x: 0, y: 0 });

  const lights: Light[] = [
    { position: { x: 2, y: 3, z: 4 }, color: '#ffffff', intensity: 1 },
    { position: { x: -3, y: -1, z: 2 }, color: '#ff6600', intensity: 0.5 }
  ];

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Устанавливаем размеры canvas равными размерам его контейнера
    const updateCanvasSize = () => {
      const container = canvas.parentElement;
      if (container) {
        canvas.width = container.clientWidth;
        canvas.height = container.clientHeight;
        drawRocket();
      }
    };

    updateCanvasSize();
    window.addEventListener('resize', updateCanvasSize);

    // Обработчики событий мыши для вращения камеры
    const handleMouseDown = (e: MouseEvent) => {
      setIsDragging(true);
      setLastMousePos({ x: e.clientX, y: e.clientY });
    };

    const handleMouseMove = (e: MouseEvent) => {
      if (!isDragging) return;
      
      const deltaX = e.clientX - lastMousePos.x;
      const deltaY = e.clientY - lastMousePos.y;
      
      setRotation(prev => ({
        x: prev.x + deltaY * 0.01,
        y: prev.y + deltaX * 0.01
      }));
      
      setLastMousePos({ x: e.clientX, y: e.clientY });
      drawRocket();
    };

    const handleMouseUp = () => {
      setIsDragging(false);
    };

    canvas.addEventListener('mousedown', handleMouseDown);
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);

    return () => {
      window.removeEventListener('resize', updateCanvasSize);
      canvas.removeEventListener('mousedown', handleMouseDown);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging, lastMousePos, rotation]);

  const drawRocket = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Очистка canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Настройка перспективы
    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;
    const scale = Math.min(canvas.width, canvas.height) / 3;

    // Функция для проекции 3D точки в 2D
    const project = (point: Vector3): { x: number; y: number } => {
      // Применяем вращение
      let rotated = rotateY(rotateX(point, rotation.x), rotation.y);
      
      // Перспективная проекция
      const distance = 5;
      const factor = distance / (distance + rotated.z);
      
      return {
        x: centerX + rotated.x * factor * scale,
        y: centerY + rotated.y * factor * scale
      };
    };

    // Функции вращения
    const rotateX = (point: Vector3, angle: number): Vector3 => {
      return {
        x: point.x,
        y: point.y * Math.cos(angle) - point.z * Math.sin(angle),
        z: point.y * Math.sin(angle) + point.z * Math.cos(angle)
      };
    };

    const rotateY = (point: Vector3, angle: number): Vector3 => {
      return {
        x: point.x * Math.cos(angle) + point.z * Math.sin(angle),
        y: point.y,
        z: -point.x * Math.sin(angle) + point.z * Math.cos(angle)
      };
    };

    // Функция для расчета освещенности
    const calculateLighting = (normal: Vector3, color: string): string => {
      let totalIntensity = 0;
      
      lights.forEach(light => {
        const lightDir = normalize({
          x: light.position.x - normal.x,
          y: light.position.y - normal.y,
          z: light.position.z - normal.z
        });
        
        const dotProduct = normal.x * lightDir.x + normal.y * lightDir.y + normal.z * lightDir.z;
        const intensity = Math.max(0, dotProduct) * light.intensity;
        totalIntensity += intensity;
      });
      
      totalIntensity = Math.min(1, totalIntensity);
      
      return shadeColor(color, totalIntensity * 100 - 50);
    };

    const normalize = (v: Vector3): Vector3 => {
      const length = Math.sqrt(v.x * v.x + v.y * v.y + v.z * v.z);
      return {
        x: v.x / length,
        y: v.y / length,
        z: v.z / length
      };
    };

    const shadeColor = (color: string, percent: number): string => {
      let R = parseInt(color.substring(1, 3), 16);
      let G = parseInt(color.substring(3, 5), 16);
      let B = parseInt(color.substring(5, 7), 16);

      R = Math.min(255, Math.max(0, R + R * percent / 100));
      G = Math.min(255, Math.max(0, G + G * percent / 100));
      B = Math.min(255, Math.max(0, B + B * percent / 100));

      const RR = Math.round(R).toString(16).padStart(2, '0');
      const GG = Math.round(G).toString(16).padStart(2, '0');
      const BB = Math.round(B).toString(16).padStart(2, '0');

      return `#${RR}${GG}${BB}`;
    };

    // Рисуем корпус ракеты (конус)
    const rocketHeight = 2;
    const rocketRadius = 0.5;
    const segments = 16;
    
    // Основной корпус
    for (let i = 0; i < segments; i++) {
      const angle1 = (i / segments) * Math.PI * 2;
      const angle2 = ((i + 1) / segments) * Math.PI * 2;
      
      // Вершины для боковой поверхности
      const bottom1 = {
        x: Math.cos(angle1) * rocketRadius,
        y: rocketHeight / 2,
        z: Math.sin(angle1) * rocketRadius
      };
      
      const bottom2 = {
        x: Math.cos(angle2) * rocketRadius,
        y: rocketHeight / 2,
        z: Math.sin(angle2) * rocketRadius
      };
      
      const top = { x: 0, y: -rocketHeight / 2, z: 0 };
      
      // Нормаль к поверхности
      const normal = normalize({
        x: (bottom1.x + bottom2.x) / 2,
        y: rocketHeight / 4,
        z: (bottom1.z + bottom2.z) / 2
      });
      
      const color = calculateLighting(normal, '#cccccc');
      
      // Рисуем треугольник
      ctx.beginPath();
      const p1 = project(bottom1);
      const p2 = project(bottom2);
      const p3 = project(top);
      
      ctx.moveTo(p1.x, p1.y);
      ctx.lineTo(p2.x, p2.y);
      ctx.lineTo(p3.x, p3.y);
      ctx.closePath();
      
      ctx.fillStyle = color;
      ctx.fill();
      ctx.strokeStyle = '#888888';
      ctx.stroke();
    }
    
    // Нижняя часть ракеты (сопла)
    const nozzleLength = 0.3;
    const nozzleRadius = 0.6;
    const nozzleSegments = 4; // Количество сопел
    
    for (let i = 0; i < segments; i++) {
      const angle1 = (i / segments) * Math.PI * 2;
      const angle2 = ((i + 1) / segments) * Math.PI * 2;
      
      // Вершины для нижней части
      const top1 = {
        x: Math.cos(angle1) * rocketRadius,
        y: rocketHeight / 2,
        z: Math.sin(angle1) * rocketRadius
      };
      
      const top2 = {
        x: Math.cos(angle2) * rocketRadius,
        y: rocketHeight / 2,
        z: Math.sin(angle2) * rocketRadius
      };
      
      const bottom1 = {
        x: Math.cos(angle1) * nozzleRadius,
        y: rocketHeight / 2 + nozzleLength,
        z: Math.sin(angle1) * nozzleRadius
      };
      
      const bottom2 = {
        x: Math.cos(angle2) * nozzleRadius,
        y: rocketHeight / 2 + nozzleLength,
        z: Math.sin(angle2) * nozzleRadius
      };
      
      // Нормаль
      const normal = normalize({
        x: (top1.x + top2.x + bottom1.x + bottom2.x) / 4,
        y: rocketHeight / 2 + nozzleLength / 2,
        z: (top1.z + top2.z + bottom1.z + bottom2.z) / 4
      });
      
      const color = calculateLighting(normal, '#888888');
      
      // Рисуем четырехугольник
      ctx.beginPath();
      const p1 = project(top1);
      const p2 = project(top2);
      const p3 = project(bottom2);
      const p4 = project(bottom1);
      
      ctx.moveTo(p1.x, p1.y);
      ctx.lineTo(p2.x, p2.y);
      ctx.lineTo(p3.x, p3.y);
      ctx.lineTo(p4.x, p4.y);
      ctx.closePath();
      
      ctx.fillStyle = color;
      ctx.fill();
      ctx.strokeStyle = '#555555';
      ctx.stroke();
    }
    
    // Сопла двигателей
    for (let i = 0; i < nozzleSegments; i++) {
      const angle = (i / nozzleSegments) * Math.PI * 2;
      const center = {
        x: Math.cos(angle) * rocketRadius * 0.7,
        y: rocketHeight / 2 + nozzleLength,
        z: Math.sin(angle) * rocketRadius * 0.7
      };
      
      const innerRadius = 0.15;
      const outerRadius = 0.25;
      const nozzleHeight = 0.4;
      
      // Внешняя часть сопла
      for (let j = 0; j < 8; j++) {
        const localAngle1 = (j / 8) * Math.PI * 2;
        const localAngle2 = ((j + 1) / 8) * Math.PI * 2;
        
        const top1 = {
          x: center.x + Math.cos(localAngle1) * outerRadius,
          y: center.y,
          z: center.z + Math.sin(localAngle1) * outerRadius
        };
        
        const top2 = {
          x: center.x + Math.cos(localAngle2) * outerRadius,
          y: center.y,
          z: center.z + Math.sin(localAngle2) * outerRadius
        };
        
        const bottom1 = {
          x: center.x + Math.cos(localAngle1) * innerRadius,
          y: center.y + nozzleHeight,
          z: center.z + Math.sin(localAngle1) * innerRadius
        };
        
        const bottom2 = {
          x: center.x + Math.cos(localAngle2) * innerRadius,
          y: center.y + nozzleHeight,
          z: center.z + Math.sin(localAngle2) * innerRadius
        };
        
        // Нормаль
        const normal = normalize({
          x: (top1.x + top2.x) / 2 - center.x,
          y: 0,
          z: (top1.z + top2.z) / 2 - center.z
        });
        
        const color = calculateLighting(normal, '#555555');
        
        // Рисуем четырехугольник
        ctx.beginPath();
        const p1 = project(top1);
        const p2 = project(top2);
        const p3 = project(bottom2);
        const p4 = project(bottom1);
        
        ctx.moveTo(p1.x, p1.y);
        ctx.lineTo(p2.x, p2.y);
        ctx.lineTo(p3.x, p3.y);
        ctx.lineTo(p4.x, p4.y);
        ctx.closePath();
        
        ctx.fillStyle = color;
        ctx.fill();
        ctx.strokeStyle = '#333333';
        ctx.stroke();
      }
    }
    
    // Иллюминаторы
    const windowRadius = 0.1;
    const windowSegments = 3;
    
    for (let i = 0; i < windowSegments; i++) {
      const yPos = -rocketHeight / 2 + (i + 1) * (rocketHeight / (windowSegments + 1));
      const angle = Math.PI / 2; // Только спереди
      
      const windowPos = {
        x: Math.cos(angle) * rocketRadius * 0.9,
        y: yPos,
        z: Math.sin(angle) * rocketRadius * 0.9
      };
      
      // Нормаль (направлена наружу)
      const normal = normalize({
        x: windowPos.x,
        y: 0,
        z: windowPos.z
      });
      
      const color = calculateLighting(normal, '#66ccff');
      
      // Рисуем круг
      const projected = project(windowPos);
      const projectedRadius = windowRadius * scale * (5 / (5 + windowPos.z));
      
      ctx.beginPath();
      ctx.arc(projected.x, projected.y, projectedRadius, 0, Math.PI * 2);
      ctx.fillStyle = color;
      ctx.fill();
      ctx.strokeStyle = '#333333';
      ctx.stroke();
    }
    
    // Детали корпуса (полосы)
    for (let i = 0; i < 3; i++) {
      const yPos = -rocketHeight / 2 + (i + 1) * (rocketHeight / 4);
      
      for (let j = 0; j < segments; j++) {
        const angle1 = (j / segments) * Math.PI * 2;
        const angle2 = ((j + 1) / segments) * Math.PI * 2;
        
        const width = 0.05;
        
        const p1 = {
          x: Math.cos(angle1) * (rocketRadius + width),
          y: yPos - width,
          z: Math.sin(angle1) * (rocketRadius + width)
        };
        
        const p2 = {
          x: Math.cos(angle2) * (rocketRadius + width),
          y: yPos - width,
          z: Math.sin(angle2) * (rocketRadius + width)
        };
        
        const p3 = {
          x: Math.cos(angle2) * (rocketRadius + width),
          y: yPos + width,
          z: Math.sin(angle2) * (rocketRadius + width)
        };
        
        const p4 = {
          x: Math.cos(angle1) * (rocketRadius + width),
          y: yPos + width,
          z: Math.sin(angle1) * (rocketRadius + width)
        };
        
        // Нормаль
        const normal = normalize({
          x: (p1.x + p2.x + p3.x + p4.x) / 4,
          y: yPos,
          z: (p1.z + p2.z + p3.z + p4.z) / 4
        });
        
        const color = calculateLighting(normal, '#ffcc00');
        
        // Рисуем четырехугольник
        ctx.beginPath();
        const proj1 = project(p1);
        const proj2 = project(p2);
        const proj3 = project(p3);
        const proj4 = project(p4);
        
        ctx.moveTo(proj1.x, proj1.y);
        ctx.lineTo(proj2.x, proj2.y);
        ctx.lineTo(proj3.x, proj3.y);
        ctx.lineTo(proj4.x, proj4.y);
        ctx.closePath();
        
        ctx.fillStyle = color;
        ctx.fill();
        ctx.strokeStyle = '#cc9900';
        ctx.stroke();
      }
    }
  };

  return (
    <div style={{
      width: '100%',
      height: '100vh',
      backgroundColor: '#000',
      position: 'relative',
      overflow: 'hidden'
    }}>
      <canvas 
        ref={canvasRef}
        style={{
          width: '100%',
          height: '100%',
          display: 'block'
        }}
      />
      <div style={{
        position: 'absolute',
        bottom: '20px',
        left: '20px',
        color: '#fff',
        fontFamily: 'Arial, sans-serif',
        fontSize: '14px'
      }}>
        Перетащите мышью для вращения ракеты
      </div>
    </div>
  );
};

export default RocketVisualization;