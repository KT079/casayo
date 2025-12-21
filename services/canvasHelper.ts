import { MONTHS, CanvasLayout, CalendarStyleId } from '../types';

export { CanvasLayout };

export const DEFAULT_LAYOUT: CanvasLayout = {
  image: { x: 0, y: 0, scale: 1, opacity: 1 },
  overlay: { 
    x: 0, 
    y: 0, 
    scale: 1, 
    opacity: 1, 
    textColor: '#ffffff', 
    fontFamily: 'Inter' 
  }
};

export const REFERENCE_WIDTH = 1414;
export const REFERENCE_HEIGHT = 1000;

export const loadCanvasImage = (base64: string): Promise<HTMLImageElement> => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = reject;
    if (base64.startsWith('data:image')) {
        img.src = base64;
    } else {
        img.src = `data:image/png;base64,${base64}`;
    }
  });
};

export const drawScene = (
  ctx: CanvasRenderingContext2D,
  img: HTMLImageElement,
  month: string,
  year: number,
  theme: string,
  layout: CanvasLayout = DEFAULT_LAYOUT,
  styleId: CalendarStyleId = 'classic'
) => {
  const canvas = ctx.canvas;
  
  // 1. CLEAR CANVAS
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // 2. CALCULATE IMAGE GEOMETRY
  const imgRatio = img.width / img.height;
  const canvasRatio = canvas.width / canvas.height;
  
  let baseW, baseH, baseX, baseY;

  if (imgRatio > canvasRatio) {
    baseH = canvas.height;
    baseW = canvas.height * imgRatio;
    baseX = (canvas.width - baseW) / 2;
    baseY = 0;
  } else {
    baseW = canvas.width;
    baseH = canvas.width / imgRatio;
    baseX = 0;
    baseY = (canvas.height - baseH) / 2;
  }

  const finalW = baseW * layout.image.scale;
  const finalH = baseH * layout.image.scale;
  
  const scaleOffsetX = (finalW - baseW) / 2;
  const scaleOffsetY = (finalH - baseH) / 2;

  const finalX = baseX + layout.image.x - scaleOffsetX;
  const finalY = baseY + layout.image.y - scaleOffsetY;

  // DRAW IMAGE
  ctx.save();
  ctx.globalAlpha = layout.image.opacity ?? 1;
  ctx.drawImage(img, finalX, finalY, finalW, finalH);
  ctx.restore();

  // 3. RENDER STYLE
  ctx.save();
  // Apply Global Overlay Styles
  ctx.globalAlpha = layout.overlay.opacity;
  
  // We don't apply scale globally to the context because it messes up 'x' and 'y' offsets if not centered.
  // Instead, individual renderers will use layout.overlay.scale to adjust dimensions/fonts.
  
  switch (styleId) {
    case 'header_grid': renderHeaderGrid(ctx, month, year, layout); break;
    case 'minimal_bottom': renderMinimalBottom(ctx, month, year, layout); break;
    case 'sidebar': renderSidebar(ctx, month, year, layout); break;
    case 'glass_left': renderGlassLeft(ctx, month, year, layout); break;
    case 'big_date': renderBigDate(ctx, month, year, layout); break;
    case 'circular': renderCircular(ctx, month, year, layout); break;
    case 'cards': renderCards(ctx, month, year, layout); break;
    case 'classic': default: renderClassic(ctx, month, year, layout); break;
  }
  ctx.restore();
};

const getCalendarData = (month: string, year: number) => {
  const monthIndex = MONTHS.indexOf(month);
  const targetYear = year || new Date().getFullYear();
  const safeMonthIndex = monthIndex >= 0 ? monthIndex : 0;
  
  const daysInMonth = new Date(targetYear, safeMonthIndex + 1, 0).getDate();
  const firstDayIndex = new Date(targetYear, safeMonthIndex, 1).getDay();
  
  return { daysInMonth, firstDayIndex };
};

// --- STYLES IMPLEMENTATIONS ---

// Helper to get font string
const getFont = (size: number, family: string, weight: string = 'normal') => {
    return `${weight} ${size}px "${family}", sans-serif`;
};

