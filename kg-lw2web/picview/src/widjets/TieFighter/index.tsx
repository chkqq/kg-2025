import React, { useEffect, useRef, useState } from 'react';
import background from './images.jpg';

const TieFighterCanvas: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [stageSize, setStageSize] = useState({ width: window.innerWidth, height: window.innerHeight });
  const [position, setPosition] = useState({ x: stageSize.width / 2, y: stageSize.height / 2 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [initialSize, setInitialSize] = useState({ width: window.innerWidth, height: window.innerHeight });

  useEffect(() => {
    const handleResize = () => {
      const newWidth = window.innerWidth;
      const newHeight = window.innerHeight;
      setStageSize({ width: newWidth, height: newHeight });
      setPosition({ x: newWidth / 2, y: newHeight / 2 });
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (canvas) {
      const ctx = canvas.getContext('2d');
      if (ctx) {
        draw(ctx);
      }
    }
  }, [position, stageSize]);

  const draw = (ctx: CanvasRenderingContext2D) => {
    const { width, height } = stageSize;
    const { x, y } = position;

    ctx.clearRect(0, 0, width, height);
    ctx.fillStyle = `url(${background})`;
    ctx.fillRect(0, 0, width, height);

    ctx.save();
    ctx.translate(x, y);

    const scaleX = width / initialSize.width;
    const scaleY = height / initialSize.height;
    const scale = Math.min(scaleX, scaleY);

    ctx.scale(scale, scale);

    const bigCircleRadius = 90;
    const mediumCircleRadius = 60;
    const smallCircleRadius = 25;
    const numLines = 6;
    const lineRadius = mediumCircleRadius;

    drawLines(ctx);
    drawTrapezoids(ctx);
    drawCircles(ctx, bigCircleRadius, mediumCircleRadius, smallCircleRadius, numLines, lineRadius);

    ctx.restore();
  };

  const drawLines = (ctx: CanvasRenderingContext2D) => {
    const lineData = [
      { points: [160, -60, 205, -70, 205, 70, 160, 60], strokeColor: '#303030', fillColor: 'grey', strokeWidth: 3 },
      { points: [195, -70, 205, -70, 205, 70, 195, 70], strokeColor: '#303030', fillColor: 'grey', strokeWidth: 2 },
      { points: [135, -150, 145, -150, 205, -70, 195, -70], strokeColor: '#303030', fillColor: 'grey', strokeWidth: 2 },
      { points: [135, 150, 145, 150, 205, 70, 195, 70], strokeColor: '#303030', fillColor: 'grey', strokeWidth: 2 },
      { points: [105, -135, 135, -150, 195, -70, 160, -60], strokeColor: '#303030', fillColor: 'black', strokeWidth: 3 },
      { points: [105, 135, 135, 150, 195, 70, 160, 60], strokeColor: '#303030', fillColor: 'black', strokeWidth: 3 },
      { points: [-160, -60, -205, -70, -205, 70, -160, 60], strokeColor: '#303030', fillColor: 'grey', strokeWidth: 3 },
      { points: [-195, -70, -205, -70, -205, 70, -195, 70], strokeColor: '#303030', fillColor: 'grey', strokeWidth: 2 },
      { points: [-135, -150, -145, -150, -205, -70, -195, -70], strokeColor: '#303030', fillColor: 'grey', strokeWidth: 2 },
      { points: [-135, 150, -145, 150, -205, 70, -195, 70], strokeColor: '#303030', fillColor: 'grey', strokeWidth: 2 },
      { points: [-105, -135, -135, -150, -195, -70, -160, -60], strokeColor: '#303030', fillColor: 'black', strokeWidth: 3 },
      { points: [-105, 135, -135, 150, -195, 70, -160, 60], strokeColor: '#303030', fillColor: 'black', strokeWidth: 3 }
    ];

    lineData.forEach(({ points, strokeColor, fillColor, strokeWidth }) => {
      drawLine(ctx, points, strokeColor, fillColor, strokeWidth);
    });
  };

  const drawLine = (ctx: CanvasRenderingContext2D, points: number[], strokeColor: string, fillColor: string, strokeWidth: number) => {
    ctx.beginPath();
    ctx.moveTo(points[0], points[1]);
    for (let i = 2; i < points.length; i += 2) {
      ctx.lineTo(points[i], points[i + 1]);
    }
    ctx.closePath();
    ctx.fillStyle = fillColor;
    ctx.fill();
    ctx.strokeStyle = strokeColor;
    ctx.lineWidth = strokeWidth;
    ctx.stroke();
  };

  const drawTrapezoids = (ctx: CanvasRenderingContext2D) => {
    drawTrapezoid(ctx, 125, 0, 60, 60, 60, 60, true);
    drawTrapezoid(ctx, -125, 0, 60, 60, 60, 60, false); 
  };
  
  const drawTrapezoid = (ctx: CanvasRenderingContext2D, x: number, y: number, width: number, height: number, topWidth: number, bottomWidth: number, isFirst: boolean) => {
    ctx.beginPath();
  
    if (isFirst) {
      ctx.moveTo(x - width, y - height);
      ctx.lineTo(x + topWidth, y - height / 2);
      ctx.lineTo(x + bottomWidth, y + height / 2);
      ctx.lineTo(x - width, y + height);
    } else {
      ctx.moveTo(x - width, y - height / 2);
      ctx.lineTo(x + topWidth, y - height);
      ctx.lineTo(x + bottomWidth, y + height);
      ctx.lineTo(x - width, y + height / 2);
    }
  
    ctx.closePath();
    ctx.fillStyle = 'grey';
    ctx.fill();
    ctx.strokeStyle = '#303030';
    ctx.lineWidth = 2;
    ctx.stroke();
  };
  
  const drawCircles = (ctx: CanvasRenderingContext2D, bigCircleRadius: number, mediumCircleRadius: number, smallCircleRadius: number, numLines: number, lineRadius: number) => {
    // Draw big circle
    ctx.beginPath();
    ctx.arc(0, 0, bigCircleRadius, 0, 2 * Math.PI);
    ctx.fillStyle = 'gray';
    ctx.fill();
    ctx.strokeStyle = '#303030';
    ctx.lineWidth = 2;
    ctx.stroke();

    // Draw medium circle
    ctx.beginPath();
    ctx.arc(0, 0, mediumCircleRadius, 0, 2 * Math.PI);
    ctx.fillStyle = 'black';
    ctx.fill();

    // Draw lines
    for (let i = 0; i < numLines; i++) {
      const angle = (i * 2 * Math.PI) / numLines;
      const x = lineRadius * Math.cos(angle);
      const y = lineRadius * Math.sin(angle);
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.lineTo(x, y);
      ctx.strokeStyle = 'gray';
      ctx.lineWidth = 5;
      ctx.stroke();
    }

    // Draw small circle
    ctx.beginPath();
    ctx.arc(0, 0, smallCircleRadius, 0, 2 * Math.PI);
    ctx.fillStyle = 'black';
    ctx.fill();
    ctx.strokeStyle = 'gray';
    ctx.lineWidth = 5;
    ctx.stroke();

    drawSimpleLine(ctx, [-42, -80, 0, -80, 42, -80], '#303030', 2);
  };

  const drawSimpleLine = (ctx: CanvasRenderingContext2D, points: number[], strokeColor: string, strokeWidth: number) => {
    ctx.beginPath();
    ctx.moveTo(points[0], points[1]);
    for (let i = 2; i < points.length; i += 2) {
      ctx.lineTo(points[i], points[i + 1]);
    }
    ctx.strokeStyle = strokeColor;
    ctx.lineWidth = strokeWidth;
    ctx.stroke();
  };

  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    setIsDragging(true);
    setDragStart({ x: e.nativeEvent.offsetX, y: e.nativeEvent.offsetY });
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (isDragging) {
      const dx = e.nativeEvent.offsetX - dragStart.x;
      const dy = e.nativeEvent.offsetY - dragStart.y;
      setPosition((prevPosition) => ({ x: prevPosition.x + dx, y: prevPosition.y + dy }));
      setDragStart({ x: e.nativeEvent.offsetX, y: e.nativeEvent.offsetY });
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  return (
    <canvas
      ref={canvasRef}
      width={stageSize.width}
      height={stageSize.height}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
    />
  );
};

export default TieFighterCanvas;