import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Layout from './components/layout/Layout';
import Inicio from './pages/Inicio';
import Servicios from './pages/Servicios';
import Flota from './pages/Flota';
import Cotizar from './pages/Cotizar';
import Contacto from './pages/Contacto';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<Layout />}>
          <Route path="/" element={<Inicio />} />
          <Route path="/servicios" element={<Servicios />} />
          <Route path="/flota" element={<Flota />} />
          <Route path="/cotizar" element={<Cotizar />} />
          <Route path="/contacto" element={<Contacto />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
