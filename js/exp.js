// ============================
// 🌿 EXP SYSTEM v4
// Leśna Przygoda
// 75 LVL + Supabase Sync
// ============================


// 👤 GRACZ (LOCAL CACHE)
window.player = {
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


// 🚶 STATE RUCHU
let state = {
  lastLat: null,
  lastLng: null,
  distance: 0
};


// ============================
// 📈 LEVEL SYSTEM (75 LVL BALANCED)
// ============================

function getExpNeeded(level) {

  let base = 80;
  let exp = Math.floor(base * Math.pow(level, 1.45));

  if (level <= 10) {
    exp *= 0.9;
  }

  return exp;
}


// ============================
// 🏅 RANGI
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
// ☁️ SUPABASE SYNC
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
        level: player.level,
        exp: player.exp
      });

    if (error) {
      console.log("❌ SUPABASE ERROR:", error);
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

  player.exp += amount;

  console.log(`🌿 +${amount} EXP | ${source}`);

  while (player.exp >= getExpNeeded(player.level)) {

    player.exp -= getExpNeeded(player.level);
    player.level++;

    console.log(`🎉 LEVEL UP → ${player.level} | ${getRank(player.level)}`);
  }

  console.log(`📊 LVL ${player.level} (${getRank(player.level)})`);
  console.log(`📊 EXP: ${player.exp} / ${getExpNeeded(player.level)}`);

  updateEXPUI?.();
  syncPlayerToSupabase(); // 🔥 zapis do chmury
}


// ============================
// 🌲 LAS CHECK (HOOK)
// ============================

function isInForest(lat, lng) {
  return window.isForest === true; // później polygony
}


// ============================
// 🚶 TRACKING RUCHU
// ============================

function trackMovementEXP(lat, lng, speed) {

  if (!speed) return;

  let kmh = speed * 3.6;

  console.log(`📡 SPEED: ${kmh.toFixed(1)} km/h`);

  // ❌ samochód
  if (kmh > CONFIG.maxSpeedKmh) {
    console.log("🚗 AUTO DETECTED → NO EXP");
    return;
  }

  // ❌ brak ruchu
  if (kmh < CONFIG.minSpeedKmh) return;


  if (state.lastLat !== null && state.lastLng !== null) {

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

        addEXP(exp, "movement");

        state.distance = 0;
      }
    }
  }

  state.lastLat = lat;
  state.lastLng = lng;
}
