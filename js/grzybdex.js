document.getElementById('aiBtn').onclick=()=>{
const t=[
'🍄 Borowik szlachetny (JADALNY)',
'🍄 Podgrzybek (JADALNY)',
'⚠️ Muchomor czerwony (TRUJĄCY)',
'☠️ Muchomor sromotnikowy'
];
document.getElementById('aiResult').innerText=t[Math.floor(Math.random()*t.length)];
};
