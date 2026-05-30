import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { CheckCircle, Loader2, Mail, MapPin, Phone, Send } from 'lucide-react';
import api from '../lib/api';

const esquema = z.object({
  nombre: z.string().min(3, 'Ingresá tu nombre'),
  email: z.string().email('Ingresá un email válido'),
  asunto: z.string().min(5, 'Ingresá un asunto'),
  mensaje: z.string().min(10, 'Escribí un mensaje de al menos 10 caracteres'),
});

type Formulario = z.infer<typeof esquema>;

export default function Contacto() {
  const { register, handleSubmit, formState: { errors }, reset } = useForm<Formulario>({
    resolver: zodResolver(esquema),
  });
  const [enviando, setEnviando] = useState(false);
  const [exito, setExito] = useState(false);

  const onSubmit = async (data: Formulario) => {
    setEnviando(true);
    try {
      await api.post('/contacto/', data);
      setExito(true);
      reset();
    } catch {
      alert('Error al enviar el mensaje. Intentalo de nuevo.');
    } finally {
      setEnviando(false);
    }
  };

  if (exito) {
    return (
      <div className="py-16 md:py-20 bg-gray-50 min-h-screen">
        <div className="max-w-lg mx-auto px-4 text-center">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="w-8 h-8 text-green-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">¡Mensaje enviado!</h2>
          <p className="text-gray-600 mb-6">
            Gracias por contactarte. Te responderemos a la brevedad.
          </p>
          <button
            onClick={() => setExito(false)}
            className="bg-rojo text-white px-6 py-3 rounded-xl font-semibold hover:bg-red-700 transition-all"
          >
            Enviar otro mensaje
          </button>
        </div>
      </div>
    );
  }

  return (
    <>
      {/* Contacto hero */}
      <section className="bg-gradient-to-br from-francia via-francia-claro to-francia text-white py-16 md:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl font-bold mb-4">Contacto</h1>
            <p className="text-lg text-gray-300 max-w-2xl mx-auto">
              Estamos para ayudarte. Escribinos o visitanos, y te respondemos a la brevedad.
            </p>
          </div>
        </div>
      </section>

      {/* Info + Form */}
      <section className="py-16 md:py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Info de contacto */}
            <div className="space-y-6">
              <div className="bg-white rounded-2xl p-6 border border-gray-200">
                <h3 className="font-semibold text-gray-900 mb-4">Información de contacto</h3>
                <div className="space-y-4">
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 bg-rojo-claro rounded-xl flex items-center justify-center flex-shrink-0">
                      <MapPin className="w-5 h-5 text-rojo" />
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">Dirección</p>
                      <p className="text-sm text-gray-600">Río Cuarto, Córdoba, Argentina</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 bg-rojo-claro rounded-xl flex items-center justify-center flex-shrink-0">
                      <Phone className="w-5 h-5 text-rojo" />
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">Teléfono / WhatsApp</p>
                      <p className="text-sm text-gray-600">+54 9 358 4311 718</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 bg-rojo-claro rounded-xl flex items-center justify-center flex-shrink-0">
                      <Mail className="w-5 h-5 text-rojo" />
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">Email</p>
                      <p className="text-sm text-gray-600">info@parada1bus.com</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-gradient-to-br from-rojo-claro to-red-100 rounded-2xl p-6">
                <h3 className="font-semibold text-gray-900 mb-2">¿Consulta rápida?</h3>
                <p className="text-sm text-gray-600 mb-4">
                  Respondemos al instante por WhatsApp.
                </p>
                <a
                  href="https://wa.me/3584311718"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 bg-rojo text-white px-4 py-2 rounded-xl text-sm font-semibold hover:bg-red-700 transition-all"
                >
                  Escribinos ahora
                </a>
              </div>
            </div>

            {/* Formulario */}
            <div className="lg:col-span-2">
              <form onSubmit={handleSubmit(onSubmit)} className="bg-white rounded-2xl shadow-sm border border-gray-200 p-4 sm:p-8 space-y-5">
                <h3 className="text-xl font-semibold text-gray-900 mb-2">Envíanos un mensaje</h3>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Nombre</label>
                  <input {...register('nombre')} className="w-full px-4 py-2.5 rounded-xl border border-gray-300 focus:ring-2 focus:ring-rojo focus:border-transparent outline-none transition-all" />
                  {errors.nombre && <p className="text-red-500 text-xs mt-1">{errors.nombre.message}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                  <input {...register('email')} className="w-full px-4 py-2.5 rounded-xl border border-gray-300 focus:ring-2 focus:ring-rojo focus:border-transparent outline-none transition-all" />
                  {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email.message}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Asunto</label>
                  <input {...register('asunto')} className="w-full px-4 py-2.5 rounded-xl border border-gray-300 focus:ring-2 focus:ring-rojo focus:border-transparent outline-none transition-all" />
                  {errors.asunto && <p className="text-red-500 text-xs mt-1">{errors.asunto.message}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Mensaje</label>
                  <textarea {...register('mensaje')} rows={5} className="w-full px-4 py-2.5 rounded-xl border border-gray-300 focus:ring-2 focus:ring-rojo focus:border-transparent outline-none transition-all resize-none" />
                  {errors.mensaje && <p className="text-red-500 text-xs mt-1">{errors.mensaje.message}</p>}
                </div>

                <button
                  type="submit"
                  disabled={enviando}
                  className="w-full flex items-center justify-center gap-2 bg-rojo text-white py-3 rounded-xl font-semibold hover:bg-red-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {enviando ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
                  {enviando ? 'Enviando...' : 'Enviar mensaje'}
                </button>
              </form>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
