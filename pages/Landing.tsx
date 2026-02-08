import React, { useRef, useMemo, useEffect } from 'react';
import Button from '../components/Button';
import { 
  motion, 
  useScroll, 
  useTransform, 
  useSpring, 
  useInView, 
  useMotionValue
} from 'framer-motion';
import { 
  Trophy, 
  Lock,
  Youtube,
  MousePointer2,
  Fingerprint,
  Activity
} from 'lucide-react';

/* --- INTERFACES --- */
interface LandingPageProps {
  onLoginClick: () => void;
  onVerifyClick: () => void;
  isLoggedIn: boolean;
  onDashboardClick: () => void;
}

interface NeonCardProps {
  icon: React.ReactNode;
  title: string;
  desc: string;
}

interface NeonRowProps {
  num: string;
  title: string;
  desc: string;
  side: 'left' | 'right';
  glowColor: 'cyan' | 'purple' | 'emerald';
  imgSrc: string;
}

/* --- MAIN COMPONENT --- */
const LandingPage: React.FC<LandingPageProps> = ({ 
  onLoginClick, 
  onVerifyClick, 
  isLoggedIn, 
  onDashboardClick 
}) => {
  const containerRef = useRef(null);
  
  // --- MOUSE TRACKING SETUP ---
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  const springConfig = { damping: 20, stiffness: 300 };
  const smoothX = useSpring(mouseX, springConfig);
  const smoothY = useSpring(mouseY, springConfig);

  const moveX = useTransform(smoothX, [0, window.innerWidth], [15, -15]);
  const moveY = useTransform(smoothY, [0, window.innerHeight], [15, -15]);
  const orbMoveX = useTransform(smoothX, [0, window.innerWidth], [30, -30]);
  const orbMoveY = useTransform(smoothY, [0, window.innerHeight], [30, -30]);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      mouseX.set(e.clientX);
      mouseY.set(e.clientY);
    };
    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, [mouseX, mouseY]);

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"]
  });

  const scaleX = useSpring(scrollYProgress, { stiffness: 100, damping: 30 });
  
  // Custom Path for the smooth transition connector
  const pathLength = useSpring(scrollYProgress, { stiffness: 30, damping: 15 });

  const particles = useMemo(() => Array.from({ length: 80 }), []);

  return (
    <div ref={containerRef} className="relative bg-[#020204] text-white overflow-x-hidden selection:bg-cyan-500/30">
      
      {/* --- CURSOR SPOTLIGHT --- */}
      <motion.div
        className="fixed top-0 left-0 w-[500px] h-[500px] bg-cyan-500/10 rounded-full blur-[100px] pointer-events-none z-0"
        style={{ left: smoothX, top: smoothY, x: "-50%", y: "-50%" }}
      />

      {/* --- NEON BACKGROUND ENGINE --- */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <motion.div 
          style={{ x: moveX, y: moveY }}
          className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:40px_40px] [mask-image:radial-gradient(ellipse_80%_80%_at_50%_0%,#000_70%,transparent_100%)]" 
        />
        <motion.div 
          style={{ x: orbMoveX, y: orbMoveY }}
          className="absolute top-[-10%] left-[-10%] w-[60%] h-[60%] bg-cyan-500/20 blur-[120px] rounded-full animate-pulse" 
        />
        {particles.map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-[2px] h-[2px] bg-cyan-400 rounded-full shadow-[0_0_8px_#22d3ee]"
            initial={{ x: Math.random() * 2000, y: Math.random() * 2000, opacity: Math.random() }}
            animate={{ y: [null, -1500], opacity: [0, 1, 0] }}
            transition={{ duration: Math.random() * 10 + 5, repeat: Infinity, ease: "linear" }}
          />
        ))}
      </div>

      {/* TOP PROGRESS BAR */}
      <motion.div className="fixed top-0 left-0 right-0 h-[3px] bg-gradient-to-r from-cyan-500 via-purple-500 to-pink-500 origin-left z-50" style={{ scaleX }} />

      {/* HERO SECTION */}
      <section className="relative min-h-screen flex items-center justify-center pt-24 px-4 overflow-hidden">
        <div className="relative z-10 max-w-7xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="inline-flex items-center gap-2 px-6 py-2 rounded-full bg-cyan-500/5 border border-cyan-500/20 mb-10 backdrop-blur-xl"
          >
            <Activity className="w-4 h-4 text-cyan-400 animate-pulse" />
            <span className="text-[10px] font-black uppercase tracking-[0.5em] text-cyan-200">Neural Link Established</span>
          </motion.div>
          
          <h1 className="text-6xl md:text-[140px] font-black mb-10 tracking-tighter leading-[0.8] uppercase">
            LEARN <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-white to-purple-500">BEYOND.</span>
          </h1>
          
          <p className="text-lg md:text-2xl text-slate-400 max-w-2xl mx-auto mb-16 leading-relaxed font-semibold">
            The AI-first protocol for verifying digital knowledge. Stop watching, start minting your future.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
            <Button onClick={isLoggedIn ? onDashboardClick : onLoginClick} className="w-full sm:w-auto text-xl px-16 py-10 shadow-[0_0_40px_rgba(168,85,247,0.3)]">
               {isLoggedIn ? 'Access Terminal' : 'Launch Protocol'}
            </Button>
            <Button variant="secondary" onClick={onVerifyClick} className="w-full sm:w-auto text-xl px-16 py-10 border-cyan-500/20 text-cyan-400">
              Verify Record
            </Button>
          </div>
        </div>
      </section>

      {/* NEON BENTO GRID */}
      <section className="py-32 relative px-4 z-10">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8">
          <NeonCard 
            icon={<Youtube className="text-cyan-400" />}
            title="Data Scan"
            desc="Deep neural analysis of YouTube datasets to generate complex assessment logic."
          />
          <NeonCard 
            icon={<Fingerprint className="text-purple-400" />}
            title="ID Minting"
            desc="Cryptographically secure certificates issued for the date: 2/6/2026."
          />
          <NeonCard 
            icon={<Lock className="text-emerald-400" />}
            title="Secure Vault"
            desc="All credentials are encrypted and stored on a permanent decentralized ledger."
          />
        </div>
      </section>

      {/* INTERACTIVE PROCESS WITH ORGANIC TRANSITION PATH */}
      <section className="py-60 relative">
        {/* The Organic "Smooth Transition" Path */}
        <div className="absolute left-1/2 -translate-x-1/2 top-0 bottom-0 w-full max-w-6xl pointer-events-none opacity-20 hidden md:block">
          <svg viewBox="0 0 400 1800" fill="none" className="w-full h-full">
            <motion.path
              d="M200 0 C 200 400, 50 500, 50 900 C 50 1300, 350 1400, 350 1800"
              stroke="url(#gradient-path)"
              strokeWidth="2"
              style={{ pathLength }}
            />
            <defs>
              <linearGradient id="gradient-path" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#22d3ee" />
                <stop offset="50%" stopColor="#a855f7" />
                <stop offset="100%" stopColor="#10b981" />
              </linearGradient>
            </defs>
          </svg>
        </div>

        <div className="max-w-6xl mx-auto px-6 space-y-96 relative z-10">
           <NeonRow 
             num="01" 
             title="Initialize" 
             desc="Connect the source link. Our AI begins the deconstruction sequence." 
             side="left" 
             glowColor="cyan"
             imgSrc="https://images.unsplash.com/photo-1451187580459-43490279c0fa?q=80&w=2072&auto=format&fit=crop"
           />
           <NeonRow 
             num="02" 
             title="Analyze" 
             desc="Verify your comprehension through our proprietary stress-test environment." 
             side="right" 
             glowColor="purple"
             imgSrc="https://images.unsplash.com/photo-1550751827-4bd374c3f58b?q=80&w=2070&auto=format&fit=crop"
           />
           <NeonRow 
             num="03" 
             title="Finalize" 
             desc="Your status is updated. Professional-grade records are now available." 
             side="left" 
             glowColor="emerald"
             imgSrc="https://images.unsplash.com/photo-1639322537228-f710d846310a?q=80&w=2832&auto=format&fit=crop"
           />
        </div>
      </section>

      {/* NEON FOOTER */}
      <footer className="py-32 border-t border-cyan-500/10 bg-[#010102] relative z-20">
        <div className="max-w-7xl mx-auto px-6 flex flex-col items-center">
          <div className="flex items-center gap-4 mb-16">
             <div className="w-14 h-14 bg-cyan-500/10 rounded-[20px] flex items-center justify-center border border-cyan-500/30">
                <Trophy className="w-7 h-7 text-cyan-400" />
             </div>
             <span className="text-4xl font-black tracking-tighter uppercase italic">CertifyTube</span>
          </div>
          <div className="flex flex-col md:flex-row justify-between w-full items-center gap-10">
            <p className="text-slate-600 text-[10px] font-black uppercase tracking-[0.5em]">
              © 2026 CertifyTube Neural Protocol.
            </p>
            <div className="flex items-center gap-5 px-8 py-4 bg-cyan-500/5 rounded-full border border-cyan-500/20">
              <MousePointer2 className="w-4 h-4 text-cyan-400" />
              <span className="text-slate-400 text-[10px] font-bold uppercase tracking-widest">Designed by</span>
              <span className="text-cyan-400 text-[10px] font-bold uppercase tracking-widest">Quantum Labs</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

/* --- CUSTOM NEON COMPONENTS --- */

const NeonCard: React.FC<NeonCardProps> = ({ icon, title, desc }) => (
  <motion.div 
    whileHover={{ y: -15, borderColor: 'rgba(34, 211, 238, 0.5)' }}
    className="bg-[#08080a] p-12 rounded-[4rem] border border-white/5 transition-all group"
  >
    <div className="mb-10 w-16 h-16 bg-white/5 rounded-2xl flex items-center justify-center border border-white/5 group-hover:bg-cyan-500/10 transition-colors">
      {icon}
    </div>
    <h3 className="text-2xl font-black mb-4 uppercase tracking-tighter text-white group-hover:text-cyan-400 transition-colors">{title}</h3>
    <p className="text-slate-500 text-sm leading-relaxed font-medium">{desc}</p>
  </motion.div>
);

const NeonRow: React.FC<NeonRowProps> = ({ num, title, desc, side, glowColor, imgSrc }) => {
  const ref = useRef(null);
  const isInView = useInView(ref, { margin: "-20%", once: false });

  const glowMap: Record<string, string> = {
    cyan: "bg-cyan-500/10",
    purple: "bg-purple-500/10",
    emerald: "bg-emerald-500/10",
  };

  return (
    <motion.div 
      ref={ref}
      animate={{ opacity: isInView ? 1 : 0, x: isInView ? 0 : (side === 'left' ? -100 : 100) }}
      transition={{ duration: 1, ease: "easeOut" }}
      className={`flex flex-col ${side === 'right' ? 'md:flex-row-reverse' : 'md:flex-row'} items-center gap-20`}
    >
      <div className="flex-1 text-center md:text-left">
        <span className="text-[150px] font-black leading-none opacity-10 blur-sm">{num}</span>
        <h3 className="text-5xl md:text-8xl font-black mb-8 tracking-tighter uppercase leading-tight">{title}</h3>
        <p className="text-slate-400 text-xl md:text-2xl leading-relaxed max-w-md font-medium">{desc}</p>
      </div>
      
      <div className="flex-1 w-full aspect-video bg-[#0a0a0c] rounded-[3rem] border border-white/5 relative group overflow-hidden shadow-[0_0_50px_rgba(0,0,0,0.3)]">
         {imgSrc && (
           <img 
             src={imgSrc} 
             alt={title} 
             className="absolute inset-0 w-full h-full object-cover opacity-40 group-hover:opacity-80 transition-all duration-1000 grayscale group-hover:grayscale-0 group-hover:scale-110"
           />
         )}
         <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent opacity-80" />
         <div className={`absolute inset-0 ${glowMap[glowColor] || glowMap['cyan']} mix-blend-overlay`} />
      </div>
    </motion.div>
  );
};

export default LandingPage;