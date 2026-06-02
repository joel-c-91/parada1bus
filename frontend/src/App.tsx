import { BrowserRouter, Routes, Route } from 'react-router-dom';
import {
  LayoutDashboard,
  Truck,
  ClipboardList,
  Map,
  CalendarClock,
} from 'lucide-react';
import Layout from './components/layout/Layout';
import Inicio from './pages/Inicio';
import Servicios from './pages/Servicios';
import Flota from './pages/Flota';
import Cotizar from './pages/Cotizar';
import BuscarViaje from './pages/BuscarViaje';
import Reservar from './pages/Reservar';
import Contacto from './pages/Contacto';
import AdminLayout from './components/admin/AdminLayout';
import ProtectedRoute from './components/admin/ProtectedRoute';
import LoginPage from './pages/admin/LoginPage';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public routes */}
        <Route element={<Layout />}>
          <Route path="/" element={<Inicio />} />
          <Route path="/servicios" element={<Servicios />} />
          <Route path="/flota" element={<Flota />} />
          <Route path="/cotizar" element={<Cotizar />} />
          <Route path="/buscar-viaje" element={<BuscarViaje />} />
          <Route path="/reservar/:salidaId" element={<Reservar />} />
          <Route path="/contacto" element={<Contacto />} />
        </Route>

        {/* Admin routes */}
        <Route path="/admin/login" element={<LoginPage />} />

        <Route element={<ProtectedRoute />}>
          <Route element={<AdminLayout />}>
            <Route path="/admin/dashboard" element={<DashboardPlaceholder />} />
            <Route path="/admin/flota" element={<PlaceholderPage title="Flota" />} />
            <Route path="/admin/servicios" element={<PlaceholderPage title="Servicios" />} />
            <Route path="/admin/rutas" element={<PlaceholderPage title="Rutas" />} />
            <Route path="/admin/salidas" element={<PlaceholderPage title="Salidas" />} />
          </Route>
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

/** Minimal dashboard stub */
function DashboardPlaceholder() {
  const cards = [
    { icon: LayoutDashboard, label: 'Dashboard', value: '—', color: 'text-blue-600 bg-blue-50' },
    { icon: Truck, label: 'Vehículos', value: '—', color: 'text-green-600 bg-green-50' },
    { icon: ClipboardList, label: 'Servicios', value: '—', color: 'text-purple-600 bg-purple-50' },
    { icon: Map, label: 'Rutas', value: '—', color: 'text-orange-600 bg-orange-50' },
    { icon: CalendarClock, label: 'Salidas', value: '—', color: 'text-teal-600 bg-teal-50' },
  ];

  return (
    <div>
      <h1 className="text-xl font-bold text-gray-900 mb-6">Dashboard</h1>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
        {cards.map((card) => {
          const Icon = card.icon;
          return (
            <div key={card.label} className={`rounded-xl p-4 ${card.color}`}>
              <Icon className="w-8 h-8 mb-2" />
              <p className="text-2xl font-bold">{card.value}</p>
              <p className="text-sm opacity-80">{card.label}</p>
            </div>
          );
        })}
      </div>
    </div>
  );
}

/** Placeholder page for CRUD pages not yet implemented */
function PlaceholderPage({ title }: { title: string }) {
  return (
    <div>
      <h1 className="text-xl font-bold text-gray-900 mb-4">{title}</h1>
      <div className="bg-white rounded-xl border border-gray-200 p-8 text-center text-gray-500">
        <p>Esta sección estará disponible próximamente.</p>
      </div>
    </div>
  );
}
