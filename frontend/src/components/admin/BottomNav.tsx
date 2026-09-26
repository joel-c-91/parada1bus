import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  Truck,
  ClipboardList,
  Map,
  CalendarClock,
  Users,
  DollarSign,
  CreditCard,
  Tags,
  Receipt,
  MoreHorizontal,
  LogOut,
  X,
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

const mainTabs = [
  { path: '/admin/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { path: '/admin/flota', label: 'Flota', icon: Truck },
  { path: '/admin/servicios', label: 'Servicios', icon: ClipboardList },
  { path: '/admin/rutas', label: 'Rutas', icon: Map },
  { path: '/admin/salidas', label: 'Salidas', icon: CalendarClock },
] as const;

const moreItems = [
  { path: '/admin/clientes', label: 'Clientes', icon: Users, disabled: false },
  { path: '/admin/pagos', label: 'Pagos', icon: DollarSign, disabled: false },
  { path: '/admin/gastos', label: 'Gastos', icon: CreditCard, disabled: false },
  { path: '/admin/categorias-gasto', label: 'Categorías', icon: Tags, disabled: false },
  { path: '/admin/cheques', label: 'Cheques', icon: Receipt, disabled: false },
  { path: '/admin/promociones', label: 'Promociones', disabled: true },
  { path: '/admin/configuracion', label: 'Configuración', disabled: true },
] as const;

export default function BottomNav() {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const { logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const isActive = (path: string) => location.pathname === path;

  const handleLogout = () => {
    setDrawerOpen(false);
    logout();
    navigate('/admin/login', { replace: true });
  };

  return (
    <>
      {/* Bottom navigation bar */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-gray-200 safe-area-bottom">
        <div className="flex items-center justify-around h-16 px-1">
          {mainTabs.map((tab) => {
            const Icon = tab.icon;
            const active = isActive(tab.path);
            return (
              <Link
                key={tab.path}
                to={tab.path}
                className={`flex flex-col items-center justify-center min-w-[44px] min-h-[44px] rounded-lg px-2 transition-colors ${
                  active
                    ? 'text-rojo'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                <Icon className="w-5 h-5" />
                <span className="text-[10px] mt-0.5 leading-tight text-center">{tab.label}</span>
              </Link>
            );
          })}

          {/* "Más" button */}
          <button
            onClick={() => setDrawerOpen(true)}
            className={`flex flex-col items-center justify-center min-w-[44px] min-h-[44px] rounded-lg px-2 transition-colors ${
              drawerOpen ? 'text-rojo' : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            <MoreHorizontal className="w-5 h-5" />
            <span className="text-[10px] mt-0.5 leading-tight">Más</span>
          </button>
        </div>
      </nav>

      {/* Spacer for fixed bottom nav (so content isn't hidden) */}
      <div className="md:hidden h-16" />

      {/* "Más" drawer overlay */}
      {drawerOpen && (
        <div className="md:hidden fixed inset-0 z-50 flex flex-col justify-end">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/40"
            onClick={() => setDrawerOpen(false)}
          />

          {/* Drawer panel */}
          <div className="relative bg-white rounded-t-2xl shadow-xl px-4 pt-6 pb-8 animate-slide-up">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-semibold text-gray-900">Más opciones</h3>
              <button
                onClick={() => setDrawerOpen(false)}
                className="min-h-[44px] min-w-[44px] flex items-center justify-center text-gray-400 hover:text-gray-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-1">
              {moreItems.map((item) => {
                if (item.disabled) {
                  return (
                    <button
                      key={item.path}
                      disabled
                      className="w-full text-left px-4 py-3 rounded-lg text-sm font-medium text-gray-500 bg-gray-50 cursor-not-allowed min-h-[44px]"
                      title="Próximamente"
                    >
                      {item.label}
                      <span className="text-xs text-gray-400 ml-2">(Próximamente)</span>
                    </button>
                  );
                }
                const Icon = 'icon' in item ? item.icon : undefined;
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    onClick={() => setDrawerOpen(false)}
                    className="flex items-center gap-3 w-full text-left px-4 py-3 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-100 transition-colors min-h-[44px]"
                  >
                    {Icon && <Icon className="w-5 h-5 text-gray-400" />}
                    {item.label}
                  </Link>
                );
              })}
            </div>

            <hr className="my-4 border-gray-100" />

            <button
              onClick={handleLogout}
              className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-lg text-sm font-medium text-rojo hover:bg-rojo-claro transition-colors min-h-[44px]"
            >
              <LogOut className="w-4 h-4" />
              Cerrar sesión
            </button>
          </div>
        </div>
      )}
    </>
  );
}
