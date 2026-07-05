let followGPS = true;

window.onload = function () {

  // =========================
  // 🧠 SAFE STATE
  // =========================
  window.GAME = window.GAME || {};
  window.GAME.map = window.GAME.map || null;

  // =========================
  // 🗺 INIT MAP (SAFE)
  // =========================
  if (typeof initMap === "function" && !window.GAME.map) {
    window.GAME.map = initMap();
  }

  // =========================
  // 🛰 GPS (SAFE)
  // =========================
  if (typeof initGPS === "function" && window.GAME.map) {
    initGPS(window.GAME.map);
  }

  // =========================
  // 🔥 MENU (SAFE DOM)
  // =========================
  const menuBtn = document.getElementById("menuBtn");
  const sideMenu = document.getElementById("sideMenu");
  const closeMenu = document.getElementById("closeMenu");

  menuBtn?.addEventListener("click", () => {
    sideMenu?.classList.add("active");
  });

  closeMenu?.addEventListener("click", () => {
    sideMenu?.classList.remove("active");
  });

  // =========================
  // 🧭 SAFE SCREEN SWITCH
  // =========================
  function go(screen) {

    sideMenu?.classList.remove("active");

    const centerBtn = document.getElementById("centerMapBtn");

    // reset UI
    if (centerBtn) centerBtn.style.display = "none";

    window.showScreen?.(screen);

    // =========================
    // 🗺 MAP FIX (KLUCZ!)
    // =========================
    if (screen === "map") {

      if (centerBtn) centerBtn.style.display = "flex";

      setTimeout(() => {
        if (window.GAME.map) {
          window.GAME.map.invalidateSize(true);

          const lat = window.GAME.userLat;
          const lng = window.GAME.userLng;

          if (lat != null && lng != null) {
            window.GAME.map.setView([lat, lng], 16);
          }
        }
      }, 200);
    }
  }

  // =========================
  // 🧭 ROUTER
  // =========================

  document.getElementById("sideMap")?.addEventListener("click", () => go("map"));

  document.getElementById("sideDex")?.addEventListener("click", () => {
    go("grzybdex");
    updateStats?.();
  });

  document.getElementById("sideTrails")?.addEventListener("click", () => go("trailsPanel"));
  document.getElementById("sideSurvival")?.addEventListener("click", () => go("survivalPanel"));
  document.getElementById("sideGuide")?.addEventListener("click", () => go("guidePanel"));
  document.getElementById("sideProfile")?.addEventListener("click", () => go("profilePanel"));

  // =========================
  // 🎯 CENTER BUTTON
  // =========================
  document.getElementById("centerMapBtn")?.addEventListener("click", () => {

    const lat = window.GAME.userLat;
    const lng = window.GAME.userLng;

    if (lat != null && lng != null && window.GAME.map) {
      window.GAME.map.setView([lat, lng], 16);
    }
  });

  // =========================
  // 🧭 STOP FOLLOW
  // =========================
  window.GAME.map?.on("dragstart", () => {
    followGPS = false;
  });
};
