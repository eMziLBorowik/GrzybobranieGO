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


routePaused =
!routePaused;



pause.innerText =
routePaused ?
"▶ Wznów"
:
"⏸ Pauza";


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

routeMap.setView(
[userLat,userLng],
17
);

}


};


}



});










function startRoute(){


if(!routeMap)
initRouteMap();



routePoints=[];

routeDistance=0;


routeStartTime =
new Date();


routeRunning=true;

routePaused=false;



routeLine =
L.polyline(
[],
{

color:"red",

weight:6

}

)
.addTo(routeMap);



routeTimer =
setInterval(
updateRouteTime,
1000
);


}









function endRoute(){


routeRunning=false;


clearInterval(routeTimer);



let time =
Math.floor(
(new Date()-routeStartTime)/1000
);



if(routePoints.length > 1){


let save = {


date:
new Date()
.toLocaleString(),


points:
routePoints,


distance:
Math.round(routeDistance),


time:time


};



savedRoutes.unshift(save);



localStorage.setItem(
"savedRoutes",
JSON.stringify(savedRoutes)
);



showSavedRoutes();


}




}









function updateRouteTime(){


if(!routeStartTime)
return;



let sec =
Math.floor(
(Date.now()-routeStartTime)/1000
);



let min =
Math.floor(sec / 60);



let seconds =
sec % 60;



document.getElementById(
"routeTime"
)
.innerText =

min + " min " + seconds + " s";


}





function addRoutePoint(lat,lng){



if(!routeRunning)
return;


if(routePaused)
return;



let point =
[
lat,
lng
];



routePoints.push(point);



routeLine.addLatLng(point);





if(routePoints.length>1){


let last =
routePoints[
routePoints.length-2
];



routeDistance +=
L.latLng(last)
.distanceTo(
L.latLng(point)
);



}



document.getElementById(
"routeDistance"
)
.innerText =
Math.round(routeDistance)+" m";



if(routeMarker){

routeMarker.setLatLng(point);

}


}










setInterval(()=>{


if(userLat && userLng){


addRoutePoint(
userLat,
userLng
);


}


},15000);









function showSavedRoutes(){


let box =
document.getElementById(
"routesList"
);


if(!box)
return;



if(savedRoutes.length===0){

box.innerHTML =
"Brak zapisanych tras";

return;

}



box.innerHTML="";



savedRoutes.forEach((r,i)=>{


let div =
document.createElement("div");


div.className="card";


div.innerHTML =

`
🥾 Trasa ${i+1}

<br>

📅 ${r.date}

<br>

📏 ${r.distance} m

<br>

⏱ ${Math.floor(r.time/60)} min

<br><br>

<button>
Pokaż trasę
</button>

`;



div.querySelector("button")
.onclick=()=>showSavedRoute(r);



box.appendChild(div);



});


}









function showSavedRoute(r){



let old =
document.getElementById(
"routePreview"
);



if(old)
old.remove();




let box =
document.createElement("div");

box.id="routePreview";


box.innerHTML=

`

<h3>🥾 Zapisana trasa</h3>

📅 ${r.date}

<br>

📏 ${r.distance} m

<br>

⏱ ${Math.floor(r.time/60)} min


<div id="previewMap"></div>


<button id="closePreview">
❌ Zamknij
</button>


`;



document.body.appendChild(box);



let m =
L.map("previewMap");



L.tileLayer(
"https://tile.openstreetmap.org/{z}/{x}/{y}.png"
)
.addTo(m);



let line =
L.polyline(
r.points,
{

color:"red",

weight:6

}
)
.addTo(m);



m.fitBounds(
line.getBounds()
);



document.getElementById(
"closePreview"
)
.onclick=()=>{

box.remove();

};


}
