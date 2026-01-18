import { useState } from 'react';
import { motion } from 'framer-motion';
import { IconDice, IconCopy } from '@tabler/icons-react';
import { useToast } from '../ui/toast';

const firstNames = ['John', 'Jane', 'Michael', 'Sarah', 'David', 'Emily', 'James', 'Emma'];
const lastNames = ['Smith', 'Johnson', 'Williams', 'Brown', 'Jones', 'Garcia', 'Miller', 'Davis'];
const domains = ['example.com', 'test.com', 'demo.org', 'sample.net'];
const cities = ['New York', 'Los Angeles', 'Chicago', 'Houston', 'Phoenix', 'Philadelphia'];

export const RandomData = () => {
  const [type, setType] = useState<'name' | 'email' | 'phone' | 'address' | 'uuid' | 'number'>('name');
  const [count, setCount] = useState(5);
  const [output, setOutput] = useState('');
  const { showToast } = useToast();

  const generateName = () => {
    const first = firstNames[Math.floor(Math.random() * firstNames.length)];
    const last = lastNames[Math.floor(Math.random() * lastNames.length)];
    return `${first} ${last}`;
  };

  const generateEmail = () => {
    const name = generateName().toLowerCase().replace(' ', '.');
    const domain = domains[Math.floor(Math.random() * domains.length)];
    return `${name}@${domain}`;
  };

  const generatePhone = () => {
    return `+1-${Math.floor(Math.random() * 900) + 100}-${Math.floor(Math.random() * 900) + 100}-${Math.floor(Math.random() * 9000) + 1000}`;
  };

  const generateAddress = () => {
    const street = Math.floor(Math.random() * 9999) + 1;
    const city = cities[Math.floor(Math.random() * cities.length)];
    const zip = Math.floor(Math.random() * 90000) + 10000;
    return `${street} Main St, ${city}, ${zip}`;
  };

  const generateUUID = () => {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
      const r = (Math.random() * 16) | 0;
      const v = c === 'x' ? r : (r & 0x3) | 0x8;
      return v.toString(16);
    });
  };

  const generateNumber = () => {
    return Math.floor(Math.random() * 1000000).toString();
  };

  const handleGenerate = () => {
    const generators: Record<string, () => string> = {
      name: generateName,
      email: generateEmail,
      phone: generatePhone,
      address: generateAddress,
      uuid: generateUUID,
      number: generateNumber,
    };

    const results: string[] = [];
    for (let i = 0; i < count; i++) {
      results.push(generators[type]());
    }

    setOutput(results.join('\n'));
    showToast('Generated successfully');
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(output).then(() => {
      showToast('Copied to clipboard');
    });
  };

  return (
    <div className="w-full max-w-2xl mx-auto px-4 py-8">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
        <div className="text-center space-y-2">
          <div className="inline-flex items-center justify-center p-3 bg-primary/10 rounded-full mb-2">
            <IconDice className="w-8 h-8 text-primary" />
          </div>
          <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
            Random Data Generator
          </h1>
          <p className="text-muted-foreground">Generate random data for testing</p>
        </div>

        <div className="bg-card/50 backdrop-blur-sm border border-border rounded-2xl p-6 space-y-6">
          <div className="grid grid-cols-3 gap-2">
            {(['name', 'email', 'phone', 'address', 'uuid', 'number'] as const).map((t) => (
              <button
                key={t}
                onClick={() => {
                  setType(t);
                  setOutput('');
                }}
                className={`px-3 py-2 rounded-lg border-2 transition-all cursor-pointer capitalize text-sm ${
                  type === t
                    ? 'border-primary bg-primary/10 text-primary'
                    : 'border-border bg-background text-muted-foreground hover:border-primary/50'
                }`}
              >
                {t}
              </button>
            ))}
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Count</label>
            <input
              type="number"
              value={count}
              onChange={(e) => setCount(Math.max(1, parseInt(e.target.value) || 1))}
              min="1"
              max="100"
              className="w-full px-4 py-2 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>

          <button
            onClick={handleGenerate}
            className="w-full px-6 py-3 bg-primary text-primary-foreground rounded-xl font-semibold hover:opacity-90 transition-all cursor-pointer flex items-center justify-center gap-2"
          >
            <IconDice className="w-5 h-5" />
            Generate
          </button>

          {output && (
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-sm font-medium">Output</label>
                <button onClick={handleCopy} className="p-1.5 hover:bg-muted rounded-lg transition-colors cursor-pointer" title="Copy">
                  <IconCopy className="w-4 h-4" />
                </button>
              </div>
              <textarea
                value={output}
                readOnly
                className="w-full h-64 px-4 py-3 bg-muted/30 border border-border rounded-xl font-mono text-sm resize-none"
              />
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
};
