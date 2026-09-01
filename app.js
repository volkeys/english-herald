// ═══════════════════════════════════════════════════════════
// THE ENGLISH HERALD — ÇEKİRDEK
// Depolama · Durum · API (streaming) · Ses · Sekmeler · Dersler
// ═══════════════════════════════════════════════════════════
'use strict';

// ── DEPOLAMA ──────────────────────────────────────────────
const LS = {
  get: (k, def) => { try { const v = localStorage.getItem(k); return v === null ? def : JSON.parse(v); } catch { return def; } },
  set: (k, v) => { try { localStorage.setItem(k, JSON.stringify(v)); return true; } catch (e) { showToast('Depolama dolu — eski verileri temizle', 'error'); return false; } },
  del: (k) => { try { localStorage.removeItem(k); } catch {} },
  keys: () => { try { return Object.keys(localStorage).filter(k => k.startsWith('eh_')); } catch { return []; } },
};

function todayKey(d) { const x = d ? new Date(d) : new Date(); return `${x.getFullYear()}-${String(x.getMonth() + 1).padStart(2, '0')}-${String(x.getDate()).padStart(2, '0')}`; }
function dayKeyOffset(n) { const d = new Date(); d.setDate(d.getDate() + n); return todayKey(d); }

// ── DURUM ─────────────────────────────────────────────────
const S = {
  dark: LS.get('eh_dark', true),
  tab: 'lessons',
  // dersler
  topicK: 'tip', uIdx: 0, flipped: {},
  quiz: false, qIdx: 0, sel: null, score: 0, done: false, quizOrder: [], quizWrong: [],
  // hazne / tekrar
  bank: LS.get('eh_bank', []),
  bFil: 'all', bSrch: '', bSort: 'new',
  rIdx: 0, rFlip: false, rQueue: null,
  // ilerleme
  completed: LS.get('eh_completed', {}),
  xp: LS.get('eh_xp', 0),
  streak: LS.get('eh_streak', 0),
  bestStreak: LS.get('eh_bestStreak', 0),
  lastActive: LS.get('eh_lastActive', ''),
  activityLog: LS.get('eh_activity', {}),
  badges: LS.get('eh_badges', []),
  // günlük
  dailyLoading: false,
  // ayarlar
  cfg: Object.assign({
    apiKey: '', workspaceId: '', model: 'claude-haiku-4-5-20251001', voiceURI: '', rate: 0.85,
    autoSpeak: false, autoListen: false, dailyGoal: 5, level: 'B1',
    targetBand: '6.5', autoCorrect: true,
  }, LS.get('eh_cfg', {})),
  settingsTab: 'api',
};

// Eski sürümden ayar taşıma
(function migrate() {
  const oldKey = LS.get('eh_apikey', '');
  if (oldKey && !S.cfg.apiKey) { S.cfg.apiKey = oldKey; saveCfg(); }
  const oldGoal = LS.get('eh_goal', null);
  if (oldGoal && S.cfg.dailyGoal === 5) { S.cfg.dailyGoal = oldGoal; saveCfg(); }
})();

function saveCfg() { LS.set('eh_cfg', S.cfg); }
function saveBank() { LS.set('eh_bank', S.bank); }
function saveCompleted() { LS.set('eh_completed', S.completed); }

// ── SERİ (STREAK) ────────────────────────────────────────
(function updateStreak() {
  const today = todayKey(), last = S.lastActive;
  if (last === today) return;
  if (last === dayKeyOffset(-1)) S.streak++;
  else if (!last) S.streak = 1;
  else S.streak = 1;
  S.bestStreak = Math.max(S.bestStreak, S.streak);
  S.lastActive = today;
  LS.set('eh_streak', S.streak); LS.set('eh_bestStreak', S.bestStreak); LS.set('eh_lastActive', today);
})();

// ── GÜVENLİ RENDER ───────────────────────────────────────
function esc(s) {
  if (s === null || s === undefined) return '';
  return String(s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
}
function attr(s) { return esc(s); }

/** Basit ve güvenli markdown: önce kaçış, sonra biçimlendirme */
function md(text) {
  let t = esc(text);
  t = t.replace(/```([\s\S]*?)```/g, (_, c) => `<pre class="md-pre"><code>${c.trim()}</code></pre>`);
  t = t.replace(/`([^`\n]+)`/g, '<code class="md-code">$1</code>');
  t = t.replace(/^### (.+)$/gm, '<h4 class="md-h">$1</h4>');
  t = t.replace(/^## (.+)$/gm, '<h3 class="md-h">$1</h3>');
  t = t.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');
  t = t.replace(/(^|[\s(])\*([^*\n]+)\*/g, '$1<em>$2</em>');
  t = t.replace(/^\s*[-•*]\s+(.+)$/gm, '<li>$1</li>');
  t = t.replace(/^\s*(\d+)\.\s+(.+)$/gm, '<li>$2</li>');
  t = t.replace(/(<li>[\s\S]*?<\/li>)(?!\s*<li>)/g, '<ul class="md-ul">$1</ul>');
  t = t.replace(/\n{2,}/g, '<br><br>').replace(/\n/g, '<br>');
  t = t.replace(/<br>\s*(<(?:ul|h3|h4|pre))/g, '$1').replace(/(<\/(?:ul|h3|h4|pre)>)\s*<br>/g, '$1');
  // liste içindeki satır sonlarını temizle (aksi hâlde maddeler arası boşluk açılıyor)
  t = t.replace(/(<\/li>)(?:\s*<br>\s*)+(<li>)/g, '$1$2');
  t = t.replace(/(<ul[^>]*>)(?:\s*<br>\s*)+/g, '$1').replace(/(?:\s*<br>\s*)+(<\/ul>)/g, '$1');
  return t;
}

// ── TOAST ────────────────────────────────────────────────
let toastTimer = null;
function showToast(msg, type = 'info') {
  const t = document.getElementById('toast');
  if (!t) return;
  t.textContent = msg;
  t.className = 'toast ' + type;
  t.classList.remove('hidden');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => t.classList.add('hidden'), 3000);
}

// ── SESLENDİRME (TTS) ────────────────────────────────────
const TTS = {
  voices: [],
  load() {
    if (!window.speechSynthesis) return;
    this.voices = speechSynthesis.getVoices().filter(v => /^en/i.test(v.lang));
  },
  pick() {
    if (!this.voices.length) this.load();
    return this.voices.find(v => v.voiceURI === S.cfg.voiceURI)
      || this.voices.find(v => /Google US English|Samantha|Microsoft Aria/i.test(v.name))
      || this.voices[0] || null;
  },
  speak(text, opts = {}) {
    if (!window.speechSynthesis || !text) return null;
    speechSynthesis.cancel();
    const u = new SpeechSynthesisUtterance(String(text).replace(/[*_`#>✗✓→•]/g, ' ').replace(/\s+/g, ' ').trim());
    const v = this.pick();
    if (v) u.voice = v;
    u.lang = v?.lang || 'en-US';
    u.rate = opts.rate ?? S.cfg.rate ?? 0.85;
    u.pitch = 1;
    if (opts.onEnd) u.onend = opts.onEnd;
    if (opts.onStart) u.onstart = opts.onStart;
    speechSynthesis.speak(u);
    return u;
  },
  stop() { if (window.speechSynthesis) speechSynthesis.cancel(); },
};
if (window.speechSynthesis) {
  TTS.load();
  speechSynthesis.onvoiceschanged = () => { TTS.load(); if (S.tab === 'settings') {} };
}
function speak(t) { TTS.speak(t); }

// ── MİKROFON (STT) ───────────────────────────────────────
const SRClass = window.SpeechRecognition || window.webkitSpeechRecognition;
const Mic = {
  supported: !!SRClass,
  rec: null, listening: false, want: false,
  finalText: '', handlers: {},
  start(h = {}) {
    if (!this.supported) { showToast('Tarayıcın mikrofon tanımayı desteklemiyor (Chrome/Edge dene)', 'error'); return false; }
    this.stop();
    this.handlers = h; this.finalText = ''; this.want = true;
    const r = new SRClass();
    r.lang = h.lang || 'en-US';
    r.continuous = true;
    r.interimResults = true;
    r.maxAlternatives = 1;
    r.onstart = () => { this.listening = true; h.onStart?.(); };
    r.onresult = (e) => {
      let interim = '';
      for (let i = e.resultIndex; i < e.results.length; i++) {
        const tr = e.results[i][0].transcript;
        if (e.results[i].isFinal) this.finalText += tr + ' ';
        else interim += tr;
      }
      h.onResult?.(this.finalText.trim(), interim.trim());
    };
    r.onerror = (e) => {
      if (e.error === 'no-speech') return;
      this.want = false; this.listening = false;
      h.onError?.(e.error);
      if (e.error === 'not-allowed') showToast('Mikrofon izni reddedildi', 'error');
    };
    r.onend = () => {
      this.listening = false;
      if (this.want) { try { r.start(); this.listening = true; return; } catch {} }
      h.onEnd?.(this.finalText.trim());
    };
    this.rec = r;
    try { r.start(); } catch { return false; }
    return true;
  },
  stop() {
    this.want = false;
    if (this.rec) { try { this.rec.stop(); } catch {} }
    this.listening = false;
  },
};

