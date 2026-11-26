/** A single continuous recording drives shots by currentTime. Cue times are supplied by the manifest. */
export class OpeningTrack {
 constructor({media,cues,onShot,onFinish,onFailure,onState=()=>{},setTimer=(fn,ms)=>setTimeout(fn,ms),clearTimer=id=>clearTimeout(id)}){this.media=media;this.cues=cues;this.onShot=onShot;this.onFinish=onFinish;this.onFailure=onFailure;this.onState=onState;this.setTimer=setTimer;this.clearTimer=clearTimer;this.index=0;this.mode='watch';this.status='paused';this.paused=true;this.ended=false;this.epoch=0;this.timer=null;this.timerEpoch=0;this.lastTime=-1;this.handlers={timeupdate:()=>this.update(),playing:()=>{if(!this.paused){this.state('playing');this.arm();}},waiting:()=>{if(!this.paused){this.state('waiting');if(this.timer===null)this.arm();}},stalled:()=>{if(!this.paused){this.state('waiting');if(this.timer===null)this.arm();}},ended:()=>{if(!this.paused)this.finish();},error:()=>this.fail()};for(const [name,fn] of Object.entries(this.handlers))media.addEventListener(name,fn);}
 state(status){this.status=status;this.onState(status);}
 clear(){this.timerEpoch++;if(this.timer!==null)this.clearTimer(this.timer);this.timer=null;}
 arm(){this.clear();if(!this.paused&&!this.ended){const ticket=this.timerEpoch;this.timer=this.setTimer(()=>{if(ticket===this.timerEpoch&&!this.paused)this.fail();},10000);}}
 update(){if(this.ended||this.paused)return;const t=this.media.currentTime;if(!Number.isFinite(t))return;if(t>this.lastTime+.02){this.lastTime=t;this.state('playing');this.arm();}let i=0;while(i+1<this.cues.length&&t>=this.cues[i+1])i++;if(i!==this.index){this.index=i;if(this.mode==='read')this.pause();this.onShot(i);}}
 play(){if(this.ended)return;this.paused=false;const ticket=++this.epoch;this.state('waiting');this.arm();try{const p=this.media.play();p?.catch?.(()=>{if(ticket===this.epoch&&!this.paused)this.fail();});}catch{if(ticket===this.epoch)this.fail();}}
 pause(){if(this.ended)return;this.paused=true;this.epoch++;this.clear();this.media.pause();this.state('paused');}
 seek(index){if(this.ended)return;this.index=Math.max(0,Math.min(this.cues.length-1,index));if(!this.paused)this.state('waiting');try{this.media.currentTime=this.cues[this.index];this.lastTime=this.media.currentTime;}catch{this.fail();return;}this.onShot(this.index);if(!this.paused)this.arm();}
 next(){if(this.index===this.cues.length-1)this.finish();else this.seek(this.index+1);}
 back(){this.seek(this.index-1);}
 setMode(mode){if(!['watch','read'].includes(mode)||this.ended)return;this.mode=mode;if(mode==='read')this.pause();}
 finish(){if(this.ended)return;this.dispose();this.onFinish();}
 fail(){if(this.ended)return;this.dispose();this.onFailure();}
 dispose(){if(this.ended)return;this.ended=true;this.epoch++;this.clear();this.media.pause();for(const [name,fn] of Object.entries(this.handlers))this.media.removeEventListener(name,fn);}
}
