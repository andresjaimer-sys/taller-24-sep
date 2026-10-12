import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { attemptMove, START_TILE, WORLD_COLS, WORLD_ROWS, terrainAt, shouldFindPokemon } from '../../utils/safariWorld';
import { adjacentTo, BERRY_CAPACITY, checkHarvestHit, getBerryBushes, harvestTarget, rewardForHarvest, stepsUntilReady } from '../../utils/berryForage';
import './SafariWorld.css';

const DIRECTIONS = {
  ArrowUp: [0, -1, 'up'], w: [0, -1, 'up'], W: [0, -1, 'up'],
  ArrowDown: [0, 1, 'down'], s: [0, 1, 'down'], S: [0, 1, 'down'],
  ArrowLeft: [-1, 0, 'left'], a: [-1, 0, 'left'], A: [-1, 0, 'left'],
  ArrowRight: [1, 0, 'right'], d: [1, 0, 'right'], D: [1, 0, 'right'],
};

const TERRAIN_ICONS = { grass: '♣', flower: '✿', rock: '◆', water: '≈', lava: '●', wall: '▰' };
const REGION_THEMES = {
  bosque: { title: 'Sendero Esmeralda', area: 'Bosque', weather: '🌤️ Brisa del bosque' },
  volcan: { title: 'Laderas del Cráter', area: 'Volcán', weather: '☀️ Calor intenso' },
  oceano: { title: 'Ruta de la Costa', area: 'Costa', weather: '🌊 Viento marino' },
  cueva: { title: 'Galería Subterránea', area: 'Cueva', weather: '🌙 Luz tenue' },
  pradera: { title: 'Camino de la Pradera', area: 'Pradera', weather: '☀️ Cielo despejado' },
};

