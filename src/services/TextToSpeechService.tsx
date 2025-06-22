
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
  const speechRef = useRef<SpeechSynthesisUtterance | null>(null);

  const stopSpeaking = useCallback(() => {
    if ('speechSynthesis' in window) {
      speechSynthesis.cancel();
      setIsSpeaking(false);
      speechRef.current = null;
      console.log('TTS: Speech stopped');
    }
  }, []);

  const speak = useCallback(async (text: string, priority: 'high' | 'normal' = 'normal') => {
    console.log('TTS: Attempting to speak - enabled:', isEnabled, 'text:', text, 'supported:', isSupported);
    
    if (!isEnabled || !text.trim() || !isSupported) {
      console.log('TTS: Not speaking - enabled:', isEnabled, 'text:', !!text.trim(), 'supported:', isSupported);
      return;
    }

    try {
      console.log('TTS: Speaking text:', text);
      
      // Cancel any ongoing speech if high priority
      if (priority === 'high' || isSpeaking) {
        stopSpeaking();
        // Wait for cancellation to complete
        await new Promise(resolve => setTimeout(resolve, 200));
      }
      
      return new Promise<void>((resolve) => {
        const utterance = new SpeechSynthesisUtterance(text);
        speechRef.current = utterance;
        
        // Configure speech settings
        utterance.lang = "en-US";
        utterance.pitch = 1;
        utterance.rate = 0.8;
        utterance.volume = 0.9;
        
        utterance.onstart = () => {
          console.log('TTS: Speech started for:', text.substring(0, 50));
          setIsSpeaking(true);
        };
        
        utterance.onerror = (event) => {
          console.error('TTS: Speech error:', event.error, 'for text:', text.substring(0, 50));
          setIsSpeaking(false);
          speechRef.current = null;
          resolve();
        };
        
        utterance.onend = () => {
          console.log('TTS: Speech finished for:', text.substring(0, 50));
          setIsSpeaking(false);
          speechRef.current = null;
          resolve();
        };
        
        // Speak the utterance
        speechSynthesis.speak(utterance);
        console.log('TTS: Speech synthesis speak called');
      });
    } catch (error) {
      console.error('TTS error:', error);
      setIsSpeaking(false);
      speechRef.current = null;
    }
  }, [isEnabled, isSupported, isSpeaking, stopSpeaking]);

  const speakQuestion = useCallback(async (question: string, options: string[]) => {
    console.log('TTS: Speaking question - enabled:', isEnabled, 'supported:', isSupported);
    
    if (!isEnabled || !isSupported) {
      console.log('TTS: Not speaking question - not enabled or supported');
      return;
    }

    try {
      // Speak the question first
      console.log('TTS: About to speak question:', question);
      await speak(`${question}`, 'high');
      
      // Wait between question and options
      await new Promise(resolve => setTimeout(resolve, 800));
      
      // Speak the options
      const optionsText = options.map((option, index) => 
        `${String.fromCharCode(65 + index)}: ${option}`
      ).join('. ');
      
      console.log('TTS: About to speak options:', optionsText);
      await speak(`Your options are: ${optionsText}`, 'normal');
      
    } catch (error) {
      console.error('TTS: Error speaking question and options:', error);
    }
  }, [speak, isEnabled, isSupported]);

  const toggle = useCallback(() => {
    const newState = !isEnabled;
    console.log('TTS: Toggling from', isEnabled, 'to', newState);
    
    setIsEnabled(newState);
    
    if (newState && isSupported) {
      // Stop any current speech when enabling
      stopSpeaking();
      // Give a moment for state to update, then speak welcome message
      setTimeout(() => {
        console.log('TTS: Playing welcome message');
        speak("Text to speech is now enabled! Questions and answers will be read aloud.", 'high');
      }, 300);
    } else {
      // Stop speech when disabling
      stopSpeaking();
      console.log('TTS: Disabled - speech stopped');
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
