// ============================
// 🌿 EXP SYSTEM v8.5 STABLE SAFE
// ============================


// 👤 PLAYER INIT (NO RESET PROTECTION)
window.player = window.player || {
  exp: Number(localStorage.getItem("exp")) || 0,
  level: Number(localStorage.getItem("level")) || 1
};


// ============================
// CONFIG
// ============================

const CONFIG = {
  expPer500m: 50,
  forestMultiplier: 1.75,
  maxSpeedKmh: 8,
  maxGpsJump: 100
};


// ============================
// BACKFILL GUARD
// ============================

window.expBackfillDone =
  localStorage.getItem("expBackfillDone") === "true";


// ============================
// SAFE STATE
// ============================

function safeParse(v, fallback) {
  try {
    return JSON.parse(v) ?? fallback;
  } catch {
    return fallback;
  }
}

window.expState =
  safeParse(localStorage.getItem("expState"), null) || {
    lastLat: null,
    lastLng: null,
    distance: 0
  };

function saveEXPState() {
  try {
    localStorage.setItem("expState", JSON.stringify(window.expState));
  } catch {}
}


// ============================
// LEVEL SYSTEM
// ============================

function getExpNeeded(level) {
  let base = 80;
  let exp = Math.floor(base * Math.pow(level, 1.45));

  if (level <= 10) exp *= 0.9;

  return Math.max(1, exp);
}


// ============================
// RANKS
// ============================

function getRank(level) {
  if (level <= 3) return "🌱 Nowicjusz";
  if (level <= 8) return "🌿 Spacerowicz";
  if (level <= 15) return "🧭 Wędrowiec";
  if (level <= 30) return "🥾 Tropiciel";
  if (level <= 50) return "🏹 Łowca Lasu";
  if (level <= 74) return "🔥 Strażnik Natury";
  return "👑 Mistrz Lasu";
}


// ============================
// FOREST CHECK
// ============================

function isInForest() {
  return window.isForest === true;
}


// ============================
// SAFE SUPABASE
// ============================

function sb() {
  return window.supabase || null;
}


// ============================
// LOAD PLAYER (NO RESET BUG FIX)
// ============================

async function loadPlayerFromSupabase() {
  try {

    const supabase = sb();
    if (!supabase) return;

    const { data } = await supabase.auth.getUser();
    const user = data?.user;

    if (!user) return;

    const { data: profile } = await supabase
      .from("profiles")
      .select("level, exp")
      .eq("user_id", user.id)
      .single();

    if (!profile) return;

    if (profile.level != null) {
      window.player.level = profile.level;
      localStorage.setItem("level", profile.level);
    }

    if (profile.exp != null) {
      window.player.exp = profile.exp;
      localStorage.setItem("exp", profile.exp);
    }

  } catch (e) {
    console.log("LOAD ERROR", e);
  }
}


// ============================
// SYNC SAFE
// ============================

let lastSync = 0;

async function syncPlayerToSupabase() {
  try {

    const supabase = sb();
    if (!supabase) return;

    if (Date.now() - lastSync < 5000) return;
    lastSync = Date.now();

    const { data } = await supabase.auth.getUser();
    const user = data?.user;

    if (!user) return;

    await supabase.from("profiles").upsert({
      user_id: user.id,
      level: window.player.level,
      exp: window.player.exp
    });

    localStorage.setItem("level", window.player.level);
    localStorage.setItem("exp", window.player.exp);

  } catch (e) {
    console.log("SYNC ERROR", e);
  }
}


// ============================
// BACKFILL SAFE (NO DOUBLE APPLY)
// ============================

