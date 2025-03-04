import { useState, useRef, useEffect } from 'react';

interface UseDragAndDropProps {
  setImagePosition: React.Dispatch<React.SetStateAction<{ x: number; y: number }>>;
}

export const useDragAndDrop = ({ setImagePosition }: UseDragAndDropProps) => {
  const [dragging, setDragging] = useState<boolean>(false);
  const initialMousePosition = useRef<{ x: number, y: number }>({ x: 0, y: 0 });

  const handleMouseDown = (e: React.MouseEvent) => {
    setDragging(true);
    initialMousePosition.current = { x: e.clientX, y: e.clientY };
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

  const handleMouseUp = () => {
    setDragging(false);
  };

  const handleMouseLeave = () => {
    setDragging(false);
  };

  useEffect(() => {
    if (dragging) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
      window.addEventListener('mouseleave', handleMouseLeave);
    }

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
      window.removeEventListener('mouseleave', handleMouseLeave);
    };
  }, [dragging]);

  return { dragging, handleMouseDown };
};
