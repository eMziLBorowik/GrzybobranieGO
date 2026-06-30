// ============================
// 👤 PROFIL SYSTEM v5 SUPABASE STABLE
// Leśna Przygoda
// ============================

console.log("👤 profile.js LOADED (SUPABASE STABLE)");

let profileData = {
  totalDistance: 0,
  routesCount: 0,
  exploration: 0,
  bestForest: null
};

// ============================
// SUPABASE SAFE
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
    box.innerHTML = `<div class="card">❌ Brak użytkownika</div>`;
    return;
  }

  await Promise.all([
    loadProfileStats(supabase, user.id),
    loadExploration(supabase)
  ]);

  renderProfile();
}

// ============================
// PROFILE STATS (NOWE ŹRÓDŁO PRAWDY)
// ============================

async function loadProfileStats(sb, userId) {

  const { data } = await sb
    .from("profiles")
    .select("*")
    .eq("user_id", userId)
    .single();

  if (!data) return;

  profileData.totalDistance = (data.total_distance || 0);
  profileData.routesCount = data.total_routes || 0;
}

// ============================
// EXPLORATION (FORESTS)
// ============================

async function loadExploration(sb) {

  const { data } = await sb
    .from("explored_forests")
    .select("*");

  if (!data || data.length === 0) return;

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
// XP RING UI
// ============================

function xpRing(level, exp, need) {

  const percent = Math.min(100, (exp / need) * 100);
  const r = 54;
  const c = 2 * Math.PI * r;
  const offset = c - (percent / 100) * c;

  return `
  <div class="xpWrap">
    <svg width="140" height="140">
      <circle cx="70" cy="70" r="${r}" stroke="#1b2a1b" stroke-width="10" fill="none"/>
      <circle cx="70" cy="70" r="${r}"
        stroke="#00ff88"
        stroke-width="10"
        fill="none"
        stroke-dasharray="${c}"
        stroke-dashoffset="${offset}"
        stroke-linecap="round"
      />
    </svg>

    <div class="xpCenter">
      <div class="lvl">LVL ${level}</div>
      <div class="txt">${Math.floor(percent)}%</div>
    </div>
  </div>`;
}

// ============================
// RENDER PROFILE
// ============================

function renderProfile() {

  const box = document.getElementById("profileContent");
  if (!box) return;

  const p = window.player || { level: 1, exp: 0 };
  const need = window.getExpNeeded?.(p.level) || 100;

  const best = profileData.bestForest;

  box.innerHTML = `

  <div class="profileHeader">
    ${xpRing(p.level, p.exp, need)}

    <div class="profileName">
      🌲 Leśny Wędrowiec<br>
      <span>${window.getRank?.(p.level) || "Nowicjusz"}</span>
    </div>
  </div>

  <div class="grid">

    <div class="card stat">
      📏<br>
      <b>${profileData.totalDistance.toFixed(2)} km</b>
      <div>Łączny dystans (SUPABASE)</div>
    </div>

    <div class="card stat">
      🥾<br>
      <b>${profileData.routesCount}</b>
      <div>Trasy (historyczne)</div>
    </div>

    <div class="card stat">
      🌲<br>
      <b>${profileData.exploration}%</b>
      <div>Eksploracja lasów</div>
    </div>

  </div>

  <div class="card highlight">

    🏆 NAJLEPSZY LAS<br><br>

    <b>${best ? best.forest_id : "Brak danych"}</b><br>
    <small>${best?.coverage_percent || 0}% odkrycia</small>

    <div class="bar">
      <div style="width:${best?.coverage_percent || 0}%"></div>
    </div>

  </div>

  `;
}

// ============================
// EXPORT
// ============================

window.loadProfile = loadProfile;
window.renderProfile = renderProfile;
