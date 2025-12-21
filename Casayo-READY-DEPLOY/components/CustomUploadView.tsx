import React, { useState, useRef } from 'react';
import { Upload, ArrowLeft, ArrowRight, Trash2, Plus, Info } from 'lucide-react';
import { MONTHS, CalendarImage, CanvasLayout, CalendarStyleId } from '../types';
import MonthSelector from './MonthSelector';

interface CustomUploadViewProps {
  onBack: () => void;
  onPreview: (images: CalendarImage[]) => void;
}

interface ImageInput {
  base64: string;
  layout: CanvasLayout;
}

const CustomUploadView: React.FC<CustomUploadViewProps> = ({ onBack, onPreview }) => {
  const [monthImages, setMonthImages] = useState<(ImageInput | null)[]>(Array(12).fill(null));
  const [pendingImage, setPendingImage] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = () => {
      setPendingImage(reader.result as string);
      setIsModalOpen(true);
      if (fileInputRef.current) fileInputRef.current.value = '';
    };
    reader.readAsDataURL(file);
  };

  const handleModalConfirm = (selectedIndices: number[], layout: CanvasLayout) => {
    if (!pendingImage) return;
    setMonthImages(prev => {
      const newImages = [...prev];
      selectedIndices.forEach(idx => {
        newImages[idx] = { base64: pendingImage, layout };
      });
      return newImages;
    });
    setIsModalOpen(false);
    setPendingImage(null);
  };

  const handleProceed = () => {
    if (!monthImages.every(img => img !== null)) return;
    
    const finalImages: CalendarImage[] = monthImages.map((img, idx) => ({
        month: MONTHS[idx],
        base64: img!.base64.includes('base64,') ? img!.base64.split('base64,')[1] : img!.base64, 
        prompt: "Custom User Upload",
        layout: img!.layout
    }));
    onPreview(finalImages);
  };

  const filledCount = monthImages.filter(img => img !== null).length;

  return (
    <div className="w-full max-w-6xl mx-auto animate-fade-in-up pb-20">
      <input type="file" ref={fileInputRef} onChange={handleFileChange} accept="image/*" className="hidden" />

      {isModalOpen && pendingImage && (
        <MonthSelector 
          imageBase64={pendingImage}
          onConfirm={handleModalConfirm}
          onCancel={() => { setIsModalOpen(false); setPendingImage(null); }}
          styleId={'classic'} // Use a basic grid for alignment reference
        />
      )}

      {/* Header & Controls */}
      <div className="flex flex-col md:flex-row items-center justify-between mb-8 gap-4">
        <button onClick={onBack} className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors self-start">
          <ArrowLeft className="w-5 h-5" /> Back
        </button>
        <div className="text-right">
          <h1 className="text-3xl font-bold text-white">Upload Photos</h1>
          <p className="text-slate-400">Fill all 12 months to customize your design.</p>
        </div>
      </div>

      <div className="bg-slate-800/50 border border-slate-700 rounded-2xl p-6 flex flex-col md:flex-row items-center justify-between gap-6 mb-8">
        <div className="flex items-start gap-4">
            <div className="mt-1 p-2 bg-blue-500/20 rounded-lg">
                <Info className="w-5 h-5 text-blue-400" />
            </div>
            <div>
                <h2 className="text-xl font-bold text-white mb-1">
                    {filledCount === 12 ? "Perfect! Now customize." : `${filledCount} of 12 Months Filled`}
                </h2>
                <p className="text-slate-400 text-sm">
                    Don't worry about colors or fonts yet. You can adjust all design styles and image opacity in the next step.
                </p>
            </div>
        </div>
        <div className="flex gap-4 w-full md:w-auto">
            <button 
                onClick={() => fileInputRef.current?.click()} 
                className="flex-1 md:flex-none flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-slate-700 hover:bg-slate-600 text-white font-bold transition-all border border-slate-600"
            >
                <Upload className="w-5 h-5" /> Add Photos
            </button>
            <button 
                onClick={handleProceed} 
                disabled={filledCount !== 12} 
                className={`flex-1 md:flex-none flex items-center justify-center gap-2 px-6 py-3 rounded-xl font-bold transition-all ${filledCount === 12 ? 'bg-gradient-to-r from-blue-500 to-indigo-600 text-white shadow-lg hover:scale-105' : 'bg-slate-800 text-slate-600 cursor-not-allowed border border-slate-700'}`}
            >
                Customize Design <ArrowRight className="w-5 h-5" />
            </button>
        </div>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {MONTHS.map((month, index) => {
          const imageObj = monthImages[index];
          return (
            <div key={month} className={`relative group aspect-[1.414/1] rounded-xl border-2 transition-all overflow-hidden ${imageObj ? 'border-slate-600 bg-slate-900' : 'border-slate-700/50 bg-slate-800/30 border-dashed hover:border-slate-500 hover:bg-slate-800/50'}`}>
              <div className="absolute top-0 left-0 right-0 p-3 flex justify-between items-start z-10 bg-gradient-to-b from-black/60 to-transparent">
                <span className="font-bold text-white shadow-black drop-shadow-md text-sm">{month}</span>
                {imageObj && (
                  <button onClick={(e) => { e.stopPropagation(); setMonthImages(prev => { const n = [...prev]; n[index] = null; return n; }); }} className="p-1.5 bg-red-500/80 rounded-md text-white opacity-0 group-hover:opacity-100 hover:bg-red-500 transition-all shadow-lg">
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
              {imageObj ? (
                <img src={imageObj.base64} alt={month} className="w-full h-full object-cover" />
              ) : (
                <button onClick={() => fileInputRef.current?.click()} className="absolute inset-0 flex flex-col items-center justify-center text-slate-500 hover:text-slate-300 transition-colors">
                  <Plus className="w-8 h-8 mb-2" /> <span className="text-xs font-medium uppercase tracking-widest">Assign</span>
                </button>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};export default CustomUploadView;