// ============================
// ⏳ EKRAN ŁADOWANIA - FINAL
// ============================

const loadingScreen = document.getElementById("loadingScreen");
const loadingText = document.getElementById("loadingText");
const authPanel = document.getElementById("authPanel");

// zabezpieczenie (żeby nie było crasha)
if (!loadingScreen || !loadingText || !authPanel) {
  console.error("❌ Brakuje elementów: loadingScreen / loadingText / authPanel");
}

// animacja kropek
let dots = 0;
let interval = null;

function startDots() {
  interval = setInterval(() => {
    dots = (dots + 1) % 4;
    loadingText.innerText = "Ładowanie" + ".".repeat(dots);
  }, 500);
}

function stopDots() {
  clearInterval(interval);
}

// symulacja ładowania (możesz później podpiąć prawdziwe API)
function fakeLoad() {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(true);
    }, 1500);
  });
}

// pokaz loginu
function showLogin() {
  authPanel.style.display = "flex";
}

// główny start
async function initLoader() {
  startDots();

  await fakeLoad();

  stopDots();

  // fade out loadera
  loadingScreen.style.opacity = "0";

  setTimeout(() => {
    loadingScreen.style.display = "none";

    // 👉 POKAŻ LOGIN
    showLogin();

  }, 400);
}

// start po pełnym załadowaniu strony
window.addEventListener("load", initLoader);
