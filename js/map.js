const map=L.map('map').setView([52.2,21],15);
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',{attribution:'© OSM'}).addTo(map);
let userLat=null,userLng=null,userMarker=null;
