import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import { displayName, pokemonArtwork, pokemonIdFromUrl, TOTAL_POKEMON } from '../../utils/pokemon';
import { REGIONS, calculateCaptureChance, pickRandomPokemon, rarityLabel } from '../../utils/safariLogic';
import SafariMap from './SafariMap';

export default function Coleccion() {
  const { capturados, inventario, estadisticas, zonasVisitadas, registrarExploracion, registrarIntento, reabastecer } = useApp();
  const [region, setRegion] = useState(REGIONS[0]);
  const [encounter, setEncounter] = useState(null);
  const [berry, setBerry] = useState(false);
  const [ball, setBall] = useState('pokeball');
  const [phase, setPhase] = useState('ready');
  const [result, setResult] = useState('');
  const [error, setError] = useState('');
  const [filter, setFilter] = useState('');
  const encounterLock = useRef(false);
  const encounterZoneRef = useRef(null);
  const actionLock = useRef(false);
  const [regionCache, setRegionCache] = useState({});

  useEffect(() => { setEncounter(null); setResult(''); setError(''); setPhase('ready'); }, [region.id]);
  useEffect(() => { if (phase === 'encounter') encounterZoneRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }); }, [phase]);

  async function explore() {
    if (encounterLock.current || phase === 'loading') return;
    encounterLock.current = true;
    setPhase('loading'); setError(''); setResult(''); setBerry(false);
    try {
      const type = region.types[Math.floor(Math.random() * region.types.length)];
      let candidates = regionCache[type];
      if (!candidates) {
        const response = await fetch('https://pokeapi.co/api/v2/type/' + type);
        if (!response.ok) throw new Error('Error al consultar el hábitat');
        const data = await response.json();
        candidates = data.pokemon.map((entry) => ({
          id: pokemonIdFromUrl(entry.pokemon.url), name: entry.pokemon.name,
        })).filter((pokemon) => pokemon.id);
        setRegionCache((cache) => ({ ...cache, [type]: candidates }));
      }
      const chosen = pickRandomPokemon(candidates, TOTAL_POKEMON);
      if (!chosen) throw new Error('No se encontraron Pokémon disponibles');
      const [detailResponse, speciesResponse] = await Promise.all([
        fetch('https://pokeapi.co/api/v2/pokemon/' + chosen.id),
        fetch('https://pokeapi.co/api/v2/pokemon-species/' + chosen.id),
      ]);
      if (!detailResponse.ok || !speciesResponse.ok) throw new Error('No se pudo cargar el Pokémon');
      const [detail, species] = await Promise.all([detailResponse.json(), speciesResponse.json()]);
      setEncounter({
        id: detail.id, name: detail.name, types: detail.types.map((x) => x.type.name),
        captureRate: species.capture_rate, level: 5 + Math.floor(Math.random() * 36),
      });
      registrarExploracion(region.id);
      setPhase('encounter');
    } catch {
      setError('La expedición no pudo comenzar. Comprueba tu conexión e inténtalo nuevamente.');
      setPhase('ready');
    } finally {
      encounterLock.current = false;
    }
  }

  function capture() {
    if (!encounter || phase !== 'encounter' || actionLock.current) return;
    if (!inventario[ball] || (berry && !inventario.bayas)) {
      setError('No tienes suficientes recursos para esta captura.'); return;
    }
    actionLock.current = true;
    const chance = calculateCaptureChance(encounter.captureRate, ball, berry);
    const success = Math.random() < chance;
    const already = capturados.some((p) => p.id === encounter.id);
    registrarIntento({ pokemon: encounter, exito: success, region: region.name, ball, usoBaya: berry });
    setResult(success ? already ? '¡Captura lograda! Ya tenías esta especie en tu álbum.' : '¡Excelente! Este Pokémon se añadió a tu colección.' : '¡Se escapó! Puedes intentar otra expedición.');
    setPhase('result');
    actionLock.current = false;
  }

  function flee() { setResult('Decidiste retirarte sin realizar un lanzamiento.'); setPhase('result'); }
  const chance = encounter ? Math.round(calculateCaptureChance(encounter.captureRate, ball, berry) * 100) : 0;
  const visibleAlbum = capturados.filter((p) => displayName(p.nombre).toLowerCase().includes(filter.toLowerCase()));
  const capturasDeRegion = capturados.filter((item) => item.region === region.name).length;
  const objetivoRegion = Math.min(capturasDeRegion, 3);

  return <section className="safari-page">
    <div className="hero safari-hero"><div className="hero-copy"><span className="eyebrow">MODO DE AVENTURA · POKÉLAB</span><h1>Explora lo<br /><em>desconocido.</em></h1><p>Una isla. Cinco regiones. Un mapa lleno de aventuras. Marca tu ruta, descubre especies y construye tu colección.</p><span className="safari-hero-pill">✦ TU EXPEDICIÓN COMIENZA AQUÍ</span></div><span className="safari-hero-symbol" aria-hidden="true">✧</span></div>

    <div className="safari-dashboard"><div><span>◉ CAPTURADOS</span><strong>{capturados.length}<small> / {TOTAL_POKEMON}</small></strong></div><div><span>✦ EXPEDICIONES</span><strong>{estadisticas.exploraciones}</strong></div><div><span>🔴 POKÉ BALLS</span><strong>{inventario.pokeball}</strong></div><div><span>🔵 SUPER BALLS</span><strong>{inventario.superball}</strong></div></div>

    <div className="section-heading"><div><span className="eyebrow accent-text">TU MUNDO ESTÁ ESPERANDO</span><h2>El mapa de Isla Aurora <span className="heading-star">✦</span></h2></div><span className="count-label">Cinco biomas para descubrir</span></div>
    <div className="safari-map-layout">
      <SafariMap selectedRegion={region} visitedRegions={zonasVisitadas} expediciones={estadisticas.exploraciones} disabled={phase === 'loading'} onSelectRegion={(item) => { if (phase !== 'loading') setRegion(item); }} />
      <aside className="safari-route-panel" aria-live="polite">
        <span className="eyebrow">UBICACIÓN SELECCIONADA</span>
        <div className="safari-route-banner" style={{ '--region-color': region.accent }}>
          <span className="safari-route-emblem" aria-hidden="true">{region.icon}</span>
          <span className="safari-route-coordinate">RUTA {String(REGIONS.findIndex((item) => item.id === region.id) + 1).padStart(2, '0')} / 05</span>
          <strong>{region.name}</strong>
          <p>{region.description}</p>
        </div>
        <div className="safari-route-info"><strong>Especies del hábitat</strong><div>{region.types.map((type) => <span className="safari-habitat-type" key={type}>{displayName(type)}</span>)}</div></div>
        <div className="safari-route-mission">
          <div className="safari-mission-head"><span>✦ MISIÓN DE ZONA</span><strong>{objetivoRegion} / 3</strong></div>
          <p>Captura tres especies distintas en {region.short.toLowerCase()} para completar el reto.</p>
          <div className="safari-mission-track"><span style={{ width: (objetivoRegion / 3 * 100) + '%' }} /></div>
          <small>{objetivoRegion === 3 ? '🏅 Misión completada' : zonasVisitadas.includes(region.id) ? '✓ Zona descubierta' : '○ Zona aún no explorada'}</small>
        </div>
        <button type="button" className="button safari-embark-button" disabled={phase === 'loading'} onClick={explore}>{phase === 'loading' ? 'Buscando señales…' : '✦ Explorar esta región →'}</button>
        <span className="safari-route-hint">Selecciona otro punto directamente en el mapa para cambiar de destino.</span>
      </aside>
    </div>

    <div className="encounter-zone" ref={encounterZoneRef}><div className="encounter-top"><div><span className="eyebrow accent-text">ZONA DE ENCUENTROS</span><h2>{region.icon} {region.name}</h2><p>Especies relacionadas con {region.types.map(displayName).join(' y ')}.</p></div><span className="encounter-tag">{phase === 'encounter' ? '● POKÉMON SALVAJE' : 'MODO EXPLORACIÓN'}</span></div>
      {phase === 'encounter' && encounter ? <div className="encounter-body">
        <div className="encounter-pokemon"><div className="encounter-spotlight" /><img src={pokemonArtwork(encounter.id)} alt={displayName(encounter.name)} /><span>#{String(encounter.id).padStart(4, '0')}</span></div>
        <div className="encounter-controls"><span className="eyebrow accent-text">¡UN POKÉMON SALVAJE!</span><h3>{displayName(encounter.name)}</h3><div className="encounter-facts"><span>Nivel simulado {encounter.level}</span><span>{rarityLabel(encounter.captureRate)}</span></div><p>Elige tus recursos para aumentar tu probabilidad simulada de captura.</p><fieldset className="ball-options"><legend>Selecciona una Poké Ball</legend><label><input type="radio" name="ball" checked={ball === 'pokeball'} onChange={() => setBall('pokeball')} disabled={!inventario.pokeball} /> 🔴 Poké Ball ({inventario.pokeball})</label><label><input type="radio" name="ball" checked={ball === 'superball'} onChange={() => setBall('superball')} disabled={!inventario.superball} /> 🔵 Super Ball ({inventario.superball})</label></fieldset><label className="berry-option"><input type="checkbox" checked={berry} onChange={(e) => setBerry(e.target.checked)} disabled={!inventario.bayas} /> 🍓 Usar baya ({inventario.bayas})</label><div className="chance-row"><span>Probabilidad estimada</span><strong>{chance}%</strong></div><div className="chance-track"><div style={{ width: chance + '%' }} /></div><div className="encounter-actions"><button className="button button-primary" type="button" onClick={capture} disabled={!inventario[ball] || (berry && !inventario.bayas)}>◉ Lanzar Poké Ball</button><button className="button button-outline" type="button" onClick={flee}>Huir</button></div></div>
      </div> : <div className="encounter-ready"><span className="encounter-ready-icon">{phase === 'result' ? '✧' : '◉'}</span><h3>{phase === 'loading' ? 'Buscando señales en el hábitat…' : phase === 'result' ? result : 'Tu próxima aventura está en el mapa'}</h3><p>{phase === 'result' ? 'Cada encuentro es una nueva oportunidad.' : 'Elige un destino en Isla Aurora. Cada expedición te lleva a un encuentro salvaje.'}</p><button className="button button-primary" disabled={phase === 'loading'} onClick={explore} type="button">{phase === 'loading' ? 'Explorando…' : phase === 'result' ? '✦ Nueva expedición' : '✦ Iniciar expedición'}</button></div>}
      {error && <p className="safari-error" role="alert">{error}</p>}
      {inventario.pokeball + inventario.superball === 0 && <div className="restock"><p>Tu inventario de Poké Balls está vacío.</p><button type="button" className="button button-outline" onClick={reabastecer}>Reabastecer recursos</button></div>}
    </div>

    <div className="section-heading"><div><span className="eyebrow accent-text">TU PROGRESO</span><h2>Álbum de capturas</h2></div><span className="count-label">{capturados.length} especies descubiertas</span></div>
    {capturados.length === 0 ? <div className="empty-state compact"><div className="empty-icon">◉</div><h2>Tu álbum está esperando</h2><p>Captura tu primer Pokémon durante una expedición Safari para comenzar tu colección.</p></div>
      : <><div className="album-search"><input value={filter} onChange={(e) => setFilter(e.target.value)} placeholder="Buscar en mis capturas..." aria-label="Buscar Pokémon capturados" /></div><div className="pokemon-grid">{visibleAlbum.map((item) => <Link className="pokemon-card" key={item.id} to={'/pokemon/' + item.nombre}><div className="pokemon-card-image"><img src={pokemonArtwork(item.id)} alt={displayName(item.nombre)} loading="lazy" /></div><span className="pokemon-number">#{String(item.id).padStart(4, '0')}</span><h3>{displayName(item.nombre)}</h3><span className="card-action">✓ Capturado · Ver ficha ↗</span></Link>)}</div>{visibleAlbum.length === 0 && <p className="state-message">No hay capturas que coincidan con la búsqueda.</p>}</>}
  </section>;
}
