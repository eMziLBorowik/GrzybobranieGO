// ============================
// 🏕️ SURVIVAL - Grzybiarz PRO
// Offline
// ============================


const survivalData = [

{
title:"🔥 Ogień",
tips:[
"Kora brzozy jest bardzo dobrą rozpałką.",
"Zbieraj suche gałązki spod świerków i sosen.",
"Przygotuj zapas drewna przed rozpaleniem ognia.",
"Nie rozpalaj ognia podczas silnego wiatru.",
"Przestrzegaj lokalnych przepisów dotyczących ognisk."
]
},

{
title:"⛺ Schronienie",
tips:[
"Znajdź miejsce osłonięte od wiatru.",
"Unikaj zagłębień terenu podczas deszczu.",
"Wykorzystaj gałęzie i plandekę.",
"Izoluj się od zimnego podłoża.",
"Sprawdź suche konary nad miejscem noclegu."
]
},

{
title:"💧 Woda",
tips:[
"Najbezpieczniej przegotować wodę.",
"Unikaj stojącej wody.",
"Używaj filtrów turystycznych.",
"Pij regularnie."
]
},

{
title:"🍓 Pożywienie",
tips:[
"Jedz tylko pewnie rozpoznane gatunki.",
"Nie jedz nieznanych roślin.",
"Zabierz zapas energii.",
"Przechowuj jedzenie szczelnie."
]
},

{
title:"🧭 Orientacja",
tips:[
"Zapisz punkt wejścia do lasu.",
"Obserwuj charakterystyczne miejsca.",
"Noś telefon z GPS.",
"Kompas może uratować sytuację.",
"Kontroluj kierunek marszu."
]
},

{
title:"🚑 Pierwsza pomoc",
tips:[
"Noś podstawową apteczkę.",
"Zabezpieczaj rany.",
"Kleszcza usuń szybko.",
"Przy wychłodzeniu szukaj ciepła."
]
},

{
title:"🎒 Ekwipunek",
tips:[
"Naładuj telefon.",
"Zabierz powerbank.",
"Latarka jest bardzo ważna.",
"Zawsze miej wodę."
]
},

{
title:"🚨 Sytuacje awaryjne",
tips:[
"Zachowaj spokój.",
"Nie biegnij bez celu.",
"Wróć do ostatniego znanego miejsca.",
"W razie potrzeby dzwoń po pomoc."
]
}

];



// ============================
// START
// ============================

function loadSurvival(){

const box=document.getElementById("survivalContent");

if(!box) return;


// przewijanie

box.style.height="calc(100vh - 170px)";
box.style.overflowY="auto";
box.style.padding="15px";

renderSurvival();

}



// ============================
// KAFELKI
// ============================

function renderSurvival(){


const box=document.getElementById("survivalContent");

box.innerHTML="";


survivalData.forEach(item=>{


let card=document.createElement("div");


card.style.background="rgba(255,255,255,0.92)";
card.style.color="#111";
card.style.borderRadius="18px";
card.style.padding="18px";
card.style.marginBottom="15px";
card.style.boxShadow="0 4px 12px rgba(0,0,0,0.3)";


card.innerHTML=`

<h3>${item.title}</h3>

<button>
Otwórz
</button>

`;



card.querySelector("button").onclick=function(){


let content=document.createElement("div");


content.style.background="rgba(255,255,255,0.95)";
content.style.color="#111";
content.style.borderRadius="18px";
content.style.padding="20px";


let html=`

<h2>${item.title}</h2>

`;



item.tips.forEach(t=>{

html+=`

<p>
• ${t}
</p>

`;

});


html+=`

<button id="backSurvival">
⬅ Powrót
</button>

`;


content.innerHTML=html;


box.innerHTML="";

box.appendChild(content);



document.getElementById("backSurvival").onclick=function(){

renderSurvival();

};


};


box.appendChild(card);


});


}
