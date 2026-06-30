// ============================
// 👤 PROFIL SYSTEM GAMING + AVATAR RING
// Leśna Przygoda
// ============================

console.log("👤 profile.js RING LOADED");

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
    loadStats(supabase, user.id),
    loadExploration(supabase)
  ]);

  renderProfile();
}

// ============================
// STATS
// ============================

async function loadStats(sb, userId) {

  const { data } = await sb
    .from("profiles")
    .select("total_distance, total_routes_lifetime")
    .eq("user_id", userId)
    .single();

  if (!data) return;

  profileData.totalDistance = (data.total_distance || 0) / 1000;
  profileData.routesCount = data.total_routes_lifetime || 0;
}

// ============================
// FOREST EXP
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

  profileData.exploration = total ? Math.round((revealed / total) * 100) : 0;
  profileData.bestForest = best;
}

// ============================
// EXP RING CALC
// ============================

function expRing(percent) {
  const r = 52;
  const c = 2 * Math.PI * r;
  const offset = c - (percent / 100) * c;

  return `
  <svg class="expRing" width="130" height="130">
    <circle cx="65" cy="65" r="${r}" />
    <circle cx="65" cy="65" r="${r}"
      style="stroke-dasharray:${c};stroke-dashoffset:${offset};"
    />
  </svg>`;
}

// ============================
// RENDER
// ============================

function renderProfile() {

  const box = document.getElementById("profileContent");
  if (!box) return;

  const p = window.player || { level: 1, exp: 0 };
  const need = window.getExpNeeded?.(p.level) || 100;

  const percent = Math.min(100, (p.exp / need) * 100);
  const best = profileData.bestForest;

  box.innerHTML = `

  <div class="profileTop">

    <!-- AVATAR + RING -->
    <div class="avatarWrap">

      ${expRing(percent)}

      <div class="avatar">
        <img src="https://api.dicebear.com/7.x/forest/svg?seed=${p.level}" />
      </div>

      <div class="lvlBadge">LVL ${p.level}</div>

    </div>

    <!-- INFO -->
    <div class="info">
      <div class="name">🌲 Leśny Wędrowiec</div>
      <div class="rank">${window.getRank?.(p.level) || "Nowicjusz"}</div>

      <div class="expText">${Math.floor(p.exp)} / ${need} EXP</div>

      <div class="expBar">
        <div style="width:${percent}%"></div>
      </div>
    </div>

  </div>

  <div class="grid">

    <div class="card stat">
      📏<br>
      <b>${profileData.totalDistance.toFixed(2)} km</b>
      <div>Dystans</div>
    </div>

    <div class="card stat">
      🥾<br>
      <b>${profileData.routesCount}</b>
      <div>Trasy</div>
    </div>

    <div class="card stat">
      🌲<br>
      <b>${profileData.exploration}%</b>
      <div>Las</div>
    </div>

  </div>

  <div class="card forest">

    <div class="title">🏆 Najlepszy las</div>

    <div class="value">
      ${best ? best.forest_id : "Brak danych"}
    </div>

    <div class="sub">
      ${best?.coverage_percent || 0}% odkrycia
    </div>

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
