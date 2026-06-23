let routeMap = null;

let routeLine = null;

let routePoints = [];

let routeRunning = false;

let routePaused = false;

let routeStartTime = null;

let routeTimer = null;

let routeDistance = 0;

let routeMarker = null;

let savedRoutes = [];

let pausedAt = null;
let totalPausedTime = 0;

let gpsInterval = null;


// ============================
// 🌲 FOREST GRID SYSTEM
// ============================

let activeForest = null;
let forestGridLayer = null;
let forestExplorationState = {};


// ============================
// 🧠 FIX ID LASU
// ============================

function normalizeForestId(forest){

if(forest.id) return forest.id;

if(forest.geometry && forest.geometry[0]){
let p = forest.geometry[0][0];
return p[0].toFixed(5) + "_" + p[1].toFixed(5);
}

return "unknown";
}


// ============================
// SUPABASE FOREST LOAD
// ============================

async function loadForestExploration(forestId){

const { data } = await supabase
.from("forest_exploration")
.select("*")
.eq("forest_id", forestId)
.single();

return data || null;
}


// ============================
// POINT IN POLYGON
// ============================

function pointInPolygon(point, vs){

let x = point[0], y = point[1];
let inside = false;

for (let i = 0, j = vs.length - 1; i < vs.length; j = i++) {
let xi = vs[i][0], yi = vs[i][1];
let xj = vs[j][0], yj = vs[j][1];

let intersect = ((yi > y) != (yj > y)) &&
(x < (xj - xi) * (y - yi) / (yj - yi + 0.0000001) + xi);

if (intersect) inside = !inside;
}

return inside;
}


// ============================
// FIND FOREST
// ============================

function findForest(lat,lng){

if(!forests || forests.length === 0) return null;

for(let f of forests){
if(!f.geometry || !f.geometry[0]) continue;

if(pointInPolygon([lat,lng], f.geometry[0])){
return f;
}
}

return null;
}


// ============================
// FOREST GRID
// ============================

async function createForestGrid(forest){

if(forestGridLayer){
forestGridLayer.remove();
}

forestGridLayer = L.layerGroup().addTo(routeMap);

let id = normalizeForestId(forest);

if(!forestExplorationState[id]){
forestExplorationState[id] = {
revealed: new Set(),
total: 0
};
}

let state = forestExplorationState[id];
state.total = 0;

let coords = forest.geometry[0];

let lats = coords.map(c => c[0]);
let lngs = coords.map(c => c[1]);

let minLat = Math.min(...lats);
let maxLat = Math.max(...lats);
let minLng = Math.min(...lngs);
let maxLng = Math.max(...lngs);

let step = 0.00009;

for(let lat = minLat; lat < maxLat; lat += step){
for(let lng = minLng; lng < maxLng; lng += step){

if(!pointInPolygon([lat,lng], coords)) continue;

state.total++;

L.rectangle([
[lat,lng],
[lat+step,lng+step]
],{
color:"transparent",
fillColor:"#00ff88",
fillOpacity:0.05,
weight:0
}).addTo(forestGridLayer);

}
}

let saved = await loadForestExploration(id);

if(saved && saved.revealed_cells){
saved.revealed_cells.forEach(k=>{
state.revealed.add(k);
});
}
}


// ============================
// REVEAL CELL
// ============================

function revealForestCell(lat,lng){

if(!routeRunning) return;
if(!activeForest) return;

let id = normalizeForestId(activeForest);
let state = forestExplorationState[id];
if(!state) return;

let key = lat.toFixed(5)+"_"+lng.toFixed(5);

if(state.revealed.has(key)) return;

state.revealed.add(key);

let step = 0.00009;

L.rectangle([
[lat,lng],
[lat+step,lng+step]
],{
color:"#00ff88",
fillColor:"#00ff88",
fillOpacity:0.25,
weight:1
}).addTo(forestGridLayer);
}


// ============================
// SAVE FOREST EXP
// ============================

async function saveForestExploration(){

if(!activeForest) return;

let id = normalizeForestId(activeForest);
let state = forestExplorationState[id];
if(!state) return;

let coverage =
state.total === 0 ? 0 :
Math.round((state.revealed.size / state.total) * 100);

await supabase.from("forest_exploration").upsert([{
forest_id: id,
coverage_percent: coverage,
revealed_cells: Array.from(state.revealed),
total_cells: state.total,
date: new Date().toISOString()
}],{
onConflict:"forest_id"
});
}


// ============================
// INIT MAP
// ============================

function initRouteMap(){

if(routeMap) return;


// 🥾 osobna mapa dla zakładki trasy
routeMap = L.map("routeMiniMap", {
zoomControl:false,
attributionControl:false
});


L.tileLayer(
"https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
{
attribution:"© OpenStreetMap"
}
).addTo(routeMap);



if(userLat && userLng){

routeMap.setView(
[userLat,userLng],
17
);

}else{

routeMap.setView(
[52,19],
6
);

}



setTimeout(()=>{

if(routeMap){

routeMap.invalidateSize();

}

},300);


// 📍 TEN SAM MARKER CO NA GŁÓWNEJ MAPIE

if(userMarker && userLat && userLng){

userMarker.addTo(routeMap);

userMarker.setLatLng([
userLat,
userLng
]);

}

}


// ============================
// START ROUTE
// ============================

function startRoute(){

if(!routeMap) initRouteMap();

routePoints=[];
routeDistance=0;

routeStartTime = Date.now();

routeRunning=true;
routePaused=false;

pausedAt=null;
totalPausedTime=0;

activeForest=null;


if(forestGridLayer){

forestGridLayer.remove();
forestGridLayer=null;

}


routeLine = L.polyline([],{

color:"red",
weight:6

}).addTo(routeMap);



gpsInterval = setInterval(()=>{

if(!routeRunning || routePaused) return;


if(userLat && userLng){

addRoutePoint(
userLat,
userLng
);

}


},15000);



routeTimer = setInterval(
updateRouteTime,
1000
);
}


