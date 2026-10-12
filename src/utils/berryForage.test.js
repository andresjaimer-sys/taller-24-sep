import test from 'node:test';
import assert from 'node:assert/strict';
import { getBerryBushes, adjacentTo, stepsUntilReady, harvestTarget, checkHarvestHit, rewardForHarvest } from './berryForage.js';
import { START_TILE, terrainAt, isPassable, WORLD_COLS, WORLD_ROWS } from './safariWorld.js';

for (const region of ['bosque','volcan','oceano','cueva','pradera']) {
  test('arbustos válidos y alcanzables en '+region,()=>{
    const bushes=getBerryBushes(region);
    assert.equal(bushes.length,3);
    assert.equal(new Set(bushes.map(b=>b.id)).size,3);
    const bushesSet=new Set(bushes.map(b=>b.x+','+b.y));
    const queue=[START_TILE];const seen=new Set([START_TILE.x+','+START_TILE.y]);
    for(let i=0;i<queue.length;i++){
      for(const [dx,dy] of [[0,1],[0,-1],[1,0],[-1,0]]){
        const x=queue[i].x+dx,y=queue[i].y+dy,key=x+','+y;
        if(x>0&&y>0&&x<WORLD_COLS-1&&y<WORLD_ROWS-1&&!bushesSet.has(key)&&!seen.has(key)&&isPassable(terrainAt(region,x,y))){seen.add(key);queue.push({x,y});}
      }
    }
    for (const b of bushes){
      assert.ok(isPassable(terrainAt(region,b.x,b.y)));
      assert.ok(!adjacentTo(START_TILE,b));
      assert.ok([[0,1],[0,-1],[1,0],[-1,0]].some(([dx,dy])=>seen.has((b.x+dx)+','+(b.y+dy))), 'arbusto inalcanzable '+b.id);
    }
  });
}
test('la precisión requiere detenerse dentro de la franja',()=>{
 const bush={id:'bosque-3-3',kind:'raro'};
 const {center,width}=harvestTarget(bush,0);
 assert.ok(checkHarvestHit(center,center,width));
 assert.ok(!checkHarvestHit(center+width,center,width));
 assert.ok(harvestTarget(bush,2).width<width);
});
test('regeneración por pasos y recompensas',()=>{
 assert.equal(stepsUntilReady({readyAt:40},12),28);
 assert.equal(stepsUntilReady({readyAt:40},41),0);
 assert.equal(rewardForHarvest({kind:'normal'},false),1);
 assert.equal(rewardForHarvest({kind:'raro'},true),3);
});
