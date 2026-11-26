import {clamp} from '../engine.mjs';

// Displacement sets a velocity, so either thumb can stay still while the camera moves.
export function bindShopSticks(movePad,lookPad,enabled,onTakeControl){
  const move={x:0,y:0},look={x:0,y:0},keys=new Set();
  const resetters=[];
  function bind(pad,axis){
    const knob=pad.querySelector('i');
    let pointer=null;
    function reset(){
      const id=pointer;pointer=null;axis.x=axis.y=0;
      knob.style.transform='';pad.classList.remove('held');
      if(id!==null&&pad.hasPointerCapture(id))pad.releasePointerCapture(id);
    }
    function update(e){
      if(pointer!==e.pointerId)return;
      const r=pad.getBoundingClientRect(),radius=r.width*.36;
      const dx=(e.clientX-r.left-r.width/2)/radius,dy=(e.clientY-r.top-r.height/2)/radius;
      const distance=Math.hypot(dx,dy),length=Math.min(1,distance);
      const scale=clamp((length-.15)/.85,0,1)/(distance||1);
      axis.x=dx*scale;axis.y=dy*scale;
      knob.style.transform='translate('+dx/(distance||1)*length*radius+'px,'+dy/(distance||1)*length*radius+'px)';
    }
    pad.onpointerdown=e=>{
      if(!enabled()||pointer!==null)return;
      e.preventDefault();onTakeControl();pointer=e.pointerId;pad.setPointerCapture(pointer);
      pad.classList.add('held');update(e);
    };
    pad.onpointermove=update;
    pad.onpointerup=pad.onpointercancel=pad.onlostpointercapture=e=>{if(e.pointerId===pointer)reset();};
    resetters.push(reset);
  }
  bind(movePad,move);bind(lookPad,look);
  const supported=['w','a','s','d','arrowleft','arrowright','arrowup','arrowdown'];
  window.addEventListener('keydown',e=>{
    const k=e.key.toLowerCase();
    if(!enabled()||!supported.includes(k)||e.altKey||e.metaKey||e.ctrlKey)return;
    e.preventDefault();onTakeControl();keys.add(k);
  });
  window.addEventListener('keyup',e=>keys.delete(e.key.toLowerCase()));
  function reset(){keys.clear();resetters.forEach(fn=>fn());}
  window.addEventListener('blur',reset);
  document.addEventListener('visibilitychange',()=>{if(document.hidden)reset();});
  return {move,look,keys,reset};
}
