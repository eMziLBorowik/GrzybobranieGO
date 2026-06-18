let forests=[];

async function loadForests(lat,lng){
const q=`[out:json];(way["landuse"="forest"](around:5000,${lat},${lng});way["natural"="wood"](around:5000,${lat},lng););out geom;`;
const url="https://overpass-api.de/api/interpreter?data="+encodeURIComponent(q);
const res=await fetch(url);
const data=await res.json();

data.elements.forEach(el=>{
if(!el.geometry)return;
let pts=el.geometry.map(p=>[p.lat,p.lon]);
if(pts.length<3)return;
L.polygon(pts,{color:"green",fillOpacity:.25}).addTo(map);
});
document.getElementById("forestStatus").innerText="🌲 Lasy gotowe";
}
