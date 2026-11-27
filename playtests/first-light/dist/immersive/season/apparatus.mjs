// The photographed surfaces are fixed. Projected marks and instrument positions
// come from the same state that the story engine uses to accept a finding.
const svgNS='http://www.w3.org/2000/svg';
function draw(parent,tag,attrs){
  const n=document.createElementNS(svgNS,tag);for(const [key,v] of Object.entries(attrs))n.setAttribute(key,v);parent.append(n);return n;
}
function stroke(root,d,color,width=3,extra={}){
  return draw(root,'path',{d,fill:'none',stroke:color,'stroke-width':width,'stroke-linecap':'round',...extra});
}
function btn(label,fn){const n=document.createElement('button');n.type='button';n.textContent=label;n.onclick=fn;return n;}
function option(root,label,id,choose){
  const b=btn(label,()=>choose(id));root.append(b);return b;
}
function surface(ep,description){
  const root=document.createElement('section');root.className='photo-apparatus';
  const scene=document.createElement('div');scene.className='optical-field';
  scene.style.backgroundImage='linear-gradient(#13180e29,#081b1e60),url("'+new URL('../../assets/generated/season/evidence-'+ep+'.webp',import.meta.url).href+'")';
  const marks=draw(scene,'svg',{viewBox:'0 0 400 180',role:'img','aria-label':description});
  const legend=document.createElement('p');legend.textContent=description;const actions=document.createElement('div');actions.className='actions';
  root.append(scene,legend,actions);return {root,scene,marks,actions,legend};
}
const amber='#ffdd91',blue='#aaf6ed';
export const fork='M77 126 Q124 104 201 80 Q251 61 307 74 M201 80 Q235 81 260 111 l12 -3 19 14';
function junction(s,choose){
  const f=surface(12,'The gold tracing follows the carved channels. The pale projection comes from the array.');
  stroke(f.marks,fork,'#403424',8);stroke(f.marks,fork,amber,3);
  const offsets={west:-60,center:0,east:61};if(s.placement in offsets){
    stroke(f.marks,fork,blue,2.7,{transform:'translate('+offsets[s.placement]+' 0)','stroke-dasharray':'9 5'});
  }else f.legend.textContent+=' The stone is dark.';
  const points=[[77,126,'Foot of the channel'],[201,80,'Fork in the channel'],[260,111,'Nick on the short branch']];
  const pin=draw(f.marks,'circle',{r:8,fill:'none',stroke:'#fff0c7','stroke-width':2,visibility:'hidden'});
  const note=document.createElement('p');note.setAttribute('role','status');f.root.append(note);
  function markPoint(x,y){
    pin.setAttribute('cx',x);pin.setAttribute('cy',y);pin.setAttribute('visibility','visible');
    if(Math.hypot(x-201,y-80)>22){note.textContent='A single cut passes under your fingertip here. Where does it divide?';return;}
    choose('trace');
  }
  f.legend.textContent+=' Mark the place where the projected fork meets the carved fork.';
  f.scene.onclick=e=>{
    const matrix=f.marks.getScreenCTM();if(!matrix)return;
    const point=new DOMPoint(e.clientX,e.clientY).matrixTransform(matrix.inverse());
    markPoint(point.x,point.y);
  };
  f.scene.style.cursor='crosshair';
  const details=document.createElement('details'),summary=document.createElement('summary');
  summary.textContent='Choose a landmark by name';details.append(summary);
  for(const [x,y,label] of points)details.append(btn(label,()=>markPoint(x,y)));
  f.actions.append(details);return f.root;
}
function bearing(s,choose){
  const f=surface(14,'The water curves toward the outlet. Turn the mounted crystal until the light follows the same bend.');
  const arc='M98 126 Q133 123 157 86 T226 73 Q254 93 302 88';
  stroke(f.marks,arc,amber,4);
  if(s.placement!=='channel'){option(f.actions,'Read the carving','read',choose);option(f.actions,'Seat the array','place',choose);return f.root;}
  const ray=stroke(f.marks,arc,blue,3,{'stroke-dasharray':'7 4'});
  const range=document.createElement('input');range.type='range';range.min='-90';range.max='90';range.step='3';range.value='48';range.setAttribute('aria-label','Rotate the mounted crystal');
  const turn=()=>ray.setAttribute('transform','rotate('+range.value+' 200 90)');range.oninput=turn;turn();
  f.root.insertBefore(range,f.actions);
  f.actions.append(btn('Pass light through the array',()=>choose(Math.abs(+range.value)<=9?'turn-a':'turn-b')));
  option(f.actions,'Lift the array','take',choose);return f.root;
}
function distribution(s,choose,previousPulse){
  const f=surface(23,'Follow a channel from the central source. The brass rings mark the inner district and the outer receiver.');
  const points=[[72,112],[205,62],[328,111]];
  stroke(f.marks,'M72 112 Q155 178 328 111',s.route==='bypass'?blue:'#dfd1ae',s.route==='bypass'?5:2);
  stroke(f.marks,'M72 112 Q120 67 205 62 Q270 52 328 111',s.route==='linked'?blue:'#dfd1ae',s.route==='linked'?5:2);
  for(const [i,[x,y]] of points.entries()){
    draw(f.marks,'circle',{cx:x,cy:y,r:11,fill:i===0||(i===2&&previousPulse==='bypass'&&s.route==='bypass')?blue:'#40403a',stroke:amber,'stroke-width':3});
    const label=draw(f.marks,'text',{x,y:y-18,'text-anchor':'middle',fill:'#fff1cd',stroke:'#182326','stroke-width':3,'paint-order':'stroke','font-size':13});label.textContent=['Source','Inner ring','Receiver'][i];
  }
  option(f.actions,'Open the direct channel','bypass',choose);option(f.actions,'Open the inner-ring channel','linked',choose);option(f.actions,'Send a pulse','observe',choose);return f.root;
}
export function comparisonInstrument(s,dispatch){
  const choose=choice=>dispatch({type:'interact',id:'comparison',choice});
  const f=surface(18,'Fit both punched holes in the tracing over the fixed notches on the stone.');
  const fixed='M108 130 L291 48';
  stroke(f.marks,fixed,amber,3);
  for(const [x,y] of [[108,130],[291,48]])draw(f.marks,'circle',{cx:x,cy:y,r:3,fill:amber});
  const pointer=stroke(f.marks,'M108 130 L295 82',blue,4);
  const dust=stroke(f.marks,'M291 48 Q313 62 295 82','#f5f0ce',3,{'stroke-dasharray':'3 4'});
  const foil=draw(f.marks,'g',{});
  stroke(foil,fixed,'#fff3c6',2,{'stroke-dasharray':'6 4'});
  for(const [x,y] of [[108,130],[291,48]])draw(foil,'circle',{cx:x,cy:y,r:7,stroke:'#fff9e9',fill:'none','stroke-width':2});
  const matched=!!s.flags.registered;
  const range=document.createElement('input');range.type='range';range.min='-40';range.max='40';range.value=matched?'0':'-28';
  range.setAttribute('aria-label','Slide the tracing');range.disabled=matched;
  const paint=()=>{
    const offset=Number(range.value);foil.setAttribute('transform','translate('+offset+' 0)');
    const aligned=Math.abs(offset)<=3;pointer.setAttribute('opacity',aligned?'1':'.32');dust.setAttribute('opacity',aligned?'1':'.08');
    range.setAttribute('aria-valuetext',aligned?'Both notches line up':offset<0?'Holes left of the notches':'Holes right of the notches');
  };
  range.oninput=paint;paint();
  if(!s.flags.markers&&!s.flags.instrument){
    f.legend.textContent='The tracing is blank at the rim. Take a reading at the stone markers or the brass instrument.';
    return f.root;
  }
  if(!matched){
    f.root.insertBefore(range,f.actions);
    f.actions.append(btn('Hold the tracing to the stone',()=>dispatch({type:'register',offset:Number(range.value)})));
  }else{
    f.legend.textContent='The holes fit both stones. The pointer crosses the rim beyond the clean crescent. What moved?';
    option(f.actions,'The instrument turned','altered',choose);option(f.actions,'The stones shifted','original',choose);
  }
  return f.root;
}
function chart(s,choose){
  const f=surface(8,'Two waterways leave the mooring. A light beside a route marks a signal Kaelan has actually seen.');
  const routes=[
    ['inner','Inner channel','M34 94 Q102 93 141 52 T271 47 L361 39',s.flags.dock_signal,51],
    ['canal','Canal passage','M34 94 Q101 93 137 119 T270 132 L361 130',s.flags.vendor_signal,143]
  ];
  for(const [id,label,path,seen,y] of routes){
    stroke(f.marks,path,'#182320',8);stroke(f.marks,path,seen?blue:amber,3,{'stroke-dasharray':seen?'0':'6 4'});
    const target=stroke(f.marks,path,'transparent',27);target.style.pointerEvents='stroke';target.style.cursor='pointer';target.onclick=()=>choose(id);
    const name=draw(f.marks,'text',{x:215,y,fill:'white',stroke:'#201d13','paint-order':'stroke','stroke-width':4,'font-size':16});name.textContent=label;
    if(seen)draw(f.marks,'circle',{cx:361,cy:y-7,r:5,fill:blue});
    option(f.actions,id==='inner'?'Take inner channel':'Take canal passage',id,choose);
  }
  option(f.actions,'Wait and reconsider','wait',choose);return f.root;
}
function cityModel(s,choose){
  const f=surface(10,'The model carries the surveys you have brought to the table. Lift a tracing to inspect how it crosses the others.');
  const layers=[
    ['architecture','Building plans','M100 38 V134 M180 31 V145 M266 38 V130 M72 74 H313 M84 109 H299',amber],
    ['water','Canal survey','M57 94 C90 26 282 24 329 91 C308 155 101 163 57 94 M94 96 C119 48 246 42 289 90 C264 134 129 142 94 96',blue],
    ['astronomy','Star record','M85 125 L153 74 L223 82 L297 32','#fff0d1']
  ];
  for(const [flag,label,path,color] of layers){
    if(!s.flags[flag])continue;
    const mark=stroke(f.marks,path,color,3);
    const toggle=btn(label,()=>{mark.style.display=mark.style.display==='none'?'':'none';toggle.setAttribute('aria-pressed',String(mark.style.display!== 'none'));});
    toggle.setAttribute('aria-pressed','true');f.actions.append(toggle);
  }
  const readings=document.createElement('div');readings.className='actions';
  option(readings,'The rings connect architecture, water and resonance','resonance',choose);option(readings,'The rings mark trade routes alone','trade-only',choose);option(readings,'These records are unrelated','unrelated',choose);f.root.append(readings);return f.root;
}
export function photoApparatus(ep,id,state,choose,previousPulse){
  if(ep===8&&id==='route-chart')return chart(state,choose);
  if(ep===10&&id==='city-model')return cityModel(state,choose);
  if(ep===12&&id==='junction')return junction(state,choose);
  if(ep===14&&id==='grammar')return bearing(state,choose);
  if(ep===23&&id==='distribution')return distribution(state,choose,previousPulse);
  return null;
}
