
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
  const speechQueueRef = useRef<Array<{ text: string; priority: 'high' | 'normal' }>>([]);
  const isProcessingRef = useRef(false);

  const stopSpeaking = useCallback(() => {
    if ('speechSynthesis' in window) {
      speechSynthesis.cancel();
      setIsSpeaking(false);
      speechRef.current = null;
      speechQueueRef.current = [];
      isProcessingRef.current = false;
      console.log('TTS: All speech stopped and queue cleared');
    }
  }, []);

  const processQueue = useCallback(async () => {
    if (isProcessingRef.current || speechQueueRef.current.length === 0 || !isEnabled) {
      return;
    }

    isProcessingRef.current = true;
    const { text, priority } = speechQueueRef.current.shift()!;

    try {
      console.log('TTS: Processing from queue:', text.substring(0, 50));
      
      return new Promise<void>((resolve) => {
        const utterance = new SpeechSynthesisUtterance(text);
        speechRef.current = utterance;
        
        utterance.lang = "en-US";
        utterance.pitch = 1;
        utterance.rate = 0.9;
        utterance.volume = 1;
        
        utterance.onstart = () => {
          console.log('TTS: Speech started:', text.substring(0, 50));
          setIsSpeaking(true);
        };
        
        utterance.onerror = (event) => {
          console.error('TTS: Speech error:', event.error);
          setIsSpeaking(false);
          speechRef.current = null;
          isProcessingRef.current = false;
          resolve();
          setTimeout(() => processQueue(), 100);
        };
        
        utterance.onend = () => {
          console.log('TTS: Speech finished:', text.substring(0, 50));
          setIsSpeaking(false);
          speechRef.current = null;
          isProcessingRef.current = false;
          resolve();
          setTimeout(() => processQueue(), 300);
        };
        
        speechSynthesis.speak(utterance);
        console.log('TTS: Speech synthesis called for:', text.substring(0, 50));
      });
    } catch (error) {
      console.error('TTS error:', error);
      setIsSpeaking(false);
      speechRef.current = null;
      isProcessingRef.current = false;
    }
  }, [isEnabled]);

  const speak = useCallback(async (text: string, priority: 'high' | 'normal' = 'normal') => {
    console.log('TTS: Speak requested - enabled:', isEnabled, 'text:', text.substring(0, 50), 'supported:', isSupported);
    
    if (!isEnabled || !text.trim() || !isSupported) {
      console.log('TTS: Not speaking - enabled:', isEnabled, 'text:', !!text.trim(), 'supported:', isSupported);
      return;
    }

    if (priority === 'high') {
      console.log('TTS: High priority - clearing queue and stopping current speech');
      speechQueueRef.current = [];
      if (isSpeaking) {
        speechSynthesis.cancel();
        await new Promise(resolve => setTimeout(resolve, 100));
      }
    }

    speechQueueRef.current.push({ text, priority });
    console.log('TTS: Added to queue. Queue length:', speechQueueRef.current.length);
    
    if (!isProcessingRef.current) {
      await processQueue();
    }
  }, [isEnabled, isSupported, isSpeaking, processQueue]);

  const speakQuestion = useCallback(async (question: string, options: string[]) => {
    console.log('TTS: Speaking question request - enabled:', isEnabled, 'supported:', isSupported);
    
    if (!isEnabled || !isSupported) {
      console.log('TTS: Not speaking question - not enabled or supported');
      return;
    }

    try {
      console.log('TTS: Queueing question and options');
      
      // Clear any existing queue and speak question with high priority
      await speak(question, 'high');
      
      // Add options to queue
      const optionsText = options.map((option, index) => 
        `${String.fromCharCode(65 + index)}: ${option}`
      ).join('. ');
      
      await speak(`Your options are: ${optionsText}`, 'normal');
      
    } catch (error) {
      console.error('TTS: Error speaking question and options:', error);
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
