
import { useState, useEffect, useCallback } from 'react';
import { useTextToSpeech } from '../services/TextToSpeechService';

interface Question {
  question: string;
  options: string[];
  correctAnswer: number;
  category: string;
  difficulty: string;
}

export const useGameLogic = () => {
  const [currentQuestion, setCurrentQuestion] = useState<Question | null>(null);
  const [showAnswer, setShowAnswer] = useState(false);
  const [score, setScore] = useState(30);
  const [totalQuestions, setTotalQuestions] = useState(0);
  const [timeLeft, setTimeLeft] = useState(15);
  const [isActive, setIsActive] = useState(false);
  const [gameStarted, setGameStarted] = useState(false);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [showConfetti, setShowConfetti] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [streak, setStreak] = useState(0);

  const { speak, isEnabled: speechEnabled, toggle: toggleSpeech } = useTextToSpeech();

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

  const getRandomQuestion = useCallback(() => {
    const randomIndex = Math.floor(Math.random() * triviaQuestions.length);
    return triviaQuestions[randomIndex];
  }, []);

  const loadNewQuestion = useCallback(async () => {
    setSelectedAnswer(null);
    setShowConfetti(false);
    setIsCorrect(false);
    
    const newQuestion = getRandomQuestion();
    setCurrentQuestion(newQuestion);
    setShowAnswer(false);
    setTimeLeft(15);
    
    setTimeout(async () => {
      if (speechEnabled) {
        await speak(`${newQuestion.category} question: ${newQuestion.question}`);
      }
    }, 500);
  }, [getRandomQuestion, speak, speechEnabled]);

  const revealAnswer = useCallback(async (selectedIndex?: number) => {
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
        await speak(randomEncouragement);
      }
    } else {
      setStreak(0);
      const correctAnswerText = currentQuestion.options[currentQuestion.correctAnswer];
      if (speechEnabled) {
        await speak(`Not quite right. The correct answer is: ${correctAnswerText}`);
      }
    }
    
    setTimeout(() => {
      loadNewQuestion();
      setIsActive(true);
    }, 3500);
  }, [currentQuestion, speak, speechEnabled, loadNewQuestion]);

  const handleAnswerSelect = useCallback((answerIndex: number) => {
    if (showAnswer || !currentQuestion) return;
    
    setSelectedAnswer(answerIndex);
    setIsActive(false);
    
    setTimeout(() => {
      revealAnswer(answerIndex);
    }, 500);
  }, [showAnswer, currentQuestion, revealAnswer]);

  const enableSpeechAndStart = useCallback(async () => {
    setGameStarted(true);
    setIsActive(true);
    setTotalQuestions(0);
    setStreak(0);
    
    if (speechEnabled) {
      await speak("Welcome to Trivia Master! Get ready to test your knowledge!");
    }
    
    setTimeout(() => {
      loadNewQuestion();
    }, 2000);
  }, [loadNewQuestion, speak, speechEnabled]);

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

  return {
    currentQuestion,
    showAnswer,
    score,
    totalQuestions,
    timeLeft,
    isActive,
    gameStarted,
    selectedAnswer,
    showConfetti,
    isCorrect,
    streak,
    speechEnabled,
    toggleSpeech,
    handleAnswerSelect,
    enableSpeechAndStart
  };
};
