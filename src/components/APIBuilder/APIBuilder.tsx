import { useState } from 'react';
import { motion } from 'framer-motion';
import { IconWorld, IconPlayerPlay } from '@tabler/icons-react';
import { useToast } from '../ui/toast';

type Method = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';

export const APIBuilder = () => {
  const [method, setMethod] = useState<Method>('GET');
  const [url, setUrl] = useState('');
  const [headers] = useState<Record<string, string>>({});
  const [body, setBody] = useState('');
  const [response, setResponse] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const { showToast } = useToast();

  const handleSend = async () => {
    if (!url.trim()) {
      showToast('Please enter a URL', 'error');
      return;
    }

    setLoading(true);
    try {
      const options: RequestInit = {
        method,
        headers: {
          'Content-Type': 'application/json',
          ...headers,
        },
      };

      if (['POST', 'PUT', 'PATCH'].includes(method) && body) {
        try {
          options.body = JSON.parse(body);
        } catch {
          options.body = body;
        }
      }

      const res = await fetch(url, options);
      const data = await res.text();
      try {
        setResponse({ status: res.status, data: JSON.parse(data), headers: Object.fromEntries(res.headers.entries()) });
      } catch {
        setResponse({ status: res.status, data, headers: Object.fromEntries(res.headers.entries()) });
      }
      showToast('Request sent successfully');
    } catch (err) {
      showToast('Request failed', 'error');
      setResponse({ error: err instanceof Error ? err.message : 'Unknown error' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto px-4 py-8">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
        <div className="text-center space-y-2">
          <div className="inline-flex items-center justify-center p-3 bg-primary/10 rounded-full mb-2">
            <IconWorld className="w-8 h-8 text-primary" />
          </div>
          <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
            API Request Builder
          </h1>
          <p className="text-muted-foreground">Build and test HTTP requests</p>
        </div>

        <div className="bg-card/50 backdrop-blur-sm border border-border rounded-2xl p-6 space-y-6">
          <div className="flex gap-2">
            <select value={method} onChange={(e) => setMethod(e.target.value as Method)} className="px-4 py-2 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary cursor-pointer">
              {['GET', 'POST', 'PUT', 'PATCH', 'DELETE'].map((m) => (
                <option key={m} value={m}>{m}</option>
              ))}
            </select>
            <input
              type="text"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="https://api.example.com/endpoint"
              className="flex-1 px-4 py-2 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary font-mono text-sm"
            />
            <button
              onClick={handleSend}
              disabled={loading || !url.trim()}
              className="px-6 py-2 bg-primary text-primary-foreground rounded-lg font-semibold hover:opacity-90 transition-all disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer flex items-center gap-2"
            >
              <IconPlayerPlay className="w-4 h-4" />
              Send
            </button>
          </div>

          {['POST', 'PUT', 'PATCH'].includes(method) && (
            <div>
              <label className="block text-sm font-medium mb-2">Request Body</label>
              <textarea
                value={body}
                onChange={(e) => setBody(e.target.value)}
                placeholder='{"key": "value"}'
                className="w-full h-32 px-4 py-3 bg-background border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary font-mono text-sm resize-none"
              />
            </div>
          )}

          {response && (
            <div>
              <h3 className="text-sm font-semibold mb-2">Response</h3>
              <div className="bg-background border border-border rounded-lg p-4 max-h-96 overflow-y-auto">
                <pre className="text-sm font-mono">{JSON.stringify(response, null, 2)}</pre>
              </div>
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
};
