import { useEffect, useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { ArrowRight, Calendar, Loader2, MapPin, Search, Users } from 'lucide-react';
import api from '../lib/api';

interface Salida {
  id: number;
  ruta_nombre: string;
  origen: string;
  destino: string;
  dia_semana: 'lun'|'mar'|'mie'|'jue'|'vie'|'sab'|'dom';
  dia_display: string;
  hora_salida: string;
  precio: string;
  vehiculo_nombre: string | null;
  capacidad: number | null;
  asientos_disponibles: number | null;
}

interface RutaPopular {
  origen: string;
  destino: string;
}

const rutasPopulares: RutaPopular[] = [
  { origen: 'Río Cuarto', destino: 'Córdoba' },
  { origen: 'Córdoba', destino: 'Río Cuarto' },
  { origen: 'Río Cuarto', destino: 'Mendoza' },
  { origen: 'Mendoza', destino: 'Río Cuarto' },
];

const formatearHora = (hora: string) => {
  return hora.slice(0, 5);
};

export default function BuscarViaje() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [origen, setOrigen] = useState(searchParams.get('origen') || '');
  const [destino, setDestino] = useState(searchParams.get('destino') || '');
  const [resultados, setResultados] = useState<Salida[]>([]);
  const [cargando, setCargando] = useState(false);
  const [buscado, setBuscado] = useState(false);
  const [mensajeError, setMensajeError] = useState<string | null>(null);

  /** Consulta la API. Recibe origen y destino explicitos porque al disparar
   *  una busqueda desde un boton, el estado todavia no esta actualizado. */
  const ejecutarBusqueda = async (desde: string, hasta: string) => {
    setCargando(true);
    setBuscado(true);
    setMensajeError(null);
    setSearchParams({ origen: desde, destino: hasta }, { replace: true });

    try {
      // El backend envuelve la lista en { resultados: [...] }.
      const res = await api.get<RespuestaBusqueda>('/rutas/buscar/', {
        params: { origen: desde, destino: hasta },
      });
      setResultados(res.data.resultados ?? []);
    } catch (error) {
      setResultados([]);
      setMensajeError(
        extraerMensajeError(error, 'Ocurrió un error al buscar viajes. Intentá de nuevo.'),
      );
    } finally {
      setCargando(false);
    }
  };

  const buscar = (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!origen.trim() || !destino.trim()) {
      setMensajeError('Por favor, ingresá origen y destino.');
      return;
    }
    void ejecutarBusqueda(origen.trim(), destino.trim());
  };

  const buscarRutaPopular = (r: RutaPopular) => {
    setOrigen(r.origen);
    setDestino(r.destino);
    void ejecutarBusqueda(r.origen, r.destino);
  };

  // Solo al montar, para resolver el enlace profundo /buscar?origen=X&destino=Y.
  // Depender de searchParams reentraria: cada busqueda escribe la URL y el
  // efecto volveria a disparar la busqueda.
  useEffect(() => {
    const desde = searchParams.get('origen');
    const hasta = searchParams.get('destino');
    if (desde && hasta) {
      void ejecutarBusqueda(desde, hasta);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);


  return (
    <div className="py-16 md:py-20 bg-gray-50 min-h-screen">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-8 md:mb-10">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Buscar Viaje</h1>
          <p className="text-gray-600">Encontrá horarios y precios para tu próximo viaje.</p>
        </div>

        {/* Buscador */}
        <form onSubmit={buscar} className="bg-white rounded-2xl shadow-sm border border-gray-200 p-4 sm:p-6 mb-8">
          <div className="grid grid-cols-1 sm:grid-cols-[1fr,auto,1fr,auto] gap-3 items-end">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Origen</label>
              <input
                value={origen}
                onChange={(e) => setOrigen(e.target.value)}
                placeholder="Ej: Río Cuarto"
                className="w-full px-4 py-2.5 rounded-xl border border-gray-300 focus:ring-2 focus:ring-rojo focus:border-transparent outline-none transition-all"
              />
            </div>
            <div className="hidden sm:flex justify-center pb-2">
              <ArrowRight className="w-5 h-5 text-gray-400" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Destino</label>
              <input
                value={destino}
                onChange={(e) => setDestino(e.target.value)}
                placeholder="Ej: Córdoba"
                className="w-full px-4 py-2.5 rounded-xl border border-gray-300 focus:ring-2 focus:ring-rojo focus:border-transparent outline-none transition-all"
              />
            </div>
            <button
              type="submit"
              disabled={cargando || !origen.trim() || !destino.trim()}
              className="flex items-center justify-center gap-2 bg-rojo text-white px-6 py-2.5 rounded-xl font-semibold hover:bg-red-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed min-h-[44px]"
            >
              {cargando ? <Loader2 className="w-5 h-5 animate-spin" /> : <Search className="w-5 h-5" />}
              <span className="hidden sm:inline">Buscar</span>
            </button>
          </div>
        </form>

        {/* Rutas populares (antes de buscar) */}
        {!buscado && (
          <div className="mb-8">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Rutas más buscadas</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {rutasPopulares.map((r) => (
                <button
                  key={`${r.origen}-${r.destino}`}
                  onClick={() => buscarRutaPopular(r)}
                  className="flex items-center justify-between bg-white rounded-xl p-4 border border-gray-200 hover:border-rojo hover:shadow-sm transition-all text-left"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-rojo-claro rounded-lg flex items-center justify-center">
                      <MapPin className="w-4 h-4 text-rojo" />
                    </div>
                    <div>
                      <span className="font-medium text-gray-900">{r.origen}</span>
                      <ArrowRight className="w-3.5 h-3.5 inline mx-2 text-gray-400" />
                      <span className="font-medium text-gray-900">{r.destino}</span>
                    </div>
                  </div>
                  <Search className="w-4 h-4 text-gray-400 flex-shrink-0" />
                </button>
              ))}
            </div>
          </div>
        )}

        {mensajeError && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-xl relative mb-8" role="alert">
            <strong className="font-bold">¡Error!</strong>
            <span className="block sm:inline"> {mensajeError}</span>
          </div>
        )}

        {/* Estado vacío */}
        {buscado && !cargando && resultados.length === 0 && !mensajeError && (
          <div className="text-center py-12 bg-white rounded-2xl border border-gray-200">
            <Search className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Sin resultados</h3>
            <p className="text-gray-500 max-w-md mx-auto mb-6">
              No encontramos viajes de <strong>{searchParams.get('origen')}</strong> a{' '}
              <strong>{searchParams.get('destino')}</strong>. Probá con otra búsqueda o
              contactanos para un viaje especial.
            </p>
            <Link
              to="/cotizar"
              className="inline-flex items-center gap-2 bg-rojo text-white px-6 py-3 rounded-xl font-semibold hover:bg-red-700 transition-all"
            >
              Pedir presupuesto personalizado
            </Link>
          </div>
        )}

        {/* Resultados */}
        {resultados.length > 0 && (
          <div className="space-y-4">
            <p className="text-sm text-gray-500">
              {resultados.length} viaje{resultados.length !== 1 ? 's' : ''} encontrado
              {resultados.length !== 1 ? 's' : ''}
            </p>
            {resultados.map((s) => (
              <div key={s.id} className="bg-white rounded-2xl border border-gray-200 p-4 sm:p-6 hover:shadow-md transition-shadow">
                <div className="grid grid-cols-1 sm:grid-cols-[1fr,auto] gap-4 items-center">
                  <div>
                    <div className="flex items-center gap-2 text-sm text-gray-500 mb-2">
                      <Calendar className="w-4 h-4" />
                      {s.dia_display} — {formatearHora(s.hora_salida)}
                    </div>
                    <div className="flex items-center gap-2 mb-2">
                      <span className="font-semibold text-gray-900">{s.origen}</span>
                      <ArrowRight className="w-4 h-4 text-gray-400" />
                      <span className="font-semibold text-gray-900">{s.destino}</span>
                    </div>
                    <div className="flex items-center gap-4 text-sm text-gray-500">
                      <span className="flex items-center gap-1">
                        <Users className="w-3.5 h-3.5" />
                        {s.asientos_disponibles === null
                          ? 'Consultar disponibilidad'
                          : s.asientos_disponibles === 0
                          ? 'Agotado'
                          : `${s.asientos_disponibles} asientos`}
                      </span>
                      {s.vehiculo_nombre && <span>{s.vehiculo_nombre}</span>}
                    </div>
                  </div>
                  <div className="text-right flex sm:flex-col items-center sm:items-end gap-3 sm:gap-2">
                    <div className="text-2xl font-bold text-rojo">${s.precio}</div>
                    <Link
                      to={`/reservar/${s.id}`}
                      className={`inline-flex items-center gap-1 bg-rojo text-white px-5 py-2 rounded-xl text-sm font-semibold transition-all ${
                        s.asientos_disponibles === 0
                          ? 'opacity-50 cursor-not-allowed'
                          : 'hover:bg-red-700'
                      }`}
                      onClick={(e) => s.asientos_disponibles === 0 && e.preventDefault()}
                      aria-disabled={s.asientos_disponibles === 0}
                    >
                      Reservar
                      <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
