import { useState, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { Plus } from 'lucide-react';
import api from '../../lib/api';
import DataTable from '../../components/admin/DataTable';
import type { Column } from '../../components/admin/DataTable';
import FormModal from '../../components/admin/FormModal';
import ConfirmDialog from '../../components/admin/ConfirmDialog';
import FleetForm from '../../components/admin/forms/FleetForm';
import type { FleetFormData } from '../../components/admin/forms/FleetForm';

interface Vehiculo {
  id: number;
  nombre: string;
  tipo: string;
  capacidad: number;
  patente: string;
  descripcion: string;
  imagen: string | null;
  activo: boolean;
  orden: number;
}

interface PaginatedResponse<T> {
  count: number;
  results: T[];
}

export default function FleetPage() {
  const queryClient = useQueryClient();
  const [modalOpen, setModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<Vehiculo | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Vehiculo | null>(null);
  const [sortColumn, setSortColumn] = useState('orden');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');

  const { data, isLoading } = useQuery({
    queryKey: ['vehiculos'],
    queryFn: async () => {
      const res = await api.get<PaginatedResponse<Vehiculo>>('/admin/vehiculos/');
      return res.data.results;
    },
  });

  const createMutation = useMutation({
    mutationFn: async (formData: FleetFormData | FormData) => {
      await api.post('/admin/vehiculos/', formData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['vehiculos'] });
      toast.success('Vehículo creado correctamente');
      setModalOpen(false);
    },
    onError: (error: unknown) => {
      const message =
        error instanceof Error ? error.message : 'Error al crear el vehículo';
      toast.error(message);
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, data: formData }: { id: number; data: FleetFormData | FormData }) => {
      await api.patch(`/admin/vehiculos/${id}/`, formData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['vehiculos'] });
      toast.success('Vehículo actualizado correctamente');
      setModalOpen(false);
      setEditingItem(null);
    },
    onError: (error: unknown) => {
      const message =
        error instanceof Error ? error.message : 'Error al actualizar el vehículo';
      toast.error(message);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      await api.delete(`/admin/vehiculos/${id}/`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['vehiculos'] });
      toast.success('Vehículo eliminado correctamente');
      setDeleteTarget(null);
    },
    onError: (error: unknown) => {
      const message =
        error instanceof Error ? error.message : 'Error al eliminar el vehículo';
      toast.error(message);
    },
  });

  const sortedData = useMemo(() => {
    if (!data) return [];
    return [...data].sort((a, b) => {
      const aVal = (a as unknown as Record<string, unknown>)[sortColumn];
      const bVal = (b as unknown as Record<string, unknown>)[sortColumn];
      if (aVal == null) return 1;
      if (bVal == null) return -1;
      const cmp = String(aVal).localeCompare(String(bVal), 'es', { numeric: true });
      return sortDirection === 'asc' ? cmp : -cmp;
    });
  }, [data, sortColumn, sortDirection]);

  const handleSort = (column: string) => {
    if (sortColumn === column) {
      setSortDirection((prev) => (prev === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortColumn(column);
      setSortDirection('asc');
    }
  };

  const handleEdit = (item: Vehiculo) => {
    setEditingItem(item);
    setModalOpen(true);
  };

  const handleDelete = (item: Vehiculo) => {
    setDeleteTarget(item);
  };

  const handleSave = (formData: FleetFormData | FormData) => {
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

  const columns: Column<Vehiculo>[] = [
    { key: 'nombre', label: 'Nombre', sortable: true },
    {
      key: 'tipo',
      label: 'Tipo',
      sortable: true,
      render: (item) => {
        const labels: Record<string, string> = { van: 'Van', minibus: 'Minibús', bus: 'Bus' };
        return labels[item.tipo] ?? item.tipo;
      },
    },
    { key: 'capacidad', label: 'Capacidad', sortable: true },
    { key: 'patente', label: 'Patente', sortable: true },
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
    { key: 'orden', label: 'Orden', sortable: true },
  ];

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl font-bold text-gray-900">Flota</h1>
        <button
          onClick={() => setModalOpen(true)}
          className="inline-flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-white bg-francia rounded-lg hover:bg-francia-claro transition-colors min-h-[44px]"
        >
          <Plus className="w-4 h-4" />
          Agregar vehículo
        </button>
      </div>

      <DataTable
        columns={columns}
        data={sortedData}
        loading={isLoading}
        sortColumn={sortColumn}
        sortDirection={sortDirection}
        onSort={handleSort}
        onEdit={handleEdit}
        onDelete={handleDelete}
        keyExtractor={(item) => item.id}
        emptyAction={() => setModalOpen(true)}
        emptyActionLabel="Agregar vehículo"
      />

      <FormModal
        open={modalOpen}
        onClose={handleCloseModal}
        title={editingItem ? 'Editar vehículo' : 'Agregar vehículo'}
      >
        <FleetForm
          defaultValues={
            editingItem
              ? {
                  nombre: editingItem.nombre,
                  tipo: editingItem.tipo as 'van' | 'minibus' | 'bus',
                  capacidad: editingItem.capacidad,
                  patente: editingItem.patente,
                  descripcion: editingItem.descripcion,
                  activo: editingItem.activo,
                  orden: editingItem.orden,
                }
              : undefined
          }
          imagenUrl={editingItem?.imagen}
          onSave={handleSave}
          onCancel={handleCloseModal}
          loading={createMutation.isPending || updateMutation.isPending}
        />
      </FormModal>

      <ConfirmDialog
        open={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={() => deleteTarget && deleteMutation.mutate(deleteTarget.id)}
        title="¿Eliminar vehículo?"
        message={`Se eliminará "${deleteTarget?.nombre}" de forma permanente. Esta acción no se puede deshacer.`}
        loading={deleteMutation.isPending}
      />
    </div>
  );
}
