// =========================
// 🛰 GPS MODULE (FIXED STATE)
// =========================

let followGPS = true;
let firstGPS = true;

let lastForestLat = null;
let lastForestLng = null;

function initGPS(mapInstance) {

  if (!navigator.geolocation) return;

  window.GAME = window.GAME || {};
  window.GAME.map = mapInstance;

  navigator.geolocation.watchPosition(
    (pos) => {

      // =========================
      // 🌍 GLOBAL SYNC (KLUCZ FIX)
      // =========================
      const lat = pos.coords.latitude;
      const lng = pos.coords.longitude;

      window.GAME.userLat = lat;
      window.GAME.userLng = lng;

      // 🔥 FIX DLA RESZTY APP
      window.userLat = lat;
      window.userLng = lng;

      // =========================
      // 🌤 WEATHER
      // =========================
      loadWeather?.(lat, lng);

      // =========================
      // 📈 EXP
      // =========================
      trackMovementEXP?.(lat, lng, pos.coords.speed);

      // =========================
      // 📡 STATUS UI
      // =========================
      const status = document.getElementById("forestStatus");
      if (status) status.innerText = "📍 GPS OK";

      // =========================
      // 👤 MARKER
      // =========================
      if (!window.GAME.userMarker) {

        window.GAME.userMarker = L.marker([lat, lng]).addTo(mapInstance);

        if (firstGPS) {
          mapInstance.setView([lat, lng], 16);
          firstGPS = false;
        }

      } else {

        window.GAME.userMarker.setLatLng([lat, lng]);

        if (followGPS && document.body.classList.contains("screen-map")) {
          mapInstance.setView([lat, lng], 16);
        }
      }

      // =========================
      // 🌲 FORESTS TRIGGER
      // =========================
      if (!lastForestLat || !lastForestLng) {

        lastForestLat = lat;
        lastForestLng = lng;
        loadForests?.(lat, lng);

      } else {

        const d = L.latLng(lastForestLat, lastForestLng)
          .distanceTo(L.latLng(lat, lng));

        if (d > 1000) {
          lastForestLat = lat;
          lastForestLng = lng;
          loadForests?.(lat, lng);
        }
      }

    },
    () => {
      const status = document.getElementById("forestStatus");
      if (status) status.innerText = "❌ GPS błąd";
    },
    {
      enableHighAccuracy: true,
      timeout: 15000,
      maximumAge: 0
    }
  );

  // =========================
  // 🎯 CENTER BUTTON
  // =========================
  document.getElementById("centerMapBtn")?.addEventListener("click", () => {

    const lat = window.userLat;
    const lng = window.userLng;

    if (lat && lng && mapInstance) {
      mapInstance.setView([lat, lng], 16);
    }
  });

  // =========================
  // 🧭 STOP FOLLOW
  // =========================
  mapInstance.on("dragstart", () => {
    followGPS = false;
  });
}

window.initGPS = initGPS;
