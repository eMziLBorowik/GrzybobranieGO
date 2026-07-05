let lastForestLat = null;
let lastForestLng = null;
let followGPS = true;
let firstGPS = true;

window.onload = function () {

  // =========================
  // 🔥 MENU
  // =========================

  const menuBtn = document.getElementById("menuBtn");
  const sideMenu = document.getElementById("sideMenu");
  const closeMenu = document.getElementById("closeMenu");

  if (menuBtn) menuBtn.onclick = () => sideMenu.classList.add("active");
  if (closeMenu) closeMenu.onclick = () => sideMenu.classList.remove("active");

  // =========================
  // 🧭 NAV (ROUTER)
  // =========================

  document.getElementById("sideMap")?.addEventListener("click", () => {
    sideMenu.classList.remove("active");
    document.getElementById("centerMapBtn").style.display = "flex";
    window.showScreen("map");
    setTimeout(() => map?.invalidateSize(), 300);
  });

  document.getElementById("sideDex")?.addEventListener("click", () => {
    sideMenu.classList.remove("active");
    document.getElementById("centerMapBtn").style.display = "none";
    window.showScreen("grzybdex");
    updateStats?.();
  });

  document.getElementById("sideTrails")?.addEventListener("click", () => {
    sideMenu.classList.remove("active");
    document.getElementById("centerMapBtn").style.display = "none";
    window.showScreen("trailsPanel");
  });

  document.getElementById("sideSurvival")?.addEventListener("click", () => {
    sideMenu.classList.remove("active");
    document.getElementById("centerMapBtn").style.display = "none";
    window.showScreen("survivalPanel");
  });

  document.getElementById("sideGuide")?.addEventListener("click", () => {
    sideMenu.classList.remove("active");
    document.getElementById("centerMapBtn").style.display = "none";
    window.showScreen("guidePanel");
  });

  document.getElementById("sideProfile")?.addEventListener("click", () => {
    sideMenu.classList.remove("active");
    document.getElementById("centerMapBtn").style.display = "none";
    window.showScreen("profilePanel");
  });

  // =========================
  // 🛰 GPS SYSTEM
  // =========================

  navigator.geolocation.watchPosition(
    (pos) => {

      userLat = pos.coords.latitude;
      userLng = pos.coords.longitude;

      loadWeather?.(userLat, userLng);
      trackMovementEXP?.(userLat, userLng, pos.coords.speed);

      const status = document.getElementById("forestStatus");
      if (status) status.innerText = "📍 GPS OK";

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

      // 🌲 LASY
      if (!lastForestLat || !lastForestLng) {
        lastForestLat = userLat;
        lastForestLng = userLng;
        loadForests(userLat, userLng);

      } else {
        const d = L.latLng(lastForestLat, lastForestLng)
          .distanceTo(L.latLng(userLat, userLng));

        if (d > 1000) {
          lastForestLat = userLat;
          lastForestLng = userLng;
          loadForests(userLat, userLng);
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
  // 🎯 CENTER MAP
  // =========================

  const centerMapBtn = document.getElementById("centerMapBtn");

  if (centerMapBtn) {
    centerMapBtn.onclick = () => {
      if (userLat && userLng) {
        map.setView([userLat, userLng], 16);
      }
    };
  }

  map?.on("dragstart", () => followGPS = false);
};
