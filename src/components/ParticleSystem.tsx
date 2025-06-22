
import React, { useEffect, useRef } from 'react';
import { Star, Sparkles, Heart } from 'lucide-react';

interface ParticleSystemProps {
  type?: 'default' | 'confetti' | 'stars';
}

export const ParticleSystem: React.FC<ParticleSystemProps> = ({ type = 'default' }) => {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    const container = containerRef.current;
    const particleCount = type === 'confetti' ? 50 : 20;
    
    // Clear existing particles
    container.innerHTML = '';

    for (let i = 0; i < particleCount; i++) {
      const particle = document.createElement('div');
      particle.className = 'absolute pointer-events-none';
      
      if (type === 'confetti') {
        const colors = ['text-yellow-400', 'text-pink-400', 'text-blue-400', 'text-green-400', 'text-purple-400'];
        const randomColor = colors[Math.floor(Math.random() * colors.length)];
        
        particle.innerHTML = `<div class="w-2 h-2 ${randomColor} animate-spin">${getRandomEmoji()}</div>`;
        particle.style.left = `${Math.random() * 100}%`;
        particle.style.top = `${Math.random() * 100}%`;
        particle.style.animationDelay = `${Math.random() * 2}s`;
        particle.style.animationDuration = `${2 + Math.random() * 3}s`;
        particle.classList.add('animate-bounce');
      } else if (type === 'stars') {
        particle.innerHTML = '<div class="w-1 h-1 bg-white/40 rounded-full animate-pulse"></div>';
        particle.style.left = `${Math.random() * 100}%`;
        particle.style.top = `${Math.random() * 100}%`;
        particle.style.animationDelay = `${Math.random() * 3}s`;
        particle.style.animationDuration = `${2 + Math.random() * 4}s`;
        particle.classList.add('animate-float');
      } else {
        // Default floating particles
        particle.innerHTML = '<div class="w-1 h-1 bg-white/30 rounded-full"></div>';
        particle.style.left = `${Math.random() * 100}%`;
        particle.style.top = `${Math.random() * 100}%`;
        particle.style.animationDelay = `${Math.random() * 3}s`;
        particle.style.animationDuration = `${3 + Math.random() * 2}s`;
        particle.classList.add('animate-float');
      }
      
      container.appendChild(particle);
    }

    // Auto-cleanup for confetti
    if (type === 'confetti') {
      const cleanup = setTimeout(() => {
        container.innerHTML = '';
      }, 5000);
      
      return () => clearTimeout(cleanup);
    }
  }, [type]);

  const getRandomEmoji = () => {
    const emojis = ['⭐', '✨', '🎉', '🎊', '💫', '🌟'];
    return emojis[Math.floor(Math.random() * emojis.length)];
  };

  return (
    <div 
      ref={containerRef}
      className="fixed inset-0 pointer-events-none z-10"
    />
  );
};
