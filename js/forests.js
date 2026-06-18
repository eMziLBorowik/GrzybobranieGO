let forests=[];
async function loadForests(lat,lng){
const q=`[out:json];(way["landuse"="forest"](around:5000,${lat},${lng});way["natural"="wood"](around:5000,${lat},lng);relation["landuse"="forest"](around:5000,${lat},lng););out geom;`;
const url="https://overpass-api.de/api/interpreter?data="+encodeURIComponent(q);
try{
const data=await (await fetch(url)).json();
data.elements.forEach(el=>{
if(!el.geometry)return;
const pts=el.geometry.map(p=>[p.lat,p.lon]); if(pts.length<3)return;
const poly=L.polygon(pts,{color:"green",fillOpacity:.25}).addTo(map);
poly.on("click",e=>{L.DomEvent.stopPropagation(e);showForest(el,pts);});
try{forests.push(turf.polygon([pts.map(p=>[p[1],p[0]])]));}catch(e){}
});
document.getElementById("forestStatus").innerText="🌲 Lasy gotowe";
}catch(e){document.getElementById("forestStatus").innerText="❌ Błąd lasów";}
}
