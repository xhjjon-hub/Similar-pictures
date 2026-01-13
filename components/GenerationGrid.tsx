import React from 'react';
import { GeneratedImage, JobStatus } from '../types';
import { Download, AlertCircle, ArrowRight, Loader2 } from 'lucide-react';

interface GenerationGridProps {
  items: GeneratedImage[];
}

const GenerationGrid: React.FC<GenerationGridProps> = ({ items }) => {
  const handleDownload = (imageUrl: string, fileName: string) => {
    const link = document.createElement('a');
    link.href = imageUrl;
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (items.length === 0) return null;

  return (
    <div className="w-full max-w-6xl mx-auto space-y-6 pb-20">
      <h2 className="text-xl font-semibold text-white mb-4 pl-1 border-l-4 border-primary">
        生成队列 ({items.length})
      </h2>
      
      <div className="grid grid-cols-1 gap-6">
        {items.map((item) => (
          <div 
            key={item.id} 
            className="bg-surface rounded-xl overflow-hidden border border-gray-700/50 shadow-xl"
          >
            <div className="p-4 flex flex-col md:flex-row items-center gap-6">
              
              {/* Original Image */}
              <div className="flex flex-col items-center space-y-2">
                <span className="text-xs font-medium text-gray-400 uppercase tracking-wider text-primary">首帧 (Start)</span>
                <div className="w-32 h-32 md:w-40 md:h-40 rounded-lg overflow-hidden border-2 border-gray-700 relative bg-background">
                    <img 
                      src={item.originalPreviewUrl} 
                      alt="Original" 
                      className="w-full h-full object-cover opacity-80"
                    />
                </div>
                <div className="w-32 md:w-40 text-center">
                    <p className="text-xs text-gray-500 truncate" title={item.originalFile.name}>
                        {item.originalFile.name}
                    </p>
                </div>
              </div>

              {/* Status/Process Indicator */}
              <div className="flex-1 flex flex-col items-center justify-center min-h-[60px]">
                {item.status === JobStatus.PENDING && (
                  <span className="text-sm text-gray-400">等待中...</span>
                )}
                {item.status === JobStatus.PROCESSING && (
                  <div className="flex flex-col items-center text-primary animate-pulse">
                    <Loader2 className="w-8 h-8 animate-spin mb-2" />
                    <span className="text-sm font-medium">生成尾帧中...</span>
                  </div>
                )}
                {item.status === JobStatus.COMPLETED && (
                  <ArrowRight className="w-8 h-8 text-green-500 hidden md:block" />
                )}
                 {item.status === JobStatus.FAILED && (
                  <div className="h-0.5 w-full bg-red-900/50 relative">
                     <AlertCircle className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-6 h-6 text-red-500 bg-surface" />
                  </div>
                )}
              </div>

              {/* Generated Image */}
              <div className="flex flex-col items-center space-y-2 relative">
                <span className="text-xs font-medium text-gray-400 uppercase tracking-wider text-purple-400">尾帧 (End)</span>
                
                <div className={`
                    w-64 h-64 rounded-lg overflow-hidden border-2 relative bg-background transition-all
                    ${item.status === JobStatus.COMPLETED ? 'border-primary shadow-lg shadow-primary/10' : 'border-gray-800 border-dashed'}
                `}>
                  {item.status === JobStatus.COMPLETED && item.generatedImageUrl ? (
                    <img 
                      src={item.generatedImageUrl} 
                      alt="Generated" 
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-700">
                        {item.status === JobStatus.FAILED ? (
                             <span className="text-red-500 text-xs text-center px-2">{item.error || "生成失败"}</span>
                        ) : (
                             <div className="w-full h-full bg-gradient-to-br from-gray-800 to-gray-900 opacity-50" />
                        )}
                    </div>
                  )}
                </div>

                {item.status === JobStatus.COMPLETED && item.generatedImageUrl && (
                  <button
                    onClick={() => handleDownload(item.generatedImageUrl!, item.suggestedFileName)}
                    className="flex items-center gap-2 px-4 py-2 bg-primary hover:bg-blue-600 text-white text-sm font-medium rounded-full transition-colors shadow-lg"
                  >
                    <Download className="w-4 h-4" />
                    下载尾帧
                  </button>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default GenerationGrid;