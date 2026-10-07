window.DW_CFG = {"key": "en", "prefix": "eh_", "langName": "İngilizce", "title": "Günün kelimeleri", "dailyLink": "Günlük brifingin tamamı →", "cats": ["tip", "vet", "haberler", "is", "ielts", "gramer"]};
// ═══════════════════════════════════════════════════════════
// GÜNÜN KELİMELERİ — her gün en az 20 yeni kelime + öğrenme testi
// - Kelimeler seviyeye uygun, daha önce gösterilmemiş ve bankada olmayanlardan seçilir;
//   o günün listesi saklanır (gün içinde değişmez).
// - Test: her kelime bir kez sorulur (yarısı hedef dil → Türkçe, yarısı Türkçe → hedef dil);
//   yanlış bilinen kelime sona eklenip tekrar sorulur. Bitince kelimeler aralıklı tekrar bankasına girer.
// Yapılandırma: window.DW_CFG (kurulum betiği dosyanın başına yazar)
// ═══════════════════════════════════════════════════════════
(function () {
  const C = window.DW_CFG;
  if (!C) return;
  const K = C.key;                         // 'sv' | 'en'
  const LV = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2'];
  const MIN = 20;
  const Q = { run: null };

  const N = () => Math.max(MIN, +S.cfg.dailyGoal || MIN);
  const seenKey = C.prefix + 'dw_seen';
  const dayKey = d => C.prefix + 'dw_' + d;
  const doneKey = d => C.prefix + 'dwdone_' + d;
  // Öğrenilecek "kelime" olsun: hata kalıpları (✗/✓/→), ön/son ekler ve 4+ kelimelik cümleler hariç
  function isWord(w) { const s = String(w[K] || '').trim(); return s && w.tr && !/[✗✓→]/.test(s) && !/^-|-$/.test(s) && s.split(/\s+/).length <= 4 && !/[?!]$/.test(s); }
  function pool() { return allVocab(C.cats).filter(isWord); }
  function levelOK() {
    const i = LV.indexOf(String(S.cfg.level || 'B1').slice(0, 2).toUpperCase());
    const lo = (i < 0 ? 2 : i), hi = Math.min(LV.length - 1, (i < 0 ? 2 : i) + 1);   // kendi seviyen + bir üstü; bitince diğer seviyeler
    return w => !w.lvl || (LV.indexOf(w.lvl) >= lo && LV.indexOf(w.lvl) <= hi);
  }
  function mixByCat(list) {             // kategorileri sırayla karıştır (hep aynı konudan gelmesin)
    const by = new Map(); list.forEach(w => { const c = w.cat || '_'; if (!by.has(c)) by.set(c, []); by.get(c).push(w); });
    const qs = [...by.values()], out = [];
    while (qs.some(q => q.length)) qs.forEach(q => { if (q.length) out.push(q.shift()); });
    return out;
  }
  function pick(src, n, seed, exclude) {
    const ex = new Set(exclude);
    return mixByCat(seededShuffle(src.filter(w => !ex.has(w[K])), seed)).slice(0, n);
  }

  /** O günün kelimeleri — bugün için ilk çağrıda seçilir ve saklanır */
  function words(dateKey) {
    const P = pool(), by = new Map(P.map(w => [w[K], w]));
    let ids = LS.get(dayKey(dateKey), null);
    const stored = Array.isArray(ids) ? ids.filter(id => by.has(id)) : [];
    const isToday = dateKey === todayKey();
    if (!isToday) return stored.length ? stored.map(id => by.get(id)) : rotate(P, dayIndex(dateKey), N(), 0xC0FFEE);
    if (stored.length >= N()) return stored.slice(0, Math.max(N(), stored.length)).map(id => by.get(id));
    const seen = new Set(LS.get(seenKey, [])), ok = levelOK(), need = N() - stored.length;
    const fresh = w => !seen.has(w[K]) && !isSaved(w[K]);
    const tiers = [P.filter(w => fresh(w) && ok(w)), P.filter(fresh), P.filter(w => !isSaved(w[K])), P];
    const src = tiers.find(t => t.filter(w => !stored.includes(w[K])).length >= need) || P;
    const add = pick(src, need, hashStr(C.prefix + dateKey + ':' + stored.length), stored).map(w => w[K]);
    ids = stored.concat(add);
    LS.set(dayKey(dateKey), ids);
    LS.set(seenKey, [...seen, ...add].slice(-8000));
    const cutoff = todayKey(new Date(Date.now() - 40 * 86400000));
    LS.keys().filter(k => (k.startsWith(C.prefix + 'dw_2') || k.startsWith(C.prefix + 'dwdone_2')) && k.slice(-10) < cutoff).forEach(LS.del);
    return ids.map(id => by.get(id));
  }

  function savedCount(ws) { return ws.filter(w => isSaved(w[K])).length; }
  function addAllToBank(ws, silent) {
    let n = 0;
    ws.forEach(w => { if (!isSaved(w[K])) { S.bank.push({ ...w, cat: w.cat, savedAt: Date.now(), srInterval: 1, srDue: Date.now(), srEase: 2.5, srReps: 0 }); n++; } });
    if (n) { saveBank(); S.rQueue = null; }
    if (!silent) showToast(n ? `★ ${n} kelime bankana eklendi — Tekrar sekmesinde aralıklı olarak sorulacak` : 'Bugünün kelimelerinin hepsi zaten bankanda', n ? 'success' : 'info');
    updateHeader();
    return n;
  }

  // ── ana sayfa şeridi ──────────────────────────────────────
  function card(w, i) {
    const saved = isSaved(w[K]);
    const sub = C.key === 'en' ? (w.pron ? `/${w.pron}/` : '') : (w.form || '');
    return `<div class="hd-card" style="border-left:3px solid ${getColor(w.cat)}">
      <div class="hd-sv">${esc(w[K])}</div>
      <div class="hd-tr">${esc(w.tr)}</div>
      ${sub ? `<div class="hd-form">${esc(sub)}</div>` : ''}
      <div class="hd-acts">
        <button class="bt" data-act="speak" data-text="${attr(w[K])}">🔊</button>
        <button class="bt ${saved ? 'saved' : ''}" data-act="saveWord" data-src="home" data-i="${i}" data-cat="${attr(w.cat)}">${saved ? '★' : '☆'}</button>
        ${window.SAX ? SAX.soBtn(w[K]) : ''}
      </div></div>`;
  }
  function homeStrip() {
    const t = todayKey(), ws = words(t), n = ws.length, sv = savedCount(ws), done = LS.get(doneKey(t), null);
    REG.home = ws;
    const show = S.dwAll ? ws : ws.slice(0, 8);
    const pct = Math.round((sv / n) * 100);
    return `<div class="home-daily dw-strip">
      <div class="hd-head"><span class="hd-title">🔤 ${esc(C.title)}</span>
        <span class="hd-sub">${esc(new Date().toLocaleDateString('tr-TR', { weekday: 'long', day: 'numeric', month: 'long' }))} — her gün ${n} yeni kelime</span>
        <button class="btn-ghost btn-xs" data-act="switchTab" data-tab="daily">${esc(C.dailyLink)}</button></div>
      <div class="dw-progress"><div class="dw-bar"><div style="width:${pct}%"></div></div>
        <span>${sv}/${n} bankada${done ? ` · test: ${done.score}/${done.n} ✓` : ''}</span></div>
      <div class="dw-actions">
        <button class="btn-primary dw-go" data-act="dwStart">${done ? `🔄 ${n} kelimelik testi tekrar çöz` : `📝 ${n} kelimeyi öğren: teste başla`}</button>
        ${sv < n ? `<button class="btn-ghost" data-act="dwSaveAll">★ Hepsini bankama ekle</button>` : '<span class="dw-allin">✓ Hepsi bankanda</span>'}
      </div>
      <div class="hd-row">${show.map((w, i) => card(w, i)).join('')}</div>
      ${n > 8 ? `<button class="dw-more" data-act="dwToggle">${S.dwAll ? 'Daha az göster ▴' : `Tüm ${n} kelimeyi göster ▾`}</button>` : ''}
    </div>`;
  }

  // ── öğrenme testi ─────────────────────────────────────────
  function shuffle(a) { a = a.slice(); for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; }
  function makeQ(w, dir, P) {
    const ans = dir === 'f' ? w.tr : w[K];
    const field = dir === 'f' ? 'tr' : K;
    const same = shuffle(P.filter(x => x.cat === w.cat && x[field] !== ans && x[K] !== w[K]));
    const any = shuffle(P.filter(x => x[field] !== ans && x[K] !== w[K]));
    const opts = [];
    for (const x of same.concat(any)) { if (!opts.includes(x[field])) opts.push(x[field]); if (opts.length === 3) break; }
    return { w, dir, a: ans, o: shuffle([ans, ...opts]) };
  }
  function start(list) {
    const P = pool();
    const qs = shuffle(list).map((w, i) => makeQ(w, i % 2 ? 'b' : 'f', P));
    Q.run = { qs, i: 0, sel: null, first: new Map(), requeued: new Set(), total: list.length, list };
    S.dwOpen = true;
  }
  function viewRun() {
    const r = Q.run, q = r.qs[r.i], w = q.w;
    const firstOk = [...r.first.values()].filter(Boolean).length;
    const prompt = q.dir === 'f'
      ? `<div class="dw-prompt"><span class="dw-word">${esc(w[K])}</span><button class="g-spk" data-act="speak" data-text="${attr(w[K])}">🔊</button></div><div class="dw-ask">Türkçesi ne?</div>`
      : `<div class="dw-prompt"><span class="dw-word dw-tr">${esc(w.tr)}</span></div><div class="dw-ask">${esc(C.langName)} karşılığı hangisi?</div>`;
    const opts = q.o.map((o, k) => {
      let cls = 'quiz-opt';
      if (r.sel !== null) { if (o === q.a) cls += ' correct'; else if (k === r.sel) cls += ' wrong'; }
      return `<button class="${cls}" data-act="dwAns" data-k="${k}" ${r.sel !== null ? 'disabled' : ''}>${r.sel !== null ? (o === q.a ? '✓ ' : k === r.sel ? '✗ ' : '') : ''}${esc(o)}</button>`;
    }).join('');
    const ok = r.sel !== null && q.o[r.sel] === q.a;
    const sub = C.key === 'en' ? (w.pron ? `/${w.pron}/` : '') : (w.form || w.uttal || '');
    const fb = r.sel === null ? '' : `<div class="g-fb ${ok ? 'ok' : 'bad'}">
      <div class="g-fb-h">${ok ? '✓ Doğru!' : '✗ Yanlış — bu kelime sonda tekrar sorulacak'}</div>
      <div class="dw-pair"><b>${esc(w[K])}</b> = ${esc(w.tr)}${sub ? ` <span class="dw-sub">${esc(sub)}</span>` : ''}</div>
      ${w.ex ? `<div class="dw-ex">"${esc(w.ex)}" <button class="g-spk" data-act="speak" data-text="${attr(w.ex)}">🔊</button></div>` : ''}
      ${w.tip ? `<div class="dw-tip">💡 ${esc(w.tip)}</div>` : ''}
      ${window.SAX ? SAX.block(w[K]) : ''}
    </div>`;
    return `<div class="g-wrap"><div class="g-head"><button class="btn-ghost btn-xs" data-act="dwQuit">← Derslere dön</button></div>
      <div class="g-run dw-run">
        <div class="g-run-top"><span>📝 ${esc(C.title)} · ${r.total} kelime</span><span>Soru ${r.i + 1}/${r.qs.length} · ilk denemede ✓ ${firstOk}</span></div>
        <div class="quiz-progress-bar"><div class="quiz-progress-fill" style="width:${(r.i / r.qs.length) * 100}%;background:var(--teal)"></div></div>
        ${prompt}
        <div class="quiz-options">${opts}</div>
        ${fb}
        ${r.sel !== null ? `<div class="g-run-btns"><button class="btn-primary" data-act="dwNext">${r.i + 1 < r.qs.length ? 'Sonraki →' : 'Sonucu gör →'}</button></div>` : ''}
      </div></div>`;
  }
  function viewResult() {
    const r = Q.run, s = r.summary;
    const missed = r.list.filter(w => r.first.get(w[K]) === false);
    return `<div class="g-wrap"><div class="g-head"><button class="btn-ghost btn-xs" data-act="dwQuit">← Derslere dön</button></div>
      <div class="quiz-done" style="border-color:var(--teal)">
        <div class="quiz-done-emoji">${s.score === s.n ? '🏆' : s.score >= s.n * 0.7 ? '👍' : '📚'}</div>
        <div class="quiz-done-score">İlk denemede ${s.score}/${s.n} doğru</div>
        <div class="quiz-done-msg">Bütün kelimeleri en sonunda doğru bildin.${s.added ? `<br>${s.added} kelime <b>kelime bankana</b> eklendi; Tekrar sekmesinde aralıklı olarak (1, 3, 7… gün sonra) sorulacak.` : ''}${s.xp ? `<br><b>+${s.xp} XP</b>` : ''}</div>
        ${missed.length ? `<div class="quiz-wrong-box"><div class="qwb-title">Zorlandığın kelimeler:</div>${missed.map(w => `<div class="qwb-row"><span>${esc(w[K])}</span><b style="color:var(--green)">${esc(w.tr)}</b></div>`).join('')}</div>` : ''}
        <div class="quiz-done-btns g-btns">
          ${missed.length ? `<button class="btn-primary" data-act="dwRetryMissed">🔁 Zorlandıklarımı tekrar çalış (${missed.length})</button>` : ''}
          <button class="btn-ghost" data-act="dwStart">🔄 Testi baştan çöz</button>
          <button class="btn-ghost" data-act="switchTab" data-tab="review">🔁 Tekrar sekmesi</button>
          <button class="btn-ghost" data-act="dwQuit">← Derslere dön</button>
        </div>
      </div></div>`;
  }
  function finish() {
    const r = Q.run, t = todayKey();
    const score = [...r.first.values()].filter(Boolean).length, n = r.total;
    let added = 0, xp = 0;
    if (r.full) {
      added = addAllToBank(r.list, true);
      const prev = LS.get(doneKey(t), null);
      LS.set(doneKey(t), { score: Math.max(score, prev?.score || 0), n });
      xp = (prev ? 0 : 10) + score;
    } else xp = score;
    if (xp) addXP(xp);
    r.summary = { score, n, added, xp };
  }

  Object.assign(ACTIONS, {
    dwToggle: () => { S.dwAll = !S.dwAll; renderTab('lessons'); },
    dwSaveAll: () => { addAllToBank(words(todayKey())); renderTab(S.tab); },
    dwStart: () => { start(words(todayKey())); Q.run.full = true; renderTab('lessons'); window.scrollTo({ top: 0, behavior: 'smooth' }); },
    dwRetryMissed: () => {
      const r = Q.run; const missed = r.list.filter(w => r.first.get(w[K]) === false);
      start(missed); Q.run.full = false; renderTab('lessons'); window.scrollTo({ top: 0, behavior: 'smooth' });
    },
    dwAns: (d) => {
      const r = Q.run; if (!r || r.sel !== null) return;
      r.sel = +d.k; const q = r.qs[r.i], ok = q.o[r.sel] === q.a;
      if (!r.first.has(q.w[K])) r.first.set(q.w[K], ok);
      if (!ok && !r.requeued.has(q.w[K] + q.dir)) { r.requeued.add(q.w[K] + q.dir); r.qs.push(makeQ(q.w, q.dir, pool())); }
      if (ok && q.dir === 'f' && S.cfg.autoSpeak) speak(q.w[K]);
      renderTab('lessons');
    },
    dwNext: () => {
      const r = Q.run; if (!r) return;
      if (r.i + 1 >= r.qs.length) { finish(); r.done = true; }
      else { r.i++; r.sel = null; }
      renderTab('lessons'); window.scrollTo({ top: 0, behavior: 'smooth' });
    },
    dwQuit: () => { S.dwOpen = false; Q.run = null; renderTab('lessons'); window.scrollTo({ top: 0, behavior: 'smooth' }); },
  });

  document.addEventListener('keydown', (e) => {
    if (!S.dwOpen || S.tab !== 'lessons' || !Q.run || Q.run.done) return;
    if (/INPUT|TEXTAREA|SELECT/.test(e.target.tagName)) return;
    const r = Q.run;
    if (r.sel === null && e.key >= '1' && e.key <= '4') { e.preventDefault(); e.stopImmediatePropagation(); ACTIONS.dwAns({ k: String(+e.key - 1) }); }
    else if (r.sel !== null && e.key === 'Enter') { e.preventDefault(); ACTIONS.dwNext(); }
  }, true);

  window.DailyWords = {
    words, homeStrip,
    render() { return Q.run?.done ? viewResult() : (Q.run ? viewRun() : (S.dwOpen = false, '')); },
  };
})();
