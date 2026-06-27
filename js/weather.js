let lastWeatherUpdate = 0;
const WEATHER_COOLDOWN = 10 * 60 * 1000; // 10 minut

async function loadWeather(lat, lng) {
  const now = Date.now();

  // ⏳ cooldown
  if (now - lastWeatherUpdate < WEATHER_COOLDOWN) {
    console.log("⏳ Pogoda w cooldownie (10 min)");
    return;
  }

  lastWeatherUpdate = now;

  try {
    const res = await fetch(
      `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lng}&current=temperature_2m,relative_humidity_2m,wind_speed_10m&timezone=auto`
    );

    const data = await res.json();

    console.log("🌤️ Pogoda załadowana", data.current);

    const tempEl = document.getElementById("weatherTemp");
    const humEl = document.getElementById("weatherHumidity");
    const windEl = document.getElementById("weatherWind");

    if (!tempEl || !humEl || !windEl) {
      console.warn("❌ Brak elementów pogody w HTML");
      return;
    }

    tempEl.innerText = data.current.temperature_2m + " °C";
    humEl.innerText = data.current.relative_humidity_2m + " %";
    windEl.innerText = data.current.wind_speed_10m + " km/h";

  } catch (e) {
    console.log("❌ Pogoda błąd", e);
  }
}
