'use strict';
const fs=require('node:fs'),path=require('node:path');
const {audit,FILES}=require('./audit.cjs');
const root=path.resolve(__dirname,'..'),source=path.join(root,'site'),target=path.join(root,'dist');
audit(source);
if(fs.existsSync(target))audit(target);else fs.mkdirSync(target);
for(const name of FILES)fs.copyFileSync(path.join(source,name),path.join(target,name));
for(const item of audit(target))console.log('BUILD',item.file,item.bytes,'bytes',item.sha256);
console.log('PASS: dist contains only four audited synthetic files.');
