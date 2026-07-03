// ============================
// 👤 PROFIL SYSTEM GAMING + AVATAR RING (FINAL SAFE FIX)
// ============================

console.log("👤 profile.js RING LOADED");

let profileData = {
  totalDistance: 0,
  routesCount: 0,
  exploration: 0,
  bestForest: null
};

// 🔥 BACKFILL FLAG (OLD ROUTES)
window.routesBackfilled =
  localStorage.getItem("routesBackfilled") === "true";


// ============================
// SAFE SUPABASE
// ============================

function sb() {
  return window.supabase || null;
}


// ============================
// BACKFILL OLD ROUTES (ONLY ONCE)
// ============================

async function backfillOldRoutesOnce(supabase, userId) {

  if (window.routesBackfilled) return;

  const { data, error } = await supabase
    .from("routes")
    .select("distance")
    .eq("user_id", userId);

  if (error || !data) return;

  let totalKm = 0;
  let count = data.length || 0;

  for (const r of data) {
    totalKm += (r.distance || 0);
  }

  await supabase
    .from("profiles")
    .update({
      total_distance: totalKm,
      total_routes: count
    })
    .eq("user_id", userId);

  window.routesBackfilled = true;
  localStorage.setItem("routesBackfilled", "true");

  console.log("🚀 BACKFILL ROUTES DONE");
}


// ============================
// LOAD PROFILE
// ============================

async function loadProfile() {

  const box = document.getElementById("profileContent");
  if (!box) return;

  window.profileLoading = true;
  window.dispatchEvent(new Event("profileLoadingStart"));

  box.innerHTML = `<div class="card">⏳ Ładowanie profilu...</div>`;

  const supabase = sb();
  if (!supabase) {
    window.profileLoading = false;
    box.innerHTML = `<div class="card">❌ Supabase offline</div>`;
    return;
  }

  try {

    const { data } = await supabase.auth.getUser();
    const user = data?.user;

    if (!user) {
      window.profileLoading = false;
      box.innerHTML = `<div class="card">❌ Brak użytkownika</div>`;
      return;
    }

    await backfillOldRoutesOnce(supabase, user.id);

    await Promise.all([
      loadStats(supabase, user.id),
      loadExploration(supabase)
    ]);

    renderProfile();

    window.profileLoading = false;
    window.dispatchEvent(new Event("profileLoaded"));

  } catch (err) {
    console.error("PROFILE ERROR:", err);

    window.profileLoading = false;
    box.innerHTML = `<div class="card">❌ Błąd profilu</div>`;
  }
}


// ============================
// STATS (FIXED – NO 406 + SAFE TYPES)
// ============================

async function loadStats(sb, userId) {

  const { data, error } = await sb
    .from("profiles")
    .select("total_distance, total_routes")
    .eq("user_id", userId)
    .maybeSingle(); // 🔥 FIX 406

  if (error || !data) {
    profileData.routesCount = 0;
    profileData.totalDistance = 0;
    return;
  }

  profileData.routesCount = Number(data.total_routes) || 0;

  const dbKm = Number(data.total_distance) || 0;
  const liveKm = Number(window.expState?.distance) || 0;

  profileData.totalDistance = (dbKm + liveKm) / 1000;
}


// ============================
// FOREST EXP (FIXED TABLE NAME)
// ============================

async function loadExploration(sb) {

  const { data, error } = await sb
    .from("explored_forests")
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

  profileData.exploration = total
    ? Math.round((revealed / total) * 100)
    : 0;

  profileData.bestForest = best;
}


// ============================
// EXP RING (UNCHANGED UI)
// ============================

function expRing(percent) {

  const safePercent =
    isNaN(percent) ? 0 : Math.max(0, Math.min(100, percent));

  const r = 52;
  const c = 2 * Math.PI * r;
  const offset = c - (safePercent / 100) * c;

  return `
  <svg class="xpRing" width="130" height="130" viewBox="0 0 130 130">
    <circle cx="65" cy="65" r="${r}" />
    <circle cx="65" cy="65" r="${r}"
      style="stroke-dasharray:${c};stroke-dashoffset:${offset};"
    />
  </svg>`;
}


// ============================
// RENDER (UNCHANGED VISUAL)
// ============================

function renderProfile() {

  const box = document.getElementById("profileContent");
  if (!box) return;

  const p = window.player || { level: 1, exp: 0 };
  const need = window.getExpNeeded?.(p.level) || 100;

  const safeExp = Number(p.exp) || 0;

  const percent = need
    ? Math.min(100, (safeExp / need) * 100)
    : 0;

  const best = profileData.bestForest;

  const km = Number(profileData.totalDistance) || 0;

  box.innerHTML = `

  <div style="padding-top:20px;"></div>

  <div class="profileTop">

    <div class="avatarWrap">

      ${expRing(percent)}

      <div class="avatar">
        <img src="https://api.dicebear.com/7.x/forest/svg?seed=${p.level || 1}" />
      </div>

      <div class="lvlBadge">LVL ${p.level || 1}</div>

    </div>

    <div class="info">
      <div class="name">${p.nick || "Gracz"}</div>
      <div class="rank">${window.getRank?.(p.level) || "Nowicjusz"}</div>

      <div class="expText">
        ${Math.floor(safeExp)} / ${need} EXP
      </div>

      <div class="expBar">
        <div style="width:${percent}%"></div>
      </div>
    </div>

  </div>

  <div class="grid">

    <div class="card stat">
      📏<br>
      <b>${km.toFixed(2)}</b> km
      <div>Dystans</div>
    </div>

    <div class="card stat">
      🥾<br>
      <b>${profileData.routesCount}</b>
      <div>Trasy</div>
    </div>

  </div>

  <div style="
    display:flex;
    justify-content:center;
    margin-top:15px;
  ">

    <div class="card forest"
      style="width:100%;max-width:320px;text-align:center;">

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

  </div>

  `;
}


// ============================
// EXPORT
// ============================

window.loadProfile = loadProfile;
window.renderProfile = renderProfile;
