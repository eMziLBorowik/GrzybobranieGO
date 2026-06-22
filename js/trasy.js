let routeMap = null;

let routeLine = null;

let routePoints = [];

let routeRunning = false;

let routePaused = false;

let routeStartTime = null;

let routeTimer = null;

let routeDistance = 0;




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
16
);


}
else{


routeMap.setView(
[52.0,19.0],
6
);


}



setTimeout(()=>{

routeMap.invalidateSize();

},500);



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



},300);



};


}






const start =
document.getElementById("startRouteBtn");


const pause =
document.getElementById("pauseRouteBtn");


const end =
document.getElementById("endRouteBtn");





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
color:"#00ff66",
weight:5
}
)
.addTo(routeMap);



routeTimer =
setInterval(
updateRouteTime,
1000
);



}









function pauseRoute(){


routePaused =
!routePaused;


}










function endRoute(){


routeRunning=false;


clearInterval(routeTimer);


}










function updateRouteTime(){



if(!routeStartTime)
return;



let sec =
Math.floor(
(new Date()-routeStartTime)/1000
);



document.getElementById(
"routeTime"
)
.innerText =
Math.floor(sec/60)+" min";



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



document.getElementById(
"routePoints"
)
.innerText =
routePoints.length;



routeMap.setView(
point,
16
);



}








// GPS co 15 sekund


setInterval(()=>{


if(
userLat &&
userLng
){


addRoutePoint(
userLat,
userLng
);


}



},15000);
