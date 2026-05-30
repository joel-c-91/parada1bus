import { useEffect, useState } from 'react';
import { Loader2, Users } from 'lucide-react';
import api from '../lib/api';

interface Vehiculo {
  id: number;
  nombre: string;
  tipo: string;
  tipo_display: string;
  capacidad: number;
  descripcion: string;
}

export default function Flota() {
  const [vehiculos, setVehiculos] = useState<Vehiculo[]>([]);
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    api.get('/vehiculos/')
      .then((res) => setVehiculos(res.data))
      .finally(() => setCargando(false));
  }, []);

  if (cargando) {
    return (
      <div className="flex items-center justify-center py-32">
        <Loader2 className="w-8 h-8 animate-spin text-rojo" />
      </div>
    );
  }

  const colores: Record<string, string> = {
    van: 'bg-red-100 text-red-800 border-red-200',
    minibus: 'bg-blue-100 text-blue-800 border-blue-200',
    bus: 'bg-purple-100 text-purple-800 border-purple-200',
  };

  return (
    <div className="py-16 md:py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Nuestra Flota</h1>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Contamos con vehículos modernos y equipados para brindarte la mejor
            experiencia de viaje.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {vehiculos.map((v) => (
            <div key={v.id} className="bg-white rounded-2xl border border-gray-200 overflow-hidden hover:shadow-lg transition-shadow">
              <div className="h-40 md:h-48 bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
                <div className="text-center">
                  <Users className="w-10 h-10 text-gray-300 mx-auto mb-2" />
                  <span className="text-xs text-gray-400">Foto próximamente</span>
                </div>
              </div>
              <div className="p-6">
                <div className="flex items-center justify-between mb-3">
                  <span className={`text-xs font-semibold px-3 py-1 rounded-full border ${colores[v.tipo] || 'bg-gray-100 text-gray-800'}`}>
                    {v.tipo_display}
                  </span>
                  <div className="flex items-center gap-1 text-sm text-gray-500">
                    <Users className="w-4 h-4" />
                    {v.capacidad} pax
                  </div>
                </div>
                <h3 className="text-lg font-semibold text-gray-900">{v.nombre}</h3>
                <p className="text-sm text-gray-600 mt-1">{v.descripcion}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
