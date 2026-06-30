// ============================
// 👤 PROFIL SYSTEM GAMING UI v2
// Leśna Przygoda
// ============================

console.log("👤 profile.js GAMING LOADED");

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

  box.innerHTML = `<div class="card glow">⏳ Ładowanie profilu...</div>`;

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

  try {
    await Promise.all([
      loadStats(supabase, user.id),
      loadExploration(supabase)
    ]);

    renderProfile();

  } catch (err) {
    console.log("PROFILE ERROR:", err);
    box.innerHTML = `<div class="card">❌ Błąd profilu</div>`;
  }
}

// ============================
// STATS
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
// FOREST EXP
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

  profileData.exploration = total ? Math.round((revealed / total) * 100) : 0;
  profileData.bestForest = best;
}

// ============================
// UI HELPERS (GLASS CARDS)
// ============================

function statCard(icon, value, label) {
  return `
    <div class="card statCard">
      <div class="icon">${icon}</div>
      <div class="value">${value}</div>
      <div class="label">${label}</div>
    </div>
  `;
}

// ============================
// RENDER GAMING UI
// ============================

function renderProfile() {

  const box = document.getElementById("profileContent");
  if (!box) return;

  const p = window.player || { level: 1, exp: 0 };
  const need = window.getExpNeeded?.(p.level) || 100;

  const expPercent = Math.min(100, (p.exp / need) * 100);
  const best = profileData.bestForest;

  box.innerHTML = `

  <div class="profileWrap">

    <!-- HEADER CARD -->
    <div class="card profileHeader glow">

      <div class="levelCircle">
        <div class="levelText">LVL ${p.level}</div>
        <div class="expText">${Math.floor(expPercent)}%</div>
      </div>

      <div class="profileInfo">
        <div class="name">🌲 Leśny Wędrowiec</div>
        <div class="rank">${window.getRank?.(p.level) || "Nowicjusz"}</div>

        <div class="expBar">
          <div style="width:${expPercent}%"></div>
        </div>

        <div class="expNumbers">
          ${Math.floor(p.exp)} / ${need} EXP
        </div>
      </div>

    </div>

    <!-- STATS GRID -->
    <div class="statsGrid">

      ${statCard("📏", profileData.totalDistance.toFixed(2) + " km", "Dystans")}
      ${statCard("🥾", profileData.routesCount, "Trasy")}
      ${statCard("🌲", profileData.exploration + "%", "Eksploracja")}

    </div>

    <!-- BEST FOREST -->
    <div class="card forestCard">

      <div class="forestTitle">🏆 NAJLEPSZY LAS</div>

      <div class="forestName">
        ${best ? best.forest_id : "Brak danych"}
      </div>

      <div class="forestPercent">
        ${best?.coverage_percent || 0}% odkrycia
      </div>

      <div class="forestBar">
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
