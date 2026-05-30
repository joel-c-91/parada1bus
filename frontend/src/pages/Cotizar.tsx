import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Calendar, CheckCircle, Loader2, MapPin, Send, Users } from 'lucide-react';
import api from '../lib/api';

const esquema = z.object({
  nombre: z.string().min(3, 'Ingresá tu nombre completo'),
  email: z.string().email('Ingresá un email válido'),
  telefono: z.string().min(8, 'Ingresá un teléfono válido'),
  origen: z.string().min(3, 'Ingresá el origen'),
  destino: z.string().min(3, 'Ingresá el destino'),
  fecha_viaje: z.string().min(1, 'Seleccioná una fecha'),
  cantidad_pasajeros: z.coerce.number().int().min(1, 'Mínimo 1 pasajero'),
  tipo_vehiculo: z.coerce.number().optional(),
  tipo_servicio: z.coerce.number().optional(),
  comentarios: z.string().optional(),
});

type Formulario = z.infer<typeof esquema>;

interface Opcion {
  id: number;
  nombre: string;
}

export default function Cotizar() {
  const [enviando, setEnviando] = useState(false);
  const [exito, setExito] = useState(false);
  const [vehiculos, setVehiculos] = useState<Opcion[]>([]);
  const [servicios, setServicios] = useState<Opcion[]>([]);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<Formulario>({ resolver: zodResolver(esquema) });

  useEffect(() => {
    api.get('/vehiculos/').then((res) => setVehiculos(res.data));
    api.get('/servicios/').then((res) => setServicios(res.data));
  }, []);

  const onSubmit = async (data: Formulario) => {
    setEnviando(true);
    try {
      await api.post('/solicitudes-charter/', data);
      setExito(true);
      reset();
    } catch {
      alert('Error al enviar la solicitud. Intentalo de nuevo.');
    } finally {
      setEnviando(false);
    }
  };

  if (exito) {
    return (
      <div className="py-16 md:py-20 bg-white">
        <div className="max-w-lg mx-auto px-4 text-center">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="w-8 h-8 text-green-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">¡Solicitud enviada!</h2>
          <p className="text-gray-600 mb-6">
            Te vamos a contactar a la brevedad con un presupuesto.
          </p>
          <button
            onClick={() => setExito(false)}
            className="bg-amber-500 text-gray-900 px-6 py-3 rounded-xl font-semibold hover:bg-amber-400 transition-all"
          >
            Enviar otra solicitud
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="py-16 md:py-20 bg-gray-50">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-8 md:mb-10">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Cotizá tu viaje</h1>
          <p className="text-gray-600">
            Completá el formulario y te enviaremos un presupuesto personalizado.
          </p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="bg-white rounded-2xl shadow-sm border border-gray-200 p-4 sm:p-8 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Nombre completo</label>
              <input {...register('nombre')} className="w-full px-4 py-2.5 rounded-xl border border-gray-300 focus:ring-2 focus:ring-amber-500 focus:border-transparent outline-none transition-all" />
              {errors.nombre && <p className="text-red-500 text-xs mt-1">{errors.nombre.message}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
              <input {...register('email')} className="w-full px-4 py-2.5 rounded-xl border border-gray-300 focus:ring-2 focus:ring-amber-500 focus:border-transparent outline-none transition-all" />
              {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email.message}</p>}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Teléfono / WhatsApp</label>
            <input {...register('telefono')} placeholder="+54 9 358 ..." className="w-full px-4 py-2.5 rounded-xl border border-gray-300 focus:ring-2 focus:ring-amber-500 focus:border-transparent outline-none transition-all" />
            {errors.telefono && <p className="text-red-500 text-xs mt-1">{errors.telefono.message}</p>}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                <span className="flex items-center gap-1"><MapPin className="w-3.5 h-3.5" /> Origen</span>
              </label>
              <input {...register('origen')} placeholder="Ej: Río Cuarto" className="w-full px-4 py-2.5 rounded-xl border border-gray-300 focus:ring-2 focus:ring-amber-500 focus:border-transparent outline-none transition-all" />
              {errors.origen && <p className="text-red-500 text-xs mt-1">{errors.origen.message}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                <span className="flex items-center gap-1"><MapPin className="w-3.5 h-3.5" /> Destino</span>
              </label>
              <input {...register('destino')} placeholder="Ej: Córdoba" className="w-full px-4 py-2.5 rounded-xl border border-gray-300 focus:ring-2 focus:ring-amber-500 focus:border-transparent outline-none transition-all" />
              {errors.destino && <p className="text-red-500 text-xs mt-1">{errors.destino.message}</p>}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                <span className="flex items-center gap-1"><Calendar className="w-3.5 h-3.5" /> Fecha del viaje</span>
              </label>
              <input type="date" {...register('fecha_viaje')} className="w-full px-4 py-2.5 rounded-xl border border-gray-300 focus:ring-2 focus:ring-amber-500 focus:border-transparent outline-none transition-all" />
              {errors.fecha_viaje && <p className="text-red-500 text-xs mt-1">{errors.fecha_viaje.message}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                <span className="flex items-center gap-1"><Users className="w-3.5 h-3.5" /> Pasajeros</span>
              </label>
              <input type="number" {...register('cantidad_pasajeros')} min="1" className="w-full px-4 py-2.5 rounded-xl border border-gray-300 focus:ring-2 focus:ring-amber-500 focus:border-transparent outline-none transition-all" />
              {errors.cantidad_pasajeros && <p className="text-red-500 text-xs mt-1">{errors.cantidad_pasajeros.message}</p>}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Tipo de vehículo (opcional)</label>
              <select {...register('tipo_vehiculo')} className="w-full px-4 py-2.5 rounded-xl border border-gray-300 focus:ring-2 focus:ring-amber-500 focus:border-transparent outline-none transition-all bg-white">
                <option value="">— Cualquiera —</option>
                {vehiculos.map((v) => (
                  <option key={v.id} value={v.id}>{v.nombre}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Tipo de servicio (opcional)</label>
              <select {...register('tipo_servicio')} className="w-full px-4 py-2.5 rounded-xl border border-gray-300 focus:ring-2 focus:ring-amber-500 focus:border-transparent outline-none transition-all bg-white">
                <option value="">— Seleccioná —</option>
                {servicios.map((s) => (
                  <option key={s.id} value={s.id}>{s.nombre}</option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Comentarios adicionales</label>
            <textarea {...register('comentarios')} rows={3} placeholder="Contanos más detalles de tu viaje..." className="w-full px-4 py-2.5 rounded-xl border border-gray-300 focus:ring-2 focus:ring-amber-500 focus:border-transparent outline-none transition-all resize-none" />
          </div>

          <button
            type="submit"
            disabled={enviando}
            className="w-full flex items-center justify-center gap-2 bg-amber-500 text-gray-900 py-3 rounded-xl font-semibold hover:bg-amber-400 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {enviando ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
            {enviando ? 'Enviando...' : 'Solicitar presupuesto'}
          </button>
        </form>
      </div>
    </div>
  );
}
