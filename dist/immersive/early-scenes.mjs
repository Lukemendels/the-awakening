// Each last button names the action that becomes available when the shot ends.
const shot=(image,place,title,line,next,cue)=>({
  art:new URL('../assets/generated/'+image+'.webp',import.meta.url).href,
  place,title,line,next,cue
});

export const earlyScenes={
  collection:[
    shot('kaelan-loupe-v1','Temple steps · Earlier that day','A mark worth keeping',
      'When the priest turned his quartz, a fine thread of light swept across the brass. Kaelan traced its bend around a broken rivet before the crowd carried him outside.','Follow Father through the market'),
    shot('season/diren-badge','Outer-ring market · Diren’s stall','The price of asking',
      '“You bought this grade from me last winter.” Diren holds out his ledger. The guard unpins his trader’s badge. Father catches the old man’s sleeve as he stumbles. Nobody else steps forward.','Go home with Father','brass-slide'),
    shot('crystalshop-opening-v1','The family shop · Before collection','Three crates at the door',
      'Father lays out a sample from each crate. “I used to trust that stamp. After what they did to Diren today…” He looks at your drawing. “Can any of ours cast the light you saw?”','Take a seat at the lamp','paper')
  ],
  hold:[
    shot('season/father-hold','The loading door · Father','The crate stays',
      'Father lays your smoked-brass tracing over the temple sketch. His thumb follows the bend in both. He loops your hold ticket around the crate and leans his full weight against it as the cart starts to roll.','Hear the collector out','wood'),
    shot('inspector-at-the-door','Merchant house inspector','A name on the receipt',
      '“Premium grade next time.” The inspector counts the crates again. Father signs for the one he kept. Only when the collector turns away does Father slip the stone into your palm.','Look out over the canal','paper')
  ],
  night:[
    shot('season/workshop','Kaelan’s workshop · Before dawn','One stone on dry land',
      'Back from the quay, Kaelan props both tracings against the sill. A lock gate opens below. He takes Father’s sliver from his pocket. Will it answer the water here, too?','Bring the stone to the window')
  ],
  patrol:[
    shot('season/evidence-4','Inside the workshop','Under the paint',
      'The fork on the wall stays put as the waterlight moves over it. Someone cut this shape into the stone long before Father rented the shop. Kaelan reaches for his pencil.','Listen at the door','crystal-pulse'),
    shot('season/patrol-door','The patrol · One door down','“Open up for inspection.”',
      'Through the shutter Kaelan hears a merchant give his name. Boots cross the paving. The light still reaches the wall. On the table, Father’s signature lies beside the stone he held back.','Turn back to the exposed evidence','knock')
  ],
  archive:[
    shot('season/archive','Western archive · First light','Follow the paper',
      'The same guild seal marks Father’s disposal slip and the ledgers on the reading tables. A notice blames the price of quartz on a shortage. Kaelan opens his notebook. Where did all the rejected stone go?','Look through the public records')
  ],
  key:[
    shot('season/archive-key','Between the stacks · Archive keeper','A key beneath the ledger',
      'The keeper covers Father’s slip with her hand as another reader passes. Brass touches Kaelan’s palm. “Shelf forty-seven. The old grades are still there. Bring me the key when you’re done.”','Return to the reading room','paper')
  ],
  mira:[
    shot('season/mira-quarter','Crystal merchants’ quarter','A stranger knows the figures',
      '“Fold that page inward.” A woman at a message array turns Kaelan’s ledger copy face down as a patrol rounds the corner. “I’m Mira. Merchants pay me to mount these stones. I’ve been keeping a count of my own.”','Watch the patrol'),
    shot('condemned-tag','Across the arcade · A seizure','The mark on the confiscated stone',
      'A guard takes a merchant by the elbow. “False certification.” His partner bundles up the stock. Mira points to a chipped edge twisting in the cord. Two threads flash there. Kaelan feels for the sliver in his pocket.','Show Mira the stone'),
    shot('season/evidence-6','Mira’s workshop · At the threshold','An offer of a workbench',
      'Mira leads him through the side door. “I can hold that chip still. You tell me what the water did.” She puts a brass mounting and its key within his reach.','Try the stone in Mira’s mounting','stone-seat')
  ],
  kai:[
    shot('season/kai-threshold','Mira’s workshop · A visitor','Someone knows the sound',
      'Two taps, a pause, then another tap. Mira looks up from the mounting. A man with a crystal worker’s badge stands in the doorway. “Kai,” she says, drawing up a stool. “Where did you hear that?”','Make room for Kai','bell'),
    shot('season/evidence-7','Kai · Bell tower record','Two witnesses to one sound',
      '“On watch in the temple tower. I wrote down the intervals.” Kai flattens a page creased from weeks in his coat. Mira slides her own record beside it. “Keep them separate,” Kaelan says. “Let’s see where they agree.”','Compare Kai’s record with Mira’s','paper')
  ]
};
