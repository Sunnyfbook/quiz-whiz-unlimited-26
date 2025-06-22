
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
  apiKey?: string;
}

export const TextToSpeechProvider: React.FC<TextToSpeechProviderProps> = ({ 
  children, 
  apiKey 
}) => {
  const [isEnabled, setIsEnabled] = useState(false);
  const [isSupported] = useState(true); // ElevenLabs is always supported

  const speak = useCallback(async (text: string) => {
    if (!isEnabled || !text.trim()) return;

    try {
      console.log('TTS: Speaking:', text);
      
      if (apiKey) {
        // Use ElevenLabs API for high-quality TTS
        const response = await fetch('https://api.elevenlabs.io/v1/text-to-speech/21m00Tcm4TlvDq8ikWAM', {
          method: 'POST',
          headers: {
            'Accept': 'audio/mpeg',
            'Content-Type': 'application/json',
            'xi-api-key': apiKey
          },
          body: JSON.stringify({
            text: text,
            model_id: 'eleven_monolingual_v1',
            voice_settings: {
              stability: 0.5,
              similarity_boost: 0.5
            }
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
              console.log('Audio playback error, falling back to browser TTS');
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
          throw new Error('ElevenLabs API error');
        }
      } else {
        // Fallback to browser TTS with improved reliability
        fallbackTTS(text);
      }
    } catch (error) {
      console.log('TTS error, using fallback:', error);
      fallbackTTS(text);
    }
  }, [isEnabled, apiKey]);

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
        speak("Text to speech enabled!");
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
