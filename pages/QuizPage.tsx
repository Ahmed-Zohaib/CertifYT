import React, { useState, useMemo } from 'react';
import { Quiz, User } from '../types';
import { saveCertificate } from '../services/storageService';
import Button from '../components/Button';
import { PASSING_SCORE } from '../constants';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle2, XCircle, ArrowRight, Loader2, Trophy, ArrowLeft, Cpu, Sparkles } from 'lucide-react';

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

  // Background Particles (Adjusted to Violet)
  const particles = useMemo(() => Array.from({ length: 45 }), []);

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
        await saveCertificate({
          userId: user.id,
          userName: user.username,
          videoUrl: quiz.videoUrl,
          topic: quiz.topic,
          score: results.percentage
        });
      } catch (error) {
        console.error("Failed to save cert", error);
      } finally {
        setIsSaving(false);
      }
    }
  };

  const results = calculateResults();
  const progress = ((currentQuestionIdx + 1) / quiz.questions.length) * 100;

  return (
    <div className="relative min-h-screen bg-[#020105] text-white flex flex-col items-center justify-center py-12 px-4 selection:bg-purple-500/30">
      
      {/* --- VIOLET NEURAL GRID BACKGROUND --- */}
      <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#1a1325_1px,transparent_1px),linear-gradient(to_bottom,#1a1325_1px,transparent_1px)] bg-[size:60px_60px]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(168,85,247,0.05),transparent_70%)]" />
        
        {particles.map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-[1.5px] h-[1.5px] bg-purple-400 rounded-full"
            initial={{ x: Math.random() * 2000, y: Math.random() * 2000 }}
            animate={{ y: [null, -1000], opacity: [0, 0.7, 0] }}
            transition={{ duration: Math.random() * 10 + 5, repeat: Infinity, ease: "linear" }}
            style={{ boxShadow: '0 0 10px #a855f7' }}
          />
        ))}
      </div>

      <div className="relative z-10 w-full max-w-3xl">
        <AnimatePresence mode="wait">
          {!showResults ? (
            <motion.div 
              key="quiz"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.98 }}
            >
              {/* Header Info */}
              <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-purple-600/10 rounded-2xl flex items-center justify-center border border-purple-500/30 shadow-[0_0_20px_rgba(168,85,247,0.15)]">
                    <Sparkles className="w-6 h-6 text-purple-400" />
                  </div>
                  <div>
                    <h2 className="text-[10px] font-black uppercase tracking-[0.5em] text-purple-400/60">Neural Evaluation</h2>
                    <p className="text-base font-black tracking-tight text-white italic">{quiz.topic}</p>
                  </div>
                </div>
                <button onClick={onExit} className="text-[10px] font-black uppercase tracking-widest text-slate-500 hover:text-red-400 transition-colors">
                  Abort Sequence
                </button>
              </div>

              {/* Progress System */}
              <div className="mb-10 px-2">
                <div className="flex justify-between text-[10px] font-black uppercase tracking-[0.2em] mb-3 text-purple-300/50">
                  <span>Logic Node {currentQuestionIdx + 1} // {quiz.questions.length}</span>
                  <span>Sync: {Math.round(progress)}%</span>
                </div>
                <div className="h-1 w-full bg-white/5 rounded-full overflow-hidden border border-white/5">
                  <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: `${progress}%` }}
                    className="h-full bg-gradient-to-r from-purple-600 via-fuchsia-500 to-purple-400 shadow-[0_0_20px_rgba(168,85,247,0.6)]" 
                  />
                </div>
              </div>

              {/* Question Card */}
              <div className="bg-[#0c0a12]/80 backdrop-blur-2xl border border-white/10 rounded-[2.5rem] p-10 md:p-14 mb-8 shadow-[0_20px_50px_rgba(0,0,0,0.5)] relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-purple-500/20 to-transparent" />
                
                <h3 className="text-2xl md:text-3xl font-black mb-12 tracking-tighter leading-[1.1] italic">
                  {quiz.questions[currentQuestionIdx].question}
                </h3>

                <div className="space-y-4">
                  {quiz.questions[currentQuestionIdx].options.map((option, idx) => (
                    <button
                      key={idx}
                      onClick={() => handleAnswer(idx)}
                      className={`w-full text-left p-6 rounded-2xl border-2 transition-all duration-300 group flex items-center gap-5 ${
                        answers[currentQuestionIdx] === idx
                          ? 'border-purple-500 bg-purple-500/10 text-purple-300 shadow-[0_0_30px_rgba(168,85,247,0.15)]'
                          : 'border-white/5 bg-white/[0.02] hover:bg-white/5 text-slate-400'
                      }`}
                    >
                      <div className={`w-9 h-9 rounded-xl flex items-center justify-center text-xs font-black border-2 transition-colors ${
                        answers[currentQuestionIdx] === idx 
                          ? 'border-purple-400 bg-purple-500 text-white shadow-[0_0_15px_rgba(168,85,247,0.5)]' 
                          : 'border-white/10 bg-black/40 text-slate-500'
                      }`}>
                        {String.fromCharCode(65 + idx)}
                      </div>
                      <span className="font-bold tracking-tight text-lg">{option}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Navigation */}
              <div className="flex justify-between items-center px-2">
                <Button 
                  variant="secondary" 
                  disabled={currentQuestionIdx === 0}
                  onClick={() => setCurrentQuestionIdx(prev => prev - 1)}
                  className="px-8 border-white/10 text-slate-400 hover:text-white"
                >
                  <ArrowLeft className="w-4 h-4 mr-2" /> Previous
                </Button>
                
                {currentQuestionIdx === quiz.questions.length - 1 ? (
                  <Button 
                    onClick={handleFinish} 
                    disabled={answers[currentQuestionIdx] === -1}
                    className="px-12 bg-purple-600 hover:bg-purple-500 shadow-[0_0_40px_rgba(168,85,247,0.3)] border-none text-white font-black italic uppercase"
                  >
                    Finalize Analysis
                  </Button>
                ) : (
                  <Button 
                    onClick={() => setCurrentQuestionIdx(prev => prev + 1)} 
                    disabled={answers[currentQuestionIdx] === -1}
                    className="px-12 bg-white/5 hover:bg-white/10 border-white/10 text-white font-black italic uppercase"
                  >
                    Next
                  </Button>
                )}
              </div>
            </motion.div>
          ) : (
            /* --- RESULTS VIEW (VIOLET THEME) --- */
            <motion.div 
              key="results"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-[#0c0a12]/90 backdrop-blur-3xl border border-purple-500/20 rounded-[4rem] p-16 text-center shadow-3xl relative overflow-hidden"
            >
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(168,85,247,0.1),transparent_50%)]" />
              
              <div className={`w-28 h-28 mx-auto rounded-[2rem] flex items-center justify-center mb-10 border-2 relative z-10 ${
                results.percentage >= PASSING_SCORE 
                  ? 'bg-purple-500/10 border-purple-500/50 text-purple-400 shadow-[0_0_60px_rgba(168,85,247,0.3)]' 
                  : 'bg-red-500/10 border-red-500/50 text-red-500 shadow-[0_0_60px_rgba(239,68,68,0.2)]'
              }`}>
                {results.percentage >= PASSING_SCORE ? (
                  <Trophy className="w-14 h-14" />
                ) : (
                  <XCircle className="w-14 h-14" />
                )}
              </div>
              
              <h2 className="text-5xl font-black mb-6 uppercase italic tracking-tighter text-white relative z-10">
                {results.percentage >= PASSING_SCORE ? 'ASSESSMENT COMPLETE' : 'Failed'}
              </h2>
              
              <p className="text-purple-200/50 mb-12 font-bold tracking-widest uppercase text-xs relative z-10">
                Analysis Rating: <span className="text-white">{results.percentage}% Efficiency</span>
              </p>

              <div className="grid grid-cols-2 gap-6 mb-12 relative z-10">
                <div className="bg-white/5 p-8 rounded-[2.5rem] border border-white/5 backdrop-blur-sm">
                  <p className="text-[10px] text-purple-400/50 uppercase font-black tracking-[0.3em] mb-2">Correct Answers</p>
                  <p className="text-4xl font-black text-white">{results.correct}<span className="text-lg text-slate-600">/{results.total}</span></p>
                </div>
                <div className="bg-white/5 p-8 rounded-[2.5rem] border border-white/5 backdrop-blur-sm">
                  <p className="text-[10px] text-purple-400/50 uppercase font-black tracking-[0.3em] mb-2">Status</p>
                  <p className={`text-3xl font-black italic ${results.percentage >= PASSING_SCORE ? 'text-fuchsia-400' : 'text-red-500'}`}>
                    {results.percentage >= PASSING_SCORE ? 'CERTIFIED' : 'RE-SYNC'}
                  </p>
                </div>
              </div>

              <div className="relative z-10 space-y-6">
                {results.percentage >= PASSING_SCORE ? (
                  <>
                    {isSaving ? (
                      <div className="flex items-center justify-center gap-4 text-purple-400 font-black italic animate-pulse">
                        <Loader2 className="w-6 h-6 animate-spin" /> ENCRYPTING CREDENTIAL...
                      </div>
                    ) : (
                      <div className="py-4 px-6 bg-purple-500/10 border border-purple-500/20 rounded-2xl text-purple-300 text-[10px] font-black uppercase tracking-[0.4em]">
                        Certificate saved in dashboard.
                      </div>
                    )}
                    <Button onClick={onComplete} className="w-full py-10 text-xl font-black uppercase italic bg-purple-600 hover:bg-purple-500 shadow-[0_0_50px_rgba(168,85,247,0.4)]" disabled={isSaving}>
                      Return to Dashboard
                    </Button>
                  </>
                ) : (
                  <>
                    <p className="text-[10px] text-slate-500 leading-relaxed uppercase font-bold tracking-widest">
                      Requirement: {PASSING_SCORE}% Mastery threshold not met.
                    </p>
                    <Button onClick={onComplete} variant="secondary" className="w-full py-10 text-xl font-black uppercase italic border-white/10 hover:bg-white/5">
                      Exit Terminal
                    </Button>
                  </>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default QuizPage;