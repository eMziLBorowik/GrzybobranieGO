async function getRain7d(lat,lng){const r=await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lng}&daily=precipitation_sum&past_days=7&timezone=auto`);const d=await r.json();return (d.daily?.precipitation_sum||[]).reduce((a,b)=>a+(b||0),0)}
async function getTemp(lat,lng){const r=await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lng}&current=temperature_2m`);const d=await r.json();return d.current?.temperature_2m||10}
function chance(r,t){return Math.min(100,(r>30?50:r>15?35:20)+(t>=10&&t<=20?40:10))}
