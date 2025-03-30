import React, { useEffect, useRef } from 'react';

const Graph: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const width = canvas.width;
    const height = canvas.height;

    ctx.clearRect(0, 0, width, height);

    // Настройка осей
    const xMin = -6 * Math.PI;
    const xMax = 6 * Math.PI;
    const yMin = -2;
    const yMax = 2;

    const xScale = width / (xMax - xMin);
    const yScale = height / (yMax - yMin);

    const xOffset = -xMin * xScale;
    const yOffset = yMax * yScale;

    // Отрисовка осей X и Y
    ctx.strokeStyle = 'black';
    ctx.beginPath();
    ctx.moveTo(0, yOffset);
    ctx.lineTo(width, yOffset);
    ctx.moveTo(xOffset, 0);
    ctx.lineTo(xOffset, height);
    ctx.stroke();

    // Отрисовка стрелок на осях
    ctx.beginPath();
    ctx.moveTo(width - 10, yOffset - 5);
    ctx.lineTo(width, yOffset);
    ctx.lineTo(width - 10, yOffset + 5);
    ctx.moveTo(xOffset - 5, 10);
    ctx.lineTo(xOffset, 0);
    ctx.lineTo(xOffset + 5, 10);
    ctx.stroke();

    // Отрисовка делений на осях
    const xStep = (xMax - xMin) / 10;
    const yStep = (yMax - yMin) / 10;

    for (let i = xMin; i <= xMax; i += xStep) {
      const x = i * xScale + xOffset;
      ctx.beginPath();
      ctx.moveTo(x, yOffset - 5);
      ctx.lineTo(x, yOffset + 5);
      ctx.stroke();
    }

    for (let i = yMin; i <= yMax; i += yStep) {
      const y = -i * yScale + yOffset;
      ctx.beginPath();
      ctx.moveTo(xOffset - 5, y);
      ctx.lineTo(xOffset + 5, y);
      ctx.stroke();
    }

    // Отрисовка графика функции
    ctx.strokeStyle = 'blue';
    ctx.beginPath();

    for (let x = xMin; x <= xMax; x += 0.01) {
      const y = Math.sin(3 * x) + Math.cos(2 * x + Math.PI / 12);
      const px = x * xScale + xOffset;
      const py = -y * yScale + yOffset;
      if (x === xMin) {
        ctx.moveTo(px, py);
      } else {
        ctx.lineTo(px, py);
      }
    }

    ctx.stroke();
  }, []);

  return <canvas ref={canvasRef} width={1920} height={1080} style={{ width: '100%', height: 'auto' }} />;
};

export default Graph;