/** Viewport-based orientation; never requests or locks device orientation. */
export const isPortrait=(width,height)=>height>=width;
/** Clear captured movement/look whenever layout changes; return whether the prompt is needed. */
export function applyOrientation(width,height,controls){controls?.reset();return isPortrait(width,height);}
