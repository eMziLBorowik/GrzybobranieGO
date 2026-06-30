let routeMap = null;

let routeLine = null;
let routePoints = [];

let routeRunning = false;
let routePaused = false;

let routeStartTime = null;
let routeTimer = null;

let routeDistance = 0;

let routeMarker = null;
window.routeGpsMarker = null;

let savedRoutes = [];

let pausedAt = null;
let totalPausedTime = 0;

let gpsInterval = null;

let activeForest = null;
let forestGridLayer = null;
let forestExplorationState = {};

// ============================
// SAFETY HELPERS
// ============================

function sb(){
  return window.supabase || null;
}

// ============================
// INIT MAP (FIXED STABLE)
// ============================

function initRouteMap(){

  if(routeMap) return;

  const el = document.getElementById("routeMiniMap");
  if(!el) return;

  routeMap = L.map(el, {
    zoomControl:false,
    attributionControl:false
  });

  L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
    attribution:"© OpenStreetMap"
  }).addTo(routeMap);

  let lat = window.userLat;
  let lng = window.userLng;

  if(lat && lng){
    routeMap.setView([lat, lng], 17);

    if(!window.routeGpsMarker){
      window.routeGpsMarker = L.marker([lat, lng], {
        icon: L.divIcon({
          className: "gpsMarker",
          html: "📍",
          iconSize: [30, 30]
        })
      }).addTo(routeMap);
    } else {
      window.routeGpsMarker.setLatLng([lat, lng]);
    }

  } else {
    routeMap.setView([52, 19], 6);
  }

  setTimeout(() => {
    routeMap?.invalidateSize();
  }, 500);
}

// ============================
// UPDATE GPS MARKER
// ============================

function updateGps(lat, lng){
  if(window.routeGpsMarker){
    window.routeGpsMarker.setLatLng([lat, lng]);
  }
}

// ============================
// START ROUTE
// ============================

function startRoute(){

  if(!routeMap) initRouteMap();

  routePoints = [];
  routeDistance = 0;

  routeStartTime = Date.now();

  routeRunning = true;
  routePaused = false;

  pausedAt = null;
  totalPausedTime = 0;

  activeForest = null;

  forestGridLayer?.remove();
  forestGridLayer = null;

  routeLine = L.polyline([], {
    color:"red",
    weight:6
  }).addTo(routeMap);

  gpsInterval = setInterval(() => {

    if(!routeRunning || routePaused) return;

    if(window.userLat && window.userLng){
      addRoutePoint(window.userLat, window.userLng);
    }

  }, 15000);

  routeTimer = setInterval(updateRouteTime, 1000);
}

// ============================
// ADD POINT
// ============================

let lastPoint = null;

function addRoutePoint(lat,lng){

  if(!routeRunning || routePaused) return;

  if(lastPoint){
    let d = L.latLng(lastPoint).distanceTo(L.latLng(lat,lng));
    if(d < 3) return;
  }

  lastPoint = [lat,lng];

  const point = [lat,lng];

  routePoints.push(point);
  routeLine.addLatLng(point);

  if(routePoints.length > 1){
    let last = routePoints[routePoints.length - 2];
    routeDistance += L.latLng(last).distanceTo(L.latLng(point));
  }

  document.getElementById("routeDistance") &&
  (document.getElementById("routeDistance").innerText =
    Math.round(routeDistance) + " m");

  updateGps(lat, lng);

  if(routeMarker){
    routeMarker.setLatLng(point);
  }

  let forest = findForest(lat,lng);

  if(forest){
    if(!activeForest || normalizeForestId(activeForest) !== normalizeForestId(forest)){
      activeForest = forest;
      createForestGrid(forest);
    }
    revealForestCell(lat,lng);
  }
}

// ============================
// TIMER
// ============================

function updateRouteTime(){

  if(!routeStartTime || routePaused) return;

  let sec = Math.floor((Date.now()-routeStartTime-totalPausedTime)/1000);

  let min = Math.floor(sec/60);
  let seconds = sec % 60;

  const el = document.getElementById("routeTime");
  if(el){
    el.innerText = `${min} min ${seconds} s`;
  }
}

// ============================
// END ROUTE (FIXED)
// ============================

async function endRoute(){

  routeRunning = false;

  clearInterval(routeTimer);
  clearInterval(gpsInterval);

  let time =
    Math.floor((Date.now()-routeStartTime-totalPausedTime)/1000);

  if(routePoints.length <= 1) return;

  const supabase = sb();
  if(!supabase) return;

  const { data:{user} } = await supabase.auth.getUser();
  if(!user) return;

  await supabase.from("routes").insert([{
    user_id: user.id,
    name: "Trasa",
    points: routePoints,
    distance: Math.round(routeDistance),
    duration: time
  }]);

  const { data: prof } = await supabase
    .from("profiles")
    .select("total_distance, total_routes_lifetime")
    .eq("user_id", user.id)
    .single();

  await supabase.from("profiles").upsert({
    user_id: user.id,
    total_distance: (prof?.total_distance || 0) + Math.round(routeDistance),
    total_routes_lifetime: (prof?.total_routes_lifetime || 0) + 1
  });

  await enforceRouteLimit();
  await showSavedRoutes?.();
  await saveForestExploration?.();
}

// ============================
// LIMIT ROUTES
// ============================

async function enforceRouteLimit(){

  const supabase = sb();
  if(!supabase) return;

  const { data:{user} } = await supabase.auth.getUser();
  if(!user) return;

  const { data } = await supabase
    .from("routes")
    .select("id,created_at")
    .eq("user_id",user.id)
    .order("created_at",{ascending:true});

  if(!data || data.length <= 15) return;

  const toDelete = data.slice(0, data.length - 15);

  await supabase.from("routes")
    .delete()
    .in("id", toDelete.map(r => r.id));
}

// ============================
// BUTTONS
// ============================

document.addEventListener("DOMContentLoaded", () => {

  document.getElementById("startRouteBtn")?.addEventListener("click", startRoute);

  document.getElementById("pauseRouteBtn")?.addEventListener("click", () => {
    routePaused = !routePaused;

    if(routePaused){
      pausedAt = Date.now();
    } else {
      totalPausedTime += Date.now() - pausedAt;
      pausedAt = null;
    }
  });

  document.getElementById("endRouteBtn")?.addEventListener("click", endRoute);

  document.getElementById("centerRouteBtn")?.addEventListener("click", () => {
    if(window.userLat && window.userLng){
      routeMap?.setView([window.userLat, window.userLng], 17);
    }
  });

  initRouteMap();
});
