import { useState } from 'react';
import { motion } from 'framer-motion';
import { IconQrcode, IconCopy } from '@tabler/icons-react';
import { FileUpload } from '../ui/file-upload';
import { useToast } from '../ui/toast';

export const QRCodeReader = () => {
  const [file, setFile] = useState<File | null>(null);
  const [result, setResult] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const { showToast } = useToast();

  const handleFileSelect = (files: File[]) => {
    if (files.length > 0) {
      setFile(files[0]);
      setResult(null);
      setError(null);
      readQRCode(files[0]);
    }
  };

  const readQRCode = async (imageFile: File) => {
    try {
      // Using HTML5 Canvas and a simple QR code reading approach
      // Note: For production, you'd want to use a library like jsQR
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        canvas.width = img.width;
        canvas.height = img.height;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(img, 0, 0);
          // For now, we'll show a message that a QR library is needed
          // In production, integrate jsQR: npm install jsqr @types/jsqr
          setError('QR code reading requires jsQR library. Please install: npm install jsqr');
          showToast('QR code reading requires additional library', 'error');
        }
      };
      img.src = URL.createObjectURL(imageFile);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to read QR code');
      showToast('Failed to read QR code', 'error');
    }
  };

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text).then(() => {
      showToast('Copied to clipboard');
    });
  };

  return (
    <div className="w-full max-w-2xl mx-auto px-4 py-8">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
        <div className="text-center space-y-2">
          <div className="inline-flex items-center justify-center p-3 bg-primary/10 rounded-full mb-2">
            <IconQrcode className="w-8 h-8 text-primary" />
          </div>
          <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
            QR Code Reader
          </h1>
          <p className="text-muted-foreground">Scan QR codes from images</p>
        </div>

        <div className="bg-card/50 backdrop-blur-sm border border-border rounded-2xl p-6 space-y-6">
          {!file ? (
            <FileUpload onChange={handleFileSelect} isProcessing={false} />
          ) : (
            <>
              {file && (
                <div>
                  <img
                    src={URL.createObjectURL(file)}
                    alt="Uploaded"
                    className="w-full max-w-md mx-auto rounded-lg border border-border"
                  />
                </div>
              )}

              {error && (
                <div className="bg-destructive/10 border border-destructive/50 text-destructive px-4 py-3 rounded-lg">
                  {error}
                </div>
              )}

              {result && (
                <div className="bg-background/50 rounded-lg p-4 border border-border">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium">QR Code Content</span>
                    <button
                      onClick={() => handleCopy(result)}
                      className="p-1.5 hover:bg-muted rounded-lg transition-colors cursor-pointer"
                      title="Copy"
                    >
                      <IconCopy className="w-4 h-4" />
                    </button>
                  </div>
                  <div className="font-mono text-sm break-all">{result}</div>
                </div>
              )}
            </>
          )}
        </div>
      </motion.div>
    </div>
  );
};
