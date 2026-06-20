window.onload=function(){



// GPS


if(!navigator.geolocation){


document.getElementById(
"forestStatus"
).innerText=
"❌ Brak GPS";


return;

}



navigator.geolocation.watchPosition(



(pos)=>{



userLat=pos.coords.latitude;

userLng=pos.coords.longitude;



document.getElementById(
"forestStatus"
).innerText=
"📍 GPS OK";




if(!userMarker){


userMarker=L.marker(
[userLat,userLng]
)
.addTo(map);



map.setView(
[userLat,userLng],
16
);



}else{


userMarker.setLatLng(
[userLat,userLng]
);



}



if(forests.length===0){


loadForests(
userLat,
userLng
);



}



},



(err)=>{


document.getElementById(
"forestStatus"
).innerText=
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
"map"
).style.display="block";



document.getElementById(
"grzybdex"
).style.display="none";



setTimeout(()=>{

map.invalidateSize();

},300);



};





// zakładka grzybdex


document.getElementById(
"tabDex"
).onclick=function(){



// chowamy informacje o lesie
document.getElementById(
"forestInfoPanel"
).style.display="none";



document.getElementById(
"map"
).style.display="none";



document.getElementById(
"grzybdex"
).style.display="block";



updateStats();



};

const tabTrails = document.getElementById("tabTrails");
const trailsPanel = document.getElementById("trailsPanel");

tabTrails.onclick = () => {

    document.getElementById("map").style.display = "none";

    document.getElementById("grzybdex").style.display = "none";

    trailsPanel.style.display = "block";
};

document.getElementById("tabMap").onclick = () => {

    document.getElementById("map").style.display = "block";

    document.getElementById("grzybdex").style.display = "none";

    trailsPanel.style.display = "none";
};

document.getElementById("tabDex").onclick = () => {

    document.getElementById("map").style.display = "none";

    document.getElementById("grzybdex").style.display = "block";

    trailsPanel.style.display = "none";
};


};