const renderClassic = (ctx: CanvasRenderingContext2D, month: string, year: number, layout: CanvasLayout) => {
  const { scale, textColor, fontFamily } = layout.overlay;
  const w = ctx.canvas.width;
  const h = ctx.canvas.height;
  
  const overlayH = (h * 0.4) * scale;
  const y = h - overlayH + layout.overlay.y;
  const x = layout.overlay.x;

  ctx.fillStyle = 'rgba(15, 23, 42, 0.95)';
  ctx.fillRect(x, y, w, overlayH);

  ctx.fillStyle = textColor;
  ctx.textAlign = 'left';
  ctx.font = getFont(h * 0.08 * scale, fontFamily, 'bold');
  ctx.fillText(month.toUpperCase(), x + 40, y + (80 * scale));
  
  ctx.font = getFont(h * 0.04 * scale, fontFamily, 'normal');
  ctx.globalAlpha = ctx.globalAlpha * 0.7; // dim year slightly
  ctx.fillText(year.toString(), x + 40, y + (130 * scale));
  ctx.globalAlpha = layout.overlay.opacity; // reset

  const gridW = w * 0.6;
  // Adjust grid position to stay consistent with scale
  drawGrid(ctx, month, year, x + w - gridW - 40, y + (50 * scale), gridW / 7, overlayH / 8, layout);
};

const renderHeaderGrid = (ctx: CanvasRenderingContext2D, month: string, year: number, layout: CanvasLayout) => {
  const { scale, textColor, fontFamily } = layout.overlay;
  const w = ctx.canvas.width;
  const h = ctx.canvas.height;
  const y = layout.overlay.y;
  const x = layout.overlay.x;

  const headerH = (h * 0.15) * scale;
  
  // Header
  ctx.fillStyle = 'rgba(0,0,0,0.8)';
  ctx.fillRect(x, y, w, headerH);

  ctx.fillStyle = textColor;
  ctx.textAlign = 'center';
  ctx.font = getFont(h * 0.08 * scale, fontFamily, 'bold');
  ctx.fillText(`${month.toUpperCase()} ${year}`, x + w/2, y + headerH * 0.7);

  // Grid background
  const gridY = y + headerH;
  const gridH = (h * 0.5) * scale;
  
  ctx.fillStyle = 'rgba(0,0,0,0.4)';
  ctx.fillRect(x, gridY, w, gridH);
  
  drawGrid(ctx, month, year, x + w * 0.1, gridY + (20 * scale), (w * 0.8) / 7, gridH / 7, layout);
};

const renderMinimalBottom = (ctx: CanvasRenderingContext2D, month: string, year: number, layout: CanvasLayout) => {
  const { scale, textColor, fontFamily } = layout.overlay;
  const w = ctx.canvas.width;
  const h = ctx.canvas.height;
  
  const barHeight = (h * 0.3) * scale;
  const y = h - barHeight + layout.overlay.y; // Bottom aligned usually
  const x = layout.overlay.x;

  ctx.fillStyle = 'linear-gradient(to top, rgba(0,0,0,0.9), transparent)';
  const grad = ctx.createLinearGradient(0, y, 0, y + barHeight);
  grad.addColorStop(0, 'transparent');
  grad.addColorStop(1, 'rgba(0,0,0,0.9)');
  ctx.fillStyle = grad;
  ctx.fillRect(0, y, w, barHeight);

  ctx.fillStyle = textColor;
  ctx.textAlign = 'left';
  ctx.font = getFont(h * 0.06 * scale, fontFamily, 'bold');
  ctx.fillText(`${month} ${year}`, x + 40, y + barHeight/2);

  const gridW = (w * 0.5) * scale;
  drawGrid(ctx, month, year, x + w - gridW - 20, y + barHeight/4, gridW / 7, (h * 0.05) * scale, layout);
};

const renderSidebar = (ctx: CanvasRenderingContext2D, month: string, year: number, layout: CanvasLayout) => {
  const { scale, textColor, fontFamily } = layout.overlay;
  const w = ctx.canvas.width;
  const h = ctx.canvas.height;
  
  const width = (w * 0.25) * scale;
  const x = w - width + layout.overlay.x;
  const y = layout.overlay.y;

  ctx.fillStyle = 'rgba(15, 23, 42, 0.95)';
  ctx.fillRect(x, 0, width, h);

  ctx.fillStyle = textColor;
  ctx.textAlign = 'center';
  ctx.font = getFont(width * 0.2, fontFamily, 'bold');
  ctx.fillText(month.substr(0, 3).toUpperCase(), x + width/2, y + (100 * scale));
  
  ctx.font = getFont(width * 0.1, fontFamily, 'normal');
  ctx.globalAlpha = ctx.globalAlpha * 0.7;
  ctx.fillText(year.toString(), x + width/2, y + (150 * scale));
  ctx.globalAlpha = layout.overlay.opacity;

  drawGrid(ctx, month, year, x + 20, y + (250 * scale), (width - 40) / 7, ((width - 40) / 7) * 1.2, layout);
};

