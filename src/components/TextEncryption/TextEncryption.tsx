import { useState } from 'react';
import { motion } from 'framer-motion';
import { IconLock, IconLockOpen, IconCopy, IconRefresh } from '@tabler/icons-react';
import { useToast } from '../ui/toast';

type CipherType = 'caesar' | 'rot13' | 'vigenere' | 'atbash';

export const TextEncryption = () => {
  const [input, setInput] = useState('');
  const [output, setOutput] = useState('');
  const [cipherType, setCipherType] = useState<CipherType>('caesar');
  const [key, setKey] = useState('');
  const [shift, setShift] = useState(3);
  const [mode, setMode] = useState<'encrypt' | 'decrypt'>('encrypt');
  const { showToast } = useToast();

  const caesarCipher = (text: string, shift: number, encrypt: boolean): string => {
    const actualShift = encrypt ? shift : -shift;
    return text
      .split('')
      .map((char) => {
        if (char.match(/[a-z]/i)) {
          const start = char === char.toUpperCase() ? 65 : 97;
          const code = char.charCodeAt(0);
          return String.fromCharCode(((code - start + actualShift + 26) % 26) + start);
        }
        return char;
      })
      .join('');
  };

  const rot13 = (text: string): string => {
    return text
      .split('')
      .map((char) => {
        if (char.match(/[a-z]/i)) {
          const start = char === char.toUpperCase() ? 65 : 97;
          const code = char.charCodeAt(0);
          return String.fromCharCode(((code - start + 13) % 26) + start);
        }
        return char;
      })
      .join('');
  };

  const vigenereCipher = (text: string, key: string, encrypt: boolean): string => {
    if (!key) return text;
    const keyUpper = key.toUpperCase().replace(/[^A-Z]/g, '');
    if (!keyUpper) return text;
    
    let keyIndex = 0;
    return text
      .split('')
      .map((char) => {
        if (char.match(/[a-z]/i)) {
          const start = char === char.toUpperCase() ? 65 : 97;
          const code = char.charCodeAt(0);
          const keyChar = keyUpper[keyIndex % keyUpper.length];
          const keyShift = keyChar.charCodeAt(0) - 65;
          const actualShift = encrypt ? keyShift : -keyShift;
          keyIndex++;
          return String.fromCharCode(((code - start + actualShift + 26) % 26) + start);
        }
        return char;
      })
      .join('');
  };

  const atbashCipher = (text: string): string => {
    return text
      .split('')
      .map((char) => {
        if (char.match(/[a-z]/i)) {
          const start = char === char.toUpperCase() ? 65 : 97;
          const code = char.charCodeAt(0);
          return String.fromCharCode(25 - (code - start) + start);
        }
        return char;
      })
      .join('');
  };

  const handleProcess = () => {
    if (!input.trim()) {
      setOutput('');
      return;
    }

    let result = '';
    switch (cipherType) {
      case 'caesar':
        result = caesarCipher(input, shift, mode === 'encrypt');
        break;
      case 'rot13':
        result = rot13(input);
        break;
      case 'vigenere':
        if (!key.trim()) {
          showToast('Please enter a key for Vigenère cipher', 'error');
          return;
        }
        result = vigenereCipher(input, key, mode === 'encrypt');
        break;
      case 'atbash':
        result = atbashCipher(input);
        break;
    }
    setOutput(result);
    if (result) {
      showToast(mode === 'encrypt' ? 'Text encrypted successfully' : 'Text decrypted successfully');
    }
  };

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text).then(() => {
      showToast('Copied to clipboard');
    });
  };

  const handleSwap = () => {
    setInput(output);
    setOutput(input);
    setMode(mode === 'encrypt' ? 'decrypt' : 'encrypt');
  };

  return (
    <div className="w-full max-w-6xl mx-auto px-4 py-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-6"
      >
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold mb-2">Text Encryption Tool</h2>
          <p className="text-muted-foreground">Encrypt and decrypt text using various cipher methods</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Input Section */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <label className="text-sm font-semibold">Input Text</label>
              <div className="flex gap-2">
                <button
                  onClick={() => setMode('encrypt')}
                  className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors cursor-pointer ${
                    mode === 'encrypt'
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-muted text-muted-foreground hover:bg-muted/80'
                  }`}
                >
                  <IconLock className="w-4 h-4 inline mr-1" />
                  Encrypt
                </button>
                <button
                  onClick={() => setMode('decrypt')}
                  className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors cursor-pointer ${
                    mode === 'decrypt'
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-muted text-muted-foreground hover:bg-muted/80'
                  }`}
                >
                  <IconLockOpen className="w-4 h-4 inline mr-1" />
                  Decrypt
                </button>
              </div>
            </div>
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Enter text to encrypt or decrypt..."
              className="w-full h-64 p-4 rounded-xl bg-card border border-border focus:outline-none focus:ring-2 focus:ring-primary resize-none font-mono text-sm"
            />
            <button
              onClick={() => setInput('')}
              className="w-full py-2 px-4 rounded-lg bg-muted hover:bg-muted/80 transition-colors text-sm font-medium cursor-pointer"
            >
              Clear
            </button>
          </div>

          {/* Output Section */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <label className="text-sm font-semibold">Output Text</label>
              <button
                onClick={() => handleCopy(output)}
                disabled={!output}
                className="px-3 py-1.5 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-colors text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer flex items-center gap-1"
              >
                <IconCopy className="w-4 h-4" />
                Copy
              </button>
            </div>
            <textarea
              value={output}
              readOnly
              placeholder="Encrypted/decrypted text will appear here..."
              className="w-full h-64 p-4 rounded-xl bg-muted border border-border font-mono text-sm resize-none"
            />
            <button
              onClick={handleSwap}
              disabled={!output || !input}
              className="w-full py-2 px-4 rounded-lg bg-muted hover:bg-muted/80 transition-colors text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer flex items-center justify-center gap-2"
            >
              <IconRefresh className="w-4 h-4" />
              Swap Input/Output
            </button>
          </div>
        </div>

        {/* Settings */}
        <div className="bg-card border border-border rounded-xl p-6 space-y-4">
          <h3 className="text-lg font-semibold">Cipher Settings</h3>
          
          <div>
            <label className="text-sm font-semibold mb-2 block">Cipher Type</label>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
              {(['caesar', 'rot13', 'vigenere', 'atbash'] as CipherType[]).map((type) => (
                <button
                  key={type}
                  onClick={() => setCipherType(type)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors cursor-pointer ${
                    cipherType === type
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-muted text-muted-foreground hover:bg-muted/80'
                  }`}
                >
                  {type.charAt(0).toUpperCase() + type.slice(1)}
                </button>
              ))}
            </div>
          </div>

          {cipherType === 'caesar' && (
            <div>
              <label className="text-sm font-semibold mb-2 block">
                Shift Value: {shift}
              </label>
              <input
                type="range"
                min="1"
                max="25"
                value={shift}
                onChange={(e) => setShift(Number(e.target.value))}
                className="w-full"
              />
            </div>
          )}

          {cipherType === 'vigenere' && (
            <div>
              <label className="text-sm font-semibold mb-2 block">Key</label>
              <input
                type="text"
                value={key}
                onChange={(e) => setKey(e.target.value)}
                placeholder="Enter encryption key..."
                className="w-full p-3 rounded-lg bg-muted border border-border focus:outline-none focus:ring-2 focus:ring-primary"
              />
              <p className="text-xs text-muted-foreground mt-1">
                Only letters will be used from the key
              </p>
            </div>
          )}

          <button
            onClick={handleProcess}
            disabled={!input.trim()}
            className="w-full py-3 px-4 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-colors font-semibold disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
          >
            {mode === 'encrypt' ? 'Encrypt' : 'Decrypt'} Text
          </button>
        </div>
      </motion.div>
    </div>
  );
};
