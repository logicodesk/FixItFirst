import React, { useState, useRef } from 'react';
import { Camera, Upload, Trash2, Image as ImageIcon, Loader2 } from 'lucide-react';
import { compressImageFile } from '../utils/imageCompressor';
import { CameraModal } from './CameraModal';

interface ImageUploaderProps {
  currentImage?: string;
  onImageChange: (dataUrl?: string) => void;
  itemName?: string;
}

export const ImageUploader: React.FC<ImageUploaderProps> = ({
  currentImage,
  onImageChange,
  itemName,
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isCameraOpen, setIsCameraOpen] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputFallbackRef = useRef<HTMLInputElement>(null);

  const handleProcessFile = async (file: File) => {
    setErrorMessage(null);
    setIsProcessing(true);
    try {
      const compressedDataUrl = await compressImageFile(file);
      onImageChange(compressedDataUrl);
    } catch (err: any) {
      setErrorMessage(err.message || 'Could not process the selected image.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleProcessFile(file);
    }
    e.target.value = '';
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) {
      handleProcessFile(file);
    }
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleTriggerCamera = () => {
    if (typeof navigator !== 'undefined' && typeof navigator.mediaDevices?.getUserMedia === 'function') {
      setIsCameraOpen(true);
    } else {
      // Fallback to native device file capture if MediaDevices API is unavailable
      cameraInputFallbackRef.current?.click();
    }
  };

  return (
    <section className="flex flex-col gap-2">
      <div className="flex items-center justify-between">
        <label className="text-sm font-semibold text-[#182B24] flex items-center gap-1.5">
          <Camera className="w-4 h-4 text-[#2C5B47]" />
          <span>Item photo</span>
        </label>
        <span className="text-xs text-[#66736B]">Live camera capture or file upload</span>
      </div>

      {currentImage ? (
        /* Preview Card */
        <div className="relative rounded-2xl overflow-hidden bg-white border border-[#DCE8DA] p-3 sm:p-4 shadow-xs flex flex-col sm:flex-row items-center gap-4">
          <div className="w-full sm:w-36 h-40 sm:h-28 rounded-xl overflow-hidden bg-[#F7F8F2] relative shrink-0 border border-[#DCE8DA]">
            <img
              src={currentImage}
              alt={itemName ? `Photo of ${itemName}` : 'Uploaded item'}
              className="w-full h-full object-cover"
            />
            <div className="absolute top-2 left-2 px-2 py-0.5 rounded-full bg-[#173D32]/85 text-white text-[10px] font-semibold backdrop-blur-xs flex items-center gap-1">
              <Camera className="w-3 h-3 text-[#CBEA72]" />
              <span>Captured photo</span>
            </div>
          </div>

          <div className="flex-1 min-w-0 text-center sm:text-left">
            <h3 className="text-sm font-bold text-[#182B24] truncate">
              {itemName ? `${itemName} photo attached` : 'Photo attached'}
            </h3>
            <p className="text-xs text-[#66736B] mt-0.5 leading-relaxed">
              Stored in your assessment draft and used across diagnostic checklists.
            </p>

            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 mt-3">
              <button
                type="button"
                onClick={handleTriggerCamera}
                className="min-h-[44px] px-3.5 py-1.5 bg-[#173D32] hover:bg-[#2C5B47] text-white font-semibold text-xs rounded-xl transition-colors flex items-center gap-1.5 shadow-xs"
              >
                <Camera className="w-3.5 h-3.5 text-[#CBEA72]" />
                <span>Retake with camera</span>
              </button>

              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="min-h-[44px] px-3.5 py-1.5 bg-[#F3F4EE] hover:bg-[#E8E9E3] text-[#182B24] font-semibold text-xs rounded-xl transition-colors flex items-center gap-1.5"
              >
                <Upload className="w-3.5 h-3.5 text-[#2C5B47]" />
                <span>Browse file</span>
              </button>

              <button
                type="button"
                onClick={() => onImageChange(undefined)}
                className="min-h-[44px] px-3.5 py-1.5 bg-white border border-[#DCE8DA] hover:bg-[#FFDAD6]/30 text-[#93000A] font-semibold text-xs rounded-xl transition-colors flex items-center gap-1.5"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Remove</span>
              </button>
            </div>
          </div>
        </div>
      ) : (
        /* Empty Upload Zone */
        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          className={`rounded-2xl border-2 border-dashed p-5 text-center transition-all flex flex-col items-center justify-center gap-3 ${
            isDragging
              ? 'border-[#2C5B47] bg-[#DCE8DA]/40'
              : 'border-[#DCE8DA] hover:border-[#2C5B47]/60 bg-white'
          }`}
        >
          {isProcessing ? (
            <div className="py-4 flex flex-col items-center gap-2">
              <Loader2 className="w-7 h-7 text-[#2C5B47] animate-spin" />
              <p className="text-xs text-[#66736B] font-medium">
                Optimizing your image…
              </p>
            </div>
          ) : (
            <>
              <div className="w-12 h-12 rounded-2xl bg-[#F7F8F2] border border-[#DCE8DA] flex items-center justify-center text-[#2C5B47] shadow-xs">
                <ImageIcon className="w-6 h-6" />
              </div>

              <div>
                <p className="text-sm font-semibold text-[#182B24]">
                  Capture a photo with your camera or upload an image
                </p>
                <p className="text-xs text-[#66736B] mt-0.5">
                  Point your camera at the item, model label, or broken part
                </p>
              </div>

              <div className="flex flex-wrap items-center justify-center gap-2 pt-1">
                <button
                  type="button"
                  onClick={handleTriggerCamera}
                  className="min-h-[44px] px-4 py-2 bg-[#173D32] hover:bg-[#2C5B47] text-white font-semibold text-xs sm:text-sm rounded-xl transition-all flex items-center gap-2 shadow-xs active:scale-[0.98]"
                >
                  <Camera className="w-4 h-4 text-[#CBEA72]" />
                  <span>Take photo (Camera)</span>
                </button>

                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="min-h-[44px] px-4 py-2 bg-[#F3F4EE] hover:bg-[#E8E9E3] text-[#182B24] font-semibold text-xs sm:text-sm rounded-xl transition-colors flex items-center gap-1.5 shadow-xs"
                >
                  <Upload className="w-4 h-4 text-[#2C5B47]" />
                  <span>Browse files</span>
                </button>
              </div>

              <span className="text-[11px] text-[#66736B]">
                MediaDevices live camera viewfinder · Auto-compressed for instant loading
              </span>
            </>
          )}

          {/* Hidden File Inputs */}
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            className="hidden"
            aria-label="Upload item picture file"
          />
          <input
            ref={cameraInputFallbackRef}
            type="file"
            accept="image/*"
            capture="environment"
            onChange={handleFileChange}
            className="hidden"
            aria-label="Take picture with device camera fallback"
          />
        </div>
      )}

      {errorMessage && (
        <p className="text-xs text-[#93000A] font-medium" role="alert">
          {errorMessage}
        </p>
      )}

      {/* MediaDevices Live Camera Viewfinder Modal */}
      <CameraModal
        isOpen={isCameraOpen}
        onClose={() => setIsCameraOpen(false)}
        onCapture={(dataUrl) => {
          onImageChange(dataUrl);
          setIsCameraOpen(false);
        }}
        onFallbackToFile={() => fileInputRef.current?.click()}
        itemName={itemName}
      />
    </section>
  );
};
