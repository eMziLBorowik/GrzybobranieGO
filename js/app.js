const map=L.map("map").setView([52.2,21],15);
L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",{attribution:"© OSM"}).addTo(map);

let userLat=null,userLng=null,userMarker=null;
let mushrooms=JSON.parse(localStorage.getItem("mushrooms")||"[]");

function save(){localStorage.setItem("mushrooms",JSON.stringify(mushrooms));}

navigator.geolocation.watchPosition(pos=>{
userLat=pos.coords.latitude;
userLng=pos.coords.longitude;
if(!userMarker){
userMarker=L.marker([userLat,userLng]).addTo(map);
map.setView([userLat,userLng],16);
}else userMarker.setLatLng([userLat,userLng]);

if(!forests.length)loadForests(userLat,userLng);
});

document.getElementById("addMushroomBtn").onclick=()=>{
if(!userLat)return;
mushrooms.push({lat:userLat,lng:userLng,time:Date.now()});
save();
L.marker([userLat,userLng],{icon:L.divIcon({html:"🍄"})}).addTo(map);
updateStats();
};

function updateStats(){
document.getElementById("stats").innerText="🍄 "+mushrooms.length+" znalezisk";
document.getElementById("warnings").innerText=mushrooms.length>5?"⚠️ Uważaj":"Brak zagrożeń";
}

document.getElementById('tabDex').onclick=()=>{
document.getElementById('map').style.display='none';
document.getElementById('grzybdex').style.display='block';
updateStats();
};

document.getElementById('tabMap').onclick=()=>{
document.getElementById('map').style.display='block';
document.getElementById('grzybdex').style.display='none';
};

updateStats();
