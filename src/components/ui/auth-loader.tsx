"use client";

import { useEffect, useState } from "react";

interface AuthLoaderProps {
  show: boolean;
  onComplete?: () => void;
}

export function AuthLoader({ show, onComplete }: AuthLoaderProps) {
  const [progress, setProgress] = useState(0);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (show) {
      setVisible(true);
      setProgress(0);

      // Animate progress bar
      const duration = 2000; // 2 seconds total
      const interval = 16; // ~60fps
      let currentProgress = 0;
      
      const timer = setInterval(() => {
        currentProgress += (interval / duration) * 100;
        
        // Slow down near the end for realistic feel
        if (currentProgress > 70) {
          currentProgress += (interval / duration) * 50;
        }
        
        if (currentProgress >= 100) {
          currentProgress = 100;
          clearInterval(timer);
          
          // Fade out after completion
          setTimeout(() => {
            setVisible(false);
            onComplete?.();
          }, 300);
        }
        
        setProgress(currentProgress);
      }, interval);

      return () => clearInterval(timer);
    }
  }, [show, onComplete]);

  if (!visible) return null;

  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-[#0B0E11] transition-opacity duration-300">
      <div className="animate-fade-in">
        <h1 className="text-5xl font-bold text-gold-bright tracking-tight">
          Tradeon
        </h1>
      </div>
      
      <div className="absolute bottom-0 left-0 right-0 h-1 bg-surface-muted">
        <div 
          className="h-full bg-gold transition-all duration-100 ease-out"
          style={{ width: `${progress}%` }}
        />
      </div>
    </div>
  );
}
