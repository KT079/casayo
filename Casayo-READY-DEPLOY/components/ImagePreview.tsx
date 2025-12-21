import React, { useState } from 'react';
import { RefreshCcw, Layers, Move, MousePointer2, LayoutTemplate, Palette, Type, Sliders, GripVertical, Image as ImageIcon } from 'lucide-react';
import { CanvasLayout, CALENDAR_STYLES, CalendarStyleId } from '../types';
import { DEFAULT_LAYOUT } from '../services/canvasHelper';
import InteractiveCanvas from './InteractiveCanvas';

interface ImagePreviewProps {
  imageData: string;
  theme: string;
  onRecreate?: () => void;
  onGenerateFullYear: (styleId: CalendarStyleId, layout: CanvasLayout) => void;
}

type ActiveLayer = 'image' | 'overlay';
type Tab = 'layout' | 'style';

const FONTS = [
  { name: 'Inter (Sans)', value: 'Inter' },
  { name: 'Lora (Serif)', value: 'Lora' },
  { name: 'Mono', value: 'Roboto Mono' },
  { name: 'Cursive', value: 'Dancing Script' },
];

const COLORS = [
  '#ffffff', '#000000', '#f87171', '#fbbf24', '#4ade80', '#60a5fa', '#a78bfa', '#f472b6'
];

