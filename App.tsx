import React, { useState, useEffect } from 'react';
import { AppState, User, Quiz } from './types';
import { getCurrentSession, logoutUser } from './services/storageService';
import { supabase } from './lib/supabase';
import LandingPage from './pages/Landing';
import DashboardPage from './pages/Dashboard';
import QuizPage from './pages/QuizPage';
import VerifyPage from './pages/VerifyPage';
import AuthPage from './pages/AuthPage';
import { APP_NAME } from './constants';
import { GraduationCap, Loader2, LogOut, User as UserIcon } from 'lucide-react';
import { Analytics } from '@vercel/analytics/react';

const App: React.FC = () => {
  const [appState, setAppState] = useState<AppState>(AppState.LANDING);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [currentQuiz, setCurrentQuiz] = useState<Quiz | null>(null);
  const [loadingSession, setLoadingSession] = useState(true);
  
  useEffect(() => {
    getCurrentSession().then(user => {
      if (user) setCurrentUser(user);
      setLoadingSession(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
         setCurrentUser({
           id: session.user.id,
           email: session.user.email || '',
           username: session.user.user_metadata?.username || 'User',
           createdAt: session.user.created_at
         });
      } else {
         setCurrentUser(null);
         setAppState(AppState.LANDING);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleLogout = async () => {
    await logoutUser();
    setCurrentUser(null);
    setAppState(AppState.LANDING);
  };

  const renderContent = () => {
    if (loadingSession) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
                <Loader2 className="w-10 h-10 text-purple-500 animate-spin" />
                <p className="text-purple-300/50 text-[10px] font-black uppercase tracking-[0.3em]">Initializing Neural Link...</p>
            </div>
        );
    }

    switch (appState) {
      case AppState.LANDING:
        return (
          <LandingPage 
            onLoginClick={() => setAppState(AppState.LOGIN)}
            onVerifyClick={() => setAppState(AppState.VERIFY)}
            isLoggedIn={!!currentUser}
            onDashboardClick={() => setAppState(AppState.DASHBOARD)}
          />
        );
      case AppState.LOGIN:
      case AppState.REGISTER:
        return (
          <AuthPage 
            mode={appState === AppState.LOGIN ? 'login' : 'register'}
            onSuccess={(user) => {
              setCurrentUser(user);
              setAppState(AppState.DASHBOARD);
            }}
            onToggleMode={() => setAppState(prev => prev === AppState.LOGIN ? AppState.REGISTER : AppState.LOGIN)}
            onBack={() => setAppState(AppState.LANDING)}
          />
        );
      case AppState.DASHBOARD:
        if (!currentUser) { setAppState(AppState.LOGIN); return null; }
        return <DashboardPage user={currentUser} onStartQuiz={(quiz) => { setCurrentQuiz(quiz); setAppState(AppState.QUIZ); }} />;
      case AppState.QUIZ:
        if (!currentQuiz || !currentUser) return null;
        return <QuizPage quiz={currentQuiz} user={currentUser} onComplete={() => { setCurrentQuiz(null); setAppState(AppState.DASHBOARD); }} onExit={() => setAppState(AppState.DASHBOARD)} />;
      case AppState.VERIFY:
        return <VerifyPage onBack={() => setAppState(AppState.LANDING)} />;
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-[#020105] text-white flex flex-col selection:bg-purple-500/30">
      
      {/* --- PREMIUM GLOBAL HEADER --- */}
      <nav className="border-b border-white/5 bg-[#020105]/80 backdrop-blur-xl sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          
          {/* Brand Logo */}
          <div 
            className="flex items-center gap-3 cursor-pointer group" 
            onClick={() => setAppState(AppState.LANDING)}
          >
            <div className="bg-gradient-to-br from-purple-600 to-fuchsia-600 p-2 rounded-xl shadow-[0_0_20px_rgba(168,85,247,0.4)] transition-transform group-hover:scale-110">
              <GraduationCap className="h-6 w-6 text-white" />
            </div>
            <span className="text-xl font-black tracking-tighter italic uppercase group-hover:text-purple-400 transition-colors">
              {APP_NAME}
            </span>
          </div>
          
          {/* Action Area */}
          <div className="flex items-center gap-6">
            {appState !== AppState.LANDING && appState !== AppState.VERIFY && (
               <>
                {currentUser ? (
                  <div className="flex items-center gap-6">
                    <div className="hidden md:flex items-center gap-2 px-4 py-2 bg-white/5 rounded-full border border-white/5">
                      <UserIcon className="w-3 h-3 text-purple-400" />
                      <span className="text-xs font-bold text-slate-300 tracking-tight">Hi, {currentUser.username}</span>
                    </div>
                    <button 
                      onClick={handleLogout}
                      className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-slate-500 hover:text-red-400 transition-all"
                    >
                      <LogOut className="w-4 h-4" />
                      <span className="hidden sm:inline">Log Out</span>
                    </button>
                  </div>
                ) : (
                  <button 
                    onClick={() => setAppState(AppState.LOGIN)}
                    className="px-6 py-2.5 bg-gradient-to-r from-purple-600 to-blue-600 rounded-full text-xs font-black uppercase tracking-widest shadow-[0_0_20px_rgba(168,85,247,0.2)] hover:shadow-[0_0_30px_rgba(168,85,247,0.4)] transition-all"
                  >
                    Authorize access
                  </button>
                )}
               </>
            )}
          </div>
        </div>
      </nav>

      {/* Main Content Area */}
      <main className="flex-grow relative">
        {renderContent()}
      </main>

      {/* --- MINIMALIST DARK FOOTER --- */}
      <footer className="border-t border-white/5 bg-[#020105] py-10">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-4">
           <p className="text-slate-600 text-[10px] font-black uppercase tracking-[0.2em]">
             © {new Date().getFullYear()} {APP_NAME}. <span className="text-slate-800 mx-2">|</span> 
             <span className="text-purple-500/50">Core: Gemini Neural API</span>
           </p>

        </div>
      </footer>
      
      <Analytics />
    </div>
  );
};

export default App;