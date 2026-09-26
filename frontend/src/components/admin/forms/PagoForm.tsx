import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import type { Resolver } from 'react-hook-form';
import { z } from 'zod';
import { useQuery } from '@tanstack/react-query';
import api from '../../../lib/api';

const pagoSchema = z.object({
  cliente: z.coerce.number().int().positive('Seleccioná un cliente').optional(),
  monto: z.coerce.number().positive('El monto debe ser mayor a 0'),
  fecha: z.string().min(1, 'La fecha es requerida'),
  descripcion: z.string().optional(),
  metodo_pago: z.enum(['efectivo', 'transferencia', 'debito', 'credito', 'otros']),
});

export interface PagoFormData {
  cliente?: number;
  monto: number;
  fecha: string;
  descripcion?: string;
  metodo_pago: 'efectivo' | 'transferencia' | 'debito' | 'credito' | 'otros';
}

interface ClienteOption {
  id: number;
  nombre: string;
}

interface PagoFormProps {
  defaultValues?: Partial<PagoFormData>;
  onSave: (data: PagoFormData) => void;
  onCancel: () => void;
  loading?: boolean;
}

export default function PagoForm({
  defaultValues,
  onSave,
  onCancel,
  loading,
}: PagoFormProps) {
  const today = new Date().toISOString().split('T')[0];

  const { data: clientes } = useQuery({
    queryKey: ['clientes-list'],
    queryFn: async () => {
      const res = await api.get<{ results: ClienteOption[] }>('/admin/clientes/', {
        params: { page_size: 200 },
      });
      return res.data.results;
    },
  });

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<PagoFormData>({
    resolver: zodResolver(pagoSchema) as unknown as Resolver<PagoFormData>,
    defaultValues: {
      cliente: undefined,
      monto: undefined as unknown as number,
      fecha: today,
      descripcion: '',
      metodo_pago: 'efectivo',
      ...defaultValues,
    },
  });

  return (
    <form onSubmit={handleSubmit(onSave)} className="space-y-4">
      {/* cliente */}
      <div>
        <label htmlFor="cliente" className="block text-sm font-medium text-gray-700 mb-1">
          Cliente
        </label>
        <select
          id="cliente"
          className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-francia focus:border-transparent"
          {...register('cliente')}
        >
          <option value="">Seleccionar cliente...</option>
          {clientes?.map((c) => (
            <option key={c.id} value={c.id}>
              {c.nombre}
            </option>
          ))}
        </select>
        {errors.cliente && (
          <p className="text-rojo text-xs mt-1">{errors.cliente.message}</p>
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

      {/* metodo_pago — styled radio group */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Método de pago <span className="text-rojo">*</span>
        </label>
        <div className="grid grid-cols-2 gap-2">
          {([
            ['efectivo', 'Efectivo'],
            ['transferencia', 'Transferencia'],
            ['debito', 'Débito'],
            ['credito', 'Crédito'],
            ['otros', 'Otros'],
          ] as const).map(([value, label]) => (
            <label
              key={value}
              className="flex items-center gap-2 px-3 py-2.5 border border-gray-300 rounded-lg text-sm cursor-pointer hover:bg-gray-50 has-[:checked]:bg-francia-claro has-[:checked]:border-francia has-[:checked]:text-francia transition-colors"
            >
              <input
                type="radio"
                value={value}
                className="sr-only"
                {...register('metodo_pago')}
              />
              {label}
            </label>
          ))}
        </div>
        {errors.metodo_pago && (
          <p className="text-rojo text-xs mt-1">{errors.metodo_pago.message}</p>
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
