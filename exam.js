// ═══════════════════════════════════════════════════════════
// IELTS / TOEFL ÇALIŞMA ALANI
// Writing · Speaking · Reading · Listening · Sonuçlar
// ═══════════════════════════════════════════════════════════
'use strict';

const Exam = {
  sub: 'hub',          // hub | writing | speaking | reading | listening | results
  busy: false,
  // writing
  wKind: 'task2',      // task2 | task1a | task1g
  wTask: null, wText: '', wResult: null,
  // speaking
  sPart: 'full', sSteps: [], sIdx: 0, sPhase: 'idle', sResult: null,
  // reading
  rTheme: PASSAGE_THEMES[0], rSet: null, rAns: {}, rResult: null,
  // listening
  lType: 'dialogue', lTheme: PASSAGE_THEMES[0], lSet: null, lAns: {}, lResult: null, lPlays: 0,
  // timer
  timer: { on: false, sec: 0, limit: 0, id: null },
};
window.Exam = Exam;

const results = () => LS.get('eh_exam_results', []);
function saveResult(r) {
  const list = results();
  list.push(Object.assign({ id: Date.now(), date: new Date().toISOString() }, r));
  LS.set('eh_exam_results', list.slice(-100));
  checkBadges();
}

// ── ZAMANLAYICI ──────────────────────────────────────────
function timerStart(limitSec, onEnd) {
  timerStop();
  Exam.timer = { on: true, sec: 0, limit: limitSec, id: null, onEnd };
  Exam.timer.id = setInterval(() => {
    Exam.timer.sec++;
    const el = document.getElementById('examTimer');
    if (el) {
      const left = Exam.timer.limit ? Exam.timer.limit - Exam.timer.sec : Exam.timer.sec;
      el.textContent = fmtTime(Math.abs(left));
      el.classList.toggle('warn', Exam.timer.limit && left <= 300 && left > 60);
      el.classList.toggle('danger', Exam.timer.limit && left <= 60);
    }
    if (Exam.timer.limit && Exam.timer.sec >= Exam.timer.limit) { timerStop(); onEnd?.(); }
  }, 1000);
}
function timerStop() { if (Exam.timer.id) clearInterval(Exam.timer.id); Exam.timer.on = false; Exam.timer.id = null; }
function fmtTime(s) { return `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`; }

