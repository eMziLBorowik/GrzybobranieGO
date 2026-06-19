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


// 🧠 RENDER
data.elements.forEach(el=>{

if(!el || !el.geometry || !Array.isArray(el.geometry)) return;

// 🚫 drogi / miasta / śmieci
if(el.tags?.highway) return;
if(el.tags?.building) return;
if(el.tags?.amenity) return;
if(el.tags?.landuse === "residential") return;
if(el.tags?.landuse === "grass") return;

// 🔥 punkty
const pts = el.geometry
.filter(p => p && typeof p.lat === "number" && typeof p.lon === "number")
.map(p => [p.lat, p.lon]);

if(pts.length < 4) return;

// 📏 filtr “mini parków” (KLUCZ FIX)
let area = 0;
for(let i=0;i<pts.length-1;i++){
area += pts[i][0] * pts[i+1][1] - pts[i+1][0] * pts[i][1];
}
area = Math.abs(area);

if(area < 0.0003) return; // 🚫 usuwa skwery i trawniki

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
"🌲 Lasy i parki gotowe";

}

catch(e){
console.log(e);
document.getElementById("forestStatus").innerText =
"❌ Błąd lasów";
}

}




async function showForestInfo(el,pts){


let panel = document.getElementById("forestInfoPanel");

panel.style.display="block";



// 🌲 NAZWA
let name = "🌲 Teren zielony";

if(el.tags){

if(el.tags.name){
name = "🌲 " + el.tags.name;
}
else if(el.tags.official_name){
name = "🌲 " + el.tags.official_name;
}
else if(el.tags.protected_name){
name = "🌲 " + el.tags.protected_name;
}
else if(el.tags.short_name){
name = "🌲 " + el.tags.short_name;
}

}


document.getElementById("forestName").innerText = name;

document.getElementById("forestRain").innerText = "🌧️ Sprawdzanie...";
document.getElementById("forestChance").innerText = "🍄 Liczenie...";


let lat = pts[0][0];
let lng = pts[0][1];


try{

let r = await fetch(
`https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lng}&daily=precipitation_sum,temperature_2m_max&past_days=30&timezone=auto`
);

let d = await r.json();

let rains = d.daily.precipitation_sum || [];
let temps = d.daily.temperature_2m_max || [];


// 🌧️ SUSZA + WILGOĆ
let rain30 = rains.reduce((a,b)=>a+(b||0),0);
let avgRain = rain30 / 30;

let rain7 = rains.slice(-7).reduce((a,b)=>a+(b||0),0) / 7;


// 🌡️ TEMP
let temp = temps.reduce((a,b)=>a+b,0)/(temps.length||1);


// 🍄 START
let chance = 30;


// 🌧️ wilgoć
if(avgRain > 4 && rain7 > 5){
chance += 35;
}
else if(avgRain > 2){
chance += 15;
}
else{
chance -= 25;
}


// 🔥 SUSZA REALNA
if(avgRain < 2 && rain7 < 2){
chance -= 35;
}
else if(avgRain < 3){
chance -= 15;
}


// 🌡️ temperatura
if(temp >= 10 && temp <= 22){
chance += 15;
}
if(temp < 5){
chance -= 15;
}
if(temp > 28){
chance -= 20;
}


// 🌱 SEZON
let month = new Date().getMonth()+1;

if(month===9 || month===10){
chance += 30;
}
if(month===7 || month===8){
chance -= 15;
}
if(month===12 || month===1 || month===2){
chance -= 25;
}


// clamp
if(chance > 95) chance = 95;
if(chance < 5) chance = 5;


document.getElementById("forestRain").innerText =
"🌧️ 30 dni: " + rain30.toFixed(1) + " mm";

document.getElementById("forestChance").innerText =
"🍄 Szansa: " + Math.round(chance) + "%";

}

catch(e){
console.log(e);
document.getElementById("forestRain").innerText =
"🌧️ Brak danych";
}

}




// 🔥 ZAMYKANIE PANELU
document.addEventListener("click",(e)=>{

const panel = document.getElementById("forestInfoPanel");

if(!panel) return;

if(panel.contains(e.target)) return;

if(e.target.closest(".leaflet-interactive")) return;

panel.style.display="none";

});

map.on("click",()=>{

document.getElementById("forestInfoPanel").style.display="none";

});
