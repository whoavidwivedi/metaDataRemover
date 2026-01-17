import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    IconDownload,
    IconRefresh,
    IconLock,
    IconSparkles,
    IconCircleCheck,
    IconShield,
    IconMapPin,
    IconCamera,
    IconCalendar,
    IconUser,
    IconFileText
} from '@tabler/icons-react';
import { ImageUploader } from './components/ImageUploader';
import { removeMetadata, formatBytes } from './utils/imageProcessor';

function App() {
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
            setError('Failed to process image. Please try again.');
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

    const InfoItem = ({ icon: Icon, label }: { icon: any, label: string }) => (
        <div className="flex items-center gap-3 p-3 rounded-lg bg-secondary/50 border border-border/50">
            <div className="p-2 rounded-full bg-primary/10 text-primary">
                <Icon size={18} />
            </div>
            <span className="text-sm text-foreground/80 font-medium">{label}</span>
            <div className="ml-auto text-[10px] font-bold text-emerald-500 bg-emerald-500/10 px-2 py-0.5 rounded uppercase">
                Removed
            </div>
        </div>
    );

    return (
        <div className="min-h-screen flex flex-col items-center py-12 md:py-20 px-4 relative overflow-hidden selection:bg-primary/30 font-sans">

            {/* Background Glows */}
            <div className="fixed top-0 left-0 w-full h-full overflow-hidden -z-10 pointer-events-none">
                <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary/10 rounded-full blur-[120px]" />
                <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-blue-500/5 rounded-full blur-[120px]" />
            </div>

            <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-center mb-12 relative z-10 w-full max-w-2xl"
            >
                <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-muted border border-border text-xs font-semibold text-primary mb-8 backdrop-blur-md shadow-sm">
                    <IconShield size={14} className="stroke-[2.5]" />
                    <span>Professional Privacy Tool</span>
                </div>
                <h1 className="text-4xl md:text-6xl font-bold mb-6 tracking-tight text-foreground leading-[1.1]">
                    Metadata <span className="text-primary">Remover</span>
                </h1>
                <p className="text-muted-foreground text-lg leading-relaxed max-w-lg mx-auto">
                    Instantly strip sensitive Exif, XMP, and IPTC data from your photos.
                    <br />
                    <span className="text-muted-foreground/60 text-sm font-medium">Processing happens entirely in your browser.</span>
                </p>
            </motion.div>

            <div className="w-full relative z-10">
                <AnimatePresence mode="wait">
                    {error && (
                        <motion.div
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0 }}
                            className="absolute -top-16 left-1/2 -translate-x-1/2 w-full max-w-md p-3 bg-destructive/10 border border-destructive/20 text-destructive text-sm rounded-xl text-center shadow-lg"
                        >
                            {error}
                        </motion.div>
                    )}

                    {!processedBlob ? (
                        <motion.div
                            key="uploader"
                            exit={{ opacity: 0, y: -20, scale: 0.95 }}
                            transition={{ duration: 0.3 }}
                            className="w-full flex justify-center"
                        >
                            <ImageUploader onFileSelect={handleFileSelect} isProcessing={isProcessing} />
                        </motion.div>
                    ) : (
                        <motion.div
                            key="result"
                            initial={{ opacity: 0, scale: 0.98, y: 10 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            className="w-full max-w-4xl mx-auto grid md:grid-cols-2 gap-6"
                        >
                            {/* Left Column: Image & Stats */}
                            <div className="bg-card/50 backdrop-blur-xl border border-border p-8 rounded-[2rem] flex flex-col items-center text-center h-full justify-between shadow-xl">
                                <div className="w-full">
                                    <div className="w-16 h-16 bg-emerald-500/10 rounded-2xl flex items-center justify-center mb-6 mx-auto ring-4 ring-emerald-500/5">
                                        <IconCircleCheck className="w-8 h-8 text-emerald-500" />
                                    </div>

                                    <h3 className="text-2xl font-bold text-foreground mb-2">Sanitization Complete</h3>
                                    <p className="text-muted-foreground mb-8 text-sm">
                                        Your image has been scrubbed and re-encoded.
                                    </p>

                                    <div className="w-full bg-muted/50 rounded-2xl p-5 mb-8 border border-border/50">
                                        <div className="flex items-center gap-4">
                                            <div className="w-14 h-14 rounded-xl bg-muted overflow-hidden shrink-0 border border-border/50 shadow-inner">
                                                {file && <img src={URL.createObjectURL(file)} className="w-full h-full object-cover" alt="prev" />}
                                            </div>
                                            <div className="text-left overflow-hidden">
                                                <p className="text-sm font-semibold text-foreground truncate w-full" title={file?.name}>{file?.name}</p>
                                                <div className="flex items-center gap-2 mt-1">
                                                    <span className="text-[10px] font-bold text-muted-foreground bg-border/50 px-2 py-0.5 rounded uppercase tracking-wider">{file?.type.split('/')[1]}</span>
                                                    <span className="text-[10px] font-medium text-muted-foreground">{formatBytes(processedBlob.size)}</span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="w-full space-y-3">
                                    <button
                                        onClick={handleDownload}
                                        className="w-full py-4 bg-primary text-primary-foreground text-sm font-bold uppercase tracking-widest rounded-2xl flex items-center justify-center gap-3 hover:opacity-90 transition-all shadow-lg shadow-primary/20 active:scale-[0.98]"
                                    >
                                        <IconDownload size={20} className="stroke-[2.5]" /> Download Clean Image
                                    </button>
                                    <button
                                        onClick={handleReset}
                                        className="w-full py-3 text-muted-foreground text-xs font-semibold rounded-xl flex items-center justify-center gap-2 hover:bg-muted/50 transition-all active:scale-[0.98]"
                                    >
                                        <IconRefresh size={14} /> Process Another Image
                                    </button>
                                </div>
                            </div>

                            {/* Right Column: Privacy Report */}
                            <div className="bg-card/30 backdrop-blur-md border border-border p-8 rounded-[2rem] flex flex-col shadow-sm">
                                <div className="flex items-center gap-3 mb-8 pb-6 border-b border-border/50">
                                    <div className="p-2.5 bg-primary/10 rounded-xl text-primary">
                                        <IconFileText size={20} />
                                    </div>
                                    <div>
                                        <h3 className="text-lg font-bold text-foreground">Privacy Report</h3>
                                        <p className="text-xs text-muted-foreground font-medium uppercase tracking-tight">Data removed from this file</p>
                                    </div>
                                </div>

                                <div className="space-y-2.5 flex-1 overflow-y-auto pr-2 custom-scrollbar">
                                    <InfoItem icon={IconMapPin} label="GPS Coordinates" />
                                    <InfoItem icon={IconCamera} label="Camera Model & Lens" />
                                    <InfoItem icon={IconCalendar} label="Date Created" />
                                    <InfoItem icon={IconUser} label="Author & Copyright" />
                                    <InfoItem icon={IconSparkles} label="Software Info" />
                                    <InfoItem icon={IconFileText} label="Embedded Keywords" />
                                    <InfoItem icon={IconFileText} label="Thumbnail Data" />
                                </div>

                                <div className="mt-8 pt-6 border-t border-border/50 text-center">
                                    <p className="text-xs text-muted-foreground/70 leading-relaxed italic">
                                        "This file is now safe to share without revealing personal metadata."
                                    </p>
                                </div>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            <footer className="mt-auto pt-20 pb-6 text-muted-foreground/40 text-xs flex items-center gap-2 font-medium tracking-wide">
                <IconLock size={12} />
                <span>SECURE LOCAL PROCESSING • ZERO SERVER UPLOADS</span>
            </footer>
        </div>
    );
}

export default App;