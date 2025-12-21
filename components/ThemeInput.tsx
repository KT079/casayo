import React, { useState } from 'react';
import { Sparkles, ArrowRight, Upload } from 'lucide-react';

interface ThemeInputProps {
  onGenerate: (theme: string) => void;
  onCustomMode: () => void;
  isGenerating: boolean;
}

const ThemeInput: React.FC<ThemeInputProps> = ({ onGenerate, onCustomMode, isGenerating }) => {
  const [theme, setTheme] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (theme.trim()) {
      onGenerate(theme);
    }
  };

  return (
    <div className="w-full max-w-2xl mx-auto p-8 bg-slate-800/50 backdrop-blur-lg rounded-2xl border border-slate-700 shadow-2xl animate-fade-in-up">
      <div className="text-center mb-8">
        <h1 className="text-4xl md:text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-600 mb-4">
          ThemeCalendar AI
        </h1>
        <p className="text-slate-400 text-lg">
          Transform your imagination into a personalized year-long journey.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="relative group mb-8">
        <div className="absolute -inset-0.5 bg-gradient-to-r from-pink-600 to-purple-600 rounded-lg blur opacity-75 group-hover:opacity-100 transition duration-1000 group-hover:duration-200"></div>
        <div className="relative flex items-center bg-slate-900 rounded-lg p-2">
          <Sparkles className="w-6 h-6 text-purple-400 ml-3" />
          <input
            type="text"
            value={theme}
            onChange={(e) => setTheme(e.target.value)}
            placeholder="Enter a theme (e.g., 'Cyberpunk Tokyo')..."
            className="w-full bg-transparent text-white p-4 text-lg focus:outline-none placeholder-slate-500"
            disabled={isGenerating}
          />
          <button
            type="submit"
            disabled={!theme.trim() || isGenerating}
            className={`
              ml-2 px-6 py-3 rounded-md font-semibold text-white flex items-center gap-2 transition-all
              ${!theme.trim() || isGenerating 
                ? 'bg-slate-700 cursor-not-allowed opacity-50' 
                : 'bg-gradient-to-r from-indigo-500 to-purple-600 hover:scale-105 shadow-lg'}
            `}
          >
            {isGenerating ? 'Dreaming...' : 'Generate'}
            {!isGenerating && <ArrowRight className="w-5 h-5" />}
          </button>
        </div>
      </form>
      
      <div className="relative flex items-center justify-center mb-8">
         <div className="h-px bg-slate-700 w-full absolute"></div>
         <span className="bg-slate-900 px-4 text-slate-500 text-sm relative z-10 uppercase tracking-widest">OR</span>
      </div>

      <button
        onClick={onCustomMode}
        disabled={isGenerating}
        className="w-full py-4 rounded-xl border-2 border-dashed border-slate-600 bg-slate-800/50 text-slate-300 hover:bg-slate-800 hover:border-slate-500 hover:text-white transition-all flex items-center justify-center gap-3 font-semibold group"
      >
        <div className="p-2 bg-slate-700 rounded-full group-hover:bg-blue-600 transition-colors">
            <Upload className="w-5 h-5" />
        </div>
        Upload Your Own Photos
      </button>

      {/* Suggested Themes */}
      <div className="mt-8">
        <p className="text-slate-500 text-sm mb-3 text-center">Try these themes:</p>
        <div className="flex flex-wrap justify-center gap-3">
          {['Space Exploration', 'Studio Ghibli Forest', 'Minimalist Architecture', 'Retro 80s Synthwave'].map((t) => (
            <button
              key={t}
              onClick={() => setTheme(t)}
              className="px-4 py-2 bg-slate-800 border border-slate-700 rounded-full text-slate-300 text-sm hover:bg-slate-700 hover:text-white transition-colors"
            >
              {t}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ThemeInput;
