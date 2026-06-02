import { BrowserRouter, Routes, Route } from 'react-router-dom';
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
import DashboardPage from './pages/admin/DashboardPage';
import FleetPage from './pages/admin/FleetPage';
import ServicesPage from './pages/admin/ServicesPage';
import RoutesPage from './pages/admin/RoutesPage';
import DeparturesPage from './pages/admin/DeparturesPage';

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
            <Route path="/admin/dashboard" element={<DashboardPage />} />
            <Route path="/admin/flota" element={<FleetPage />} />
            <Route path="/admin/servicios" element={<ServicesPage />} />
            <Route path="/admin/rutas" element={<RoutesPage />} />
            <Route path="/admin/salidas" element={<DeparturesPage />} />
          </Route>
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
