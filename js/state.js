// =========================
// 🌍 GAME STATE (CORE)
// =========================

window.GAME = {
  // 🛰 GPS
  userLat: null,
  userLng: null,

  // 🗺 MAPA
  map: null,
  userMarker: null,
  followGPS: true,
  firstGPS: true,

  // 🌲 LASY
  lastForestLat: null,
  lastForestLng: null,

  // 🎮 STAN GRY
  exp: 0,
  level: 1,

  // 🧭 TRASY
  routeActive: false,
  routePoints: [],

  // ⚙ TECH
  initialized: false
};