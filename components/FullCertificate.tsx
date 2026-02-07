import React from 'react';
import { Certificate } from '../types';
import { Award, CheckCircle2, BookOpen, CheckCircle, XCircle } from 'lucide-react';
import { APP_NAME } from '../constants';
import Button from './Button';

interface FullCertificateProps {
  certificate: Certificate;
  onClose: () => void;
}

const FullCertificate: React.FC<FullCertificateProps> = ({ certificate, onClose }) => {
  const handlePrint = () => {
    window.print();
  };

  // certificate now includes server-side `questions`, `userAnswers`, and `channelName` when available

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl max-w-3xl w-full mx-auto my-8 overflow-hidden animate-in fade-in zoom-in duration-300">
        
        {/* Certificate Body - Print Area */}
        <div className="p-12 text-center border-8 border-double border-slate-100 m-2 relative bg-white print:m-0 print:border-none print:shadow-none" id="printable-certificate">
            
            {/* Watermark */}
            <div className="absolute inset-0 flex items-center justify-center opacity-[0.03] pointer-events-none">
                <Award className="w-96 h-96" />
            </div>

            {/* Header */}
            <div className="relative z-10">
                <div className="flex justify-center mb-6">
                    <div className="bg-blue-600 text-white p-4 rounded-full shadow-lg">
                        <Award className="w-12 h-12" />
                    </div>
                </div>
                
                <h1 className="text-4xl md:text-5xl font-serif font-bold text-slate-900 mb-2 tracking-tight">
                    Certificate of Achievement
                </h1>
                <p className="text-slate-500 uppercase tracking-widest text-sm font-semibold mb-12">
                    Official Verification
                </p>

                {/* Content */}
                <div className="space-y-6 mb-12">
                    <p className="text-lg text-slate-600">This certifies that</p>
                    <p className="text-3xl md:text-4xl font-bold text-blue-600 font-serif border-b-2 border-slate-100 inline-block pb-2 px-8">
                        {certificate.userName}
                    </p>
                    <p className="text-lg text-slate-600 mt-6">
                        Has successfully demonstrated mastery of the topic
                    </p>
                    <p className="text-2xl font-bold text-slate-800 max-w-2xl mx-auto leading-relaxed">
                        "{certificate.topic}"
                    </p>
                    {certificate.channelName && (
                      <p className="text-slate-500 text-sm mt-4">
                        From: <span className="font-semibold text-slate-700">{certificate.channelName}</span>
                      </p>
                    )}
                    <p className="text-slate-500 text-sm mt-4">
                        Based on content from the video source provided.
                    </p>
                </div>

                {/* Footer details */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-sm border-t border-slate-100 pt-8 mt-12">
                    <div className="text-center md:text-left">
                        <p className="text-slate-400 uppercase tracking-wider text-xs font-bold mb-1">Issue Date</p>
                        <p className="font-semibold text-slate-700">
                            {new Date(certificate.issuedAt).toLocaleDateString(undefined, {
                                year: 'numeric',
                                month: 'long',
                                day: 'numeric'
                            })}
                        </p>
                    </div>
                    
                    <div className="text-center">
                         <div className="inline-flex items-center justify-center bg-green-50 text-green-700 px-3 py-1 rounded-full border border-green-200">
                            <CheckCircle2 className="w-4 h-4 mr-2" />
                            Score: {certificate.score}%
                        </div>
                    </div>

                    <div className="text-center md:text-right">
                        <p className="text-slate-400 uppercase tracking-wider text-xs font-bold mb-1">Certificate ID</p>
                        <p className="font-mono font-semibold text-slate-700 select-all">{certificate.id}</p>
                    </div>
                </div>

                <div className="mt-8 text-xs text-slate-400 font-mono">
                    Verified by {APP_NAME} Secure Verification System
                </div>
                {/* Render answer key when server-side data exists */}
                {certificate.questions && certificate.questions.length > 0 && (
                  <div className="mt-8 text-left">
                    <div className="mb-4 flex items-center gap-3">
                      <BookOpen className="w-5 h-5 text-blue-600" />
                      <h4 className="text-md font-semibold">Answer Key</h4>
                    </div>
                    <div className="space-y-4">
                      {certificate.questions.map((q, idx) => {
                        const userAnswer = certificate.userAnswers?.[idx];
                        const isCorrect = userAnswer === q.correctAnswerIndex;
                        return (
                          <div key={idx} className="p-3 rounded-lg border" style={{ borderColor: isCorrect ? '#10b981' : '#ef4444' }}>
                            <p className="font-semibold mb-2">Q{idx + 1}: {q.question}</p>
                            <div className="space-y-2">
                              {q.options.map((opt, optIdx) => {
                                const correctOpt = optIdx === q.correctAnswerIndex;
                                const picked = optIdx === userAnswer;
                                return (
                                  <div key={optIdx} className={`p-2 rounded ${correctOpt ? 'bg-green-50 text-green-800' : picked && !correctOpt ? 'bg-red-50 text-red-800' : 'bg-slate-50 text-slate-700'}`}>
                                    <div className="flex items-center gap-2">
                                      {correctOpt && <CheckCircle className="w-4 h-4" />}
                                      {picked && !correctOpt && <XCircle className="w-4 h-4" />}
                                      <span>{opt}</span>
                                    </div>
                                  </div>
                                );
                              })}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
            </div>
        </div>

        {/* Actions */}
        <div className="bg-slate-50 p-4 flex justify-between items-center print:hidden border-t border-slate-100">
             <button onClick={onClose} className="text-slate-500 hover:text-slate-700 text-sm font-medium px-4">
                Close
             </button>
             <div className="flex gap-2">
                 <Button onClick={handlePrint} variant="outline">Print / Save PDF</Button>
             </div>
        </div>
      </div>
      
      <style>{`
        @media print {
          body * {
            visibility: hidden;
          }
          #printable-certificate, #printable-certificate * {
            visibility: visible;
          }
          #printable-certificate {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
            height: 100%;
            border: none;
            margin: 0;
          }
        }
      `}</style>
    </div>
  );
};

export default FullCertificate;
