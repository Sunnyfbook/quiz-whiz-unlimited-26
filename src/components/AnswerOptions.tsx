
import React from 'react';

interface Question {
  question: string;
  options: string[];
  correctAnswer: number;
  category: string;
  difficulty: string;
}

interface AnswerOptionsProps {
  question: Question;
  selectedAnswer: number | null;
  showAnswer: boolean;
  onAnswerSelect: (answerIndex: number) => void;
}

export const AnswerOptions: React.FC<AnswerOptionsProps> = ({
  question,
  selectedAnswer,
  showAnswer,
  onAnswerSelect
}) => {
  return (
    <div className="space-y-2 md:space-y-3 flex-1">
      {question.options.map((option, index) => (
        <button
          key={index}
          onClick={() => onAnswerSelect(index)}
          disabled={showAnswer}
          className={`w-full p-3 md:p-4 rounded-full text-left font-medium transition-all duration-300 border-2 ${
            showAnswer
              ? index === question.correctAnswer
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
              showAnswer && index === question.correctAnswer
                ? 'bg-green-500 text-white'
                : selectedAnswer === index && showAnswer && index !== question.correctAnswer
                ? 'bg-red-500 text-white'
                : selectedAnswer === index
                ? 'bg-blue-500 text-white'
                : 'bg-blue-600 text-white'
            }`}>
              {String.fromCharCode(65 + index)}
            </span>
            <span className="text-sm md:text-base leading-tight">{option}</span>
          </div>
        </button>
      ))}
    </div>
  );
};
