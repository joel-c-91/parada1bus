import { useEffect, useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { ArrowRight, CheckCircle, Loader2, MapPin } from 'lucide-react';
import api from '../lib/api';

const esquema = z.object({
  nombre: z.string().min(3, 'Ingresá tu nombre completo'),
  email: z.string().email('Ingresá un email válido'),
  telefono: z.string().min(8, 'Ingresá un teléfono válido'),
  cantidad: z.string().min(1, 'Ingresá la cantidad'),
});

type Formulario = z.infer<typeof esquema>;

interface Salida {
  id: number;
  ruta_nombre: string;
  origen: string;
  destino: string;
  fecha_salida: string;
  hora_salida: string;
  precio: string;
  vehiculo_nombre: string;
  asientos_disponibles: number;
}

const formatearFecha = (fecha: string) => {
  const d = new Date(fecha + 'T00:00:00');
  return d.toLocaleDateString('es-AR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
};

const formatearHora = (hora: string) => hora.slice(0, 5);

export default function Reservar() {
  const [searchParams] = useSearchParams();
  const salidaId = searchParams.get('salida');

  const [salida, setSalida] = useState<Salida | null>(null);
  const [cargandoSalida, setCargandoSalida] = useState(true);
  const [enviando, setEnviando] = useState(false);
  const [exito, setExito] = useState<{ codigo: string } | null>(null);

  const { register, handleSubmit, formState: { errors } } = useForm<Formulario>({
    resolver: zodResolver(esquema),
    defaultValues: { cantidad: '1' },
  });

  useEffect(() => {
    if (!salidaId) {
      setCargandoSalida(false);
      return;
    }
    api.get(`/salidas/${salidaId}/`)
      .then((res) => setSalida(res.data))
      .finally(() => setCargandoSalida(false));
  }, [salidaId]);

  const onSubmit = async (data: Formulario) => {
    if (!salidaId) return;
    setEnviando(true);
    try {
      const res = await api.post('/reservas/', {
        salida: Number(salidaId),
        nombre: data.nombre,
        email: data.email,
        telefono: data.telefono,
        cantidad_pasajeros: parseInt(data.cantidad),
      });
      setExito({ codigo: res.data.codigo_reserva });
    } catch {
      alert('Error al realizar la reserva. Intentalo de nuevo.');
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
            {formatearFecha(salida.fecha_salida)} — {formatearHora(salida.hora_salida)}
          </div>
          <div className="flex items-center gap-2 mb-2">
            <span className="font-semibold text-gray-900">{salida.origen}</span>
            <ArrowRight className="w-4 h-4 text-gray-400" />
            <span className="font-semibold text-gray-900">{salida.destino}</span>
          </div>
          <div className="flex items-center gap-4 text-sm text-gray-500">
            <span>{salida.vehiculo_nombre}</span>
            <span className="text-lg font-bold text-rojo">${salida.precio}</span>
          </div>
        </div>

        {/* Formulario */}
        <form onSubmit={handleSubmit(onSubmit)} className="bg-white rounded-2xl shadow-sm border border-gray-200 p-4 sm:p-8 space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Nombre completo</label>
            <input {...register('nombre')} className="w-full px-4 py-2.5 rounded-xl border border-gray-300 focus:ring-2 focus:ring-rojo focus:border-transparent outline-none transition-all" />
            {errors.nombre && <p className="text-red-500 text-xs mt-1">{errors.nombre.message}</p>}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
              <input {...register('email')} className="w-full px-4 py-2.5 rounded-xl border border-gray-300 focus:ring-2 focus:ring-rojo focus:border-transparent outline-none transition-all" />
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
            <input type="number" {...register('cantidad')} min="1" className="w-full px-4 py-2.5 rounded-xl border border-gray-300 focus:ring-2 focus:ring-rojo focus:border-transparent outline-none transition-all" />
            {errors.cantidad && <p className="text-red-500 text-xs mt-1">{errors.cantidad.message}</p>}
          </div>

          <button
            type="submit"
            disabled={enviando}
            className="w-full flex items-center justify-center gap-2 bg-rojo text-white py-3 rounded-xl font-semibold hover:bg-red-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {enviando ? <Loader2 className="w-5 h-5 animate-spin" /> : <CheckCircle className="w-5 h-5" />}
            {enviando ? 'Reservando...' : 'Confirmar reserva'}
          </button>
        </form>
      </div>
    </div>
  );
}
