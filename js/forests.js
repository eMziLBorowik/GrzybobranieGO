let forests = [];

// ⏳ COOLDOWN
let lastForestRequest = 0;

async function loadForests(lat, lng){

const now = Date.now();

if(now - lastForestRequest < 15000){
console.log("⏳ cooldown forests API");
return;
}

lastForestRequest = now;


const q = `
[out:json];

(
  way["landuse"="forest"](around:15000,${lat},${lng});
  relation["landuse"="forest"](around:15000,${lat},${lng});

  way["natural"="wood"](around:15000,${lat},${lng});
  relation["natural"="wood"](around:15000,${lat},${lng});

  way["natural"="scrub"](around:15000,${lat},${lng});
  relation["natural"="scrub"](around:15000,${lat},${lng});

  relation["boundary"="national_park"](around:15000,${lat},${lng});

  relation["boundary"="protected_area"](around:15000,${lat},${lng});
  relation["protect_class"~"2|3|4"](around:15000,${lat},${lng});

  relation["protection_title"~"Rezerwat|Park Krajobrazowy|Park Narodowy"](around:15000,${lat},${lng});
  relation["name"~"Rezerwat|Park Krajobrazowy|Park Narodowy"](around:15000,${lat},${lng});
);

out geom;
`;


const url =
"https://overpass-api.de/api/interpreter?data=" +
encodeURIComponent(q);


try{

const res = await fetch(url);

if(res.status === 429){
console.warn("⚠️ Overpass limit");

setTimeout(()=>{
loadForests(lat,lng);
},10000);

return;
}

const data = await res.json();


// 🧠 CLEAN RENDER
data.elements.forEach(el=>{

if(!el?.geometry) return;

// 🚫 śmieci
if(el.tags?.highway) return;
if(el.tags?.building) return;
if(el.tags?.amenity) return;

// 🚫 miejskie parki OFF
if(el.tags?.leisure === "park" && !el.tags?.boundary) return;

// 🚫 landuse
if(el.tags?.landuse === "residential") return;
if(el.tags?.landuse === "industrial") return;
if(el.tags?.landuse === "commercial") return;
if(el.tags?.landuse === "grass") return;
if(el.tags?.landuse === "meadow") return;
if(el.tags?.landuse === "recreation_ground") return;


// 🔥 GEOMETRIA (TYLKO PEWNA)
const pts = el.geometry
.filter(p => p?.lat && p?.lon)
.map(p => [p.lat, p.lon]);

if(pts.length < 4) return;


// 🟢 RYSOWANIE
let poly;

try{
poly = L.polygon(pts,{
color:"#2e8b57",
fillColor:"#3cb371",
fillOpacity:0.25,
weight:2
}).addTo(map);
}catch(err){
return;
}

forests.push(poly);


// ✅ STABILNY CLICK (FIX FINAL)
poly.on("click",(e)=>{
L.DomEvent.stopPropagation(e);

showForestInfo({
  tags: el.tags || {}
}, pts);

});

});


document.getElementById("forestStatus").innerText =
"🌲 Lasy, parki i rezerwaty gotowe";

}

catch(e){
console.log(e);
document.getElementById("forestStatus").innerText =
"❌ Błąd lasów";
}

}
