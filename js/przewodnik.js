const guideData = [

{
title:"🌳 O aplikacji",
text:[
"Celem Leśnej Przygody jest zachęcenie ludzi do spędzania czasu na łonie natury.",
"Aplikacja łączy mapę GPS, atlas odkryć, trasy oraz kilka sposobów przetrwania w kryzysowych sytuacjach."
]
},

{
title:"🗺 Mapa",
text:[
"Mapa pokazuje Twoją aktualną lokalizację GPS,oraz lasy i Parki Narodowe w promieniu 15km",
"Możesz sprawdzać lasy w twojej okolicy ale również po kliknięciu na las zobaczysz min takie informacje jak opady z ostatnich 30dni."
]
},

{
title:"🍄 Atlas odkryć",
text:[
"W tej zakładce zapisujesz swoje odkrycia.",
"Możesz korzystać ze skanowania aparatem, budować własny atlas oraz odkrywać nowe GRALE.... nie wiadomo czego się spodziewać!!!"
]
},

{
title:"🥾 Trasy",
text:[
"Funkcja tras pozwala zapisywać spacery i wyprawy.",
"Mierzy czas, dystans oraz przebytą drogę.",
"Podczas spacerów po lasach lub Parkach Narodowych/Rezerwatach odkrywasz jego teren"
]
},

{
title:"🔥 Survival",
text:[
"Poradnik survival zawiera podstawowe informacje o przetrwaniu w lesie w kryzysowych sytuacjach.",
"Znajdziesz tutaj wskazówki dotyczące ognia, wody, orientacji i bezpieczeństwa."
]
},

{
title:"📍 GPS",
text:[
"Dla poprawnego działania aplikacji zezwól na dostęp do lokalizacji.",
"GPS działa najlepiej na otwartej przestrzeni."
]
},

{
title:"🚀 Rozwój aplikacji",
text:[
"Aplikacja będzie z czasem rozwijana o nowe funkcje.",
"Planowane są kolejne narzędzia dla miłośników lasów i przyrody."
]
}

];


// ============================
// START
// ============================

function loadGuide(){
  const box = document.getElementById("guideContent");
  if(!box) return;
  renderGuide();
}


// ============================
// LISTA KAFELKÓW (NOWY UI)
// ============================

function renderGuide(){

  const box = document.getElementById("guideContent");
  if(!box) return;

  box.innerHTML = "";

  guideData.forEach(item => {

    const card = document.createElement("div");

    card.style.background = "#162013";
    card.style.border = "1px solid #314b25";
    card.style.borderRadius = "18px";
    card.style.padding = "15px";
    card.style.marginBottom = "12px";
    card.style.color = "white";
    card.style.boxShadow = "0 6px 18px rgba(0,0,0,0.25)";

    card.innerHTML = `
      <h3 style="margin:0 0 10px 0;">
        ${item.title}
      </h3>

      <div style="opacity:0.85; font-size:14px;">
        ${item.text.slice(0,1).map(t => `<p>• ${t}</p>`).join("")}
      </div>

      <button style="margin-top:10px; width:100%;">
        Otwórz
      </button>
    `;

    card.querySelector("button").onclick = function () {
      openGuideArticle(item);
    };

    box.appendChild(card);
  });
}


// ============================
// ARTYKUŁ (CLEAN VIEW)
// ============================

function openGuideArticle(item){

  const box = document.getElementById("guideContent");
  if(!box) return;

  box.innerHTML = "";

  const content = document.createElement("div");

  content.style.background = "#162013";
  content.style.border = "1px solid #314b25";
  content.style.borderRadius = "18px";
  content.style.padding = "18px";
  content.style.color = "white";

  let html = `
    <h2 style="margin-top:0;">
      ${item.title}
    </h2>
  `;

  item.text.forEach(line => {
    html += `<p style="opacity:0.9;">• ${line}</p>`;
  });

  html += `
    <button id="backGuide" style="width:100%; margin-top:15px;">
      ⬅ Powrót
    </button>
  `;

  content.innerHTML = html;

  box.appendChild(content);

  document.getElementById("backGuide").onclick = function () {
    renderGuide();
  };
}
