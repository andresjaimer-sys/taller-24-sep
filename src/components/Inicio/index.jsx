import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { displayName, pokemonArtwork, pokemonIdFromUrl, TOTAL_POKEMON } from '../../utils/pokemon';
import './style.css';

const TYPES = ['All', 'normal', 'fire', 'water', 'grass', 'electric', 'ice', 'fighting', 'poison', 'ground', 'flying', 'psychic', 'bug', 'rock', 'ghost', 'dragon', 'dark', 'steel', 'fairy'];

export default function Inicio() {
  const [pokemon, setPokemon] = useState([]);
  const [busqueda, setBusqueda] = useState('');
  const [tipo, setTipo] = useState('All');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [limit, setLimit] = useState(30);

  useEffect(() => {
    const controller = new AbortController();
    async function load() {
      setLoading(true);
      setError('');
      try {
        const url = tipo === 'All'
          ? 'https://pokeapi.co/api/v2/pokemon?limit=' + TOTAL_POKEMON
          : 'https://pokeapi.co/api/v2/type/' + tipo;
        const response = await fetch(url, { signal: controller.signal });
        if (!response.ok) throw new Error('HTTP ' + response.status);
        const data = await response.json();
        const results = tipo === 'All' ? data.results : data.pokemon.map((entry) => entry.pokemon);
        setPokemon(results.filter((p) => {
          const id = pokemonIdFromUrl(p.url);
          return id !== null && id <= TOTAL_POKEMON;
        }));
        setLimit(30);
      } catch (err) {
        if (err.name !== 'AbortError') setError('No pudimos cargar la Pokédex. Revisa tu conexión e inténtalo de nuevo.');
      } finally {
        if (!controller.signal.aborted) setLoading(false);
      }
    }
    load();
    return () => controller.abort();
  }, [tipo]);

  const filtered = useMemo(() => {
    const query = busqueda.trim().toLowerCase();
    if (!query) return pokemon;
    return pokemon.filter((item) =>
      item.name.includes(query) || String(pokemonIdFromUrl(item.url)) === query
    );
  }, [pokemon, busqueda]);

  return (
    <section>
      <div className="hero hero-pokedex">
        <div className="hero-copy">
          <span className="eyebrow">EL MUNDO POKÉMON, EN TUS MANOS</span>
          <h1>Tu próxima aventura<br /><em>empieza aquí.</em></h1>
          <p>Explora especies, conoce sus habilidades y descubre tu próximo Pokémon favorito.</p>
          <Link className="button button-yellow" to="/coleccion">✦ Explorar Safari <span>↗</span></Link>
        </div>
        <img className="hero-pokemon" src={pokemonArtwork(25)} alt="Pikachu" />
        <span className="hero-background-ball" aria-hidden="true" />
      </div>

      <div className="section-heading">
        <div><span className="eyebrow accent-text">TU ENCICLOPEDIA</span><h2>Descubre la Pokédex <span className="heading-star">✦</span></h2></div>
        <span className="count-label">{filtered.length} Pokémon encontrados</span>
      </div>

      <div className="filter-panel">
        <label className="search-box">
          <span aria-hidden="true">⌕</span>
          <input aria-label="Buscar Pokémon por nombre o número" placeholder="Buscar por nombre o número..." value={busqueda} onChange={(e) => { setBusqueda(e.target.value); setLimit(30); }} />
          {busqueda && <button type="button" aria-label="Limpiar búsqueda" onClick={() => setBusqueda('')}>×</button>}
        </label>
        <div className="type-filters" aria-label="Filtros por tipo">
          {TYPES.map((t) => <button className={'type-filter' + (tipo === t ? ' selected' : '')} key={t} onClick={() => setTipo(t)} type="button">{t === 'All' ? '✦ Todos' : displayName(t)}</button>)}
        </div>
      </div>

      {loading ? <div className="state-message">Preparando tu Pokédex…</div>
        : error ? <div className="state-message error-state" role="alert">{error}</div>
          : filtered.length === 0 ? <div className="state-message">No encontramos Pokémon con ese criterio. Prueba otro nombre o tipo.</div>
            : <>
              <div className="pokemon-grid">
                {filtered.slice(0, limit).map((item) => {
                  const id = pokemonIdFromUrl(item.url);
                  return <Link className="pokemon-card" to={'/pokemon/' + item.name} key={item.name}>
                    <div className="pokemon-card-image"><img src={pokemonArtwork(id)} alt={displayName(item.name)} loading="lazy" /></div>
                    <span className="pokemon-number">#{String(id).padStart(4, '0')}</span>
                    <h3>{displayName(item.name)}</h3>
                    <span className="card-action">Ver detalles <span>↗</span></span>
                  </Link>;
                })}
              </div>
              {filtered.length > limit && <div className="load-more"><button className="button button-outline" type="button" onClick={() => setLimit((count) => count + 30)}>Mostrar más Pokémon ↓</button></div>}
            </>}
    </section>
  );
}
