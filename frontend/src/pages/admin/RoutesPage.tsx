import { useState, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { Plus } from 'lucide-react';
import api from '../../lib/api';
import DataTable from '../../components/admin/DataTable';
import type { Column } from '../../components/admin/DataTable';
import FormModal from '../../components/admin/FormModal';
import ConfirmDialog from '../../components/admin/ConfirmDialog';
import RouteForm from '../../components/admin/forms/RouteForm';
import type { RouteFormData } from '../../components/admin/forms/RouteForm';

interface Ruta {
  id: number;
  nombre: string;
  origen: string;
  destino: string;
  duracion_estimada: string;
  descripcion: string;
  activo: boolean;
  orden: number;
}

interface PaginatedResponse<T> {
  count: number;
  results: T[];
}

export default function RoutesPage() {
  const queryClient = useQueryClient();
  const [modalOpen, setModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<Ruta | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Ruta | null>(null);
  const [sortColumn, setSortColumn] = useState('orden');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');

  const { data, isLoading } = useQuery({
    queryKey: ['rutas'],
    queryFn: async () => {
      const res = await api.get<PaginatedResponse<Ruta>>('/admin/rutas/');
      return res.data.results;
    },
  });

  const createMutation = useMutation({
    mutationFn: async (formData: RouteFormData) => {
      await api.post('/admin/rutas/', formData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['rutas'] });
      toast.success('Ruta creada correctamente');
      setModalOpen(false);
    },
    onError: (error: unknown) => {
      toast.error(error instanceof Error ? error.message : 'Error al crear la ruta');
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, data: formData }: { id: number; data: RouteFormData }) => {
      await api.patch(`/admin/rutas/${id}/`, formData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['rutas'] });
      toast.success('Ruta actualizada correctamente');
      setModalOpen(false);
      setEditingItem(null);
    },
    onError: (error: unknown) => {
      toast.error(error instanceof Error ? error.message : 'Error al actualizar la ruta');
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      await api.delete(`/admin/rutas/${id}/`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['rutas'] });
      toast.success('Ruta eliminada correctamente');
      setDeleteTarget(null);
    },
    onError: (error: unknown) => {
      toast.error(error instanceof Error ? error.message : 'Error al eliminar la ruta');
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

  const handleSave = (formData: RouteFormData) => {
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

  const columns: Column<Ruta>[] = [
    { key: 'nombre', label: 'Nombre', sortable: true },
    { key: 'origen', label: 'Origen', sortable: true },
    { key: 'destino', label: 'Destino', sortable: true },
    { key: 'duracion_estimada', label: 'Duración', sortable: true },
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
        <h1 className="text-xl font-bold text-gray-900">Rutas</h1>
        <button
          onClick={() => setModalOpen(true)}
          className="inline-flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-white bg-francia rounded-lg hover:bg-francia-claro transition-colors min-h-[44px]"
        >
          <Plus className="w-4 h-4" />
          Agregar ruta
        </button>
      </div>

      <DataTable
        columns={columns}
        data={sortedData}
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
        emptyActionLabel="Agregar ruta"
      />

      <FormModal
        open={modalOpen}
        onClose={handleCloseModal}
        title={editingItem ? 'Editar ruta' : 'Agregar ruta'}
      >
        <RouteForm
          defaultValues={
            editingItem
              ? {
                  nombre: editingItem.nombre,
                  origen: editingItem.origen,
                  destino: editingItem.destino,
                  duracion_estimada: editingItem.duracion_estimada,
                  descripcion: editingItem.descripcion,
                  activo: editingItem.activo,
                  orden: editingItem.orden,
                }
              : undefined
          }
          onSave={handleSave}
          onCancel={handleCloseModal}
          loading={createMutation.isPending || updateMutation.isPending}
        />
      </FormModal>

      <ConfirmDialog
        open={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={() => deleteTarget && deleteMutation.mutate(deleteTarget.id)}
        title="¿Eliminar ruta?"
        message={`Se eliminará "${deleteTarget?.nombre}" y todas sus salidas asociadas. Esta acción no se puede deshacer.`}
        loading={deleteMutation.isPending}
      />
    </div>
  );
}
