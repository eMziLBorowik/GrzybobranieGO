let lastForestLat = null;
let lastForestLng = null;
let followGPS = true;
let firstGPS = true;

window.onload = function () {

  // =========================
  // 🗺 INIT MAP FIRST (KLUCZ)
  // =========================
  if (typeof initMap === "function") {
    initMap();
  }

  // =========================
  // 🔥 MENU
  // =========================

  const menuBtn = document.getElementById("menuBtn");
  const sideMenu = document.getElementById("sideMenu");
  const closeMenu = document.getElementById("closeMenu");

  menuBtn?.addEventListener("click", () => sideMenu.classList.add("active"));
  closeMenu?.addEventListener("click", () => sideMenu.classList.remove("active"));

  // =========================
  // 🧭 ROUTER NAV
  // =========================

  document.getElementById("sideMap")?.addEventListener("click", () => {
    sideMenu.classList.remove("active");

    document.getElementById("centerMapBtn").style.display = "flex";

    window.showScreen?.("map");

    setTimeout(() => {
      map?.invalidateSize(true);
    }, 300);
  });

  document.getElementById("sideDex")?.addEventListener("click", () => {
    sideMenu.classList.remove("active");
    document.getElementById("centerMapBtn").style.display = "none";
    window.showScreen?.("grzybdex");
    updateStats?.();
  });

  document.getElementById("sideTrails")?.addEventListener("click", () => {
    sideMenu.classList.remove("active");
    document.getElementById("centerMapBtn").style.display = "none";
    window.showScreen?.("trailsPanel");
  });

  document.getElementById("sideSurvival")?.addEventListener("click", () => {
    sideMenu.classList.remove("active");
    document.getElementById("centerMapBtn").style.display = "none";
    window.showScreen?.("survivalPanel");
  });

  document.getElementById("sideGuide")?.addEventListener("click", () => {
    sideMenu.classList.remove("active");
    document.getElementById("centerMapBtn").style.display = "none";
    window.showScreen?.("guidePanel");
  });

  document.getElementById("sideProfile")?.addEventListener("click", () => {
    sideMenu.classList.remove("active");
    document.getElementById("centerMapBtn").style.display = "none";
    window.showScreen?.("profilePanel");
  });

  // =========================
  // 🛰 GPS
  // =========================

  if (navigator.geolocation) {

    navigator.geolocation.watchPosition(
      (pos) => {

        userLat = pos.coords.latitude;
        userLng = pos.coords.longitude;

        loadWeather?.(userLat, userLng);
        trackMovementEXP?.(userLat, userLng, pos.coords.speed);

        const status = document.getElementById("forestStatus");
        if (status) status.innerText = "📍 GPS OK";

        // 🔥 MAP SAFETY CHECK
        if (typeof map === "undefined" || !map) return;

        // marker
        if (!userMarker) {
          userMarker = L.marker([userLat, userLng]).addTo(map);

          if (firstGPS) {
            map.setView([userLat, userLng], 16);
            firstGPS = false;
          }
        } else {
          userMarker.setLatLng([userLat, userLng]);

          if (followGPS && document.body.classList.contains("screen-map")) {
            map.setView([userLat, userLng], 16);
          }
        }

        // 🌲 FORESTS
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
  }

  // =========================
  // 🎯 CENTER BUTTON
  // =========================

  document.getElementById("centerMapBtn")?.addEventListener("click", () => {
    if (userLat && userLng && map) {
      map.setView([userLat, userLng], 16);
    }
  });

  // =========================
  // 🧭 STOP FOLLOW ON DRAG
  // =========================

  map?.on("dragstart", () => followGPS = false);
};
