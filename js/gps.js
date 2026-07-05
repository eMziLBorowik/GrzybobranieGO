// =========================
// 🛰 GPS MODULE
// =========================

let lastForestLat = null;
let lastForestLng = null;

let followGPS = true;
let firstGPS = true;

window.userLat = null;
window.userLng = null;

function initGPS(mapInstance) {

  if (!navigator.geolocation) return;

  navigator.geolocation.watchPosition(
    (pos) => {

      window.userLat = pos.coords.latitude;
      window.userLng = pos.coords.longitude;

      // 🌤 weather
      loadWeather?.(userLat, userLng);

      // 📈 EXP
      trackMovementEXP?.(userLat, userLng, pos.coords.speed);

      const status = document.getElementById("forestStatus");
      if (status) status.innerText = "📍 GPS OK";

      // 🧍 marker
      if (!window.userMarker) {

        window.userMarker = L.marker([userLat, userLng]).addTo(mapInstance);

        if (firstGPS) {
          mapInstance.setView([userLat, userLng], 16);
          firstGPS = false;
        }

      } else {

        window.userMarker.setLatLng([userLat, userLng]);

        if (followGPS && document.body.classList.contains("screen-map")) {
          mapInstance.setView([userLat, userLng], 16);
        }
      }

      // 🌲 FORESTS TRIGGER
      if (!lastForestLat || !lastForestLng) {

        lastForestLat = userLat;
        lastForestLng = userLng;

        loadForests?.(userLat, userLng);

      } else {

        const d = L.latLng(lastForestLat, lastForestLng)
          .distanceTo(L.latLng(userLat, userLng));

        if (d > 1000) {
          lastForestLat = userLat;
          lastForestLng = userLng;
          loadForests?.(userLat, userLng);
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

  // 🧭 center button
  document.getElementById("centerMapBtn")?.addEventListener("click", () => {
    if (window.userLat && window.userLng && mapInstance) {
      mapInstance.setView([window.userLat, window.userLng], 16);
    }
  });

  mapInstance.on("dragstart", () => followGPS = false);
}

window.initGPS = initGPS;