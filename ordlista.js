// ═══════════════════════════════════════════════════════════
// SÖZLÜK — tüm kelime listesi, paket üreticisi ve CSV içe aktarma
// "Haznem" sekmesinin "Tüm sözlük" ve "Üret" modları
// ═══════════════════════════════════════════════════════════
'use strict';

// ── SÖZLÜK: dersler + kürasyonlu liste + kendi kelimelerin ──
let _dict = null;
function userWords() { return LS.get('eh_userwords', []); }
function saveUserWords(list) { LS.set('eh_userwords', list); dictInvalidate(); }
function dictInvalidate() { _dict = null; }

function dict() {
  if (_dict) return _dict;
  const out = [], seen = new Set();
  const push = (w, cat, src) => {
    if (!w || !w.en || seen.has(w.en)) return;
    seen.add(w.en);
    out.push(Object.assign({}, w, { cat: cat || w.cat || 'ielts', src }));
  };
  TOPIC_ORDER.forEach(k => (CONTENT[k]?.units || []).forEach(u => u.vocab.forEach(w => push(w, k, 'lesson'))));
  (typeof VOCAB !== 'undefined' ? VOCAB : []).forEach(w => push(w, w.cat, 'sozluk'));
  userWords().forEach(w => push(w, w.cat, 'kendi'));
  return (_dict = out);
}
window.dict = dict;

const LVL_ORDER = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2'];

const Ordlista = {
  search: '', cat: 'all', lvl: 'all', src: 'all', page: 0,
  gTheme: 'vet', gFree: '', gLevel: '', gCount: 25, gBusy: false, gResult: null, gPick: {},
};
window.Ordlista = Ordlista;
const PAGE_SIZE = 60;

// ── FİLTRELEME ───────────────────────────────────────────
Ordlista.filtered = function () {
  const s = this.search.toLowerCase().trim();
  return dict().filter(w => {
    if (this.cat !== 'all' && w.cat !== this.cat) return false;
    if (this.lvl !== 'all' && (w.lvl || '') !== this.lvl) return false;
    if (this.src !== 'all' && w.src !== this.src) return false;
    if (!s) return true;
    return w.en.toLowerCase().includes(s) || (w.tr || '').toLowerCase().includes(s) || (w.ex || '').toLowerCase().includes(s);
  });
};

// ── SÖZLÜĞE GÖZ AT ───────────────────────────────────────
Ordlista.renderBrowse = function () {
  const all = dict();
  const list = this.filtered();
  const shown = list.slice(0, (this.page + 1) * PAGE_SIZE);

  const byCat = {}; all.forEach(w => { byCat[w.cat] = (byCat[w.cat] || 0) + 1; });
  const bySrc = {}; all.forEach(w => { bySrc[w.src] = (bySrc[w.src] || 0) + 1; });

  const catChips = ['all', ...TOPIC_ORDER.filter(k => byCat[k])].map(c =>
    `<button class="filter-chip ${this.cat === c ? 'active' : ''}" data-act="olCat" data-c="${attr(c)}">${c === 'all' ? `Tümü (${all.length})` : `${CAT_LABELS[c] || c} (${byCat[c]})`}</button>`).join('');
  const lvlChips = ['all', ...LVL_ORDER].map(l =>
    `<button class="filter-chip ${this.lvl === l ? 'active' : ''}" data-act="olLvl" data-l="${l}">${l === 'all' ? 'Tüm seviyeler' : l}</button>`).join('');
  const srcLbl = { lesson: '📖 Dersler', sozluk: '📕 Sözlük', kendi: '⚡ Kendi kelimelerim' };
  const srcChips = ['all', 'lesson', 'sozluk', 'kendi'].filter(x => x === 'all' || bySrc[x]).map(x =>
    `<button class="filter-chip ${this.src === x ? 'active' : ''}" data-act="olSrc" data-s="${x}">${x === 'all' ? 'Tüm kaynaklar' : srcLbl[x] + ' (' + bySrc[x] + ')'}</button>`).join('');

  const rows = shown.length ? shown.map(w => {
    const saved = isSaved(w.en);
    return `<div class="ol-row">
      <div class="ol-main">
        <div class="ol-sv">${esc(w.en)}${w.lvl ? `<span class="ol-lvl">${esc(w.lvl)}</span>` : ''}
          ${pill(getColor(w.cat), (CAT_LABELS[w.cat] || w.cat).replace(/^\S+\s/, ''), true)}</div>
        <div class="ol-tr">${esc(w.tr)}</div>
        ${w.pron ? `<div class="ol-form">/${esc(w.pron)}/</div>` : ''}
        ${w.form ? `<div class="ol-form">${esc(w.form)}</div>` : ''}
        ${w.ex ? `<div class="ol-ex">"${esc(w.ex)}"</div>` : ''}
        ${w.tip ? `<div class="ol-tip">💡 ${esc(w.tip)}</div>` : ''}
      </div>
      <div class="ol-acts">
        <button class="bt" data-act="speak" data-text="${attr(w.en)}">🔊</button>
        <button class="bt ${saved ? 'saved' : ''}" data-act="olSave" data-en="${attr(w.en)}">${saved ? '★' : '☆'}</button>
      </div></div>`;
  }).join('') : `<div class="empty-state"><div class="empty-state-icon">🔍</div><div class="empty-state-text">Eşleşen kelime yok.</div></div>`;

  const more = list.length > shown.length
    ? `<button class="btn-ghost" style="width:100%;margin-top:12px" data-act="olMore">↓ ${Math.min(PAGE_SIZE, list.length - shown.length)} tane daha (${shown.length}/${list.length})</button>` : '';

  return `<div class="panel">
      <div class="panel-title">📕 Tüm sözlük — ${all.length} kelime</div>
      <div class="panel-hint">Ders kelimeleri, kürasyonlu sözlük ve kendi ürettiğin paketler tek yerde. ★ ile hazneye (tekrar programına) eklersin.</div>
      <div class="filter-row" style="margin-top:12px">
        <input class="search-input" id="olSearch" placeholder="İngilizce, Türkçe ya da örnek cümlelerde ara..." value="${attr(this.search)}" data-inp="olSearch" autocomplete="off"></div>
      <div class="filter-row">${catChips}</div>
      <div class="filter-row">${lvlChips}</div>
      <div class="filter-row">${srcChips}</div>
    </div>
    <div class="ol-list">${rows}</div>${more}`;
};

