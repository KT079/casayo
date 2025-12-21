export interface CalendarImage {
  month: string;
  base64: string;
  prompt: string;
  layout?: CanvasLayout;
}

export interface CanvasLayout {
  image: { 
    x: number; 
    y: number; 
    scale: number; 
    opacity: number;
  };
  overlay: { 
    x: number; 
    y: number;
    scale: number;
    opacity: number;
    textColor: string;
    fontFamily: string;
  };
}

export type CalendarStyleId = 
  | 'classic' 
  | 'header_grid' 
  | 'minimal_bottom' 
  | 'sidebar' 
  | 'glass_left' 
  | 'big_date' 
  | 'circular' 
  | 'cards';

export interface CalendarStyle {
  id: CalendarStyleId;
  name: string;
  description: string;
}

export const CALENDAR_STYLES: CalendarStyle[] = [
  { id: 'classic', name: 'Classic Grid', description: 'Standard full grid at the bottom.' },
  { id: 'header_grid', name: 'Header + Grid', description: 'Month header top, grid below.' },
  { id: 'minimal_bottom', name: 'Minimal Bottom', description: 'Clean dates strip at bottom.' },
  { id: 'sidebar', name: 'Right Vertical', description: 'Dates stacked on the right side.' },
  { id: 'glass_left', name: 'Glass Overlay', description: 'Transparent blur effect on left.' },
  { id: 'big_date', name: 'Large Date Focus', description: 'Huge month number background.' },
  { id: 'circular', name: 'Circular', description: 'Creative circular date arrangement.' },
  { id: 'cards', name: 'Floating Cards', description: 'Individual rounded cards for days.' },
];

export enum AppState {
  IDLE = 'IDLE',
  CUSTOM_SELECTION = 'CUSTOM_SELECTION',
  CUSTOM_PREVIEW = 'CUSTOM_PREVIEW',
  GENERATING_PREVIEW = 'GENERATING_PREVIEW',
  PREVIEW_READY = 'PREVIEW_READY',
  GENERATING_FULL_YEAR = 'GENERATING_FULL_YEAR',
  PDF_READY = 'PDF_READY',
  ERROR = 'ERROR'
}

export const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December"
];