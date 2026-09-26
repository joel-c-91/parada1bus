import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import type { Resolver } from 'react-hook-form';
import { z } from 'zod';
import { useQuery } from '@tanstack/react-query';
import api from '../../../lib/api';

const chequeSchema = z.object({
  cliente: z.coerce.number().int().positive('Seleccioná un cliente'),
  numero: z.string().min(1, 'El número es requerido'),
  banco: z.string().min(1, 'El banco es requerido'),
  monto: z.coerce.number().positive('El monto debe ser mayor a 0'),
  fecha_emision: z.string().min(1, 'La fecha de emisión es requerida'),
  fecha_vto: z.string().optional(),
  pago: z.coerce.number().int().positive().optional(),
  notas: z.string().optional(),
});

export type ChequeFormData = z.infer<typeof chequeSchema>;

interface ClienteOption {
  id: number;
  nombre: string;
}

interface PagoOption {
  id: number;
  monto: string;
  fecha: string;
}

interface ChequeFormProps {
  defaultValues?: Partial<ChequeFormData>;
  onSave: (data: ChequeFormData) => void;
  onCancel: () => void;
  loading?: boolean;
}

export default function ChequeForm({
  defaultValues,
  onSave,
  onCancel,
  loading,
}: ChequeFormProps) {
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

  const { data: pagos } = useQuery({
    queryKey: ['pagos-list'],
    queryFn: async () => {
      const res = await api.get<{ results: PagoOption[] }>('/admin/pagos/', {
        params: { page_size: 200 },
      });
      return res.data.results;
    },
  });

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ChequeFormData>({
    resolver: zodResolver(chequeSchema) as unknown as Resolver<ChequeFormData>,
    defaultValues: {
      cliente: undefined,
      numero: '',
      banco: '',
      monto: undefined as unknown as number,
      fecha_emision: today,
      fecha_vto: '',
      pago: undefined,
      notas: '',
      ...defaultValues,
    },
  });

  return (
    <form onSubmit={handleSubmit(onSave)} className="space-y-4">
      {/* cliente */}
      <div>
        <label htmlFor="cliente" className="block text-sm font-medium text-gray-700 mb-1">
          Cliente <span className="text-rojo">*</span>
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

      {/* numero */}
      <div>
        <label htmlFor="numero" className="block text-sm font-medium text-gray-700 mb-1">
          Número <span className="text-rojo">*</span>
        </label>
        <input
          id="numero"
          type="text"
          className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-francia focus:border-transparent"
          placeholder="Número de cheque"
          {...register('numero')}
        />
        {errors.numero && (
          <p className="text-rojo text-xs mt-1">{errors.numero.message}</p>
        )}
      </div>

      {/* banco */}
      <div>
        <label htmlFor="banco" className="block text-sm font-medium text-gray-700 mb-1">
          Banco <span className="text-rojo">*</span>
        </label>
        <input
          id="banco"
          type="text"
          className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-francia focus:border-transparent"
          placeholder="Nombre del banco"
          {...register('banco')}
        />
        {errors.banco && (
          <p className="text-rojo text-xs mt-1">{errors.banco.message}</p>
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

      {/* dates row */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label htmlFor="fecha_emision" className="block text-sm font-medium text-gray-700 mb-1">
            Fecha emisión <span className="text-rojo">*</span>
          </label>
          <input
            id="fecha_emision"
            type="date"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-francia focus:border-transparent"
            {...register('fecha_emision')}
          />
          {errors.fecha_emision && (
            <p className="text-rojo text-xs mt-1">{errors.fecha_emision.message}</p>
          )}
        </div>
        <div>
          <label htmlFor="fecha_vto" className="block text-sm font-medium text-gray-700 mb-1">
            Vencimiento
          </label>
          <input
            id="fecha_vto"
            type="date"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-francia focus:border-transparent"
            {...register('fecha_vto')}
          />
          {errors.fecha_vto && (
            <p className="text-rojo text-xs mt-1">{errors.fecha_vto.message}</p>
          )}
        </div>
      </div>

      {/* pago (optional) */}
      <div>
        <label htmlFor="pago" className="block text-sm font-medium text-gray-700 mb-1">
          Pago asociado
        </label>
        <select
          id="pago"
          className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-francia focus:border-transparent"
          {...register('pago')}
        >
          <option value="">Sin pago asociado...</option>
          {pagos?.map((p) => (
            <option key={p.id} value={p.id}>
              #{p.id} — ${p.monto} ({p.fecha})
            </option>
          ))}
        </select>
        {errors.pago && (
          <p className="text-rojo text-xs mt-1">{errors.pago.message}</p>
        )}
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
          placeholder="Notas opcionales..."
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
