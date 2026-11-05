// Serve only the audited artifact on a temporary loopback port, including a Pages-style prefix.
'use strict';
const http=require('node:http'),fs=require('node:fs'),assert=require('node:assert/strict');
const {audit,FILES}=require('../scripts/audit.cjs');
audit('dist');
const prefix='/ra-level-a-static-demo/',mime={'.html':'text/html','.css':'text/css','.js':'text/javascript'};
const server=http.createServer((request,response)=>{const pathname=new URL(request.url,'http://localhost').pathname;const name=pathname===prefix?'index.html':pathname.startsWith(prefix)?pathname.slice(prefix.length):'';if(!FILES.includes(name)){response.writeHead(404);response.end('Not found');return;}const body=fs.readFileSync('dist/'+name);response.writeHead(200,{'Content-Type':mime[name.slice(name.lastIndexOf('.'))],'Content-Length':body.length});response.end(body);});
server.listen(0,'127.0.0.1',async()=>{
 try{
  const origin=`http://127.0.0.1:${server.address().port}`,base=origin+prefix;
  const page=await fetch(base);assert.equal(page.status,200);const html=await page.text();assert.match(html,/Synthetic demonstration — no real housing-sale data/);
  for(const relative of [...html.matchAll(/(?:src|href)="([^"]+)"/g)].map(m=>m[1])){const url=new URL(relative,base);assert.ok(url.href.startsWith(base));const response=await fetch(url);assert.equal(response.status,200);const name=relative==='./'?'index.html':relative.slice(2);assert.equal(await response.text(),fs.readFileSync('dist/'+name,'utf8'));}
  for(const route of ['data/private.csv','.env','tests/test.cjs','api/summary','../private.csv'])assert.equal((await fetch(new URL(route,base))).status,404);
  console.log('PASS: built artifact serves all relative assets under a Pages project prefix; no private/source/API paths served.');
 }catch(error){console.error(error);process.exitCode=1;}finally{server.closeAllConnections();server.close();}
});
