import React, { useState } from 'react';
import { AlertCircle, CheckCircle2, Sparkles } from 'lucide-react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  success?: boolean;
  icon?: React.ReactNode;
}

const Input: React.FC<InputProps> = ({ 
  label, 
  error, 
  success, 
  icon,
  className = '', 
  onFocus, 
  onBlur, 
  value,
  ...props 
}) => {
  const [isFocused, setIsFocused] = useState(false);

  const handleFocus = (e: React.FocusEvent<HTMLInputElement>) => {
    setIsFocused(true);
    if (onFocus) onFocus(e);
  };

  const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    setIsFocused(false);
    if (onBlur) onBlur(e);
  };

  return (
    <div className="w-full space-y-2">
      {label && (
        <label 
          className={`text-xs font-bold tracking-wider ml-1 transition-colors duration-300 uppercase ${
            error ? 'text-red-400' : isFocused ? 'text-purple-400' : 'text-slate-500'
          }`}
        >
          {label}
        </label>
      )}

      <div 
        className={`
          relative flex items-center transition-all duration-500 rounded-xl border backdrop-blur-md
          ${error 
            ? 'border-red-500/50 bg-red-500/5 shadow-[0_0_15px_rgba(239,68,68,0.1)]' 
            : isFocused 
              ? 'border-purple-500/50 bg-white/5 shadow-[0_0_20px_rgba(168,85,247,0.15)] scale-[1.01]' 
              : 'border-white/10 bg-white/[0.03] hover:bg-white/[0.06] hover:border-white/20'
          }
        `}
      >
        {/* Subtle Glow Accent (Focus Only) */}
        <div className={`absolute inset-0 rounded-xl transition-opacity duration-500 pointer-events-none ${isFocused ? 'opacity-100' : 'opacity-0'} bg-gradient-to-r from-purple-500/10 to-blue-500/10`} />

        <div className="flex-grow flex flex-col px-4 py-3 relative z-10">
          <input
            onFocus={handleFocus}
            onBlur={handleBlur}
            value={value}
            className={`
              w-full bg-transparent outline-none text-white font-medium text-base
              placeholder:text-slate-600 transition-all
              ${className}
            `}
            {...props}
          />
        </div>

        {/* Status Icon */}
        <div className="pr-4 flex items-center justify-center relative z-10">
          {error ? (
            <AlertCircle className="w-5 h-5 text-red-500" />
          ) : success ? (
            <CheckCircle2 className="w-5 h-5 text-emerald-500" />
          ) : (
            <div className={`transition-all duration-500 ${isFocused ? 'text-purple-400 scale-110' : 'text-slate-600'}`}>
              {icon || <Sparkles className="w-4 h-4 fill-current" />}
            </div>
          )}
        </div>
      </div>

      {/* Error Message Section */}
      <div className={`overflow-hidden transition-all duration-300 ${error ? 'max-h-6' : 'max-h-0'}`}>
        <p className="text-[11px] text-red-400 font-medium ml-1 flex items-center gap-1">
          <span className="w-1 h-1 bg-red-400 rounded-full" /> {error}
        </p>
      </div>
    </div>
  );
};

export default Input;