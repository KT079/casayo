import React, { useRef, useEffect, useCallback, useState } from 'react';
import { drawScene, loadCanvasImage, DEFAULT_LAYOUT, REFERENCE_WIDTH, REFERENCE_HEIGHT } from '../services/canvasHelper';
import { CanvasLayout, MONTHS, CalendarStyleId } from '../types';

interface InteractiveCanvasProps {
  imageData: string;
  theme: string;
  month?: string;
  layout: CanvasLayout;
  onLayoutChange: (newLayout: CanvasLayout) => void;
  activeLayer?: 'image' | 'overlay';
  className?: string;
  readOnly?: boolean;
  styleId?: CalendarStyleId;
}

const InteractiveCanvas: React.FC<InteractiveCanvasProps> = ({ 
  imageData, 
  theme, 
  month = MONTHS[0],
  layout, 
  onLayoutChange, 
  activeLayer = 'image',
  className = "",
  readOnly = false,
  styleId = 'classic'
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const imgRef = useRef<HTMLImageElement | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [isLoading, setIsLoading] = useState(true);

  // Initial Load
  useEffect(() => {
    let active = true;
    const load = async () => {
      setIsLoading(true);
      try {
        const img = await loadCanvasImage(imageData);
        if (active) {
            imgRef.current = img;
            setIsLoading(false);
            if (canvasRef.current) {
                // Set fixed high resolution for consistency with PDF output (A4 Landscape ratio)
                canvasRef.current.width = REFERENCE_WIDTH;
                canvasRef.current.height = REFERENCE_HEIGHT;
                
                const ctx = canvasRef.current.getContext('2d');
                if (ctx) drawScene(ctx, img, month, new Date().getFullYear(), theme, layout, styleId as CalendarStyleId);
            }
        }
      } catch (e) {
        console.error("Failed to load image", e);
      }
    };
    load();
    return () => { active = false; };
  }, [imageData]);

  // Redraw when props change
  useEffect(() => {
    if (canvasRef.current && imgRef.current) {
        const ctx = canvasRef.current.getContext('2d');
        if (ctx) drawScene(ctx, imgRef.current, month, new Date().getFullYear(), theme, layout, styleId as CalendarStyleId);
    }
  }, [layout, month, theme, styleId]);

  // Interaction Handlers
  const handlePointerDown = (e: React.MouseEvent | React.TouchEvent) => {
    if (readOnly) return;
    setIsDragging(true);
    const clientX = 'touches' in e ? e.touches[0].clientX : (e as React.MouseEvent).clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : (e as React.MouseEvent).clientY;
    setDragStart({ x: clientX, y: clientY });
  };

  const handlePointerMove = (e: React.MouseEvent | React.TouchEvent) => {
    if (!isDragging || readOnly || !canvasRef.current) return;
    
    const clientX = 'touches' in e ? e.touches[0].clientX : (e as React.MouseEvent).clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : (e as React.MouseEvent).clientY;

    const deltaX = clientX - dragStart.x;
    const deltaY = clientY - dragStart.y;

    // Convert screen pixels to canvas pixels roughly to keep feel consistent
    const rect = canvasRef.current.getBoundingClientRect();
    const scaleX = canvasRef.current.width / rect.width;
    const scaleY = canvasRef.current.height / rect.height;
    
    // Sensitivity factor
    const sensitivity = 1.0; 

    const moveX = deltaX * scaleX * sensitivity;
    const moveY = deltaY * scaleY * sensitivity;

    const newLayout = { ...layout };

    if (activeLayer === 'image') {
        newLayout.image = {
            ...newLayout.image,
            x: newLayout.image.x + moveX,
            y: newLayout.image.y + moveY
        };
    } else {
        newLayout.overlay = {
            ...newLayout.overlay,
            x: newLayout.overlay.x + moveX,
            y: newLayout.overlay.y + moveY
        };
    }

    onLayoutChange(newLayout);
    setDragStart({ x: clientX, y: clientY });
  };

  const handlePointerUp = () => setIsDragging(false);

  const handleWheel = (e: React.WheelEvent) => {
    if (readOnly || activeLayer !== 'image') return;
    
    const scaleFactor = -e.deltaY * 0.001;
    const newScale = Math.max(0.1, Math.min(5, layout.image.scale + scaleFactor));

    onLayoutChange({
        ...layout,
        image: { ...layout.image, scale: newScale }
    });
  };

  return (
    <div 
        className={`relative w-full h-full flex items-center justify-center overflow-hidden touch-none ${className} ${!readOnly ? 'cursor-move' : ''}`}
        onMouseDown={handlePointerDown}
        onMouseMove={handlePointerMove}
        onMouseUp={handlePointerUp}
        onMouseLeave={handlePointerUp}
        onTouchStart={handlePointerDown}
        onTouchMove={handlePointerMove}
        onTouchEnd={handlePointerUp}
        onWheel={handleWheel}
    >
      {isLoading && <div className="text-white absolute z-10">Loading...</div>}
      <canvas 
        ref={canvasRef}
        className="w-full h-full object-contain shadow-2xl"
        style={{ touchAction: 'none' }}
      />
    </div>
  );
};

export default InteractiveCanvas;