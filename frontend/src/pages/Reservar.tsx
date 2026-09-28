import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { AlertCircle, ArrowRight, CheckCircle, Loader2, MapPin, Users } from 'lucide-react';
import api, { extraerMensajeError } from '../lib/api';

const esquema = z.object({
  nombre: z.string().min(3, 'Ingresá tu nombre completo'),
  email: z.string().email('Ingresá un email válido'),
  telefono: z.string().min(8, 'Ingresá un teléfono válido'),
  cantidad: z.coerce.number().int().min(1, 'Ingresá la cantidad').max(60, 'Máximo 60 pasajeros'),
  fecha_viaje: z.string().min(1, 'Elegí la fecha del viaje'),
});

type Formulario = z.infer<typeof esquema>;

interface Salida {
  id: number;
  ruta_nombre: string;
  origen: string;
  destino: string;
  dia_semana: string;
  dia_display: string;
  hora_salida: string;
  precio: string;
  vehiculo_nombre: string | null;
  capacidad: number | null;
  asientos_disponibles: number | null;
}

const INDICE_DIA: Record<string, number> = {
  dom: 0, lun: 1, mar: 2, mie: 3, jue: 4, vie: 5, sab: 6,
};

/** Formato YYYY-MM-DD en hora local. toISOString()correria el dia por UTC. */
const aISO = (fecha: Date): string =>
  `${fecha.getFullYear()}-${String(fecha.getMonth() + 1).padStart(2, '0')}-${String(fecha.getDate()).padStart(2, '0')}`;

/**
 * Proxima ocurrencia del dia de la salida, siempre en el futuro.
 *
 * Una salida es semanal y recurrente: no tiene fecha propia, la elige el
 * pasajero. Si el dia coincide con hoy se ofrece la semana siguiente, para
 * no ofrecer un viaje cuya hora de salida ya paso.
 */
const proximaFechaDelDia = (diaSemana: string): string => {
  const hoy = new Date();
  hoy.setHours(0, 0, 0, 0);
  const objetivo = INDICE_DIA[diaSemana] ?? 0;
  const diferencia = (objetivo - hoy.getDay() + 7) % 7;
  const fecha = new Date(hoy);
  fecha.setDate(fecha.getDate() + (diferencia === 0 ? 7 : diferencia));
  return aISO(fecha);
};

const formatearFechaLarga = (iso: string): string => {
  const [anio, mes, dia] = iso.split('-').map(Number);
  return new Date(anio, mes - 1, dia).toLocaleDateString('es-AR', {
    weekday: 'long', day: 'numeric', month: 'long', year: 'numeric',
  });
};

