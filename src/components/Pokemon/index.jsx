import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import './style.css';

const artwork = (id) => 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/' + id + '.png';

function leerFavoritos() {
  try {
    const datos = JSON.parse(localStorage.getItem('favoritos') || '[]');
    return Array.isArray(datos) ? datos : [];
  } catch {
    return [];
  }
}

export default function Pokemon() {
  const { name } = useParams();
  const navigate = useNavigate();
  const [pokemon, setPokemon] = useState(null);
  const [favoritos, setFavoritos] = useState(leerFavoritos);
  const [error, setError] = useState('');

  useEffect(() => {
    const controlador = new AbortController();
    setPokemon(null);
    setError('');
    fetch('https://pokeapi.co/api/v2/pokemon/' + encodeURIComponent(name), { signal: controlador.signal })
      .then((respuesta) => {
        if (!respuesta.ok) throw new Error('Pokémon no encontrado');
        return respuesta.json();
      })
      .then((datos) => setPokemon(datos))
      .catch((e) => {
        if (e.name !== 'AbortError') setError('No fue posible cargar este Pokémon.');
      });
    return () => controlador.abort();
  }, [name]);

  function alternarFavorito() {
    if (!pokemon) return;
    const existe = favoritos.some((p) => p.id === pokemon.id);
    const nuevos = existe
      ? favoritos.filter((p) => p.id !== pokemon.id)
      : [...favoritos, { id: pokemon.id, nombre: pokemon.name }];
    setFavoritos(nuevos);
    try {
      localStorage.setItem('favoritos', JSON.stringify(nuevos));
    } catch (e) {
      console.error('No se pudieron guardar los favoritos:', e);
    }
  }

  if (error) return <p className="estado">{error}</p>;
  if (!pokemon) return <p className="estado">Cargando Pokémon…</p>;

  const esFavorito = favoritos.some((p) => p.id === pokemon.id);
  const nombresStats = {
    hp: 'PS',
    attack: 'Ataque',
    defense: 'Defensa',
    'special-attack': 'Ataque especial',
    'special-defense': 'Defensa especial',
    speed: 'Velocidad',
  };

  return (
    <div className="detalle">
      <button type="button" className="detalle-volver" onClick={() => navigate(-1)}>← Volver</button>
      <div className="detalle-panel">
        <div className="detalle-arte">
          <p>#{String(pokemon.id).padStart(4, '0')}</p>
          <img src={artwork(pokemon.id)} alt={pokemon.name} />
        </div>
        <div className="detalle-informacion">
          <p className="pagina-etiqueta">Ficha del Pokémon</p>
          <h1 className="pagina-titulo detalle-nombre">{pokemon.name}</h1>
          <div className="detalle-tipos">
            {pokemon.types.map(({ type }) => <span key={type.name}>{type.name}</span>)}
          </div>
          <div className="detalle-medidas">
            <div><strong>{pokemon.height / 10} m</strong><span>Altura</span></div>
            <div><strong>{pokemon.weight / 10} kg</strong><span>Peso</span></div>
          </div>
          <button
            type="button"
            onClick={alternarFavorito}
            className={esFavorito ? 'detalle-favorito guardado' : 'detalle-favorito'}
            aria-pressed={esFavorito}
          >
            {esFavorito ? '♥ Quitar de favoritos' : '♡ Añadir a favoritos'}
          </button>
          <h2>Estadísticas base</h2>
          <div className="detalle-stats">
            {pokemon.stats.map(({ base_stat, stat }) => (
              <div className="detalle-stat" key={stat.name}>
                <span>{nombresStats[stat.name] || stat.name}</span>
                <div className="detalle-stat-barra"><i style={{ width: Math.min(100, base_stat / 255 * 100) + '%' }} /></div>
                <strong>{base_stat}</strong>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
