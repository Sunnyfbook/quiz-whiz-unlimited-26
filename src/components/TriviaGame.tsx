
import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Sparkles, Trophy, Target, Zap, Brain, Clock } from 'lucide-react';

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

  // Sample trivia questions with enhanced data
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

  // Enhanced text-to-speech function with user interaction requirement
  const speak = useCallback((text: string) => {
    if (!speechEnabled) return;
    
    try {
      if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel();
        
        setTimeout(() => {
          const utterance = new SpeechSynthesisUtterance(text);
          utterance.rate = 0.9;
          utterance.pitch = 1.1;
          utterance.volume = 0.8;
          utterance.lang = 'en-US';
          
          const voices = window.speechSynthesis.getVoices();
          const preferredVoice = voices.find(voice => 
            voice.name.includes('Google') || 
            voice.name.includes('Microsoft') ||
            voice.lang.includes('en-US')
          );
          if (preferredVoice) {
            utterance.voice = preferredVoice;
          }
          
          window.speechSynthesis.speak(utterance);
        }, 100);
      }
    } catch (error) {
      console.log('Text-to-speech not available:', error);
    }
  }, [speechEnabled]);

  // Get random question with better distribution
  const getRandomQuestion = useCallback(() => {
    const randomIndex = Math.floor(Math.random() * triviaQuestions.length);
    return triviaQuestions[randomIndex];
  }, []);

  // Load new question with enhanced animations
  const loadNewQuestion = useCallback(() => {
    setSelectedAnswer(null);
    setShowConfetti(false);
    
    const newQuestion = getRandomQuestion();
    setCurrentQuestion(newQuestion);
    setShowAnswer(false);
    setTimeLeft(15);
    
    // Speak the question with category
    setTimeout(() => {
      speak(`${newQuestion.category} question: ${newQuestion.question}`);
    }, 800);
  }, [getRandomQuestion, speak]);

  // Enable speech and start game
  const enableSpeechAndStart = useCallback(() => {
    setSpeechEnabled(true);
    setGameStarted(true);
    setIsActive(true);
    setScore(0);
    setTotalQuestions(0);
    speak("Welcome to Trivia Master! Let's test your knowledge!");
    loadNewQuestion();
  }, [loadNewQuestion, speak]);

  // Handle answer selection
  const handleAnswerSelect = useCallback((answerIndex: number) => {
    if (showAnswer || !currentQuestion) return;
    
    setSelectedAnswer(answerIndex);
    setIsActive(false);
    
    setTimeout(() => {
      revealAnswer(answerIndex);
    }, 500);
  }, [showAnswer, currentQuestion]);

  // Enhanced answer reveal with celebrations
  const revealAnswer = useCallback((selectedIndex?: number) => {
    if (!currentQuestion) return;
    
    setShowAnswer(true);
    setIsActive(false);
    setTotalQuestions(prev => prev + 1);
    
    const isCorrect = selectedIndex === currentQuestion.correctAnswer;
    
    if (isCorrect) {
      setScore(prev => prev + 1);
      setShowConfetti(true);
      speak("Excellent! That's correct!");
    } else {
      const correctAnswerText = currentQuestion.options[currentQuestion.correctAnswer];
      speak(`Sorry, the correct answer is: ${correctAnswerText}`);
    }
    
    // Auto load next question after celebration
    setTimeout(() => {
      loadNewQuestion();
      setIsActive(true);
    }, 3500);
  }, [currentQuestion, speak, loadNewQuestion]);

  // Timer effect with urgency sounds
  useEffect(() => {
    let interval: NodeJS.Timeout;
    
    if (isActive && timeLeft > 0 && !showAnswer) {
      interval = setInterval(() => {
        setTimeLeft(timeLeft => {
          const newTime = timeLeft - 1;
          return newTime;
        });
      }, 1000);
    } else if (timeLeft === 0 && !showAnswer) {
      speak("Time's up!");
      revealAnswer();
    }
    
    return () => clearInterval(interval);
  }, [isActive, timeLeft, showAnswer, revealAnswer, speak]);

  // Auto-start game with dramatic countdown
  useEffect(() => {
    const timer = setTimeout(() => {
      enableSpeechAndStart();
    }, 3000);
    
    return () => clearTimeout(timer);
  }, [enableSpeechAndStart]);

  // Load voices when speech synthesis is ready
  useEffect(() => {
    if ('speechSynthesis' in window) {
      const loadVoices = () => {
        window.speechSynthesis.getVoices();
      };
      
      if (window.speechSynthesis.onvoiceschanged !== undefined) {
        window.speechSynthesis.onvoiceschanged = loadVoices;
      }
      
      loadVoices();
    }
  }, []);

  const getDifficultyConfig = (difficulty: string) => {
    switch (difficulty.toLowerCase()) {
      case 'easy': 
        return { 
          color: 'text-emerald-300 bg-emerald-500/20 border-emerald-400/40',
          icon: <Target className="w-3 h-3" />
        };
      case 'medium': 
        return { 
          color: 'text-amber-300 bg-amber-500/20 border-amber-400/40',
          icon: <Zap className="w-3 h-3" />
        };
      case 'hard': 
        return { 
          color: 'text-red-300 bg-red-500/20 border-red-400/40',
          icon: <Brain className="w-3 h-3" />
        };
      default: 
        return { 
          color: 'text-gray-300 bg-gray-500/20 border-gray-400/40',
          icon: <Target className="w-3 h-3" />
        };
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category.toLowerCase()) {
      case 'science': return '🧪';
      case 'history': return '📚';
      case 'geography': return '🌍';
      case 'art': return '🎨';
      case 'literature': return '📖';
      case 'nature': return '🌿';
      case 'technology': return '💻';
      default: return '🎯';
    }
  };

  if (!gameStarted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-violet-900 via-purple-900 to-fuchsia-900 flex items-center justify-center p-3 sm:p-4 overflow-hidden relative">
        {/* Enhanced animated background elements */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-20 sm:-top-40 -right-20 sm:-right-40 w-40 sm:w-80 h-40 sm:h-80 bg-blue-500/30 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute -bottom-20 sm:-bottom-40 -left-20 sm:-left-40 w-40 sm:w-80 h-40 sm:h-80 bg-purple-500/30 rounded-full blur-3xl animate-pulse delay-1000"></div>
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-48 sm:w-96 h-48 sm:h-96 bg-pink-500/20 rounded-full blur-3xl animate-pulse delay-2000"></div>
          
          {/* Floating particles */}
          {[...Array(15)].map((_, i) => (
            <div
              key={i}
              className="absolute animate-float"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 3}s`,
                animationDuration: `${3 + Math.random() * 2}s`
              }}
            >
              <div className="w-1 h-1 sm:w-2 sm:h-2 bg-white/30 rounded-full"></div>
            </div>
          ))}
        </div>

        <Card className="w-full max-w-sm sm:max-w-md md:max-w-lg bg-white/10 backdrop-blur-xl border border-white/20 shadow-2xl animate-scale-in relative z-10">
          <CardContent className="p-6 sm:p-8 md:p-10 text-center">
            <div className="mb-6 sm:mb-8">
              <div className="w-16 h-16 sm:w-20 sm:h-20 mx-auto mb-4 sm:mb-6 bg-gradient-to-r from-yellow-400 via-orange-500 to-pink-500 rounded-full flex items-center justify-center shadow-lg animate-bounce">
                <Brain className="w-8 h-8 sm:w-10 sm:h-10 text-white" />
              </div>
              <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-white mb-2 sm:mb-3 bg-gradient-to-r from-yellow-400 via-pink-400 to-purple-400 bg-clip-text text-transparent">
                Trivia Master
              </h1>
              <p className="text-white/80 text-base sm:text-lg font-medium">Challenge Your Mind!</p>
            </div>
            
            <div className="space-y-3 sm:space-y-4 text-white/70 text-sm sm:text-base mb-6 sm:mb-8">
              <div className="flex items-center justify-center gap-2 sm:gap-3 p-2 sm:p-3 bg-white/5 rounded-lg backdrop-blur-sm">
                <Trophy className="w-4 h-4 sm:w-5 sm:h-5 text-yellow-400 flex-shrink-0" />
                <span>Unlimited Questions</span>
              </div>
              <div className="flex items-center justify-center gap-2 sm:gap-3 p-2 sm:p-3 bg-white/5 rounded-lg backdrop-blur-sm">
                <Zap className="w-4 h-4 sm:w-5 sm:h-5 text-blue-400 flex-shrink-0" />
                <span>15 Seconds Per Question</span>
              </div>
              <div className="flex items-center justify-center gap-2 sm:gap-3 p-2 sm:p-3 bg-white/5 rounded-lg backdrop-blur-sm">
                <Brain className="w-4 h-4 sm:w-5 sm:h-5 text-green-400 flex-shrink-0" />
                <span>Voice Narration</span>
              </div>
            </div>
            
            <div className="text-white/60 text-xs sm:text-sm animate-pulse">
              <Sparkles className="w-4 h-4 sm:w-5 sm:h-5 inline mr-2" />
              Starting in 3 seconds...
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-violet-900 via-purple-900 to-fuchsia-900 p-3 sm:p-4 md:p-6 relative overflow-hidden">
      {/* Enhanced animated background */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-20 sm:-top-40 -right-20 sm:-right-40 w-40 sm:w-80 h-40 sm:h-80 bg-blue-500/30 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute -bottom-20 sm:-bottom-40 -left-20 sm:-left-40 w-40 sm:w-80 h-40 sm:h-80 bg-purple-500/30 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/3 right-1/4 w-32 sm:w-64 h-32 sm:h-64 bg-pink-500/20 rounded-full blur-3xl animate-pulse delay-2000"></div>
        
        {/* Floating particles */}
        {[...Array(20)].map((_, i) => (
          <div
            key={i}
            className="absolute animate-float"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 3}s`,
              animationDuration: `${3 + Math.random() * 2}s`
            }}
          >
            <div className="w-1 h-1 sm:w-2 sm:h-2 bg-white/20 rounded-full"></div>
          </div>
        ))}
      </div>

      {/* Confetti effect */}
      {showConfetti && (
        <div className="fixed inset-0 pointer-events-none z-50">
          {[...Array(50)].map((_, i) => (
            <div
              key={i}
              className="absolute animate-bounce"
              style={{
                left: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 2}s`,
                animationDuration: `${1 + Math.random()}s`
              }}
            >
              <Sparkles className="w-3 h-3 sm:w-4 sm:h-4 text-yellow-400" />
            </div>
          ))}
        </div>
      )}

      <div className="max-w-4xl mx-auto relative z-10">
        {/* Enhanced Header */}
        <div className="text-center mb-6 sm:mb-8 animate-fade-in">
          <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold text-white mb-2 sm:mb-4 bg-gradient-to-r from-yellow-400 via-pink-400 to-purple-400 bg-clip-text text-transparent leading-tight">
            Trivia Master
          </h1>
        </div>

        {/* Main Game Area */}
        <div className="space-y-6 sm:space-y-8">
          {currentQuestion && (
            <>
              {/* Enhanced Progress Bar */}
              <div className="space-y-3 sm:space-y-4 animate-slide-in-right">
                <div className="flex justify-between items-center text-white/90 text-base sm:text-lg font-semibold">
                  <span className="flex items-center gap-2">
                    <Clock className="w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0" />
                    <span className="hidden sm:inline">Time Remaining</span>
                    <span className="sm:hidden">Time</span>
                  </span>
                  <span className={`font-mono text-lg sm:text-xl ${timeLeft <= 5 ? 'text-red-400 animate-pulse' : 'text-white'}`}>
                    {timeLeft}s
                  </span>
                </div>
                <Progress 
                  value={(timeLeft / 15) * 100} 
                  className={`h-3 sm:h-4 bg-white/10 transition-all duration-1000 ${timeLeft <= 5 ? 'animate-pulse' : ''}`}
                />
              </div>

              {/* Enhanced Question Card */}
              <Card className="bg-white/10 backdrop-blur-xl border border-white/20 shadow-2xl transition-all duration-500 hover:bg-white/15 hover:shadow-3xl animate-scale-in">
                <CardContent className="p-4 sm:p-6 md:p-8 lg:p-12">
                  <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start mb-6 sm:mb-8 gap-3 sm:gap-4">
                    <div className="flex flex-wrap items-center gap-2 sm:gap-3">
                      <div className="flex items-center gap-2 px-3 py-1.5 sm:px-4 sm:py-2 rounded-full bg-gradient-to-r from-blue-500/20 to-cyan-500/20 text-cyan-200 text-xs sm:text-sm font-medium border border-cyan-400/30 backdrop-blur-sm">
                        <span className="text-sm sm:text-lg">{getCategoryIcon(currentQuestion.category)}</span>
                        <span className="hidden xs:inline">{currentQuestion.category}</span>
                      </div>
                      <div className={`flex items-center gap-2 px-3 py-1.5 sm:px-4 sm:py-2 rounded-full text-xs sm:text-sm font-medium border backdrop-blur-sm ${getDifficultyConfig(currentQuestion.difficulty).color}`}>
                        {getDifficultyConfig(currentQuestion.difficulty).icon}
                        {currentQuestion.difficulty}
                      </div>
                    </div>
                  </div>
                  
                  <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-white mb-8 sm:mb-10 leading-relaxed text-center px-2">
                    {currentQuestion.question}
                  </h2>
                  
                  <div className="grid gap-3 sm:gap-4 md:gap-6">
                    {currentQuestion.options.map((option, index) => (
                      <button
                        key={index}
                        onClick={() => handleAnswerSelect(index)}
                        disabled={showAnswer}
                        className={`group p-4 sm:p-6 rounded-xl border-2 transition-all duration-300 transform hover:scale-[1.02] text-left ${
                          showAnswer
                            ? index === currentQuestion.correctAnswer
                              ? 'bg-gradient-to-r from-green-500/20 to-emerald-500/20 border-green-400 text-green-100 shadow-lg shadow-green-500/20'
                              : selectedAnswer === index
                              ? 'bg-gradient-to-r from-red-500/20 to-pink-500/20 border-red-400 text-red-100 shadow-lg shadow-red-500/20'
                              : 'bg-white/5 border-white/10 text-white/60'
                            : selectedAnswer === index
                            ? 'bg-gradient-to-r from-blue-500/20 to-purple-500/20 border-blue-400 text-blue-100 shadow-lg shadow-blue-500/20'
                            : 'bg-white/5 border-white/20 text-white hover:bg-gradient-to-r hover:from-white/10 hover:to-white/5 hover:border-white/30 hover:shadow-lg cursor-pointer'
                        }`}
                      >
                        <div className="flex items-center gap-3 sm:gap-4">
                          <span className={`w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center text-sm sm:text-lg font-bold transition-all duration-300 flex-shrink-0 ${
                            showAnswer && index === currentQuestion.correctAnswer
                              ? 'bg-green-500 text-white shadow-lg'
                              : selectedAnswer === index && showAnswer && index !== currentQuestion.correctAnswer
                              ? 'bg-red-500 text-white shadow-lg'
                              : selectedAnswer === index
                              ? 'bg-blue-500 text-white shadow-lg'
                              : 'bg-white/20 text-white/90 group-hover:bg-white/30'
                          }`}>
                            {String.fromCharCode(65 + index)}
                          </span>
                          <span className="text-base sm:text-lg md:text-xl font-medium flex-1">{option}</span>
                          {showAnswer && index === currentQuestion.correctAnswer && (
                            <div className="flex items-center gap-2 text-green-400 font-bold text-sm sm:text-lg">
                              <Trophy className="w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0" />
                              <span className="hidden sm:inline">Correct!</span>
                              <span className="sm:hidden">✓</span>
                            </div>
                          )}
                          {showAnswer && selectedAnswer === index && index !== currentQuestion.correctAnswer && (
                            <div className="text-red-400 font-bold text-lg sm:text-xl">
                              ✗
                            </div>
                          )}
                        </div>
                      </button>
                    ))}
                  </div>
                  
                  {showAnswer && (
                    <div className={`mt-6 sm:mt-8 p-4 sm:p-6 rounded-xl border transition-all duration-500 animate-fade-in ${
                      selectedAnswer === currentQuestion.correctAnswer 
                        ? 'bg-gradient-to-r from-green-500/10 to-emerald-500/10 border-green-400/30' 
                        : 'bg-gradient-to-r from-blue-500/10 to-purple-500/10 border-blue-400/30'
                    }`}>
                      <div className="text-center">
                        <div className="flex justify-center mb-3">
                          {selectedAnswer === currentQuestion.correctAnswer ? (
                            <Trophy className="w-6 h-6 sm:w-8 sm:h-8 text-yellow-400 animate-bounce" />
                          ) : (
                            <Brain className="w-6 h-6 sm:w-8 sm:h-8 text-blue-400" />
                          )}
                        </div>
                        <p className={`text-base sm:text-lg font-semibold mb-2 ${
                          selectedAnswer === currentQuestion.correctAnswer ? 'text-green-200' : 'text-blue-200'
                        }`}>
                          {selectedAnswer === currentQuestion.correctAnswer ? 'Excellent work!' : 'Keep learning!'}
                        </p>
                        <p className="text-white/80 text-sm sm:text-base">
                          Next question in 3 seconds...
                        </p>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default TriviaGame;
