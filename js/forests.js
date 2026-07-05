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
// 🚫 FILTER (FIXED LOGIC)
// =========================
function isBadForest(el, pts) {

  if (!el.tags) return true;
  if (el.type === "node") return true;

  const t = el.tags;

  // ❌ WATER / RIVERS (Wisła fix)
  if (t.waterway || t.natural === "water" || t.natural === "bay") return true;
  if (t.landuse === "reservoir") return true;

  // ❌ URBAN SMALL GREEN (skwery itd)
  if (
    t.leisure === "park" ||
    t.leisure === "garden" ||
    t.leisure === "playground" ||
    t.leisure === "recreation_ground"
  ) {
    if (pts.length < 40) return true;
  }

  // 🌲 KEEP BIG GREEN AREAS
  if (
    t.landuse === "forest" ||
    t.natural === "wood" ||
    t.natural === "forest"
  ) return false;

  // 🏞 PROTECTED AREAS ALWAYS KEEP
  if (
    t.boundary === "protected_area" ||
    t.boundary === "national_park" ||
    t.boundary === "national_park" ||
    t.protect_class ||
    t.protection_title ||
    t.leisure === "nature_reserve"
  ) return false;

  // 🌳 PARKI KRAJOBRAZOWE (najważniejsze)
  if (t.boundary === "protected_area" || t.protect_class) return false;

  // ❌ SMALL FRAGMENTS ONLY
  if (pts.length < 6) return true;

  return false;
}

// =========================
// 🌲 LOAD FORESTS (18km FIXED)
// =========================
async function loadForests(lat, lng) {

  const now = Date.now();
  if (now - lastForestRequest < 15000) return;
  lastForestRequest = now;

  if (!map) return;

  initForestLayer();

  const q = `
  [out:json];

  (
    relation["boundary"="protected_area"](around:18000,${lat},${lng});
    relation["boundary"="national_park"](around:18000,${lat},${lng});
    relation["boundary"="protected_area"]["protect_class"](around:18000,${lat},${lng});
    relation["leisure"="nature_reserve"](around:18000,${lat},${lng});

    // 🔥 KLUCZ: tylko duże naturalne obszary jako relation
    relation["landuse"="forest"](around:18000,${lat},${lng});
    relation["natural"="wood"](around:18000,${lat},${lng});
  );

  out geom;
  `;

  const url =
    "https://overpass-api.de/api/interpreter?data=" +
    encodeURIComponent(q);

  try {

    const res = await fetch(url);
    const text = await res.text();

    if (!text.startsWith("{")) return;

    const data = JSON.parse(text);

    forests = [];
    window.forestLayer.clearLayers();

    data.elements.forEach(el => {

      if (!el.geometry) return;

      let pts = el.geometry.map(p => [p.lat, p.lon]);

      // 🔥 KLUCZ FIX: eliminuj śmieciowe fragmenty
      if (pts.length < 8) return;

      // NIE rysuj jeśli to jest droga/linia
      if (el.type === "way" && pts.length < 30) return;

      const poly = L.polygon(pts, {
        color: "#2e8b57",
        fillColor: "#3cb371",
        fillOpacity: 0.25,
        weight: 2
      }).addTo(window.forestLayer);

      forests.push(poly);

      poly.on("click", (e) => {
        L.DomEvent.stopPropagation(e);
        showForestInfo(el, pts);
      });

    });

    document.getElementById("forestStatus").innerText =
      "🌲 Parki i lasy OK";

  } catch (e) {
    console.log(e);
    document.getElementById("forestStatus").innerText =
      "❌ Błąd lasów";
  }
}

// =========================
// INFO (bez zmian)
// =========================
async function showForestInfo(el, pts) {

  let panel = document.getElementById("forestInfoPanel");
  if (!panel) return;

  panel.style.display = "block";

  let name = "🌲 Teren zielony";

  if (el.tags?.name) name = "🌲 " + el.tags.name;

  document.getElementById("forestName").innerText = name;

  let lat = pts[0][0];
  let lng = pts[0][1];

  try {

    let r = await fetch(
      `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lng}&daily=precipitation_sum,temperature_2m_max&past_days=30&timezone=auto`
    );

    let d = await r.json();

    let rains = d.daily.precipitation_sum || [];
    let temps = d.daily.temperature_2m_max || [];

    let rain30 = rains.reduce((a, b) => a + (b || 0), 0);

    let chance = 40;

    if (rain30 > 60) chance += 20;
    if (rain30 < 20) chance -= 15;

    document.getElementById("forestRain").innerText =
      "🌧️ 30 dni: " + rain30.toFixed(1) + " mm";

    document.getElementById("forestChance").innerText =
      "🍄 Szansa: " + Math.round(chance) + "%";

  } catch (e) {
    document.getElementById("forestRain").innerText = "🌧️ Brak danych";
  }
}

// =========================
document.addEventListener("click", (e) => {
  const panel = document.getElementById("forestInfoPanel");
  if (!panel) return;
  if (panel.contains(e.target)) return;
  if (e.target.closest(".leaflet-interactive")) return;
  panel.style.display = "none";
});
