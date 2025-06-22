
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Volume2, VolumeX, Settings } from 'lucide-react';
import { useTextToSpeech } from '../services/TextToSpeechService';

interface GameHeaderProps {
  speechEnabled: boolean;
  toggleSpeech: () => void;
}

export const GameHeader: React.FC<GameHeaderProps> = ({ speechEnabled, toggleSpeech }) => {
  const [showSettings, setShowSettings] = useState(false);
  const [apiKeyInput, setApiKeyInput] = useState('');
  const { setApiKey } = useTextToSpeech();

  const handleSaveApiKey = () => {
    setApiKey(apiKeyInput);
    setShowSettings(false);
  };

  return (
    <div className="flex justify-end items-center mb-3 md:mb-6 gap-2">
      <Button
        onClick={() => setShowSettings(!showSettings)}
        variant="ghost"
        size="sm"
        className="text-white hover:bg-blue-700/50 rounded-full p-2 md:p-3"
      >
        <Settings className="w-5 h-5 md:w-6 md:h-6" />
      </Button>
      
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

      {showSettings && (
        <div className="absolute top-16 right-0 bg-blue-900/90 rounded-lg p-4 border border-blue-600/50 backdrop-blur-sm z-10">
          <div className="space-y-3">
            <div>
              <label className="text-white text-sm mb-2 block">OpenAI API Key (for better TTS quality):</label>
              <Input
                type="password"
                placeholder="sk-..."
                value={apiKeyInput}
                onChange={(e) => setApiKeyInput(e.target.value)}
                className="bg-blue-800 border-blue-600 text-white placeholder-blue-300"
              />
            </div>
            <div className="flex gap-2">
              <Button
                onClick={handleSaveApiKey}
                size="sm"
                className="bg-blue-600 hover:bg-blue-700 text-white"
              >
                Save
              </Button>
              <Button
                onClick={() => setShowSettings(false)}
                variant="ghost"
                size="sm"
                className="text-white hover:bg-blue-700/50"
              >
                Cancel
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
