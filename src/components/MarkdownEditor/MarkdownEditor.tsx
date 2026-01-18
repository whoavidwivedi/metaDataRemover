import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  IconMarkdown,
  IconCopy,
  IconDownload,
} from '@tabler/icons-react';
import { markdownToHTML } from '../../utils/markdown';
import { useToast } from '../ui/toast';

export const MarkdownEditor = () => {
  const [markdown, setMarkdown] = useState('');
  const [html, setHtml] = useState('');
  const { showToast } = useToast();

  const handleConvert = () => {
    const converted = markdownToHTML(markdown);
    setHtml(converted);
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
            Markdown Editor
          </h1>
          <p className="text-muted-foreground">
            Edit markdown and preview HTML output. All processing happens locally in your browser.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold">Markdown</h2>
              {markdown && (
                <div className="flex gap-2">
                  <button
                    onClick={() => handleCopy(markdown)}
                    className="px-3 py-1.5 bg-muted hover:bg-muted/80 rounded-lg transition-colors flex items-center gap-2 text-sm cursor-pointer"
                  >
                    <IconCopy className="w-4 h-4" />
                    Copy
                  </button>
                  <button
                    onClick={() => handleDownload(markdown, 'markdown.md')}
                    className="px-3 py-1.5 bg-muted hover:bg-muted/80 rounded-lg transition-colors flex items-center gap-2 text-sm cursor-pointer"
                  >
                    <IconDownload className="w-4 h-4" />
                    Download
                  </button>
                </div>
              )}
            </div>
            <textarea
              value={markdown}
              onChange={(e) => setMarkdown(e.target.value)}
              onBlur={handleConvert}
              placeholder="Enter markdown text..."
              className="w-full h-96 px-4 py-3 bg-background border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary font-mono text-sm resize-none"
            />
            <button
              onClick={handleConvert}
              className="w-full px-6 py-3 bg-primary text-primary-foreground rounded-xl font-semibold hover:opacity-90 transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <IconMarkdown className="w-5 h-5" />
              Convert to HTML
            </button>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold">HTML Preview</h2>
              {html && (
                <div className="flex gap-2">
                  <button
                    onClick={() => handleCopy(html)}
                    className="px-3 py-1.5 bg-muted hover:bg-muted/80 rounded-lg transition-colors flex items-center gap-2 text-sm cursor-pointer"
                  >
                    <IconCopy className="w-4 h-4" />
                    Copy HTML
                  </button>
                </div>
              )}
            </div>
            <div className="w-full h-96 px-4 py-3 bg-background border border-border rounded-xl overflow-auto">
              {html ? (
                <div dangerouslySetInnerHTML={{ __html: html }} />
              ) : (
                <p className="text-muted-foreground">HTML preview will appear here...</p>
              )}
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};