export default function SafariWorld({
  region, active, onEncounter, onExit,
  pasosRegion = 0, arbustos = {}, bayas = 0, registrarPaso, registrarRecoleccion,
}) {
  const [position, setPosition] = useState({ ...START_TILE });
  const [steps, setSteps] = useState(0);
  const [facing, setFacing] = useState('down');
  const [notice, setNotice] = useState('Camina por los senderos, busca arbustos y explora la hierba alta.');
  const [harvest, setHarvest] = useState(null);
  const [harvestOutcome, setHarvestOutcome] = useState(null);
  const needleRef = useRef(0);
  const needleElementRef = useRef(null);
  const keyHandlerRef = useRef(null);
  const harvestLock = useRef(false);
  const roundLock = useRef(false);
  const playerRef = useRef({ ...START_TILE });
  const grassRef = useRef(0);
  const stepsRef = useRef(0);
  const onEncounterRef = useRef(onEncounter);
  onEncounterRef.current = onEncounter;

  const bushes = useMemo(() => getBerryBushes(region.id), [region.id]);
  const tiles = useMemo(() => Array.from({ length: WORLD_COLS * WORLD_ROWS }, (_, index) => {
    const x = index % WORLD_COLS, y = Math.floor(index / WORLD_COLS);
    return { x, y, terrain: terrainAt(region.id, x, y) };
  }), [region.id]);
  const theme = REGION_THEMES[region.id] || REGION_THEMES.bosque;
  const nearby = bushes.find((bush) => adjacentTo(position, bush) && stepsUntilReady(arbustos[bush.id], pasosRegion) === 0);

  const move = useCallback((dx, dy, direction) => {
    if (!active || harvest || harvestOutcome) return;
    setFacing(direction);
    const result = attemptMove(region.id, playerRef.current, dx, dy);
    if (!result.moved) { setNotice('El terreno está bloqueado. Busca otro sendero.'); return; }
    const occupied = bushes.find((bush) => bush.x === result.position.x && bush.y === result.position.y);
    if (occupied) {
      const remaining = stepsUntilReady(arbustos[occupied.id], pasosRegion);
      setNotice(remaining ? 'Arbusto agotado. Se recuperará tras ' + remaining + ' pasos en esta región.' : '¡Encontraste un arbusto! Acércate y pulsa E o «Recolectar».');
      return;
    }

    playerRef.current = result.position;
    setPosition(result.position);
    stepsRef.current += 1;
    setSteps(stepsRef.current);
    registrarPaso(region.id);
    const nextBush = bushes.find((bush) => adjacentTo(result.position, bush));
    if (nextBush && stepsUntilReady(arbustos[nextBush.id], pasosRegion + 1) === 0) {
      setNotice(nextBush.kind === 'raro'
        ? '✨ Encontraste un arbusto dorado. Su cosecha exige precisión perfecta.'
        : '🌱 Un arbusto con bayas está cerca. Pulsa E o el botón Recolectar.');
    } else if (result.terrain === 'grass') {
      grassRef.current += 1;
      if (shouldFindPokemon(result.terrain, grassRef.current)) {
        grassRef.current = 0;
        setNotice('¡Algo se mueve entre la hierba! Aparece un Pokémon salvaje…');
        onEncounterRef.current();
      } else {
        setNotice('La hierba se está moviendo… sigue explorando.');
      }
    } else if (result.terrain === 'flower') {
      setNotice('Una zona de flores. Algunos arbustos pueden estar ocultos cerca.');
    } else {
      setNotice('Explora los senderos para encontrar arbustos y Pokémon salvajes.');
    }
  }, [active, harvest, harvestOutcome, region.id, bushes, arbustos, pasosRegion, registrarPaso]);

  function startHarvest(bush) {
    if (!active || harvest || harvestOutcome || !adjacentTo(playerRef.current, bush)) return;
    if (stepsUntilReady(arbustos[bush.id], pasosRegion) > 0) return;
    if (bayas >= BERRY_CAPACITY) { setNotice('Tu mochila está llena de bayas. Úsalas antes de recolectar más.'); return; }
    harvestLock.current = false;
    roundLock.current = false;
    setHarvest({ bush, round: 0, hits: 0, misses: 0 });
    needleRef.current = 0;
    setNotice('Observa el indicador en movimiento y detén la aguja en la franja verde.');
  }

  function finishHarvest(game, success) {
    if (harvestLock.current) return;
    harvestLock.current = true;
    const reward = success ? rewardForHarvest(game.bush, game.misses === 0) : 0;
    registrarRecoleccion({ regionId: region.id, bush: game.bush, success, reward });
    setHarvest(null);
    setHarvestOutcome({ success, reward, bush: game.bush });
    setNotice(success ? '¡Cosecha conseguida! Las bayas se guardaron en tu mochila.' : '¡Fallaste! El arbusto se agotó y tendrás que regresar cuando crezca.');
  }

  function stopNeedle() {
    if (!harvest || harvestLock.current || roundLock.current || !active) return;
    roundLock.current = true;
    const target = harvestTarget(harvest.bush, harvest.round);
    const hit = checkHarvestHit(needleRef.current, target.center, target.width);
    const hits = harvest.hits + (hit ? 1 : 0);
    const misses = harvest.misses + (hit ? 0 : 1);
    const needed = harvest.bush.kind === 'raro' ? 3 : 2;
    const maxMisses = harvest.bush.kind === 'raro' ? 0 : 1;

    if (hits >= needed) { finishHarvest({ ...harvest, hits, misses }, true); return; }
    if (misses > maxMisses) { finishHarvest({ ...harvest, hits, misses }, false); return; }
    setHarvest({ ...harvest, round: harvest.round + 1, hits, misses });
    setNotice(hit ? '¡Buen pulso! Prepara la siguiente cosecha.' : '¡Fuera del objetivo! Te queda una oportunidad de corregir.');
  }

  function abandonHarvest() {
    if (harvest) finishHarvest(harvest, false);
  }

  function leave() {
    if (harvest && !harvestLock.current) {
      registrarRecoleccion({ regionId: region.id, bush: harvest.bush, success: false, reward: 0 });
      harvestLock.current = true;
    }
    onExit();
  }

  useEffect(() => {
    if (!harvest || !active) return undefined;
    let frame;
    const beganAt = performance.now();
    const duration = Math.max(610, (harvest.bush.kind === 'raro' ? 1050 : 1420) - harvest.round * 140);
    roundLock.current = false;
    if (needleElementRef.current) needleElementRef.current.style.left = '0%';
    const animate = (now) => {
      const travel = ((now - beganAt) / duration) % 2;
      const value = travel <= 1 ? travel : 2 - travel;
      needleRef.current = value;
      if (needleElementRef.current) needleElementRef.current.style.left = (value * 100) + '%';
      frame = requestAnimationFrame(animate);
    };
    frame = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(frame);
  }, [harvest?.bush.id, harvest?.round, active]);

  keyHandlerRef.current = (event) => {
      const element = event.target;
      if (element && element.closest('input, textarea, select, [contenteditable="true"]')) return;
      if ((event.key === ' ' || event.key === 'Enter') && harvest) {
        if (element?.closest('button')) return;
        event.preventDefault();
        stopNeedle();
        return;
      }
      if (event.key.toLowerCase() === 'e' && !harvest && nearby && !harvestOutcome) {
        event.preventDefault();
        startHarvest(nearby);
        return;
      }
      const data = DIRECTIONS[event.key];
      if (!data) return;
      event.preventDefault();
      move(data[0], data[1], data[2]);
    };

  useEffect(() => {
    if (!active) return undefined;
    const handleKey = (event) => keyHandlerRef.current?.(event);
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [active]);

  const target = harvest ? harvestTarget(harvest.bush, harvest.round) : null;
  const rounds = harvest?.bush.kind === 'raro' ? 3 : 2;

  return <div className="field-shell">
    <div className="field-toolbar">
      <div className="field-heading"><span className="field-game-icon">🎒</span><div><small>EXPEDICIÓN EN CURSO · {theme.area.toUpperCase()}</small><h3>{theme.title}</h3></div></div>
      <div className="field-details"><span>{theme.weather}</span><span>👟 {steps} pasos</span><span>🍓 {bayas} / {BERRY_CAPACITY}</span><button type="button" onClick={leave} className="field-exit">Salir del sendero ✕</button></div>
    </div>
    <div className="field-layout">
      <div className={'field-world field-world--' + region.id} style={{ '--field-cols': WORLD_COLS, '--field-rows': WORLD_ROWS }} role="group" aria-label={'Terreno explorable de ' + region.name}>
        <div className="field-tiles" aria-hidden="true">
          {tiles.map((tile) => <span key={tile.x + '-' + tile.y} className={'field-tile field-tile--' + tile.terrain}><span>{TERRAIN_ICONS[tile.terrain] || ''}</span></span>)}
        </div>
        {bushes.map((bush) => {
          const remaining = stepsUntilReady(arbustos[bush.id], pasosRegion);
          const close = adjacentTo(position, bush);
          return <button type="button" key={bush.id}
            className={'field-bush ' + (remaining > 0 ? 'field-bush--empty ' : '') + (close ? 'field-bush--near ' : '') + (bush.kind === 'raro' ? 'field-bush--rare' : '')}
            style={{ left: ((bush.x + .5) / WORLD_COLS * 100) + '%', top: ((bush.y + .5) / WORLD_ROWS * 100) + '%' }}
            aria-label={bush.name + (remaining > 0 ? ', vuelve en ' + remaining + ' pasos' : close ? ', puedes recolectar' : ', acércate para recolectar')}
            disabled={!active || Boolean(harvest) || Boolean(harvestOutcome)}
            onClick={() => {
              if (remaining > 0) setNotice('Este arbusto necesita ' + remaining + ' pasos de recuperación en ' + region.name + '.');
              else if (!close) setNotice('No puedes recolectar a distancia. Camina hasta una casilla contigua.');
              else startHarvest(bush);
            }}>
            <span>{remaining > 0 ? '🍂' : bush.kind === 'raro' ? '🌟' : '🫐'}</span>
          </button>;
        })}
        <div className={'field-avatar field-avatar--' + facing} style={{
          left: ((position.x + .5) / WORLD_COLS * 100) + '%',
          top: ((position.y + .5) / WORLD_ROWS * 100) + '%',
        }} role="img" aria-label="Tu entrenador">
          <span className="field-avatar-shadow" /><span className="field-avatar-hat" /><span className="field-avatar-face" /><span className="field-avatar-bag" /><span className="field-avatar-shirt" /><span className="field-avatar-legs" />
        </div>
        <span className="field-world-corner field-world-corner--top">ZONA SALVAJE · {region.name.toUpperCase()}</span>
        <span className="field-world-corner field-world-corner--bottom">{harvest ? '✦ RECOLECCIÓN EN CURSO' : '✦ 🫐 ARBUSTOS · ♣ HIERBA ALTA'}</span>
      </div>
      <aside className="field-hud">
        <div className="field-hud-title"><span>{harvest ? '🫐' : '🧭'}</span><div><strong>{harvest ? 'Desafío de recolección' : 'Controles del entrenador'}</strong><small>{harvest ? 'Concentración y precisión' : 'Muévete por el sendero'}</small></div></div>
        <div className="field-notice" role="status" aria-live="polite">{notice}</div>

        {harvest ? <div className="forage-game">
          <div className="forage-header"><span>{harvest.bush.kind === 'raro' ? '🌟 COSECHA RARA' : '🫐 COSECHA SILVESTRE'}</span><span>{harvest.hits} / {rounds} aciertos</span></div>
          <p>Detén la aguja dentro de la franja verde. Cada ronda acelera el movimiento y reduce la zona segura.</p>
          <div className="forage-meter" role="img" aria-label={'Medidor de precisión. Ronda ' + (harvest.round + 1)}>
            <div className="forage-target" style={{left: ((target.center - target.width / 2) * 100) + '%', width: (target.width * 100) + '%'}} />
            <div className="forage-needle" ref={needleElementRef} style={{left: '0%'}} />
          </div>
          <div className="forage-status"><span>Ronda {harvest.round + 1}</span><span>{harvest.bush.kind === 'raro' ? 'Sin fallos permitidos' : 'Máximo 1 fallo'}</span></div>
          <button type="button" className="forage-stop-button" onClick={stopNeedle}>✦ ¡DETENER AGUJA! <small>ESPACIO</small></button>
          <button type="button" className="forage-abandon" onClick={abandonHarvest}>Abandonar (el arbusto se agotará)</button>
        </div> : harvestOutcome ? <div className={'forage-outcome ' + (harvestOutcome.success ? 'forage-outcome--success' : 'forage-outcome--fail')}>
          <span className="forage-outcome-icon">{harvestOutcome.success ? '🍓' : '🍂'}</span>
          <h3>{harvestOutcome.success ? '¡Cosecha conseguida!' : 'El arbusto se agotó'}</h3>
          <p>{harvestOutcome.success ? 'Ganaste ' + harvestOutcome.reward + ' bayas. La cosecha se guardó en tu inventario.' : 'No obtuviste bayas. Sigue explorando y regresa cuando se recupere.'}</p>
          <button type="button" className="forage-stop-button" onClick={() => setHarvestOutcome(null)}>Seguir explorando →</button>
        </div> : <>
          <div className="field-keyboard-info">En computador usa <kbd>W</kbd><kbd>A</kbd><kbd>S</kbd><kbd>D</kbd> o flechas. Pulsa <kbd>E</kbd> junto a un arbusto.</div>
          <div className="field-dpad" aria-label="Controles de movimiento">
            <button className="field-up" type="button" aria-label="Caminar arriba" onClick={() => move(0,-1,'up')}>▲</button>
            <button className="field-left" type="button" aria-label="Caminar izquierda" onClick={() => move(-1,0,'left')}>◀</button>
            <div className="field-dpad-center" aria-hidden="true">✦</div>
            <button className="field-right" type="button" aria-label="Caminar derecha" onClick={() => move(1,0,'right')}>▶</button>
            <button className="field-down" type="button" aria-label="Caminar abajo" onClick={() => move(0,1,'down')}>▼</button>
          </div>
          {nearby && <button type="button" className="field-harvest-action" onClick={() => startHarvest(nearby)}>🫐 Recolectar {nearby.kind === 'raro' ? 'arbusto dorado' : 'bayas'} · E</button>}
          <div className="field-hint"><span className="field-hint-swatch" /> Hierba: Pokémon · 🫐 Arbustos: bayas</div>
        </>}
        <button className="field-return-button" type="button" onClick={leave}>← Volver al mapa de Isla Aurora</button>
      </aside>
    </div>
  </div>;
}
