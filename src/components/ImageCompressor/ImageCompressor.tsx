import { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import {
  IconUpload,
  IconDownload,
  IconTrash,
  IconPhoto,
  IconResize,
  IconSettings,
} from '@tabler/icons-react';
import { compressImage, formatBytes, type ImageFormat, type CompressionOptions } from '../../utils/imageProcessor';
import { Button } from '../ui/stateful-button';

interface CompressedImage {
  original: File;
  compressed: Blob;
  previewUrl: string;
  originalSize: number;
  compressedSize: number;
  options: CompressionOptions;
}

export const ImageCompressor = () => {
  const [files, setFiles] = useState<File[]>([]);
  const [compressedImages, setCompressedImages] = useState<CompressedImage[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Compression settings
  const [width, setWidth] = useState<number | ''>('');
  const [height, setHeight] = useState<number | ''>('');
  const [quality, setQuality] = useState(0.8);
  const [format, setFormat] = useState<ImageFormat>('jpeg');
  const [maintainAspectRatio, setMaintainAspectRatio] = useState(true);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = e.target.files;
    if (!selectedFiles || selectedFiles.length === 0) return;

    const imageFiles = Array.from(selectedFiles).filter(file => 
      file.type.startsWith('image/')
    );

    if (imageFiles.length === 0) {
      setError('Please select image files only');
      return;
    }

    setFiles(prev => [...prev, ...imageFiles]);
    setError(null);

    // Reset file input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleCompress = async () => {
    if (files.length === 0) {
      setError('Please upload at least one image');
      return;
    }

    setLoading(true);
    setError(null);
    const newCompressed: CompressedImage[] = [];

    try {
      for (const file of files) {
        const options: CompressionOptions = {
          width: width ? Number(width) : undefined,
          height: height ? Number(height) : undefined,
          quality,
          format,
          maintainAspectRatio,
        };

        const compressedBlob = await compressImage(file, options);
        const previewUrl = URL.createObjectURL(compressedBlob);

        newCompressed.push({
          original: file,
          compressed: compressedBlob,
          previewUrl,
          originalSize: file.size,
          compressedSize: compressedBlob.size,
          options,
        });
      }

      setCompressedImages(newCompressed);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to compress images');
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = (compressed: CompressedImage) => {
    const url = URL.createObjectURL(compressed.compressed);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${compressed.original.name.replace(/\.[^/.]+$/, '')}.${format}`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleDownloadAll = () => {
    compressedImages.forEach((compressed, index) => {
      setTimeout(() => {
        handleDownload(compressed);
      }, index * 100); // Stagger downloads
    });
  };

  const handleRemoveFile = (index: number) => {
    setFiles(files.filter((_, i) => i !== index));
  };

  const handleClearAll = () => {
    // Clean up preview URLs
    compressedImages.forEach(img => URL.revokeObjectURL(img.previewUrl));
    setFiles([]);
    setCompressedImages([]);
    setError(null);
  };

  const getCompressionRatio = (original: number, compressed: number) => {
    return ((1 - compressed / original) * 100).toFixed(1);
  };

  return (
    <div className="w-full max-w-7xl mx-auto px-4 py-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-8"
      >
        {/* Header */}
        <div className="text-center space-y-4">
          <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
            Image Compressor
          </h1>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Resize, compress, and convert images to your desired format. All processing happens locally in your browser.
          </p>
        </div>

        {/* File Upload */}
        <div className="bg-card/50 backdrop-blur-sm border border-border rounded-2xl p-6">
          <div className="flex flex-col items-center justify-center border-2 border-dashed border-border rounded-xl p-8 hover:border-primary/50 transition-colors">
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              multiple
              onChange={handleFileSelect}
              className="hidden"
              id="image-compressor-input"
            />
            <label
              htmlFor="image-compressor-input"
              className="flex flex-col items-center cursor-pointer"
            >
              <IconUpload className="w-12 h-12 text-muted-foreground mb-4" />
              <span className="text-lg font-semibold mb-2">
                {files.length > 0 ? `${files.length} file(s) selected` : 'Upload Images'}
              </span>
              <span className="text-sm text-muted-foreground">
                Click to browse or drag and drop
              </span>
            </label>
          </div>

          {files.length > 0 && (
            <div className="mt-6 space-y-2">
              {files.map((file, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-3 bg-muted/50 rounded-lg"
                >
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    <IconPhoto className="w-5 h-5 text-primary flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{file.name}</p>
                      <p className="text-xs text-muted-foreground">{formatBytes(file.size)}</p>
                    </div>
                  </div>
                  <button
                    onClick={() => handleRemoveFile(index)}
                    className="p-2 hover:bg-destructive/10 rounded-lg transition-colors"
                  >
                    <IconTrash className="w-4 h-4 text-destructive" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Compression Settings */}
        <div className="bg-card/50 backdrop-blur-sm border border-border rounded-2xl p-6">
          <div className="flex items-center gap-2 mb-6">
            <IconSettings className="w-5 h-5 text-primary" />
            <h2 className="text-xl font-bold">Compression Settings</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Dimensions */}
            <div className="space-y-4">
              <div className="flex items-center gap-2 mb-2">
                <IconResize className="w-4 h-4 text-muted-foreground" />
                <label className="text-sm font-medium">Dimensions</label>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs text-muted-foreground mb-1">Width (px)</label>
                  <input
                    type="number"
                    value={width}
                    onChange={(e) => setWidth(e.target.value === '' ? '' : Number(e.target.value))}
                    placeholder="Original"
                    min="1"
                    className="w-full px-3 py-2 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>
                <div>
                  <label className="block text-xs text-muted-foreground mb-1">Height (px)</label>
                  <input
                    type="number"
                    value={height}
                    onChange={(e) => setHeight(e.target.value === '' ? '' : Number(e.target.value))}
                    placeholder="Original"
                    min="1"
                    className="w-full px-3 py-2 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>
              </div>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={maintainAspectRatio}
                  onChange={(e) => setMaintainAspectRatio(e.target.checked)}
                  className="w-4 h-4 rounded border-border"
                />
                <span className="text-sm text-muted-foreground">Maintain aspect ratio</span>
              </label>
            </div>

            {/* Quality & Format */}
            <div className="space-y-4">
              <div>
                <label className="block text-xs text-muted-foreground mb-2">
                  Quality: {Math.round(quality * 100)}%
                </label>
                <input
                  type="range"
                  min="0.1"
                  max="1"
                  step="0.05"
                  value={quality}
                  onChange={(e) => setQuality(Number(e.target.value))}
                  className="w-full"
                  disabled={format === 'png'}
                />
                {format === 'png' && (
                  <p className="text-xs text-muted-foreground mt-1">PNG format doesn't support quality adjustment</p>
                )}
              </div>

              <div>
                <label className="block text-xs text-muted-foreground mb-2">Format</label>
                <select
                  value={format}
                  onChange={(e) => setFormat(e.target.value as ImageFormat)}
                  className="w-full px-3 py-2 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                >
                  <option value="jpeg">JPEG</option>
                  <option value="png">PNG</option>
                  <option value="webp">WebP</option>
                </select>
              </div>
            </div>
          </div>

          <div className="mt-6 flex gap-4">
            <Button
              onClick={handleCompress}
              disabled={files.length === 0 || loading}
              className="flex-1"
            >
              {loading ? 'Compressing...' : 'Compress Images'}
            </Button>
            {files.length > 0 && (
              <button
                onClick={handleClearAll}
                className="px-4 py-2 bg-muted hover:bg-muted/80 rounded-lg transition-colors"
              >
                Clear All
              </button>
            )}
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-destructive/10 border border-destructive/50 text-destructive px-4 py-3 rounded-lg">
            {error}
          </div>
        )}

        {/* Results */}
        {compressedImages.length > 0 && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold">Compressed Images</h2>
              <Button onClick={handleDownloadAll} variant="outline">
                <IconDownload className="w-4 h-4 mr-2" />
                Download All
              </Button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {compressedImages.map((compressed, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="bg-card/50 backdrop-blur-sm border border-border rounded-xl overflow-hidden"
                >
                  <div className="aspect-square bg-muted/30 relative">
                    <img
                      src={compressed.previewUrl}
                      alt="Compressed"
                      className="w-full h-full object-contain"
                    />
                  </div>
                  <div className="p-4 space-y-3">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-medium truncate flex-1">
                        {compressed.original.name}
                      </p>
                      <button
                        onClick={() => handleDownload(compressed)}
                        className="p-2 hover:bg-primary/10 rounded-lg transition-colors"
                      >
                        <IconDownload className="w-4 h-4 text-primary" />
                      </button>
                    </div>
                    <div className="space-y-1 text-xs">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Original:</span>
                        <span className="font-medium">{formatBytes(compressed.originalSize)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Compressed:</span>
                        <span className="font-medium text-primary">
                          {formatBytes(compressed.compressedSize)}
                        </span>
                      </div>
                      <div className="flex justify-between pt-1 border-t border-border">
                        <span className="text-muted-foreground">Reduction:</span>
                        <span className="font-bold text-emerald-500">
                          {getCompressionRatio(compressed.originalSize, compressed.compressedSize)}%
                        </span>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        )}
      </motion.div>
    </div>
  );
};
