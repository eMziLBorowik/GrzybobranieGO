// ============================
// 👤 PROFIL SYSTEM STABLE FIX
// Leśna Przygoda
// ============================

console.log("👤 profile.js LOADED");

// ============================
// STATE
// ============================

let profileData = {
  totalDistance: 0,
  routesCount: 0,
  exploration: 0,
  bestForest: null
};

// ============================
// SUPABASE SAFE ACCESS
// ============================

function sb() {
  return window.supabase || null;
}

// ============================
// LOAD PROFILE (MAIN)
// ============================

async function loadProfile() {

  const box = document.getElementById("profileContent");
  if (!box) return;

  box.innerHTML = "⏳ Ładowanie profilu...";

  const supabase = sb();

  if (!supabase) {
    box.innerHTML = "❌ Supabase offline";
    return;
  }

  const { data } = await supabase.auth.getUser();
  const user = data?.user;

  if (!user) {
    box.innerHTML = "❌ Brak użytkownika";
    return;
  }

  try {

    await Promise.all([
      loadStats(supabase, user.id),
      loadExploration(supabase)
    ]);

    renderProfile();

  } catch (err) {
    console.log("PROFILE ERROR:", err);
    box.innerHTML = "❌ Błąd ładowania profilu";
  }
}

// ============================
// 📊 STATS (FROM PROFILES TABLE)
// ============================

async function loadStats(sb, userId) {

  const { data, error } = await sb
    .from("profiles")
    .select("total_distance, total_routes_lifetime")
    .eq("user_id", userId)
    .single();

  if (error || !data) {
    console.log("profiles error:", error);
    return;
  }

  profileData.totalDistance = (data.total_distance || 0) / 1000;
  profileData.routesCount = data.total_routes_lifetime || 0;
}

// ============================
// 🌲 FOREST EXP
// ============================

async function loadExploration(sb) {

  const { data, error } = await sb
    .from("forest_exploration")
    .select("*");

  if (error || !data) return;

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
// RENDER (YOUR UI SAFE)
// ============================

function renderProfile() {

  const box = document.getElementById("profileContent");
  if (!box) return;

  const p = window.player || { level: 1, exp: 0 };
  const need = window.getExpNeeded?.(p.level) || 100;

  const best = profileData.bestForest;

  const expPercent = Math.min(100, (p.exp / need) * 100);

  box.innerHTML = `
    
    <div class="card">
      👤 PROFIL GRACZA
      <br><br>

      🌿 LVL ${p.level} (${window.getRank?.(p.level) || "Nowicjusz"})<br>

      <div style="width:100%;height:8px;background:#162013;border-radius:10px;overflow:hidden;margin-top:8px;">
        <div style="width:${expPercent}%;height:100%;background:#6b8f3d;"></div>
      </div>

      <small>${Math.floor(p.exp)} / ${need} EXP</small>
    </div>


    <div class="card">
      📊 STATYSTYKI
      <br><br>

      📏 Dystans: <b>${profileData.totalDistance.toFixed(2)} km</b><br>
      🥾 Trasy: <b>${profileData.routesCount}</b><br>
      🌲 Eksploracja: <b>${profileData.exploration}%</b>
    </div>


    <div class="card">
      🏆 NAJLEPSZY LAS
      <br><br>

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
