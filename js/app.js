navigator.geolocation.watchPosition(pos=>{userLat=pos.coords.latitude;userLng=pos.coords.longitude;if(!userMarker){userMarker=L.marker([userLat,userLng]).addTo(map);map.setView([userLat,userLng],16)}else userMarker.setLatLng([userLat,userLng])});
document.getElementById('tabDex').onclick=()=>{map.getContainer().style.display='none';document.getElementById('grzybdex').style.display='block';updateStats()};
document.getElementById('tabMap').onclick=()=>{map.getContainer().style.display='block';document.getElementById('grzybdex').style.display='none'};
