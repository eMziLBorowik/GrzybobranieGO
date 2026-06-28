// ============================
// 👤 PROFIL SYSTEM v3 CLEAN
// Leśna Przygoda
// SAFE + UI + SUPABASE
// ============================

console.log("👤 profile.js LOADED");

// ============================
// 📦 STATE
// ============================

let profileData = {
  totalDistance: 0,
  routesCount: 0,
  forestsVisited: 0,
  bestForest: null,
  exploration: 0
};

// ============================
// 🔌 SUPABASE SAFE
// ============================

function sb() {
  return window.supabase || null;
}

// ============================
// 🚀 MAIN LOAD
// ============================

async function loadProfile() {

  const box = document.getElementById("profileContent");
  if (!box) return;

  box.innerHTML = `
    <div class="card">
      ⏳ Ładowanie profilu...
    </div>
  `;

  const supabase = sb();
  if (!supabase) {
    box.innerHTML = `<div class="card">❌ Supabase nie gotowy</div>`;
    return;
  }

  const { data } = await supabase.auth.getUser();
  const user = data?.user;

  if (!user) {
    box.innerHTML = `<div class="card">❌ Brak użytkownika</div>`;
    return;
  }

  try {

    await Promise.all([
      loadRoutes(supabase, user.id),
      loadExploration(supabase)
    ]);

    renderProfile();

  } catch (e) {
    console.log("PROFILE ERROR:", e);
    box.innerHTML = `<div class="card">❌ Błąd ładowania profilu</div>`;
  }
}

// ============================
// 🥾 ROUTES
// ============================

async function loadRoutes(supabase, userId) {

  const { data } = await supabase
    .from("routes")
    .select("*")
    .eq("user_id", userId);

  if (!data) return;

  profileData.routesCount = data.length;

  let total = 0;

  data.forEach(r => {
    total += r.distance || 0;
  });

  profileData.totalDistance = total / 1000;
}

// ============================
// 🌲 FOREST EXP
// ============================

async function loadExploration(supabase) {

  const { data } = await supabase
    .from("forest_exploration")
    .select("*");

  if (!data || data.length === 0) return;

  let totalRevealed = 0;
  let totalCells = 0;
  let best = null;

  for (let f of data) {

    totalRevealed += f.revealed_cells?.length || 0;
    totalCells += f.total_cells || 0;

    if (!best || (f.coverage_percent || 0) > (best.coverage_percent || 0)) {
      best = f;
    }
  }

  profileData.exploration =
    totalCells === 0
      ? 0
      : Math.round((totalRevealed / totalCells) * 100);

  profileData.bestForest = best;
}

// ============================
// 🌲 FOREST NAME
// ============================

function getForestName(id) {

  if (!window.forests) return "Nieznany las";

  const f = window.forests.find(x => {
    if (!x.geometry?.[0]) return false;

    let lat = x.geometry[0][0][0];
    let lng = x.geometry[0][0][1];

    return (lat.toFixed(5) + "_" + lng.toFixed(5)) === id;
  });

  return f?.name || "Nieznany las";
}

// ============================
// 📊 RENDER UI
// ============================

function renderProfile() {

  const box = document.getElementById("profileContent");
  if (!box) return;

  const p = window.player || { level: 1, exp: 0 };

  const expNeed = window.getExpNeeded?.(p.level) || 100;
  const percent = Math.min(100, (p.exp / expNeed) * 100);

  const best = profileData.bestForest;
  const bestName = best ? getForestName(best.forest_id) : "Brak danych";
  const bestPercent = best?.coverage_percent || 0;

  box.innerHTML = `
    
    <div class="card">
      👤 PROFIL GRACZA<br><br>

      🌿 Poziom <b>${p.level}</b> (${window.getRank?.(p.level) || "?"})<br><br>

      <div style="width:100%;height:10px;background:#162013;border-radius:10px;overflow:hidden;">
        <div style="width:${percent}%;height:100%;background:#6b8f3d;"></div>
      </div>

      <small>${Math.floor(p.exp)} / ${expNeed} EXP</small>
    </div>


    <div class="card">
      📊 STATYSTYKI<br><br>

      📏 Dystans: <b>${profileData.totalDistance.toFixed(2)} km</b><br>
      🥾 Trasy: <b>${profileData.routesCount}</b><br>
      🌲 Eksploracja: <b>${profileData.exploration}%</b>
    </div>


    <div class="card">
      🏆 NAJLEPSZY LAS<br><br>

      🌲 ${bestName}<br>
      📊 ${bestPercent}% odkrycia<br><br>

      <div style="width:100%;height:10px;background:#162013;border-radius:10px;overflow:hidden;">
        <div style="width:${bestPercent}%;height:100%;background:#00ff88;"></div>
      </div>
    </div>

  `;
}

// ============================
// 🌍 EXPORT GLOBAL
// ============================

window.loadProfile = loadProfile;
window.renderProfile = renderProfile;
