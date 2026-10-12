import { WORLD_COLS, WORLD_ROWS, START_TILE, terrainAt, isPassable } from './safariWorld.js';

const STEPS = [[1,0],[-1,0],[0,1],[0,-1]];
export const BERRY_CAPACITY = 25;
export const BERRY_COOLDOWN = { normal: 26, raro: 40 };

export function getBerryBushes(region) {
  const seed = [...String(region)].reduce((sum, char) => sum + char.charCodeAt(0), 0);
  const queue = [{...START_TILE, distance:0}];
  const visited = new Set([START_TILE.x+','+START_TILE.y]);
  const candidates = [];
  for (let i=0; i<queue.length; i++) {
    const current=queue[i];
    if (current.distance >= 3 && current.distance <= 19
      && isPassable(terrainAt(region,current.x,current.y))
      && terrainAt(region,current.x,current.y) !== 'path') {
      const neighbors = STEPS.filter(([dx,dy]) => isPassable(terrainAt(region,current.x+dx,current.y+dy))).length;
      if (neighbors >= 2) candidates.push(current);
    }
    for (const [dx,dy] of STEPS) {
      const x=current.x+dx, y=current.y+dy, key=x+','+y;
      if (!visited.has(key) && x>=1 && y>=1 && x<WORLD_COLS-1 && y<WORLD_ROWS-1 && isPassable(terrainAt(region,x,y))) {
        visited.add(key); queue.push({x,y,distance:current.distance+1});
      }
    }
  }
  const ordered=candidates.sort((a,b) => {
    const score = p => ((p.x*97+p.y*53+p.x*p.y*11+seed*31)%101);
    return score(a)-score(b);
  });
  const chosen=[];
  for (const c of ordered) {
    if (chosen.length>=3) break;
    if (chosen.some(p=>Math.abs(p.x-c.x)+Math.abs(p.y-c.y)<5)) continue;
    chosen.push(c);
  }
  if (chosen.length<3) {
    for (const c of ordered) {
      if (chosen.length>=3) break;
      if (!chosen.some(p=>p.x===c.x&&p.y===c.y)) chosen.push(c);
    }
  }
  return chosen.map((p,i)=>({
    id:region+'-'+p.x+'-'+p.y,
    x:p.x,y:p.y,
    kind:i===2?'raro':'normal',
    name:i===2?'Arbusto dorado':'Arbusto silvestre',
  }));
}

export function adjacentTo(position,bush) {
  return Math.abs(position.x-bush.x)+Math.abs(position.y-bush.y)===1;
}

export function stepsUntilReady(bushState, currentSteps) {
  return Math.max(0,(bushState?.readyAt ?? 0)-currentSteps);
}

export function harvestTarget(bush, round) {
  const n=[...bush.id].reduce((total,char)=>total+char.charCodeAt(0),0);
  const centers=[0.28,0.64,0.46,0.73];
  const center=centers[(round+(n%centers.length))%centers.length];
  const width=(bush.kind==='raro' ? 0.115:0.18)*Math.pow(0.77,round);
  return {center,width};
}

export function checkHarvestHit(value,center,width) {
  if (!Number.isFinite(value)) return false;
  return Math.abs(value-center)<=width/2;
}

export function rewardForHarvest(bush,perfect) {
  return bush.kind==='raro'?(perfect?3:2):(perfect?2:1);
}
