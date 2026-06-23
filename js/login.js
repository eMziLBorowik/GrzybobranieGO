const emailInput = document.getElementById("email");
const passwordInput = document.getElementById("password");

const msg = document.getElementById("authMsg");
const panel = document.getElementById("authPanel");


// 🔧 helper (KLUCZ FIXA)
function getClient(){
  return window.supabase;
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
