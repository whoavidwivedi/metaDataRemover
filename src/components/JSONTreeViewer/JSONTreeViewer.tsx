import { useState } from 'react';
import { motion } from 'framer-motion';
import { IconCode, IconCopy, IconChevronRight, IconChevronDown } from '@tabler/icons-react';
import { useToast } from '../ui/toast';

interface TreeNodeProps {
  data: any;
  keyName?: string;
  level?: number;
}

const TreeNode = ({ data, keyName, level = 0 }: TreeNodeProps) => {
  const [isExpanded, setIsExpanded] = useState(level < 2);
  const { showToast } = useToast();

  const getValueType = (value: any): string => {
    if (value === null) return 'null';
    if (Array.isArray(value)) return 'array';
    return typeof value;
  };

  const getValuePreview = (value: any): string => {
    if (value === null) return 'null';
    if (typeof value === 'string') return `"${value.length > 50 ? value.substring(0, 50) + '...' : value}"`;
    if (typeof value === 'object') {
      if (Array.isArray(value)) return `[${value.length} items]`;
      return `{${Object.keys(value).length} keys}`;
    }
    return String(value);
  };

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text).then(() => {
      showToast('Copied to clipboard');
    });
  };

  const type = getValueType(data);
  const isExpandable = type === 'object' || type === 'array';
  const preview = getValuePreview(data);

  return (
    <div className="select-none">
      <div
        className="flex items-center gap-1 py-1 hover:bg-muted/50 rounded px-1 cursor-pointer group"
        style={{ paddingLeft: `${level * 16}px` }}
        onClick={() => isExpandable && setIsExpanded(!isExpanded)}
      >
        {isExpandable ? (
          isExpanded ? (
            <IconChevronDown className="w-4 h-4 text-muted-foreground" />
          ) : (
            <IconChevronRight className="w-4 h-4 text-muted-foreground" />
          )
        ) : (
          <span className="w-4" />
        )}
        {keyName && (
          <>
            <span className="font-semibold text-foreground">"{keyName}"</span>
            <span className="text-muted-foreground">:</span>
          </>
        )}
        <span
          className={`text-sm ${
            type === 'string'
              ? 'text-green-500'
              : type === 'number'
              ? 'text-blue-500'
              : type === 'boolean'
              ? 'text-purple-500'
              : type === 'null'
              ? 'text-gray-500'
              : 'text-orange-500'
          }`}
        >
          {preview}
        </span>
        <span className="text-xs text-muted-foreground ml-2 opacity-0 group-hover:opacity-100">
          {type}
        </span>
        {typeof data === 'string' && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleCopy(data);
            }}
            className="ml-auto opacity-0 group-hover:opacity-100 p-1 hover:bg-muted rounded cursor-pointer"
          >
            <IconCopy className="w-3 h-3" />
          </button>
        )}
      </div>
      {isExpandable && isExpanded && (
        <div>
          {Array.isArray(data) ? (
            data.map((item, index) => (
              <TreeNode key={index} data={item} keyName={String(index)} level={level + 1} />
            ))
          ) : (
            Object.entries(data).map(([key, value]) => (
              <TreeNode key={key} data={value} keyName={key} level={level + 1} />
            ))
          )}
        </div>
      )}
    </div>
  );
};

export const JSONTreeViewer = () => {
  const [input, setInput] = useState('');
  const [jsonData, setJsonData] = useState<any>(null);
  const [error, setError] = useState('');
  const { showToast } = useToast();

  const handleParse = () => {
    if (!input.trim()) {
      setJsonData(null);
      setError('');
      return;
    }

    try {
      const parsed = JSON.parse(input);
      setJsonData(parsed);
      setError('');
      showToast('JSON parsed successfully');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Invalid JSON');
      setJsonData(null);
      showToast('Invalid JSON format', 'error');
    }
  };

  const handleCopy = () => {
    if (input) {
      navigator.clipboard.writeText(input).then(() => {
        showToast('Copied to clipboard');
      });
    }
  };

  const handleFormat = () => {
    if (!input.trim()) return;
    try {
      const parsed = JSON.parse(input);
      setInput(JSON.stringify(parsed, null, 2));
      showToast('JSON formatted');
    } catch (err) {
      showToast('Invalid JSON format', 'error');
    }
  };

  return (
    <div className="w-full max-w-7xl mx-auto px-4 py-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-6"
      >
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold mb-2">JSON Tree Viewer</h2>
          <p className="text-muted-foreground">Visualize and explore JSON data interactively</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Input Section */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <label className="text-sm font-semibold">JSON Input</label>
              <div className="flex gap-2">
                <button
                  onClick={handleFormat}
                  className="px-3 py-1.5 rounded-lg bg-muted hover:bg-muted/80 transition-colors text-sm font-medium cursor-pointer"
                >
                  Format
                </button>
                <button
                  onClick={handleCopy}
                  disabled={!input}
                  className="px-3 py-1.5 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-colors text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer flex items-center gap-1"
                >
                  <IconCopy className="w-4 h-4" />
                  Copy
                </button>
              </div>
            </div>
            <textarea
              value={input}
              onChange={(e) => {
                setInput(e.target.value);
                setError('');
              }}
              placeholder='Enter JSON data...\nExample: {"name": "John", "age": 30}'
              className="w-full h-96 p-4 rounded-xl bg-card border border-border focus:outline-none focus:ring-2 focus:ring-primary resize-none font-mono text-sm"
            />
            {error && (
              <div className="p-3 rounded-lg bg-destructive/10 border border-destructive/20 text-destructive text-sm">
                {error}
              </div>
            )}
            <button
              onClick={handleParse}
              disabled={!input.trim()}
              className="w-full py-3 px-4 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-colors font-semibold disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
            >
              Parse JSON
            </button>
          </div>

          {/* Tree View Section */}
          <div className="space-y-4">
            <label className="text-sm font-semibold">Tree View</label>
            <div className="w-full h-96 p-4 rounded-xl bg-muted border border-border overflow-auto">
              {jsonData ? (
                <TreeNode data={jsonData} />
              ) : (
                <div className="flex items-center justify-center h-full text-muted-foreground">
                  <div className="text-center">
                    <IconCode className="w-12 h-12 mx-auto mb-2 opacity-50" />
                    <p>Parse JSON to view tree structure</p>
                  </div>
                </div>
              )}
            </div>
            {jsonData && (
              <div className="p-3 rounded-lg bg-card border border-border text-sm">
                <div className="flex items-center gap-4">
                  <span>
                    <strong>Type:</strong> {Array.isArray(jsonData) ? 'Array' : 'Object'}
                  </span>
                  {Array.isArray(jsonData) ? (
                    <span>
                      <strong>Items:</strong> {jsonData.length}
                    </span>
                  ) : (
                    <span>
                      <strong>Keys:</strong> {Object.keys(jsonData).length}
                    </span>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </motion.div>
    </div>
  );
};
