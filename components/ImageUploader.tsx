
import React, { useCallback, useState, useRef, useEffect } from 'react';

interface ImageUploaderProps {
  onImageSelected: (base64: string) => void;
  isLoading: boolean;
  isLoggedIn: boolean;
  onOpenAuth: () => void;
}

const ImageUploader: React.FC<ImageUploaderProps> = ({
  onImageSelected,
  isLoading,
  isLoggedIn,
  onOpenAuth
}) => {
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const processFile = (file: File) => {
    if (!file.type.startsWith('image/')) return;
    const reader = new FileReader();
    reader.onloadend = () => {
      if (reader.result) {
        onImageSelected(reader.result as string);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      processFile(file);
    }
  };

  const onDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(true);
  };

  const onDragLeave = () => {
    setDragActive(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(false);
    if (!isLoggedIn) {
      onOpenAuth();
      return;
    }
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processFile(e.dataTransfer.files[0]);
    }
  };

  const onPaste = useCallback((e: ClipboardEvent) => {
    if (!isLoggedIn) return; // Paste logic handled by global listener, but we can ignore if not logged in
    const items = e.clipboardData?.items;
    if (items) {
      for (let i = 0; i < items.length; i++) {
        if (items[i].type.indexOf("image") !== -1) {
          const blob = items[i].getAsFile();
          if (blob) processFile(blob);
        }
      }
    }
  }, [isLoggedIn]);

  useEffect(() => {
    window.addEventListener('paste', onPaste);
    return () => window.removeEventListener('paste', onPaste);
  }, [onPaste]);

  const handleClick = () => {
    if (!isLoggedIn) {
      onOpenAuth();
    } else {
      fileInputRef.current?.click();
    }
  };

  return (
    <div
      className={`relative border-2 border-dashed rounded-2xl p-8 transition-all flex flex-col items-center justify-center gap-4 cursor-pointer
        ${dragActive ? 'border-blue-500 bg-blue-500/10' : 'border-slate-800 bg-slate-900/30 hover:border-slate-600'}
        ${isLoading ? 'opacity-50 pointer-events-none' : ''}`}
      onDragOver={onDragOver}
      onDragLeave={onDragLeave}
      onDrop={handleDrop}
      onClick={handleClick}
    >
      <input
        ref={fileInputRef}
        type="file"
        className="hidden"
        accept="image/*"
        onChange={handleFileChange}
      />

      <div className="w-16 h-16 bg-slate-800 rounded-full flex items-center justify-center mb-2">
        <svg className="w-8 h-8 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
      </div>

      <div className="text-center">
        <p className="text-lg font-medium text-white">차트 이미지 업로드, 붙여넣기 또는 캡처</p>
        <p className="text-sm text-slate-500 mt-1">파일을 끌어다 놓거나 <kbd className="bg-slate-800 px-1.5 py-0.5 rounded text-xs">Ctrl+V</kbd>로 붙여넣으세요</p>
      </div>

      <button className="mt-2 bg-blue-600 hover:bg-blue-500 text-white font-semibold py-2 px-6 rounded-lg shadow-lg shadow-blue-900/20 transition-all flex items-center gap-2">
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
        </svg>
        이미지 선택
      </button>

      {!isLoggedIn && (
        <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-[1px] flex items-center justify-center rounded-2xl">
          <div className="bg-slate-900/90 border border-slate-700 px-4 py-2 rounded-full shadow-2xl flex items-center gap-2 transform translate-y-4 animate-in slide-in-from-bottom-2 duration-300">
            <svg className="w-4 h-4 text-blue-500" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 2a1 1 0 011 1v1.323l3.954 1.582 1.599-.8a1 1 0 01.894 1.79l-1.233.616 1.738 5.42a1 1 0 01-.285 1.05l-3.293 3.293a1 1 0 01-1.414 0l-3.293-3.293a1 1 0 01-.285-1.05l1.738-5.42-1.233-.616a1 1 0 01.894-1.79l1.599.8L9 4.323V3a1 1 0 011-1z" clipRule="evenodd" />
            </svg>
            <span className="text-xs font-bold text-white">로그인이 필요합니다</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default ImageUploader;
