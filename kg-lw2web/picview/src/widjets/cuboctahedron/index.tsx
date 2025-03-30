import React, { useEffect, useRef, useState } from 'react';

const Cuboctahedron: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [lastMouseX, setLastMouseX] = useState(0);
  const [lastMouseY, setLastMouseY] = useState(0);
  const [angleX, setAngleX] = useState(0);
  const [angleY, setAngleY] = useState(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const width = canvas.width
    const height = canvas.height
    const centerX = width / 2
    const centerY = height / 2
    // Вершины кубооктаэдра
    const vertices = [
      [1, 1, 0], [1, -1, 0], [-1, -1, 0], [-1, 1, 0],
      [1, 0, 1], [1, 0, -1], [-1, 0, -1], [-1, 0, 1],
      [0, 1, 1], [0, 1, -1], [0, -1, -1], [0, -1, 1]
    ];

    // Грани кубооктаэдра
    const faces = [
      [0, 5, 1, 4], 
      [10, 2, 11, 1],   
      [2, 7, 3, 6], 
      [0, 8, 3, 9],
      [6, 10, 5, 9], 
      [11, 4, 8, 7],
    
      // Треугольные грани
      [0, 4, 8], [0, 9, 5], [1, 5, 10], [1, 4, 11],
      [2, 6, 10], [2, 7, 11], [3, 7, 8], [3, 9, 6]
    ];
    
    
    // Проекция 3D в 2D
    const project = (vertex: number[]) => {
      const [x, y, z] = vertex;
      const scale = 600; // Масштаб
      const distance = 5; // Расстояние от камеры
      const factor = scale / (distance + z);
      return [centerX + x * factor, centerY + y * factor];
    };

    // Вращение вокруг оси Y
    const rotateY = (vertex: number[], angle: number) => {
      const [x, y, z] = vertex;
      const cos = Math.cos(angle);
      const sin = Math.sin(angle);
      return [x * cos - z * sin, y, x * sin + z * cos];
    };

    // Вращение вокруг оси X
    const rotateX = (vertex: number[], angle: number) => {
      const [x, y, z] = vertex;
      const cos = Math.cos(angle);
      const sin = Math.sin(angle);
      return [x, y * cos - z * sin, y * sin + z * cos];
    };

    // Отрисовка фигуры
    const draw = () => {
      if (!ctx) return;

      // Очистка canvas
      ctx.clearRect(0, 0, width, height);

      // Вращение вершин
      const rotatedVertices = vertices.map(vertex => {
        let rotated = rotateY(vertex, angleY);
        rotated = rotateX(rotated, angleX);
        return rotated;
      });

      // Отрисовка граней
      faces.forEach(face => {
        const points = face.map(index => project(rotatedVertices[index]));
        ctx.beginPath();
        ctx.moveTo(points[0][0], points[0][1]);
        points.slice(1).forEach(point => ctx.lineTo(point[0], point[1]));
        ctx.closePath();
        ctx.strokeStyle = '#000';
        ctx.stroke();
        ctx.fillStyle = `rgba(88, 228, 12, 0.3)`;
        ctx.fill();
      });

    };

    // Анимация
    const animate = () => {
      draw();
      requestAnimationFrame(animate);
    };

    animate();

    // Обработчики событий мыши
    const handleMouseDown = (e: MouseEvent) => {
      setIsDragging(true);
      setLastMouseX(e.clientX);
      setLastMouseY(e.clientY);
    };

    const handleMouseMove = (e: MouseEvent) => {
      if (isDragging) {
        const deltaX = e.clientX - lastMouseX;
        const deltaY = e.clientY - lastMouseY;
        setAngleX(angleX + deltaY * 0.01);
        setAngleY(angleY + deltaX * 0.01);
        setLastMouseX(e.clientX);
        setLastMouseY(e.clientY);
      }
    };

    const handleMouseUp = () => {
      setIsDragging(false);
    };

    canvas.addEventListener('mousedown', handleMouseDown);
    canvas.addEventListener('mousemove', handleMouseMove);
    canvas.addEventListener('mouseup', handleMouseUp);

    return () => {
      canvas.removeEventListener('mousedown', handleMouseDown);
      canvas.removeEventListener('mousemove', handleMouseMove);
      canvas.removeEventListener('mouseup', handleMouseUp);
    };
  }, [angleX, angleY, isDragging, lastMouseX, lastMouseY]);

  return <canvas ref={canvasRef} width={800} height={600} />;
};

export default Cuboctahedron;