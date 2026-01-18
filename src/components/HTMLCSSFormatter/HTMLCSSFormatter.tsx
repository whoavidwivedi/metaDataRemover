import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  IconCode,
  IconCopy,
  IconDownload,
} from '@tabler/icons-react';
import { formatHTML, minifyHTML, formatCSS, minifyCSS } from '../../utils/htmlCssFormatter';
import { useToast } from '../ui/toast';

export const HTMLCSSFormatter = () => {
  const [input, setInput] = useState('');
  const [output, setOutput] = useState('');
  const [type, setType] = useState<'html' | 'css'>('html');
  const [mode, setMode] = useState<'format' | 'minify'>('format');
  const [indent, setIndent] = useState(2);
  const { showToast } = useToast();

  const handleFormat = () => {
    if (!input.trim()) {
      setOutput('');
      return;
    }
    try {
      if (type === 'html') {
        setOutput(mode === 'format' ? formatHTML(input, indent) : minifyHTML(input));
      } else {
        setOutput(mode === 'format' ? formatCSS(input, indent) : minifyCSS(input));
      }
    } catch (error) {
      setOutput(error instanceof Error ? error.message : 'Failed to process');
    }
  };

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text).then(() => showToast('Copied to clipboard'));
  };

  const handleDownload = (text: string, filename: string) => {
    const blob = new Blob([text], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="w-full max-w-6xl mx-auto px-4 py-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-6"
      >
        <div className="text-center space-y-2">
          <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
            HTML/CSS Formatter & Minifier
          </h1>
          <p className="text-muted-foreground">
            Format and minify HTML and CSS. All processing happens locally in your browser.
          </p>
        </div>

        <div className="flex gap-4 justify-center">
          <button
            onClick={() => {
              setType('html');
              setInput('');
              setOutput('');
            }}
            className={`px-6 py-2 rounded-xl font-semibold transition-all cursor-pointer ${
              type === 'html'
                ? 'bg-primary text-primary-foreground'
                : 'bg-muted text-muted-foreground hover:bg-muted/80'
            }`}
          >
            HTML
          </button>
          <button
            onClick={() => {
              setType('css');
              setInput('');
              setOutput('');
            }}
            className={`px-6 py-2 rounded-xl font-semibold transition-all cursor-pointer ${
              type === 'css'
                ? 'bg-primary text-primary-foreground'
                : 'bg-muted text-muted-foreground hover:bg-muted/80'
            }`}
          >
            CSS
          </button>
        </div>

        <div className="flex gap-4 justify-center">
          <button
            onClick={() => {
              setMode('format');
              handleFormat();
            }}
            className={`px-6 py-2 rounded-xl font-semibold transition-all cursor-pointer ${
              mode === 'format'
                ? 'bg-primary text-primary-foreground'
                : 'bg-muted text-muted-foreground hover:bg-muted/80'
            }`}
          >
            Format
          </button>
          <button
            onClick={() => {
              setMode('minify');
              handleFormat();
            }}
            className={`px-6 py-2 rounded-xl font-semibold transition-all cursor-pointer ${
              mode === 'minify'
                ? 'bg-primary text-primary-foreground'
                : 'bg-muted text-muted-foreground hover:bg-muted/80'
            }`}
          >
            Minify
          </button>
        </div>

        {mode === 'format' && (
          <div className="flex items-center justify-center gap-4">
            <label className="flex items-center gap-2">
              <span className="text-sm">Indent:</span>
              <input
                type="number"
                min="1"
                max="8"
                value={indent}
                onChange={(e) => {
                  setIndent(parseInt(e.target.value) || 2);
                  if (input) handleFormat();
                }}
                className="w-20 px-3 py-1.5 bg-background border border-border rounded-lg"
              />
            </label>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold">Input {type.toUpperCase()}</h2>
              {input && (
                <button
                  onClick={() => handleCopy(input)}
                  className="px-3 py-1.5 bg-muted hover:bg-muted/80 rounded-lg transition-colors flex items-center gap-2 text-sm cursor-pointer"
                >
                  <IconCopy className="w-4 h-4" />
                  Copy
                </button>
              )}
            </div>
            <textarea
              value={input}
              onChange={(e) => {
                setInput(e.target.value);
                setOutput('');
              }}
              onBlur={handleFormat}
              placeholder={`Enter ${type.toUpperCase()} code...`}
              className="w-full h-96 px-4 py-3 bg-background border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary font-mono text-sm resize-none"
            />
            <button
              onClick={handleFormat}
              className="w-full px-6 py-3 bg-primary text-primary-foreground rounded-xl font-semibold hover:opacity-90 transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <IconCode className="w-5 h-5" />
              {mode === 'format' ? 'Format' : 'Minify'}
            </button>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold">Output {type.toUpperCase()}</h2>
              {output && (
                <div className="flex gap-2">
                  <button
                    onClick={() => handleCopy(output)}
                    className="px-3 py-1.5 bg-muted hover:bg-muted/80 rounded-lg transition-colors flex items-center gap-2 text-sm cursor-pointer"
                  >
                    <IconCopy className="w-4 h-4" />
                    Copy
                  </button>
                  <button
                    onClick={() => handleDownload(output, `output.${type}`)}
                    className="px-3 py-1.5 bg-muted hover:bg-muted/80 rounded-lg transition-colors flex items-center gap-2 text-sm cursor-pointer"
                  >
                    <IconDownload className="w-4 h-4" />
                    Download
                  </button>
                </div>
              )}
            </div>
            <textarea
              value={output}
              readOnly
              placeholder="Output will appear here..."
              className="w-full h-96 px-4 py-3 bg-background border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary font-mono text-sm resize-none"
            />
          </div>
        </div>
      </motion.div>
    </div>
  );
};
