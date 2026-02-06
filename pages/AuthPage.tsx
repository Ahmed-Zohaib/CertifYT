import React, { useState } from 'react';
import Input from '../components/Input';
import Button from '../components/Button';
import { loginUser, registerUser } from '../services/storageService';
import { User } from '../types';
import { Mail, ArrowRight, CheckCircle2 } from 'lucide-react';

interface AuthPageProps {
  mode: 'login' | 'register';
  onSuccess: (user: User) => void;
  onToggleMode: () => void;
  onBack: () => void;
}

const AuthPage: React.FC<AuthPageProps> = ({ mode, onSuccess, onToggleMode, onBack }) => {
  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isVerificationSent, setIsVerificationSent] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
        if (mode === 'register') {
          if (!username || !email || !password) throw new Error("All fields are required");
          
          const { user, session } = await registerUser(username, email, password);
          
          // If Supabase sends back a user but NO session, it means Email Confirmation is enabled
          if (user && !session) {
            setIsVerificationSent(true);
          } else {
            // Immediate login (Email confirmation disabled)
            onSuccess(user);
          }

        } else {
           if (!email || !password) throw new Error("All fields are required");
           const user = await loginUser(email, password);
           onSuccess(user);
        }
    } catch (err: any) {
        let msg = err.message || "Authentication failed";
        // Make the error more user-friendly for this specific case
        if (msg.includes("Email not confirmed")) {
            msg = "Please verify your email address before logging in.";
        }
        setError(msg);
    } finally {
        setIsLoading(false);
    }
  };

  // View: Email Sent Success Screen
  if (isVerificationSent) {
    return (
        <div className="min-h-[calc(100vh-64px)] flex items-center justify-center p-4">
            <div className="bg-white p-8 rounded-2xl shadow-xl max-w-md w-full border border-slate-100 text-center">
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6">
                    <Mail className="w-8 h-8 text-blue-600" />
                </div>
                <h2 className="text-2xl font-bold text-slate-900 mb-2">Check your Inbox</h2>
                <p className="text-slate-500 mb-6">
                    We've sent a verification link to <span className="font-semibold text-slate-900">{email}</span>.
                </p>
                <div className="bg-slate-50 p-4 rounded-lg text-sm text-slate-600 mb-6 border border-slate-200">
                    <p>Click the link in the email to activate your account. You can close this tab.</p>
                </div>
                
                <Button 
                    variant="outline" 
                    className="w-full"
                    onClick={() => window.location.reload()} // Refresh allows them to login cleanly after verifying
                >
                    Back to Login
                </Button>
            </div>
        </div>
    );
  }

  // View: Login / Register Form
  return (
    <div className="min-h-[calc(100vh-64px)] flex items-center justify-center p-4">
       <div className="bg-white p-8 rounded-2xl shadow-xl max-w-md w-full border border-slate-100">
          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold text-slate-900">
              {mode === 'login' ? 'Welcome Back' : 'Create Account'}
            </h2>
            <p className="text-slate-500 mt-2">
              {mode === 'login' ? 'Enter your details to access your certificates.' : 'Start your learning journey today.'}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
             {mode === 'register' && (
               <Input 
                 label="Username" 
                 placeholder="johndoe"
                 value={username}
                 onChange={e => setUsername(e.target.value)}
               />
             )}
             <Input 
                 label="Email Address" 
                 type="email"
                 placeholder="john@example.com"
                 value={email}
                 onChange={e => setEmail(e.target.value)}
             />
             <Input 
                 label="Password" 
                 type="password"
                 placeholder="••••••••"
                 value={password}
                 onChange={e => setPassword(e.target.value)}
             />

             {error && (
               <div className={`p-3 text-sm rounded-lg border flex items-start gap-2 ${error.includes("verify") ? "bg-yellow-50 border-yellow-200 text-yellow-800" : "bg-red-50 border-red-100 text-red-600"}`}>
                 {error.includes("verify") && <CheckCircle2 className="w-4 h-4 mt-0.5 shrink-0" />}
                 {error}
               </div>
             )}

             <Button type="submit" className="w-full" isLoading={isLoading}>
               {mode === 'login' ? 'Sign In' : 'Sign Up'}
             </Button>
          </form>

          <div className="mt-6 text-center text-sm">
             <span className="text-slate-500">
               {mode === 'login' ? "Don't have an account? " : "Already have an account? "}
             </span>
             <button 
               onClick={() => {
                   onToggleMode();
                   setError('');
               }}
               className="font-medium text-blue-600 hover:text-blue-800"
             >
               {mode === 'login' ? 'Sign Up' : 'Sign In'}
             </button>
          </div>
          
          <div className="mt-4 text-center">
            <button onClick={onBack} className="text-xs text-slate-400 hover:text-slate-600">
                Back to Home
            </button>
          </div>
       </div>
    </div>
  );
};

export default AuthPage;