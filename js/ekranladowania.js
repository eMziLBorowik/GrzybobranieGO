// ============================
// ⏳ EKRAN ŁADOWANIA
// ============================

const loadingScreen = document.getElementById("loadingScreen");
const loadingText = document.getElementById("loadingText");
const authPanel = document.getElementById("authPanel");

// zabezpieczenie
if (!loadingScreen || !loadingText || !authPanel) {
  console.error("❌ Brakuje elementów loadera w HTML");
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

// symulacja ładowania (tu możesz podpiąć API później)
function fakeLoad() {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(true);
    }, 1500);
  });
}

// główny start
async function initLoader() {
  startDots();

  await fakeLoad();

  stopDots();

  // fade out
  loadingScreen.style.opacity = "0";

  setTimeout(() => {
    loadingScreen.style.display = "none";

    // 👉 pokazujemy login
    authPanel.style.display = "flex";

  }, 400);
}

// start po pełnym załadowaniu strony
window.addEventListener("load", initLoader);
