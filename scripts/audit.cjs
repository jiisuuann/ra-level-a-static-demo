'use strict';
const fs=require('node:fs'),path=require('node:path'),crypto=require('node:crypto'),assert=require('node:assert/strict');
const FILES=Object.freeze(['app.js','index.html','style.css','synthetic-data.js']);
function audit(directory){
 const root=path.resolve(directory);assert.ok(!fs.lstatSync(root).isSymbolicLink(),'Artifact root must not be a symlink');
 assert.deepEqual(fs.readdirSync(root).sort(),[...FILES].sort(),'Exactly four approved static files required');
 const text={};
 for(const name of FILES){const full=path.join(root,name),stat=fs.lstatSync(full);assert.ok(stat.isFile()&&!stat.isSymbolicLink()&&stat.nlink===1,'Only ordinary unlinked files permitted');assert.ok(stat.size<100000,'Unexpectedly large artifact');text[name]=fs.readFileSync(full,'utf8');
  for(const rule of [/-----BEGIN (?:[A-Z ]+ )?PRIVATE KEY-----/,/\b(?:gh[pousr]_[A-Za-z0-9]{20,}|github_pat_[A-Za-z0-9_]{20,}|AKIA[A-Z0-9]{16})\b/,/college_town_home_sales|\/api\/|ra-ai-agent-dry-run|\/Users\/|address_street|parcel_number|listing_id|county_fips/,/University of Wisconsin|Purdue|Chapel Hill|Charlottesville|Gainesville|State College/])assert.ok(!rule.test(text[name]),'Forbidden credential/private-source signature in '+name);
 }
 assert.match(text['index.html'],/Synthetic demonstration — no real housing-sale data/);
 assert.match(text['synthetic-data.js'],/SYNTHETIC_ONLY/);assert.match(text['app.js'],/SYNTHETIC_ONLY/);
 assert.ok(!/\bfetch\s*\(|XMLHttpRequest|WebSocket|sendBeacon|\beval\s*\(|innerHTML|document\.write/.test(text['app.js']+text['synthetic-data.js']),'No networking or unsafe dynamic HTML/scripts');
 assert.ok(!/@import|url\(/i.test(text['style.css']),'No external CSS assets');
 assert.ok(!/(?:api[_-]?key|password|client[_-]?secret)\s*[:=]\s*[\"']{1}[^\"'\s]{8,}/i.test(Object.values(text).join('\n')),'No literal credentials');
 assert.ok(!/latitude|longitude|https?:\/\//i.test(text['synthetic-data.js']),'No geographic/property coordinates or remote data in generator');
 const html=text['index.html'];assert.deepEqual([...html.matchAll(/(?:src|href)="([^"]+)"/g)].map(m=>m[1]),['./style.css','./synthetic-data.js','./app.js','./'],'Relative allowlisted URLs only');
 assert.match(html,/connect-src 'none'/);assert.ok(!/<(?:iframe|form|base)\b/i.test(html));
 const vm=require('node:vm'),context=vm.createContext({});vm.runInContext(text['synthetic-data.js'],context,{timeout:1000});const data=JSON.parse(JSON.stringify(context.DemoData));
 assert.deepEqual(Object.keys(data).sort(),['cities','provenance','records','types','universities','years']);assert.equal(data.provenance,'SYNTHETIC_ONLY');assert.deepEqual(data.universities.map(item=>item.name),['Aster College','Harborlight University','Juniper Institute']);
 assert.deepEqual(data.cities.map(item=>item.name),['Aster Hollow','Copper Meadow','Lumen Quay','Pearl Crossing','Juniper Reach','Willow Orbit']);assert.equal(data.records.length,1944);assert.equal(data.cities.length,6);assert.deepEqual(data.years,[2022,2023,2024]);assert.deepEqual(data.types,['House','Condo','Townhome']);
 for(const row of data.records){assert.deepEqual(Object.keys(row).sort(),['city','date','price','type','university']);const c=data.cities.findIndex(item=>item.key===row.city),y=Number(row.date.slice(0,4))-2022,m=Number(row.date.slice(5,7)),sample=(Number(row.date.slice(8))-6)/8,t=data.types.indexOf(row.type);assert.ok(c>=0&&y>=0&&y<=2&&m>=1&&m<=12&&[0,1,2].includes(sample)&&t>=0);assert.equal(row.university,data.cities[c].university);assert.equal(row.price,145000+c*19000+y*8000+m*350+t*16000+sample*2400,'Arbitrary invented formula must match every record');}
 for(const item of data.cities)assert.deepEqual(Object.keys(item).sort(),['key','name','university','x','y']);for(const item of data.universities)assert.deepEqual(Object.keys(item).sort(),['key','name','x','y']);
 for(const item of [...data.cities,...data.universities])assert.ok(Number.isInteger(item.x)&&Number.isInteger(item.y)&&item.x>=100&&item.x<=900&&item.y>=50&&item.y<=450,'Diagram positions must be integer layout units');
 return FILES.map(name=>({file:name,bytes:Buffer.byteLength(text[name]),sha256:crypto.createHash('sha256').update(text[name]).digest('hex')}));
}
module.exports={audit,FILES};
if(require.main===module){for(const item of audit(process.argv[2]||'site'))console.log('PASS',item.file,item.bytes,'bytes',item.sha256);console.log('PASS: static allowlist, invented formula/schema, relative assets, labels and no private/external data access.');}
