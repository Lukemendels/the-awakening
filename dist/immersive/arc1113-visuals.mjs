/** Episode 11–13 visual evidence. Drawings are interpretive game staging. */
import {restoreArc1113} from './arc1113.mjs';
const NS='http://www.w3.org/2000/svg';
const el=(name,cls)=>{const n=document.createElement(name);if(cls)n.className=cls;return n;};
function svg(label){const s=document.createElementNS(NS,'svg');s.setAttribute('viewBox','0 0 360 150');s.setAttribute('role','img');s.setAttribute('aria-label',label);s.style.cssText='display:block;width:100%;max-height:145px;background:#071d2b;border-radius:.5rem';return s;}
function shape(parent,name,attrs){const n=document.createElementNS(NS,name);for(const [k,v] of Object.entries(attrs))n.setAttribute(k,String(v));parent.append(n);return n;}
function wrap(label){const n=el('section','arc1113-visual');n.setAttribute('aria-label',label);n.style.cssText='margin:.6rem 0;padding:.5rem;border:1px solid #70949a;border-radius:.7rem;background:#071d2b';return n;}
function caption(parent,text){const p=el('p');p.textContent=text;p.style.cssText='margin:.35rem;color:#c9dddb;font-size:.85rem';parent.append(p);}
function button(parent,text,fn){const b=el('button','secondary');b.type='button';b.textContent=text;b.style.cssText='margin:.25rem;min-height:48px';b.onclick=fn;parent.append(b);}
function projection(s){
 const visible=['west','center','east'].includes(s.placement),aligned=s.placement==='center',offset=s.placement==='west'?-55:s.placement==='east'?55:0;
 const picture=svg(!visible?'Carved lines with no projection':aligned?'Projected lines overlap the carved channels':'Projected lines fall to one side of the carved channels');
 shape(picture,'rect',{width:360,height:150,fill:'#172d36'});
 const marks=['M30 125 L180 28','M330 125 L180 28','M180 145 L180 28'];for(const d of marks)shape(picture,'path',{d,fill:'none',stroke:'#bb9a63','stroke-width':3,opacity:.8});
 if(visible){const g=shape(picture,'g',{transform:`translate(${offset} 0)`});for(const d of marks)shape(g,'path',{d,fill:'none',stroke:'#9debf0','stroke-width':2,opacity:.88});}
 return picture;
}
function restVisual(id,s,dispatch){
 const w=wrap('Array rest and wall projection');w.setAttribute('data-placement',s.placement);w.append(projection(s));
 caption(w,s.placement==='none'?'The wall is marked but no array is projecting.':s.placement==='carried'?'The array is in hand; place it on a rest to see where the light falls.':'The cyan projection can be compared with the carved channels.');
 if(s.placement==='carried'){
  const surface=el('div');surface.setAttribute('role','group');surface.setAttribute('aria-label','Drag the array onto this rest');surface.style.cssText='touch-action:none;cursor:grab;padding:.6rem;border:1px dashed #8dbac0;border-radius:.5rem;color:#f5ddb1';surface.textContent='Drag the carried array onto this rest';let pointer=null,start=0;
  surface.onpointerdown=e=>{pointer=e.pointerId;start=e.clientX;surface.setPointerCapture(pointer);};surface.onpointerup=e=>{if(e.pointerId!==pointer)return;const delta=Math.abs(e.clientX-start);pointer=null;if(delta>35)dispatch({type:'interact',id,choice:'place'});};surface.onpointercancel=surface.onlostpointercapture=()=>{pointer=null;};
  w.cancelInteraction=()=>{const p=pointer;pointer=null;try{if(p!==null&&surface.hasPointerCapture(p))surface.releasePointerCapture(p);}catch{}};w.append(surface);button(w,'Place the array here',()=>dispatch({type:'interact',id,choice:'place'}));
 }else if(s.placement===id)button(w,'Take the array from this rest',()=>dispatch({type:'interact',id,choice:'take'}));
 else caption(w,'Bring the array to this rest to try this position.');
 return w;
}
function junctionVisual(s,dispatch){const w=wrap('Carved channels and projected light');w.setAttribute('data-placement',s.placement);w.append(projection(s));caption(w,'Compare the cyan projection with the carved gold channels; move the same array if the lines do not meet.');button(w,'Trace the projected lines',()=>dispatch({type:'interact',id:'junction',choice:'trace'}));return w;}
function waterVision(s,dispatch){const shown=!!s.flags.vision,w=wrap('Water-vision');w.setAttribute('data-vision',shown?'seen':'unseen');const p=svg(shown?'An illustrative view of a vault and warning scrolls seen through water':'The water is moving; the image has not yet been examined');shape(p,'rect',{width:360,height:150,fill:'#0c3446'});for(let y=30;y<150;y+=18)shape(p,'path',{d:`M0 ${y} Q90 ${y-7} 180 ${y} T360 ${y}`,fill:'none',stroke:'#72c7d3','stroke-width':2,opacity:.35});if(shown){shape(p,'path',{d:'M90 120 V50 L180 18 L270 50 V120Z',fill:'#173644',stroke:'#d9bb79','stroke-width':3});shape(p,'rect',{x:145,y:72,width:70,height:35,fill:'#d6c7a2'});shape(p,'path',{d:'M155 82h50 M155 90h40 M155 98h45',stroke:'#705f46','stroke-width':2});}w.append(p);caption(w,shown?'The image of the vault remains in the water.':'Watch the moving water to see what it reveals.');if(!shown)button(w,'Watch the image',()=>dispatch({type:'interact',id:'vision',choice:'observe'}));return w;}
function passageVisual(dispatch){const w=wrap('The open passage');const p=svg('The revealed doorway and descending passage');shape(p,'rect',{width:360,height:150,fill:'#162d38'});shape(p,'path',{d:'M95 150V65 Q95 18 180 18 Q265 18 265 65V150Z',fill:'#07151e',stroke:'#d7b77c','stroke-width':5});for(let i=0;i<5;i++)shape(p,'path',{d:`M${112+i*6} ${144-i*12} H${248-i*6}`,stroke:'#68bcc7','stroke-width':2,opacity:.65});w.append(p);caption(w,'The opening is already clear. The others have gathered the evidence.');button(w,'Follow the others into the passage',()=>dispatch({type:'interact',id:'doorway',choice:'follow'}));return w;}
/** dispatch receives the same action object used by arc1113Act. */
export function makeArc1113Visual(sceneId,objectId,state,dispatch){
 if(typeof dispatch!=='function')throw new TypeError('dispatch callback required');const s=restoreArc1113(state?.state??state);
 if(sceneId==='warehouse-escape'&&['west','center','east'].includes(objectId))return restVisual(objectId,s,dispatch);
 if(sceneId==='warehouse-escape'&&objectId==='junction')return junctionVisual(s,dispatch);
 if(sceneId==='escalation'&&objectId==='vision')return waterVision(s,dispatch);
 if(sceneId==='passage'&&objectId==='doorway')return passageVisual(dispatch);
 return null;
}
