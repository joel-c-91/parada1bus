import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useState } from 'react';
import { CheckCircle, Loader2, Mail, MapPin, Phone, Send } from 'lucide-react';
import { Instagram } from '../components/ui/Instagram';
import api from '../lib/api';

const esquema = z.object({
  nombre: z.string().min(3, 'Ingresá tu nombre'),
  email: z.string().email('Email inválido'),
  telefono: z.string().optional(),
  motivo: z.string().min(1, 'Seleccioná un motivo'),
  mensaje: z.string().min(10, 'Escribí un mensaje de al menos 10 caracteres'),
});

type Formulario = z.infer<typeof esquema>;

export default function Contacto() {
  const [enviando, setEnviando] = useState(false);
  const [exito, setExito] = useState(false);

  const { register, handleSubmit, formState: { errors }, reset } = useForm<Formulario>({
    resolver: zodResolver(esquema),
  });

  const onSubmit = async (data: Formulario) => {
    setEnviando(true);
    try {
      await api.post('/contacto/', data);
      setExito(true);
      reset();
    } catch {
      alert('Error al enviar. Intentalo de nuevo.');
    } finally {
      setEnviando(false);
    }
  };

  return (
    <div className="py-16 md:py-20 bg-white">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Contacto</h1>
          <p className="text-gray-600">Estamos para ayudarte. Respondemos al instante.</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          <div className="space-y-6">
            <div className="bg-gray-50 rounded-2xl p-6 flex items-start gap-4">
              <div className="w-10 h-10 bg-green-100 rounded-xl flex items-center justify-center flex-shrink-0">
                <Phone className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">WhatsApp</h3>
                <p className="text-sm text-gray-600">Respuesta inmediata</p>
                <a href="https://wa.me/5493584000000" className="text-sm text-green-600 font-medium hover:underline">
                  +54 9 358 400-0000
                </a>
              </div>
            </div>

            <div className="bg-gray-50 rounded-2xl p-6 flex items-start gap-4">
              <div className="w-10 h-10 bg-amber-100 rounded-xl flex items-center justify-center flex-shrink-0">
                <Mail className="w-5 h-5 text-amber-600" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">Email</h3>
                <p className="text-sm text-gray-600">Respondemos en 24 hs</p>
                <a href="mailto:info@parada1bus.com" className="text-sm text-amber-600 font-medium hover:underline">
                  info@parada1bus.com
                </a>
              </div>
            </div>

            <div className="bg-gray-50 rounded-2xl p-6 flex items-start gap-4">
              <div className="w-10 h-10 bg-purple-100 rounded-xl flex items-center justify-center flex-shrink-0">
                <Instagram className="w-5 h-5 text-purple-600" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">Instagram</h3>
                <p className="text-sm text-gray-600">Seguinos para ver nuestros viajes</p>
                <a href="https://instagram.com/parada1bus" target="_blank" className="text-sm text-purple-600 font-medium hover:underline">
                  @parada1bus
                </a>
              </div>
            </div>

            <div className="bg-gray-50 rounded-2xl p-6 flex items-start gap-4">
              <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center flex-shrink-0">
                <MapPin className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">Ubicación</h3>
                <p className="text-sm text-gray-600">
                  Río Cuarto, Córdoba, Argentina<br />
                  Cubrimos toda la provincia y destinos nacionales
                </p>
              </div>
            </div>
          </div>

          <div>
            {exito ? (
              <div className="bg-green-50 rounded-2xl p-8 text-center">
                <CheckCircle className="w-12 h-12 text-green-600 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-900 mb-2">¡Mensaje enviado!</h3>
                <p className="text-gray-600 mb-4">Te respondemos a la brevedad.</p>
                <button onClick={() => setExito(false)} className="text-amber-600 font-semibold hover:underline">
                  Enviar otro mensaje
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit(onSubmit)} className="bg-gray-50 rounded-2xl p-8 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Nombre</label>
                  <input {...register('nombre')} className="w-full px-4 py-2.5 rounded-xl border border-gray-300 focus:ring-2 focus:ring-amber-500 focus:border-transparent outline-none bg-white" />
                  {errors.nombre && <p className="text-red-500 text-xs mt-1">{errors.nombre.message}</p>}
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                    <input {...register('email')} className="w-full px-4 py-2.5 rounded-xl border border-gray-300 focus:ring-2 focus:ring-amber-500 focus:border-transparent outline-none bg-white" />
                    {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email.message}</p>}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Teléfono</label>
                    <input {...register('telefono')} className="w-full px-4 py-2.5 rounded-xl border border-gray-300 focus:ring-2 focus:ring-amber-500 focus:border-transparent outline-none bg-white" />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Motivo</label>
                  <select {...register('motivo')} className="w-full px-4 py-2.5 rounded-xl border border-gray-300 focus:ring-2 focus:ring-amber-500 focus:border-transparent outline-none bg-white">
                    <option value="">Seleccioná un motivo</option>
                    <option value="consulta">Consulta general</option>
                    <option value="presupuesto">Solicitar presupuesto</option>
                    <option value="reclamo">Reclamo</option>
                    <option value="otro">Otro</option>
                  </select>
                  {errors.motivo && <p className="text-red-500 text-xs mt-1">{errors.motivo.message}</p>}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Mensaje</label>
                  <textarea {...register('mensaje')} rows={4} className="w-full px-4 py-2.5 rounded-xl border border-gray-300 focus:ring-2 focus:ring-amber-500 focus:border-transparent outline-none bg-white resize-none" />
                  {errors.mensaje && <p className="text-red-500 text-xs mt-1">{errors.mensaje.message}</p>}
                </div>
                <button type="submit" disabled={enviando}
                  className="w-full flex items-center justify-center gap-2 bg-amber-500 text-gray-900 py-3 rounded-xl font-semibold hover:bg-amber-400 transition-all disabled:opacity-50">
                  {enviando ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
                  {enviando ? 'Enviando...' : 'Enviar mensaje'}
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
