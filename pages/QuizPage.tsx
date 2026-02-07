import React, { useState } from 'react';
import { Quiz, User } from '../types';
import { saveCertificate } from '../services/storageService';
import Button from '../components/Button';
import { PASSING_SCORE } from '../constants';
import { CheckCircle2, XCircle, ArrowRight, Loader2, BookOpen } from 'lucide-react';

interface QuizPageProps {
  quiz: Quiz;
  user: User;
  onComplete: () => void;
  onExit: () => void;
}

const QuizPage: React.FC<QuizPageProps> = ({ quiz, user, onComplete, onExit }) => {
  const [currentQuestionIdx, setCurrentQuestionIdx] = useState(0);
  const [answers, setAnswers] = useState<number[]>(new Array(quiz.questions.length).fill(-1));
  const [showResults, setShowResults] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [showAnswerKey, setShowAnswerKey] = useState(false);

  const handleAnswer = (optionIndex: number) => {
    const newAnswers = [...answers];
    newAnswers[currentQuestionIdx] = optionIndex;
    setAnswers(newAnswers);
  };

  const calculateResults = () => {
    let correct = 0;
    quiz.questions.forEach((q, i) => {
        if (answers[i] === q.correctAnswerIndex) correct++;
    });
    return {
        correct,
        total: quiz.questions.length,
        percentage: Math.round((correct / quiz.questions.length) * 100)
    };
  };

  const handleFinish = async () => {
      setShowResults(true);
      const results = calculateResults();
      
      if (results.percentage >= PASSING_SCORE) {
          setIsSaving(true);
          try {
              console.log('Saving certificate with data:', {
                  userId: user.id,
                  userName: user.username,
                  videoUrl: quiz.videoUrl,
                  topic: quiz.topic,
                  channelName: quiz.channelName || "Unknown Channel",
                  score: results.percentage
              });
                            const saved = await saveCertificate({
                                    userId: user.id,
                                    userName: user.username,
                                    videoUrl: quiz.videoUrl,
                                    topic: quiz.topic,
                                    channelName: quiz.channelName || undefined,
                                    questions: quiz.questions,
                                    userAnswers: answers,
                                    score: results.percentage
                            });

                            console.log('Certificate saved successfully!', saved);
          } catch (error) {
              console.error("Failed to save cert:", error);
              alert(`Error saving certificate: ${error}`);
              // In production we might show an error toast here
          } finally {
              setIsSaving(false);
          }
      }
  };

  if (showResults) {
      const results = calculateResults();
      const passed = results.percentage >= PASSING_SCORE;

      return (
          <div className="max-w-3xl mx-auto px-4 py-8">
              <div className="bg-white rounded-2xl shadow-xl border border-slate-100 p-8">
                  {/* Results Header */}
                  <div className="text-center mb-8">
                      <div className={`w-20 h-20 mx-auto rounded-full flex items-center justify-center mb-6 ${passed ? 'bg-green-100' : 'bg-red-100'}`}>
                          {passed ? (
                              <CheckCircle2 className="w-10 h-10 text-green-600" />
                          ) : (
                              <XCircle className="w-10 h-10 text-red-600" />
                          )}
                      </div>
                      
                      <h2 className="text-3xl font-bold text-slate-900 mb-2">
                          {passed ? 'Congratulations!' : 'Keep Trying!'}
                      </h2>
                      <p className="text-slate-500 mb-8">
                          You scored <span className={`font-bold ${passed ? 'text-green-600' : 'text-red-600'}`}>{results.percentage}%</span> on the "{quiz.topic}" assessment.
                      </p>

                      <div className="grid grid-cols-2 gap-4 max-w-sm mx-auto mb-8">
                          <div className="bg-slate-50 p-4 rounded-xl">
                              <p className="text-xs text-slate-400 uppercase font-bold">Correct</p>
                              <p className="text-2xl font-bold text-slate-800">{results.correct}</p>
                          </div>
                          <div className="bg-slate-50 p-4 rounded-xl">
                              <p className="text-xs text-slate-400 uppercase font-bold">Total</p>
                              <p className="text-2xl font-bold text-slate-800">{results.total}</p>
                          </div>
                      </div>
                  </div>

                  {/* Answer Key */}
                  <div className="mb-8">
                      <button
                          onClick={() => setShowAnswerKey(!showAnswerKey)}
                          className="w-full flex items-center justify-between p-4 bg-slate-50 rounded-lg border border-slate-200 hover:bg-slate-100 transition-colors"
                      >
                          <div className="flex items-center gap-3">
                              <BookOpen className="w-5 h-5 text-blue-600" />
                              <span className="font-semibold text-slate-900">View Answer Key</span>
                          </div>
                          <span className={`transform transition-transform ${showAnswerKey ? 'rotate-180' : ''}`}>
                              ▼
                          </span>
                      </button>

                      {showAnswerKey && (
                          <div className="mt-4 space-y-6 bg-slate-50 p-6 rounded-lg border border-slate-200">
                              {quiz.questions.map((q, idx) => {
                                  const userAnswer = answers[idx];
                                  const isCorrect = userAnswer === q.correctAnswerIndex;
                                  
                                  return (
                                      <div key={idx} className="bg-white p-4 rounded-lg border-l-4" style={{
                                          borderColor: isCorrect ? '#10b981' : '#ef4444'
                                      }}>
                                          <p className="font-semibold text-slate-900 mb-3">Q{idx + 1}: {q.question}</p>
                                          
                                          <div className="space-y-2 mb-3">
                                              {q.options.map((option, optIdx) => {
                                                  const isCorrectOption = optIdx === q.correctAnswerIndex;
                                                  const isUserAnswer = optIdx === userAnswer;
                                                  
                                                  return (
                                                      <div
                                                          key={optIdx}
                                                          className={`p-3 rounded-lg text-sm ${
                                                              isCorrectOption
                                                                  ? 'bg-green-50 border border-green-200 text-green-800 font-medium'
                                                                  : isUserAnswer && !isCorrect
                                                                  ? 'bg-red-50 border border-red-200 text-red-800'
                                                                  : 'bg-slate-50 border border-slate-200 text-slate-600'
                                                          }`}
                                                      >
                                                          <div className="flex items-center gap-2">
                                                              {isCorrectOption && <CheckCircle2 className="w-4 h-4" />}
                                                              {isUserAnswer && !isCorrect && <XCircle className="w-4 h-4" />}
                                                              <span>{option}</span>
                                                          </div>
                                                      </div>
                                                  );
                                              })}
                                          </div>
                                      </div>
                                  );
                              })}
                          </div>
                      )}
                  </div>

                  {passed ? (
                      <div className="space-y-4">
                          {isSaving ? (
                              <p className="text-sm text-blue-600 flex items-center justify-center gap-2">
                                  <Loader2 className="w-4 h-4 animate-spin" /> Saving your certificate...
                              </p>
                          ) : (
                              <p className="text-sm text-green-700 bg-green-50 p-3 rounded-lg border border-green-200">
                                  A certificate has been saved to your dashboard!
                              </p>
                          )}
                          <Button onClick={onComplete} className="w-full" disabled={isSaving}>
                              Return to Dashboard
                          </Button>
                      </div>
                  ) : (
                      <div className="space-y-4">
                          <p className="text-sm text-slate-500">
                              You need {PASSING_SCORE}% to earn a certificate. Review the material and try again.
                          </p>
                          <Button onClick={onComplete} variant="secondary" className="w-full">
                              Return to Dashboard
                          </Button>
                      </div>
                  )}
              </div>
          </div>
      );
  }

  const question = quiz.questions[currentQuestionIdx];
  const isLastQuestion = currentQuestionIdx === quiz.questions.length - 1;
  const progress = ((currentQuestionIdx + 1) / quiz.questions.length) * 100;

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
        <div className="mb-6 flex items-center justify-between">
            <h2 className="text-sm font-semibold text-slate-500 uppercase tracking-wider">
                Question {currentQuestionIdx + 1} of {quiz.questions.length}
            </h2>
            <button onClick={onExit} className="text-sm text-red-500 hover:text-red-700 font-medium">
                Exit Quiz
            </button>
        </div>

        {/* Progress Bar */}
        <div className="h-2 w-full bg-slate-100 rounded-full mb-8 overflow-hidden">
            <div 
                className="h-full bg-blue-600 transition-all duration-300 ease-out"
                style={{ width: `${progress}%` }}
            />
        </div>

        {/* Question Card */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8 mb-8">
            <h3 className="text-xl font-bold text-slate-900 mb-6 leading-relaxed">
                {question.question}
            </h3>

            <div className="space-y-3">
                {question.options.map((option, idx) => (
                    <button
                        key={idx}
                        onClick={() => handleAnswer(idx)}
                        className={`w-full text-left p-4 rounded-xl border-2 transition-all ${
                            answers[currentQuestionIdx] === idx
                                ? 'border-blue-500 bg-blue-50 text-blue-800 font-medium'
                                : 'border-slate-100 hover:border-slate-300 text-slate-600'
                        }`}
                    >
                        <span className="inline-block w-6 h-6 rounded-full border border-current text-xs text-center leading-6 mr-3 opacity-50">
                            {String.fromCharCode(65 + idx)}
                        </span>
                        {option}
                    </button>
                ))}
            </div>
        </div>

        {/* Navigation */}
        <div className="flex justify-between items-center">
            <Button 
                variant="secondary"
                disabled={currentQuestionIdx === 0}
                onClick={() => setCurrentQuestionIdx(prev => prev - 1)}
            >
                Previous
            </Button>
            
            {isLastQuestion ? (
                <Button 
                    onClick={handleFinish}
                    disabled={answers[currentQuestionIdx] === -1}
                    className="bg-green-600 hover:bg-green-700"
                >
                    Submit Assessment
                </Button>
            ) : (
                <Button 
                    onClick={() => setCurrentQuestionIdx(prev => prev + 1)}
                    disabled={answers[currentQuestionIdx] === -1}
                >
                    Next Question <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
            )}
        </div>
    </div>
  );
};

export default QuizPage;