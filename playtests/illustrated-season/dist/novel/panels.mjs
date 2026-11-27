import {episodes} from '../episodes.mjs';

// The manuscript supplies the chapter titles. A panel is a single cut; dialogue
// belongs to the named speaker and its caption carries the visible action.
const p=(art,sound,caption,speaker='',line='')=>({art,sound,caption,speaker,line});
const scenes=[
  [
    p('ceremony-opening-v1','assembly','On the spring equinox, the outer rings empty into the temple plaza. Kaelan can just see the altar over a fountain. His father has lent him the shop loupe.'),
    p('kaelan-loupe-v1','pencil','The priests turn the great crystal until a thread of sunlight bends around a broken brass rivet. Kaelan draws the bend on the back of a receipt.'),
    p('crystal-fracture-v1','surge','Through the loupe he sees a fork inside the quartz. A flaw like that would get a whole crate condemned in Father’s shop. The fork brightens. One hairline becomes two.','Kaelan','Wait!'),
    p('plaza-aftermath-v1','break','The lamps burst outward from the altar. By the time Kaelan gets up, a line of guards stands between him and the priests.'),
    p('thalor-address-v1','hush','From the balcony, Lord Thalor smiles. His fingers are locked around the rail.','Thalor','Nothing to concern yourselves with. Simply an overenthusiastic demonstration.'),
    p('ceremony-shard-v1','faint','At Kaelan’s feet a shard is still answering the temple bell. He wraps it in his drawing and carries it home.')
  ],[
    p('crystalshop-opening-v1','shop','Half the work stools are empty. Approved quartz costs three times what it did last spring. Father has kept the old sample packets, even the ones the guild stamped for disposal.'),
    p('light-bench-study','mount','Kaelan turns a rejected sliver under the lamp. Its light bends around the rivet on his tracing, exactly where the temple stone’s light did. Father tries the turn himself.'),
    p('season/father-hold','freight','Father ties a hold ticket to the sliver’s crate. The other crates go out on the cart.','Father','If that one’s worthless, they’ll have to tell me why.'),
    p('inspector-at-the-door','notice','The collector returns with an inspector. Father has to sign for the crate he kept.','Inspector','Final warning. Your next shipment must be premium grade or higher. No exceptions.'),
    p('season/diren-badge','badge','On the way to the dock they pass Diren, who taught Kaelan to weigh a stone in his palm. He asked the guild to explain the new grades. A guard takes his trading badge.')
  ],[
    p('disposal-barge','quay','Kaelan waits at the water gate. A loaded barge passes below him. The lantern reflections come apart on the ripples. A thin fork of light stays with the cargo.'),
    p('quay-sketchboard','pencil','He draws it from the steps, then again from the bridge. Even the nick in the longer branch is in the same place.'),
    p('barge-overlook','answer','The cargo sounds a low note as it rounds the gate. The shard in his pocket answers.','Kaelan','The shop window sits over this same water. What happens if I take the barge out of it?')
  ],[
    p('shop-canal-view','quay','Before dawn he sets the rejected sliver on the sill. The lock opens below. Water rises against the stonework.'),
    p('season/evidence-4','reveal','The sliver throws light across the wall. A fork cut into the plaster catches it. Someone knew this shape before the shop was built.'),
    p('season/patrol-door','approach','One door down, the patrol asks a merchant for his name. Father’s signed slip lies in the light beside the stone. Kaelan remembers Diren’s bare lapel.'),
    p('shop-field-notes','cover','He folds the slip inside his drawings and pulls the cloth over the sliver. The line of light under the door goes dark. Someone is standing there.'),
    p('crystalshop-opening-v1','depart','The boots pass. There’s a knock at the next house. Father takes the slip back out and taps the seal.','Father','That’s the guild’s mark. Ask at the archive when they started putting it on stones like ours.')
  ],[
    p('arc-archives','archive','The public notice says quartz is scarce. Kaelan finds the year Father started laying people off. Approved prices tripled. Over that same year ten times as much quartz was condemned.'),
    p('season/archive-key','key','An old woman closes his ledger as a reader passes. When he opens his hand there is a key in it.','Archive keeper','Western stacks. Shelf forty-seven. Be quick.'),
    p('season/evidence-5','leaf','His lamp slips low. Under the ordinary ink he can read the old grading tables. The same fork appears in edition after edition, until Thalor’s family has it reclassified as a flaw.'),
    p('season/archive','latch','Kaelan returns the key. Who still works with these patterns? The keeper opens the side door toward the merchants’ quarter.','Archive keeper','Ask the people who have to cut seats for them.')
  ],[
    p('season/mira-quarter','market','A woman at a message array folds his copy of the ledger inward as a patrol turns into the arcade.','Mira','I’m Mira. I make the mountings for these houses. I’ve noticed what goes missing, too.'),
    p('condemned-tag','seize','Across the street a guard takes a merchant away for false certification. Mira points to the crystal dangling from the confiscated bundle. The fork catches the sun. Kaelan shows her the sliver.'),
    p('season/evidence-6','mount','Behind her workshop door Mira clamps the chip in brass. On the dry bench it gives a faint thread. She moves it over the trough and the whole fork lights up.','Mira','Feel the jaws. Still tight. All I changed was where I held it.')
  ],[
    p('season/kai-threshold','kai','Two taps, a pause, a third. A thin man in a crystal worker’s coat stands at Mira’s door with a rolled sheet under one arm.','Mira','Kai? Where did you hear that?'),
    p('season/evidence-7','records','Kai unrolls a record from his watch in the bell tower. Mira puts her mounting record beside it. The paired beats agree, even on the night both grew stronger.','Kai','The equinox. I thought the fault was in my instrument.'),
    p('season/artisan','patrol-far','Another patrol passes the shutters. It is the third this morning. Mira takes the mounting off her bench and wraps it. Kaelan knows a boat that leaves tonight.')
  ],[
    p('season/evidence-8','harbor','The old navigator has been promoted to harbor master. He hands Kaelan the disposal barge’s tiller and shows him which line runs slack when the cargo sling reaches the water.'),
    p('novel/night-freight','freight','A vendor shutters her lantern. The dock workers wait until the patrol has turned, then lower a crate of condemned quartz into Kaelan’s hands. It never reaches the dumping ground.'),
    p('barge-overlook','search','At the next checkpoint a crystal-tipped staff glows over the hold. They need somewhere the patrol’s instruments cannot hear them.')
  ],[
    p('arc-warehouse','latch','An empty warehouse at the water gate has thick walls, two doors, and a landing hidden from the street. They unload at low tide.'),
    p('novel/three-at-work','mount','Mira sets two saved stones into the same frame. Kai hears the beat grow stronger at the channel. Kaelan finds the familiar cut running along the wall.'),
    p('season/evidence-9','answer','Under a coat of lime the channel turns at the same angle as the temple inlay. They came here for shelter. They have found another part of the instrument.')
  ],[
    p('season/evidence-10','records','Kaelan lays a canal survey over Kai’s star chart. The outer water gate, the temple, even the bend beneath the warehouse lie on the same set of rings.'),
    p('novel/three-at-work','pulse','Mira touches the mounting. A lamp across the canal answers. Then another, much farther off. The pulse keeps going after she lifts her hand.'),
    p('barge-overlook','search','From the warehouse window they see the checkpoints light up in the pulse’s wake. Thalor’s inspectors know which way to look.')
  ],[
    p('season/barge','patrol-far','The harbor master misses the next tide. By evening the dock workers have heard who took him. The guards are asking for every merchant who handled the rejected cargo.'),
    p('season/evidence-11','memory','Water trembles in the warehouse channel. Kaelan bends down. In the reflection, Thalor descends a staircase that is nowhere in this room.'),
    p('season/evidence-22','leaf','Inside a vault, Thalor unrolls a drawing with the fork on it. He goes straight to the right page. He has seen the signal before.')
  ],[
    p('arc-warehouse','approach','This time the patrol stops outside their warehouse. Thalor’s voice comes through the timber. There are men at both doors.'),
    p('season/evidence-12','reveal','Water runs into a seam beneath the whitewash. Mira holds the array close. The nick in the projected fork settles into a nick carved in the stone.'),
    p('season/open-passage','doorstone','Stone slides across stone. A narrow stair opens behind the wall. From the loading door comes the first blow of a ram.')
  ],[
    p('season/passage','ram','Kai snatches up his charts. Mira carries the array. Kaelan, who knows how fast a canal stair turns slick, goes down first.'),
    p('season/evidence-13','doorstone','The last strip of warehouse light narrows and vanishes. The blows above them are suddenly very far away.'),
    p('season/chamber','drip','Their crystals give just enough light to see the cuts on the chamber wall. Down here the marks are sharp as the day someone made them.')
  ],[
    p('season/evidence-14','memory','An image forms in the basin. Temples blaze along a waterfront none of them recognizes. Water carries the light from one to the next under a different sky.'),
    p('season/evidence-7','pencil','Kai traces a sequence from his chart along the rim. For once he forgets to lower his voice.','Kai','These are instructions. Mira, try your mounting here.'),
    p('season/chamber','answer','Mira turns the array. The old waterways light in order. Above them a search crystal crosses the ceiling and moves on. For now the chamber is shielding them.')
  ],[
    p('season/evidence-11','notice','In his private vault Thalor spreads the builders’ warnings over a table. The disturbance in the water matches the one drawn in his oldest scroll.','Thalor','Find them. Whatever it takes.'),
    p('season/evidence-15','search','Kai can see the search pattern in the basin. The guards have turned the ceremonial crystals into a net. Twice a patrol is waved away from the trail. Somebody above is helping.'),
    p('novel/beside-the-water','hush','Father’s shop appears in the water. A guard lifts the cloth from the workbench. Mira finds Kaelan’s hand on the rim of the basin.','Mira','We’ll find a way.')
  ],[
    p('season/evidence-16','rise','Water climbs a channel against gravity. Kai puts a fingertip in it, pulls it out, and laughs in spite of himself.','Kai','The whole temple is a machine. We’re powering it up.'),
    p('season/ascent','mount','Mira turns the mounting a fraction. Light runs up one side of a stone joint and comes out above their heads. She traces the next turn before it lights.'),
    p('season/chamber','pulse','Kaelan remembers where the old channels meet. Between his memory, Mira’s eye, and Kai’s intervals, they can follow the spiral up.')
  ],[
    p('novel/father-taken','seize','The water clears. Father is being led from the shop in his work apron. Kaelan is halfway to the stair before Mira catches his sleeve.','Mira','You can’t help him by getting caught.'),
    p('novel/beside-the-water','hush','Kai recognizes the harbor master in chains. There are names here they know from the quay and from the reading room. Their discoveries have cost other people their freedom.'),
    p('season/evidence-21','latch','A hooded figure opens an alley door before the patrol turns the corner. Two dock workers slip through. Kaelan waits for his father to appear. The water clouds over.')
  ],[
    p('season/ascent','climb','Mira finds a channel leading higher. Kai rolls up the one chart he can carry. They climb while the search crystals below them lose the trail.'),
    p('season/evidence-18','brass','At the old observation platform an instrument has been turned. The dust still holds the shape of its foot. Someone has tried to work the mechanism.','Mira','Thalor’s been here.'),
    p('season/observatory','approach','Through the star shafts they can see every approach to the temple. A patrol is climbing each one. There is nowhere higher to go.')
  ],[
    p('season/evidence-19','arrival','As the guards reach the steps, doors open in the walls. The strangers’ robes carry the fork Kaelan drew on the day the temple crystal broke.'),
    p('order','order','Kai watches his instrument settle on a frequency he has never measured. The strangers take up positions beside the water.','Order leader','We are the Order of Seraphim.'),
    p('thalor-address-v1','hush','Thalor stops one step short of the platform.','Thalor','The Order is nothing but legend. Stories to frighten children.')
  ],[
    p('season/evidence-20','memory','The Order opens a memory in the water. Ice advances. Cities vanish beneath rising seas. Survivors come ashore here carrying a warning they cannot afford to lose.'),
    p('season/evidence-14','answer','The founder cities built a way to warn one another. The temple measures the sky. Each fork inside a crystal answers to a particular alignment. Mira recognizes what her mounting recreated.'),
    p('ceremony-shard-v1','faint','Kaelan takes out the shard from the plaza. A merchant would price the clear material around the fracture. The people who made it needed the fracture itself.')
  ],[
    p('season/evidence-21','latch','The archive keeper opens a side gate. A dock worker Kaelan knows is already there with a boat. The same people who kept the records and signaled from the quay have kept the escape routes open.'),
    p('season/father-safe','quay','A passenger steps onto the landing in a stained work apron. He steadies the next person coming ashore. Kaelan knows the movement before he sees his face.','Kaelan','That’s Dad. Mira, he’s out.'),
    p('season/far-answer','far','Beyond the harbor, light answers from a place the city charts leave blank. The awakening has reached farther than Atlantis.')
  ],[
    p('novel/the-hearing','records','Before the Order, Thalor lays his hand on the vault ledger. His family found the builders’ records generations ago.','Thalor','I tried to prevent another catastrophe. Power like this, in the hands of the unprepared—'),
    p('season/evidence-22','leaf','The distribution lines end at merchant houses. The warning could reach anyone on the water. Thalor’s family had chosen who could receive it. Kaelan lays Father’s signed slip beside the map.'),
    p('season/evidence-10','order','The Order traces a line off the edge of the chart. Other cities kept different parts of the builders’ knowledge. One city holding the records will never be enough.')
  ],[
    p('season/evidence-23','mount','Mira seats the restored mount. Kai sets the interval. Kaelan opens the outer receiving channel while the lamps on the inner bank still burn.'),
    p('season/restored','rings','One signal passes through all three rings. For the first time Father can hear the same warning at his workbench that a priest hears at the altar.'),
    p('season/far-answer','far','They wait through a whole interval. A light rises on the far shore, holds, and goes out. This time Kai has the reply on paper.')
  ],[
    p('season/legacy','harbor','At first light, ships carrying awakened quartz slip through the harbor gates. In the basin Mira sees a shore where the desert meets the sea.'),
    p('season/evidence-22','pencil','Kai marks the places that answered. Mira leaves space beside each name for what its people might bring.','Mira','The library must be built. Somewhere anyone can walk in.'),
    p('novel/three-robes','order','At their initiation Kaelan’s robe bears a water channel. Mira’s bears the crystal geometry and Kai’s the stars. From the terrace all three can see the boats spreading out.'),
    p('season/first-stone','last','Kaelan turns the first rejected sliver between finger and thumb. The tiny fork catches the sunrise.','Kaelan','Dad wanted to know what it was worth. Wait until I show him.')
  ]
];
export const chapters=scenes.map((panels,i)=>({title:episodes[i].title,panels}));
export function artUrl(name){
  if(name==='order')return new URL('../assets/18_Order of Seraphim.webp',import.meta.url).href;
  if(name.startsWith('novel/'))return new URL('./art/'+name.slice(6)+'.webp',import.meta.url).href;
  return new URL('../assets/generated/'+name+'.webp',import.meta.url).href;
}
