// ============================
// 👤 PROFIL SYSTEM v2 SAFE
// Leśna Przygoda
// SUPABASE SAFE (requires supabase.js)
// ============================

console.log("👤 Profile system ready");

let profileData = {
  totalDistance: 0,
  routesCount: 0,
  forestsVisited: 0,
  bestForest: null,
  exploration: 0
};


// ============================
// ⛔ SAFE SUPABASE CHECK
// ============================

function getSupabase() {
  if (!window.supabase) {
    console.log("⛔ Supabase not ready");
    return null;
  }
  return window.supabase;
}


// ============================
// 📊 LOAD PROFILE
// ============================

async function loadProfile() {

  const box = document.getElementById("profileContent");
  if (!box) return;

  box.innerHTML = "⏳ Ładowanie profilu...";

  const sb = getSupabase();
  if (!sb) {
    box.innerHTML = "⛔ Supabase nie gotowy";
    return;
  }

  const { data } = await sb.auth.getUser();
  const user = data?.user;

  if (!user) {
    box.innerHTML = "❌ Brak użytkownika";
    return;
  }

  await Promise.all([
    loadRoutes(sb, user.id),
    loadExploration(sb),
  ]);

  renderProfile();
}


// ============================
// 🥾 TRASY
// ============================

async function loadRoutes(sb, userId) {

  const { data } = await sb
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
// 🌲 LASY
// ============================

async function loadExploration(sb) {

  const { data } = await sb
    .from("forest_exploration")
    .select("*");

  if (!data || data.length === 0) return;

  let totalRevealed = 0;
  let totalCells = 0;

  let best = data[0];

  data.forEach(f => {

    totalRevealed += f.revealed_cells?.length || 0;
    totalCells += f.total_cells || 0;

    if ((f.coverage_percent || 0) > (best.coverage_percent || 0)) {
      best = f;
    }
  });

  profileData.exploration =
    totalCells === 0 ? 0 : Math.round((totalRevealed / totalCells) * 100);

  profileData.bestForest = best;
}


// ============================
// 🌲 NAZWA LASU SAFE
// ============================

function getForestName(id) {

  if (!window.forests) return id;

  const f = window.forests.find(x => {
    if (!x.geometry || !x.geometry[0]) return false;

    let lat = x.geometry[0][0][0];
    let lng = x.geometry[0][0][1];

    return (lat.toFixed(5) + "_" + lng.toFixed(5)) === id;
  });

  return f?.name || id;
}


// ============================
// 📊 RENDER
// ============================

function renderProfile() {

  const box = document.getElementById("profileContent");
  if (!box) return;

  const p = window.player || { level: 1, exp: 0 };

  const expNeed = window.getExpNeeded ? window.getExpNeeded(p.level) : 100;
  const percent = Math.min(100, (p.exp / expNeed) * 100);

  const bestForestName = profileData.bestForest
    ? getForestName(profileData.bestForest.forest_id)
    : "Brak danych";

  const bestPercent = profileData.bestForest?.coverage_percent || 0;

  box.innerHTML = `
    
    <div class="card">
      👤 Profil gracza<br><br>

      🌿 Poziom ${p.level} (${window.getRank ? window.getRank(p.level) : "?"})<br>

      <div style="width:100%;height:8px;background:#162013;border-radius:10px;overflow:hidden;margin-top:8px;">
        <div style="width:${percent}%;height:100%;background:#6b8f3d;"></div>
      </div>

      <small>${Math.floor(p.exp)} / ${expNeed} EXP</small>
    </div>


    <div class="card">
      📊 Statystyki<br><br>

      📏 Dystans: ${profileData.totalDistance.toFixed(2)} km<br>
      🥾 Trasy: ${profileData.routesCount}<br>
      🌲 Eksploracja: ${profileData.exploration}%
    </div>


    <div class="card">
      🌲 Najlepszy las<br><br>

      ${bestForestName}<br>

      📊 ${bestPercent}%<br>

      <div style="width:100%;height:8px;background:#162013;border-radius:10px;overflow:hidden;margin-top:8px;">
        <div style="width:${bestPercent}%;height:100%;background:#6b8f3d;"></div>
      </div>
    </div>

  `;
}


// ============================
// 🌍 EXPORT
// ============================

window.loadProfile = loadProfile;