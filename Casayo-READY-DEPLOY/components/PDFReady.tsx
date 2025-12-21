import React from 'react';
import { Download, CheckCircle, RefreshCw } from 'lucide-react';
import { CalendarImage, CalendarStyleId } from '../types';
import { generateCalendarPDF } from '../services/pdfGenerator';
import CalendarThumbnail from './CalendarThumbnail';

interface PDFReadyProps {
  images: CalendarImage[];
  theme: string;
  onReset: () => void;
  styleId?: CalendarStyleId;
}

const PDFReady: React.FC<PDFReadyProps> = ({ images, theme, onReset, styleId = 'classic' }) => {
  
  const handleDownload = () => {
    generateCalendarPDF(images, theme, styleId as CalendarStyleId);
  };

  return (
    <div className="w-full max-w-2xl mx-auto text-center py-12 px-4 animate-fade-in-up">
      <div className="flex justify-center mb-6">
        <div className="w-20 h-20 bg-green-500/10 rounded-full flex items-center justify-center border border-green-500/20">
            <CheckCircle className="w-10 h-10 text-green-500" />
        </div>
      </div>
      
      <h2 className="text-4xl font-bold text-white mb-4">Your Calendar is Ready!</h2>
      <p className="text-slate-400 text-lg mb-8 max-w-md mx-auto">
        We've generated 12 unique illustrations based on "<strong>{theme}</strong>". You can now download your high-quality PDF.
      </p>

      <div className="flex flex-col sm:flex-row gap-4 justify-center">
        <button
          onClick={handleDownload}
          className="flex items-center justify-center gap-3 px-8 py-4 rounded-xl bg-gradient-to-r from-green-500 to-emerald-600 text-white font-bold text-lg hover:scale-105 transition-transform shadow-lg shadow-green-900/30"
        >
          <Download className="w-6 h-6" />
          Download PDF
        </button>

        <button
          onClick={onReset}
          className="flex items-center justify-center gap-3 px-8 py-4 rounded-xl bg-slate-800 text-slate-300 font-semibold text-lg hover:bg-slate-700 hover:text-white transition-colors border border-slate-700"
        >
          <RefreshCw className="w-5 h-5" />
          Create New
        </button>
      </div>

      {/* Preview Grid */}
      <div className="mt-12">
        <p className="text-slate-500 text-sm mb-4">Includes these generated months:</p>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {images.slice(0, 4).map((img, i) => (
                <div key={i} className="group relative aspect-[4/3] rounded-lg overflow-hidden shadow-lg border border-slate-700 bg-slate-800">
                    <CalendarThumbnail image={img} theme={theme} />
                </div>
            ))}
            <div className="col-span-2 md:col-span-4 flex items-center justify-center py-4 bg-slate-800/30 rounded-lg border border-slate-800 border-dashed text-slate-500 text-sm">
                + 8 more months
            </div>
        </div>
      </div>
    </div>
  );
};

export default PDFReady;