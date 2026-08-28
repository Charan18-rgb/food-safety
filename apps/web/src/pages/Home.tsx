import { Button } from '@/components/ui/Button';
import { useNavigate } from 'react-router-dom';
import { HistoryList } from '@/components/history/HistoryList';

export default function Home() {
  const navigate = useNavigate();

  return (
    <div className="flex flex-col h-full bg-gray-50">
      <div className="flex flex-col items-center justify-center p-8 bg-white border-b">
        <h1 className="text-3xl font-black text-gray-900 mb-2">FoodGrade</h1>
        <p className="text-gray-500 text-center mb-6">Know what's inside your food.</p>
        <Button size="lg" className="w-full max-w-xs shadow-lg" onClick={() => navigate('/scan')}>
          Scan Food
        </Button>
      </div>

      <div className="flex-1 p-4 overflow-y-auto">
        <h2 className="text-lg font-bold text-gray-900 mb-4">Recent Scans</h2>
        <HistoryList />
      </div>
    </div>
  );
}
