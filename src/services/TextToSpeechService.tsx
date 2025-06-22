
import React, { createContext, useContext, useState, useCallback } from 'react';
import OpenAI from 'openai';

interface TTSContextType {
  speak: (text: string) => Promise<void>;
  isEnabled: boolean;
  toggle: () => void;
  isSupported: boolean;
  setApiKey: (key: string) => void;
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
  const [apiKey, setApiKey] = useState<string>('');
  const [openai, setOpenai] = useState<OpenAI | null>(null);

  const setApiKeyAndInitialize = useCallback((key: string) => {
    setApiKey(key);
    if (key) {
      const client = new OpenAI({
        apiKey: key,
        dangerouslyAllowBrowser: true
      });
      setOpenai(client);
    } else {
      setOpenai(null);
    }
  }, []);

  const speak = useCallback(async (text: string) => {
    if (!isEnabled || !text.trim()) return;

    try {
      console.log('TTS: Speaking with OpenAI:', text);
      
      if (openai && apiKey) {
        // Use OpenAI TTS API
        const response = await openai.audio.speech.create({
          model: "tts-1",
          voice: "nova",
          input: text,
          response_format: "mp3",
        });

        const audioBlob = new Blob([await response.arrayBuffer()], { type: 'audio/mpeg' });
        const audioUrl = URL.createObjectURL(audioBlob);
        const audio = new Audio(audioUrl);
        
        return new Promise<void>((resolve) => {
          audio.onended = () => {
            URL.revokeObjectURL(audioUrl);
            resolve();
          };
          audio.onerror = () => {
            console.log('OpenAI TTS failed, falling back to browser TTS');
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
        // Fallback to browser TTS if no API key
        fallbackTTS(text);
      }
    } catch (error) {
      console.log('OpenAI TTS error, using browser fallback:', error);
      fallbackTTS(text);
    }
  }, [isEnabled, openai, apiKey]);

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
        if (apiKey) {
          speak("OpenAI text to speech enabled!");
        } else {
          speak("Browser text to speech enabled! Add your OpenAI API key for better quality.");
        }
      }
      return newState;
    });
  }, [speak, apiKey]);

  return (
    <TTSContext.Provider value={{ speak, isEnabled, toggle, isSupported, setApiKey: setApiKeyAndInitialize }}>
      {children}
    </TTSContext.Provider>
  );
};
