import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Sparkles, Trophy, Target, Zap, Brain, Clock, Volume2, VolumeX, Star, Heart } from 'lucide-react';
import { ParticleSystem } from './ParticleSystem';
import { ScoreCounter } from './ScoreCounter';
import { QuestionCard } from './QuestionCard';

interface Question {
  question: string;
  options: string[];
  correctAnswer: number;
  category: string;
  difficulty: string;
}

const TriviaGame = () => {
  const [currentQuestion, setCurrentQuestion] = useState<Question | null>(null);
  const [showAnswer, setShowAnswer] = useState(false);
  const [score, setScore] = useState(30);
  const [totalQuestions, setTotalQuestions] = useState(0);
  const [timeLeft, setTimeLeft] = useState(15);
  const [isActive, setIsActive] = useState(false);
  const [gameStarted, setGameStarted] = useState(false);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [showConfetti, setShowConfetti] = useState(false);
  const [speechEnabled, setSpeechEnabled] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [streak, setStreak] = useState(0);

  const triviaQuestions: Question[] = [
    {
      question: "Which of the following is NOT a benefit of geothermal energy?",
      options: ["Geothermal power", "Radioactive waste deposits", "Soil fertilization", "Glacier melting"],
      correctAnswer: 1,
      category: "Geography",
      difficulty: "Easy"
    },
    {
      question: "Which planet is known as the Red Planet?",
      options: ["Venus", "Mars", "Jupiter", "Saturn"],
      correctAnswer: 1,
      category: "Science",
      difficulty: "Easy"
    },
    {
      question: "Who painted the Mona Lisa?",
      options: ["Vincent van Gogh", "Pablo Picasso", "Leonardo da Vinci", "Michelangelo"],
      correctAnswer: 2,
      category: "Art",
      difficulty: "Medium"
    },
    {
      question: "What is the largest mammal in the world?",
      options: ["African Elephant", "Blue Whale", "Giraffe", "Polar Bear"],
      correctAnswer: 1,
      category: "Nature",
      difficulty: "Easy"
    },
    {
      question: "In which year did World War II end?",
      options: ["1943", "1944", "1945", "1946"],
      correctAnswer: 2,
      category: "History",
      difficulty: "Medium"
    },
    {
      question: "What is the chemical symbol for gold?",
      options: ["Go", "Gd", "Au", "Ag"],
      correctAnswer: 2,
      category: "Science",
      difficulty: "Medium"
    },
    {
      question: "Which Shakespeare play features the character Romeo?",
      options: ["Hamlet", "Macbeth", "Romeo and Juliet", "Othello"],
      correctAnswer: 2,
      category: "Literature",
      difficulty: "Easy"
    },
    {
      question: "What is the smallest country in the world?",
      options: ["Monaco", "Nauru", "Vatican City", "San Marino"],
      correctAnswer: 2,
      category: "Geography",
      difficulty: "Hard"
    },
    {
      question: "What does CPU stand for in computing?",
      options: ["Central Processing Unit", "Computer Personal Unit", "Central Program Unit", "Computer Processing Unit"],
      correctAnswer: 0,
      category: "Technology",
      difficulty: "Easy"
    },
    {
      question: "Which gas makes up approximately 78% of Earth's atmosphere?",
      options: ["Oxygen", "Carbon Dioxide", "Nitrogen", "Argon"],
      correctAnswer: 2,
      category: "Science",
      difficulty: "Medium"
    }
  ];

  // Fixed text-to-speech function
  const speak = useCallback((text: string) => {
    if (!speechEnabled) return;
    
    try {
      if ('speechSynthesis' in window) {
        // Cancel any existing speech
        window.speechSynthesis.cancel();
        
        // Small delay to ensure cancellation is processed
        setTimeout(() => {
          const utterance = new SpeechSynthesisUtterance(text);
          utterance.rate = 0.9;
          utterance.pitch = 1.1;
          utterance.volume = 0.8;
          utterance.lang = 'en-US';
          
          // Get available voices and set preferred one
          const voices = window.speechSynthesis.getVoices();
          const preferredVoice = voices.find(voice => 
            voice.name.toLowerCase().includes('google') || 
            voice.name.toLowerCase().includes('microsoft') ||
            voice.lang.includes('en-US')
          );
          
          if (preferredVoice) {
            utterance.voice = preferredVoice;
          }
          
          // Error handling for speech synthesis
          utterance.onerror = (event) => {
            console.log('Speech synthesis error:', event.error);
          };
          
          utterance.onend = () => {
            console.log('Speech synthesis finished');
          };
          
          window.speechSynthesis.speak(utterance);
        }, 150);
      }
    } catch (error) {
      console.log('Text-to-speech error:', error);
    }
  }, [speechEnabled]);

  const getRandomQuestion = useCallback(() => {
    const randomIndex = Math.floor(Math.random() * triviaQuestions.length);
    return triviaQuestions[randomIndex];
  }, []);

  const loadNewQuestion = useCallback(() => {
    setSelectedAnswer(null);
    setShowConfetti(false);
    setIsCorrect(false);
    
    const newQuestion = getRandomQuestion();
    setCurrentQuestion(newQuestion);
    setShowAnswer(false);
    setTimeLeft(15);
    
    // Improved speech timing
    setTimeout(() => {
      if (speechEnabled) {
        speak(`${newQuestion.category} question: ${newQuestion.question}`);
      }
    }, 500);
  }, [getRandomQuestion, speak, speechEnabled]);

  const enableSpeechAndStart = useCallback(() => {
    // Request user interaction for speech
    const startSpeech = () => {
      setSpeechEnabled(true);
      setGameStarted(true);
      setIsActive(true);
      setTotalQuestions(0);
      setStreak(0);
      
      // Test speech synthesis
      if ('speechSynthesis' in window) {
        speak("Welcome to Trivia Master! Get ready to test your knowledge!");
      }
      
      setTimeout(() => {
        loadNewQuestion();
      }, 2000);
    };

    startSpeech();
  }, [loadNewQuestion, speak]);

  const handleAnswerSelect = useCallback((answerIndex: number) => {
    if (showAnswer || !currentQuestion) return;
    
    setSelectedAnswer(answerIndex);
    setIsActive(false);
    
    setTimeout(() => {
      revealAnswer(answerIndex);
    }, 500);
  }, [showAnswer, currentQuestion]);

  const revealAnswer = useCallback((selectedIndex?: number) => {
    if (!currentQuestion) return;
    
    setShowAnswer(true);
    setIsActive(false);
    setTotalQuestions(prev => prev + 1);
    
    const correct = selectedIndex === currentQuestion.correctAnswer;
    setIsCorrect(correct);
    
    if (correct) {
      setScore(prev => prev + 10);
      setStreak(prev => prev + 1);
      setShowConfetti(true);
      
      if (speechEnabled) {
        const encouragements = [
          "Excellent! That's correct!",
          "Outstanding! Well done!",
          "Perfect! You're on fire!",
          "Brilliant! Keep it up!"
        ];
        const randomEncouragement = encouragements[Math.floor(Math.random() * encouragements.length)];
        speak(randomEncouragement);
      }
    } else {
      setStreak(0);
      const correctAnswerText = currentQuestion.options[currentQuestion.correctAnswer];
      if (speechEnabled) {
        speak(`Not quite right. The correct answer is: ${correctAnswerText}`);
      }
    }
    
    setTimeout(() => {
      loadNewQuestion();
      setIsActive(true);
    }, 3500);
  }, [currentQuestion, speak, speechEnabled, loadNewQuestion]);

  // Timer effect
  useEffect(() => {
    let interval: NodeJS.Timeout;
    
    if (isActive && timeLeft > 0 && !showAnswer) {
      interval = setInterval(() => {
        setTimeLeft(timeLeft => {
          const newTime = timeLeft - 1;
          if (newTime === 5 && speechEnabled) {
            speak("Five seconds remaining!");
          }
          return newTime;
        });
      }, 1000);
    } else if (timeLeft === 0 && !showAnswer) {
      if (speechEnabled) {
        speak("Time's up!");
      }
      revealAnswer();
    }
    
    return () => clearInterval(interval);
  }, [isActive, timeLeft, showAnswer, revealAnswer, speak, speechEnabled]);

  // Auto-start game
  useEffect(() => {
    const timer = setTimeout(() => {
      enableSpeechAndStart();
    }, 3000);
    
    return () => clearTimeout(timer);
  }, [enableSpeechAndStart]);

  // Load voices when available
  useEffect(() => {
    if ('speechSynthesis' in window) {
      const loadVoices = () => {
        const voices = window.speechSynthesis.getVoices();
        console.log('Available voices:', voices.length);
      };
      
      if (window.speechSynthesis.onvoiceschanged !== undefined) {
        window.speechSynthesis.onvoiceschanged = loadVoices;
      }
      
      // Also load immediately in case voices are already available
      setTimeout(loadVoices, 100);
    }
  }, []);

  const toggleSpeech = () => {
    setSpeechEnabled(!speechEnabled);
    if (!speechEnabled) {
      speak("Text to speech enabled!");
    }
  };

  if (!gameStarted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-800 via-blue-900 to-purple-900 flex items-center justify-center p-2 relative">
        <div className="w-full max-w-sm bg-blue-900/80 backdrop-blur-xl border border-blue-600/50 rounded-3xl shadow-2xl p-6 text-center animate-scale-in">
          <div className="mb-6">
            <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full flex items-center justify-center shadow-lg">
              <Brain className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-2xl md:text-4xl font-bold text-white mb-2">
              Trivia Master
            </h1>
            <p className="text-blue-200 text-sm md:text-lg">Challenge Your Mind!</p>
          </div>
          
          <div className="text-blue-200 text-xs md:text-sm animate-pulse">
            Starting in 3 seconds...
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-800 via-blue-900 to-purple-900 p-2 md:p-4 relative flex flex-col">
      <div className="max-w-4xl mx-auto w-full flex-1 flex flex-col">
        {/* Header with Score */}
        <div className="flex justify-between items-center mb-3 md:mb-6">
          <div className="bg-gradient-to-r from-yellow-400 to-orange-500 text-black px-3 py-2 md:px-6 md:py-3 rounded-full font-bold text-lg md:text-2xl shadow-lg">
            💰 {score}
          </div>
          
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

        {currentQuestion && (
          <div className="space-y-3 md:space-y-6 flex-1 flex flex-col">
            {/* Host Video Section */}
            <div className="bg-blue-900/80 rounded-2xl p-3 md:p-6 border border-blue-600/50 backdrop-blur-sm">
              <div className="bg-gray-800 rounded-xl h-32 md:h-48 flex items-center justify-center mb-3 md:mb-4 overflow-hidden">
                <img 
                  src="/lovable-uploads/29e12f2f-c724-4eb3-9058-4dee9240fd6d.png" 
                  alt="Host" 
                  className="w-full h-full object-cover"
                />
              </div>
              <h2 className="text-white text-sm md:text-xl font-semibold text-center mb-2 leading-tight">
                {currentQuestion.question}
              </h2>
            </div>

            {/* Answer Options */}
            <div className="space-y-2 md:space-y-3 flex-1">
              {currentQuestion.options.map((option, index) => (
                <button
                  key={index}
                  onClick={() => handleAnswerSelect(index)}
                  disabled={showAnswer}
                  className={`w-full p-3 md:p-4 rounded-full text-left font-medium transition-all duration-300 border-2 ${
                    showAnswer
                      ? index === currentQuestion.correctAnswer
                        ? 'bg-green-600 border-green-500 text-white'
                        : selectedAnswer === index
                        ? 'bg-red-600 border-red-500 text-white'
                        : 'bg-blue-800/50 border-blue-600/50 text-blue-200'
                      : selectedAnswer === index
                      ? 'bg-blue-600 border-blue-400 text-white'
                      : 'bg-blue-800/50 border-blue-600/50 text-white hover:bg-blue-700/50 hover:border-blue-500'
                  }`}
                >
                  <div className="flex items-center gap-2 md:gap-4">
                    <span className={`w-6 h-6 md:w-8 md:h-8 rounded-full flex items-center justify-center text-xs md:text-sm font-bold ${
                      showAnswer && index === currentQuestion.correctAnswer
                        ? 'bg-green-500 text-white'
                        : selectedAnswer === index && showAnswer && index !== currentQuestion.correctAnswer
                        ? 'bg-red-500 text-white'
                        : selectedAnswer === index
                        ? 'bg-blue-500 text-white'
                        : 'bg-blue-600 text-white'
                    }`}>
                      {String.fromCharCode(65 + index)}
                    </span>
                    <span className="text-sm md:text-lg leading-tight">{option}</span>
                  </div>
                </button>
              ))}
            </div>

            {/* Timer */}
            <div className="bg-blue-900/80 rounded-xl p-3 md:p-4 border border-blue-600/50 mt-auto">
              <div className="flex justify-between items-center mb-2">
                <span className="text-white font-medium text-sm md:text-base">Time Remaining:</span>
                <span className={`font-bold text-lg md:text-xl ${timeLeft <= 5 ? 'text-red-400' : 'text-white'}`}>
                  {timeLeft}s
                </span>
              </div>
              <Progress 
                value={(timeLeft / 15) * 100} 
                className="h-2 md:h-3 bg-blue-800"
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default TriviaGame;