const renderGlassLeft = (ctx: CanvasRenderingContext2D, month: string, year: number, layout: CanvasLayout) => {
  const { scale, textColor, fontFamily } = layout.overlay;
  const w = ctx.canvas.width;
  const h = ctx.canvas.height;
  
  const width = (w * 0.3) * scale;
  const height = (h - 100) * scale;
  const x = 50 + layout.overlay.x;
  const y = 50 + layout.overlay.y;

  // Glass effect
  ctx.fillStyle = 'rgba(255, 255, 255, 0.1)';
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.2)';
  if (ctx.roundRect) {
      ctx.beginPath();
      ctx.roundRect(x, y, width, height, 20);
      ctx.fill();
      ctx.stroke();
  } else {
      ctx.fillRect(x, y, width, height);
  }

  ctx.fillStyle = textColor;
  ctx.textAlign = 'left';
  ctx.font = getFont(width * 0.15, fontFamily, 'bold');
  ctx.fillText(month.toUpperCase(), x + 40, y + (80 * scale));
  
  drawGrid(ctx, month, year, x + 30, y + (150 * scale), (width - 60) / 7, (height - 200) / 7, layout);
};

const renderBigDate = (ctx: CanvasRenderingContext2D, month: string, year: number, layout: CanvasLayout) => {
  const { scale, textColor, fontFamily } = layout.overlay;
  const w = ctx.canvas.width;
  const h = ctx.canvas.height;
  const monthIdx = MONTHS.indexOf(month) + 1;
  const bigNum = monthIdx < 10 ? `0${monthIdx}` : `${monthIdx}`;
  
  const x = layout.overlay.x;
  const y = layout.overlay.y;

  // Huge Number Background
  ctx.save();
  ctx.globalAlpha = layout.overlay.opacity * 0.2; // Extra transparency for BG number
  ctx.fillStyle = textColor;
  ctx.font = getFont(h * 0.8 * scale, fontFamily, 'bold');
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(bigNum, w/2 + x, h/2 + y);
  ctx.restore();

  // Overlay Grid centered
  const gridW = (w * 0.8) * scale;
  const gridH = (h * 0.6) * scale;
  const gridX = (w - gridW) / 2 + x;
  const gridY = (h - gridH) / 2 + y;

  ctx.fillStyle = textColor;
  ctx.textAlign = 'center';
  ctx.font = getFont(h * 0.05 * scale, fontFamily, 'bold');
  ctx.fillText(`${month.toUpperCase()} ${year}`, w/2 + x, gridY - (40 * scale));

  drawGrid(ctx, month, year, gridX, gridY, gridW / 7, gridH / 7, layout);
};

