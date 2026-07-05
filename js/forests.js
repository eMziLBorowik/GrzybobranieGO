let forests = [];

// ⏳ COOLDOWN
let lastForestRequest = 0;

// 🧱 WARSTWA LASÓW
window.forestLayer = null;

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
// 🚫 FILTER (FIXED + PROTECT_CLASS FIX)
// =========================
function isBadForest(el) {
  if (!el.tags) return true;

  const t = el.tags;

  // ❌ WODA / RZEKI
  if (
    t.waterway ||
    t.natural === "water" ||
    t.natural === "bay" ||
    t.natural === "river" ||
    t.landuse === "reservoir"
  ) return true;

  // ❌ MAŁE MIEJSKIE ZIELONE (tylko gdy NIE są ochronne)
  if (
    (t.leisure === "park" ||
     t.leisure === "garden" ||
     t.leisure === "playground" ||
     t.leisure === "recreation_ground") &&
    !t.protect_class
  ) {
    return true;
  }

  // 🌲 LASY (ZOSTAJĄ)
  if (
    t.landuse === "forest" ||
    t.natural === "wood" ||
    t.natural === "forest"
  ) return false;

  // 🏞 PARKI / OBSZARY CHRONIONE (WAŻNE FIX)
  if (
    t.boundary === "protected_area" ||
    t.boundary === "national_park" ||
    t.leisure === "nature_reserve" ||
    t.protect_class
  ) return false;

  return true;
}

// =========================
// 🌲 LOAD FORESTS (18KM FIXED)
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
    way["landuse"="forest"](around:18000,${lat},${lng});
    relation["landuse"="forest"](around:18000,${lat},${lng});

    way["natural"="wood"](around:18000,${lat},${lng});
    relation["natural"="wood"](around:18000,${lat},${lng});

    relation["boundary"="protected_area"](around:18000,${lat},${lng});
    relation["boundary"="protected_area"]["protect_class"="5"](around:18000,${lat},${lng});

    relation["leisure"="nature_reserve"](around:18000,${lat},${lng});
    relation["boundary"="national_park"](around:18000,${lat},${lng});
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
// CLOSE PANEL FIX
// =========================
document.addEventListener("click", (e) => {
  const panel = document.getElementById("forestInfoPanel");
  if (!panel) return;

  if (panel.contains(e.target)) return;
  if (e.target.closest(".leaflet-interactive")) return;

  panel.style.display = "none";
});