// ============================
// END ROUTE
// ============================

async function endRoute(){

routeRunning=false;

clearInterval(routeTimer);
clearInterval(gpsInterval);

let time =
Math.floor((Date.now()-routeStartTime-totalPausedTime)/1000);

if(routePoints.length > 1){

const { data:{user} } = await supabase.auth.getUser();

if(!user){
console.log("no user");
return;
}

await supabase.from("routes").insert([{
user_id:user.id,
name:"Trasa",
points:routePoints,
distance:Math.round(routeDistance),
duration:time
}]);

await enforceRouteLimit();

showSavedRoutes();
}

saveForestExploration();
}


// ============================
// LIMIT 15
// ============================

async function enforceRouteLimit(){

const { data:{user} } = await supabase.auth.getUser();
if(!user) return;

const { data } = await supabase
.from("routes")
.select("id,created_at")
.eq("user_id",user.id)
.order("created_at",{ascending:true});

if(!data || data.length <= 15) return;

const toDelete = data.slice(0,data.length-15);

await supabase.from("routes")
.delete()
.in("id",toDelete.map(r=>r.id));
}


// ============================
// TIMER
// ============================

function updateRouteTime(){

if(!routeStartTime) return;

if(routePaused) return;

let sec =
Math.floor((Date.now()-routeStartTime-totalPausedTime)/1000);

let min = Math.floor(sec/60);
let seconds = sec%60;

document.getElementById("routeTime").innerText =
min+" min "+seconds+" s";
}


// ============================
// ADD POINT
// ============================

let lastPoint = null;

function addRoutePoint(lat,lng){

if(!routeRunning) return;
if(routePaused) return;

if(lastPoint){
let d = L.latLng(lastPoint).distanceTo(L.latLng(lat,lng));
if(d < 3) return;
}

lastPoint = [lat,lng];

let point=[lat,lng];

routePoints.push(point);

routeLine.addLatLng(point);

if(routePoints.length>1){
let last = routePoints[routePoints.length-2];
routeDistance += L.latLng(last).distanceTo(L.latLng(point));
}

document.getElementById("routeDistance").innerText =
Math.round(routeDistance)+" m";

if(routeMarker){
routeMarker.setLatLng(point);
}

let forest=findForest(lat,lng);

if(forest){

if(!activeForest || normalizeForestId(activeForest)!==normalizeForestId(forest)){

activeForest=forest;
createForestGrid(forest);
}

revealForestCell(lat,lng);
}
}


// ============================
// SHOW ROUTES
// ============================

async function showSavedRoutes(){

let box=document.getElementById("routesList");
if(!box) return;

const { data:{user} } = await supabase.auth.getUser();
if(!user) return;

const { data } = await supabase
.from("routes")
.select("*")
.eq("user_id",user.id)
.order("created_at",{ascending:false});

if(!data || data.length===0){
box.innerHTML="Brak zapisanych tras";
return;
}

savedRoutes=data;

box.innerHTML="";

savedRoutes.forEach((r,i)=>{

let div=document.createElement("div");
div.className="card";

div.innerHTML=`
🥾 Trasa ${i+1}<br>
📅 ${new Date(r.created_at).toLocaleString()}<br>
📏 ${r.distance} m<br>
⏱ ${Math.floor(r.duration/60)} min<br><br>
<button>Pokaż trasę</button>
`;

div.querySelector("button").onclick=()=>showSavedRoute(r);

box.appendChild(div);
});
}


// ============================
// PREVIEW
// ============================

function showSavedRoute(r){

let old=document.getElementById("routePreview");
if(old) old.remove();

let box=document.createElement("div");
box.id="routePreview";

box.innerHTML=`
<h3>🥾 Zapisana trasa</h3>
📅 ${new Date(r.created_at).toLocaleString()}<br>
📏 ${r.distance} m<br>
⏱ ${Math.floor(r.duration/60)} min
<div id="previewMap"></div>
<button id="closePreview">❌ Zamknij</button>
`;

document.body.appendChild(box);

let m=L.map("previewMap");

L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png").addTo(m);

let line=L.polyline(r.points,{
color:"red",
weight:6
}).addTo(m);

m.fitBounds(line.getBounds());

document.getElementById("closePreview").onclick=()=>box.remove();
}


// ============================
// BUTTONS
// ============================

document.addEventListener("DOMContentLoaded",()=>{

const start=document.getElementById("startRouteBtn");
const pause=document.getElementById("pauseRouteBtn");
const end=document.getElementById("endRouteBtn");
const center=document.getElementById("centerRouteBtn");

if(start){
start.onclick=()=>{
startRoute();
start.style.display="none";
pause.style.display="block";
end.style.display="block";
};
}

if(pause){
pause.onclick=()=>{

routePaused=!routePaused;

if(routePaused){
pausedAt=Date.now();
} else {
totalPausedTime+=Date.now()-pausedAt;
pausedAt=null;
}

pause.innerText=routePaused?"▶ Wznów":"⏸ Pauza";
};
}

if(end){
end.onclick=()=>{
endRoute();
start.style.display="block";
pause.style.display="none";
end.style.display="none";
};
}

if(center){
center.onclick=()=>{
if(userLat&&userLng){
routeMap.setView([userLat,userLng],17);
}
};
}

});

document.addEventListener("DOMContentLoaded", async () => {
  await showSavedRoutes();
});

document.addEventListener("DOMContentLoaded", () => {
  initRouteMap();

  setTimeout(() => {
    if (routeMap) routeMap.invalidateSize();
  }, 300);
});