export default function Reservar() {
  // La ruta es /reservar/:salidaId, no un query string.
  const { salidaId } = useParams<{ salidaId: string }>();

  const [salida, setSalida] = useState<Salida | null>(null);
  const [cargandoSalida, setCargandoSalida] = useState(true);
  const [enviando, setEnviando] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [exito, setExito] = useState<{ codigo: string } | null>(null);

  const hoy = aISO(new Date());

  const { register, handleSubmit, watch, setValue, formState: { errors } } = useForm<Formulario>({
    resolver: zodResolver(esquema),
    defaultValues: { cantidad: '1', fecha_viaje: '' },
  });

  const cantidad = watch('cantidad');
  const asientosSolicitados = Number(cantidad) || 0;
  const completos = salida?.asientos_disponibles === 0;
  const sinControlDePlazas = salida?.asientos_disponibles === null;
  const excedeDisponibles =
    !completos && !sinControlDePlazas && salida !== null &&
    asientosSolicitados > (salida.asientos_disponibles ?? 0);

  useEffect(() => {
    if (!salidaId) {
      setCargandoSalida(false);
      return;
    }
    api.get<Salida>(`/salidas/${salidaId}/`)
      .then((res) => {
        setSalida(res.data);
        setValue('fecha_viaje', proximaFechaDelDia(res.data.dia_semana));
      })
      .catch(() => setSalida(null))
      .finally(() => setCargandoSalida(false));
  }, [salidaId, setValue]);

  const onSubmit = async (data: Formulario) => {
    if (!salidaId) return;
    setEnviando(true);
    setError(null);
    try {
      const res = await api.post('/reservas/', {
        salida: Number(salidaId),
        fecha_viaje: data.fecha_viaje,
        nombre: data.nombre,
        email: data.email,
        telefono: data.telefono,
        cantidad_asientos: data.cantidad,
      });
      setExito({ codigo: res.data.codigo });
    } catch (err) {
      setError(extraerMensajeError(
        err,
        'No pudimos confirmar la reserva. Intentá de nuevo.',
      ));
    } finally {
      setEnviando(false);
    }
  };

  if (!salidaId) {
    return (
      <div className="py-16 md:py-20 bg-gray-50 min-h-screen">
        <div className="max-w-lg mx-auto px-4 text-center">
          <MapPin className="w-12 h-12 text-gray-300 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Seleccioná un viaje</h1>
          <p className="text-gray-600 mb-6">Buscá un viaje primero para poder reservar.</p>
          <Link
            to="/buscar-viaje"
            className="inline-flex items-center gap-2 bg-rojo text-white px-6 py-3 rounded-xl font-semibold hover:bg-red-700 transition-all"
          >
            Buscar viaje <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    );
  }

  if (exito) {
    return (
      <div className="py-16 md:py-20 bg-gray-50 min-h-screen">
        <div className="max-w-lg mx-auto px-4 text-center">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="w-8 h-8 text-green-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">¡Reserva confirmada!</h2>
          <p className="text-gray-600 mb-2">Tu código de reserva es:</p>
          <div className="text-3xl font-bold text-rojo mb-6 font-mono tracking-wider">{exito.codigo}</div>
          <p className="text-sm text-gray-500 mb-6">Guardá este código, lo vas a necesitar para consultar tu reserva.</p>
          <Link
            to="/buscar-viaje"
            className="inline-flex items-center gap-2 bg-rojo text-white px-6 py-3 rounded-xl font-semibold hover:bg-red-700 transition-all"
          >
            Buscar otro viaje <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    );
  }

  if (cargandoSalida) {
    return (
      <div className="flex items-center justify-center py-32">
        <Loader2 className="w-8 h-8 animate-spin text-rojo" />
      </div>
    );
  }

  if (!salida) {
    return (
      <div className="py-16 md:py-20 bg-gray-50 min-h-screen">
        <div className="max-w-lg mx-auto px-4 text-center">
          <h2 className="text-xl font-bold text-gray-900 mb-2">Viaje no encontrado</h2>
          <p className="text-gray-600 mb-6">El viaje que buscas no está disponible.</p>
          <Link
            to="/buscar-viaje"
            className="inline-flex items-center gap-2 bg-rojo text-white px-6 py-3 rounded-xl font-semibold hover:bg-red-700 transition-all"
          >
            Buscar viaje <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="py-16 md:py-20 bg-gray-50 min-h-screen">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Reservar pasaje</h1>
        </div>

        {/* Resumen del viaje */}
        <div className="bg-white rounded-2xl border border-gray-200 p-4 sm:p-6 mb-6">
          <div className="flex items-center gap-2 text-sm text-gray-500 mb-2">
            Todos los {salida.dia_display} — {salida.hora_salida}
          </div>
          <div className="flex items-center gap-2 mb-2">
            <span className="font-semibold text-gray-900">{salida.origen}</span>
            <ArrowRight className="w-4 h-4 text-gray-400" />
            <span className="font-semibold text-gray-900">{salida.destino}</span>
          </div>
          <div className="flex items-center gap-4 text-sm text-gray-500">
            {salida.vehiculo_nombre && <span>{salida.vehiculo_nombre}</span>}
            <span className="text-lg font-bold text-rojo">${salida.precio}</span>
          </div>

          <div className="mt-4 pt-4 border-t border-gray-100">
            {completos ? (
              <div className="flex items-center gap-2 text-sm font-medium text-red-600">
                <AlertCircle className="w-4 h-4" />
                Este viaje no tiene asientos disponibles.
              </div>
            ) : sinControlDePlazas ? (
              <div className="flex items-center gap-2 text-sm text-gray-500">
                <Users className="w-4 h-4" />
                Consultar disponibilidad por teléfono
              </div>
            ) : (
              <div className="flex items-center gap-2 text-sm font-medium text-gray-700">
                <Users className="w-4 h-4 text-rojo" />
                {salida.asientos_disponibles} de {salida.capacidad} asientos disponibles
              </div>
            )}
          </div>
        </div>

        {error && (
          <div className="flex items-start gap-2 bg-red-50 border border-red-200 text-red-700 rounded-xl px-4 py-3 mb-6 text-sm">
            <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Formulario */}
        <form onSubmit={handleSubmit(onSubmit)} className="bg-white rounded-2xl shadow-sm border border-gray-200 p-4 sm:p-8 space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Fecha del viaje</label>
            <input
              type="date"
              min={hoy}
              {...register('fecha_viaje')}
              className="w-full px-4 py-2.5 rounded-xl border border-gray-300 focus:ring-2 focus:ring-rojo focus:border-transparent outline-none transition-all"
            />
            <p className="text-xs text-gray-500 mt-1">Este viaje sale todos los {salida.dia_display}.</p>
            {errors.fecha_viaje && <p className="text-red-500 text-xs mt-1">{errors.fecha_viaje.message}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Nombre completo</label>
            <input {...register('nombre')} className="w-full px-4 py-2.5 rounded-xl border border-gray-300 focus:ring-2 focus:ring-rojo focus:border-transparent outline-none transition-all" />
            {errors.nombre && <p className="text-red-500 text-xs mt-1">{errors.nombre.message}</p>}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
              <input type="email" {...register('email')} className="w-full px-4 py-2.5 rounded-xl border border-gray-300 focus:ring-2 focus:ring-rojo focus:border-transparent outline-none transition-all" />
              {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email.message}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Teléfono</label>
              <input {...register('telefono')} className="w-full px-4 py-2.5 rounded-xl border border-gray-300 focus:ring-2 focus:ring-rojo focus:border-transparent outline-none transition-all" />
              {errors.telefono && <p className="text-red-500 text-xs mt-1">{errors.telefono.message}</p>}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Cantidad de pasajeros</label>
            <input
              type="number"
              min="1"
              max={salida.capacidad ?? 60}
              {...register('cantidad')}
              className="w-full px-4 py-2.5 rounded-xl border border-gray-300 focus:ring-2 focus:ring-rojo focus:border-transparent outline-none transition-all"
            />
            {excedeDisponibles && (
              <p className="text-red-500 text-xs mt-1">
                Solo quedan {salida.asientos_disponibles} asientos disponibles.
              </p>
            )}
            {errors.cantidad && <p className="text-red-500 text-xs mt-1">{errors.cantidad.message}</p>}
          </div>

          <button
            type="submit"
            disabled={enviando || completos || excedeDisponibles}
            className="w-full flex items-center justify-center gap-2 bg-rojo text-white py-3 rounded-xl font-semibold hover:bg-red-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {enviando ? <Loader2 className="w-5 h-5 animate-spin" /> : <CheckCircle className="w-5 h-5" />}
            {enviando ? 'Reservando...' : completos ? 'Sin disponibilidad' : 'Confirmar reserva'}
          </button>
        </form>
      </div>
    </div>
  );
}
