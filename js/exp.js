// ============================
// 🌿 EXP SYSTEM v8 FIXED
// Leśna Przygoda
// ============================


// 👤 PLAYER SAFE INIT

window.player = window.player || {
  exp:0,
  level:1
};



// ============================
// CONFIG
// ============================

const CONFIG = {

  expPer500m:50,

  forestMultiplier:1.75,

  maxSpeedKmh:8,

  maxGpsJump:100

};




// ============================
// MEMORY
// ============================


window.expState = JSON.parse(
localStorage.getItem("expState")
)
||
{
  lastLat:null,
  lastLng:null,
  distance:0
};



function saveEXPState(){

localStorage.setItem(
"expState",
JSON.stringify(window.expState)
);

}




// ============================
// LEVEL
// ============================


function getExpNeeded(level){

let base=80;

let exp=Math.floor(
base*Math.pow(level,1.45)
);


if(level<=10)
exp*=0.9;


return exp;

}




// ============================
// RANK
// ============================


function getRank(level){

if(level<=3)
return "🌱 Nowicjusz";

if(level<=8)
return "🌿 Spacerowicz";

if(level<=15)
return "🧭 Wędrowiec";

if(level<=30)
return "🥾 Tropiciel";

if(level<=50)
return "🏹 Łowca Lasu";

if(level<=74)
return "🔥 Strażnik Natury";

return "👑 Mistrz Lasu";

}





// ============================
// SUPABASE SAVE
// ============================


async function syncPlayerToSupabase(){

try{

if(!window.supabase)
return;


const {data}=await supabase.auth.getUser();

const user=data?.user;

if(!user)
return;



await supabase
.from("profiles")
.upsert({

user_id:user.id,

level:window.player.level,

exp:window.player.exp

});


}
catch(e){

console.log(
"EXP SAVE ERROR",
e
);

}

}





// ============================
// ADD EXP
// ============================


function addEXP(amount,source="unknown"){


if(!amount || amount<=0)
return;



// limit zabezpieczający

amount=Math.min(amount,100);



window.player.exp += amount;



console.log(
"🌿 +"+amount+" EXP",
source
);



while(
window.player.exp >= 
getExpNeeded(window.player.level)
){


window.player.exp -=
getExpNeeded(window.player.level);


window.player.level++;


console.log(
"🎉 LEVEL UP",
window.player.level
);

}




updateEXPUI?.();

renderExpHeader?.();

lockHeader?.();


syncPlayerToSupabase();


}







// ============================
// FOREST CHECK
// ============================


function isInForest(){

return window.isForest===true;

}







// ============================
// GPS EXP
// 500m = 50 EXP
// ============================


function trackMovementEXP(lat,lng,speed){


if(!lat || !lng)
return;


if(typeof L==="undefined")
return;





if(
window.expState.lastLat===null ||
window.expState.lastLng===null
){


window.expState.lastLat=lat;

window.expState.lastLng=lng;

saveEXPState();

return;

}





let dist=L.latLng(
window.expState.lastLat,
window.expState.lastLng
)
.distanceTo(
L.latLng(lat,lng)
);





// ignoruj GPS szum

if(dist<10)
return;





// teleport GPS

if(dist>CONFIG.maxGpsJump){


window.expState.lastLat=lat;

window.expState.lastLng=lng;

saveEXPState();

return;

}





// prędkość

let kmh=speed ? speed*3.6 : 0;



if(kmh>CONFIG.maxSpeedKmh)
return;





window.expState.distance += dist;



console.log(

"🚶 EXP DIST",

Math.floor(
window.expState.distance
),

"/500"

);





if(
window.expState.distance>=500
){



let reward =
CONFIG.expPer500m;



if(isInForest()){

reward*=CONFIG.forestMultiplier;

}



addEXP(
Math.floor(reward),
"500m spacer"
);



window.expState.distance=0;



}






window.expState.lastLat=lat;

window.expState.lastLng=lng;


saveEXPState();


}








// ============================
// STARE TRASY
// WYŁĄCZONE
// ============================


async function syncOldRoutesEXP(){

console.log(
"🌲 OLD ROUTES EXP OFF"
);

return;

}







// ============================
// HEADER
// ============================


function setHeader(html){

const sub=document.querySelector(".sub");

if(!sub)
return;



sub.innerHTML=html;

}





function renderExpHeader(){


let level=window.player.level;

let exp=window.player.exp;


let need=getExpNeeded(level);


let percent=Math.min(
100,
(exp/need)*100
);



setHeader(`

🌿 Poziom ${level}
(${getRank(level)})

<br>


<div style="
width:100%;
height:8px;
background:#162013;
border-radius:10px;
overflow:hidden;
margin-top:5px;
">


<div style="
width:${percent}%;
height:100%;
background:#6b8f3d;
">

</div>


</div>


<small>
${Math.floor(exp)}
/
${need}
EXP
</small>

`);

}





function renderDefaultHeader(){

setHeader(
"Odkrywanie lasów i przyrody 🔎🌲"
);

}





// ============================
// HEADER ROTATION
// ============================


let headerMode=0;


let headerLock=false;



setInterval(()=>{


if(headerLock)
return;



if(headerMode===0){

renderDefaultHeader();

headerMode=1;


}else{


renderExpHeader();

headerMode=0;


}


},30000);






function lockHeader(){

headerLock=true;

renderExpHeader();


setTimeout(()=>{

headerLock=false;

},2000);


}






// ============================
// EXPORT
// ============================


window.trackMovementEXP =
trackMovementEXP;


window.addEXP =
addEXP;


window.getExpNeeded =
getExpNeeded;


window.getRank =
getRank;


window.renderExpHeader =
renderExpHeader;


window.renderDefaultHeader =
renderDefaultHeader;


window.lockHeader =
lockHeader;


window.syncOldRoutesEXP =
syncOldRoutesEXP;



console.log(
"🌿 EXP SYSTEM v8 LOADED"
);
