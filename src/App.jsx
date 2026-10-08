import { BrowserRouter as Router, Route, Routes, Navigate,Link } from 'react-router-dom';

import Inicio from "./components/Inicio";
import Favoritos from "./components/Favoritos";
import Info from "./components/Info";
import Coleccion from "./components/Coleccion"
import Usuario from "./components/Usuario"
import Pokemon from "./components/Pokemon"
import './App.css'

function App() {

  return (
    <>
      <Router>
        <nav className='c-menu'>
          <Link to="/">Inicio</Link>
          <Link to="/coleccion">Coleccion</Link>
          <Link to="/favoritos">Favoritos</Link>
          <Link to="/info">Info</Link>
          <Link to="/usuario">Usuario</Link>
        </nav>
        <Routes>
          <Route path="/" element={<Inicio />} />
          <Route path="/favoritos" element={<Favoritos />} />
          <Route path="/coleccion" element={<Coleccion />} />
          <Route path="/info" element={<Info />} />
          <Route path="/usuario" element={<Usuario />} />
          <Route path="/pokemon/:name" element={<Pokemon />} />
        </Routes>
      </Router>
    </>
  )
}

export default App
