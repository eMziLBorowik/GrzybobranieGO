let forests=[];


async function loadForests(lat,lng){


const q=`

[out:json];

(
way["landuse"="forest"](around:5000,${lat},${lng});

way["natural"="wood"](around:5000,${lat},${lng});

relation["landuse"="forest"](around:5000,${lat},${lng});

);

out geom;

`;



const url=
"https://overpass-api.de/api/interpreter?data="
+encodeURIComponent(q);



const res=await fetch(url);

const data=await res.json();



data.elements.forEach(el=>{


if(!el.geometry)return;


const pts=el.geometry.map(
p=>[p.lat,p.lon]
);


if(pts.length<3)return;



let poly=L.polygon(
pts,
{
color:"green",
fillOpacity:0.25
}

).addTo(map);



forests.push(poly);




poly.on("click",(e)=>{


// blokuje klik mapy

L.DomEvent.stopPropagation(e);



showForestInfo(el,pts);



});



});



document.getElementById(
"forestStatus"
).innerText="🌲 Lasy gotowe";



}




async function showForestInfo(el,pts){



let panel=document.getElementById(
"forestInfoPanel"
);



panel.style.display="block";



let name="🌲 Las bez nazwy";



if(el.tags && el.tags.name){

name="🌲 "+el.tags.name;

}



document.getElementById(
"forestName"
).innerText=name;



document.getElementById(
"forestRain"
).innerText="🌧️ Sprawdzanie...";


document.getElementById(
"forestChance"
).innerText="🍄 Liczenie...";




let lat=pts[0][0];

let lng=pts[0][1];



try{


let r=await fetch(
`https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lng}&daily=precipitation_sum&past_days=7&timezone=auto`
);


let d=await r.json();



let rain=
(d.daily.precipitation_sum||[])
.reduce(
(a,b)=>a+(b||0),
0
);



document.getElementById(
"forestRain"
).innerText=
"🌧️ Opady: "+
rain.toFixed(1)+
" mm";



let chance=20;


if(rain>30)chance=70;

else if(rain>15)chance=50;



document.getElementById(
"forestChance"
).innerText=
"🍄 Szansa: "+
chance+
"%";



}catch(e){


document.getElementById(
"forestRain"
).innerText=
"🌧️ Brak danych";


}




}



// klik poza lasem zamyka panel


map.on("click",()=>{


document.getElementById(
"forestInfoPanel"
).style.display="none";


});
