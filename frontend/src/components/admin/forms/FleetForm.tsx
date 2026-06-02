import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import type { Resolver } from 'react-hook-form';
import { z } from 'zod';
import { Upload } from 'lucide-react';

const fleetSchema = z.object({
  nombre: z.string().min(1, 'El nombre es requerido'),
  tipo: z.enum(['van', 'minibus', 'bus']),
  capacidad: z.coerce.number().int().positive('Debe ser un número positivo'),
  patente: z.string().min(1, 'La patente es requerida'),
  descripcion: z.string().optional(),
  activo: z.boolean().optional(),
  orden: z.coerce.number().int().min(0).optional(),
});

type FleetFormSchema = z.infer<typeof fleetSchema>;

export interface FleetFormData {
  nombre: string;
  tipo: 'van' | 'minibus' | 'bus';
  capacidad: number;
  patente: string;
  descripcion: string;
  activo: boolean;
  orden: number;
}

interface FleetFormProps {
  defaultValues?: Partial<FleetFormSchema>;
  onSave: (data: FleetFormData) => void;
  onCancel: () => void;
  loading?: boolean;
}

export default function FleetForm({
  defaultValues,
  onSave,
  onCancel,
  loading,
}: FleetFormProps) {
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FleetFormData>({
    resolver: zodResolver(fleetSchema) as unknown as Resolver<FleetFormData>,
    defaultValues: {
      nombre: '',
      tipo: 'van',
      capacidad: undefined as unknown as number,
      patente: '',
      descripcion: '',
      activo: true,
      orden: 0,
      ...defaultValues,
    },
  });

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setImagePreview(event.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSave)} className="space-y-4">
      {/* nombre */}
      <div>
        <label htmlFor="nombre" className="block text-sm font-medium text-gray-700 mb-1">
          Nombre
        </label>
        <input
          id="nombre"
          type="text"
          className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-francia focus:border-transparent"
          placeholder="Ej: Mercedes Benz Sprinter"
          {...register('nombre')}
        />
        {errors.nombre && (
          <p className="text-rojo text-xs mt-1">{errors.nombre.message}</p>
        )}
      </div>

      {/* tipo */}
      <div>
        <label htmlFor="tipo" className="block text-sm font-medium text-gray-700 mb-1">
          Tipo
        </label>
        <select
          id="tipo"
          className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-francia focus:border-transparent"
          {...register('tipo')}
        >
          <option value="van">Van</option>
          <option value="minibus">Minibús</option>
          <option value="bus">Bus</option>
        </select>
        {errors.tipo && (
          <p className="text-rojo text-xs mt-1">{errors.tipo.message}</p>
        )}
      </div>

      {/* capacidad */}
      <div>
        <label htmlFor="capacidad" className="block text-sm font-medium text-gray-700 mb-1">
          Capacidad (pasajeros)
        </label>
        <input
          id="capacidad"
          type="number"
          min={1}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-francia focus:border-transparent"
          placeholder="Ej: 20"
          {...register('capacidad')}
        />
        {errors.capacidad && (
          <p className="text-rojo text-xs mt-1">{errors.capacidad.message}</p>
        )}
      </div>

      {/* patente */}
      <div>
        <label htmlFor="patente" className="block text-sm font-medium text-gray-700 mb-1">
          Patente
        </label>
        <input
          id="patente"
          type="text"
          className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-francia focus:border-transparent"
          placeholder="Ej: ABC123"
          {...register('patente')}
        />
        {errors.patente && (
          <p className="text-rojo text-xs mt-1">{errors.patente.message}</p>
        )}
      </div>

      {/* descripcion */}
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

      {/* imagen */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Imagen</label>
        <div className="flex items-center gap-4">
          <label className="flex items-center gap-2 px-4 py-2.5 border border-gray-300 rounded-lg text-sm text-gray-600 hover:bg-gray-50 cursor-pointer min-h-[44px] transition-colors">
            <Upload className="w-4 h-4" />
            {imagePreview ? 'Cambiar imagen' : 'Subir imagen'}
            <input
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleImageChange}
            />
          </label>
          {imagePreview && (
            <div className="w-16 h-16 rounded-lg overflow-hidden border border-gray-200 shrink-0">
              <img
                src={imagePreview}
                alt="Vista previa"
                className="w-full h-full object-cover"
              />
            </div>
          )}
        </div>
      </div>

      {/* activo */}
      <div className="flex items-center gap-3">
        <label className="relative inline-flex items-center cursor-pointer">
          <input
            type="checkbox"
            className="sr-only peer"
            defaultChecked={defaultValues?.activo ?? true}
            {...register('activo')}
          />
          <div className="w-10 h-5 bg-gray-200 rounded-full peer peer-checked:bg-francia peer-focus:ring-2 peer-focus:ring-francia/30 transition-colors after:content-[''] after:absolute after:top-0.5 after:start-0.5 after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:after:translate-x-5" />
        </label>
        <span className="text-sm text-gray-600">Activo</span>
      </div>

      {/* orden */}
      <div>
        <label htmlFor="orden" className="block text-sm font-medium text-gray-700 mb-1">
          Orden
        </label>
        <input
          id="orden"
          type="number"
          min={0}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-francia focus:border-transparent"
          placeholder="0"
          {...register('orden')}
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
