import { REGIONS } from '../../utils/safariLogic';
import './SafariMap.css';

// Coordinates are fictional and expressed as percentages of the illustrated island.
const POINTS = {
  bosque: { x: 27.4, y: 39.4, placement: 'left' },
  volcan: { x: 71.5, y: 38.7, placement: 'right' },
  oceano: { x: 77.2, y: 70.3, placement: 'right' },
  cueva: { x: 48.8, y: 76.9, placement: 'below' },
  pradera: { x: 49.1, y: 56.3, placement: 'below' },
};

const TREES = [
  [155, 184, 1], [189, 212, 0.85], [224, 167, 0.8], [250, 237, 0.95],
  [170, 270, 0.85], [290, 198, 1], [225, 294, 0.75], [322, 258, 0.7],
  [127, 323, 0.75], [320, 330, 0.85], [360, 180, 0.65], [190, 352, 0.65],
  [265, 370, 0.7], [347, 355, 0.6], [385, 274, 0.6],
];
const ROCKS = [[435, 470, 1], [484, 492, .9], [538, 463, .6], [390, 505, .7], [565, 528, .75]];
const WAVES = [[724, 418], [776, 455], [700, 505], [820, 370], [801, 530], [631, 530], [745, 565]];
const RANGES = [[540, 160, .8], [581, 145, 1], [630, 178, .65], [706, 218, .85], [618, 239, .6]];

function ForestTree({ x, y, scale }) {
  return <g transform={'translate(' + x + ' ' + y + ') scale(' + scale + ')'}>
    <ellipse cx="0" cy="14" rx="18" ry="6" fill="#244e3e" opacity=".17" />
    <path d="M-2 -3 V13" stroke="#615e43" strokeWidth="5" strokeLinecap="round" />
    <path d="M0 -37 L-23 -6 H-12 L-31 7 H31 L12 -6 H23 Z" fill="#226c4e" />
    <path d="M-1 -37 L-1 7 H31 L12 -6 H23 Z" fill="#358663" />
    <path d="M-3 -31 L-17 -11" stroke="#97ce95" strokeWidth="3" strokeLinecap="round" opacity=".55" />
  </g>;
}

function Mountain({ x, y, scale }) {
  return <g transform={'translate(' + x + ' ' + y + ') scale(' + scale + ')'}>
    <path d="M-48 36 1 -56 55 36Z" fill="#8b827e" />
    <path d="M1 -56 55 36 H1Z" fill="#676c73" />
    <path d="M-16 -22 1 -56 23 -22 7 -28 0 -18 -8 -29Z" fill="#f1ece6" />
  </g>;
}

