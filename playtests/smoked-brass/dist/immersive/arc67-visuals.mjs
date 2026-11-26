import {restore67} from './arc67.mjs';
const SVG='http://www.w3.org/2000/svg';
const el=(tag,text)=>{const n=document.createElement(tag);if(text)n.textContent=text;return n;};
const svgNode=(name,attrs={})=>{const n=document.createElementNS(SVG,name);for(const [k,v] of Object.entries(attrs))n.setAttribute(k,String(v));return n;};
function element(title,description){const root=el('section');root.className='arc67-visual';root.style.cssText='border:1px solid #8aa5a4;border-radius:12px;padding:.75rem;background:#071c2a;margin:.6rem 0';root.append(el('h3',title),el('p',description));return root;}
function button(label,action,dispatch,disabled=false){const b=el('button',label);b.type='button';b.className='secondary';b.disabled=disabled;b.style.margin='.2rem';b.addEventListener('click',()=>dispatch(action));return b;}
function svg(title){const s=svgNode('svg',{viewBox:'0 0 440 165',role:'img','aria-label':title});s.style.cssText='width:100%;height:auto;max-height:180px;display:block;background:#071522;border-radius:8px';return s;}
function line(s,x1,y1,x2,y2,color,width=2){s.append(svgNode('line',{x1,y1,x2,y2,stroke:color,'stroke-width':width,'stroke-linecap':'round'}));}
function label(s,x,y,text,color='#f6e2ae'){const t=svgNode('text',{x,y,fill:color,'font-size':12,'font-family':'system-ui, sans-serif'});t.textContent=text;s.append(t);}
function mountingGraphic(coupled,observed){
 const s=svg(coupled?'The same mounted crystal near a water channel':'The same mounted crystal away from the water channel');
 // A fixed, identical specimen and frame in each view. The channel is the variable.
 s.append(svgNode('rect',{x:72,y:27,width:128,height:108,rx:8,fill:'#253b42',stroke:'#d8ba79','stroke-width':4}));
 s.append(svgNode('path',{d:'M136 35 L166 75 L136 124 L106 75 Z',fill:observed?'#5aaebc':'#42565a',stroke:'#c7e5df','stroke-width':2}));
 if(observed){s.append(svgNode('path',{d:'M136 49 L136 100 M136 70 L116 89 M136 70 L154 85',fill:'none',stroke:coupled?'#b5ffff':'#b4d6d4','stroke-width':3}));}
 if(coupled){for(const y of [72,88,104])s.append(svgNode('path',{d:`M235 ${y} Q260 ${y-8} 285 ${y} T335 ${y} T385 ${y}`,fill:'none',stroke:observed?'#78e6ef':'#35747f','stroke-width':3}));label(s,250,45,'water channel');}
 else{line(s,239,60,378,60,'#56727a');label(s,238,88,'away from channel','#c7d3d0');}
 label(s,81,155,'same mounting and crystal');return s;
}
function wavePath(y,amplitude){const xs=[0,13,26,39,52,65,78,91,104,117,130,143,156,169,182,195,208,221,234,247,260,273,286,299];const v=[0,-.3,-1,-.25,0,.25,1,.3,0,-.3,-1,-.25,0,.25,1,.3,0,-.3,-1,-.25,0,.25,1,.3];return xs.map((x,i)=>`${i?'L':'M'} ${118+x} ${y+v[i]*amplitude}`).join(' ');}
function recordGraphic(observations){
 const s=svg('Illustrative comparison of the mounting and bell records. Recorded traces appear after they are examined.');
 const rows=[{key:'mountOrdinary',name:'Mount · ordinary',amp:8},{key:'mountAligned',name:'Mount · alignment',amp:18},{key:'bellAligned',name:'Bell · alignment',amp:14}];
 rows.forEach((r,i)=>{const y=31+i*50;label(s,8,y+4,r.name,'#cfe1de');line(s,117,y,418,y,'#42616a',1);if(observations[r.key])s.append(svgNode('path',{d:wavePath(y,r.amp),fill:'none',stroke:i===2?'#e9c77f':'#80e2e9','stroke-width':3}));else label(s,220,y+4,'record not yet read','#8aa0a4');});return s;
}
/**
 * Return a self-contained, accessible visual station or null for generic notes.
 * dispatch accepts {type:'interact', id, choice}; caller rerenders after action.
 * Diagrams are illustrative game staging, not purported source measurements.
 */
export function makeArc67Visual(sceneId,objectId,state,dispatch){
 const s=restore67(state?.state??state);if(typeof dispatch!=='function')throw new TypeError('dispatch callback required');
 if(sceneId==='mira-mounting'&&s.chapter===6&&(objectId==='mounting'||objectId==='channel')){
  const coupled=objectId==='channel',key=coupled?'coupled':'isolated',observed=s.observations[key];
  const root=element(coupled?'Beside the water':'Away from the channel','An illustrative view of the same crystal and mount. Compare what changes when its position changes.');root.append(mountingGraphic(coupled,observed));
  root.append(el('p',observed?(coupled?'The mounted crystal’s lines become more distinct near the moving water.':'The mounting reveals the internal geometry without the nearby channel.'):'This position has not been observed yet.'));
  root.append(button(observed?'Observe again':'Observe this position',{type:'interact',id:objectId,choice:key},dispatch,s.solved));return root;
 }
 if(sceneId==='kai-comparison'&&s.chapter===7&&(objectId==='workshop-record'||objectId==='bell-record')){
  const root=element('Kai’s comparison','Compare the shapes and intensities in these illustrative traces. Read the available records before deciding what they support.');root.append(recordGraphic(s.observations));
  if(objectId==='workshop-record'){root.append(button('Read ordinary mounting record',{type:'interact',id:objectId,choice:'ordinary'},dispatch,s.solved),button('Read aligned mounting record',{type:'interact',id:objectId,choice:'aligned'},dispatch,s.solved));}
  else root.append(button('Read aligned bell record',{type:'interact',id:objectId,choice:'bell-aligned'},dispatch,s.solved));
  return root;
 }
 return null;
}
