let lastForestLat = null;
let lastForestLng = null;
let followGPS = true;
let firstGPS = true;

let lastMapUpdate = 0;

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
    const profile = document.getElementById("profilePanel");

    const weather = document.getElementById("weatherCard");
    const actionBar = document.getElementById("actionBar");
    const forestInfo = document.getElementById("forestInfoPanel");

    if (mapEl) mapEl.style.display = "none";
    if (grzyd) grzyd.style.display = "none";
    if (trails) trails.style.display = "none";
    if (surv) surv.style.display = "none";
    if (guide) guide.style.display = "none";
    if (profile) profile.style.display = "none";

    if (weather) weather.style.display = "none";
    if (actionBar) actionBar.style.display = "none";
    if (forestInfo) forestInfo.style.display = "none";

    document.body.classList.remove("screen-map");

    if (screen === "map") {
      if (mapEl) mapEl.style.display = "block";
      if (weather) weather.style.display = "block";
      if (actionBar) actionBar.style.display = "block";
      if (forestInfo) forestInfo.style.display = "block";
      document.body.classList.add("screen-map");
    }

    if (screen === "grzybdex") {
      if (grzyd) grzyd.style.display = "block";
    }

    if (screen === "trailsPanel") {
      if (trails) trails.style.display = "block";

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
    }

    if (screen === "survivalPanel") {
      if (surv) surv.style.display = "block";
      openSurvival?.();
    }

    if (screen === "guidePanel") {
      if (guide) guide.style.display = "block";
      loadGuide?.();
    }

    if (screen === "profilePanel") {
      if (profile) profile.style.display = "block";
      loadProfile?.();
    }
  }

  // =========================
  // MENU
  // =========================

  const menuBtn = document.getElementById("menuBtn");
  const sideMenu = document.getElementById("sideMenu");
  const closeMenu = document.getElementById("closeMenu");

  if (menuBtn) menuBtn.onclick = () => sideMenu?.classList.add("active");
  if (closeMenu) closeMenu.onclick = () => sideMenu?.classList.remove("active");

  // =========================
  // NAV
  // =========================

  document.getElementById("sideMap").onclick = () => {
    sideMenu.classList.remove("active");
    document.getElementById("centerMapBtn").style.display = "flex";
    showScreen("map");
    setTimeout(() => map?.invalidateSize(), 300);
  };

  document.getElementById("sideDex").onclick = () => {
    sideMenu.classList.remove("active");
    document.getElementById("centerMapBtn").style.display = "none";
    showScreen("grzybdex");
    updateStats?.();
  };

  document.getElementById("sideTrails").onclick = () => {
    sideMenu.classList.remove("active");
    document.getElementById("centerMapBtn").style.display = "none";
    showScreen("trailsPanel");
  };

  document.getElementById("sideSurvival").onclick = () => {
    sideMenu.classList.remove("active");
    document.getElementById("centerMapBtn").style.display = "none";
    showScreen("survivalPanel");
  };

  document.getElementById("sideGuide").onclick = () => {
    sideMenu.classList.remove("active");
    document.getElementById("centerMapBtn").style.display = "none";
    showScreen("guidePanel");
  };

  const profileBtn = document.getElementById("sideProfile");
  if (profileBtn) {
    profileBtn.onclick = () => {
      sideMenu.classList.remove("active");
      document.getElementById("centerMapBtn").style.display = "none";
      showScreen("profilePanel");
    };
  }

  // =========================
  // GPS
  // =========================

  navigator.geolocation.watchPosition(
    (pos) => {

      userLat = pos.coords.latitude;
      userLng = pos.coords.longitude;

      loadWeather?.(userLat, userLng);
      trackMovementEXP?.(userLat, userLng, pos.coords.speed);

      const status = document.getElementById("forestStatus");
      if (status) status.innerText = "📍 GPS OK";

      if (!map) return;

      // =========================
      // MARKER
      // =========================

      if (!userMarker) {
        userMarker = L.marker([userLat, userLng]).addTo(map);

        if (firstGPS) {
          map.setView([userLat, userLng], 16);
          firstGPS = false;
        }
      } else {
        userMarker.setLatLng([userLat, userLng]);
      }

      // =========================
      // 🔥 GPS MAP FOLLOW FIX
      // =========================

      const now = Date.now();

      if (
        followGPS &&
        document.body.classList.contains("screen-map") &&
        now - lastMapUpdate > 1000
      ) {
        lastMapUpdate = now;

        map.setView([userLat, userLng], map.getZoom());
      }

      // =========================
      // FOREST LOAD
      // =========================

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
  // CENTER BUTTON
  // =========================

  const centerMapBtn = document.getElementById("centerMapBtn");

  if (centerMapBtn) {
    centerMapBtn.onclick = () => {
      if (userLat && userLng) {
        followGPS = true;
        map.setView([userLat, userLng], map.getZoom());
      }
    };
  }

  map.on("dragstart", () => followGPS = false);

};
