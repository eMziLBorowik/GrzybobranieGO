let followGPS = true;

// =========================
// 🌍 APP CORE (UI ONLY)
// =========================

window.onload = function () {

  // =========================
  // 🗺 INIT MAP
  // =========================
  if (typeof initMap === "function") {
    window.GAME.map = initMap();
  }

  // =========================
  // 🛰 INIT GPS MODULE (JEŚLI ISTNIEJE)
  // =========================
  if (typeof initGPS === "function" && window.GAME.map) {
    initGPS(window.GAME.map);
  }

  // =========================
  // 🔥 MENU
  // =========================

  const menuBtn = document.getElementById("menuBtn");
  const sideMenu = document.getElementById("sideMenu");
  const closeMenu = document.getElementById("closeMenu");

  menuBtn?.addEventListener("click", () => sideMenu?.classList.add("active"));
  closeMenu?.addEventListener("click", () => sideMenu?.classList.remove("active"));

  // =========================
  // 🧭 ROUTER NAV
  // =========================

  document.getElementById("sideMap")?.addEventListener("click", () => {
    sideMenu?.classList.remove("active");
    document.getElementById("centerMapBtn").style.display = "flex";

    window.showScreen?.("map");

    setTimeout(() => {
      window.GAME.map?.invalidateSize(true);
    }, 300);
  });

  document.getElementById("sideDex")?.addEventListener("click", () => {
    sideMenu?.classList.remove("active");
    document.getElementById("centerMapBtn").style.display = "none";

    window.showScreen?.("grzybdex");
    updateStats?.();
  });

  document.getElementById("sideTrails")?.addEventListener("click", () => {
    sideMenu?.classList.remove("active");
    document.getElementById("centerMapBtn").style.display = "none";

    window.showScreen?.("trailsPanel");
  });

  document.getElementById("sideSurvival")?.addEventListener("click", () => {
    sideMenu?.classList.remove("active");
    document.getElementById("centerMapBtn").style.display = "none";

    window.showScreen?.("survivalPanel");
  });

  document.getElementById("sideGuide")?.addEventListener("click", () => {
    sideMenu?.classList.remove("active");
    document.getElementById("centerMapBtn").style.display = "none";

    window.showScreen?.("guidePanel");
  });

  document.getElementById("sideProfile")?.addEventListener("click", () => {
    sideMenu?.classList.remove("active");
    document.getElementById("centerMapBtn").style.display = "none";

    window.showScreen?.("profilePanel");
  });

  // =========================
  // 🎯 CENTER BUTTON
  // =========================

  document.getElementById("centerMapBtn")?.addEventListener("click", () => {
    if (
      window.GAME.userLat &&
      window.GAME.userLng &&
      window.GAME.map
    ) {
      window.GAME.map.setView(
        [window.GAME.userLat, window.GAME.userLng],
        16
      );
    }
  });

  // =========================
  // 🧭 STOP FOLLOW (MAP DRAG)
  // =========================

  window.GAME.map?.on("dragstart", () => {
    followGPS = false;
  });
};
