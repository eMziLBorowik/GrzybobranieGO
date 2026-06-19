let forests = [];
let forestGroups = [];

// ⏳ COOLDOWN
let lastForestRequest = 0;

function getArea(points){
  // uproszczony “score” powierzchni
  let area = 0;
  for(let i=0;i<points.length-1;i++){
    area += points[i][0] * points[i+1][1] - points[i+1][0] * points[i][1];
  }
  return Math.abs(area);
}

// sprawdza czy punkt jest w przybliżeniu w poligonie (bounding box hack)
function isInside(polyA, polyB){
  const lats = polyA.map(p=>p[0]);
  const lngs = polyA.map(p=>p[1]);

  const minLat = Math.min(...lats);
  const maxLat = Math.max(...lats);
  const minLng = Math.min(...lngs);
  const maxLng = Math.max(...lngs);

  return polyB.some(p =>
    p[0] >= minLat && p[0] <= maxLat &&
    p[1] >= minLng && p[1] <= maxLng
  );
}

async function loadForests(lat, lng){

  const now = Date.now();

  if(now - lastForestRequest < 15000){
    console.log("⏳ cooldown forests API");
    return;
  }

  lastForestRequest = now;

  const q = `
  [out:json];

  (
    way["landuse"="forest"](around:15000,${lat},${lng});
    relation["landuse"="forest"](around:15000,${lat},${lng});

    way["natural"="wood"](around:15000,${lat},${lng});
    relation["natural"="wood"](around:15000,${lat},${lng});

    relation["boundary"="national_park"](around:15000,${lat},${lng});
    relation["boundary"="protected_area"](around:15000,${lat},${lng});
  );

  out geom;
  `;

  const url =
  "https://overpass-api.de/api/interpreter?data=" +
  encodeURIComponent(q);

  try{

    const res = await fetch(url);

    if(res.status === 429){
      setTimeout(()=>loadForests(lat,lng),10000);
      return;
    }

    const data = await res.json();

    // 🔥 RESET
    forests.forEach(f => map.removeLayer(f));
    forests = [];
    forestGroups = [];

    // 🔥 PREPARE DATA
    let raw = [];

    data.elements.forEach(el=>{
      if(!el?.geometry) return;

      const pts = el.geometry
        .filter(p => p?.lat && p?.lon)
        .map(p => [p.lat, p.lon]);

      if(pts.length < 4) return;

      raw.push({
        pts,
        tags: el.tags || {},
        area: getArea(pts)
      });
    });

    // 🔥 SORT BIGGEST FIRST
    raw.sort((a,b)=>b.area - a.area);

    const used = new Set();

    // 🔥 GROUPING (big eats small)
    for(let i=0;i<raw.length;i++){

      if(used.has(i)) continue;

      const main = raw[i];
      const group = {
        main,
        children: []
      };

      for(let j=i+1;j<raw.length;j++){

        if(used.has(j)) continue;

        const other = raw[j];

        if(isInside(main.pts, other.pts)){
          group.children.push(other);
          used.add(j);
        }
      }

      used.add(i);
      forestGroups.push(group);
    }

    // 🔥 RENDER ONLY GROUP MASTERS
    forestGroups.forEach(group=>{

      const poly = L.polygon(group.main.pts,{
        color:"#2e8b57",
        fillColor:"#3cb371",
        fillOpacity:0.25,
        weight:2
      }).addTo(map);

      forests.push(poly);

      poly.on("click",(e)=>{
        L.DomEvent.stopPropagation(e);

        showForestInfo({
          tags: group.main.tags,
          subForests: group.children.length
        }, group.main.pts);
      });

    });

    document.getElementById("forestStatus").innerText =
    "🌲 Lasy zgrupowane i gotowe";

  } catch(e){
    console.log(e);
    document.getElementById("forestStatus").innerText =
    "❌ Błąd lasów";
  }
}
