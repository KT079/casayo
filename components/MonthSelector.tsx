import React, { useState } from 'react';
import { MONTHS, CanvasLayout, CalendarStyleId } from '../types';
import { DEFAULT_LAYOUT } from '../services/canvasHelper';
import { Check, Calendar } from 'lucide-react';
import InteractiveCanvas from './InteractiveCanvas';

interface MonthSelectorProps {
  imageBase64: string;
  onConfirm: (selectedIndices: number[], layout: CanvasLayout) => void;
  onCancel: () => void;
  styleId?: CalendarStyleId;
}

const MonthSelector: React.FC<MonthSelectorProps> = ({ imageBase64, onConfirm, onCancel, styleId = 'classic' }) => {
  const [isAllMonths, setIsAllMonths] = useState(false);
  const [selectedIndices, setSelectedIndices] = useState<number[]>([]);
  const [layout, setLayout] = useState<CanvasLayout>(DEFAULT_LAYOUT);

  const toggleMonth = (index: number) => {
    if (isAllMonths) return;
    setSelectedIndices(prev => 
      prev.includes(index) ? prev.filter(i => i !== index) : [...prev, index]
    );
  };

  const handleConfirm = () => {
    if (isAllMonths) {
      onConfirm(Array.from({ length: 12 }, (_, i) => i), layout);
    } else {
      onConfirm(selectedIndices, layout);
    }
  };

  const isValid = isAllMonths || selectedIndices.length > 0;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/90 backdrop-blur-sm animate-fade-in-up">
      <div className="bg-slate-800 rounded-2xl w-full max-w-5xl max-h-[90vh] flex flex-col md:flex-row overflow-hidden border border-slate-700 shadow-2xl">
        {/* Preview Area */}
        <div className="w-full md:w-1/2 bg-slate-900 flex flex-col border-b md:border-b-0 md:border-r border-slate-700">
          <div className="p-4 bg-slate-900/50 border-b border-slate-700">
             <h3 className="text-white font-semibold">Position Photo</h3>
             <p className="text-xs text-slate-400">Drag to adjust. This uses your selected layout.</p>
          </div>
          <div className="relative w-full aspect-[1.414/1] bg-slate-950 overflow-hidden">
             <InteractiveCanvas 
                imageData={imageBase64}
                theme="Custom Photo"
                month="PREVIEW" 
                layout={layout}
                onLayoutChange={setLayout}
                activeLayer="image"
                styleId={styleId} 
             />
          </div>
        </div>

        {/* Selection Area */}
        <div className="w-full md:w-1/2 p-6 flex flex-col">
          <div className="mb-6">
            <h2 className="text-2xl font-bold text-white mb-2">Assign to Months</h2>
            <p className="text-slate-400">Which months should use this photo?</p>
          </div>

          <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar max-h-[40vh]">
            <div 
              onClick={() => { setIsAllMonths(!isAllMonths); if(!isAllMonths) setSelectedIndices([]); }}
              className={`flex items-center p-4 rounded-xl border cursor-pointer transition-all mb-6 ${isAllMonths ? 'bg-blue-600/20 border-blue-500 ring-1 ring-blue-500' : 'bg-slate-700/30 border-slate-700 hover:bg-slate-700/50'}`}
            >
              <div className={`w-6 h-6 rounded-full border flex items-center justify-center mr-4 transition-colors ${isAllMonths ? 'bg-blue-500 border-blue-500' : 'border-slate-500'}`}>
                {isAllMonths && <Check className="w-4 h-4 text-white" />}
              </div>
              <div>
                <h4 className="font-bold text-white text-lg">All Months</h4>
              </div>
            </div>

            <div className={`transition-opacity duration-300 ${isAllMonths ? 'opacity-40 pointer-events-none' : 'opacity-100'}`}>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {MONTHS.map((month, index) => {
                  const isSelected = selectedIndices.includes(index);
                  return (
                    <button
                      key={month}
                      onClick={() => toggleMonth(index)}
                      className={`py-3 px-4 rounded-lg text-sm font-medium border transition-all flex items-center justify-between ${isSelected ? 'bg-purple-600/20 border-purple-500 text-purple-200' : 'bg-slate-700/30 border-slate-700 text-slate-400 hover:bg-slate-700'}`}
                    >
                      {month}
                      {isSelected && <Check className="w-4 h-4 text-purple-400" />}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          <div className="mt-8 pt-6 border-t border-slate-700 flex justify-end gap-3">
            <button onClick={onCancel} className="px-6 py-2.5 rounded-lg text-slate-300 hover:text-white hover:bg-slate-700 transition-colors font-medium">Cancel</button>
            <button onClick={handleConfirm} disabled={!isValid} className={`px-8 py-2.5 rounded-lg text-white font-bold shadow-lg transition-all ${isValid ? 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:scale-105' : 'bg-slate-700 opacity-50 cursor-not-allowed'}`}>Confirm</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MonthSelector;