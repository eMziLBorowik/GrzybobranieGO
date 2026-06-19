let forests = [];
let forestGroups = [];

// ⏳ COOLDOWN
let lastForestRequest = 0;

// 📏 area helper
function calcArea(pts){
let area = 0;
for(let i=0;i<pts.length-1;i++){
area += pts[i][0] * pts[i+1][1] - pts[i+1][0] * pts[i][1];
}
return Math.abs(area);
}

// 📦 inside check (bbox - lekki i szybki)
function isInside(big, small){
const lats = big.map(p=>p[0]);
const lngs = big.map(p=>p[1]);

const minLat = Math.min(...lats);
const maxLat = Math.max(...lats);
const minLng = Math.min(...lngs);
const maxLng = Math.max(...lngs);

return small.some(p =>
p[0] >= minLat && p[0] <= maxLat &&
p[1] >= minLng && p[1] <= maxLng
);
}

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
way["natural"="wood"](around:15000,${lat},${lng});
way["leisure"="park"](around:15000,${lat},${lng});
relation["boundary"="protected_area"](around:15000,${lat},${lng});
relation["protect_class"](around:15000,${lat},${lng});
relation["name"~"Park|Krajobrazowy|Rezerwat"](around:15000,${lat},${lng});
);

out geom;
>;
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

const text = await res.text();

if(!text.startsWith("{")){
console.error("❌ Overpass error:", text);
document.getElementById("forestStatus").innerText =
"❌ Błąd lasów";
return;
}

const data = JSON.parse(text);


// 🧠 CLEAN
let raw = [];

data.elements.forEach(el=>{

if(!el || !el.geometry) return;

if(el.tags?.highway) return;
if(el.tags?.building) return;
if(el.tags?.amenity) return;

if(el.tags?.landuse === "residential") return;
if(el.tags?.landuse === "industrial") return;
if(el.tags?.landuse === "commercial") return;
if(el.tags?.landuse === "grass") return;
if(el.tags?.landuse === "meadow") return;
if(el.tags?.recreation_ground) return;

const pts = el.geometry
.filter(p => p && typeof p.lat === "number" && typeof p.lon === "number")
.map(p => [p.lat, p.lon]);

if(pts.length < 4) return;

const area = calcArea(pts);

// 🔥 stary filtr zostaje
if(area < 0.0005) return;

raw.push({
el,
pts,
area
});

});


// 🔥 SORT BIGGEST FIRST
raw.sort((a,b)=>b.area - a.area);

const used = new Set();
forestGroups = [];

// 🔥 GROUPING (małe → duże)
for(let i=0;i<raw.length;i++){

if(used.has(i)) continue;

const main = raw[i];

let group = {
main,
children: []
};

for(let j=i+1;j<raw.length;j++){

if(used.has(j)) continue;

const other = raw[j];

// 👉 jeśli mały jest w dużym
if(isInside(main.pts, other.pts)){
group.children.push(other);
used.add(j);
}

}

used.add(i);
forestGroups.push(group);
}


// 🧹 CLEAN MAP
forests.forEach(f=>map.removeLayer(f));
forests = [];


// 🟢 RENDER
forestGroups.forEach(g=>{

let poly;
try{
poly = L.polygon(g.main.pts,{
color:"#2e8b57",
fillColor:"#3cb371",
fillOpacity:0.25,
weight:2
}).addTo(map);
}catch(err){
return;
}

forests.push(poly);

poly.on("click",(e)=>{
L.DomEvent.stopPropagation(e);

// 🔥 NIE ZMIENIAM TWOJEJ FUNKCJI
showForestInfo(
g.main.el,
g.main.pts,
g.children
);
});

});


document.getElementById("forestStatus").innerText =
"🌲 Lasy i parki gotowe (zgrupowane)";

}

catch(e){
console.log(e);
document.getElementById("forestStatus").innerText =
"❌ Błąd lasów";
}
}
