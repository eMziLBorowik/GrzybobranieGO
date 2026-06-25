let forests = [];

// ⏳ COOLDOWN
let lastForestRequest = 0;



// 🚫 NOWY LEPSZY FILTR (zamiast isUrban)
function isBadForest(el, pts){

if(!el.tags) return true;

// ✅ Parki narodowe i rezerwaty przepuszczamy
if (
    el.tags.boundary === "protected_area" ||
    el.tags.boundary === "national_park" ||
    el.tags.protect_class ||
    (el.tags.name && (
        el.tags.name.includes("Park Narodowy") ||
        el.tags.name.includes("Park Krajobrazowy") ||
        el.tags.name.includes("Rezerwat")
    ))
){
    return false;
}


// 🌆 miejskie tereny zielone
const urbanGreen = [
"park",
"garden",
"grass",
"village_green",
"recreation_ground",
"meadow"
];

if(urbanGreen.includes(el.tags.leisure)) return true;


// 🚫 za małe obiekty
if(pts.length < 25) return true;


// 🚫 pseudo-lasy miejskie
if(el.tags.landuse === "forest" && pts.length < 40){
return true;
}


if(el.tags.place){
return true;
}

return false;
}

// 🚫 place = centrum miasta/wsi
if(el.tags.place){
return true;
}

return false;
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


// 🧹 usuń stare lasy z głównej mapy
forests = [];

window.forestLayer.clearLayers();



data.elements.forEach(el=>{

if(!el.geometry) return;

const pts =
el.geometry.map(p=>[p.lat,p.lon]);

// 🚫 FILTR KLUCZOWY (usuwa miasta ze screena)
if(isBadForest(el, pts)) return;

if(pts.length < 3) return;

let poly =
L.polygon(pts,{
color:"#2e8b57",
fillColor:"#3cb371",
fillOpacity:0.25,
weight:2
}).addTo(window.forestLayer);

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



let rain30 = rains.reduce((a,b)=>a+(b||0),0);
let avgRain = rain30 / 30;

let rain7 = rains.slice(-7).reduce((a,b)=>a+(b||0),0) / 7;

let temp = temps.reduce((a,b)=>a+b,0)/(temps.length||1);



let chance = 30;



if(avgRain > 4 && rain7 > 5){
chance += 35;
}
else if(avgRain > 2){
chance += 15;
}
else{
chance -= 20;
}

if(avgRain < 2 && rain7 < 2){
chance -= 35;
}
else if(avgRain < 3){
chance -= 15;
}

if(temp >= 10 && temp <= 22){
chance += 15;
}

if(temp < 5){
chance -= 15;
}

if(temp > 28){
chance -= 20;
}

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
