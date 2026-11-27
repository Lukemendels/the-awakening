import {ImmersiveAudio} from '../immersive/audio.mjs';
import {offsets} from '../immersive/foley/offsets.mjs';

// Seconds from the cut, material, gain, stereo position, playback rate.
// The knock on the next house falls farther away than the one outside Father's.
const hit=(at,name,gain,pan=0,rate=1)=>({at,name,gain,pan,rate});
const steps=(gains,direction=1)=>gains.map((g,i)=>hit(.12+i*.67,'boot',g,direction*(.45-i*.12),i%2?.91:1.04));
const rhythm=(name,gain)=>[hit(.14,name,gain,-.12),hit(.43,name,gain*.86,-.12,1.05),hit(1.19,name,gain,-.12,.96)];
const bell=hit(.25,'temple-bell',.52,-.28);
const sheet=(room,...hits)=>({room,hits});
export const scores={
 assembly:sheet('tower',hit(0,'market',.25,-.18),bell,hit(1.8,'lap',.11,.45)),
 pencil:sheet('archive',hit(.06,'paper',.41,-.13),hit(.65,'pencil',.48),hit(1.7,'pencil',.33,.08,.84)),
 surge:sheet('tower',hit(0,'resonance',.40),hit(.88,'resonance',.61,.18,1.24)),
 break:sheet('tower',hit(.03,'shard',.68,-.28),hit(.14,'shard',.5,.22,1.24),hit(.39,'shard',.46,.51,.78),hit(.81,'shard',.23,-.36,1.42),...steps([.18,.31,.18,.09],-1)),
 hush:sheet('archive',hit(.28,'cloth',.13)),
 faint:sheet('shop',hit(.12,'glass',.25),hit(1.06,'temple-bell',.18,.45)),
 shop:sheet('shop',hit(.18,'creak',.32,.25),hit(1.65,'lap',.14,-.5)),
 mount:sheet('artisan',hit(.08,'brass-tap',.48,-.12),hit(.52,'bolt',.44),hit(1.12,'glass',.30,.2)),
 freight:sheet('barge',hit(.05,'rope',.55),hit(.72,'crate',.69,-.18),hit(1.32,'creak',.38,.35)),
 notice:sheet('shop',hit(.12,'brass-tap',.5,-.35),hit(.75,'paper',.48,.12)),
 badge:sheet('shop',hit(0,'market',.18,-.35),hit(.42,'cloth',.47,.15),hit(.77,'key',.69,.12)),
 quay:sheet('canal',hit(.12,'lap',.44,-.38),hit(1.43,'creak',.24,.28),hit(2.5,'lap',.24,-.13,.89)),
 answer:sheet('artisan',hit(.16,'resonance',.46,-.33),hit(1.16,'glass',.38,.4,.92)),
 reveal:sheet('workshop',hit(.04,'cloth',.37),hit(.72,'resonance',.50,.22)),
 approach:sheet('workshop',...steps([.21,.35,.53,.69]),hit(3.15,'knuckle',.67,.14),hit(3.47,'knuckle',.54,.14)),
 cover:sheet('shop',hit(.05,'paper',.45),hit(.45,'cloth',.60),hit(1.49,'boot',.42,.23)),
 depart:sheet('shop',...steps([.63,.47,.27,.14],-1),hit(3.25,'knuckle',.27,.65,.88),hit(3.55,'knuckle',.22,.65,.9)),
 archive:sheet('archive',hit(.12,'creak',.19,-.48),hit(.72,'paper',.47,.13)),
 key:sheet('archive',hit(.12,'paper',.4),hit(.72,'key',.54,-.08)),
 leaf:sheet('archive',hit(.16,'paper',.54),hit(1.03,'paper',.38,-.15,.83)),
 latch:sheet('passage',hit(.12,'bolt',.53),hit(.69,'creak',.37,-.22)),
 market:sheet('shop',hit(0,'market',.28,-.22),hit(.79,'paper',.46,.12)),
 seize:sheet('shop',hit(.1,'cloth',.5),hit(.53,'key',.35,.12),...steps([.42,.31,.18],-1)),
 kai:sheet('artisan',...rhythm('brass-tap',.62),hit(2.24,'paper',.27,.28)),
 records:sheet('archive',hit(.15,'paper',.54,-.23),hit(.88,'paper',.47,.26,.82)),
 'patrol-far':sheet('shop',...steps([.17,.26,.19,.1])),
 harbor:sheet('canal',hit(.11,'harbor-bell',.46,.46),hit(1.2,'lap',.31,-.42)),
 search:sheet('search',hit(.2,'resonance',.34,.4,.72),hit(1.52,'boot',.31,-.3)),
 pulse:sheet('warehouse',...rhythm('glass',.28)),
 memory:sheet('memory',hit(.2,'lap',.32),hit(1.03,'resonance',.4,-.13,.87)),
 doorstone:sheet('passage',hit(.09,'stone',.70,-.22),hit(1.01,'stone',.43,.29,.77),hit(2.52,'crate',.36,.18,.7)),
 ram:sheet('passage',hit(.12,'crate',.73,-.4,.78),hit(1.58,'crate',.52,-.52,.74),hit(2.28,'paper',.31,.18)),
 drip:sheet('chamber',hit(.33,'lap',.19,-.5,1.24),hit(1.91,'glass',.16,.51,.84)),
 rise:sheet('ascent',hit(.1,'lap',.32),hit(.85,'resonance',.36,-.18),hit(1.65,'glass',.25,.23,1.32)),
 climb:sheet('ascent',...steps([.37,.43,.32,.27])),
 brass:sheet('summit',hit(.13,'bolt',.36),hit(.67,'brass-tap',.42,.19)),
 arrival:sheet('summit',hit(.15,'bolt',.37,-.4),hit(.57,'creak',.29,.41),...steps([.17,.24,.32])),
 order:sheet('summit',hit(.18,'cloth',.4,-.24),hit(1.02,'glass',.28,.31,.83)),
 far:sheet('canal',hit(.12,'lap',.26,-.35),hit(2.08,'glass',.33,.64,1.25)),
 rings:sheet('restoration',hit(.1,'resonance',.46,-.57),hit(.71,'resonance',.4,0,1.25),hit(1.37,'resonance',.35,.56,1.5)),
 last:sheet('shop',hit(.22,'cloth',.36),hit(.76,'glass',.46,-.07),hit(2.10,'temple-bell',.22,.46))
};

