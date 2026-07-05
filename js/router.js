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
  // 🔻 HIDE ALL SCREENS (SAFE)
  // =========================

  const screens = [mapEl, grzyd, trails, surv, guide, profile];

  screens.forEach(el => {
    if (!el) return;
    el.style.display = "none";
  });

  // UI elements always reset
  if (weather) weather.style.display = "none";
  if (actionBar) actionBar.style.display = "none";
  if (forestInfo) forestInfo.style.display = "none";
  if (centerBtn) centerBtn.style.display = "none";

  document.body.classList.remove("screen-map");

  // =========================
  // 🗺 MAP
  // =========================

  if (screen === "map") {

    if (mapEl) mapEl.style.display = "block";
    if (weather) weather.style.display = "block";
    if (actionBar) actionBar.style.display = "flex";
    if (forestInfo) forestInfo.style.display = "block";
    if (centerBtn) centerBtn.style.display = "flex";

    document.body.classList.add("screen-map");

    // 🔥 FIX Leaflet render bug
    requestAnimationFrame(() => {
      setTimeout(() => {
        window.map?.invalidateSize?.();
      }, 100);
    });
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
      setTimeout(() => {
        window.routeMap?.invalidateSize?.();
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

window.showScreen = showScreen;
