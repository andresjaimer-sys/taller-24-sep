import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './style.css';

const TOTAL = 1025;
const artwork = (id) => 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/' + id + '.png';
const sprite = (id) => 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/' + id + '.png';

function leerCapturados() {
  try {
    const datos = JSON.parse(localStorage.getItem('misNumeros') || '[]');
    if (!Array.isArray(datos)) return [];
    return [...new Set(datos.map(Number).filter((id) => Number.isInteger(id) && id >= 1 && id <= TOTAL))];
  } catch {
    return [];
  }
}

export default function Coleccion() {
  const [capturados, setCapturados] = useState(leerCapturados);
  const [nuevos, setNuevos] = useState([]);
  const [nombres, setNombres] = useState([]);
  const navigate = useNavigate();
  const numeros = useMemo(() => Array.from({ length: TOTAL }, (_, index) => index + 1), []);
  const conjunto = useMemo(() => new Set(capturados), [capturados]);

  useEffect(() => {
    fetch('https://pokeapi.co/api/v2/pokemon?limit=1025')
      .then((r) => r.json())
      .then((data) => setNombres(data.results || []))
      .catch(() => {});
  }, []);

  function capturarAleatorios() {
    const seleccionados = Array.from({ length: 4 }, () => Math.floor(Math.random() * TOTAL) + 1);
    const vistos = new Set(capturados);
    const resultados = seleccionados.map((id) => {
      const repetido = vistos.has(id);
      vistos.add(id);
      return { id, repetido };
    });
    const actualizados = [...vistos];
    setCapturados(actualizados);
    setNuevos(resultados);
    try {
      localStorage.setItem('misNumeros', JSON.stringify(actualizados));
    } catch (error) {
      console.error('No se pudo guardar la colección:', error);
    }
  }

  return (
    <div className="coleccion">
      <p className="pagina-etiqueta">Tu aventura continúa</p>
      <h1 className="pagina-titulo">Mi colección</h1>
      <p className="pagina-descripcion">Descubre cuatro Pokémon al azar y completa tu álbum. Tus capturas se guardan en este navegador.</p>

      <div className="coleccion-resumen">
        <div>
          <span className="coleccion-leyenda">Pokémon descubiertos</span>
          <p className="coleccion-contador">{capturados.length} <span>/ {TOTAL}</span></p>
        </div>
        <div className="coleccion-progreso" aria-label="Progreso de colección">
          <span style={{ width: String((capturados.length / TOTAL) * 100) + '%' }} />
        </div>
        <button
          className="boton-primario coleccion-boton"
          type="button"
          onClick={capturarAleatorios}
          disabled={capturados.length >= TOTAL}
        >
          ✦ Descubrir 4 Pokémon
        </button>
      </div>

      {nuevos.length > 0 && (
        <>
          <h2 className="coleccion-subtitulo">Tus nuevos Pokémon</h2>
          <div className="coleccion-nuevos">
            {nuevos.map(({ id, repetido }, indice) => (
              <button
                type="button"
                key={id + '-' + indice}
                className={repetido ? 'coleccion-nuevo repetido' : 'coleccion-nuevo'}
                onClick={() => navigate('/pokemon/' + id)}
              >
                <span className="pokemon-numero">#{id}</span>
                <img src={artwork(id)} alt={nombres[id - 1]?.name || 'Pokémon'} loading="lazy" />
                <strong>{nombres[id - 1]?.name || 'Pokémon ' + id}</strong>
                <small>{repetido ? 'Repetido' : 'Nuevo'}</small>
              </button>
            ))}
          </div>
        </>
      )}

      <div className="coleccion-album-encabezado">
        <h2 className="coleccion-subtitulo">Álbum de capturas</h2>
        <span>{capturados.length} descubiertos</span>
      </div>
      <div className="coleccion-album">
        {numeros.map((id) => {
          const capturado = conjunto.has(id);
          return (
            <button
              type="button"
              key={id}
              disabled={!capturado}
              className={capturado ? 'coleccion-pokemon capturado' : 'coleccion-pokemon'}
              onClick={() => capturado && navigate('/pokemon/' + id)}
              aria-label={capturado ? 'Ver Pokémon número ' + id : 'Pokémon número ' + id + ' sin descubrir'}
            >
              {capturado && <img src={sprite(id)} alt="" loading="lazy" />}
              <span>{String(id).padStart(3, '0')}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
