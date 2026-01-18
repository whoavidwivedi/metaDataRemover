import { useState } from 'react';
import { motion } from 'framer-motion';
import { IconUpload, IconChartBar, IconFile } from '@tabler/icons-react';
import { FileUpload } from '../ui/file-upload';
import { useToast } from '../ui/toast';

interface Statistics {
  totalRows: number;
  totalColumns: number;
  columnStats: Record<string, {
    type: string;
    nullCount: number;
    uniqueCount: number;
    min?: number;
    max?: number;
    avg?: number;
    sum?: number;
  }>;
}

export const DataStatistics = () => {
  const [, setData] = useState<any[]>([]);
  const [headers, setHeaders] = useState<string[]>([]);
  const [dataType, setDataType] = useState<'csv' | 'json'>('csv');
  const [statistics, setStatistics] = useState<Statistics | null>(null);
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

  const calculateStatistics = (data: any[], headers: string[]): Statistics => {
    const stats: Statistics = {
      totalRows: data.length,
      totalColumns: headers.length,
      columnStats: {},
    };

    headers.forEach((header, colIndex) => {
      const values = data.map((row) => row[colIndex]).filter((val) => val !== null && val !== '');
      const nonNullValues = values.filter((val) => val !== null && val !== '');
      const uniqueValues = new Set(nonNullValues.map(String));
      
      const columnStat: Statistics['columnStats'][string] = {
        type: 'string',
        nullCount: values.length - nonNullValues.length,
        uniqueCount: uniqueValues.size,
      };

      // Try to parse as numbers
      const numericValues = nonNullValues
        .map((val) => {
          const num = Number(val);
          return isNaN(num) ? null : num;
        })
        .filter((val) => val !== null) as number[];

      if (numericValues.length > 0) {
        columnStat.type = 'number';
        columnStat.min = Math.min(...numericValues);
        columnStat.max = Math.max(...numericValues);
        columnStat.avg = numericValues.reduce((a, b) => a + b, 0) / numericValues.length;
        columnStat.sum = numericValues.reduce((a, b) => a + b, 0);
      }

      stats.columnStats[header] = columnStat;
    });

    return stats;
  };

  const handleFileSelect = (files: File[]) => {
    if (files.length === 0) return;

    const file = files[0];
    const reader = new FileReader();

    reader.onload = (e) => {
      const text = e.target?.result as string;

      try {
        if (dataType === 'csv') {
          const parsed = parseCSV(text);
          if (parsed.length === 0) {
            showToast('CSV file is empty', 'error');
            return;
          }
          const headers = parsed[0];
          const data = parsed.slice(1).map((row) => {
            const obj: any = {};
            headers.forEach((header, index) => {
              obj[header] = row[index] || '';
            });
            return obj;
          });
          setHeaders(headers);
          setData(data);
          setStatistics(calculateStatistics(parsed.slice(1), headers));
        } else {
          const parsed = JSON.parse(text);
          const arrayData = Array.isArray(parsed) ? parsed : [parsed];
          if (arrayData.length === 0) {
            showToast('JSON data is empty', 'error');
            return;
          }
          const headers = Object.keys(arrayData[0]);
          setHeaders(headers);
          setData(arrayData);
          setStatistics(calculateStatistics(arrayData, headers));
        }
        showToast('Data loaded successfully');
      } catch (err) {
        showToast('Failed to parse file', 'error');
      }
    };

    reader.onerror = () => {
      showToast('Failed to read file', 'error');
    };

    reader.readAsText(file);
  };

  return (
    <div className="w-full max-w-7xl mx-auto px-4 py-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-6"
      >
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold mb-2">Data Statistics</h2>
          <p className="text-muted-foreground">Analyze CSV and JSON data with detailed statistics</p>
        </div>

        {/* Upload Section */}
        <div className="bg-card border border-border rounded-xl p-6">
          <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
            <div className="flex items-center gap-4">
              <FileUpload
                accept={dataType === 'csv' ? '.csv,text/csv' : '.json,application/json'}
                onChange={handleFileSelect}
              />
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setDataType('csv')}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors cursor-pointer ${
                    dataType === 'csv'
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-muted text-muted-foreground hover:bg-muted/80'
                  }`}
                >
                  CSV
                </button>
                <button
                  onClick={() => setDataType('json')}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors cursor-pointer ${
                    dataType === 'json'
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-muted text-muted-foreground hover:bg-muted/80'
                  }`}
                >
                  JSON
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Statistics Display */}
        {statistics && (
          <div className="space-y-6">
            {/* Overview */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-card border border-border rounded-xl p-6">
                <div className="flex items-center gap-3 mb-2">
                  <IconChartBar className="w-6 h-6 text-primary" />
                  <h3 className="text-lg font-semibold">Total Rows</h3>
                </div>
                <p className="text-3xl font-bold">{statistics.totalRows.toLocaleString()}</p>
              </div>
              <div className="bg-card border border-border rounded-xl p-6">
                <div className="flex items-center gap-3 mb-2">
                  <IconFile className="w-6 h-6 text-primary" />
                  <h3 className="text-lg font-semibold">Total Columns</h3>
                </div>
                <p className="text-3xl font-bold">{statistics.totalColumns}</p>
              </div>
              <div className="bg-card border border-border rounded-xl p-6">
                <div className="flex items-center gap-3 mb-2">
                  <IconChartBar className="w-6 h-6 text-primary" />
                  <h3 className="text-lg font-semibold">Data Size</h3>
                </div>
                <p className="text-3xl font-bold">{(statistics.totalRows * statistics.totalColumns).toLocaleString()}</p>
              </div>
            </div>

            {/* Column Statistics */}
            <div className="bg-card border border-border rounded-xl p-6">
              <h3 className="text-xl font-semibold mb-6">Column Statistics</h3>
              <div className="space-y-4">
                {headers.map((header) => {
                  const stat = statistics.columnStats[header];
                  return (
                    <div key={header} className="border border-border rounded-lg p-4">
                      <h4 className="font-semibold mb-3">{header}</h4>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                        <div>
                          <span className="text-muted-foreground">Type:</span>
                          <span className="ml-2 font-medium capitalize">{stat.type}</span>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Null Count:</span>
                          <span className="ml-2 font-medium">{stat.nullCount}</span>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Unique Values:</span>
                          <span className="ml-2 font-medium">{stat.uniqueCount}</span>
                        </div>
                        {stat.type === 'number' && (
                          <>
                            <div>
                              <span className="text-muted-foreground">Min:</span>
                              <span className="ml-2 font-medium">{stat.min?.toLocaleString()}</span>
                            </div>
                            <div>
                              <span className="text-muted-foreground">Max:</span>
                              <span className="ml-2 font-medium">{stat.max?.toLocaleString()}</span>
                            </div>
                            <div>
                              <span className="text-muted-foreground">Average:</span>
                              <span className="ml-2 font-medium">{stat.avg?.toFixed(2)}</span>
                            </div>
                            <div>
                              <span className="text-muted-foreground">Sum:</span>
                              <span className="ml-2 font-medium">{stat.sum?.toLocaleString()}</span>
                            </div>
                          </>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {!statistics && (
          <div className="text-center py-12 text-muted-foreground">
            <IconUpload className="w-16 h-16 mx-auto mb-4 opacity-50" />
            <p>Upload a CSV or JSON file to analyze</p>
          </div>
        )}
      </motion.div>
    </div>
  );
};
