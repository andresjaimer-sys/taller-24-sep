import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import { displayName, pokemonArtwork, typeColor } from '../../utils/pokemon';

const STAT_NAMES = { hp: 'PS', attack: 'Ataque', defense: 'Defensa', 'special-attack': 'Ataque esp.', 'special-defense': 'Defensa esp.', speed: 'Velocidad' };

export default function Pokemon() {
  const { name } = useParams();
  const { favoritos, capturados, toggleFavorito } = useApp();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const controller = new AbortController();
    async function load() {
      setLoading(true); setData(null); setError('');
      try {
        const response = await fetch('https://pokeapi.co/api/v2/pokemon/' + encodeURIComponent(name), { signal: controller.signal });
        if (!response.ok) throw new Error('Not found');
        setData(await response.json());
      } catch (err) {
        if (err.name !== 'AbortError') setError('No fue posible cargar este Pokémon.');
      } finally {
        if (!controller.signal.aborted) setLoading(false);
      }
    }
    load();
    return () => controller.abort();
  }, [name]);

  if (loading) return <div className="state-message">Consultando datos del Pokémon…</div>;
  if (error || !data) return <div className="empty-state" role="alert"><h2>{error}</h2><Link className="button button-primary" to="/">Volver a la Pokédex</Link></div>;

  const isFavorite = favoritos.some((p) => p.id === data.id);
  const isCaptured = capturados.some((p) => p.id === data.id);
  const primary = typeColor(data.types[0]?.type.name);
  return <section className="detail-page">
    <Link to="/" className="back-link">← Volver a la Pokédex</Link>
    <div className="detail-layout">
      <div className="detail-visual" style={{ '--pokemon-color': primary }}>
        <span className="detail-big-number">#{String(data.id).padStart(4, '0')}</span>
        <img src={data.sprites?.other?.['official-artwork']?.front_default || pokemonArtwork(data.id)} alt={displayName(data.name)} />
        <span className="detail-orbit" aria-hidden="true" />
      </div>
      <div className="detail-info">
        <span className="eyebrow accent-text">REGISTRO POKÉDEX · #{String(data.id).padStart(4, '0')}</span>
        <h1>{displayName(data.name)}</h1>
        <div className="type-row">{data.types.map(({ type }) => <span className="type-badge" key={type.name} style={{ backgroundColor: typeColor(type.name) }}>{displayName(type.name)}</span>)}</div>
        <p className="detail-intro">Conoce las características y estadísticas de esta especie según PokéAPI.</p>
        <div className="detail-metrics"><div><span>Altura</span><strong>{data.height / 10} m</strong></div><div><span>Peso</span><strong>{data.weight / 10} kg</strong></div><div><span>Experiencia base</span><strong>{data.base_experience ?? '—'}</strong></div></div>
        <div className="detail-buttons">
          <button className={'button ' + (isFavorite ? 'button-pink' : 'button-primary')} onClick={() => toggleFavorito(data)} type="button">{isFavorite ? '♥ Guardado en favoritos' : '♡ Añadir a favoritos'}</button>
          {isCaptured && <span className="captured-indicator">✓ Capturado en Safari</span>}
        </div>
        <div className="stats-card"><h2>Estadísticas base</h2>{data.stats.map(({ stat, base_stat }) => <div className="stat-row" key={stat.name}><span>{STAT_NAMES[stat.name] || stat.name}</span><strong>{base_stat}</strong><div className="stat-track"><div style={{ width: Math.min(base_stat / 255 * 100, 100) + '%', backgroundColor: primary }} /></div></div>)}</div>
        <div className="abilities"><strong>Habilidades</strong><p>{data.abilities.map((item) => displayName(item.ability.name)).join(' · ')}</p></div>
      </div>
    </div>
  </section>;
}
