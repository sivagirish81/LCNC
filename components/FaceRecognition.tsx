'use client';

import React, { useEffect, useRef, useState } from 'react';

interface FaceRecognitionProps {
  onRecognitionResult: (isRecognized: boolean) => void;
  referenceImages: string[];
}

const FaceRecognition: React.FC<FaceRecognitionProps> = ({ onRecognitionResult, referenceImages }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isChecking, setIsChecking] = useState(false);

  useEffect(() => {
    const startWebcam = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true });
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
      } catch (err) {
        console.error('Error accessing webcam:', err);
      }
    };
    startWebcam();

    return () => {
      if (videoRef.current?.srcObject) {
        const tracks = (videoRef.current.srcObject as MediaStream).getTracks();
        tracks.forEach(track => track.stop());
      }
    };
  }, []);

  const compareImages = async () => {
    if (!videoRef.current || !canvasRef.current || isChecking) return;
    setIsChecking(true);

    const video = videoRef.current;
    const canvas = canvasRef.current;
    const context = canvas.getContext('2d');
    if (!context) return;

    // Set canvas size to match video
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    
    // Draw current frame from video
    context.drawImage(video, 0, 0);
    const currentFrame = context.getImageData(0, 0, canvas.width, canvas.height);

    // Compare with reference images
    for (const refImageUrl of referenceImages) {
      const img = new Image();
      img.src = refImageUrl;
      await new Promise((resolve) => {
        img.onload = async () => {
          // Draw reference image
          context.clearRect(0, 0, canvas.width, canvas.height);
          context.drawImage(img, 0, 0, canvas.width, canvas.height);
          const refImageData = context.getImageData(0, 0, canvas.width, canvas.height);

          // Simple pixel comparison with more tolerance
          let matchingPixels = 0;
          let totalPixels = currentFrame.data.length / 4;

          // Sample every 4th pixel for faster comparison
          for (let i = 0; i < currentFrame.data.length; i += 16) {
            const diff = Math.abs(currentFrame.data[i] - refImageData.data[i]) +
                        Math.abs(currentFrame.data[i + 1] - refImageData.data[i + 1]) +
                        Math.abs(currentFrame.data[i + 2] - refImageData.data[i + 2]);
            if (diff < 200) { // More tolerant threshold
              matchingPixels++;
            }
          }

          const similarity = matchingPixels / (totalPixels / 4); // Adjust for sampling
          console.log('Similarity score:', similarity);

          if (similarity > 0.3) { // More lenient threshold (30% match)
            console.log('Match found!');
            onRecognitionResult(true);
            setIsChecking(false);
            return;
          }
          resolve(null);
        };
      });
    }
    
    setIsChecking(false);
  };

  useEffect(() => {
    const interval = setInterval(compareImages, 1000);
    return () => clearInterval(interval);
  }, [isChecking]);

  return (
    <div className="fixed top-4 right-4 w-[160px] h-[120px] overflow-hidden rounded-lg shadow-lg">
      <video
        ref={videoRef}
        autoPlay
        playsInline
        muted
        className="w-full h-full object-cover"
      />
      <canvas
        ref={canvasRef}
        className="hidden"
      />
    </div>
  );
};

export default FaceRecognition; 