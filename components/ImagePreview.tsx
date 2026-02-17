import React, { useState } from 'react';
import {
  RefreshCcw,
  Layers,
  Move,
  MousePointer2,
  LayoutTemplate,
  Palette,
  Type,
  Sliders,
  Image as ImageIcon,
  Scissors,
  WandSparkles,
  RotateCw,
  Eraser
} from 'lucide-react';
import { CanvasLayout, CALENDAR_STYLES, CalendarStyleId } from '../types';
import { DEFAULT_LAYOUT } from '../services/canvasHelper';
import { createAutoCutout } from '../services/cutout';
import { reimagineCutout } from '../services/gemini';
import InteractiveCanvas from './InteractiveCanvas';

interface ImagePreviewProps {
  imageData: string;
  theme: string;
  onRecreate?: () => void;
  onGenerateFullYear: (styleId: CalendarStyleId, layout: CanvasLayout) => void;
}

type ActiveLayer = 'image' | 'overlay' | 'cutout';
type Tab = 'layout' | 'style';

const FONTS = [
  { name: 'Inter (Sans)', value: 'Inter' },
  { name: 'Lora (Serif)', value: 'Lora' },
  { name: 'Mono', value: 'Roboto Mono' },
  { name: 'Cursive', value: 'Dancing Script' }
];

const COLORS = ['#ffffff', '#000000', '#f87171', '#fbbf24', '#4ade80', '#60a5fa', '#a78bfa', '#f472b6'];

