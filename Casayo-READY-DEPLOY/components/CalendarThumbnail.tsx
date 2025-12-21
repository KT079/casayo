import React, { useRef, useEffect } from 'react';
import { drawCalendarOnCanvas } from '../services/canvasHelper';
import { CalendarImage } from '../types';

interface CalendarThumbnailProps {
  image: CalendarImage;
  theme: string;
}

const CalendarThumbnail: React.FC<CalendarThumbnailProps> = ({ image, theme }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const render = async () => {
      if (canvasRef.current) {
        const canvas = canvasRef.current;
        // Use a reasonable resolution for thumbnails (e.g., 800x600 for 4:3)
        // High enough for clarity, low enough for performance
        canvas.width = 800;
        canvas.height = 600; 
        
        await drawCalendarOnCanvas(
          canvas, 
          image.base64, 
          image.month, 
          new Date().getFullYear(), 
          theme || 'Custom'
        );
      }
    };
    render();
  }, [image, theme]);

  return <canvas ref={canvasRef} className="w-full h-full object-cover" />;
};

export default CalendarThumbnail;
