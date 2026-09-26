import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import type { Resolver } from 'react-hook-form';
import { z } from 'zod';

const clientSchema = z.object({
  nombre: z.string().min(1, 'El nombre es requerido'),
  email: z.string().email('Email inválido').optional().or(z.literal('')),
  telefono: z.string().optional(),
  direccion: z.string().optional(),
  notas: z.string().optional(),
});

type ClientFormSchema = z.infer<typeof clientSchema>;

export interface ClientFormData {
  nombre: string;
  email: string;
  telefono: string;
  direccion: string;
  notas: string;
}

interface ClientFormProps {
  defaultValues?: Partial<ClientFormSchema>;
  onSave: (data: ClientFormData) => void;
  onCancel: () => void;
  loading?: boolean;
}

export default function ClientForm({
  defaultValues,
  onSave,
  onCancel,
  loading,
}: ClientFormProps) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ClientFormData>({
    resolver: zodResolver(clientSchema) as unknown as Resolver<ClientFormData>,
    defaultValues: {
      nombre: '',
      email: '',
      telefono: '',
      direccion: '',
      notas: '',
      ...defaultValues,
    },
  });

  return (
    <form onSubmit={handleSubmit(onSave)} className="space-y-4">
      {/* nombre */}
      <div>
        <label htmlFor="nombre" className="block text-sm font-medium text-gray-700 mb-1">
          Nombre <span className="text-rojo">*</span>
        </label>
        <input
          id="nombre"
          type="text"
          className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-francia focus:border-transparent"
          placeholder="Ej: Juan Pérez"
          {...register('nombre')}
        />
        {errors.nombre && (
          <p className="text-rojo text-xs mt-1">{errors.nombre.message}</p>
        )}
      </div>

      {/* email */}
      <div>
        <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
          Email
        </label>
        <input
          id="email"
          type="email"
          className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-francia focus:border-transparent"
          placeholder="Ej: juan@ejemplo.com"
          {...register('email')}
        />
        {errors.email && (
          <p className="text-rojo text-xs mt-1">{errors.email.message}</p>
        )}
      </div>

      {/* telefono */}
      <div>
        <label htmlFor="telefono" className="block text-sm font-medium text-gray-700 mb-1">
          Teléfono
        </label>
        <input
          id="telefono"
          type="text"
          className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-francia focus:border-transparent"
          placeholder="Ej: 351 123 4567"
          {...register('telefono')}
        />
      </div>

      {/* direccion */}
      <div>
        <label htmlFor="direccion" className="block text-sm font-medium text-gray-700 mb-1">
          Dirección
        </label>
        <input
          id="direccion"
          type="text"
          className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-francia focus:border-transparent"
          placeholder="Ej: Av. Colón 1234"
          {...register('direccion')}
        />
      </div>

      {/* notas */}
      <div>
        <label htmlFor="notas" className="block text-sm font-medium text-gray-700 mb-1">
          Notas
        </label>
        <textarea
          id="notas"
          rows={3}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-francia focus:border-transparent resize-none"
          placeholder="Notas adicionales (opcional)..."
          {...register('notas')}
        />
      </div>

      {/* buttons */}
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
