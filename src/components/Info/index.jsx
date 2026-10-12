import { Link } from 'react-router-dom';
import { pokemonArtwork } from '../../utils/pokemon';

export default function Info() {
  return <section className="info-page">
    <div className="info-cover">
      <span className="eyebrow">PROYECTO ACADÉMICO · EDICIÓN SAFARI</span>
      <h1>POKÉ<span>LAB</span></h1>
      <p className="info-subtitle">Explora. Descubre. Colecciona.</p>
      <div className="info-art"><img src={pokemonArtwork(25)} alt="Ilustración de Pikachu" /><img src={pokemonArtwork(1)} alt="Ilustración de Bulbasaur" /><img src={pokemonArtwork(4)} alt="Ilustración de Charmander" /></div>
      <div className="info-count"><strong>1025</strong><span>especies de la Pokédex Nacional que exploramos en esta versión</span></div>
      <span className="info-edition">VERSIÓN WEB · 1.0 — SAFARI EDITION</span>
    </div>
    <div className="info-details">
      <div><span className="eyebrow accent-text">SOBRE ESTE PROYECTO</span><h2>Una Pokédex que invita a explorar</h2><p>PokéLab es una aplicación de práctica desarrollada con React. Utiliza PokéAPI para mostrar información real de especies y añade una experiencia Safari con reglas de juego simuladas, expediciones y colección persistente.</p></div>
      <div className="info-feature-grid"><article><span>◫</span><strong>Pokédex</strong><p>Consulta especies, tipos y estadísticas.</p></article><article><span>✦</span><strong>Safari</strong><p>Explora hábitats y captura Pokémon.</p></article><article><span>♡</span><strong>Favoritos</strong><p>Guarda tus descubrimientos preferidos.</p></article><article><span>◉</span><strong>Perfil</strong><p>Revisa tus avances y tu colección.</p></article></div>
    </div>
    <div className="info-credits"><p>Pokémon y sus ilustraciones son propiedad de sus respectivos titulares. Proyecto educativo independiente, no afiliado ni oficial.</p><div><a href="https://pokeapi.co/" target="_blank" rel="noreferrer">Datos de PokéAPI ↗</a><Link to="/">Explorar la Pokédex ↗</Link></div></div>
  </section>;
}
