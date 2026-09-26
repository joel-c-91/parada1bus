import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { Plus, ArrowRightLeft } from 'lucide-react';
import api from '../../lib/api';
import DataTable from '../../components/admin/DataTable';
import type { Column } from '../../components/admin/DataTable';
import FormModal from '../../components/admin/FormModal';
import ConfirmDialog from '../../components/admin/ConfirmDialog';
import ChequeForm from '../../components/admin/forms/ChequeForm';
import type { ChequeFormData } from '../../components/admin/forms/ChequeForm';

interface PagoInfo {
  id: number;
  monto: string;
  fecha: string;
}

interface Cheque {
  id: number;
  cliente: number;
  cliente_nombre: string;
  numero: string;
  banco: string;
  monto: string;
  fecha_emision: string;
  fecha_vto: string | null;
  estado: string;
  estado_display: string;
  pago: number | null;
  pago_info: PagoInfo | null;
  notas: string;
}

interface PaginatedResponse<T> {
  count: number;
  results: T[];
}

const ESTADO_COLORS: Record<string, string> = {
  en_cartera: 'bg-blue-50 text-blue-700',
  depositado: 'bg-green-50 text-green-700',
  rechazado: 'bg-red-50 text-red-700',
  entregado: 'bg-gray-50 text-gray-700',
};

const TRANSICIONES: Record<string, { value: string; label: string }[]> = {
  en_cartera: [
    { value: 'depositado', label: 'Depositar' },
    { value: 'rechazado', label: 'Rechazar' },
    { value: 'entregado', label: 'Entregar' },
  ],
  depositado: [
    { value: 'rechazado', label: 'Rechazar' },
  ],
  rechazado: [
    { value: 'depositado', label: 'Re-depositar' },
  ],
  entregado: [],
};

