import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Loader2 } from 'lucide-react';
import api from '../lib/api';

interface Servicio {
  id: number;
  nombre: string;
  descripcion_corta: string;
  descripcion_larga: string;
  imagen?: string;
}

export default function Servicios() {
  const [servicios, setServicios] = useState<Servicio[]>([]);
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    api.get('/servicios/')
      .then((res) => setServicios(res.data))
      .finally(() => setCargando(false));
  }, []);

  if (cargando) {
    return (
      <div className="flex items-center justify-center py-32">
        <Loader2 className="w-8 h-8 animate-spin text-rojo" />
      </div>
    );
  }

  return (
    <div className="py-16 md:py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Servicios</h1>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Conoce todos los servicios de transporte que ofrecemos. Viajá con la
            tranquilidad de estar en buenas manos.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {servicios.map((s) => (
            <div key={s.id} className="bg-white rounded-2xl border border-gray-200 overflow-hidden hover:shadow-lg transition-shadow">
              <div className="h-40 md:h-48 bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center overflow-hidden">
                {s.imagen ? (
                  <img
                    src={s.imagen}
                    alt={s.nombre}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="text-center">
                    <div className="w-10 h-10 rounded-full bg-gray-200 mx-auto mb-2" />
                    <span className="text-xs text-gray-400">Foto próximamente</span>
                  </div>
                )}
              </div>
              <div className="p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-2">{s.nombre}</h2>
                <p className="text-gray-600">{s.descripcion_larga || s.descripcion_corta}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="text-center mt-12">
          <Link
            to="/cotizar"
            className="inline-flex items-center gap-2 bg-rojo text-white px-6 py-3 rounded-xl font-semibold hover:bg-red-700 transition-all"
          >
            Cotizá tu viaje <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </div>
  );
}
