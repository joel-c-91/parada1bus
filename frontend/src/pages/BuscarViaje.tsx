import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Calendar, Loader2, MapPin, Search, ArrowRight, Clock, Users, DollarSign } from 'lucide-react';
import api from '../lib/api';

interface Salida {
  id: number;
  dia_semana: string;
  dia_display: string;
  hora_salida: string;
  precio_base: string;
  vehiculo_data: { nombre: string; capacidad: number } | null;
}

interface Ruta {
  id: number;
  nombre: string;
  origen: string;
  destino: string;
  duracion_estimada: string;
  salidas: Salida[];
}

export default function BuscarViaje() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const [origen, setOrigen] = useState(searchParams.get('origen') || '');
  const [destino, setDestino] = useState(searchParams.get('destino') || '');
  const [fecha, setFecha] = useState('');
  const [resultados, setResultados] = useState<Ruta[]>([]);
  const [busco, setBusco] = useState(false);
  const [cargando, setCargando] = useState(false);
  const [mensaje, setMensaje] = useState('');

  const DIAS_MAP: Record<string, string> = {
    'lun': 'Lunes', 'mar': 'Martes', 'mie': 'Miércoles',
    'jue': 'Jueves', 'vie': 'Viernes', 'sab': 'Sábado', 'dom': 'Domingo'
  };

  function obtenerDiaSemana(fechaStr: string): string {
    if (!fechaStr) return '';
    const dias = ['dom', 'lun', 'mar', 'mie', 'jue', 'vie', 'sab'];
    const d = new Date(fechaStr + 'T12:00:00');
    return dias[d.getDay()];
  }

  function filtrarSalidas(ruta: Ruta, diaCodigo: string): Salida[] {
    if (!diaCodigo) return ruta.salidas;
    return ruta.salidas.filter(s => s.dia_semana === diaCodigo);
  }

  async function buscar(e: React.FormEvent) {
    e.preventDefault();
    if (!origen || !destino) return;

    setCargando(true);
    setBusco(true);
    setMensaje('');

    try {
      const res = await api.get('/rutas/buscar/', {
        params: { origen, destino, fecha }
      });
      if (res.data.resultados && res.data.resultados.length > 0) {
        setResultados(res.data.resultados);
      } else {
        setResultados([]);
        setMensaje(res.data.mensaje || 'No se encontraron rutas');
      }
    } catch {
      setResultados([]);
      setMensaje('Error al buscar. Intentalo de nuevo.');
    } finally {
      setCargando(false);
    }
  }

  const diaSemana = obtenerDiaSemana(fecha);

  return (
    <div className="py-16 md:py-20 bg-gray-50 min-h-screen">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-8 md:mb-10">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Buscar Viaje
          </h1>
          <p className="text-gray-600">
            Encontrá horarios y disponibilidad para nuestras rutas fijas.
          </p>
        </div>

        {/* Formulario de búsqueda */}
        <form onSubmit={buscar} className="bg-white rounded-2xl shadow-sm border border-gray-200 p-4 sm:p-6 mb-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">
                <span className="flex items-center gap-1"><MapPin className="w-3 h-3" /> Origen</span>
              </label>
              <input
                value={origen}
                onChange={(e) => setOrigen(e.target.value)}
                placeholder="Ej: Río Cuarto"
                className="w-full px-3 py-2.5 rounded-xl border border-gray-300 focus:ring-2 focus:ring-amber-500 focus:border-transparent outline-none text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">
                <span className="flex items-center gap-1"><MapPin className="w-3 h-3" /> Destino</span>
              </label>
              <input
                value={destino}
                onChange={(e) => setDestino(e.target.value)}
                placeholder="Ej: Córdoba"
                className="w-full px-3 py-2.5 rounded-xl border border-gray-300 focus:ring-2 focus:ring-amber-500 focus:border-transparent outline-none text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">
                <span className="flex items-center gap-1"><Calendar className="w-3 h-3" /> Fecha</span>
              </label>
              <input
                type="date"
                value={fecha}
                onChange={(e) => setFecha(e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl border border-gray-300 focus:ring-2 focus:ring-amber-500 focus:border-transparent outline-none text-sm"
              />
            </div>
            <div className="flex items-end">
              <button
                type="submit"
                disabled={cargando || !origen || !destino}
                className="w-full flex items-center justify-center gap-2 bg-amber-500 text-gray-900 py-2.5 rounded-xl font-semibold hover:bg-amber-400 transition-all disabled:opacity-50 min-h-[44px] text-sm"
              >
                {cargando ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
                {cargando ? 'Buscando...' : 'Buscar'}
              </button>
            </div>
          </div>
        </form>

        {/* Resultados */}
        {cargando && (
          <div className="flex justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-amber-500" />
          </div>
        )}

        {!cargando && busco && mensaje && (
          <div className="text-center py-12 bg-white rounded-2xl border border-gray-200">
            <div className="text-gray-400 mb-2">
              <MapPin className="w-12 h-12 mx-auto" />
            </div>
            <p className="text-gray-600">{mensaje}</p>
          </div>
        )}

        {!cargando && resultados.map((ruta) => {
          const salidasFiltradas = filtrarSalidas(ruta, diaSemana);
          if (salidasFiltradas.length === 0 && diaSemana) return null;

          return (
            <div key={ruta.id} className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden mb-4">
              <div className="bg-gradient-to-r from-amber-50 to-orange-50 p-4 sm:p-6 border-b border-gray-100">
                <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                  <div className="flex items-center gap-2 text-gray-900 font-semibold">
                    <span className="text-lg">{ruta.origen}</span>
                    <ArrowRight className="w-4 h-4 text-amber-500" />
                    <span className="text-lg">{ruta.destino}</span>
                  </div>
                  {ruta.duracion_estimada && (
                    <div className="flex items-center gap-1 text-sm text-gray-500 sm:ml-4">
                      <Clock className="w-3.5 h-3.5" />
                      {ruta.duracion_estimada}
                    </div>
                  )}
                </div>
              </div>

              <div className="divide-y divide-gray-100">
                {salidasFiltradas.map((salida) => (
                  <div key={salida.id} className="p-4 sm:p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-gray-50 transition-colors">
                    <div className="flex flex-wrap items-center gap-2 sm:gap-4">
                      <span className="inline-flex items-center gap-1 bg-blue-50 text-blue-700 px-3 py-1 rounded-full text-xs font-medium">
                        <Calendar className="w-3 h-3" />
                        {salida.dia_display}
                      </span>
                      <span className="inline-flex items-center gap-1 bg-gray-100 text-gray-700 px-3 py-1 rounded-full text-xs font-medium">
                        <Clock className="w-3 h-3" />
                        {salida.hora_salida.slice(0, 5)} hs
                      </span>
                      {salida.vehiculo_data && (
                        <span className="inline-flex items-center gap-1 text-xs text-gray-500">
                          <Users className="w-3 h-3" />
                          {salida.vehiculo_data.nombre} ({salida.vehiculo_data.capacidad} pax)
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="flex items-center gap-1 text-lg font-bold text-gray-900">
                        <DollarSign className="w-4 h-4 text-green-600" />
                        ${parseFloat(salida.precio_base).toLocaleString('es-AR')}
                      </div>
                      <button
                        onClick={() => navigate(`/reservar/${salida.id}?fecha=${fecha}`)}
                        className="bg-amber-500 text-gray-900 px-4 py-2 rounded-xl text-sm font-semibold hover:bg-amber-400 transition-all min-h-[44px] whitespace-nowrap"
                      >
                        Reservar
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          );
        })}

        {!cargando && busco && resultados.length > 0 && !resultados.some(r =>
          diaSemana ? filtrarSalidas(r, diaSemana).length > 0 : true
        ) && (
          <div className="text-center py-8 text-gray-500 text-sm">
            No hay salidas disponibles para {fecha ? `el ${fecha}` : 'esa fecha'}. Probá con otra fecha.
          </div>
        )}
      </div>
    </div>
  );
}
