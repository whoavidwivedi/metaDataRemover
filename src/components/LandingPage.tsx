import { Shield, FileText, ArrowRight, Lock, Zap, Sparkles, Rocket, Star } from 'lucide-react';
import { motion, useMotionValue } from 'framer-motion';
import { useState, useMemo } from 'react';

interface LandingPageProps {
  onNavigate: (page: 'home' | 'builder') => void;
}

// Floating particles component
const FloatingParticle = ({ delay, duration }: { delay: number; duration: number }) => {
  const [initialX] = useState(() => Math.random() * 100);
  const [initialY] = useState(() => Math.random() * 100);
  const [randomXOffset] = useState(() => Math.random() * 20 - 10);
  
  const x = useMotionValue(initialX);
  const y = useMotionValue(initialY);
  
  return (
    <motion.div
      className="absolute w-2 h-2 rounded-full bg-gradient-to-r from-purple-400 to-pink-400 opacity-60 blur-sm"
      style={{
        left: `${initialX}%`,
        top: `${initialY}%`,
      }}
      animate={{
        y: [0, -30, 0],
        x: [0, randomXOffset, 0],
        scale: [1, 1.5, 1],
        opacity: [0.3, 0.8, 0.3],
      }}
      transition={{
        duration,
        delay,
        repeat: Infinity,
        ease: "easeInOut",
      }}
    />
  );
};

// Animated gradient text
const GradientText = ({ children, className = "" }: { children: React.ReactNode; className?: string }) => {
  return (
    <span className={`bg-gradient-to-r from-purple-400 via-pink-400 to-cyan-400 bg-clip-text text-transparent ${className}`}>
      {children}
    </span>
  );
};

