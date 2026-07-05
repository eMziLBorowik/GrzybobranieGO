// =========================
// 🧭 ROUTER / SCREEN MANAGER
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

  const centerBtn = document.getElementById("centerMapBtn");

  // =========================
  // 🔻 UKRYJ WSZYSTKO
  // =========================

  if (mapEl) mapEl.style.display = "none";
  if (grzyd) grzyd.style.display = "none";
  if (trails) trails.style.display = "none";
  if (surv) surv.style.display = "none";
  if (guide) guide.style.display = "none";
  if (profile) profile.style.display = "none";

  if (weather) weather.style.display = "none";
  if (actionBar) actionBar.style.display = "none";
  if (forestInfo) forestInfo.style.display = "none";
  if (centerBtn) centerBtn.style.display = "none";

  document.body.classList.remove("screen-map");

  // =========================
  // 🗺 MAPA
  // =========================

  if (screen === "map") {

    if (mapEl) mapEl.style.display = "block";
    if (weather) weather.style.display = "block";
    if (actionBar) actionBar.style.display = "flex";
    if (forestInfo) forestInfo.style.display = "block";
    if (centerBtn) centerBtn.style.display = "flex";

    document.body.classList.add("screen-map");
  }

  // =========================
  // 🍄 GRZYBDEX
  // =========================

  if (screen === "grzybdex") {
    if (grzyd) grzyd.style.display = "block";
  }

  // =========================
  // 🌲 TRASY
  // =========================

  if (screen === "trailsPanel") {
    if (trails) trails.style.display = "block";

    requestAnimationFrame(() => {
      requestAnimationFrame(() => {

        if (!routeMap) initRouteMap();

        setTimeout(() => {
          routeMap?.invalidateSize(true);

          routeMap?.setView(
            [userLat || 52, userLng || 19],
            userLat ? 16 : 6,
            { animate: false }
          );
        }, 100);

      });
    });
  }

  // =========================
  // 🔥 SURVIVAL
  // =========================

  if (screen === "survivalPanel") {
    if (surv) surv.style.display = "block";
    openSurvival?.();
  }

  // =========================
  // 📖 GUIDE
  // =========================

  if (screen === "guidePanel") {
    if (guide) guide.style.display = "block";
    loadGuide?.();
  }

  // =========================
  // 👤 PROFILE
  // =========================

  if (screen === "profilePanel") {
    if (profile) profile.style.display = "block";

    if (typeof loadProfile === "function") {
      loadProfile();
    }
  }
}

// =========================
// 🌍 GLOBAL EXPORT
// =========================

window.showScreen = showScreen;