let map;
let userLat=null;
let userLng=null;
let userMarker=null;

map = L.map("map").setView([52.2,21],15);

L.tileLayer(
"https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
{
attribution:"© OpenStreetMap"
}
).addTo(map);

window.mainMap = map;

// ✅ DODAJ TO
window.userLayer = L.layerGroup().addTo(map);
window.forestLayer = L.layerGroup().addTo(map);
window.routeLayer = L.layerGroup().addTo(map);