// ── PAKET ÜRETİCİSİ + CSV ────────────────────────────────
const PACK_PROMPT = `You build vocabulary packs for a Turkish speaker learning English.

RULES — quality matters more than quantity
- Return exactly the number of words requested, all inside the requested theme and at the requested CEFR level.
- Choose words a real user actually meets in that theme. At B1 and above, avoid the most basic core words (be, have, go).
- "pron" is MANDATORY and must be correct IPA (British or General American, be consistent), without slashes.
- "form" is MANDATORY: the word class plus any irregular forms.
  · verbs: "verb: go – went – gone" (irregular) or "verb: regular"
  · nouns: "noun: analysis – analyses (irregular pl.)" or "noun: countable" / "noun: uncountable"
  · adjectives: "adj. – comparative/superlative if irregular"
  · phrases: "phrasal verb (separable)" / "fixed expression"
- If you are not sure of a word's IPA, its irregular form, or that it is genuinely used in that theme: CHOOSE A DIFFERENT WORD. Fewer certain words beat one wrong entry.
- "ex" = one natural English sentence where the word is really used in that theme.
- "tip" = a TURKISH note: false friend, preposition that follows the word, collocation, etymology hook, or a mistake Turkish speakers typically make.

RESPOND ONLY with this JSON:
{"words":[{"en":"word","tr":"Türkçe karşılık","form":"word class","pron":"IPA","ex":"english sentence","tip":"Türkçe ipucu","lvl":"A1|A2|B1|B2|C1|C2"}]}`;

