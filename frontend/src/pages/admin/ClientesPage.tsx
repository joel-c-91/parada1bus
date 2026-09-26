import { useState, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { Plus, Eye, Bus, Calendar } from 'lucide-react';
import api from '../../lib/api';
import DataTable from '../../components/admin/DataTable';
import type { Column } from '../../components/admin/DataTable';
import FormModal from '../../components/admin/FormModal';
import ConfirmDialog from '../../components/admin/ConfirmDialog';
import ClientForm from '../../components/admin/forms/ClientForm';
import type { ClientFormData } from '../../components/admin/forms/ClientForm';

interface ReservaViaje {
  id: number;
  fecha_viaje: string;
  origen: string | null;
  destino: string | null;
  estado: string;
  codigo: string;
}

interface CharterViaje {
  id: number;
  origen: string;
  destino: string;
  fecha_viaje: string;
  estado: string;
}

interface Cliente {
  id: number;
  nombre: string;
  email: string;
  telefono: string;
  direccion: string;
  notas: string;
  creado: string;
  actualizado: string;
  reserva_set: ReservaViaje[];
  solicitudcharter_set: CharterViaje[];
}

interface PaginatedResponse<T> {
  count: number;
  results: T[];
}

export default function ClientesPage() {
  const queryClient = useQueryClient();
  const [modalOpen, setModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<Cliente | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Cliente | null>(null);
  const [travelViewTarget, setTravelViewTarget] = useState<Cliente | null>(null);
  const [sortColumn, setSortColumn] = useState('creado');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');

  const { data, isLoading } = useQuery({
    queryKey: ['clientes'],
    queryFn: async () => {
      const res = await api.get<PaginatedResponse<Cliente>>('/admin/clientes/');
      return res.data.results;
    },
  });

  const createMutation = useMutation({
    mutationFn: async (formData: ClientFormData) => {
      await api.post('/admin/clientes/', formData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['clientes'] });
      toast.success('Cliente creado correctamente');
      setModalOpen(false);
    },
    onError: (error: unknown) => {
      const message =
        error instanceof Error ? error.message : 'Error al crear el cliente';
      toast.error(message);
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, data: formData }: { id: number; data: ClientFormData }) => {
      await api.patch(`/admin/clientes/${id}/`, formData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['clientes'] });
      toast.success('Cliente actualizado correctamente');
      setModalOpen(false);
      setEditingItem(null);
    },
    onError: (error: unknown) => {
      const message =
        error instanceof Error ? error.message : 'Error al actualizar el cliente';
      toast.error(message);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      await api.delete(`/admin/clientes/${id}/`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['clientes'] });
      toast.success('Cliente eliminado correctamente');
      setDeleteTarget(null);
    },
    onError: (error: unknown) => {
      const message =
        error instanceof Error ? error.message : 'Error al eliminar el cliente';
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

  const handleEdit = (item: Cliente) => {
    setEditingItem(item);
    setModalOpen(true);
  };

  const handleDelete = (item: Cliente) => {
    setDeleteTarget(item);
  };

  const handleSave = (formData: ClientFormData) => {
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

  const handleViewTravel = (item: Cliente) => {
    setTravelViewTarget(item);
  };

  const estadoBadge = (estado: string) => {
    const colors: Record<string, string> = {
      pendiente: 'bg-yellow-50 text-yellow-700',
      confirmada: 'bg-green-50 text-green-700',
      cancelada: 'bg-red-50 text-red-700',
      completada: 'bg-blue-50 text-blue-700',
      cotizado: 'bg-purple-50 text-purple-700',
      aceptado: 'bg-green-50 text-green-700',
      rechazado: 'bg-red-50 text-red-700',
      cancelado: 'bg-gray-50 text-gray-700',
    };
    return (
      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${colors[estado] ?? 'bg-gray-50 text-gray-700'}`}>
        {estado.charAt(0).toUpperCase() + estado.slice(1)}
      </span>
    );
  };

  const columns: Column<Cliente>[] = [
    { key: 'nombre', label: 'Nombre', sortable: true },
    { key: 'email', label: 'Email', sortable: true },
    { key: 'telefono', label: 'Teléfono', sortable: true },
    {
      key: 'viajes',
      label: 'Viajes',
      sortable: false,
      render: (item) => {
        const total = item.reserva_set.length + item.solicitudcharter_set.length;
        return (
          <span className="text-gray-500">{total} viaje{total !== 1 ? 's' : ''}</span>
        );
      },
    },
    {
      key: 'creado',
      label: 'Creado',
      sortable: true,
      render: (item) => {
        const date = new Date(item.creado);
        return date.toLocaleDateString('es-AR');
      },
    },
    {
      key: '_actions',
      label: '',
      sortable: false,
      render: (item) => (
        <button
          onClick={(e) => {
            e.stopPropagation();
            handleViewTravel(item);
          }}
          className="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium text-francia hover:bg-francia-claro/20 rounded-lg transition-colors"
          title="Ver viajes"
        >
          <Eye className="w-3.5 h-3.5" />
          Ver viajes
        </button>
      ),
    },
  ];

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl font-bold text-gray-900">Clientes</h1>
        <button
          onClick={() => setModalOpen(true)}
          className="inline-flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-white bg-francia rounded-lg hover:bg-francia-claro transition-colors min-h-[44px]"
        >
          <Plus className="w-4 h-4" />
          Agregar cliente
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
        emptyActionLabel="Agregar cliente"
      />

      <FormModal
        open={modalOpen}
        onClose={handleCloseModal}
        title={editingItem ? 'Editar cliente' : 'Agregar cliente'}
      >
        <ClientForm
          defaultValues={
            editingItem
              ? {
                  nombre: editingItem.nombre,
                  email: editingItem.email,
                  telefono: editingItem.telefono,
                  direccion: editingItem.direccion,
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
        title="¿Eliminar cliente?"
        message={`Se eliminará "${deleteTarget?.nombre}" de forma permanente. Esta acción no se puede deshacer.`}
        loading={deleteMutation.isPending}
      />

      {/* Travel History Modal */}
      <FormModal
        open={!!travelViewTarget}
        onClose={() => setTravelViewTarget(null)}
        title={`Viajes de ${travelViewTarget?.nombre ?? ''}`}
      >
        {travelViewTarget && (
          <div className="space-y-6">
            {/* Reservas */}
            <div>
              <h3 className="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2">
                <Bus className="w-4 h-4 text-francia" />
                Reservas ({travelViewTarget.reserva_set.length})
              </h3>
              {travelViewTarget.reserva_set.length === 0 ? (
                <p className="text-sm text-gray-400 italic">Sin reservas</p>
              ) : (
                <div className="space-y-2">
                  {travelViewTarget.reserva_set.map((r) => (
                    <div
                      key={r.id}
                      className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                    >
                      <div className="min-w-0">
                        <p className="text-sm font-medium text-gray-900 truncate">
                          {r.origen && r.destino
                            ? `${r.origen} → ${r.destino}`
                            : r.codigo}
                        </p>
                        <div className="flex items-center gap-2 text-xs text-gray-500 mt-0.5">
                          <Calendar className="w-3 h-3" />
                          {new Date(r.fecha_viaje).toLocaleDateString('es-AR')}
                          <span className="text-gray-300">|</span>
                          <span className="text-gray-400">{r.codigo}</span>
                        </div>
                      </div>
                      {estadoBadge(r.estado)}
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Solicitudes Charter */}
            <div>
              <h3 className="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2">
                <Bus className="w-4 h-4 text-francia" />
                Solicitudes de viaje ({travelViewTarget.solicitudcharter_set.length})
              </h3>
              {travelViewTarget.solicitudcharter_set.length === 0 ? (
                <p className="text-sm text-gray-400 italic">Sin solicitudes</p>
              ) : (
                <div className="space-y-2">
                  {travelViewTarget.solicitudcharter_set.map((s) => (
                    <div
                      key={s.id}
                      className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                    >
                      <div className="min-w-0">
                        <p className="text-sm font-medium text-gray-900 truncate">
                          {s.origen} → {s.destino}
                        </p>
                        <div className="flex items-center gap-2 text-xs text-gray-500 mt-0.5">
                          <Calendar className="w-3 h-3" />
                          {new Date(s.fecha_viaje).toLocaleDateString('es-AR')}
                        </div>
                      </div>
                      {estadoBadge(s.estado)}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </FormModal>
    </div>
  );
}
