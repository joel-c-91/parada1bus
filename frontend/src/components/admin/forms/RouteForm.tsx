import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import type { Resolver } from 'react-hook-form';
import { z } from 'zod';
import { Upload, X } from 'lucide-react';

const routeSchema = z.object({
  nombre: z.string().min(1, 'El nombre es requerido'),
  origen: z.string().min(1, 'El origen es requerido'),
  destino: z.string().min(1, 'El destino es requerido'),
  duracion_estimada: z.string().min(1, 'La duración estimada es requerida'),
  descripcion: z.string().optional(),
  activo: z.boolean().optional(),
  orden: z.coerce.number().int().min(0).optional(),
});

type RouteFormSchema = z.infer<typeof routeSchema>;

export interface RouteFormData {
  nombre: string;
  origen: string;
  destino: string;
  duracion_estimada: string;
  descripcion: string;
  activo: boolean;
  orden: number;
  imagen?: File | null;
}

interface RouteFormProps {
  defaultValues?: Partial<RouteFormSchema>;
  imagenUrl?: string | null;
  onSave: (data: RouteFormData | FormData) => void;
  onCancel: () => void;
  loading?: boolean;
}

export default function RouteForm({
  defaultValues,
  imagenUrl,
  onSave,
  onCancel,
  loading,
}: RouteFormProps) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RouteFormData>({
    resolver: zodResolver(routeSchema) as unknown as Resolver<RouteFormData>,
    defaultValues: {
      nombre: '',
      origen: '',
      destino: '',
      duracion_estimada: '',
      descripcion: '',
      activo: true,
      orden: 0,
      ...defaultValues,
    },
  });

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      const reader = new FileReader();
      reader.onload = (event) => {
        setImagePreview(event.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleClearImage = () => {
    setSelectedFile(null);
    setImagePreview(null);
  };

  const onSubmit = (data: RouteFormData) => {
    if (selectedFile) {
      const fd = new FormData();
      fd.append('nombre', data.nombre);
      fd.append('origen', data.origen);
      fd.append('destino', data.destino);
      fd.append('duracion_estimada', data.duracion_estimada);
      fd.append('descripcion', data.descripcion ?? '');
      fd.append('activo', String(data.activo));
      fd.append('orden', String(data.orden ?? 0));
      fd.append('imagen', selectedFile);
      onSave(fd);
    } else {
      onSave(data);
    }
  };

  const displayPreview = imagePreview ?? imagenUrl ?? null;

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      {/* nombre */}
      <div>
        <label htmlFor="nombre" className="block text-sm font-medium text-gray-700 mb-1">
          Nombre
        </label>
        <input
          id="nombre"
          type="text"
          className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-francia focus:border-transparent"
          placeholder="Ej: Buenos Aires - Mar del Plata"
          {...register('nombre')}
        />
        {errors.nombre && (
          <p className="text-rojo text-xs mt-1">{errors.nombre.message}</p>
        )}
      </div>

      {/* origen */}
      <div>
        <label htmlFor="origen" className="block text-sm font-medium text-gray-700 mb-1">
          Origen
        </label>
        <input
          id="origen"
          type="text"
          className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-francia focus:border-transparent"
          placeholder="Ciudad de origen"
          {...register('origen')}
        />
        {errors.origen && (
          <p className="text-rojo text-xs mt-1">{errors.origen.message}</p>
        )}
      </div>

      {/* destino */}
      <div>
        <label htmlFor="destino" className="block text-sm font-medium text-gray-700 mb-1">
          Destino
        </label>
        <input
          id="destino"
          type="text"
          className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-francia focus:border-transparent"
          placeholder="Ciudad de destino"
          {...register('destino')}
        />
        {errors.destino && (
          <p className="text-rojo text-xs mt-1">{errors.destino.message}</p>
        )}
      </div>

      {/* duracion_estimada */}
      <div>
        <label htmlFor="duracion_estimada" className="block text-sm font-medium text-gray-700 mb-1">
          Duración estimada
        </label>
        <input
          id="duracion_estimada"
          type="text"
          className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-francia focus:border-transparent"
          placeholder="Ej: 5h 30m"
          {...register('duracion_estimada')}
        />
        {errors.duracion_estimada && (
          <p className="text-rojo text-xs mt-1">{errors.duracion_estimada.message}</p>
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
            {selectedFile ? 'Cambiar imagen' : displayPreview ? 'Cambiar imagen' : 'Subir imagen'}
            <input
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleImageChange}
            />
          </label>
          {displayPreview && (
            <div className="relative w-16 h-16 rounded-lg overflow-hidden border border-gray-200 shrink-0">
              <img
                src={displayPreview}
                alt="Vista previa"
                className="w-full h-full object-cover"
              />
              <button
                type="button"
                onClick={handleClearImage}
                className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-red-500 text-white rounded-full flex items-center justify-center hover:bg-red-600 transition-colors"
              >
                <X className="w-3 h-3" />
              </button>
            </div>
          )}
        </div>
        {imagenUrl && !selectedFile && (
          <p className="text-xs text-gray-400 mt-1">Imagen actual del servidor</p>
        )}
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
