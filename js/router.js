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
  // 🔻 HIDE ALL
  // =========================

  [mapEl, grzyd, trails, surv, guide, profile].forEach(el => {
    if (el) el.style.display = "none";
  });

  if (weather) weather.style.display = "none";
  if (actionBar) actionBar.style.display = "none";
  if (forestInfo) forestInfo.style.display = "none";
  if (centerBtn) centerBtn.style.display = "none";

  document.body.classList.remove("screen-map");

  // =========================
  // 🗺 MAP SCREEN
  // =========================

  if (screen === "map") {

    if (mapEl) mapEl.style.display = "block";
    if (weather) weather.style.display = "block";
    if (actionBar) actionBar.style.display = "flex";
    if (forestInfo) forestInfo.style.display = "block";
    if (centerBtn) centerBtn.style.display = "flex";

    document.body.classList.add("screen-map");

    // 🔥 WAŻNE: odśwież mapę (Leaflet bug fix)
    setTimeout(() => {
      window.map?.invalidateSize?.();
    }, 150);
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

    // 🔥 NIE DOTYKAMY MAPY TU (fix crashy)
    requestAnimationFrame(() => {
      setTimeout(() => {
        if (window.routeMap) {
          window.routeMap.invalidateSize(true);
        }
      }, 150);
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
    loadProfile?.();
  }
}

// =========================
// 🌍 EXPORT
// =========================

window.showScreen = showScreen;
