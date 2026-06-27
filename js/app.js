let lastForestLat = null;
let lastForestLng = null;
let followGPS = true;
let firstGPS = true;

window.onload = function () {

  // =========================
  // 🔥 UI SYSTEM
  // =========================

  function showScreen(screen) {

    const mapEl = document.getElementById("map");
    const grzyd = document.getElementById("grzybdex");
    const trails = document.getElementById("trailsPanel");
    const surv = document.getElementById("survivalPanel");
    const guide = document.getElementById("guidePanel");

    if (mapEl) mapEl.style.display = "none";
    if (grzyd) grzyd.style.display = "none";
    if (trails) trails.style.display = "none";
    if (surv) surv.style.display = "none";
    if (guide) guide.style.display = "none";

    document.body.classList.remove("screen-map");

    if (screen === "map") {
      if (mapEl) mapEl.style.display = "block";
      document.body.classList.add("screen-map");
    }

    if (screen === "grzybdex") {
      if (grzyd) grzyd.style.display = "block";
    }

    if (screen === "trailsPanel") {
      if (trails) trails.style.display = "block";
    }

    if (screen === "survivalPanel") {
      if (surv) surv.style.display = "block";

      // 🔥 KLUCZ: render survival
      if (typeof openSurvival === "function") {
        openSurvival();
      }
    }

    if (screen === "guidePanel") {
      if (guide) guide.style.display = "block";

      // 🔥 KLUCZ: render guide
      if (typeof loadGuide === "function") {
        loadGuide();
      }
    }
  }

  // =========================
  // ☰ MENU
  // =========================

  const menuBtn = document.getElementById("menuBtn");
  const sideMenu = document.getElementById("sideMenu");
  const closeMenu = document.getElementById("closeMenu");

  if (menuBtn) menuBtn.onclick = () => sideMenu.classList.add("active");
  if (closeMenu) closeMenu.onclick = () => sideMenu.classList.remove("active");

  // =========================
  // 🗺 MAPA
  // =========================

  document.getElementById("sideMap").onclick = function () {
    sideMenu.classList.remove("active");
    document.getElementById("centerMapBtn").style.display = "flex";

    showScreen("map");

    setTimeout(() => {
      if (map) map.invalidateSize();
    }, 300);
  };

  // =========================
  // 🍄 GRZYBDEX
  // =========================

  document.getElementById("sideDex").onclick = function () {
    sideMenu.classList.remove("active");
    document.getElementById("centerMapBtn").style.display = "none";

    showScreen("grzybdex");

    updateStats?.();
  };

  // =========================
  // 🥾 TRASY
  // =========================

  const tabTrails = document.getElementById("sideTrails");

  if (tabTrails) {
    tabTrails.onclick = function () {
      sideMenu.classList.remove("active");
      document.getElementById("centerMapBtn").style.display = "none";

      showScreen("trailsPanel");

      requestAnimationFrame(() => {
        requestAnimationFrame(() => {

          if (!routeMap) initRouteMap();

          setTimeout(() => {
            routeMap?.invalidateSize(true);

            routeMap.setView(
              [userLat || 52, userLng || 19],
              userLat ? 16 : 6,
              { animate: false }
            );
          }, 100);

        });
      });
    };
  }

  // =========================
  // 🔥 SURVIVAL
  // =========================

  const tabSurvival = document.getElementById("sideSurvival");

  if (tabSurvival) {
    tabSurvival.onclick = function () {
      sideMenu.classList.remove("active");
      document.getElementById("centerMapBtn").style.display = "none";

      showScreen("survivalPanel");

      if (typeof openSurvival === "function") {
        openSurvival();
      }
    };
  }

  // =========================
  // 📖 PRZEWODNIK
  // =========================

  const tabGuide = document.getElementById("sideGuide");

  if (tabGuide) {
    tabGuide.onclick = function () {
      sideMenu.classList.remove("active");
      document.getElementById("centerMapBtn").style.display = "none";

      showScreen("guidePanel");

      if (typeof loadGuide === "function") {
        loadGuide();
      }
    };
  }

  // =========================
  // 📍 GPS
  // =========================

  navigator.geolocation.watchPosition(
    (pos) => {

      userLat = pos.coords.latitude;
      userLng = pos.coords.longitude;

      loadWeather?.(userLat, userLng);

      document.getElementById("forestStatus").innerText = "📍 GPS OK";

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

      if (routeMap) {
        if (!window.routeGpsMarker) {
          window.routeGpsMarker = L.marker([userLat, userLng], {
            icon: L.divIcon({
              className: "gpsMarker",
              html: "📍",
              iconSize: [45, 45],
              iconAnchor: [22, 45]
            })
          }).addTo(routeMap);
        } else {
          window.routeGpsMarker.setLatLng([userLat, userLng]);
        }
      }

      if (!lastForestLat || !lastForestLng) {
        lastForestLat = userLat;
        lastForestLng = userLng;
        loadForests(userLat, userLng);
      } else {
        let d = L.latLng(lastForestLat, lastForestLng)
          .distanceTo(L.latLng(userLat, userLng));

        if (d > 1000) {
          lastForestLat = userLat;
          lastForestLng = userLng;
          loadForests(userLat, userLng);
        }
      }

    },
    () => {
      document.getElementById("forestStatus").innerText = "❌ GPS błąd";
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

  map.on("dragstart", () => followGPS = false);
};


// =========================
// 🗺 ROUTE MAP
// =========================

function initRouteMap() {

  if (routeMap) return;

  routeMap = L.map("map").setView([52, 19], 6);

  L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
    attribution: "© OpenStreetMap"
  }).addTo(routeMap);
}
