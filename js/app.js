window.onload=function(){



// GPS
navigator.geolocation.watchPosition(

(pos)=>{

userLat = pos.coords.latitude;
userLng = pos.coords.longitude;

document.getElementById("forestStatus").innerText = "📍 GPS OK";

if(!userMarker){
userMarker = L.marker([userLat, userLng]).addTo(map);
}else{
userMarker.setLatLng([userLat, userLng]);
}

// 🔥 WAŻNE: NIE RUSZAJ MAPY

if(routeMarker){
  routeMarker.setLatLng([userLat, userLng]);
}

if(forests.length === 0){
loadForests(userLat, userLng);
}

},

(err)=>{
document.getElementById("forestStatus").innerText = "❌ GPS błąd";
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


const tabTrails =
document.getElementById("tabTrails");


const trailsPanel =
document.getElementById("trailsPanel");



if(tabTrails){


tabTrails.onclick = () => {



document.getElementById(
"centerMapBtn"
).style.display="none";



document.getElementById(
"map"
).style.display="none";


document.getElementById(
"grzybdex"
).style.display="none";


trailsPanel.style.display="block";


};


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
