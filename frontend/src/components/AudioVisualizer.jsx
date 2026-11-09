import React from 'react';

export default function AudioVisualizer({ isSpeaking = false, color = 'bg-purple-500' }) {
  const bars = [14, 28, 45, 20, 36, 52, 26, 40, 18, 32, 48, 22];

  return (
    <div className="flex items-center gap-1 h-8 px-2 py-1">
      {bars.map((height, i) => (
        <span
          key={i}
          className={`w-1 rounded-full transition-all duration-300 ${color} ${
            isSpeaking ? 'animate-pulse' : 'opacity-40'
          }`}
          style={{
            height: isSpeaking ? `${Math.max(6, (height * (0.6 + Math.random() * 0.8)))}px` : '4px',
            animationDelay: `${i * 70}ms`,
          }}
        />
      ))}
    </div>
  );
}

