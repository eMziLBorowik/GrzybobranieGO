let forests=[];



async function loadForests(lat,lng){


const q=`

[out:json];


(

/* zwykłe lasy */

way["landuse"="forest"](around:15000,${lat},${lng});

way["natural"="wood"](around:15000,${lat},${lng});



/* parki krajobrazowe i obszary chronione */

relation["boundary"="protected_area"](around:15000,${lat},${lng});


relation["protect_class"](around:15000,${lat},${lng});



/* parki i większe tereny zielone */

way["leisure"="park"](around:15000,${lat},${lng});


way["boundary"="protected_area"](around:15000,${lat},${lng});


);


out geom;

`;



const url =
"https://overpass-api.de/api/interpreter?data="
+
encodeURIComponent(q);



try{


const res=await fetch(url);


const data=await res.json();



data.elements.forEach(el=>{


if(!el.geometry)return;



const pts =
el.geometry.map(
p=>[p.lat,p.lon]
);



if(pts.length<3)return;



let poly=L.polygon(

pts,

{


color:"#2e8b57",


fillColor:"#3cb371",


fillOpacity:0.25,


weight:2


}

).addTo(map);




forests.push(poly);




poly.on("click",(e)=>{


L.DomEvent.stopPropagation(e);


showForestInfo(el,pts);



});



});



document.getElementById(
"forestStatus"
).innerText=
"🌲 Lasy i tereny zielone gotowe";



}

catch(e){


console.log(
"Błąd pobierania terenów:",
e
);


document.getElementById(
"forestStatus"
).innerText=
"❌ Błąd lasów";


}



}





async function showForestInfo(el,pts){



let panel =
document.getElementById(
"forestInfoPanel"
);



panel.style.display="block";



let name="🌲 Teren leśny";



if(el.tags?.name){

name="🌲 "+el.tags.name;


}



document.getElementById(
"forestName"
).innerText=name;



document.getElementById(
"forestRain"
).innerText=
"🌧️ Sprawdzanie...";


document.getElementById(
"forestChance"
).innerText=
"🍄 Liczenie...";



let lat=pts[0][0];

let lng=pts[0][1];



try{


let r=await fetch(

`https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lng}&daily=precipitation_sum&past_days=7&timezone=auto`

);



let d=await r.json();



let rain =
(d.daily.precipitation_sum||[])
.reduce(
(a,b)=>a+(b||0),
0
);



let chance=20;



if(rain>30)
chance=75;

else if(rain>15)
chance=50;



document.getElementById(
"forestRain"
).innerText=
"🌧️ Opady: "+
rain.toFixed(1)+
" mm";



document.getElementById(
"forestChance"
).innerText=
"🍄 Szansa: "+
chance+
"%";



}

catch(e){



document.getElementById(
"forestRain"
).innerText=
"🌧️ Brak danych";


}




}




map.on(
"click",
()=>{


document.getElementById(
"forestInfoPanel"
).style.display="none";


});
