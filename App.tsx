import React, { useState, useEffect } from 'react';
import { AppState, User, Certificate, Quiz } from './types';
import { getCurrentSession, logoutUser } from './services/storageService';
import { supabase } from './lib/supabase';
import LandingPage from './pages/Landing';
import DashboardPage from './pages/Dashboard';
import QuizPage from './pages/QuizPage';
import VerifyPage from './pages/VerifyPage';
import AuthPage from './pages/AuthPage';
import { APP_NAME } from './constants';
import { GraduationCap, Loader2 } from 'lucide-react';
import { Analytics } from '@vercel/analytics/react';

const App: React.FC = () => {
  const [appState, setAppState] = useState<AppState>(AppState.LANDING);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [currentQuiz, setCurrentQuiz] = useState<Quiz | null>(null);
  const [loadingSession, setLoadingSession] = useState(true);
  
  // Initialize user state from Supabase
  useEffect(() => {
    // Check active session
    getCurrentSession().then(user => {
      if (user) {
        setCurrentUser(user);
        // If we are on landing, go to dashboard
        if (appState === AppState.LANDING) {
             // Optional: Auto-redirect logic could go here
        }
      }
      setLoadingSession(false);
    });

    // Listen for auth changes (like token expiry or external sign out)
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
         // We might need to map the user again if it changed
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

  const handleQuizStart = (quiz: Quiz) => {
      setCurrentQuiz(quiz);
      setAppState(AppState.QUIZ);
  };

  const handleQuizComplete = () => {
      setCurrentQuiz(null);
      setAppState(AppState.DASHBOARD);
  };

  const renderContent = () => {
    if (loadingSession) {
        return (
            <div className="flex items-center justify-center min-h-[50vh]">
                <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
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
        if (!currentUser) {
            setAppState(AppState.LOGIN); 
            return null;
        }
        return (
          <DashboardPage 
            user={currentUser} 
            onStartQuiz={handleQuizStart}
          />
        );
      case AppState.QUIZ:
        if (!currentQuiz || !currentUser) return null;
        return (
            <QuizPage 
                quiz={currentQuiz} 
                user={currentUser}
                onComplete={handleQuizComplete}
                onExit={() => setAppState(AppState.DASHBOARD)}
            />
        );
      case AppState.VERIFY:
        return <VerifyPage onBack={() => setAppState(AppState.LANDING)} />;
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      {/* Navigation */}
      <nav className="bg-white border-b border-slate-200 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center cursor-pointer" onClick={() => setAppState(AppState.LANDING)}>
              <div className="bg-blue-600 p-2 rounded-lg mr-3">
                <GraduationCap className="h-6 w-6 text-white" />
              </div>
              <span className="text-xl font-bold text-slate-900 tracking-tight">{APP_NAME}</span>
            </div>
            
            <div className="flex items-center gap-4">
              {appState !== AppState.LANDING && appState !== AppState.VERIFY && (
                 <>
                    {currentUser ? (
                         <div className="flex items-center gap-4">
                            <span className="text-sm text-slate-600 hidden md:block">Hi, {currentUser.username}</span>
                            <button 
                                onClick={handleLogout}
                                className="text-sm font-medium text-slate-500 hover:text-slate-800"
                            >
                                Sign Out
                            </button>
                         </div>
                    ) : (
                        <button 
                            onClick={() => setAppState(AppState.LOGIN)}
                            className="text-sm font-medium text-blue-600 hover:text-blue-800"
                        >
                            Sign In
                        </button>
                    )}
                 </>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="flex-grow">
        {renderContent()}
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-slate-200 py-8 mt-auto">
        <div className="max-w-7xl mx-auto px-4 text-center">
           <p className="text-slate-400 text-sm">© {new Date().getFullYear()} {APP_NAME}. Powered by Gemini API.</p>
        </div>
      </footer>
      
      {/* Vercel Web Analytics */}
      <Analytics />
    </div>
  );
};

export default App;