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
  // 🌲 LASY
  way["landuse"="forest"](around:15000,${lat},${lng});
  relation["landuse"="forest"](around:15000,${lat},${lng});

  way["natural"="wood"](around:15000,${lat},${lng});
  relation["natural"="wood"](around:15000,${lat},${lng});

  way["natural"="scrub"](around:15000,${lat},${lng});
  relation["natural"="scrub"](around:15000,${lat},${lng});


  // 🟢 PARKI NARODOWE
  relation["boundary"="national_park"](around:15000,${lat},${lng});


  // 🟢 REZERWATY + PARKI KRAJOBRAZOWE (PEWNE TAGI)
  relation["boundary"="protected_area"](around:15000,${lat},${lng});
  relation["protect_class"~"2|3"](around:15000,${lat},${lng});

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


const text = await res.text();

if(!text.startsWith("{")){
console.error("❌ Overpass error:", text);
document.getElementById("forestStatus").innerText =
"❌ Błąd lasów";
return;
}

const data = JSON.parse(text);


// 🧠 RENDER
data.elements.forEach(el=>{

if(!el || !el.geometry || !Array.isArray(el.geometry)) return;

// 🚫 ŚMIECI
if(el.tags?.highway) return;
if(el.tags?.building) return;
if(el.tags?.amenity) return;

// 🚫 TYLKO MIEJSKIE PARKI WYŁĄCZAMY
if(el.tags?.leisure === "park" && !el.tags?.boundary) return;

if(el.tags?.landuse === "residential") return;
if(el.tags?.landuse === "industrial") return;
if(el.tags?.landuse === "commercial") return;
if(el.tags?.landuse === "grass") return;
if(el.tags?.landuse === "meadow") return;
if(el.tags?.landuse === "recreation_ground") return;


// 🔥 punkty
const pts = el.geometry
.filter(p => p && typeof p.lat === "number" && typeof p.lon === "number")
.map(p => [p.lat, p.lon]);

if(pts.length < 3) return;


// 📏 minimalny filtr (małe lasy zostają!)
let area = 0;
for(let i=0;i<pts.length-1;i++){
area += pts[i][0] * pts[i+1][1] - pts[i+1][0] * pts[i][1];
}
area = Math.abs(area);

// tylko mikro-śmieci
if(area < 0.00001) return;


let poly;
try{
poly = L.polygon(pts,{
color:"#2e8b57",
fillColor:"#3cb371",
fillOpacity:0.25,
weight:2
}).addTo(map);
}catch(err){
console.log("polygon skip:", err);
return;
}

forests.push(poly);

poly.on("click",(e)=>{
L.DomEvent.stopPropagation(e);
showForestInfo(el,pts);
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
