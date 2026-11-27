import {chapters,artUrl} from './panels.mjs';
import {PanelSound} from './sound.mjs';

const $=id=>document.getElementById(id);
const sound=new PanelSound();
const bookmark='awakening-illustrated-season-v1';
let position=null,noticeTimer;
const address=(e,p)=>'#'+String(e+1).padStart(2,'0')+'.'+String(p+1).padStart(2,'0');
function parse(hash){
  const match=/^#(\d{1,2})\.(\d{1,2})$/.exec(hash);
  if(!match)return null;
  const e=Number(match[1])-1,p=Number(match[2])-1;
  return chapters[e]?.panels[p]?{e,p}:null;
}
function saved(){try{return parse(localStorage.getItem(bookmark));}catch{return null;}}
function notice(message){$('status').textContent=message;clearTimeout(noticeTimer);noticeTimer=setTimeout(()=>$('status').textContent='',2300);}
function screen(id){for(const name of ['cover','reader','ending'])$(name).hidden=name!==id;}
function soundUI(){
  const on=sound.wanted;
  $('audio').textContent=on?'Sound on':'Sound off';$('audio').setAttribute('aria-pressed',String(on));
}
async function enable(){
  const active=sound.enable();soundUI();
  const ok=await active;soundUI();
  if(!ok&&!sound.wanted)notice('Sound is off. You can turn it on from the top of the page.');
}
function stopSound(){sound.mute();soundUI();}
function cover(){
  position=null;sound.select(null);stopSound();screen('cover');document.title='The Awakening · An illustrated serial';
  history.replaceState(null,'','#cover');
  const mark=saved();$('resume').hidden=!mark;
  if(mark)$('resume').textContent='Resume · Episode '+(mark.e+1)+', panel '+(mark.p+1);
}
function finish(){
  position=null;sound.select(null);stopSound();screen('ending');history.replaceState(null,'','#end');$('reread').focus();
}
function adjacent(dir){
  if(!position)return null;
  let {e,p}=position;p+=dir;
  if(p<0){e--;if(e<0)return null;p=chapters[e].panels.length-1;}
  if(p>=chapters[e].panels.length){e++;p=0;}
  return chapters[e]?{e,p}:null;
}
function show({e,p}){
  const chapter=chapters[e],panel=chapter.panels[p];position={e,p};screen('reader');
  const hash=address(e,p);history.replaceState(null,'',hash);
  try{localStorage.setItem(bookmark,hash);}catch{}
  $('episode').textContent='Episode '+String(e+1).padStart(2,'0');
  $('chapter').textContent=chapter.title;$('caption').textContent=panel.caption;
  $('speech').hidden=!panel.line;$('speaker').textContent=panel.speaker;$('line').textContent=panel.line?'“'+panel.line+'”':'';
  $('plate').src=artUrl(panel.art);$('panel-number').textContent='Panel '+(p+1)+' of '+chapter.panels.length;
  $('words').scrollTop=0;$('words').focus({preventScroll:true});
  const next=adjacent(1),label=!next?'Finish season':next.e!==e?'Next chapter ›':'Next panel ›';
  $('next').textContent=label;$('picture').setAttribute('aria-label',label);
  $('back').disabled=!adjacent(-1);
  document.title=chapter.title+' · '+(e+1)+'.'+(p+1)+' · The Awakening';
  sound.select(panel.sound);soundUI();
  if(next)new Image().src=artUrl(chapters[next.e].panels[next.p].art);
}
function turn(dir){const target=adjacent(dir);if(target)show(target);else if(dir===1)finish();}
function read(withSound){show({e:0,p:0});if(withSound)enable();else stopSound();}
$('start').onclick=()=>read(true);$('silent').onclick=()=>read(false);
$('resume').onclick=()=>{const mark=saved();if(mark)show(mark);};
$('audio').onclick=()=>{if(sound.wanted)stopSound();else enable();soundUI();};
$('next').onclick=$('picture').onclick=()=>turn(1);$('back').onclick=()=>turn(-1);
$('reread').onclick=cover;$('last').onclick=()=>show({e:chapters.length-1,p:chapters.at(-1).panels.length-1});
$('copy').onclick=async()=>{
  try{await navigator.clipboard.writeText(location.href);notice('Panel link copied.');}
  catch{notice('The address bar contains the link to this panel.');}
};
chapters.forEach((chapter,e)=>{
  const li=document.createElement('li'),b=document.createElement('button');b.textContent=chapter.title;
  b.onclick=()=>{$('library').close();show({e,p:0});};li.append(b);$('list').append(li);
});
$('contents').onclick=()=>{
  [...$('list').querySelectorAll('button')].forEach((b,i)=>b.setAttribute('aria-current',String(i===position.e)));
  $('library').showModal();$('list').querySelector('[aria-current=true]').focus();
};
$('home').onclick=()=>{$('library').close();cover();};
$('close').onclick=()=>$('library').close();
document.addEventListener('keydown',e=>{
  if(!position||$('library').open||e.altKey||e.metaKey||e.ctrlKey)return;
  if(e.key==='ArrowRight'||e.key==='ArrowLeft'){e.preventDefault();if(!e.repeat)turn(e.key==='ArrowRight'?1:-1);}
  if(e.target===$('words')&&['Enter',' '].includes(e.key)){e.preventDefault();if(!e.repeat)turn(1);}
});
document.addEventListener('visibilitychange',()=>sound.hidden(document.hidden));
window.addEventListener('pagehide',stopSound);
function fromUrl(){const mark=parse(location.hash);if(mark)show(mark);else if(location.hash==='#end')finish();else cover();}
window.addEventListener('hashchange',fromUrl);fromUrl();
