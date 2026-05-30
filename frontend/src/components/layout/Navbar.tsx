import { Bus, MapPin, Phone, Menu, X } from 'lucide-react';
import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';

const enlaces = [
  { path: '/', label: 'Inicio' },
  { path: '/servicios', label: 'Servicios' },
  { path: '/flota', label: 'Flota' },
  { path: '/cotizar', label: 'Cotizar Viaje' },
  { path: '/contacto', label: 'Contacto' },
];

export default function Navbar() {
  const [abierto, setAbierto] = useState(false);
  const location = useLocation();

  return (
    <nav className="fixed top-0 left-0 w-full bg-white/95 backdrop-blur-md shadow-sm z-50 border-b border-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <Link to="/" className="flex items-center gap-2 text-xl font-bold text-gray-900">
            <Bus className="w-7 h-7 text-amber-500" />
            <span>Parada 1 Bus</span>
          </Link>

          <div className="hidden md:flex items-center gap-1">
            {enlaces.map((enlace) => {
              const activo = location.pathname === enlace.path;
              return (
                <Link
                  key={enlace.path}
                  to={enlace.path}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    activo
                      ? 'bg-amber-50 text-amber-700'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                  }`}
                >
                  {enlace.label}
                </Link>
              );
            })}
            <a
              href="https://wa.me/5493584000000"
              target="_blank"
              rel="noopener noreferrer"
              className="ml-3 flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-green-700 transition-colors"
            >
              <Phone className="w-4 h-4" />
              WhatsApp
            </a>
          </div>

          <button
            className="md:hidden p-2 text-gray-600 hover:text-gray-900"
            onClick={() => setAbierto(!abierto)}
          >
            {abierto ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {abierto && (
        <div className="md:hidden border-t border-gray-100 bg-white">
          <div className="px-4 py-3 space-y-1">
            {enlaces.map((enlace) => {
              const activo = location.pathname === enlace.path;
              return (
                <Link
                  key={enlace.path}
                  to={enlace.path}
                  onClick={() => setAbierto(false)}
                  className={`block px-4 py-2 rounded-lg text-sm font-medium ${
                    activo ? 'bg-amber-50 text-amber-700' : 'text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  {enlace.label}
                </Link>
              );
            })}
            <a
              href="https://wa.me/5493584000000"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded-lg text-sm font-medium"
            >
              <Phone className="w-4 h-4" />
              WhatsApp
            </a>
          </div>
        </div>
      )}
    </nav>
  );
}
