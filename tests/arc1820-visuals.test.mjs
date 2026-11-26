import test from 'node:test';
import assert from 'node:assert/strict';
import {makeArc1820Visual} from '../dist/immersive/arc1820-visuals.mjs';
import {freshArc1820,arc1820Act,canResumeArc1820} from '../dist/immersive/arc1820.mjs';
class Node {
  constructor(tag){this.tag=tag;this.children=[];this.style={};}
  setAttribute(k,v){this[k]=v;}
  append(...els){this.children.push(...els);}
  insertBefore(el,before){this.children.splice(this.children.indexOf(before),0,el);}
  find(match){return match(this)?this:this.children.map(c=>c.find(match)).find(Boolean);}
}
test('a player needs a reading and two registered notches to interpret the pointer',()=>{
  const original=globalThis.document;
  globalThis.document={createElement:t=>new Node(t),createElementNS:(_,t)=>new Node(t)};
  try{
    let s=freshArc1820();
    const draw=()=>makeArc1820Visual('high-temple','comparison',s,a=>{s=arc1820Act(s,a).state;});
    assert.equal(draw().find(n=>n.tag==='input'),undefined);
    s=arc1820Act(s,{type:'interact',id:'original-markers',choice:'observe'}).state;
    let panel=draw();const hold=panel.find(n=>n.textContent==='Hold the tracing to the stone');
    hold.onclick();assert.ok(!s.flags.registered);
    const slider=panel.find(n=>n.tag==='input');slider.value='1';slider.oninput();hold.onclick();
    assert.ok(s.flags.registered);
    panel=draw();panel.find(n=>n.textContent==='The instrument turned').onclick();
    assert.ok(s.flags.comparison);
    delete s.flags.registered;assert.ok(canResumeArc1820(s),'a solved legacy comparison still loads');
  }finally{globalThis.document=original;}
});
