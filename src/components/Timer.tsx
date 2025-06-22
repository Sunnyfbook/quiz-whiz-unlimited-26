
import React from 'react';
import { Progress } from '@/components/ui/progress';

interface TimerProps {
  timeLeft: number;
}

export const Timer: React.FC<TimerProps> = ({ timeLeft }) => {
  return (
    <div className="bg-blue-900/80 rounded-xl p-3 md:p-4 border border-blue-600/50">
      <div className="flex justify-between items-center mb-2">
        <span className="text-white font-medium text-sm md:text-base">Time Remaining:</span>
        <span className={`font-bold text-lg md:text-xl ${timeLeft <= 5 ? 'text-red-400' : 'text-white'}`}>
          {timeLeft}s
        </span>
      </div>
      <Progress 
        value={(timeLeft / 15) * 100} 
        className="h-2 md:h-3 bg-blue-800"
      />
    </div>
  );
};