export default function ChequesPage() {
  const queryClient = useQueryClient();
  const [modalOpen, setModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<Cheque | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Cheque | null>(null);
  const [transitionTarget, setTransitionTarget] = useState<{
    cheque: Cheque;
    nuevoEstado: string;
  } | null>(null);
  const [sortColumn, setSortColumn] = useState('fecha_emision');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');

  const { data, isLoading } = useQuery({
    queryKey: ['cheques'],
    queryFn: async () => {
      const res = await api.get<PaginatedResponse<Cheque>>('/admin/cheques/');
      return res.data.results;
    },
  });

  const createMutation = useMutation({
    mutationFn: async (formData: ChequeFormData) => {
      await api.post('/admin/cheques/', formData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cheques'] });
      toast.success('Cheque registrado correctamente');
      setModalOpen(false);
    },
    onError: (error: unknown) => {
      const message =
        error instanceof Error ? error.message : 'Error al registrar el cheque';
      toast.error(message);
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, data: formData }: { id: number; data: ChequeFormData }) => {
      await api.patch(`/admin/cheques/${id}/`, formData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cheques'] });
      toast.success('Cheque actualizado correctamente');
      setModalOpen(false);
      setEditingItem(null);
    },
    onError: (error: unknown) => {
      const message =
        error instanceof Error ? error.message : 'Error al actualizar el cheque';
      toast.error(message);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      await api.delete(`/admin/cheques/${id}/`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cheques'] });
      toast.success('Cheque eliminado correctamente');
      setDeleteTarget(null);
    },
    onError: (error: unknown) => {
      const message =
        error instanceof Error ? error.message : 'Error al eliminar el cheque';
      toast.error(message);
    },
  });

  const transitionMutation = useMutation({
    mutationFn: async ({ id, estado }: { id: number; estado: string }) => {
      await api.patch(`/admin/cheques/${id}/`, { estado });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cheques'] });
      toast.success('Estado del cheque actualizado');
      setTransitionTarget(null);
    },
    onError: (error: unknown) => {
      const message =
        error instanceof Error ? error.message : 'Error al actualizar el estado';
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

  const handleEdit = (item: Cheque) => {
    setEditingItem(item);
    setModalOpen(true);
  };

  const handleDelete = (item: Cheque) => {
    setDeleteTarget(item);
  };

  const handleTransition = (item: Cheque, nuevoEstado: string) => {
    setTransitionTarget({ cheque: item, nuevoEstado });
  };

  const handleSave = (formData: ChequeFormData) => {
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

  const confirmTransition = () => {
    if (!transitionTarget) return;
    transitionMutation.mutate({
      id: transitionTarget.cheque.id,
      estado: transitionTarget.nuevoEstado,
    });
  };

  const formatMonto = (monto: string) => {
    const num = parseFloat(monto);
    return new Intl.NumberFormat('es-AR', {
      style: 'currency',
      currency: 'ARS',
      minimumFractionDigits: 2,
    }).format(num);
  };

  const transicionLabel = (estado: string) => {
    const labels: Record<string, string> = {
      depositado: 'Depositar',
      rechazado: 'Rechazar',
      entregado: 'Entregar',
    };
    return labels[estado] ?? estado;
  };

  const columns: Column<Cheque>[] = [
    {
      key: 'numero',
      label: 'Número',
      sortable: true,
    },
    {
      key: 'cliente_nombre',
      label: 'Cliente',
      sortable: false,
      render: (item) => item.cliente_nombre,
    },
    {
      key: 'banco',
      label: 'Banco',
      sortable: true,
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
      key: 'fecha_emision',
      label: 'Fecha emisión',
      sortable: true,
      render: (item) => {
        const d = new Date(item.fecha_emision + 'T00:00:00');
        return d.toLocaleDateString('es-AR');
      },
    },
    {
      key: 'estado',
      label: 'Estado',
      sortable: true,
      render: (item) => (
        <span
          className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
            ESTADO_COLORS[item.estado] ?? 'bg-gray-50 text-gray-700'
          }`}
        >
          {item.estado_display}
        </span>
      ),
    },
    {
      key: '_actions',
      label: '',
      sortable: false,
      render: (item) => {
        const transiciones = TRANSICIONES[item.estado] ?? [];
        return (
          <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
            {transiciones.map((t) => (
              <button
                key={t.value}
                onClick={() => handleTransition(item, t.value)}
                className="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium text-francia hover:bg-francia-claro/20 rounded-lg transition-colors"
                title={t.label}
              >
                <ArrowRightLeft className="w-3 h-3" />
                {t.label}
              </button>
            ))}
          </div>
        );
      },
    },
  ];

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl font-bold text-gray-900">Cheques</h1>
        <button
          onClick={() => setModalOpen(true)}
          className="inline-flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-white bg-francia rounded-lg hover:bg-francia-claro transition-colors min-h-[44px]"
        >
          <Plus className="w-4 h-4" />
          Registrar cheque
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
        emptyActionLabel="Registrar cheque"
      />

      <FormModal
        open={modalOpen}
        onClose={handleCloseModal}
        title={editingItem ? 'Editar cheque' : 'Registrar cheque'}
      >
        <ChequeForm
          defaultValues={
            editingItem
              ? {
                  cliente: editingItem.cliente,
                  numero: editingItem.numero,
                  banco: editingItem.banco,
                  monto: parseFloat(editingItem.monto),
                  fecha_emision: editingItem.fecha_emision,
                  fecha_vto: editingItem.fecha_vto ?? undefined,
                  pago: editingItem.pago ?? undefined,
                  notas: editingItem.notas,
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
        title="¿Eliminar cheque?"
        message={`Se eliminará el cheque ${deleteTarget?.numero ?? ''} de ${deleteTarget ? formatMonto(deleteTarget.monto) : ''} de forma permanente.`}
        loading={deleteMutation.isPending}
      />

      <ConfirmDialog
        open={!!transitionTarget}
        onClose={() => setTransitionTarget(null)}
        onConfirm={confirmTransition}
        title={transitionTarget ? `${transicionLabel(transitionTarget.nuevoEstado)} cheque` : ''}
        message={
          transitionTarget
            ? `¿Cambiar estado del cheque ${transitionTarget.cheque.numero} de "${transitionTarget.cheque.estado_display}" a "${transicionLabel(transitionTarget.nuevoEstado)}"?`
            : ''
        }
        confirmLabel={transitionTarget ? transicionLabel(transitionTarget.nuevoEstado) : 'Confirmar'}
        destructive={transitionTarget?.nuevoEstado === 'rechazado'}
        loading={transitionMutation.isPending}
      />
    </div>
  );
}
