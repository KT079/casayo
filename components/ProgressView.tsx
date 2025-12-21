import React from 'react';
import { Loader2 } from 'lucide-react';

interface ProgressViewProps {
  currentMonthIndex: number; // 0 to 11
  totalMonths: number;
  currentMonthName: string;
  completedImages: string[];
}

const ProgressView: React.FC<ProgressViewProps> = ({ currentMonthIndex, totalMonths, currentMonthName, completedImages }) => {
  const percentage = Math.min(((currentMonthIndex) / totalMonths) * 100, 100);

  return (
    <div className="w-full max-w-2xl mx-auto text-center py-12 px-4 animate-fade-in-up">
      <div className="mb-8">
        <div className="relative w-24 h-24 mx-auto mb-6">
           <div className="absolute inset-0 bg-blue-500 rounded-full opacity-20 animate-ping"></div>
           <div className="relative bg-slate-800 rounded-full w-24 h-24 flex items-center justify-center border border-slate-700">
             <Loader2 className="w-10 h-10 text-blue-400 animate-spin" />
           </div>
        </div>
        <h2 className="text-3xl font-bold text-white mb-2">Crafting your calendar</h2>
        <p className="text-slate-400 text-lg">
          Painting {currentMonthName}... ({currentMonthIndex + 1}/{totalMonths})
        </p>
      </div>

      {/* Progress Bar */}
      <div className="w-full bg-slate-700 rounded-full h-4 mb-8 overflow-hidden">
        <div 
          className="bg-gradient-to-r from-cyan-400 to-blue-600 h-4 rounded-full transition-all duration-500 ease-out"
          style={{ width: `${percentage}%` }}
        ></div>
      </div>

      {/* Grid of completed thumbnails */}
      <div className="grid grid-cols-4 sm:grid-cols-6 gap-2 mt-8 opacity-50">
        {completedImages.map((img, idx) => (
          <div key={idx} className="aspect-square rounded-lg overflow-hidden border border-slate-600 bg-slate-800 animate-fade-in">
            <img src={`data:image/png;base64,${img}`} alt={`Month ${idx + 1}`} className="w-full h-full object-cover" />
          </div>
        ))}
        {Array.from({ length: totalMonths - completedImages.length }).map((_, idx) => (
          <div key={`placeholder-${idx}`} className="aspect-square rounded-lg border border-slate-800 bg-slate-900/50 animate-pulse"></div>
        ))}
      </div>
    </div>
  );
};

export default ProgressView;