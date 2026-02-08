import React from 'react';
import { Loader2, ArrowRight } from 'lucide-react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'danger';
  isLoading?: boolean;
}

const Button: React.FC<ButtonProps> = ({ 
  children, 
  variant = 'primary', 
  className = '', 
  isLoading, 
  disabled,
  ...props 
}) => {
  const baseStyles = "relative inline-flex items-center justify-center px-6 py-3 rounded-xl font-bold uppercase tracking-wider transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed overflow-hidden";
  
  const variants = {
    primary: "bg-gradient-to-r from-purple-600 to-blue-600 text-white shadow-[0_0_20px_rgba(168,85,247,0.2)] hover:shadow-[0_0_25px_rgba(168,85,247,0.4)] hover:scale-[1.02] active:scale-[0.98]",
    secondary: "bg-white/5 backdrop-blur-md text-white border border-white/10 hover:bg-white/10 hover:border-white/20 shadow-xl",
    outline: "bg-transparent text-slate-300 border border-white/10 hover:border-purple-500/50 hover:text-white hover:bg-purple-500/5",
    danger: "bg-red-500/10 text-red-400 border border-red-500/20 hover:bg-red-500/20 hover:text-red-300",
  };

  return (
    <button 
      className={`${baseStyles} ${variants[variant]} ${className} group`}
      disabled={disabled || isLoading}
      {...props}
    >
      {/* Background Shimmer/Sparkle Effect - KEPT THIS */}
      <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none">
        <div className="absolute top-0 -left-full w-full h-full bg-gradient-to-r from-transparent via-white/20 to-transparent skew-x-[-30deg] group-hover:animate-[shimmer_1.5s_infinite]" />
      </div>

      <div className="relative flex items-center z-10">
        {isLoading ? (
          <Loader2 className="w-5 h-5 mr-2 animate-spin" />
        ) : (
          /* ArrowRight and gap div removed */
          children
        )}
      </div>

      <style>{`
        @keyframes shimmer {
          100% { left: 200%; }
        }
      `}</style>
    </button>
  );
};

export default Button;