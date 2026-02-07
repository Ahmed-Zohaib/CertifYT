import React, { useState, useEffect } from 'react';
import { User, Certificate, Quiz } from '../types';
import { getUserCertificates } from '../services/storageService';
import { generateQuizFromTopic } from '../services/geminiService';
import Input from '../components/Input';
import Button from '../components/Button';
import CertificateCard from '../components/CertificateCard';
import FullCertificate from '../components/FullCertificate';
import { PlusCircle, Youtube, Loader2, Award, AlertCircle } from 'lucide-react';

interface DashboardPageProps {
  user: User;
  onStartQuiz: (quiz: Quiz) => void;
}

const DashboardPage: React.FC<DashboardPageProps> = ({ user, onStartQuiz }) => {
  const [certificates, setCertificates] = useState<Certificate[]>([]);
  const [loadingCerts, setLoadingCerts] = useState(true);
  const [viewingCert, setViewingCert] = useState<Certificate | null>(null);
  
  // Quiz Generation State
  const [videoUrl, setVideoUrl] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [genError, setGenError] = useState('');

  useEffect(() => {
    // Load certs asynchronously
    getUserCertificates(user.id)
      .then(data => {
        setCertificates(data);
      })
      .catch(err => console.error("Failed to load certs", err))
      .finally(() => setLoadingCerts(false));
  }, [user.id]);

  const isYouTubeShort = (url: string): boolean => {
    return url.includes('youtube.com/shorts/') || url.includes('youtu.be/');
  };

  const handleCreateQuiz = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!videoUrl) {
        setGenError("Please provide the video URL.");
        return;
    }
    
    if (isYouTubeShort(videoUrl)) {
        setGenError("YouTube Shorts are not supported. Please use a full-length YouTube video.");
        return;
    }
    
    setGenError('');
    setIsGenerating(true);

    try {
        // Use the service to generate questions AND get the detected topic and channel name
        const { questions, derivedTopic, channelName } = await generateQuizFromTopic(videoUrl);
        
        const newQuiz: Quiz = {
            id: Date.now().toString(),
            videoUrl,
            topic: derivedTopic,
            channelName,
            questions,
            createdAt: new Date().toISOString()
        };
        onStartQuiz(newQuiz);
    } catch (err: any) {
        setGenError(err.message || "Failed to generate quiz. Try again.");
    } finally {
        setIsGenerating(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      
      {/* Header */}
      <div className="mb-8">
         <h1 className="text-3xl font-bold text-slate-900">Dashboard</h1>
         <p className="text-slate-500">Welcome back, {user.username}. Track your learning progress.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
         
         {/* Left Column: Create Quiz */}
         <div className="lg:col-span-1">
             <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 sticky top-24">
                <div className="flex items-center gap-3 mb-6">
                    <div className="bg-red-100 p-3 rounded-xl">
                        <Youtube className="w-6 h-6 text-red-600" />
                    </div>
                    <div>
                        <h2 className="text-lg font-bold text-slate-900">New Assessment</h2>
                        <p className="text-xs text-slate-500">Generate a quiz from YouTube</p>
                    </div>
                </div>

                <form onSubmit={handleCreateQuiz} className="space-y-4">
                    <Input 
                        label="YouTube Video Link"
                        placeholder="https://youtube.com/watch?v=..."
                        value={videoUrl}
                        onChange={(e) => setVideoUrl(e.target.value)}
                    />

                    {genError && (
                        <div className={`p-3 rounded-lg border flex items-start gap-2 ${genError.includes("Shorts") ? "bg-yellow-50 border-yellow-200 text-yellow-800" : "bg-red-50 border-red-100 text-red-600"}`}>
                            <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
                            {genError}
                        </div>
                    )}

                    <Button type="submit" className="w-full" disabled={isGenerating}>
                        {isGenerating ? (
                            <>
                              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                              Generating Quiz...
                            </>
                        ) : (
                            <>
                              <PlusCircle className="w-4 h-4 mr-2" />
                              Generate Quiz
                            </>
                        )}
                    </Button>
                </form>
             </div>
         </div>

         {/* Right Column: Certificates */}
         <div className="lg:col-span-2 space-y-6">
             <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                    <Award className="w-5 h-5 text-blue-600" />
                    My Certificates
                    <span className="bg-slate-100 text-slate-600 text-xs py-0.5 px-2 rounded-full">
                        {certificates.length}
                    </span>
                </h2>
             </div>

             {loadingCerts ? (
                <div className="flex justify-center p-12">
                   <Loader2 className="w-8 h-8 text-slate-300 animate-spin" />
                </div>
             ) : certificates.length === 0 ? (
                 <div className="bg-slate-50 border-2 border-dashed border-slate-200 rounded-2xl p-12 text-center">
                     <Award className="w-12 h-12 text-slate-300 mx-auto mb-4" />
                     <h3 className="text-slate-900 font-medium mb-1">No certificates yet</h3>
                     <p className="text-slate-500 text-sm">Complete a quiz with 80% or higher to earn your first certificate.</p>
                 </div>
             ) : (
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                     {certificates.map(cert => (
                         <CertificateCard 
                            key={cert.id} 
                            certificate={cert} 
                            onClick={() => setViewingCert(cert)} 
                         />
                     ))}
                 </div>
             )}
         </div>
      </div>

      {viewingCert && (
          <FullCertificate 
            certificate={viewingCert} 
            onClose={() => setViewingCert(null)} 
          />
      )}
    </div>
  );
};

export default DashboardPage;