// 使い方: node tools/check.js data/days/*.js   （データの構文と形式を検査）
global.window = global; const fs = require('fs'), vm = require('vm');
const VOCAB = +(process.env.VOCAB || 15);
let errs = [], dist = [0, 0, 0, 0];
for (const f of process.argv.slice(2)) {
  try { vm.runInThisContext(fs.readFileSync(f, 'utf8'), { filename: f }); } catch (e) { errs.push(f + ' SYNTAX ' + e.message); }
}
const D = (window.DRILL || window.TEAP || { days: {} }).days;
for (const k of Object.keys(D).sort()) {
  const d = D[k]; let n = 0; const fd = [0, 0, 0, 0];
  const sum = (d.tasks || []).reduce((a, t) => a + (t.min || 0), 0);
  if (sum !== d.minutes) errs.push(k + ' tasks ' + sum + '≠' + d.minutes);
  if ((d.vocab || []).length !== VOCAB) errs.push(k + ' vocab ' + (d.vocab || []).length);
  const ids = new Set();
  for (const s of d.sets || []) {
    if (ids.has(s.id)) errs.push(k + ' dup set id ' + s.id); ids.add(s.id);
    if (s.passage && !s.passageJa) errs.push(k + ' ' + s.id + ' no passageJa');
    s.items.forEach((it, i) => {
      n++;
      if (!Array.isArray(it.choices) || it.choices.length !== 4) errs.push(k + ' ' + s.id + '#' + (i + 1) + ' choices');
      if (!(it.a >= 0 && it.a < 4)) errs.push(k + ' ' + s.id + '#' + (i + 1) + ' a'); else { dist[it.a]++; fd[it.a]++; }
      if (new Set(it.choices).size !== it.choices.length) errs.push(k + ' ' + s.id + '#' + (i + 1) + ' same choices');
      for (const h of ['【正解】', '【他の選択肢】', '【ポイント】']) if (!(it.ex || '').includes(h)) errs.push(k + ' ' + s.id + '#' + (i + 1) + ' ex ' + h);
      const m = (it.ex || '').match(/【正解】\s*(\d)/); if (m && +m[1] !== it.a + 1) errs.push(k + ' ' + s.id + '#' + (i + 1) + ' ex正解番号' + m[1] + '≠' + (it.a + 1));
    });
  }
  if (n >= 8 && Math.max(...fd) > Math.ceil(n * 0.45)) errs.push(k + ' answer skew ' + fd.join(','));
  console.log(k, d.theme, n + '問', 'tasks' + sum + '/' + d.minutes, 'vocab' + (d.vocab || []).length, 'dist' + fd.join(','));
}
console.log('answer dist', dist.join(','));
console.log(errs.length ? 'NG\n' + errs.join('\n') : 'OK');
process.exitCode = errs.length ? 1 : 0;
