// 使い方: node tools/check.js data/days/*.js   （データの構文と形式を検査）
global.window = global; const fs = require('fs'), vm = require('vm');
const VOCAB = +(process.env.VOCAB || 15), VOCAB2 = +(process.env.VOCAB2 || 3), SWITCH = process.env.VSWITCH || '2026-12-14'; // SWITCH 以降の日は新出語 VOCAB2 語（残りは画面側で自動復習）
let errs = [], dist = [0, 0, 0, 0];
for (const f of process.argv.slice(2)) {
  try { vm.runInThisContext(fs.readFileSync(f, 'utf8'), { filename: f }); } catch (e) { errs.push(f + ' SYNTAX ' + e.message); }
}
const D = (window.DRILL || window.TEAP || { days: {} }).days;
for (const k of Object.keys(D).sort()) {
  const d = D[k]; let n = 0; const fd = [0, 0, 0, 0];
  const sum = (d.tasks || []).reduce((a, t) => a + (t.min || 0), 0);
  if (sum !== d.minutes) errs.push(k + ' tasks ' + sum + '≠' + d.minutes);
  const vw = k >= SWITCH ? VOCAB2 : VOCAB; if ((d.vocab || []).length !== vw) errs.push(k + ' vocab ' + (d.vocab || []).length + '≠' + vw);
  const ids = new Set();
  for (const s of d.sets || []) {
    if (ids.has(s.id)) errs.push(k + ' dup set id ' + s.id); ids.add(s.id);
    if (s.passage && !s.passageJa) errs.push(k + ' ' + s.id + ' no passageJa');
    s.items.forEach((it, i) => {
      n++;
      const tag = k + ' ' + s.id + '#' + (i + 1);
      if (it.type === 'write') { if (!it.ans) errs.push(tag + ' write: no ans'); if (!(it.ex || '').includes('【ポイント】')) errs.push(tag + ' ex 【ポイント】'); return; }
      const nc = (it.choices || []).length, want = s.nChoices || 0;
      if (!Array.isArray(it.choices) || nc < 2 || nc > 8 || (want && nc !== want && nc !== 2)) errs.push(tag + ' choices ' + nc);
      if (!(it.a >= 0 && it.a < nc)) errs.push(tag + ' a'); else if (nc >= 4) { const p = Math.min(it.a, 3); if (nc === 4) { dist[it.a]++; fd[it.a]++; } }
      if (new Set(it.choices).size !== nc) errs.push(tag + ' same choices');
      for (const h of ['【正解】', '【他の選択肢】', '【ポイント】']) if (!(it.ex || '').includes(h)) errs.push(tag + ' ex ' + h);
      const L = s.labels === 'iroha' ? 'イロハニホヘトチ' : s.labels === 'abc' ? 'ABCDEFGH' : s.labels === 'aiu' ? 'アイウエオカキク' : '12345678';
      const m = (it.ex || '').match(/【正解】\s*(\S)/); if (m && L.includes(m[1]) && m[1] !== L[it.a]) errs.push(tag + ' ex正解' + m[1] + '≠' + L[it.a]);
      if (nc >= 5) { s._d = s._d || []; s._d[it.a] = (s._d[it.a] || 0) + 1; }
    });
  }
  if (n >= 8 && Math.max(...fd) > Math.ceil(n * 0.45)) errs.push(k + ' answer skew ' + fd.join(','));
  for (const s of d.sets || []) if (s._d) { const v = [0,1,2,3,4].map(j => s._d[j] || 0), t = v.reduce((a, b) => a + b, 0); if (t >= 6 && Math.max(...v) > Math.ceil(t * 0.5)) errs.push(k + ' ' + s.id + ' 5択の正解偏り ' + v.join(',')); delete s._d; }
  console.log(k, d.theme, n + '問', 'tasks' + sum + '/' + d.minutes, 'vocab' + (d.vocab || []).length, 'dist' + fd.join(','));
}
console.log('answer dist', dist.join(','));
console.log(errs.length ? 'NG\n' + errs.join('\n') : 'OK');
process.exitCode = errs.length ? 1 : 0;
