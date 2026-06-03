import { useState, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { Plus } from 'lucide-react';
import api from '../../lib/api';
import DataTable from '../../components/admin/DataTable';
import type { Column } from '../../components/admin/DataTable';
import FormModal from '../../components/admin/FormModal';
import ConfirmDialog from '../../components/admin/ConfirmDialog';
import ServiceForm from '../../components/admin/forms/ServiceForm';
import type { ServiceFormData } from '../../components/admin/forms/ServiceForm';

interface Servicio {
  id: number;
  nombre: string;
  descripcion_corta: string;
  descripcion_larga: string;
  icono: string;
  imagen: string | null;
  activo: boolean;
  orden: number;
}

interface PaginatedResponse<T> {
  count: number;
  results: T[];
}

export default function ServicesPage() {
  const queryClient = useQueryClient();
  const [modalOpen, setModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<Servicio | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Servicio | null>(null);
  const [sortColumn, setSortColumn] = useState('orden');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');

  const { data, isLoading } = useQuery({
    queryKey: ['servicios'],
    queryFn: async () => {
      const res = await api.get<PaginatedResponse<Servicio>>('/admin/servicios/');
      return res.data.results;
    },
  });

  const createMutation = useMutation({
    mutationFn: async (formData: ServiceFormData | FormData) => {
      await api.post('/admin/servicios/', formData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['servicios'] });
      toast.success('Servicio creado correctamente');
      setModalOpen(false);
    },
    onError: (error: unknown) => {
      const message =
        error instanceof Error ? error.message : 'Error al crear el servicio';
      toast.error(message);
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, data: formData }: { id: number; data: ServiceFormData | FormData }) => {
      await api.patch(`/admin/servicios/${id}/`, formData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['servicios'] });
      toast.success('Servicio actualizado correctamente');
      setModalOpen(false);
      setEditingItem(null);
    },
    onError: (error: unknown) => {
      toast.error(error instanceof Error ? error.message : 'Error al actualizar el servicio');
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      await api.delete(`/admin/servicios/${id}/`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['servicios'] });
      toast.success('Servicio eliminado correctamente');
      setDeleteTarget(null);
    },
    onError: (error: unknown) => {
      toast.error(error instanceof Error ? error.message : 'Error al eliminar el servicio');
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

  const handleSave = (formData: ServiceFormData | FormData) => {
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

  const columns: Column<Servicio>[] = [
    { key: 'nombre', label: 'Nombre', sortable: true },
    {
      key: 'descripcion_corta',
      label: 'Descripción',
      sortable: true,
      render: (item) => (
        <span className="text-gray-500 max-w-[200px] truncate block">
          {item.descripcion_corta}
        </span>
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
    { key: 'orden', label: 'Orden', sortable: true },
  ];

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl font-bold text-gray-900">Servicios</h1>
        <button
          onClick={() => setModalOpen(true)}
          className="inline-flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-white bg-francia rounded-lg hover:bg-francia-claro transition-colors min-h-[44px]"
        >
          <Plus className="w-4 h-4" />
          Agregar servicio
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
        emptyActionLabel="Agregar servicio"
      />

      <FormModal
        open={modalOpen}
        onClose={handleCloseModal}
        title={editingItem ? 'Editar servicio' : 'Agregar servicio'}
      >
        <ServiceForm
          defaultValues={
            editingItem
              ? {
                  nombre: editingItem.nombre,
                  descripcion_corta: editingItem.descripcion_corta,
                  descripcion_larga: editingItem.descripcion_larga,
                  icono: editingItem.icono,
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
        title="¿Eliminar servicio?"
        message={`Se eliminará "${deleteTarget?.nombre}" de forma permanente. Esta acción no se puede deshacer.`}
        loading={deleteMutation.isPending}
      />
    </div>
  );
}
