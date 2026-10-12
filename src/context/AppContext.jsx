import { createContext, useContext, useEffect, useState } from 'react';

const STORAGE_KEY = 'pokemon-safari-state-v1';
const starterInventory = { pokeball: 12, superball: 5, bayas: 4 };

const emptyState = {
  favoritos: [],
  capturados: [],
  inventario: starterInventory,
  perfil: { nombre: 'Entrenador', regionPreferida: '' },
  estadisticas: { exploraciones: 0, intentos: 0, capturas: 0 },
  historial: [],
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

  const registrarExploracion = () => setState((previous) => ({
    ...previous,
    estadisticas: {
      ...previous.estadisticas,
      exploraciones: previous.estadisticas.exploraciones + 1,
    },
  }));

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
        inventario: { pokeball: 8, superball: 2, bayas: previous.inventario.bayas + 2 },
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
      reabastecer, setNombre, resetProgreso,
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
