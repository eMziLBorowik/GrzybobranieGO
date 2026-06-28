// ============================
// 🌿 EXP SYSTEM v5 FIXED STABLE
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


// 🚶 STATE
let state = {
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
// 🌿 ADD EXP
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

  // UI update (future safe)
  if (typeof updateEXPUI === "function") {
    updateEXPUI();
  }

  // HEADER UPDATE
  updateHeaderExpUI?.();

  syncPlayerToSupabase();
}


// ============================
// 🌲 FOREST CHECK (FUTURE)
// ============================

function isInForest(lat, lng) {
  return window.isForest === true;
}


// ============================
// 🚶 TRACK MOVEMENT (SAFE GPS)
// ============================

function trackMovementEXP(lat, lng, speed) {

  if (!lat || !lng) return;
  if (!speed) return;

  let kmh = speed * 3.6;

  console.log(`📡 SPEED: ${kmh.toFixed(1)} km/h`);

  // 🚗 auto detection
  if (kmh > CONFIG.maxSpeedKmh) {
    console.log("🚗 AUTO DETECTED → NO EXP");
    return;
  }

  // 💤 brak ruchu
  if (kmh < CONFIG.minSpeedKmh) return;

  // 📏 dystans
  if (state.lastLat !== null && state.lastLng !== null) {

    if (typeof L === "undefined") return;

    let dist = L.latLng(state.lastLat, state.lastLng)
      .distanceTo(L.latLng(lat, lng));

    if (dist > 5) {

      state.distance += dist;

      console.log(`🚶 DIST: ${state.distance.toFixed(1)} m`);

      if (state.distance >= 1000) {

        let exp = CONFIG.expPerKm;

        if (isInForest(lat, lng)) {
          exp *= CONFIG.forestMultiplier;
          console.log("🌲 FOREST BONUS x1.75");
        }

        addEXP(Math.floor(exp), "movement");

        state.distance = 0;
      }
    }
  }

  state.lastLat = lat;
  state.lastLng = lng;
}


// ============================
// 📊 HEADER UI EXP BAR
// ============================

function updateHeaderExpUI() {

  const sub = document.querySelector(".sub");
  if (!sub) return;

  const level = window.player?.level || 1;
  const exp = window.player?.exp || 0;

  const need = getExpNeeded(level);
  const percent = Math.min(100, (exp / need) * 100);

  sub.innerHTML = `
    🌿 Poziom ${level} (${getRank(level)})<br>
    <div style="width:100%;height:8px;background:#162013;border-radius:10px;overflow:hidden;margin-top:5px;">
      <div style="width:${percent}%;height:100%;background:#6b8f3d;"></div>
    </div>
    <small>${Math.floor(exp)} / ${need} EXP</small>
  `;
}


// ============================
// 🔁 AUTO REFRESH HEADER
// ============================

setInterval(() => {
  updateHeaderExpUI();
}, 5000);


// ============================
// 🌍 GLOBAL EXPORT
// ============================

window.trackMovementEXP = trackMovementEXP;
window.addEXP = addEXP;
