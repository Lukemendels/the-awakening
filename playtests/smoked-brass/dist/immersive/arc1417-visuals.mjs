import {arc1417Scenes} from './arc1417.mjs';
/** Interpretive, captioned visual evidence for Ep14–16; audio is not needed. */
const NS='http://www.w3.org/2000/svg';
function make(label){const box=document.createElement('section');box.setAttribute('aria-label',label);box.style.cssText='margin:.6rem 0;padding:.5rem;border:1px solid #70949a;border-radius:.7rem;background:#071d2b';const svg=document.createElementNS(NS,'svg');svg.setAttribute('viewBox','0 0 360 130');svg.setAttribute('role','img');svg.setAttribute('aria-label',label);svg.style.cssText='display:block;width:100%;max-height:120px;background:#102b38;border-radius:.4rem';box.append(svg);return [box,svg];}
function draw(parent,name,attrs){const n=document.createElementNS(NS,name);for(const [key,value] of Object.entries(attrs))n.setAttribute(key,String(value));parent.append(n);return n;}
function caption(box,text){const p=document.createElement('p');p.textContent=text;p.style.cssText='margin:.35rem;color:#d0e2de;font-size:.85rem';box.append(p);}
function choices(box,sceneId,objectId,state,dispatch){const s=state?.state??state;const scene=arc1417Scenes.find(x=>x.id===sceneId),object=scene?.objects.find(x=>x.id===objectId);for(const c of object?.choices??[]){if(sceneId==='ancient-resonance'&&objectId==='grammar'){if(c.id==='place'&&s.placement!=='carried')continue;if(['turn-a','turn-b','take'].includes(c.id)&&s.placement!=='channel')continue;}const b=document.createElement('button');b.type='button';b.className='secondary';b.textContent=c.label;b.style.cssText='min-height:48px;margin:.25rem';b.onclick=()=>dispatch({type:'interact',id:objectId,choice:c.id});box.append(b);}return box;}
export function makeArc1417Visual(sceneId,objectId,state,dispatch){
 if(typeof dispatch!=='function')throw new TypeError('dispatch callback required');
 if(sceneId==='ancient-resonance'&&['grammar','water','array'].includes(objectId)){
  const [box,svg]=make('Carved crystal and channel forms follow the same curved direction');
  draw(svg,'path',{d:'M20 100 C80 100 90 30 165 30 S260 100 340 100',fill:'none',stroke:'#71d9df','stroke-width':7});
  draw(svg,'path',{d:'M20 85 C80 85 90 15 165 15 S260 85 340 85',fill:'none',stroke:'#d3b777','stroke-width':3,'stroke-dasharray':'8 5'});
  draw(svg,'text',{x:40,y:125,fill:'#f5ddb1','font-size':13}).textContent='A';draw(svg,'path',{d:'M58 123 C68 123 68 108 78 108 S88 123 98 123',fill:'none',stroke:'#f4dc9f','stroke-width':2});draw(svg,'text',{x:235,y:125,fill:'#f5ddb1','font-size':13}).textContent='B';draw(svg,'path',{d:'M253 108 C263 108 263 123 273 123 S283 108 293 108',fill:'none',stroke:'#f4dc9f','stroke-width':2});caption(box,'Kai’s sketch shows two orientations. Compare the curved form with the water path; the chamber will respond when you try one.');return choices(box,sceneId,objectId,state,dispatch);
 }
 if(sceneId==='the-hunt'&&['grid','patrol','route'].includes(objectId)){
  const [box,svg]=make('Detection sweep moves across a passage; a temporary gap follows it');
  draw(svg,'rect',{x:25,y:50,width:310,height:30,fill:'#264c56',stroke:'#8bc7ca','stroke-width':2});
  draw(svg,'path',{d:(state?.state??state)?.sweep==='gap'?'M270 10L310 65L270 120':'M115 10L155 65L115 120',fill:'#f0d38a',opacity:.6});
  draw(svg,'path',{d:'M230 30L270 65L230 100',fill:'none',stroke:'#93d7dc','stroke-width':3,'stroke-dasharray':'6 5'});
  caption(box,(state?.state??state)?.sweep==='gap'?'The sweep has moved past for a moment.':'The bright sweep crosses the passage. Watch how it moves.');return choices(box,sceneId,objectId,state,dispatch);
 }
 if(sceneId==='ascending-powers'&&['lower','upper','ascent'].includes(objectId)){
  const [box,svg]=make('A continuous water channel rises around the central space through successive landings');
  draw(svg,'ellipse',{cx:180,cy:95,rx:110,ry:23,fill:'none',stroke:'#6ab7c0','stroke-width':2,opacity:.5});
  draw(svg,'path',{d:'M70 95 C70 115 285 115 290 92 C295 70 75 76 80 57 C85 38 275 47 275 29',fill:'none',stroke:'#91edf0','stroke-width':5});
  for(const [x,y] of [[90,100],[250,69],[190,43]])draw(svg,'circle',{cx:x,cy:y,r:5,fill:'#e2c487'});for(const [x,y,t] of [[12,122,'Lower channel'],[245,85,'Far landing'],[108,26,'Inner landing']])draw(svg,'text',{x,y,fill:'#f5ddb1','font-size':11}).textContent=t;
  caption(box,'Trace the channel through the landings. The group’s current ascent stage is '+((state?.state??state)?.ascent??0)+' of 3.');return choices(box,sceneId,objectId,state,dispatch);
 }
 return null;
}