// ── API ──────────────────────────────────────────────────
const API_URL = 'https://api.anthropic.com/v1/messages';

function apiHeaders() {
  return {
    'Content-Type': 'application/json',
    'x-api-key': S.cfg.apiKey,
    'anthropic-version': '2023-06-01',
    'anthropic-dangerous-direct-browser-access': 'true',
  ...(S.cfg.workspaceId ? { 'anthropic-workspace-id': S.cfg.workspaceId } : {}),
  };
}

function apiErrMsg(status, body) {
  if (/anthropic-workspace-id/i.test(body || '')) return 'Anahtarın bir workspace\'e bağlı değil. ⚙️ Ayarlar → API → "Workspace ID" alanını doldur (console.anthropic.com → Settings → Workspaces → ID sütunu), ya da workspace\'e özel yeni bir anahtar oluştur.';
  if (status === 401) return 'API anahtarı geçersiz. Ayarlar → API bölümünden kontrol et.';
  if (status === 429) return 'Çok fazla istek. Biraz bekleyip tekrar dene.';
  if (status === 400 && /credit|balance/i.test(body || '')) return 'API kredin bitmiş görünüyor. console.anthropic.com → Billing.';
  if (status === 529 || status === 503) return 'Sunucu yoğun. Birkaç saniye sonra tekrar dene.';
  return `Hata ${status}. ${String(body || '').slice(0, 160)}`;
}

async function callAPI(system, messages, opts = {}) {
  if (!S.cfg.apiKey) throw new Error('NO_API_KEY');
  const res = await fetch(API_URL, {
    method: 'POST', headers: apiHeaders(), signal: opts.signal,
    body: JSON.stringify({
      model: opts.model || S.cfg.model,
      max_tokens: opts.maxTokens || 1400,
      system, messages,
      ...(opts.temperature !== undefined ? { temperature: opts.temperature } : {}),
    }),
  });
  if (!res.ok) throw new Error(apiErrMsg(res.status, await res.text().catch(() => '')));
  const data = await res.json();
  return (data.content || []).filter(b => b.type === 'text').map(b => b.text).join('');
}

/** Streaming — onDelta(parça, tümü) her yeni metinde çağrılır */
async function callAPIStream(system, messages, opts = {}) {
  if (!S.cfg.apiKey) throw new Error('NO_API_KEY');
  const res = await fetch(API_URL, {
    method: 'POST', headers: apiHeaders(), signal: opts.signal,
    body: JSON.stringify({
      model: opts.model || S.cfg.model,
      max_tokens: opts.maxTokens || 1400,
      system, messages, stream: true,
    }),
  });
  if (!res.ok) throw new Error(apiErrMsg(res.status, await res.text().catch(() => '')));
  if (!res.body) return callAPI(system, messages, opts);

  const reader = res.body.getReader();
  const dec = new TextDecoder();
  let buf = '', full = '';
  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    buf += dec.decode(value, { stream: true });
    const lines = buf.split('\n');
    buf = lines.pop() || '';
    for (const line of lines) {
      if (!line.startsWith('data:')) continue;
      const payload = line.slice(5).trim();
      if (!payload || payload === '[DONE]') continue;
      let ev; try { ev = JSON.parse(payload); } catch { continue; }
      if (ev.type === 'content_block_delta' && ev.delta?.type === 'text_delta') {
        full += ev.delta.text;
        opts.onDelta?.(ev.delta.text, full);
      } else if (ev.type === 'error') {
        throw new Error(ev.error?.message || 'Stream hatası');
      }
    }
  }
  return full;
}

/** JSON bekleyen çağrılar için — kod bloklarını temizler, ilk { } bloğunu ayıklar */
function parseJSONLoose(raw) {
  let t = String(raw).trim().replace(/^```(?:json)?/i, '').replace(/```$/i, '').trim();
  try { return JSON.parse(t); } catch {}
  const s = t.indexOf('{'), e = t.lastIndexOf('}');
  if (s > -1 && e > s) { try { return JSON.parse(t.slice(s, e + 1)); } catch {} }
  const a = t.indexOf('['), b = t.lastIndexOf(']');
  if (a > -1 && b > a) { try { return JSON.parse(t.slice(a, b + 1)); } catch {} }
  throw new Error('AI yanıtı okunamadı. Tekrar dene.');
}

async function callJSON(system, messages, opts = {}) {
  const raw = await callAPI(system, messages, Object.assign({ maxTokens: 2200 }, opts));
  return parseJSONLoose(raw);
}

// ── XP / SEVİYE / ROZET ──────────────────────────────────
const LEVEL_TITLES = ['Çırak', 'Öğrenci', 'Okur', 'Muhabir', 'Editör', 'Köşe Yazarı', 'Genel Yayın Yönetmeni', 'Efsane'];
function getLevel() {
  const l = Math.floor(S.xp / 100) + 1;
  return { level: l, xpInLevel: S.xp % 100, xpNeeded: 100, title: LEVEL_TITLES[Math.min(LEVEL_TITLES.length - 1, Math.floor((l - 1) / 3))] };
}
function addXP(amount) {
  const before = getLevel().level;
  S.xp += amount; LS.set('eh_xp', S.xp);
  const t = todayKey();
  S.activityLog[t] = (S.activityLog[t] || 0) + amount;
  LS.set('eh_activity', S.activityLog);
  const after = getLevel().level;
  if (after > before) showToast(`🎉 Seviye ${after} — ${getLevel().title}!`, 'success');
  checkBadges();
  updateHeader();
}

const BADGES = [
  { id: 'first', icon: '🌱', name: 'İlk Adım', desc: 'İlk kelimeni kaydet', test: () => S.bank.length >= 1 },
  { id: 'w25', icon: '📗', name: 'Koleksiyoncu', desc: '25 kelime', test: () => S.bank.length >= 25 },
  { id: 'w100', icon: '📚', name: 'Kütüphane', desc: '100 kelime', test: () => S.bank.length >= 100 },
  { id: 's7', icon: '🔥', name: 'Bir Hafta', desc: '7 gün seri', test: () => S.streak >= 7 },
  { id: 's30', icon: '🌋', name: 'Bir Ay', desc: '30 gün seri', test: () => S.streak >= 30 },
  { id: 'q5', icon: '📝', name: 'Sınav Kurdu', desc: '5 ünite %70+', test: () => Object.values(S.completed).filter(p => p >= 70).length >= 5 },
  { id: 'qall', icon: '🏆', name: 'Tam Not', desc: 'Tüm üniteler %70+', test: () => { const tot = Object.values(CONTENT).reduce((s, t) => s + t.units.length, 0); return Object.values(S.completed).filter(p => p >= 70).length >= tot; } },
  { id: 'lv10', icon: '⚡', name: 'Seviye 10', desc: '1000 XP', test: () => S.xp >= 1000 },
  { id: 'ex1', icon: '🎓', name: 'İlk Sınav', desc: 'İlk IELTS denemeni tamamla', test: () => (LS.get('eh_exam_results', [])).length >= 1 },
  { id: 'ex10', icon: '🎯', name: 'Sınav Maratonu', desc: '10 IELTS denemesi', test: () => (LS.get('eh_exam_results', [])).length >= 10 },
  { id: 'band7', icon: '💎', name: 'Band 7', desc: 'Bir denemede 7.0+ al', test: () => (LS.get('eh_exam_results', [])).some(r => Number(r.overall) >= 7) },
  { id: 'talk', icon: '🎙️', name: 'Konuşkan', desc: 'Sesli sohbeti dene', test: () => LS.get('eh_voice_used', false) },
];
function checkBadges() {
  let gained = null;
  BADGES.forEach(b => {
    if (!S.badges.includes(b.id)) { try { if (b.test()) { S.badges.push(b.id); gained = b; } } catch {} }
  });
  if (gained) { LS.set('eh_badges', S.badges); showToast(`${gained.icon} Rozet kazandın: ${gained.name}!`, 'success'); }
}

