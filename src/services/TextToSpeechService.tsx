
import React, { createContext, useContext, useState, useCallback } from 'react';

interface TTSContextType {
  speak: (text: string) => Promise<void>;
  isEnabled: boolean;
  toggle: () => void;
  isSupported: boolean;
}

const TTSContext = createContext<TTSContextType | null>(null);

export const useTextToSpeech = () => {
  const context = useContext(TTSContext);
  if (!context) {
    throw new Error('useTextToSpeech must be used within a TextToSpeechProvider');
  }
  return context;
};

interface TextToSpeechProviderProps {
  children: React.ReactNode;
}

export const TextToSpeechProvider: React.FC<TextToSpeechProviderProps> = ({ 
  children
}) => {
  const [isEnabled, setIsEnabled] = useState(false);
  const [isSupported] = useState('speechSynthesis' in window);

  const speak = useCallback(async (text: string) => {
    if (!isEnabled || !text.trim() || !isSupported) return;

    try {
      console.log('TTS: Speaking text:', text);
      
      // Cancel any ongoing speech
      speechSynthesis.cancel();
      
      // Small delay to ensure cancellation
      setTimeout(() => {
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.lang = "en-IN";
        utterance.pitch = 1;
        utterance.rate = 1;
        utterance.volume = 1;
        
        utterance.onerror = (event) => {
          console.log('Speech synthesis error:', event.error);
        };
        
        utterance.onend = () => {
          console.log('Speech finished');
        };
        
        speechSynthesis.speak(utterance);
      }, 100);
    } catch (error) {
      console.log('TTS error:', error);
    }
  }, [isEnabled, isSupported]);

  const toggle = useCallback(() => {
    setIsEnabled(prev => {
      const newState = !prev;
      if (newState && isSupported) {
        speak("Text to speech enabled!");
      }
      return newState;
    });
  }, [speak, isSupported]);

  return (
    <TTSContext.Provider value={{ speak, isEnabled, toggle, isSupported }}>
      {children}
    </TTSContext.Provider>
  );
};
