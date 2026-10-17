import React, { useEffect, useRef, useState } from 'react';
import { Camera, X, RefreshCw, AlertCircle, Upload, Check, Zap } from 'lucide-react';

interface CameraModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCapture: (dataUrl: string) => void;
  onFallbackToFile: () => void;
  itemName?: string;
}

export const CameraModal: React.FC<CameraModalProps> = ({
  isOpen,
  onClose,
  onCapture,
  onFallbackToFile,
  itemName,
}) => {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const [facingMode, setFacingMode] = useState<'environment' | 'user'>('environment');
  const [hasMultipleCameras, setHasMultipleCameras] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isShutterActive, setIsShutterActive] = useState(false);

  // Check if multiple cameras are available
  useEffect(() => {
    if (typeof navigator === 'undefined' || typeof navigator.mediaDevices?.enumerateDevices !== 'function') return;
    navigator.mediaDevices.enumerateDevices().then((devices) => {
      const videoInputs = devices.filter((d) => d.kind === 'videoinput');
      setHasMultipleCameras(videoInputs.length > 1);
    }).catch(() => {});
  }, []);

  // Stop camera tracks cleanly
  const stopStream = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
  };

  // Start camera stream via MediaDevices API
  const startCamera = async (mode: 'environment' | 'user') => {
    stopStream();
    setCameraError(null);
    setIsLoading(true);

    if (typeof navigator === 'undefined' || typeof navigator.mediaDevices?.getUserMedia !== 'function') {
      setCameraError('Camera capture is not supported by your browser or environment. You can upload an image file instead.');
      setIsLoading(false);
      return;
    }

    try {
      const constraints: MediaStreamConstraints = {
        video: {
          facingMode: mode,
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
          videoRef.current?.play().catch(() => {});
          setIsLoading(false);
        };
      }
    } catch (err: any) {
      console.error('Camera access error:', err);
      let message = 'Unable to access the camera.';
      if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
        message = 'Camera permission was denied. Please allow camera access in your browser or upload an image file.';
      } else if (err.name === 'NotFoundError' || err.name === 'DevicesNotFoundError') {
        message = 'No camera device was detected on your hardware.';
      } else if (err.name === 'NotReadableError' || err.name === 'TrackStartError') {
        message = 'Camera is already in use by another application.';
      }
      setCameraError(message);
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      startCamera(facingMode);
    } else {
      stopStream();
    }

    return () => {
      stopStream();
    };
  }, [isOpen, facingMode]);

  const handleToggleCamera = () => {
    setFacingMode((prev) => (prev === 'environment' ? 'user' : 'environment'));
  };

  const handleCapture = () => {
    const video = videoRef.current;
    if (!video || !video.videoWidth || !video.videoHeight) return;

    // Trigger visual shutter flash
    setIsShutterActive(true);

    const canvas = document.createElement('canvas');
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // If front camera, mirror image back for natural reflection
    if (facingMode === 'user') {
      ctx.translate(canvas.width, 0);
      ctx.scale(-1, 1);
    }

    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

    // Compress to balanced web-safe data URL
    const capturedDataUrl = canvas.toDataURL('image/jpeg', 0.82);

    setTimeout(() => {
      stopStream();
      onCapture(capturedDataUrl);
      onClose();
      setIsShutterActive(false);
    }, 180);
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 overflow-hidden bg-black/85 backdrop-blur-sm flex items-center justify-center p-3 sm:p-6"
      role="dialog"
      aria-modal="true"
      aria-labelledby="camera-modal-title"
    >
      <div className="relative w-full max-w-lg bg-[#173D32] rounded-3xl overflow-hidden shadow-2xl flex flex-col border border-[#2C5B47]">
        {/* Top Header Bar */}
        <div className="px-5 py-3.5 flex items-center justify-between text-white border-b border-[#2C5B47]/80 bg-[#173D32]">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-full bg-[#2C5B47] flex items-center justify-center text-[#CBEA72]">
              <Camera className="w-4 h-4" />
            </div>
            <div>
              <h2 id="camera-modal-title" className="text-sm font-bold tracking-tight">
                Take Photo: {itemName || 'Item'}
              </h2>
              <span className="text-[11px] text-[#A7CFC0]">Live camera viewfinder</span>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="min-h-[44px] min-w-[44px] rounded-full flex items-center justify-center text-[#A7CFC0] hover:text-white hover:bg-[#2C5B47] transition-colors"
            aria-label="Close camera"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Viewfinder Area */}
        <div className="relative w-full aspect-4/3 sm:aspect-16/10 bg-black flex items-center justify-center overflow-hidden">
          {/* Shutter Flash Animation */}
          {isShutterActive && (
            <div className="absolute inset-0 bg-white z-30 animate-ping opacity-90 pointer-events-none" />
          )}

          {/* Video Stream */}
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
            <div className="absolute inset-6 sm:inset-10 pointer-events-none flex flex-col justify-between">
              <div className="flex justify-between">
                <div className="w-6 h-6 border-t-2 border-l-2 border-[#CBEA72] rounded-tl-sm shadow-xs" />
                <div className="w-6 h-6 border-t-2 border-r-2 border-[#CBEA72] rounded-tr-sm shadow-xs" />
              </div>
              <div className="flex items-center justify-center">
                <div className="px-3 py-1 rounded-full bg-black/45 backdrop-blur-xs text-white text-[11px] font-medium tracking-wide">
                  Align item or broken part in frame
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
              <RefreshCw className="w-8 h-8 text-[#CBEA72] animate-spin" />
              <p className="text-xs text-[#A7CFC0]">Initializing live camera feed…</p>
            </div>
          )}

          {/* Camera Error / Permission Fallback */}
          {cameraError && (
            <div className="absolute inset-0 p-6 flex flex-col items-center justify-center text-center bg-[#173D32] text-white">
              <div className="w-12 h-12 rounded-full bg-[#FFDAD6] text-[#93000A] flex items-center justify-center mb-3">
                <AlertCircle className="w-6 h-6" />
              </div>
              <p className="text-sm font-semibold mb-1">Camera Access Notice</p>
              <p className="text-xs text-[#A7CFC0] max-w-xs mb-4 leading-relaxed">
                {cameraError}
              </p>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => startCamera(facingMode)}
                  className="min-h-[44px] px-4 py-2 bg-[#2C5B47] hover:bg-[#3E705A] text-white text-xs font-semibold rounded-xl transition-colors"
                >
                  Retry camera
                </button>
                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    onFallbackToFile();
                  }}
                  className="min-h-[44px] px-4 py-2 bg-[#CBEA72] hover:bg-[#b8dc5c] text-[#182B24] text-xs font-bold rounded-xl transition-colors flex items-center gap-1.5"
                >
                  <Upload className="w-3.5 h-3.5" />
                  <span>Choose file instead</span>
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Bottom Shutter Controls */}
        <div className="p-4 sm:p-5 bg-[#173D32] border-t border-[#2C5B47]/80 flex items-center justify-between">
          {/* Flip Camera Button */}
          <div className="w-12 flex justify-start">
            {hasMultipleCameras && !cameraError && (
              <button
                type="button"
                onClick={handleToggleCamera}
                className="min-h-[44px] min-w-[44px] rounded-full bg-[#2C5B47] hover:bg-[#3E705A] text-white flex items-center justify-center transition-colors"
                title="Switch camera"
                aria-label="Switch between front and back camera"
              >
                <RefreshCw className="w-4 h-4 text-[#CBEA72]" />
              </button>
            )}
          </div>

          {/* Large Shutter Button */}
          <div className="flex items-center justify-center">
            <button
              type="button"
              disabled={isLoading || Boolean(cameraError)}
              onClick={handleCapture}
              className="w-16 h-16 rounded-full bg-white hover:bg-[#CBEA72] active:scale-95 transition-all shadow-lg flex items-center justify-center p-1.5 disabled:opacity-50 disabled:pointer-events-none group"
              aria-label="Capture photo"
            >
              <div className="w-full h-full rounded-full border-2 border-[#173D32] group-hover:border-[#173D32] flex items-center justify-center">
                <div className="w-10 h-10 rounded-full bg-[#173D32] group-hover:bg-[#182B24] flex items-center justify-center text-[#CBEA72]">
                  <Camera className="w-5 h-5" />
                </div>
              </div>
            </button>
          </div>

          {/* Cancel Button */}
          <div className="w-12 flex justify-end">
            <button
              type="button"
              onClick={onClose}
              className="min-h-[44px] px-2 text-xs text-[#A7CFC0] hover:text-white transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
