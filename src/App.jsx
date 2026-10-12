import { NavLink, Route, Routes, useLocation } from 'react-router-dom';
import Inicio from './components/Inicio';
import Favoritos from './components/Favoritos';
import Info from './components/Info';
import Coleccion from './components/Coleccion';
import Usuario from './components/Usuario';
import Pokemon from './components/Pokemon';
import { useApp } from './context/AppContext';
import './App.css';

const navigation = [
  { to: '/', label: 'Pokédex', icon: '◫' },
  { to: '/coleccion', label: 'Safari', icon: '✦' },
  { to: '/favoritos', label: 'Favoritos', icon: '♡' },
  { to: '/info', label: 'Informativa', icon: 'ⓘ' },
  { to: '/usuario', label: 'Entrenador', icon: '◉' },
];

function Shell() {
  const { capturados, favoritos, perfil } = useApp();
  const location = useLocation();

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <NavLink to="/" className="brand" aria-label="Volver a Pokédex">
          <span className="brand-mark" aria-hidden="true"><span /></span>
          <span className="brand-copy"><strong>POKÉ<span>LAB</span></strong><small>EXPLORER EDITION</small></span>
        </NavLink>
        <div className="sidebar-label">EXPLORA TU MUNDO</div>
        <nav className="side-links" aria-label="Navegación principal">
          {navigation.map((item) => (
            <NavLink key={item.to} end={item.to === '/'} to={item.to}
              className={({ isActive }) => 'side-link' + (isActive ? ' active' : '')}>
              <span className="side-icon" aria-hidden="true">{item.icon}</span>
              <span>{item.label}</span>
              {item.label === 'Safari' && <span className="menu-new">NEW</span>}
            </NavLink>
          ))}
        </nav>
        <div className="sidebar-bottom">
          <div className="coach-card">
            <span className="coach-pip">✦</span>
            <strong>Tu aventura continúa</strong>
            <p>Explora hábitats, descubre especies y forma tu colección.</p>
            <NavLink to="/coleccion" className="coach-link">Iniciar expedición ↗</NavLink>
          </div>
          <div className="sidebar-profile">
            <span className="avatar">⚡</span>
            <span><strong>{perfil.nombre}</strong><small>Entrenador Pokémon</small></span>
          </div>
        </div>
      </aside>

      <div className="app-content">
        <header className="topbar">
          <span className="topbar-crumb">POKÉLAB <span>/</span> {navigation.find((item) => item.to === location.pathname)?.label || 'Detalle Pokémon'}</span>
          <div className="topbar-stats">
            <span>✦ {capturados.length} capturados</span>
            <span>♥ {favoritos.length} favoritos</span>
          </div>
        </header>
        <main className="page-container">
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
        <footer className="app-footer">PokéLab Explorer · Proyecto académico con datos de PokéAPI · No oficial</footer>
      </div>

      <nav className="mobile-tabs" aria-label="Navegación móvil">
        {navigation.map((item) => (
          <NavLink key={item.to} end={item.to === '/'} to={item.to}
            className={({ isActive }) => 'mobile-tab' + (isActive ? ' active' : '')}>
            <span aria-hidden="true">{item.icon}</span><small>{item.label}</small>
          </NavLink>
        ))}
      </nav>
    </div>
  );
}

export default function App() {
  return <Shell />;
}
