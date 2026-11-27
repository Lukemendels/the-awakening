import {restoreArc1820} from './arc1820.mjs';
import {comparisonInstrument} from './season/apparatus.mjs';
export function makeArc1820Visual(sceneId,objectId,state,dispatch){
  if(sceneId!=='high-temple'||objectId!=='comparison')return null;
  return comparisonInstrument(restoreArc1820(state?.state??state),dispatch);
}
