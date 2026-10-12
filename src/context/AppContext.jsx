import { createContext, useContext, useEffect, useState } from 'react';
import { BERRY_CAPACITY, BERRY_COOLDOWN } from '../utils/berryForage';

const STORAGE_KEY = 'pokemon-safari-state-v1';
const starterInventory = { pokeball: 12, superball: 5, bayas: 4 };

const emptyState = {
  favoritos: [],
  capturados: [],
  inventario: starterInventory,
  perfil: { nombre: 'Entrenador', regionPreferida: '' },
  estadisticas: { exploraciones: 0, intentos: 0, capturas: 0 },
  historial: [],
  zonasVisitadas: [],
  pasosPorRegion: {},
  arbustos: {},
  estadisticasBayas: { intentos: 0, exitos: 0, recolectadas: 0 },
};

function readState() {
  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) || 'null');
    if (saved && typeof saved === 'object') {
      return {
        ...emptyState,
        ...saved,
        inventario: { ...starterInventory, ...saved.inventario },
        perfil: { ...emptyState.perfil, ...saved.perfil },
        estadisticas: { ...emptyState.estadisticas, ...saved.estadisticas },
        favoritos: Array.isArray(saved.favoritos) ? saved.favoritos : [],
        capturados: Array.isArray(saved.capturados) ? saved.capturados : [],
        historial: Array.isArray(saved.historial) ? saved.historial : [],
        zonasVisitadas: Array.isArray(saved.zonasVisitadas) ? saved.zonasVisitadas : [],
        pasosPorRegion: saved.pasosPorRegion && typeof saved.pasosPorRegion === 'object' ? saved.pasosPorRegion : {},
        arbustos: saved.arbustos && typeof saved.arbustos === 'object' ? saved.arbustos : {},
        estadisticasBayas: { ...emptyState.estadisticasBayas, ...(saved.estadisticasBayas || {}) },
      };
    }
    const legacy = JSON.parse(localStorage.getItem('favoritos') || '[]');
    return { ...emptyState, favoritos: Array.isArray(legacy) ? legacy : [] };
  } catch {
    return emptyState;
  }
}

const AppContext = createContext(null);

export function AppProvider({ children }) {
  const [state, setState] = useState(readState);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
      localStorage.setItem('favoritos', JSON.stringify(state.favoritos));
    } catch (error) {
      console.warn('No se pudo guardar el progreso local.', error);
    }
  }, [state]);

  const toggleFavorito = (pokemon) => {
    setState((previous) => {
      const exists = previous.favoritos.some((item) => item.id === pokemon.id);
      return {
        ...previous,
        favoritos: exists
          ? previous.favoritos.filter((item) => item.id !== pokemon.id)
          : [...previous.favoritos, { id: pokemon.id, nombre: pokemon.name || pokemon.nombre }],
      };
    });
  };

  const registrarExploracion = (regionId) => setState((previous) => ({
    ...previous,
    zonasVisitadas: regionId && !previous.zonasVisitadas.includes(regionId)
      ? [...previous.zonasVisitadas, regionId]
      : previous.zonasVisitadas,
    estadisticas: {
      ...previous.estadisticas,
      exploraciones: previous.estadisticas.exploraciones + 1,
    },
  }));

  const registrarPaso = (regionId) => setState((previous) => ({
    ...previous,
    pasosPorRegion: {
      ...previous.pasosPorRegion,
      [regionId]: (previous.pasosPorRegion[regionId] || 0) + 1,
    },
  }));

  // Failed attempts deplete the bush too. Regrowth is based on valid movement
  // in that region, not real-world time or reloading the page.
  const registrarRecoleccion = ({ regionId, bush, success, reward = 0 }) => {
    setState((previous) => {
      const current = previous.pasosPorRegion[regionId] || 0;
      const readyAt = previous.arbustos[bush.id]?.readyAt || 0;
      if (current < readyAt) return previous;
      const accepted = success && previous.inventario.bayas < BERRY_CAPACITY;
      const gained = accepted ? Math.min(Math.max(0, reward), BERRY_CAPACITY - previous.inventario.bayas) : 0;
      return {
        ...previous,
        inventario: { ...previous.inventario, bayas: previous.inventario.bayas + gained },
        arbustos: { ...previous.arbustos, [bush.id]: {
          readyAt: current + BERRY_COOLDOWN[bush.kind],
        } },
        estadisticasBayas: {
          intentos: previous.estadisticasBayas.intentos + 1,
          exitos: previous.estadisticasBayas.exitos + (accepted ? 1 : 0),
          recolectadas: previous.estadisticasBayas.recolectadas + gained,
        },
      };
    });
  };

  const registrarIntento = ({ pokemon, exito, region, ball, usoBaya }) => {
    setState((previous) => {
      if (previous.inventario[ball] < 1 || (usoBaya && previous.inventario.bayas < 1)) {
        return previous;
      }
      const alreadyCaptured = previous.capturados.some((item) => item.id === pokemon.id);
      const newCapture = exito && !alreadyCaptured;
      return {
        ...previous,
        inventario: {
          ...previous.inventario,
          [ball]: previous.inventario[ball] - 1,
          bayas: previous.inventario.bayas - (usoBaya ? 1 : 0),
        },
        capturados: newCapture
          ? [{ id: pokemon.id, nombre: pokemon.name, region, fecha: new Date().toISOString() }, ...previous.capturados]
          : previous.capturados,
        estadisticas: {
          ...previous.estadisticas,
          intentos: previous.estadisticas.intentos + 1,
          capturas: previous.estadisticas.capturas + (newCapture ? 1 : 0),
        },
        historial: [
          { id: String(Date.now()) + '-' + pokemon.id, pokemonId: pokemon.id, nombre: pokemon.name, region, exito, fecha: new Date().toISOString() },
          ...previous.historial,
        ].slice(0, 12),
      };
    });
  };

  const reabastecer = () => {
    setState((previous) => {
      if (previous.inventario.pokeball + previous.inventario.superball > 0) return previous;
      return {
        ...previous,
        inventario: { pokeball: 8, superball: 2, bayas: previous.inventario.bayas },
      };
    });
  };

  const setNombre = (nombre) => setState((previous) => ({
    ...previous,
    perfil: { ...previous.perfil, nombre: nombre.trim().slice(0, 28) || 'Entrenador' },
  }));

  const resetProgreso = () => setState({ ...emptyState, inventario: { ...starterInventory } });

  return (
    <AppContext.Provider value={{
      ...state, toggleFavorito, registrarExploracion, registrarIntento,
      reabastecer, registrarPaso, registrarRecoleccion, setNombre, resetProgreso,
    }}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (!context) throw new Error('useApp debe utilizarse dentro de AppProvider');
  return context;
}
