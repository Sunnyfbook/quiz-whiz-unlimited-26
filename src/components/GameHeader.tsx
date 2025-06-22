
import React from 'react';
import { Button } from '@/components/ui/button';
import { Volume2, VolumeX } from 'lucide-react';

interface GameHeaderProps {
  speechEnabled: boolean;
  toggleSpeech: () => void;
}

export const GameHeader: React.FC<GameHeaderProps> = ({ speechEnabled, toggleSpeech }) => {
  return (
    <div className="flex justify-end items-center mb-3 md:mb-6 gap-2">
      <Button
        onClick={toggleSpeech}
        variant="ghost"
        size="sm"
        className="text-white hover:bg-blue-700/50 rounded-full p-2 md:p-3"
      >
        {speechEnabled ? (
          <Volume2 className="w-5 h-5 md:w-6 md:h-6" />
        ) : (
          <VolumeX className="w-5 h-5 md:w-6 md:h-6" />
        )}
      </Button>
    </div>
  );
};
