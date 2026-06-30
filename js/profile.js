// ============================
// 👤 PROFIL SYSTEM GAMING + AVATAR RING (FIXED SAFE)
// ============================

console.log("👤 profile.js RING LOADED");

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

  try {

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

  } catch (err) {
    console.error("PROFILE ERROR:", err);
    box.innerHTML = `<div class="card">❌ Błąd profilu</div>`;
  }
}

// ============================
// STATS (SAFE)
// ============================

async function loadStats(sb, userId) {

  const { data, error } = await sb
    .from("profiles")
    .select("total_distance, total_routes_lifetime")
    .eq("user_id", userId)
    .single();

  if (error || !data) return;

  profileData.totalDistance = (data.total_distance || 0) / 1000;
  profileData.routesCount = data.total_routes_lifetime || 0;
}

// ============================
// FOREST EXP (SAFE)
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

    revealed += (f?.revealed_cells?.length || 0);
    total += (f?.total_cells || 0);

    const cov = f?.coverage_percent || 0;

    if (!best || cov > (best?.coverage_percent || 0)) {
      best = f;
    }
  }

  profileData.exploration = total ? Math.round((revealed / total) * 100) : 0;
  profileData.bestForest = best;
}

// ============================
// EXP RING (SAFE SVG)
// ============================

function expRing(percent) {

  const safePercent = isNaN(percent) ? 0 : Math.max(0, Math.min(100, percent));

  const r = 52;
  const c = 2 * Math.PI * r;
  const offset = c - (safePercent / 100) * c;

  return `
  <svg class="expRing" width="130" height="130" viewBox="0 0 130 130">
    <circle cx="65" cy="65" r="${r}" />
    <circle cx="65" cy="65" r="${r}"
      style="stroke-dasharray:${c};stroke-dashoffset:${offset};"
    />
  </svg>`;
}

// ============================
// RENDER (SAFE UI)
// ============================

function renderProfile() {

  const box = document.getElementById("profileContent");
  if (!box) return;

  const p = window.player || { level: 1, exp: 0 };
  const need = window.getExpNeeded?.(p.level) || 100;

  const safeExp = isNaN(p.exp) ? 0 : p.exp;

  const percent = need ? Math.min(100, (safeExp / need) * 100) : 0;

  const best = profileData.bestForest;

  box.innerHTML = `

  <div class="profileTop">

    <div class="avatarWrap">

      ${expRing(percent)}

      <div class="avatar">
        <img src="https://api.dicebear.com/7.x/forest/svg?seed=${p.level || 1}" />
      </div>

      <div class="lvlBadge">LVL ${p.level || 1}</div>

    </div>

    <div class="info">
      <div class="name">🌲 Leśny Wędrowiec</div>
      <div class="rank">${window.getRank?.(p.level) || "Nowicjusz"}</div>

      <div class="expText">${Math.floor(safeExp)} / ${need} EXP</div>

      <div class="expBar">
        <div style="width:${percent}%"></div>
      </div>
    </div>

  </div>

  <div class="grid">

    <div class="card stat">
      📏<br>
      <b>${profileData.totalDistance.toFixed(2)}</b> km
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
      ${best?.forest_id || "Brak danych"}
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
