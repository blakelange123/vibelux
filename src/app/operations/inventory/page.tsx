import { InventoryManagement } from '@/components/operations/InventoryManagement';

export default function InventoryManagementPage() {
  return (
    <div className="min-h-screen bg-black">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">Inventory Management</h1>
          <p className="text-gray-400">Supply and equipment tracking</p>
        </div>
        <InventoryManagement />
      </div>
    </div>
  );
}