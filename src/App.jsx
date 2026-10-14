import { BrowserRouter, NavLink, Route, Routes } from 'react-router-dom';
import Inicio from './components/Inicio';
import Favoritos from './components/Favoritos';
import Info from './components/Info';
import Coleccion from './components/Coleccion';
import Usuario from './components/Usuario';
import Pokemon from './components/Pokemon';
import './App.css';

const secciones = [
  { ruta: '/', nombre: 'Inicio', icono: '⌂' },
  { ruta: '/coleccion', nombre: 'Colección', icono: '◈' },
  { ruta: '/favoritos', nombre: 'Favoritos', icono: '♥' },
  { ruta: '/info', nombre: 'Info', icono: 'ⓘ' },
  { ruta: '/usuario', nombre: 'Usuario', icono: '♙' },
];

export default function App() {
  return (
    <BrowserRouter>
      <div className="app-shell">
        <header className="app-header">
          <div className="app-brand">
            <span className="brand-ball" aria-hidden="true"><i /></span>
            <div>
              <strong>POKÉDEX</strong>
              <small>EXPLORER</small>
            </div>
          </div>
          <span className="app-header-tag">TALLER 24 SEP</span>
        </header>

        <main className="app-main">
          <Routes>
            <Route path="/" element={<Inicio />} />
            <Route path="/coleccion" element={<Coleccion />} />
            <Route path="/favoritos" element={<Favoritos />} />
            <Route path="/info" element={<Info />} />
            <Route path="/usuario" element={<Usuario />} />
            <Route path="/pokemon/:name" element={<Pokemon />} />
            <Route path="*" element={<Inicio />} />
          </Routes>
        </main>

        <nav className="c-menu" aria-label="Navegación principal">
          {secciones.map((seccion) => (
            <NavLink
              key={seccion.ruta}
              to={seccion.ruta}
              end={seccion.ruta === '/'}
              className={({ isActive }) => isActive ? 'menu-enlace activo' : 'menu-enlace'}
            >
              <span className="menu-icono" aria-hidden="true">{seccion.icono}</span>
              <span>{seccion.nombre}</span>
            </NavLink>
          ))}
        </nav>
      </div>
    </BrowserRouter>
  );
}
