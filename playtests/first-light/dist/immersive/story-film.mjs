import {earlyScenes} from './early-scenes.mjs';

// A native modal pauses the existing room input, including pointer and keyboard.
export function showStoryFilm(id,start,onShot,onFinish){
  const shots=earlyScenes[id],film=document.createElement('dialog');
  film.className='story-film';
  film.setAttribute('aria-labelledby','story-title');
  film.innerHTML='<div class="story-still"><img alt=""></div><div class="story-copy"><div class="story-caption"><p class="kicker"></p><h2 id="story-title" tabindex="-1"></h2><p class="story-line"></p></div><nav aria-label="Scene controls"><button type="button" class="story-back" aria-label="Previous shot">‹</button><button type="button" class="primary story-next"></button></nav></div>';
  const get=s=>film.querySelector(s);
  document.body.append(film);
  film.showModal();
  let index=Number.isInteger(start)&&start>=0&&start<shots.length?start:0;
  function frame(){
    const s=shots[index];
    get('img').src=s.art;
    get('.kicker').textContent=s.place;
    get('h2').textContent=s.title;
    get('.story-line').textContent=s.line;
    get('.story-next').textContent=s.next;
    get('.story-back').hidden=index===0;
    get('.story-caption').scrollTop=0;
    get('h2').focus({preventScroll:true});
    onShot(index,s);
    if(shots[index+1])new Image().src=shots[index+1].art;
  }
  get('.story-back').onclick=()=>{if(index>0){index--;frame();}};
  get('.story-next').onclick=()=>{
    if(index+1<shots.length){index++;frame();return;}
    film.close();film.remove();onFinish();
  };
  film.addEventListener('keydown',e=>{
    const advance=e.key==='ArrowRight'||(e.target===get('h2')&&['Enter',' '].includes(e.key));
    if(!advance&&e.key!=='ArrowLeft')return;
    e.preventDefault();
    if(!e.repeat)get(advance?'.story-next':'.story-back').click();
  });
  film.addEventListener('cancel',e=>e.preventDefault());
  frame();
}
