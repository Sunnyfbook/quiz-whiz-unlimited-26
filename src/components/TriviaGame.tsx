
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
  const [score, setScore] = useState(0);
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
      question: "What is the capital of France?",
      options: ["London", "Berlin", "Paris", "Madrid"],
      correctAnswer: 2,
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
      setScore(0);
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
      setScore(prev => prev + 1);
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
      <div className="min-h-screen bg-gradient-to-br from-violet-900 via-purple-900 to-fuchsia-900 flex items-center justify-center p-4 overflow-hidden relative">
        <ParticleSystem />
        
        <Card className="w-full max-w-md bg-white/10 backdrop-blur-xl border border-white/20 shadow-2xl animate-scale-in relative z-10">
          <CardContent className="p-8 text-center">
            <div className="mb-8">
              <div className="w-20 h-20 mx-auto mb-6 bg-gradient-to-r from-yellow-400 via-orange-500 to-pink-500 rounded-full flex items-center justify-center shadow-lg animate-bounce">
                <Brain className="w-10 h-10 text-white animate-pulse" />
              </div>
              <h1 className="text-5xl font-bold text-white mb-3 bg-gradient-to-r from-yellow-400 via-pink-400 to-purple-400 bg-clip-text text-transparent animate-shimmer">
                Trivia Master
              </h1>
              <p className="text-white/80 text-lg font-medium">Challenge Your Mind!</p>
            </div>
            
            <div className="space-y-4 text-white/70 text-base mb-8">
              <div className="flex items-center justify-center gap-3 p-3 bg-white/5 rounded-lg backdrop-blur-sm hover:bg-white/10 transition-colors">
                <Trophy className="w-5 h-5 text-yellow-400 animate-pulse" />
                <span>Unlimited Questions</span>
              </div>
              <div className="flex items-center justify-center gap-3 p-3 bg-white/5 rounded-lg backdrop-blur-sm hover:bg-white/10 transition-colors">
                <Zap className="w-5 h-5 text-blue-400 animate-pulse" />
                <span>15 Seconds Per Question</span>
              </div>
              <div className="flex items-center justify-center gap-3 p-3 bg-white/5 rounded-lg backdrop-blur-sm hover:bg-white/10 transition-colors">
                <Volume2 className="w-5 h-5 text-green-400 animate-pulse" />
                <span>Voice Narration</span>
              </div>
            </div>
            
            <div className="text-white/60 text-sm animate-pulse">
              <Sparkles className="w-5 h-5 inline mr-2 animate-spin" />
              Starting in 3 seconds...
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-violet-900 via-purple-900 to-fuchsia-900 p-4 relative overflow-hidden">
      <ParticleSystem />
      
      {showConfetti && <ParticleSystem type="confetti" />}
      
      <div className="max-w-4xl mx-auto relative z-10">
        {/* Enhanced Header with Controls */}
        <div className="text-center mb-8 animate-fade-in">
          <div className="flex justify-between items-center mb-4">
            <ScoreCounter score={score} totalQuestions={totalQuestions} streak={streak} />
            
            <Button
              onClick={toggleSpeech}
              variant="ghost"
              size="sm"
              className="text-white/80 hover:text-white hover:bg-white/10"
            >
              {speechEnabled ? (
                <Volume2 className="w-5 h-5" />
              ) : (
                <VolumeX className="w-5 h-5" />
              )}
            </Button>
          </div>
          
          <h1 className="text-6xl font-bold text-white mb-4 bg-gradient-to-r from-yellow-400 via-pink-400 to-purple-400 bg-clip-text text-transparent animate-shimmer">
            Trivia Master
          </h1>
        </div>

        {currentQuestion && (
          <>
            {/* Enhanced Progress Bar */}
            <div className="space-y-4 animate-slide-in-right mb-8">
              <div className="flex justify-between items-center text-white/90 text-lg font-semibold">
                <span className="flex items-center gap-2">
                  <Clock className="w-5 h-5" />
                  Time Remaining
                </span>
                <span className={`font-mono text-xl ${timeLeft <= 5 ? 'text-red-400 animate-pulse' : 'text-white'}`}>
                  {timeLeft}s
                </span>
              </div>
              <Progress 
                value={(timeLeft / 15) * 100} 
                className={`h-4 bg-white/10 transition-all duration-1000 ${timeLeft <= 5 ? 'animate-pulse' : ''}`}
              />
            </div>

            {/* Enhanced Question Card */}
            <QuestionCard
              question={currentQuestion}
              selectedAnswer={selectedAnswer}
              showAnswer={showAnswer}
              isCorrect={isCorrect}
              onAnswerSelect={handleAnswerSelect}
            />
          </>
        )}
      </div>
    </div>
  );
};

export default TriviaGame;
