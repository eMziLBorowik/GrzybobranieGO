// ============================
// 📖 PRZEWODNIK PO APLIKACJI
// Leśna Przygoda
// Offline
// ============================


// ============================
// DANE PRZEWODNIKA
// ============================


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

"Mierzy czas, dystans oraz przebytą drogę."

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
// START PRZEWODNIKA
// ============================


function loadGuide(){


const box=document.getElementById("guideContent");


if(!box) return;


renderGuide();


}



// ============================
// LISTA KAFELKÓW
// ============================


function renderGuide(){


const box=document.getElementById("guideContent");


if(!box) return;


box.innerHTML="";



guideData.forEach(item=>{


const card=document.createElement("div");

card.className="card";



card.innerHTML=`

<h3>
${item.title}
</h3>


<button>
Otwórz
</button>

`;



card.querySelector("button").onclick=function(){


openGuideArticle(item);


};



box.appendChild(card);



});


}




// ============================
// ARTYKUŁ
// ============================


function openGuideArticle(item){


const box=document.getElementById("guideContent");


if(!box) return;


box.innerHTML="";



let content=document.createElement("div");


content.className="card";



let html=`

<h2>
${item.title}
</h2>

`;



item.text.forEach(line=>{


html+=`

<p>
${line}
</p>

`;


});



html+=`

<button id="backGuide">
⬅ Powrót
</button>

`;



content.innerHTML=html;


box.appendChild(content);



document.getElementById("backGuide").onclick=function(){


renderGuide();


};


}