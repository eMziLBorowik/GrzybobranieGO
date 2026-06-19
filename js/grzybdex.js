
const mushroomsAtlas = [

{
name:"Borowik szlachetny",
type:"Jadalny",
icon:"🍄",
found:false
},

{
name:"Podgrzybek brunatny",
type:"Jadalny",
icon:"🍄",
found:false
},

{
name:"Koźlarz czerwony",
type:"Jadalny",
icon:"🍄",
found:false
},

{
name:"Koźlarz babka",
type:"Jadalny",
icon:"🍄",
found:false
},

{
name:"Maślak zwyczajny",
type:"Jadalny",
icon:"🍄",
found:false
},

{
name:"Pieprznik jadalny (kurka)",
type:"Jadalny",
icon:"🍄",
found:false
},

{
name:"Czubajka kania",
type:"Jadalny",
icon:"🍄",
found:false
},

{
name:"Opieńka miodowa",
type:"Jadalny",
icon:"🍄",
found:false
},

{
name:"Mleczaj rydz (rydz)",
type:"Jadalny",
icon:"🍄",
found:false
},

{
name:"Gąska zielonka",
type:"Jadalny",
icon:"🍄",
found:false
},

{
name:"Gąska siwa",
type:"Jadalny",
icon:"🍄",
found:false
},

{
name:"Mleczaj świerkowy",
type:"Jadalny",
icon:"🍄",
found:false
},

{
name:"Pieczarka polna",
type:"Jadalny",
icon:"🍄",
found:false
},

{
name:"Pieczarka leśna",
type:"Jadalny",
icon:"🍄",
found:false
},

{
name:"Muchomor czerwony",
type:"Trujący",
icon:"⚠️",
found:false
},

{
name:"Muchomor plamisty",
type:"Trujący",
icon:"⚠️",
found:false
},

{
name:"Borowik szatański",
type:"Trujący",
icon:"⚠️",
found:false
},

{
name:"Muchomor sromotnikowy",
type:"Śmiertelnie trujący",
icon:"☠️",
found:false
}

];


// 📸 SCAN BUTTON
document.getElementById("scanBtn")
.addEventListener("click", ()=>{
document.getElementById("cameraInput").click();
});


// 📷 INPUT ZDJĘCIA
document.getElementById("cameraInput")
.addEventListener("change", async (e)=>{

if(!e.target.files.length) return;

let detected = await fakeAI();

handleDetection(detected);

});


// 🧠 FAKE AI (BEZ LOSOWOŚCI)
async function fakeAI(){

let hidden = mushroomsAtlas.find(m => !m.found);

if(!hidden) return mushroomsAtlas[0];

return hidden;

}


// 🎮 ODKRYWANIE
function handleDetection(m){

let result = document.getElementById("scanResult");

if(!m) return;

// już odkryty
if(m.found){

result.innerHTML = `
🔎 Już odkryty grzyb:<br>
<b>${m.name}</b><br>
ℹ️ Ten grzyb jest już w Twoim atlasie
`;

return;
}

// NOWY GRZYB
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

let box = document.getElementById("atlas");

if(!box) return;

box.innerHTML = "";

mushroomsAtlas.forEach((m)=>{

let div = document.createElement("div");
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


// 🚀 START
document.addEventListener("DOMContentLoaded", ()=>{
renderAtlas();
});
