import { useState, useRef, useEffect } from 'react';

interface UseDragAndDropProps {
  setImagePosition: React.Dispatch<React.SetStateAction<{ x: number; y: number }>>;
}

export const useDragAndDrop = ({ setImagePosition }: UseDragAndDropProps) => {
  const [dragging, setDragging] = useState<boolean>(false);
  const initialMousePosition = useRef<{ x: number, y: number }>({ x: 0, y: 0 });

  const handleMouseDown = (e: React.MouseEvent) => {
    if (e.button === 0) { // Только левая кнопка мыши
      setDragging(true);
      initialMousePosition.current = { x: e.clientX, y: e.clientY };
    }
  };

  const handleMouseMove = (e: MouseEvent) => {
    if (dragging) {
      const deltaX = e.clientX - initialMousePosition.current.x;
      const deltaY = e.clientY - initialMousePosition.current.y;
      setImagePosition((prev) => ({
        x: prev.x + deltaX,
        y: prev.y + deltaY,
      }));
      initialMousePosition.current = { x: e.clientX, y: e.clientY };
    }
  };

  const handleMouseUp = (e: MouseEvent) => {
    if (e.button === 0) {
      setDragging(false);
    }
  };

  useEffect(() => {
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [dragging]);

  return { dragging, handleMouseDown };
};
