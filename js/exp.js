// ============================
// 🌿 EXP SYSTEM v7 FINAL BALANCED
// Leśna Przygoda
// SUPABASE SAFE
// ============================


// 👤 PLAYER SAFE INIT
window.player = window.player || {
  exp: 0,
  level: 1
};


// 🌲 CONFIG (BALANCED ECONOMY)
const CONFIG = {
  expPerKm: 100,       // 1 KM = 100 EXP
  forestMultiplier: 1.75,

  maxSpeedKmh: 8,
  minSpeedKmh: 0.5,
};


// ============================
// 💾 MEMORY SYSTEM
// ============================

window.expState = JSON.parse(
  localStorage.getItem("expState")
) || {
  lastLat: null,
  lastLng: null,
  distance: 0
};

function saveEXPState() {
  localStorage.setItem(
    "expState",
    JSON.stringify(window.expState)
  );
}


// ============================
// 📊 LEVEL SYSTEM
// ============================

function getExpNeeded(level) {
  let base = 80;
  let exp = Math.floor(base * Math.pow(level, 1.45));
  if (level <= 10) exp *= 0.9;
  return exp;
}


// ============================
// 🏅 RANKS
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
// ☁️ SUPABASE SYNC (SAFE)
// ============================

async function syncPlayerToSupabase() {
  try {
    if (!window.supabase) return;

    const { data } = await supabase.auth.getUser();
    const user = data?.user;
    if (!user) return;

    await supabase
      .from("profiles")
      .upsert({
        user_id: user.id,
        level: window.player.level,
        exp: window.player.exp
      });

  } catch (e) {
    console.log("❌ Supabase sync error:", e);
  }
}


// ============================
// 🌿 ADD EXP
// ============================

function addEXP(amount, source = "unknown") {
  if (!amount || amount <= 0) return;

  window.player.exp += amount;

  console.log(`🌿 +${amount} EXP | ${source}`);

  while (window.player.exp >= getExpNeeded(window.player.level)) {
    window.player.exp -= getExpNeeded(window.player.level);
    window.player.level++;
    console.log(`🎉 LEVEL UP → ${window.player.level}`);
  }

  updateEXPUI?.();
  renderExpHeader?.();
  lockHeader?.();

  syncPlayerToSupabase();
}


// ============================
// 🌲 FOREST CHECK
// ============================

function isInForest() {
  return window.isForest === true;
}


// ============================
// 🚶 MOVEMENT EXP (500m = 50 EXP)
// ============================

function trackMovementEXP(lat, lng, speed) {
  if (!lat || !lng) return;
  if (!speed) return;

  const kmh = speed * 3.6;

  if (kmh > CONFIG.maxSpeedKmh) return;
  if (kmh < CONFIG.minSpeedKmh) return;

  if (typeof L === "undefined") return;

  if (window.expState.lastLat !== null && window.expState.lastLng !== null) {

    const dist = L.latLng(window.expState.lastLat, window.expState.lastLng)
      .distanceTo(L.latLng(lat, lng));

    if (dist > 5) {

      window.expState.distance += dist;

      // 🎯 500m reward
      if (window.expState.distance >= 500) {

        // 🔥 BALANCED EXP: 1km = 100 EXP → 500m = 50 EXP
        let exp = CONFIG.expPerKm / 2;

        if (isInForest()) {
          exp *= CONFIG.forestMultiplier;
        }

        addEXP(Math.floor(exp), "movement");

        window.expState.distance = 0;
      }

      saveEXPState();
    }
  }

  window.expState.lastLat = lat;
  window.expState.lastLng = lng;

  saveEXPState();
}


// ============================
// 🌲 OLD ROUTES SYNC
// ============================

async function syncOldRoutesEXP() {
  try {

    if (!window.supabase) return;

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const key = "rewardedRouteKm_" + user.id;

    const { data: routes, error } = await supabase
      .from("routes")
      .select("distance")
      .eq("user_id", user.id);

    if (error || !routes) return;

    let totalMeters = 0;

    routes.forEach(r => {
      totalMeters += r.distance || 0;
    });

    let totalKm = totalMeters / 1000;

    let rewardedKm = Number(localStorage.getItem(key) || 0);

    let newKm = totalKm - rewardedKm;

    if (newKm <= 0) return;

    let gained = Math.floor(newKm * CONFIG.expPerKm);

    addEXP(gained, "stare trasy");

    localStorage.setItem(key, totalKm.toFixed(2));

    console.log("🌲 OLD ROUTES:", newKm.toFixed(2), "km +", gained);

  } catch (e) {
    console.log("❌ syncOldRoutesEXP error:", e);
  }
}


// ============================
// ✨ HEADER SYSTEM
// ============================

function setHeader(html) {
  const sub = document.querySelector(".sub");
  if (!sub) return;

  sub.style.transition = "opacity 0.3s ease";
  sub.style.opacity = "0";

  setTimeout(() => {
    sub.innerHTML = html;
    sub.style.opacity = "1";
  }, 200);
}

function renderExpHeader() {
  const level = window.player.level;
  const exp = window.player.exp;

  const need = getExpNeeded(level);
  const percent = Math.min(100, (exp / need) * 100);

  setHeader(`
    🌿 Poziom ${level} (${getRank(level)})<br>
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
// 🔁 ROTATION
// ============================

let headerMode = 0;
let headerLock = false;

setInterval(() => {
  if (headerLock) return;

  if (headerMode === 0) {
    renderDefaultHeader();
    headerMode = 1;
  } else {
    renderExpHeader();
    headerMode = 0;
  }
}, 30000);


// ============================
// 🔒 LOCK HEADER
// ============================

function lockHeader() {
  headerLock = true;
  renderExpHeader();

  setTimeout(() => {
    headerLock = false;
  }, 2000);
}


// ============================
// 🌍 EXPORTS
// ============================

window.trackMovementEXP = trackMovementEXP;
window.addEXP = addEXP;
window.renderExpHeader = renderExpHeader;
window.renderDefaultHeader = renderDefaultHeader;
window.lockHeader = lockHeader;
window.syncOldRoutesEXP = syncOldRoutesEXP;


// INIT
setTimeout(() => {
  syncOldRoutesEXP();
}, 5000);


// SAVE STATE ON EXIT / TAB SWITCH
window.addEventListener("beforeunload", () => {
  saveEXPState();
});
