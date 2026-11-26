// The field question opens the investigation. The finding is shown only after
// the episode's existing story engine accepts the player's evidence.
const chapters=[
  ['workshop','Can the canal make my stone pulse here, away from the barge?','The old wall answers','Waterlight from the crystal catches a cut beneath the paint. It is the same fork Kaelan traced at the temple. He covers his work as the guards knock.','The guild keeps the grading records in the western archive. Who decided these stones were worthless?'],
  ['archive','If good quartz is scarce, what happened to the rest of the shipments?','The figures contradict the shortage','Approved prices tripled while ten times as much stone was condemned. In grazing light, the hidden ledger shows the grading rules themselves were revised.','Mira makes mountings for the crystal merchants. She can test one of the rejected stones.'],
  ['artisan','What changes if Mira moves the same mounted crystal beside running water?','The channel changes the pattern','Away from the trough the marks are faint. At its edge they hold together. The mounting and crystal stayed the same throughout the test.','Kai has a second set of readings from the temple bell tower.'],
  ['artisan','Do the mounting and the bell tower keep the same rhythm?','Two instruments keep one rhythm','The bell record repeats the intervals in Mira’s mounting. In the record of the astronomical alignment, the mounting’s response grows stronger.','The next disposal barge is already loading. The three need to save some of its cargo.'],
  ['barge','Which channel can the barge take before the inspection closes in?','The cargo gets through','A signal from shore gives the crew a clear passage. The discarded stones are safe for tonight, but inspectors are beginning to carry crystal-tipped staffs.','The warehouse beside the water gate offers cover for a controlled test.'],
  ['warehouse','Is the response in the crystals alone, or does their position in the warehouse matter?','Place changes the response','The same apparatus gives different readings at the marked wall and the channel. The old building is part of the experiment.','The three lay their records over a model of the city. Does the effect extend beyond this room?'],
  ['warehouse','Why do canals, buildings and ceremonial alignments follow the same rings?','The city itself carries resonance','The water and architecture follow the same routes. The timing of the ceremonies fits the astronomical record. The rings carry resonance across Atlantis.','A disturbance is spreading through the warehouse channel.'],
  ['warehouse','What can the water show them about the search above?','A warning inside the vault','In the water Kaelan sees Thalor descend into a hidden vault. The scrolls he consults carry the familiar markings. He knows more than he has told the city.','The warehouse wall bears a matching trace. Mira brings the array to it.'],
  ['warehouse','Where do the crystal’s projected lines meet the carved channels?','The old wall opens','The two traces meet at the junction. A seam shifts open in the masonry, wide enough for all three to enter.','Beyond the seam a passage descends beneath the temple district.'],
  ['passage','Where does the seam in the warehouse wall lead?','The passage seals behind them','The last sliver of warehouse light disappears. The crystal reveals unweathered cuts in the stone, older than the city overhead.','The cuts continue into a chamber with a water basin at its center.'],
  ['chamber','How should the array sit for the carved marks and the water to agree?','The chamber transmits an image','The aligned array lights the water. Temples and stars appear, connected by channels carrying power. Somebody built a system here, then somebody changed it.','In the basin the image shifts to the patrols searching overhead.'],
  ['chamber','When is it safe for the three to move while the detection grid is live?','A gap opens in the search','The patrol turns aside and the detection crystal falls quiet. Someone above is interfering with the search. Through the water Kaelan sees guards at his father’s shop.','An old conduit leads upward from the chamber.'],
  ['ascent','Which upper channel carries on the curve that starts below?','The rising water marks a route','The seam keeps its curve as it climbs. Following it connects one control point to the next in a spiral through the temple.','Another water-vision interrupts the climb. Kaelan recognizes his street.'],
  ['chamber','What is the search costing the people who helped Kaelan?','Someone is guiding people out','The search has reached Kaelan’s family and allies. In the water, hooded figures lead some of them away just before the patrols arrive.','The trail leads the three to the original observation platform.'],
  ['observatory','Did the old stone shift, or did someone move the instrument above it?','The instrument has been turned','The cut in the stone stays true across the joint. A clean arc and displaced dust mark the instrument’s recent turn. Through the shafts, patrols are closing in.','At the high temple, the three hear unfamiliar footsteps.'],
  ['observatory','Who else recognizes the markings on the rejected crystals?','The Order steps into the light','The robed figures carry the familiar geometry and a resonance Kai has never measured. Thalor recognizes the Order of Seraphim.','The Order invites them to look into the water and see why Atlantis was built.'],
  ['observatory','What were the flawed crystals originally built to detect?','The flaws were engineered','The water-memory connects the crystal marks to particular stars. Atlantis’s rings formed a warning array for a people who had already survived one catastrophe.','The Order can now explain who kept that knowledge alive.'],
  ['observatory','Who kept the escape routes open when the patrols closed in?','A hidden network kept watch','The archive keeper, dock workers and quiet guides were connected. They brought Kaelan’s father to safety and protected the records that led the three here.','Thalor still claims the merchant houses protected the city. His vault contains a way to test that claim.'],
  ['observatory','Who could actually use the knowledge that Thalor says he protected?','The records show who was excluded','The vault records and altered distribution routes put knowledge and access under merchant control. A warning system meant to connect cities could reach only a privileged few.','Opening the channels again will take more than replacing a single crystal.'],
  ['restored','Can power reach the outer district while keeping the inner ring connected?','All three rings answer','With the crystal at the outer receiving station, the linked route lights the center, inner and outer rings together. Across the water, other cities begin to answer.','At sunrise the Order calls Kaelan, Mira and Kai to the highest chamber.'],
  ['legacy','What will the three take with them when they leave Atlantis?','Three initiates, one shared task','A channel for Kaelan, a crystal for Mira, a constellation for Kai. The three accept their robes. At sunrise the fork inside Kaelan’s first rejected stone catches the light of the answering harbor.','Beyond the harbor, other sites are answering. Their next journey is to bring those scattered records together.']
];
const openings=[
  ['Before dawn, Kaelan lays the two canal tracings beside his crystal. A knock comes from the street.','Take the tracings to the archive'],
  ['The western archive keeps two sets of figures on opposite sides of the reading room. The public notice calls this a year of scarcity.','Bring a rejected crystal to Mira'],
  ['Mira tightens the brass jaws around a rejected stone. The mount can travel with it from the dry bench to the trough.','Compare the records with Kai'],
  ['Kai unrolls a record from the temple bell tower beside Mira’s bench. The two instruments never touched.','Board the disposal barge'],
  ['An inspection lamp appears around the bend. From the crowded quay, two people are trying to signal the crew.','Unload at the warehouse'],
  ['At the water gate the crew hides the cargo inside an old warehouse. Mira can carry her apparatus between the wall and the channel.','Lay the records over the city model'],
  ['Kai sets a model of Atlantis on the warehouse table. The canal surveys, building plans and star records were drawn for different purposes.','Look into the warehouse channel'],
  ['Harbor patrols have begun arresting the merchants. A light moves through the water beneath the warehouse floor.','Bring the array to the old wall'],
  ['The patrol is coming down the quay. Light from the array reaches the old wall from three stone rests.','Step through the opening'],
  ['“There.” Mira steadies the glowing array. Beyond it, water runs through a doorway that was solid stone a moment ago.','Descend to the hidden chamber'],
  ['Beneath the warehouse, a narrow channel runs past marks cut into the chamber wall. Mira sets the array down.','Watch the search in the water'],
  ['Light from the patrol’s detection grid crosses the passage. The three can watch its movement from cover.','Enter the rising conduit'],
  ['The conduit climbs out of sight. Across the stairwell, another thread of water catches the light.','Pause at the water-vision'],
  ['The water shows Kaelan his own street. Guards are leading his father away. Mira takes Kaelan’s arm and stays beside him.','Climb to the observation platform'],
  ['On the summit, a brass instrument sits above a survey notch cut across two stones. Someone has disturbed the dust.','Approach the high temple'],
  ['Footsteps echo on the temple stairs. The people who emerge from the concealed doorways wear geometry the three have seen before.','Look into the Order’s water-memory'],
  ['The Order lowers a crystal into the basin. The reflection changes to a sky that predates Atlantis.','Follow the channels with the Order'],
  ['The water returns to the night of the arrests. This time Kaelan can see what happened inside the hidden passages.','Examine the evidence from Thalor’s vault'],
  ['Thalor says he kept the technology sealed to protect the city. The Order sets the contents of his vault within Kaelan’s reach.','Reopen the city channels'],
  ['The central channel glows. Across the city the outer receiver is dark. Between them, people still depend on the inner ring.','Meet the Order at sunrise'],
  ['At sunrise three folded robes wait in the highest chamber. Far below, ships carrying the awakened crystals cast off.','Finish Season One']
];
export function resultText(ep,state,choice){
  if(ep===8)return (state.route==='inner'?'The dock worker signals a gap in the inner channel.':'The vendor’s signal guides the barge through the canal passage.')+' The cargo passes inspection. From the deck, Kaelan sees inspectors carrying crystal-tipped staffs.';
  if(ep===10){
    const parts=[['architecture','the building plans'],['water','the canal survey'],['astronomy','the star record']].filter(([key])=>state.flags[key]).map(([,name])=>name);
    return 'On the model, '+parts.join(' and ')+' follow the same rings. The city’s layout lets one disturbance travel through the whole system.';
  }
  if(ep===22&&choice==='archive')return 'The vault ledger lists the builders’ records under the family seal. There are no public copies. Only the merchant houses could have used that knowledge to prepare.';
  if(ep===22&&choice==='supply')return 'The supply lines on the diagram end at authorized merchant houses. Thalor’s promise of protection leaves everyone outside those houses exposed.';
  return chapter(ep).meaning;
}
export function chapter(ep){
  const row=chapters[ep-4];if(!row)return null;
  const [world,question,finding,meaning,lead]=row;
  const [opening,next]=openings[ep-4];
  return {world,question,finding,meaning,lead,opening,next,plate:new URL('../../assets/generated/season/evidence-'+ep+'.webp',import.meta.url).href};
}
