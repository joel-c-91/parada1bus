import { Bus, MapPin, Mail, Phone } from 'lucide-react';
import { Instagram } from '../ui/Instagram';
import { Link } from 'react-router-dom';

export default function Footer() {
  return (
    <footer className="bg-gray-900 text-gray-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <div className="flex items-center gap-2 text-white text-lg font-bold mb-4">
              <Bus className="w-6 h-6 text-amber-500" />
              Parada 1 Bus
            </div>
            <p className="text-sm leading-relaxed">
              Viajes especiales en Río Cuarto y toda la provincia de Córdoba.
              Transporte seguro y confiable para eventos, turismo y empresas.
            </p>
          </div>

          <div>
            <h3 className="text-white font-semibold mb-4">Enlaces</h3>
            <ul className="space-y-2 text-sm">
              <li><Link to="/" className="hover:text-amber-400 transition-colors">Inicio</Link></li>
              <li><Link to="/servicios" className="hover:text-amber-400 transition-colors">Servicios</Link></li>
              <li><Link to="/flota" className="hover:text-amber-400 transition-colors">Flota</Link></li>
              <li><Link to="/cotizar" className="hover:text-amber-400 transition-colors">Cotizar Viaje</Link></li>
              <li><Link to="/contacto" className="hover:text-amber-400 transition-colors">Contacto</Link></li>
            </ul>
          </div>

          <div>
            <h3 className="text-white font-semibold mb-4">Contacto</h3>
            <ul className="space-y-3 text-sm">
              <li className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-amber-500" />
                <a href="https://wa.me/5493584000000" className="hover:text-amber-400 transition-colors">
                  +54 9 358 400-0000
                </a>
              </li>
              <li className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-amber-500" />
                <a href="mailto:info@parada1bus.com" className="hover:text-amber-400 transition-colors">
                  info@parada1bus.com
                </a>
              </li>
              <li className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-amber-500" />
                Río Cuarto, Córdoba, Argentina
              </li>
              <li className="flex items-center gap-2">
                <Instagram className="w-4 h-4 text-amber-500" />
                <a href="https://instagram.com/parada1bus" target="_blank" rel="noopener noreferrer"
                   className="hover:text-amber-400 transition-colors">
                  @parada1bus
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-800 mt-8 pt-8 text-center text-sm text-gray-500">
          &copy; {new Date().getFullYear()} Parada 1 Bus. Todos los derechos reservados.
        </div>
      </div>
    </footer>
  );
}
