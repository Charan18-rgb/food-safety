import { HistoryList } from '@/components/history/HistoryList';
export default function History() {
  return (
    <div className="p-4 max-w-md mx-auto">
      <h2 className="text-xl font-bold mb-4">Scan History</h2>
      <HistoryList />
    </div>
  );
}
