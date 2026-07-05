let followGPS = true;

window.onload = function () {

  // =========================
  // 🧠 SAFE STATE
  // =========================
  window.GAME = window.GAME || {};

  // =========================
  // 🗺 INIT MAP (SAFE + NO DOUBLE INIT)
  // =========================
  if (typeof initMap === "function" && !window.GAME.map) {
    window.GAME.map = initMap();
  }

  // =========================
  // 🛰 GPS (SAFE)
  // =========================
  if (typeof initGPS === "function") {
    const waitMap = setInterval(() => {
      if (window.GAME.map) {
        initGPS(window.GAME.map);
        clearInterval(waitMap);
      }
    }, 200);
  }

  // =========================
  // 🔥 MENU (SAFE + STRONG FIX)
  // =========================
  const menuBtn = document.getElementById("menuBtn");
  const sideMenu = document.getElementById("sideMenu");
  const closeMenu = document.getElementById("closeMenu");

  function openMenu() {
    if (sideMenu) sideMenu.classList.add("active");
  }

  function closeMenuFn() {
    if (sideMenu) sideMenu.classList.remove("active");
  }

  menuBtn?.addEventListener("click", openMenu);
  closeMenu?.addEventListener("click", closeMenuFn);

  // klik poza menu = zamknij
  document.addEventListener("click", (e) => {
    if (!sideMenu || !menuBtn) return;

    const inside =
      sideMenu.contains(e.target) || menuBtn.contains(e.target);

    if (!inside) closeMenuFn();
  });

  // =========================
  // 🧭 SCREEN SWITCH
  // =========================
  function go(screen) {

    closeMenuFn();

    const centerBtn = document.getElementById("centerMapBtn");

    if (centerBtn) centerBtn.style.display = "none";

    window.showScreen?.(screen);

    // =========================
    // 🗺 MAP FIX (IMPORTANT)
    // =========================
    if (screen === "map") {

      if (centerBtn) centerBtn.style.display = "flex";

      // fix Leaflet render bug
      setTimeout(() => {

        if (window.GAME.map) {
          window.GAME.map.invalidateSize(true);

          const lat = window.userLat;
          const lng = window.userLng;

          if (lat != null && lng != null) {
            window.GAME.map.setView([lat, lng], 16);
          }
        }

        // 🔥 dodatkowy fix (DOM repaint bug)
        const mapEl = document.getElementById("map");
        if (mapEl) mapEl.style.display = "block";

      }, 200);
    }
  }

  // =========================
  // 🧭 ROUTER BUTTONS
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
  // 🎯 CENTER MAP BUTTON
  // =========================
  document.getElementById("centerMapBtn")?.addEventListener("click", () => {

    const lat = window.userLat;
    const lng = window.userLng;

    if (lat != null && lng != null && window.GAME.map) {
      window.GAME.map.setView([lat, lng], 16);
    }
  });

  // =========================
  // 🧭 STOP FOLLOW (SAFE)
  // =========================
  setTimeout(() => {
    if (window.GAME.map) {
      window.GAME.map.on("dragstart", () => {
        followGPS = false;
      });
    }
  }, 500);
};
