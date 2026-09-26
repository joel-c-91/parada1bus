import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import type { Resolver } from 'react-hook-form';
import { z } from 'zod';
import { useQuery } from '@tanstack/react-query';
import { Upload, X } from 'lucide-react';
import api from '../../../lib/api';

const gastoSchema = z.object({
  categoria: z.coerce.number().int().positive('Seleccioná una categoría'),
  monto: z.coerce.number().positive('El monto debe ser mayor a 0'),
  fecha: z.string().min(1, 'La fecha es requerida'),
  descripcion: z.string().optional(),
  proveedor: z.string().optional(),
});

export interface GastoFormData {
  categoria: number;
  monto: number;
  fecha: string;
  descripcion?: string;
  proveedor?: string;
  comprobante?: File | null;
}

interface CategoriaOption {
  id: number;
  nombre: string;
}

interface GastoFormProps {
  defaultValues?: Partial<GastoFormData>;
  comprobanteUrl?: string | null;
  onSave: (data: GastoFormData | FormData) => void;
  onCancel: () => void;
  loading?: boolean;
}

export default function GastoForm({
  defaultValues,
  comprobanteUrl,
  onSave,
  onCancel,
  loading,
}: GastoFormProps) {
  const today = new Date().toISOString().split('T')[0];
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [filePreview, setFilePreview] = useState<string | null>(null);

  const { data: categorias } = useQuery({
    queryKey: ['categorias-gasto-list'],
    queryFn: async () => {
      const res = await api.get<{ results: CategoriaOption[] }>('/admin/categorias-gasto/', {
        params: { page_size: 100 },
      });
      return res.data.results;
    },
  });

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<GastoFormData>({
    resolver: zodResolver(gastoSchema) as unknown as Resolver<GastoFormData>,
    defaultValues: {
      categoria: undefined as unknown as number,
      monto: undefined as unknown as number,
      fecha: today,
      descripcion: '',
      proveedor: '',
      ...defaultValues,
    },
  });

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      const reader = new FileReader();
      reader.onload = (event) => {
        setFilePreview(event.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleClearFile = () => {
    setSelectedFile(null);
    setFilePreview(null);
  };

  const onSubmit = (data: GastoFormData) => {
    if (selectedFile) {
      const fd = new FormData();
      fd.append('categoria', String(data.categoria));
      fd.append('monto', String(data.monto));
      fd.append('fecha', data.fecha);
      fd.append('descripcion', data.descripcion ?? '');
      fd.append('proveedor', data.proveedor ?? '');
      fd.append('comprobante', selectedFile);
      onSave(fd);
    } else {
      onSave(data);
    }
  };

  const displayPreview = filePreview ?? comprobanteUrl ?? null;

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      {/* categoria */}
      <div>
        <label htmlFor="categoria" className="block text-sm font-medium text-gray-700 mb-1">
          Categoría <span className="text-rojo">*</span>
        </label>
        <select
          id="categoria"
          className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-francia focus:border-transparent"
          {...register('categoria')}
        >
          <option value="">Seleccionar categoría...</option>
          {categorias?.map((c) => (
            <option key={c.id} value={c.id}>
              {c.nombre}
            </option>
          ))}
        </select>
        {errors.categoria && (
          <p className="text-rojo text-xs mt-1">{errors.categoria.message}</p>
        )}
      </div>

      {/* monto */}
      <div>
        <label htmlFor="monto" className="block text-sm font-medium text-gray-700 mb-1">
          Monto <span className="text-rojo">*</span>
        </label>
        <div className="relative">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">$</span>
          <input
            id="monto"
            type="number"
            step="0.01"
            min="0.01"
            className="w-full pl-7 pr-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-francia focus:border-transparent"
            placeholder="0.00"
            {...register('monto')}
          />
        </div>
        {errors.monto && (
          <p className="text-rojo text-xs mt-1">{errors.monto.message}</p>
        )}
      </div>

      {/* fecha */}
      <div>
        <label htmlFor="fecha" className="block text-sm font-medium text-gray-700 mb-1">
          Fecha <span className="text-rojo">*</span>
        </label>
        <input
          id="fecha"
          type="date"
          className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-francia focus:border-transparent"
          {...register('fecha')}
        />
        {errors.fecha && (
          <p className="text-rojo text-xs mt-1">{errors.fecha.message}</p>
        )}
      </div>

      {/* proveedor */}
      <div>
        <label htmlFor="proveedor" className="block text-sm font-medium text-gray-700 mb-1">
          Proveedor
        </label>
        <input
          id="proveedor"
          type="text"
          className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-francia focus:border-transparent"
          placeholder="Ej: Estación de servicio YPF"
          {...register('proveedor')}
        />
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

      {/* comprobante */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Comprobante</label>
        <div className="flex items-center gap-4">
          <label className="flex items-center gap-2 px-4 py-2.5 border border-gray-300 rounded-lg text-sm text-gray-600 hover:bg-gray-50 cursor-pointer min-h-[44px] transition-colors">
            <Upload className="w-4 h-4" />
            {selectedFile ? 'Cambiar comprobante' : displayPreview ? 'Cambiar comprobante' : 'Subir comprobante'}
            <input
              type="file"
              accept="image/*,application/pdf"
              className="hidden"
              onChange={handleFileChange}
            />
          </label>
          {displayPreview && (
            <div className="relative w-16 h-16 rounded-lg overflow-hidden border border-gray-200 shrink-0">
              {displayPreview.match(/\.(jpg|jpeg|png|gif|webp)/i) || filePreview ? (
                <img
                  src={displayPreview}
                  alt="Vista previa"
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-gray-400 text-xs">
                  PDF
                </div>
              )}
              <button
                type="button"
                onClick={handleClearFile}
                className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-red-500 text-white rounded-full flex items-center justify-center hover:bg-red-600 transition-colors"
              >
                <X className="w-3 h-3" />
              </button>
            </div>
          )}
        </div>
        {comprobanteUrl && !selectedFile && (
          <p className="text-xs text-gray-400 mt-1">Comprobante actual</p>
        )}
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
