import React, { useState } from 'react';
import Input from '../components/Input';
import Button from '../components/Button';
import { getCertificateById } from '../services/storageService';
import { Certificate } from '../types';
import { Search, CheckCircle, Shield, ArrowLeft, Loader2, SearchCode, XCircle, ExternalLink } from 'lucide-react';
import FullCertificate from '../components/FullCertificate';
import { motion, AnimatePresence } from 'framer-motion';

interface VerifyPageProps {
  onBack: () => void;
}

const VerifyPage: React.FC<VerifyPageProps> = ({ onBack }) => {
  const [certId, setCertId] = useState('');
  const [result, setResult] = useState<Certificate | null>(null);
  const [hasSearched, setHasSearched] = useState(false);
  const [showFullCert, setShowFullCert] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!certId.trim()) return;
    
    setIsLoading(true);
    try {
        const cert = await getCertificateById(certId.trim());
        setResult(cert);
        setHasSearched(true);
    } catch (error) {
        console.error(error);
        setResult(null);
        setHasSearched(true);
    } finally {
        setIsLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen bg-[#0a0a0c] text-white flex flex-col items-center pt-24 px-4 overflow-hidden">
      
      {/* Background Aura Animation */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div 
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.15, 0.25, 0.15],
          }}
          transition={{ duration: 8, repeat: Infinity }}
          className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[400px] bg-purple-600/20 blur-[120px] rounded-full"
        />
      </div>

      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative z-10 w-full max-w-2xl text-center mb-12"
      >
        <div className="bg-white/5 border border-white/10 p-5 rounded-3xl w-20 h-20 flex items-center justify-center mx-auto mb-8 shadow-2xl backdrop-blur-md">
          <Shield className="w-10 h-10 text-purple-400" />
        </div>
        <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-white via-white to-slate-500 mb-4">
          Credential Verification
        </h1>
        <p className="text-slate-400 text-lg max-w-md mx-auto leading-relaxed">
          Verify the authenticity of digital achievements via our secure ledger.
        </p>
      </motion.div>

      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="relative z-10 w-full max-w-lg bg-[#16161a]/80 backdrop-blur-2xl p-8 rounded-[2.5rem] border border-white/10 shadow-2xl mb-8"
      >
        <form onSubmit={handleVerify} className="space-y-6">
          <Input 
            label="Certificate Hash ID"
            placeholder="Paste unique ID..."
            value={certId}
            onChange={e => {
              setCertId(e.target.value);
              setHasSearched(false);
            }}
            className="text-center font-mono tracking-widest bg-black/20"
            icon={<SearchCode className="w-4 h-4" />}
          />
          <Button type="submit" className="w-full py-7" disabled={!certId || isLoading}>
            {isLoading ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <div className="flex items-center gap-2">
                <Search className="w-5 h-5" /> Verify Now
              </div>
            )}
          </Button>
        </form>

        <AnimatePresence mode="wait">
          {hasSearched && (
            <motion.div 
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="mt-8 pt-8 border-t border-white/5"
            >
              {result ? (
                <div className="text-center">
                  <div className="flex items-center justify-center gap-2 text-emerald-400 mb-6 bg-emerald-500/5 py-2 px-4 rounded-full w-fit mx-auto border border-emerald-500/10">
                    <CheckCircle className="w-4 h-4" />
                    <span className="text-xs font-bold uppercase tracking-widest">Valid Record Found</span>
                  </div>
                  
                  <div className="bg-black/40 rounded-2xl p-6 text-sm text-slate-300 space-y-4 border border-white/5 mb-6 text-left relative overflow-hidden">
                    <div className="flex flex-col gap-1 relative z-10">
                      <span className="text-slate-500 uppercase text-[10px] font-black tracking-tighter">Issued To</span>
                      <span className="text-white text-lg font-bold">{result.userName}</span>
                    </div>

                    <div className="flex flex-col gap-1 relative z-10">
                      <span className="text-slate-500 uppercase text-[10px] font-black tracking-tighter">Topic</span>
                      <span className="text-white font-medium leading-snug line-clamp-2">
                        {result.topic}
                      </span>
                    </div>

                    <div className="pt-4 border-t border-white/5 flex justify-between items-center relative z-10">
                      <div className="flex flex-col">
                        <span className="text-slate-500 uppercase text-[10px] font-black tracking-tighter">Verified On</span>
                        <span className="text-white font-mono">{new Date(result.issuedAt).toLocaleDateString()}</span>
                      </div>
                      <Shield className="w-8 h-8 text-white/5 absolute -right-2 -bottom-2" />
                    </div>
                  </div>

                  <Button 
                    variant="primary" 
                    className="w-full"
                    onClick={() => setShowFullCert(true)}
                  >
                    <div className="flex items-center gap-2">
                       Expand Certificate <ExternalLink className="w-4 h-4" />
                    </div>
                  </Button>
                </div>
              ) : (
                <div className="text-center py-6 px-6 bg-red-500/5 border border-red-500/10 rounded-3xl">
                  <XCircle className="w-10 h-10 text-red-500/50 mx-auto mb-3" />
                  <p className="font-bold text-red-400 mb-1 tracking-tight">Record Not Found</p>
                  <p className="text-xs text-slate-500">This ID does not exist in our secure database.</p>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
       
      <button 
        onClick={onBack} 
        className="relative z-10 mt-4 flex items-center gap-2 text-slate-500 hover:text-white transition-all uppercase text-[10px] font-bold tracking-[0.2em] group"
      >
        <ArrowLeft className="w-3 h-3 transition-transform group-hover:-translate-x-1" /> 
        Return to Portal
      </button>

      {showFullCert && result && (
        <FullCertificate certificate={result} onClose={() => setShowFullCert(false)} />
      )}
    </div>
  );
};

export default VerifyPage;