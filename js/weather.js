async function loadWeather(lat,lng){


try{


const res = await fetch(

`https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lng}&current=temperature_2m,relative_humidity_2m,wind_speed_10m&timezone=auto`

);


const data = await res.json();


console.log("🌤️ Pogoda załadowana",data.current);



document.getElementById("weatherTemp").innerText =
data.current.temperature_2m + " °C";


document.getElementById("weatherHumidity").innerText =
data.current.relative_humidity_2m + " %";


document.getElementById("weatherWind").innerText =
data.current.wind_speed_10m + " km/h";



}

catch(e){

console.log("❌ Pogoda błąd",e);

}


}
