import React, { useState, useEffect, useCallback } from 'react';
import { GeneratedImage, JobStatus, GenerationConfig } from './types';
import ImageUploader from './components/ImageUploader';
import GenerationGrid from './components/GenerationGrid';
import { generateImageVariation } from './services/geminiService';
import { Layers, Zap, Clapperboard } from 'lucide-react';

const App: React.FC = () => {
  const [items, setItems] = useState<GeneratedImage[]>([]);
  const [isProcessingQueue, setIsProcessingQueue] = useState(false);
  const [config, setConfig] = useState<GenerationConfig>({ aspectRatio: "1:1" });

  // Generate a reasonable filename
  const generateFileName = (originalName: string) => {
    const nameWithoutExt = originalName.substring(0, originalName.lastIndexOf('.')) || originalName;
    const timestamp = new Date().getTime().toString().slice(-6);
    return `${nameWithoutExt}-尾帧-${timestamp}.png`;
  };

  const handleUpload = (files: File[]) => {
    const newItems: GeneratedImage[] = files.map(file => ({
      id: Math.random().toString(36).substr(2, 9),
      originalFile: file,
      originalPreviewUrl: URL.createObjectURL(file),
      status: JobStatus.PENDING,
      suggestedFileName: generateFileName(file.name)
    }));

    setItems(prev => [...newItems, ...prev]);
  };

  // Queue Processing Effect
  // We process one by one to avoid rate limits and keep UX smooth
  useEffect(() => {
    const processNext = async () => {
      if (isProcessingQueue) return;

      const nextItemIndex = items.findIndex(item => item.status === JobStatus.PENDING);
      
      if (nextItemIndex === -1) {
        setIsProcessingQueue(false);
        return;
      }

      setIsProcessingQueue(true);
      const itemToProcess = items[nextItemIndex];

      // Update status to PROCESSING
      setItems(prev => prev.map((item, idx) => 
        idx === nextItemIndex ? { ...item, status: JobStatus.PROCESSING } : item
      ));

      try {
        const generatedBase64 = await generateImageVariation(
            itemToProcess.originalFile, 
            config
        );

        setItems(prev => prev.map((item, idx) => 
          idx === nextItemIndex ? { 
            ...item, 
            status: JobStatus.COMPLETED, 
            generatedImageUrl: generatedBase64 
          } : item
        ));
      } catch (error: any) {
        setItems(prev => prev.map((item, idx) => 
          idx === nextItemIndex ? { 
            ...item, 
            status: JobStatus.FAILED, 
            error: error.message || "生成失败" 
          } : item
        ));
      } finally {
        setIsProcessingQueue(false);
      }
    };

    // Trigger processing if there's a pending item and we aren't busy
    const hasPending = items.some(i => i.status === JobStatus.PENDING);
    if (hasPending && !isProcessingQueue) {
      processNext();
    }
  }, [items, isProcessingQueue, config]);

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <header className="border-b border-gray-800 bg-surface/50 backdrop-blur-md sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="bg-primary/20 p-2 rounded-lg">
              <Clapperboard className="w-6 h-6 text-primary" />
            </div>
            <h1 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-400">
              视频尾帧生成器
            </h1>
          </div>
          <div className="flex items-center gap-4 text-sm text-gray-400">
             <div className="flex items-center gap-1">
                <Zap className="w-4 h-4 text-yellow-500" />
                <span>由 Gemini 2.5 Flash 驱动</span>
             </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 w-full max-w-7xl mx-auto px-4 py-8">
        
        <div className="text-center mb-10 space-y-2">
            <h2 className="text-3xl md:text-4xl font-bold text-white">图生视频：首尾帧制作</h2>
            <p className="text-gray-400 max-w-2xl mx-auto">
                上传您的视频首帧（Start Frame），AI 将自动检测比例并生成具有连贯动态的尾帧（End Frame）。
            </p>
        </div>

        <ImageUploader 
          onUpload={handleUpload} 
          isProcessing={false} // Allow adding more while processing
        />

        {/* Config / Info Bar */}
        {items.length > 0 && (
          <div className="flex justify-end mb-4 text-sm text-gray-400">
             <p>已完成 {items.filter(i => i.status === JobStatus.COMPLETED).length} / 共 {items.length} 个任务</p>
          </div>
        )}

        <GenerationGrid items={items} />

      </main>

       {/* Footer */}
       <footer className="border-t border-gray-800 py-8 text-center text-gray-600 text-sm">
        <p>&copy; {new Date().getFullYear()} 视频尾帧生成器. 专为 Veo 等视频生成模型优化。</p>
      </footer>
    </div>
  );
};

export default App;