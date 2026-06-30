// ============================
// 👤 PROFIL SYSTEM v5 SAFE (SUPABASE STATS)
// Leśna Przygoda
// ============================

console.log("👤 profile.js v5 LOADED");

let profileData = {
  totalDistance: 0,
  routesCount: 0,
  exploration: 0,
  bestForest: null
};

// ============================
// SAFE SUPABASE
// ============================

function sb() {
  return window.supabase || null;
}

// ============================
// LOAD PROFILE
// ============================

async function loadProfile() {

  const box = document.getElementById("profileContent");
  if (!box) return;

  box.innerHTML = `<div class="card">⏳ Ładowanie profilu...</div>`;

  const supabase = sb();
  if (!supabase) {
    box.innerHTML = `<div class="card">❌ Supabase offline</div>`;
    return;
  }

  const { data } = await supabase.auth.getUser();
  const user = data?.user;

  if (!user) {
    box.innerHTML = `<div class="card">❌ Brak konta</div>`;
    return;
  }

  try {

    await Promise.all([
      loadDistance(supabase, user.id),
      loadRoutesCount(supabase, user.id),
      loadExploration(supabase)
    ]);

    renderProfile();

  } catch (e) {
    console.log("PROFILE ERROR:", e);
    box.innerHTML = `<div class="card">❌ Błąd profilu</div>`;
  }
}

// ============================
// 🧭 DISTANCE (NOWE ŹRÓDŁO)
// ============================

async function loadDistance(sb, userId) {

  const { data, error } = await sb
    .from("player_stats")
    .select("total_distance")
    .eq("user_id", userId)
    .maybeSingle();

  if (error) {
    console.log("player_stats missing -> fallback routes");
    return loadDistanceFallback(sb, userId);
  }

  profileData.totalDistance = data?.total_distance || 0;
}

// fallback (jak nie masz tabeli)
async function loadDistanceFallback(sb, userId) {

  const { data } = await sb
    .from("routes")
    .select("distance")
    .eq("user_id", userId);

  if (!data) return;

  let total = 0;
  data.forEach(r => total += r.distance || 0);

  profileData.totalDistance = total / 1000;
}

// ============================
// 🥾 ROUTES COUNT (SAFE)
// ============================

async function loadRoutesCount(sb, userId) {

  const { data } = await sb
    .from("routes")
    .select("id")
    .eq("user_id", userId);

  profileData.routesCount = data?.length || 0;
}

// ============================
// 🌲 FOREST EXP
// ============================

async function loadExploration(sb) {

  const { data } = await sb
    .from("forest_exploration")
    .select("*");

  if (!data) return;

  let revealed = 0;
  let total = 0;
  let best = null;

  for (let f of data) {

    revealed += f.revealed_cells?.length || 0;
    total += f.total_cells || 0;

    if (!best || (f.coverage_percent || 0) > (best.coverage_percent || 0)) {
      best = f;
    }
  }

  profileData.exploration =
    total ? Math.round((revealed / total) * 100) : 0;

  profileData.bestForest = best;
}

// ============================
// UI RENDER
// ============================

function renderProfile() {

  const box = document.getElementById("profileContent");
  if (!box) return;

  const p = window.player || { level: 1, exp: 0 };

  const need = window.getExpNeeded?.(p.level) || 100;
  const percent = Math.min(100, (p.exp / need) * 100);

  const best = profileData.bestForest;

  box.innerHTML = `
    <div class="card">
      👤 PROFIL GRACZA<br><br>

      🌿 Poziom ${p.level} (${window.getRank?.(p.level) || "?"})<br>

      <div style="width:100%;height:8px;background:#162013;border-radius:10px;overflow:hidden;margin-top:8px;">
        <div style="width:${percent}%;height:100%;background:#6b8f3d;"></div>
      </div>

      <small>${Math.floor(p.exp)} / ${need} EXP</small>
    </div>

    <div class="card">
      📊 STATYSTYKI<br><br>

      📏 Dystans: ${profileData.totalDistance.toFixed(2)} km<br>
      🥾 Trasy: ${profileData.routesCount}<br>
      🌲 Eksploracja: ${profileData.exploration}%
    </div>

    <div class="card">
      🏆 NAJLEPSZY LAS<br><br>

      ${best ? best.forest_id : "Brak danych"}<br>
      📊 ${best?.coverage_percent || 0}%<br>

      <div style="width:100%;height:8px;background:#162013;border-radius:10px;overflow:hidden;margin-top:8px;">
        <div style="width:${best?.coverage_percent || 0}%;height:100%;background:#6b8f3d;"></div>
      </div>
    </div>
  `;
}

// ============================
// EXPORT
// ============================

window.loadProfile = loadProfile;
window.renderProfile = renderProfile;
