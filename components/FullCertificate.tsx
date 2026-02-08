import React, { useRef, useState, useEffect } from 'react';

// Mock types and constants since they are external in your snippet
const APP_NAME = "CertifyTube";

const FullCertificate = ({ certificate, onClose }) => {
  const certificateRef = useRef(null);
  const [isDownloading, setIsDownloading] = useState(false);
  const [libsLoaded, setLibsLoaded] = useState(false);

  // Safety guard for undefined certificate
  if (!certificate) {
    return (
      <div className="fixed inset-0 z-50 bg-slate-900/95 flex items-center justify-center text-white font-sans">
        <div className="text-center">
          <p className="mb-4">No certificate data available.</p>
          <button onClick={onClose} className="px-6 py-2 bg-white/10 hover:bg-white/20 rounded-full transition-all underline">Close Preview</button>
        </div>
      </div>
    );
  }

  // Ensure we have a consistent ID to display
  const displayId = (certificate.id || 'CERT-VOID').toUpperCase();

  // Load external libraries dynamically to avoid resolution errors
  useEffect(() => {
    const loadScript = (src) => {
      return new Promise((resolve, reject) => {
        if (document.querySelector(`script[src="${src}"]`)) {
          resolve();
          return;
        }
        const script = document.createElement('script');
        script.src = src;
        script.onload = resolve;
        script.onerror = reject;
        document.head.appendChild(script);
      });
    };

    Promise.all([
      loadScript('https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js'),
      loadScript('https://cdnjs.cloudflare.com/ajax/libs/html2canvas/1.4.1/html2canvas.min.js')
    ]).then(() => {
      setLibsLoaded(true);
    }).catch(err => {
      console.error("Failed to load PDF libraries", err);
    });
  }, []);

  const handleDownloadPdf = async () => {
    if (!certificateRef.current || !libsLoaded) return;
    setIsDownloading(true);
    
    try {
      const { jsPDF } = window.jspdf;
      const html2canvas = window.html2canvas;

      const canvas = await html2canvas(certificateRef.current, {
        scale: 3, 
        useCORS: true,
        backgroundColor: '#ffffff',
        logging: false,
        width: 1000,
        height: 707,
        windowWidth: 1000, 
        windowHeight: 707
      });
      
      const imgData = canvas.toDataURL('image/png', 1.0);
      const pdf = new jsPDF({ 
        orientation: 'landscape', 
        unit: 'px', 
        format: [1000, 707] 
      });
      
      pdf.addImage(imgData, 'PNG', 0, 0, 1000, 707);
      pdf.save(`${certificate.userName || 'User'}_Certificate_${displayId}.pdf`);
    } catch (error) {
      console.error("PDF Error:", error);
    } finally {
      setIsDownloading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/95 backdrop-blur-md overflow-auto flex flex-col items-center">
      <div className="py-12 flex flex-col items-center min-w-max">
        
        <div className="bg-white rounded-sm shadow-2xl overflow-hidden">
          
          <div 
            ref={certificateRef}
            data-cert-container
            style={{ width: '1000px', height: '707px', minWidth: '1000px', minHeight: '707px' }} 
            className="bg-white text-slate-800 font-sans relative flex border-[1px] border-slate-200" 
          >
            {/* LEFT MAIN CONTENT AREA */}
            <div className="w-[75%] p-14 flex flex-col border-r border-slate-100 h-full">
              
              <div className="mb-10">
                <p className="text-[10px] text-slate-400 uppercase font-bold tracking-[0.2em] mb-2">Authenticated Academic Record</p>
                <h1 className="text-2xl font-bold text-[#1a365d] tracking-tight flex items-center gap-2">
                   {APP_NAME} <span className="text-slate-300 font-light">|</span> <span className="text-slate-400 text-lg font-medium uppercase tracking-tighter italic">Global Scholars University</span>
                </h1>
              </div>

              <div className="flex-grow">
                <p className="text-[11px] text-slate-400 font-mono mb-6">
                 Issued {new Date(certificate.issuedAt || Date.now()).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })}
                </p>
                
                <div className="mb-12">
                  <div className="inline-block pb-2 mb-6">
                    <h2 className="text-5xl font-extrabold text-[#0f172a] tracking-tight leading-none">
                        {certificate.userName || 'Student Name'}
                    </h2>
                  </div>

                  <p className="text-sm text-slate-500 font-medium">
                    This is to certify that the individual named above has successfully completed the curriculum for
                  </p>
                </div>

                <div className="mb-6">
                  <h3 className="text-3xl font-bold text-[#1a365d] leading-tight max-w-[620px] break-words">
                    {certificate.topic || 'Course Topic'}
                  </h3>
                  <p className="text-[13px] text-slate-600 mt-8 leading-relaxed max-w-[580px]">
                    This rigorous online non-credit program was authorized by <span className="font-semibold text-slate-800">{APP_NAME}</span>. 
                    The recipient has demonstrated mastery of the subject matter through comprehensive 
                    digital assessments, achieving an final evaluation score of <span className="font-bold text-[#1a365d]">{certificate.score || 0}%</span>.
                  </p>
                </div>
              </div>

              {/* Bottom Signature Area */}
              <div className="mt-4 flex items-end justify-between">
                <div className="w-64">
                  <div className="pb-1 mb-2">
                    <p className="text-3xl font-bold italic text-slate-800 leading-none" style={{ fontFamily: '"Brush Script MT", cursive' }}>
                        Dr. Jhon Doe
                    </p>
                  </div>
                  <p className="text-[9px] uppercase font-bold text-slate-400 tracking-wider leading-tight">
                    Chief Academic Officer <br /> 
                    <span className="font-medium opacity-80 italic lowercase">at</span> {APP_NAME}
                  </p>
                </div>
                

              </div>
            </div>

            {/* RIGHT SIDEBAR PANEL */}
            <div className="w-[25%] bg-[#f8fafc] flex flex-col items-center pt-16 relative overflow-hidden h-full">
                <div className="absolute top-0 right-0 w-32 h-32 bg-slate-100 rounded-full -mr-16 -mt-16 opacity-50"></div>
               
               <div className="text-center mb-12 relative z-10">
                  <div className="flex flex-col items-center mb-2">
                    <span className="h-1 w-12 bg-[#1a365d] mb-1"></span>
                    <span className="h-1 w-8 bg-amber-400"></span>
                  </div>
                  <p className="text-[12px] font-black uppercase tracking-[0.3em] text-[#1a365d]">Academic</p>
                  <p className="text-[12px] font-black uppercase tracking-[0.3em] text-[#1a365d]">Credential</p>
               </div>

               <div className="relative flex items-center justify-center">
                  <div className="absolute inset-0 bg-amber-200 blur-2xl rounded-full opacity-20"></div>
                  <div className="w-44 h-44 rounded-full bg-gradient-to-tr from-amber-600 via-amber-400 to-amber-200 p-[2px] shadow-xl">
                    <div className="w-full h-full rounded-full bg-white flex items-center justify-center relative">
                      <div className="absolute inset-2 border-[1px] border-[#1a365d]/20 rounded-full"></div>
                      <div className="absolute inset-3 border-[1px] border-[#1a365d]/10 rounded-full"></div>
                      <div className="text-center z-10 px-4">
                        <div className="mb-1 flex justify-center text-[#1a365d]">
                            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M22 10v6M2 10l10-5 10 5-10 5z"/>
                                <path d="M6 12v5c3 3 9 3 12 0v-5"/>
                            </svg>
                        </div>
                        <p className="text-[10px] font-black text-[#1a365d] leading-none uppercase tracking-tighter">Verified</p>
                        <p className="text-[8px] font-bold text-amber-600 leading-tight uppercase mt-0.5">Achievement</p>
                        <div className="flex items-center gap-1 my-1">
                            <div className="h-[1px] flex-grow bg-slate-200"></div>
                            <div className="w-1 h-1 rounded-full bg-amber-400"></div>
                            <div className="h-[1px] flex-grow bg-slate-200"></div>
                        </div>
                        <p className="text-[7px] font-bold text-slate-400 uppercase tracking-widest">Global Standard</p>
                      </div>
                      <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 bg-[#1a365d] text-white px-3 py-1 rounded text-[8px] font-bold uppercase tracking-widest shadow-md">
                        Validated
                      </div>
                    </div>
                  </div>
               </div>

               <div className="mt-16 text-center">
                   <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-white border border-slate-200 rounded-full shadow-sm mb-2">
                        <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></div>
                        <span className="text-[9px] font-bold text-slate-500 uppercase tracking-tight">System Verified</span>
                   </div>
               </div>

               <div className="absolute bottom-10 px-8 text-center w-full">
                  <p className="text-[9px] text-slate-400 font-bold uppercase tracking-widest mb-2">
                    Digital Verification ID
                  </p>
                  <div className="bg-white/50 backdrop-blur-sm p-2 rounded border border-slate-100">
                    <p className="text-[9px] text-slate-700 font-bold font-mono truncate w-full tracking-tighter">
                      ID: {displayId}
                    </p>
                  </div>
               </div>
            </div>
          </div>

          {/* Action Bar with Improved Interactivity */}
          <div className="bg-slate-900 p-6 flex justify-between items-center px-10 border-t border-white/5">
             <button 
                onClick={onClose} 
                className="text-slate-400 font-bold hover:text-white hover:bg-white/5 active:scale-95 px-4 py-2 rounded-lg transition-all text-xs uppercase tracking-[0.2em] outline-none focus:ring-2 focus:ring-slate-700"
             >
               Close Preview
             </button>
             
             <button 
               onClick={handleDownloadPdf} 
               disabled={isDownloading || !libsLoaded}
               className={`
                 relative overflow-hidden group
                 bg-amber-500 hover:bg-amber-400 active:scale-[0.98] 
                 disabled:bg-slate-700 disabled:active:scale-100 disabled:cursor-not-allowed
                 text-slate-900 font-black py-3 px-10 rounded-xl
                 shadow-[0_0_20px_rgba(245,158,11,0.2)] hover:shadow-[0_0_30px_rgba(245,158,11,0.4)]
                 transition-all duration-200 flex items-center gap-2 uppercase text-xs tracking-widest
                 outline-none focus:ring-4 focus:ring-amber-500/20
               `}
             >
               {!libsLoaded ? (
                 'Initializing...'
               ) : isDownloading ? (
                 <span className="flex items-center gap-3">
                   <div className="w-4 h-4 border-2 border-slate-900/30 border-t-slate-900 rounded-full animate-spin"></div>
                   <span className="animate-pulse">Generating PDF...</span>
                 </span>
               ) : (
                 <>
                   {/* Subtle hover shine effect */}
                   <div className="absolute inset-0 w-1/2 h-full bg-white/20 -skew-x-[45deg] -translate-x-full group-hover:animate-[shine_1s_ease-in-out]"></div>
                   
                   <svg 
                     className="transition-transform group-hover:-translate-y-1" 
                     width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"
                   >
                     <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                     <polyline points="7 10 12 15 17 10"/>
                     <line x1="12" y1="15" x2="12" y2="3"/>
                   </svg>
                   <span>Download Secure PDF</span>
                 </>
               )}
             </button>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes shine {
          100% {
            transform: skewX(-45deg) translateX(400%);
          }
        }
      `}</style>
    </div>
  );
};

export default FullCertificate;