// ── CEVAP NORMALLEŞTİRME ─────────────────────────────────
function normAns(s) {
  return String(s || '').toLowerCase().trim()
    .replace(/[.,;:!?"'’]/g, '').replace(/\s+/g, ' ')
    .replace(/^(a|an|the)\s+/, '');
}
function answerOk(given, correct) {
  const g = normAns(given);
  if (!g) return false;
  return String(correct).split('/').map(normAns).some(c => c === g);
}

// ═══════════════════════════════════════════════════════════
// RENDER — YÖNLENDİRİCİ
// ═══════════════════════════════════════════════════════════
Exam.render = function () {
  if (this.busy) return this.shell(`<div class="ai-loading"><div class="ai-loading-dots"><span></span><span></span><span></span></div><span>${esc(this.busyMsg || 'AI hazırlıyor...')}</span></div>`);
  switch (this.sub) {
    case 'writing': return this.shell(this.renderWriting());
    case 'speaking': return this.shell(this.renderSpeaking());
    case 'reading': return this.shell(this.renderReading());
    case 'listening': return this.shell(this.renderListening());
    case 'results': return this.shell(this.renderResults());
    default: return this.shell(this.renderHub());
  }
};

Exam.shell = function (inner) {
  const tabs = [
    ['hub', '🏠 Genel'], ['writing', '✍️ Writing'], ['speaking', '🎙️ Speaking'],
    ['reading', '📖 Reading'], ['listening', '🎧 Listening'], ['results', '📈 Sonuçlar'],
  ].map(([k, l]) => `<button class="exam-tab ${this.sub === k ? 'active' : ''}" data-act="examSub" data-s="${k}">${l}</button>`).join('');
  const warn = !S.cfg.apiKey ? `<div class="key-warn">🔑 AI puanlaması ve içerik üretimi için API anahtarı gerekli — görevlere göz atabilir, cevap yazabilirsin.
    <button class="btn-ghost btn-xs" data-act="openSettings">Anahtar ekle</button></div>` : '';
  return `<div class="fade-in">
    <div class="section-head"><h2>🎓 IELTS / TOEFL Çalışma Alanı</h2><span class="badge" style="background:var(--blue)">Hedef ${esc(S.cfg.targetBand)}</span></div>
    <div class="exam-tabs">${tabs}</div>
    ${warn}
    ${inner}
  </div>`;
};

Exam.afterRender = function () {
  const ta = document.getElementById('wEditor');
  if (ta) {
    ta.addEventListener('input', () => { Exam.wText = ta.value; updateWordCount(); });
    updateWordCount();
  }
};

// ═══════════════════════════════════════════════════════════
// GENEL BAKIŞ
// ═══════════════════════════════════════════════════════════
Exam.renderHub = function () {
  const rs = results();
  const avg = (kind) => {
    const f = rs.filter(r => r.kind === kind && r.overall);
    return f.length ? (f.reduce((s, r) => s + Number(r.overall), 0) / f.length).toFixed(1) : '—';
  };
  const cards = [
    { k: 'writing', icon: '✍️', title: 'Writing', desc: 'Task 1 & Task 2 · AI band puanlaması, hata düzeltmesi ve band 8 örnek paragraf.', color: 'var(--red)' },
    { k: 'speaking', icon: '🎙️', title: 'Speaking', desc: 'Part 1-2-3 · Mikrofonla konuş, transkript çıkarılsın, 4 kritere göre puanlansın.', color: 'var(--orange)' },
    { k: 'reading', icon: '📖', title: 'Reading', desc: 'AI üretimi akademik pasaj · True/False/Not Given, çoktan seçmeli, boşluk doldurma.', color: 'var(--teal)' },
    { k: 'listening', icon: '🎧', title: 'Listening', desc: 'Seslendirilen diyalog/ders · not tamamlama ve çoktan seçmeli sorular.', color: 'var(--purple)' },
  ].map(c => `<button class="exam-card" data-act="examSub" data-s="${c.k}" style="border-left:4px solid ${c.color}">
    <div class="ec-top"><span class="ec-icon">${c.icon}</span><span class="ec-title">${c.title}</span><span class="ec-avg">ort. ${avg(c.k)}</span></div>
    <div class="ec-desc">${esc(c.desc)}</div>
  </button>`).join('');

  const overall = rs.length ? (rs.reduce((s, r) => s + Number(r.overall || 0), 0) / rs.length) : 0;
  const target = Number(S.cfg.targetBand);
  const gap = overall ? (target - overall) : null;

  return `<div class="exam-hub">
    <div class="hub-banner">
      <div>
        <div class="hub-band">${overall ? overall.toFixed(1) : '—'}</div>
        <div class="hub-band-lbl">Genel ortalaman (${rs.length} deneme)</div>
      </div>
      <div class="hub-target">
        <div class="hub-target-num">${esc(S.cfg.targetBand)}</div>
        <div class="hub-band-lbl">Hedefin</div>
      </div>
    </div>
    ${gap !== null ? `<div class="hub-msg">${gap <= 0 ? '🎉 Hedefinin üzerindesin — istikrarı koru.' : `Hedefe <b>${gap.toFixed(1)} band</b> var. En zayıf kriterine haftada 3 deneme yap.`}</div>` : ''}
    <div class="exam-card-grid">${cards}</div>
    <div class="panel">
      <div class="panel-title">Nasıl çalışır?</div>
      <div class="panel-hint">Her deneme gerçek IELTS kriterleriyle puanlanır ve <b>Sonuçlar</b> sekmesinde saklanır. Değerlendirmeler AI tahminidir — gerçek sınav puanı yerine geçmez, ama zayıf yönlerini görmek için güvenilir bir pusuladır. En doğru puanlama için ⚙️ Ayarlar'dan <b>Sonnet</b> modelini seç.</div>
    </div>
  </div>`;
};

// ═══════════════════════════════════════════════════════════
// WRITING
// ═══════════════════════════════════════════════════════════
const W_MIN = { task2: 250, task1a: 150, task1g: 150 };
const W_TIME = { task2: 40 * 60, task1a: 20 * 60, task1g: 20 * 60 };

function updateWordCount() {
  const n = (Exam.wText.trim().match(/\S+/g) || []).length;
  const min = W_MIN[Exam.wKind];
  const el = document.getElementById('wCount');
  if (el) { el.textContent = `${n} kelime`; el.className = 'w-count ' + (n >= min ? 'ok' : n >= min * 0.7 ? 'near' : 'low'); }
  const hint = document.getElementById('wMinHint');
  if (hint) hint.textContent = n >= min ? '✓ Minimum karşılandı' : `Minimum ${min} kelime (${min - n} kaldı)`;
}

Exam.renderWriting = function () {
  if (this.wResult) return this.renderEvalResult(this.wResult, 'writing');

  const kinds = [['task2', 'Task 2 — Deneme (40 dk / 250+)'], ['task1a', 'Task 1 Academic — Grafik (20 dk / 150+)'], ['task1g', 'Task 1 General — Mektup (20 dk / 150+)']]
    .map(([k, l]) => `<button class="seg-btn ${this.wKind === k ? 'active' : ''}" data-act="wKind" data-k="${k}">${esc(l)}</button>`).join('');

  if (!this.wTask) {
    return `<div class="seg-row">${kinds}</div>
      <div class="panel">
        <div class="panel-title">Görev seç</div>
        <div class="panel-hint">Bankadan rastgele bir görev al ya da AI'a senin için güncel bir görev ürettir.</div>
        <div class="btn-row">
          <button class="btn-primary" data-act="wPick">🎲 Bankadan görev al</button>
          <button class="btn-ghost" data-act="wGenerate">✨ AI'dan yeni görev üret</button>
        </div>
      </div>
      <div class="panel">
        <div class="panel-title">${this.wKind === 'task2' ? 'Task 2 nasıl puanlanır?' : 'Task 1 nasıl puanlanır?'}</div>
        <div class="crit-list">
          ${(this.wKind === 'task2'
            ? [['Task Response', 'Soruyu tam karşıladın mı, fikirler geliştirilmiş mi'], ['Coherence & Cohesion', 'Paragraf yapısı, bağlaçlar, akış'], ['Lexical Resource', 'Kelime çeşitliliği ve doğruluğu'], ['Grammatical Range', 'Yapı çeşitliliği ve dilbilgisi doğruluğu']]
            : [['Task Achievement', 'Ana eğilimleri seçtin mi, veriyi doğru aktardın mı'], ['Coherence & Cohesion', 'Mantıklı gruplama ve karşılaştırma'], ['Lexical Resource', 'Veri/trend kelimeleri'], ['Grammatical Range', 'Karşılaştırma ve zaman yapıları']]
          ).map(([k, d]) => `<div class="crit-row"><b>${k}</b><span>${esc(d)}</span></div>`).join('')}
        </div>
      </div>`;
  }

  const t = this.wTask;
  return `<div class="seg-row">${kinds}</div>
    <div class="task-card">
      <div class="task-meta">${esc(t.type || '')}${t.topic ? ' · ' + esc(t.topic) : ''}${t.tone ? ' · ' + esc(t.tone) : ''}</div>
      <div class="task-q">${esc(t.q)}</div>
      ${t.data ? `<div class="task-data"><b>Veriler:</b> ${esc(t.data)}</div>` : ''}
      ${t.chart ? `<div class="task-note">📊 ${esc(t.chart)} — gerçek sınavda görsel verilir; burada veriler yazıyla sunulur.</div>` : ''}
      <div class="task-actions">
        <button class="btn-ghost btn-xs" data-act="wPick">🎲 Başka görev</button>
        <button class="btn-ghost btn-xs" data-act="speak" data-text="${attr(t.q)}">🔊 Oku</button>
      </div>
    </div>

    <div class="editor-bar">
      <div class="timer-box"><span id="examTimer" class="timer">${fmtTime(W_TIME[this.wKind])}</span>
        <button class="btn-ghost btn-xs" data-act="wTimer">${this.timer.on ? '⏸ Duraklat' : '▶ Süreyi başlat'}</button></div>
      <div class="wc-box"><span id="wCount" class="w-count low">0 kelime</span><span id="wMinHint" class="w-hint"></span></div>
    </div>

    <textarea id="wEditor" class="w-editor" placeholder="Write your answer here in English…" spellcheck="false">${esc(this.wText)}</textarea>

    <div class="btn-row">
      <button class="btn-primary" data-act="wSubmit">📊 Değerlendir (AI examiner)</button>
      <button class="btn-ghost" data-act="wSaveDraft">💾 Taslağı sakla</button>
      <button class="btn-ghost" data-act="wReset">✕ Vazgeç</button>
    </div>
    <p class="flip-hint">İpucu: Önce 5 dakika plan yap. Task 2'de 4 paragraf (giriş · gövde 1 · gövde 2 · sonuç) neredeyse her zaman en güvenli yapıdır.</p>`;
};

Object.assign(ACTIONS, {
  examSub: (d) => { timerStop(); Mic.stop(); TTS.stop(); Exam.sub = d.s; renderTab('exam'); },
  wKind: (d) => { Exam.wKind = d.k; Exam.wTask = null; Exam.wText = ''; Exam.wResult = null; renderTab('exam'); },
  wPick: () => {
    const bank = Exam.wKind === 'task2' ? W_TASK2 : Exam.wKind === 'task1a' ? W_TASK1_A : W_TASK1_G;
    let t; do { t = bank[Math.floor(Math.random() * bank.length)]; } while (bank.length > 1 && t.q === Exam.wTask?.q);
    Exam.wTask = t; Exam.wText = LS.get('eh_draft_' + hash(t.q), ''); Exam.wResult = null;
    renderTab('exam');
  },
  wGenerate: async () => {
    if (!S.cfg.apiKey) { openSettings(); return; }
    Exam.busy = true; Exam.busyMsg = 'AI yeni bir görev yazıyor...'; renderTab('exam');
    try {
      const kindLabel = Exam.wKind === 'task2' ? 'IELTS Writing Task 2 denemesi'
        : Exam.wKind === 'task1a' ? 'IELTS Academic Writing Task 1 (grafik/tablo/süreç; verileri sözel olarak da yaz)'
        : 'IELTS General Training Writing Task 1 (mektup)';
      Exam.wTask = await callJSON(TASK_GEN_PROMPT, [{ role: 'user', content: `${kindLabel} üret. Öğrenci ilgi alanları: tıp, veteriner hekimlik, bilim, güncel olaylar. Seviye: ${S.cfg.level}.` }], { maxTokens: 700 });
      Exam.wText = ''; Exam.wResult = null;
    } catch (e) { showToast(e.message, 'error'); }
    Exam.busy = false; renderTab('exam');
  },
  wTimer: () => {
    if (Exam.timer.on) { timerStop(); }
    else timerStart(W_TIME[Exam.wKind], () => showToast('⏰ Süre doldu! Sınavda buraya kadar.', 'error'));
    renderTab('exam');
  },
  wSaveDraft: () => { if (Exam.wTask) { LS.set('eh_draft_' + hash(Exam.wTask.q), Exam.wText); showToast('Taslak saklandı', 'success'); } },
  wReset: () => { timerStop(); Exam.wTask = null; Exam.wText = ''; Exam.wResult = null; renderTab('exam'); },
  wSubmit: async () => {
    const n = (Exam.wText.trim().match(/\S+/g) || []).length;
    if (n < 40) { showToast('Değerlendirme için en az 40 kelime yaz', 'error'); return; }
    if (n < W_MIN[Exam.wKind] && !confirm(`${n} kelime yazdın, minimum ${W_MIN[Exam.wKind]}. Sınavda bu ceza puanı demek. Yine de değerlendirilsin mi?`)) return;
    timerStop();
    Exam.busy = true; Exam.busyMsg = 'Examiner metnini okuyor ve puanlıyor...'; renderTab('exam');
    try {
      const kindLabel = Exam.wKind === 'task2' ? 'IELTS Writing Task 2' : Exam.wKind === 'task1a' ? 'IELTS Academic Writing Task 1' : 'IELTS General Training Writing Task 1';
      const res = await callJSON(WRITING_EVAL_PROMPT, [{
        role: 'user',
        content: `Sınav bölümü: ${kindLabel}\nHedef band: ${S.cfg.targetBand}\n\nGÖREV:\n${Exam.wTask.q}\n${Exam.wTask.data ? '\nVERİLER:\n' + Exam.wTask.data : ''}\n\nÖĞRENCİNİN CEVABI (${n} kelime):\n"""\n${Exam.wText}\n"""`
      }], { maxTokens: 3000 });
      res.kind = 'writing'; res.section = kindLabel; res.task = Exam.wTask.q; res.answer = Exam.wText;
      Exam.wResult = res; saveResult(res); addXP(35);
      showToast(`Değerlendirme hazır — Band ${Number(res.overall).toFixed(1)} · +35 XP`, 'success');
    } catch (e) { showToast(e.message, 'error'); }
    Exam.busy = false; renderTab('exam');
  },
});

function hash(s) { let h = 0; for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) | 0; return Math.abs(h).toString(36); }

// ═══════════════════════════════════════════════════════════
// DEĞERLENDİRME SONUCU (Writing & Speaking ortak)
// ═══════════════════════════════════════════════════════════
function bandColor(b) {
  b = Number(b);
  return b >= 7.5 ? 'var(--green)' : b >= 6.5 ? 'var(--teal)' : b >= 5.5 ? 'var(--gold)' : 'var(--red)';
}

Exam.renderEvalResult = function (r, kind) {
  const overall = Number(r.overall || 0);
  const crit = (r.criteria || []).map(c => `<div class="crit-band">
    <div class="cb-head"><span>${esc(c.key)}</span><b style="color:${bandColor(c.band)}">${Number(c.band).toFixed(1)}</b></div>
    <div class="cb-track"><div class="cb-fill" style="width:${(Number(c.band) / 9) * 100}%;background:${bandColor(c.band)}"></div></div>
    <div class="cb-comment">${esc(c.comment)}</div>
  </div>`).join('');

  const errs = (r.errors || []).map(e => `<div class="err-row">
    <div class="err-old">${esc(e.original)}</div>
    <div class="err-new">${esc(e.corrected)}</div>
    <div class="err-why">${pill('var(--dim)', e.type || 'grammar', true)} ${esc(e.why || '')}</div>
  </div>`).join('');

  const ups = (r.upgrades || []).map((u, i) => `<div class="up-row">
    <div><span class="up-basic">${esc(u.basic)}</span> <span class="up-arrow">→</span> <span class="up-better">${esc(u.better)}</span></div>
    ${u.note ? `<div class="up-note">${esc(u.note)}</div>` : ''}
    <button class="up-save" data-act="examSaveUpgrade" data-i="${i}" data-kind="${kind}">★ Hazneye</button>
  </div>`).join('');

  const list = (arr, cls) => (arr || []).map(x => `<li class="${cls}">${esc(x)}</li>`).join('');

  return `<div class="result-wrap">
    <div class="band-hero" style="border-color:${bandColor(overall)}">
      <div class="band-big" style="color:${bandColor(overall)}">${overall.toFixed(1)}</div>
      <div>
        <div class="band-lbl">Tahmini Genel Band</div>
        <div class="band-sub">${esc(r.section || '')} · ${r.wordCount || ''} kelime · Hedefin ${esc(S.cfg.targetBand)}</div>
      </div>
    </div>
    <div class="crit-grid">${crit}</div>

    ${r.nextStep ? `<div class="next-step">🎯 <b>Sıradaki odağın:</b> ${esc(r.nextStep)}</div>` : ''}

    <div class="two-col">
      <div class="panel"><div class="panel-title">✅ Güçlü yanlar</div><ul class="tight-list">${list(r.strengths, 'good')}</ul></div>
      <div class="panel"><div class="panel-title">⚠️ Geliştirilecekler</div><ul class="tight-list">${list(r.improvements, 'bad')}</ul></div>
    </div>

    ${(r.fillerWords || []).length ? `<div class="panel"><div class="panel-title">🗣️ Dolgu sözcükleri</div><div class="panel-hint">${(r.fillerWords).map(f => `<code class="md-code">${esc(f)}</code>`).join(' ')} — bunları azaltmak akıcılık bandını doğrudan yükseltir.</div></div>` : ''}

    ${errs ? `<div class="panel"><div class="panel-title">✏️ Hatalar ve düzeltmeleri</div><div class="err-list">${errs}</div></div>` : ''}
    ${ups ? `<div class="panel"><div class="panel-title">⬆️ Band yükselten alternatifler</div><div class="up-list">${ups}</div></div>` : ''}

    ${(r.modelParagraph || r.modelAnswer) ? `<div class="panel">
      <div class="panel-title">💎 Band 8 örnek ${kind === 'speaking' ? 'cevap' : 'paragraf'}</div>
      <div class="model-text">${esc(r.modelParagraph || r.modelAnswer)}</div>
      <button class="btn-ghost btn-xs" data-act="speak" data-text="${attr(r.modelParagraph || r.modelAnswer)}">🔊 Dinle</button>
    </div>` : ''}

    <div class="btn-row">
      <button class="btn-primary" data-act="examAgain" data-kind="${kind}">🔄 Yeni deneme</button>
      <button class="btn-ghost" data-act="examSub" data-s="results">📈 Sonuçlarım</button>
      <button class="btn-ghost" data-act="examAskTeacher" data-kind="${kind}">💬 Öğretmene sor</button>
    </div>
  </div>`;
};

Object.assign(ACTIONS, {
  examAgain: (d) => {
    if (d.kind === 'writing') { Exam.wResult = null; Exam.wTask = null; Exam.wText = ''; }
    else { Exam.sResult = null; Exam.sSteps = []; Exam.sIdx = 0; Exam.sPhase = 'idle'; }
    renderTab('exam');
  },
  examSaveUpgrade: (d) => {
    const r = d.kind === 'writing' ? Exam.wResult : Exam.sResult;
    const u = r?.upgrades?.[+d.i]; if (!u) return;
    saveWordObj({ en: u.better, tr: u.note || u.basic, ex: u.better, tip: `Basit hâli: ${u.basic}` }, 'ielts');
  },
  examAskTeacher: (d) => {
    const r = d.kind === 'writing' ? Exam.wResult : Exam.sResult;
    if (!r) return;
    switchTab('chat');
    setTimeout(() => Chat.send(`IELTS ${d.kind === 'writing' ? 'Writing' : 'Speaking'} denemem ${Number(r.overall).toFixed(1)} band aldı. En zayıf kriterim "${r.criteria?.slice().sort((a, b) => a.band - b.band)[0]?.key}". Bunu bir sonraki band seviyesine çıkarmak için bana 3 somut teknik ve örnek cümleler ver.`), 150);
  },
});

// ═══════════════════════════════════════════════════════════
// SPEAKING
// ═══════════════════════════════════════════════════════════
Exam.renderSpeaking = function () {
  if (this.sResult) return this.renderEvalResult(this.sResult, 'speaking');

  if (!Mic.supported) {
    return `<div class="panel"><div class="panel-title">🎙️ Mikrofon desteklenmiyor</div>
      <div class="panel-hint">Bu tarayıcı konuşma tanımayı desteklemiyor. Chrome veya Edge kullan. İstersen cevabını yazarak da değerlendirebilirsin.</div>
      <button class="btn-primary" style="margin-top:12px;max-width:260px" data-act="sStart" data-p="full" data-typed="1">⌨️ Yazarak dene</button></div>`;
  }

  if (!this.sSteps.length) {
    const parts = [
      ['p1', 'Part 1 — Tanışma (4 soru, ~4 dk)', 'Günlük konularda kısa sorular.'],
      ['p2', 'Part 2 — Cue card (1 dk hazırlık + 2 dk konuşma)', 'Uzun tek başına konuşma.'],
      ['p3', 'Part 3 — Tartışma (3 soru)', 'Soyut, analitik sorular.'],
      ['full', 'Tam sınav (Part 1 + 2 + 3, ~12 dk)', 'Gerçek sınav sırası.'],
    ].map(([k, l, d]) => `<button class="opt-card ${this.sPart === k ? 'active' : ''}" data-act="sPart" data-p="${k}">
      <b>${esc(l)}</b><span>${esc(d)}</span></button>`).join('');
    return `<div class="opt-grid">${parts}</div>
      <div class="btn-row"><button class="btn-primary" data-act="sStart" data-p="${this.sPart}">▶ Sınavı başlat</button></div>
      <div class="panel"><div class="panel-title">Nasıl çalışır?</div>
        <div class="panel-hint">Soru sesli okunur → 🎙️ tuşuna basıp İngilizce cevap verirsin → tarayıcı konuşmanı yazıya çevirir → sonunda tüm cevapların 4 IELTS kriterine göre puanlanır. Transkript otomatik olduğu için telaffuz bandı <b>tahminidir</b>.</div>
      </div>`;
  }

  const step = this.sSteps[this.sIdx];
  const progress = `${this.sIdx + 1}/${this.sSteps.length}`;

  if (step.kind === 'cue') {
    const prep = this.sPhase === 'prep';
    return `<div class="spk-wrap">
      <div class="spk-head"><span class="spk-part">Part 2 · ${progress}</span><span id="examTimer" class="timer">${fmtTime(prep ? 60 : 120)}</span></div>
      <div class="cue-card">
        <div class="cue-title">${esc(step.cue)}</div>
        <div class="cue-sub">You should say:</div>
        <ul class="cue-list">${step.bullets.map(b => `<li>${esc(b)}</li>`).join('')}</ul>
        <div class="cue-note">You will have to talk about the topic for 1 to 2 minutes.</div>
      </div>
      ${this.sPhase === 'idle' ? `<div class="btn-row"><button class="btn-primary" data-act="sPrep">⏱️ 1 dakika hazırlık başlat</button><button class="btn-ghost" data-act="sRecord">🎙️ Direkt konuş</button></div>` : ''}
      ${prep ? `<div class="prep-note">📝 Not al, düşün. Süre bitince otomatik olarak konuşma başlar.<textarea class="prep-pad" placeholder="Notlarını buraya al…"></textarea><button class="btn-ghost btn-xs" data-act="sRecord">Hazırım, şimdi konuş →</button></div>` : ''}
      ${this.sPhase === 'rec' ? this.recBox(step) : ''}
      ${this.sPhase === 'done' ? this.doneBox(step) : ''}
    </div>`;
  }

  return `<div class="spk-wrap">
    <div class="spk-head"><span class="spk-part">${esc(step.part)} · ${progress}</span>${this.sPhase === 'rec' ? `<span id="examTimer" class="timer">00:00</span>` : ''}</div>
    <div class="spk-q">
      <span>${esc(step.q)}</span>
      <button class="btn-ghost btn-xs" data-act="speak" data-text="${attr(step.q)}">🔊</button>
    </div>
    ${this.sPhase === 'idle' ? `<div class="btn-row"><button class="btn-primary" data-act="sRecord">🎙️ Cevapla</button><button class="btn-ghost" data-act="sTyped">⌨️ Yazarak cevapla</button></div>` : ''}
    ${this.sPhase === 'rec' ? this.recBox(step) : ''}
    ${this.sPhase === 'typing' ? `<textarea id="sTypeBox" class="w-editor" placeholder="Type your answer in English…">${esc(step.answer || '')}</textarea>
      <div class="btn-row"><button class="btn-primary" data-act="sTypedSave">Kaydet →</button></div>` : ''}
    ${this.sPhase === 'done' ? this.doneBox(step) : ''}
  </div>`;
};

Exam.recBox = function (step) {
  return `<div class="rec-box">
    <div class="rec-live"><span class="rec-dot"></span> Kaydediyorum — İngilizce konuş</div>
    <div class="rec-transcript" id="sTranscript">${esc(step.answer || '')}<span class="rec-interim" id="sInterim"></span></div>
    <div class="btn-row"><button class="btn-primary" data-act="sStopRec">⏹ Bitir</button></div>
  </div>`;
};

Exam.doneBox = function (step) {
  const last = this.sIdx >= this.sSteps.length - 1;
  return `<div class="rec-box done">
    <div class="rec-transcript">${esc(step.answer || '(cevap alınamadı)')}</div>
    <div class="rec-meta">${(String(step.answer || '').match(/\S+/g) || []).length} kelime</div>
    <div class="btn-row">
      <button class="btn-ghost" data-act="sRecord">🔄 Tekrar cevapla</button>
      ${last ? `<button class="btn-primary" data-act="sFinish">📊 Sınavı bitir & puanla</button>`
             : `<button class="btn-primary" data-act="sNext">Sonraki soru →</button>`}
    </div>
  </div>`;
};

function buildSpeakingSteps(part) {
  const p1 = SPK_PART1[Math.floor(Math.random() * SPK_PART1.length)];
  const p2 = SPK_PART2[Math.floor(Math.random() * SPK_PART2.length)];
  const steps = [];
  if (part === 'p1' || part === 'full') p1.qs.forEach(q => steps.push({ kind: 'q', part: 'Part 1 — ' + p1.topic, q, answer: '' }));
  if (part === 'p2' || part === 'full') steps.push({ kind: 'cue', part: 'Part 2', cue: p2.cue, bullets: p2.bullets, q: p2.cue, answer: '' });
  if (part === 'p3' || part === 'full') p2.part3.forEach(q => steps.push({ kind: 'q', part: 'Part 3 — Tartışma', q, answer: '' }));
  return steps;
}

Object.assign(ACTIONS, {
  sPart: (d) => { Exam.sPart = d.p; renderTab('exam'); },
  sStart: (d) => {
    Exam.sSteps = buildSpeakingSteps(d.p || Exam.sPart);
    Exam.sIdx = 0; Exam.sPhase = 'idle'; Exam.sResult = null;
    renderTab('exam');
    const st = Exam.sSteps[0];
    if (st && st.kind === 'q') setTimeout(() => TTS.speak(st.q), 300);
  },
  sPrep: () => {
    Exam.sPhase = 'prep'; renderTab('exam');
    timerStart(60, () => ACTIONS.sRecord());
  },
  sRecord: () => {
    timerStop(); TTS.stop();
    const step = Exam.sSteps[Exam.sIdx];
    step.answer = '';
    Exam.sPhase = 'rec'; renderTab('exam');
    LS.set('eh_voice_used', true);
    timerStart(step.kind === 'cue' ? 120 : 90, () => ACTIONS.sStopRec());
    const ok = Mic.start({
      lang: 'en-US',
      onResult: (fin, interim) => {
        step.answer = fin;
        const t = document.getElementById('sTranscript');
        const iv = document.getElementById('sInterim');
        if (t) t.firstChild ? (t.childNodes[0].nodeValue = fin + ' ') : (t.textContent = fin);
        if (iv) iv.textContent = ' ' + interim;
      },
      onEnd: () => {},
      onError: () => { Exam.sPhase = 'idle'; renderTab('exam'); },
    });
    if (!ok) { Exam.sPhase = 'idle'; renderTab('exam'); }
  },
  sStopRec: () => {
    timerStop(); Mic.stop();
    const step = Exam.sSteps[Exam.sIdx];
    step.answer = (Mic.finalText || step.answer || '').trim();
    Exam.sPhase = 'done'; renderTab('exam');
  },
  sTyped: () => { Exam.sPhase = 'typing'; renderTab('exam'); },
  sTypedSave: () => {
    const box = document.getElementById('sTypeBox');
    Exam.sSteps[Exam.sIdx].answer = (box?.value || '').trim();
    Exam.sPhase = 'done'; renderTab('exam');
  },
  sNext: () => {
    Exam.sIdx++; Exam.sPhase = 'idle'; renderTab('exam');
    const st = Exam.sSteps[Exam.sIdx];
    if (st && st.kind === 'q') setTimeout(() => TTS.speak(st.q), 250);
  },
  sFinish: async () => {
    timerStop(); Mic.stop();
    const answered = Exam.sSteps.filter(s => (s.answer || '').trim().length > 3);
    if (!answered.length) { showToast('Değerlendirmek için en az bir cevap gerekli', 'error'); return; }
    Exam.busy = true; Exam.busyMsg = 'Examiner konuşmanı değerlendiriyor...'; renderTab('exam');
    try {
      const body = Exam.sSteps.map((s, i) => `[${s.part}]\nQ: ${s.kind === 'cue' ? s.cue + ' — ' + s.bullets.join('; ') : s.q}\nA: ${s.answer || '(cevap yok)'}`).join('\n\n');
      const res = await callJSON(SPEAKING_EVAL_PROMPT, [{
        role: 'user', content: `Hedef band: ${S.cfg.targetBand}. Aşağıda IELTS Speaking oturumunun soru-cevapları var (cevaplar otomatik transkripttir).\n\n${body}`
      }], { maxTokens: 3000 });
      res.kind = 'speaking'; res.section = 'IELTS Speaking'; res.task = Exam.sSteps[0]?.q || ''; res.answer = body;
      Exam.sResult = res; saveResult(res); addXP(35);
      showToast(`Speaking bandın: ${Number(res.overall).toFixed(1)} · +35 XP`, 'success');
    } catch (e) { showToast(e.message, 'error'); }
    Exam.busy = false; renderTab('exam');
  },
});

// ═══════════════════════════════════════════════════════════
// READING
// ═══════════════════════════════════════════════════════════
Exam.renderReading = function () {
  if (this.rResult) return this.renderQuizResult(this.rResult, this.rSet, 'reading');

  if (!this.rSet) {
    const themes = PASSAGE_THEMES.map(t => `<button class="chat-topic-chip ${this.rTheme === t ? 'active' : ''}" data-act="rTheme" data-t="${attr(t)}">${esc(t)}</button>`).join('');
    return `<div class="panel">
        <div class="panel-title">📖 Reading pratiği</div>
        <div class="panel-hint">AI senin için özgün bir akademik pasaj ve 10 soru üretir: 4× True/False/Not Given, 3× çoktan seçmeli, 3× boşluk doldurma. Süre 20 dakika (gerçek sınavda pasaj başına ayrılan süre).</div>
        <div class="filter-row" style="margin-top:12px">${themes}</div>
        <div class="btn-row"><button class="btn-primary" data-act="rGenerate">✨ Pasaj üret & başla</button></div>
      </div>`;
  }

  const p = this.rSet;
  const paras = (p.paragraphs || []).map(x => `<div class="rp-para"><span class="rp-label">${esc(x.label)}</span><span>${esc(x.text)}</span></div>`).join('');
  const qs = (p.questions || []).map((q, i) => `<div class="rq-item">
    <div class="rq-q"><b>${q.n || i + 1}.</b> ${esc(q.q)} ${q.type === 'gap' ? '<i class="rq-hint">(EN FAZLA İKİ KELİME)</i>' : ''}</div>
    ${q.type === 'gap'
      ? `<input class="rq-input" data-inp="rSet" data-i="${i}" value="${attr(this.rAns[i] || '')}" placeholder="cevabın…" autocomplete="off">`
      : `<div class="rq-opts">${(q.o || []).map(o => `<button class="rq-opt ${this.rAns[i] === o ? 'sel' : ''}" data-act="rPick" data-i="${i}" data-v="${attr(o)}">${esc(o)}</button>`).join('')}</div>`}
  </div>`).join('');

  return `<div class="reading-wrap">
    <div class="editor-bar">
      <div class="timer-box"><span id="examTimer" class="timer">20:00</span><button class="btn-ghost btn-xs" data-act="rTimer">${this.timer.on ? '⏸' : '▶ Süre'}</button></div>
      <button class="btn-ghost btn-xs" data-act="rReset">✕ Vazgeç</button>
    </div>
    <div class="passage">
      <h3 class="passage-title">${esc(p.title)}</h3>
      ${paras}
      <button class="btn-ghost btn-xs" data-act="speak" data-text="${attr((p.paragraphs || []).map(x => x.text).join(' ').slice(0, 900))}">🔊 Baştan oku</button>
    </div>
    <div class="questions">${qs}</div>
    <div class="btn-row"><button class="btn-primary" data-act="rSubmit">✓ Cevapları kontrol et</button></div>
  </div>`;
};

Object.assign(ACTIONS, {
  rTheme: (d) => { Exam.rTheme = d.t; renderTab('exam'); },
  rTimer: () => { if (Exam.timer.on) timerStop(); else timerStart(20 * 60, () => showToast('⏰ Süre doldu!', 'error')); renderTab('exam'); },
  rReset: () => { timerStop(); Exam.rSet = null; Exam.rAns = {}; Exam.rResult = null; renderTab('exam'); },
  rPick: (d) => { Exam.rAns[+d.i] = d.v; renderTab('exam'); },
  rSet: (d, el) => { Exam.rAns[+d.i] = el.value; },
  rGenerate: async () => {
    if (!S.cfg.apiKey) { openSettings(); return; }
    Exam.busy = true; Exam.busyMsg = 'AI akademik pasajı ve soruları yazıyor...'; renderTab('exam');
    try {
      Exam.rSet = await callJSON(READING_GEN_PROMPT, [{ role: 'user', content: `Tema: ${Exam.rTheme}. Öğrenci seviyesi ${S.cfg.level}, hedef band ${S.cfg.targetBand}. Zorluğu hedef banda göre ayarla.` }], { maxTokens: 4000 });
      Exam.rAns = {}; Exam.rResult = null;
      renderTab('exam');
      timerStart(20 * 60, () => showToast('⏰ Süre doldu!', 'error'));
    } catch (e) { showToast(e.message, 'error'); }
    Exam.busy = false; renderTab('exam');
  },
  rSubmit: () => {
    timerStop();
    const res = scoreQuiz(Exam.rSet, Exam.rAns, 'reading');
    Exam.rResult = res; saveResult(res); addXP(25);
    showToast(`${res.correct}/${res.total} doğru · tahmini band ${res.overall} · +25 XP`, 'success');
    renderTab('exam');
  },
});

// ═══════════════════════════════════════════════════════════
// LISTENING
// ═══════════════════════════════════════════════════════════
Exam.renderListening = function () {
  if (this.lResult) return this.renderQuizResult(this.lResult, this.lSet, 'listening');

  if (!this.lSet) {
    const types = LISTEN_TYPES.map(t => `<button class="opt-card ${this.lType === t.id ? 'active' : ''}" data-act="lType" data-t="${t.id}"><b>${esc(t.label)}</b></button>`).join('');
    const themes = PASSAGE_THEMES.map(t => `<button class="chat-topic-chip ${this.lTheme === t ? 'active' : ''}" data-act="lTheme" data-t="${attr(t)}">${esc(t)}</button>`).join('');
    return `<div class="panel">
      <div class="panel-title">🎧 Listening pratiği</div>
      <div class="panel-hint">AI bir konuşma metni ve 8 soru üretir; metin tarayıcının sesiyle okunur. Gerçek sınavda kayıt <b>bir kez</b> çalınır — burada da önce bir kez dinlemeyi dene.</div>
      <div class="opt-grid" style="margin-top:12px">${types}</div>
      <div class="filter-row">${themes}</div>
      <div class="btn-row"><button class="btn-primary" data-act="lGenerate">✨ Dinleme üret & başla</button></div>
    </div>`;
  }

  const p = this.lSet;
  const qs = (p.questions || []).map((q, i) => `<div class="rq-item">
    <div class="rq-q"><b>${q.n || i + 1}.</b> ${esc(q.q)} ${q.type === 'gap' ? '<i class="rq-hint">(EN FAZLA İKİ KELİME / SAYI)</i>' : ''}</div>
    ${q.type === 'gap'
      ? `<input class="rq-input" data-inp="lSet" data-i="${i}" value="${attr(this.lAns[i] || '')}" autocomplete="off">`
      : `<div class="rq-opts">${(q.o || []).map(o => `<button class="rq-opt ${this.lAns[i] === o ? 'sel' : ''}" data-act="lPick" data-i="${i}" data-v="${attr(o)}">${esc(o)}</button>`).join('')}</div>`}
  </div>`).join('');

  return `<div class="listening-wrap">
    <div class="audio-card">
      <div class="audio-title">🎧 ${esc(p.title)}</div>
      <div class="audio-ctx">${esc(p.context || '')}</div>
      <div class="audio-controls">
        <button class="btn-primary" data-act="lPlay">▶ ${this.lPlays === 0 ? 'Kaydı çal' : 'Tekrar çal'}</button>
        <button class="btn-ghost" data-act="lStop">⏹ Durdur</button>
        <span class="audio-plays">${this.lPlays} kez dinlendi</span>
      </div>
      <div class="panel-hint">Konuşma hızını ⚙️ Ayarlar → Ses bölümünden değiştirebilirsin.</div>
    </div>
    <div class="questions">${qs}</div>
    <div class="btn-row">
      <button class="btn-primary" data-act="lSubmit">✓ Cevapları kontrol et</button>
      <button class="btn-ghost" data-act="lReset">✕ Vazgeç</button>
    </div>
  </div>`;
};

Object.assign(ACTIONS, {
  lType: (d) => { Exam.lType = d.t; renderTab('exam'); },
  lTheme: (d) => { Exam.lTheme = d.t; renderTab('exam'); },
  lPick: (d) => { Exam.lAns[+d.i] = d.v; renderTab('exam'); },
  lSet: (d, el) => { Exam.lAns[+d.i] = el.value; },
  lReset: () => { TTS.stop(); Exam.lSet = null; Exam.lAns = {}; Exam.lResult = null; Exam.lPlays = 0; renderTab('exam'); },
  lPlay: () => {
    if (!Exam.lSet) return;
    Exam.lPlays++;
    const script = String(Exam.lSet.script || '').replace(/^([AB]|Speaker \d):/gm, '');
    TTS.speak(script);
    renderTab('exam');
  },
  lStop: () => TTS.stop(),
  lGenerate: async () => {
    if (!S.cfg.apiKey) { openSettings(); return; }
    Exam.busy = true; Exam.busyMsg = 'AI dinleme metnini ve soruları hazırlıyor...'; renderTab('exam');
    try {
      const t = LISTEN_TYPES.find(x => x.id === Exam.lType);
      Exam.lSet = await callJSON(LISTENING_GEN_PROMPT, [{ role: 'user', content: `Tür: ${t.label}. Tema: ${Exam.lTheme}. Öğrenci seviyesi ${S.cfg.level}, hedef band ${S.cfg.targetBand}.` }], { maxTokens: 3500 });
      Exam.lAns = {}; Exam.lResult = null; Exam.lPlays = 0;
    } catch (e) { showToast(e.message, 'error'); }
    Exam.busy = false; renderTab('exam');
  },
  lSubmit: () => {
    TTS.stop();
    const res = scoreQuiz(Exam.lSet, Exam.lAns, 'listening');
    Exam.lResult = res; saveResult(res); addXP(25);
    showToast(`${res.correct}/${res.total} doğru · tahmini band ${res.overall} · +25 XP`, 'success');
    renderTab('exam');
  },
});

// ── PUANLAMA (Reading & Listening) ───────────────────────
const RAW_TO_BAND = [
  [39, 9], [37, 8.5], [35, 8], [33, 7.5], [30, 7], [27, 6.5], [23, 6], [19, 5.5], [15, 5], [13, 4.5], [10, 4], [0, 3.5],
];
function rawToBand(correct, total) {
  const scaled = Math.round((correct / total) * 40);
  for (const [th, b] of RAW_TO_BAND) if (scaled >= th) return b;
  return 3.5;
}

function scoreQuiz(set, ansMap, kind) {
  const qs = set.questions || [];
  const detail = qs.map((q, i) => {
    const given = ansMap[i] || '';
    const ok = q.type === 'gap' ? answerOk(given, q.a) : normAns(given) === normAns(q.a);
    return { n: q.n || i + 1, q: q.q, given, correct: q.a, ok, why: q.why, type: q.type };
  });
  const correct = detail.filter(d => d.ok).length;
  return {
    kind, section: kind === 'reading' ? 'IELTS Reading' : 'IELTS Listening',
    title: set.title, correct, total: qs.length,
    overall: rawToBand(correct, qs.length), detail, glossary: set.glossary || [],
    script: set.script || '',
  };
}

Exam.renderQuizResult = function (r, set, kind) {
  const rows = r.detail.map(d => `<div class="ans-row ${d.ok ? 'ok' : 'no'}">
    <div class="ans-n">${d.n}</div>
    <div class="ans-body">
      <div class="ans-q">${esc(d.q)}</div>
      <div class="ans-line">Senin cevabın: <b>${esc(d.given || '—')}</b>${d.ok ? '' : ` · Doğru: <b class="ans-correct">${esc(d.correct)}</b>`}</div>
      ${d.why ? `<div class="ans-why">${esc(d.why)}</div>` : ''}
    </div>
  </div>`).join('');

  REG.exam = r.glossary || [];
  const gloss = (r.glossary || []).length ? `<div class="panel">
    <div class="panel-title">📚 Metindeki zor kelimeler</div>
    <div class="vocab-grid">${r.glossary.map((w, i) => vocabCardHTML(w, i, 'exam', 'ielts')).join('')}</div>
  </div>` : '';

  const byType = {};
  r.detail.forEach(d => { byType[d.type] = byType[d.type] || { ok: 0, n: 0 }; byType[d.type].n++; if (d.ok) byType[d.type].ok++; });
  const typeLbl = { tfng: 'True/False/Not Given', mcq: 'Çoktan seçmeli', gap: 'Boşluk doldurma' };
  const typeRows = Object.entries(byType).map(([t, v]) => `<div class="crit-row"><b>${typeLbl[t] || t}</b><span>${v.ok}/${v.n}</span></div>`).join('');

  return `<div class="result-wrap">
    <div class="band-hero" style="border-color:${bandColor(r.overall)}">
      <div class="band-big" style="color:${bandColor(r.overall)}">${Number(r.overall).toFixed(1)}</div>
      <div>
        <div class="band-lbl">Tahmini Band</div>
        <div class="band-sub">${esc(r.section)} · ${r.correct}/${r.total} doğru · ${esc(r.title || '')}</div>
      </div>
    </div>
    <div class="panel"><div class="panel-title">Soru tipine göre</div><div class="crit-list">${typeRows}</div></div>
    <div class="panel"><div class="panel-title">Cevap anahtarı ve açıklamalar</div><div class="ans-list">${rows}</div></div>
    ${gloss}
    ${kind === 'listening' && r.script ? `<details class="panel script-details"><summary>📄 Dinleme metnini göster</summary><div class="model-text">${esc(r.script)}</div></details>` : ''}
    <div class="btn-row">
      <button class="btn-primary" data-act="${kind === 'reading' ? 'rReset' : 'lReset'}">🔄 Yeni deneme</button>
      <button class="btn-ghost" data-act="examSub" data-s="results">📈 Sonuçlarım</button>
    </div>
  </div>`;
};

// ═══════════════════════════════════════════════════════════
// SONUÇLAR
// ═══════════════════════════════════════════════════════════
Exam.renderResults = function () {
  const rs = results().slice().reverse();
  if (!rs.length) {
    return `<div class="empty-state"><div class="empty-state-icon">📈</div>
      <div class="empty-state-text">Henüz deneme yok.<br>Bir bölüm seçip ilk denemeni yap.</div>
      <button class="btn-primary" style="margin-top:16px;max-width:220px" data-act="examSub" data-s="hub">Bölümlere git →</button></div>`;
  }

  const kinds = ['writing', 'speaking', 'reading', 'listening'];
  const kindLbl = { writing: '✍️ Writing', speaking: '🎙️ Speaking', reading: '📖 Reading', listening: '🎧 Listening' };
  const avgCards = kinds.map(k => {
    const f = rs.filter(r => r.kind === k);
    const a = f.length ? f.reduce((s, r) => s + Number(r.overall || 0), 0) / f.length : 0;
    return `<div class="stat-card"><div class="stat-card-icon">${kindLbl[k].split(' ')[0]}</div>
      <div class="stat-card-num" style="color:${a ? bandColor(a) : 'var(--dim)'}">${a ? a.toFixed(1) : '—'}</div>
      <div class="stat-card-lbl">${kindLbl[k].split(' ')[1]} (${f.length})</div></div>`;
  }).join('');

  const overallAvg = rs.reduce((s, r) => s + Number(r.overall || 0), 0) / rs.length;

  // Kriter zayıflık analizi (writing + speaking)
  const critAgg = {};
  rs.forEach(r => (r.criteria || []).forEach(c => {
    const k = String(c.key).replace(/\s*\(tahmini\)/, '');
    critAgg[k] = critAgg[k] || { s: 0, n: 0 };
    critAgg[k].s += Number(c.band); critAgg[k].n++;
  }));
  const critRows = Object.entries(critAgg).sort((a, b) => a[1].s / a[1].n - b[1].s / b[1].n).map(([k, v]) => {
    const a = v.s / v.n;
    return `<div class="crit-band"><div class="cb-head"><span>${esc(k)}</span><b style="color:${bandColor(a)}">${a.toFixed(1)}</b></div>
      <div class="cb-track"><div class="cb-fill" style="width:${(a / 9) * 100}%;background:${bandColor(a)}"></div></div></div>`;
  }).join('');

  // Trend çubukları (son 12)
  const last = rs.slice(0, 12).reverse();
  const trend = `<div class="trend-chart">${last.map(r => {
    const h = Math.max(6, (Number(r.overall) / 9) * 100);
    return `<div class="trend-col" title="${esc(r.section)} · ${Number(r.overall).toFixed(1)} · ${new Date(r.date).toLocaleDateString('tr-TR')}">
      <div class="trend-bar" style="height:${h}%;background:${bandColor(r.overall)}"></div>
      <span class="trend-lbl">${Number(r.overall).toFixed(1)}</span></div>`;
  }).join('')}</div>`;

  const list = rs.slice(0, 30).map(r => `<div class="res-row" data-act="examOpen" data-id="${r.id}">
    <span class="res-band" style="background:${bandColor(r.overall)}">${Number(r.overall).toFixed(1)}</span>
    <div class="res-mid">
      <div class="res-sec">${esc(r.section || r.kind)}</div>
      <div class="res-task">${esc(String(r.task || r.title || '').slice(0, 90))}</div>
    </div>
    <span class="res-date">${new Date(r.date).toLocaleDateString('tr-TR', { day: 'numeric', month: 'short' })}</span>
  </div>`).join('');

  return `<div class="results-wrap">
    <div class="band-hero" style="border-color:${bandColor(overallAvg)}">
      <div class="band-big" style="color:${bandColor(overallAvg)}">${overallAvg.toFixed(1)}</div>
      <div><div class="band-lbl">Genel ortalama</div><div class="band-sub">${rs.length} deneme · hedef ${esc(S.cfg.targetBand)}</div></div>
    </div>
    <div class="stat-cards">${avgCards}</div>
    <div class="panel"><div class="panel-title">📈 Son denemeler</div>${trend}</div>
    ${critRows ? `<div class="panel"><div class="panel-title">En zayıftan en güçlüye kriterlerin</div><div class="crit-grid">${critRows}</div></div>` : ''}
    <div class="panel"><div class="panel-title">Geçmiş</div><div class="res-list">${list}</div>
      <button class="btn-danger btn-xs" style="margin-top:12px" data-act="examClearResults">Geçmişi temizle</button></div>
  </div>`;
};

Object.assign(ACTIONS, {
  examOpen: (d) => {
    const r = results().find(x => String(x.id) === String(d.id));
    if (!r) return;
    if (r.kind === 'writing') { Exam.sub = 'writing'; Exam.wResult = r; }
    else if (r.kind === 'speaking') { Exam.sub = 'speaking'; Exam.sResult = r; }
    else if (r.kind === 'reading') { Exam.sub = 'reading'; Exam.rResult = r; Exam.rSet = { questions: [], glossary: r.glossary || [] }; }
    else { Exam.sub = 'listening'; Exam.lResult = r; Exam.lSet = { questions: [], glossary: r.glossary || [] }; }
    renderTab('exam');
  },
  examClearResults: () => {
    if (!confirm('Tüm sınav sonuçların silinsin mi?')) return;
    LS.set('eh_exam_results', []); renderTab('exam');
  },
});
