import { Shield, FileText, ArrowRight, Lock, Zap, Sparkles, Rocket, Star } from 'lucide-react';
import { motion } from 'framer-motion';
import { useState } from 'react';

interface LandingPageProps {
  onNavigate: (page: 'home' | 'builder') => void;
}

// Crazy floating particles with more variety
const FloatingParticle = ({ delay, duration }: { delay: number; duration: number }) => {
  const [initialX] = useState(() => Math.random() * 100);
  const [initialY] = useState(() => Math.random() * 100);
  const [randomXOffset] = useState(() => Math.random() * 40 - 20);
  const [randomYOffset] = useState(() => Math.random() * 40 - 20);
  const [size] = useState(() => 2 + Math.random() * 4);
  
  const colors = [
    'from-purple-400 to-pink-400',
    'from-pink-400 to-cyan-400',
    'from-cyan-400 to-blue-400',
    'from-yellow-400 to-orange-400',
    'from-green-400 to-emerald-400',
  ];
  const [color] = useState(() => colors[Math.floor(Math.random() * colors.length)]);
  
  return (
    <motion.div
      className={`absolute rounded-full bg-gradient-to-r ${color} opacity-70 blur-sm`}
      style={{
        left: `${initialX}%`,
        top: `${initialY}%`,
        width: `${size}px`,
        height: `${size}px`,
      }}
      animate={{
        y: [0, randomYOffset, -randomYOffset, 0],
        x: [0, randomXOffset, -randomXOffset, 0],
        scale: [1, 2, 0.5, 1],
        opacity: [0.3, 1, 0.3, 0.3],
        rotate: [0, 360],
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
  const [mousePosition, setMousePosition] = useState({ x: 50, y: 50 });
  const [hoveredOrb, setHoveredOrb] = useState<string | null>(null);

  const [particles] = useState(() => Array.from({ length: 30 }).map((_, i) => ({
    id: i,
    delay: i * 0.1,
    duration: 2 + Math.random() * 3,
  })));

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
      {/* Multiple animated gradient backgrounds */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {[0, 1, 2].map((i) => (
          <motion.div
            key={i}
            className="absolute w-[300%] h-[300%]"
            style={{
              left: `${-50 + i * 33}%`,
              top: `${-50 + i * 33}%`,
              background: `radial-gradient(circle at ${mousePosition.x}% ${mousePosition.y}%, 
                rgba(${139 + i * 20}, ${92 + i * 30}, ${246 - i * 20}, 0.4) 0%, 
                rgba(${236 - i * 20}, ${72 + i * 30}, ${153 + i * 20}, 0.3) 30%, 
                transparent 70%)`,
            }}
            animate={{
              rotate: [0, 360],
              scale: [1, 1.2, 1],
            }}
            transition={{ 
              duration: 20 + i * 5, 
              repeat: Infinity, 
              ease: "linear",
              delay: i * 2
            }}
          />
        ))}
      </div>

      {/* Floating particles - MORE! */}
      {particles.map((p) => (
        <FloatingParticle key={p.id} delay={p.delay} duration={p.duration} />
      ))}

      {/* Hero Section - CRAZY VERSION */}
      <motion.div 
        initial={{ opacity: 0, y: 20, scale: 0.8 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        className="text-center max-w-5xl mx-auto mb-8 md:mb-16 relative z-10"
      >
        <motion.div 
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-gradient-to-r from-purple-500/30 via-pink-500/30 to-cyan-500/30 border-2 border-purple-400/50 text-white/90 text-xs md:text-sm font-black mb-8 backdrop-blur-xl shadow-2xl shadow-purple-500/50"
          animate={{
            scale: [1, 1.1, 1],
            boxShadow: [
              "0 0 30px rgba(139, 92, 246, 0.5), 0 0 60px rgba(236, 72, 153, 0.3)",
              "0 0 50px rgba(236, 72, 153, 0.6), 0 0 80px rgba(59, 130, 246, 0.4)",
              "0 0 30px rgba(139, 92, 246, 0.5), 0 0 60px rgba(236, 72, 153, 0.3)",
            ],
            rotate: [0, 2, -2, 0],
          }}
          transition={{ duration: 2, repeat: Infinity }}
        >
          <motion.span 
            className="w-3 h-3 rounded-full bg-gradient-to-r from-purple-400 to-pink-400"
            animate={{ 
              scale: [1, 1.8, 1], 
              opacity: [0.5, 1, 0.5],
              rotate: [0, 180, 360]
            }}
            transition={{ duration: 1.5, repeat: Infinity }}
          />
          <span className="text-shadow-lg">100% Client-Side • Your Data Never Leaves Your Device</span>
          <motion.span 
            className="w-3 h-3 rounded-full bg-gradient-to-r from-pink-400 to-cyan-400"
            animate={{ 
              scale: [1, 1.8, 1], 
              opacity: [0.5, 1, 0.5],
              rotate: [0, -180, -360]
            }}
            transition={{ duration: 1.5, repeat: Infinity, delay: 0.5 }}
          />
        </motion.div>
        
        <motion.h1 
          className="text-6xl md:text-8xl lg:text-9xl font-black text-white mb-6 md:mb-8 tracking-tight leading-tight"
          animate={{
            textShadow: [
              "0 0 30px rgba(139, 92, 246, 0.8), 0 0 60px rgba(236, 72, 153, 0.6), 0 0 90px rgba(59, 130, 246, 0.4)",
              "0 0 50px rgba(236, 72, 153, 0.8), 0 0 80px rgba(59, 130, 246, 0.6), 0 0 110px rgba(139, 92, 246, 0.4)",
              "0 0 30px rgba(139, 92, 246, 0.8), 0 0 60px rgba(236, 72, 153, 0.6), 0 0 90px rgba(59, 130, 246, 0.4)",
            ],
          }}
          transition={{ duration: 2, repeat: Infinity }}
        >
          <motion.span
            animate={{ 
              y: [0, -15, 0],
              rotate: [0, 5, -5, 5, 0],
              scale: [1, 1.05, 1],
            }}
            transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
            className="inline-block"
          >
            Privacy
          </motion.span>
          {' '}&{' '}
          <motion.span
            className="inline-block bg-gradient-to-r from-purple-400 via-pink-400 to-cyan-400 bg-clip-text text-transparent"
            animate={{ 
              y: [0, 15, 0],
              rotate: [0, -5, 5, -5, 0],
              scale: [1, 1.05, 1],
            }}
            transition={{ duration: 3, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}
            style={{
              WebkitFontSmoothing: 'antialiased',
              textRendering: 'optimizeLegibility',
              filter: 'drop-shadow(0 0 20px rgba(139, 92, 246, 0.5))',
            }}
          >
            Productivity
          </motion.span>
          <motion.span
            className="inline-block ml-3"
            animate={{ 
              rotate: [0, 20, -20, 20, 0],
              scale: [1, 1.2, 1],
            }}
            transition={{ duration: 1.5, repeat: Infinity }}
          >
            🚀
          </motion.span>
        </motion.h1>
        
        <motion.p 
          className="text-xl md:text-3xl lg:text-4xl text-white/90 max-w-3xl mx-auto leading-relaxed font-bold px-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
        >
          Strip metadata like a <GradientText className="font-black text-2xl md:text-4xl">BOSS</GradientText> or build PDF forms that <GradientText className="font-black text-2xl md:text-4xl">SLAP</GradientText> 🔥💯
          <br />
          <motion.span 
            className="text-lg md:text-2xl text-white/70 mt-3 block"
            animate={{ opacity: [0.7, 1, 0.7] }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            All happening 100% in your browser, zero uploads, MAXIMUM VIBES ✨
          </motion.span>
        </motion.p>
      </motion.div>

      {/* Feature Orbs - CRAZY MORPHING BLOBS */}
      <div className="relative w-full max-w-7xl mx-auto min-h-[400px] md:min-h-[500px] px-4 md:px-8 grid grid-cols-1 md:grid-cols-2 items-center justify-items-center gap-16 md:gap-24 lg:gap-32 mb-12 md:mb-16">
        {/* Metadata Remover - CRAZY ORB */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.3, rotate: -180 }}
          animate={{ opacity: 1, scale: 1, rotate: 0 }}
          transition={{ delay: 0.2, type: "spring", stiffness: 50, damping: 10 }}
          whileHover={{ 
            scale: 1.2,
            rotate: [0, -10, 10, -10, 0],
            z: 50,
          }}
          whileTap={{ scale: 0.9 }}
          onHoverStart={() => setHoveredOrb('metadata')}
          onHoverEnd={() => setHoveredOrb(null)}
          onClick={() => onNavigate('home')}
          className="group relative cursor-pointer z-20 flex-shrink-0"
          style={{
            filter: hoveredOrb === 'metadata' 
              ? "drop-shadow(0 0 80px rgba(139, 92, 246, 0.8)) drop-shadow(0 0 120px rgba(236, 72, 153, 0.6))"
              : "drop-shadow(0 0 40px rgba(139, 92, 246, 0.4))",
          }}
        >
          {/* Main Orb with CRAZY morphing */}
          <motion.div
            className="relative w-48 md:w-64 lg:w-72 h-48 md:h-64 lg:h-72"
            animate={{
              rotate: hoveredOrb === 'metadata' ? [0, 360] : [0, 5, -5, 0],
            }}
            transition={{ 
              duration: hoveredOrb === 'metadata' ? 2 : 8, 
              repeat: Infinity, 
              ease: hoveredOrb === 'metadata' ? "linear" : "easeInOut" 
            }}
          >
            {/* Multiple morphing blob layers */}
            {[0, 1, 2].map((layer) => (
              <motion.div
                key={layer}
                className="absolute inset-0"
                style={{
                  clipPath: layer === 0 
                    ? "polygon(30% 0%, 70% 0%, 100% 30%, 100% 70%, 70% 100%, 30% 100%, 0% 70%, 0% 30%)"
                    : layer === 1
                    ? "polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)"
                    : "polygon(25% 0%, 75% 0%, 100% 50%, 75% 100%, 25% 100%, 0% 50%)",
                  background: `radial-gradient(circle at ${30 + layer * 20}% ${30 + layer * 20}%, 
                    rgba(${139 + layer * 30}, ${92 + layer * 20}, ${246 - layer * 30}, ${0.5 - layer * 0.1}), 
                    rgba(${236 - layer * 20}, ${72 + layer * 30}, ${153 + layer * 20}, ${0.4 - layer * 0.1}), 
                    rgba(${59 + layer * 20}, ${130 - layer * 20}, ${246 + layer * 10}, ${0.3 - layer * 0.1}))`,
                  backdropFilter: "blur(20px)",
                  opacity: 1 - layer * 0.3,
                }}
                animate={{
                  clipPath: [
                    layer === 0 
                      ? "polygon(30% 0%, 70% 0%, 100% 30%, 100% 70%, 70% 100%, 30% 100%, 0% 70%, 0% 30%)"
                      : layer === 1
                      ? "polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)"
                      : "polygon(25% 0%, 75% 0%, 100% 50%, 75% 100%, 25% 100%, 0% 50%)",
                    layer === 0
                      ? "polygon(20% 5%, 80% 0%, 100% 20%, 95% 80%, 80% 100%, 20% 95%, 5% 80%, 0% 20%)"
                      : layer === 1
                      ? "polygon(45% 5%, 95% 20%, 100% 80%, 55% 95%, 5% 80%, 0% 20%)"
                      : "polygon(30% 0%, 70% 5%, 100% 45%, 70% 100%, 30% 95%, 0% 55%)",
                    layer === 0
                      ? "polygon(35% 0%, 65% 5%, 100% 35%, 100% 65%, 65% 100%, 35% 95%, 0% 65%, 0% 35%)"
                      : layer === 1
                      ? "polygon(55% 0%, 100% 30%, 95% 70%, 45% 100%, 0% 70%, 5% 30%)"
                      : "polygon(20% 0%, 80% 5%, 100% 40%, 80% 100%, 20% 95%, 0% 60%)",
                    layer === 0 
                      ? "polygon(30% 0%, 70% 0%, 100% 30%, 100% 70%, 70% 100%, 30% 100%, 0% 70%, 0% 30%)"
                      : layer === 1
                      ? "polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)"
                      : "polygon(25% 0%, 75% 0%, 100% 50%, 75% 100%, 25% 100%, 0% 50%)",
                  ],
                }}
                transition={{ 
                  duration: 6 + layer * 2, 
                  repeat: Infinity, 
                  ease: "easeInOut",
                  delay: layer * 0.5
                }}
              />
            ))}
            
            {/* Content */}
            <div className="absolute inset-0 flex flex-col items-center justify-center p-4 md:p-6 z-10">
              <motion.div 
                className="w-16 h-16 md:w-20 md:h-20 mb-3"
                whileHover={{ 
                  scale: 1.5, 
                  rotate: [0, -360, 360, 0],
                }}
                transition={{ type: "spring", stiffness: 200, damping: 10 }}
              >
                <motion.div 
                  className="w-full h-full bg-gradient-to-br from-purple-400 via-pink-400 to-cyan-400 rounded-full flex items-center justify-center shadow-2xl"
                  animate={{
                    boxShadow: [
                      "0 0 30px rgba(139, 92, 246, 0.8), 0 0 60px rgba(236, 72, 153, 0.6)",
                      "0 0 50px rgba(236, 72, 153, 0.8), 0 0 80px rgba(59, 130, 246, 0.6)",
                      "0 0 30px rgba(139, 92, 246, 0.8), 0 0 60px rgba(236, 72, 153, 0.6)",
                    ],
                  }}
                  transition={{ duration: 2, repeat: Infinity }}
                >
                  <Shield className="w-8 h-8 md:w-10 md:h-10 text-white" strokeWidth={3} />
                </motion.div>
              </motion.div>
              
              <motion.h3 
                className="text-xl md:text-2xl lg:text-3xl font-black text-white mb-2 text-center px-2"
                animate={{ 
                  textShadow: [
                    "0 0 20px rgba(139, 92, 246, 0.8), 0 0 40px rgba(236, 72, 153, 0.6)",
                    "0 0 30px rgba(236, 72, 153, 0.8), 0 0 50px rgba(139, 92, 246, 0.6)",
                    "0 0 20px rgba(139, 92, 246, 0.8), 0 0 40px rgba(236, 72, 153, 0.6)",
                  ],
                }}
                transition={{ duration: 1.5, repeat: Infinity }}
              >
                Metadata Remover
              </motion.h3>
              
              <p className="text-white/90 text-sm md:text-base text-center mb-3 leading-tight px-2">
                Yeet that EXIF into the void 🗑️💨
              </p>
              
              <motion.div 
                className="flex items-center text-white font-black text-sm md:text-base group-hover:gap-3 transition-all"
                whileHover={{ x: 10, scale: 1.1 }}
              >
                <span>Clean Now</span>
                <motion.div
                  animate={{ x: [0, 8, 0] }}
                  transition={{ duration: 1, repeat: Infinity }}
                >
                  <ArrowRight className="w-4 h-4 md:w-5 md:h-5 ml-2" strokeWidth={3} />
                </motion.div>
              </motion.div>
            </div>

            {/* CRAZY sparkles */}
            {Array.from({ length: 8 }).map((_, i) => (
              <motion.div
                key={i}
                className="absolute"
                style={{
                  left: `${20 + (i % 4) * 20}%`,
                  top: `${15 + Math.floor(i / 4) * 30}%`,
                }}
                animate={{
                  y: [0, -40, 0],
                  x: [0, (i % 2 === 0 ? 1 : -1) * 20, 0],
                  opacity: [0, 1, 0],
                  scale: [0, 2, 0],
                  rotate: [0, 360],
                }}
                transition={{
                  duration: 2 + i * 0.3,
                  delay: i * 0.2,
                  repeat: Infinity,
                }}
              >
                <Sparkles className="w-4 h-4 md:w-5 md:h-5 text-pink-400" />
              </motion.div>
            ))}
          </motion.div>
        </motion.div>

        {/* Form Builder - CRAZY ORB */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.3, rotate: 180 }}
          animate={{ opacity: 1, scale: 1, rotate: 0 }}
          transition={{ delay: 0.4, type: "spring", stiffness: 50, damping: 10 }}
          whileHover={{ 
            scale: 1.2,
            rotate: [0, 10, -10, 10, 0],
            z: 50,
          }}
          whileTap={{ scale: 0.9 }}
          onHoverStart={() => setHoveredOrb('builder')}
          onHoverEnd={() => setHoveredOrb(null)}
          onClick={() => onNavigate('builder')}
          className="group relative cursor-pointer z-20 flex-shrink-0"
          style={{
            filter: hoveredOrb === 'builder' 
              ? "drop-shadow(0 0 80px rgba(59, 130, 246, 0.8)) drop-shadow(0 0 120px rgba(34, 211, 238, 0.6))"
              : "drop-shadow(0 0 40px rgba(59, 130, 246, 0.4))",
          }}
        >
          {/* Main Orb with CRAZY morphing */}
          <motion.div
            className="relative w-48 md:w-64 lg:w-72 h-48 md:h-64 lg:h-72"
            animate={{
              rotate: hoveredOrb === 'builder' ? [0, -360] : [0, -5, 5, -5, 0],
            }}
            transition={{ 
              duration: hoveredOrb === 'builder' ? 2 : 8, 
              repeat: Infinity, 
              ease: hoveredOrb === 'builder' ? "linear" : "easeInOut" 
            }}
          >
            {/* Multiple morphing blob layers */}
            {[0, 1, 2].map((layer) => (
              <motion.div
                key={layer}
                className="absolute inset-0"
                style={{
                  clipPath: layer === 0 
                    ? "polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)"
                    : layer === 1
                    ? "polygon(30% 0%, 70% 0%, 100% 30%, 100% 70%, 70% 100%, 30% 100%, 0% 70%, 0% 30%)"
                    : "polygon(25% 0%, 75% 0%, 100% 50%, 75% 100%, 25% 100%, 0% 50%)",
                  background: `radial-gradient(circle at ${70 - layer * 20}% ${30 + layer * 20}%, 
                    rgba(${59 + layer * 30}, ${130 - layer * 20}, ${246 + layer * 10}, ${0.5 - layer * 0.1}), 
                    rgba(${34 + layer * 20}, ${211 - layer * 30}, ${238 + layer * 20}, ${0.4 - layer * 0.1}), 
                    rgba(${139 - layer * 20}, ${92 + layer * 20}, ${246 - layer * 10}, ${0.3 - layer * 0.1}))`,
                  backdropFilter: "blur(20px)",
                  opacity: 1 - layer * 0.3,
                }}
                animate={{
                  clipPath: [
                    layer === 0 
                      ? "polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)"
                      : layer === 1
                      ? "polygon(30% 0%, 70% 0%, 100% 30%, 100% 70%, 70% 100%, 30% 100%, 0% 70%, 0% 30%)"
                      : "polygon(25% 0%, 75% 0%, 100% 50%, 75% 100%, 25% 100%, 0% 50%)",
                    layer === 0
                      ? "polygon(45% 5%, 95% 20%, 100% 80%, 55% 95%, 5% 80%, 0% 20%)"
                      : layer === 1
                      ? "polygon(25% 5%, 75% 0%, 100% 25%, 95% 75%, 75% 100%, 25% 95%, 5% 75%, 0% 25%)"
                      : "polygon(30% 0%, 70% 5%, 100% 45%, 70% 100%, 30% 95%, 0% 55%)",
                    layer === 0
                      ? "polygon(55% 0%, 100% 30%, 95% 70%, 45% 100%, 0% 70%, 5% 30%)"
                      : layer === 1
                      ? "polygon(35% 0%, 65% 5%, 100% 35%, 100% 65%, 65% 100%, 35% 95%, 0% 65%, 0% 35%)"
                      : "polygon(20% 0%, 80% 5%, 100% 40%, 80% 100%, 20% 95%, 0% 60%)",
                    layer === 0 
                      ? "polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)"
                      : layer === 1
                      ? "polygon(30% 0%, 70% 0%, 100% 30%, 100% 70%, 70% 100%, 30% 100%, 0% 70%, 0% 30%)"
                      : "polygon(25% 0%, 75% 0%, 100% 50%, 75% 100%, 25% 100%, 0% 50%)",
                  ],
                }}
                transition={{ 
                  duration: 7 + layer * 2, 
                  repeat: Infinity, 
                  ease: "easeInOut",
                  delay: layer * 0.5
                }}
              />
            ))}
            
            {/* Content */}
            <div className="absolute inset-0 flex flex-col items-center justify-center p-4 md:p-6 z-10">
              <motion.div 
                className="w-16 h-16 md:w-20 md:h-20 mb-3"
                whileHover={{ 
                  scale: 1.5, 
                  rotate: [0, 360, -360, 0],
                }}
                transition={{ type: "spring", stiffness: 200, damping: 10 }}
              >
                <motion.div 
                  className="w-full h-full bg-gradient-to-br from-cyan-400 via-blue-400 to-purple-400 rounded-full flex items-center justify-center shadow-2xl"
                  animate={{
                    boxShadow: [
                      "0 0 30px rgba(59, 130, 246, 0.8), 0 0 60px rgba(34, 211, 238, 0.6)",
                      "0 0 50px rgba(34, 211, 238, 0.8), 0 0 80px rgba(59, 130, 246, 0.6)",
                      "0 0 30px rgba(59, 130, 246, 0.8), 0 0 60px rgba(34, 211, 238, 0.6)",
                    ],
                  }}
                  transition={{ duration: 2, repeat: Infinity }}
                >
                  <FileText className="w-8 h-8 md:w-10 md:h-10 text-white" strokeWidth={3} />
                </motion.div>
              </motion.div>
              
              <motion.h3 
                className="text-xl md:text-2xl lg:text-3xl font-black text-white mb-2 text-center px-2"
                animate={{ 
                  textShadow: [
                    "0 0 20px rgba(59, 130, 246, 0.8), 0 0 40px rgba(34, 211, 238, 0.6)",
                    "0 0 30px rgba(34, 211, 238, 0.8), 0 0 50px rgba(59, 130, 246, 0.6)",
                    "0 0 20px rgba(59, 130, 246, 0.8), 0 0 40px rgba(34, 211, 238, 0.6)",
                  ],
                }}
                transition={{ duration: 1.5, repeat: Infinity }}
              >
                PDF Form Builder
              </motion.h3>
              
              <p className="text-white/90 text-sm md:text-base text-center mb-3 leading-tight px-2">
                Forms that <GradientText className="font-black">SLAP</GradientText> 🔥💯
              </p>
              
              <motion.div 
                className="flex items-center text-white font-black text-sm md:text-base group-hover:gap-3 transition-all"
                whileHover={{ x: 10, scale: 1.1 }}
              >
                <span>Build Now</span>
                <motion.div
                  animate={{ x: [0, 8, 0] }}
                  transition={{ duration: 1, repeat: Infinity }}
                >
                  <ArrowRight className="w-4 h-4 md:w-5 md:h-5 ml-2" strokeWidth={3} />
                </motion.div>
              </motion.div>
            </div>

            {/* CRAZY stars */}
            {Array.from({ length: 8 }).map((_, i) => (
              <motion.div
                key={i}
                className="absolute"
                style={{
                  left: `${20 + (i % 4) * 20}%`,
                  top: `${15 + Math.floor(i / 4) * 30}%`,
                }}
                animate={{
                  y: [0, 40, 0],
                  x: [0, (i % 2 === 0 ? 1 : -1) * 20, 0],
                  opacity: [0, 1, 0],
                  scale: [0, 2, 0],
                  rotate: [0, -360],
                }}
                transition={{
                  duration: 2 + i * 0.3,
                  delay: i * 0.2,
                  repeat: Infinity,
                }}
              >
                <Star className="w-4 h-4 md:w-5 md:h-5 text-cyan-400" />
              </motion.div>
            ))}
          </motion.div>
        </motion.div>

        {/* Connecting Flow Line - CRAZY */}
        <motion.svg
          className="hidden md:block absolute inset-0 w-full h-full pointer-events-none opacity-40 z-10"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ duration: 2, delay: 0.8 }}
        >
          <motion.path
            d="M 20% 50% Q 50% 20%, 80% 50%"
            stroke="url(#gradient)"
            strokeWidth="3"
            fill="none"
            strokeDasharray="8,4"
            animate={{
              strokeDashoffset: [0, -30],
              pathLength: [0.5, 1, 0.5],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: "linear",
            }}
          />
          <defs>
            <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="rgba(139, 92, 246, 0.8)" />
              <stop offset="50%" stopColor="rgba(236, 72, 153, 0.8)" />
              <stop offset="100%" stopColor="rgba(59, 130, 246, 0.8)" />
            </linearGradient>
          </defs>
        </motion.svg>
      </div>

      {/* Trust Badges - CRAZY PILLS */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
        className="mt-20 md:mt-32 lg:mt-40 flex flex-wrap items-center justify-center gap-4 md:gap-6 relative z-0 px-4 w-full"
      >
        {[
          { icon: Lock, text: "Secure", gradient: "from-purple-400 to-pink-400", emoji: "🔒" },
          { icon: Zap, text: "Lightning Fast", gradient: "from-pink-400 to-cyan-400", emoji: "⚡" },
          { icon: Rocket, text: "Free Forever", gradient: "from-cyan-400 to-blue-400", emoji: "🚀" },
        ].map((badge, i) => (
          <motion.div
            key={i}
            className="relative group"
            whileHover={{ scale: 1.2, y: -10, rotate: [0, -5, 5, 0] }}
            animate={{
              y: [0, -5, 0],
              rotate: [0, Math.sin(i) * 5, 0],
            }}
            transition={{
              duration: 2 + i * 0.5,
              delay: i * 0.3,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          >
            {/* CRAZY pill shape */}
            <motion.div
              className="relative px-5 md:px-7 py-3 md:py-4 backdrop-blur-xl"
              style={{
                background: `linear-gradient(135deg, rgba(139, 92, 246, 0.3), rgba(236, 72, 153, 0.3))`,
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
                boxShadow: [
                  "0 0 20px rgba(139, 92, 246, 0.5), 0 0 40px rgba(236, 72, 153, 0.3)",
                  "0 0 30px rgba(236, 72, 153, 0.6), 0 0 50px rgba(59, 130, 246, 0.4)",
                  "0 0 20px rgba(139, 92, 246, 0.5), 0 0 40px rgba(236, 72, 153, 0.3)",
                ],
              }}
              transition={{ duration: 3 + i, repeat: Infinity, ease: "easeInOut" }}
            >
              <div className="flex items-center gap-3 md:gap-4">
                <motion.div 
                  className={`w-10 h-10 md:w-12 md:h-12 rounded-full bg-gradient-to-br ${badge.gradient} flex items-center justify-center shadow-lg`}
                  whileHover={{ rotate: 360, scale: 1.3 }}
                  transition={{ duration: 0.5 }}
                >
                  <badge.icon className="w-5 h-5 md:w-6 md:h-6 text-white" strokeWidth={2.5} />
                </motion.div>
                <span className="text-white/90 font-black text-sm md:text-base">{badge.text}</span>
                <motion.span
                  className="text-xl md:text-2xl"
                  animate={{ 
                    rotate: [0, 15, -15, 0],
                    scale: [1, 1.2, 1],
                  }}
                  transition={{ duration: 2, repeat: Infinity }}
                >
                  {badge.emoji}
                </motion.span>
              </div>
            </motion.div>
            
            {/* CRAZY glow effect */}
            <motion.div
              className={`absolute inset-0 bg-gradient-to-br ${badge.gradient} opacity-0 group-hover:opacity-40 blur-2xl -z-10 rounded-full`}
              animate={{
                scale: [1, 1.5, 1],
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
