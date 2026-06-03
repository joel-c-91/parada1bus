import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import type { Resolver } from 'react-hook-form';
import { z } from 'zod';
import { Upload, X } from 'lucide-react';

const serviceSchema = z.object({
  nombre: z.string().min(1, 'El nombre es requerido'),
  descripcion_corta: z.string().min(1, 'La descripción corta es requerida'),
  descripcion_larga: z.string().optional(),
  icono: z.string().optional(),
  activo: z.boolean().optional(),
  orden: z.coerce.number().int().min(0).optional(),
});

type ServiceFormSchema = z.infer<typeof serviceSchema>;

export interface ServiceFormData {
  nombre: string;
  descripcion_corta: string;
  descripcion_larga: string;
  icono: string;
  activo: boolean;
  orden: number;
  imagen?: File | null;
}

interface ServiceFormProps {
  defaultValues?: Partial<ServiceFormSchema>;
  imagenUrl?: string | null;
  onSave: (data: ServiceFormData | FormData) => void;
  onCancel: () => void;
  loading?: boolean;
}

export default function ServiceForm({
  defaultValues,
  imagenUrl,
  onSave,
  onCancel,
  loading,
}: ServiceFormProps) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ServiceFormData>({
    resolver: zodResolver(serviceSchema) as unknown as Resolver<ServiceFormData>,
    defaultValues: {
      nombre: '',
      descripcion_corta: '',
      descripcion_larga: '',
      icono: '',
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

  const onSubmit = (data: ServiceFormData) => {
    if (selectedFile) {
      const fd = new FormData();
      fd.append('nombre', data.nombre);
      fd.append('descripcion_corta', data.descripcion_corta);
      fd.append('descripcion_larga', data.descripcion_larga ?? '');
      fd.append('icono', data.icono ?? '');
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
          placeholder="Ej: Viaje Executivo"
          {...register('nombre')}
        />
        {errors.nombre && (
          <p className="text-rojo text-xs mt-1">{errors.nombre.message}</p>
        )}
      </div>

      {/* descripcion_corta */}
      <div>
        <label htmlFor="descripcion_corta" className="block text-sm font-medium text-gray-700 mb-1">
          Descripción corta
        </label>
        <input
          id="descripcion_corta"
          type="text"
          className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-francia focus:border-transparent"
          placeholder="Texto breve para la tarjeta"
          {...register('descripcion_corta')}
        />
        {errors.descripcion_corta && (
          <p className="text-rojo text-xs mt-1">{errors.descripcion_corta.message}</p>
        )}
      </div>

      {/* descripcion_larga */}
      <div>
        <label htmlFor="descripcion_larga" className="block text-sm font-medium text-gray-700 mb-1">
          Descripción larga
        </label>
        <textarea
          id="descripcion_larga"
          rows={3}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-francia focus:border-transparent resize-none"
          placeholder="Descripción detallada (opcional)..."
          {...register('descripcion_larga')}
        />
      </div>

      {/* icono */}
      <div>
        <label htmlFor="icono" className="block text-sm font-medium text-gray-700 mb-1">
          Icono (clase de Lucide)
        </label>
        <input
          id="icono"
          type="text"
          className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-francia focus:border-transparent"
          placeholder="Ej: Bus, MapPin"
          {...register('icono')}
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
