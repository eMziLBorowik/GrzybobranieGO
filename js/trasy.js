let tracking = false;

let paused = false;

let routePoints = [];

let routeLine = null;

let routeStartTime = null;

let routeTimer = null;

let totalDistance = 0;

let watchRoute = null;



document.addEventListener("DOMContentLoaded",()=>{


const startBtn =
document.getElementById("startRoute");


const pauseBtn =
document.getElementById("pauseRoute");


const stopBtn =
document.getElementById("stopRoute");



if(!startBtn)
return;



startBtn.onclick = ()=>{


if(tracking)
return;



tracking=true;

paused=false;


routePoints=[];

totalDistance=0;


routeStartTime =
Date.now();



document.getElementById(
"routeStatus"
).innerText =
"🟢 Trasa aktywna";



routeLine =
L.polyline([],{

color:"#ffcc00",

weight:5

}).addTo(map);



startRouteGPS();



routeTimer=setInterval(()=>{


let sec =
Math.floor(
(Date.now()-routeStartTime)/1000
);


document.getElementById(
"routeTime"
).innerText =
"⏱️ Czas: "+formatTime(sec);



document.getElementById(
"routeDistance"
).innerText =
"📍 Dystans: "+
(totalDistance/1000).toFixed(2)
+" km";



},1000);



};






pauseBtn.onclick=()=>{


if(!tracking)
return;


paused=!paused;



if(paused){


pauseBtn.innerText="▶️ Wznów";


document.getElementById(
"routeStatus"
).innerText =
"⏸️ Pauza";


}else{


pauseBtn.innerText="⏸️ Pauza";


document.getElementById(
"routeStatus"
).innerText =
"🟢 Trasa aktywna";


}



};








stopBtn.onclick=()=>{


tracking=false;

paused=false;



if(watchRoute){

navigator.geolocation.clearWatch(
watchRoute
);

}



document.getElementById(
"routeStatus"
).innerText =
"🏁 Trasa zakończona";



};





});







function startRouteGPS(){


watchRoute =
navigator.geolocation.watchPosition(


(pos)=>{


if(!tracking || paused)
return;



let lat =
pos.coords.latitude;


let lng =
pos.coords.longitude;



let point =
[lat,lng];




if(routePoints.length){


let last =
routePoints[
routePoints.length-1
];


totalDistance +=
distance(
last[0],
last[1],
lat,
lng
);



}




routePoints.push(point);



routeLine.setLatLngs(
routePoints
);



map.panTo(point);



},



(err)=>{


console.log(
"GPS trasa error",
err
);


},


{


enableHighAccuracy:true,

maximumAge:0,

timeout:15000


}



);



}








function distance(lat1,lon1,lat2,lon2){


const R=6371000;


const dLat =
(lat2-lat1)
*Math.PI/180;


const dLon =
(lon2-lon1)
*Math.PI/180;


const a =
Math.sin(dLat/2)*
Math.sin(dLat/2)+

Math.cos(lat1*Math.PI/180)*
Math.cos(lat2*Math.PI/180)*

Math.sin(dLon/2)*
Math.sin(dLon/2);



return R *
2 *
Math.atan2(
Math.sqrt(a),
Math.sqrt(1-a)
);


}






function formatTime(sec){


let h =
Math.floor(sec/3600);


let m =
Math.floor(
(sec%3600)/60
);


let s =
sec%60;



return (

h<10?"0":""
)+h+":"+

(m<10?"0":""
)+m+":"+

(s<10?"0":""
)+s;


}