const ImagePreview: React.FC<ImagePreviewProps> = ({ imageData, theme, onRecreate, onGenerateFullYear }) => {
  const [layout, setLayout] = useState<CanvasLayout>(DEFAULT_LAYOUT);
  const [activeLayer, setActiveLayer] = useState<ActiveLayer>('image');
  const [selectedStyle, setSelectedStyle] = useState<CalendarStyleId>('classic');
  const [activeTab, setActiveTab] = useState<Tab>('layout');

  const updateOverlayStyle = (key: keyof CanvasLayout['overlay'], value: any) => {
    setLayout(prev => ({
      ...prev,
      overlay: {
        ...prev.overlay,
        [key]: value
      }
    }));
  };

  const updateImageStyle = (key: keyof CanvasLayout['image'], value: any) => {
    setLayout(prev => ({
      ...prev,
      image: {
        ...prev.image,
        [key]: value
      }
    }));
  };

  const isCustomMode = !onRecreate;

  return (
    <div className="w-full max-w-6xl mx-auto animate-fade-in-up flex flex-col gap-6">
      
      <div className="bg-slate-800/80 backdrop-blur-md rounded-2xl overflow-hidden border border-slate-700 shadow-2xl">
        {/* Header / Toolbar */}
        <div className="p-4 border-b border-slate-700 flex flex-col md:flex-row justify-between items-center gap-4">
          <div>
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
                {isCustomMode ? 'Customize Design' : 'Preview & Edit'}
                <span className="text-xs bg-slate-700 text-slate-300 px-2 py-1 rounded-full font-normal">Interactive</span>
            </h2>
            <p className="text-slate-400 text-sm">Drag to reposition. Customize your design.</p>
          </div>

          <div className="flex gap-2">
             <button
               onClick={() => setActiveLayer('image')}
               className={`flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-all ${
                 activeLayer === 'image' 
                 ? 'bg-blue-600 text-white shadow-lg' 
                 : 'bg-slate-700/50 text-slate-400 hover:text-white hover:bg-slate-700'
               }`}
             >
               <Move className="w-4 h-4" />
               Move Photo
             </button>
             <button
               onClick={() => setActiveLayer('overlay')}
               className={`flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-all ${
                 activeLayer === 'overlay' 
                 ? 'bg-blue-600 text-white shadow-lg' 
                 : 'bg-slate-700/50 text-slate-400 hover:text-white hover:bg-slate-700'
               }`}
             >
               <MousePointer2 className="w-4 h-4" />
               Move Calendar
             </button>
          </div>
        </div>
        
        {/* Main Content Area: Canvas + Sidebar */}
        <div className="flex flex-col lg:flex-row">
            {/* Canvas Area */}
            <div className="relative w-full lg:w-3/4 aspect-[1.414/1] bg-slate-900 border-b lg:border-b-0 lg:border-r border-slate-700">
                <InteractiveCanvas 
                    imageData={imageData}
                    theme={theme}
                    layout={layout}
                    onLayoutChange={setLayout}
                    activeLayer={activeLayer}
                    styleId={selectedStyle}
                />
                
                {/* Zoom Hint */}
                {activeLayer === 'image' && (
                <div className="absolute bottom-4 left-4 bg-black/50 text-white/70 px-3 py-1 rounded-full text-xs pointer-events-none backdrop-blur-sm border border-white/10">
                    Zoom: {(layout.image.scale * 100).toFixed(0)}%
                </div>
                )}
            </div>

            {/* Sidebar: Customization */}
            <div className="w-full lg:w-1/4 bg-slate-800/50 flex flex-col h-full min-h-[500px]">
                
                {/* Tabs */}
                <div className="flex border-b border-slate-700">
                    <button 
                        onClick={() => setActiveTab('layout')} 
                        className={`flex-1 py-3 text-sm font-semibold flex items-center justify-center gap-2 ${activeTab === 'layout' ? 'bg-slate-700/50 text-white border-b-2 border-purple-500' : 'text-slate-400 hover:text-slate-200'}`}
                    >
                        <LayoutTemplate className="w-4 h-4" /> Layouts
                    </button>
                    <button 
                        onClick={() => setActiveTab('style')} 
                        className={`flex-1 py-3 text-sm font-semibold flex items-center justify-center gap-2 ${activeTab === 'style' ? 'bg-slate-700/50 text-white border-b-2 border-purple-500' : 'text-slate-400 hover:text-slate-200'}`}
                    >
                        <Palette className="w-4 h-4" /> Style
                    </button>
                </div>

                <div className="p-6 flex-1 overflow-y-auto custom-scrollbar">
                    {activeTab === 'layout' && (
                        <div className="flex flex-col gap-3">
                             <div className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">Calendar Design</div>
                            {CALENDAR_STYLES.map((style) => (
                                <button
                                    key={style.id}
                                    onClick={() => setSelectedStyle(style.id)}
                                    className={`
                                        text-left p-3 rounded-xl border transition-all
                                        ${selectedStyle === style.id 
                                            ? 'bg-purple-600/20 border-purple-500 ring-1 ring-purple-500 shadow-md' 
                                            : 'bg-slate-700/30 border-slate-700 hover:bg-slate-700/50 hover:border-slate-600'}
                                    `}
                                >
                                    <div className="font-semibold text-white text-sm">{style.name}</div>
                                    <div className="text-xs text-slate-400 mt-1">{style.description}</div>
                                </button>
                            ))}
                        </div>
                    )}

                    {activeTab === 'style' && (
                        <div className="space-y-6">
                            
                            {/* Calendar Opacity Control */}
                            <div>
                                <h4 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-3">Overlay Style</h4>
                                <div className="flex justify-between items-center mb-2">
                                    <label className="text-xs font-bold text-slate-400 flex items-center gap-2"><GripVertical className="w-3 h-3"/> Overlay Opacity</label>
                                    <span className="text-xs text-slate-500">{(layout.overlay.opacity * 100).toFixed(0)}%</span>
                                </div>
                                <input 
                                    type="range" 
                                    min="0" max="1" step="0.05"
                                    value={layout.overlay.opacity}
                                    onChange={(e) => updateOverlayStyle('opacity', parseFloat(e.target.value))}
                                    className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-purple-500"
                                />
                            </div>

                            {/* Scale Control */}
                            <div>
                                <div className="flex justify-between items-center mb-2">
                                    <label className="text-xs font-bold text-slate-400 flex items-center gap-2"><Sliders className="w-3 h-3"/> Scale</label>
                                    <span className="text-xs text-slate-500">{(layout.overlay.scale * 100).toFixed(0)}%</span>
                                </div>
                                <input 
                                    type="range" 
                                    min="0.5" max="1.5" step="0.1"
                                    value={layout.overlay.scale}
                                    onChange={(e) => updateOverlayStyle('scale', parseFloat(e.target.value))}
                                    className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-purple-500"
                                />
                            </div>

                            <div className="h-px bg-slate-700 my-4"></div>

                            {/* Font Family */}
                            <div>
                                <label className="text-xs font-bold text-slate-400 mb-2 flex items-center gap-2"><Type className="w-3 h-3"/> Typography</label>
                                <select 
                                    value={layout.overlay.fontFamily}
                                    onChange={(e) => updateOverlayStyle('fontFamily', e.target.value)}
                                    className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2.5 text-sm text-white focus:ring-2 focus:ring-purple-500 outline-none"
                                >
                                    {FONTS.map(f => (
                                        <option key={f.value} value={f.value}>{f.name}</option>
                                    ))}
                                </select>
                            </div>

                            {/* Text Color */}
                            <div>
                                <label className="text-xs font-bold text-slate-400 mb-2 flex items-center gap-2"><Palette className="w-3 h-3"/> Text Color</label>
                                <div className="flex flex-wrap gap-2">
                                    {COLORS.map(color => (
                                        <button
                                            key={color}
                                            onClick={() => updateOverlayStyle('textColor', color)}
                                            className={`w-8 h-8 rounded-full border-2 transition-transform hover:scale-110 ${layout.overlay.textColor === color ? 'border-white ring-2 ring-purple-500' : 'border-transparent'}`}
                                            style={{ backgroundColor: color }}
                                        />
                                    ))}
                                    <input 
                                        type="color" 
                                        value={layout.overlay.textColor}
                                        onChange={(e) => updateOverlayStyle('textColor', e.target.value)}
                                        className="w-8 h-8 p-0 border-0 rounded-full overflow-hidden cursor-pointer"
                                    />
                                </div>
                            </div>

                            <div className="h-px bg-slate-700 my-4"></div>

                            {/* Background Image Opacity */}
                            <div>
                                <h4 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-3">Background</h4>
                                <div className="flex justify-between items-center mb-2">
                                    <label className="text-xs font-bold text-slate-400 flex items-center gap-2"><ImageIcon className="w-3 h-3"/> Image Opacity</label>
                                    <span className="text-xs text-slate-500">{(layout.image.opacity * 100).toFixed(0)}%</span>
                                </div>
                                <input 
                                    type="range" 
                                    min="0" max="1" step="0.05"
                                    value={layout.image.opacity}
                                    onChange={(e) => updateImageStyle('opacity', parseFloat(e.target.value))}
                                    className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-blue-500"
                                />
                            </div>
                        </div>
                    )}
                </div>

                <div className="mt-auto flex flex-col gap-3 p-6 border-t border-slate-700 bg-slate-800">
                    {onRecreate && (
                        <button
                        onClick={onRecreate}
                        className="w-full p-3 rounded-lg bg-slate-700 text-slate-200 hover:bg-slate-600 hover:text-white border border-slate-600 flex items-center justify-center gap-2 transition-colors text-sm font-medium"
                        >
                            <RefreshCcw className="w-4 h-4" />
                            Regenerate Image
                        </button>
                    )}
                    <button
                    onClick={() => onGenerateFullYear(selectedStyle, layout)}
                    className="w-full p-3 rounded-lg bg-gradient-to-r from-green-500 to-emerald-600 text-white hover:from-green-400 hover:to-emerald-500 font-bold shadow-lg flex items-center justify-center gap-2 transition-transform hover:scale-105"
                    >
                        <Layers className="w-4 h-4" />
                        {isCustomMode ? 'Download PDF' : 'Generate Full Year'}
                    </button>
                </div>
            </div>
        </div>
      </div>
    </div>
  );
};

export default ImagePreview;