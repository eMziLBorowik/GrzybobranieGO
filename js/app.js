document.addEventListener("DOMContentLoaded",()=>{


let mapReady=setInterval(()=>{

if(typeof map==="undefined") return;

clearInterval(mapReady);



navigator.geolocation.watchPosition(

(pos)=>{

userLat=pos.coords.latitude;
userLng=pos.coords.longitude;


document.getElementById(
"forestStatus"
).innerText=
"📍 GPS działa";


if(!userMarker){

userMarker=L.marker(
[userLat,userLng]
).addTo(map);


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
"❌ Brak GPS";


console.log(err);


},


{
enableHighAccuracy:true,
maximumAge:0,
timeout:10000
}



);



// ZAKŁADKI


document.getElementById(
"tabDex"
).onclick=()=>{


document.getElementById(
"map"
).style.display="none";


document.getElementById(
"grzybdex"
).style.display="block";


updateStats();


};



document.getElementById(
"tabMap"
).onclick=()=>{


document.getElementById(
"map"
).style.display="block";


document.getElementById(
"grzybdex"
).style.display="none";


map.invalidateSize();


};



}


},100);



});
