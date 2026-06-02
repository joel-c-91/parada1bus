import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import type { Resolver } from 'react-hook-form';
import { z } from 'zod';

const departureSchema = z.object({
  ruta: z.coerce.number().int().positive('Seleccioná una ruta'),
  dia_semana: z.enum(['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo']),
  hora_salida: z.string().min(1, 'La hora es requerida'),
  vehiculo: z.coerce.number().int().positive('Seleccioná un vehículo'),
  precio_base: z.coerce.number().positive('Debe ser un número positivo'),
  precio_promocional: z.coerce.number().optional().nullable(),
  promocion_activa: z.boolean().optional(),
  activo: z.boolean().optional(),
});

type DepartureFormSchema = z.infer<typeof departureSchema>;

export interface DepartureFormData {
  ruta: number;
  dia_semana: 'Lunes' | 'Martes' | 'Miércoles' | 'Jueves' | 'Viernes' | 'Sábado' | 'Domingo';
  hora_salida: string;
  vehiculo: number;
  precio_base: number;
  precio_promocional: number | null;
  promocion_activa: boolean;
  activo: boolean;
}

interface RouteOption {
  id: number;
  nombre: string;
}

interface VehicleOption {
  id: number;
  nombre: string;
}

interface DepartureFormProps {
  defaultValues?: Partial<DepartureFormSchema>;
  onSave: (data: DepartureFormData) => void;
  onCancel: () => void;
  loading?: boolean;
  routes: RouteOption[];
  vehicles: VehicleOption[];
}

const diasSemana = [
  'Lunes',
  'Martes',
  'Miércoles',
  'Jueves',
  'Viernes',
  'Sábado',
  'Domingo',
] as const;

export default function DepartureForm({
  defaultValues,
  onSave,
  onCancel,
  loading,
  routes,
  vehicles,
}: DepartureFormProps) {
  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
  } = useForm<DepartureFormData>({
    resolver: zodResolver(departureSchema) as unknown as Resolver<DepartureFormData>,
    defaultValues: {
      ruta: undefined as unknown as number,
      dia_semana: 'Lunes',
      hora_salida: '08:00',
      vehiculo: undefined as unknown as number,
      precio_base: undefined as unknown as number,
      precio_promocional: null,
      promocion_activa: false,
      activo: true,
      ...defaultValues,
    },
  });

  const promocionActiva = watch('promocion_activa');

  return (
    <form onSubmit={handleSubmit(onSave)} className="space-y-4">
      {/* ruta (FK dropdown) */}
      <div>
        <label htmlFor="ruta" className="block text-sm font-medium text-gray-700 mb-1">
          Ruta
        </label>
        <select
          id="ruta"
          className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-francia focus:border-transparent"
          {...register('ruta')}
        >
          <option value="">Seleccionar ruta</option>
          {routes.map((r) => (
            <option key={r.id} value={r.id}>
              {r.nombre}
            </option>
          ))}
        </select>
        {errors.ruta && (
          <p className="text-rojo text-xs mt-1">{errors.ruta.message}</p>
        )}
      </div>

      {/* dia_semana */}
      <div>
        <label htmlFor="dia_semana" className="block text-sm font-medium text-gray-700 mb-1">
          Día de la semana
        </label>
        <select
          id="dia_semana"
          className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-francia focus:border-transparent"
          {...register('dia_semana')}
        >
          {diasSemana.map((dia) => (
            <option key={dia} value={dia}>
              {dia}
            </option>
          ))}
        </select>
        {errors.dia_semana && (
          <p className="text-rojo text-xs mt-1">{errors.dia_semana.message}</p>
        )}
      </div>

      {/* hora_salida */}
      <div>
        <label htmlFor="hora_salida" className="block text-sm font-medium text-gray-700 mb-1">
          Hora de salida
        </label>
        <input
          id="hora_salida"
          type="time"
          className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-francia focus:border-transparent"
          {...register('hora_salida')}
        />
        {errors.hora_salida && (
          <p className="text-rojo text-xs mt-1">{errors.hora_salida.message}</p>
        )}
      </div>

      {/* vehiculo (FK dropdown) */}
      <div>
        <label htmlFor="vehiculo" className="block text-sm font-medium text-gray-700 mb-1">
          Vehículo
        </label>
        <select
          id="vehiculo"
          className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-francia focus:border-transparent"
          {...register('vehiculo')}
        >
          <option value="">Seleccionar vehículo</option>
          {vehicles.map((v) => (
            <option key={v.id} value={v.id}>
              {v.nombre}
            </option>
          ))}
        </select>
        {errors.vehiculo && (
          <p className="text-rojo text-xs mt-1">{errors.vehiculo.message}</p>
        )}
      </div>

      {/* precio_base */}
      <div>
        <label htmlFor="precio_base" className="block text-sm font-medium text-gray-700 mb-1">
          Precio base ($)
        </label>
        <input
          id="precio_base"
          type="number"
          min={0}
          step="0.01"
          className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-francia focus:border-transparent"
          placeholder="Ej: 15000"
          {...register('precio_base')}
        />
        {errors.precio_base && (
          <p className="text-rojo text-xs mt-1">{errors.precio_base.message}</p>
        )}
      </div>

      {/* promocion_activa toggle */}
      <div className="flex items-center gap-3">
        <label className="relative inline-flex items-center cursor-pointer">
          <input
            type="checkbox"
            className="sr-only peer"
            {...register('promocion_activa')}
          />
          <div className="w-10 h-5 bg-gray-200 rounded-full peer peer-checked:bg-francia peer-focus:ring-2 peer-focus:ring-francia/30 transition-colors after:content-[''] after:absolute after:top-0.5 after:start-0.5 after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:after:translate-x-5" />
        </label>
        <span className="text-sm text-gray-600">Promoción activa</span>
      </div>

      {/* precio_promocional (shown only when promocion_activa is true) */}
      {promocionActiva && (
        <div>
          <label htmlFor="precio_promocional" className="block text-sm font-medium text-gray-700 mb-1">
            Precio promocional ($)
          </label>
          <input
            id="precio_promocional"
            type="number"
            min={0}
            step="0.01"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-francia focus:border-transparent"
            placeholder="Ej: 12000"
            {...register('precio_promocional')}
          />
          {errors.precio_promocional && (
            <p className="text-rojo text-xs mt-1">{errors.precio_promocional.message}</p>
          )}
        </div>
      )}

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