export const LandingPage = ({ onNavigate }: LandingPageProps) => {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

  const particles = useMemo(() => Array.from({ length: 15 }).map((_, i) => ({
    id: i,
    delay: i * 0.2,
    duration: 3 + Math.random() * 2
  })), []);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    setMousePosition({
      x: ((e.clientX - rect.left) / rect.width) * 100,
      y: ((e.clientY - rect.top) / rect.height) * 100,
    });
  };

  return (
    <div 
      className="h-full w-full flex flex-col items-center justify-center p-4 md:p-8 relative overflow-hidden"
      onMouseMove={handleMouseMove}
    >
      {/* Animated gradient background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div
          className="absolute w-[200%] h-[200%] -top-1/2 -left-1/2"
          style={{
            background: `radial-gradient(circle at ${mousePosition.x}% ${mousePosition.y}%, rgba(139, 92, 246, 0.3) 0%, rgba(236, 72, 153, 0.2) 30%, transparent 70%)`,
          }}
          animate={{
            background: [
              `radial-gradient(circle at ${mousePosition.x}% ${mousePosition.y}%, rgba(139, 92, 246, 0.3) 0%, rgba(236, 72, 153, 0.2) 30%, transparent 70%)`,
              `radial-gradient(circle at ${mousePosition.x}% ${mousePosition.y}%, rgba(236, 72, 153, 0.3) 0%, rgba(59, 130, 246, 0.2) 30%, transparent 70%)`,
              `radial-gradient(circle at ${mousePosition.x}% ${mousePosition.y}%, rgba(139, 92, 246, 0.3) 0%, rgba(236, 72, 153, 0.2) 30%, transparent 70%)`,
            ],
          }}
          transition={{ duration: 5, repeat: Infinity }}
        />
      </div>

      {/* Floating particles */}
      {particles.map((p) => (
        <FloatingParticle key={p.id} delay={p.delay} duration={p.duration} />
      ))}

      {/* Hero Section */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center max-w-4xl mx-auto mb-6 md:mb-12 relative z-10"
      >
        <motion.div 
          className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-purple-500/20 via-pink-500/20 to-cyan-500/20 border border-purple-400/30 text-white/90 text-xs font-bold mb-8 backdrop-blur-md"
          animate={{
            scale: [1, 1.05, 1],
            boxShadow: [
              "0 0 20px rgba(139, 92, 246, 0.3)",
              "0 0 30px rgba(236, 72, 153, 0.4)",
              "0 0 20px rgba(139, 92, 246, 0.3)",
            ],
          }}
          transition={{ duration: 2, repeat: Infinity }}
        >
          <motion.span 
            className="w-2 h-2 rounded-full bg-gradient-to-r from-purple-400 to-pink-400"
            animate={{ scale: [1, 1.5, 1], opacity: [0.5, 1, 0.5] }}
            transition={{ duration: 1.5, repeat: Infinity }}
          />
          <span>100% Client-Side • Your Data Never Leaves Your Device</span>
          <motion.span 
            className="w-2 h-2 rounded-full bg-gradient-to-r from-pink-400 to-cyan-400"
            animate={{ scale: [1, 1.5, 1], opacity: [0.5, 1, 0.5] }}
            transition={{ duration: 1.5, repeat: Infinity, delay: 0.5 }}
          />
        </motion.div>
        
        <motion.h1 
          className="text-5xl md:text-7xl lg:text-8xl font-black text-white mb-4 md:mb-6 tracking-tight leading-tight"
          animate={{
            textShadow: [
              "0 0 20px rgba(139, 92, 246, 0.5), 0 0 40px rgba(236, 72, 153, 0.3)",
              "0 0 30px rgba(236, 72, 153, 0.5), 0 0 50px rgba(59, 130, 246, 0.3)",
              "0 0 20px rgba(139, 92, 246, 0.5), 0 0 40px rgba(236, 72, 153, 0.3)",
            ],
          }}
          transition={{ duration: 3, repeat: Infinity }}
        >
          <motion.span
            animate={{ 
              y: [0, -10, 0],
              rotate: [0, 2, -2, 0],
            }}
            transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
            className="inline-block"
          >
            Privacy
          </motion.span>
          {' '}&{' '}
          <GradientText className="inline-block">
            <motion.span
              animate={{ 
                y: [0, 10, 0],
                rotate: [0, -2, 2, 0],
              }}
              transition={{ duration: 4, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}
              className="inline-block"
            >
              Productivity
            </motion.span>
          </GradientText>
          <motion.span
            className="inline-block ml-2"
            animate={{ rotate: [0, 15, -15, 0] }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            🚀
          </motion.span>
        </motion.h1>
        
        <motion.p 
          className="text-base md:text-xl lg:text-2xl text-white/80 max-w-2xl mx-auto leading-relaxed font-medium px-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
        >
          Strip metadata like a <GradientText className="font-bold">boss</GradientText> or build PDF forms that <GradientText className="font-bold">slap</GradientText> 🔥
          <br />
          <span className="text-sm md:text-lg text-white/60 mt-1 md:mt-2 block">All happening 100% in your browser, zero uploads, maximum vibes</span>
        </motion.p>
      </motion.div>

      {/* Feature Orbs - Organic Floating Design */}
      <div className="relative w-full max-w-7xl mx-auto min-h-[350px] md:min-h-[450px] px-4 md:px-8 grid grid-cols-1 md:grid-cols-2 items-center justify-items-center gap-20 md:gap-32 lg:gap-40">
        {/* Metadata Remover - Floating Orb Left */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.5, x: -100, y: 100 }}
          animate={{ opacity: 1, scale: 1, x: 0, y: 0 }}
          transition={{ delay: 0.2, type: "spring", stiffness: 80, damping: 15 }}
          whileHover={{ 
            scale: 1.03,
          }}
          whileTap={{ scale: 0.95 }}
          onClick={() => onNavigate('home')}
          className="group relative cursor-pointer z-20 flex-shrink-0"
          style={{
            filter: "drop-shadow(0 0 40px rgba(139, 92, 246, 0.4))",
          }}
        >
          {/* Main Orb */}
          <motion.div
            className="relative w-40 md:w-48 lg:w-52 h-40 md:h-48 lg:h-52"
          >
            {/* Blob shape using clip-path */}
            <motion.div
              className="absolute inset-0"
              style={{
                clipPath: "polygon(30% 0%, 70% 0%, 100% 30%, 100% 70%, 70% 100%, 30% 100%, 0% 70%, 0% 30%)",
                background: "radial-gradient(circle at 30% 30%, rgba(139, 92, 246, 0.4), rgba(236, 72, 153, 0.3), rgba(59, 130, 246, 0.2))",
                backdropFilter: "blur(20px)",
              }}
              animate={{
                clipPath: [
                  "polygon(30% 0%, 70% 0%, 100% 30%, 100% 70%, 70% 100%, 30% 100%, 0% 70%, 0% 30%)",
                  "polygon(25% 5%, 75% 0%, 100% 25%, 95% 75%, 75% 100%, 25% 95%, 5% 75%, 0% 25%)",
                  "polygon(35% 0%, 65% 5%, 100% 35%, 100% 65%, 65% 100%, 35% 95%, 0% 65%, 0% 35%)",
                  "polygon(30% 0%, 70% 0%, 100% 30%, 100% 70%, 70% 100%, 30% 100%, 0% 70%, 0% 30%)",
                ],
              }}
              transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
            />
            
            {/* Content */}
            <div className="absolute inset-0 flex flex-col items-center justify-center p-3 md:p-4 z-10">
              <motion.div 
                className="w-12 h-12 md:w-14 md:h-14 mb-2"
                whileHover={{ 
                  scale: 1.2, 
                  rotate: [0, -10, 10, -10, 0],
                }}
                transition={{ type: "spring", stiffness: 300 }}
              >
                <div className="w-full h-full bg-gradient-to-br from-purple-400 to-pink-400 rounded-full flex items-center justify-center shadow-2xl shadow-purple-500/50">
                  <Shield className="w-6 h-6 md:w-7 md:h-7 text-white" strokeWidth={2.5} />
                </div>
              </motion.div>
              
              <motion.h3 
                className="text-base md:text-lg lg:text-xl font-black text-white mb-1 text-center px-1"
                animate={{ 
                  textShadow: [
                    "0 0 15px rgba(139, 92, 246, 0.6), 0 0 30px rgba(236, 72, 153, 0.4)",
                    "0 0 25px rgba(236, 72, 153, 0.6), 0 0 40px rgba(139, 92, 246, 0.4)",
                    "0 0 15px rgba(139, 92, 246, 0.6), 0 0 30px rgba(236, 72, 153, 0.4)",
                  ],
                }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                Metadata Remover
              </motion.h3>
              
              <p className="text-white/90 text-[10px] md:text-xs text-center mb-1 md:mb-2 leading-tight px-1">
                Yeet that EXIF into the void 🗑️
              </p>
              
              <motion.div 
                className="flex items-center text-white font-bold text-[10px] md:text-xs group-hover:gap-1 transition-all"
                whileHover={{ x: 3 }}
              >
                <span>Clean Now</span>
                <motion.div
                  animate={{ x: [0, 3, 0] }}
                  transition={{ duration: 1.5, repeat: Infinity }}
                >
                  <ArrowRight className="w-2.5 h-2.5 md:w-3 md:h-3 ml-0.5" />
                </motion.div>
              </motion.div>
            </div>

            {/* Floating sparkles around orb */}
            {Array.from({ length: 3 }).map((_, i) => (
              <motion.div
                key={i}
                className="absolute"
                style={{
                  left: `${30 + i * 20}%`,
                  top: `${20 + i * 25}%`,
                }}
                animate={{
                  y: [0, -15, 0],
                  x: [0, (i % 2 === 0 ? 1 : -1) * 10, 0],
                  opacity: [0, 0.8, 0],
                  scale: [0, 1, 0],
                }}
                transition={{
                  duration: 3,
                  delay: i * 0.5,
                  repeat: Infinity,
                }}
              >
                <Sparkles className="w-2 h-2 md:w-3 md:h-3 text-pink-400" />
              </motion.div>
            ))}
          </motion.div>
        </motion.div>

        {/* Form Builder - Floating Orb Right */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.5, x: 100, y: -100 }}
          animate={{ opacity: 1, scale: 1, x: 0, y: 0 }}
          transition={{ delay: 0.4, type: "spring", stiffness: 80, damping: 15 }}
          whileHover={{ 
            scale: 1.03,
          }}
          whileTap={{ scale: 0.95 }}
          onClick={() => onNavigate('builder')}
          className="group relative cursor-pointer z-20 flex-shrink-0"
          style={{
            filter: "drop-shadow(0 0 40px rgba(59, 130, 246, 0.4))",
          }}
        >
          {/* Main Orb */}
          <motion.div
            className="relative w-40 md:w-48 lg:w-52 h-40 md:h-48 lg:h-52"
          >
            {/* Blob shape using clip-path */}
            <motion.div
              className="absolute inset-0"
              style={{
                clipPath: "polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)",
                background: "radial-gradient(circle at 70% 30%, rgba(59, 130, 246, 0.4), rgba(34, 211, 238, 0.3), rgba(139, 92, 246, 0.2))",
                backdropFilter: "blur(20px)",
              }}
              animate={{
                clipPath: [
                  "polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)",
                  "polygon(45% 5%, 95% 20%, 100% 80%, 55% 95%, 5% 80%, 0% 20%)",
                  "polygon(55% 0%, 100% 30%, 95% 70%, 45% 100%, 0% 70%, 5% 30%)",
                  "polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)",
                ],
              }}
              transition={{ duration: 9, repeat: Infinity, ease: "easeInOut" }}
            />
            
            {/* Content */}
            <div className="absolute inset-0 flex flex-col items-center justify-center p-4 md:p-6 z-10">
              <motion.div 
                className="w-14 h-14 md:w-16 md:h-16 mb-2 md:mb-3"
                whileHover={{ 
                  scale: 1.3, 
                  rotate: [0, 15, -15, 15, 0],
                }}
                transition={{ type: "spring", stiffness: 300 }}
              >
                <div className="w-full h-full bg-gradient-to-br from-cyan-400 to-blue-400 rounded-full flex items-center justify-center shadow-2xl shadow-cyan-500/50">
                  <FileText className="w-7 h-7 md:w-8 md:h-8 text-white" strokeWidth={2.5} />
                </div>
              </motion.div>
              
              <motion.h3 
                className="text-lg md:text-xl lg:text-2xl font-black text-white mb-1 md:mb-2 text-center px-2"
                animate={{ 
                  textShadow: [
                    "0 0 15px rgba(59, 130, 246, 0.6), 0 0 30px rgba(34, 211, 238, 0.4)",
                    "0 0 25px rgba(34, 211, 238, 0.6), 0 0 40px rgba(59, 130, 246, 0.4)",
                    "0 0 15px rgba(59, 130, 246, 0.6), 0 0 30px rgba(34, 211, 238, 0.4)",
                  ],
                }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                PDF Form Builder
              </motion.h3>
              
              <p className="text-white/90 text-xs md:text-sm text-center mb-2 md:mb-3 leading-tight px-2">
                Forms that <GradientText className="font-bold">slap</GradientText> 🔥
              </p>
              
              <motion.div 
                className="flex items-center text-white font-bold text-xs md:text-sm group-hover:gap-2 transition-all"
                whileHover={{ x: 5 }}
              >
                <span>Build Now</span>
                <motion.div
                  animate={{ x: [0, 5, 0] }}
                  transition={{ duration: 1.5, repeat: Infinity }}
                >
                  <ArrowRight className="w-3 h-3 md:w-4 md:h-4 ml-1" />
                </motion.div>
              </motion.div>
            </div>

            {/* Floating stars around orb */}
            {Array.from({ length: 3 }).map((_, i) => (
              <motion.div
                key={i}
                className="absolute"
                style={{
                  left: `${30 + i * 20}%`,
                  top: `${20 + i * 25}%`,
                }}
                animate={{
                  y: [0, 15, 0],
                  x: [0, (i % 2 === 0 ? 1 : -1) * 10, 0],
                  opacity: [0, 0.8, 0],
                  scale: [0, 1, 0],
                }}
                transition={{
                  duration: 3,
                  delay: i * 0.5,
                  repeat: Infinity,
                }}
              >
                <Star className="w-2 h-2 md:w-3 md:h-3 text-cyan-400" />
              </motion.div>
            ))}
          </motion.div>
        </motion.div>

        {/* Connecting Flow Line - Only on desktop */}
        <motion.svg
          className="hidden md:block absolute inset-0 w-full h-full pointer-events-none opacity-30 z-10"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ duration: 2, delay: 0.8 }}
        >
          <motion.path
            d="M 20% 50% Q 50% 30%, 80% 50%"
            stroke="url(#gradient)"
            strokeWidth="2"
            fill="none"
            strokeDasharray="5,5"
            animate={{
              strokeDashoffset: [0, -20],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: "linear",
            }}
          />
          <defs>
            <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="rgba(139, 92, 246, 0.6)" />
              <stop offset="50%" stopColor="rgba(236, 72, 153, 0.6)" />
              <stop offset="100%" stopColor="rgba(59, 130, 246, 0.6)" />
            </linearGradient>
          </defs>
        </motion.svg>
      </div>

      {/* Trust Badges - Floating Pills */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
        className="mt-8 md:mt-12 lg:mt-16 flex flex-wrap items-center justify-center gap-3 md:gap-5 relative z-10 px-4"
      >
        {[
          { icon: Lock, text: "Secure", gradient: "from-purple-400 to-pink-400" },
          { icon: Zap, text: "Lightning Fast", gradient: "from-pink-400 to-cyan-400" },
          { icon: Rocket, text: "Free Forever", gradient: "from-cyan-400 to-blue-400" },
        ].map((badge, i) => (
          <motion.div
            key={i}
            className="relative group"
            whileHover={{ scale: 1.15, y: -8 }}
            animate={{
              y: [0, -8, 0],
              rotate: [0, Math.sin(i) * 3, 0],
            }}
            transition={{
              duration: 3 + i * 0.5,
              delay: i * 0.3,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          >
            {/* Organic pill shape with blur */}
            <motion.div
              className="relative px-4 md:px-6 py-2 md:py-3 backdrop-blur-xl"
              style={{
                background: `linear-gradient(135deg, rgba(139, 92, 246, 0.2), rgba(236, 72, 153, 0.2))`,
                borderRadius: "50px",
                clipPath: "polygon(5% 0%, 95% 0%, 100% 50%, 95% 100%, 5% 100%, 0% 50%)",
              }}
              animate={{
                clipPath: [
                  "polygon(5% 0%, 95% 0%, 100% 50%, 95% 100%, 5% 100%, 0% 50%)",
                  "polygon(8% 2%, 92% 0%, 98% 50%, 92% 98%, 8% 100%, 2% 50%)",
                  "polygon(3% 0%, 97% 2%, 100% 48%, 97% 100%, 3% 98%, 0% 52%)",
                  "polygon(5% 0%, 95% 0%, 100% 50%, 95% 100%, 5% 100%, 0% 50%)",
                ],
              }}
              transition={{ duration: 4 + i, repeat: Infinity, ease: "easeInOut" }}
            >
              <div className="flex items-center gap-2 md:gap-3">
                <motion.div 
                  className={`w-8 h-8 md:w-10 md:h-10 rounded-full bg-gradient-to-br ${badge.gradient} flex items-center justify-center shadow-lg`}
                  whileHover={{ rotate: 360 }}
                  transition={{ duration: 0.5 }}
                >
                  <badge.icon className="w-4 h-4 md:w-5 md:h-5 text-white" />
                </motion.div>
                <span className="text-white/90 font-bold text-xs md:text-sm">{badge.text}</span>
              </div>
            </motion.div>
            
            {/* Glow effect */}
            <motion.div
              className={`absolute inset-0 bg-gradient-to-br ${badge.gradient} opacity-0 group-hover:opacity-30 blur-xl -z-10`}
              style={{ borderRadius: "50px" }}
              animate={{
                scale: [1, 1.2, 1],
                opacity: [0, 0.2, 0],
              }}
              transition={{ duration: 2, repeat: Infinity }}
            />
          </motion.div>
        ))}
      </motion.div>
    </div>
  );
};
