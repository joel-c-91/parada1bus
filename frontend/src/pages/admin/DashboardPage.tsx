import { useQuery } from '@tanstack/react-query';
import { LayoutDashboard, Truck, ClipboardList, Map, CalendarClock, Loader2 } from 'lucide-react';
import api from '../../lib/api';

interface Vehiculo {
  id: number;
}

interface Servicio {
  id: number;
}

interface Ruta {
  id: number;
}

interface Salida {
  id: number;
}

interface PaginatedResponse<T> {
  count: number;
  results: T[];
}

function StatCard({
  icon: Icon,
  label,
  value,
  loading,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: number | string;
  loading: boolean;
}) {
  return (
    <div className="rounded-xl p-4 md:p-5 bg-white border border-gray-200 hover:shadow-sm transition-shadow">
      <div className="flex items-center gap-3 mb-3">
        <div className="w-10 h-10 rounded-lg bg-gray-50 flex items-center justify-center">
          <Icon className="w-5 h-5 text-francia" />
        </div>
        <span className="text-sm font-medium text-gray-500">{label}</span>
      </div>
      <p className="text-2xl md:text-3xl font-bold text-gray-900">
        {loading ? (
          <Loader2 className="w-6 h-6 animate-spin text-gray-300" />
        ) : (
          value
        )}
      </p>
    </div>
  );
}

export default function DashboardPage() {
  const vehiculosQuery = useQuery({
    queryKey: ['dashboard-vehiculos'],
    queryFn: async () => {
      const res = await api.get<PaginatedResponse<Vehiculo>>('/admin/vehiculos/');
      return res.data.count;
    },
  });

  const serviciosQuery = useQuery({
    queryKey: ['dashboard-servicios'],
    queryFn: async () => {
      const res = await api.get<PaginatedResponse<Servicio>>('/admin/servicios/');
      return res.data.count;
    },
  });

  const rutasQuery = useQuery({
    queryKey: ['dashboard-rutas'],
    queryFn: async () => {
      const res = await api.get<PaginatedResponse<Ruta>>('/admin/rutas/');
      return res.data.count;
    },
  });

  const salidasQuery = useQuery({
    queryKey: ['dashboard-salidas'],
    queryFn: async () => {
      const res = await api.get<PaginatedResponse<Salida>>('/admin/salidas/');
      return res.data.count;
    },
  });

  const cards = [
    { icon: LayoutDashboard, label: 'Dashboard', value: vehiculosQuery.isLoading ? '—' : vehiculosQuery.data ?? '—' },
    { icon: Truck, label: 'Vehículos', value: vehiculosQuery.isLoading ? '—' : vehiculosQuery.data ?? '—' },
    { icon: ClipboardList, label: 'Servicios', value: serviciosQuery.isLoading ? '—' : serviciosQuery.data ?? '—' },
    { icon: Map, label: 'Rutas', value: rutasQuery.isLoading ? '—' : rutasQuery.data ?? '—' },
    { icon: CalendarClock, label: 'Salidas', value: salidasQuery.isLoading ? '—' : salidasQuery.data ?? '—' },
  ];

  return (
    <div>
      <h1 className="text-xl font-bold text-gray-900 mb-6">Dashboard</h1>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
        {cards.map((card) => (
          <StatCard
            key={card.label}
            icon={card.icon}
            label={card.label}
            value={card.value}
            loading={
              (card.label === 'Dashboard' || card.label === 'Vehículos')
                ? vehiculosQuery.isLoading
                : card.label === 'Servicios'
                  ? serviciosQuery.isLoading
                  : card.label === 'Rutas'
                    ? rutasQuery.isLoading
                    : salidasQuery.isLoading
            }
          />
        ))}
      </div>
    </div>
  );
}
