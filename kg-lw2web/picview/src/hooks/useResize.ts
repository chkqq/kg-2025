import { useEffect } from 'react';

interface UseResizeProps {
  imageDimensions: { width: number; height: number } | null;
  setImagePosition: React.Dispatch<React.SetStateAction<{ x: number; y: number }>>;
  containerRef: React.RefObject<HTMLDivElement>;
}

export const useResize = ({ imageDimensions, setImagePosition, containerRef }: UseResizeProps) => {
  useEffect(() => {
    const handleResize = () => {
      if (containerRef.current && imageDimensions) {
        const containerWidth = containerRef.current.clientWidth;
        const containerHeight = containerRef.current.clientHeight;
        const imageWidth = imageDimensions.width;
        const imageHeight = imageDimensions.height;

        const newX = Math.max((containerWidth - imageWidth) / 2, 0);
        const newY = Math.max((containerHeight - imageHeight) / 2, 0);

        setImagePosition({ x: newX, y: newY });
      }
    };

    window.addEventListener('resize', handleResize);
    handleResize();

    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, [imageDimensions, containerRef, setImagePosition]);
};
