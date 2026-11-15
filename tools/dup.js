// 使い方: node tools/dup.js data/days/*.js   語彙の重複チェック
global.window=global;const fs=require('fs'),vm=require('vm');
for(const f of process.argv.slice(2)) vm.runInThisContext(fs.readFileSync(f,'utf8'));
const D=(window.DRILL||window.TEAP).days,seen={};let tot=0;
for(const k of Object.keys(D).sort()){for(const [w] of D[k].vocab){(seen[w]=seen[w]||[]).push(k.slice(5));} for(const s of D[k].sets) tot+=s.items.length;}
const dup=Object.entries(seen).filter(([w,a])=>a.length>1);
console.log('items',tot,'vocab',Object.keys(seen).length,'dup',dup.length?dup.map(([w,a])=>w+':'+a.join(',')).join(' | '):'none');
