
import React from 'react';
import { Brain } from 'lucide-react';

export const GameStartScreen: React.FC = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-800 via-blue-900 to-purple-900 flex items-center justify-center p-2 relative">
      <div className="w-full max-w-sm bg-blue-900/80 backdrop-blur-xl border border-blue-600/50 rounded-3xl shadow-2xl p-6 text-center animate-scale-in">
        <div className="mb-6">
          <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full flex items-center justify-center shadow-lg">
            <Brain className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-2xl md:text-4xl font-bold text-white mb-2">
            Trivia Master
          </h1>
          <p className="text-blue-200 text-sm md:text-lg">Challenge Your Mind!</p>
        </div>
        
        <div className="text-blue-200 text-xs md:text-sm animate-pulse">
          Starting in 3 seconds...
        </div>
      </div>
    </div>
  );
};
