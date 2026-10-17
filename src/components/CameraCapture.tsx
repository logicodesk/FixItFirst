import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  Camera,
  RefreshCw,
  X,
  Check,
  AlertCircle,
  Trash2,
  Sparkles,
  Upload,
  Eye,
  SwitchCamera,
} from 'lucide-react';

export interface CameraCaptureProps {
  currentImage?: string;
  onCapture: (base64Image: string) => void;
  onClear?: () => void;
  itemName?: string;
  className?: string;
}

export const CameraCapture: React.FC<CameraCaptureProps> = ({
  currentImage,
  onCapture,
  onClear,
  itemName = 'item',
  className = '',
}) => {
  const [isStreaming, setIsStreaming] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [facingMode, setFacingMode] = useState<'environment' | 'user'>('environment');
  const [hasMultipleCameras, setHasMultipleCameras] = useState(false);
  const [isShutterActive, setIsShutterActive] = useState(false);

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const fileFallbackInputRef = useRef<HTMLInputElement | null>(null);

  // Check if device supports multiple cameras
  useEffect(() => {
    if (
      typeof navigator !== 'undefined' &&
      navigator.mediaDevices &&
      typeof navigator.mediaDevices.enumerateDevices === 'function'
    ) {
      navigator.mediaDevices
        .enumerateDevices()
        .then((devices) => {
          const videoInputs = devices.filter((d) => d.kind === 'videoinput');
          setHasMultipleCameras(videoInputs.length > 1);
        })
        .catch(() => {});
    }
  }, []);

  // Stop video stream
  const stopStream = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => {
        track.stop();
      });
      streamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    setIsStreaming(false);
    setIsLoading(false);
  }, []);

  // Stop stream on unmount
  useEffect(() => {
    return () => {
      stopStream();
    };
  }, [stopStream]);

  // Start video stream using MediaDevices API
  const startCamera = async (mode: 'environment' | 'user' = facingMode) => {
    stopStream();
    setCameraError(null);
    setIsLoading(true);
    setIsStreaming(true);

    if (
      typeof navigator === 'undefined' ||
      !navigator.mediaDevices ||
      typeof navigator.mediaDevices.getUserMedia !== 'function'
    ) {
      setCameraError(
        'Camera API is not supported by your browser or environment. You can upload an image file instead.'
      );
      setIsLoading(false);
      return;
    }

    try {
      const constraints: MediaStreamConstraints = {
        video: {
          facingMode: { ideal: mode },
          width: { ideal: 1280 },
          height: { ideal: 720 },
        },
        audio: false,
      };

      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      streamRef.current = stream;

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.onloadedmetadata = () => {
          videoRef.current?.play().catch((err) => {
            console.warn('Video play interrupted:', err);
          });
          setIsLoading(false);
        };
      }
    } catch (err: any) {
      console.error('Camera stream error:', err);
      let errorMsg = 'Could not access camera.';
      if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
        errorMsg = 'Camera permission was denied. Please allow camera access in your browser settings.';
      } else if (err.name === 'NotFoundError' || err.name === 'DevicesNotFoundError') {
        errorMsg = 'No camera found on this device.';
      } else if (err.name === 'NotReadableError' || err.name === 'TrackStartError') {
        errorMsg = 'Camera is already in use by another program.';
      } else if (err.message) {
        errorMsg = err.message;
      }
      setCameraError(errorMsg);
      setIsLoading(false);
    }
  };

  // Flip between front and rear cameras
  const handleToggleFacingMode = () => {
    const nextMode = facingMode === 'environment' ? 'user' : 'environment';
    setFacingMode(nextMode);
    startCamera(nextMode);
  };

  // Take snapshot using an off-screen HTML5 Canvas
  const takeSnapshot = () => {
    const video = videoRef.current;
    if (!video || !video.videoWidth || !video.videoHeight) {
      setCameraError('Camera stream is not ready for capture yet.');
      return;
    }

    // Trigger visual shutter flash
    setIsShutterActive(true);

    try {
      const canvas = document.createElement('canvas');
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const ctx = canvas.getContext('2d');

      if (!ctx) {
        throw new Error('Canvas 2D context unavailable');
      }

      // Mirror horizontally if user front camera
      if (facingMode === 'user') {
        ctx.translate(canvas.width, 0);
        ctx.scale(-1, 1);
      }

      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

      // Generate base64 data URL string (JPEG at 85% quality)
      const base64String = canvas.toDataURL('image/jpeg', 0.85);

      setTimeout(() => {
        setIsShutterActive(false);
        stopStream();
        onCapture(base64String);
      }, 150);
    } catch (err: any) {
      console.error('Snapshot capture error:', err);
      setCameraError('Failed to capture snapshot from camera stream.');
      setIsShutterActive(false);
    }
  };

  // Handle fallback file selection when camera is unavailable
  const handleFileFallbackChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        onCapture(reader.result);
      }
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  return (
    <div className={`w-full flex flex-col gap-3 ${className}`}>
      {/* Header bar */}
      <div className="flex items-center justify-between">
        <label className="text-sm font-semibold text-[#182B24] flex items-center gap-1.5">
          <Camera className="w-4 h-4 text-[#2C5B47]" />
          <span>Item Photo</span>
        </label>
        <span className="text-xs text-[#66736B]">
          {currentImage ? 'Photo attached' : 'Live MediaDevices camera'}
        </span>
      </div>

      {/* Case 1: Active Live Camera Viewfinder */}
      {isStreaming ? (
        <div className="relative w-full rounded-2xl bg-[#173D32] border border-[#2C5B47] overflow-hidden shadow-md flex flex-col">
          {/* Top Camera Status Bar */}
          <div className="px-4 py-2.5 bg-[#173D32]/95 border-b border-[#2C5B47] flex items-center justify-between text-white">
            <div className="flex items-center gap-2">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#CBEA72] opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-[#CBEA72]" />
              </span>
              <span className="text-xs font-semibold">
                Camera Active: {itemName ? itemName : 'Item'}
              </span>
            </div>

            <button
              type="button"
              onClick={stopStream}
              className="p-1 rounded-full text-[#A7CFC0] hover:text-white hover:bg-[#2C5B47] transition-colors"
              title="Close camera"
              aria-label="Close camera"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Viewfinder Screen */}
          <div className="relative w-full aspect-4/3 sm:aspect-16/9 bg-black flex items-center justify-center overflow-hidden">
            {/* Shutter Flash Animation */}
            {isShutterActive && (
              <div className="absolute inset-0 bg-white z-30 opacity-90 animate-ping pointer-events-none" />
            )}

            {/* Live Video Feed */}
            <video
              ref={videoRef}
              playsInline
              autoPlay
              muted
              className={`w-full h-full object-cover transition-opacity duration-300 ${
                isLoading || cameraError ? 'opacity-0' : 'opacity-100'
              } ${facingMode === 'user' ? 'scale-x-[-1]' : ''}`}
            />

            {/* Viewfinder Target Framing Guides */}
            {!isLoading && !cameraError && (
              <div className="absolute inset-4 sm:inset-8 pointer-events-none flex flex-col justify-between">
                <div className="flex justify-between">
                  <div className="w-6 h-6 border-t-2 border-l-2 border-[#CBEA72] rounded-tl-sm shadow-xs" />
                  <div className="w-6 h-6 border-t-2 border-r-2 border-[#CBEA72] rounded-tr-sm shadow-xs" />
                </div>
                <div className="flex items-center justify-center">
                  <div className="px-3 py-1 rounded-full bg-black/50 backdrop-blur-xs text-white text-[11px] font-medium">
                    Position item in center
                  </div>
                </div>
                <div className="flex justify-between">
                  <div className="w-6 h-6 border-b-2 border-l-2 border-[#CBEA72] rounded-bl-sm shadow-xs" />
                  <div className="w-6 h-6 border-b-2 border-r-2 border-[#CBEA72] rounded-br-sm shadow-xs" />
                </div>
              </div>
            )}

            {/* Loading Indicator */}
            {isLoading && !cameraError && (
              <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 text-white bg-black/60">
                <RefreshCw className="w-7 h-7 text-[#CBEA72] animate-spin" />
                <p className="text-xs text-[#A7CFC0]">Accessing MediaDevices camera stream…</p>
              </div>
            )}

            {/* Error Overlay */}
            {cameraError && (
              <div className="absolute inset-0 p-5 flex flex-col items-center justify-center text-center bg-[#173D32] text-white">
                <div className="w-10 h-10 rounded-full bg-[#FFDAD6] text-[#93000A] flex items-center justify-center mb-2">
                  <AlertCircle className="w-5 h-5" />
                </div>
                <p className="text-xs font-semibold mb-1">Camera Notice</p>
                <p className="text-[11px] text-[#A7CFC0] max-w-xs mb-3 leading-relaxed">
                  {cameraError}
                </p>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => startCamera(facingMode)}
                    className="min-h-[38px] px-3.5 py-1.5 bg-[#2C5B47] hover:bg-[#3E705A] text-white text-xs font-semibold rounded-lg transition-colors"
                  >
                    Try Again
                  </button>
                  <button
                    type="button"
                    onClick={() => fileFallbackInputRef.current?.click()}
                    className="min-h-[38px] px-3.5 py-1.5 bg-[#CBEA72] hover:bg-[#b8dc5c] text-[#182B24] text-xs font-bold rounded-lg transition-colors flex items-center gap-1.5"
                  >
                    <Upload className="w-3.5 h-3.5" />
                    <span>Upload Image File</span>
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Shutter Control Bar */}
          <div className="p-3.5 bg-[#173D32] border-t border-[#2C5B47] flex items-center justify-between">
            {/* Flip Camera button if device has multiple */}
            <div className="w-12 flex justify-start">
              {hasMultipleCameras && !cameraError && (
                <button
                  type="button"
                  onClick={handleToggleFacingMode}
                  className="min-h-[40px] min-w-[40px] rounded-full bg-[#2C5B47] hover:bg-[#3E705A] text-white flex items-center justify-center transition-colors"
                  title="Switch front / rear camera"
                  aria-label="Switch camera"
                >
                  <SwitchCamera className="w-4 h-4 text-[#CBEA72]" />
                </button>
              )}
            </div>

            {/* Shutter Trigger Button */}
            <button
              type="button"
              disabled={isLoading || Boolean(cameraError)}
              onClick={takeSnapshot}
              className="w-14 h-14 rounded-full bg-white hover:bg-[#CBEA72] active:scale-95 transition-all shadow-md flex items-center justify-center p-1 disabled:opacity-50 disabled:pointer-events-none group"
              aria-label="Take snapshot"
            >
              <div className="w-full h-full rounded-full border-2 border-[#173D32] flex items-center justify-center">
                <div className="w-9 h-9 rounded-full bg-[#173D32] group-hover:bg-[#182B24] flex items-center justify-center text-[#CBEA72]">
                  <Camera className="w-4 h-4" />
                </div>
              </div>
            </button>

            {/* Cancel Action */}
            <div className="w-12 flex justify-end">
              <button
                type="button"
                onClick={stopStream}
                className="text-xs text-[#A7CFC0] hover:text-white transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      ) : currentImage ? (
        /* Case 2: Captured Image Preview */
        <div className="relative rounded-2xl bg-white border border-[#DCE8DA] p-3.5 sm:p-4 shadow-xs flex flex-col sm:flex-row items-center gap-4">
          <div className="w-full sm:w-36 h-36 sm:h-28 rounded-xl overflow-hidden bg-[#F7F8F2] relative shrink-0 border border-[#DCE8DA]">
            <img
              src={currentImage}
              alt={itemName ? `Photo of ${itemName}` : 'Item snapshot'}
              className="w-full h-full object-cover"
            />
            <div className="absolute top-2 left-2 px-2 py-0.5 rounded-full bg-[#173D32]/85 text-white text-[10px] font-semibold backdrop-blur-xs flex items-center gap-1">
              <Camera className="w-3 h-3 text-[#CBEA72]" />
              <span>Snapshot</span>
            </div>
          </div>

          <div className="flex-1 min-w-0 text-center sm:text-left">
            <div className="flex items-center justify-center sm:justify-start gap-1.5">
              <span className="w-2 h-2 rounded-full bg-[#2C5B47]" />
              <h4 className="text-sm font-bold text-[#182B24] truncate">
                Photo attached to draft
              </h4>
            </div>
            <p className="text-xs text-[#66736B] mt-1 leading-relaxed">
              Your photo is converted to base64 and stored in your assessment draft.
            </p>

            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 mt-3">
              <button
                type="button"
                onClick={() => startCamera('environment')}
                className="min-h-[40px] px-3 py-1.5 bg-[#173D32] hover:bg-[#2C5B47] text-white font-semibold text-xs rounded-xl transition-all flex items-center gap-1.5 shadow-xs"
              >
                <Camera className="w-3.5 h-3.5 text-[#CBEA72]" />
                <span>Retake with Camera</span>
              </button>

              <button
                type="button"
                onClick={() => fileFallbackInputRef.current?.click()}
                className="min-h-[40px] px-3 py-1.5 bg-[#F3F4EE] hover:bg-[#E8E9E3] text-[#182B24] font-semibold text-xs rounded-xl transition-colors flex items-center gap-1.5"
              >
                <Upload className="w-3.5 h-3.5 text-[#2C5B47]" />
                <span>Upload File</span>
              </button>

              {onClear && (
                <button
                  type="button"
                  onClick={onClear}
                  className="min-h-[40px] px-3 py-1.5 bg-white border border-[#DCE8DA] hover:bg-[#FFDAD6]/30 text-[#93000A] font-semibold text-xs rounded-xl transition-colors flex items-center gap-1.5"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Remove</span>
                </button>
              )}
            </div>
          </div>
        </div>
      ) : (
        /* Case 3: Idle Camera Callout */
        <div className="rounded-2xl border-2 border-dashed border-[#DCE8DA] hover:border-[#2C5B47]/60 bg-white p-5 text-center transition-all flex flex-col items-center justify-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-[#F7F8F2] border border-[#DCE8DA] flex items-center justify-center text-[#2C5B47] shadow-xs">
            <Camera className="w-6 h-6" />
          </div>

          <div>
            <p className="text-sm font-semibold text-[#182B24]">
              Take a photo of your {itemName ? itemName : 'item'}
            </p>
            <p className="text-xs text-[#66736B] mt-0.5 max-w-sm">
              Use your device camera to stream video and capture a snapshot directly into your draft.
            </p>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-2 pt-1">
            <button
              type="button"
              onClick={() => startCamera('environment')}
              className="min-h-[44px] px-4 py-2 bg-[#173D32] hover:bg-[#2C5B47] text-white font-semibold text-xs sm:text-sm rounded-xl transition-all flex items-center gap-2 shadow-xs active:scale-[0.98]"
            >
              <Camera className="w-4 h-4 text-[#CBEA72]" />
              <span>Open Camera</span>
            </button>

            <button
              type="button"
              onClick={() => fileFallbackInputRef.current?.click()}
              className="min-h-[44px] px-4 py-2 bg-[#F3F4EE] hover:bg-[#E8E9E3] text-[#182B24] font-semibold text-xs sm:text-sm rounded-xl transition-colors flex items-center gap-1.5 shadow-xs"
            >
              <Upload className="w-4 h-4 text-[#2C5B47]" />
              <span>Choose Image File</span>
            </button>
          </div>

          <span className="text-[11px] text-[#66736B]">
            Uses the browser MediaDevices API · Stored as base64 in your assessment
          </span>
        </div>
      )}

      {/* Hidden file input for device upload fallback */}
      <input
        ref={fileFallbackInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileFallbackChange}
        className="hidden"
        aria-label="Upload item image file fallback"
      />
    </div>
  );
};