const renderCircular = (ctx: CanvasRenderingContext2D, month: string, year: number, layout: CanvasLayout) => {
    const { scale, textColor, fontFamily } = layout.overlay;
    const w = ctx.canvas.width;
    const h = ctx.canvas.height;
    const cx = w / 2 + layout.overlay.x;
    const cy = h / 2 + layout.overlay.y;
    const radius = (h * 0.35) * scale;
    
    // Background Circle
    ctx.beginPath();
    ctx.arc(cx, cy, radius + (60 * scale), 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(0,0,0,0.5)';
    ctx.fill();

    // Center Text
    ctx.fillStyle = textColor;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.font = getFont(h * 0.05 * scale, fontFamily, 'bold');
    ctx.fillText(month.toUpperCase(), cx, cy - (20 * scale));
    
    ctx.font = getFont(h * 0.03 * scale, fontFamily, 'normal');
    ctx.globalAlpha = layout.overlay.opacity * 0.7;
    ctx.fillText(year.toString(), cx, cy + (20 * scale));
    ctx.globalAlpha = layout.overlay.opacity;

    const { daysInMonth } = getCalendarData(month, year);
    const angleStep = (Math.PI * 2) / daysInMonth;
    
    ctx.font = getFont(h * 0.03 * scale, fontFamily, 'bold');
    ctx.fillStyle = textColor;

    for (let i = 1; i <= daysInMonth; i++) {
        const angle = (i * angleStep) - (Math.PI / 2); // Start at top
        const x = cx + Math.cos(angle) * radius;
        const y = cy + Math.sin(angle) * radius;
        
        ctx.save();
        ctx.translate(x, y);
        ctx.rotate(angle + Math.PI / 2); // Rotate text to face center
        ctx.fillText(i.toString(), 0, 0);
        ctx.restore();
    }
};

const renderCards = (ctx: CanvasRenderingContext2D, month: string, year: number, layout: CanvasLayout) => {
    const { scale, textColor, fontFamily } = layout.overlay;
    const w = ctx.canvas.width;
    const h = ctx.canvas.height;
    
    const margin = 50 * scale;
    const availableW = w - (margin * 2);
    const cardSize = (availableW / 7); // Cards scale with width naturally
    const startX = margin + layout.overlay.x;
    const startY = (h * 0.4) + layout.overlay.y;
    
    ctx.fillStyle = textColor;
    ctx.textAlign = 'left';
    ctx.font = getFont(h * 0.08 * scale, fontFamily, 'bold');
    ctx.shadowColor = 'black';
    ctx.shadowBlur = 10;
    ctx.fillText(month, startX, startY - (50 * scale));
    ctx.shadowBlur = 0;

    const { daysInMonth, firstDayIndex } = getCalendarData(month, year);
    let currentDay = 1;
    
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    
    for (let row = 0; row < 6; row++) {
        for (let col = 0; col < 7; col++) {
            if (row === 0 && col < firstDayIndex) continue;
            if (currentDay > daysInMonth) break;

            const x = startX + (col * cardSize);
            const y = startY + (row * cardSize);
            
            // Card BG
            ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
            const pad = 5 * scale;
            if (ctx.roundRect) {
                ctx.beginPath();
                ctx.roundRect(x + pad, y + pad, cardSize - pad*2, cardSize - pad*2, 10 * scale);
                ctx.fill();
            } else {
                ctx.fillRect(x + pad, y + pad, cardSize - pad*2, cardSize - pad*2);
            }

            // Number
            ctx.fillStyle = '#0f172a'; // Cards always dark text on white bg for readability
            ctx.font = getFont(cardSize * 0.4, fontFamily, 'bold');
            ctx.fillText(currentDay.toString(), x + cardSize/2, y + cardSize/2);

            currentDay++;
        }
    }
};

const drawGrid = (
    ctx: CanvasRenderingContext2D, 
    month: string, 
    year: number, 
    startX: number, 
    startY: number, 
    cellWidth: number, 
    cellHeight: number,
    layout: CanvasLayout
) => {
    const { textColor, fontFamily, scale } = layout.overlay;
    const days = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'];
    
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillStyle = textColor;
    ctx.globalAlpha = layout.overlay.opacity * 0.7; // slightly dimmer headers
    ctx.font = getFont(Math.min(cellWidth, cellHeight) * 0.3, fontFamily, 'bold');
    
    days.forEach((day, i) => {
      ctx.fillText(day, startX + (i * cellWidth) + (cellWidth/2), startY + (cellHeight/2));
    });

    const { daysInMonth, firstDayIndex } = getCalendarData(month, year);

    ctx.globalAlpha = layout.overlay.opacity; // Full opacity for numbers
    ctx.fillStyle = textColor;
    ctx.font = getFont(Math.min(cellWidth, cellHeight) * 0.4, fontFamily, 'normal');

    let currentDay = 1;
    for (let row = 1; row <= 6; row++) {
        for (let col = 0; col < 7; col++) {
            if (row === 1 && col < firstDayIndex) continue;
            if (currentDay > daysInMonth) break;

            const x = startX + (col * cellWidth) + (cellWidth/2);
            const y = startY + (row * cellHeight) + (cellHeight/2);
            
            ctx.fillText(currentDay.toString(), x, y);
            currentDay++;
        }
    }
};

export const drawCalendarOnCanvas = async (
  canvas: HTMLCanvasElement,
  imageBase64: string,
  month: string,
  year: number,
  theme: string,
  layout: CanvasLayout = DEFAULT_LAYOUT,
  styleId: CalendarStyleId = 'classic'
): Promise<void> => {
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    // Polyfill roundRect
    if (!ctx.roundRect) {
        ctx.roundRect = (x: number, y: number, w: number, h: number, r: number) => {
            ctx.rect(x, y, w, h);
        }
    }
    
    try {
        const img = await loadCanvasImage(imageBase64);
        drawScene(ctx, img, month, year, theme, layout, styleId);
    } catch (e) {
        console.error("Failed to draw calendar", e);
    }
};