Ordlista.renderCreate = function () {
  if (this.gBusy) return `<div class="ai-loading"><div class="ai-loading-dots"><span></span><span></span><span></span></div><span>AI ${this.gCount} kelimelik paket hazırlıyor...</span></div>`;
  if (this.gResult) return this.renderReview();

  const themes = TOPIC_ORDER.map(k =>
    `<button class="chat-topic-chip ${this.gTheme === k ? 'active' : ''}" data-act="olTheme" data-k="${k}">${CAT_LABELS[k] || k}</button>`).join('');
  const lvls = ['', ...LVL_ORDER].map(l =>
    `<button class="filter-chip ${this.gLevel === l ? 'active' : ''}" data-act="olGLvl" data-l="${l}">${l || 'Seviyem (' + esc(S.cfg.level) + ')'}</button>`).join('');
  const counts = [15, 25, 50].map(n =>
    `<button class="filter-chip ${this.gCount === n ? 'active' : ''}" data-act="olCount" data-n="${n}">${n} kelime</button>`).join('');

  return `<div class="panel">
      <div class="panel-title">⚡ Kelime paketi üret</div>
      <div class="panel-hint">Konu ve seviye seç, AI kelime paketi üretsin. Onayladıkların kalıcı sözlüğüne girer — derslerde, tekrar programında ve günün kelimelerinde kullanılır. Zaten sözlükte olanlar otomatik elenir.</div>
      <div class="fld-label">Konu</div><div class="filter-row">${themes}</div>
      <div class="fld-label" for="olFree">Ya da kendi konun</div>
      <input class="fld-select" id="olFree" placeholder="ör. orthopaedic surgery, equine locomotion, dentistry, IELTS Task 1..." value="${attr(this.gFree)}" data-inp="olFree" autocomplete="off">
      <div class="fld-label">Seviye</div><div class="filter-row">${lvls}</div>
      <div class="fld-label">Adet</div><div class="filter-row">${counts}</div>
      <div class="btn-row"><button class="btn-primary" data-act="olGenerate">✨ Paketi üret</button></div>
    </div>

    <div class="panel">
      <div class="panel-title">📄 CSV ile içe aktar</div>
      <div class="panel-hint">Elindeki listeyi doğrudan yükle. İlk satır başlık olmalı; en az <code class="md-code">en</code> ve <code class="md-code">tr</code> sütunları gerekli.
        İsteğe bağlı: <code class="md-code">form, pron, ex, tip, cat, lvl</code>. Ayraç virgül ya da noktalı virgül olabilir.</div>
      <label class="btn-ghost import-label" style="width:100%;margin-top:12px;display:block;text-align:center">
        ⬆️ CSV seç<input type="file" id="olCsv" accept=".csv,.txt" hidden></label>
      <button class="btn-ghost btn-xs" style="margin-top:10px" data-act="olCsvSample">📥 Örnek CSV indir</button>
    </div>

    ${userWords().length ? `<div class="panel">
      <div class="panel-title">⚡ Kendi kelimelerin — ${userWords().length}</div>
      <div class="panel-hint">Ürettiğin ve içe aktardığın kelimeler. Yedeklerine dahil edilir.</div>
      <div class="btn-row">
        <button class="btn-ghost btn-xs" data-act="olSrc" data-s="kendi">Listede göster</button>
        <button class="btn-danger btn-xs" data-act="olClearUser">Hepsini sil</button></div></div>` : ''}`;
};

Ordlista.renderReview = function () {
  const words = this.gResult;
  const picked = Object.values(this.gPick).filter(Boolean).length;
  return `<div class="panel">
      <div class="panel-title">${words.length} kelime hazır — kaydetmeden önce gözden geçir</div>
      <div class="panel-hint">Telaffuzu ya da çevirisi yanlış görünen varsa işareti kaldır. Sadece işaretlediklerin sözlüğe girer.</div>
      <div class="btn-row">
        <button class="btn-ghost btn-xs" data-act="olPickAll" data-v="1">Hepsini seç</button>
        <button class="btn-ghost btn-xs" data-act="olPickAll" data-v="0">Hiçbirini seçme</button></div>
    </div>
    <div class="ol-list">${words.map((w, i) => `<div class="ol-row ${this.gPick[i] ? 'picked' : 'unpicked'}">
      <div class="ol-main">
        <div class="ol-sv">${esc(w.en)}${w.lvl ? `<span class="ol-lvl">${esc(w.lvl)}</span>` : ''}</div>
        <div class="ol-tr">${esc(w.tr)}</div>
        ${w.pron ? `<div class="ol-form">/${esc(w.pron)}/</div>` : ''}
        ${w.form ? `<div class="ol-form">${esc(w.form)}</div>` : ''}
        ${w.ex ? `<div class="ol-ex">"${esc(w.ex)}"</div>` : ''}
        ${w.tip ? `<div class="ol-tip">💡 ${esc(w.tip)}</div>` : ''}
      </div>
      <div class="ol-acts">
        <button class="bt" data-act="speak" data-text="${attr(w.en)}">🔊</button>
        <button class="bt ${this.gPick[i] ? 'saved' : ''}" data-act="olPick" data-i="${i}">${this.gPick[i] ? '☑' : '☐'}</button>
      </div></div>`).join('')}</div>
    <div class="btn-row">
      <button class="btn-primary" data-act="olSavePack">💾 ${picked} kelimeyi sözlüğe kaydet</button>
      <button class="btn-ghost" data-act="olDiscard">✕ At</button>
      <button class="btn-ghost" data-act="olGenerate">🔄 Yeni paket</button></div>`;
};

