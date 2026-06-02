import { useState, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { Plus } from 'lucide-react';
import api from '../../lib/api';
import DataTable from '../../components/admin/DataTable';
import type { Column } from '../../components/admin/DataTable';
import FormModal from '../../components/admin/FormModal';
import ConfirmDialog from '../../components/admin/ConfirmDialog';
import DepartureForm from '../../components/admin/forms/DepartureForm';
import type { DepartureFormData } from '../../components/admin/forms/DepartureForm';

interface Ruta {
  id: number;
  nombre: string;
}

interface Vehiculo {
  id: number;
  nombre: string;
  activo: boolean;
}

interface Salida {
  id: number;
  ruta: number;
  ruta_nombre?: string;
  dia_semana: string;
  hora_salida: string;
  vehiculo: number;
  vehiculo_nombre?: string;
  precio_base: string;
  precio_promocional: string | null;
  promocion_activa: boolean;
  activo: boolean;
}

interface PaginatedResponse<T> {
  count: number;
  results: T[];
}

export default function DeparturesPage() {
  const queryClient = useQueryClient();
  const [modalOpen, setModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<Salida | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Salida | null>(null);
  const [sortColumn, setSortColumn] = useState('dia_semana');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  const [routeFilter, setRouteFilter] = useState('');

  // Fetch routes for the filter dropdown and the form
  const { data: routesData } = useQuery({
    queryKey: ['rutas'],
    queryFn: async () => {
      const res = await api.get<PaginatedResponse<Ruta>>('/admin/rutas/');
      return res.data.results;
    },
  });

  // Fetch vehicles for the form dropdown (filtered by the API)
  const { data: vehiclesData } = useQuery({
    queryKey: ['vehiculos'],
    queryFn: async () => {
      const res = await api.get<PaginatedResponse<Vehiculo>>('/admin/vehiculos/');
      return res.data.results;
    },
  });

  const { data, isLoading } = useQuery({
    queryKey: ['salidas'],
    queryFn: async () => {
      const res = await api.get<PaginatedResponse<Salida>>('/admin/salidas/');
      return res.data.results;
    },
  });

  const createMutation = useMutation({
    mutationFn: async (formData: DepartureFormData) => {
      await api.post('/admin/salidas/', formData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['salidas'] });
      toast.success('Salida creada correctamente');
      setModalOpen(false);
    },
    onError: (error: unknown) => {
      toast.error(error instanceof Error ? error.message : 'Error al crear la salida');
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, data: formData }: { id: number; data: DepartureFormData }) => {
      await api.patch(`/admin/salidas/${id}/`, formData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['salidas'] });
      toast.success('Salida actualizada correctamente');
      setModalOpen(false);
      setEditingItem(null);
    },
    onError: (error: unknown) => {
      toast.error(error instanceof Error ? error.message : 'Error al actualizar la salida');
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      await api.delete(`/admin/salidas/${id}/`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['salidas'] });
      toast.success('Salida eliminada correctamente');
      setDeleteTarget(null);
    },
    onError: (error: unknown) => {
      toast.error(error instanceof Error ? error.message : 'Error al eliminar la salida');
    },
  });

  // Build a map of route/vehicle names from the fetched data
  const routeNameMap = useMemo(() => {
    const map = new Map<number, string>();
    routesData?.forEach((r) => map.set(r.id, r.nombre));
    return map;
  }, [routesData]);

  const vehicleNameMap = useMemo(() => {
    const map = new Map<number, string>();
    vehiclesData?.forEach((v) => map.set(v.id, v.nombre));
    return map;
  }, [vehiclesData]);

  // Enrich salidas with resolved names and apply route filter
  const enrichedData = useMemo(() => {
    if (!data) return [];
    let items = data.map((s) => ({
      ...s,
      ruta_nombre: routeNameMap.get(s.ruta) ?? `Ruta #${s.ruta}`,
      vehiculo_nombre: vehicleNameMap.get(s.vehiculo) ?? `Vehículo #${s.vehiculo}`,
    }));

    if (routeFilter) {
      const filterId = Number(routeFilter);
      items = items.filter((s) => s.ruta === filterId);
    }

    return items.sort((a, b) => {
      const aVal = (a as Record<string, unknown>)[sortColumn];
      const bVal = (b as Record<string, unknown>)[sortColumn];
      if (aVal == null) return 1;
      if (bVal == null) return -1;
      const cmp = String(aVal).localeCompare(String(bVal), 'es', { numeric: true });
      return sortDirection === 'asc' ? cmp : -cmp;
    });
  }, [data, routeNameMap, vehicleNameMap, routeFilter, sortColumn, sortDirection]);

  const handleSort = (column: string) => {
    if (sortColumn === column) {
      setSortDirection((prev) => (prev === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortColumn(column);
      setSortDirection('asc');
    }
  };

  const handleSave = (formData: DepartureFormData) => {
    if (editingItem) {
      updateMutation.mutate({ id: editingItem.id, data: formData });
    } else {
      createMutation.mutate(formData);
    }
  };

  const handleCloseModal = () => {
    setModalOpen(false);
    setEditingItem(null);
  };

  // Active vehicles for the departure form dropdown
  const activeVehicles = useMemo(() => {
    return (vehiclesData ?? []).filter((v) => v.activo);
  }, [vehiclesData]);

  const routes = routesData ?? [];

  const columns: Column<Salida & { ruta_nombre?: string; vehiculo_nombre?: string }>[] = [
    {
      key: 'ruta_nombre',
      label: 'Ruta',
      sortable: true,
      render: (item) => item.ruta_nombre ?? `Ruta #${item.ruta}`,
    },
    {
      key: 'dia_semana',
      label: 'Día',
      sortable: true,
    },
    {
      key: 'hora_salida',
      label: 'Hora',
      sortable: true,
    },
    {
      key: 'vehiculo_nombre',
      label: 'Vehículo',
      sortable: true,
      render: (item) => item.vehiculo_nombre ?? `Vehículo #${item.vehiculo}`,
    },
    {
      key: 'precio_base',
      label: 'Precio base',
      sortable: true,
      render: (item) => `$${Number(item.precio_base).toLocaleString('es-AR')}`,
    },
    {
      key: 'precio_promocional',
      label: 'P. Promo',
      sortable: true,
      render: (item) =>
        item.precio_promocional
          ? `$${Number(item.precio_promocional).toLocaleString('es-AR')}`
          : '—',
    },
    {
      key: 'promocion_activa',
      label: 'Promo',
      sortable: true,
      render: (item) =>
        item.promocion_activa ? (
          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-yellow-50 text-yellow-700">
            Activa
          </span>
        ) : (
          <span className="text-gray-400">—</span>
        ),
    },
    {
      key: 'activo',
      label: 'Activo',
      sortable: true,
      render: (item) => (
        <span
          className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
            item.activo
              ? 'bg-green-50 text-green-700'
              : 'bg-red-50 text-red-700'
          }`}
        >
          {item.activo ? 'Sí' : 'No'}
        </span>
      ),
    },
  ];

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl font-bold text-gray-900">Salidas</h1>
        <button
          onClick={() => setModalOpen(true)}
          className="inline-flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-white bg-francia rounded-lg hover:bg-francia-claro transition-colors min-h-[44px]"
        >
          <Plus className="w-4 h-4" />
          Agregar salida
        </button>
      </div>

      {/* Route filter */}
      {routes.length > 0 && (
        <div className="mb-4">
          <label htmlFor="route-filter" className="block text-sm font-medium text-gray-700 mb-1">
            Filtrar por ruta
          </label>
          <select
            id="route-filter"
            value={routeFilter}
            onChange={(e) => setRouteFilter(e.target.value)}
            className="w-full md:w-64 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-francia focus:border-transparent"
          >
            <option value="">Todas las rutas</option>
            {routes.map((r) => (
              <option key={r.id} value={r.id}>
                {r.nombre}
              </option>
            ))}
          </select>
        </div>
      )}

      <DataTable
        columns={columns}
        data={enrichedData}
        loading={isLoading}
        sortColumn={sortColumn}
        sortDirection={sortDirection}
        onSort={handleSort}
        onEdit={(item) => {
          setEditingItem(item);
          setModalOpen(true);
        }}
        onDelete={(item) => setDeleteTarget(item)}
        keyExtractor={(item) => item.id}
        emptyAction={() => setModalOpen(true)}
        emptyActionLabel="Agregar salida"
      />

      <FormModal
        open={modalOpen}
        onClose={handleCloseModal}
        title={editingItem ? 'Editar salida' : 'Agregar salida'}
      >
        <DepartureForm
          defaultValues={
            editingItem
              ? {
                  ruta: editingItem.ruta,
                  dia_semana: editingItem.dia_semana as DepartureFormData['dia_semana'],
                  hora_salida: editingItem.hora_salida,
                  vehiculo: editingItem.vehiculo,
                  precio_base: Number(editingItem.precio_base),
                  precio_promocional: editingItem.precio_promocional
                    ? Number(editingItem.precio_promocional)
                    : null,
                  promocion_activa: editingItem.promocion_activa,
                  activo: editingItem.activo,
                }
              : undefined
          }
          onSave={handleSave}
          onCancel={handleCloseModal}
          loading={createMutation.isPending || updateMutation.isPending}
          routes={routes}
          vehicles={activeVehicles}
        />
      </FormModal>

      <ConfirmDialog
        open={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={() => deleteTarget && deleteMutation.mutate(deleteTarget.id)}
        title="¿Eliminar salida?"
        message={`Se eliminará la salida del ${deleteTarget?.dia_semana} a las ${deleteTarget?.hora_salida}. Esta acción no se puede deshacer.`}
        loading={deleteMutation.isPending}
      />
    </div>
  );
}
