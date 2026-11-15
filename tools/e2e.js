// 使い方: node tools/e2e.js [サイトのディレクトリ]   全日表示＋全セット答え合わせ（iPad横・縦・スマホ）
const {chromium}=require('playwright'); const path=require('path');
const root=path.resolve(process.argv[2]||'.');
(async()=>{const b=await chromium.launch();
 global.window={}; require(path.join(root,'data/config.js')); const C=window.DRILL_CONFIG; const days=[];
 for(let d=new Date(C.start+'T00:00:00');d<=new Date(C.end+'T00:00:00');d.setDate(d.getDate()+1)) days.push(String(d.getFullYear())+String(d.getMonth()+1).padStart(2,'0')+String(d.getDate()).padStart(2,'0'));
 for(const [w,h] of [[1180,820],[820,1180],[390,844]]){const p=await b.newPage({viewport:{width:w,height:h}});const errs=[];p.on('pageerror',e=>errs.push(e.message));
  let wide=[],sets=0,exs=0,ja=0,pend=[];
  for(const d of days){await p.goto('file://'+root+'/index.html#d'+d);await p.waitForSelector('.dayhead',{timeout:5000});
   if(await p.$('.pending'))pend.push(d);
   const n=await p.$$eval('details.set',x=>x.length);
   for(let i=0;i<n;i++){await p.evaluate(i=>{const s=document.querySelectorAll('details.set')[i];s.open=true;s.querySelectorAll('.choices').forEach(c=>c.querySelector('.ch').click());const g=s.querySelector('.btn.primary');g.click();},i);sets++;}
   await p.evaluate(()=>document.querySelectorAll('details').forEach(d=>d.open=true));
   exs+=await p.$$eval('.ex',x=>x.length); ja+=await p.$$eval('.passage-ja, .script .ja',x=>x.length);
   const sw=await p.evaluate(()=>document.documentElement.scrollWidth); if(sw>w)wide.push(d);
  }
  console.log(w+'x'+h,'days',days.length,'pending',pend.length,'sets',sets,'graded ex',exs,'ja blocks',ja,'overflow',wide,'errors',errs.slice(0,3));await p.close();}
 await b.close();})();
