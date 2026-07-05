let forests = [];

// ⏳ COOLDOWN
let lastForestRequest = 0;

// 🧱 WARSTWA LASÓW (SAFE)
window.forestLayer = null;

// =========================
// 🚧 INIT LAYER
// =========================
function initForestLayer() {
  if (!map) return false;

  if (!window.forestLayer) {
    window.forestLayer = L.layerGroup().addTo(map);
  }

  return true;
}

// =========================
// 🚫 FIX FILTR (NAJWAŻNIEJSZY)
// =========================
function isBadForest(el, pts) {

  if (!el.tags) return true;
  if (el.type === "node") return true;

  // 🔥 PRIORYTET: PARKI / REZERWATY ZAWSZE PRZEPUŚĆ
  const isProtected =
    el.tags.boundary === "protected_area" ||
    el.tags.boundary === "national_park" ||
    el.tags.protect_class ||
    el.tags.protection_title ||
    el.tags.leisure === "nature_reserve";

  if (isProtected) return false;

  // 🔥 LEPSZE WYKRYWANIE PO NAZWIE (NIE ZABIJA PARKÓW)
  if (el.tags.name) {
    const n = el.tags.name.toLowerCase();

    if (
      (n.includes("park") && n.includes("krajobraz")) ||
      n.includes("park narodowy") ||
      n.includes("rezerwat")
    ) {
      return false;
    }
  }

  // ❌ miejskie tereny zielone
  const urbanGreen = [
    "park",
    "garden",
    "grass",
    "village_green",
    "recreation_ground",
    "meadow"
  ];

  if (urbanGreen.includes(el.tags.leisure)) return true;

  // 🔥 FIX: NIE WYCIERAJ PARKÓW PRZEZ LICZBĘ PUNKTÓW
  if (pts.length < 3 && !isProtected) return true;

  if (el.tags.place) return true;

  return false;
}

// =========================
// 🌲 LOAD FORESTS (POPRAWIONE PARKI)
// =========================
async function loadForests(lat, lng) {

  const now = Date.now();
  if (now - lastForestRequest < 15000) return;

  lastForestRequest = now;

  if (!map) return;

  initForestLayer();
  if (!window.forestLayer) return;

  const q = `
  [out:json];

  (
    way["landuse"="forest"](around:18000,${lat},${lng});
    way["natural"="wood"](around:18000,${lat},${lng});

    relation["type"="multipolygon"](around:18000,${lat},${lng});

    relation["boundary"="protected_area"](around:18000,${lat},${lng});
    relation["boundary"="national_park"](around:18000,${lat},${lng});
    relation["leisure"="nature_reserve"](around:18000,${lat},${lng});

    relation["name"~"Gostynińsko|Włocławski|Krajobrazowy|Rezerwat|Park",i]
    (around:18000,${lat},${lng});
  );

  out geom;
  >;
  out geom;
  `;

  const url =
    "https://overpass-api.de/api/interpreter?data=" +
    encodeURIComponent(q);

  try {

    const res = await fetch(url);

    if (res.status === 429) {
      setTimeout(() => loadForests(lat, lng), 10000);
      return;
    }

    const text = await res.text();
    if (!text.startsWith("{")) return;

    const data = JSON.parse(text);

    forests = [];
    window.forestLayer.clearLayers();

    const seen = new Set();

    data.elements.forEach(el => {

      if (!el.geometry) return;

      let pts = el.geometry.map(p => [p.lat, p.lon]);
      if (!pts.length) return;

      const id = el.id || el.osm_id;
      if (seen.has(id)) return;
      seen.add(id);

      if (isBadForest(el, pts)) return;

      let poly = L.polygon(pts, {
        color: "#2e8b57",
        fillColor: "#3cb371",
        fillOpacity: 0.25,
        weight: 2
      });

      poly._forestId = id;

      poly.addTo(window.forestLayer);
      forests.push(poly);

      poly.on("click", (e) => {
        L.DomEvent.stopPropagation(e);
        showForestInfo(el, pts);
      });

    });

    document.getElementById("forestStatus").innerText =
      "🌲 Lasy i parki gotowe";

  } catch (e) {
    console.log(e);
    document.getElementById("forestStatus").innerText =
      "❌ Błąd lasów";
  }
}

// =========================
// ℹ️ INFO (bez zmian)
// =========================
async function showForestInfo(el, pts) {

  let panel = document.getElementById("forestInfoPanel");
  if (!panel) return;

  panel.style.display = "block";

  let name = "🌲 Teren zielony";

  if (el.tags) {
    if (el.tags.name) name = "🌲 " + el.tags.name;
    else if (el.tags.official_name) name = "🌲 " + el.tags.official_name;
    else if (el.tags.short_name) name = "🌲 " + el.tags.short_name;
  }

  document.getElementById("forestName").innerText = name;
  document.getElementById("forestRain").innerText = "🌧️ Sprawdzanie...";
  document.getElementById("forestChance").innerText = "🍄 Liczenie...";

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
    let avgRain = rain30 / 30;

    let rain7 = rains.slice(-7).reduce((a, b) => a + (b || 0), 0) / 7;

    let temp = temps.reduce((a, b) => a + b, 0) / (temps.length || 1);

    let chance = 30;

    if (avgRain > 4 && rain7 > 5) chance += 35;
    else if (avgRain > 2) chance += 15;
    else chance -= 20;

    if (temp >= 10 && temp <= 22) chance += 15;
    if (temp < 5) chance -= 15;
    if (temp > 28) chance -= 20;

    let month = new Date().getMonth() + 1;

    if (month === 9 || month === 10) chance += 30;
    if (month === 7 || month === 8) chance -= 15;

    chance = Math.max(5, Math.min(95, chance));

    document.getElementById("forestRain").innerText =
      "🌧️ 30 dni: " + rain30.toFixed(1) + " mm";

    document.getElementById("forestChance").innerText =
      "🍄 Szansa: " + Math.round(chance) + "%";

  } catch (e) {
    document.getElementById("forestRain").innerText = "🌧️ Brak danych";
  }
}

// =========================
// CLICK CLOSE
// =========================
document.addEventListener("click", (e) => {
  const panel = document.getElementById("forestInfoPanel");
  if (!panel) return;
  if (panel.contains(e.target)) return;
  if (e.target.closest(".leaflet-interactive")) return;
  panel.style.display = "none";
});

// =========================
// SAFE BIND
// =========================
function bindForestMapEvents() {
  if (!map) return;

  map.on("click", () => {
    const panel = document.getElementById("forestInfoPanel");
    if (panel) panel.style.display = "none";
  });
}

window.bindForestMapEvents = bindForestMapEvents;
