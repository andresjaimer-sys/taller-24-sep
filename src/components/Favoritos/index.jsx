import { Link } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import { displayName, pokemonArtwork } from '../../utils/pokemon';

export default function Favoritos() {
  const { favoritos, toggleFavorito } = useApp();
  return <section>
    <div className="page-heading"><span className="eyebrow accent-text">TU SELECCIÓN ESPECIAL</span><h1>Mis favoritos <span>♥</span></h1><p>Guarda los Pokémon que más te gustan para volver a visitarlos cuando quieras.</p></div>
    {favoritos.length === 0 ? <div className="empty-state"><div className="empty-icon">♡</div><h2>Tu lista está esperando</h2><p>Entra a la Pokédex, elige una especie y pulsa el corazón para guardarla aquí.</p><Link to="/" className="button button-primary">Explorar Pokémon ↗</Link></div>
      : <div className="pokemon-grid">{favoritos.map((pokemon) => <article className="pokemon-card" key={pokemon.id}>
        <Link to={'/pokemon/' + pokemon.nombre} className="pokemon-card-link">
          <div className="pokemon-card-image"><img src={pokemonArtwork(pokemon.id)} alt={displayName(pokemon.nombre)} loading="lazy" /></div>
          <span className="pokemon-number">#{String(pokemon.id).padStart(4, '0')}</span>
          <h3>{displayName(pokemon.nombre)}</h3>
        </Link>
        <button className="card-delete" type="button" onClick={() => toggleFavorito(pokemon)} aria-label={'Quitar de favoritos a ' + pokemon.nombre}>♥ Quitar favorito</button>
      </article>)}</div>}
  </section>;
}
