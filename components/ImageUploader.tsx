import React, { useCallback } from 'react';
import { Upload, Image as ImageIcon, Film } from 'lucide-react';

interface ImageUploaderProps {
  onUpload: (files: File[]) => void;
  isProcessing: boolean;
}

const ImageUploader: React.FC<ImageUploaderProps> = ({ onUpload, isProcessing }) => {
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      // Cast to File[] to fix 'unknown' type inference
      const fileList = Array.from(e.target.files) as File[];
      // Filter for images only
      const imageFiles = fileList.filter(file => file.type.startsWith('image/'));
      onUpload(imageFiles);
      // Reset input
      e.target.value = '';
    }
  };

  return (
    <div className="w-full max-w-3xl mx-auto mb-8">
      <label
        className={`
          flex flex-col items-center justify-center w-full h-48 
          border-2 border-dashed rounded-xl cursor-pointer 
          transition-all duration-200 ease-in-out
          ${isProcessing 
            ? 'border-gray-600 bg-surface/50 opacity-50 cursor-not-allowed' 
            : 'border-primary/50 bg-surface hover:bg-surface/80 hover:border-primary'}
        `}
      >
        <div className="flex flex-col items-center justify-center pt-5 pb-6">
          <div className="p-3 bg-background rounded-full mb-3 shadow-lg">
            {isProcessing ? (
               <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            ) : (
               <Upload className="w-8 h-8 text-primary" />
            )}
          </div>
          <p className="mb-2 text-sm text-gray-300">
            <span className="font-semibold">上传首帧图片</span> (Start Frame)
          </p>
          <p className="text-xs text-gray-500">
            系统将自动检测图片比例
          </p>
        </div>
        <input 
          type="file" 
          className="hidden" 
          multiple 
          accept="image/*"
          onChange={handleFileChange}
          disabled={isProcessing}
        />
      </label>
      
      <div className="mt-4 flex items-start gap-3 p-4 bg-blue-900/20 border border-blue-900/50 rounded-lg text-blue-200 text-sm">
        <Film className="w-5 h-5 flex-shrink-0 mt-0.5" />
        <div>
          <p className="font-medium">尾帧生成模式</p>
          <p className="opacity-80">
            此工具专为“图生视频”设计。上传的图片作为视频起始帧，生成的图片将包含自然的动态变化，适合作为视频结束帧。
          </p>
        </div>
      </div>
    </div>
  );
};

export default ImageUploader;