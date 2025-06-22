
import React, { createContext, useContext, useState, useCallback, useRef } from 'react';

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
  const currentUtteranceRef = useRef<SpeechSynthesisUtterance | null>(null);

  const stopSpeaking = useCallback(() => {
    console.log('TTS: Stopping all speech');
    if ('speechSynthesis' in window) {
      speechSynthesis.cancel();
      setIsSpeaking(false);
      currentUtteranceRef.current = null;
    }
  }, []);

  const speak = useCallback(async (text: string, priority: 'high' | 'normal' = 'normal') => {
    console.log('TTS: Speak called - enabled:', isEnabled, 'text:', text.substring(0, 50));
    
    if (!isEnabled || !text.trim() || !isSupported) {
      console.log('TTS: Not speaking - conditions not met');
      return;
    }

    // If high priority, stop current speech
    if (priority === 'high' && isSpeaking) {
      console.log('TTS: High priority - stopping current speech');
      speechSynthesis.cancel();
      await new Promise(resolve => setTimeout(resolve, 100));
    }

    return new Promise<void>((resolve) => {
      const utterance = new SpeechSynthesisUtterance(text);
      currentUtteranceRef.current = utterance;
      
      utterance.lang = "en-US";
      utterance.pitch = 1;
      utterance.rate = 0.9;
      utterance.volume = 1;
      
      utterance.onstart = () => {
        console.log('TTS: Speech started:', text.substring(0, 50));
        setIsSpeaking(true);
      };
      
      utterance.onerror = (event) => {
        console.log('TTS: Speech error (but continuing):', event.error);
        setIsSpeaking(false);
        currentUtteranceRef.current = null;
        resolve();
      };
      
      utterance.onend = () => {
        console.log('TTS: Speech finished:', text.substring(0, 50));
        setIsSpeaking(false);
        currentUtteranceRef.current = null;
        resolve();
      };
      
      try {
        speechSynthesis.speak(utterance);
        console.log('TTS: Speech synthesis started for:', text.substring(0, 50));
      } catch (error) {
        console.error('TTS: Error calling speechSynthesis.speak:', error);
        setIsSpeaking(false);
        currentUtteranceRef.current = null;
        resolve();
      }
    });
  }, [isEnabled, isSupported, isSpeaking]);

  const speakQuestion = useCallback(async (question: string, options: string[]) => {
    console.log('TTS: Speaking question - enabled:', isEnabled);
    
    if (!isEnabled || !isSupported) {
      console.log('TTS: Question speech disabled');
      return;
    }

    try {
      // Speak question first
      await speak(question, 'high');
      
      // Wait a bit then speak options
      await new Promise(resolve => setTimeout(resolve, 800));
      
      const optionsText = options.map((option, index) => 
        `${String.fromCharCode(65 + index)}: ${option}`
      ).join('. ');
      
      await speak(`Your options are: ${optionsText}`, 'normal');
      
    } catch (error) {
      console.error('TTS: Error in speakQuestion:', error);
    }
  }, [speak, isEnabled, isSupported]);

  const toggle = useCallback(() => {
    const newState = !isEnabled;
    console.log('TTS: Toggling from', isEnabled, 'to', newState);
    
    if (!newState) {
      stopSpeaking();
    }
    
    setIsEnabled(newState);
    
    if (newState && isSupported) {
      setTimeout(() => {
        console.log('TTS: Playing welcome message');
        speak("Text to speech is now enabled! Questions and answers will be read aloud.", 'high');
      }, 500);
    }
  }, [isEnabled, speak, isSupported, stopSpeaking]);

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
