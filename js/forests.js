let forests = [];

// ⏳ COOLDOWN
let lastForestRequest = 0;

// 🧱 WARSTWA LASÓW
window.forestLayer = null;

// 🏞 SPECJALNY PARK (Gostynińsko-Włocławski)
let gostyninPark = null;
let gostyninLayer = null;

// =========================
// INIT LAYER
// =========================
function initForestLayer() {
  if (!map) return false;

  if (!window.forestLayer) {
    window.forestLayer = L.layerGroup().addTo(map);
  }

  return true;
}

// =========================
// 🌲 GOSTYNIN PARK CREATE
// =========================
function createGostyninPark() {

  const coords = [
    [52.45, 19.35],
    [52.60, 19.35],
    [52.60, 19.80],
    [52.45, 19.80]
  ];

  gostyninPark = L.polygon(coords, {
    color: "#00b050",
    weight: 4,
    fill: false,
    dashArray: "10,6"
  });
}

// =========================
// 📡 DISTANCE
// =========================
function getDistance(a, b) {
  const R = 6371000;
  const toRad = x => x * Math.PI / 180;

  const dLat = toRad(b.lat - a.lat);
  const dLon = toRad(b.lng - a.lng);

  const lat1 = toRad(a.lat);
  const lat2 = toRad(b.lat);

  const x =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1) * Math.cos(lat2) *
    Math.sin(dLon / 2) ** 2;

  return R * (2 * Math.atan2(Math.sqrt(x), Math.sqrt(1 - x)));
}

// =========================
// 🧠 FIXED FILTER
// =========================
function isBadForest(el) {
  if (!el.tags) return true;

  const t = el.tags;

  // ❌ WODA
  if (
    t.waterway ||
    t.natural === "water" ||
    t.natural === "bay" ||
    t.natural === "river" ||
    t.landuse === "reservoir"
  ) return true;

  // 🌲 LASY
  if (
    t.landuse === "forest" ||
    t.natural === "wood" ||
    t.natural === "forest"
  ) return false;

  // 🏞 PARKI / CHRONIONE
  if (
    t.protect_class ||
    t.boundary === "protected_area" ||
    t.boundary === "national_park" ||
    t.leisure === "nature_reserve"
  ) return false;

  // ❌ MIEJSKIE ZIELONE
  if (
    t.leisure === "park" ||
    t.leisure === "garden" ||
    t.leisure === "playground" ||
    t.leisure === "recreation_ground"
  ) return true;

  return true;
}

// =========================
// 🌲 LOAD FORESTS
// =========================
async function loadForests(lat, lng) {

  const now = Date.now();
  if (now - lastForestRequest < 12000) return;
  lastForestRequest = now;

  if (!map) return;

  initForestLayer();

  const q = `
  [out:json];

  (
    way["landuse"="forest"](around:40000,${lat},${lng});
    relation["landuse"="forest"](around:40000,${lat},${lng});

    way["natural"="wood"](around:40000,${lat},${lng});
    relation["natural"="wood"](around:40000,${lat},${lng});

    relation["boundary"="protected_area"](around:40000,${lat},${lng});
    relation["boundary"="protected_area"]["protect_class"="5"](around:40000,${lat},${lng});

    relation["boundary"="national_park"](around:40000,${lat},${lng});
    relation["leisure"="nature_reserve"](around:40000,${lat},${lng});
  );

  out geom;
  `;

  const url =
    "https://overpass-api.de/api/interpreter?data=" +
    encodeURIComponent(q);

  try {

    const res = await fetch(url);
    const data = await res.json();

    forests = [];
    window.forestLayer.clearLayers();

    const seen = new Set();

    data.elements.forEach(el => {

      if (!el.geometry) return;
      if (isBadForest(el)) return;

      const pts = el.geometry.map(p => [p.lat, p.lon]);

      if (pts.length < 6) return;

      const key = pts[0][0].toFixed(4) + ":" + pts[0][1].toFixed(4);
      if (seen.has(key)) return;
      seen.add(key);

      const poly = L.polygon(pts, {
        color: "#2e8b57",
        fillColor: "#3cb371",
        fillOpacity: 0.22,
        weight: 2
      }).addTo(window.forestLayer);

      forests.push(poly);

      poly.on("click", (e) => {
        L.DomEvent.stopPropagation(e);
        showForestInfo(el, pts);
      });

    });

    const status = document.getElementById("forestStatus");
    if (status) status.innerText = "🌲 Lasy OK";

  } catch (e) {
    console.log("forest error:", e);

    const status = document.getElementById("forestStatus");
    if (status) status.innerText = "❌ Błąd lasów";
  }
}

// =========================
// 🟢 GOSTYNIN VISIBILITY (15km)
// =========================
function updateGostyninVisibility(lat, lng) {

  if (!gostyninPark) return;

  const center = gostyninPark.getBounds().getCenter();

  const dist = getDistance(
    { lat, lng },
    { lat: center.lat, lng: center.lng }
  );

  const RADIUS = 15000; // 15 km

  if (dist < RADIUS) {

    if (!gostyninLayer) {
      gostyninLayer = L.layerGroup([gostyninPark]).addTo(map);
    }

  } else {

    if (gostyninLayer) {
      map.removeLayer(gostyninLayer);
      gostyninLayer = null;
    }
  }
}

// =========================
// INFO PANEL
// =========================
async function showForestInfo(el, pts) {

  let panel = document.getElementById("forestInfoPanel");
  if (!panel) return;

  panel.style.display = "block";

  let name = el.tags?.name
    ? "🌲 " + el.tags.name
    : "🌲 Teren leśny";

  document.getElementById("forestName").innerText = name;

  let lat = pts[0][0];
  let lng = pts[0][1];

  try {
    let r = await fetch(
      `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lng}&daily=precipitation_sum,temperature_2m_max&past_days=30&timezone=auto`
    );

    let d = await r.json();

    let rains = d.daily?.precipitation_sum || [];

    let rain30 = rains.reduce((a, b) => a + (b || 0), 0);

    let chance = 35;

    if (rain30 > 60) chance += 20;
    if (rain30 < 20) chance -= 10;

    document.getElementById("forestRain").innerText =
      "🌧️ 30 dni: " + rain30.toFixed(1) + " mm";

    document.getElementById("forestChance").innerText =
      "🍄 Szansa: " + Math.round(chance) + "%";

  } catch (e) {
    document.getElementById("forestRain").innerText =
      "🌧️ Brak danych";
  }
}

// =========================
// CLOSE PANEL
// =========================
document.addEventListener("click", (e) => {
  const panel = document.getElementById("forestInfoPanel");
  if (!panel) return;

  if (panel.contains(e.target)) return;
  if (e.target.closest(".leaflet-interactive")) return;

  panel.style.display = "none";
});

// =========================
// INIT SPECIAL PARK
// =========================
createGostyninPark();
