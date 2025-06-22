
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
  const [isSupported] = useState(true);

  const speak = useCallback(async (text: string) => {
    if (!isEnabled || !text.trim()) return;

    try {
      console.log('TTS: Speaking with Kokoro:', text);
      
      // Use Kokoro TTS API - it's free and open source
      const response = await fetch('https://kokoro-api.tech/tts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          text: text,
          voice: 'af_sarah', // Default voice
          speed: 1.0,
          format: 'mp3'
        })
      });

      if (response.ok) {
        const audioBlob = await response.blob();
        const audioUrl = URL.createObjectURL(audioBlob);
        const audio = new Audio(audioUrl);
        
        return new Promise<void>((resolve) => {
          audio.onended = () => {
            URL.revokeObjectURL(audioUrl);
            resolve();
          };
          audio.onerror = () => {
            console.log('Kokoro TTS failed, falling back to browser TTS');
            fallbackTTS(text);
            resolve();
          };
          audio.play().catch(() => {
            console.log('Audio play failed, falling back to browser TTS');
            fallbackTTS(text);
            resolve();
          });
        });
      } else {
        throw new Error('Kokoro TTS API error');
      }
    } catch (error) {
      console.log('Kokoro TTS error, using browser fallback:', error);
      fallbackTTS(text);
    }
  }, [isEnabled]);

  const fallbackTTS = useCallback((text: string) => {
    if (!('speechSynthesis' in window)) {
      console.log('Speech synthesis not supported');
      return;
    }

    try {
      // Cancel any ongoing speech
      window.speechSynthesis.cancel();
      
      // Small delay to ensure cancellation
      setTimeout(() => {
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.rate = 0.9;
        utterance.pitch = 1.0;
        utterance.volume = 0.8;
        utterance.lang = 'en-US';
        
        utterance.onerror = (event) => {
          console.log('Speech synthesis error:', event.error);
        };
        
        utterance.onend = () => {
          console.log('Speech finished');
        };
        
        window.speechSynthesis.speak(utterance);
      }, 100);
    } catch (error) {
      console.log('Fallback TTS error:', error);
    }
  }, []);

  const toggle = useCallback(() => {
    setIsEnabled(prev => {
      const newState = !prev;
      if (newState) {
        speak("Kokoro text to speech enabled!");
      }
      return newState;
    });
  }, [speak]);

  return (
    <TTSContext.Provider value={{ speak, isEnabled, toggle, isSupported }}>
      {children}
    </TTSContext.Provider>
  );
};