// ── KELİME REGISTRY (XSS-güvenli aksiyonlar) ─────────────
const REG = { lesson: [], daily: [], chat: {}, exam: [] };
function regWord(src, i, mIdx) {
  if (src === 'chat') return (REG.chat[mIdx] || [])[i];
  return (REG[src] || [])[i];
}

function isSaved(en) { return S.bank.some(x => x.en === en); }
function getColor(k) { return COLORS[CONTENT[k]?.color] || COLORS.teal; }
function getTopic() { return CONTENT[S.topicK]; }
function getUnit() { return getTopic().units[S.uIdx]; }

function saveWordObj(w, cat) {
  if (!w || !w.en) return;
  const idx = S.bank.findIndex(x => x.en === w.en);
  if (idx > -1) {
    S.bank.splice(idx, 1); saveBank();
    showToast('Bankadan çıkarıldı', 'info');
  } else {
    S.bank.push({
      en: w.en, tr: w.tr || '', pron: w.pron || '', ex: w.ex || w.example || '', tip: w.tip || '',
      cat: cat || S.topicK, savedAt: Date.now(), srInterval: 1, srDue: Date.now(), srEase: 2.5, srReps: 0,
    });
    saveBank(); addXP(5);
    showToast('★ Haznene eklendi! +5 XP', 'success');
  }
  updateHeader();
  renderTab(S.tab);
}

function todaySavedCount() {
  return S.bank.filter(w => w.savedAt && todayKey(w.savedAt) === todayKey()).length;
}

// ── SPACED REPETITION (SM-2) ─────────────────────────────
function updateSR(word, quality) {
  const w = S.bank.find(x => x.en === word.en);
  if (!w) return;
  if (quality < 3) { w.srReps = 0; w.srInterval = 1; }
  else {
    if (!w.srReps) w.srInterval = 1;
    else if (w.srReps === 1) w.srInterval = 6;
    else w.srInterval = Math.round((w.srInterval || 1) * (w.srEase || 2.5));
    w.srReps = (w.srReps || 0) + 1;
    w.srEase = Math.max(1.3, (w.srEase || 2.5) + 0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02));
  }
  w.srDue = Date.now() + w.srInterval * 86400000;
  w.lastReview = Date.now();
  saveBank();
}
function getDueWords() { const now = Date.now(); return S.bank.filter(w => !w.srDue || w.srDue <= now); }

// ═══════════════════════════════════════════════════════════
// AKSİYON YÖNLENDİRİCİSİ (event delegation)
// ═══════════════════════════════════════════════════════════
const ACTIONS = {};
window.ACTIONS = ACTIONS;

document.addEventListener('click', (e) => {
  const el = e.target.closest('[data-act]');
  if (!el) return;
  const fn = ACTIONS[el.dataset.act];
  if (!fn) return;
  e.preventDefault();
  if (el.dataset.stop !== 'no') e.stopPropagation();
  fn(el.dataset, el, e);
});
document.addEventListener('input', (e) => {
  const el = e.target.closest('[data-inp]');
  if (!el) return;
  const fn = ACTIONS[el.dataset.inp];
  if (fn) fn(el.dataset, el, e);
});
document.addEventListener('change', (e) => {
  const el = e.target.closest('[data-chg]');
  if (!el) return;
  const fn = ACTIONS[el.dataset.chg];
  if (fn) fn(el.dataset, el, e);
});

Object.assign(ACTIONS, {
  switchTab: (d) => switchTab(d.tab),
  toggleTheme: () => toggleTheme(),
  openSettings: () => openSettings(),
  closeSettings: () => closeSettings(),
  saveSettings: () => saveSettings(),
  setSettingsTab: (d) => setSettingsTab(d.tab),
  toggleKeyVisibility: () => { const i = document.getElementById('apiKeyInput'); i.type = i.type === 'password' ? 'text' : 'password'; },
  testVoice: () => { applyVoiceInputs(); TTS.speak('Hello! This is how the English Herald will read words to you.'); },
  exportData: () => exportData(),
  exportCsv: () => exportCsv(),
  resetData: () => resetData(),
  speak: (d) => TTS.speak(d.text),
  saveWord: (d) => saveWordObj(regWord(d.src, +d.i, d.m), d.cat),
});

// ── TEMA ─────────────────────────────────────────────────
function toggleTheme() {
  S.dark = !S.dark; LS.set('eh_dark', S.dark);
  applyTheme();
}
function applyTheme() {
  document.getElementById('body').className = S.dark ? 'dark' : 'light';
  const b = document.getElementById('themeBtn'); if (b) b.textContent = S.dark ? '🌙' : '☀️';
  const m = document.querySelector('meta[name=theme-color]'); if (m) m.content = S.dark ? '#0d0f14' : '#f4f6fb';
}

// ── SEKMELER ─────────────────────────────────────────────
const TAB_IDS = ['lessons', 'daily', 'review', 'bank', 'exam', 'progress', 'chat'];
function switchTab(tabId) {
  if (!TAB_IDS.includes(tabId)) return;
  if (S.tab === 'chat' && tabId !== 'chat') window.Chat?.onLeave?.();
  S.tab = tabId;
  document.querySelectorAll('.tab-pane').forEach(p => p.classList.add('hidden'));
  document.querySelectorAll('.nav-btn').forEach(b => b.classList.toggle('active', b.dataset.tab === tabId));
  const pane = document.getElementById('tab' + tabId.charAt(0).toUpperCase() + tabId.slice(1));
  if (pane) pane.classList.remove('hidden');
  renderTab(tabId);
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

function renderTab(tabId) {
  const pane = document.getElementById('tab' + tabId.charAt(0).toUpperCase() + tabId.slice(1));
  if (!pane) return;
  if (tabId === 'lessons') pane.innerHTML = renderLessons();
  else if (tabId === 'daily') pane.innerHTML = renderDaily();
  else if (tabId === 'review') pane.innerHTML = renderReview();
  else if (tabId === 'bank') pane.innerHTML = renderBank();
  else if (tabId === 'exam') pane.innerHTML = window.Exam ? Exam.render() : '';
  else if (tabId === 'progress') pane.innerHTML = renderProgress();
  else if (tabId === 'chat') { pane.innerHTML = window.Chat ? Chat.render() : ''; window.Chat?.afterRender?.(); }
  if (tabId === 'exam') window.Exam?.afterRender?.();
}

// ── HEADER ───────────────────────────────────────────────
function pill(color, txt, sm) {
  const fs = sm ? '9px' : '10px', pd = sm ? '2px 6px' : '3px 10px';
  return `<span class="chip" style="background:${attr(color)};font-size:${fs};padding:${pd}">${esc(txt)}</span>`;
}

function updateHeader() {
  const saved = todaySavedCount();
  const goal = S.cfg.dailyGoal || 5;
  const pct = Math.min(100, Math.round((saved / goal) * 100));
  const fill = document.getElementById('goalFill');
  if (fill) { fill.style.width = pct + '%'; fill.style.background = pct >= 100 ? 'var(--green)' : 'var(--gold)'; }
  const lv = getLevel();
  const set = (id, v) => { const e = document.getElementById(id); if (e) e.textContent = v; };
  set('goalLabel', `${saved}/${goal}` + (pct >= 100 ? ' 🎉' : ''));
  set('xpLabel', S.xp + ' XP');
  set('levelLabel', `Sv.${lv.level} · ${lv.title}`);
  set('streakNum', S.streak);
  const totalWords = Object.values(CONTENT).reduce((s, t) => s + t.units.reduce((a, u) => a + u.vocab.length, 0), 0);
  set('siteSubtitle', `${totalWords}+ Kelime · İnsan & Veteriner Tıbbı · IELTS/TOEFL · Canlı AI Öğretmen`);
  const chips = document.getElementById('headerChips');
  if (chips) chips.innerHTML = [['var(--red)', 'İnsan Tıbbı'], ['var(--orange)', 'Veteriner'], ['var(--teal)', 'Haberler'], ['var(--blue)', 'IELTS']].map(([c, t]) => pill(c, t)).join('');
  const sb = document.getElementById('streakBadge');
  if (sb) sb.title = `Gün serisi: ${S.streak} · Rekor: ${S.bestStreak}`;
}

// ═══════════════════════════════════════════════════════════
// DERSLER
// ═══════════════════════════════════════════════════════════
function shuffled(arr) { const a = arr.slice(); for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1));[a[i], a[j]] = [a[j], a[i]]; } return a; }

