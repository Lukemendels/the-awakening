/** Small, dependency-free first-person grid engine. Maps use 0 for walkable cells. */
export const clamp=(n,lo,hi)=>Math.max(lo,Math.min(hi,n));
export const wrapAngle=a=>((a+Math.PI)%(2*Math.PI)+2*Math.PI)%(2*Math.PI)-Math.PI;
export function solid(map,x,y){const row=map[Math.floor(y)];return !row||row[Math.floor(x)]===undefined||row[Math.floor(x)]!==0;}
export function canOccupy(map,x,y,r=.18,obstacles=[]){
  // Clamp the circle to each nearby cell; outside the map is solid.
  for(let cy=Math.floor(y-r);cy<=Math.floor(y+r);cy++)for(let cx=Math.floor(x-r);cx<=Math.floor(x+r);cx++){
    if(!solid(map,cx+.5,cy+.5))continue;
    const nx=clamp(x,cx,cx+1),ny=clamp(y,cy,cy+1);
    if((x-nx)**2+(y-ny)**2<r*r)return false;
  }
  for(const box of obstacles){const nx=clamp(x,box.x0,box.x1),ny=clamp(y,box.y0,box.y1);if((x-nx)**2+(y-ny)**2<r*r)return false;}
  return true;
}
export function move(map,player,forward,strafe,seconds,speed=2,obstacles=[]){
  const magnitude=Math.hypot(forward,strafe),scale=magnitude>1?1/magnitude:1;
  // Limit per-step distance to prevent tunneling at low frame rates.
  const distance=clamp(seconds,0,.1)*speed*scale,dx=(Math.cos(player.angle)*forward-Math.sin(player.angle)*strafe)*distance,dy=(Math.sin(player.angle)*forward+Math.cos(player.angle)*strafe)*distance;
  const p={...player};if(canOccupy(map,p.x+dx,p.y,.18,obstacles))p.x+=dx;if(canOccupy(map,p.x,p.y+dy,.18,obstacles))p.y+=dy;return p;
}
export function castRay(map,x,y,angle,maxDistance=32){
  const dx=Math.cos(angle),dy=Math.sin(angle);let mx=Math.floor(x),my=Math.floor(y);
  if(solid(map,x,y))return {distance:0,x,y,cell:0,side:0};
  const ddx=dx===0?Infinity:Math.abs(1/dx),ddy=dy===0?Infinity:Math.abs(1/dy);
  const sx=dx<0?-1:1,sy=dy<0?-1:1;
  let tx=dx<0?(x-mx)*ddx:(mx+1-x)*ddx,ty=dy<0?(y-my)*ddy:(my+1-y)*ddy;
  for(let i=0;i<256;i++){
    let d,side;if(tx<ty){d=tx;tx+=ddx;mx+=sx;side=0;}else{d=ty;ty+=ddy;my+=sy;side=1;}
    if(d>maxDistance)return null;
    if(solid(map,mx+.5,my+.5))return {distance:d,x:x+dx*d,y:y+dy*d,cell:map[my]?.[mx]??1,side};
  }return null;
}
function crossesBox(x,y,dx,dy,box){let lo=0,hi=1;for(const [p,d,min,max] of [[x,dx,box.x0,box.x1],[y,dy,box.y0,box.y1]]){if(Math.abs(d)<1e-9){if(p<min||p>max)return false;}else{let a=(min-p)/d,b=(max-p)/d;if(a>b)[a,b]=[b,a];lo=Math.max(lo,a);hi=Math.min(hi,b);if(lo>hi)return false;}}return hi>=0&&lo<=1;}
export function nearestReachable(map,player,objects,maxDistance=1.35,viewAngle=.72,obstacles=[],preferredId=null){
 let best=null,preferred=null;for(const obj of objects){const dx=obj.x-player.x,dy=obj.y-player.y,d=Math.hypot(dx,dy),rel=Math.abs(wrapAngle(Math.atan2(dy,dx)-player.angle));
  if(d>maxDistance||rel>viewAngle)continue;if(obstacles.some(box=>box.id!==obj.id&&crossesBox(player.x,player.y,dx,dy,box)))continue;const hit=castRay(map,player.x,player.y,Math.atan2(dy,dx),d);if(hit&&hit.distance<d-.05)continue;
  const candidate={...obj,distance:d,alignment:rel};if(obj.id===preferredId)preferred=candidate;
  if(!best||rel<best.alignment-1e-6||(Math.abs(rel-best.alignment)<1e-6&&d<best.distance))best=candidate;
 }return preferred&&preferred.alignment<=best.alignment+.06?preferred:best;
}
