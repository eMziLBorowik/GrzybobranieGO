let mushrooms=JSON.parse(localStorage.getItem("mushrooms")||"[]");
function save(){localStorage.setItem("mushrooms",JSON.stringify(mushrooms));}
navigator.geolocation.watchPosition(pos=>{
userLat=pos.coords.latitude;userLng=pos.coords.longitude;
if(!userMarker){userMarker=L.marker([userLat,userLng]).addTo(map);map.setView([userLat,userLng],16)}else userMarker.setLatLng([userLat,userLng]);
if(!forests.length)loadForests(userLat,userLng);
},()=>document.getElementById("forestStatus").innerText="❌ Brak GPS");
document.getElementById("addMushroomBtn").onclick=()=>{if(!userLat)return;mushrooms.push({lat:userLat,lng:userLng,time:Date.now()});save();L.marker([userLat,userLng],{icon:L.divIcon({html:"🍄"})}).addTo(map);updateStats()};
document.getElementById("tabDex").onclick=()=>{map.getContainer().style.display="none";document.getElementById("grzybdex").style.display="block";updateStats()};
document.getElementById("tabMap").onclick=()=>{map.getContainer().style.display="block";document.getElementById("grzybdex").style.display="none"};
map.on("click",()=>document.getElementById("forestInfoPanel").style.display="none");
function updateStats(){document.getElementById("stats").innerText="🍄 "+mushrooms.length+" znalezisk";document.getElementById("warnings").innerText=mushrooms.length>5?"⚠️ Uważaj na gatunki!":"Brak zagrożeń"}updateStats();