function topicBar() {
  return TOPIC_ORDER.map(k => {
    const v = CONTENT[k], tc = getColor(k);
    const done = v.units.filter((_, i) => (S.completed[`${k}_${i}`] || 0) >= 70).length;
    const active = S.topicK === k;
    return `<button class="topic-btn ${active ? 'active' : ''}" style="${active ? `background:${tc};border-color:${tc}` : ''}" data-act="setTopic" data-k="${attr(k)}">
      <span>${v.icon}</span><span>${esc(v.label)}</span>${done ? `<span class="topic-done">✓${done}</span>` : ''}
    </button>`;
  }).join('');
}

function unitTabsHTML() {
  const topic = getTopic();
  if (topic.units.length < 2) return '';
  const lc = getColor(S.topicK);
  return `<div class="unit-tabs">${topic.units.map((u, i) => {
    const pct = S.completed[`${S.topicK}_${i}`];
    const active = S.uIdx === i;
    return `<button class="unit-tab ${active ? 'active' : ''}" style="${active ? `background:${lc}22;border-color:${lc};color:${lc}` : ''}" data-act="setUnit" data-i="${i}">
      <span>${i + 1}. ${esc(u.title)}</span>
      ${pct ? `<span class="pct-badge" style="background:${pct >= 70 ? 'var(--green)' : 'var(--gold)'}">${pct}%</span>` : ''}
    </button>`;
  }).join('')}</div>`;
}

function vocabCardHTML(w, i, src, cat) {
  const flipped = src === 'lesson' ? !!S.flipped[i] : true;
  const saved = isSaved(w.en);
  const lc = getColor(cat || S.topicK);
  return `<div class="vocab-card ${flipped ? 'flipped' : ''}" ${src === 'lesson' ? `data-act="toggleFlip" data-i="${i}"` : ''}
    style="${flipped ? `border-color:${lc};box-shadow:0 0 0 2px ${lc}33` : ''}">
    <div class="vocab-en">${esc(w.en)}</div>
    <div class="vocab-pron">${w.pron ? '/' + esc(w.pron) + '/' : ''}</div>
    <div class="vocab-tr">${esc(w.tr)}</div>
    ${flipped ? `<div class="vocab-extra">
      ${(w.ex || w.example) ? `<div class="vocab-ex">"${esc(w.ex || w.example)}"</div>` : ''}
      ${w.tip ? `<div class="vocab-tip" style="color:${lc};background:${lc}18">💡 ${esc(w.tip)}</div>` : ''}
    </div>` : ''}
    <div class="vocab-actions">
      <button class="vocab-speak-btn" data-act="speak" data-text="${attr(w.en)}" aria-label="Telaffuz">🔊</button>
      <button class="vocab-star-btn ${saved ? 'saved' : ''}" data-act="saveWord" data-src="${attr(src)}" data-i="${i}" data-cat="${attr(cat || S.topicK)}" aria-label="Kaydet">${saved ? '★' : '☆'}</button>
    </div>
  </div>`;
}

function renderLessons() {
  const topic = getTopic(), unit = getUnit(), lc = getColor(S.topicK);
  REG.lesson = unit.vocab;

  const newsBox = `<div class="news-box" style="border-left-color:${lc}">
    <div class="news-source" style="color:${lc}">${topic.icon} ${esc(topic.label)} — ${esc(unit.title)} ${pill('#555', unit.source, true)}</div>
    <div class="news-text">${esc(unit.headline)}</div>
    <button class="news-listen" data-act="speak" data-text="${attr(unit.headline)}">🔊 Manşeti dinle</button>
  </div>`;

  if (!S.quiz) {
    const cards = unit.vocab.map((w, i) => vocabCardHTML(w, i, 'lesson')).join('');
    const allSaved = unit.vocab.every(w => isSaved(w.en));
    return `<div class="fade-in">
      <div class="topic-bar">${topicBar()}</div>
      ${unitTabsHTML()}${newsBox}
      <div class="vocab-grid">${cards}</div>
      <p class="flip-hint">💡 Kartlara tıkla → örnek cümle & ipucu · 🔊 telaffuz · ★ hazneye ekle</p>
      <div class="lesson-footer">
        <button class="btn-ghost" data-act="saveAllUnit">${allSaved ? '✓ Hepsi haznede' : '★ Tüm üniteyi hazneye ekle'}</button>
        <button class="quiz-start-btn" style="background:${lc}" data-act="startQuiz">📝 Sınav →</button>
      </div>
    </div>`;
  }

  if (!S.done) {
    const q = getUnit().quiz[S.quizOrder[S.qIdx]];
    const opts = q.o.map((opt, oi) => {
      let cls = 'quiz-opt';
      if (S.sel !== null) { if (opt === q.a) cls += ' correct'; else if (opt === S.sel) cls += ' wrong'; }
      const prefix = S.sel !== null ? (opt === q.a ? '✓ ' : (opt === S.sel ? '✗ ' : '')) : '';
      return `<button class="${cls}" data-act="answerQuiz" data-o="${oi}">${prefix}${esc(opt)}</button>`;
    }).join('');
    return `<div class="fade-in">
      <div class="topic-bar">${topicBar()}</div>${unitTabsHTML()}
      <div class="quiz-box" style="border-color:${lc}">
        <div class="quiz-header">
          <span style="color:var(--muted)">Soru ${S.qIdx + 1}/${S.quizOrder.length}</span>
          <span class="quiz-score-live" style="color:${lc}">✓ ${S.score}</span>
        </div>
        <div class="quiz-progress-bar"><div class="quiz-progress-fill" style="width:${(S.qIdx / S.quizOrder.length) * 100}%;background:${lc}"></div></div>
        <div class="quiz-question">${esc(q.q)}</div>
        <div class="quiz-options">${opts}</div>
        <button class="quiz-back-btn" data-act="stopQuiz">← Derse Dön</button>
      </div>
    </div>`;
  }

  const total = S.quizOrder.length, finalScore = S.score;
  const emoji = finalScore === total ? '🏆' : finalScore >= Math.ceil(total / 2) ? '👍' : '📚';
  const msg = finalScore === total ? 'Mükemmel! Tüm soruları doğru yaptın. 🎉'
    : finalScore >= Math.ceil(total / 2) ? 'Güzel iş! Biraz daha pratikle mükemmel olacak.'
    : 'Kelimelere tekrar bak ve dene. Başarabilirsin!';
  const wrongList = S.quizWrong.length ? `<div class="quiz-wrong-box">
    <div class="qwb-title">Gözden geçir:</div>
    ${S.quizWrong.map(w => `<div class="qwb-row"><span>${esc(w.q)}</span><b style="color:var(--green)">${esc(w.a)}</b></div>`).join('')}
  </div>` : '';
  const nextBtn = S.uIdx < getTopic().units.length - 1 ? `<button class="btn-next" data-act="nextUnit">Sonraki Ünite →</button>` : '';
  return `<div class="fade-in">
    <div class="topic-bar">${topicBar()}</div>${unitTabsHTML()}
    <div class="quiz-done" style="border-color:${lc}">
      <div class="quiz-done-emoji">${emoji}</div>
      <div class="quiz-done-score">${finalScore}/${total} doğru</div>
      <div class="quiz-done-msg">${msg}</div>
      ${wrongList}
      <div class="quiz-done-btns">
        <button style="background:${lc};color:#fff;border:none;border-radius:8px;font-size:13px;font-weight:700;padding:11px 20px" data-act="startQuiz">🔄 Tekrar Dene</button>
        <button style="background:none;border:2px solid ${lc};color:${lc};border-radius:8px;font-size:13px;font-weight:700;padding:11px 20px" data-act="stopQuiz">← Derse Dön</button>
        ${nextBtn}
      </div>
    </div>
  </div>`;
}

