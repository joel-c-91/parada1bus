import { ArrowRight, Bus, Calendar, MapPin, Shield, Users } from 'lucide-react';
import { Link } from 'react-router-dom';

const servicios = [
  {
    icon: Users,
    titulo: 'Eventos y Fiestas',
    desc: 'Matrimonios, cumpleaños, despedidas. Viaje todos juntos y lleguen a tiempo.',
  },
  {
    icon: MapPin,
    titulo: 'Viajes Turísticos',
    desc: 'Tours a la nieve, playa, viñas. Disfrutá el viaje tanto como el destino.',
  },
  {
    icon: Bus,
    titulo: 'Traslado de Personal',
    desc: 'Transporte diario para empresas. Puntualidad y comodidad garantizada.',
  },
  {
    icon: Shield,
    titulo: 'Viajes Educativos',
    desc: 'Excursiones escolares y universitarias con todos los seguros.',
  },
];

const flota = [
  {
    nombre: 'Sprinter Ejecutiva',
    tipo: 'Van · 8 pax',
    color: 'bg-amber-100 text-amber-800',
    desc: 'Ideal para grupos chicos y traslados ejecutivos.',
  },
  {
    nombre: 'Minibús 20 Pax',
    tipo: 'Minibús · 20 pax',
    color: 'bg-blue-100 text-blue-800',
    desc: 'Perfecto para eventos y grupos medianos.',
  },
  {
    nombre: 'Bus Full Cama',
    tipo: 'Bus · 45 pax',
    color: 'bg-purple-100 text-purple-800',
    desc: 'Máxima comodidad para viajes largos.',
  },
];

export default function Inicio() {
  return (
    <>
      {/* Hero */}
      <section className="relative bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white overflow-hidden">
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?q=80&w=2069')] bg-cover bg-center opacity-20" />
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-gray-900/50 to-gray-900" />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 md:py-36">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 bg-amber-500/10 text-amber-400 px-4 py-1.5 rounded-full text-sm font-medium mb-6 border border-amber-500/20">
              <Calendar className="w-4 h-4" />
              Viajes especiales en Río Cuarto y Córdoba
            </div>
            <h1 className="text-4xl md:text-6xl font-bold leading-tight mb-6">
              Viajá con{' '}
              <span className="text-amber-400">confianza</span>
              , llegá con{' '}
              <span className="text-amber-400">comodidad</span>
            </h1>
            <p className="text-lg md:text-xl text-gray-300 mb-8 max-w-2xl">
              Transporte privado para eventos, turismo, empresas y rutas fijas.
              Flota moderna, choferes profesionales y el mejor servicio de Río Cuarto.
            </p>
            <div className="flex flex-wrap gap-4">
              <Link
                to="/cotizar"
                className="inline-flex items-center gap-2 bg-amber-500 text-gray-900 px-6 py-3 rounded-xl font-semibold hover:bg-amber-400 transition-all shadow-lg shadow-amber-500/25"
              >
                Cotizá tu viaje
                <ArrowRight className="w-4 h-4" />
              </Link>
              <a
                href="https://wa.me/5493584000000"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 bg-white/10 text-white px-6 py-3 rounded-xl font-semibold hover:bg-white/20 transition-all border border-white/10"
              >
                Consultanos por WhatsApp
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Servicios */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Nuestros Servicios
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Ofrecemos soluciones de transporte para cada necesidad. Viajes a medida,
              con la calidad y seguridad que nos caracteriza.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {servicios.map((s) => (
              <div
                key={s.titulo}
                className="group bg-gray-50 rounded-2xl p-6 hover:bg-amber-50 transition-all hover:shadow-lg hover:shadow-amber-500/5"
              >
                <div className="w-12 h-12 bg-amber-100 rounded-xl flex items-center justify-center mb-4 group-hover:bg-amber-200 transition-colors">
                  <s.icon className="w-6 h-6 text-amber-600" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">{s.titulo}</h3>
                <p className="text-sm text-gray-600">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Flota */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Nuestra Flota
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Vehículos equipados para que tu viaje sea una experiencia cómoda y segura.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {flota.map((v) => (
              <div key={v.nombre} className="bg-white rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow">
                <div className={`inline-block px-3 py-1 rounded-full text-xs font-semibold mb-4 ${v.color}`}>
                  {v.tipo}
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">{v.nombre}</h3>
                <p className="text-sm text-gray-600">{v.desc}</p>
              </div>
            ))}
          </div>

          <div className="text-center mt-8">
            <Link
              to="/flota"
              className="inline-flex items-center gap-2 text-amber-600 font-semibold hover:text-amber-700 transition-colors"
            >
              Ver flota completa <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 bg-gradient-to-r from-amber-500 to-amber-600">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            ¿Listo para tu próximo viaje?
          </h2>
          <p className="text-lg text-gray-800 mb-8 max-w-2xl mx-auto">
            Contanos qué necesitás y te armamos un presupuesto sin compromiso.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link
              to="/cotizar"
              className="inline-flex items-center gap-2 bg-gray-900 text-white px-6 py-3 rounded-xl font-semibold hover:bg-gray-800 transition-all"
            >
              Solicitar presupuesto
              <ArrowRight className="w-4 h-4" />
            </Link>
            <a
              href="https://wa.me/5493584000000"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 bg-white/20 text-gray-900 px-6 py-3 rounded-xl font-semibold hover:bg-white/30 transition-all"
            >
              Escribinos a WhatsApp
            </a>
          </div>
        </div>
      </section>
    </>
  );
}
