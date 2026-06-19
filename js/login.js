const authPanel = document.getElementById("authPanel");

const emailInput = document.getElementById("email");
const passwordInput = document.getElementById("password");

const msg = document.getElementById("authMsg");

document.getElementById("loginBtn").addEventListener("click", async ()=>{

const email = emailInput.value;
const password = passwordInput.value;

const { data, error } = await supabase.auth.signInWithPassword({
email,
password
});

if(error){
msg.innerText = "❌ Błąd logowania";
return;
}

msg.innerText = "✅ Zalogowano";

authPanel.style.display = "none";

renderAtlas();

});


document.getElementById("registerBtn").addEventListener("click", async ()=>{

const email = emailInput.value;
const password = passwordInput.value;

const { data, error } = await supabase.auth.signUp({
email,
password
});

if(error){
msg.innerText = "❌ Błąd rejestracji";
return;
}

msg.innerText = "✅ Konto utworzone — sprawdź email";

});