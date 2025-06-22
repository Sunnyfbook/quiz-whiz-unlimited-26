
import React from 'react';

interface Question {
  question: string;
  options: string[];
  correctAnswer: number;
  category: string;
  difficulty: string;
}

interface QuestionDisplayProps {
  question: Question;
}

export const QuestionDisplay: React.FC<QuestionDisplayProps> = ({ question }) => {
  return (
    <div className="bg-blue-900/80 rounded-2xl p-3 md:p-6 border border-blue-600/50 backdrop-blur-sm">
      <div className="bg-gray-800 rounded-xl h-48 md:h-72 flex items-center justify-center mb-3 md:mb-4 overflow-hidden">
        <img 
          src="/lovable-uploads/29e12f2f-c724-4eb3-9058-4dee9240fd6d.png" 
          alt="Host" 
          className="w-full h-full object-cover"
        />
      </div>
      <h2 className="text-white text-base md:text-xl font-semibold text-center mb-2 leading-tight">
        {question.question}
      </h2>
    </div>
  );
};
