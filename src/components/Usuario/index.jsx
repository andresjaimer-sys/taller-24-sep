import { useState } from 'react';
import { Link } from 'react-router-dom';
import './style.css';

function cantidadGuardada(clave) {
  try {
    const datos = JSON.parse(localStorage.getItem(clave) || '[]');
    return Array.isArray(datos) ? datos.length : 0;
  } catch {
    return 0;
  }
}

export default function Usuario() {
  const [nombre, setNombre] = useState(() => {
    try { return localStorage.getItem('nombreEntrenadorWeb') || ''; }
    catch { return ''; }
  });
  const [guardado, setGuardado] = useState(true);
  const favoritos = cantidadGuardada('favoritos');
  const capturados = cantidadGuardada('misNumeros');

  function guardar(evento) {
    evento.preventDefault();
    const limpio = nombre.trim().slice(0, 24);
    setNombre(limpio);
    try {
      localStorage.setItem('nombreEntrenadorWeb', limpio);
      setGuardado(true);
    } catch (e) { console.error('No se pudo guardar el perfil:', e); }
  }

  return (
    <div className="usuario-pagina">
      <p className="pagina-etiqueta">Perfil de explorador</p>
      <h1 className="pagina-titulo">Mi entrenador</h1>
      <p className="pagina-descripcion">Personaliza tu perfil y consulta el progreso de tu aventura.</p>
      <div className="usuario-cabecera">
        <img
          src="https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/133.png"
          alt="Eevee"
        />
        <div>
          <span>ENTRENADOR POKÉMON</span>
          <h2>{nombre || 'Nuevo entrenador'}</h2>
          <p>¡Sigue explorando para completar tu colección!</p>
        </div>
      </div>
      <form className="panel usuario-formulario" onSubmit={guardar}>
        <label htmlFor="nombre-entrenador">Nombre de tu entrenador</label>
        <div className="usuario-form-fila">
          <input
            type="text"
            id="nombre-entrenador"
            value={nombre}
            onChange={(e) => { setNombre(e.target.value); setGuardado(false); }}
            maxLength={24}
            placeholder="Escribe tu nombre"
          />
          <button type="submit" className="boton-primario">{guardado ? 'Guardado ✓' : 'Guardar'}</button>
        </div>
      </form>
      <div className="panel usuario-estadisticas">
        <h2>Tu progreso</h2>
        <div className="panel-cuadricula">
          <div className="panel-dato"><strong>{favoritos}</strong><span>Favoritos</span></div>
          <div className="panel-dato"><strong>{capturados}</strong><span>Capturados de 1.025</span></div>
        </div>
        <div className="usuario-enlaces">
          <Link to="/coleccion">Ir a mi colección →</Link>
          <Link to="/favoritos">Ver favoritos →</Link>
        </div>
      </div>
    </div>
  );
}
