import React, { useState, useCallback } from 'react';
import ThemeInput from './components/ThemeInput';
import ImagePreview from './components/ImagePreview';
import ProgressView from './components/ProgressView';
import PDFReady from './components/PDFReady';
import CustomUploadView from './components/CustomUploadView';
import { generateCalendarImage, constructPrompt, enhanceTheme, generateMonthlyPrompts } from './services/gemini';
import { AppState, CalendarImage, MONTHS, CalendarStyleId, CanvasLayout } from './types';
import { AlertCircle } from 'lucide-react';
import { DEFAULT_LAYOUT } from './services/canvasHelper';

const App: React.FC = () => {
  const [state, setState] = useState<AppState>(AppState.IDLE);
  const [theme, setTheme] = useState('');
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [generatedImages, setGeneratedImages] = useState<CalendarImage[]>([]);
  const [customImages, setCustomImages] = useState<CalendarImage[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [selectedStyle, setSelectedStyle] = useState<CalendarStyleId>('classic');
  
  // Handlers
  const handleGeneratePreview = useCallback(async (selectedTheme: string) => {
    setState(AppState.GENERATING_PREVIEW);
    setTheme(selectedTheme);
    setError(null);

    try {
      const enhancedPrompt = await enhanceTheme(selectedTheme);
      const base64 = await generateCalendarImage(enhancedPrompt);
      setPreviewImage(base64);
      setState(AppState.PREVIEW_READY);
    } catch (err) {
      setError("Failed to generate preview. Please check your API key and try again.");
      setState(AppState.ERROR);
    }
  }, []);

  const handleRecreatePreview = useCallback(() => {
    if (theme) {
      handleGeneratePreview(theme);
    }
  }, [theme, handleGeneratePreview]);

  const handleGenerateFullYear = useCallback(async (styleId: CalendarStyleId, globalLayout: CanvasLayout) => {
    setState(AppState.GENERATING_FULL_YEAR);
    setGeneratedImages([]);
    setSelectedStyle(styleId);
    setError(null);

    let monthPrompts: string[] = [];
    try {
        monthPrompts = await generateMonthlyPrompts(theme);
    } catch (e) {
        monthPrompts = MONTHS.map(m => constructPrompt(theme, m));
    }

    const tempImages: CalendarImage[] = [];

    const processMonth = async (index: number) => {
      if (index >= MONTHS.length) {
        setGeneratedImages(tempImages);
        setState(AppState.PDF_READY);
        return;
      }

      const month = MONTHS[index];
      const prompt = monthPrompts[index]; 

      try {
        const base64 = await generateCalendarImage(prompt, "4:3"); 
        
        // Merge generated image with global layout styles
        // New images get default positioning (x:0, y:0, scale:1) but inherit styles & opacity
        const layout: CanvasLayout = {
             image: { 
                 ...DEFAULT_LAYOUT.image, 
                 opacity: globalLayout.image.opacity 
             },
             overlay: { ...globalLayout.overlay }
        };

        const calendarImg: CalendarImage = { month, base64, prompt, layout };
        
        tempImages.push(calendarImg);
        setGeneratedImages([...tempImages]); 
        setTimeout(() => processMonth(index + 1), 500);
      } catch (err) {
        console.error(`Failed to generate ${month}`, err);
        setError(`Stopped at ${month}. Please try again.`);
        setState(AppState.ERROR);
      }
    };

    processMonth(0);
  }, [theme]);

  const handleCustomMode = () => {
    setState(AppState.CUSTOM_SELECTION);
    setError(null);
  };

  const handleCustomPreview = (images: CalendarImage[]) => {
    setCustomImages(images);
    // Use the first image as the preview
    if (images.length > 0) {
        setPreviewImage(images[0].base64);
        setTheme('Custom Gallery');
        setState(AppState.CUSTOM_PREVIEW);
    }
  };

  const handleFinalizeCustom = (styleId: CalendarStyleId, globalLayout: CanvasLayout) => {
    // Merge global style (overlay + image opacity) into the custom images
    // Preserve custom image position (x, y, scale) set in Upload phase
    const finalImages = customImages.map(img => {
        const existingLayout = img.layout || DEFAULT_LAYOUT;
        return {
            ...img,
            layout: {
                image: {
                    ...existingLayout.image,
                    opacity: globalLayout.image.opacity
                },
                overlay: { ...globalLayout.overlay }
            }
        };
    });

    setGeneratedImages(finalImages);
    setSelectedStyle(styleId);
    setState(AppState.PDF_READY);
  };

  const handleReset = () => {
    setState(AppState.IDLE);
    setTheme('');
    setPreviewImage(null);
    setGeneratedImages([]);
    setCustomImages([]);
    setError(null);
  };

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 selection:bg-purple-500 selection:text-white">
      <div className="fixed inset-0 z-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-purple-600/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-blue-600/20 rounded-full blur-3xl animate-pulse delay-1000"></div>
      </div>

      <div className="relative z-10 container mx-auto px-4 py-8 md:py-16">
        
        {(state === AppState.IDLE || state === AppState.PREVIEW_READY || state === AppState.CUSTOM_SELECTION || state === AppState.CUSTOM_PREVIEW) && (
            <div className="flex items-center justify-between mb-8 opacity-50 hover:opacity-100 transition-opacity">
               <div className="text-xs font-bold tracking-widest uppercase text-slate-500">Google Gemini Powered</div>
            </div>
        )}

        {state === AppState.ERROR && (
          <div className="max-w-2xl mx-auto mb-8 p-4 bg-red-500/10 border border-red-500/50 rounded-lg flex items-center gap-3 text-red-200 animate-fade-in-up">
            <AlertCircle className="w-5 h-5 flex-shrink-0" />
            <p>{error || "An unexpected error occurred."}</p>
            <button onClick={handleReset} className="ml-auto text-sm underline hover:text-white">Try Again</button>
          </div>
        )}

        <main className="relative">
          {(state === AppState.IDLE || state === AppState.GENERATING_PREVIEW) && (
             <ThemeInput 
                onGenerate={handleGeneratePreview} 
                onCustomMode={handleCustomMode}
                isGenerating={state === AppState.GENERATING_PREVIEW} 
             />
          )}

          {state === AppState.CUSTOM_SELECTION && (
            <CustomUploadView 
              onBack={handleReset}
              onPreview={handleCustomPreview}
            />
          )}

          {state === AppState.CUSTOM_PREVIEW && previewImage && (
             <ImagePreview 
                imageData={previewImage}
                theme="Custom Calendar"
                onGenerateFullYear={handleFinalizeCustom}
             />
          )}

          {state === AppState.PREVIEW_READY && previewImage && (
            <ImagePreview 
              imageData={previewImage} 
              theme={theme}
              onRecreate={handleRecreatePreview}
              onGenerateFullYear={handleGenerateFullYear}
            />
          )}

          {state === AppState.GENERATING_FULL_YEAR && (
            <ProgressView 
              currentMonthIndex={generatedImages.length} 
              totalMonths={12} 
              currentMonthName={MONTHS[generatedImages.length] || 'Finishing...'}
              completedImages={generatedImages.map(i => i.base64)}
            />
          )}

          {state === AppState.PDF_READY && (
            <PDFReady 
              images={generatedImages} 
              theme={theme} 
              onReset={handleReset} 
              styleId={selectedStyle}
            />
          )}
        </main>
      </div>
    </div>
  );
};

export default App;