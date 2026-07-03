const emailInput = document.getElementById("email");
const passwordInput = document.getElementById("password");

const msg = document.getElementById("authMsg");
const panel = document.getElementById("authPanel");


// 🔧 helper (KLUCZ FIXA)
function getClient(){
  return window.supabase;
}


// 🚀 POKAZANIE APLIKACJI (NOWE)
function showApp() {

  document.getElementById("authPanel").style.display = "none";

  const panelTop = document.querySelector(".panel");
  const page = document.querySelector(".page");

  if (panelTop) panelTop.style.display = "flex";
  if (page) page.style.display = "block";

  const sideMenu = document.getElementById("sideMenu");
  const actionBar = document.getElementById("actionBar");
  const forestInfoPanel = document.getElementById("forestInfoPanel");
  const centerMapBtn = document.getElementById("centerMapBtn");

  if (sideMenu) sideMenu.style.display = "block";
  if (actionBar) actionBar.style.display = "flex";
  if (forestInfoPanel) forestInfoPanel.style.display = "block";
  if (centerMapBtn) centerMapBtn.style.display = "block";
}


// 🔐 AUTOSTART SESJI
document.addEventListener("DOMContentLoaded", async () => {

  const client = getClient();

  const { data, error } = await client.auth.getSession();

  if (error) {
    console.log("SESSION ERROR:", error);
    return;
  }

  if (data.session) {
    panel.style.display = "none";
    console.log("🔐 sesja aktywna");

    showApp(); // 🔥 FIX
  } else {
    panel.style.display = "flex";
    console.log("🔓 brak sesji");
  }

});


// 🔁 REAKCJA NA ZMIANY AUTH
getClient().auth.onAuthStateChange((event, session) => {

  if (session) {
    panel.style.display = "none";
    console.log("🔐 login state change: logged in");

    showApp(); // 🔥 FIX
  } else {
    panel.style.display = "flex";
    console.log("🔓 login state change: logged out");
  }

});


// 🔑 LOGIN
document.getElementById("loginBtn").addEventListener("click", async () => {

  const client = getClient();

  const email = emailInput.value;
  const password = passwordInput.value;

  const { data, error } = await client.auth.signInWithPassword({
    email,
    password
  });

  if (error) {
    console.log(error);
    msg.innerText = "❌ Błąd logowania: " + error.message;
    return;
  }

  msg.innerText = "✅ Zalogowano";
  panel.style.display = "none";

  showApp(); // 🔥 FIX
});


// 🆕 REJESTRACJA
document.getElementById("registerBtn").addEventListener("click", async () => {

  const client = getClient();

  const email = emailInput.value;
  const password = passwordInput.value;

  const { data, error } = await client.auth.signUp({
    email,
    password
  });

  if (error) {
    console.log(error);
    msg.innerText = "❌ Błąd rejestracji: " + error.message;
    return;
  }

  msg.innerText = "✅ Konto utworzone (sprawdź email)";
  panel.style.display = "flex";
});
