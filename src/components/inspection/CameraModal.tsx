'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Camera, RefreshCw, Upload, CheckCircle2, AlertTriangle, X, ShieldAlert } from 'lucide-react';
import { Button } from '@/components/ui/Button';

interface CameraModalProps {
  isOpen: boolean;
  onClose: () => void;
  onPhotoCaptured: (dataUrl: string) => void;
}

export const CameraModal: React.FC<CameraModalProps> = ({ isOpen, onClose, onPhotoCaptured }) => {
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [capturedPhoto, setCapturedPhoto] = useState<string | null>(null);
  const [permissionError, setPermissionError] = useState<string | null>(null);
  const [permissionDeniedHelp, setPermissionDeniedHelp] = useState(false);

  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Stop camera tracks cleanly
  const stopCameraTracks = () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
    }
    setIsCameraActive(false);
  };

  useEffect(() => {
    return () => {
      stopCameraTracks();
    };
  }, []);

  const handleStartCamera = async () => {
    setPermissionError(null);
    setPermissionDeniedHelp(false);

    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      setPermissionError('Camera API is not supported by your current browser context or requires HTTPS.');
      return;
    }

    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment', width: { ideal: 1280 }, height: { ideal: 720 } },
        audio: false,
      });

      setStream(mediaStream);
      setIsCameraActive(true);

      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
      }
    } catch (err: any) {
      console.error('Camera permission error:', err);
      if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
        setPermissionError('Camera permission was denied. Please allow camera access in your browser settings.');
        setPermissionDeniedHelp(true);
      } else if (err.name === 'NotFoundError' || err.name === 'DevicesNotFoundError') {
        setPermissionError('No physical camera device was detected on your system.');
      } else if (err.name === 'NotReadableError' || err.name === 'TrackStartError') {
        setPermissionError('Camera is currently in use by another application.');
      } else {
        setPermissionError(`Unable to access camera: ${err.message || 'Unknown error'}`);
      }
    }
  };

  const handleCapture = () => {
    if (!videoRef.current || !canvasRef.current) return;

    const video = videoRef.current;
    const canvas = canvasRef.current;

    canvas.width = video.videoWidth || 640;
    canvas.height = video.videoHeight || 480;

    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
      const dataUrl = canvas.toDataURL('image/jpeg', 0.85);
      setCapturedPhoto(dataUrl);
      stopCameraTracks();
    }
  };

  const handleRetake = () => {
    setCapturedPhoto(null);
    handleStartCamera();
  };

  const handleConfirmPhoto = () => {
    if (capturedPhoto) {
      onPhotoCaptured(capturedPhoto);
      stopCameraTracks();
      onClose();
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        if (reader.result) {
          setCapturedPhoto(reader.result as string);
          stopCameraTracks();
        }
      };
      reader.readAsDataURL(file);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md">
      <div className="bg-white rounded-xl shadow-2xl border border-govBorder w-full max-w-lg overflow-hidden flex flex-col">
        {/* Header */}
        <div className="bg-govBlue text-white px-5 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Camera className="w-5 h-5 text-saffron" />
            <h3 className="text-sm font-bold">Field Evidence Camera Capture</h3>
          </div>
          <button
            onClick={() => {
              stopCameraTracks();
              onClose();
            }}
            className="text-slate-200 hover:text-white p-1"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-4 flex-1 flex flex-col items-center justify-center bg-slate-900 min-h-[300px] relative">
          <canvas ref={canvasRef} className="hidden" />

          {/* Captured Preview */}
          {capturedPhoto ? (
            <div className="w-full flex flex-col items-center">
              <img
                src={capturedPhoto}
                alt="Captured Evidence"
                className="max-h-[320px] w-auto rounded border border-slate-700 shadow"
              />
              <span className="text-xs text-green-400 mt-2 flex items-center gap-1 font-semibold">
                <CheckCircle2 className="w-4 h-4" /> Photo Captured Successfully
              </span>
            </div>
          ) : isCameraActive ? (
            /* Live Camera Stream */
            <div className="w-full relative flex justify-center">
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                className="w-full max-h-[340px] object-cover rounded border border-slate-700"
              />
              <div className="absolute bottom-3 left-0 right-0 flex justify-center">
                <Button variant="secondary" onClick={handleCapture} leftIcon={<Camera className="w-4 h-4" />}>
                  Capture Evidence Photo
                </Button>
              </div>
            </div>
          ) : (
            /* Pre-camera Launch State */
            <div className="text-center p-6 text-slate-300 max-w-sm">
              {permissionError ? (
                <div className="bg-red-950/80 border border-red-800 text-red-200 p-4 rounded-lg text-xs text-left mb-4">
                  <div className="flex items-center gap-2 text-red-400 font-bold mb-1">
                    <AlertTriangle className="w-4 h-4" /> Camera Access Issue
                  </div>
                  <p>{permissionError}</p>
                  {permissionDeniedHelp && (
                    <div className="mt-2 pt-2 border-t border-red-800/60 text-[11px] text-slate-300">
                      <strong>How to enable:</strong> Click the padlock icon in your browser address bar → Camera → Allow → Refresh.
                    </div>
                  )}
                </div>
              ) : (
                <>
                  <Camera className="w-12 h-12 text-saffron mx-auto mb-3 opacity-90 animate-bounce" />
                  <h4 className="text-sm font-bold text-white mb-1">Browser Camera Permission Required</h4>
                  <p className="text-xs text-slate-400 mb-4 leading-relaxed">
                    Explicit permission will be requested to access your device camera for recording inspection site evidence.
                  </p>
                </>
              )}

              <div className="flex flex-col gap-2">
                <Button variant="primary" onClick={handleStartCamera} leftIcon={<Camera className="w-4 h-4" />}>
                  Start Camera Stream
                </Button>

                <div className="relative mt-2">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleFileUpload}
                    className="absolute inset-0 opacity-0 cursor-pointer w-full"
                  />
                  <Button variant="outline" className="w-full" leftIcon={<Upload className="w-4 h-4" />}>
                    Upload Photo File Instead
                  </Button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="bg-slate-100 p-3 flex items-center justify-between border-t border-slate-200">
          <Button
            variant="ghost"
            onClick={() => {
              stopCameraTracks();
              onClose();
            }}
          >
            Cancel
          </Button>

          {capturedPhoto && (
            <div className="flex items-center gap-2">
              <Button variant="outline" onClick={handleRetake} leftIcon={<RefreshCw className="w-3.5 h-3.5" />}>
                Retake
              </Button>
              <Button variant="success" onClick={handleConfirmPhoto} leftIcon={<CheckCircle2 className="w-4 h-4" />}>
                Use Photo
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
