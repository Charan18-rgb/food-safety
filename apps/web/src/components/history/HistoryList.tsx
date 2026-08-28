import { useState, useEffect } from 'react';
import { ScanHistoryRecord } from '@foodgrade/client-services';
import { Card } from '../ui/Card';
import { GradeBadge } from '../analysis/GradeBadge';
import { useResultContext } from '@/context/ResultContext';
import { useNavigate } from 'react-router-dom';
import { clientService } from '@/services/client';

export function HistoryList() {
  const [history, setHistory] = useState<ScanHistoryRecord[]>([]);
  const { setResult } = useResultContext();
  const navigate = useNavigate();

  useEffect(() => {
    async function load() {
      const records = await clientService.getHistory();
      setHistory(records.sort((a, b) => new Date(b.scannedAt).getTime() - new Date(a.scannedAt).getTime()));
    }
    load();
  }, []);

  const handleClick = (record: ScanHistoryRecord) => {
    setResult({
      productInput: record.productInput,
      analysisResult: record.analysisResult,
      scanMethod: 'history',
      timestamp: new Date(record.scannedAt).getTime(),
      scanRecordId: record.id,
      isFavorite: record.isFavorite
    });
    navigate('/result');
  };

  if (history.length === 0) {
    return <div className="text-center p-8 text-gray-500">No history yet. Scan a product to get started.</div>;
  }

  return (
    <div className="space-y-3">
      {history.map(record => (
        <button
          key={record.id}
          className="w-full text-left focus:outline-none focus:ring-2 focus:ring-primary-500 rounded-2xl"
          onClick={() => handleClick(record)}
          aria-label={`View history for ${record.productInput.productName || 'Unknown Product'}, Grade ${record.analysisResult.grade}`}
        >
          <Card className="flex items-center gap-4 p-3 cursor-pointer hover:bg-gray-50 transition-colors">
            <GradeBadge grade={record.analysisResult.grade} className="w-12 h-12 p-0 text-xl flex-none" />
            <div className="flex-1 overflow-hidden">
              <h3 className="font-bold text-gray-900 truncate">{record.productInput.productName || 'Unknown Product'}</h3>
              <p className="text-xs text-gray-500">{new Date(record.scannedAt).toLocaleDateString()}</p>
            </div>
            <div className="text-right">
              <span className="text-lg font-bold">{Math.round(record.analysisResult.score)}</span>
              <span className="text-xs text-gray-500 block">Score</span>
            </div>
          </Card>
        </button>
      ))}
    </div>
  );
}
