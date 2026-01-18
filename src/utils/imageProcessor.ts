/**
 * Removes metadata from an image file by re-encoding it via Canvas.
 * This process strips Exif, IPTC, and XMP data.
 */
export async function removeMetadata(file: File): Promise<Blob> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const url = URL.createObjectURL(file);

    img.onload = () => {
      // Create an offscreen canvas (or regular canvas)
      const canvas = document.createElement("canvas");
      canvas.width = img.width;
      canvas.height = img.height;

      const ctx = canvas.getContext("2d");
      if (!ctx) {
        URL.revokeObjectURL(url);
        reject(new Error("Could not get canvas context"));
        return;
      }

      // Draw the image onto the fresh canvas
      ctx.drawImage(img, 0, 0);

      // Export as a new Blob. Defaults to image/png or image/jpeg based on input if possible,
      // but let's stick to the original type or default to PNG if not supported.
      const mimeType = file.type === "image/jpeg" ? "image/jpeg" : "image/png";

      canvas.toBlob(
        (blob) => {
          URL.revokeObjectURL(url);
          if (blob) {
            resolve(blob);
          } else {
            reject(new Error("Failed to create blob from canvas"));
          }
        },
        mimeType,
        0.95, // High quality for JPEGs
      );
    };

    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error("Failed to load image"));
    };

    img.src = url;
  });
}

export function formatBytes(bytes: number, decimals = 2) {
  if (!+bytes) return "0 Bytes";
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ["Bytes", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(dm))} ${sizes[i]}`;
}

export type ImageFormat = 'jpeg' | 'png' | 'webp';

export interface CompressionOptions {
  width?: number;
  height?: number;
  quality?: number; // 0-1 for JPEG/WebP
  format?: ImageFormat;
  maintainAspectRatio?: boolean;
}

/**
 * Compresses and/or resizes an image with customizable options
 */
export async function compressImage(
  file: File,
  options: CompressionOptions = {}
): Promise<Blob> {
  const {
    width,
    height,
    quality = 0.9,
    format = 'jpeg',
    maintainAspectRatio = true,
  } = options;

  return new Promise((resolve, reject) => {
    const img = new Image();
    const url = URL.createObjectURL(file);

    img.onload = () => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      
      if (!ctx) {
        URL.revokeObjectURL(url);
        reject(new Error('Could not get canvas context'));
        return;
      }

      // Calculate dimensions
      let targetWidth = width || img.width;
      let targetHeight = height || img.height;

      // Maintain aspect ratio if requested
      if (maintainAspectRatio && (width || height)) {
        const aspectRatio = img.width / img.height;
        
        if (width && !height) {
          targetHeight = width / aspectRatio;
        } else if (height && !width) {
          targetWidth = height * aspectRatio;
        } else if (width && height) {
          // Use the dimension that maintains aspect ratio better
          const widthRatio = width / img.width;
          const heightRatio = height / img.height;
          const ratio = Math.min(widthRatio, heightRatio);
          targetWidth = img.width * ratio;
          targetHeight = img.height * ratio;
        }
      }

      canvas.width = Math.round(targetWidth);
      canvas.height = Math.round(targetHeight);

      // Use high-quality image rendering
      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = 'high';

      // Draw the image
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

      // Determine MIME type
      const mimeTypes: Record<ImageFormat, string> = {
        jpeg: 'image/jpeg',
        png: 'image/png',
        webp: 'image/webp',
      };

      const mimeType = mimeTypes[format];

      // Convert to blob with quality setting
      canvas.toBlob(
        (blob) => {
          URL.revokeObjectURL(url);
          if (blob) {
            resolve(blob);
          } else {
            reject(new Error('Failed to create blob from canvas'));
          }
        },
        mimeType,
        format === 'png' ? undefined : quality, // PNG doesn't use quality
      );
    };

    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error('Failed to load image'));
    };

    img.src = url;
  });
}
