
import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Volume2, VolumeX, Play, Pause } from 'lucide-react';

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
  const [isLoading, setIsLoading] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [gameStarted, setGameStarted] = useState(false);

  // Sample trivia questions (in a real app, this would come from an API)
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
    }
  ];

  // Text-to-speech function
  const speak = useCallback((text: string) => {
    if (!soundEnabled) return;
    
    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 0.8;
      utterance.pitch = 1;
      utterance.volume = 0.7;
      speechSynthesis.speak(utterance);
    }
  }, [soundEnabled]);

  // Get random question
  const getRandomQuestion = useCallback(() => {
    const randomIndex = Math.floor(Math.random() * triviaQuestions.length);
    return triviaQuestions[randomIndex];
  }, []);

  // Load new question
  const loadNewQuestion = useCallback(() => {
    setIsLoading(true);
    setTimeout(() => {
      const newQuestion = getRandomQuestion();
      setCurrentQuestion(newQuestion);
      setShowAnswer(false);
      setTimeLeft(15);
      setIsLoading(false);
      
      // Speak the question
      setTimeout(() => {
        speak(newQuestion.question);
      }, 500);
    }, 1000);
  }, [getRandomQuestion, speak]);

  // Start game
  const startGame = useCallback(() => {
    setGameStarted(true);
    setIsActive(true);
    setScore(0);
    setTotalQuestions(0);
    loadNewQuestion();
  }, [loadNewQuestion]);

  // Handle answer reveal
  const revealAnswer = useCallback(() => {
    if (!currentQuestion) return;
    
    setShowAnswer(true);
    setIsActive(false);
    setTotalQuestions(prev => prev + 1);
    
    // Speak the correct answer
    const correctAnswerText = currentQuestion.options[currentQuestion.correctAnswer];
    speak(`The correct answer is: ${correctAnswerText}`);
    
    // Auto load next question after 3 seconds
    setTimeout(() => {
      loadNewQuestion();
      setIsActive(true);
    }, 3000);
  }, [currentQuestion, speak, loadNewQuestion]);

  // Timer effect
  useEffect(() => {
    let interval: NodeJS.Timeout;
    
    if (isActive && timeLeft > 0 && !showAnswer) {
      interval = setInterval(() => {
        setTimeLeft(timeLeft => timeLeft - 1);
      }, 1000);
    } else if (timeLeft === 0 && !showAnswer) {
      revealAnswer();
    }
    
    return () => clearInterval(interval);
  }, [isActive, timeLeft, showAnswer, revealAnswer]);

  // Auto-start game on component mount
  useEffect(() => {
    const timer = setTimeout(() => {
      startGame();
    }, 2000);
    
    return () => clearTimeout(timer);
  }, [startGame]);

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty.toLowerCase()) {
      case 'easy': return 'text-green-500';
      case 'medium': return 'text-yellow-500';
      case 'hard': return 'text-red-500';
      default: return 'text-gray-500';
    }
  };

  if (!gameStarted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 flex items-center justify-center p-4">
        <Card className="w-full max-w-md bg-white/10 backdrop-blur-md border-white/20">
          <CardContent className="p-8 text-center">
            <div className="mb-6">
              <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full flex items-center justify-center">
                <Play className="w-8 h-8 text-white" />
              </div>
              <h1 className="text-3xl font-bold text-white mb-2">Trivia Master</h1>
              <p className="text-white/80">Get ready for unlimited trivia questions!</p>
            </div>
            <div className="space-y-2 text-white/60 text-sm">
              <p>🎯 Unlimited questions</p>
              <p>⏱️ 15 seconds per question</p>
              <p>🔊 Text-to-speech enabled</p>
              <p>🚀 Auto-starting in 2 seconds...</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 p-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-6">
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-2">
            Trivia Master
          </h1>
          <div className="flex flex-col sm:flex-row justify-center items-center gap-4 text-white/80">
            <div className="flex items-center gap-4">
              <span className="text-lg">Score: <span className="font-bold text-yellow-400">{score}</span></span>
              <span className="text-lg">Questions: <span className="font-bold">{totalQuestions}</span></span>
            </div>
            <Button
              onClick={() => setSoundEnabled(!soundEnabled)}
              variant="ghost"
              size="sm"
              className="text-white hover:bg-white/10"
            >
              {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
            </Button>
          </div>
        </div>

        {/* Main Game Area */}
        <div className="space-y-6">
          {isLoading ? (
            <Card className="bg-white/10 backdrop-blur-md border-white/20">
              <CardContent className="p-8 text-center">
                <div className="animate-spin w-8 h-8 border-4 border-white/30 border-t-white rounded-full mx-auto mb-4" />
                <p className="text-white text-lg">Loading next question...</p>
              </CardContent>
            </Card>
          ) : currentQuestion && (
            <>
              {/* Progress Bar */}
              <div className="space-y-2">
                <div className="flex justify-between items-center text-white/80 text-sm">
                  <span>Time Remaining</span>
                  <span className="font-mono">{timeLeft}s</span>
                </div>
                <Progress 
                  value={(timeLeft / 15) * 100} 
                  className="h-3 bg-white/10"
                />
              </div>

              {/* Question Card */}
              <Card className="bg-white/10 backdrop-blur-md border-white/20 transition-all duration-500 hover:bg-white/15">
                <CardContent className="p-6 md:p-8">
                  <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start mb-6 gap-2">
                    <div className="flex items-center gap-2">
                      <span className="px-3 py-1 rounded-full bg-blue-500/20 text-blue-200 text-xs font-medium">
                        {currentQuestion.category}
                      </span>
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${getDifficultyColor(currentQuestion.difficulty)} bg-white/10`}>
                        {currentQuestion.difficulty}
                      </span>
                    </div>
                    <div className="text-white/60 text-sm">
                      Question #{totalQuestions + 1}
                    </div>
                  </div>
                  
                  <h2 className="text-xl md:text-2xl font-semibold text-white mb-8 leading-relaxed">
                    {currentQuestion.question}
                  </h2>
                  
                  <div className="grid gap-3 md:gap-4">
                    {currentQuestion.options.map((option, index) => (
                      <div
                        key={index}
                        className={`p-4 rounded-lg border-2 transition-all duration-300 ${
                          showAnswer
                            ? index === currentQuestion.correctAnswer
                              ? 'bg-green-500/20 border-green-400 text-green-100'
                              : 'bg-white/5 border-white/10 text-white/60'
                            : 'bg-white/5 border-white/20 text-white hover:bg-white/10 hover:border-white/30 cursor-pointer'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <span className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                            showAnswer && index === currentQuestion.correctAnswer
                              ? 'bg-green-500 text-white'
                              : 'bg-white/10 text-white/70'
                          }`}>
                            {String.fromCharCode(65 + index)}
                          </span>
                          <span className="text-base md:text-lg">{option}</span>
                          {showAnswer && index === currentQuestion.correctAnswer && (
                            <span className="ml-auto text-green-400 font-bold">✓ Correct</span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                  
                  {showAnswer && (
                    <div className="mt-6 p-4 bg-green-500/10 border border-green-400/30 rounded-lg">
                      <p className="text-green-200 text-center">
                        Next question loading in 3 seconds...
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </>
          )}
        </div>

        {/* Footer */}
        <div className="text-center mt-8 text-white/60 text-sm">
          <p>🎮 Unlimited trivia questions • 🔄 Auto-advancing gameplay</p>
        </div>
      </div>
    </div>
  );
};

export default TriviaGame;