async function backfillEXPFromRoutesByDate() {
  try {

    const supabase = sb();
    if (!supabase) return;

    if (window.expBackfillDone) return;

    const { data: userData } = await supabase.auth.getUser();
    const user = userData?.user;

    if (!user) return;

    const { data: routes } = await supabase
      .from("routes")
      .select("distance")
      .eq("user_id", user.id)
      .order("created_at", { ascending: true });

    if (!routes || routes.length === 0) {
      window.expBackfillDone = true;
      localStorage.setItem("expBackfillDone", "true");
      return;
    }

    let totalExp = 0;

    for (const r of routes) {
      let dist = r.distance || 0;

      let exp = (dist / 500) * CONFIG.expPer500m;

      if (isInForest()) {
        exp *= CONFIG.forestMultiplier;
      }

      totalExp += exp;
    }

    totalExp = Math.floor(totalExp);

    // APPLY SAFE
    window.player.exp += totalExp;

    while (window.player.exp >= getExpNeeded(window.player.level)) {
      window.player.exp -= getExpNeeded(window.player.level);
      window.player.level++;
    }

    window.expBackfillDone = true;
    localStorage.setItem("expBackfillDone", "true");

    console.log("🚀 BACKFILL DONE:", totalExp);

  } catch (e) {
    console.log("BACKFILL ERROR", e);
  }
}


// ============================
// ADD EXP SAFE
// ============================

function addEXP(amount, source = "unknown") {
  if (!amount || amount <= 0) return;

  amount = Math.min(amount, 100);

  window.player.exp += amount;

  while (window.player.exp >= getExpNeeded(window.player.level)) {
    window.player.exp -= getExpNeeded(window.player.level);
    window.player.level++;
  }

  window.updateEXPUI = window.updateEXPUI || function(){};

  try {
    updateEXPUI();
    renderExpHeader?.();
    lockHeader?.();
  } catch (e) {
    console.log("UI ERROR", e);
  }

  syncPlayerToSupabase();
}


// ============================
// GPS TRACKING
// ============================

function trackMovementEXP(lat, lng, speed) {

  if (lat == null || lng == null) return;
  if (typeof L === "undefined") return;

  if (!window.expState.lastLat) {
    window.expState.lastLat = lat;
    window.expState.lastLng = lng;
    saveEXPState();
    return;
  }

  let dist = L.latLng(
    window.expState.lastLat,
    window.expState.lastLng
  ).distanceTo(L.latLng(lat, lng));

  if (!isFinite(dist) || dist < 10) return;

  if (dist > CONFIG.maxGpsJump) {
    window.expState.lastLat = lat;
    window.expState.lastLng = lng;
    saveEXPState();
    return;
  }

  let kmh = speed ? speed * 3.6 : 0;
  if (kmh > CONFIG.maxSpeedKmh) return;

  window.expState.distance += dist;

  if (window.expState.distance >= 500) {

    let reward = CONFIG.expPer500m;

    if (isInForest()) reward *= CONFIG.forestMultiplier;

    addEXP(Math.floor(reward), "500m walk");

    window.expState.distance = 0;
  }

  window.expState.lastLat = lat;
  window.expState.lastLng = lng;

  saveEXPState();
}


// ============================
// HEADER
// ============================

function setHeader(html) {
  const sub = document.querySelector(".sub");
  if (!sub) return;
  sub.innerHTML = html;
}

function renderExpHeader() {
  let need = getExpNeeded(window.player.level);
  let percent = Math.min(100, (window.player.exp / need) * 100);

  setHeader(`
    🌿 Poziom ${window.player.level}
    (${getRank(window.player.level)})

    <br>

    <div style="width:100%;height:8px;background:#162013;border-radius:10px;overflow:hidden;margin-top:5px;">
      <div style="width:${percent}%;height:100%;background:#6b8f3d;"></div>
    </div>

    <small>${Math.floor(window.player.exp)} / ${need} EXP</small>
  `);
}


// ============================
// INIT SAFE
// ============================

let expInitDone = false;

async function initEXPSystem() {
  if (expInitDone) return;
  expInitDone = true;

  await loadPlayerFromSupabase();
  await backfillEXPFromRoutesByDate();

  renderExpHeader();
}

setTimeout(() => {
  initEXPSystem();
}, 500);


// ============================
// EXPORTS
// ============================

window.trackMovementEXP = trackMovementEXP;
window.addEXP = addEXP;
window.getExpNeeded = getExpNeeded;
window.getRank = getRank;
window.renderExpHeader = renderExpHeader;
window.initEXPSystem = initEXPSystem;
