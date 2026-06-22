let routeMap = null;

let routeLine = null;

let routePoints = [];

let routeRunning = false;

let routePaused = false;

let routeStartTime = null;

let routeTimer = null;

let routeDistance = 0;

let routeMarker = null;

let savedRoutes =
JSON.parse(
localStorage.getItem("savedRoutes")
) || [];


// ============================
// 🌲 FOREST GRID SYSTEM (DODANE)
// ============================

let activeForest = null;

let forestGridLayer = null;

// persistent eksploracja lasów
let forestExplorationState = {};


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


function findForest(lat,lng){

if(!forests || forests.length === 0)
return null;

for(let f of forests){

if(!f.geometry || !f.geometry[0])
continue;

if(pointInPolygon([lat,lng], f.geometry[0])){
return f;
}

}

return null;

}


function createForestGrid(forest){

if(forestGridLayer){
forestGridLayer.remove();
}

forestGridLayer = L.layerGroup().addTo(routeMap);

let id = forest.id || "unknown";

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

if(!pointInPolygon([lat,lng], coords))
continue;

state.total++;

L.rectangle(
[
[lat,lng],
[lat+step,lng+step]
],
{
color:"transparent",
fillColor:"#00ff88",
fillOpacity:0.05,
weight:0
}
).addTo(forestGridLayer);

}
}

}


function revealForestCell(lat,lng){

if(!routeRunning) return;
if(!activeForest) return;

let id = activeForest.id || "unknown";

let state = forestExplorationState[id];

if(!state) return;

let key = lat.toFixed(5)+"_"+lng.toFixed(5);

if(state.revealed.has(key)) return;

state.revealed.add(key);

let step = 0.00009;

L.rectangle(
[
[lat,lng],
[lat+step,lng+step]
],
{
color:"#00ff88",
fillColor:"#00ff88",
fillOpacity:0.25,
weight:1
}
).addTo(forestGridLayer);

}


function saveForestExploration(){

if(!activeForest) return;

let id = activeForest.id || "unknown";

let state = forestExplorationState[id];

if(!state) return;

let coverage =
state.total === 0 ? 0 :
Math.round((state.revealed.size / state.total) * 100);


supabase
.from("forest_exploration")
.insert([{
forest_id: id,
coverage_percent: coverage,
revealed_cells: Array.from(state.revealed),
total_cells: state.total,
date: new Date().toISOString()
}]);

}



// ============================
// INIT MAP
// ============================

function initRouteMap(){


if(routeMap)
return;



routeMap = L.map("routeMiniMap");



L.tileLayer(
"https://tile.openstreetmap.org/{z}/{x}/{y}.png",
{
maxZoom:19
}
)
.addTo(routeMap);



if(userLat && userLng){

routeMap.setView(
[userLat,userLng],
17
);

}
else{

routeMap.setView(
[52,19],
6
);

}



setTimeout(()=>{

routeMap.invalidateSize();

},500);



routeMarker =
L.marker(
[userLat,userLng],
{

icon:L.divIcon({

className:"gpsMarker",

html:"📍",

iconSize:[45,45]

})

}

)
.addTo(routeMap);

}






document.addEventListener(
"DOMContentLoaded",
()=>{


const tab =
document.getElementById("tabTrails");



if(tab){


tab.onclick=()=>{


document.getElementById("map").style.display="none";

document.getElementById("grzybdex").style.display="none";

document.getElementById("trailsPanel").style.display="block";



setTimeout(()=>{

initRouteMap();

showSavedRoutes();

},300);



};

}





const start =
document.getElementById("startRouteBtn");


const pause =
document.getElementById("pauseRouteBtn");


const end =
document.getElementById("endRouteBtn");


const center =
document.getElementById("centerRouteBtn");



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

routePaused = !routePaused;

pause.innerText =
routePaused ? "▶ Wznów" : "⏸ Pauza";

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

if(userLat && userLng){

routeMap.setView([userLat,userLng],17);

}

};

}

});






function startRoute(){

if(!routeMap)
initRouteMap();

routePoints=[];
routeDistance=0;

routeStartTime = new Date();

routeRunning=true;
routePaused=false;



activeForest = null;

if(forestGridLayer){
forestGridLayer.remove();
forestGridLayer = null;
}



routeLine =
L.polyline([],{
color:"red",
weight:6
}).addTo(routeMap);



routeTimer =
setInterval(updateRouteTime,1000);

}






function endRoute(){

routeRunning=false;

clearInterval(routeTimer);



let time =
Math.floor((new Date()-routeStartTime)/1000);



if(routePoints.length > 1){

let save = {

date: new Date().toLocaleString(),

points: routePoints,

distance: Math.round(routeDistance),

time: time

};

savedRoutes.unshift(save);

localStorage.setItem(
"savedRoutes",
JSON.stringify(savedRoutes)
);

showSavedRoutes();

}



// 🔥 zapis eksploracji lasu
saveForestExploration();

}






function updateRouteTime(){

if(!routeStartTime) return;

let sec =
Math.floor((Date.now()-routeStartTime)/1000);

let min = Math.floor(sec / 60);
let seconds = sec % 60;

document.getElementById("routeTime").innerText =
min + " min " + seconds + " s";

}






function addRoutePoint(lat,lng){


if(!routeRunning) return;
if(routePaused) return;



let point = [lat,lng];

routePoints.push(point);

routeLine.addLatLng(point);



if(routePoints.length>1){

let last = routePoints[routePoints.length-2];

routeDistance +=
L.latLng(last).distanceTo(L.latLng(point));

}



document.getElementById("routeDistance").innerText =
Math.round(routeDistance)+" m";



if(routeMarker){
routeMarker.setLatLng(point);
}



// ============================
// 🌲 FOREST DETECTION (ONLY ROUTE)
// ============================

let forest = findForest(lat,lng);



if(forest){

if(!activeForest || activeForest.id !== forest.id){

activeForest = forest;

createForestGrid(forest);

}

revealForestCell(lat,lng);

}

}






setInterval(()=>{


if(userLat && userLng){

addRoutePoint(userLat,userLng);

}


},15000);






function showSavedRoutes(){

let box =
document.getElementById("routesList");

if(!box) return;



if(savedRoutes.length===0){
box.innerHTML = "Brak zapisanych tras";
return;
}



box.innerHTML="";

savedRoutes.forEach((r,i)=>{

let div = document.createElement("div");

div.className="card";

div.innerHTML = `

🥾 Trasa ${i+1}

<br>

📅 ${r.date}

<br>

📏 ${r.distance} m

<br>

⏱ ${Math.floor(r.time/60)} min

<br><br>

<button>Pokaż trasę</button>

`;

div.querySelector("button").onclick=()=>showSavedRoute(r);

box.appendChild(div);

});

}






function showSavedRoute(r){



let old =
document.getElementById("routePreview");

if(old) old.remove();



let box = document.createElement("div");

box.id="routePreview";

box.innerHTML=`

<h3>🥾 Zapisana trasa</h3>

📅 ${r.date}

<br>

📏 ${r.distance} m

<br>

⏱ ${Math.floor(r.time/60)} min

<div id="previewMap"></div>

<button id="closePreview">❌ Zamknij</button>

`;

document.body.appendChild(box);



let m = L.map("previewMap");

L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png").addTo(m);

let line = L.polyline(r.points,{
color:"red",
weight:6
}).addTo(m);

m.fitBounds(line.getBounds());

document.getElementById("closePreview").onclick=()=>{

box.remove();

};

}
