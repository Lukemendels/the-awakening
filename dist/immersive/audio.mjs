/*
 * Original procedural audio; no samples or network requests.
 *
 * const sound = new ImmersiveAudio();
 * await sound.enable();                  // call ONLY from a sound-on user gesture
 * sound.setListener(x, z, heading);      // heading in radians, +z forward
 * sound.setEmitter('water'|'wood'|'array', x, z); // position independent sources
 * sound.setScene('shop'|'canal'|'workshop'|'archive'|'artisan'|'tower'|'barge'|'warehouse'|'passage'|'ep14'…'ep24'); // smooth acoustic change
 * sound.cue('inspect'|'success'|'step'|'warning'|'bell'|'paper'|'wood'|'glass'|'warning_low'|'warning_mid'|'warning_high', x, z);
 * sound.setNarrating(true|false);       // duck/restore ambience under separately played voice
 * sound.mute();                          // immediately stops and releases nodes
 * sound.dispose();                       // permanent teardown; await if desired
 *
 * Sound is optional; all essential information must also be visual/textual.
 */
// All settings are quiet procedural interpretations, not sourced recordings.
// Numeric episode aliases are accepted so transitions can map directly to story state.
export const SCENE_SOUND = Object.freeze({
  shop:     {bed:[73.4,73.8,110], levels:[.09,.045,.025], water:.075, waterCut:520, air:.008, airCut:950, shimmer:246},
  canal:    {bed:[65.4,65.8,98],  levels:[.060,.030,.015],water:.120, waterCut:760, air:.022, airCut:1500, shimmer:196},
  workshop: {bed:[82.4,82.7,123], levels:[.048,.022,.012],water:.032, waterCut:350, air:.010, airCut:700, shimmer:220},
  archive:  {bed:[55,55.3,82.4],  levels:[.032,.014,.007],water:.012, waterCut:280, air:.006, airCut:500, shimmer:165},
  artisan:  {bed:[98,98.3,147],   levels:[.055,.026,.014],water:.040, waterCut:460, air:.009, airCut:850, shimmer:294},
  tower:    {bed:[73.4,74.0,146.8],levels:[.040,.018,.012],water:.018,waterCut:300, air:.025, airCut:1900, shimmer:330},
  // Episode 8 is water and hull; 9–12 center an array in a sheltered warehouse;
  // 13 passes into older stone. Levels remain modest and do not impose urgency.
  barge:    {bed:[61.7,62,92.5],levels:[.052,.023,.012],water:.115,waterCut:620,air:.018,airCut:1100,shimmer:185,wood:.028,woodCut:210,array:.010,arrayHz:185},
  warehouse:{bed:[69.3,69.7,103.8],levels:[.054,.027,.015],water:.047,waterCut:400,air:.010,airCut:650,shimmer:208,wood:.018,woodCut:160,array:.022,arrayHz:208},
  passage:  {bed:[55,55.3,82.4],levels:[.044,.020,.011],water:.065,waterCut:320,air:.012,airCut:550,shimmer:165,wood:.004,woodCut:120,array:.030,arrayHz:165},
  // Original procedural layers: resonant water and array in ancient stone,
  // a restrained searching pulse, open high-temple air, and a warm civic ending.
  chamber:  {bed:[49,49.25,98],levels:[.038,.019,.010],water:.082,waterCut:410,air:.010,airCut:520,shimmer:196,wood:.003,woodCut:130,array:.036,arrayHz:196},
  search:   {bed:[51.9,52.35,103.8],levels:[.035,.022,.009],water:.058,waterCut:360,air:.014,airCut:720,shimmer:155.6,wood:.006,woodCut:145,array:.023,arrayHz:155.6},
  ascent:   {bed:[65.4,65.8,130.8],levels:[.035,.016,.009],water:.072,waterCut:530,air:.018,airCut:1200,shimmer:261.6,wood:.002,woodCut:140,array:.028,arrayHz:261.6},
  vigil:    {bed:[55,55.2,82.4],levels:[.033,.018,.008],water:.052,waterCut:300,air:.009,airCut:450,shimmer:164.8,wood:.003,woodCut:120,array:.020,arrayHz:164.8},
  summit:   {bed:[73.4,73.9,146.8],levels:[.033,.017,.009],water:.020,waterCut:300,air:.032,airCut:1800,shimmer:293.7,wood:.002,woodCut:180,array:.022,arrayHz:220},
  revelation:{bed:[61.7,62,123.5],levels:[.036,.016,.010],water:.052,waterCut:380,air:.017,airCut:950,shimmer:247,wood:.002,woodCut:160,array:.034,arrayHz:185},
  memory:   {bed:[55,55.35,110],levels:[.033,.019,.008],water:.082,waterCut:440,air:.014,airCut:700,shimmer:220,wood:.002,woodCut:140,array:.029,arrayHz:165},
  network:  {bed:[65.4,65.7,98],levels:[.038,.018,.009],water:.070,waterCut:510,air:.013,airCut:900,shimmer:196,wood:.006,woodCut:170,array:.020,arrayHz:196},
  records:  {bed:[58.3,58.65,116.5],levels:[.034,.017,.008],water:.026,waterCut:300,air:.009,airCut:550,shimmer:174.6,wood:.008,woodCut:145,array:.015,arrayHz:174.6},
  restoration:{bed:[73.4,73.7,110],levels:[.041,.019,.011],water:.105,waterCut:680,air:.023,airCut:1400,shimmer:293.7,wood:.006,woodCut:180,array:.028,arrayHz:220},
  initiation:{bed:[82.4,82.7,123.5],levels:[.038,.018,.010],water:.060,waterCut:570,air:.022,airCut:1250,shimmer:329.6,wood:.004,woodCut:175,array:.025,arrayHz:247}
});
const SCENE_ALIAS=Object.freeze({ep3:'canal',ep4:'workshop',ep5:'archive',ep6:'artisan',ep7:'tower',ep8:'barge',ep9:'warehouse',ep10:'warehouse',ep11:'warehouse',ep12:'warehouse',ep13:'passage',ep14:'chamber',ep15:'search',ep16:'ascent',ep17:'vigil',ep18:'summit',ep19:'revelation',ep20:'memory',ep21:'network',ep22:'records',ep23:'restoration',ep24:'initiation'});
export class ImmersiveAudio {
  constructor() {
    this.context = null;
    this.master = null;
    this.limiter = null;
    this.ambient = [];
    this.voices = new Set();
    this.enabled = false;
    this.narrating = false;
    this.disposed = false;
    this.listener = {x:0,z:0,heading:0};
    this.emitter = {x:2,z:3}; // legacy water source
    this.emitters={water:this.emitter,wood:{x:2,z:3},array:{x:2,z:3}};
    this.epoch = 0;
    this.scene='shop';
    this.sceneNodes=null;
    this.volume=1;
    this.eventTimer=null;
    this.hidden=false;
    this.lastCue=new Map();
    this.enabling=null;
    this.visibilityTask=Promise.resolve();
  }
  enable() {
    if (this.enabling) return this.enabling;
    const pending=this.enableOnce();
    this.enabling=pending;
    pending.finally(()=>{if(this.enabling===pending)this.enabling=null;});
    return pending;
  }
  async enableOnce() {
    if (this.disposed) return false;
    const ticket = ++this.epoch;
    try {
      const Audio = globalThis.AudioContext || globalThis.webkitAudioContext;
      if (!Audio) return false;
      const ctx = this.context || (this.context = new Audio());
      await ctx.resume();
      // An intervening mute/dispose must win over the pending resume.
      if (ticket !== this.epoch || this.disposed) return false;
      if (ctx.state!=='running') return false;
      if (this.enabled) return true;
      this.enabled = true;
      const master = this.master = ctx.createGain();
      master.gain.setValueAtTime(0,ctx.currentTime);
      master.gain.linearRampToValueAtTime((this.narrating?.14:.24)*this.volume,ctx.currentTime+.3);
      if (ctx.createDynamicsCompressor) {
        this.limiter=ctx.createDynamicsCompressor();
        this.limiter.threshold.value=-8;this.limiter.knee.value=3;this.limiter.ratio.value=12;
        this.limiter.attack.value=.003;this.limiter.release.value=.18;
        master.connect(this.limiter).connect(ctx.destination);
      } else master.connect(ctx.destination);
      this.startAmbience();
      if(this.hidden)this.setHidden(true);else this.scheduleEvent();
      return true;
    } catch (_) { if(ticket===this.epoch)this.mute(); return false; }
  }
  startAmbience() {
    const ctx=this.context,now=ctx.currentTime,config=SCENE_SOUND[this.scene],beds=[];
    // Soft, slowly beating foundations. Room profiles shift them rather than layering more drones.
    for(let i=0;i<3;i++){
      const osc=ctx.createOscillator(),gain=ctx.createGain();osc.type='sine';
      osc.frequency.value=config.bed[i];gain.gain.value=config.levels[i]*.30;
      osc.connect(gain).connect(this.master);osc.start(now);beds.push({osc,gain});this.ambient.push(osc,gain);
    }
    const length=ctx.sampleRate*2,buffer=ctx.createBuffer(1,length,ctx.sampleRate),data=buffer.getChannelData(0);let previous=0;
    for(let i=0;i<length;i++){previous=.85*previous+.15*(Math.random()*2-1);data[i]=previous;}
    const edge=Math.min(256,Math.floor(length/4));for(let i=0;i<edge;i++){const f=i/edge;data[i]*=f;data[length-1-i]*=f;}
    // An original, broad midrange air texture translates to small speakers.
    const textureBuffer=ctx.createBuffer(1,length,ctx.sampleRate),textureData=textureBuffer.getChannelData(0);
    for(let i=0;i<length;i++)textureData[i]=(Math.random()*2-1);
    for(let i=0;i<edge;i++){const f=i/edge;textureData[i]*=f;textureData[length-1-i]*=f;}
    const texture=ctx.createBufferSource(),textureFilter=ctx.createBiquadFilter(),textureGain=ctx.createGain();
    texture.buffer=textureBuffer;texture.loop=true;textureFilter.type='bandpass';textureFilter.frequency.value=Math.max(750,config.airCut);textureFilter.Q.value=.55;textureGain.gain.value=.35+config.air*5;
    texture.connect(textureFilter).connect(textureGain).connect(this.master);texture.start(now);
    const textureSwell=ctx.createOscillator(),textureDepth=ctx.createGain();textureSwell.frequency.value=.065;textureDepth.gain.value=.07;textureSwell.connect(textureDepth).connect(textureGain.gain);textureSwell.start(now);
    // Water and air are independent filtered layers, never a recognizable prerecorded sample.
    const noise=ctx.createBufferSource(),waterFilter=ctx.createBiquadFilter(),waterGain=ctx.createGain(),waterPan=ctx.createStereoPanner();
    noise.buffer=buffer;noise.loop=true;waterFilter.type='lowpass';waterFilter.frequency.value=config.waterCut;waterGain.gain.value=config.water*4;
    noise.connect(waterFilter).connect(waterGain).connect(waterPan).connect(this.master);
    const airFilter=ctx.createBiquadFilter(),airGain=ctx.createGain();airFilter.type='bandpass';airFilter.frequency.value=config.airCut;airFilter.Q.value=.45;airGain.gain.value=config.air*4;
    noise.connect(airFilter).connect(airGain).connect(this.master);
    const swell=ctx.createOscillator(),depth=ctx.createGain();swell.frequency.value=.09;depth.gain.value=.004;swell.connect(depth).connect(waterGain.gain);
    // A separate filtered, slowly breathing hull/timber layer can follow a source.
    const woodFilter=ctx.createBiquadFilter(),woodGain=ctx.createGain(),woodPan=ctx.createStereoPanner();woodFilter.type='bandpass';woodFilter.frequency.value=config.woodCut??180;woodFilter.Q.value=.7;woodGain.gain.value=(config.wood??0)*4;
    noise.connect(woodFilter).connect(woodGain).connect(woodPan).connect(this.master);
    // A very low crystalline overtone sits below the environmental layers.
    const shimmer=ctx.createOscillator(),shimmerGain=ctx.createGain();shimmer.type='sine';shimmer.frequency.value=config.shimmer;shimmerGain.gain.value=.003;shimmer.connect(shimmerGain).connect(this.master);
    // Positional array resonance: a separate source, not a hidden-answer cue.
    const arrayOsc=ctx.createOscillator(),arrayGain=ctx.createGain(),arrayPan=ctx.createStereoPanner();arrayOsc.type='sine';arrayOsc.frequency.value=config.arrayHz??220;arrayGain.gain.value=(config.array??0)*.4;arrayOsc.connect(arrayGain).connect(arrayPan).connect(this.master);
    noise.start(now);swell.start(now);shimmer.start(now);arrayOsc.start(now);this.waterPan=waterPan;this.waterGain=waterGain;
    this.sceneNodes={beds,waterFilter,airFilter,airGain,shimmer,woodFilter,woodGain,woodPan,arrayOsc,arrayGain,arrayPan,textureFilter,textureGain};
    this.ambient.push(texture,textureFilter,textureGain,textureSwell,textureDepth,noise,waterFilter,waterGain,waterPan,airFilter,airGain,swell,depth,shimmer,shimmerGain,woodFilter,woodGain,woodPan,arrayOsc,arrayGain,arrayPan);this.updateSpatial();
  }
  /** Changes acoustic character without restarting sources or interrupting ducking. */
  setScene(id) {
    const key=SCENE_ALIAS[id]||id;if(!Object.hasOwn(SCENE_SOUND,key))return false;
    this.stopCues();
    if(key!==this.scene)this.scheduleEvent();
    this.scene=key;const n=this.sceneNodes,ctx=this.context;if(!this.enabled||!n||!ctx)return true;
    const c=SCENE_SOUND[key],now=ctx.currentTime;
    const ease=(p,value)=>{p.cancelScheduledValues(now);p.setTargetAtTime(value,now,.45);};
    n.beds.forEach(({osc,gain},i)=>{ease(osc.frequency,c.bed[i]);ease(gain.gain,c.levels[i]*.30);});
    ease(n.textureFilter.frequency,Math.max(750,c.airCut));ease(n.textureGain.gain,.35+c.air*5);ease(n.waterFilter.frequency,c.waterCut);ease(n.airFilter.frequency,c.airCut);ease(n.airGain.gain,c.air*4);ease(n.shimmer.frequency,c.shimmer);ease(n.woodFilter.frequency,c.woodCut??180);ease(n.arrayOsc.frequency,c.arrayHz??220);
    this.updateSpatial();return true;
  }
  // Voice must be routed separately from this master bus, or it too will be ducked.
  // Reset false on ended, skipped, interrupted, or failed narration playback.
  setNarrating(active) {
    this.narrating=Boolean(active);
    if(!this.enabled||!this.master||!this.context)return;
    const now=this.context.currentTime, p=this.master.gain;
    p.cancelScheduledValues(now);
    p.setTargetAtTime((this.narrating?.14:.24)*this.volume,now,this.narrating?.10:.35);
  }
  setVolume(value) {
    if (!Number.isFinite(value)) return;
    this.volume=Math.max(0,Math.min(1,value));
    this.setNarrating(this.narrating);
  }
  setHidden(hidden) {
    this.hidden=Boolean(hidden);
    if (this.hidden) { clearTimeout(this.eventTimer); this.eventTimer=null; }
    // Serialize transitions and reconcile against the latest desired state.
    const reconcile=async()=>{
      const ctx=this.context;
      if (!ctx || ctx.state==='closed' || !this.enabled) return;
      try {
        if (this.hidden) await ctx.suspend();
        else await ctx.resume();
      } catch (_) { return; }
      if (ctx!==this.context || ctx.state==='closed' || !this.enabled) return;
      if (this.hidden && ctx.state!=='suspended') await ctx.suspend().catch(()=>{});
      if (!this.hidden && ctx.state!=='running') await ctx.resume().catch(()=>{});
      if (this.enabled && !this.hidden && ctx===this.context && ctx.state!=='closed') this.scheduleEvent();
    };
    this.visibilityTask=this.visibilityTask.then(reconcile,reconcile);
    return this.visibilityTask;
  }
  // Sparse, scene-grounded gestures; never scheduled while hidden or muted.
  scheduleEvent() {
    clearTimeout(this.eventTimer);
    if (!this.enabled || this.hidden) return;
    this.eventTimer=setTimeout(()=>{
      this.eventTimer=null;
      if (!this.enabled || this.hidden) return;
      const water=['canal','barge','passage','chamber','ascent','memory','network','restoration'];
      const crystal=['artisan','warehouse','summit','revelation','initiation'];
      const kind=water.includes(this.scene)?'water':crystal.includes(this.scene)?'glass':this.scene==='tower'?'bell':this.scene==='archive'||this.scene==='records'?'paper':'wood';
      const e=this.emitters[kind==='water'?'water':kind==='glass'?'array':'wood'];
      this.cue(kind,e.x,e.z);
      this.scheduleEvent();
    },18000+Math.random()*26000);
    this.eventTimer?.unref?.();
  }
  // A restrained motif on selected dramatic beats, never on every slide.
  cinematic(episode, phase, index) {
    this.stopCues();
    if (index!==0) return;
    if (episode===1) this.cue('bell');
    else if ([12,15,17,18].includes(episode) && phase==='intro') this.cue('warning_low');
    else if ([14,19,20,23,24].includes(episode) && phase==='outro') this.cue('reveal');
  }
  stopCues() {
    for (const voice of [...this.voices]) voice.stop();
  }
  setListener(x,z,heading) {
    if (![x,z,heading].every(Number.isFinite)) return;
    this.listener={x,z,heading}; this.updateSpatial();
  }
  setEmitter(kind,x,z) {
    if(!Object.hasOwn(this.emitters,kind)||![x,z].every(Number.isFinite)) return;
    this.emitters[kind]={x,z};if(kind==='water')this.emitter=this.emitters.water;this.updateSpatial();
  }
  spatial(x,z) {
    const dx=x-this.listener.x,dz=z-this.listener.z;
    const distance=Math.hypot(dx,dz);
    // right vector relative to player heading; keep distant sources quieter.
    const pan=distance<.001?0:Math.max(-1,Math.min(1,(-dx*Math.sin(this.listener.heading)+dz*Math.cos(this.listener.heading))/distance));
    return {pan, attenuation:1/(1+distance*.22)};
  }
  updateSpatial() {
    if(!this.enabled||!this.waterPan||!this.waterGain) return;
    const now=this.context.currentTime,c=SCENE_SOUND[this.scene],n=this.sceneNodes;
    const sources=[['water',this.waterPan,this.waterGain,c.water*4],['wood',n?.woodPan,n?.woodGain,(c.wood??0)*4],['array',n?.arrayPan,n?.arrayGain,(c.array??0)*.4]];
    for(const [kind,pan,gain,level] of sources){if(!pan||!gain)continue;const e=this.emitters[kind],s=this.spatial(e.x,e.z);pan.pan.setTargetAtTime(s.pan,now,.08);gain.gain.setTargetAtTime(level*s.attenuation,now,.12);}
  }
  cue(kind,x=this.listener.x,z=this.listener.z) {
    if (!this.enabled||this.hidden||!this.context||!this.master||kind==='step'||kind==='inspect') return;
    const ctx=this.context, now=ctx.currentTime, position=this.spatial(x,z);
    if (now-(this.lastCue.get(kind) ?? -Infinity)<.4) return;
    this.lastCue.set(kind,now);
    // Limit simultaneous voices; stop the oldest before making another.
    if (this.voices.size>=12) this.voices.values().next().value.stop();
    const osc=ctx.createOscillator(), gain=ctx.createGain(), pan=ctx.createStereoPanner();
    const settings={inspect:[440,.32,.10],success:[660,.65,.12],step:[92,.09,.035],warning:[180,.50,.09],bell:[294,1.7,.045],paper:[160,.12,.025],wood:[118,.16,.035],glass:[520,.38,.04],warning_low:[136,.65,.025],warning_mid:[157,.75,.035],warning_high:[178,.85,.045],water:[310,.7,.018],reveal:[220,2.2,.035],test:[440,.7,.50]};
    const [freq,duration,level]=settings[kind]||settings.inspect;
    osc.type=(kind.startsWith('warning')||kind==='wood')?'triangle':'sine';
    osc.frequency.setValueAtTime(freq,now);
    if(kind==='success')osc.frequency.exponentialRampToValueAtTime(freq*1.5,now+.18);
    if(kind==='step'||kind==='wood'||kind==='paper')osc.frequency.exponentialRampToValueAtTime(freq*.7,now+duration);
    if(kind==='bell')osc.frequency.exponentialRampToValueAtTime(freq*.995,now+duration);
    gain.gain.setValueAtTime(.0001,now);gain.gain.exponentialRampToValueAtTime(level*position.attenuation,now+.015);
    if(kind==='test')gain.gain.exponentialRampToValueAtTime(level*position.attenuation*.65,now+.35);
    gain.gain.exponentialRampToValueAtTime(.0001,now+duration);
    pan.pan.value=position.pan; osc.connect(gain).connect(pan).connect(this.master);
    // Inharmonic partials give the tower bell and handled crystal a soft body,
    // rather than the same pure oscillator used for all interactions.
    const oscillators=[osc],nodes=[osc,gain,pan];
    // Filtered noise gives physical gestures texture; generated in memory, no samples.
    if (['water','paper','wood'].includes(kind)) {
      const source=ctx.createBufferSource(), filter=ctx.createBiquadFilter(), texture=ctx.createGain();
      const length=Math.max(1,Math.floor(ctx.sampleRate*duration));
      const buffer=ctx.createBuffer(1,length,ctx.sampleRate), data=buffer.getChannelData(0);
      let smooth=0;for(let i=0;i<length;i++){smooth=.72*smooth+.28*(Math.random()*2-1);data[i]=smooth;}
      source.buffer=buffer;filter.type='bandpass';filter.frequency.value=kind==='water'?1100:kind==='paper'?1900:380;filter.Q.value=.7;
      texture.gain.setValueAtTime(.0001,now);texture.gain.exponentialRampToValueAtTime(level*.7*position.attenuation,now+.025);texture.gain.exponentialRampToValueAtTime(.0001,now+duration);
      source.connect(filter).connect(texture).connect(pan);oscillators.push(source);nodes.push(source,filter,texture);
    }
    if(kind==='bell'||kind==='glass'||kind==='reveal'||kind==='test')for(const [ratio,amount] of [[2.03,.22],[3.93,.08]]){
      const partial=ctx.createOscillator(),pg=ctx.createGain();partial.type='sine';partial.frequency.value=freq*ratio;
      pg.gain.setValueAtTime(.0001,now);pg.gain.exponentialRampToValueAtTime(level*amount*position.attenuation,now+.018);
      pg.gain.exponentialRampToValueAtTime(.0001,now+duration*.65);partial.connect(pg).connect(pan);oscillators.push(partial);nodes.push(partial,pg);
    }
    let cleaned=false;
    const cleanup=()=>{if(cleaned)return;cleaned=true;nodes.forEach(n=>{try{n.disconnect();}catch(_){}});this.voices.delete(voice);};
    const voice={stop:()=>{for(const o of oscillators)try{o.stop();}catch(_){}cleanup();},nodes};
    this.voices.add(voice);osc.onended=cleanup;
    for(const o of oscillators){o.start(now);o.stop(now+duration+.02);}
  }
  mute() {
    ++this.epoch; this.enabled=false; this.enabling=null; clearTimeout(this.eventTimer);this.eventTimer=null;
    for(const voice of this.voices) voice.stop();
    this.voices.clear();
    for(const node of this.ambient){try{node.stop?.();}catch(_){}try{node.disconnect();}catch(_){}}
    this.lastCue.clear();this.ambient=[];this.waterPan=null;this.waterGain=null;this.sceneNodes=null;
    if(this.master){try{this.master.disconnect();}catch(_){}this.master=null;}
    if(this.limiter){try{this.limiter.disconnect();}catch(_){}this.limiter=null;}
    // Keep the empty context alive for a subsequent user-gesture enable.
    // Suspending here can race an immediate re-enable; dispose closes it.
  }
  async dispose() {
    if(this.disposed)return;
    this.mute();this.disposed=true;
    if(this.context && this.context.state!=='closed')try{await this.context.close();}catch(_){}
    this.context=null;
  }
}
