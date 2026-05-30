import { useEffect, useState } from 'react';
import { useParams, useSearchParams, Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  ArrowLeft, Calendar, CheckCircle, Clock, DollarSign,
  Loader2, MapPin, Send, Users
} from 'lucide-react';
import api from '../lib/api';

const esquema = z.object({
  nombre: z.string().min(3, 'Ingresá tu nombre completo'),
  email: z.string().email('Ingresá un email válido'),
  telefono: z.string().min(8, 'Ingresá un teléfono válido'),
  cantidad_asientos: z.coerce.number().int().min(1, 'Mínimo 1 asiento'),
});

type Formulario = z.infer<typeof esquema>;

interface SalidaData {
  id: number;
  dia_semana: string;
  dia_display: string;
  hora_salida: string;
  precio_base: string;
  vehiculo_data: { nombre: string; capacidad: number } | null;
  ruta?: {
    origen: string;
    destino: string;
    duracion_estimada: string;
  };
}

export default function Reservar() {
  const { salidaId } = useParams();
  const [searchParams] = useSearchParams();
  const fechaStr = searchParams.get('fecha') || '';

  const [salida, setSalida] = useState<SalidaData | null>(null);
  const [cargandoSalida, setCargandoSalida] = useState(true);
  const [enviando, setEnviando] = useState(false);
  const [exito, setExito] = useState<{ codigo: string } | null>(null);

  const { register, handleSubmit, formState: { errors }, watch } = useForm<Formulario>({
    resolver: zodResolver(esquema),
  });

  const asientos = watch('cantidad_asientos');
  const total = asientos && salida
    ? parseFloat(salida.precio_base) * asientos
    : 0;

  useEffect(() => {
    if (!salidaId) return;
    api.get(`/rutas/${salidaId}/`)
      .then(res => {
        const ruta = res.data;
        // Buscar la salida específica dentro de la ruta
        if (ruta.salidas) {
          const s = ruta.salidas.find((s: SalidaData) => s.id === parseInt(salidaId));
          if (s) {
            setSalida({ ...s, ruta: { origen: ruta.origen, destino: ruta.destino, duracion_estimada: ruta.duracion_estimada } });
          }
        }
      })
      .catch(() => {
        // Intentar obtener la salida directamente (si existe endpoint)
        setSalida(null);
      })
      .finally(() => setCargandoSalida(false));
  }, [salidaId]);

  const onSubmit = async (data: Formulario) => {
    if (!salida) return;
    setEnviando(true);
    try {
      const res = await api.post('/reservas/', {
        salida: parseInt(salidaId!),
        fecha_viaje: fechaStr,
        nombre: data.nombre,
        email: data.email,
        telefono: data.telefono,
        cantidad_asientos: data.cantidad_asientos,
      });
      setExito({ codigo: res.data.codigo });
    } catch {
      alert('Error al reservar. Intentalo de nuevo.');
    } finally {
      setEnviando(false);
    }
  };

  if (cargandoSalida) {
    return (
      <div className="flex items-center justify-center py-32">
        <Loader2 className="w-8 h-8 animate-spin text-amber-500" />
      </div>
    );
  }

  if (exito) {
    return (
      <div className="py-16 md:py-20 bg-white">
        <div className="max-w-lg mx-auto px-4 text-center">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="w-8 h-8 text-green-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">¡Reserva confirmada!</h2>
          <p className="text-gray-600 mb-2">Tu código de reserva es:</p>
          <div className="text-3xl font-bold text-amber-600 mb-6 tracking-wider">{exito.codigo}</div>
          <p className="text-sm text-gray-500 mb-8">
            Guardá este código. Te vamos a enviar los detalles por email.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link to="/buscar-viaje"
              className="bg-amber-500 text-gray-900 px-6 py-3 rounded-xl font-semibold hover:bg-amber-400 transition-all min-h-[48px] inline-flex items-center justify-center">
              Buscar otro viaje
            </Link>
            <Link to="/"
              className="bg-gray-100 text-gray-700 px-6 py-3 rounded-xl font-semibold hover:bg-gray-200 transition-all min-h-[48px] inline-flex items-center justify-center">
              Volver al inicio
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (!salida) {
    return (
      <div className="py-16 md:py-20 text-center">
        <p className="text-gray-500 mb-4">No se encontró la salida seleccionada.</p>
        <Link to="/buscar-viaje" className="text-amber-600 font-semibold hover:underline">
          Volver a buscar
        </Link>
      </div>
    );
  }

  return (
    <div className="py-16 md:py-20 bg-gray-50 min-h-screen">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <Link
          to={`/buscar-viaje?origen=${salida.ruta?.origen || ''}&destino=${salida.ruta?.destino || ''}`}
          className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700 mb-6"
        >
          <ArrowLeft className="w-4 h-4" />
          Volver a resultados
        </Link>

        {/* Resumen del viaje */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-4 sm:p-6 mb-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Resumen del viaje</h2>
          <div className="flex flex-col sm:flex-row sm:items-center gap-2 mb-4">
            <div className="flex items-center gap-2 text-gray-900 font-semibold">
              <span>{salida.ruta?.origen}</span>
              <span className="text-amber-500">→</span>
              <span>{salida.ruta?.destino}</span>
            </div>
          </div>
          <div className="flex flex-wrap gap-3 text-sm">
            <span className="inline-flex items-center gap-1 bg-blue-50 text-blue-700 px-3 py-1 rounded-full">
              <Calendar className="w-3.5 h-3.5" />
              {fechaStr || salida.dia_display}
            </span>
            <span className="inline-flex items-center gap-1 bg-gray-100 text-gray-700 px-3 py-1 rounded-full">
              <Clock className="w-3.5 h-3.5" />
              {salida.hora_salida.slice(0, 5)} hs
            </span>
            {salida.vehiculo_data && (
              <span className="inline-flex items-center gap-1 text-gray-500">
                <Users className="w-3.5 h-3.5" />
                {salida.vehiculo_data.nombre}
              </span>
            )}
            {salida.ruta?.duracion_estimada && (
              <span className="inline-flex items-center gap-1 text-gray-500">
                <Clock className="w-3.5 h-3.5" />
                {salida.ruta.duracion_estimada}
              </span>
            )}
          </div>
        </div>

        {/* Formulario de reserva */}
        <form onSubmit={handleSubmit(onSubmit)} className="bg-white rounded-2xl shadow-sm border border-gray-200 p-4 sm:p-6 space-y-4">
          <h2 className="text-lg font-semibold text-gray-900 mb-2">Tus datos</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Nombre completo</label>
              <input {...register('nombre')} className="w-full px-4 py-2.5 rounded-xl border border-gray-300 focus:ring-2 focus:ring-amber-500 focus:border-transparent outline-none" />
              {errors.nombre && <p className="text-red-500 text-xs mt-1">{errors.nombre.message}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
              <input {...register('email')} className="w-full px-4 py-2.5 rounded-xl border border-gray-300 focus:ring-2 focus:ring-amber-500 focus:border-transparent outline-none" />
              {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email.message}</p>}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Teléfono / WhatsApp</label>
            <input {...register('telefono')} className="w-full px-4 py-2.5 rounded-xl border border-gray-300 focus:ring-2 focus:ring-amber-500 focus:border-transparent outline-none" />
            {errors.telefono && <p className="text-red-500 text-xs mt-1">{errors.telefono.message}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              <span className="flex items-center gap-1"><Users className="w-3.5 h-3.5" /> Cantidad de asientos</span>
            </label>
            <input type="number" {...register('cantidad_asientos')} min="1" max={salida.vehiculo_data?.capacidad || 99}
              className="w-full px-4 py-2.5 rounded-xl border border-gray-300 focus:ring-2 focus:ring-amber-500 focus:border-transparent outline-none" />
            {errors.cantidad_asientos && <p className="text-red-500 text-xs mt-1">{errors.cantidad_asientos.message}</p>}
            {salida.vehiculo_data && (
              <p className="text-xs text-gray-400 mt-1">Máx: {salida.vehiculo_data.capacidad} asientos</p>
            )}
          </div>

          {/* Total */}
          {total > 0 && (
            <div className="bg-amber-50 rounded-xl p-4 flex items-center justify-between">
              <span className="text-sm font-medium text-gray-700">Total estimado</span>
              <span className="text-xl font-bold text-gray-900 flex items-center gap-1">
                <DollarSign className="w-5 h-5 text-green-600" />
                ${total.toLocaleString('es-AR')}
              </span>
            </div>
          )}

          <button type="submit" disabled={enviando}
            className="w-full flex items-center justify-center gap-2 bg-amber-500 text-gray-900 py-3 rounded-xl font-semibold hover:bg-amber-400 transition-all disabled:opacity-50 min-h-[48px]">
            {enviando ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
            {enviando ? 'Confirmando...' : 'Confirmar reserva'}
          </button>
        </form>
      </div>
    </div>
  );
}
