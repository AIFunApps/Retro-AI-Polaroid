import React, { useEffect, useRef, useState } from 'react';
import { RefreshCw } from 'lucide-react';

interface CameraProps {
  onCapture: (dataUrl: string) => void;
  isProcessing: boolean;
}

export const Camera: React.FC<CameraProps> = ({ onCapture, isProcessing }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [error, setError] = useState<string>('');
  const [flash, setFlash] = useState(false);

  useEffect(() => {
    startCamera();
    return () => {
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const startCamera = async () => {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: {
          width: { ideal: 1280 },
          height: { ideal: 720 },
          facingMode: 'user'
        },
        audio: false,
      });
      setStream(mediaStream);
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
      }
      setError('');
    } catch (err) {
      console.error("Error accessing camera:", err);
      setError('Could not access camera. Please allow permissions.');
    }
  };

  const takePicture = () => {
    if (!videoRef.current || !canvasRef.current || isProcessing) return;

    setFlash(true);
    setTimeout(() => setFlash(false), 150);

    const video = videoRef.current;
    const canvas = canvasRef.current;
    const context = canvas.getContext('2d');

    if (context) {
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      context.translate(canvas.width, 0);
      context.scale(-1, 1);
      context.drawImage(video, 0, 0, canvas.width, canvas.height);
      const dataUrl = canvas.toDataURL('image/jpeg', 0.9);
      onCapture(dataUrl);
    }
  };

  return (
    <div className="relative w-80 h-96 select-none z-30 sm:w-72 sm:h-80 xs:w-64 xs:h-72 max-w-[90vw]">

      {/* 出片槽 */}
      <div className="absolute -top-2.5 w-44 sm:w-36 xs:w-32 h-5 sm:h-4 xs:h-3 bg-gray-900 rounded-full z-0"
           style={{ left: '50%', transform: 'translateX(-50%)' }} />

      {/* 相机主体 */}
      <div className="camera-body absolute inset-0 z-10 flex flex-col items-center overflow-hidden">

        {/* 纹理叠加 */}
        <div
          className="absolute inset-0 opacity-10 pointer-events-none"
          style={{ backgroundImage: 'url("https://www.transparenttextures.com/patterns/stardust.png")' }}
        />

        {/* 顶部细节 */}
        <div className="w-full h-24 flex justify-between items-center px-6 pt-4 relative">

          {/* 闪光灯单元 */}
          <div className="flash-unit w-20 h-14 sm:w-16 sm:h-12 xs:w-14 xs:h-10">
            <div className="flash-effect" />
            <div className="w-full h-full flex items-center justify-center">
              <div className="w-12 h-4 sm:w-10 sm:h-3 xs:w-8 xs:h-2 bg-gray-800/20 rounded blur-sm" />
            </div>
          </div>

          {/* 取景器和传感器 */}
          <div className="flex gap-2 sm:gap-1 items-center">
            <div className="w-3 h-3 sm:w-2 sm:h-2 bg-black rounded-full" />
            <div className="w-12 h-12 sm:w-10 sm:h-10 xs:w-8 xs:h-8 bg-black rounded-full border-4 sm:border-3 xs:border-2 border-gray-400 overflow-hidden relative shadow-lg">
              <div className="absolute top-1 left-2 sm:top-0.5 sm:left-1.5 xs:top-0.5 xs:left-1 w-3 h-3 sm:w-2 sm:h-2 xs:w-1.5 xs:h-1.5 bg-white rounded-full opacity-30 blur-[1px]" />
            </div>
          </div>
        </div>

        {/* 镜头环 */}
        <div className="relative mt-2">
          <div className="camera-ring w-48 h-48 sm:w-40 sm:h-40 xs:w-36 xs:h-36 rounded-full flex items-center justify-center shadow-lg">
            <div className="w-40 h-40 sm:w-32 sm:h-32 xs:w-28 xs:h-28 rounded-full bg-gradient-to-b from-gray-300 to-gray-100 flex items-center justify-center shadow-inner border border-gray-400">
              <div className="w-36 h-36 sm:w-28 sm:h-28 xs:w-24 xs:h-24 rounded-full bg-black border-[6px] sm:border-[4px] xs:border-[3px] border-gray-800 overflow-hidden relative shadow-[inset_0_0_20px_rgba(0,0,0,0.8)]">

                {/* 摄像头视频 */}
                {error ? (
                  <div className="w-full h-full flex items-center justify-center text-white text-xs text-center p-2">
                    {error}
                    <button onClick={startCamera} className="ml-1">
                      <RefreshCw size={12} />
                    </button>
                  </div>
                ) : (
                  <video
                    ref={videoRef}
                    autoPlay
                    playsInline
                    muted
                    className="w-full h-full object-cover transform scale-x-[-1]"
                  />
                )}

                {/* 镜头反射叠加 */}
                <div className="lens-reflection" />
                <div className="absolute top-8 right-8 w-8 h-4 bg-white opacity-20 rounded-full blur-md rotate-45" />
              </div>
            </div>
          </div>
        </div>

        {/* 快门按钮 */}
        <div className="absolute bottom-10 left-8 sm:bottom-8 sm:left-6 xs:bottom-6 xs:left-4">
          <button
            onClick={takePicture}
            disabled={isProcessing || !stream}
            className={`
              w-16 h-16 sm:w-14 sm:h-14 xs:w-12 xs:h-12 rounded-full border-4 sm:border-3 xs:border-2 border-camera-ring shadow-lg
              flex items-center justify-center
              ${isProcessing || !stream 
                ? 'bg-gray-400 cursor-not-allowed' 
                : 'camera-button cursor-pointer'
              }
            `}
          >
            <div className="w-12 h-12 sm:w-10 sm:h-10 xs:w-8 xs:h-8 rounded-full border-2 xs:border-1 border-black/10 bg-white/10" />
          </button>

          {/* 点击提示 */}
          <div className="absolute -bottom-8 sm:-bottom-6 xs:-bottom-5 left-4 sm:left-3 xs:left-2 pointer-events-none animate-bounce opacity-50">
            <div className="bg-white px-2 py-1 rounded text-[10px] sm:text-[8px] xs:text-[7px] font-bold shadow text-gray-600">
              CLICK
            </div>
          </div>
        </div>

        {/* 品牌标识 */}
        <div className="absolute bottom-6 right-8 sm:bottom-4 sm:right-6 xs:bottom-3 xs:right-4 pointer-events-none">
          <span className="font-bold text-gray-400 text-sm sm:text-xs xs:text-[10px] tracking-widest font-mono opacity-60">
            INSTA-AI
          </span>
        </div>
      </div>

      {/* 闪光叠加 */}
      {flash && (
        <div className="fixed inset-0 bg-white z-50 animate-out fade-out duration-300 pointer-events-none" />
      )}

      <canvas ref={canvasRef} className="hidden" />
    </div>
  );
};
