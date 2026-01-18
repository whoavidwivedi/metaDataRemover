import { useState } from 'react';
import { motion } from 'framer-motion';
import { IconEyeOff, IconCopy } from '@tabler/icons-react';
import { useToast } from '../ui/toast';

export const DataMasking = () => {
  const [input, setInput] = useState('');
  const [output, setOutput] = useState('');
  const [maskChar, setMaskChar] = useState('*');
  const { showToast } = useToast();

  const maskEmail = (email: string): string => {
    const [local, domain] = email.split('@');
    if (!domain) return email;
    const maskedLocal = local.length > 2 
      ? local[0] + maskChar.repeat(local.length - 2) + local[local.length - 1]
      : maskChar.repeat(local.length);
    const [domainName, tld] = domain.split('.');
    const maskedDomain = domainName.length > 2
      ? domainName[0] + maskChar.repeat(domainName.length - 2) + domainName[domainName.length - 1]
      : maskChar.repeat(domainName.length);
    return `${maskedLocal}@${maskedDomain}.${tld}`;
  };

  const maskPhone = (phone: string): string => {
    const digits = phone.replace(/\D/g, '');
    if (digits.length < 4) return phone;
    const visible = digits.slice(-4);
    return phone.replace(/\d/g, (_, idx) => idx < digits.length - 4 ? maskChar : visible[idx - (digits.length - 4)]);
  };

  const maskSSN = (ssn: string): string => {
    const digits = ssn.replace(/\D/g, '');
    if (digits.length !== 9) return ssn;
    return `XXX-XX-${digits.slice(-4)}`;
  };

  const maskCreditCard = (card: string): string => {
    const digits = card.replace(/\D/g, '');
    if (digits.length < 4) return card;
    const last4 = digits.slice(-4);
    return maskChar.repeat(digits.length - 4) + last4;
  };

  const maskText = (text: string): string => {
    return text
      .replace(/\b[\w.-]+@[\w.-]+\.\w+\b/g, maskEmail)
      .replace(/\b\d{3}-\d{2}-\d{4}\b/g, maskSSN)
      .replace(/\b\d{4}[\s-]?\d{4}[\s-]?\d{4}[\s-]?\d{4}\b/g, maskCreditCard)
      .replace(/\b\d{3}[\s-]?\d{3}[\s-]?\d{4}\b/g, maskPhone);
  };

  const handleMask = () => {
    if (!input.trim()) {
      showToast('Please enter text to mask', 'error');
      return;
    }
    const masked = maskText(input);
    setOutput(masked);
    showToast('Data masked successfully');
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
            <IconEyeOff className="w-8 h-8 text-primary" />
          </div>
          <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
            Data Masking Tool
          </h1>
          <p className="text-muted-foreground">
            Mask sensitive data like emails, phone numbers, SSNs, and credit cards
          </p>
        </div>

        <div className="bg-card/50 backdrop-blur-sm border border-border rounded-2xl p-6">
          <div className="mb-4">
            <label className="block text-sm font-medium mb-2">Mask Character</label>
            <input
              type="text"
              value={maskChar}
              onChange={(e) => setMaskChar(e.target.value[0] || '*')}
              maxLength={1}
              className="w-20 px-3 py-2 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-sm font-medium">Input Text</label>
                {input && (
                  <button
                    onClick={() => handleCopy(input)}
                    className="p-1.5 hover:bg-muted rounded-lg transition-colors cursor-pointer"
                    title="Copy input"
                  >
                    <IconCopy className="w-4 h-4" />
                  </button>
                )}
              </div>
              <textarea
                value={input}
                onChange={(e) => {
                  setInput(e.target.value);
                  setOutput('');
                }}
                placeholder="Enter text with emails, phone numbers, SSNs, or credit cards..."
                className="w-full h-64 px-4 py-3 bg-background border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary text-sm resize-none"
                spellCheck={false}
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-sm font-medium">Masked Output</label>
                {output && (
                  <button
                    onClick={() => handleCopy(output)}
                    className="p-1.5 hover:bg-muted rounded-lg transition-colors cursor-pointer"
                    title="Copy output"
                  >
                    <IconCopy className="w-4 h-4" />
                  </button>
                )}
              </div>
              <textarea
                value={output}
                readOnly
                className="w-full h-64 px-4 py-3 bg-muted/30 border border-border rounded-xl text-sm resize-none"
                spellCheck={false}
              />
            </div>
          </div>

          <button
            onClick={handleMask}
            disabled={!input.trim()}
            className="mt-4 w-full px-6 py-3 bg-primary text-primary-foreground rounded-xl font-semibold hover:opacity-90 transition-all disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
          >
            Mask Sensitive Data
          </button>
        </div>
      </motion.div>
    </div>
  );
};
