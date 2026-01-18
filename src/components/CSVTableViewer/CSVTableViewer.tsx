import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { IconUpload, IconDownload, IconSearch, IconArrowsSort } from '@tabler/icons-react';
import { FileUpload } from '../ui/file-upload';
import { useToast } from '../ui/toast';

type SortConfig = {
  key: number | null;
  direction: 'asc' | 'desc';
};

export const CSVTableViewer = () => {
  const [csvData, setCsvData] = useState<string[][]>([]);
  const [headers, setHeaders] = useState<string[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortConfig, setSortConfig] = useState<SortConfig>({ key: null, direction: 'asc' });
  const [hasHeaders, setHasHeaders] = useState(true);
  const { showToast } = useToast();

  const parseCSV = (text: string): string[][] => {
    const lines = text.split('\n').filter((line) => line.trim());
    return lines.map((line) => {
      const result: string[] = [];
      let current = '';
      let inQuotes = false;

      for (let i = 0; i < line.length; i++) {
        const char = line[i];
        if (char === '"') {
          inQuotes = !inQuotes;
        } else if (char === ',' && !inQuotes) {
          result.push(current.trim());
          current = '';
        } else {
          current += char;
        }
      }
      result.push(current.trim());
      return result;
    });
  };

  const handleFileSelect = (files: File[]) => {
    if (files.length === 0) return;

    const file = files[0];
    const reader = new FileReader();

    reader.onload = (e) => {
      const text = e.target?.result as string;
      const parsed = parseCSV(text);

      if (parsed.length === 0) {
        showToast('CSV file is empty', 'error');
        return;
      }

      if (hasHeaders && parsed.length > 0) {
        setHeaders(parsed[0]);
        setCsvData(parsed.slice(1));
      } else {
        setHeaders(parsed[0].map((_, i) => `Column ${i + 1}`));
        setCsvData(parsed);
      }

      showToast('CSV file loaded successfully');
    };

    reader.onerror = () => {
      showToast('Failed to read file', 'error');
    };

    reader.readAsText(file);
  };

  const handleSort = (columnIndex: number) => {
    setSortConfig((prev) => ({
      key: columnIndex,
      direction: prev.key === columnIndex && prev.direction === 'asc' ? 'desc' : 'asc',
    }));
  };

  const filteredAndSortedData = useMemo(() => {
    let filtered = csvData;

    // Filter
    if (searchTerm) {
      filtered = csvData.filter((row) =>
        row.some((cell) => cell.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }

    // Sort
    if (sortConfig.key !== null) {
      filtered = [...filtered].sort((a, b) => {
        const aVal = a[sortConfig.key!] || '';
        const bVal = b[sortConfig.key!] || '';
        const comparison = aVal.localeCompare(bVal);
        return sortConfig.direction === 'asc' ? comparison : -comparison;
      });
    }

    return filtered;
  }, [csvData, searchTerm, sortConfig]);

  const exportCSV = () => {
    if (csvData.length === 0) {
      showToast('No data to export', 'error');
      return;
    }

    const rows = hasHeaders ? [headers, ...csvData] : csvData;
    const csvContent = rows.map((row) => row.map((cell) => `"${cell}"`).join(',')).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'exported.csv';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    showToast('CSV exported successfully');
  };

  return (
    <div className="w-full max-w-7xl mx-auto px-4 py-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-6"
      >
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold mb-2">CSV Table Viewer</h2>
          <p className="text-muted-foreground">Upload, view, sort, and filter CSV data</p>
        </div>

        {/* Upload Section */}
        <div className="bg-card border border-border rounded-xl p-6">
            <div className="flex flex-col md:flex-row gap-4 items-center justify-between mb-4">
              <FileUpload
                accept=".csv,text/csv"
                onChange={handleFileSelect}
              />
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="hasHeaders"
                checked={hasHeaders}
                onChange={(e) => setHasHeaders(e.target.checked)}
                className="w-4 h-4"
              />
              <label htmlFor="hasHeaders" className="text-sm cursor-pointer">
                First row contains headers
              </label>
            </div>
            {csvData.length > 0 && (
              <button
                onClick={exportCSV}
                className="px-4 py-2 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-colors font-medium cursor-pointer flex items-center gap-2"
              >
                <IconDownload className="w-4 h-4" />
                Export CSV
              </button>
            )}
          </div>

          {/* Search */}
          {csvData.length > 0 && (
            <div className="relative">
              <IconSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search in table..."
                className="w-full pl-10 pr-4 py-2 rounded-lg bg-muted border border-border focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
          )}
        </div>

        {/* Table */}
        {csvData.length > 0 && (
          <div className="bg-card border border-border rounded-xl overflow-hidden">
            <div className="overflow-x-auto max-h-[600px] overflow-y-auto">
              <table className="w-full border-collapse">
                <thead className="bg-muted sticky top-0">
                  <tr>
                    {headers.map((header, index) => (
                      <th
                        key={index}
                        className="px-4 py-3 text-left font-semibold text-sm border-b border-border cursor-pointer hover:bg-muted/80 transition-colors"
                        onClick={() => handleSort(index)}
                      >
                        <div className="flex items-center gap-2">
                          {header}
                          <IconArrowsSort className="w-4 h-4 text-muted-foreground" />
                        </div>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filteredAndSortedData.length === 0 ? (
                    <tr>
                      <td colSpan={headers.length} className="px-4 py-8 text-center text-muted-foreground">
                        No data found
                      </td>
                    </tr>
                  ) : (
                    filteredAndSortedData.map((row, rowIndex) => (
                      <tr
                        key={rowIndex}
                        className="border-b border-border hover:bg-muted/50 transition-colors"
                      >
                        {headers.map((_, colIndex) => (
                          <td key={colIndex} className="px-4 py-3 text-sm">
                            {row[colIndex] || '-'}
                          </td>
                        ))}
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
            <div className="px-4 py-3 bg-muted border-t border-border text-sm text-muted-foreground">
              Showing {filteredAndSortedData.length} of {csvData.length} rows
            </div>
          </div>
        )}

        {csvData.length === 0 && (
          <div className="text-center py-12 text-muted-foreground">
            <IconUpload className="w-16 h-16 mx-auto mb-4 opacity-50" />
            <p>Upload a CSV file to get started</p>
          </div>
        )}
      </motion.div>
    </div>
  );
};
