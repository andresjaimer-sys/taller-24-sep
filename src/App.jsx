import { BrowserRouter as Router, Route, Routes, Navigate,Link } from 'react-router-dom';

import Coleccion from "./Componentes/Coleccion"
import Favoritos from "./Componentes/Favoritos"
import Inicio from "./Componentes/Inicio"
import LigaAlemana from "./Componentes/LigaAlemana"
import Usuario from "./Componentes/Usuario"
import Info from "./Componentes/Info"

function App() {

  return (
    <>
    <Router>
      <nav classname="c-menu">
        <Link to="/">Inicio</Link>
        <Link to="/coleccion">Coleccion</Link>
        <Link to="/favoritos">Favoritos</Link>
        <Link to="/info">Info</Link>
        <Link to="/usuario">Usuario</Link>
        <Link to="/ligaalemana">LigaAlemana</Link>
      </nav>
      <Routes>
        <Route path="/" element={<Inicio />} />
        <Route path="/coleccion" element={<Coleccion />} />
        <Route path="/favoritos" element={<Favoritos />} />
        <Route path="/info" element={<Info />} />
        <Route path="/usuario" element={<Usuario />} />
        <Route path="/ligaalemana" element={<LigaAlemana />} />

        <Route path="/ligaalemana/name:" element={<LigaAlemana />} />
      </Routes>
    </Router>
    </>
    
  )
}

export default App
