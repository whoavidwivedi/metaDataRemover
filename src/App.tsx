import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Download, RefreshCw, Lock, Sparkles, CheckCircle, Shield, MapPin, Camera, Calendar, User, FileText, FileType, Layout, Image as ImageIcon, ChevronLeft } from 'lucide-react';
import { ImageUploader } from './components/ImageUploader';
import { removeMetadata, formatBytes } from './utils/fileProcessor';
import { FormBuilder } from './components/FormBuilder/FormBuilder';
import { LandingPage } from './components/LandingPage';

function App() {
  const [activeTab, setActiveTab] = useState<'landing' | 'home' | 'builder'>('landing');

  if (activeTab === 'landing') {
    return (
        <div className="h-full w-full flex flex-col items-center relative overflow-hidden font-sans bg-black m-0 p-0">
             {/* Enhanced Background Decorative Elements */}
            <div className="fixed top-0 left-0 w-full h-full overflow-hidden -z-10 pointer-events-none">
                <motion.div 
                    className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-purple-500/20 rounded-full blur-[150px]"
                    animate={{
                        scale: [1, 1.2, 1],
                        opacity: [0.3, 0.5, 0.3],
                    }}
                    transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
                />
                <motion.div 
                    className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-pink-500/20 rounded-full blur-[150px]"
                    animate={{
                        scale: [1, 1.3, 1],
                        opacity: [0.3, 0.5, 0.3],
                    }}
                    transition={{ duration: 10, repeat: Infinity, ease: "easeInOut", delay: 1 }}
                />
                <motion.div 
                    className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[40%] h-[40%] bg-cyan-500/15 rounded-full blur-[120px]"
                    animate={{
                        scale: [1, 1.1, 1],
                        opacity: [0.2, 0.4, 0.2],
                    }}
                    transition={{ duration: 6, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}
                />
            </div>
            
            <LandingPage onNavigate={setActiveTab} />

            <motion.footer 
                className="absolute bottom-0 left-0 right-0 py-4 md:py-6 text-white/60 text-xs md:text-sm flex items-center justify-center gap-2 opacity-60 hover:opacity-100 transition-opacity relative z-10"
                whileHover={{ scale: 1.05 }}
            >
                <Lock className="w-3 h-3" />
                <span>Secure Local Processing • No Server Uploads</span>
            </motion.footer>
        </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col items-center py-10 px-4 relative overflow-hidden font-sans bg-black">
      
      {/* Background Decorative Elements */}
      <div className="fixed top-0 left-0 w-full h-full overflow-hidden -z-10 pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-zinc-800/10 rounded-full blur-[120px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-zinc-800/10 rounded-full blur-[120px]" />
      </div>

      {/* Back to Home Button */}
      <button 
        onClick={() => setActiveTab('landing')}
        className="absolute top-6 left-6 p-2 rounded-full bg-white/5 text-white/50 hover:text-white hover:bg-white/10 transition-all z-50 flex items-center gap-2 text-sm font-medium"
      >
        <ChevronLeft className="w-4 h-4" />
        <span className="hidden md:inline">Back</span>
      </button>

      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-8 relative z-10 w-full max-w-2xl"
      >
        <div className="inline-flex items-center gap-1 p-1 rounded-full bg-white/5 border border-white/10 mb-8 backdrop-blur-md">
          <button
            onClick={() => setActiveTab('home')}
            className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all ${
              activeTab === 'home' 
                ? 'bg-white/20 text-white shadow-lg shadow-white/10' 
                : 'text-white hover:text-white'
            }`}
          >
            <div className="flex items-center gap-2">
              <Shield className="w-3.5 h-3.5" />
              Metadata Remover
            </div>
          </button>
          <button
            onClick={() => setActiveTab('builder')}
            className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all ${
              activeTab === 'builder' 
                ? 'bg-white/20 text-white shadow-lg shadow-white/10' 
                : 'text-white/70 hover:text-white'
            }`}
          >
            <div className="flex items-center gap-2">
              <Layout className="w-3.5 h-3.5" />
              Form Builder
            </div>
          </button>
        </div>

        {activeTab === 'home' && (
          <>
            <h1 className="text-5xl md:text-6xl font-bold mb-6 tracking-tight text-white leading-tight">
              Metadata <span className="gradient-text">Remover</span>
            </h1>
            <p className="text-white text-lg leading-relaxed max-w-lg mx-auto">
              Instantly strip sensitive Exif, XMP, and IPTC data from your photos and PDFs.
              <br/>
              <span className="text-white/70 text-base">Processing happens entirely in your browser.</span>
            </p>
          </>
        )}
      </motion.div>

      <div className="w-full relative z-10">
        <AnimatePresence mode="wait">
          {activeTab === 'home' ? (
            <Home key="home" />
          ) : (
            <FormBuilder key="builder" />
          )}
        </AnimatePresence>
      </div>

      <footer className="mt-auto pt-20 pb-6 text-zinc-600 text-sm flex items-center gap-2 opacity-60 hover:opacity-100 transition-opacity">
        <Lock className="w-3 h-3" />
        <span>Secure Local Processing • No Server Uploads</span>
      </footer>
    </div>
  );
}

function Home() {
  const [file, setFile] = useState<File | null>(null);
  const [processedBlob, setProcessedBlob] = useState<Blob | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleFileSelect = async (selectedFile: File) => {
    setFile(selectedFile);
    setIsProcessing(true);
    setError(null);
    setProcessedBlob(null);

    try {
      const blob = await removeMetadata(selectedFile);
      setProcessedBlob(blob);
    } catch (err) {
      console.error(err);
      setError('Failed to process file. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDownload = () => {
    if (!processedBlob || !file) return;
    const url = URL.createObjectURL(processedBlob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `clean_${file.name}`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleReset = () => {
    setFile(null);
    setProcessedBlob(null);
    setError(null);
  };

  const InfoItem = ({ icon: Icon, label }: { icon: React.ElementType, label: string }) => (
    <div className="flex items-center gap-3 p-3 rounded-lg bg-white/5 border border-white/5">
      <div className="p-2 rounded-full bg-white/10 text-white">
        <Icon className="w-4 h-4" />
      </div>
      <span className="text-sm text-white font-medium">{label}</span>
      <div className="ml-auto text-xs font-bold text-white bg-white/20 px-2 py-1 rounded">
        REMOVED
      </div>
    </div>
  );

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className="w-full"
    >
      <AnimatePresence mode="wait">
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-md p-4 bg-zinc-800/50 border border-zinc-700 text-white rounded-xl text-center mb-6"
            >
              {error}
            </motion.div>
          )}

          {!processedBlob ? (
            <motion.div
              key="uploader"
              exit={{ opacity: 0, y: -20, position: 'absolute' }}
              className="w-full flex justify-center"
            >
              <ImageUploader onFileSelect={handleFileSelect} isProcessing={isProcessing} />
            </motion.div>
          ) : (
            <motion.div
              key="result"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="w-full max-w-3xl mx-auto grid md:grid-cols-2 gap-6"
            >
              {/* Left Column: Image & Stats */}
              <div className="glass-panel p-6 flex flex-col items-center text-center h-full justify-between">
                <div className="w-full">
                  <div className="w-20 h-20 bg-white/10 rounded-full flex items-center justify-center mb-6 mx-auto ring-4 ring-white/5">
                    <CheckCircle className="w-10 h-10 text-white" />
                  </div>
                  
                  <h3 className="text-2xl font-bold text-white mb-2">Sanitization Complete</h3>
                  <p className="text-white/80 mb-8 text-sm">
                    Your file has been scrubbed and cleaned.
                  </p>

                  <div className="w-full bg-black/20 rounded-xl p-4 mb-6 border border-white/5">
                    <div className="flex items-center gap-4">
                      <div className="w-16 h-16 rounded-lg bg-zinc-800 overflow-hidden shrink-0 flex items-center justify-center">
                        {file && (file.type === 'application/pdf' ? (
                          <FileType className="w-8 h-8 text-zinc-400" />
                        ) : (
                          <img src={URL.createObjectURL(file)} className="w-full h-full object-cover opacity-80" alt="prev" />
                        ))}
                      </div>
                      <div className="text-left overflow-hidden">
                        <p className="text-sm font-medium text-white truncate w-full" title={file?.name}>{file?.name}</p>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-xs text-white/70 bg-white/5 px-2 py-0.5 rounded">{file?.type.split('/')[1].toUpperCase()}</span>
                          <span className="text-xs text-white/70">{formatBytes(processedBlob.size)}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="w-full space-y-3">
                  <button
                    onClick={handleDownload}
                    className="w-full py-5 bg-white text-black text-lg font-black tracking-wide rounded-xl flex items-center justify-center gap-3 hover:scale-[1.02] hover:shadow-white/20 transition-all shadow-xl shadow-black/30 active:scale-[0.98] animate-pulse-subtle border border-white/50"
                  >
                    <Download className="w-6 h-6 stroke-[3] text-black" /> DOWNLOAD CLEAN FILE
                  </button>
                  <button
                    onClick={handleReset}
                    className="w-full py-3.5 bg-white/5 text-white font-medium rounded-xl flex items-center justify-center gap-2 hover:bg-white/10 transition-all active:scale-[0.98]"
                  >
                    <RefreshCw className="w-4 h-4 text-white" /> Process Another
                  </button>
                </div>
              </div>

              {/* Right Column: Privacy Report */}
              <div className="glass-panel p-6 flex flex-col">
                <div className="flex items-center gap-3 mb-6 pb-6 border-b border-white/5">
                  <div className="p-2 bg-white/10 rounded-lg text-white">
                    <FileText className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-white">Privacy Report</h3>
                    <p className="text-xs text-zinc-400">Data removed from this file</p>
                  </div>
                </div>
                 
                <div className="space-y-3 flex-1 overflow-y-auto pr-2 custom-scrollbar">
                   <InfoItem icon={MapPin} label="GPS Coordinates" />
                   <InfoItem icon={Camera} label="Camera Model & Lens" />
                   <InfoItem icon={Calendar} label="Date Created" />
                   <InfoItem icon={User} label="Author & Copyright" />
                   <InfoItem icon={Sparkles} label="Software Info" />
                   <InfoItem icon={FileText} label="Embedded Keywords" />
                   <InfoItem icon={ImageIcon} label="Thumbnail Data" />
                </div>

                <div className="mt-6 pt-4 border-t border-white/5 text-center">
                   <p className="text-xs text-zinc-500">
                     This file is now safe to share without revealing personal metadata.
                   </p>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
    </motion.div>
  );
}

export default App;
