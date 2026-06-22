let routeMap;

let routeLine;

let routePoints=[];

let routeRunning=false;

let routePaused=false;

let routeStartTime=null;

let routeTimer=null;

let routeDistance=0;



document.addEventListener("DOMContentLoaded",()=>{


const tab =
document.getElementById("tabTrails");


if(tab){


tab.onclick=()=>{


document.getElementById("map").style.display="none";

document.getElementById("grzybdex").style.display="none";


document.getElementById("trailsPanel").style.display="block";


setTimeout(()=>{


if(!routeMap){


routeMap =
L.map("routeMiniMap");


L.tileLayer(
"https://tile.openstreetmap.org/{z}/{x}/{y}.png"
)
.addTo(routeMap);


if(userLat && userLng){

routeMap.setView(
[userLat,userLng],
16
);


}


}


routeMap.invalidateSize();


},300);



};


}





});






function startRoute(){


routePoints=[];

routeDistance=0;

routeStartTime=new Date();


routeRunning=true;

routePaused=false;



routeLine =
L.polyline([],{

color:"#00ff66",

weight:5

})
.addTo(routeMap);



routeTimer=setInterval(updateRouteTime,1000);



}



function pauseRoute(){

routePaused=!routePaused;


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


document.getElementById("routeTime").innerText =

Math.floor(sec/60)+" min";


}





function addRoutePoint(lat,lng){


if(!routeRunning || routePaused)
return;



let p=[lat,lng];


routePoints.push(p);



routeLine.addLatLng(p);



if(routePoints.length>1){


let a =
routePoints[routePoints.length-2];


let b=p;



routeDistance +=
map.distance(a,b);



}



document.getElementById("routeDistance")
.innerText =
Math.round(routeDistance)+" m";



document.getElementById("routePoints")
.innerText =
routePoints.length;



routeMap.setView(
p,
16
);


}




document.getElementById("startRouteBtn")
.onclick=()=>{

startRoute();

document.getElementById("startRouteBtn")
.style.display="none";


document.getElementById("pauseRouteBtn")
.style.display="block";


document.getElementById("endRouteBtn")
.style.display="block";


};




document.getElementById("pauseRouteBtn")
.onclick=()=>{


pauseRoute();


document.getElementById("pauseRouteBtn")
.innerText =
routePaused ?
"▶ Wznów"
:
"⏸ Pauza";


};




document.getElementById("endRouteBtn")
.onclick=()=>{


endRoute();


document.getElementById("startRouteBtn")
.style.display="block";


document.getElementById("pauseRouteBtn")
.style.display="none";


document.getElementById("endRouteBtn")
.style.display="none";


};





setInterval(()=>{


if(userLat && userLng){

addRoutePoint(
userLat,
userLng
);

}


},15000);
