import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  IconCode,
  IconCheck,
  IconX,
  IconCopy,
  IconDownload,
} from '@tabler/icons-react';
import { formatYAML, validateYAML } from '../../utils/yamlFormatter';
import { useToast } from '../ui/toast';

export const YAMLFormatter = () => {
  const [yaml, setYaml] = useState('');
  const [formatted, setFormatted] = useState('');
  const [indent, setIndent] = useState(2);
  const [validation, setValidation] = useState<{ valid: boolean; error?: string } | null>(null);
  const { showToast } = useToast();

  const handleFormat = () => {
    try {
      const result = formatYAML(yaml, indent);
      setFormatted(result);
    } catch (error) {
      setFormatted(error instanceof Error ? error.message : 'Failed to format YAML');
    }
  };

  const handleValidate = () => {
    const result = validateYAML(yaml);
    setValidation(result);
  };

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text).then(() => showToast('Copied to clipboard'));
  };

  const handleDownload = (text: string, filename: string) => {
    const blob = new Blob([text], { type: 'text/yaml' });
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
            YAML Formatter & Validator
          </h1>
          <p className="text-muted-foreground">
            Format and validate YAML files. All processing happens locally in your browser.
          </p>
        </div>

        <div className="flex items-center justify-center gap-4">
          <label className="flex items-center gap-2">
            <span className="text-sm">Indent:</span>
            <input
              type="number"
              min="1"
              max="8"
              value={indent}
              onChange={(e) => setIndent(parseInt(e.target.value) || 2)}
              className="w-20 px-3 py-1.5 bg-background border border-border rounded-lg"
            />
          </label>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold">Input YAML</h2>
              {yaml && (
                <div className="flex gap-2">
                  <button
                    onClick={handleValidate}
                    className="px-3 py-1.5 bg-muted hover:bg-muted/80 rounded-lg transition-colors text-sm flex items-center gap-2 cursor-pointer"
                  >
                    Validate
                  </button>
                  <button
                    onClick={() => handleCopy(yaml)}
                    className="px-3 py-1.5 bg-muted hover:bg-muted/80 rounded-lg transition-colors flex items-center gap-2 text-sm cursor-pointer"
                  >
                    <IconCopy className="w-4 h-4" />
                    Copy
                  </button>
                </div>
              )}
            </div>
            <textarea
              value={yaml}
              onChange={(e) => {
                setYaml(e.target.value);
                setFormatted('');
                setValidation(null);
              }}
              placeholder="Enter YAML..."
              className="w-full h-96 px-4 py-3 bg-background border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary font-mono text-sm resize-none"
            />
            <button
              onClick={handleFormat}
              className="w-full px-6 py-3 bg-primary text-primary-foreground rounded-xl font-semibold hover:opacity-90 transition-all flex items-center justify-center gap-2"
            >
              <IconCode className="w-5 h-5" />
              Format YAML
            </button>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold">Formatted YAML</h2>
              {formatted && (
                <div className="flex gap-2">
                  <button
                    onClick={() => handleCopy(formatted)}
                    className="px-3 py-1.5 bg-muted hover:bg-muted/80 rounded-lg transition-colors flex items-center gap-2 text-sm cursor-pointer"
                  >
                    <IconCopy className="w-4 h-4" />
                    Copy
                  </button>
                  <button
                    onClick={() => handleDownload(formatted, 'formatted.yaml')}
                    className="px-3 py-1.5 bg-muted hover:bg-muted/80 rounded-lg transition-colors flex items-center gap-2 text-sm cursor-pointer"
                  >
                    <IconDownload className="w-4 h-4" />
                    Download
                  </button>
                </div>
              )}
            </div>
            <textarea
              value={formatted}
              readOnly
              placeholder="Formatted YAML will appear here..."
              className="w-full h-96 px-4 py-3 bg-background border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary font-mono text-sm resize-none"
            />
          </div>
        </div>

        {validation && (
          <div className={`rounded-xl p-4 flex items-center gap-3 ${
            validation.valid
              ? 'bg-emerald-500/10 border border-emerald-500/50 text-emerald-600'
              : 'bg-destructive/10 border border-destructive/50 text-destructive'
          }`}>
            {validation.valid ? (
              <>
                <IconCheck className="w-5 h-5" />
                <span className="font-semibold">Valid YAML</span>
              </>
            ) : (
              <>
                <IconX className="w-5 h-5" />
                <div>
                  <span className="font-semibold">Invalid YAML</span>
                  {validation.error && <p className="text-sm mt-1">{validation.error}</p>}
                </div>
              </>
            )}
          </div>
        )}
      </motion.div>
    </div>
  );
};
