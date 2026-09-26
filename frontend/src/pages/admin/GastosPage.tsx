import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { Plus, Filter } from 'lucide-react';
import api from '../../lib/api';
import DataTable from '../../components/admin/DataTable';
import type { Column } from '../../components/admin/DataTable';
import FormModal from '../../components/admin/FormModal';
import ConfirmDialog from '../../components/admin/ConfirmDialog';
import GastoForm from '../../components/admin/forms/GastoForm';
import type { GastoFormData } from '../../components/admin/forms/GastoForm';

interface Gasto {
  id: number;
  categoria: number;
  categoria_nombre: string;
  monto: string;
  fecha: string;
  descripcion: string;
  proveedor: string;
  comprobante: string | null;
  comprobante_url: string | null;
}

interface PaginatedResponse<T> {
  count: number;
  results: T[];
}

export default function GastosPage() {
  const queryClient = useQueryClient();
  const [modalOpen, setModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<Gasto | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Gasto | null>(null);
  const [sortColumn, setSortColumn] = useState('fecha');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');
  const [fechaDesde, setFechaDesde] = useState('');
  const [fechaHasta, setFechaHasta] = useState('');
  const [showFilters, setShowFilters] = useState(false);

  const { data, isLoading } = useQuery({
    queryKey: ['gastos'],
    queryFn: async () => {
      const params: Record<string, string> = {};
      if (fechaDesde) params.fecha_desde = fechaDesde;
      if (fechaHasta) params.fecha_hasta = fechaHasta;
      const res = await api.get<PaginatedResponse<Gasto>>('/admin/gastos/', { params });
      return res.data.results;
    },
  });

  const createMutation = useMutation({
    mutationFn: async (formData: GastoFormData | FormData) => {
      await api.post('/admin/gastos/', formData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['gastos'] });
      toast.success('Gasto registrado correctamente');
      setModalOpen(false);
    },
    onError: (error: unknown) => {
      const message =
        error instanceof Error ? error.message : 'Error al registrar el gasto';
      toast.error(message);
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, data: formData }: { id: number; data: GastoFormData | FormData }) => {
      await api.patch(`/admin/gastos/${id}/`, formData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['gastos'] });
      toast.success('Gasto actualizado correctamente');
      setModalOpen(false);
      setEditingItem(null);
    },
    onError: (error: unknown) => {
      const message =
        error instanceof Error ? error.message : 'Error al actualizar el gasto';
      toast.error(message);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      await api.delete(`/admin/gastos/${id}/`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['gastos'] });
      toast.success('Gasto eliminado correctamente');
      setDeleteTarget(null);
    },
    onError: (error: unknown) => {
      const message =
        error instanceof Error ? error.message : 'Error al eliminar el gasto';
      toast.error(message);
    },
  });

  const sortedData = (data ?? []).sort((a, b) => {
    const aVal = (a as unknown as Record<string, unknown>)[sortColumn];
    const bVal = (b as unknown as Record<string, unknown>)[sortColumn];
    if (aVal == null) return 1;
    if (bVal == null) return -1;
    const cmp = String(aVal).localeCompare(String(bVal), 'es', { numeric: true });
    return sortDirection === 'asc' ? cmp : -cmp;
  });

  const handleSort = (column: string) => {
    if (sortColumn === column) {
      setSortDirection((prev) => (prev === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortColumn(column);
      setSortDirection('asc');
    }
  };

  const handleEdit = (item: Gasto) => {
    setEditingItem(item);
    setModalOpen(true);
  };

  const handleDelete = (item: Gasto) => {
    setDeleteTarget(item);
  };

  const handleSave = (formData: GastoFormData | FormData) => {
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

  const formatMonto = (monto: string) => {
    const num = parseFloat(monto);
    return new Intl.NumberFormat('es-AR', {
      style: 'currency',
      currency: 'ARS',
      minimumFractionDigits: 2,
    }).format(num);
  };

  const columns: Column<Gasto>[] = [
    {
      key: 'categoria_nombre',
      label: 'Categoría',
      sortable: true,
      render: (item) => (
        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-francia-claro text-francia">
          {item.categoria_nombre}
        </span>
      ),
    },
    {
      key: 'monto',
      label: 'Monto',
      sortable: true,
      render: (item) => (
        <span className="font-medium text-gray-900">{formatMonto(item.monto)}</span>
      ),
    },
    {
      key: 'fecha',
      label: 'Fecha',
      sortable: true,
      render: (item) => {
        const d = new Date(item.fecha + 'T00:00:00');
        return d.toLocaleDateString('es-AR');
      },
    },
    {
      key: 'proveedor',
      label: 'Proveedor',
      sortable: true,
      render: (item) => item.proveedor || '—',
    },
    {
      key: 'descripcion',
      label: 'Descripción',
      sortable: false,
      render: (item) => (
        <span className="text-gray-500 max-w-[200px] truncate block">
          {item.descripcion || '—'}
        </span>
      ),
    },
  ];

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl font-bold text-gray-900">Gastos</h1>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`inline-flex items-center gap-2 px-3 py-2.5 text-sm font-medium rounded-lg border transition-colors min-h-[44px] ${
              showFilters
                ? 'bg-francia text-white border-francia'
                : 'text-gray-600 border-gray-300 hover:bg-gray-50'
            }`}
          >
            <Filter className="w-4 h-4" />
            Filtros
          </button>
          <button
            onClick={() => setModalOpen(true)}
            className="inline-flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-white bg-francia rounded-lg hover:bg-francia-claro transition-colors min-h-[44px]"
          >
            <Plus className="w-4 h-4" />
            Registrar gasto
          </button>
        </div>
      </div>

      {/* Date range filters */}
      {showFilters && (
        <div className="mb-4 p-4 bg-gray-50 rounded-xl border border-gray-200">
          <div className="flex flex-wrap items-end gap-4">
            <div>
              <label htmlFor="fecha-desde" className="block text-xs font-medium text-gray-500 mb-1">
                Fecha desde
              </label>
              <input
                id="fecha-desde"
                type="date"
                value={fechaDesde}
                onChange={(e) => setFechaDesde(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-francia focus:border-transparent"
              />
            </div>
            <div>
              <label htmlFor="fecha-hasta" className="block text-xs font-medium text-gray-500 mb-1">
                Fecha hasta
              </label>
              <input
                id="fecha-hasta"
                type="date"
                value={fechaHasta}
                onChange={(e) => setFechaHasta(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-francia focus:border-transparent"
              />
            </div>
            {(fechaDesde || fechaHasta) && (
              <button
                onClick={() => {
                  setFechaDesde('');
                  setFechaHasta('');
                }}
                className="px-3 py-2 text-sm text-gray-600 hover:text-gray-900 min-h-[44px]"
              >
                Limpiar filtros
              </button>
            )}
          </div>
        </div>
      )}

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
        emptyActionLabel="Registrar gasto"
      />

      <FormModal
        open={modalOpen}
        onClose={handleCloseModal}
        title={editingItem ? 'Editar gasto' : 'Registrar gasto'}
      >
        <GastoForm
          defaultValues={
            editingItem
              ? {
                  categoria: editingItem.categoria,
                  monto: parseFloat(editingItem.monto),
                  fecha: editingItem.fecha,
                  descripcion: editingItem.descripcion,
                  proveedor: editingItem.proveedor,
                }
              : undefined
          }
          comprobanteUrl={editingItem?.comprobante_url}
          onSave={handleSave}
          onCancel={handleCloseModal}
          loading={createMutation.isPending || updateMutation.isPending}
        />
      </FormModal>

      <ConfirmDialog
        open={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={() => deleteTarget && deleteMutation.mutate(deleteTarget.id)}
        title="¿Eliminar gasto?"
        message={`Se eliminará el gasto de ${deleteTarget ? formatMonto(deleteTarget.monto) : ''} de forma permanente.`}
        loading={deleteMutation.isPending}
      />
    </div>
  );
}
