/* SYNTHETIC_ONLY: independently invented demonstration data. No source-data inputs. */
'use strict';
(() => {
  const universities = [
    {key:'aster',name:'Aster College',x:190,y:170},
    {key:'harborlight',name:'Harborlight University',x:650,y:150},
    {key:'juniper',name:'Juniper Institute',x:470,y:340}
  ];
  const cities = [
    {key:'aster-hollow',name:'Aster Hollow',university:'aster',x:180,y:160},
    {key:'copper-meadow',name:'Copper Meadow',university:'aster',x:245,y:205},
    {key:'lumen-quay',name:'Lumen Quay',university:'harborlight',x:640,y:125},
    {key:'pearl-crossing',name:'Pearl Crossing',university:'harborlight',x:710,y:185},
    {key:'juniper-reach',name:'Juniper Reach',university:'juniper',x:445,y:325},
    {key:'willow-orbit',name:'Willow Orbit',university:'juniper',x:520,y:370}
  ];
  const types=['House','Condo','Townhome'], years=[2022,2023,2024];
  const records=[];
  // Simple arbitrary arithmetic, not calibrated to any real prices, locations or distributions.
  cities.forEach((city,cityIndex)=>years.forEach((year,yearIndex)=>{
    for(let month=1;month<=12;month++)types.forEach((type,typeIndex)=>{
      for(let sample=0;sample<3;sample++)records.push(Object.freeze({
        university:city.university,city:city.key,type,
        date:`${year}-${String(month).padStart(2,'0')}-${String(6+sample*8).padStart(2,'0')}`,
        price:145000+cityIndex*19000+yearIndex*8000+month*350+typeIndex*16000+sample*2400
      }));
    });
  }));
  globalThis.DemoData=Object.freeze({provenance:'SYNTHETIC_ONLY',universities:Object.freeze(universities.map(Object.freeze)),cities:Object.freeze(cities.map(Object.freeze)),types:Object.freeze(types),years:Object.freeze(years),records:Object.freeze(records)});
})();
