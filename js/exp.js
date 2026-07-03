// ============================
// 🌿 EXP SYSTEM v8.1 PRODUCTION PATCH
// Leśna Przygoda
// ============================


// 👤 PLAYER SAFE INIT
window.player = window.player || {
  exp: 0,
  level: 1
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
// LOADING HOOK (READY FOR LOADING SCREEN)
// ============================

window.expSystemReady = false;

function setExpSystemReady(state) {
  window.expSystemReady = state;
  window.dispatchEvent(new Event("expSystemReady"));
}


// ============================
// SAFE STORAGE
// ============================

function safeParse(json, fallback) {
  try {
    return JSON.parse(json) ?? fallback;
  } catch {
    return fallback;
  }
}


// ============================
// MEMORY (LOCAL STORAGE)
// ============================

window.expState =
  safeParse(localStorage.getItem("expState"), null) || {
    lastLat: null,
    lastLng: null,
    distance: 0
  };

function saveEXPState() {
  try {
    localStorage.setItem("expState", JSON.stringify(window.expState));
  } catch (e) {
    console.log("EXP STATE SAVE ERROR", e);
  }
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
// RANK SYSTEM
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
// SUPABASE LOAD (LOGIN SYNC)
// ============================

async function loadPlayerFromSupabase() {
  try {
    if (!window.supabase) return;

    const { data } = await supabase.auth.getUser();
    const user = data?.user;

    if (!user) return;

    const { data: profile } = await supabase
      .from("profiles")
      .select("level, exp")
      .eq("user_id", user.id)
      .single();

    if (profile) {
      window.player.level = profile.level ?? 1;
      window.player.exp = profile.exp ?? 0;

      console.log("📥 PROFILE LOADED", profile);
    }

    setExpSystemReady(true);
    renderExpHeader();

  } catch (e) {
    console.log("EXP LOAD ERROR", e);
  }
}


// ============================
// SUPABASE SYNC (THROTTLED)
// ============================

let lastSyncTime = 0;

async function syncPlayerToSupabase() {
  try {
    if (!window.supabase) return;

    const now = Date.now();
    if (now - lastSyncTime < 5000) return;
    lastSyncTime = now;

    const { data } = await supabase.auth.getUser();
    const user = data?.user;

    if (!user) return;

    await supabase.from("profiles").upsert({
      user_id: user.id,
      level: window.player.level,
      exp: window.player.exp
    });

  } catch (e) {
    console.log("EXP SYNC ERROR", e);
  }
}


// ============================
// ADD EXP (UNCHANGED LOGIC)
// ============================

function addEXP(amount, source = "unknown") {
  if (!amount || amount <= 0) return;

  amount = Math.min(amount, 100);

  window.player.exp += amount;

  console.log("🌿 +" + amount + " EXP", source);

  while (window.player.exp >= getExpNeeded(window.player.level)) {
    window.player.exp -= getExpNeeded(window.player.level);
    window.player.level++;
    console.log("🎉 LEVEL UP", window.player.level);
  }

  updateEXPUI?.();
  renderExpHeader?.();
  lockHeader?.();

  syncPlayerToSupabase();
}


// ============================
// FOREST CHECK
// ============================

function isInForest() {
  return window.isForest === true;
}


// ============================
// GPS TRACKING (SAFE PATCH ONLY)
// ============================

function trackMovementEXP(lat, lng, speed) {
  if (lat == null || lng == null) return;
  if (typeof L === "undefined") return;

  if (window.expState.lastLat == null || window.expState.lastLng == null) {
    window.expState.lastLat = lat;
    window.expState.lastLng = lng;
    saveEXPState();
    return;
  }

  let dist = L.latLng(
    window.expState.lastLat,
    window.expState.lastLng
  ).distanceTo(L.latLng(lat, lng));

  if (!isFinite(dist)) return;
  if (dist < 10) return;

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

    addEXP(Math.floor(reward), "500m spacer");

    window.expState.distance = 0;
  }

  window.expState.lastLat = lat;
  window.expState.lastLng = lng;

  saveEXPState();
}


// ============================
// OLD ROUTES (DISABLED SAFE)
// ============================

async function syncOldRoutesEXP() {
  console.log("🌲 OLD ROUTES EXP OFF");
}


// ============================
// HEADER SYSTEM (UNCHANGED LOGIC)
// ============================

function setHeader(html) {
  const sub = document.querySelector(".sub");
  if (!sub) return;
  sub.innerHTML = html;
}

function getProgressPercent() {
  let need = getExpNeeded(window.player.level);
  return Math.min(100, (window.player.exp / need) * 100);
}

function renderExpHeader() {
  let level = window.player.level;
  let exp = window.player.exp;
  let need = getExpNeeded(level);

  let percent = getProgressPercent();

  setHeader(`
    🌿 Poziom ${level}
    (${getRank(level)})

    <br>

    <div style="width:100%;height:8px;background:#162013;border-radius:10px;overflow:hidden;margin-top:5px;">
      <div style="width:${percent}%;height:100%;background:#6b8f3d;"></div>
    </div>

    <small>${Math.floor(exp)} / ${need} EXP</small>
  `);
}

function renderDefaultHeader() {
  setHeader("Odkrywanie lasów i przyrody 🔎🌲");
}


// ============================
// HEADER ROTATION SAFE
// ============================

let headerMode = 0;
let headerLock = false;

if (!window.__expHeaderInterval) {
  window.__expHeaderInterval = setInterval(() => {
    if (headerLock) return;

    headerMode = headerMode === 0 ? 1 : 0;

    if (headerMode === 0) renderDefaultHeader();
    else renderExpHeader();

  }, 30000);
}

function lockHeader() {
  headerLock = true;
  renderExpHeader();

  setTimeout(() => {
    headerLock = false;
  }, 2000);
}


// ============================
// INIT SYSTEM (IMPORTANT)
// ============================

async function initEXPSystem() {
  setExpSystemReady(false);

  await loadPlayerFromSupabase();

  // fallback jeśli brak logowania
  if (!window.player.level) window.player.level = 1;
  if (window.player.exp == null) window.player.exp = 0;

  renderExpHeader();
  setExpSystemReady(true);
}


// ============================
// EXPORT
// ============================

window.initEXPSystem = initEXPSystem;
window.trackMovementEXP = trackMovementEXP;
window.addEXP = addEXP;
window.getExpNeeded = getExpNeeded;
window.getRank = getRank;
window.renderExpHeader = renderExpHeader;
window.renderDefaultHeader = renderDefaultHeader;
window.lockHeader = lockHeader;
window.syncOldRoutesEXP = syncOldRoutesEXP;

console.log("🌿 EXP SYSTEM v8.1 READY");

// auto-init safe
setTimeout(() => {
  initEXPSystem();
}, 500);