Object.assign(ACTIONS, {
  setTopic: (d) => { S.topicK = d.k; S.uIdx = 0; S.quiz = false; S.done = false; S.flipped = {}; S.sel = null; renderTab('lessons'); },
  setUnit: (d) => { S.uIdx = +d.i; S.quiz = false; S.done = false; S.flipped = {}; S.sel = null; renderTab('lessons'); },
  toggleFlip: (d) => { S.flipped[+d.i] = !S.flipped[+d.i]; renderTab('lessons'); },
  startQuiz: () => { S.quiz = true; S.qIdx = 0; S.sel = null; S.score = 0; S.done = false; S.quizWrong = []; S.quizOrder = shuffled(getUnit().quiz.map((_, i) => i)); renderTab('lessons'); },
  stopQuiz: () => { S.quiz = false; S.done = false; S.flipped = {}; renderTab('lessons'); },
  nextUnit: () => { S.uIdx++; S.quiz = false; S.done = false; S.flipped = {}; renderTab('lessons'); },
  saveAllUnit: () => {
    const unit = getUnit(); let n = 0;
    unit.vocab.forEach(w => { if (!isSaved(w.en)) { S.bank.push({ ...w, cat: S.topicK, savedAt: Date.now(), srInterval: 1, srDue: Date.now(), srEase: 2.5, srReps: 0 }); n++; } });
    if (n) { saveBank(); addXP(n * 5); showToast(`${n} kelime eklendi! +${n * 5} XP`, 'success'); }
    else showToast('Bu ünitenin tüm kelimeleri zaten haznende', 'info');
    renderTab('lessons');
  },
  answerQuiz: (d) => {
    if (S.sel !== null) return;
    const unit = getUnit(), q = unit.quiz[S.quizOrder[S.qIdx]];
    const opt = q.o[+d.o];
    S.sel = opt;
    if (opt === q.a) S.score++; else S.quizWrong.push({ q: q.q, a: q.a });
    renderTab('lessons');
    setTimeout(() => {
      if (S.qIdx + 1 >= S.quizOrder.length) {
        const pct = Math.round((S.score / S.quizOrder.length) * 100);
        const key = `${S.topicK}_${S.uIdx}`;
        S.completed[key] = Math.max(S.completed[key] || 0, pct);
        saveCompleted(); addXP(pct >= 70 ? 20 : 10);
        S.done = true;
      } else { S.qIdx++; S.sel = null; }
      renderTab('lessons');
    }, 1200);
  },
});

// ═══════════════════════════════════════════════════════════
// GÜNLÜK İÇERİK
// ═══════════════════════════════════════════════════════════
function noApiNotice(what) {
  return `<div class="no-api-notice">
    <h3>🔑 API Anahtarı Gerekli</h3>
    <p>${esc(what)} için Anthropic API anahtarını ekle.<br><a href="https://console.anthropic.com/settings/keys" target="_blank" rel="noopener">console.anthropic.com</a> → API Keys</p>
    <button class="btn-primary" style="max-width:220px;margin:12px auto 0" data-act="openSettings">Anahtarı Ekle</button>
  </div>`;
}

