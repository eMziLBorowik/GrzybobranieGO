
// ============================
// ⏳ EKRAN ŁADOWANIA - STABILNY
// ============================

window.addEventListener("DOMContentLoaded", () => {

  const loadingScreen = document.getElementById("loadingScreen");
  const loadingText = document.getElementById("loadingText");
  const authPanel = document.getElementById("authPanel");

  // 🔒 zabezpieczenie
  if (!loadingScreen || !loadingText || !authPanel) {
    console.error("❌ Loader: brak elementów w HTML");
    return;
  }

  console.log("⏳ Loader START");

  let dots = 0;
  let interval = null;

  // animacja tekstu
  function startDots() {
    interval = setInterval(() => {
      dots = (dots + 1) % 4;
      loadingText.innerText = "Ładowanie" + ".".repeat(dots);
    }, 400);
  }

  function stopDots() {
    clearInterval(interval);
  }

  // 🔧 czekamy aż WSZYSTKIE skrypty się załadują
  function waitForSystems() {
    return new Promise((resolve) => {
      let checks = 0;

      const check = setInterval(() => {

        checks++;

        // warunek "minimum gotowości"
        const supabaseReady = typeof window.supabase !== "undefined";
        const loginReady = document.readyState === "complete";

        if (supabaseReady && loginReady) {
          clearInterval(check);
          resolve();
        }

        // awaryjnie po 3s puszczamy dalej
        if (checks > 15) {
          clearInterval(check);
          resolve();
        }

      }, 200);
    });
  }

  async function startLoader() {

    startDots();

    await waitForSystems();

    stopDots();

    // fade out
    loadingScreen.style.transition = "opacity 0.4s ease";
    loadingScreen.style.opacity = "0";

    setTimeout(() => {

      loadingScreen.style.display = "none";

      // 👉 pokaz loginu
      authPanel.style.display = "flex";

      console.log("✅ Loader DONE");

    }, 400);

  }

  startLoader();

});
