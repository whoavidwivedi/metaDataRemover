import { useState } from 'react';
import { motion } from 'framer-motion';
import { IconKey, IconCopy, IconX } from '@tabler/icons-react';
import { useToast } from '../ui/toast';

interface JWTPayload {
  [key: string]: any;
}

export const JWTDecoder = () => {
  const [token, setToken] = useState('');
  const [header, setHeader] = useState<JWTPayload | null>(null);
  const [payload, setPayload] = useState<JWTPayload | null>(null);
  const [signature, setSignature] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const { showToast } = useToast();

  const decodeBase64 = (str: string): string => {
    try {
      // Add padding if needed
      str = str.replace(/-/g, '+').replace(/_/g, '/');
      while (str.length % 4) {
        str += '=';
      }
      return decodeURIComponent(
        atob(str)
          .split('')
          .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
          .join('')
      );
    } catch (e) {
      throw new Error('Invalid base64 encoding');
    }
  };

  const handleDecode = () => {
    setError(null);
    setHeader(null);
    setPayload(null);
    setSignature(null);

    if (!token.trim()) {
      setError('Please enter a JWT token');
      return;
    }

    try {
      const parts = token.trim().split('.');
      if (parts.length !== 3) {
        throw new Error('Invalid JWT format. Expected 3 parts separated by dots.');
      }

      const [headerPart, payloadPart, signaturePart] = parts;

      // Decode header
      const headerJson = decodeBase64(headerPart);
      const headerData = JSON.parse(headerJson);
      setHeader(headerData);

      // Decode payload
      const payloadJson = decodeBase64(payloadPart);
      const payloadData = JSON.parse(payloadJson);
      setPayload(payloadData);

      // Store signature (not decoded, just displayed)
      setSignature(signaturePart);

      showToast('Token decoded successfully');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to decode JWT token');
      showToast('Failed to decode token', 'error');
    }
  };

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text).then(() => {
      showToast('Copied to clipboard');
    });
  };

  const formatJSON = (obj: any): string => {
    return JSON.stringify(obj, null, 2);
  };

  return (
    <div className="w-full max-w-4xl mx-auto px-4 py-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-6"
      >
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center justify-center p-3 bg-primary/10 rounded-full mb-2">
            <IconKey className="w-8 h-8 text-primary" />
          </div>
          <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
            JWT Decoder
          </h1>
          <p className="text-muted-foreground">
            Decode and inspect JWT tokens. All processing happens locally.
          </p>
        </div>

        {/* Input */}
        <div className="bg-card/50 backdrop-blur-sm border border-border rounded-2xl p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold">JWT Token</h2>
            {token && (
              <button
                onClick={() => handleCopy(token)}
                className="p-2 hover:bg-muted rounded-lg transition-colors cursor-pointer"
                title="Copy token"
              >
                <IconCopy className="w-4 h-4" />
              </button>
            )}
          </div>
          <textarea
            value={token}
            onChange={(e) => {
              setToken(e.target.value);
              setError(null);
              setHeader(null);
              setPayload(null);
              setSignature(null);
            }}
            placeholder="Paste your JWT token here (e.g., eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...)"
            className="w-full h-32 px-4 py-3 bg-background border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary font-mono text-sm resize-none"
            spellCheck={false}
          />
          <button
            onClick={handleDecode}
            disabled={!token.trim()}
            className="mt-4 w-full px-6 py-3 bg-primary text-primary-foreground rounded-xl font-semibold hover:opacity-90 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 cursor-pointer"
          >
            Decode Token
          </button>
        </div>

        {/* Error */}
        {error && (
          <div className="bg-destructive/10 border border-destructive/50 text-destructive px-4 py-3 rounded-lg">
            <div className="flex items-center gap-2">
              <IconX className="w-5 h-5" />
              <span>{error}</span>
            </div>
          </div>
        )}

        {/* Results */}
        {(header || payload || signature) && (
          <div className="space-y-4">
            {/* Header */}
            {header && (
              <div className="bg-card/50 backdrop-blur-sm border border-border rounded-2xl p-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-bold">Header</h2>
                  <button
                    onClick={() => handleCopy(formatJSON(header))}
                    className="p-2 hover:bg-muted rounded-lg transition-colors cursor-pointer"
                    title="Copy header"
                  >
                    <IconCopy className="w-4 h-4" />
                  </button>
                </div>
                <pre className="bg-background border border-border rounded-lg p-4 overflow-x-auto text-sm font-mono">
                  {formatJSON(header)}
                </pre>
              </div>
            )}

            {/* Payload */}
            {payload && (
              <div className="bg-card/50 backdrop-blur-sm border border-border rounded-2xl p-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-bold">Payload</h2>
                  <button
                    onClick={() => handleCopy(formatJSON(payload))}
                    className="p-2 hover:bg-muted rounded-lg transition-colors cursor-pointer"
                    title="Copy payload"
                  >
                    <IconCopy className="w-4 h-4" />
                  </button>
                </div>
                <pre className="bg-background border border-border rounded-lg p-4 overflow-x-auto text-sm font-mono">
                  {formatJSON(payload)}
                </pre>
                {/* Common JWT claims info */}
                {payload.exp && (
                  <div className="mt-4 p-3 bg-muted/50 rounded-lg text-sm">
                    <p className="font-semibold mb-2">Token Information:</p>
                    <p>Expires: {new Date(payload.exp * 1000).toLocaleString()}</p>
                    {payload.iat && (
                      <p>Issued: {new Date(payload.iat * 1000).toLocaleString()}</p>
                    )}
                    {payload.exp * 1000 < Date.now() && (
                      <p className="text-red-500 font-semibold mt-2">⚠️ Token has expired</p>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* Signature */}
            {signature && (
              <div className="bg-card/50 backdrop-blur-sm border border-border rounded-2xl p-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-bold">Signature</h2>
                  <button
                    onClick={() => handleCopy(signature)}
                    className="p-2 hover:bg-muted rounded-lg transition-colors cursor-pointer"
                    title="Copy signature"
                  >
                    <IconCopy className="w-4 h-4" />
                  </button>
                </div>
                <div className="bg-background border border-border rounded-lg p-4 font-mono text-sm break-all">
                  {signature}
                </div>
                <p className="text-xs text-muted-foreground mt-2">
                  Note: Signature verification requires the secret key and is not performed here.
                </p>
              </div>
            )}
          </div>
        )}
      </motion.div>
    </div>
  );
};
