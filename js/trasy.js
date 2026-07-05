let routeMap = null;

let routeLine = null;
let routePoints = [];

let routeRunning = false;
let routePaused = false;

let routeStartTime = null;
let routeTimer = null;

let routeDistance = 0;

let routeGpsMarker = null;

let pausedAt = null;
let totalPausedTime = 0;

let gpsInterval = null;

let lastPoint = null;

// ============================
// 🗺 INIT MAP
// ============================

function initRouteMap() {
  if (routeMap) return routeMap;

  const el = document.getElementById("routeMiniMap");
  if (!el) return null;

  routeMap = L.map(el, {
    zoomControl: false,
    attributionControl: false
  });

  L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
    attribution: "© OpenStreetMap"
  }).addTo(routeMap);

  // 🔥 FIX: bezpieczny GPS
  const lat = window.userLat;
  const lng = window.userLng;

  if (lat && lng) {
    routeMap.setView([lat, lng], 17);
  } else {
    routeMap.setView([52, 19], 6);
  }

  setTimeout(() => routeMap?.invalidateSize(), 300);

  // 🔥 marker GPS
  if (lat && lng) {
    routeGpsMarker = L.marker([lat, lng], {
      icon: L.divIcon({
        className: "gpsMarker",
        html: "📍",
        iconSize: [30, 30]
      })
    }).addTo(routeMap);
  }

  return routeMap;
}

// ============================
// ▶ START ROUTE
// ============================

function startRoute() {
  if (!routeMap) initRouteMap();

  routePoints = [];
  routeDistance = 0;

  routeStartTime = Date.now();

  routeRunning = true;
  routePaused = false;

  pausedAt = null;
  totalPausedTime = 0;

  lastPoint = null;

  routeLine = L.polyline([], {
    color: "red",
    weight: 5
  }).addTo(routeMap);

  gpsInterval = setInterval(() => {
    if (!routeRunning || routePaused) return;

    if (window.userLat && window.userLng) {
      addRoutePoint(window.userLat, window.userLng);
    }
  }, 15000);

  routeTimer = setInterval(updateRouteTime, 1000);
}

// ============================
// ⏹ END ROUTE
// ============================

async function endRoute() {
  routeRunning = false;

  clearInterval(routeTimer);
  clearInterval(gpsInterval);

  const time = Math.floor(
    (Date.now() - routeStartTime - totalPausedTime) / 1000
  );

  if (routePoints.length > 1) {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    await supabase.from("routes").insert([{
      user_id: user.id,
      name: "Trasa",
      points: routePoints,
      distance: Math.round(routeDistance),
      duration: time
    }]);

    await enforceRouteLimit();
    showSavedRoutes();
  }
}

// ============================
// 📏 LIMIT 15 TRAS
// ============================

async function enforceRouteLimit() {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return;

  const { data } = await supabase
    .from("routes")
    .select("id,created_at")
    .eq("user_id", user.id)
    .order("created_at", { ascending: true });

  if (!data || data.length <= 15) return;

  const toDelete = data.slice(0, data.length - 15);

  await supabase.from("routes")
    .delete()
    .in("id", toDelete.map(r => r.id));
}

// ============================
// ⏱ TIMER
// ============================

function updateRouteTime() {
  if (!routeStartTime || routePaused) return;

  const sec = Math.floor(
    (Date.now() - routeStartTime - totalPausedTime) / 1000
  );

  const el = document.getElementById("routeTime");
  if (el) {
    el.innerText = `${Math.floor(sec / 60)} min ${sec % 60} s`;
  }
}

// ============================
// ➕ ADD POINT
// ============================

function addRoutePoint(lat, lng) {
  if (!routeRunning || routePaused) return;

  if (lastPoint) {
    const d = L.latLng(lastPoint).distanceTo([lat, lng]);
    if (d < 3) return;
  }

  lastPoint = [lat, lng];

  routePoints.push([lat, lng]);
  routeLine.addLatLng([lat, lng]);

  if (routePoints.length > 1) {
    const prev = routePoints[routePoints.length - 2];
    routeDistance += L.latLng(prev).distanceTo([lat, lng]);
  }

  const distEl = document.getElementById("routeDistance");
  if (distEl) distEl.innerText = Math.round(routeDistance) + " m";

  if (routeGpsMarker && routeMap) {
    routeGpsMarker.setLatLng([lat, lng]);
  }
}

// ============================
// 📜 SHOW SAVED ROUTES
// ============================

async function showSavedRoutes() {
  const box = document.getElementById("routesList");
  if (!box) return;

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return;

  const { data } = await supabase
    .from("routes")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  if (!data || data.length === 0) {
    box.innerHTML = "Brak zapisanych tras";
    return;
  }

  box.innerHTML = "";

  data.forEach((r, i) => {
    const div = document.createElement("div");
    div.className = "card";

    div.innerHTML = `
      🥾 Trasa ${i + 1}<br>
      📅 ${new Date(r.created_at).toLocaleString()}<br>
      📏 ${r.distance} m<br>
      ⏱ ${Math.floor(r.duration / 60)} min<br><br>
      <button>Pokaż</button>
    `;

    div.querySelector("button").onclick = () => showSavedRoute(r);
    box.appendChild(div);
  });
}

// ============================
// 👁 PREVIEW ROUTE
// ============================

function showSavedRoute(r) {
  const old = document.getElementById("routePreview");
  if (old) old.remove();

  const box = document.createElement("div");
  box.id = "routePreview";

  box.innerHTML = `
    <h3>🥾 Trasa</h3>
    📅 ${new Date(r.created_at).toLocaleString()}<br>
    📏 ${r.distance} m<br>
    ⏱ ${Math.floor(r.duration / 60)} min
    <div id="previewMap" style="height:200px"></div>
    <button id="closePreview">Zamknij</button>
  `;

  document.body.appendChild(box);

  const m = L.map("previewMap");

  L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png").addTo(m);

  const line = L.polyline(r.points, {
    color: "red",
    weight: 5
  }).addTo(m);

  m.fitBounds(line.getBounds());

  document.getElementById("closePreview").onclick = () => box.remove();
}

// ============================
// 🧷 BUTTONS
// ============================

document.addEventListener("DOMContentLoaded", () => {
  const start = document.getElementById("startRouteBtn");
  const pause = document.getElementById("pauseRouteBtn");
  const end = document.getElementById("endRouteBtn");
  const center = document.getElementById("centerRouteBtn");

  start?.addEventListener("click", () => {
    startRoute();
    start.style.display = "none";
    pause.style.display = "block";
    end.style.display = "block";
  });

  pause?.addEventListener("click", () => {
    routePaused = !routePaused;

    if (routePaused) pausedAt = Date.now();
    else totalPausedTime += Date.now() - pausedAt;

    pause.innerText = routePaused ? "▶ Wznów" : "⏸ Pauza";
  });

  end?.addEventListener("click", () => {
    endRoute();
    start.style.display = "block";
    pause.style.display = "none";
    end.style.display = "none";
  });

  center?.addEventListener("click", () => {
    if (window.userLat && window.userLng && routeMap) {
      routeMap.setView([window.userLat, window.userLng], 17);
    }
  });

  initRouteMap();
  showSavedRoutes();
});
