let lastForestLat = null;
let lastForestLng = null;
let followGPS = true;
let firstGPS = true;


window.onload=function(){



// GPS
navigator.geolocation.watchPosition(

(pos)=>{

userLat = pos.coords.latitude;
userLng = pos.coords.longitude;

document.getElementById("forestStatus").innerText = "📍 GPS OK";


// MARKER GŁÓWNEJ MAPY

if(!userMarker){

userMarker = L.marker(
[userLat, userLng]
).addTo(map);


// 🧭 CENTRUJ PRZY PIERWSZYM GPS

if(firstGPS){

map.setView(
[userLat,userLng],
16
);

firstGPS = false;

}


}else{

userMarker.setLatLng(
[userLat, userLng]
);


// 🧭 PODĄŻANIE ZA GPS

if(
followGPS &&
document.getElementById("map").style.display !== "none"
){

map.setView(
[userLat,userLng],
16,
{
animate:true
}
);

}

}


// MARKER MAPY TRASY

if(routeMap){

if(!window.routeGpsMarker){

window.routeGpsMarker = L.marker(
[userLat, userLng],
{
icon:L.divIcon({
className:"gpsMarker",
html:"📍",
iconSize:[45,45],
iconAnchor:[22,45]
})
}
).addTo(routeMap);


}else{

window.routeGpsMarker.setLatLng(
[userLat, userLng]
);

}

}


// 🔥 WAŻNE: NIE RUSZAJ MAPY

// 🔥 AKTUALIZACJA LASÓW WG GPS

if(
lastForestLat === null ||
lastForestLng === null
){

lastForestLat = userLat;
lastForestLng = userLng;

loadForests(
userLat,
userLng
);

}
else{

let distance =
L.latLng(
lastForestLat,
lastForestLng
)
.distanceTo(
L.latLng(
userLat,
userLng
)
);


if(distance > 1000){

lastForestLat = userLat;
lastForestLng = userLng;

loadForests(
userLat,
userLng
);

}

}

},

(err)=>{

document.getElementById("forestStatus").innerText =
"❌ GPS błąd";

},

{
enableHighAccuracy:true,
timeout:15000,
maximumAge:0
}

);


// zakładka mapa


document.getElementById(
"tabMap"
).onclick=function(){



document.getElementById(
"centerMapBtn"
).style.display="flex";



document.getElementById(
"map"
).style.display="block";



document.getElementById(
"grzybdex"
).style.display="none";



document.getElementById(
"trailsPanel"
).style.display="none";

  

document.getElementById(
"survivalPanel"
).style.display="none";

  
setTimeout(()=>{

map.invalidateSize();

},300);



};





// zakładka grzybdex


document.getElementById(
"tabDex"
).onclick=function(){



document.getElementById(
"centerMapBtn"
).style.display="none";



document.getElementById(
"forestInfoPanel"
).style.display="none";



document.getElementById(
"map"
).style.display="none";



document.getElementById(
"grzybdex"
).style.display="block";



document.getElementById(
"trailsPanel"
).style.display="none";



updateStats();



};





// zakładka trasy

const tabTrails = document.getElementById("tabTrails");
const trailsPanel = document.getElementById("trailsPanel");

if (tabTrails) {

  tabTrails.onclick = function () {

    document.getElementById("centerMapBtn").style.display = "none";
    document.getElementById("map").style.display = "none";
    document.getElementById("grzybdex").style.display = "none";

    trailsPanel.style.display = "block";

    // 🔥 FIX: czekamy aż DOM i CSS faktycznie się przerysują
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {

        if (!routeMap) {
          initRouteMap();
        }

        // 🔥 ważne: po init też trzeba dać czas Leafletowi
        setTimeout(() => {

          if (routeMap) {
            routeMap.invalidateSize(true);
          }

          // 🔥 ustaw widok bez crashy
          if (userLat != null && userLng != null) {
            routeMap.setView([userLat, userLng], 16, {
              animate: false
            });
          } else {
            routeMap.setView([52, 19], 6, {
              animate: false
            });
          }

        }, 100);

      });
    });

  };
  
// 🔥 ZAKŁADKA SURVIVAL

const tabSurvival = document.getElementById("tabSurvival");
const survivalPanel = document.getElementById("survivalPanel");


if(tabSurvival && survivalPanel){

tabSurvival.onclick = function(){


document.getElementById("centerMapBtn").style.display="none";

document.getElementById("map").style.display="none";

document.getElementById("grzybdex").style.display="none";

document.getElementById("trailsPanel").style.display="none";

document.getElementById("forestInfoPanel").style.display="none";


// pokaż Survival

survivalPanel.style.display="block";


// uruchom survival.js

if(typeof loadSurvival === "function"){

loadSurvival();

}


};

}
}

// 🎯 WYŚRODKOWANIE MAPY


const centerMapBtn =
document.getElementById(
"centerMapBtn"
);



if(centerMapBtn){



centerMapBtn.onclick=function(){



if(userLat && userLng){



map.setView(

[userLat,userLng],

16,

{

animate:true

}

);



}



};



}





};

map.on("dragstart",()=>{
    followGPS = false;
});


function initRouteMap() {

  if (routeMap) return;

  const el = document.getElementById("map");

  if (!el) return;

  routeMap = L.map("map").setView([52, 19], 6);

  L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
    attribution: "© OpenStreetMap"
  }).addTo(routeMap);

}
