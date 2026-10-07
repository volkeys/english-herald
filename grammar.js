// ═══════════════════════════════════════════════════════════
// GRAMER MODÜLÜ — ayrıntılı gramer dersleri, günün dersi,
// otomatik puanlanan alıştırmalar ve aralıklı tekrar (Leitner)
// Veri: grammar-data.js → window.GRAMMAR_META, window.GRAMMAR_LESSONS
// ═══════════════════════════════════════════════════════════
(function () {
  const M = window.GRAMMAR_META;
  const LESSONS = window.GRAMMAR_LESSONS || [];
  if (!M || !LESSONS.length) return;

  const KEY = M.prefix + 'gram';
  const LEVELS = ['A1', 'A2', 'B1', 'B2', 'C1'];
  const INTERVALS = [1, 2, 4, 8, 16, 32, 60];          // kutu → gün
  const PASS = 70;                                       // konu "tamamlandı" eşiği (%)
  const BYID = Object.fromEntries(LESSONS.map(l => [l.id, l]));
  const ORDER = LESSONS.map(l => l.id);
  const TYPE_LABEL = { mc: 'Çoktan seçmeli', gap: 'Boşluk doldur', order: 'Kelimeleri sırala', fix: 'Hatayı düzelt' };

  let G = Object.assign({ start: null, lessons: {}, items: {}, days: {} }, LS.get(KEY, {}));
  const V = { view: 'today', id: null, run: null, focus: false };
  function save() { LS.set(KEY, G); }

  // ── yardımcılar ───────────────────────────────────────────
  function addDays(key, n) { const d = new Date(key + 'T12:00:00'); d.setDate(d.getDate() + n); return todayKey(d); }
  function inl(s) {
    return esc(s).replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>').replace(/(^|[\s(])\*([^*\n]+)\*/g, '$1<em>$2</em>')
      .replace(/`([^`\n]+)`/g, '<code class="md-code">$1</code>');
  }
  function gNorm(s) {
    return String(s ?? '').normalize('NFC').replace(/[’‘`´]/g, "'").replace(/[“”„]/g, '"')
      .replace(/\s+/g, ' ').trim().replace(/\s*[.!?…]+$/, '').trim().toLowerCase();
  }
  function noComma(s) { return s.replace(/\s*,\s*/g, ' ').replace(/\s+/g, ' ').trim(); }
  function answersOf(ex) { return ex.type === 'order' ? [ex.a, ...(ex.alts || [])] : (Array.isArray(ex.a) ? ex.a : [ex.a]); }
  function correctText(ex) { return ex.type === 'mc' ? ex.o[ex.a] : answersOf(ex)[0]; }
  function isCorrect(ex, user) {
    if (ex.type === 'mc') return +user === ex.a;
    const u = gNorm(user);
    if (!u) return false;
    const ans = answersOf(ex);
    if (ans.some(a => { const n = gNorm(a); return n ? n === u : String(a).trim() === String(user).trim(); })) return true;
    if (ex.type === 'fix' || ex.type === 'gap') {   // virgül toleransı — virgül hatanın konusu değilse
      const commaIsPoint = ex.type === 'fix' && ans.some(a => noComma(gNorm(a)) === noComma(gNorm(ex.q)));
      if (!commaIsPoint && ans.some(a => noComma(gNorm(a)) === noComma(u))) return true;
    }
    return false;
  }
  function shuffle(a) { a = a.slice(); for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; }
  function lvlPill(l) { const c = { A1: 'var(--green)', A2: 'var(--teal)', B1: 'var(--blue)', B2: 'var(--purple)', C1: 'var(--red)' }[l] || 'var(--muted)'; return `<span class="g-lvl" style="background:${c}">${l}</span>`; }
  function best(id) { return G.lessons[id]?.best ?? null; }
  function isDone(id) { return (best(id) || 0) >= PASS; }
  function hasKey() { return !!(S.cfg && S.cfg.apiKey); }

  function startLevel() {
    if (G.start && LEVELS.includes(G.start)) return G.start;
    const i = LEVELS.indexOf(String(S.cfg?.level || 'B1').slice(0, 2).toUpperCase());
    return LEVELS[Math.max(0, (i < 0 ? 2 : i) - 1)];   // kullanıcının seviyesinin bir altından başla
  }

  // ── günün dersi ───────────────────────────────────────────
  function todayId() {
    const t = todayKey();
    if (G.days[t]?.id && BYID[G.days[t].id]) return G.days[t].id;
    const sr = LEVELS.indexOf(startLevel());
    let id = ORDER.find(i => LEVELS.indexOf(BYID[i].level) >= sr && !isDone(i)) || ORDER.find(i => !isDone(i));
    if (!id) id = ORDER.slice().sort((a, b) => (best(a) - best(b)) || String(G.lessons[a]?.last || '').localeCompare(String(G.lessons[b]?.last || '')))[0];
    G.days[t] = { id, done: false };
    const keys = Object.keys(G.days).sort(); while (keys.length > 120) delete G.days[keys.shift()];
    save();
    return id;
  }
  function dueKeys(excludeId, max = 10) {
    const t = todayKey();
    return Object.entries(G.items)
      .filter(([k, v]) => { const [id, i] = k.split('#'); return v.due <= t && id !== excludeId && BYID[id]?.exercises[+i]; })
      .sort((a, b) => a[1].due.localeCompare(b[1].due) || a[1].box - b[1].box)
      .slice(0, max).map(([k]) => k);
  }
  function streak() {
    let n = 0, d = todayKey();
    if (!G.days[d]?.done) d = addDays(d, -1);
    while (G.days[d]?.done) { n++; d = addDays(d, -1); }
    return n;
  }
  function schedule(key, ok) {
    const it = G.items[key] || { box: 0 };
    it.box = ok ? Math.min((it.box || 0) + 1, INTERVALS.length - 1) : 0;
    it.due = addDays(todayKey(), ok ? INTERVALS[it.box] : 1);
    G.items[key] = it;
  }

  // ── ana sayfa kartı (Dersler sekmesinin üstü) ─────────────
  function homeCard() {
    const id = todayId(), l = BYID[id], day = G.days[todayKey()];
    const due = dueKeys(id).length, st = streak(), b = best(id);
    const status = day?.done ? `<span class="g-ok">✓ Bugün tamamlandı${b !== null ? ` · en iyi %${b}` : ''}</span>`
      : (G.lessons[id]?.read ? '<span class="g-wip">▶ Okundu — alıştırmalar bekliyor</span>' : '<span class="g-new">● Yeni konu</span>');
    return `<div class="g-home" data-act="gOpenToday">
      <div class="g-home-top"><span class="g-home-kicker">✏️ Günün grameri</span>${lvlPill(l.level)}<span class="g-home-ch">${esc(l.chapter)}</span>
        ${st ? `<span class="g-streak">🔥 ${st} gün</span>` : ''}</div>
      <div class="g-home-title">${esc(l.title)}</div>
      <div class="g-home-tr">${esc(l.titleTr)}</div>
      <div class="g-home-foot">${status}${due ? `<span class="g-due">🔁 ${due} tekrar sorusu</span>` : ''}
        <button class="g-home-btn">${day?.done ? 'Gramere git →' : 'Çalış →'}</button></div>
    </div>`;
  }

  // ── görünümler ────────────────────────────────────────────
  function header(active) {
    const due = dueKeys(todayId()).length;
    const tab = (v, txt) => `<button class="g-tab ${active === v ? 'active' : ''}" data-act="gNav" data-v="${v}">${txt}</button>`;
    return `<div class="g-head">
      <button class="btn-ghost btn-xs" data-act="gClose">← Kelime dersleri</button>
      <div class="g-tabs">${tab('today', '📅 Bugün')}${tab('list', '📚 Tüm konular')}${tab('review', `🔁 Tekrar${due ? ` (${due})` : ''}`)}</div>
    </div>`;
  }

  function viewToday() {
    const id = todayId(), l = BYID[id], day = G.days[todayKey()], due = dueKeys(id).length;
    const doneN = ORDER.filter(isDone).length, st = streak(), sl = startLevel();
    const next = ORDER.filter(i => i !== id && !isDone(i) && LEVELS.indexOf(BYID[i].level) >= LEVELS.indexOf(sl)).slice(0, 3);
    const b = best(id);
    return `${header('today')}
      <div class="panel g-today">
        <div class="g-date">${esc(new Date().toLocaleDateString(M.locale, { weekday: 'long', day: 'numeric', month: 'long' }))}</div>
        <div class="g-meta">${lvlPill(l.level)} <span>${esc(l.chapter)}</span></div>
        <h2 class="g-title">${esc(l.title)}</h2>
        <div class="g-sub">${esc(l.titleTr)}</div>
        <p class="g-summary">${inl(l.summary)}</p>
        <div class="g-steps">
          <div class="g-step ${G.lessons[id]?.read ? 'done' : ''}"><b>1</b> Dersi oku <small>${l.sections.length} bölüm · ${l.pitfalls.length} tipik hata</small></div>
          <div class="g-step ${day?.done ? 'done' : ''}"><b>2</b> Alıştırmalar <small>${l.exercises.length} soru${b !== null ? ` · en iyi %${b}` : ''}</small></div>
          <div class="g-step ${due === 0 ? 'done' : ''}"><b>3</b> Tekrar <small>${due ? `${due} eski soru` : 'bugün tekrar yok'}</small></div>
        </div>
        <div class="g-btns">
          <button class="btn-primary" data-act="gOpen" data-id="${attr(id)}">📖 Dersi oku</button>
          <button class="btn-ghost" data-act="gStart" data-id="${attr(id)}">✍️ Alıştırmalar</button>
          ${due ? `<button class="btn-ghost" data-act="gReview">🔁 Tekrar (${due})</button>` : ''}
        </div>
        ${day?.done && b !== null && b < PASS ? `<div class="g-note-box">Bu konuda en iyi sonucun %${b}. %${PASS}'e ulaşana kadar konu yarın da gelecek.</div>` : ''}
      </div>
      <div class="g-stats">
        <div class="g-stat"><b>${st}</b><span>gün seri 🔥</span></div>
        <div class="g-stat"><b>${doneN}/${ORDER.length}</b><span>konu tamam</span></div>
        <div class="g-stat"><b>${Object.keys(G.items).length}</b><span>soru tekrar havuzunda</span></div>
      </div>
      ${next.length ? `<div class="panel"><div class="panel-title">Sıradaki konular</div>${next.map(i => listRow(i)).join('')}</div>` : ''}
      <div class="panel"><div class="panel-title">Günlük derslerin başlangıç seviyesi</div>
        <div class="g-lvlpick">${LEVELS.map(x => `<button class="g-chip ${x === sl ? 'active' : ''}" data-act="gSetStart" data-l="${x}">${x}</button>`).join('')}</div>
        <div class="panel-hint">Günün dersi bu seviyeden başlayarak tamamlamadığın (%${PASS} altı) ilk konuyu seçer. İstediğin konuyu "Tüm konular"dan da açabilirsin.</div>
      </div>
      <div class="panel-hint g-credit">${esc(M.credit)}</div>`;
  }

  function listRow(id) {
    const l = BYID[id], b = best(id), todays = G.days[todayKey()]?.id === id;
    const icon = isDone(id) ? '<span class="g-ic ok">✓</span>' : (b !== null ? '<span class="g-ic wip">◐</span>' : (G.lessons[id]?.read ? '<span class="g-ic wip">○</span>' : '<span class="g-ic">○</span>'));
    return `<button class="g-row" data-act="gOpen" data-id="${attr(id)}">${icon}
      <span class="g-row-main"><span class="g-row-t">${esc(l.title)}${todays ? ' <span class="g-today-tag">bugün</span>' : ''}</span><span class="g-row-tr">${esc(l.titleTr)}</span></span>
      ${lvlPill(l.level)}${b !== null ? `<span class="g-row-b">%${b}</span>` : ''}</button>`;
  }

  function viewList() {
    const chapters = [];
    ORDER.forEach(id => { const c = BYID[id].chapter; if (!chapters.includes(c)) chapters.push(c); });
    return `${header('list')}
      <div class="g-list-intro panel-hint">${ORDER.length} konu · ${LESSONS.reduce((s, l) => s + l.exercises.length, 0)} alıştırma. Konular seviyeye göre sıralı; istediğini aç.</div>
      ${chapters.map(c => {
        const ids = ORDER.filter(id => BYID[id].chapter === c);
        return `<div class="panel g-chapter"><div class="panel-title">${esc(c)} <span class="g-ch-n">${ids.filter(isDone).length}/${ids.length}</span></div>${ids.map(listRow).join('')}</div>`;
      }).join('')}`;
  }

  function tableHTML(t) {
    return `<div class="g-table-wrap"><table class="g-table"><thead><tr>${t.head.map(h => `<th>${inl(h)}</th>`).join('')}</tr></thead>
      <tbody>${t.rows.map(r => `<tr>${r.map(c => `<td>${inl(c)}</td>`).join('')}</tr>`).join('')}</tbody></table></div>`;
  }

  function saRefLabel(r) { return `SAG ${r.vol} (${esc(r.volName)}) · kap. ${esc(r.kap)}${r.par ? ` · ${esc(r.par)}` : ''}`; }
  function saBox(l) {
    const A = M.authority; if (!A) return '';
    return `<div class="g-sa">
      <div class="g-sa-h">📘 ${esc(A.name)} — bu konunun yetkili kaynağı</div>
      ${(l.sa || []).map(r => `<a class="g-sa-ref" href="${attr(r.url)}" target="_blank" rel="noopener"><span>${saRefLabel(r)}</span><small>bölüm s. ${esc(r.pages)} · PDF ↗</small></a>`).join('')}
      <a class="g-sa-ref" href="${attr(A.saol)}" target="_blank" rel="noopener"><span><b>SAOL</b> · kelime çekimi ve yazım</span><small>svenska.se ↗</small></a>
      <div class="g-sa-note">${esc(A.note)}</div>
    </div>`;
  }
  function saSources(l) {
    const A = M.authority; if (!A) return '';
    return (l.sa || []).map(r => `<li><a href="${attr(r.url)}" target="_blank" rel="noopener">Svenska Akademiens grammatik ${r.vol} (${esc(r.volName)}), kap. ${esc(r.kap)}${r.par ? `, ${esc(r.par)}` : ''}, s. ${esc(r.pages)}</a> <span class="g-sa-badge">Svenska Akademien</span></li>`).join('')
      + `<li><a href="${attr(A.saol)}" target="_blank" rel="noopener">Svenska Akademiens ordlista (SAOL), svenska.se</a> <span class="g-sa-badge">Svenska Akademien</span></li>`;
  }

  function viewLesson() {
    const l = BYID[V.id];
    if (!l) { V.view = 'today'; return viewToday(); }
    const b = best(l.id);
    return `${header('')}
      <div class="g-lesson">
        <div class="g-meta">${lvlPill(l.level)} <span>${esc(l.chapter)}</span>${b !== null ? ` <span class="g-row-b">en iyi %${b}</span>` : ''}</div>
        <h2 class="g-title">${esc(l.title)}</h2>
        <div class="g-sub">${esc(l.titleTr)}</div>
        <p class="g-summary">${inl(l.summary)}</p>
        ${saBox(l)}
        <div class="g-toc">${l.sections.map((s, i) => `<a href="#gsec${i}" data-act="gJump" data-i="${i}">${i + 1}. ${esc(s.h)}</a>`).join('')}<a href="#gpit" data-act="gJump" data-i="pit">⚠️ Tipik hatalar</a></div>
        ${l.sections.map((s, i) => `<div class="panel g-sec" id="gsec${i}">
          <div class="g-sec-h"><span class="g-sec-n">${i + 1}</span>${esc(s.h)}</div>
          <div class="g-body">${md(s.body)}</div>
          ${s.table ? tableHTML(s.table) : ''}
          ${(s.examples || []).length ? `<div class="g-exs">${s.examples.map(e => `<div class="g-exm">
            <div class="g-exm-t"><span>${inl(e.t)}</span><button class="g-spk" data-act="speak" data-text="${attr(e.t.replace(/\*/g, ''))}" aria-label="Dinle">🔊</button></div>
            <div class="g-exm-tr">${inl(e.tr)}</div>${e.note ? `<div class="g-exm-note">💡 ${inl(e.note)}</div>` : ''}</div>`).join('')}</div>` : ''}
        </div>`).join('')}
        <div class="panel g-pits" id="gpit"><div class="panel-title">⚠️ Türkçe konuşanların tipik hataları</div>
          ${l.pitfalls.map(p => `<div class="g-pit"><div class="g-wrong">✗ ${inl(p.wrong)}</div><div class="g-right">✓ ${inl(p.right)}</div><div class="g-why">${inl(p.why)}</div></div>`).join('')}
        </div>
        ${l.tips.length ? `<div class="panel g-tips"><div class="panel-title">🧠 Akılda tutma ipuçları</div><ul class="md-ul">${l.tips.map(t => `<li>${inl(t)}</li>`).join('')}</ul></div>` : ''}
        <div class="panel g-src"><div class="panel-title">📚 Kaynaklar</div>
          <ol>${saSources(l)}${l.sources.map(s => `<li><a href="${attr(s.url)}" target="_blank" rel="noopener">${esc(s.name)}</a></li>`).join('')}</ol>
          <div class="panel-hint">${M.authority ? esc(M.authority.srcNote) : 'Ders bu kaynaklardaki kurallara dayanarak hazırlandı ve bağımsız olarak kontrol edildi.'}</div></div>
        <div class="g-cta">
          <button class="btn-primary" data-act="gStart" data-id="${attr(l.id)}">✍️ Alıştırmalara başla (${l.exercises.length} soru)</button>
          ${hasKey() ? `<button class="btn-ghost" data-act="gAI" data-id="${attr(l.id)}">🤖 AI ile 8 yeni alıştırma</button>` : ''}
        </div>
      </div>`;
  }

  // ── alıştırma çalıştırıcı ─────────────────────────────────
  function newRun(mode, items, id) {
    V.run = { mode, id, items, i: 0, results: [], state: null, input: '', picked: [], pool: null };
    prepItem(); V.view = 'run'; V.focus = true;
  }
  function prepItem() {
    const r = V.run, it = r.items[r.i]; if (!it) return;
    r.state = null; r.picked = []; r.input = it.ex.type === 'fix' ? it.ex.q : '';
    if (it.ex.type === 'order') {
      let idx = shuffle(it.ex.words.map((_, k) => k));
      if (idx.every((v, k) => v === k) && idx.length > 1) idx = idx.slice(1).concat(idx[0]);
      r.pool = idx;
    }
  }
  function curUser() {
    const r = V.run, ex = r.items[r.i].ex;
    if (ex.type === 'order') return r.picked.map(k => ex.words[k]).join(' ');
    return r.input;
  }

  function viewRun() {
    const r = V.run, it = r.items[r.i], ex = it.ex, l = BYID[it.lessonId];
    const total = r.items.length, okN = r.results.filter(x => x.ok).length;
    const modeLabel = r.mode === 'review' ? '🔁 Tekrar' : r.mode === 'ai' ? '🤖 AI alıştırmaları' : '✍️ Alıştırmalar';
    let body = '';
    if (ex.type === 'mc') {
      body = `<div class="g-q">${inl(ex.q)}</div><div class="quiz-options">${ex.o.map((o, k) => {
        let cls = 'quiz-opt';
        if (r.state) { if (k === ex.a) cls += ' correct'; else if (String(k) === String(r.input)) cls += ' wrong'; }
        return `<button class="${cls}" data-act="gMC" data-o="${k}" ${r.state ? 'disabled' : ''}>${r.state ? (k === ex.a ? '✓ ' : String(k) === String(r.input) ? '✗ ' : '') : ''}${inl(o)}</button>`;
      }).join('')}</div>`;
    } else if (ex.type === 'gap') {
      const [a, b] = ex.q.split('___');
      body = `<div class="g-q g-gapq">${inl(a)}<input id="gIn" class="g-gap-in ${r.state || ''}" data-inp="gInput" value="${attr(r.input)}" autocomplete="off" autocapitalize="off" spellcheck="false" ${r.state ? 'disabled' : ''} aria-label="Boşluk">${inl(b || '')}</div>`;
    } else if (ex.type === 'fix') {
      body = `<div class="g-q">Bu cümlede <b>bir</b> hata var. Düzelt ve kontrol et:</div>
        <div class="g-fix-orig">${inl(ex.q)}</div>
        <textarea id="gIn" class="g-fix-in ${r.state || ''}" rows="2" data-inp="gInput" autocomplete="off" autocapitalize="off" spellcheck="false" ${r.state ? 'disabled' : ''}>${esc(r.input)}</textarea>`;
    } else if (ex.type === 'order') {
      body = `<div class="g-q">Kelimeleri doğru sıraya diz:</div>
        <div class="g-order-ans ${r.state || ''}">${r.picked.length ? r.picked.map((k, p) => `<button class="g-word in" data-act="gUnpick" data-p="${p}" ${r.state ? 'disabled' : ''}>${esc(ex.words[k])}</button>`).join('') : '<span class="g-ph">Aşağıdaki kelimelere dokun…</span>'}</div>
        <div class="g-order-pool">${r.pool.map(k => r.picked.includes(k) ? '' : `<button class="g-word" data-act="gPick" data-k="${k}" ${r.state ? 'disabled' : ''}>${esc(ex.words[k])}</button>`).join('')}</div>`;
    }
    const last = r.results[r.results.length - 1];
    const fb = r.state ? `<div class="g-fb ${r.state}">
        <div class="g-fb-h">${r.state === 'ok' ? '✓ Doğru!' : '✗ Yanlış'}</div>
        ${r.state === 'bad' ? `<div class="g-fb-ans">Doğru cevap: <b>${inl(correctText(ex))}</b>${ex.type !== 'mc' && answersOf(ex).length > 1 ? `<div class="g-fb-alt">Diğer kabul edilenler: ${answersOf(ex).slice(1).map(x => esc(x)).join(' · ')}</div>` : ''}</div>` : ''}
        <div class="g-fb-ex">${md(ex.ex || '')}</div>
        ${ex.type !== 'mc' && ex.type !== 'gap' ? `<button class="g-spk" data-act="speak" data-text="${attr(correctText(ex))}">🔊 Doğru cümleyi dinle</button>` : ''}
        ${r.state === 'bad' && hasKey() ? `<button class="btn-ghost btn-xs" data-act="gAsk">💬 AI öğretmene sor</button>` : ''}
      </div>` : '';
    const canCheck = ex.type === 'order' ? r.picked.length === ex.words.length : ex.type !== 'mc';
    return `${header('')}
      <div class="g-run">
        <div class="g-run-top"><span>${modeLabel}${r.mode !== 'lesson' ? ` · <em>${esc(l.titleTr)}</em>` : ` · ${esc(l.titleTr)}`}</span><span>Soru ${r.i + 1}/${total} · ✓ ${okN}</span></div>
        <div class="quiz-progress-bar"><div class="quiz-progress-fill" style="width:${(r.i / total) * 100}%;background:var(--purple)"></div></div>
        <div class="g-type">${TYPE_LABEL[ex.type] || ''}</div>
        ${body}
        ${fb}
        <div class="g-run-btns">
          ${!r.state && ex.type !== 'mc' ? `<button class="btn-primary" data-act="gCheck" ${canCheck ? '' : 'disabled'}>Kontrol et</button>` : ''}
          ${!r.state && ex.type === 'order' && r.picked.length ? `<button class="btn-ghost" data-act="gClear">Temizle</button>` : ''}
          ${!r.state ? `<button class="btn-ghost" data-act="gSkip">Bilmiyorum</button>` : ''}
          ${r.state ? `<button class="btn-primary" data-act="gNext">${r.i + 1 < total ? 'Sonraki →' : 'Sonucu gör →'}</button>` : ''}
        </div>
        <button class="quiz-back-btn" data-act="gQuit">← Çık (ilerleme kaydedilmez)</button>
      </div>`;
  }

  function finishRun() {
    const r = V.run, okN = r.results.filter(x => x.ok).length, total = r.items.length;
    const pct = Math.round((okN / total) * 100), t = todayKey();
    if (r.mode === 'lesson' || r.mode === 'review') r.results.forEach(x => x.key && schedule(x.key, x.ok));
    if (r.mode === 'lesson') {
      const g = G.lessons[r.id] || {}; g.best = Math.max(g.best || 0, pct); g.last = t; g.n = (g.n || 0) + 1; g.read = true; G.lessons[r.id] = g;
      if (G.days[t]?.id === r.id) G.days[t].done = true;
    }
    save();
    const xp = r.mode === 'lesson' ? 10 + okN * 2 : okN * 2;
    if (xp && typeof addXP === 'function') addXP(xp);
    r.summary = { okN, total, pct, xp };
    V.view = 'result';
  }

  function viewResult() {
    const r = V.run, s = r.summary, l = BYID[r.id] || BYID[r.items[0].lessonId];
    const emoji = s.pct === 100 ? '🏆' : s.pct >= PASS ? '👍' : '📚';
    const wrong = r.results.filter(x => !x.ok);
    const due = dueKeys(todayId()).length;
    const msg = r.mode === 'lesson'
      ? (s.pct >= PASS ? `Konu tamamlandı. Bu sorular aralıklı tekrar havuzuna eklendi; birkaç gün sonra tekrar karşına çıkacaklar.` : `%${PASS} altında kaldı. Dersi bir kez daha okuyup tekrar dene; konu yarın da gelecek.`)
      : r.mode === 'review' ? 'Doğru bildiklerin daha uzun aralıkla, yanlışların yarın tekrar sorulacak.' : 'AI alıştırmaları tekrar havuzuna eklenmez.';
    return `${header('')}
      <div class="quiz-done" style="border-color:var(--purple)">
        <div class="quiz-done-emoji">${emoji}</div>
        <div class="quiz-done-score">${s.okN}/${s.total} doğru · %${s.pct}</div>
        <div class="quiz-done-msg">${msg}${s.xp ? `<br><b>+${s.xp} XP</b>` : ''}</div>
        ${wrong.length ? `<div class="quiz-wrong-box"><div class="qwb-title">Gözden geçir:</div>${wrong.map(x => `<div class="g-wr"><div>${inl(x.ex.type === 'order' ? x.ex.words.join(' · ') : x.ex.q)}</div><b style="color:var(--green)">→ ${inl(correctText(x.ex))}</b></div>`).join('')}</div>` : ''}
        <div class="quiz-done-btns g-btns">
          ${r.mode === 'lesson' ? `<button class="btn-primary" data-act="gStart" data-id="${attr(r.id)}">🔄 Tekrar çöz</button><button class="btn-ghost" data-act="gOpen" data-id="${attr(r.id)}">📖 Derse dön</button>` : ''}
          ${r.mode === 'lesson' && hasKey() ? `<button class="btn-ghost" data-act="gAI" data-id="${attr(r.id)}">🤖 AI ile 8 yeni soru</button>` : ''}
          ${due ? `<button class="btn-ghost" data-act="gReview">🔁 Tekrar (${due})</button>` : ''}
          <button class="btn-ghost" data-act="gNav" data-v="today">📅 Bugün</button>
        </div>
      </div>`;
  }

  function viewReview() {
    const keys = dueKeys(todayId(), 999);
    const boxes = [0, 0, 0, 0, 0, 0, 0]; Object.values(G.items).forEach(v => boxes[v.box || 0]++);
    return `${header('review')}
      <div class="panel g-today">
        <h2 class="g-title">🔁 Aralıklı tekrar</h2>
        <p class="g-summary">Çözdüğün her alıştırma tekrar havuzuna girer. Doğru bildiğin soru 2, 4, 8, 16… gün sonra tekrar sorulur; yanlış yaptığın soru ertesi gün geri gelir. Böylece kurallar kalıcı olarak yerleşir.</p>
        <div class="g-stats"><div class="g-stat"><b>${keys.length}</b><span>bugün bekleyen</span></div><div class="g-stat"><b>${Object.keys(G.items).length}</b><span>havuzdaki soru</span></div><div class="g-stat"><b>${boxes[4] + boxes[5] + boxes[6]}</b><span>kalıcı öğrenilmiş</span></div></div>
        <div class="g-btns">${keys.length ? `<button class="btn-primary" data-act="gReview">Tekrara başla (${Math.min(keys.length, 10)} soru)</button>` : '<div class="g-ok">Bugün tekrar edilecek soru yok 🎉</div>'}</div>
      </div>`;
  }

  // ── AI ile ek alıştırma ───────────────────────────────────
  function validEx(x) {
    if (!x || typeof x !== 'object' || !x.q && x.type !== 'order') return false;
    if (x.type === 'mc') return Array.isArray(x.o) && x.o.length >= 3 && Number.isInteger(x.a) && x.a >= 0 && x.a < x.o.length;
    if (x.type === 'gap') return typeof x.q === 'string' && x.q.split('___').length === 2 && Array.isArray(x.a) && x.a.length && x.a.every(s => typeof s === 'string' && s.trim());
    if (x.type === 'fix') return Array.isArray(x.a) && x.a.length && x.a.every(s => typeof s === 'string') && !x.a.some(s => gNorm(s) === gNorm(x.q));
    if (x.type === 'order') return Array.isArray(x.words) && x.words.length >= 3 && typeof x.a === 'string' && gNorm(x.words.join(' ')) === gNorm(x.a);
    return false;
  }
  async function aiExercises(id) {
    const l = BYID[id];
    const sys = `Sen deneyimli bir ${M.langName} öğretmenisin. Öğrencin Türk bir veteriner hekim. Görevin: verilen gramer konusu için 8 YENİ, otomatik puanlanabilir alıştırma üretmek.
Kurallar:
- Türler: "mc" (3-4 seçenek, tek doğru, "a" = doğru seçeneğin 0'dan başlayan indeksi), "gap" (soruda tam bir "___"; "a" = boşluğa gelen tüm kabul edilebilir cevapların listesi), "fix" (tek hata içeren cümle; "a" = tüm doğru düzeltilmiş cümleler listesi), "order" ("words" = kelimeler DOĞRU sırada, "a" = tam cümle).
- Dağılım: 3 mc, 3 gap, 1 fix, 1 order. Kolaydan zora.
- Cevaplar tek anlamlı olsun; dilbilgisi kusursuz ve doğal olsun. Her alıştırmada "ex" = 1-2 cümle Türkçe açıklama.
- Bağlam: veteriner kliniği, sağlık, günlük hayat.
- Dersteki mevcut sorulara benzemesin.${M.norm ? '\n- ' + M.norm : ''}
Çıktı: {"exercises":[{"type":"mc","q":"…","o":["…"],"a":0,"ex":"…"}, …]}`;
    const user = `Konu: ${l.title} (${l.titleTr}), seviye ${l.level}.\nÖzet: ${l.summary}\nDersin bölümleri: ${l.sections.map(s => s.h).join(' | ')}\nMevcut sorular (tekrarlama): ${l.exercises.map(e => e.q || e.a).slice(0, 16).join(' || ')}`;
    const res = await callJSON(sys, [{ role: 'user', content: user }], { maxTokens: 3000 });
    const list = (Array.isArray(res) ? res : res?.exercises || []).filter(validEx);
    if (list.length < 3) throw new Error('AI geçerli alıştırma üretemedi. Tekrar dene.');
    return list;
  }

  // ── olaylar ───────────────────────────────────────────────
  function rerender(scrollTop) { renderTab('lessons'); if (scrollTop) window.scrollTo({ top: 0, behavior: 'smooth' }); }
  function answer(user, skipped) {
    const r = V.run, it = r.items[r.i];
    const ok = !skipped && isCorrect(it.ex, user);
    r.state = ok ? 'ok' : 'bad';
    if (it.ex.type === 'mc') r.input = String(user); else if (it.ex.type !== 'order') r.input = user;
    r.results.push({ key: it.key, ex: it.ex, ok, user });
    rerender();
  }

  Object.assign(ACTIONS, {
    gOpenToday: () => { S.gOpen = true; V.view = 'today'; rerender(true); },
    gClose: () => { S.gOpen = false; rerender(true); },
    gNav: (d) => { S.gOpen = true; V.view = d.v; V.run = null; rerender(true); },
    gOpen: (d) => {
      S.gOpen = true; V.view = 'lesson'; V.id = d.id;
      const g = G.lessons[d.id] || {}; if (!g.read) { g.read = true; G.lessons[d.id] = g; save(); }
      rerender(true);
    },
    gJump: (d) => { const el = document.getElementById(d.i === 'pit' ? 'gpit' : 'gsec' + d.i); if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' }); },
    gStart: (d) => {
      const l = BYID[d.id]; if (!l) return;
      S.gOpen = true;
      newRun('lesson', l.exercises.map((ex, i) => ({ key: `${l.id}#${i}`, ex, lessonId: l.id })), l.id);
      rerender(true);
    },
    gReview: () => {
      const keys = dueKeys(todayId(), 10);
      if (!keys.length) { showToast('Bugün tekrar edilecek soru yok 🎉', 'success'); return; }
      S.gOpen = true;
      newRun('review', shuffle(keys).map(k => { const [id, i] = k.split('#'); return { key: k, ex: BYID[id].exercises[+i], lessonId: id }; }), null);
      rerender(true);
    },
    gAI: async (d, el) => {
      if (!hasKey()) { openSettings(); return; }
      const old = el.textContent; el.disabled = true; el.textContent = '🤖 Üretiliyor…';
      try {
        const list = await aiExercises(d.id);
        S.gOpen = true;
        newRun('ai', list.map(ex => ({ key: null, ex, lessonId: d.id })), d.id);
        rerender(true);
      } catch (e) {
        showToast(e.message === 'NO_API_KEY' ? 'Önce API anahtarını ekle' : e.message, 'error');
        el.disabled = false; el.textContent = old;
      }
    },
    gSetStart: (d) => { G.start = d.l; const t = todayKey(); if (G.days[t] && !G.days[t].done) delete G.days[t]; save(); rerender(); showToast(`Başlangıç seviyesi: ${d.l}`, 'success'); },
    gInput: (d, el) => { if (V.run) V.run.input = el.value; },
    gMC: (d) => { if (V.run && !V.run.state) answer(+d.o); },
    gPick: (d) => { const r = V.run; if (!r || r.state) return; r.picked.push(+d.k); rerender(); },
    gUnpick: (d) => { const r = V.run; if (!r || r.state) return; r.picked.splice(+d.p, 1); rerender(); },
    gClear: () => { if (V.run) { V.run.picked = []; rerender(); } },
    gCheck: () => {
      const r = V.run; if (!r || r.state) return;
      const inp = document.getElementById('gIn'); if (inp) r.input = inp.value;
      const u = curUser();
      if (!String(u).trim()) { showToast('Önce cevabını yaz', 'info'); return; }
      answer(u);
    },
    gSkip: () => { const r = V.run; if (!r || r.state) return; const inp = document.getElementById('gIn'); if (inp) r.input = inp.value; answer(curUser(), true); },
    gNext: () => {
      const r = V.run; if (!r) return;
      if (r.i + 1 >= r.items.length) finishRun(); else { r.i++; prepItem(); V.focus = true; }
      rerender(true);
    },
    gQuit: () => { const r = V.run; V.run = null; V.view = r?.mode === 'review' ? 'review' : (r?.id ? 'lesson' : 'today'); V.id = r?.id || V.id; rerender(true); },
    gAsk: () => {
      const r = V.run, x = r.results[r.results.length - 1], l = BYID[r.items[r.i].lessonId];
      const userAns = x.ex.type === 'mc' ? x.ex.o[+x.user] : x.user;
      const q = `Gramer sorusu (${l.title} / ${l.titleTr}): "${x.ex.q || x.ex.words?.join(' / ')}". Benim cevabım: "${userAns || '(boş)'}". Doğru cevap: "${correctText(x.ex)}". Benim cevabım neden yanlış? Kuralı kısaca, örnekle açıkla.${M.askNorm ? ' ' + M.askNorm : ''}`;
      switchTab('chat'); setTimeout(() => window.Chat?.send(q), 150);
    },
  });

  // Enter ile kontrol / sonraki
  document.addEventListener('keydown', (e) => {
    if (!S.gOpen || S.tab !== 'lessons' || V.view !== 'run' || e.key !== 'Enter' || e.shiftKey) return;
    if (e.target.id === 'gIn' || !/INPUT|TEXTAREA|SELECT|BUTTON/.test(e.target.tagName)) {
      e.preventDefault();
      if (V.run?.state) ACTIONS.gNext(); else if (V.run?.items[V.run.i].ex.type !== 'mc') ACTIONS.gCheck();
    }
  });

  window.Grammar = {
    homeCard,
    render() {
      if (V.view === 'run' && V.run) return `<div class="g-wrap">${viewRun()}</div>`;
      if (V.view === 'result' && V.run?.summary) return `<div class="g-wrap">${viewResult()}</div>`;
      if (V.view === 'lesson') return `<div class="fade-in g-wrap">${viewLesson()}</div>`;
      if (V.view === 'list') return `<div class="fade-in g-wrap">${viewList()}</div>`;
      if (V.view === 'review') return `<div class="fade-in g-wrap">${viewReview()}</div>`;
      return `<div class="fade-in g-wrap">${viewToday()}</div>`;
    },
    afterRender() {
      if (V.view === 'run' && V.focus) {
        V.focus = false;
        const el = document.getElementById('gIn');
        if (el && !el.disabled && window.matchMedia('(min-width: 700px)').matches) { el.focus(); if (el.tagName === 'TEXTAREA') el.setSelectionRange(el.value.length, el.value.length); }
      }
    },
    _state: () => G, _isCorrect: isCorrect,
  };
})();
