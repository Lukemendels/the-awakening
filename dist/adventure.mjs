// A bounded connected adventure map. Story transitions relocate the trio;
// ordinary travel uses edges and cannot open future districts or rewrite events.
export const hubs={
 plaza:{name:'Central plaza',opens:0,edges:['shop']},
 shop:{name:'Outer-ring shop',opens:1,edges:['plaza','water','archive']},
 water:{name:'Canal gate',opens:2,edges:['shop','warehouse']},
 archive:{name:'Public archives',opens:4,edges:['shop','artisan']},
 artisan:{name:'Artisan quarter',opens:5,edges:['archive','tower']},
 tower:{name:'Communication tower',opens:6,edges:['artisan']},
 warehouse:{name:'Warehouse',opens:8,edges:['water','chamber']},
 chamber:{name:'Ancient chambers',opens:12,edges:['warehouse','summit']},
 summit:{name:'High temple',opens:17,edges:['chamber']}
};
export const missionHubs=['plaza','shop','water','shop','archive','artisan','tower','water','warehouse','warehouse','warehouse','warehouse','chamber','chamber','chamber','chamber','chamber','summit','summit','summit','summit','summit','plaza','summit'];
export function exits(s){
 const here=s.location||missionHubs[s.chapter];
 // Once the pursuit starts, the next passage is unlocked by solving the escape.
 if(s.chapter>=11&&s.chapter<18)return [];
 return hubs[here].edges.filter(id=>hubs[id].opens<=s.chapter);
}
export function routeToObjective(s){
 const start=s.location||missionHubs[s.chapter],goal=missionHubs[s.chapter];
 const queue=[[start]],seen=new Set([start]);
 while(queue.length){const path=queue.shift(),last=path.at(-1);if(last===goal)return path;
 for(const id of hubs[last].edges){if(hubs[id].opens<=s.chapter&&!seen.has(id)){seen.add(id);queue.push([...path,id]);}}}
 return [];
}
export const toolClues=[
 'The fractures are too small to examine unaided. A close optical inspection could reveal their geometry.',
 'Compare the rejected material itself with the new standard; a notice alone cannot show internal geometry.',
 'The reflected pattern needs a stable reference marked along the water route.',
 'The old grooves provide the physical reference for projecting the canal reflection.',
 'The western stacks are locked. Something the keeper entrusted to Kaelan fits that lock.',
 'Test the mounting against a small physical representation of the channel system.',
 'The bell pattern needs a measuring device, rather than a written record alone.',
 'The patterned cargo is the material whose route must be preserved.',
 'The old water controls are missing their means of manual operation.',
 'The model needs an actual allotment of material before its loads can be balanced.',
 'The silhouette is evidence of what the water-vision is detecting.',
 'Each stage needs a different function: a route reference, a physical support, then a measured frequency.',
 'Keep the charts and the array together before entering the passage.',
 'The protective resonance needs the recorded shielding response.',
 'Use the channel that is outside the search grid.',
 'Use the rising path as a guide, the spiral as the mounting reference, then the control measurement.',
 'The hidden passage signal distinguishes a safe movement from an arrest.',
 'Follow the ascending route, stabilize the isolation assembly, then restore the observation measurement.',
 'The ancient markers give a stable reference for the incoming signal.',
 'The catastrophe record provides the first context for the memories.',
 'The distant connection extends the route beyond the immediate rescue.',
 'Start with the grading revisions, then compare them with trade control and the vault records.',
 'Every district must be represented; include the inner-ring demand when balancing the entire network.',
 'The proposed repository gives the chart its shared destination.'
];
