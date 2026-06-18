document.addEventListener("DOMContentLoaded",()=>{


document.getElementById("aiBtn").onclick=()=>{


let lista=[

"🍄 Borowik szlachetny (JADALNY)",
"🍄 Podgrzybek (JADALNY)",
"⚠️ Muchomor czerwony (TRUJĄCY)",
"☠️ Muchomor sromotnikowy"

];


document.getElementById(
"aiResult"
).innerText=
lista[
Math.floor(
Math.random()*lista.length
)
];


};


});
