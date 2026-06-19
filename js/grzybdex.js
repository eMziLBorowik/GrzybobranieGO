
const mushroomsAtlas = [

{ name:"Borowik szlachetny", type:"Jadalny", icon:"🍄", found:false },
{ name:"Podgrzybek brunatny", type:"Jadalny", icon:"🍄", found:false },
{ name:"Koźlarz czerwony", type:"Jadalny", icon:"🍄", found:false },
{ name:"Koźlarz babka", type:"Jadalny", icon:"🍄", found:false },
{ name:"Maślak zwyczajny", type:"Jadalny", icon:"🍄", found:false },
{ name:"Pieprznik jadalny (kurka)", type:"Jadalny", icon:"🍄", found:false },
{ name:"Czubajka kania", type:"Jadalny", icon:"🍄", found:false },
{ name:"Opieńka miodowa", type:"Jadalny", icon:"🍄", found:false },
{ name:"Mleczaj rydz (rydz)", type:"Jadalny", icon:"🍄", found:false },
{ name:"Gąska zielonka", type:"Jadalny", icon:"🍄", found:false },
{ name:"Gąska siwa", type:"Jadalny", icon:"🍄", found:false },
{ name:"Mleczaj świerkowy", type:"Jadalny", icon:"🍄", found:false },
{ name:"Pieczarka polna", type:"Jadalny", icon:"🍄", found:false },
{ name:"Pieczarka leśna", type:"Jadalny", icon:"🍄", found:false },

{ name:"Muchomor czerwony", type:"Trujący", icon:"⚠️", found:false },
{ name:"Muchomor plamisty", type:"Trujący", icon:"⚠️", found:false },
{ name:"Borowik szatański", type:"Trujący", icon:"⚠️", found:false },
{ name:"Muchomor sromotnikowy", type:"Śmiertelnie trujący", icon:"☠️", found:false }

];


// 📸 INIT
document.addEventListener("DOMContentLoaded", ()=>{

renderAtlas();

const scanBtn = document.getElementById("scanBtn");
const input = document.getElementById("cameraInput");

if(scanBtn && input){

scanBtn.addEventListener("click", ()=>{
input.click();
});

input.addEventListener("change", async (e)=>{

if(!e.target.files.length) return;

let detected = await fakeAI();

handleDetection(detected);

});

}

});


// 🧠 AI (BEZ LOSOWOŚCI)
async function fakeAI(){

let hidden = mushroomsAtlas.find(m => !m.found);

// koniec gry
if(!hidden){
return {
name:"Wszystkie grzyby odkryte",
type:"info",
icon:"🏆",
found:true
};
}

// zwracamy kopię (stabilność)
return structuredClone
? structuredClone(hidden)
: JSON.parse(JSON.stringify(hidden));

}


// 🎮 DETEKCJA
function handleDetection(m){

const result = document.getElementById("scanResult");

if(!result){
console.error("Brak scanResult w HTML");
return;
}

if(!m){
result.innerHTML = "❌ Nie rozpoznano grzyba";
return;
}

// koniec gry
if(m.name === "Wszystkie grzyby odkryte"){
result.innerHTML = `
🏆 KONIEC GRY<br><br>
Wszystkie grzyby zostały odkryte!
`;
return;
}

// już odkryty
if(m.found){
result.innerHTML = `
🔎 Już odkryty grzyb<br><br>
<b>${m.name}</b><br>
ℹ️ Jest już w atlasie
`;
return;
}

// NOWE ODKRYCIE
m.found = true;

result.innerHTML = `
🎉 NOWY GATUNEK ODKRYTY!<br><br>
🍄 <b>${m.name}</b><br>
Typ: ${m.type}
`;

renderAtlas();

}


// 🗂️ ATLAS
function renderAtlas(){

const box = document.getElementById("atlas");

if(!box){
console.error("Brak atlas w HTML");
return;
}

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
