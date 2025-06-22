
import React, { createContext, useContext, useState, useCallback } from 'react';

interface TTSContextType {
  speak: (text: string, priority?: 'high' | 'normal') => Promise<void>;
  speakQuestion: (question: string, options: string[]) => Promise<void>;
  isEnabled: boolean;
  toggle: () => void;
  isSupported: boolean;
  isSpeaking: boolean;
  stopSpeaking: () => void;
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
  const [isSpeaking, setIsSpeaking] = useState(false);

  const stopSpeaking = useCallback(() => {
    if ('speechSynthesis' in window) {
      speechSynthesis.cancel();
      setIsSpeaking(false);
      console.log('TTS: Speech stopped');
    }
  }, []);

  const speak = useCallback(async (text: string, priority: 'high' | 'normal' = 'normal') => {
    if (!isEnabled || !text.trim() || !isSupported) {
      console.log('TTS: Not speaking - enabled:', isEnabled, 'text:', !!text.trim(), 'supported:', isSupported);
      return;
    }

    try {
      console.log('TTS: Speaking text:', text);
      
      // Cancel any ongoing speech if high priority
      if (priority === 'high') {
        speechSynthesis.cancel();
        setIsSpeaking(false);
      }
      
      // Wait for cancellation to complete
      await new Promise(resolve => setTimeout(resolve, 100));
      
      return new Promise<void>((resolve) => {
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.lang = "en-US";
        utterance.pitch = 1;
        utterance.rate = 0.9;
        utterance.volume = 0.8;
        
        utterance.onstart = () => {
          setIsSpeaking(true);
          console.log('TTS: Speech started');
        };
        
        utterance.onerror = (event) => {
          console.log('TTS: Speech error:', event.error);
          setIsSpeaking(false);
          resolve();
        };
        
        utterance.onend = () => {
          console.log('TTS: Speech finished');
          setIsSpeaking(false);
          resolve();
        };
        
        speechSynthesis.speak(utterance);
      });
    } catch (error) {
      console.log('TTS error:', error);
      setIsSpeaking(false);
    }
  }, [isEnabled, isSupported]);

  const speakQuestion = useCallback(async (question: string, options: string[]) => {
    if (!isEnabled || !isSupported) return;

    try {
      // Speak the question first
      await speak(`Question: ${question}`, 'high');
      
      // Wait a moment between question and options
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Speak the options
      const optionsText = options.map((option, index) => 
        `Option ${String.fromCharCode(65 + index)}: ${option}`
      ).join('. ');
      
      await speak(`The options are: ${optionsText}`, 'normal');
      
    } catch (error) {
      console.log('TTS: Error speaking question and options:', error);
    }
  }, [speak, isEnabled, isSupported]);

  const toggle = useCallback(() => {
    setIsEnabled(prev => {
      const newState = !prev;
      console.log('TTS: Toggled to:', newState);
      
      if (newState && isSupported) {
        // Stop any current speech when enabling
        stopSpeaking();
        setTimeout(() => {
          speak("Text to speech enabled! Questions and answers will now be read aloud.", 'high');
        }, 200);
      } else {
        // Stop speech when disabling
        stopSpeaking();
      }
      
      return newState;
    });
  }, [speak, isSupported, stopSpeaking]);

  return (
    <TTSContext.Provider value={{ 
      speak, 
      speakQuestion, 
      isEnabled, 
      toggle, 
      isSupported, 
      isSpeaking,
      stopSpeaking 
    }}>
      {children}
    </TTSContext.Provider>
  );
};
