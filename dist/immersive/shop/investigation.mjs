export const angles = 12;
export const fresh = () => ({
  sketch: false, tray: false, specimen: 'approved', lamp: 0, turn: 3,
  clearSeen: false, veinsSeen: false, solved: false, hints: 0
});

export function restore(raw) {
  const state = fresh();
  if (!raw || typeof raw !== 'object') return state;
  for (const key of ['sketch','tray','clearSeen','veinsSeen','solved']) state[key] = raw[key] === true;
  if (raw.specimen === 'condemned') state.specimen = raw.specimen;
  for (const [key, max] of [['lamp',2],['turn',angles-1],['hints',3]]) {
    if (Number.isInteger(raw[key]) && raw[key] >= 0 && raw[key] <= max) state[key] = raw[key];
  }
  state.solved &&= state.sketch && state.tray && state.clearSeen && state.veinsSeen;
  return state;
}

export function observe(state) {
  if (!state.tray || state.lamp !== 2) return;
  if (state.specimen === 'approved') state.clearSeen = true;
  else state.veinsSeen = true;
}

export function compare(state) {
  if (!state.tray) return 'The specimen tray is on the crystal shelf.';
  if (!state.sketch) return 'Fetch the notebook to see what Kaelan drew at the temple.';
  if (state.lamp !== 2) return 'Surface glare hides the interior. Change the direction of the light.';
  if (state.specimen === 'approved') return 'The approved stone stays clear. Does the other stone behave the same way?';
  if (state.turn !== 0) return 'The breaks in the two rings are in different places. Turn the stone and try again.';
  if (!state.clearSeen) return 'The marks line up. Test the approved stone in this light to rule out a reflection from the lamp.';
  state.solved = true;
  return 'Only the condemned stone carries the temple mark. Someone has graded it as worthless.';
}
