import React, { useState, useRef } from 'react';
import { useDragAndDrop } from '../../hooks/useDragAndDrop';
import { useResize } from '../../hooks/useResize';
import styles from './style.module.scss';
import blackWhiteImage from './blackwhite.png';

const PictureViewer: React.FC = () => {
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [imageDimensions, setImageDimensions] = useState<{ width: number, height: number } | null>(null);
  const [imagePosition, setImagePosition] = useState<{ x: number, y: number }>({ x: 0, y: 0 });
  const [isPNG, setIsPNG] = useState<boolean>(false);

  const imageRef = useRef<HTMLImageElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);


  const { dragging, handleMouseDown } = useDragAndDrop({ setImagePosition });


  useResize({ 
    imageDimensions, 
    setImagePosition, 
    containerRef 
  });

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const fileUrl = reader.result as string;
        setImageUrl(fileUrl);

        if (file.type === 'image/png') {
          setIsPNG(true);
        } else {
          setIsPNG(false);
        }

        const img = new Image();
        img.onload = () => {
          setImageDimensions({ width: img.width, height: img.height });
        };
        img.src = fileUrl;
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div ref={containerRef} className={styles.container}>
      <input type="file" accept="image/png, image/jpeg, image/bmp" onChange={handleImageChange} />
      {imageUrl && (
        <div
          className={styles.imageWrapper}
          style={{
            width: '100%',
            height: '100%',
            position: 'relative',
            cursor: dragging ? 'grabbing' : 'grab',
          }}
        >
          <img
            ref={imageRef}
            src={imageUrl}
            alt="Uploaded"
            className={styles.image}
            style={{
              position: 'absolute',
              left: `${imagePosition.x}px`,
              top: `${imagePosition.y}px`,
              transform: 'none',
              backgroundImage: isPNG ? `url(${blackWhiteImage})` : 'none',
              backgroundSize: 'auto',
              backgroundRepeat: 'repeat',
            }}
            onMouseDown={handleMouseDown}
          />
        </div>
      )}
    </div>
  );
};

export default PictureViewer;
