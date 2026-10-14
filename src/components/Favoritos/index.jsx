import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './style.css';

export default function Favoritos() {
  const navigate = useNavigate();
  const [favoritos] = useState(() => {
    try {
      const datos = JSON.parse(localStorage.getItem('favoritos') || '[]');
      return Array.isArray(datos) ? datos : [];
    } catch {
      return [];
    }
  });

  return (
    <div>
      <p className="pagina-etiqueta">Tus elegidos</p>
      <h1 className="pagina-titulo">Pokémon favoritos</h1>
      <p className="pagina-descripcion">Aquí aparecen los Pokémon que guardas desde sus fichas.</p>
      {favoritos.length === 0 ? (
        <div className="estado">
          <div className="favoritos-corazon" aria-hidden="true">♡</div>
          Todavía no tienes favoritos. Entra a la Pokédex y guarda los que más te gusten.
        </div>
      ) : (
        <section className="c-lista">
          {favoritos.map((pokemon) => (
            <button
              type="button"
              key={pokemon.id}
              className="c-lista-pokemon"
              onClick={() => navigate('/pokemon/' + pokemon.nombre)}
            >
              <span className="pokemon-numero">#{String(pokemon.id).padStart(4, '0')}</span>
              <img
                src={'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/' + pokemon.id + '.png'}
                alt={pokemon.nombre}
                loading="lazy"
              />
              <span className="pokemon-nombre">{pokemon.nombre}</span>
            </button>
          ))}
        </section>
      )}
    </div>
  );
}
