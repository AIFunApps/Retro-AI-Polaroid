import React, { useState, useRef } from 'react';
import { Camera } from './components/Camera';
import { Polaroid } from './components/Polaroid';
import { PolaroidPhoto } from './types';
import { v4 as uuidv4 } from 'uuid';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronUp } from 'lucide-react';

const App: React.FC = () => {
  const [photos, setPhotos] = useState<PolaroidPhoto[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isCameraVisible, setIsCameraVisible] = useState(true);
  const [memoryPrompt, setMemoryPrompt] = useState('这一刻，我想记住...');
  const [backgroundColor, setBackgroundColor] = useState('#ffffff');
  const [backgroundImage, setBackgroundImage] = useState<string | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const photoAreaRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // 预设背景颜色选项（扩展更多颜色）
  const backgroundColors = [
    {name: '白色', value: '#ffffff'},
    {name: '浅灰', value: '#f5f5f5'},
    {name: '米色', value: '#faf8f3'},
    {name: '浅蓝', value: '#e8f4f8'},
    {name: '浅粉', value: '#fef0f0'},
    {name: '浅绿', value: '#f0f8f0'},
    {name: '浅黄', value: '#fffef0'},
    {name: '浅紫', value: '#f5f0f8'},
    {name: '深灰', value: '#2d2d2d'},
    {name: '黑色', value: '#000000'},
    {name: '深蓝', value: '#1e3a5f'},
    {name: '深绿', value: '#2d5016'},
    {name: '深红', value: '#8b0000'},
    {name: '深紫', value: '#4b0082'},
    {name: '棕色', value: '#8b4513'},
    {name: '橙色', value: '#ff8c00'},
    {name: '青色', value: '#00ced1'},
    {name: '玫瑰金', value: '#e8b4b8'},
    {name: '薄荷绿', value: '#98fb98'},
    {name: '薰衣草', value: '#e6e6fa'},
    {name: '珊瑚色', value: '#ff7f50'},
    {name: '天蓝色', value: '#87ceeb'},
    {name: '桃色', value: '#ffdab9'},
    {name: '淡紫色', value: '#dda0dd'},
    {name: '淡绿色', value: '#90ee90'},
    {name: '淡黄色', value: '#ffffe0'},
    {name: '淡蓝色', value: '#add8e6'},
    {name: '淡粉色', value: '#ffb6c1'}
  ];

  // 处理背景图片上传
  const handleBackgroundImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const imageUrl = event.target?.result as string;
        setBackgroundImage(imageUrl);
        setBackgroundColor('#ffffff'); // 使用图片时重置颜色
      };
      reader.readAsDataURL(file);
    }
  };

  // 清除背景图片
  const handleClearBackgroundImage = () => {
    setBackgroundImage(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleCapture = async (dataUrl: string) => {
    if (isProcessing) return;
    setIsProcessing(true);

    // 1. Create the photo object immediately for the animation
    const newPhoto: PolaroidPhoto = {
      id: uuidv4(),
      imageUrl: dataUrl,
      timestamp: Date.now(),
      caption: memoryPrompt || '这一刻，我想记住...', // Use input prompt as caption
      x: 100, // Start position relative to photo area
      y: 100, // Start position relative to photo area
      rotation: (Math.random() - 0.5) * 10, // Random slight tilt
      isDeveloping: true
    };

    // Add to state to trigger render
    setPhotos((prev) => [...prev, newPhoto]);

    // 2. Animate "Ejection" logic
    // We'll simulate the ejection by updating its position after a brief moment
    setTimeout(() => {
      setPhotos((prev) => prev.map(p =>
        p.id === newPhoto.id
          ? {...p, y: p.y - 200, x: p.x + (Math.random() * 50)} // Move up and slightly random X
          : p
      ));
    }, 100);

    // 3. Stop "developing" visual effect after 5 seconds
    setTimeout(() => {
      setPhotos((prev) =>
        prev.map((p) => (p.id === newPhoto.id ? {...p, isDeveloping: false} : p))
      );
      setIsProcessing(false);
    }, 3000); // Allow next shot sooner than full develop
  };

  const handleDragEnd = (id: string, x: number, y: number) => {
    setPhotos((prev) =>
      prev.map((p) => (p.id === id ? {...p, x, y} : p))
    );
  };

  const handleDeletePhoto = (id: string) => {
    setPhotos((prev) => prev.filter((p) => p.id !== id));
  };

  return (
    <div
      ref={containerRef}
      className="relative w-full h-screen overflow-hidden bg-black/80 p-4 flex flex-col"
    >
      {/* Background Color Picker */}
      <div className="bg-white/90 backdrop-blur-sm px-4 py-3 rounded-lg shadow-lg border border-gray-200 flex-shrink-0">
        <div className="flex items-center gap-3 overflow-x-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100">
          <span className="text-sm text-gray-700 font-medium whitespace-nowrap">背景设置:</span>
          <div className="flex items-center gap-2">
            <label className="cursor-pointer">
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleBackgroundImageUpload}
                className="hidden"
              />
              <div className="px-3 py-1.5 bg-blue-500 text-white text-xs rounded-lg hover:bg-blue-600 transition-colors whitespace-nowrap">
                上传图片
              </div>
            </label>
            {backgroundImage && (
              <button
                onClick={handleClearBackgroundImage}
                className="px-3 py-1.5 bg-red-500 text-white text-xs rounded-lg hover:bg-red-600 transition-colors whitespace-nowrap"
              >
                清除图片
              </button>
            )}
          </div>
          <span className="text-sm text-gray-700 font-medium whitespace-nowrap ml-2">背景颜色:</span>
          <div className="flex items-center gap-2 min-w-max">
            {backgroundColors.map((color) => (
              <button
                key={color.value}
                onClick={() => {
                  setBackgroundColor(color.value);
                  setBackgroundImage(null); // 选择颜色时清除图片
                }}
                className={`w-8 h-8 rounded-full border-2 transition-all flex-shrink-0 ${
                  backgroundColor === color.value && !backgroundImage
                    ? 'border-gray-800 scale-110 shadow-md'
                    : 'border-gray-300 hover:border-gray-500 hover:scale-105'
                }`}
                style={{backgroundColor: color.value}}
                title={color.name}
              />
            ))}
            <input
              type="color"
              value={backgroundColor}
              onChange={(e) => {
                setBackgroundColor(e.target.value);
                setBackgroundImage(null); // 选择颜色时清除图片
              }}
              className="w-8 h-8 rounded-full border-2 border-gray-300 cursor-pointer hover:border-gray-500 transition-all hover:scale-105 flex-shrink-0"
              title="自定义颜色"
            />
          </div>
        </div>
      </div>

      {/* Photo Display Area */}
      <div
        ref={photoAreaRef}
        className="flex-1 top-2 w-full bottom-4 z-10 rounded-lg shadow-2xl border-2 border-gray-200 overflow-hidden relative"
        style={{
          backgroundColor: backgroundImage ? 'transparent' : backgroundColor,
          backgroundImage: backgroundImage ? `url(${backgroundImage})` : 'none',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat'
        }}
      >
        {/* Photo Layer inside the area */}
        <div className="absolute inset-0 z-20 pointer-events-none">
          <AnimatePresence>
            {photos.map((photo) => (
              <Polaroid
                key={photo.id}
                photo={photo}
                containerRef={photoAreaRef}
                onDragEnd={handleDragEnd}
                onDelete={handleDeletePhoto}
              />
            ))}
          </AnimatePresence>
        </div>
      </div>


      {/* Memory Prompt Input */}
      {isCameraVisible && (
        <div className="absolute bottom-96 left-0 right-0 z-40 flex justify-center">
          <motion.div
            initial={{y: 20, opacity: 0}}
            animate={{y: 0, opacity: 1}}
            transition={{duration: 0.3, delay: 0.2}}
            className="w-80"
          >
            <input
              type="text"
              value={memoryPrompt}
              onChange={(e) => setMemoryPrompt(e.target.value)}
              placeholder="这一刻，我想记住..."
              className="w-full px-4 py-2.5 rounded-full bg-white/30 backdrop-blur-md border border-white/20 shadow-lg text-sm text-gray-700 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-white/50 focus:bg-white/40 transition-all duration-200"
            />
          </motion.div>
        </div>
      )}

      {/* Camera Layer */}
      <div className="absolute bottom-10 left-0 right-0 z-30 flex justify-center">
        <AnimatePresence>
          {isCameraVisible && (
            <motion.div
              initial={{y: 100, opacity: 0}}
              animate={{y: 0, opacity: 1}}
              exit={{y: 100, opacity: 0}}
              transition={{duration: 0.5, ease: 'easeInOut'}}
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
            initial={{y: 50, opacity: 0}}
            animate={{y: 0, opacity: 1}}
            transition={{duration: 0.3}}
          >
            <button
              onClick={() => setIsCameraVisible(true)}
              className="px-4 py-2 rounded-full bg-white/30 backdrop-blur-md hover:bg-white/40 shadow-lg flex items-center gap-1.5 transition-all duration-200 hover:scale-105 border border-white/20"
              title="显示相机"
            >
              <ChevronUp size={16} className="text-gray-700"/>
              <span className="text-sm font-medium text-gray-700">显示</span>
            </button>
          </motion.div>
        </div>
      )}

      {/* Footer / Credits */}
      <div
        className="rounded-full absolute bottom-2 text-gray-500 text-xs font-mono z-40 bg-white/70 px-2 py-1 rounded pointer-events-none"
        style={{left: '50%', transform: 'translateX(-50%)'}}>
        Powered by Gemini 2.5
      </div>
    </div>
  );
};

export default App;
