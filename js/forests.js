let forests = [];
let lastForestRequest = 0;

// 🚫 FILTR TERENÓW
function isBadForest(el, pts) {
  if (!el || !el.tags) return true;
  if (el.type === "node") return true;

  // 🔥 NIE USUWAJ DUŻYCH PARKÓW / REZERWATÓW
  if (el.tags.name) {
    const n = el.tags.name;

    if (
      n.includes("Gostynińsko") ||   // ✔ POPRAWIONE
      n.includes("Włocławski") ||
      n.includes("Krajobrazowy") ||
      n.includes("Rezerwat") ||
      n.includes("Park Narodowy") ||
      n.includes("Park Krajobrazowy")
    ) {
      return false;
    }
  }

  // 🌆 miejskie tereny zielone
  const urbanGreen = [
    "park",
    "garden",
    "grass",
    "village_green",
    "recreation_ground",
    "meadow"
  ];

  if (urbanGreen.includes(el.tags.leisure)) return true;

  // 🚫 małe obiekty
  if (pts.length < 25 && !el.tags.boundary && !el.tags.protect_class) {
    return true;
  }

  // 🚫 małe lasy
  if (el.tags.landuse === "forest" && pts.length < 40) {
    return true;
  }

  // 🚫 miejscowości
  if (el.tags.place) return true;

  return false;
}

async function loadForests(lat, lng) {
  const now = Date.now();

  // ⏳ cooldown 15s
  if (now - lastForestRequest < 15000) {
    console.log("⏳ cooldown forests API");
    return;
  }

  lastForestRequest = now;

  const q = `
[out:json][timeout:25];

(
  way["landuse"="forest"](around:30000,${lat},${lng});
  way["natural"="wood"](around:30000,${lat},${lng});

  way["boundary"="protected_area"](around:30000,${lat},${lng});
  relation["boundary"="protected_area"](around:30000,${lat},${lng});

  way["boundary"="national_park"](around:30000,${lat},${lng});
  relation["boundary"="national_park"](around:30000,${lat},${lng});

  relation["type"="multipolygon"](around:30000,${lat},${lng});

  relation["name"~"Gostynińsko|Włocławski|Krajobrazowy|Rezerwat|Park",i]
  (around:30000,${lat},${lng});
);

out body;
>;
out skel qt;
`;

  const url =
    "https://overpass-api.de/api/interpreter?data=" +
    encodeURIComponent(q);

  try {
    const res = await fetch(url);

    // 🔥 Overpass protection
    if (res.status === 429 || res.status === 504) {
      console.warn("⚠️ Overpass busy → retry");
      setTimeout(() => loadForests(lat, lng), 12000);
      return;
    }

    const text = await res.text();

    if (!text.startsWith("{")) {
      console.error("❌ Overpass error:", text);
      document.getElementById("forestStatus").innerText =
        "❌ Błąd lasów";
      return;
    }

    const data = JSON.parse(text);

    forests = [];
    window.forestLayer.clearLayers();

    data.elements.forEach(el => {
      let pts = [];

      if (el.geometry) {
        pts = el.geometry.map(p => [p.lat, p.lon]);
      }

      if (!pts.length) return;
      if (isBadForest(el, pts)) return;
      if (pts.length < 3) return;

      const poly = L.polygon(pts, {
        color: "#2e8b57",
        fillColor: "#3cb371",
        fillOpacity: 0.25,
        weight: 2
      }).addTo(window.forestLayer);

      forests.push(poly);

      // 🔥 NIE DOTYKAM TWOJEGO SYSTEMU INFO
      poly.on("click", (e) => {
        L.DomEvent.stopPropagation(e);

        if (typeof showForestInfo === "function") {
          showForestInfo(el, pts);
        }
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
