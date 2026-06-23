let mushroomsAtlas = [];
let currentUser = null;


// 🔐 START
document.addEventListener("DOMContentLoaded", async () => {

console.log("🧠 GrzybDex start");

mushroomsAtlas = window.mushroomsAtlas || [];

if(!mushroomsAtlas.length){
console.warn("⚠️ atlas pusty - sprawdź mushrooms.js");
}

await getUser();

await loadUserProgress();

renderAtlas();

setupScanner();

});



// 👤 USER
async function getUser(){

const client = window.supabase;

if(!client){
console.error("❌ brak supabaseClient");
return;
}

const { data, error } = await client.auth.getUser();


if(error){
console.log("USER ERROR:",error);
return;
}


currentUser = data.user;


console.log(
"👤 user:",
currentUser?.email
);

}





// 📷 SCANNER

function setupScanner(){


const scanBtn =
document.getElementById("scanBtn");


const input =
document.getElementById("cameraInput");



if(!scanBtn || !input){

console.error("❌ brak aparatu");

return;

}



console.log("📷 scanner ready");



scanBtn.onclick = ()=>{

input.click();

};



input.onchange = async(e)=>{


if(!e.target.files.length)
return;



const file =
e.target.files[0];



document.getElementById("scanResult").innerHTML =
"🤖 Analizuję zdjęcie...";



// 🔥 AI VISION

const ai =
await analyzeMushroomWithAI(file);



if(!ai){

document.getElementById("scanResult").innerHTML =
"❌ Nie rozpoznano grzyba";

return;

}



// pobranie z bazy

const {data:mushroom,error} =
await window.supabase
.from("mushrooms")
.select("*")
.eq("id",ai.id)
.single();



if(error || !mushroom){

document.getElementById("scanResult").innerHTML =
"❌ Brak grzyba w bazie";

return;

}




// szukanie w atlasie

let found =
mushroomsAtlas.find(
x=>x.name===mushroom.name
);



if(!found){


found={

name:mushroom.name,

type:mushroom.type,

icon:"🍄",

found:false,

id:mushroom.id

};


mushroomsAtlas.push(found);


}




await handleDetection(found);



input.value="";


};



}





// 🤖 AI VISION PRO

async function analyzeMushroomWithAI(file){


const client =
window.supabase;



// upload zdjęcia

const filename =
"scan-"+Date.now()+".jpg";



const {error:uploadError}=

await client.storage
.from("mushrooms")
.upload(
filename,
file
);



if(uploadError){

console.log(uploadError);

return null;

}





const {data:urlData}=

client.storage
.from("mushrooms")
.getPublicUrl(filename);



const imageUrl =
urlData.publicUrl;





// pobieramy bazę grzybów

const {data:mushrooms}=

await client
.from("mushrooms")
.select(
"id,name,latin_name,type,danger"
);





// AI

const response =
await fetch(
"https://api.openai.com/v1/chat/completions",
{


method:"POST",


headers:{


"Content-Type":"application/json",


"Authorization":
"Bearer TWOJ_OPENAI_KEY"


},


body:JSON.stringify({


model:"gpt-4o-mini",


messages:[


{


role:"system",


content:`

Jesteś ekspertem od grzybów.

Dopasuj zdjęcie do tej bazy:

${JSON.stringify(mushrooms)}


Zwróć tylko JSON:

{
"id": liczba,
"confidence": liczba
}

`

},



{


role:"user",


content:[


{

type:"text",

text:"Rozpoznaj grzyba"


},


{


type:"image_url",

image_url:{

url:imageUrl

}


}


]


}


],


temperature:0.2



})



}

);





const data =
await response.json();



try{


return JSON.parse(
data.choices[0]
.message.content
);


}

catch(e){


console.log(
"AI ERROR:",
data
);


return null;


}



}








// 🎮 HANDLE

async function handleDetection(m){


const result =
document.getElementById("scanResult");



if(!result)
return;



if(m.found){


result.innerHTML =
`
🔎 Już odkryty<br>
🍄 <b>${m.name}</b>
`;

return;


}





m.found=true;



result.innerHTML=
`

🎉 ODKRYTO!

<br><br>

🍄 <b>${m.name}</b>

`;



await saveDiscovery(m);



renderAtlas();



}







// 💾 SAVE

async function saveDiscovery(m){


if(!currentUser)
return;



const {error}=

await window.window.supabase

.from("user_mushrooms")

.insert([{


user_id:
currentUser.id,


mushroom_id:
m.name


}]);



if(error){

console.log(
"SAVE ERROR:",
error
);

}



}







// 📥 LOAD

async function loadUserProgress(){



if(!currentUser)
return;



const {data,error}=

await window.window.supabase

.from("user_mushrooms")

.select("*")

.eq(
"user_id",
currentUser.id
);




if(error){

console.log(
"LOAD ERROR:",
error
);

return;

}



data.forEach(row=>{


const m =
mushroomsAtlas.find(
x=>x.name===row.mushroom_id
);



if(m){

m.found=true;

}



});



console.log(
"📥 progress loaded"
);



}









// 🗂️ ATLAS

function renderAtlas(){



const box =
document.getElementById("atlas");



if(!box)
return;



box.innerHTML="";




mushroomsAtlas.forEach(m=>{



const div =
document.createElement("div");

div.className="card";



if(m.found){


div.innerHTML=
`

<h3>${m.icon} ${m.name}</h3>

<p>${m.type}</p>

`;



}

else{


div.innerHTML=
`

<h3>❓ Nieodkryty grzyb</h3>

<p>Znajdź go w lesie</p>

`;

}



box.appendChild(div);



});



}
