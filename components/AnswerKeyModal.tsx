import React from 'react';
import { Certificate } from '../types';
import { BookOpen, CheckCircle, XCircle, X } from 'lucide-react';

interface AnswerKeyModalProps {
  certificate: Certificate;
  onClose: () => void;
}

const AnswerKeyModal: React.FC<AnswerKeyModalProps> = ({ certificate, onClose }) => {
  const themeGradient = 'from-purple-500 to-blue-600';

  if (!certificate.questions || certificate.questions.length === 0) {
    return null; 
  }

  return (
    /* 1. Changed items-center to items-start to anchor to the top.
       2. Added pt-28 to push the modal down past the sticky header.
       3. Kept z-[100] to ensure it covers the navigation bar.
    */
    <div className="fixed inset-0 z-[100] flex items-start justify-center p-4 pt-28 bg-[#020105]/90 backdrop-blur-md overflow-hidden">
      
      {/* Modal Container: 
          - Changed max-h to [80vh] so it doesn't overflow the bottom of the screen when pushed down.
          - my-0 ensures no default centering margins interfere with our pt-28 positioning.
      */}
      <div className="bg-[#0b0a0f] border border-white/10 rounded-3xl shadow-[0_0_50px_rgba(0,0,0,0.5)] max-w-3xl w-full mx-auto my-0 animate-in fade-in zoom-in duration-300 flex flex-col max-h-[80vh] overflow-hidden">
        
        {/* Header: Glassmorphism style (flex-shrink-0) */}
        <div className="bg-white/5 p-6 border-b border-white/5 flex items-center justify-between backdrop-blur-xl flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-lg bg-gradient-to-br ${themeGradient}`}>
              <BookOpen className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-lg font-black text-white uppercase tracking-wider">Assessment Review</h2>
              <p className="text-[10px] text-slate-500 font-bold uppercase tracking-[0.2em] mt-0.5">Neural Verification Log</p>
            </div>
          </div>
          <button 
            onClick={onClose} 
            className="p-2 hover:bg-white/5 rounded-full text-slate-400 hover:text-white transition-all"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Scrollable Content: Questions area */}
        <div className="p-6 overflow-y-auto bg-[#0b0a0f] custom-scrollbar">
          <div className="space-y-6">
            {certificate.questions.map((q, idx) => {
              const userAnswer = certificate.userAnswers?.[idx];
              const isCorrect = userAnswer === q.correctAnswerIndex;
              
              return (
                <div 
                  key={idx} 
                  className={`p-5 rounded-2xl border transition-all ${
                    isCorrect ? 'bg-green-500/5 border-green-500/20' : 'bg-red-500/5 border-red-500/20'
                  }`}
                >
                  <div className="flex items-start gap-4 mb-4">
                    <span className={`flex-shrink-0 w-8 h-8 flex items-center justify-center rounded-xl font-black text-sm shadow-lg ${
                      isCorrect ? 'bg-green-500 text-white shadow-green-500/20' : 'bg-red-500 text-white shadow-red-500/20'
                    }`}>
                      {idx + 1}
                    </span>
                    <p className="font-bold text-slate-200 pt-1 text-base leading-relaxed">{q.question}</p>
                  </div>

                  <div className="space-y-2.5 ml-12">
                    {q.options.map((opt, optIdx) => {
                      const isCorrectOpt = optIdx === q.correctAnswerIndex;
                      const isPicked = optIdx === userAnswer;
                      
                      let optionStyle = "bg-white/5 text-slate-400 border-white/5";
                      if (isCorrectOpt) optionStyle = "bg-green-500/10 text-green-400 border-green-500/30 ring-1 ring-green-500/20";
                      else if (isPicked && !isCorrectOpt) optionStyle = "bg-red-500/10 text-red-400 border-red-500/30 ring-1 ring-red-500/20";

                      return (
                        <div 
                          key={optIdx} 
                          className={`p-3.5 rounded-xl border flex items-center justify-between text-sm transition-all ${optionStyle}`}
                        >
                          <span className={isCorrectOpt || isPicked ? "font-bold" : "font-medium"}>{opt}</span>
                          {isCorrectOpt && <CheckCircle className="w-4 h-4 text-green-400 flex-shrink-0" />}
                          {isPicked && !isCorrectOpt && <XCircle className="w-4 h-4 text-red-400 flex-shrink-0" />}
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Footer: Bottom pinned button (flex-shrink-0) */}
        <div className="bg-white/5 p-5 border-t border-white/5 flex justify-end backdrop-blur-xl flex-shrink-0">
          <button 
            onClick={onClose}
            className={`px-8 py-3 bg-gradient-to-r ${themeGradient} text-white rounded-xl hover:opacity-90 transition-all font-black text-[11px] uppercase tracking-[0.2em] shadow-lg shadow-purple-500/20`}
          >
            Close Session Review
          </button>
        </div>
      </div>
    </div>
  );
};

export default AnswerKeyModal;