// ============================
// 🌿 EXP SYSTEM v5 FIXED STABLE (CLEAN PATCH)
// Leśna Przygoda
// SUPABASE READY
// ============================


// 👤 GRACZ (GLOBAL + SAFE LOAD)
window.player = window.player || {
  exp: 0,
  level: 1
};


// 🌲 CONFIG
const CONFIG = {
  expPerKm: 100,
  forestMultiplier: 1.75,

  maxSpeedKmh: 8,
  minSpeedKmh: 0.5,
};


// 🚶 GLOBAL SAFE STATE (FIX RESET BUG)
window.expState = window.expState || {
  lastLat: null,
  lastLng: null,
  distance: 0
};


// ============================
// 🔥 START LOG
// ============================

console.log("📊 EXP system ready");


// ============================
// 📈 LEVEL SYSTEM
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
// ☁️ SUPABASE SAFE SYNC
// ============================

async function syncPlayerToSupabase() {

  try {
    if (!window.supabase) return;

    const { data } = await supabase.auth.getUser();
    const user = data?.user;

    if (!user) return;

    const { error } = await supabase
      .from("profiles")
      .upsert({
        user_id: user.id,
        level: window.player.level,
        exp: window.player.exp
      });

    if (error) {
      console.log("❌ SUPABASE ERROR:", error.message || error);
    } else {
      console.log("☁️ Sync OK (profiles)");
    }

  } catch (e) {
    console.log("❌ Sync crash:", e);
  }
}


// ============================
// 🌿 ADD EXP (SAFE)
// ============================

function addEXP(amount, source = "unknown") {

  if (!amount || amount <= 0) return;

  window.player.exp += amount;

  console.log(`🌿 +${amount} EXP | ${source}`);

  while (window.player.exp >= getExpNeeded(window.player.level)) {
    window.player.exp -= getExpNeeded(window.player.level);
    window.player.level++;

    console.log(`🎉 LEVEL UP → ${window.player.level} | ${getRank(window.player.level)}`);
  }

  console.log(`📊 LVL ${window.player.level} (${getRank(window.player.level)})`);
  console.log(`📊 EXP: ${window.player.exp} / ${getExpNeeded(window.player.level)}`);

  updateEXPUI?.();
  renderExpHeader?.();

  lockHeader?.();

  syncPlayerToSupabase();
}


// ============================
// 🌲 FOREST CHECK
// ============================

function isInForest(lat, lng) {
  return window.isForest === true;
}


// ============================
// 🚶 TRACK MOVEMENT (STABLE CORE)
// ============================

function trackMovementEXP(lat, lng, speed) {

  if (!lat || !lng) return;
  if (!speed) return;

  const kmh = speed * 3.6;

  console.log(`📡 SPEED: ${kmh.toFixed(1)} km/h`);

  // 🚗 anti-car
  if (kmh > CONFIG.maxSpeedKmh) {
    console.log("🚗 AUTO DETECTED → NO EXP");
    return;
  }

  // 🧍 idle ignore (ale NIE reset)
  if (kmh < CONFIG.minSpeedKmh) return;

  if (typeof L === "undefined") return;

  // 📍 first point init
  if (window.expState.lastLat !== null && window.expState.lastLng !== null) {

    const dist = L.latLng(window.expState.lastLat, window.expState.lastLng)
      .distanceTo(L.latLng(lat, lng));

    if (dist > 5) {

      window.expState.distance += dist;

      console.log(`🚶 DIST: ${window.expState.distance.toFixed(1)} m`);

      // 🔥 500m EXP (FIXED)
      if (window.expState.distance >= 500) {

        let exp = CONFIG.expPerKm;

        if (isInForest(lat, lng)) {
          exp *= CONFIG.forestMultiplier;
          console.log("🌲 FOREST BONUS x1.75");
        }

        addEXP(Math.floor(exp), "movement");

        window.expState.distance = 0;
      }
    }
  }

  window.expState.lastLat = lat;
  window.expState.lastLng = lng;
}


// ============================
// ✨ HEADER SMOOTH SYSTEM
// ============================

function setHeaderSmooth(html) {
  const sub = document.querySelector(".sub");
  if (!sub) return;

  sub.style.transition = "opacity 0.35s ease, transform 0.35s ease";
  sub.style.opacity = "0";
  sub.style.transform = "translateY(-6px)";

  setTimeout(() => {
    sub.innerHTML = html;
    sub.style.opacity = "1";
    sub.style.transform = "translateY(0px)";
  }, 350);
}


// ============================
// 📊 HEADER (EXP)
// ============================

function renderExpHeader() {

  const level = window.player?.level || 1;
  const exp = window.player?.exp || 0;

  const need = getExpNeeded(level);
  const percent = Math.min(100, (exp / need) * 100);

  setHeaderSmooth(`
    🌿 Poziom ${level} (${getRank(level)})<br>
    <div style="width:100%;height:8px;background:#162013;border-radius:10px;overflow:hidden;margin-top:5px;">
      <div style="width:${percent}%;height:100%;background:#6b8f3d;"></div>
    </div>
    <small>${Math.floor(exp)} / ${need} EXP</small>
  `);
}


// ============================
// 📊 HEADER DEFAULT
// ============================

function renderDefaultHeader() {
  setHeaderSmooth("Odkrywanie lasów i przyrody 🔎🌲");
}


// ============================
// 🔁 ROTATION SYSTEM
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
// 🌍 EXPORT
// ============================

window.trackMovementEXP = trackMovementEXP;
window.addEXP = addEXP;
window.renderExpHeader = renderExpHeader;
window.renderDefaultHeader = renderDefaultHeader;
window.lockHeader = lockHeader;
