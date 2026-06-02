import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import BottomNav from './BottomNav';

export default function AdminLayout() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Sidebar />

      {/* Main content — accounts for sidebar width on desktop */}
      <div className="md:ml-60 transition-all duration-200 flex flex-col min-h-screen">
        <main className="flex-1 p-4 md:p-6 lg:p-8 pb-20 md:pb-8">
          <Outlet />
        </main>
      </div>

      <BottomNav />
    </div>
  );
}
