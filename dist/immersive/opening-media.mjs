/** Optional opening assets. Set enabled only after adding the corresponding files. */
export const OPENING_IMAGES=Object.freeze({
 'ep1-intro-2':{url:'../assets/generated/kaelan-loupe-v1.webp',enabled:false},
 'ep1-intro-3':{url:'../assets/generated/crystal-fracture-v1.webp',enabled:false},
 'ep1-intro-5':{url:'../assets/generated/plaza-aftermath-v1.webp',enabled:false},
 'ep1-intro-6':{url:'../assets/generated/thalor-address-v1.webp',enabled:false},
 'ep1-intro-7':{url:'../assets/generated/ceremony-shard-v1.webp',enabled:false}
});
// Null means no request. Replace an individual value with ./voice/ep1-intro-N.mp3 or .wav after delivery.
export const OPENING_VOICES=Object.freeze(Object.fromEntries(Array.from({length:7},(_,i)=>[`ep1-intro-${i+1}`,null])));
export function openingImage(id,fallback){const item=OPENING_IMAGES[id];return item?.enabled?item.url:fallback;}
export function openingVoice(id){const path=OPENING_VOICES[id];return typeof path==='string'&&/\.(mp3|wav)$/i.test(path)?path:null;}
