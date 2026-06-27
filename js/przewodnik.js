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
// KAFELKI (FULL AUTO VIEW)
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

    let html = `
      <h3 style="margin:0 0 10px 0;">
        ${item.title}
      </h3>
    `;

    item.text.forEach(line => {
      html += `<p style="margin:6px 0; opacity:0.85;">• ${line}</p>`;
    });

    card.innerHTML = html;

    box.appendChild(card);
  });
}
