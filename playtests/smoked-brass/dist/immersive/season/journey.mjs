import {canResumeArc,sceneFor,arcAction,isComplete,beginOutro,advanceArc,freshArc} from '../arc-progress.mjs';
import {canResumeNextArc,nextSceneFor,nextArcAction,nextIsComplete,beginNextOutro,advanceNextArc,freshNextArc} from '../next-arc-progress.mjs';
import {canResumeFinalArc,finalSceneFor,finalArcAction,finalIsComplete,beginFinalOutro,advanceFinalArc,freshFinalArc} from '../final-arc-progress.mjs';

const blocks=[
  {key:'arc',valid:canResumeArc,scene:sceneFor,act:arcAction,solved:isComplete,outro:beginOutro,advance:advanceArc},
  {key:'nextArc',valid:canResumeNextArc,scene:nextSceneFor,act:nextArcAction,solved:nextIsComplete,outro:beginNextOutro,advance:advanceNextArc,create:freshNextArc},
  {key:'finalArc',valid:canResumeFinalArc,scene:finalSceneFor,act:finalArcAction,solved:finalIsComplete,outro:beginFinalOutro,advance:advanceFinalArc,create:freshFinalArc}
];
export function currentBlock(save){return save.finalArc?blocks[2]:save.nextArc?blocks[1]:blocks[0];}
export function advance(save){
  const block=currentBlock(save),p=block.advance(save[block.key]);
  if(!p||!block.valid(p))throw Error('Invalid handoff');
  save[block.key]=p;
  const next=blocks[blocks.indexOf(block)+1];
  if(p.phase==='done'&&next&&!save[next.key])save[next.key]=next.create();
}
export function story(p){
  if(p.episode<=5)return p.story35;if(p.episode<=7)return p.story67;
  if(p.episode<=10)return p.story810;if(p.episode<=13)return p.story1113;
  if(p.episode<=17)return p.story1417;if(p.episode<=20)return p.story1820;
  return p.story2124;
}
// Direct Episode 4 playtests have their own save and never replace season progress.
export function afterCanal(){
  let p=freshArc();p.phase='room';
  for(const [id,choice] of [['near_view','observe'],['far_view','observe'],['chart','inspect'],['reflection','corresponds']])
    p=arcAction(p,{type:'interact',id,choice}).arc;
  return advanceArc(beginOutro(p));
}
