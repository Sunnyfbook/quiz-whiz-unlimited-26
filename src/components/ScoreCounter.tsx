
import React from 'react';
import { Trophy, Target, Zap } from 'lucide-react';

interface ScoreCounterProps {
  score: number;
  totalQuestions: number;
  streak: number;
}

export const ScoreCounter: React.FC<ScoreCounterProps> = ({ score, totalQuestions, streak }) => {
  const accuracy = totalQuestions > 0 ? Math.round((score / totalQuestions) * 100) : 0;

  return (
    <div className="flex items-center gap-4 text-white/90">
      <div className="flex items-center gap-2 px-4 py-2 bg-white/10 rounded-full backdrop-blur-sm hover:bg-white/15 transition-colors">
        <Trophy className="w-4 h-4 text-yellow-400" />
        <span className="font-bold text-lg animate-pulse">{score}</span>
        <span className="text-sm">/ {totalQuestions}</span>
      </div>
      
      {accuracy > 0 && (
        <div className="flex items-center gap-2 px-3 py-2 bg-white/10 rounded-full backdrop-blur-sm">
          <Target className="w-4 h-4 text-blue-400" />
          <span className="text-sm font-medium">{accuracy}%</span>
        </div>
      )}
      
      {streak > 1 && (
        <div className="flex items-center gap-2 px-3 py-2 bg-gradient-to-r from-orange-500/20 to-red-500/20 rounded-full backdrop-blur-sm border border-orange-400/30 animate-pulse">
          <Zap className="w-4 h-4 text-orange-400" />
          <span className="text-sm font-bold text-orange-200">{streak} streak!</span>
        </div>
      )}
    </div>
  );
};
