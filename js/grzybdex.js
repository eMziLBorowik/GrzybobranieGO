const client = window.supabaseClient;

// 📦 atlas lokalny (fallback z mushrooms.js)
let mushroomsAtlas = window.mushroomsAtlas || [];

// 👤 aktualny user
let currentUser = null;


// 🔐 pobranie usera
async function getUser(){
const { data } = await client.auth.getUser();
currentUser = data.user;
return currentUser;
}


// 📸 INIT
document.addEventListener("DOMContentLoaded", async ()=>{

await getUser();
await loadUserProgress();

renderAtlas();

setupScanner();

});


// 📷 SCANNER
function setupScanner(){

const scanBtn = document.getElementById("scanBtn");
const input = document.getElementById("cameraInput");

if(!scanBtn || !input) return;


// otwarcie kamery
scanBtn.addEventListener("click", ()=>{
input.click();
});


// skan
input.addEventListener("change", async (e)=>{

if(!e.target.files.length) return;

const mushroom = await detectMushroom();

await handleDetection(mushroom);

});

}


// 🧠 DETEKCJA (NIE LOSOWA)
async function detectMushroom(){

// bierzemy pierwszy NIEODKRYTY dla usera
const hidden = mushroomsAtlas.find(m => !m.found);

if(!hidden){
return { name:"Wszystko odkryte", done:true };
}

return hidden;
}


// 🎮 OBSŁUGA SKANU
async function handleDetection(m){

const result = document.getElementById("scanResult");

if(!result) return;


// koniec gry
if(m.done){
result.innerHTML = "🏆 Wszystkie grzyby odkryte!";
return;
}


// już odkryty
if(m.found){
result.innerHTML = `🔎 Już znany: <b>${m.name}</b>`;
return;
}


// 🔥 NOWE ODKRYCIE
m.found = true;

result.innerHTML = `
🎉 ODKRYTO!<br><br>
🍄 <b>${m.name}</b>
`;


// zapis do bazy
await saveDiscovery(m);

renderAtlas();

}


// 💾 ZAPIS DO SUPABASE
async function saveDiscovery(m){

if(!currentUser) return;

const { error } = await client
.from("user_mushrooms")
.insert([{
user_id: currentUser.id,
mushroom_id: m.name
}]);

if(error){
console.log("Błąd zapisu:", error);
}

}


// 📥 LOAD POSTĘPU
async function loadUserProgress(){

if(!currentUser) return;

const { data, error } = await client
.from("user_mushrooms")
.select("*")
.eq("user_id", currentUser.id);

if(error){
console.log(error);
return;
}


// oznacz znalezione
data.forEach(row=>{

const m = mushroomsAtlas.find(x => x.name === row.mushroom_id);

if(m){
m.found = true;
}

});

}


// 🗂️ RENDER ATLAS
function renderAtlas(){

const box = document.getElementById("atlas");

if(!box) return;

box.innerHTML = "";

mushroomsAtlas.forEach(m=>{

const div = document.createElement("div");
div.className = "card";

if(m.found){
div.innerHTML = `
<h3>${m.icon} ${m.name}</h3>
<p>${m.type}</p>
`;
}else{
div.innerHTML = `
<h3>❓ Nieodkryty grzyb</h3>
<p>Znajdź go w lesie</p>
`;
}

box.appendChild(div);

});

}
