// ============================
// ⏳ EKRAN ŁADOWANIA (PRO)
// ============================

const loadingScreen = document.getElementById("loadingScreen");
const app = document.getElementById("app");
const loadingText = document.getElementById("loadingText");

// 🔵 animowane kropki
let dots = 0;
let loadingInterval = null;

// start animacji tekstu
function startLoadingAnimation() {
  loadingInterval = setInterval(() => {
    dots = (dots + 1) % 4; // 0-3 kropki

    let dotText = ".".repeat(dots);
    loadingText.innerText = "Ładowanie" + dotText;
  }, 500);
}

// stop animacji
function stopLoadingAnimation() {
  clearInterval(loadingInterval);
}

// symulacja sprawdzania logowania
function checkLogin() {
  return new Promise((resolve) => {
    const user = localStorage.getItem("user");
    setTimeout(() => resolve(!!user), 600);
  });
}

// symulacja ładowania danych
function loadData() {
  return new Promise((resolve) => {
    setTimeout(() => resolve(true), 1200);
  });
}

// start aplikacji
async function initApp() {
  startLoadingAnimation();

  const isLoggedIn = await checkLogin();
  const isReady = await loadData();

  if (!isLoggedIn) {
    stopLoadingAnimation();
    loadingText.innerText = "Musisz się zalogować...";
    return;
  }

  if (isLoggedIn && isReady) {
    stopLoadingAnimation();

    loadingScreen.style.opacity = "0";

    setTimeout(() => {
      loadingScreen.style.display = "none";
      app.style.display = "block";
    }, 400);
  }
}

// start po pełnym załadowaniu strony
window.addEventListener("load", initApp);