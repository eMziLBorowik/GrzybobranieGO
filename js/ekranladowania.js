
window.addEventListener("DOMContentLoaded", () => {

  const loadingScreen = document.getElementById("loadingScreen");
  const loadingText = document.getElementById("loadingText");
  const authPanel = document.getElementById("authPanel");

  if (!loadingScreen || !loadingText || !authPanel) {
    console.error("❌ Brak elementów loadera");
    return;
  }

  let dots = 0;
  let interval = null;

  function startDots() {
    interval = setInterval(() => {
      dots = (dots + 1) % 4;
      loadingText.innerText = "Ładowanie" + ".".repeat(dots);
    }, 400);
  }

  function stopDots() {
    clearInterval(interval);
  }

  // =========================
  // 🔥 REAL CHECK SYSTEM READY
  // =========================
  function isAppReady() {

    const supabaseReady = !!window.supabase;
    const leafletReady = !!window.L;
    const turfReady = !!window.turf;

    // możesz tu dodać swoje systemy
    return supabaseReady && leafletReady && turfReady;
  }

  function waitForAppReady() {

    return new Promise((resolve) => {

      let tries = 0;

      const check = setInterval(() => {

        tries++;

        if (isAppReady()) {
          clearInterval(check);
          resolve(true);
        }

        // awaryjnie po ~5s puszczamy (żeby nie zablokować na zawsze)
        if (tries > 25) {
          console.warn("⚠️ Loader timeout – wymuszam start");
          clearInterval(check);
          resolve(false);
        }

      }, 200);

    });

  }

  async function startLoader() {

    startDots();

    await waitForAppReady();

    stopDots();

    loadingScreen.style.transition = "opacity 0.4s ease";
    loadingScreen.style.opacity = "0";

    setTimeout(() => {

      loadingScreen.style.display = "none";

      // 👉 dopiero TERAZ login
      authPanel.style.display = "flex";

      console.log("✅ APP READY → LOGIN UNLOCKED");

    }, 400);

  }

  startLoader();

});
