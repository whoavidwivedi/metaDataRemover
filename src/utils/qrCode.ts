import QRCodeLib from 'qrcode';

export async function generateQRCode(text: string, size: number = 200): Promise<string> {
  try {
    if (!text || !text.trim()) {
      throw new Error('Text is required to generate QR code');
    }
    
    const dataUrl = await QRCodeLib.toDataURL(text, {
      width: size,
      margin: 2,
      color: {
        dark: '#000000',
        light: '#FFFFFF'
      }
    });
    
    return dataUrl;
  } catch (error) {
    throw new Error(`Failed to generate QR code: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}
