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
    const [activeTab, setActiveTab] = useState<'certificates' | 'answerKeys'>('certificates');
  
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
    return url.includes('youtube.com/shorts/');
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

            {/* Tabs */}
            <div className="mb-6">
                <div className="inline-flex rounded-full bg-slate-100 p-1">
                    <button
                        onClick={() => setActiveTab('certificates')}
                        className={`px-4 py-2 rounded-full text-sm font-medium ${activeTab === 'certificates' ? 'bg-white shadow-sm' : 'text-slate-600'}`}
                    >
                        Certificates
                    </button>
                    <button
                        onClick={() => setActiveTab('answerKeys')}
                        className={`ml-1 px-4 py-2 rounded-full text-sm font-medium ${activeTab === 'answerKeys' ? 'bg-white shadow-sm' : 'text-slate-600'}`}
                    >
                        Answer Keys
                    </button>
                </div>
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

                 {/* Right Column: Certificates or Answer Keys */}
                 <div className="lg:col-span-2 space-y-6">
                         <div className="flex items-center justify-between">
                                <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                                        <Award className="w-5 h-5 text-blue-600" />
                                        {activeTab === 'certificates' ? 'My Certificates' : 'Answer Keys'}
                                        <span className="bg-slate-100 text-slate-600 text-xs py-0.5 px-2 rounded-full">
                                                {activeTab === 'certificates' ? certificates.length : certificates.filter(c => c.questions && c.questions.length > 0).length}
                                        </span>
                                </h2>
                         </div>

                         {loadingCerts ? (
                                <div className="flex justify-center p-12">
                                     <Loader2 className="w-8 h-8 text-slate-300 animate-spin" />
                                </div>
                         ) : activeTab === 'certificates' ? (
                                 certificates.length === 0 ? (
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
                                 )
                         ) : (
                                 // Answer Keys tab
                                 (() => {
                                     const withKeys = certificates.filter(c => c.questions && c.questions.length > 0);
                                     if (withKeys.length === 0) {
                                         return (
                                             <div className="bg-slate-50 border-2 border-dashed border-slate-200 rounded-2xl p-12 text-center">
                                                 <div className="w-12 h-12 text-slate-300 mx-auto mb-4 flex items-center justify-center">
                                                     <svg className="w-12 h-12" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M12 8.25v.008M12 12v.008M12 15.75v.008M21 12c0 4.97-4.03 9-9 9s-9-4.03-9-9 4.03-9 9-9 9 4.03 9 9z" /></svg>
                                                 </div>
                                                 <h3 className="text-slate-900 font-medium mb-1">No answer keys available</h3>
                                                 <p className="text-slate-500 text-sm">Answer keys are available after you pass an assessment and the system saves the quiz.</p>
                                             </div>
                                         );
                                     }

                                     return (
                                         <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                             {withKeys.map(cert => (
                                                 <div key={cert.id} className="bg-white rounded-xl border border-slate-200 p-4 flex flex-col justify-between">
                                                     <div>
                                                         <h3 className="text-md font-semibold text-slate-900">{cert.topic}</h3>
                                                         <p className="text-sm text-slate-500 mt-1">Issued on {new Date(cert.issuedAt).toLocaleDateString()}</p>
                                                     </div>
                                                     <div className="mt-4 flex items-center gap-2">
                                                         <button onClick={() => setViewingCert(cert)} className="px-3 py-2 bg-blue-600 text-white rounded-lg text-sm">View Answer Key</button>
                                                         <div className="text-xs text-slate-400 font-mono">ID: {cert.id.substring(0,8)}...</div>
                                                     </div>
                                                 </div>
                                             ))}
                                         </div>
                                     );
                                 })()
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