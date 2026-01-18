import { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { IconUpload, IconDownload, IconPhoto, IconTypography } from '@tabler/icons-react';
import { FileUpload } from '../ui/file-upload';
import { useToast } from '../ui/toast';

export const ImageWatermark = () => {
  const [image, setImage] = useState<HTMLImageElement | null>(null);
  const [watermarkType, setWatermarkType] = useState<'text' | 'image'>('text');
  const [watermarkText, setWatermarkText] = useState('Watermark');
  const [watermarkImage, setWatermarkImage] = useState<File | null>(null);
  const [position, setPosition] = useState<'top-left' | 'top-right' | 'bottom-left' | 'bottom-right' | 'center'>('bottom-right');
  const [opacity, setOpacity] = useState(0.5);
  const [fontSize, setFontSize] = useState(24);
  const [textColor, setTextColor] = useState('#FFFFFF');
  const [watermarkedUrl, setWatermarkedUrl] = useState<string | null>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { showToast } = useToast();

  const handleImageSelect = (files: File[]) => {
    if (files.length === 0) return;

    const file = files[0];
    const img = new Image();
    img.onload = () => {
      setImage(img);
      setWatermarkedUrl(null);
    };
    img.src = URL.createObjectURL(file);
  };

  const handleWatermarkImageSelect = (files: File[]) => {
    if (files.length > 0) {
      setWatermarkImage(files[0]);
    }
  };

  const applyWatermark = () => {
    if (!image) {
      showToast('Please upload an image first', 'error');
      return;
    }

    const canvas = canvasRef.current;
    if (!canvas) return;

    canvas.width = image.width;
    canvas.height = image.height;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Draw original image
    ctx.drawImage(image, 0, 0);

    // Calculate watermark position
    let x = 0;
    let y = 0;
    const padding = 20;

    switch (position) {
      case 'top-left':
        x = padding;
        y = padding;
        break;
      case 'top-right':
        x = canvas.width - padding;
        y = padding;
        break;
      case 'bottom-left':
        x = padding;
        y = canvas.height - padding;
        break;
      case 'bottom-right':
        x = canvas.width - padding;
        y = canvas.height - padding;
        break;
      case 'center':
        x = canvas.width / 2;
        y = canvas.height / 2;
        break;
    }

    ctx.globalAlpha = opacity;

    if (watermarkType === 'text') {
      ctx.font = `bold ${fontSize}px Arial`;
      ctx.fillStyle = textColor;
      ctx.textAlign = position.includes('right') ? 'right' : position.includes('left') ? 'left' : 'center';
      ctx.textBaseline = position.includes('bottom') ? 'bottom' : position.includes('top') ? 'top' : 'middle';
      ctx.fillText(watermarkText, x, y);
    } else {
      if (watermarkImage) {
        const watermarkImg = new Image();
        watermarkImg.onload = () => {
          const watermarkSize = Math.min(canvas.width, canvas.height) * 0.2;
          const watermarkAspect = watermarkImg.width / watermarkImg.height;
          const watermarkWidth = watermarkSize;
          const watermarkHeight = watermarkSize / watermarkAspect;

          let watermarkX = x;
          let watermarkY = y;

          if (position.includes('right')) {
            watermarkX = x - watermarkWidth;
          } else if (position === 'center') {
            watermarkX = x - watermarkWidth / 2;
            watermarkY = y - watermarkHeight / 2;
          }

          if (position.includes('bottom')) {
            watermarkY = y - watermarkHeight;
          }

          ctx.drawImage(watermarkImg, watermarkX, watermarkY, watermarkWidth, watermarkHeight);
          canvas.toBlob((blob) => {
            if (blob) {
              setWatermarkedUrl(URL.createObjectURL(blob));
              showToast('Watermark applied successfully');
            }
          }, 'image/png');
        };
        watermarkImg.src = URL.createObjectURL(watermarkImage);
      } else {
        showToast('Please upload a watermark image', 'error');
      }
      return;
    }

    canvas.toBlob((blob) => {
      if (blob) {
        setWatermarkedUrl(URL.createObjectURL(blob));
        showToast('Watermark applied successfully');
      }
    }, 'image/png');
  };

  const handleDownload = () => {
    if (!watermarkedUrl) {
      showToast('No watermarked image to download', 'error');
      return;
    }

    const a = document.createElement('a');
    a.href = watermarkedUrl;
    a.download = 'watermarked-image.png';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    showToast('Image downloaded');
  };

  return (
    <div className="w-full max-w-7xl mx-auto px-4 py-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-6"
      >
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold mb-2">Image Watermark</h2>
          <p className="text-muted-foreground">Add text or image watermarks to your images</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Settings */}
          <div className="space-y-6">
            <div className="bg-card border border-border rounded-xl p-6 space-y-4">
              <h3 className="text-lg font-semibold">Upload Image</h3>
              <FileUpload
                accept="image/*"
                onChange={handleImageSelect}
              />
            </div>

            <div className="bg-card border border-border rounded-xl p-6 space-y-4">
              <h3 className="text-lg font-semibold">Watermark Settings</h3>

              <div>
                <label className="text-sm font-semibold mb-2 block">Watermark Type</label>
                <div className="flex gap-2">
                  <button
                    onClick={() => setWatermarkType('text')}
                    className={`flex-1 px-4 py-2 rounded-lg text-sm font-medium transition-colors cursor-pointer ${
                      watermarkType === 'text'
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-muted text-muted-foreground hover:bg-muted/80'
                    }`}
                  >
                    <IconTypography className="w-4 h-4 inline mr-1" />
                    Text
                  </button>
                  <button
                    onClick={() => setWatermarkType('image')}
                    className={`flex-1 px-4 py-2 rounded-lg text-sm font-medium transition-colors cursor-pointer ${
                      watermarkType === 'image'
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-muted text-muted-foreground hover:bg-muted/80'
                    }`}
                  >
                    <IconPhoto className="w-4 h-4 inline mr-1" />
                    Image
                  </button>
                </div>
              </div>

              {watermarkType === 'text' ? (
                <>
                  <div>
                    <label className="text-sm font-semibold mb-2 block">Watermark Text</label>
                    <input
                      type="text"
                      value={watermarkText}
                      onChange={(e) => setWatermarkText(e.target.value)}
                      placeholder="Enter watermark text..."
                      className="w-full p-3 rounded-lg bg-muted border border-border focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-semibold mb-2 block">Font Size: {fontSize}px</label>
                    <input
                      type="range"
                      min="12"
                      max="72"
                      value={fontSize}
                      onChange={(e) => setFontSize(Number(e.target.value))}
                      className="w-full"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-semibold mb-2 block">Text Color</label>
                    <input
                      type="color"
                      value={textColor}
                      onChange={(e) => setTextColor(e.target.value)}
                      className="w-full h-12 rounded-lg cursor-pointer"
                    />
                  </div>
                </>
              ) : (
                <div>
                  <label className="text-sm font-semibold mb-2 block">Watermark Image</label>
                  <FileUpload
                    accept="image/*"
                    onChange={handleWatermarkImageSelect}
                  />
                  {watermarkImage && (
                    <p className="text-sm text-muted-foreground mt-2">
                      Selected: {watermarkImage.name}
                    </p>
                  )}
                </div>
              )}

              <div>
                <label className="text-sm font-semibold mb-2 block">Position</label>
                <select
                  value={position}
                  onChange={(e) => setPosition(e.target.value as any)}
                  className="w-full p-3 rounded-lg bg-muted border border-border focus:outline-none focus:ring-2 focus:ring-primary cursor-pointer"
                >
                  <option value="top-left">Top Left</option>
                  <option value="top-right">Top Right</option>
                  <option value="bottom-left">Bottom Left</option>
                  <option value="bottom-right">Bottom Right</option>
                  <option value="center">Center</option>
                </select>
              </div>

              <div>
                <label className="text-sm font-semibold mb-2 block">Opacity: {Math.round(opacity * 100)}%</label>
                <input
                  type="range"
                  min="0.1"
                  max="1"
                  step="0.1"
                  value={opacity}
                  onChange={(e) => setOpacity(Number(e.target.value))}
                  className="w-full"
                />
              </div>

              <button
                onClick={applyWatermark}
                disabled={!image || (watermarkType === 'text' && !watermarkText) || (watermarkType === 'image' && !watermarkImage)}
                className="w-full py-3 px-4 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-colors font-semibold disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
              >
                Apply Watermark
              </button>
            </div>
          </div>

          {/* Preview */}
          <div className="space-y-4">
            <div className="bg-card border border-border rounded-xl p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold">Preview</h3>
                {watermarkedUrl && (
                  <button
                    onClick={handleDownload}
                    className="px-4 py-2 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-colors font-medium cursor-pointer flex items-center gap-2"
                  >
                    <IconDownload className="w-4 h-4" />
                    Download
                  </button>
                )}
              </div>
              <div className="relative bg-muted rounded-lg overflow-hidden">
                {watermarkedUrl ? (
                  <img
                    src={watermarkedUrl}
                    alt="Watermarked"
                    className="w-full h-auto max-h-[600px] object-contain mx-auto"
                  />
                ) : image ? (
                  <img
                    src={image.src}
                    alt="Original"
                    className="w-full h-auto max-h-[600px] object-contain mx-auto"
                  />
                ) : (
                  <div className="flex items-center justify-center h-64 text-muted-foreground">
                    <div className="text-center">
                      <IconUpload className="w-16 h-16 mx-auto mb-2 opacity-50" />
                      <p>Upload an image to preview</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        <canvas ref={canvasRef} className="hidden" />
      </motion.div>
    </div>
  );
};