const ImagePreview: React.FC<ImagePreviewProps> = ({ imageData, theme, onRecreate, onGenerateFullYear }) => {
  const [layout, setLayout] = useState<CanvasLayout>(DEFAULT_LAYOUT);
  const [activeLayer, setActiveLayer] = useState<ActiveLayer>('image');
  const [selectedStyle, setSelectedStyle] = useState<CalendarStyleId>('classic');
  const [activeTab, setActiveTab] = useState<Tab>('layout');
  const [cutoutPrompt, setCutoutPrompt] = useState('');
  const [isCutoutLoading, setIsCutoutLoading] = useState(false);
  const [cutoutError, setCutoutError] = useState<string | null>(null);

  const updateOverlayStyle = (key: keyof CanvasLayout['overlay'], value: any) => {
    setLayout(prev => ({ ...prev, overlay: { ...prev.overlay, [key]: value } }));
  };

  const updateImageStyle = (key: keyof CanvasLayout['image'], value: any) => {
    setLayout(prev => ({ ...prev, image: { ...prev.image, [key]: value } }));
  };

  const updateCutoutStyle = (key: keyof CanvasLayout['cutout'], value: any) => {
    setLayout(prev => ({ ...prev, cutout: { ...prev.cutout, [key]: value } }));
  };

  const handleAutoCutout = async () => {
    setIsCutoutLoading(true);
    setCutoutError(null);
    try {
      const cutout = await createAutoCutout(imageData);
      setLayout(prev => ({ ...prev, cutout: { ...prev.cutout, enabled: true, data: cutout, scale: 1, x: 0, y: 0 } }));
      setActiveLayer('cutout');
    } catch (e) {
      console.error(e);
      setCutoutError('Auto cutout failed for this image. Try another image or lower complexity background.');
    } finally {
      setIsCutoutLoading(false);
    }
  };

  const handleReimagineCutout = async () => {
    if (!layout.cutout.data) return;
    setIsCutoutLoading(true);
    setCutoutError(null);
    try {
      const generated = await reimagineCutout(layout.cutout.data, cutoutPrompt);
      setLayout(prev => ({ ...prev, cutout: { ...prev.cutout, enabled: true, data: generated } }));
    } catch (e) {
      console.error(e);
      setCutoutError('AI reimagine failed. Please check API key / quota and try again.');
    } finally {
      setIsCutoutLoading(false);
    }
  };

  const isCustomMode = !onRecreate;

  return (
    <div className="w-full max-w-6xl mx-auto animate-fade-in-up flex flex-col gap-6">
      <div className="bg-slate-800/80 backdrop-blur-md rounded-2xl overflow-hidden border border-slate-700 shadow-2xl">
        <div className="p-4 border-b border-slate-700 flex flex-col md:flex-row justify-between items-center gap-4">
          <div>
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              {isCustomMode ? 'Customize Design' : 'Preview & Edit'}
              <span className="text-xs bg-slate-700 text-slate-300 px-2 py-1 rounded-full font-normal">Interactive</span>
            </h2>
            <p className="text-slate-400 text-sm">Drag to reposition. Now supports editable object cutouts.</p>
          </div>

          <div className="flex gap-2 flex-wrap justify-end">
            <button onClick={() => setActiveLayer('image')} className={`flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-all ${activeLayer === 'image' ? 'bg-blue-600 text-white shadow-lg' : 'bg-slate-700/50 text-slate-400 hover:text-white hover:bg-slate-700'}`}>
              <Move className="w-4 h-4" /> Move Photo
            </button>
            <button onClick={() => setActiveLayer('overlay')} className={`flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-all ${activeLayer === 'overlay' ? 'bg-blue-600 text-white shadow-lg' : 'bg-slate-700/50 text-slate-400 hover:text-white hover:bg-slate-700'}`}>
              <MousePointer2 className="w-4 h-4" /> Move Calendar
            </button>
            <button
              onClick={() => setActiveLayer('cutout')}
              disabled={!layout.cutout.enabled}
              className={`flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-all ${activeLayer === 'cutout' ? 'bg-blue-600 text-white shadow-lg' : 'bg-slate-700/50 text-slate-400 hover:text-white hover:bg-slate-700'} ${!layout.cutout.enabled ? 'opacity-40 cursor-not-allowed' : ''}`}
            >
              <Scissors className="w-4 h-4" /> Move Cutout
            </button>
          </div>
        </div>

        <div className="flex flex-col lg:flex-row">
          <div className="relative w-full lg:w-3/4 aspect-[1.414/1] bg-slate-900 border-b lg:border-b-0 lg:border-r border-slate-700">
            <InteractiveCanvas imageData={imageData} theme={theme} layout={layout} onLayoutChange={setLayout} activeLayer={activeLayer} styleId={selectedStyle} />
            {activeLayer === 'image' && <div className="absolute bottom-4 left-4 bg-black/50 text-white/70 px-3 py-1 rounded-full text-xs">Photo Zoom: {(layout.image.scale * 100).toFixed(0)}%</div>}
            {activeLayer === 'cutout' && layout.cutout.enabled && (
              <div className="absolute bottom-4 left-4 bg-black/50 text-white/70 px-3 py-1 rounded-full text-xs">Cutout Zoom: {(layout.cutout.scale * 100).toFixed(0)}%</div>
            )}
          </div>

          <div className="w-full lg:w-1/4 bg-slate-800/50 flex flex-col h-full min-h-[500px]">
            <div className="flex border-b border-slate-700">
              <button onClick={() => setActiveTab('layout')} className={`flex-1 py-3 text-sm font-semibold flex items-center justify-center gap-2 ${activeTab === 'layout' ? 'bg-slate-700/50 text-white border-b-2 border-purple-500' : 'text-slate-400 hover:text-slate-200'}`}>
                <LayoutTemplate className="w-4 h-4" /> Layouts
              </button>
              <button onClick={() => setActiveTab('style')} className={`flex-1 py-3 text-sm font-semibold flex items-center justify-center gap-2 ${activeTab === 'style' ? 'bg-slate-700/50 text-white border-b-2 border-purple-500' : 'text-slate-400 hover:text-slate-200'}`}>
                <Palette className="w-4 h-4" /> Style
              </button>
            </div>

            <div className="p-6 flex-1 overflow-y-auto custom-scrollbar space-y-4">
              {activeTab === 'layout' && (
                <>
                  <h4 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">Layout Presets</h4>
                  <div className="grid grid-cols-1 gap-2">
                    {CALENDAR_STYLES.map(style => (
                      <button key={style.id} onClick={() => setSelectedStyle(style.id)} className={`text-left p-3 rounded-lg border transition-all ${selectedStyle === style.id ? 'bg-purple-600/20 border-purple-500 text-white' : 'bg-slate-800 border-slate-700 text-slate-300 hover:bg-slate-700/50'}`}>
                        <div className="font-semibold text-sm">{style.name}</div>
                        <div className="text-xs text-slate-400 mt-1">{style.description}</div>
                      </button>
                    ))}
                  </div>
                </>
              )}

              {activeTab === 'style' && (
                <>
                  <div>
                    <h4 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-3">Cutout Studio</h4>
                    <div className="space-y-2">
                      <button onClick={handleAutoCutout} disabled={isCutoutLoading} className="w-full p-2.5 rounded-lg bg-slate-700 hover:bg-slate-600 text-sm text-white flex items-center justify-center gap-2 disabled:opacity-50">
                        <Scissors className="w-4 h-4" /> {isCutoutLoading ? 'Processing…' : 'Auto Cutout Subject'}
                      </button>

                      <textarea value={cutoutPrompt} onChange={e => setCutoutPrompt(e.target.value)} rows={3} placeholder="Reimagine prompt (optional): cyberpunk armor, watercolor style, festive costume..." className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-xs text-white" />

                      <button onClick={handleReimagineCutout} disabled={!layout.cutout.data || isCutoutLoading} className="w-full p-2.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-sm text-white flex items-center justify-center gap-2 disabled:opacity-50">
                        <WandSparkles className="w-4 h-4" /> Reimagine Cutout
                      </button>

                      <button onClick={() => updateCutoutStyle('enabled', !layout.cutout.enabled)} disabled={!layout.cutout.data} className="w-full p-2 rounded-lg bg-slate-900 border border-slate-700 text-xs text-slate-200 disabled:opacity-40">
                        {layout.cutout.enabled ? 'Hide Cutout' : 'Show Cutout'}
                      </button>
                      <button onClick={() => setLayout(prev => ({ ...prev, cutout: { ...DEFAULT_LAYOUT.cutout } }))} className="w-full p-2 rounded-lg bg-slate-900 border border-slate-700 text-xs text-slate-200 flex items-center justify-center gap-2">
                        <Eraser className="w-3 h-3" /> Clear Cutout
                      </button>

                      {cutoutError && <p className="text-xs text-red-300">{cutoutError}</p>}
                    </div>
                  </div>

                  {layout.cutout.enabled && (
                    <div className="space-y-3 border-t border-slate-700 pt-4">
                      <div>
                        <div className="flex justify-between text-xs text-slate-400 mb-1"><span>Cutout Scale</span><span>{(layout.cutout.scale * 100).toFixed(0)}%</span></div>
                        <input type="range" min="0.2" max="3" step="0.05" value={layout.cutout.scale} onChange={e => updateCutoutStyle('scale', parseFloat(e.target.value))} className="w-full" />
                      </div>
                      <div>
                        <div className="flex justify-between text-xs text-slate-400 mb-1"><span className="flex items-center gap-1"><RotateCw className="w-3 h-3" /> Rotation</span><span>{layout.cutout.rotation.toFixed(0)}°</span></div>
                        <input type="range" min="-180" max="180" step="1" value={layout.cutout.rotation} onChange={e => updateCutoutStyle('rotation', parseFloat(e.target.value))} className="w-full" />
                      </div>
                      <div>
                        <div className="flex justify-between text-xs text-slate-400 mb-1"><span>Cutout Opacity</span><span>{(layout.cutout.opacity * 100).toFixed(0)}%</span></div>
                        <input type="range" min="0.1" max="1" step="0.05" value={layout.cutout.opacity} onChange={e => updateCutoutStyle('opacity', parseFloat(e.target.value))} className="w-full" />
                      </div>
                    </div>
                  )}

                  <div className="h-px bg-slate-700 my-4"></div>

                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <label className="text-xs font-bold text-slate-400 flex items-center gap-2"><Sliders className="w-3 h-3" /> Calendar Opacity</label>
                      <span className="text-xs text-slate-500">{(layout.overlay.opacity * 100).toFixed(0)}%</span>
                    </div>
                    <input type="range" min="0" max="1" step="0.05" value={layout.overlay.opacity} onChange={e => updateOverlayStyle('opacity', parseFloat(e.target.value))} className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-purple-500" />
                  </div>

                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <label className="text-xs font-bold text-slate-400 flex items-center gap-2"><Sliders className="w-3 h-3" /> Calendar Scale</label>
                      <span className="text-xs text-slate-500">{(layout.overlay.scale * 100).toFixed(0)}%</span>
                    </div>
                    <input type="range" min="0.5" max="1.5" step="0.1" value={layout.overlay.scale} onChange={e => updateOverlayStyle('scale', parseFloat(e.target.value))} className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-purple-500" />
                  </div>

                  <div>
                    <label className="text-xs font-bold text-slate-400 mb-2 flex items-center gap-2"><Type className="w-3 h-3" /> Typography</label>
                    <select value={layout.overlay.fontFamily} onChange={e => updateOverlayStyle('fontFamily', e.target.value)} className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2.5 text-sm text-white">
                      {FONTS.map(f => (
                        <option key={f.value} value={f.value}>{f.name}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="text-xs font-bold text-slate-400 mb-2 flex items-center gap-2"><Palette className="w-3 h-3" /> Text Color</label>
                    <div className="flex flex-wrap gap-2">
                      {COLORS.map(color => (
                        <button key={color} onClick={() => updateOverlayStyle('textColor', color)} className={`w-8 h-8 rounded-full border-2 ${layout.overlay.textColor === color ? 'border-white ring-2 ring-purple-500' : 'border-transparent'}`} style={{ backgroundColor: color }} />
                      ))}
                      <input type="color" value={layout.overlay.textColor} onChange={e => updateOverlayStyle('textColor', e.target.value)} className="w-8 h-8 p-0 border-0 rounded-full" />
                    </div>
                  </div>

                  <div>
                    <h4 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-3">Background</h4>
                    <div className="flex justify-between items-center mb-2">
                      <label className="text-xs font-bold text-slate-400 flex items-center gap-2"><ImageIcon className="w-3 h-3" /> Image Opacity</label>
                      <span className="text-xs text-slate-500">{(layout.image.opacity * 100).toFixed(0)}%</span>
                    </div>
                    <input type="range" min="0" max="1" step="0.05" value={layout.image.opacity} onChange={e => updateImageStyle('opacity', parseFloat(e.target.value))} className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-blue-500" />
                  </div>
                </>
              )}
            </div>

            <div className="mt-auto flex flex-col gap-3 p-6 border-t border-slate-700 bg-slate-800">
              {onRecreate && (
                <button onClick={onRecreate} className="w-full p-3 rounded-lg bg-slate-700 text-slate-200 hover:bg-slate-600 hover:text-white border border-slate-600 flex items-center justify-center gap-2 transition-colors text-sm font-medium">
                  <RefreshCcw className="w-4 h-4" /> Regenerate Image
                </button>
              )}
              <button onClick={() => onGenerateFullYear(selectedStyle, layout)} className="w-full p-3 rounded-lg bg-gradient-to-r from-green-500 to-emerald-600 text-white font-bold shadow-lg flex items-center justify-center gap-2 transition-transform hover:scale-105">
                <Layers className="w-4 h-4" /> {isCustomMode ? 'Download PDF' : 'Generate Full Year'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ImagePreview;
