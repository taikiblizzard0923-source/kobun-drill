// ブラインド検証用。
//   node tools/blind.js export out.txt data/days/*.js   正解・解説・現代語訳を伏せた問題集を書き出す
//   node tools/blind.js grade answers.json data/days/*.js   {"日付|セット|番号": 1〜4} を正解キーと照合
global.window=global;const fs=require('fs'),vm=require('vm');
const [mode,io,...files]=process.argv.slice(2);
for(const f of files) vm.runInThisContext(fs.readFileSync(f,'utf8'));
const D=window.DRILL.days;
if(mode==='export'){let o='';
 for(const k of Object.keys(D).sort()) for(const s of D[k].sets){
  o+='\n==== '+k+'|'+s.id+' '+s.title+'\n'+(s.directions||'')+'\n'+(s.passage?'---本文---\n'+s.passage+'\n---\n':'');
  s.items.forEach((it,i)=>{ if(it.type==='write'){ o+='[記述・回答不要] '+it.q+'\n'; return; } o+='['+k+'|'+s.id+'|'+i+'] '+it.q+'\n'+it.choices.map((c,j)=>'  '+(j+1)+'. '+c).join('\n')+'\n';});}
 fs.writeFileSync(io,o);console.log('wrote',io);}
else{const A=JSON.parse(fs.readFileSync(io,'utf8'));let n=0,ok=0;const bad=[];
 for(const k of Object.keys(D).sort()) for(const s of D[k].sets) s.items.forEach((it,i)=>{ if(it.type==='write') return; const key=k+'|'+s.id+'|'+i;n++;
  if(A[key]===it.a+1) ok++; else bad.push(key+' key='+(it.a+1)+' blind='+A[key]);});
 console.log('match',ok+'/'+n);console.log(bad.join('\n'));}
