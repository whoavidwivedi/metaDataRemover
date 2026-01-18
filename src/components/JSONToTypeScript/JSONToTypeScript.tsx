import { useState } from 'react';
import { motion } from 'framer-motion';
import { IconCode, IconCopy } from '@tabler/icons-react';
import { useToast } from '../ui/toast';

export const JSONToTypeScript = () => {
  const [jsonInput, setJsonInput] = useState('');
  const [tsOutput, setTsOutput] = useState('');
  const [interfaceName, setInterfaceName] = useState('Data');
  const { showToast } = useToast();

  const jsonToTypeScript = (obj: any, _name: string = 'Data', indent: number = 0): string => {
    const spaces = '  '.repeat(indent);
    let result = '';

    if (obj === null) {
      return 'null';
    }

    if (Array.isArray(obj)) {
      if (obj.length === 0) {
        return 'any[]';
      }
      const itemType = jsonToTypeScript(obj[0], '', indent + 1);
      return `${itemType}[]`;
    }

    if (typeof obj === 'object') {
      const keys = Object.keys(obj);
      if (keys.length === 0) {
        return 'Record<string, never>';
      }

      result += `{\n`;
      keys.forEach((key, idx) => {
        const value = obj[key];
        const optional = value === null || value === undefined ? '?' : '';
        const tsKey = /^[a-zA-Z_$][a-zA-Z0-9_$]*$/.test(key) ? key : `"${key}"`;
        const valueType = jsonToTypeScript(value, '', indent + 1);
        result += `${spaces}  ${tsKey}${optional}: ${valueType}`;
        if (idx < keys.length - 1) result += ';';
        result += '\n';
      });
      result += `${spaces}}`;
      return result;
    }

    // Primitive types
    if (typeof obj === 'string') {
      return 'string';
    }
    if (typeof obj === 'number') {
      return Number.isInteger(obj) ? 'number' : 'number';
    }
    if (typeof obj === 'boolean') {
      return 'boolean';
    }

    return 'any';
  };

  const handleConvert = () => {
    if (!jsonInput.trim()) {
      showToast('Please enter JSON', 'error');
      return;
    }

    try {
      const parsed = JSON.parse(jsonInput);
      const tsInterface = `interface ${interfaceName} ${jsonToTypeScript(parsed, interfaceName)}`;
      setTsOutput(tsInterface);
      showToast('Converted successfully');
    } catch (err) {
      showToast('Invalid JSON', 'error');
    }
  };

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text).then(() => {
      showToast('Copied to clipboard');
    });
  };

  return (
    <div className="w-full max-w-4xl mx-auto px-4 py-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-6"
      >
        <div className="text-center space-y-2">
          <div className="inline-flex items-center justify-center p-3 bg-primary/10 rounded-full mb-2">
            <IconCode className="w-8 h-8 text-primary" />
          </div>
          <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
            JSON to TypeScript
          </h1>
          <p className="text-muted-foreground">
            Generate TypeScript interfaces from JSON
          </p>
        </div>

        <div className="bg-card/50 backdrop-blur-sm border border-border rounded-2xl p-6 space-y-6">
          <div>
            <label className="block text-sm font-medium mb-2">Interface Name</label>
            <input
              type="text"
              value={interfaceName}
              onChange={(e) => setInterfaceName(e.target.value || 'Data')}
              className="w-full px-4 py-2 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary font-mono text-sm"
              placeholder="Data"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-sm font-medium">JSON Input</label>
                {jsonInput && (
                  <button
                    onClick={() => handleCopy(jsonInput)}
                    className="p-1.5 hover:bg-muted rounded-lg transition-colors cursor-pointer"
                    title="Copy JSON"
                  >
                    <IconCopy className="w-4 h-4" />
                  </button>
                )}
              </div>
              <textarea
                value={jsonInput}
                onChange={(e) => {
                  setJsonInput(e.target.value);
                  setTsOutput('');
                }}
                placeholder='{"name": "John", "age": 30}'
                className="w-full h-96 px-4 py-3 bg-background border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary font-mono text-sm resize-none"
                spellCheck={false}
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-sm font-medium">TypeScript Output</label>
                {tsOutput && (
                  <button
                    onClick={() => handleCopy(tsOutput)}
                    className="p-1.5 hover:bg-muted rounded-lg transition-colors cursor-pointer"
                    title="Copy TypeScript"
                  >
                    <IconCopy className="w-4 h-4" />
                  </button>
                )}
              </div>
              <textarea
                value={tsOutput}
                readOnly
                placeholder="TypeScript interface will appear here..."
                className="w-full h-96 px-4 py-3 bg-muted/30 border border-border rounded-xl font-mono text-sm resize-none"
                spellCheck={false}
              />
            </div>
          </div>

          <button
            onClick={handleConvert}
            disabled={!jsonInput.trim()}
            className="w-full px-6 py-3 bg-primary text-primary-foreground rounded-xl font-semibold hover:opacity-90 transition-all disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
          >
            Generate TypeScript Interface
          </button>
        </div>
      </motion.div>
    </div>
  );
};
