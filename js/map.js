let map;
let userMarker = null;

function initMap() {

  if (map) return map; // już istnieje

  map = L.map("map", {
    zoomControl: true
  }).setView([52, 19], 6);

  L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
    attribution: "&copy; OpenStreetMap"
  }).addTo(map);

  return map;
}

// =========================
// 🎯 CENTER USER
// =========================

function centerOnUser(lat, lng) {
  if (!map) return;
  if (!lat || !lng) return;
  map.setView([lat, lng], 16);
}

// =========================
// 👤 USER MARKER
// =========================

function updateUserMarker(lat, lng, followGPS) {

  if (!map) return;

  if (!userMarker) {
    userMarker = L.marker([lat, lng]).addTo(map);
    map.setView([lat, lng], 16);
  } else {
    userMarker.setLatLng([lat, lng]);

    if (followGPS) {
      map.setView([lat, lng], 16);
    }
  }
}

// =========================
// 🔧 RESIZE FIX
// =========================

function fixMapSize() {
  setTimeout(() => {
    map?.invalidateSize(true);
  }, 200);
}

// =========================
// 🌍 EXPORT
// =========================

window.initMap = initMap;
window.centerOnUser = centerOnUser;
window.updateUserMarker = updateUserMarker;
window.fixMapSize = fixMapSize;
