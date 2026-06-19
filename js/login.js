const client = window.supabaseClient;

const emailInput = document.getElementById("email");
const passwordInput = document.getElementById("password");

const msg = document.getElementById("authMsg");

const panel = document.getElementById("authPanel");

document.getElementById("loginBtn").addEventListener("click", async () => {

const email = emailInput.value;
const password = passwordInput.value;

const { data, error } = await client.auth.signInWithPassword({
email,
password
});

if(error){
console.log(error);
msg.innerText = "❌ Błąd logowania: " + error.message;
return;
}

msg.innerText = "✅ Zalogowano";

panel.style.display = "none";

});

document.getElementById("registerBtn").addEventListener("click", async () => {

const email = emailInput.value;
const password = passwordInput.value;

const { data, error } = await client.auth.signUp({
email,
password
});

if(error){
console.log(error);
msg.innerText = "❌ Błąd rejestracji: " + error.message;
return;
}

msg.innerText = "✅ Konto utworzone (sprawdź email)";
});
