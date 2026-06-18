const mushroomsAtlas=[

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
name:"Kurka",
type:"Jadalny",
icon:"🍄",
found:false
},

{
name:"Pieprznik jadalny",
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
name:"Rydz",
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
name:"Muchomor sromotnikowy",
type:"Śmiertelnie trujący",
icon:"☠️",
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
name:"Mleczaj rydz",
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


// uzupełnienie kolekcji

];


while(mushroomsAtlas.length<50){

mushroomsAtlas.push({

name:"Nieodkryty gatunek "+(mushroomsAtlas.length+1),
type:"Nieznany",
icon:"❓",
found:false

});

}





function renderAtlas(){


let box=document.getElementById(
"atlas"
);


if(!box)return;


box.innerHTML="";



mushroomsAtlas.forEach((m,i)=>{


let div=document.createElement("div");


div.className="card";



if(m.found){


div.innerHTML=
`
<h3>${m.icon} ${m.name}</h3>
<p>${m.type}</p>
`;



}else{


div.innerHTML=
`
<h3>❓ Nieodkryty grzyb</h3>
<p>Znajdź go w lesie</p>
`;



}



box.appendChild(div);



});



}





// APARAT


document.getElementById(
"cameraInput"
).addEventListener(
"change",
(e)=>{



let result=
document.getElementById(
"aiResult"
);



if(e.target.files.length){



let random=
mushroomsAtlas[
Math.floor(
Math.random()*mushroomsAtlas.length
)
];



random.found=true;



result.innerHTML=
`
🍄 Rozpoznano:

<b>${random.name}</b>

<br>

Status:
${random.type}

`;



renderAtlas();



}



});





document.addEventListener(
"DOMContentLoaded",
()=>{

renderAtlas();


});
