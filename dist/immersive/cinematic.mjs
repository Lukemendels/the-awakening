/** One clock for a bounded cinematic; hooks own rendering and speech. */
export class CinematicClock {
 constructor({shots,onShot,onComplete,now=()=>performance.now(),setTimer=setTimeout,clearTimer=clearTimeout}){this.shots=shots;this.onShot=onShot;this.onComplete=onComplete;this.now=now;this.setTimer=setTimer;this.clearTimer=clearTimer;this.index=0;this.mode='watch';this.paused=false;this.ended=false;this.timer=null;this.generation=0;this.remaining=0;}
 start(){this.show(0);}
 cancelTimer(){this.generation++;if(this.timer!==null)this.clearTimer(this.timer);this.timer=null;}
 show(index){if(this.ended)return;this.cancelTimer();this.index=Math.max(0,Math.min(this.shots.length-1,index));this.remaining=this.shots[this.index].duration;this.onShot(this.index,this.shots[this.index]);this.schedule();}
 schedule(){if(this.ended||this.paused||this.mode!=='watch')return;const token=++this.generation;this.started=this.now();this.timer=this.setTimer(()=>{if(token!==this.generation||this.ended)return;this.timer=null;this.next();},this.remaining);}
 pause(){if(this.paused||this.ended)return;this.paused=true;if(this.timer!==null)this.remaining=Math.max(0,this.remaining-(this.now()-this.started));this.cancelTimer();}
 play(){if(!this.paused||this.ended)return;this.paused=false;this.schedule();}
 setMode(mode){if(!['watch','read'].includes(mode)||this.ended)return;if(this.timer!==null)this.remaining=Math.max(0,this.remaining-(this.now()-this.started));this.cancelTimer();this.mode=mode;this.schedule();}
 next(){if(this.ended)return;if(this.index===this.shots.length-1)this.finish();else this.show(this.index+1);}
 back(){if(!this.ended)this.show(Math.max(0,this.index-1));}
 finish(){if(this.ended)return;this.ended=true;this.cancelTimer();this.onComplete();}
 dispose(){this.ended=true;this.cancelTimer();}
}
