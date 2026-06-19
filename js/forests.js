let forests = [];

// ⏳ COOLDOWN (NAPRAWA 429)
let lastForestRequest = 0;


async function loadForests(lat, lng){

const now = Date.now();

if(now - lastForestRequest < 15000){

console.log("⏳ cooldown forests API");

return;

}

lastForestRequest = now;



const q = `

[out:json];

(

way["landuse"="forest"](around:15000,${lat},${lng});

way["natural"="wood"](around:15000,${lat},${lng});

way["leisure"="park"](around:15000,${lat},${lng});

relation["boundary"="protected_area"](around:15000,${lat},${lng});

relation["protect_class"](around:15000,${lat},${lng});

relation["name"~"Park Krajobrazowy"](around:15000,${lat},${lng});

);

out geom;

>;

out geom;

`;



const url =
"https://overpass-api.de/api/interpreter?data=" +
encodeURIComponent(q);



try{


const res = await fetch(url);



if(res.status === 429){

console.warn("⚠️ Overpass limit - retry za 10s");


setTimeout(()=>{

loadForests(lat,lng);

},10000);


return;

}



const text = await res.text();



if(!text.startsWith("{")){


console.error(
"❌ Overpass error response:",
text
);



document.getElementById(
"forestStatus"
).innerText =
"❌ Błąd lasów (API)";



return;

}



const data = JSON.parse(text);



data.elements.forEach(el=>{


if(!el.geometry)
return;



const pts =
el.geometry.map(
p=>[p.lat,p.lon]
);



if(pts.length < 3)
return;




let poly =
L.polygon(
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


showForestInfo(
el,
pts
);



});



});



document.getElementById(
"forestStatus"
).innerText =
"🌲 Lasy i parki gotowe";



}



catch(e){


console.log(e);


document.getElementById(
"forestStatus"
).innerText =
"❌ Błąd lasów";


}



}







async function showForestInfo(el,pts){



let panel =
document.getElementById(
"forestInfoPanel"
);



panel.style.display="block";



// 🌲 NAZWA LASU / PARKU

let name =
"🌲 Teren zielony";



if(el.tags){


if(el.tags.name){

name =
"🌲 " + el.tags.name;

}


else if(el.tags.official_name){

name =
"🌲 " + el.tags.official_name;

}


else if(el.tags.short_name){

name =
"🌲 " + el.tags.short_name;

}


}



document.getElementById(
"forestName"
).innerText =
name;



document.getElementById(
"forestRain"
).innerText =
"🌧️ Sprawdzanie...";



document.getElementById(
"forestChance"
).innerText =
"🍄 Liczenie...";





let lat = pts[0][0];

let lng = pts[0][1];




try{


let r =
await fetch(

`https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lng}&daily=precipitation_sum,temperature_2m_max&past_days=7&timezone=auto`

);



let d =
await r.json();





// 🌧️ OPADY

let rain =
(d.daily.precipitation_sum || [])

.reduce(
(a,b)=>a+(b||0),
0
);





// 🌡️ TEMPERATURA

let temp =
(d.daily.temperature_2m_max || [])

.reduce(
(a,b)=>a+b,
0
)
/
(d.daily.temperature_2m_max.length || 1);





// 🍄 SZANSA

let chance = 30;




// deszcz

if(rain > 40){

chance += 40;

}

else if(rain > 20){

chance += 25;

}

else if(rain < 10){

chance -= 25;

}





// SUSZA

if(rain < 5){

chance -= 20;

}





// 🌱 PORA ROKU

let month =
new Date().getMonth()+1;



// najlepszy sezon

if(month===9 || month===10){

chance += 25;

}


// lato

if(month===7 || month===8){

chance -= 10;

}


// zima

if(
month===12 ||
month===1 ||
month===2
){

chance -= 20;

}




// temperatura

if(temp < 5){

chance -= 10;

}


if(temp > 28){

chance -= 15;

}





// ograniczenie

if(chance > 95){

chance = 95;

}


if(chance < 5){

chance = 5;

}





document.getElementById(
"forestRain"
).innerText =
"🌧️ Opady: " +
rain.toFixed(1) +
" mm";




document.getElementById(
"forestChance"
).innerText =
"🍄 Szansa: " +
chance +
"%";



}



catch(e){


document.getElementById(
"forestRain"
).innerText =
"🌧️ Brak danych";


}



}







// 🔥 ZAMYKANIE INFORMACJI O LESIE

document.addEventListener(
"click",
(e)=>{


const panel =
document.getElementById(
"forestInfoPanel"
);



if(!panel)
return;



if(panel.contains(e.target))
return;



if(
e.target.closest(".leaflet-interactive")
)
return;



panel.style.display="none";



});






map.on("click",()=>{


document.getElementById(
"forestInfoPanel"
).style.display="none";


});
