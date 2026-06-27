
// ============================
// 🏕️ SURVIVAL - Grzybiarz PRO
// Zakładka offline (moduł UI)
// ============================


// ============================
// DANE OFFLINE
// ============================

const survivalData = [

{
title:"🔥 Ogień",
image:"images/survival/ogien.webp",
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
image:"images/survival/namiot.webp",
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
// START ZAKŁADKI
// ============================

function openSurvival(){

const box = document.getElementById("survivalContent");
if(!box) return;

// tylko reset widoku (CSS robi resztę)
box.innerHTML = "";

renderSurvivalList();

// scroll na górę (ważne UX)
box.scrollTop = 0;
}


// ============================
// LISTA KART
// ============================

function renderSurvivalList(){

const box = document.getElementById("survivalContent");
if(!box) return;

box.innerHTML = "";

survivalData.forEach(item => {

let card = document.createElement("div");

card.style.height = "160px";
card.style.position = "relative";
card.style.overflow = "hidden";

card.style.background = `
linear-gradient(rgba(0,0,0,0.35), rgba(0,0,0,0.75)),
url(${item.image || ''})
`;

card.style.backgroundSize = "cover";
card.style.backgroundPosition = "center";

card.style.color = "white";
card.style.borderRadius = "18px";
card.style.padding = "18px";
card.style.marginBottom = "15px";
card.style.boxShadow = "0 4px 12px rgba(0,0,0,0.3)";

card.innerHTML = `
<h3>${item.title}</h3>
<button>Otwórz</button>
`;

card.querySelector("button").onclick = () => {
renderSurvivalDetail(item);
};

box.appendChild(card);

});

}


// ============================
// DETAIL VIEW
// ============================

function renderSurvivalDetail(item){

const box = document.getElementById("survivalContent");
if(!box) return;

box.innerHTML = "";

let content = document.createElement("div");

content.style.background = "rgba(255,255,255,0.95)";
content.style.color = "#111";
content.style.borderRadius = "18px";
content.style.padding = "20px";

let html = `<h2>${item.title}</h2>`;

item.tips.forEach(t => {
html += `<p>• ${t}</p>`;
});

html += `<button id="backSurvival">⬅ Powrót</button>`;

content.innerHTML = html;

box.appendChild(content);

document.getElementById("backSurvival").onclick = () => {
renderSurvivalList();
box.scrollTop = 0;
};

}
