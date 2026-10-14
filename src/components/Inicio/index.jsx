import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './style.css';

const tipos = [
  'All', 'normal', 'fighting', 'flying', 'poison', 'ground', 'rock',
  'bug', 'ghost', 'steel', 'fire', 'water', 'grass', 'electric',
  'psychic', 'ice', 'dragon', 'dark', 'fairy', 'stellar', 'shadow', 'unknown'
];

function idPokemon(url) {
  const match = String(url).match(/\/pokemon\/(\d+)\/?$/);
  return match ? Number(match[1]) : null;
}

export default function Inicio() {
  const navigate = useNavigate();
  const [pokemones, setPokemones] = useState([]);
  const [tipo, setTipo] = useState('All');
  const [busqueda, setBusqueda] = useState('');
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const controlador = new AbortController();
    async function cargar() {
      setCargando(true);
      setError('');
      try {
        const url = tipo === 'All'
          ? 'https://pokeapi.co/api/v2/pokemon?limit=1025'
          : 'https://pokeapi.co/api/v2/type/' + tipo;
        const respuesta = await fetch(url, { signal: controlador.signal });
        if (!respuesta.ok) throw new Error('No se pudo consultar PokéAPI');
        const data = await respuesta.json();
        const lista = tipo === 'All'
          ? (data.results || [])
          : (data.pokemon || []).map((item) => item.pokemon);
        setPokemones(lista.filter((p) => idPokemon(p.url) !== null));
      } catch (err) {
        if (err.name !== 'AbortError') setError('No se pudieron cargar los Pokémon. Comprueba tu conexión.');
      } finally {
        if (!controlador.signal.aborted) setCargando(false);
      }
    }
    cargar();
    return () => controlador.abort();
  }, [tipo]);

  const resultados = useMemo(() => {
    const texto = busqueda.trim().toLowerCase();
    if (!texto) return pokemones;
    return pokemones.filter((p) => (
      p.name.toLowerCase().includes(texto) || String(idPokemon(p.url)) === texto
    ));
  }, [busqueda, pokemones]);

  return (
    <div>
      <p className="pagina-etiqueta">Tu aventura comienza aquí</p>
      <h1 className="pagina-titulo">Explora la Pokédex</h1>
      <p className="pagina-descripcion">Busca entre 1.025 Pokémon, filtra por tipo y descubre sus estadísticas.</p>

      <div className="buscador-panel">
        <label htmlFor="buscar-pokemon">Buscar Pokémon</label>
        <input
          id="buscar-pokemon"
          type="search"
          value={busqueda}
          onChange={(e) => setBusqueda(e.target.value)}
          className="c-buscador"
          placeholder="Nombre o número, por ejemplo Pikachu"
        />
      </div>

      <div className="filtros-titulo">
        <strong>Filtrar por tipo</strong>
        <span>{cargando ? 'Cargando…' : resultados.length + ' resultados'}</span>
      </div>
      <div className="c-filtro" aria-label="Tipos de Pokémon">
        {tipos.map((unTipo) => (
          <button
            type="button"
            key={unTipo}
            onClick={() => setTipo(unTipo)}
            className={tipo === unTipo ? 'filtro-boton seleccionado' : 'filtro-boton'}
            aria-pressed={tipo === unTipo}
          >
            {unTipo === 'All' ? 'Todos' : unTipo}
          </button>
        ))}
      </div>

      {cargando ? (
        <p className="estado">Cargando Pokémon…</p>
      ) : error ? (
        <p className="estado">{error}</p>
      ) : resultados.length === 0 ? (
        <p className="estado">No encontramos Pokémon con esos filtros.</p>
      ) : (
        <section className="c-lista" aria-label="Lista de Pokémon">
          {resultados.map((pokemon) => {
            const id = idPokemon(pokemon.url);
            return (
              <button
                type="button"
                className="c-lista-pokemon"
                key={pokemon.name}
                onClick={() => navigate('/pokemon/' + pokemon.name)}
              >
                <span className="pokemon-numero">#{String(id).padStart(4, '0')}</span>
                <img
                  src={'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/' + id + '.png'}
                  alt={pokemon.name}
                  loading="lazy"
                />
                <span className="pokemon-nombre">{pokemon.name}</span>
              </button>
            );
          })}
        </section>
      )}
    </div>
  );
}
