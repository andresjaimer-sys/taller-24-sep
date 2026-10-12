export const TOTAL_POKEMON = 1025;

export function pokemonIdFromUrl(url) {
  const match = String(url || '').match(/\/pokemon\/(\d+)\/?$/);
  return match ? Number(match[1]) : null;
}

export function pokemonArtwork(id) {
  return 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/' + id + '.png';
}

export function pokemonSprite(id) {
  return 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/' + id + '.png';
}

export function displayName(name) {
  return String(name || '').replaceAll('-', ' ').replace(/\b\w/g, (letter) => letter.toUpperCase());
}

export const TYPE_COLORS = {
  normal: '#8B92A0', fire: '#F08050', water: '#4B90D9', grass: '#5DA56B',
  electric: '#D5A32C', ice: '#64B4C2', fighting: '#CB6D56',
  poison: '#9A73BE', ground: '#C39B67', flying: '#7B99D1',
  psychic: '#E879A9', bug: '#81A356', rock: '#A28F75',
  ghost: '#7568B7', dragon: '#6175C8', dark: '#657080',
  steel: '#7097A4', fairy: '#D889B8',
};

export function typeColor(type) {
  return TYPE_COLORS[type] || '#7F91A8';
}
