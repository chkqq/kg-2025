import React, { useEffect, useRef, useState } from 'react';
import { Stage, Layer, Circle, Line, Group } from 'react-konva';
import background from './images.jpg'

const StarCanvas: React.FC = () => {
  const stageRef = useRef<any>(null);
  const [stageWidth, setStageWidth] = useState(window.innerWidth);
  const [stageHeight, setStageHeight] = useState(window.innerHeight);
  const [position, setPosition] = useState({ x: stageWidth / 2, y: stageHeight / 2 });

  useEffect(() => {
    const handleResize = () => {
      setStageWidth(window.innerWidth);
      setStageHeight(window.innerHeight);
      setPosition({ x: window.innerWidth / 2, y: window.innerHeight / 2 });
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const handleDragMove = (e: any) => {
    setPosition({ x: e.target.x(), y: e.target.y() });
  };

  const bigCircleRadius = 90;
  const mediumCircleRadius = 60;
  const smallCircleRadius = 25;
  const numLines = 6;
  const lineRadius = mediumCircleRadius;
  const lines = [];

  for (let i = 0; i < numLines; i++) {
    const angle = (i * 2 * Math.PI) / numLines;
    const x = lineRadius * Math.cos(angle);
    const y = lineRadius * Math.sin(angle);
    lines.push(
      <Line key={i} points={[0, 0, x, y]} stroke="gray" strokeWidth={5} />
    );
  }

  const trapezoidX1 = 135;
  const trapezoidY1 = 0;

  const trapezoidPoints1 = [
    trapezoidX1 - 80, trapezoidY1 - 60,
    trapezoidX1 + 60, trapezoidY1 - 30, 
    trapezoidX1 + 60, trapezoidY1 + 30, 
    trapezoidX1 - 80, trapezoidY1 + 60 
  ];
  const trapezoidX2 = -135;
  const trapezoidY2 = 0;

  const trapezoidPoints2 = [
    trapezoidX2 + 80, trapezoidY2 + 60,
    trapezoidX2 - 60, trapezoidY2 + 30,
    trapezoidX2 - 60, trapezoidY2 - 30,
    trapezoidX2 + 80, trapezoidY2 - 60 
  ];

  return (
    <Stage
      width={stageWidth}
      height={stageHeight}
      ref={stageRef}
      style={{ backgroundImage: `url(${background})`, backgroundSize: 'auto', backgroundRepeat: 'repeat' }}
    >
      <Layer>
        <Group x={position.x} y={position.y} draggable onDragMove={handleDragMove}>
          <Line points={[160, -60, 205, -70, 205, 70, 160, 60]} stroke="#303030" fill="grey" strokeWidth={3} closed />
          <Line points={trapezoidPoints1} stroke="#303030" fill="grey" strokeWidth={2} closed />
          <Line points={[195, -70, 205, -70, 205, 70, 195, 70]} stroke="#303030" fill="grey" strokeWidth={2} closed />
          <Line points={[135, -150, 145, -150, 205, -70, 195, -70]} stroke="#303030" fill="grey" strokeWidth={2} closed />
          <Line points={[135, 150, 145, 150, 205, 70, 195, 70]} stroke="#303030" fill="grey" strokeWidth={2} closed />
          <Line points={[105, -135, 135, -150, 195, -70, 160, -60]} stroke="#303030" fill="black" strokeWidth={3} closed />
          <Line points={[105, 135, 135, 150, 195, 70, 160, 60]} stroke="#303030" fill="black" strokeWidth={3} closed />
          <Line points={[-160, -60, -205, -70, -205, 70, -160, 60]} stroke="#303030" fill="grey" strokeWidth={3} closed />
          <Line points={trapezoidPoints2} stroke="#303030" fill="grey" strokeWidth={2} closed />
          <Line points={[-195, -70, -205, -70, -205, 70, -195, 70]} stroke="#303030" fill="grey" strokeWidth={2} closed />
          <Line points={[-135, -150, -145, -150, -205, -70, -195, -70]} stroke="#303030" fill="grey" strokeWidth={2} closed />
          <Line points={[-135, 150, -145, 150, -205, 70, -195, 70]} stroke="#303030" fill="grey" strokeWidth={2} closed />
          <Line points={[-105, -135, -135, -150, -195, -70, -160, -60]} stroke="#303030" fill="black" strokeWidth={3} closed />
          <Line points={[-105, 135, -135, 150, -195, 70, -160, 60]} stroke="#303030" fill="black" strokeWidth={3} closed />
          <Circle x={0} y={0} radius={bigCircleRadius} fill="gray" stroke="#303030" strokeWidth={2} />
          <Circle x={0} y={0} radius={mediumCircleRadius} fill="black" />
          {lines}
          <Circle x={0} y={0} radius={smallCircleRadius} fill="black" stroke="gray" strokeWidth={5} />
          <Line points={[-42, -80, 0, -80, 42, -80]} stroke="#303030" strokeWidth={2} />
        </Group>
      </Layer>
    </Stage>
  );
};

export default StarCanvas;
