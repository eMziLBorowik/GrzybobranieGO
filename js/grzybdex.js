let mushroomsAtlas = [];
let currentUser = null;


// 🔐 START
document.addEventListener("DOMContentLoaded", async () => {

console.log("🧠 GrzybDex start");

mushroomsAtlas = window.mushroomsAtlas || [];

await getUser();

await loadUserProgress();

renderAtlas();

setupScanner();

});


// 👤 USER
async function getUser(){

const client = window.supabaseClient;

if(!client){
console.error("❌ brak supabaseClient");
return;
}

const { data, error } = await client.auth.getUser();

if(error){
console.log("USER ERROR:", error);
return;
}

currentUser = data.user;

console.log("👤 user:", currentUser?.email);

}


// 📷 SCANNER
function setupScanner(){

const scanBtn = document.getElementById("scanBtn");
const input = document.getElementById("cameraInput");

if(!scanBtn || !input){
console.error("❌ brak scanBtn lub cameraInput");
return;
}

console.log("📷 scanner ready");

scanBtn.onclick = () => {
input.click();
};

input.onchange = async (e) => {

if(!e.target.files || !e.target.files.length) return;

const mushroom = await detectMushroom();
await handleDetection(mushroom);

input.value = "";

};

}


// 🧠 DETEKCJA
async function detectMushroom(){

const hidden = mushroomsAtlas.find(m => !m.found);

if(!hidden){
return { done:true };
}

return hidden;

}


// 🎮 HANDLE
async function handleDetection(m){

const result = document.getElementById("scanResult");

if(!result) return;

if(m.done){
result.innerHTML = "🏆 Wszystkie grzyby odkryte!";
return;
}

if(m.found){
result.innerHTML = `🔎 Już znany: <b>${m.name}</b>`;
return;
}

// NOWE ODKRYCIE
m.found = true;

result.innerHTML = `
🎉 ODKRYTO!<br><br>
🍄 <b>${m.name}</b>
`;

await saveDiscovery(m);

renderAtlas();

}


// 💾 SAVE
async function saveDiscovery(m){

if(!currentUser) return;

const client = window.supabaseClient;

const { error } = await client
.from("user_mushrooms")
.insert([{
user_id: currentUser.id,
mushroom_id: m.name
}]);

if(error){
console.log("SAVE ERROR:", error);
}

}


// 📥 LOAD
async function loadUserProgress(){

if(!currentUser) return;

const client = window.supabaseClient;

const { data, error } = await client
.from("user_mushrooms")
.select("*")
.eq("user_id", currentUser.id);

if(error){
console.log("LOAD ERROR:", error);
return;
}

if(!data) return;

data.forEach(row => {

const m = mushroomsAtlas.find(x => x.name === row.mushroom_id);

if(m){
m.found = true;
}

});

console.log("📥 progress loaded");

}


// 🗂️ RENDER
function renderAtlas(){

const box = document.getElementById("atlas");

if(!box) return;

box.innerHTML = "";

mushroomsAtlas.forEach(m => {

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