// ── CSV ──────────────────────────────────────────────────
function parseCSV(text) {
  const lines = String(text).replace(/^﻿/, '').split(/\r?\n/).filter(l => l.trim());
  if (lines.length < 2) throw new Error('Dosya boş ya da sadece başlık var');
  const delim = (lines[0].match(/;/g) || []).length > (lines[0].match(/,/g) || []).length ? ';' : ',';
  const splitRow = (line) => {
    const out = []; let cur = '', q = false;
    for (let i = 0; i < line.length; i++) {
      const c = line[i];
      if (q) { if (c === '"') { if (line[i + 1] === '"') { cur += '"'; i++; } else q = false; } else cur += c; }
      else if (c === '"') q = true;
      else if (c === delim) { out.push(cur); cur = ''; }
      else cur += c;
    }
    out.push(cur); return out.map(x => x.trim());
  };
  const head = splitRow(lines[0]).map(h => h.toLowerCase().replace(/[^a-zçğıöşü]/g, ''));
  const iEn = head.findIndex(h => ['en', 'english', 'word', 'ingilizce', 'kelime'].includes(h));
  const iTr = head.findIndex(h => ['tr', 'turkish', 'türkçe', 'turkce', 'anlam'].includes(h));
  if (iEn < 0 || iTr < 0) throw new Error('Başlıkta "en" ve "tr" sütunları bulunamadı');
  const idx = (names) => head.findIndex(h => names.includes(h));
  const iForm = idx(['form', 'wordclass', 'tür', 'tur', 'çekim']), iPr = idx(['pron', 'ipa', 'telaffuz', 'pronunciation']);
  const iEx = idx(['ex', 'example', 'örnek', 'ornek']), iTip = idx(['tip', 'note', 'not', 'ipucu']);
  const iCat = idx(['cat', 'category', 'kategori', 'konu']), iLvl = idx(['lvl', 'level', 'seviye', 'cefr']);
  const get = (r, i) => (i >= 0 && r[i] ? r[i] : '');
  const out = [];
  for (let i = 1; i < lines.length; i++) {
    const r = splitRow(lines[i]);
    if (!r[iEn] || !r[iTr]) continue;
    const cat = get(r, iCat);
    out.push({
      en: r[iEn], tr: r[iTr], form: get(r, iForm), pron: get(r, iPr),
      ex: get(r, iEx), tip: get(r, iTip),
      cat: CONTENT[cat] ? cat : 'ielts',
      lvl: LVL_ORDER.includes(get(r, iLvl).toUpperCase()) ? get(r, iLvl).toUpperCase() : '',
    });
  }
  if (!out.length) throw new Error('Geçerli satır bulunamadı');
  return out;
}

function addToUserWords(words) {
  const existing = new Set(dict().map(w => w.en.toLowerCase()));
  const list = userWords();
  let added = 0, dup = 0;
  words.forEach(w => {
    if (!w.en || !w.tr) return;
    if (existing.has(w.en.toLowerCase())) { dup++; return; }
    existing.add(w.en.toLowerCase());
    list.push({ en: w.en, tr: w.tr, form: w.form || '', pron: w.pron || '', ex: w.ex || '', tip: w.tip || '', cat: w.cat || 'ielts', lvl: w.lvl || '' });
    added++;
  });
  saveUserWords(list);
  return { added, dup };
}

