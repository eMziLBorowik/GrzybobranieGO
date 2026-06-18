window.onload=function(){


document.getElementById("tabDex").onclick=function(){

document.getElementById("map").style.display="none";

document.getElementById("grzybdex").style.display="block";

updateStats();

};



document.getElementById("tabMap").onclick=function(){

document.getElementById("map").style.display="block";

document.getElementById("grzybdex").style.display="none";

setTimeout(()=>{

map.invalidateSize();

},200);

};




if(!navigator.geolocation){

document.getElementById("forestStatus").innerHTML="❌ Brak GPS";

return;

}



navigator.geolocation.watchPosition(

function(pos){


userLat=pos.coords.latitude;

userLng=pos.coords.longitude;


document.getElementById("forestStatus").innerHTML=
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



if(typeof loadForests==="function"){

if(forests.length===0){

loadForests(
userLat,
userLng
);

}

}



},


function(error){


document.getElementById("forestStatus").innerHTML=
"❌ GPS zablokowany";


console.log(error);


},


{
enableHighAccuracy:true,
timeout:15000,
maximumAge:0
}


);



};
