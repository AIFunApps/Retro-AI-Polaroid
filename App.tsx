import React, { useState, useRef } from 'react';
import { Camera } from './components/Camera';
import { Polaroid } from './components/Polaroid';
import { PolaroidPhoto } from './types';
import { generatePhotoCaption } from './services/geminiService';
import { v4 as uuidv4 } from 'uuid';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronUp } from 'lucide-react';

const App: React.FC = () => {
  const [photos, setPhotos] = useState<PolaroidPhoto[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isCameraVisible, setIsCameraVisible] = useState(true);
  const containerRef = useRef<HTMLDivElement>(null);

  const handleCapture = async (dataUrl: string) => {
    if (isProcessing) return;
    setIsProcessing(true);

    // 1. Create the photo object immediately for the animation
    const newPhoto: PolaroidPhoto = {
      id: uuidv4(),
      imageUrl: dataUrl,
      timestamp: Date.now(),
      caption: "", // Empty initially
      x: 50, // Start near the camera ejection point relative to container
      y: window.innerHeight - 450, // Approximate top of camera
      rotation: (Math.random() - 0.5) * 10, // Random slight tilt
      isDeveloping: true,
    };

    // Add to state to trigger render
    setPhotos((prev) => [...prev, newPhoto]);

    // 2. Animate "Ejection" logic
    // We'll simulate the ejection by updating its position after a brief moment
    setTimeout(() => {
        setPhotos((prev) => prev.map(p =>
            p.id === newPhoto.id
            ? { ...p, y: p.y - 200, x: p.x + (Math.random() * 50) } // Move up and slightly random X
            : p
        ));
    }, 100);

    // 3. Stop "developing" visual effect after 5 seconds
    setTimeout(() => {
      setPhotos((prev) =>
        prev.map((p) => (p.id === newPhoto.id ? { ...p, isDeveloping: false } : p))
      );
      setIsProcessing(false);
    }, 3000); // Allow next shot sooner than full develop

    // 4. Fetch AI Caption in background
    try {
      const caption = await generatePhotoCaption(dataUrl);
      setPhotos((prev) =>
        prev.map((p) => (p.id === newPhoto.id ? { ...p, caption } : p))
      );
    } catch (e) {
      console.error("Failed to caption", e);
      setPhotos((prev) =>
        prev.map((p) => (p.id === newPhoto.id ? { ...p, caption: "Start of something new" } : p))
      );
    }
  };

  const handleDragEnd = (id: string, x: number, y: number) => {
    setPhotos((prev) =>
      prev.map((p) => (p.id === id ? { ...p, x, y } : p))
    );
  };

  const handleDeletePhoto = (id: string) => {
    setPhotos((prev) => prev.filter((p) => p.id !== id));
  };

  return (
    <div
        ref={containerRef}
        className="relative w-full h-screen overflow-hidden bg-gray-300"
        style={{
          backgroundImage: 'radial-gradient(#ccc 1px, transparent 1px)',
          backgroundSize: '20px 20px'
        }}
    >
      {/* Header / Instructions */}
      <div className="absolute top-4 z-40 pointer-events-none" style={{ left: '50%', transform: 'translateX(-50%)' }}>
        <div className="bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full shadow-lg border border-gray-200">
            <h1 className="text-lg font-bold text-gray-800 handwritten">My Photo Wall</h1>
        </div>
      </div>

      {/* Photo Layer */}
      <div className="absolute inset-0 z-20 pointer-events-none">
         {/* The container is pointer-events-none so clicks pass through to background,
             but individual polaroids are pointer-events-auto */}
        <AnimatePresence>
          {photos.map((photo) => (
            <Polaroid
              key={photo.id}
              photo={photo}
              containerRef={containerRef}
              onDragEnd={handleDragEnd}
              onDelete={handleDeletePhoto}
            />
          ))}
        </AnimatePresence>
      </div>

      {/* Camera Layer */}
      <div className="absolute bottom-10 left-0 right-0 z-30 flex justify-center">
        <AnimatePresence>
          {isCameraVisible && (
            <motion.div
              initial={{ y: 100, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 100, opacity: 0 }}
              transition={{ duration: 0.5, ease: 'easeInOut' }}
            >
              <Camera
                onCapture={handleCapture}
                isProcessing={isProcessing}
                onHide={() => setIsCameraVisible(false)}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* 显示相机按钮 */}
      {!isCameraVisible && (
        <div className="absolute bottom-10 left-0 right-0 z-30 flex justify-center">
          <motion.div
            initial={{ y: 50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.3 }}
          >
            <button
              onClick={() => setIsCameraVisible(true)}
              className="px-4 py-2 rounded-full bg-white/30 backdrop-blur-md hover:bg-white/40 shadow-lg flex items-center gap-1.5 transition-all duration-200 hover:scale-105 border border-white/20"
              title="显示相机"
            >
              <ChevronUp size={16} className="text-gray-700" />
              <span className="text-sm font-medium text-gray-700">显示</span>
            </button>
          </motion.div>
        </div>
      )}

      {/* Footer / Credits */}
      <div className="rounded-full absolute bottom-2 text-gray-500 text-xs font-mono z-40 bg-white/70 px-2 py-1 rounded pointer-events-none" style={{ left: '50%', transform: 'translateX(-50%)' }}>
        Powered by Gemini 2.5
      </div>
    </div>
  );
};

export default App;
