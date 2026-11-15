# 日ごとの問題ドリル（汎用エンジン）— MARCH古文 28日ドリル

試験日までの日別ドリル（やること・単語・予想問題・解説・現代語訳）を静的サイトで出すエンジンと、そのデータ一式。
現在のデータ：MARCH一般入試の古文、2026/11/16〜12/13 の28日（平日30分・土日60分）。

```
index.html          エンジン（画面とロジック。試験固有の内容は持たない）
data/config.js      試験ごとの設定（名前・期間・本番日・色・スキル種別・日ごとのラベルと応援文・攻略メモ）
data/days/*.js      日別データ window.DRILL.days["YYYY-MM-DD"]（形式は docs/SPEC.md）
data/must.js        ★落とせない問題 window.DRILL_MUST["日付|セット|番号"] = "理由"
data/audio.js       （任意）音声 window.DRILL_AUDIO["日付|セット[|番号]"] = "audio/xxx.mp3"
tools/check.js      形式検査（4択・正解位置の偏り・tasks合計・語彙数・解説の見出し）
tools/dup.js        語彙の重複
tools/blind.js      ブラインド検証（正解を伏せた問題集の書き出し／照合）
tools/e2e.js        Playwright で全日表示・全セット答え合わせ（iPad横・縦・スマホ）
docs/SPEC.md        データ仕様（問題作成エージェントへの指示書を兼ねる）
docs/HANDOFF.md     TEAP版からの引き継ぎメモ
```

## 新しい試験を作る手順

1. `data/config.js` を書き換える：`id`（記録の保存キー）、`title`・`heading`・`eyebrow`、`start`・`end`・`examDate`、`lang`（日本語本文なら `"ja"`）、`skills`（セットの種別とラベル・色）、`days`（日ごとの `label`・`plan`・`cheer`）、`guideHTML`、`examDayList`。データファイルが日別でなければ `dataFiles` に直接並べる。
2. `docs/SPEC.md` を新しい試験向けに書き直す（形式・難易度・1日の型・語彙数）。語彙数が15でなければ検査時に `VOCAB=25` のように指定。
3. 1エージェント＝担当日付のファイルだけ、で並列生成。各自 `node tools/check.js` が OK になるまで直す。
4. `node tools/dup.js data/days/*.js` で語彙の重複を解消。
5. ブラインド検証：`node tools/blind.js export blind.txt data/days/*.js` → 別エージェントに解かせて `answers.json` を作り → `node tools/blind.js grade answers.json data/days/*.js`。不一致を人が確認して直す。
6. ★判定：別エージェントが全問を読み `data/must.js` を書く（全体の約6割）。
7. `node tools/e2e.js .`（JSエラー・横スクロールなし・全セット採点）→ GitHub Pages に公開。

旧TEAP形式（`window.TEAP`・`TEAP_AUDIO`・`TEAP_MUST`、skill `R`/`L`）もそのまま読める。

## 本文の書き方（古文）
- 傍線：`[[1|傍線部]]`（番号付き）／`__傍線部__`（番号なし）
- 段落は空行。最後の段落 `（出典：…）` は右寄せの小さな文字で表示
