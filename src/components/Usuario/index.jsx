import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import { displayName, pokemonSprite, TOTAL_POKEMON } from '../../utils/pokemon';

export default function Usuario() {
  const { perfil, favoritos, capturados, inventario, estadisticas, estadisticasBayas, historial, setNombre, resetProgreso } = useApp();
  const [name, setName] = useState(perfil.nombre);
  const [confirm, setConfirm] = useState(false);
  return <section>
    <div className="page-heading"><span className="eyebrow accent-text">TU CENTRO DE ENTRENADOR</span><h1>Mi aventura <span>✦</span></h1><p>Cada descubrimiento cuenta. Consulta tu progreso y personaliza tu perfil.</p></div>
    <div className="profile-hero"><div className="profile-avatar">⚡</div><div><span className="eyebrow">ENTRENADOR POKÉMON</span><h2>{perfil.nombre}</h2><p>Tu historia se escribe con cada expedición.</p></div><span className="profile-level">SAFARI EXPLORER</span></div>
    <div className="dashboard-metrics">
      <article><span>✦ Expediciones</span><strong>{estadisticas.exploraciones}</strong><small>aventuras realizadas</small></article>
      <article><span>◉ Capturados</span><strong>{capturados.length}</strong><small>especies únicas</small></article>
      <article><span>♥ Favoritos</span><strong>{favoritos.length}</strong><small>en tu colección</small></article>
      <article><span>⌁ Intentos</span><strong>{estadisticas.intentos}</strong><small>lanzamientos Safari</small></article><article><span>🫐 Bayas recolectadas</span><strong>{estadisticasBayas.recolectadas}</strong><small>{estadisticasBayas.exitos} cosechas logradas / {estadisticasBayas.intentos} intentos</small></article>
    </div>
    <div className="dashboard-columns">
      <div className="panel"><div className="panel-header"><h2>Progreso Pokédex</h2><span>{Math.round(capturados.length / TOTAL_POKEMON * 100)}%</span></div><div className="progress-track"><div style={{ width: capturados.length / TOTAL_POKEMON * 100 + '%' }} /></div><p>{capturados.length} de {TOTAL_POKEMON} especies capturadas</p><Link to="/coleccion" className="text-link">Volver al Safari ↗</Link><div className="inventory-mini"><span>🔴 {inventario.pokeball} Poké Balls</span><span>🔵 {inventario.superball} Super Balls</span><span>🍓 {inventario.bayas} Bayas</span></div></div>
      <div className="panel"><h2>Personaliza tu perfil</h2><form className="profile-form" onSubmit={(event) => { event.preventDefault(); setNombre(name); }}><label htmlFor="trainer-name">Nombre del entrenador</label><input id="trainer-name" maxLength={28} value={name} onChange={(e) => setName(e.target.value)} /><button className="button button-primary" type="submit">Guardar nombre</button></form></div>
    </div>
    <div className="panel history-panel"><div className="panel-header"><h2>Últimos encuentros</h2><span>Safari</span></div>{historial.length === 0 ? <p>Todavía no has realizado capturas. Empieza una expedición para crear tu historia.</p> : <div className="history-grid">{historial.slice(0, 6).map((item) => <Link className="history-item" to={'/pokemon/' + item.nombre} key={item.id}><img src={pokemonSprite(item.pokemonId)} alt="" /><span><strong>{displayName(item.nombre)}</strong><small>{item.region}</small></span><span className={item.exito ? 'success-text' : 'muted-text'}>{item.exito ? 'Capturado' : 'Escapó'}</span></Link>)}</div>}</div>
    <div className="reset-area">{confirm ? <div className="reset-confirm"><span>¿Eliminar todos los favoritos, capturas y avances guardados en este navegador?</span><button type="button" className="button button-danger" onClick={() => { resetProgreso(); setName('Entrenador'); setConfirm(false); }}>Sí, borrar progreso</button><button className="button button-outline" onClick={() => setConfirm(false)} type="button">Cancelar</button></div> : <button type="button" className="subtle-button" onClick={() => setConfirm(true)}>Reiniciar datos locales</button>}</div>
  </section>;
}