export class PanelSound{
  constructor(){
    this.audio=new ImmersiveAudio();
    this.audio.setVolume(.88);
    this.audio.setRoomLevel(.08);
    this.voices=new Set();
    this.bus=null;
    this.generation=0;
    this.score=null;
    this.wanted=false;
    this.bank=null;
    this.request=0;
  }
  cut(){
    this.generation++;
    if(this.bus){
      const now=this.audio.context.currentTime;
      this.bus.gain.setValueAtTime(1,now);
      this.bus.gain.linearRampToValueAtTime(0,now+.018);
      for(const source of this.voices)source.stop(now+.02);
      this.bus=null;
    }
    this.voices=new Set();
  }
  async enable(){
    const request=++this.request;
    this.wanted=true;
    const ok=await this.audio.enable();
    if(request!==this.request)return false;
    if(!ok){this.wanted=false;return false;}
    this.play();
    return true;
  }
  mute(){this.request++;this.wanted=false;this.cut();this.audio.mute();}
  select(name){
    this.cut();this.score=scores[name];
    if(!this.score)return;
    this.audio.setScene(this.score.room);
    this.play();
  }
  async play(){
    const mixer=this.audio;
    if(!this.wanted||!mixer.enabled||mixer.hidden||!this.score)return;
    this.cut();
    const generation=this.generation,ctx=mixer.context;
    try{
      this.bank??=fetch(new URL('../immersive/foley/materials.wav',import.meta.url))
        .then(r=>{if(!r.ok)throw Error('Foley library unavailable');return r.arrayBuffer();})
        .then(data=>ctx.decodeAudioData(data)).catch(error=>{this.bank=null;throw error;});
      const buffer=await this.bank;
      if(generation!==this.generation||!mixer.enabled||mixer.hidden)return;
      const start=ctx.currentTime+.02;
      const bus=ctx.createGain(),voices=this.voices;
      this.bus=bus;bus.connect(mixer.master);
      for(const {at,name,gain,pan,rate} of this.score.hits){
        const [offset,length]=offsets[name];
        const source=ctx.createBufferSource(),level=ctx.createGain(),stereo=ctx.createStereoPanner();
        source.buffer=buffer;source.playbackRate.value=rate;level.gain.value=gain;
        stereo.pan.value=pan;source.connect(level).connect(stereo).connect(bus);
        source.onended=()=>{
          voices.delete(source);source.disconnect();level.disconnect();stereo.disconnect();
          if(!voices.size){bus.disconnect();if(this.bus===bus)this.bus=null;}
        };
        voices.add(source);source.start(start+at,offset,length);
      }
    }catch(error){console.warn('Could not play the panel sound',error);}
  }
  hidden(value){return this.audio.setHidden(value);}
}
