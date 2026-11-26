import {episodes} from './episodes.mjs';
import {scenes} from './scenes.mjs';
import {hubs,missionHubs,exits,routeToObjective,toolClues} from './adventure.mjs';
import {chapters,fresh,restore,act,metrics,kind,specialist,requiredItem,cityStatus,lockedTiles} from './world.mjs';
const KEY='awakening-v4';let storage=true,state=fresh(),soundContext,visiting=null,hintLevel=0;
try{state=restore(localStorage.getItem(KEY));}catch{storage=false;}
const $=id=>document.getElementById(id);
const make=(tag,text,cls)=>{const n=document.createElement(tag);if(text)n.textContent=text;if(cls)n.className=cls;return n;};
const button=(label,fn,cls)=>{const b=make('button',label,cls);b.type='button';b.onclick=fn;return b;};
function save(){try{localStorage.setItem(KEY,JSON.stringify(state));}catch{storage=false;}}
function tone(n=0){if(!state.sound)return;try{soundContext??=new AudioContext();soundContext.resume();const now=soundContext.currentTime;[1,2.01].forEach((partial,i)=>{const o=soundContext.createOscillator(),g=soundContext.createGain();o.type='sine';o.frequency.value=[220,330,440][n%3]*partial;g.gain.setValueAtTime(.0001,now);g.gain.exponentialRampToValueAtTime(i?.005:.018,now+.025);g.gain.exponentialRampToValueAtTime(.0001,now+(i?.32:.65));o.connect(g).connect(soundContext.destination);o.start(now);o.stop(now+.7);});}catch{}}
function focusPath(){
 let node=document.activeElement,root=null,path=[];
 if(!node||node.tagName!=='BUTTON')return null;
 while(node&&node!==$('story')&&node!==$('interaction')){
  const parent=node.parentElement;if(!parent)return null;
  path.unshift(Array.from(parent.children).indexOf(node));node=parent;
 }
 if(node=== $('story'))root='story';else if(node=== $('interaction'))root='interaction';else return null;
 return {root,path};
}
function restoreFocus(saved){
 if(!saved)return;let node=$(saved.root);
 for(const index of saved.path){node=node?.children[index];if(!node)return;}
 if(node?.tagName==='BUTTON')node.focus();
}
function send(a,message=''){const focus=focusPath(),before=state;state=act(state,a);if(state.chapter!==before.chapter||state.puzzle.stage!==before.puzzle.stage)hintLevel=0;save();render();if(state.solved!==before.solved||state.puzzle.stage!==before.puzzle.stage)$('scene-title').focus();else restoreFocus(focus);if(message)$('notice').textContent=message;}
const angles=['N','NE','E','SE','S','SW','W','NW'];
function sceneArt(){
 const view=make('div',null,'landscape');
 const art=['1_Three Ring Vista','10_ Workshop Interior','6_Night Canal','10_ Workshop Interior','10_ Workshop Interior','10_ Workshop Interior','13_ Crystal Array','6_Night Canal','10_ Workshop Interior','1_Three Ring Vista','13_ Crystal Array','10_ Workshop Interior','22_Temple Power Chamber','22_Temple Power Chamber','22_Temple Power Chamber','22_Temple Power Chamber','13_ Crystal Array','22_Temple Power Chamber','18_Order of Seraphim','22_Temple Power Chamber','18_Order of Seraphim','22_Temple Power Chamber','1_Three Ring Vista','1_Three Ring Vista'];
 const image=make('img');image.src='assets/'+art[state.chapter]+'.webp';image.alt='';image.decoding='async';view.append(image);
 return view;
}
function drawBoard(area){
 const c=chapters[state.chapter],k=kind(state),m=metrics(state);
 if(state.seen.length<3){area.append(make('p','Inspect the three marked objects in the scene to bring their tools and evidence to the workbench.'));return;}
 if(state.actor!==specialist(state)){area.append(make('p',specialist(state)+' understands this mechanism. Select '+specialist(state)+' above to use their tools.'));return;}
 const tool=requiredItem(state),tools=make('div',null,'choices');
 area.append(make('p',toolClues[state.chapter]));
 c.objects.forEach(name=>tools.append(button((state.applied===name?'Applied: ':'Apply: ')+name,()=>{send({type:'apply',name},name===tool?name+' applied to the mechanism.':name+' does not fit this mechanism.');})));
 area.append(tools);
 if(state.applied!==tool){area.append(button('Hint',()=>{$('notice').textContent=++hintLevel<2?'Think about what the mechanism needs to function. Re-read the object descriptions in the journal.':'Try applying '+tool+'.';}));return;}
 const instructions={ledger:'Compare the shop’s price record with the archive’s condemned-volume record. Set the changes each record reports, then examine the combined evidence.',
 flow:'Rotate channel tiles by tapping. Join the inlet at the left of tile 1 to the outlet at the right of tile 9. Water only crosses matching connections. Lit tiles show the connected flow.',
 tune:'Adjust each frequency band to the measured trace. The target bars remain visible; a perfect match gives zero error. Sound is optional.',
 light:'Turn both optical rings to align their pointers with the engraved directions. This recreates the angle at which the internal geometry becomes visible.',
 balance:'Allocate the nine available crystals to meet all three ring loads. Every ring must receive its marked requirement.'};
 area.append(make('p',instructions[k]));
 if(c.type==='escape')area.append(make('p','Escape stage '+(state.puzzle.stage+1)+' / 3 · '+['Water route','Mounting alignment','Resonance lock'][state.puzzle.stage],'eyebrow'));
 if(k==='ledger'){
  const evidence=make('div',null,'choices');
  ['Price ledger','Trade ledger'].forEach(name=>evidence.append(button((state.ledgerEvidence.includes(name)?'✓ Attached: ':'Attach evidence: ')+name,()=>send({type:'evidence',name},name+' placed on the comparison table.'))));
  area.append(evidence);
  const values=[[1,2,3,4],[1,2,5,10]];
  ['Approved crystal price','Condemned crystal volume'].forEach((name,i)=>{
   const row=make('section',null,'dial');row.append(make('h4',name),make('p','Change: '+values[i][state.puzzle.bands[i]-1]+' times'));
   row.append(button('−',()=>send({type:'turn',i,delta:-1})),button('+',()=>send({type:'turn',i,delta:1})));area.append(row);
  });
  area.append(make('p','Attach the shop price ledger and archive trade ledger. The shop records approved prices tripling; the archive records a tenfold increase in condemned volume.'));
 }else if(k==='flow'){
  const board=make('div',null,'pipe-grid');board.setAttribute('aria-label','Three by three channel network');
  state.puzzle.pipes.forEach((mask,i)=>{
   const dirs=[1,2,4,8].filter(b=>mask&b).map(b=>({1:'north',2:'east',4:'south',8:'west'}[b]));
   const b=button('',()=>send({type:'turn',i},'Tile '+(i+1)+' rotated.'),'pipe '+(m.wet.includes(i)?'wet':''));
   const fixed=lockedTiles(state.chapter).includes(i);b.disabled=fixed;
   b.setAttribute('aria-label','Tile '+(i+1)+': '+dirs.join(' and ')+(m.wet.includes(i)?', water connected':'')+(fixed?', fixed in place':''));
   let path='';[[1,50,0],[2,100,50],[4,50,100],[8,0,50]].forEach(([bit,x,y])=>{if(mask&bit)path+='M50 50L'+x+' '+y;});
   b.innerHTML='<svg viewBox="0 0 100 100" aria-hidden="true"><path d="'+path+'" fill="none" stroke="currentColor" stroke-width="14"/><circle cx="50" cy="50" r="12" fill="currentColor"/><text x="10" y="18" fill="#fff" font-size="13">'+(i+1)+(fixed?' FIXED':'')+'</text></svg>';
   board.append(b);
  });area.append(make('p','INLET → tile 1 · tile 9 → OUTLET','reference'),board,make('p',m.open?'A continuous route reaches the outlet.':m.wet.length+' / 9 tiles receive water. No complete outlet path.'));
 }else{
  const values=k==='tune'?state.puzzle.bands:k==='light'?state.puzzle.angles:state.puzzle.loads;
  const targets=k==='tune'?c.target:k==='light'?m.target:c.loads;
  values.forEach((v,i)=>{
   const row=make('section',null,'dial');
   row.append(make('h4',k==='light'?'Optical ring '+(i+1):k==='balance'?['Outer ring','Middle ring','Inner ring'][i]:'Harmonic band '+(i+1)));
   if(k==='light'){
    const compass=make('div',null,'compass');compass.innerHTML='<svg viewBox="0 0 100 100" aria-hidden="true"><circle cx="50" cy="50" r="43" fill="none" stroke="#bda16b"/><path d="M50 50V10" stroke="#62e5e9" stroke-width="4" transform="rotate('+v*45+' 50 50)"/><path d="M50 8V18" stroke="#ffe0a0" stroke-width="8" transform="rotate('+targets[i]*45+' 50 50)"/></svg>';row.append(compass);
   }else{const track=make('div',null,'track');const fill=make('div',null,'fill');fill.style.width=(v/9*100)+'%';const marker=make('span',null,'marker');marker.style.left=(targets[i]/9*100)+'%';track.append(fill,marker);row.append(track);}
   row.append(make('p','Current '+(k==='light'?angles[v]:v)+' · required '+(k==='light'?angles[targets[i]]:targets[i])));
   row.append(button('−',()=>{send({type:'turn',i,delta:-1});tone(i);}),button('+',()=>{send({type:'turn',i,delta:1});tone(i);}));
   area.append(row);
  });
  area.append(make('p',k==='tune'?'Trace error: '+m.error:k==='balance'?'Unallocated supply: '+m.supply:m.open?'Both pointers align.':'Align both pointers with their engraved marks.'));
 }
 const controls=make('div',null,'controls');
 controls.append(button('Activate',()=>{
  const before=state.puzzle.stage,ok=metrics(state).open;
  send({type:'test'},ok?(state.solved?'Mechanism restored.':'The mechanism responds.'):'The mechanism is not aligned. Check the visible connections or measurements.');
  if(state.puzzle.stage!==before)$('notice').textContent='Stage secured. Continue with the next mechanism.';
  tone(2);
 }),button('Undo',()=>send({type:'undo'})),button('Reset current stage',()=>send({type:'reset'},'Current stage reset; earlier stages remain secured.')),
 button('Hint',()=>{hintLevel++;$('notice').textContent=hintLevel===1?'Watch what changes when you adjust one control. The visible marks and measurements remain your reference.':k==='ledger'?'The shop records three times the price; the archive records ten times the condemned volume.':k==='flow'?'Start at the left inlet. Each neighboring tile must have an opening facing back toward the water; continue until tile 9 reaches the outlet.':k==='tune'?'Match each current value to the target on its row.':k==='light'?'The gold notch is the target; the blue pointer is your current angle.':'Match the marked requirement of every ring; the total available supply is nine.';}));
 area.append(controls);
}
function render(){
 const c=chapters[state.chapter],e=episodes[state.chapter];
 $('chapter').textContent='SEASON 1 · '+(state.chapter+1)+' / 24';
 $('scene-title').textContent=c.place;
 $('sound').textContent=state.sound?'Sound: on':'Sound: off';
 $('notice').textContent='';
 $('storage-status').textContent=storage?'':'Storage unavailable. Keep this page open to retain progress.';
 const story=$('story'),area=$('interaction'),records=$('records');story.replaceChildren();area.replaceChildren();records.replaceChildren();
 document.querySelector('.art').hidden=true;
 const map=make('details');map.append(make('summary','City routes · '+hubs[state.location].name));
 const destinations=exits(state);
 map.append(make('p','Current objective: '+hubs[missionHubs[state.chapter]].name));
 destinations.forEach(id=>map.append(button('Travel to '+hubs[id].name,()=>{visiting=null;send({type:'travel',to:id});$('scene-title').focus();})));
 if(!destinations.length)map.append(make('p','The next route opens with the current story objective.'));
 story.append(map);
 if(state.location!==missionHubs[state.chapter]){
  $('scene-title').textContent=hubs[state.location].name;
  const prior=missionHubs.map((id,i)=>id===state.location&&i<=state.chapter?i:-1).filter(i=>i>=0).at(-1);
  story.append(make('p',cityStatus(state,prior),'objective'));
  const path=routeToObjective(state);
  story.append(make('p','Route back to the objective: '+path.map(id=>hubs[id].name).join(' → ')));
  const view=sceneArt(),spots=make('div',null,'hotspots');
  chapters[prior].objects.forEach((name,i)=>{const b=button(name,()=>{$('notice').textContent=scenes[prior].clues[i];});b.style.left=[5,53,24][i]+'%';b.style.top=[45,35,73][i]+'%';spots.append(b);});view.append(spots);area.append(view);
  const record=make('details');record.append(make('summary','Historical record'),make('p',episodes[prior].paragraphs.join('\n\n')));story.append(record);return;
 }
 if(visiting!==null){
  const v=visiting,old=chapters[v];$('scene-title').textContent='Past chapter: '+old.place;story.append(make('p','Historical evidence review. Use City routes to travel in the current world. Your current objective and mechanism remain saved.'));
  const view=sceneArt(),hotspots=make('div',null,'hotspots');
  old.objects.forEach((name,i)=>{const b=button(name,()=>{$('notice').textContent=scenes[v].clues[i];});b.style.left=[5,53,24][i]+'%';b.style.top=[45,35,73][i]+'%';hotspots.append(b);});
  view.append(hotspots);area.append(view,button('Return to current objective',()=>{visiting=null;render();$('scene-title').focus();}));
  const record=make('details');record.append(make('summary','Past chapter record'),make('p',episodes[v].paragraphs.join('\n\n')));story.append(record);return;
 }
 if(state.finished){story.append(make('h3','Seeds of legacy'),make('p',e.paragraphs.join('\n\n')),make('p','Season 1 complete. The library remains a mission ahead: knowledge open to all.'));const journal=make('details');journal.append(make('summary','Evidence journal · '+state.inventory.length+' discoveries'));const list=make('ul');state.journal.forEach(x=>{const n=chapters[x.chapter].objects.indexOf(x.text);list.append(make('li',x.text+(n>=0?' — '+scenes[x.chapter].clues[n]:'')));});journal.append(list);story.append(journal);const locations=make('details');locations.append(make('summary','Visit known locations'));for(let i=0;i<24;i++)locations.append(button('Visit '+chapters[i].place,()=>{visiting=i;render();$('scene-title').focus();}));story.append(locations);return;}
 story.append(make('p',c.goal,'objective'));
 const team=make('div',null,'team');
 ['Kaelan',...(state.chapter>=5?['Mira']:[]),...(state.chapter>=6?['Kai']:[])].forEach(name=>{
  const b=button(name,()=>send({type:'actor',name}),state.actor===name?'selected':'');b.setAttribute('aria-pressed',String(state.actor===name));team.append(b);
 });story.append(team);
 const nav=make('div',null,'controls');
 nav.append(button('Explore',()=>send({type:'room',room:'scene'})),button('Mechanism',()=>send({type:'room',room:'bench'})));story.append(nav);
 if(state.solved){
  story.append(make('h3','Discovery secured'),make('p',e.paragraphs[e.paragraphs.length-1]));
  area.append(button(c.exits,()=>{send({type:'advance'});$('scene-title').focus();}));
 }else if(state.room==='scene'){
  const view=sceneArt();const hotspots=make('div',null,'hotspots');
  c.objects.forEach((name,i)=>{const b=button((state.seen.includes(i)?'✓ ':'')+name,()=>{send({type:'inspect',i},scenes[state.chapter].clues[i]);tone(i);});b.style.left=[5,53,24][i]+'%';b.style.top=[45,35,73][i]+'%';hotspots.append(b);});view.append(hotspots);area.append(view);
  area.append(make('p',state.seen.length+'/3 objects investigated. '+(state.seen.length===3?'Take the gathered tools to the mechanism.':'Tap the marked objects to examine and collect them.')));
  if(state.seen.length===3)area.append(button('Use the mechanism',()=>send({type:'room',room:'bench'})));
 }else drawBoard(area);
 const journal=make('details');journal.append(make('summary','Evidence journal · '+state.inventory.length+' discoveries'));
 const list=make('ul');state.journal.forEach(x=>{const n=chapters[x.chapter].objects.indexOf(x.text),li=make('li',x.text+(n>=0?' — '+scenes[x.chapter].clues[n]:''));list.append(li);});journal.append(list);
 const archive=make('details');archive.append(make('summary','Travel journal: past locations'));
 for(let i=0;i<state.chapter;i++){const d=make('details');d.append(make('summary',chapters[i].place),make('p','Completed: '+chapters[i].goal),button('Review '+chapters[i].place,()=>{visiting=i;render();$('scene-title').focus();}),make('p',episodes[i].paragraphs.join('\n\n')));archive.append(d);}records.append(archive);
 const source=make('details');source.append(make('summary',state.solved?'Chapter record':'Story so far'));
 source.append(make('p',state.solved?e.paragraphs.join('\n\n'):state.chapter===0?'The ceremonial crystal has surged. Kaelan studies the scattered fragments, noticing geometry that echoes the temple floor.':e.paragraphs[0]));records.append(journal,source);
 if(c.type==='escape'){const pressure=button(state.pressure?'Tension: on':'Tension: relaxed',()=>send({type:'setting',key:'pressure'}));area.append(pressure);if(state.pressure)area.append(make('p',state.moves<18?'Footsteps approach. Inspection and hints pause the tension.':'The pounding grows louder. Take your time: this cinematic pressure never removes progress.','pressure'));}
}
document.getElementById('scene-title').tabIndex=-1;
$('sound').onclick=()=>{send({type:'setting',key:'sound'});tone(1);};
$('restart').onclick=()=>{if(confirm('Start a new journey? This replaces the device save.')){state=fresh();save();render();}};
render();
