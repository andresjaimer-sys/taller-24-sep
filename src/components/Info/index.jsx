import { Link } from 'react-router-dom';
import './style.css';

export default function Info() {
  return (
    <div className="info-pagina">
      <p className="pagina-etiqueta">Conoce la aplicación</p>
      <div className="info-portada">
        <div className="info-portada-texto">
          <span>POKÉDEX EXPLORER</span>
          <h1>Un universo Pokémon por descubrir</h1>
          <p>Busca, explora y conoce los datos de 1.025 Pokémon con la información de PokéAPI.</p>
          <Link to="/" className="info-enlace">Explorar Pokédex →</Link>
        </div>
        <img
          src="https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/25.png"
          alt="Pikachu"
          loading="lazy"
        />
      </div>
      <h2 className="info-subtitulo">¿Qué puedes hacer?</h2>
      <div className="info-grid">
        <div className="panel"><strong>01 · Explorar</strong><p>Consulta la lista, busca por nombre o número y filtra por tipo.</p></div>
        <div className="panel"><strong>02 · Descubrir</strong><p>Revisa altura, peso, tipos y estadísticas de cada Pokémon.</p></div>
        <div className="panel"><strong>03 · Guardar</strong><p>Marca Pokémon favoritos y vuelve a ellos cuando quieras.</p></div>
        <div className="panel"><strong>04 · Coleccionar</strong><p>Descubre grupos de cuatro Pokémon al azar y completa el álbum.</p></div>
      </div>
      <p className="info-fuente">
        Datos de <a href="https://pokeapi.co/" target="_blank" rel="noreferrer">PokéAPI</a>.
        Proyecto desarrollado con React y Vite. Los favoritos y capturas se conservan en el navegador de este dispositivo.
      </p>
    </div>
  );
}
