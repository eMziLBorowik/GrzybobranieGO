// ============================
// 🏕️ SURVIVAL - Grzybiarz PRO
// Działa całkowicie offline
// ============================

const survivalData = [
{
id:"fire",
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
id:"shelter",
title:"⛺ Schronienie",
tips:[
"Znajdź miejsce osłonięte od wiatru.",
"Unikaj zagłębień terenu podczas deszczu.",
"Wykorzystaj gałęzie i plandekę do budowy schronienia.",
"Izoluj się od zimnego podłoża.",
"Sprawdź czy nad schronieniem nie ma suchych konarów."
]
},
{
id:"water",
title:"💧 Woda",
tips:[
"Najbezpieczniej przegotować wodę przed spożyciem.",
"Unikaj stojącej wody jeśli to możliwe.",
"Używaj filtrów turystycznych.",
"Regularnie pij małe ilości wody.",
"Nie czekaj z piciem aż poczujesz silne pragnienie."
]
},
{
id:"food",
title:"🍓 Pożywienie",
tips:[
"Jedz tylko gatunki które potrafisz pewnie rozpoznać.",
"Nie spożywaj nieznanych roślin i grzybów.",
"Zabieraj awaryjne przekąski energetyczne.",
"Przechowuj żywność w szczelnych opakowaniach.",
"Planuj zapas jedzenia przed dłuższą wyprawą."
]
},
{
id:"navigation",
title:"🧭 Orientacja",
tips:[
"Przed wejściem do lasu zapisz punkt startowy.",
"Zwracaj uwagę na charakterystyczne punkty terenu.",
"Noś naładowany telefon.",
"Mapa papierowa może uratować sytuację.",
"Regularnie sprawdzaj kierunek marszu."
]
},
{
id:"firstaid",
title:"🚑 Pierwsza pomoc",
tips:[
"Zawsze noś podstawową apteczkę.",
"Skaleczenia oczyść i zabezpiecz opatrunkiem.",
"Kleszcza usuń możliwie szybko.",
"Przy objawach wychłodzenia szukaj ciepłego schronienia.",
"W sytuacji zagrożenia dzwoń po pomoc."
]
},
{
id:"equipment",
title:"🎒 Ekwipunek",
tips:[
"Naładuj telefon przed wyjściem.",
"Zabierz powerbank.",
"Noś latarkę lub czołówkę.",
"Spakuj wodę i apteczkę.",
"Dostosuj wyposażenie do długości wyprawy."
]
},
{
id:"emergency",
title:"🚨 Sytuacje awaryjne",
tips:[
"Zachowaj spokój.",
"Nie oddalaj się bez planu.",
"Spróbuj wrócić do ostatniego znanego punktu.",
"Skorzystaj z GPS lub kompasu.",
"W razie potrzeby wezwij pomoc."
]
}
];

function renderSurvival(containerId){

const container = document.getElementById(containerId);
if(!container) return;

container.innerHTML = "";

survivalData.forEach(item=>{

const card = document.createElement("div");
card.className = "card";

card.innerHTML = `
<h3>${item.title}</h3>
<button>Otwórz</button>
`;

card.querySelector("button").onclick = ()=>{

let text = `<h2>${item.title}</h2>`;

item.tips.forEach(t=>{
text += `<p>• ${t}</p>`;
});

container.innerHTML = `
<div class="card">
${text}
<br>
<button id="survivalBackBtn">⬅ Powrót</button>
</div>
`;

document.getElementById("survivalBackBtn").onclick = ()=>{
renderSurvival(containerId);
};

};

container.appendChild(card);

});

  }