// ── AKSİYONLAR ───────────────────────────────────────────
Object.assign(ACTIONS, {
  olSearch: (d, el) => {
    Ordlista.search = el.value; Ordlista.page = 0;
    renderTab('bank');
    const i = document.getElementById('olSearch');
    if (i) { i.focus(); i.setSelectionRange(i.value.length, i.value.length); }
  },
  olCat: (d) => { Ordlista.cat = d.c; Ordlista.page = 0; renderTab('bank'); },
  olLvl: (d) => { Ordlista.lvl = d.l; Ordlista.page = 0; renderTab('bank'); },
  olSrc: (d) => { Ordlista.src = d.s; Ordlista.page = 0; S.bMode = 'browse'; renderTab('bank'); },
  olMore: () => { Ordlista.page++; renderTab('bank'); },
  olSave: (d) => {
    const w = dict().find(x => x.en === d.en); if (!w) return;
    saveWordObj(w, w.cat);
  },
  olTheme: (d) => { Ordlista.gTheme = d.k; renderTab('bank'); },
  olGLvl: (d) => { Ordlista.gLevel = d.l; renderTab('bank'); },
  olCount: (d) => { Ordlista.gCount = +d.n; renderTab('bank'); },
  olFree: (d, el) => { Ordlista.gFree = el.value; },
  olPick: (d) => { const i = +d.i; Ordlista.gPick[i] = !Ordlista.gPick[i]; renderTab('bank'); },
  olPickAll: (d) => { (Ordlista.gResult || []).forEach((_, i) => Ordlista.gPick[i] = d.v === '1'); renderTab('bank'); },
  olDiscard: () => { Ordlista.gResult = null; Ordlista.gPick = {}; renderTab('bank'); },
  olClearUser: () => {
    if (!confirm('Kendi ürettiğin ve içe aktardığın tüm kelimeler silinsin mi? (Hazneye kaydettiklerin kalır)')) return;
    saveUserWords([]); renderTab('bank'); showToast('Kendi kelimelerin silindi', 'info');
  },
  olGenerate: async () => {
    if (!S.cfg.apiKey) { openSettings(); return; }
    Ordlista.gBusy = true; Ordlista.gResult = null; renderTab('bank');
    try {
      const t = CONTENT[Ordlista.gTheme];
      const theme = Ordlista.gFree.trim() || `${t.label} (${t.units.map(u => u.title).join(', ')})`;
      const lvl = Ordlista.gLevel || S.cfg.level;
      const have = dict().filter(w => w.cat === Ordlista.gTheme).slice(-120).map(w => w.en).join(', ');
      const res = await callJSON(PACK_PROMPT, [{
        role: 'user',
        content: `Theme: ${theme}\nCEFR level: ${lvl}\nNumber of words: ${Ordlista.gCount}\nLearner: a Turkish veterinarian living in Sweden\n${have ? `\nThese words are ALREADY in the dictionary — choose different ones:\n${have}` : ''}`
      }], { maxTokens: 8000 });
      const words = (res.words || []).filter(w => w && w.en && w.tr);
      if (!words.length) throw new Error('Paket boş döndü, tekrar dene');
      const existing = new Set(dict().map(w => w.en.toLowerCase()));
      Ordlista.gResult = words.filter(w => !existing.has(w.en.toLowerCase()));
      Ordlista.gPick = {}; Ordlista.gResult.forEach((_, i) => Ordlista.gPick[i] = true);
      const skipped = words.length - Ordlista.gResult.length;
      showToast(`${Ordlista.gResult.length} yeni kelime${skipped ? ` (${skipped} tekrar elendi)` : ''}`, 'success');
    } catch (e) { showToast(e.message, 'error'); }
    Ordlista.gBusy = false; renderTab('bank');
  },
  olSavePack: () => {
    const picked = (Ordlista.gResult || []).filter((_, i) => Ordlista.gPick[i])
      .map(w => Object.assign({}, w, { cat: Ordlista.gTheme }));
    if (!picked.length) { showToast('Hiç kelime seçilmedi', 'error'); return; }
    const { added, dup } = addToUserWords(picked);
    Ordlista.gResult = null; Ordlista.gPick = {};
    addXP(Math.min(50, added));
    showToast(`${added} kelime sözlüğe eklendi${dup ? ` · ${dup} tekrar` : ''} · +${Math.min(50, added)} XP`, 'success');
    renderTab('bank');
  },
  olCsvSample: () => {
    const csv = '﻿en,tr,form,pron,ex,tip,cat,lvl\n'
      + '"anaesthesia","anestezi","noun: uncountable","ˌæn.əsˈθiː.zi.ə","General anaesthesia was induced at nine.","ABD yazımı: anesthesia. Genel=general, lokal=local","vet","C1"\n'
      + '"referral","sevk","noun: countable","rɪˈfɜː.rəl","The GP wrote a referral to a specialist.","fiil: refer TO. İsveççe karşılığı: remiss","tip","B2"\n';
    download('sozluk-sablon.csv', csv, 'text/csv;charset=utf-8');
  },
});

document.addEventListener('change', (e) => {
  if (e.target.id !== 'olCsv') return;
  const f = e.target.files[0]; if (!f) return;
  const r = new FileReader();
  r.onload = () => {
    try {
      const words = parseCSV(r.result);
      const { added, dup } = addToUserWords(words);
      showToast(`${added} kelime içe aktarıldı${dup ? ` · ${dup} tekrar elendi` : ''}`, 'success');
      renderTab('bank');
    } catch (err) { showToast('CSV okunamadı: ' + err.message, 'error'); }
  };
  r.readAsText(f, 'utf-8');
});
