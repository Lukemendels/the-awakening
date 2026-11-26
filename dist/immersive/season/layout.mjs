const companions={
  5:[['keeper','keeper']],6:[['mira','mounting']],7:[['kai','bell-record'],['mira','workshop-record']],
  8:[['signaler','vendor-signal']],9:[['mira','specimen-setup']],10:[['kai','city-model']],
  12:[['mira','array']],13:[['kai','companions']],14:[['kai','grammar']],15:[['mira','route']],
  16:[['kai','upper']],17:[['mira','continue']],18:[['kai','modified-instrument']],19:[['leader','leader']],
  20:[['leader','founding-memory']],21:[['leader','network']],22:[['thalor','evidence-table']],
  23:[['mira','central-channel']],24:[['leader','initiation']]
};
const glyph={water:'≈',record:'▤',optics:'◉',crystal:'◇',gate:'⌑',cargo:'▧',model:'◎',person:'✧'};
export function subject(id){
  if(['west','center','east','specimen-setup','marked-wall'].includes(id))return 'crystal';
  if(/keeper|leader|mira|initiat|figures|order|witness|famil|father|guide|ally|allies|thalor/.test(id))return 'person';
  if(/door|route$|passage|ascent|continue|exit|stacks|seam|stair/.test(id))return 'gate';
  if(/basin|canal_light|water|channel|trough|vision|memory/.test(id))return 'water';
  if(/lamp|mount|apparatus|instrument|bearing|marker|signal|telescope/.test(id))return 'optics';
  if(/array|stone|crystal|grammar|junction/.test(id))return 'crystal';
  if(/model|grid|comparison|chart|distribution|overlay|table|alignment/.test(id))return 'model';
  if(/cargo|crate|stock|cache|supply/.test(id))return 'cargo';
  return 'record';
}
export function floorPlan(sc){
  const stations={};
  for(const o of sc.objects){
    const type=subject(o.id);
    stations[o.id]={point:[o.x,1.19,o.y],label:o.label,mark:glyph[type],type};
  }
  const all=Object.values(stations);
  const people=(companions[sc.episode]||[]).flatMap(([name,id])=>{
    if(!stations[id])return [];
    const [x,,z]=stations[id].point;
    return [{name,x:x<4.5?x-.64:x+.64,z:z-.57}];
  });
  const walkable=(x,z)=>x>=.66&&x<=8.34&&z>=.66&&z<=7.34&&people.every(p=>Math.hypot(x-p.x,z-p.z)>.24)&&all.every(s=>Math.abs(x-s.point[0])>.45||Math.abs(z-s.point[2])>.42);
  for(const s of all){
    const [x,,z]=s.point;
    const options=[[x,z+1],[x-1,z],[x+1,z],[x,z-1],[x+.8,z+.8],[x-.8,z-.8]];
    s.approach=options.filter(([a,b])=>walkable(a,b)).sort((a,b)=>Math.hypot(a[0]-4.5,a[1]-4)-Math.hypot(b[0]-4.5,b[1]-4))[0];
  }
  const authored=Array.isArray(sc.start)?sc.start:[sc.start?.x,sc.start?.y];
  const start=[authored,[4.5,5.7],[4.5,4],[3.5,5.5],...all.map(s=>s.approach)].find(p=>p&&p.every(Number.isFinite)&&walkable(...p));
  const nearest=all.reduce((a,b)=>Math.hypot(a.point[0]-start[0],a.point[2]-start[1])<Math.hypot(b.point[0]-start[0],b.point[2]-start[1])?a:b);
  return {stations,people,walkable,start,yaw:Number.isFinite(sc.start?.angle)?sc.start.angle:Math.atan2(nearest.point[2]-start[1],nearest.point[0]-start[0]),height:()=>0,
    footstep:()=>[4,6,7,8,9,10,11,12].includes(sc.episode)?'floor-step':'stone-step'};
}
