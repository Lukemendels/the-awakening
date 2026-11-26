// Each cut waits for the player. Only the light, masonry and water move on their own.
import {fork} from './apparatus.mjs';
const art=name=>new URL('../../assets/generated/season/'+name+'.webp',import.meta.url).href;
export function sequence(ep,ch,meaning){
  const finding={title:ch.finding,line:meaning,lead:ch.lead,next:ch.next,art:ch.plate};
  switch(ep){
    case 12:return [
      {title:'One cut in the stone',line:'The nick in the projected fork sits inside the carved nick. Both lines run on beneath the mortar.',next:'Follow the light along the seam',art:ch.plate,effect:'match',cue:'crystal-pulse'},
      {title:'The old wall opens',line:'A slab drags across the floor. Cool air touches Kaelan’s face. Behind the stone, water runs down a flight of steps.',next:'Walk to the open passage',art:art('open-passage'),effect:'seam',cue:'stone-scrape'}
    ];
    case 17:return [{...finding,speaker:'Mira',line:'“That’s your father.” A guard leads him out of the shop. Kaelan starts forward. Mira stays beside him until the image in the water clears.',next:'Watch the alley behind the shop'},
      {title:'A door the patrol missed',line:'A hooded figure opens a side door. Two of the dock workers slip through before the guards turn into the alley. Kaelan searches the doorway for his father.',lead:ch.lead,next:ch.next,art:art('evidence-21')}];
    case 19:return [{...finding,speaker:'Order leader',line:'“We are the Order of Seraphim.” Kaelan knows the fork stitched into the stranger’s sleeve. He has turned that shape over in his hand.',lead:'Thalor takes one step back. “The Order is nothing but legend.”'}];
    case 20:return [{...finding,speaker:'Mira',line:'“We called them flawed.” Mira holds her mounting over the basin. Its lines fit the stars in the water. Each rejected stone was built to listen for a particular alignment.'}];
    case 21:return [
      {title:'His father reaches the landing',line:'A guide steadies the skiff. Kaelan’s father steps ashore and lifts his hand to the others still aboard. For the first time since the arrest, Kaelan lets himself breathe.',speaker:'Kaelan',lead:'“He’s safe, Mira. That’s his hand.”',next:'See who rowed him there',art:art('father-safe'),cue:'water'},
      {...finding,line:'The archive keeper takes the bow rope from the dock worker. The people who kept a key, held a boat, or opened a door were working together. They got his father out.'}
    ];
    case 23:return [
      {title:'All three rings answer',line:'Kaelan sends one pulse. It crosses the inner ring on its way to the receiver. The lamps along both banks stay lit.',next:'Look out across the water',art:ch.plate,effect:'circuit',cue:'ring-source'},
      {title:'A light beyond Atlantis',line:'The pulse leaves the harbor. For a moment the far shore is dark. Then a light rises across the water and holds.',lead:ch.lead,next:ch.next,art:art('far-answer'),effect:'beacon',cue:'distant-answer'}
    ];
    case 24:return [
      {...finding,line:'Water channels for Kaelan, crystal geometry for Mira, stars for Kai. As the three fasten their robes, another glimmer comes from the harbor.',lead:'Kaelan reaches into his pocket.',next:'Take out the shop crystal'},
      {speaker:'Kaelan',title:'The first stone answers',line:'He turns the rejected crystal between finger and thumb. The same tiny fork catches the sunrise. Across the harbor a light answers it.',lead:'“Dad wanted to know what it was worth. Wait until I show him.”',next:'Finish Season One',art:art('first-stone'),effect:'return',cue:'crystal-pulse'}
    ];
    default:return [finding];
  }
}
function mark(parent,name,attrs){
  const el=document.createElementNS('http://www.w3.org/2000/svg',name);
  for(const [k,v] of Object.entries(attrs))el.setAttribute(k,v);
  parent.append(el);return el;
}
export function stage(host,beat){
  host.replaceChildren();host.dataset.effect=beat.effect||'';
  host.style.backgroundImage='linear-gradient(#07181c8c,#07181cab),url("'+beat.art+'")';
  const frame=document.createElement('div');frame.className='film-frame';
  const picture=document.createElement('img');picture.alt='';picture.src=beat.art;
  frame.append(picture);host.append(frame);
  if(beat.effect==='seam'){
    for(const side of ['left','right']){
      const slab=document.createElement('div');slab.className='seam-slab '+side;
      slab.style.backgroundImage='url("'+art('evidence-12')+'")';frame.append(slab);
    }
  }
  if(beat.effect==='match'||beat.effect==='circuit'){
    const svg=mark(frame,'svg',{viewBox:'0 0 400 180',class:'proof',role:'img','aria-label':beat.effect==='match'?'The notched projection fits the carved fork.':'One pulse lights the central, inner and outer receivers in order.'});
    if(beat.effect==='match'){
      mark(svg,'path',{d:fork,class:'carved'});mark(svg,'path',{d:fork,class:'projected',pathLength:1});
      mark(svg,'circle',{cx:260,cy:111,r:13,class:'notch'});
    }else{
      const d='M72 112 Q120 67 205 62 Q270 52 328 111';
      mark(svg,'path',{d,class:'carved'});mark(svg,'path',{d,class:'current',pathLength:1});
      for(const [i,[cx,cy]] of [[72,112],[205,62],[328,111]].entries())mark(svg,'circle',{cx,cy,r:8,class:'receiver r'+i});
    }
  }
  if(beat.effect==='beacon'){
    const dusk=document.createElement('div');dusk.className='quiet-shore';frame.append(dusk);
    const water=document.createElement('i');water.className='answered-water';frame.append(water);
  }
  if(beat.effect==='beacon'||beat.effect==='return'){
    const glint=document.createElement('i');glint.className='reply-light';frame.append(glint);
  }
}
