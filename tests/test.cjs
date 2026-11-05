'use strict';
const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict'),os=require('node:os'),path=require('node:path');
const {audit}=require('../scripts/audit.cjs');
const html=fs.readFileSync('site/index.html','utf8'),ids=new Set([...html.matchAll(/id="([^"]+)"/g)].map(m=>m[1]));
class Element{
 constructor(tag='div'){this.tag=tag;this.children=[];this._text='';this.value='';this.attrs={};this.style={};this.events={};this.hidden=false;}
 set textContent(value){this._text=String(value);this.children=[];}
 get textContent(){return this._text+this.children.map(child=>child.textContent).join('');}
 setAttribute(key,value){this.attrs[key]=String(value);}
 append(...children){this.children.push(...children);}
 replaceChildren(...children){this._text='';this.children=children;}
 add(child){this.append(child);}
 addEventListener(name,callback){this.events[name]=callback;}
 setPointerCapture(){}
 getBoundingClientRect(){return {width:1000,height:500};}
}
const elements=new Map(),get=id=>{assert.ok(ids.has(id),`Unknown element ${id}`);if(!elements.has(id))elements.set(id,new Element());return elements.get(id);};
get('from').value='2022-01-01';get('to').value='2024-12-31';
const context=vm.createContext({document:{getElementById:get,createElement:tag=>new Element(tag),createElementNS:(ns,tag)=>new Element(tag)},Intl,console,Option:function(text,value){this.textContent=text;this.value=value;}});
vm.runInContext(fs.readFileSync('site/synthetic-data.js','utf8'),context);vm.runInContext(fs.readFileSync('site/app.js','utf8'),context);
const run=code=>vm.runInContext(code,context),walk=el=>[el,...el.children.flatMap(walk)],data=JSON.parse(run('JSON.stringify(D)'));
assert.equal(get('count').textContent,'1,944');assert.equal(get('median').textContent,'$221,175');assert.equal(get('areas').textContent,'3');assert.equal(get('cities').children.length,6);
function change(id,value){get(id).value=value;get(id).events.change({target:get(id)});}
function reconcile(){const count=run('selected.length');assert.equal(Number(get('count').textContent.replaceAll(',','')),count);for(const id of ['cities','comparison']){const counts=get(id).children.filter(row=>row.children[0].children[0]).map(row=>Number(row.children[1].textContent.replaceAll(',','')));assert.equal(counts.reduce((a,b)=>a+b,0),count);}assert.equal(run('mapGroups.reduce((n,item)=>n+item.count,0)'),count);const quarters=get('trend').children.map(row=>Number(row.children[2].children[0].textContent.match(/^n=(\d+)/)[1]));assert.equal(quarters.reduce((a,b)=>a+b,0),count);for(const el of walk(get('map')))for(const value of Object.values(el.attrs))assert.ok(!/NaN|Infinity/.test(value));}
reconcile();const aster=walk(get('map')).find(node=>node.attrs.role==='button'&&node.attrs['aria-label'].startsWith('Aster College'));aster.events.click();assert.equal(get('university').value,'aster');assert.equal(get('count').textContent,'648');assert.equal(get('median').textContent,'$183,175');reconcile();
for(let i=0;i<3;i++){const marker=walk(get('map')).find(node=>node.attrs.role==='button'&&node.attrs['aria-label'].startsWith('Aster Hollow'));marker.events.keydown({key:'Enter',preventDefault(){}});assert.equal(get('count').textContent,'324');assert.equal(get('median').textContent,'$173,675');get('clear-city').onclick();const copper=get('cities').children.find(row=>row.children[0].children[0]?.textContent==='Copper Meadow');copper.children[0].children[0].onclick();assert.equal(get('city').value,'copper-meadow');reconcile();get('clear-city').onclick();}
let scenarios=0;
for(const university of ['',...data.universities.map(item=>item.key)])for(const type of ['',...data.types])for(const year of [2022,2023,2024]){change('university',university);change('type',type);change('from',`${year}-01-01`);change('to',`${year}-12-31`);const expected=data.records.filter(row=>(!university||row.university===university)&&(!type||row.type===type)&&row.date.startsWith(String(year)));assert.equal(run('selected.length'),expected.length);reconcile();scenarios++;}
get('reset').onclick();change('university','aster');change('city','aster-hollow');change('type','House');change('from','2022-01-01');change('to','2022-12-31');assert.equal(get('count').textContent,'36');assert.equal(get('median').textContent,'$149,675');reconcile();change('to','2022-01-01');assert.equal(get('count').textContent,'0');assert.equal(get('median').textContent,'—');assert.match(get('trend').textContent,/No synthetic/);assert.equal(run('mapGroups.length'),0);reconcile();change('from','2024-01-01');assert.match(get('filter-note').textContent,/valid start/);change('from','');assert.match(get('filter-note').textContent,/valid start/);
get('reset').onclick();change('university','aster');change('city','aster-hollow');change('university','harborlight');assert.equal(get('city').value,'');assert.equal(get('count').textContent,'648');reconcile();
const before=run('JSON.stringify(camera)'),count=get('count').textContent;get('zoom-in').onclick();assert.notEqual(run('JSON.stringify(camera)'),before);get('zoom-out').onclick();get('fit').onclick();assert.equal(run('JSON.stringify(camera)'),before);get('map').events.pointerdown({target:{closest(){return null;}},clientX:100,clientY:100,pointerId:1});get('map').events.pointermove({clientX:160,clientY:120,pointerId:1});get('map').events.pointerup();assert.notEqual(run('JSON.stringify(camera)'),before);get('fit').onclick();assert.equal(get('count').textContent,count);get('all-map').onclick();assert.equal(get('university').value,'');reconcile();
assert.equal(audit('site').length,4);
const temporary=fs.mkdtempSync(path.join(os.tmpdir(),'synthetic-demo-audit-'));
try{
 for(const name of fs.readdirSync('site'))fs.copyFileSync(path.join('site',name),path.join(temporary,name));
 fs.writeFileSync(path.join(temporary,'extra.csv'),'SYNTHETIC TEST PROBE');assert.throws(()=>audit(temporary));fs.unlinkSync(path.join(temporary,'extra.csv'));
 const app=fs.readFileSync(path.join(temporary,'app.js'),'utf8');fs.appendFileSync(path.join(temporary,'app.js'),'\nfetch("/api/private");');assert.throws(()=>audit(temporary));fs.writeFileSync(path.join(temporary,'app.js'),app);
 const generator=fs.readFileSync(path.join(temporary,'synthetic-data.js'),'utf8');fs.writeFileSync(path.join(temporary,'synthetic-data.js'),generator.replace('price:145000','price:1'));assert.throws(()=>audit(temporary));fs.writeFileSync(path.join(temporary,'synthetic-data.js'),generator);
 fs.unlinkSync(path.join(temporary,'app.js'));fs.symlinkSync(path.resolve('site/app.js'),path.join(temporary,'app.js'));assert.throws(()=>audit(temporary));
}finally{fs.rmSync(temporary,{recursive:true,force:true});}
const workflow=fs.readFileSync('.github/workflows/deploy.yml','utf8');assert.match(workflow,/path: dist/);assert.match(workflow,/needs: build/);assert.match(workflow,/github\.event_name != 'pull_request'/);assert.match(workflow,/refs\/heads\/main/);assert.ok(!/secrets\.|pull_request_target|path: ['"]?\.\/?['"]?\s*$/m.test(workflow));assert.equal((workflow.match(/if: \$\{\{ false &&/g)||[]).length,2,'Artifact upload and deployment must both be hard-disabled for code-only publication');
console.log(`PASS: ${scenarios} filter combinations, invented medians/counts, mouse/keyboard callback selection, empty/invalid dates, navigation, synthetic schema/formula, relative URLs and four negative artifact safety probes.`);
console.log('NOT TESTED: real-browser layout/mobile/touch and remote Actions/Pages deployment.');
