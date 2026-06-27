// 🌤️ WEATHER SYSTEM


async function loadWeather(lat,lng){


try{


const res = await fetch(

`https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lng}&current=temperature_2m,relative_humidity_2m,wind_speed_10m,precipitation&timezone=auto`

);



const data = await res.json();



if(!data.current){

console.log("Brak danych pogody");

return;

}



const weather = data.current;



// 🌡️ temperatura

document.getElementById("weatherTemp").innerText =

Math.round(weather.temperature_2m)+"°C";



// 💧 wilgotność

document.getElementById("weatherHumidity").innerText =

weather.relative_humidity_2m+"%";



// 💨 wiatr

document.getElementById("weatherWind").innerText =

Math.round(weather.wind_speed_10m)+" km/h";



// 🌧️ opady

document.getElementById("weatherRain").innerText =

weather.precipitation+" mm";



console.log(
"🌤️ Pogoda załadowana",
weather
);



}


catch(e){


console.log(
"❌ Błąd pogody",
e
);


}



}