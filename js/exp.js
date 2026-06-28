// ============================
// 🌿 EXP SYSTEM v3
// Leśna Przygoda
// 75 LVL + Rangi + Las Boost
// ============================


// 👤 GRACZ
window.player = {
  exp: 0,
  level: 1
};


// 🌲 KONFIGURACJA
const CONFIG = {
  expPerKm: 100,
  forestMultiplier: 1.75,

  maxSpeedKmh: 8,    // anty samochód
  minSpeedKmh: 0.5,  // anty AFK
};


// 🚶 STATE RUCHU
let state = {
  lastLat: null,
  lastLng: null,
  distance: 0
};


// ============================
// 📈 LEVEL CURVE (75 LVL BALANCED)
// ============================

function getExpNeeded(level) {

  let base = 80;
  let exp = Math.floor(base * Math.pow(level, 1.45));

  // lekkie przyspieszenie early game
  if (level <= 10) {
    exp *= 0.9;
  }

  return exp;
}


// ============================
// 🏅 RANK SYSTEM
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
// 🌿 ADD EXP
// ============================

function addEXP(amount, source = "unknown") {

  player.exp += amount;

  console.log(`🌿 +${amount} EXP | ${source}`);

  // level up loop
  while (player.exp >= getExpNeeded(player.level)) {

    player.exp -= getExpNeeded(player.level);
    player.level++;

    console.log(`🎉 LEVEL UP! → ${player.level} | ${getRank(player.level)}`);
  }

  console.log(`📊 LVL ${player.level} (${getRank(player.level)})`);
  console.log(`📊 EXP: ${player.exp} / ${getExpNeeded(player.level)}`);

  updateEXPUI?.();
}


// ============================
// 🌲 DETEKCJA LASU (HOOK)
// ============================

// To podłączysz później do polygonów z mapy
function isInForest(lat, lng) {

  // placeholder (NA RAZIE TRUE/FALSE LOSOWO NIE)
  // później: turf.js + polygons
  return window.isForest === true;
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


  // dystans
  if (state.lastLat !== null && state.lastLng !== null) {

    let dist = L.latLng(state.lastLat, state.lastLng)
      .distanceTo(L.latLng(lat, lng));

    if (dist > 5) {

      state.distance += dist;

      console.log(`🚶 DIST: ${state.distance.toFixed(1)} m`);

      if (state.distance >= 1000) {

        let multiplier = CONFIG.expPerKm;

        // 🌲 LAS BONUS
        if (isInForest(lat, lng)) {
          multiplier *= CONFIG.forestMultiplier;
          console.log("🌲 FOREST BONUS x1.75");
        }

        addEXP(multiplier, "movement");

        state.distance = 0;
      }
    }
  }

  state.lastLat = lat;
  state.lastLng = lng;
}