export default function SafariMap({ selectedRegion, visitedRegions = [], onSelectRegion, expediciones = 0, disabled = false }) {
  return <div className="atlas-shell">
    <div className="atlas-toolbar">
      <div className="atlas-heading"><span className="atlas-spark">✦</span><div><span className="atlas-overline">ATLAS DE EXPEDICIÓN</span><strong>Isla Aurora</strong></div></div>
      <div className="atlas-counters"><span><i className="atlas-green-dot" /> {visitedRegions.length}/5 zonas exploradas</span><span>✧ {expediciones} expediciones</span></div>
    </div>
    <div className="atlas-world" role="group" aria-label="Mapa interactivo de Isla Aurora con cinco regiones">
      <svg className="atlas-art" viewBox="0 0 900 620" xmlns="http://www.w3.org/2000/svg" aria-hidden="true" preserveAspectRatio="xMidYMid meet">
        <defs>
          <linearGradient id="safari-sea" x1="0" y1="0" x2="1" y2="1"><stop stopColor="#9bd6db" /><stop offset=".58" stopColor="#6ebac5" /><stop offset="1" stopColor="#4798b5" /></linearGradient>
          <linearGradient id="safari-island" x1="0" y1="0" x2="1" y2="1"><stop stopColor="#cde6aa" /><stop offset=".48" stopColor="#a7d293" /><stop offset="1" stopColor="#83bc8b" /></linearGradient>
          <radialGradient id="safari-crater"><stop stopColor="#ffde91" /><stop offset=".42" stopColor="#fa9468" /><stop offset=".72" stopColor="#b35f58" /><stop offset="1" stopColor="#80746b" /></radialGradient>
          <pattern id="safari-waterlines" patternUnits="userSpaceOnUse" width="48" height="48"><path d="M2 20 Q12 13 22 20 T42 20" stroke="#e5ffff" strokeWidth="1.5" opacity=".20" fill="none" /></pattern>
          <filter id="safari-island-shadow" x="-20%" y="-20%" width="140%" height="160%"><feDropShadow dx="3" dy="11" stdDeviation="8" floodColor="#125e77" floodOpacity=".20" /></filter>
          <clipPath id="safari-land-mask"><path d="M84 277 Q74 210 139 167 Q181 125 257 144 Q329 103 396 138 Q480 97 559 118 Q633 92 694 149 Q762 159 782 232 Q816 284 788 359 Q828 419 763 468 Q732 520 650 519 Q578 571 501 540 Q427 573 371 527 Q305 551 254 508 Q163 528 129 466 Q67 432 83 361 Q50 327 84 277Z" /></clipPath>
        </defs>
        <rect width="900" height="620" fill="url(#safari-sea)" />
        <rect width="900" height="620" fill="url(#safari-waterlines)" />
        <path d="M55 80 Q100 60 145 83 M730 65 Q775 45 815 75 M80 515 Q125 497 165 520" stroke="#d7f1ed" strokeWidth="3" strokeLinecap="round" fill="none" opacity=".55" />
        <g opacity=".28" fill="none" stroke="#ecf9ed" strokeWidth="2"><ellipse cx="710" cy="115" rx="130" ry="45" transform="rotate(22 710 115)"/><ellipse cx="130" cy="520" rx="120" ry="43" transform="rotate(-30 130 520)"/></g>
        <path d="M84 277 Q74 210 139 167 Q181 125 257 144 Q329 103 396 138 Q480 97 559 118 Q633 92 694 149 Q762 159 782 232 Q816 284 788 359 Q828 419 763 468 Q732 520 650 519 Q578 571 501 540 Q427 573 371 527 Q305 551 254 508 Q163 528 129 466 Q67 432 83 361 Q50 327 84 277Z" fill="#f7e7a9" stroke="#f4efc8" strokeWidth="22" filter="url(#safari-island-shadow)" />
        <path d="M84 277 Q74 210 139 167 Q181 125 257 144 Q329 103 396 138 Q480 97 559 118 Q633 92 694 149 Q762 159 782 232 Q816 284 788 359 Q828 419 763 468 Q732 520 650 519 Q578 571 501 540 Q427 573 371 527 Q305 551 254 508 Q163 528 129 466 Q67 432 83 361 Q50 327 84 277Z" fill="url(#safari-island)" stroke="#82b58a" strokeWidth="2" />
        <g clipPath="url(#safari-land-mask)">
          <path d="M65 175 Q150 95 325 131 Q411 150 384 287 Q367 390 275 415 Q151 408 67 310Z" fill="#70b88b" opacity=".80" />
          <path d="M503 99 Q624 93 752 155 Q829 264 761 339 Q642 346 549 288 Q516 192 503 99Z" fill="#bbb5a2" />
          <path d="M580 315 Q725 291 821 345 L817 522 Q723 563 603 506 Q563 405 580 315Z" fill="#74b8c4" opacity=".55" />
          <path d="M323 421 Q462 373 579 427 Q615 538 500 579 L329 556 Q285 493 323 421Z" fill="#76897b" opacity=".65" />
          <path d="M353 292 Q427 262 529 314 Q584 374 542 437 Q458 471 366 407 Q332 359 353 292Z" fill="#dcdaa1" />
          <path d="M395 398 Q469 382 495 409 T608 411" fill="none" stroke="#fbf0bd" strokeWidth="10" opacity=".7" strokeLinecap="round"/>
          <path d="M581 137 C510 246 590 281 522 362 S511 479 636 549" fill="none" stroke="#79c5d1" strokeWidth="18" strokeLinecap="round"/>
          <path d="M581 137 C510 246 590 281 522 362 S511 479 636 549" fill="none" stroke="#c6eff0" strokeWidth="5" strokeLinecap="round" opacity=".7"/>
          <path d="M728 328 Q676 378 731 413 T756 510" fill="none" stroke="#bcebf0" strokeWidth="23" strokeLinecap="round" opacity=".86"/>
          <path d="M115 392 Q195 442 290 425" fill="none" stroke="#e2d298" strokeWidth="9" strokeLinecap="round"/>
          {TREES.map(([x,y,scale],i)=><ForestTree x={x} y={y} scale={scale} key={'tree-'+i}/>)}
          {RANGES.map(([x,y,scale],i)=><Mountain x={x} y={y} scale={scale} key={'mountain-'+i}/>)}
          <ellipse cx="643" cy="240" rx="75" ry="52" fill="#8f827e" opacity=".75"/>
          <ellipse cx="643" cy="244" rx="52" ry="35" fill="url(#safari-crater)" stroke="#d8a08a" strokeWidth="8"/>
          <path d="M628 239 Q644 210 663 241" stroke="#ffdf9b" strokeWidth="6" fill="none" strokeLinecap="round" />
          <g fill="#d5e5b0" opacity=".85"><circle cx="395" cy="326" r="4"/><circle cx="420" cy="336" r="5"/><circle cx="493" cy="384" r="6"/><circle cx="455" cy="305" r="4"/><circle cx="368" cy="386" r="3"/><circle cx="495" cy="335" r="4"/></g>
          {ROCKS.map(([x,y,scale],i)=><g key={'rock-'+i} transform={'translate('+x+' '+y+') scale('+scale+')'}><path d="M-29 12 L-15 -21 8 -32 29 -7 22 17Z" fill="#6c7876" /><path d="M8 -32 29 -7 22 17 4 9Z" fill="#53696b" /></g>)}
          <path d="M430 467 Q478 443 511 469 Q532 499 492 518 Q451 522 430 467Z" fill="#364b51" stroke="#a6b4aa" strokeWidth="7"/>
          <path d="M451 473 L461 487 L480 484" fill="none" stroke="#b0c0ba" strokeWidth="3" />
          {WAVES.map(([x,y],i)=><path key={'wave-'+i} d={'M'+x+' '+y+' q12 -8 24 0 q12 8 24 0'} stroke="#d3f4f2" strokeWidth="3" strokeLinecap="round" fill="none" opacity=".85" />)}
          <g fill="#fff9e5" opacity=".74"><path d="M671 409 l12 5 -11 6z"/><circle cx="708" cy="466" r="5"/><circle cx="735" cy="474" r="3"/></g>
        </g>
        <path d="M246 244 Q340 245 442 349 Q535 283 640 238 M442 349 Q439 420 437 477 M442 349 Q564 375 695 436" fill="none" stroke="#fff8dc" strokeWidth="13" opacity=".85" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M246 244 Q340 245 442 349 Q535 283 640 238 M442 349 Q439 420 437 477 M442 349 Q564 375 695 436" fill="none" stroke="#ad8859" strokeWidth="3" strokeDasharray="2 14" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M80 550 l0 -36 l12 9 12 -9 v36 M80 514 l24 0" stroke="#f1fbf5" strokeWidth="2.3" fill="none" opacity=".65" />
        <text x="85" y="502" fontSize="14" fontFamily="serif" fontWeight="bold" fill="#f6ffff" opacity=".86">N</text>
        <g fill="#edf8f4" opacity=".65"><circle cx="823" cy="115" r="3"/><circle cx="843" cy="132" r="2"/><circle cx="791" cy="86" r="2"/></g>
      </svg>
      <div className="atlas-watermark">ISLA AURORA · POKÉSAFARI</div>
      {REGIONS.map((region) => {
        const point = POINTS[region.id];
        const isActive = selectedRegion.id === region.id;
        const visited = visitedRegions.includes(region.id);
        return <button
          type="button"
          key={region.id}
          aria-label={'Explorar ' + region.name + (visited ? ', visitada' : ', sin visitar')}
          aria-pressed={isActive}
          disabled={disabled}
          className={'atlas-marker atlas-marker--'+point.placement + (isActive ? ' atlas-marker--active' : '') + (visited ? ' atlas-marker--visited' : '')}
          style={{left:point.x+'%', top:point.y+'%', '--pin-accent':region.accent}}
          onClick={() => onSelectRegion(region)}>
          <span className="atlas-pin"><span className="atlas-pin-icon" aria-hidden="true">{region.icon}</span>{isActive && <span className="atlas-pin-ring" />}</span>
          <span className="atlas-marker-label">{region.short}{visited && <span aria-hidden="true"> ✓</span>}</span>
        </button>;
      })}
      <div className="atlas-compass" aria-hidden="true"><strong>N</strong><span>✦</span></div>
      <div className="atlas-legend"><span><i className="legend-active" /> Ubicación</span><span><i className="legend-done" /> Visitado</span><span><i className="legend-route" /> Senderos</span></div>
    </div>
    <div className="atlas-footer"><span>↖ Toca un punto del mapa para elegir un destino</span><span>MAPA ILUSTRADO · NO GEOGRÁFICO</span></div>
  </div>;
}
