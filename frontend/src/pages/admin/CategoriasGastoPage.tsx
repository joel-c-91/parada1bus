import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { Plus } from 'lucide-react';
import api from '../../lib/api';
import DataTable from '../../components/admin/DataTable';
import type { Column } from '../../components/admin/DataTable';
import FormModal from '../../components/admin/FormModal';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import type { Resolver } from 'react-hook-form';
import { z } from 'zod';

interface CategoriaGasto {
  id: number;
  nombre: string;
  descripcion: string;
}

interface PaginatedResponse<T> {
  count: number;
  results: T[];
}

const categoriaSchema = z.object({
  nombre: z.string().min(1, 'El nombre es requerido'),
  descripcion: z.string().optional(),
});

type CategoriaFormData = z.infer<typeof categoriaSchema>;

function CategoriaForm({
  defaultValues,
  onSave,
  onCancel,
  loading,
}: {
  defaultValues?: Partial<CategoriaFormData>;
  onSave: (data: CategoriaFormData) => void;
  onCancel: () => void;
  loading?: boolean;
}) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<CategoriaFormData>({
    resolver: zodResolver(categoriaSchema) as unknown as Resolver<CategoriaFormData>,
    defaultValues: {
      nombre: '',
      descripcion: '',
      ...defaultValues,
    },
  });

  return (
    <form onSubmit={handleSubmit(onSave)} className="space-y-4">
      <div>
        <label htmlFor="nombre" className="block text-sm font-medium text-gray-700 mb-1">
          Nombre <span className="text-rojo">*</span>
        </label>
        <input
          id="nombre"
          type="text"
          className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-francia focus:border-transparent"
          placeholder="Ej: Combustible"
          {...register('nombre')}
        />
        {errors.nombre && (
          <p className="text-rojo text-xs mt-1">{errors.nombre.message}</p>
        )}
      </div>

      <div>
        <label htmlFor="descripcion" className="block text-sm font-medium text-gray-700 mb-1">
          Descripción
        </label>
        <textarea
          id="descripcion"
          rows={3}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-francia focus:border-transparent resize-none"
          placeholder="Descripción opcional..."
          {...register('descripcion')}
        />
      </div>

      <div className="flex gap-3 justify-end pt-4 border-t border-gray-100">
        <button
          type="button"
          onClick={onCancel}
          disabled={loading}
          className="px-4 py-2.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50 min-h-[44px]"
        >
          Cancelar
        </button>
        <button
          type="submit"
          disabled={loading}
          className="px-4 py-2.5 text-sm font-medium text-white bg-francia rounded-lg hover:bg-francia-claro transition-colors disabled:opacity-50 min-h-[44px]"
        >
          {loading ? 'Guardando...' : 'Guardar'}
        </button>
      </div>
    </form>
  );
}

export default function CategoriasGastoPage() {
  const queryClient = useQueryClient();
  const [modalOpen, setModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<CategoriaGasto | null>(null);

  const { data, isLoading } = useQuery({
    queryKey: ['categorias-gasto'],
    queryFn: async () => {
      const res = await api.get<PaginatedResponse<CategoriaGasto>>('/admin/categorias-gasto/');
      return res.data.results;
    },
  });

  const createMutation = useMutation({
    mutationFn: async (formData: CategoriaFormData) => {
      await api.post('/admin/categorias-gasto/', formData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categorias-gasto'] });
      toast.success('Categoría creada correctamente');
      setModalOpen(false);
    },
    onError: (error: unknown) => {
      const message =
        error instanceof Error ? error.message : 'Error al crear la categoría';
      toast.error(message);
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, data: formData }: { id: number; data: CategoriaFormData }) => {
      await api.patch(`/admin/categorias-gasto/${id}/`, formData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categorias-gasto'] });
      toast.success('Categoría actualizada correctamente');
      setModalOpen(false);
      setEditingItem(null);
    },
    onError: (error: unknown) => {
      const message =
        error instanceof Error ? error.message : 'Error al actualizar la categoría';
      toast.error(message);
    },
  });

  const handleEdit = (item: CategoriaGasto) => {
    setEditingItem(item);
    setModalOpen(true);
  };

  const handleSave = (formData: CategoriaFormData) => {
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

  const columns: Column<CategoriaGasto>[] = [
    { key: 'nombre', label: 'Nombre', sortable: true },
    {
      key: 'descripcion',
      label: 'Descripción',
      sortable: false,
      render: (item) => item.descripcion || '—',
    },
  ];

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl font-bold text-gray-900">Categorías de Gasto</h1>
        <button
          onClick={() => setModalOpen(true)}
          className="inline-flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-white bg-francia rounded-lg hover:bg-francia-claro transition-colors min-h-[44px]"
        >
          <Plus className="w-4 h-4" />
          Agregar categoría
        </button>
      </div>

      <DataTable
        columns={columns}
        data={data ?? []}
        loading={isLoading}
        onEdit={handleEdit}
        keyExtractor={(item) => item.id}
        emptyAction={() => setModalOpen(true)}
        emptyActionLabel="Agregar categoría"
      />

      <FormModal
        open={modalOpen}
        onClose={handleCloseModal}
        title={editingItem ? 'Editar categoría' : 'Agregar categoría'}
      >
        <CategoriaForm
          defaultValues={
            editingItem
              ? {
                  nombre: editingItem.nombre,
                  descripcion: editingItem.descripcion,
                }
              : undefined
          }
          onSave={handleSave}
          onCancel={handleCloseModal}
          loading={createMutation.isPending || updateMutation.isPending}
        />
      </FormModal>
    </div>
  );
}
