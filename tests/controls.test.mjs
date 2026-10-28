import assert from 'node:assert/strict';
import {bindControls} from '../dist/immersive/controls.mjs';
class Target {
 constructor(){this.listeners={};this.style={};this.captures=new Set();this.released=[];}
 addEventListener(type,fn){(this.listeners[type]??=new Set()).add(fn);}
 removeEventListener(type,fn){this.listeners[type]?.delete(fn);}
 dispatch(type,data={}){const e={pointerId:1,clientX:50,clientY:50,preventDefault(){},...data};for(const fn of this.listeners[type]||[])fn(e);}
 setPointerCapture(id){this.captures.add(id);}
 hasPointerCapture(id){return this.captures.has(id);}
 releasePointerCapture(id){this.captures.delete(id);this.released.push(id);}
 getBoundingClientRect(){return {left:0,top:0,width:100,height:100};}
}
const win=new Target(),view=new Target(),stick=new Target(),knob=new Target(),body={};globalThis.window=win;globalThis.document={body};
let input={forward:0,strafe:0},looks=[],enabled=true;
const controls=bindControls({view,stick,knob,onInput:v=>input=v,onLook:(...v)=>looks.push(v),enabled:()=>enabled});
// Independent simultaneous pointers: a drag on the view does not disturb movement.
stick.dispatch('pointerdown',{pointerId:10,clientX:50,clientY:12});assert.ok(input.forward>.99);
view.dispatch('pointerdown',{pointerId:20,clientX:20,clientY:20});view.dispatch('pointermove',{pointerId:20,clientX:35,clientY:30});assert.equal(looks.length,1);assert.ok(input.forward>.99);
// A non-owner cannot move or release the stick; cancel releases only its owner.
stick.dispatch('pointermove',{pointerId:99,clientX:50,clientY:88});assert.ok(input.forward>.99);
stick.dispatch('pointercancel',{pointerId:10});assert.deepEqual(input,{forward:0,strafe:0});
view.dispatch('pointermove',{pointerId:20,clientX:40,clientY:30});assert.equal(looks.length,2);
view.dispatch('lostpointercapture',{pointerId:20});view.dispatch('pointermove',{pointerId:20,clientX:60,clientY:30});assert.equal(looks.length,2);
// Rotation/background reset cancels pointers and held keys; late pointer events stay inert.
stick.dispatch('pointerdown',{pointerId:30,clientX:50,clientY:12});view.dispatch('pointerdown',{pointerId:40});controls.reset();assert.ok(stick.released.includes(30)&&view.released.includes(40),'reset releases both pointer captures');assert.deepEqual(input,{forward:0,strafe:0});assert.equal(knob.style.transform,'translate(0,0)');
stick.dispatch('pointermove',{pointerId:30,clientX:50,clientY:88});view.dispatch('pointermove',{pointerId:40,clientX:90});assert.deepEqual(input,{forward:0,strafe:0});assert.equal(looks.length,2);
win.dispatch('keydown',{key:'w',target:body});assert.equal(input.forward,1);
win.dispatch('keyup',{key:'w',target:{}});assert.equal(input.forward,0,'keyup clears a held key even if focus moved');
win.dispatch('keydown',{key:'w',target:body});assert.equal(input.forward,1);win.dispatch('blur');assert.deepEqual(input,{forward:0,strafe:0});
enabled=false;stick.dispatch('pointerdown',{pointerId:51,clientY:12});view.dispatch('pointerdown',{pointerId:52});view.dispatch('pointermove',{pointerId:52,clientX:90});win.dispatch('keydown',{key:'w',target:body});assert.deepEqual(input,{forward:0,strafe:0},'portrait gate blocks fresh movement');assert.equal(looks.length,2,'portrait gate blocks fresh look');
enabled=true;
controls.dispose();stick.dispatch('pointerdown',{pointerId:50,clientY:12});assert.deepEqual(input,{forward:0,strafe:0});
console.log('Independent multitouch ownership, cancel, reset, stale events and blur passed (simulated events, not physical-device QA).');
