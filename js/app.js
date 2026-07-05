let followGPS = true;

// 🌍 tylko UI state (NIE GPS)
window.onload = function () {

  // =========================
  // 🗺 INIT MAP
  // =========================
  if (typeof initMap === "function") {
    window.map = initMap();
  }

  // =========================
  // 🛰 START GPS MODULE (JEŚLI ISTNIEJE)
  // =========================
  if (typeof initGPS === "function" && window.map) {
    initGPS(window.map);
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
      window.map?.invalidateSize(true);
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
    if (window.userLat && window.userLng && window.map) {
      window.map.setView([window.userLat, window.userLng], 16);
    }
  });

  // =========================
  // 🧭 STOP FOLLOW (MAP DRAG)
  // =========================

  window.map?.on("dragstart", () => {
    followGPS = false;
  });
};
