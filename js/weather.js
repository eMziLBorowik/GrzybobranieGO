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

    // 🎯 DOM (DOPASOWANE DO TWOJEGO INDEX.HTML)
    const tempEl = document.getElementById("temp");
    const humEl = document.getElementById("humidity");
    const windEl = document.getElementById("wind");

    // 🧠 zabezpieczenie
    if (!tempEl || !humEl || !windEl) {
      console.warn("❌ Brak elementów pogody w HTML (temp/humidity/wind)");
      return;
    }

    // 🌤️ render
    tempEl.innerText = data.current.temperature_2m + " °C";
    humEl.innerText = data.current.relative_humidity_2m + " %";
    windEl.innerText = data.current.wind_speed_10m + " km/h";

  } catch (e) {
    console.log("❌ Pogoda błąd", e);
  }
}
