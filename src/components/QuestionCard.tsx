
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Trophy, Brain, Target, Zap } from 'lucide-react';

interface Question {
  question: string;
  options: string[];
  correctAnswer: number;
  category: string;
  difficulty: string;
}

interface QuestionCardProps {
  question: Question;
  selectedAnswer: number | null;
  showAnswer: boolean;
  isCorrect: boolean;
  onAnswerSelect: (index: number) => void;
}

export const QuestionCard: React.FC<QuestionCardProps> = ({
  question,
  selectedAnswer,
  showAnswer,
  isCorrect,
  onAnswerSelect
}) => {
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

  return (
    <Card className="bg-white/10 backdrop-blur-xl border border-white/20 shadow-2xl transition-all duration-500 hover:bg-white/15 hover:shadow-3xl animate-scale-in">
      <CardContent className="p-8">
        <div className="flex justify-between items-start mb-8 gap-4">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-blue-500/20 to-cyan-500/20 text-cyan-200 text-sm font-medium border border-cyan-400/30 backdrop-blur-sm">
              <span className="text-lg">{getCategoryIcon(question.category)}</span>
              <span>{question.category}</span>
            </div>
            <div className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium border backdrop-blur-sm ${getDifficultyConfig(question.difficulty).color}`}>
              {getDifficultyConfig(question.difficulty).icon}
              {question.difficulty}
            </div>
          </div>
        </div>
        
        <h2 className="text-3xl font-bold text-white mb-10 leading-relaxed text-center animate-fade-in">
          {question.question}
        </h2>
        
        <div className="grid gap-6">
          {question.options.map((option, index) => (
            <button
              key={index}
              onClick={() => onAnswerSelect(index)}
              disabled={showAnswer}
              className={`group p-6 rounded-xl border-2 transition-all duration-300 transform hover:scale-[1.02] text-left ${
                showAnswer
                  ? index === question.correctAnswer
                    ? 'bg-gradient-to-r from-green-500/20 to-emerald-500/20 border-green-400 text-green-100 shadow-lg shadow-green-500/20 animate-pulse'
                    : selectedAnswer === index
                    ? 'bg-gradient-to-r from-red-500/20 to-pink-500/20 border-red-400 text-red-100 shadow-lg shadow-red-500/20'
                    : 'bg-white/5 border-white/10 text-white/60'
                  : selectedAnswer === index
                  ? 'bg-gradient-to-r from-blue-500/20 to-purple-500/20 border-blue-400 text-blue-100 shadow-lg shadow-blue-500/20 animate-pulse'
                  : 'bg-white/5 border-white/20 text-white hover:bg-gradient-to-r hover:from-white/10 hover:to-white/5 hover:border-white/30 hover:shadow-lg cursor-pointer'
              }`}
            >
              <div className="flex items-center gap-4">
                <span className={`w-10 h-10 rounded-full flex items-center justify-center text-lg font-bold transition-all duration-300 ${
                  showAnswer && index === question.correctAnswer
                    ? 'bg-green-500 text-white shadow-lg animate-bounce'
                    : selectedAnswer === index && showAnswer && index !== question.correctAnswer
                    ? 'bg-red-500 text-white shadow-lg'
                    : selectedAnswer === index
                    ? 'bg-blue-500 text-white shadow-lg animate-pulse'
                    : 'bg-white/20 text-white/90 group-hover:bg-white/30'
                }`}>
                  {String.fromCharCode(65 + index)}
                </span>
                <span className="text-xl font-medium flex-1">{option}</span>
                {showAnswer && index === question.correctAnswer && (
                  <div className="flex items-center gap-2 text-green-400 font-bold text-lg animate-bounce">
                    <Trophy className="w-5 h-5" />
                    <span>Correct!</span>
                  </div>
                )}
                {showAnswer && selectedAnswer === index && index !== question.correctAnswer && (
                  <div className="text-red-400 font-bold text-xl animate-pulse">
                    ✗
                  </div>
                )}
              </div>
            </button>
          ))}
        </div>
        
        {showAnswer && (
          <div className={`mt-8 p-6 rounded-xl border transition-all duration-500 animate-fade-in ${
            isCorrect 
              ? 'bg-gradient-to-r from-green-500/10 to-emerald-500/10 border-green-400/30' 
              : 'bg-gradient-to-r from-blue-500/10 to-purple-500/10 border-blue-400/30'
          }`}>
            <div className="text-center">
              <div className="flex justify-center mb-3">
                {isCorrect ? (
                  <Trophy className="w-8 h-8 text-yellow-400 animate-bounce" />
                ) : (
                  <Brain className="w-8 h-8 text-blue-400 animate-pulse" />
                )}
              </div>
              <p className={`text-lg font-semibold mb-2 ${
                isCorrect ? 'text-green-200' : 'text-blue-200'
              }`}>
                {isCorrect ? 'Excellent work! 🎉' : 'Keep learning! 📚'}
              </p>
              <p className="text-white/80 text-base">
                Next question in 3 seconds...
              </p>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
