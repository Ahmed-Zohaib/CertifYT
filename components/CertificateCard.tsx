import React from 'react';
import { Award, Calendar, ExternalLink, Trophy, ShieldCheck } from 'lucide-react';

const CertificateCard = ({ certificate, onClick }) => {
  // Leonardo-inspired purple/blue theme
  const themeGradient = 'from-purple-500 to-blue-600';
  const score = certificate.score || 0;

  return (
    <div 
      onClick={onClick}
      /* Height reduced: Changed min-h-[380px] to min-h-[280px] */
      className="group relative bg-[#16161a]/80 backdrop-blur-xl rounded-2xl p-[1px] transition-all duration-500 hover:scale-[1.02] active:scale-[0.98] cursor-pointer overflow-hidden border border-white/5 hover:border-white/20 shadow-2xl h-full min-h-[280px]"
    >
      {/* Animated Gradient Border Overlay */}
      <div className={`absolute inset-0 bg-gradient-to-br ${themeGradient} opacity-0 group-hover:opacity-40 transition-opacity duration-500`} />

      {/* Main Card Body - Reduced padding from p-6 to p-5 to accommodate smaller height */}
      <div className="relative bg-[#16161a] rounded-[15px] p-5 h-full flex flex-col z-10 overflow-hidden">
        
        {/* Cinematic Background Glow - Scaled down slightly to match height */}
        <div className={`absolute -top-20 -right-20 w-40 h-40 bg-gradient-to-br ${themeGradient} blur-[60px] opacity-10 group-hover:opacity-30 transition-opacity duration-700`} />

        {/* Decorative Background Icon */}
        <div className="absolute -top-4 -right-4 opacity-[0.03] group-hover:opacity-[0.08] group-hover:rotate-[12deg] group-hover:scale-[1.2] transition-all duration-700 ease-out pointer-events-none">
          <Award className="w-48 h-48 text-white" />
        </div>

        <div className="flex justify-between items-start mb-4 relative z-20">
          <div className="flex items-center gap-2 px-3 py-1 bg-white/5 border border-white/10 text-slate-300 rounded-full">
            <ShieldCheck className="w-3.5 h-3.5 text-purple-400" />
            <span className="text-[10px] font-bold uppercase tracking-widest">Verified</span>
          </div>
          
          <div className="flex flex-col items-end">
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-tighter">Performance</span>
            <span className={`text-xl font-black bg-gradient-to-br ${themeGradient} bg-clip-text text-transparent`}>
              {score}%
            </span>
          </div>
        </div>
        
        {/* flex-grow pushes the footer to the bottom of the fixed-height card */}
        <div className="flex-grow relative z-20">
          <h3 className="text-lg font-bold text-white group-hover:text-purple-300 transition-colors line-clamp-2 mb-3 leading-snug">
            {certificate.topic}
          </h3>
          
          <div className="flex flex-wrap gap-4 items-center text-slate-400">
            <div className="flex items-center gap-1.5 text-xs">
              <Calendar className="w-3.5 h-3.5 text-slate-500" />
              <span>{new Date(certificate.issuedAt).toLocaleDateString(undefined, { month: 'short', year: 'numeric' })}</span>
            </div>
            <div className="flex items-center gap-1.5 text-xs">
              <Trophy className="w-3.5 h-3.5 text-yellow-500/80" />
              <span>AI Certified</span>
            </div>
          </div>
        </div>

        {/* Footer section is now strictly aligned to the bottom */}
        <div className="mt-auto pt-4 border-t border-white/5 flex items-center justify-between relative z-20">
            <div className="flex flex-col max-w-[60%]">
              <span className="text-[9px] font-bold text-slate-600 uppercase tracking-widest">Hash ID</span>
              <code className="text-[10px] font-mono text-slate-400 group-hover:text-slate-200 transition-colors truncate">
                {certificate.id.toUpperCase()}
              </code>
            </div>

            <div className={`
              flex items-center gap-1.5 px-4 py-2 rounded-xl
              bg-white/5 group-hover:bg-gradient-to-br ${themeGradient} 
              text-slate-300 group-hover:text-white
              transition-all duration-300 transform group-hover:scale-105
              border border-white/10 group-hover:border-transparent
            `}>
              <span className="text-xs font-bold uppercase tracking-tight">Expand</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </div>
        </div>
      </div>

      {/* Bottom Shadow Glow (Purple) */}
      <div className={`absolute -bottom-12 left-1/2 -translate-x-1/2 w-2/3 h-20 bg-purple-600 blur-[50px] opacity-0 group-hover:opacity-20 transition-opacity duration-500`} />
    </div>
  );
};

export default CertificateCard;