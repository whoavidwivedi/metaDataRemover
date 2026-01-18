import { useState } from 'react';
import { motion } from 'framer-motion';
import { IconRadio, IconCopy } from '@tabler/icons-react';
import { useToast } from '../ui/toast';

const morseCode: Record<string, string> = {
  A: '.-', B: '-...', C: '-.-.', D: '-..', E: '.', F: '..-.', G: '--.', H: '....',
  I: '..', J: '.---', K: '-.-', L: '.-..', M: '--', N: '-.', O: '---', P: '.--.',
  Q: '--.-', R: '.-.', S: '...', T: '-', U: '..-', V: '...-', W: '.--', X: '-..-',
  Y: '-.--', Z: '--..',
  '0': '-----', '1': '.----', '2': '..---', '3': '...--', '4': '....-',
  '5': '.....', '6': '-....', '7': '--...', '8': '---..', '9': '----.',
  '.': '.-.-.-', ',': '--..--', '?': '..--..', "'": '.----.', '!': '-.-.--',
  '/': '-..-.', '(': '-.--.', ')': '-.--.-', '&': '.-...', ':': '---...',
  ';': '-.-.-.', '=': '-...-', '+': '.-.-.', '-': '-....-', '_': '..--.-',
  '"': '.-..-.', '$': '...-..-', '@': '.--.-.', ' ': '/',
};

const reverseMorse: Record<string, string> = Object.fromEntries(
  Object.entries(morseCode).map(([k, v]) => [v, k])
);

export const MorseCode = () => {
  const [mode, setMode] = useState<'encode' | 'decode'>('encode');
  const [input, setInput] = useState('');
  const [output, setOutput] = useState('');
  const { showToast } = useToast();

  const encode = (text: string): string => {
    return text
      .toUpperCase()
      .split('')
      .map((char) => morseCode[char] || char)
      .join(' ');
  };

  const decode = (morse: string): string => {
    return morse
      .split(' ')
      .map((code) => reverseMorse[code] || code)
      .join('');
  };

  const handleConvert = () => {
    if (!input.trim()) {
      showToast('Please enter text', 'error');
      return;
    }

    try {
      if (mode === 'encode') {
        setOutput(encode(input));
      } else {
        setOutput(decode(input));
      }
      showToast('Converted successfully');
    } catch (err) {
      showToast('Conversion failed', 'error');
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
            <IconRadio className="w-8 h-8 text-primary" />
          </div>
          <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
            Morse Code
          </h1>
          <p className="text-muted-foreground">Encode and decode Morse code</p>
        </div>

        <div className="bg-card/50 backdrop-blur-sm border border-border rounded-2xl p-6 space-y-6">
          <div className="flex gap-4">
            <button
              onClick={() => {
                setMode('encode');
                setOutput('');
              }}
              className={`flex-1 px-4 py-2 rounded-lg border-2 transition-all cursor-pointer ${
                mode === 'encode'
                  ? 'border-primary bg-primary/10 text-primary'
                  : 'border-border bg-background text-muted-foreground hover:border-primary/50'
              }`}
            >
              Encode
            </button>
            <button
              onClick={() => {
                setMode('decode');
                setOutput('');
              }}
              className={`flex-1 px-4 py-2 rounded-lg border-2 transition-all cursor-pointer ${
                mode === 'decode'
                  ? 'border-primary bg-primary/10 text-primary'
                  : 'border-border bg-background text-muted-foreground hover:border-primary/50'
              }`}
            >
              Decode
            </button>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">
              {mode === 'encode' ? 'Text' : 'Morse Code'}
            </label>
            <textarea
              value={input}
              onChange={(e) => {
                setInput(e.target.value);
                setOutput('');
              }}
              placeholder={mode === 'encode' ? 'Enter text...' : 'Enter Morse code (e.g., .- -... -.-.)'}
              className="w-full h-32 px-4 py-3 bg-background border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary font-mono text-sm resize-none"
            />
          </div>

          <button
            onClick={handleConvert}
            disabled={!input.trim()}
            className="w-full px-6 py-3 bg-primary text-primary-foreground rounded-xl font-semibold hover:opacity-90 transition-all disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
          >
            {mode === 'encode' ? 'Encode' : 'Decode'}
          </button>

          {output && (
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-sm font-medium">
                  {mode === 'encode' ? 'Morse Code' : 'Text'}
                </label>
                <button
                  onClick={() => handleCopy(output)}
                  className="p-1.5 hover:bg-muted rounded-lg transition-colors cursor-pointer"
                  title="Copy"
                >
                  <IconCopy className="w-4 h-4" />
                </button>
              </div>
              <textarea
                value={output}
                readOnly
                className="w-full h-32 px-4 py-3 bg-muted/30 border border-border rounded-xl font-mono text-sm resize-none"
              />
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
};
