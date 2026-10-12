import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { attemptMove, START_TILE, WORLD_COLS, WORLD_ROWS, terrainAt, shouldFindPokemon } from '../../utils/safariWorld';
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

export default function SafariWorld({ region, active, onEncounter, onExit }) {
  const [position, setPosition] = useState({ ...START_TILE });
  const [steps, setSteps] = useState(0);
  const [facing, setFacing] = useState('down');
  const [notice, setNotice] = useState('Camina hacia las zonas de hierba alta para encontrar Pokémon.');
  const playerRef = useRef({ ...START_TILE });
  const grassRef = useRef(0);
  const stepsRef = useRef(0);
  const onEncounterRef = useRef(onEncounter);
  onEncounterRef.current = onEncounter;

  const tiles = useMemo(() => Array.from({ length: WORLD_COLS * WORLD_ROWS }, (_, index) => {
    const x = index % WORLD_COLS, y = Math.floor(index / WORLD_COLS);
    return { x, y, terrain: terrainAt(region.id, x, y) };
  }), [region.id]);
  const theme = REGION_THEMES[region.id] || REGION_THEMES.bosque;

  const move = useCallback((dx, dy, direction) => {
    if (!active) return;
    setFacing(direction);
    const result = attemptMove(region.id, playerRef.current, dx, dy);
    if (!result.moved) {
      setNotice('Ese camino está bloqueado. Prueba otra dirección.');
      return;
    }

    playerRef.current = result.position;
    setPosition(result.position);
    stepsRef.current += 1;
    setSteps(stepsRef.current);

    if (result.terrain === 'grass') {
      grassRef.current += 1;
      if (shouldFindPokemon(result.terrain, grassRef.current)) {
        grassRef.current = 0;
        setNotice('¡Algo se mueve entre la hierba! Aparece un Pokémon salvaje…');
        onEncounterRef.current();
        return;
      }
      setNotice('La hierba se está moviendo… sigue explorando.');
    } else if (result.terrain === 'flower') {
      setNotice('Encontraste una zona de flores. Parece un lugar tranquilo.');
    } else {
      setNotice('Sigue los senderos y entra en la hierba para descubrir especies.');
    }
  }, [active, region.id]);

  useEffect(() => {
    if (!active) return undefined;
    const handleKey = (event) => {
      const element = event.target;
      if (element && (element.closest('input, textarea, select, [contenteditable="true"]'))) return;
      const data = DIRECTIONS[event.key];
      if (!data) return;
      event.preventDefault();
      move(data[0], data[1], data[2]);
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [active, move]);

  return <div className="field-shell">
    <div className="field-toolbar">
      <div className="field-heading"><span className="field-game-icon">🎒</span><div><small>EXPEDICIÓN EN CURSO · {theme.area.toUpperCase()}</small><h3>{theme.title}</h3></div></div>
      <div className="field-details"><span>{theme.weather}</span><span>👟 {steps} pasos</span><button type="button" onClick={onExit} className="field-exit">Salir del sendero ✕</button></div>
    </div>
    <div className="field-layout">
      <div className={'field-world field-world--' + region.id} style={{ '--field-cols': WORLD_COLS, '--field-rows': WORLD_ROWS }} role="group" aria-label={'Terreno explorable de ' + region.name}>
        <div className="field-tiles" aria-hidden="true">
          {tiles.map((tile) => <span key={tile.x + '-' + tile.y} className={'field-tile field-tile--' + tile.terrain}>
            <span>{TERRAIN_ICONS[tile.terrain] || ''}</span>
          </span>)}
        </div>
        <div className={'field-avatar field-avatar--' + facing} style={{
          left: ((position.x + 0.5) / WORLD_COLS * 100) + '%',
          top: ((position.y + 0.5) / WORLD_ROWS * 100) + '%',
        }} role="img" aria-label="Tu entrenador">
          <span className="field-avatar-shadow" />
          <span className="field-avatar-hat" />
          <span className="field-avatar-face" />
          <span className="field-avatar-bag" />
          <span className="field-avatar-shirt" />
          <span className="field-avatar-legs" />
        </div>
        <span className="field-world-corner field-world-corner--top">ZONA SALVAJE · {region.name.toUpperCase()}</span>
        <span className="field-world-corner field-world-corner--bottom">✦ TOCA LA HIERBA ALTA PARA EXPLORAR</span>
      </div>
      <aside className="field-hud">
        <div className="field-hud-title"><span>🧭</span><div><strong>Controles del entrenador</strong><small>Muévete por el sendero</small></div></div>
        <div className="field-notice" role="status" aria-live="polite">{notice}</div>
        <div className="field-keyboard-info">En computador usa <kbd>W</kbd><kbd>A</kbd><kbd>S</kbd><kbd>D</kbd> o las flechas. En celular, usa estos controles.</div>
        <div className="field-dpad" aria-label="Controles de movimiento">
          <button className="field-up" type="button" aria-label="Caminar arriba" onClick={() => move(0,-1,'up')}>▲</button>
          <button className="field-left" type="button" aria-label="Caminar izquierda" onClick={() => move(-1,0,'left')}>◀</button>
          <div className="field-dpad-center" aria-hidden="true">✦</div>
          <button className="field-right" type="button" aria-label="Caminar derecha" onClick={() => move(1,0,'right')}>▶</button>
          <button className="field-down" type="button" aria-label="Caminar abajo" onClick={() => move(0,1,'down')}>▼</button>
        </div>
        <div className="field-hint"><span className="field-hint-swatch" /> Hierba alta <strong>→</strong> posibles encuentros</div>
        <button className="field-return-button" type="button" onClick={onExit}>← Volver al mapa de Isla Aurora</button>
      </aside>
    </div>
  </div>;
}
