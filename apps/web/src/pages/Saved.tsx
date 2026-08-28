import { FavoritesList } from '@/components/history/FavoritesList';
export default function Saved() {
  return (
    <div className="p-4 max-w-md mx-auto">
      <h2 className="text-xl font-bold mb-4">Saved Items</h2>
      <FavoritesList />
    </div>
  );
}
