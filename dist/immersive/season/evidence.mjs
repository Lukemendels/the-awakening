import {photoApparatus} from './apparatus.mjs';
import {makeArc67Visual} from '../arc67-visuals.mjs';
import {makeArc810Visual} from '../arc810-visuals.mjs';
import {makeArc1113Visual} from '../arc1113-visuals.mjs';
import {makeArc1417Visual} from '../arc1417-visuals.mjs';
import {makeArc1820Visual} from '../arc1820-visuals.mjs';
import {makeArc2124Visual} from '../arc2124-visuals.mjs';
export function node(tag,copy='',cls=''){
  const n=document.createElement(tag);if(copy)n.textContent=copy;if(cls)n.className=cls;return n;
}
export function button(label,fn){const b=node('button',label);b.type='button';b.onclick=fn;return b;}
const evidenceArt=id=>new URL('../../assets/generated/season/evidence-'+id+'.webp',import.meta.url).href;
function photoTrial(wall,state,act){
  const done=!!state.flags[wall?'wall_revealed':'crystal_ink'];
  const group=node('div','','instrument'),tool=node('div','','photo-tool');
  tool.style.backgroundImage='url("'+evidenceArt(wall?4:5)+'")';
  const cover=node('div','',wall?'veil':'beam'),range=node('input');range.type='range';range.min='0';range.max='100';range.value=done?'100':'0';
  const label=wall?'Draw back the wall covering':'Lower the lamp to graze the ledger';
  range.setAttribute('aria-label',label);
  const paint=()=>{tool.style.setProperty('--shift',-Number(range.value)+'%');tool.style.setProperty('--shade',String(1-Number(range.value)/100));};
  range.oninput=paint;range.onchange=()=>{if(!done&&+range.value>=78)act(wall?'expose':'oblique');};
  paint();tool.append(cover,range);group.append(node('p',label),tool);return group;
}
export function instrument(sc,id,state,dispatch){
  const act=choice=>dispatch({type:'interact',id,choice});
  const physical=photoApparatus(sc.episode,id,state,act);if(physical)return physical;
  if(sc.episode<=5)return (id==='old_wall'||id==='lamp')?photoTrial(id==='old_wall',state,act):null;
  if(sc.episode<=7)return makeArc67Visual(sc.id,id,state,dispatch);
  if(sc.episode<=10)return makeArc810Visual(sc.id,id,state,act);
  const create=sc.episode<=13?makeArc1113Visual:sc.episode<=17?makeArc1417Visual:sc.episode<=20?makeArc1820Visual:makeArc2124Visual;
  return create(sc.id,id,state,dispatch);
}

// A station can share the same room or evidence photograph with another scene.
// Keep the revealed vault, key and illuminated wall out of premature sightings.
const studies={
  canal_light:'../../assets/generated/shop-canal-view.webp', research:'../../assets/generated/shop-field-notes.webp',
  keeper:'season/evidence-keeper', western_stacks:'season/archive',lamp:'season/evidence-5',old_wall:'season/evidence-cover',
  'mount-notebook':'season/evidence-7','bell-record':'season/evidence-7','workshop-record':'season/evidence-6',
  'dock-signal':'season/barge','vendor-signal':'season/barge','condemned-cargo':'../../assets/generated/disposal-barge.webp',
  channel:'season/evidence-vision',news:'season/barge',wall:'season/evidence-12',array:'../../assets/13_ Crystal Array.webp',
  companions:'../../assets/15B_Mira.webp',patrol:'season/evidence-15',father:'season/evidence-17',
  shaft:'season/observatory',robes:'season/evidence-24',leader:'../../assets/18_Order of Seraphim.webp',
  'crystal-memory':'../../assets/generated/crystal-fracture-v1.webp','rings-memory':'season/evidence-10',
  'altered-grid':'season/evidence-10',harbor:'season/restored','distant-sites':'season/evidence-20'
};
export function stationPhoto(ep,id,state,plate){
  if(ep===11&&id==='vision'&&!state.flags.vision)return evidenceArt('vision');
  let path=studies[id];if(ep===6&&id==='channel')return evidenceArt(6);
  if(ep===21&&id==='allies')return evidenceArt(21);
  if(!path)return plate;
  if(path.startsWith('season/'))path='../../assets/generated/'+path+'.webp';
  return new URL(path,import.meta.url).href;
}