function renderDaily() {
  const todayStr = new Date().toLocaleDateString('tr-TR', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
  const head = (btn) => `<div class="daily-header">
    <div><h2 class="pane-h2">📰 Günlük İçerik</h2><div class="daily-date">${esc(todayStr)}</div></div>${btn}</div>`;

  if (!S.cfg.apiKey) return `<div class="fade-in">${head('')}${noApiNotice('Günlük AI içeriği')}</div>`;

  const cached = LS.get('eh_daily_' + todayKey(), null);
  if (S.dailyLoading) {
    return `<div class="fade-in">${head('')}
      <div class="ai-loading"><div class="ai-loading-dots"><span></span><span></span><span></span></div><span>AI bugünkü gazeteyi hazırlıyor...</span></div></div>`;
  }
  if (cached) return renderDailyContent(cached, todayStr);

  return `<div class="fade-in">${head('<button class="daily-generate-btn" data-act="genDaily">✨ Bugünkü İçeriği Oluştur</button>')}
    <div class="daily-empty">
      <div style="font-size:48px;margin-bottom:14px">🗞️</div>
      <p>AI her gün senin için yeni bir haber, özet ve 6 yeni kelime üretir.<br>Kelimeler doğrudan haznene ve tekrar programına eklenebilir.</p>
    </div>
    <div class="daily-topic-row">
      ${['Tıp', 'Veteriner', 'Bilim & Teknoloji', 'Çevre', 'Sağlık Politikası', 'Küresel Haber'].map(t => `<button class="chat-topic-chip" data-act="genDaily" data-topic="${attr(t)}">${esc(t)}</button>`).join('')}
    </div>
  </div>`;
}

function renderDailyContent(c, todayStr) {
  REG.daily = c.words || [];
  const tc = /vet/i.test(c.topic || '') ? 'var(--orange)' : /tıp|medic|health/i.test(c.topic || '') ? 'var(--red)' : 'var(--teal)';
  const cards = (c.words || []).map((w, i) => vocabCardHTML(w, i, 'daily', mapCat(w.cat))).join('');
  const qz = (c.quiz || []).length ? `<div class="daily-quiz">
    <h3 class="pane-h3">Hızlı Kontrol</h3>
    ${c.quiz.map((q, i) => `<div class="dq-item">
      <div class="dq-q">${i + 1}. ${esc(q.q)}</div>
      <div class="dq-opts">${(q.o || []).map(o => `<button class="dq-opt" data-act="dailyAnswer" data-q="${i}" data-v="${attr(o)}">${esc(o)}</button>`).join('')}</div>
      <div class="dq-fb hidden" id="dqfb${i}"></div>
    </div>`).join('')}
  </div>` : '';

  return `<div class="fade-in">
    <div class="daily-header">
      <div><h2 class="pane-h2">📰 Günlük İçerik</h2><div class="daily-date">${esc(todayStr)}</div></div>
      <button class="daily-generate-btn" data-act="genDaily" data-force="1">🔄 Yenile</button>
    </div>
    <div class="daily-news-card" style="border-left-color:${tc}">
      <div class="daily-news-source">${esc(c.source || '')} — ${esc(c.topic || '')}</div>
      <div class="daily-news-headline">${esc(c.headline || '')}</div>
      <div class="daily-news-body">${esc(c.summary || '')}</div>
      ${c.tr_summary ? `<div class="daily-tr">🇹🇷 ${esc(c.tr_summary)}</div>` : ''}
      <button class="news-listen" data-act="speak" data-text="${attr((c.headline || '') + '. ' + (c.summary || ''))}">🔊 Haberi dinle</button>
    </div>
    <h3 class="pane-h3">Bugünkü Kelimeler</h3>
    <div class="vocab-grid">${cards}</div>
    ${qz}
  </div>`;
}

function mapCat(c) {
  const m = { medical: 'tip', veterinary: 'vet', news: 'haberler', grammar: 'gramer', business: 'is', ielts: 'ielts', idiom: 'idioms', daily: 'haberler' };
  return m[c] || (CONTENT[c] ? c : 'haberler');
}

Object.assign(ACTIONS, {
  genDaily: async (d) => {
    const key = todayKey();
    if (!d.force && LS.get('eh_daily_' + key, null)) { renderTab('daily'); return; }
    if (!S.cfg.apiKey) { openSettings(); return; }
    S.dailyLoading = true; renderTab('daily');
    try {
      const todayStr = new Date().toLocaleDateString('tr-TR', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
      const content = await callJSON(DAILY_SYSTEM_PROMPT, [{
        role: 'user',
        content: `Bugünün tarihi: ${todayStr}. Kullanıcı seviyesi: ${S.cfg.level}. ${d.topic ? `Konu: ${d.topic}.` : 'Konuyu sen seç (tıp/veteriner/bilim/çevre arasından).'} Bir haber, özet, 6 kelime ve 3 soruluk mini quiz üret. Sadece JSON döndür.`
      }], { maxTokens: 2000 });
      LS.set('eh_daily_' + key, content);
      addXP(10);
      showToast('Günlük gazeten hazır! +10 XP 🎉', 'success');
      pruneDailyCache();
    } catch (e) {
      showToast(e.message === 'NO_API_KEY' ? 'Önce API anahtarını ekle' : e.message, 'error');
      if (e.message === 'NO_API_KEY') openSettings();
    }
    S.dailyLoading = false; renderTab('daily');
  },
  dailyAnswer: (d, el) => {
    const c = LS.get('eh_daily_' + todayKey(), null); if (!c) return;
    const q = c.quiz[+d.q]; const fb = document.getElementById('dqfb' + d.q);
    const ok = d.v === q.a;
    el.parentElement.querySelectorAll('.dq-opt').forEach(b => { b.disabled = true; if (b.dataset.v === q.a) b.classList.add('correct'); else if (b === el) b.classList.add('wrong'); });
    if (fb) { fb.className = 'dq-fb ' + (ok ? 'ok' : 'no'); fb.textContent = ok ? '✓ Doğru!' : `✗ Doğrusu: ${q.a}` + (q.why ? ` — ${q.why}` : ''); }
    if (ok) addXP(2);
  },
});

function pruneDailyCache() {
  const keep = new Set([0, -1, -2, -3, -4, -5, -6].map(n => 'eh_daily_' + dayKeyOffset(n)));
  LS.keys().filter(k => k.startsWith('eh_daily_') && !keep.has(k)).forEach(LS.del);
}

// ═══════════════════════════════════════════════════════════
// TEKRAR
// ═══════════════════════════════════════════════════════════
function reviewQueue() {
  if (!S.rQueue) {
    const due = getDueWords();
    S.rQueue = (due.length ? due : S.bank).map(w => w.en);
  }
  return S.rQueue.map(en => S.bank.find(w => w.en === en)).filter(Boolean);
}

function renderReview() {
  if (!S.bank.length) {
    return `<div class="fade-in empty-state">
      <div class="empty-state-icon">📖</div>
      <div class="empty-state-text">Henüz kelime yok.<br>Derslerde ☆ ile kelimelerini hazneye ekle.</div>
      <button class="btn-primary" style="margin-top:16px;max-width:220px" data-act="switchTab" data-tab="lessons">Derslere Git →</button>
    </div>`;
  }
  const q = reviewQueue();
  if (!q.length) { S.rQueue = null; return renderReview(); }
  if (S.rIdx >= q.length) S.rIdx = 0;
  const w = q[S.rIdx];
  const due = getDueWords().length;
  const mastered = S.bank.filter(x => (x.srReps || 0) >= 3 && (x.srEase || 2.5) >= 2.4).length;
  const learning = S.bank.filter(x => (x.srReps || 0) > 0 && (x.srReps || 0) < 3).length;
  const pct = Math.round(((S.rIdx + 1) / q.length) * 100);

  const face = !S.rFlip ? `
    <div class="fc-label">İngilizce → Türkçe?</div>
    <div class="fc-word">${esc(w.en)}</div>
    <div class="fc-pron">${w.pron ? '/' + esc(w.pron) + '/' : ''}</div>
    <button class="fc-speak-btn" data-act="speak" data-text="${attr(w.en)}">🔊 Dinle</button>
    <div class="fc-flip-hint">Kartı çevir (veya <kbd>Space</kbd>)</div>` : `
    <div class="fc-label">Türkçe Karşılık</div>
    <div class="fc-answer">${esc(w.tr)}</div>
    ${w.ex ? `<div class="fc-ex">"${esc(w.ex)}"</div>` : ''}
    ${w.tip ? `<div class="fc-tip-box">💡 ${esc(w.tip)}</div>` : ''}
    <div class="fc-rating">
      <button style="background:var(--red);color:#fff" data-act="rateCard" data-q="1">😟 Zor <kbd>1</kbd></button>
      <button style="background:var(--gold);color:#fff" data-act="rateCard" data-q="3">🙂 Orta <kbd>2</kbd></button>
      <button style="background:var(--green);color:#fff" data-act="rateCard" data-q="5">😄 Kolay <kbd>3</kbd></button>
    </div>`;

  return `<div class="fade-in">
    <div class="section-head"><h2>🔁 Kelime Tekrarı</h2><span class="badge" style="background:var(--teal)">${due ? due + ' bekliyor' : 'Bugünlük tamam!'}</span></div>
    <div class="review-stats-row">
      <div class="review-stat"><div class="review-stat-num" style="color:var(--gold)">${due}</div><div class="review-stat-lbl">Tekrar Bekliyor</div></div>
      <div class="review-stat"><div class="review-stat-num" style="color:var(--green)">${mastered}</div><div class="review-stat-lbl">Öğrenildi</div></div>
      <div class="review-stat"><div class="review-stat-num" style="color:var(--red)">${learning}</div><div class="review-stat-lbl">Öğreniliyor</div></div>
      <div class="review-stat"><div class="review-stat-num" style="color:var(--teal)">${S.bank.length}</div><div class="review-stat-lbl">Toplam</div></div>
    </div>
    <div class="review-progress-row">
      <div class="review-bar-wrap"><div class="review-bar-fill" style="width:${pct}%"></div></div>
      <span class="rev-count">${S.rIdx + 1}/${q.length}</span>
      <button class="btn-ghost btn-xs" data-act="resetReview">↺ Baştan</button>
    </div>
    <div class="flashcard" data-act="flipCard" tabindex="0">${face}</div>
    ${!S.rFlip ? `<div class="fc-nav">
      <button class="btn-ghost" data-act="prevCard" ${S.rIdx === 0 ? 'disabled' : ''}>← Önceki</button>
      <button class="btn-primary" data-act="flipCard">Çevir</button>
      <button class="btn-ghost" data-act="nextCard" ${S.rIdx >= q.length - 1 ? 'disabled' : ''}>Sonraki →</button>
    </div>` : ''}
    <p class="flip-hint">Değerlendirmen tekrar aralığını belirler (SM-2). "Zor" dediklerin yarın, "Kolay" dediklerin haftalar sonra döner.</p>
  </div>`;
}

Object.assign(ACTIONS, {
  flipCard: () => { S.rFlip = !S.rFlip; renderTab('review'); },
  prevCard: () => { S.rIdx = Math.max(0, S.rIdx - 1); S.rFlip = false; renderTab('review'); },
  nextCard: () => { const q = reviewQueue(); S.rIdx = Math.min(q.length - 1, S.rIdx + 1); S.rFlip = false; renderTab('review'); },
  resetReview: () => { S.rQueue = null; S.rIdx = 0; S.rFlip = false; renderTab('review'); },
  rateCard: (d) => {
    const q = reviewQueue(), w = q[S.rIdx];
    if (w) { updateSR(w, +d.q); addXP(+d.q >= 3 ? 3 : 1); }
    if (S.rIdx >= q.length - 1) { S.rQueue = null; S.rIdx = 0; S.rFlip = false; showToast('Tur tamamlandı! 🎉', 'success'); }
    else { S.rIdx++; S.rFlip = false; }
    renderTab('review');
  },
});

// ═══════════════════════════════════════════════════════════
// KELİME HAZNESİ
// ═══════════════════════════════════════════════════════════
const CAT_LABELS = { all: 'Tümü', tip: '🏥 Tıp', vet: '🐾 Vet', haberler: '📰 Haber', idioms: '🗣️ Deyim', ielts: '🎓 IELTS', gramer: '✏️ Gramer', is: '💼 İş' };

function bankFiltered() {
  const s = S.bSrch.toLowerCase();
  let list = S.bank.filter(w => {
    const fc = S.bFil === 'all' || w.cat === S.bFil || (S.bFil === 'due' && (!w.srDue || w.srDue <= Date.now()));
    const fs = !s || w.en.toLowerCase().includes(s) || (w.tr || '').toLowerCase().includes(s);
    return fc && fs;
  });
  if (S.bSort === 'az') list.sort((a, b) => a.en.localeCompare(b.en));
  else if (S.bSort === 'due') list.sort((a, b) => (a.srDue || 0) - (b.srDue || 0));
  else list.sort((a, b) => (b.savedAt || 0) - (a.savedAt || 0));
  return list;
}

function bankGridHTML() {
  const list = bankFiltered();
  if (!list.length) return `<div class="empty-state"><div class="empty-state-icon">🔍</div><div class="empty-state-text">Kelime bulunamadı.</div></div>`;
  return `<div class="bank-grid">${list.map(w => {
    const tc = getColor(w.cat);
    const dueNow = !w.srDue || w.srDue <= Date.now();
    const days = w.srDue ? Math.ceil((w.srDue - Date.now()) / 86400000) : 0;
    return `<div class="bank-card">
      ${pill(tc, CONTENT[w.cat]?.label || w.cat, true)}
      <div class="bank-card-en">${esc(w.en)}
        <span class="sr-badge" style="background:${dueNow ? 'var(--red)' : 'var(--green)'}">${dueNow ? 'Tekrar!' : days + 'g'}</span>
        <button class="bank-card-speak" data-act="speak" data-text="${attr(w.en)}">🔊</button>
      </div>
      <div class="bank-card-pron">${w.pron ? '/' + esc(w.pron) + '/' : ''}</div>
      <div class="bank-card-tr">${esc(w.tr)}</div>
      ${w.ex ? `<div class="bank-card-ex">"${esc(w.ex)}"</div>` : ''}
      <button class="bank-card-del" data-act="deleteWord" data-en="${attr(w.en)}" aria-label="Sil">✕</button>
    </div>`;
  }).join('')}</div>`;
}

function renderBank() {
  const counts = ['tip', 'vet', 'haberler', 'idioms', 'ielts', 'gramer', 'is'].map(c => [CAT_LABELS[c], S.bank.filter(w => w.cat === c).length, getColor(c)]);
  const stats = [['Toplam', S.bank.length, 'var(--gold)'], ...counts]
    .map(([l, n, c]) => `<div class="bank-stat-item"><span class="bank-stat-num" style="color:${c}">${n}</span><span class="bank-stat-lbl">${esc(l)}</span></div>`).join('');
  const filters = ['all', 'due', 'tip', 'vet', 'haberler', 'idioms', 'ielts', 'gramer', 'is']
    .map(f => `<button class="filter-chip ${S.bFil === f ? 'active' : ''}" data-act="setBFil" data-f="${f}">${f === 'due' ? '⏰ Bekleyen' : CAT_LABELS[f]}</button>`).join('');

  return `<div class="fade-in">
    <div class="section-head">
      <h2>📚 Kelime Haznem</h2>
      <span class="badge" style="background:var(--teal)">${S.bank.length} kelime</span>
      ${S.bank.length ? `<button class="btn-primary btn-xs" style="margin-left:auto" data-act="switchTab" data-tab="review">🔁 Tekrar Et</button>` : ''}
    </div>
    <div class="bank-stats-row">${stats}</div>
    <div class="filter-row">
      <input class="search-input" id="bankSearch" placeholder="Kelime ara..." value="${attr(S.bSrch)}" data-inp="setBSrch" autocomplete="off">
      <select class="fld-select fld-inline" data-chg="setBSort">
        <option value="new"${S.bSort === 'new' ? ' selected' : ''}>Yeniden eskiye</option>
        <option value="az"${S.bSort === 'az' ? ' selected' : ''}>A → Z</option>
        <option value="due"${S.bSort === 'due' ? ' selected' : ''}>Tekrar sırası</option>
      </select>
    </div>
    <div class="filter-row">${filters}</div>
    <div id="bankGrid">${bankGridHTML()}</div>
  </div>`;
}

Object.assign(ACTIONS, {
  setBFil: (d) => { S.bFil = d.f; renderTab('bank'); },
  setBSort: (d, el) => { S.bSort = el.value; document.getElementById('bankGrid').innerHTML = bankGridHTML(); },
  setBSrch: (d, el) => { S.bSrch = el.value; const g = document.getElementById('bankGrid'); if (g) g.innerHTML = bankGridHTML(); },
  deleteWord: (d) => { S.bank = S.bank.filter(w => w.en !== d.en); saveBank(); S.rQueue = null; renderTab('bank'); showToast('Kelime silindi', 'info'); updateHeader(); },
});

// ═══════════════════════════════════════════════════════════
// İLERLEME
// ═══════════════════════════════════════════════════════════
function renderProgress() {
  const totalUnits = Object.values(CONTENT).reduce((s, t) => s + t.units.length, 0);
  const totalWords = Object.values(CONTENT).reduce((s, t) => s + t.units.reduce((a, u) => a + u.vocab.length, 0), 0);
  const completedCount = Object.values(S.completed).filter(p => p >= 70).length;
  const lv = getLevel();
  const results = LS.get('eh_exam_results', []);
  const lastBand = results.length ? results[results.length - 1].overall : null;

  const cells = Array.from({ length: 91 }, (_, i) => {
    const k = dayKeyOffset(-(90 - i));
    const xp = S.activityLog[k] || 0;
    const lvl = xp >= 60 ? 4 : xp >= 30 ? 3 : xp >= 10 ? 2 : xp > 0 ? 1 : 0;
    return `<div class="heatmap-cell level-${lvl}" title="${k}: ${xp} XP"></div>`;
  }).join('');

  const statCards = [
    { icon: '📚', label: 'Ders Kelimesi', val: totalWords, c: 'var(--teal)' },
    { icon: '✅', label: 'Tamamlanan Ünite', val: `${completedCount}/${totalUnits}`, c: 'var(--green)' },
    { icon: '⭐', label: 'Haznem', val: S.bank.length, c: 'var(--gold)' },
    { icon: '🔥', label: 'Gün Serisi', val: `${S.streak} (rek. ${S.bestStreak})`, c: 'var(--orange)' },
    { icon: '⚡', label: 'Toplam XP', val: S.xp, c: 'var(--purple)' },
    { icon: '🎓', label: 'Son Band', val: lastBand ? Number(lastBand).toFixed(1) : '—', c: 'var(--blue)' },
  ].map(s => `<div class="stat-card"><div class="stat-card-icon">${s.icon}</div><div class="stat-card-num" style="color:${s.c}">${esc(s.val)}</div><div class="stat-card-lbl">${s.label}</div></div>`).join('');

  const topicRows = TOPIC_ORDER.map(k => {
    const v = CONTENT[k], tc = getColor(k);
    const done = v.units.filter((_, i) => (S.completed[`${k}_${i}`] || 0) >= 70).length;
    const pct = Math.round((done / v.units.length) * 100);
    return `<div class="prog-topic-row">
      <div class="prog-topic-header"><span>${v.icon} ${esc(v.label)}</span><span style="font-size:12px;color:${tc};font-weight:700">${done}/${v.units.length}</span></div>
      <div class="prog-bar-track"><div class="prog-bar-fill" style="width:${pct}%;background:${tc}"></div></div>
    </div>`;
  }).join('');

  const badgeGrid = BADGES.map(b => {
    const has = S.badges.includes(b.id);
    return `<div class="badge-item ${has ? 'has' : ''}" title="${attr(b.desc)}">
      <div class="badge-ico">${has ? b.icon : '🔒'}</div><div class="badge-name">${esc(b.name)}</div>
    </div>`;
  }).join('');

  const goalChips = [3, 5, 10, 15, 20].map(n => `<button class="goal-chip ${S.cfg.dailyGoal === n ? 'active' : ''}" data-act="setGoal" data-n="${n}">${n}</button>`).join('');
  const saved = todaySavedCount(), goalPct = Math.min(100, Math.round((saved / S.cfg.dailyGoal) * 100));

  return `<div class="fade-in">
    <div class="section-head"><h2>📊 İlerleme & Hedefler</h2></div>
    <div class="stat-cards">${statCards}</div>

    <div class="panel">
      <div class="panel-title">Seviye ${lv.level} — ${esc(lv.title)} · ${lv.xpInLevel}/100 XP</div>
      <div class="thin-track"><div class="thin-fill" style="width:${lv.xpInLevel}%;background:var(--purple)"></div></div>
      <div class="panel-hint">Kelime +5 · Quiz +10-20 · Günlük içerik +10 · Tekrar +1-3 · Sohbet +2 · Sınav +25-40 XP</div>
    </div>

    <div class="panel">
      <div class="panel-title">🎯 Günlük Hedef</div>
      <div class="goal-set-row">${goalChips}</div>
      <div class="thin-track"><div class="thin-fill" style="width:${goalPct}%;background:${goalPct >= 100 ? 'var(--green)' : 'var(--gold)'}"></div></div>
      <div class="panel-hint">${saved}/${S.cfg.dailyGoal} kelime ${goalPct >= 100 ? '— Hedefe ulaştın! 🎉' : ''}</div>
    </div>

    <div class="panel">
      <div class="panel-title">📅 Aktivite (Son 90 Gün)</div>
      <div class="heatmap-grid heatmap-90">${cells}</div>
      <div class="heatmap-legend"><span>Az</span><i class="level-1"></i><i class="level-2"></i><i class="level-3"></i><i class="level-4"></i><span>Çok</span></div>
    </div>

    <div class="panel">
      <div class="panel-title">🏅 Rozetler (${S.badges.length}/${BADGES.length})</div>
      <div class="badge-grid">${badgeGrid}</div>
    </div>

    <div class="panel-title" style="margin:20px 0 12px">Konu Bazlı İlerleme</div>
    ${topicRows}

    <div class="ai-suggestions">
      <div class="panel-title">💬 AI Öğretmene sorabileceklerin</div>
      <div class="sugg-list">
        ${['Veteriner tıbbında zoonoz hastalıkları anlat, örnek cümlelerle',
           'Tıp İngilizcesinde 5 yeni terim ver, Latince köklerini açıkla',
           "IELTS Writing Task 2'de 'yapay zeka' konusunda ileri kelimeler öğret",
           'Bugün öğrendiğim kelimelerle kısa bir hikâye yaz',
           'Bir doktor–hasta rol yapma senaryosu başlat']
          .map(q => `<button class="sugg-btn" data-act="askTeacher" data-q="${attr(q)}">▸ ${esc(q)}</button>`).join('')}
      </div>
    </div>
  </div>`;
}

Object.assign(ACTIONS, {
  setGoal: (d) => { S.cfg.dailyGoal = +d.n; saveCfg(); renderTab('progress'); updateHeader(); },
  askTeacher: (d) => { switchTab('chat'); setTimeout(() => window.Chat?.send(d.q), 120); },
});

// ═══════════════════════════════════════════════════════════
// AYARLAR
// ═══════════════════════════════════════════════════════════
function openSettings() {
  const m = document.getElementById('settingsModal');
  document.getElementById('apiKeyInput').value = S.cfg.apiKey || '';
  document.getElementById('workspaceInput').value = S.cfg.workspaceId || '';
  document.getElementById('modelSelect').value = S.cfg.model;
  document.getElementById('levelSelect').value = S.cfg.level;
  document.getElementById('targetBandInput').value = S.cfg.targetBand;
  document.getElementById('autoSpeakChk').checked = !!S.cfg.autoSpeak;
  document.getElementById('autoListenChk').checked = !!S.cfg.autoListen;
  document.getElementById('correctChk').checked = !!S.cfg.autoCorrect;
  document.getElementById('rateRange').value = S.cfg.rate;
  document.getElementById('rateVal').textContent = Number(S.cfg.rate).toFixed(2);
  fillVoiceSelect();
  document.getElementById('micSupportNote').innerHTML = Mic.supported
    ? '🎙️ Mikrofon tanıma destekleniyor. Sesli sohbet ve Speaking pratiği kullanılabilir.'
    : '⚠️ Bu tarayıcı konuşma tanımayı desteklemiyor. Sesli özellikler için Chrome veya Edge kullan.';
  document.getElementById('goalChipsSettings').innerHTML = [3, 5, 10, 15, 20].map(n =>
    `<button class="goal-chip ${S.cfg.dailyGoal === n ? 'active' : ''}" data-act="setGoal2" data-n="${n}">${n} kelime</button>`).join('');
  renderDataStats();
  m.classList.remove('hidden');
}
function closeSettings() { document.getElementById('settingsModal').classList.add('hidden'); }
function setSettingsTab(t) {
  S.settingsTab = t;
  document.querySelectorAll('.settings-tab').forEach(b => b.classList.toggle('active', b.dataset.tab === t));
  ['api', 'voice', 'study', 'data'].forEach(k => {
    document.getElementById('setPane' + k.charAt(0).toUpperCase() + k.slice(1)).classList.toggle('hidden', k !== t);
  });
}
function fillVoiceSelect() {
  TTS.load();
  const sel = document.getElementById('voiceSelect');
  if (!sel) return;
  sel.innerHTML = TTS.voices.length
    ? TTS.voices.map(v => `<option value="${attr(v.voiceURI)}"${v.voiceURI === S.cfg.voiceURI ? ' selected' : ''}>${esc(v.name)} (${esc(v.lang)})</option>`).join('')
    : '<option value="">Sistem varsayılanı</option>';
}
function applyVoiceInputs() {
  const v = document.getElementById('voiceSelect'); if (v) S.cfg.voiceURI = v.value;
  const r = document.getElementById('rateRange'); if (r) S.cfg.rate = parseFloat(r.value);
}
function saveSettings() {
  const key = document.getElementById('apiKeyInput').value.trim();
  if (key && !key.startsWith('sk-')) { showToast('API anahtarı "sk-" ile başlamalı', 'error'); return; }
  S.cfg.apiKey = key;
  S.cfg.workspaceId = document.getElementById('workspaceInput').value.trim();
  S.cfg.model = document.getElementById('modelSelect').value;
  S.cfg.level = document.getElementById('levelSelect').value;
  S.cfg.targetBand = document.getElementById('targetBandInput').value;
  S.cfg.autoSpeak = document.getElementById('autoSpeakChk').checked;
  S.cfg.autoListen = document.getElementById('autoListenChk').checked;
  S.cfg.autoCorrect = document.getElementById('correctChk').checked;
  applyVoiceInputs();
  saveCfg();
  closeSettings();
  showToast('Ayarlar kaydedildi ✓', 'success');
  renderTab(S.tab);
  updateHeader();
}
Object.assign(ACTIONS, { setGoal2: (d) => { S.cfg.dailyGoal = +d.n; saveCfg(); openSettings(); updateHeader(); } });

function renderDataStats() {
  const bytes = LS.keys().reduce((s, k) => s + (localStorage.getItem(k) || '').length, 0);
  const results = LS.get('eh_exam_results', []);
  document.getElementById('dataStats').innerHTML = `
    <div class="ds-row"><span>Kelime haznesi</span><b>${S.bank.length}</b></div>
    <div class="ds-row"><span>Sınav denemesi</span><b>${results.length}</b></div>
    <div class="ds-row"><span>Toplam XP</span><b>${S.xp}</b></div>
    <div class="ds-row"><span>Kayıt boyutu</span><b>${(bytes / 1024).toFixed(1)} KB</b></div>`;
}

function download(name, content, type) {
  const blob = new Blob([content], { type: type || 'application/json' });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob); a.download = name;
  document.body.appendChild(a); a.click();
  setTimeout(() => { URL.revokeObjectURL(a.href); a.remove(); }, 1000);
}

function exportData() {
  const dump = {};
  LS.keys().forEach(k => { if (k !== 'eh_cfg') dump[k] = LS.get(k, null); });
  const cfg = { ...S.cfg }; delete cfg.apiKey;   // anahtarı yedeğe koyma
  dump.eh_cfg = cfg;
  dump._exportedAt = new Date().toISOString();
  download(`english-herald-yedek-${todayKey()}.json`, JSON.stringify(dump, null, 2));
  showToast('Yedek indirildi (API anahtarı dahil edilmedi)', 'success');
}

function exportCsv() {
  const rows = [['English', 'Türkçe', 'Telaffuz', 'Örnek', 'Kategori', 'Tekrar tarihi']];
  S.bank.forEach(w => rows.push([w.en, w.tr, w.pron || '', w.ex || '', w.cat || '', w.srDue ? todayKey(w.srDue) : '']));
  const csv = '﻿' + rows.map(r => r.map(c => `"${String(c).replace(/"/g, '""')}"`).join(',')).join('\n');
  download(`kelime-haznem-${todayKey()}.csv`, csv, 'text/csv;charset=utf-8');
}

document.addEventListener('change', (e) => {
  if (e.target.id !== 'importFile') return;
  const f = e.target.files[0]; if (!f) return;
  const r = new FileReader();
  r.onload = () => {
    try {
      const d = JSON.parse(r.result);
      if (!d.eh_bank && !d.eh_xp) throw new Error('bad');
      Object.keys(d).forEach(k => { if (k.startsWith('eh_')) LS.set(k, d[k]); });
      showToast('Yedek yüklendi, sayfa yenileniyor...', 'success');
      setTimeout(() => location.reload(), 900);
    } catch { showToast('Dosya okunamadı — geçerli bir yedek mi?', 'error'); }
  };
  r.readAsText(f);
});

function resetData() {
  if (!confirm('TÜM verilerin silinecek (kelimeler, XP, sınav sonuçları). Emin misin?')) return;
  if (!confirm('Son onay: geri alınamaz. Silinsin mi?')) return;
  LS.keys().forEach(LS.del);
  location.reload();
}

// ── KLAVYE ───────────────────────────────────────────────
document.addEventListener('keydown', (e) => {
  const typing = /INPUT|TEXTAREA|SELECT/.test(e.target.tagName) || e.target.isContentEditable;
  if (e.key === 'Escape') { closeSettings(); TTS.stop(); Mic.stop(); return; }
  if (typing || e.ctrlKey || e.metaKey || e.altKey) return;
  if (e.key >= '1' && e.key <= '7' && S.tab !== 'review') { switchTab(TAB_IDS[+e.key - 1]); return; }
  if (S.tab === 'review') {
    if (e.key === ' ') { e.preventDefault(); ACTIONS.flipCard(); }
    else if (S.rFlip && ['1', '2', '3'].includes(e.key)) ACTIONS.rateCard({ q: { '1': 1, '2': 3, '3': 5 }[e.key] });
    else if (e.key === 'ArrowRight') ACTIONS.nextCard();
    else if (e.key === 'ArrowLeft') ACTIONS.prevCard();
  }
});

// ── BAŞLATMA ─────────────────────────────────────────────
window.addEventListener('DOMContentLoaded', () => {
  applyTheme();
  updateHeader();
  checkBadges();
  pruneDailyCache();
  renderTab('lessons');
  document.getElementById('rateRange')?.addEventListener('input', (e) => {
    S.cfg.rate = parseFloat(e.target.value);
    document.getElementById('rateVal').textContent = S.cfg.rate.toFixed(2);
  });
  if (!S.cfg.apiKey) setTimeout(openSettings, 700);
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('sw.js').catch(() => {});
  }
});
