
import React from 'react';
import { useGameLogic } from '../hooks/useGameLogic';
import { GameHeader } from './GameHeader';
import { QuestionDisplay } from './QuestionDisplay';
import { Timer } from './Timer';
import { AnswerOptions } from './AnswerOptions';
import { GameStartScreen } from './GameStartScreen';

const TriviaGame = () => {
  const {
    currentQuestion,
    showAnswer,
    timeLeft,
    gameStarted,
    selectedAnswer,
    speechEnabled,
    toggleSpeech,
    handleAnswerSelect
  } = useGameLogic();

  if (!gameStarted) {
    return <GameStartScreen />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-800 via-blue-900 to-purple-900 p-2 md:p-4 relative flex flex-col">
      <div className="max-w-4xl mx-auto w-full flex-1 flex flex-col">
        <GameHeader speechEnabled={speechEnabled} toggleSpeech={toggleSpeech} />

        {currentQuestion && (
          <div className="space-y-3 md:space-y-4 flex-1 flex flex-col">
            <QuestionDisplay question={currentQuestion} />
            <Timer timeLeft={timeLeft} />
            <AnswerOptions
              question={currentQuestion}
              selectedAnswer={selectedAnswer}
              showAnswer={showAnswer}
              onAnswerSelect={handleAnswerSelect}
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default TriviaGame;
