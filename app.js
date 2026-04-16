// ═══════════════════════════════════════════════════════════
// THE ENGLISH HERALD — ANA UYGULAMA MANTIĞI
// ═══════════════════════════════════════════════════════════

// ── STORAGE ──────────────────────────────────────────────
const LS = {
  get: (k, def) => { try { const v = localStorage.getItem(k); return v ? JSON.parse(v) : def; } catch { return def; } },
  set: (k, v) => { try { localStorage.setItem(k, JSON.stringify(v)); } catch {} },
};

// ── STATE ─────────────────────────────────────────────────
const S = {
  dark: LS.get('eh_dark', true),
  tab: 'lessons',
  topicK: 'vet',
  uIdx: 0,
  flipped: {},
  quiz: false, qIdx: 0, sel: null, score: 0, done: false,
  bank: LS.get('eh_bank', []),
  bFil: 'all', bSrch: '',
  rIdx: 0, rFlip: false,
  completed: LS.get('eh_completed', {}),
  dailyGoal: LS.get('eh_goal', 5),
  xp: LS.get('eh_xp', 0),
  streak: LS.get('eh_streak', 0),
  lastActive: LS.get('eh_lastActive', ''),
  activityLog: LS.get('eh_activity', {}),
  todaySaved: 0,
  chatHistory: [],
  chatTopic: 'tip',
  dailyContent: LS.get('eh_daily_' + todayKey(), null),
  dailyLoading: false,
  apiKey: LS.get('eh_apikey', ''),
};

function todayKey() {
  return new Date().toISOString().split('T')[0];
}

// Streak güncelle
(function updateStreak() {
  const today = todayKey();
  const last = S.lastActive;
  if (last !== today) {
    const yesterday = new Date(); yesterday.setDate(yesterday.getDate() - 1);
    const yKey = yesterday.toISOString().split('T')[0];
    if (last === yKey) { S.streak++; }
    else if (last !== today) { S.streak = 1; }
    S.lastActive = today;
    LS.set('eh_streak', S.streak);
    LS.set('eh_lastActive', today);
  }
})();

// ── YARDIMCI ─────────────────────────────────────────────
function getColor(k) { return COLORS[CONTENT[k]?.color] || COLORS.red; }
function getTopic() { return CONTENT[S.topicK]; }
function getUnit() { return getTopic().units[S.uIdx]; }
function isSaved(en) { return S.bank.some(x => x.en === en); }

function saveBank() { LS.set('eh_bank', S.bank); }
function saveCompleted() { LS.set('eh_completed', S.completed); }

function addXP(amount) {
  S.xp += amount;
  LS.set('eh_xp', S.xp);
  const today = todayKey();
  S.activityLog[today] = (S.activityLog[today] || 0) + amount;
  LS.set('eh_activity', S.activityLog);
}

function getLevel() {
  const l = Math.floor(S.xp / 100) + 1;
  return { level: l, xpInLevel: S.xp % 100, xpNeeded: 100 };
}

function todaySavedCount() {
  return S.bank.filter(w => {
    if (!w.savedAt) return false;
    const d = new Date(w.savedAt).toISOString().split('T')[0];
    return d === todayKey();
  }).length;
}

function speak(text) {
  if (!window.speechSynthesis) return;
  window.speechSynthesis.cancel();
  const u = new SpeechSynthesisUtterance(text.replace(/[✗✓→]/g, '').trim());
  u.lang = 'en-US'; u.rate = 0.82; u.pitch = 1;
  window.speechSynthesis.speak(u);
}

function showToast(msg, type = 'info') {
  const t = document.getElementById('toast');
  t.textContent = msg;
  t.className = 'toast ' + type;
  t.classList.remove('hidden');
  setTimeout(() => t.classList.add('hidden'), 2800);
}

function pill(color, txt, sm) {
  const fs = sm ? '9px' : '10px';
  const pd = sm ? '2px 6px' : '3px 10px';
  return `<span class="chip" style="background:${color};font-size:${fs};padding:${pd}">${txt}</span>`;
}

// ── KELIME KAYDET ─────────────────────────────────────────
function saveWord(w, cat) {
  const idx = S.bank.findIndex(x => x.en === w.en);
  if (idx > -1) {
    S.bank.splice(idx, 1);
    saveBank();
    showToast('Bankadan çıkarıldı', 'info');
  } else {
    S.bank.push({ ...w, cat: cat || S.topicK, savedAt: Date.now(), srInterval: 1, srDue: Date.now(), srEase: 2.5, srReps: 0 });
    saveBank();
    addXP(5);
    showToast('★ Bankana eklendi! +5 XP', 'success');
  }
  S.todaySaved = todaySavedCount();
  updateHeader();
}

// ── SPACED REPETITION ────────────────────────────────────
function updateSR(word, quality) {
  // SM-2 algoritması: quality 0-5
  const w = S.bank.find(x => x.en === word.en);
  if (!w) return;
  if (quality < 3) {
    w.srReps = 0; w.srInterval = 1;
  } else {
    if (w.srReps === 0) w.srInterval = 1;
    else if (w.srReps === 1) w.srInterval = 6;
    else w.srInterval = Math.round(w.srInterval * w.srEase);
    w.srReps++;
    w.srEase = Math.max(1.3, w.srEase + 0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02));
  }
  w.srDue = Date.now() + w.srInterval * 86400000;
  saveBank();
}

function getDueWords() {
  const now = Date.now();
  return S.bank.filter(w => !w.srDue || w.srDue <= now);
}

// ── API ───────────────────────────────────────────────────
async function callAPI(system, messages, maxTokens = 1200) {
  if (!S.apiKey) throw new Error('NO_API_KEY');
  const res = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'x-api-key': S.apiKey, 'anthropic-version': '2023-06-01', 'anthropic-dangerous-direct-browser-access': 'true' },
    body: JSON.stringify({ model: 'claude-haiku-4-5-20251001', max_tokens: maxTokens, system, messages })
  });
  if (!res.ok) throw new Error('API_ERROR_' + res.status);
  const data = await res.json();
  return data.content?.[0]?.text || '';
}

function parseVocab(text) {
  const m = text.match(/###VOCAB###([\s\S]*?)###END###/);
  if (!m) return { clean: text, vocab: [] };
  try { return { clean: text.replace(/###VOCAB###[\s\S]*?###END###/, '').trim(), vocab: JSON.parse(m[1].trim()) }; }
  catch { return { clean: text, vocab: [] }; }
}

// ── API KEY MODAL ─────────────────────────────────────────
function showApiModal() {
  document.getElementById('apiKeyInput').value = S.apiKey || '';
  document.getElementById('apiModal').classList.remove('hidden');
}
function saveApiKey() {
  const v = document.getElementById('apiKeyInput').value.trim();
  if (!v.startsWith('sk-')) { showToast('Geçersiz API key!', 'error'); return; }
  S.apiKey = v; LS.set('eh_apikey', v);
  document.getElementById('apiModal').classList.add('hidden');
  showToast('API key kaydedildi! 🎉', 'success');
  renderTab('daily');
}
function skipApiKey() {
  document.getElementById('apiModal').classList.add('hidden');
}

// ── TEMA ─────────────────────────────────────────────────
function toggleTheme() {
  S.dark = !S.dark;
  LS.set('eh_dark', S.dark);
  document.getElementById('body').className = S.dark ? 'dark' : 'light';
  document.getElementById('themeBtn').textContent = S.dark ? '🌙' : '☀️';
}

// ── NAV ──────────────────────────────────────────────────
function switchTab(tabId) {
  S.tab = tabId;
  document.querySelectorAll('.tab-pane').forEach(p => p.classList.add('hidden'));
  document.querySelectorAll('.nav-btn').forEach(b => {
    b.classList.toggle('active', b.dataset.tab === tabId);
  });
  document.getElementById('tab' + tabId.charAt(0).toUpperCase() + tabId.slice(1)).classList.remove('hidden');
  renderTab(tabId);
}

function renderTab(tabId) {
  const el = document.getElementById('tab' + tabId.charAt(0).toUpperCase() + tabId.slice(1));
  if (tabId === 'lessons') el.innerHTML = renderLessons();
  else if (tabId === 'daily') el.innerHTML = renderDaily();
  else if (tabId === 'review') el.innerHTML = renderReview();
  else if (tabId === 'bank') el.innerHTML = renderBank();
  else if (tabId === 'progress') el.innerHTML = renderProgress();
  else if (tabId === 'chat') el.innerHTML = renderChat();
}

// ── HEADER ───────────────────────────────────────────────
function updateHeader() {
  const saved = todaySavedCount();
  const pct = Math.min(100, Math.round((saved / S.dailyGoal) * 100));
  const goalFill = document.getElementById('goalFill');
  if (goalFill) {
    goalFill.style.width = pct + '%';
    goalFill.style.background = pct >= 100 ? 'var(--green)' : 'var(--gold)';
  }
  const lv = getLevel();
  const goalLabel = document.getElementById('goalLabel');
  const xpLabel = document.getElementById('xpLabel');
  const levelLabel = document.getElementById('levelLabel');
  const streakNum = document.getElementById('streakNum');
  if (goalLabel) goalLabel.textContent = saved + '/' + S.dailyGoal + (pct >= 100 ? ' 🎉' : '');
  if (xpLabel) xpLabel.textContent = S.xp + ' XP';
  if (levelLabel) levelLabel.textContent = 'Seviye ' + lv.level;
  if (streakNum) streakNum.textContent = S.streak;
  const totalWords = Object.values(CONTENT).reduce((s, t) => s + t.units.reduce((s2, u) => s2 + u.vocab.length, 0), 0);
  const sub = document.getElementById('siteSubtitle');
  if (sub) sub.textContent = `${totalWords}+ Kelime · İnsan & Veteriner Tıbbı · IELTS · Deyimler`;
  const chips = document.getElementById('headerChips');
  if (chips) chips.innerHTML = [
    ['var(--red)', 'İnsan Tıbbı'], ['var(--orange)', 'Veteriner'],
    ['var(--teal)', 'Haberler'], ['var(--blue)', 'IELTS']
  ].map(([c, t]) => pill(c, t)).join('');
}

// ═══════════════════════════════════════════════════════════
// DERSLER
// ═══════════════════════════════════════════════════════════
function renderLessons() {
  const topic = getTopic(), unit = getUnit(), lc = getColor(S.topicK);

  // Konu butonları
  const topicBtns = TOPIC_ORDER.map(k => {
    const v = CONTENT[k], tc = getColor(k);
    const done = v.units.filter((_, i) => (S.completed[`${k}_${i}`] || 0) >= 70).length;
    const active = S.topicK === k;
    return `<button class="topic-btn ${active ? 'active' : ''}" style="${active ? `background:${tc};border-color:${tc}` : ''}" onclick="setTopic('${k}')">
      <span>${v.icon}</span><span>${v.label}</span>${done > 0 ? `<span class="topic-done">✓${done}</span>` : ''}
    </button>`;
  }).join('');

  // Ünite sekmeleri
  const unitTabs = topic.units.length > 1 ? `<div class="unit-tabs">${topic.units.map((u, i) => {
    const pct = S.completed[`${S.topicK}_${i}`];
    const active = S.uIdx === i;
    return `<button class="unit-tab ${active ? 'active' : ''}" style="${active ? `background:${lc}22;border-color:${lc};color:${lc}` : ''}" onclick="setUnit(${i})">
      <span>${i + 1}. ${u.title}</span>
      ${pct ? `<span class="pct-badge" style="background:${pct >= 70 ? 'var(--green)' : 'var(--gold)'}">${pct}%</span>` : ''}
    </button>`;
  }).join('')}</div>` : '';

  // Haber kutusu
  const newsBox = `<div class="news-box" style="border-left-color:${lc}">
    <div class="news-source" style="color:${lc}">${topic.icon} ${topic.label} — ${unit.title} ${pill('#555', unit.source, true)}</div>
    <div class="news-text">${unit.headline}</div>
  </div>`;

  if (!S.quiz) {
    const cards = unit.vocab.map((w, i) => {
      const isFlipped = !!S.flipped[i];
      const saved = isSaved(w.en);
      return `<div class="vocab-card ${isFlipped ? 'flipped' : ''}" 
        style="${isFlipped ? `border-color:${lc};box-shadow:0 0 0 2px ${lc}44,0 8px 24px rgba(0,0,0,.3)` : ''}"
        onclick="toggleFlip(${i})">
        <div class="vocab-en">${w.en}</div>
        <div class="vocab-pron">${w.pron ? '/' + w.pron + '/' : ''}</div>
        <div class="vocab-tr">${w.tr}</div>
        ${isFlipped ? `<div class="vocab-extra">
          <div class="vocab-ex">"${w.ex}"</div>
          ${w.tip ? `<div class="vocab-tip" style="color:${lc};background:${lc}18">💡 ${w.tip}</div>` : ''}
        </div>` : ''}
        <div class="vocab-actions">
          <button class="vocab-speak-btn" onclick="event.stopPropagation();speak('${w.en.replace(/'/g, "\\'")}')">🔊</button>
          <button class="vocab-star-btn ${saved ? 'saved' : ''}" onclick="event.stopPropagation();saveWord(${JSON.stringify(w).replace(/"/g, '&quot;')}, '${S.topicK}')">${saved ? '★' : '☆'}</button>
        </div>
      </div>`;
    }).join('');

    return `<div class="fade-in">
      <div class="topic-bar">${topicBtns}</div>
      ${unitTabs}${newsBox}
      <div class="vocab-grid">${cards}</div>
      <p class="flip-hint">💡 Kartlara tıkla → örnek cümle & ipucu · 🔊 telaffuzu dinle · ★ bankana ekle</p>
      <div class="lesson-footer">
        <span class="lesson-footer-tip">Tüm kartları gözden geçirdin mi? Sınava hazır mısın?</span>
        <button class="quiz-start-btn" style="background:${lc}" onclick="startQuiz()">📝 Sınav →</button>
      </div>
    </div>`;
  }

  if (S.quiz && !S.done) {
    const q = unit.quiz[S.qIdx];
    const opts = q.o.map(opt => {
      let cls = 'quiz-opt';
      if (S.sel !== null) { if (opt === q.a) cls += ' correct'; else if (opt === S.sel) cls += ' wrong'; }
      const prefix = S.sel !== null ? (opt === q.a ? '✓ ' : (opt === S.sel ? '✗ ' : '')) : '';
      const suffix = S.sel !== null && opt !== S.sel && opt === q.a ? ' ✓' : '';
      return `<button class="${cls}" onclick="answerQuiz('${opt.replace(/'/g, "\\'")}')">${prefix}${opt}${suffix}</button>`;
    }).join('');
    return `<div class="fade-in">
      <div class="topic-bar">${topicBtns}</div>
      ${unitTabs}
      <div class="quiz-box" style="border-color:${lc}">
        <div class="quiz-header">
          <span style="color:var(--muted)">Soru ${S.qIdx + 1}/${unit.quiz.length}</span>
          <span class="quiz-score-live" style="color:${lc}">✓ ${S.score}</span>
        </div>
        <div class="quiz-progress-bar"><div class="quiz-progress-fill" style="width:${(S.qIdx / unit.quiz.length) * 100}%;background:${lc}"></div></div>
        <div class="quiz-question">${q.q}</div>
        <div class="quiz-options">${opts}</div>
        <button class="quiz-back-btn" onclick="stopQuiz()">← Derse Dön</button>
      </div>
    </div>`;
  }

  // Quiz done
  const finalScore = S.score, total = unit.quiz.length;
  const emoji = finalScore === total ? '🏆' : finalScore >= Math.ceil(total / 2) ? '👍' : '📚';
  const msg = finalScore === total ? 'Mükemmel! Tüm soruları doğru yaptın. 🎉' :
    finalScore >= Math.ceil(total / 2) ? 'Güzel iş! Biraz daha pratikle mükemmel olacak.' :
    'Kelimelere tekrar bak ve tekrar dene. Başarabilirsin!';
  const nextBtn = S.uIdx < topic.units.length - 1 ?
    `<button style="background:var(--green);color:#fff;border:none;border-radius:8px;font-size:13px;font-weight:700;padding:11px 24px" onclick="nextUnit()">Sonraki →</button>` : '';
  return `<div class="fade-in">
    <div class="topic-bar">${topicBtns}</div>
    ${unitTabs}
    <div class="quiz-done" style="border-color:${lc}">
      <div class="quiz-done-emoji">${emoji}</div>
      <div class="quiz-done-score">${finalScore}/${total} doğru</div>
      <div class="quiz-done-msg">${msg}</div>
      <div class="quiz-done-btns">
        <button style="background:${lc};color:#fff;border:none;border-radius:8px;font-size:13px;font-weight:700" onclick="startQuiz()">🔄 Tekrar Dene</button>
        <button style="background:none;border:2px solid ${lc};color:${lc};border-radius:8px;font-size:13px;font-weight:700" onclick="stopQuiz()">← Derse Dön</button>
        ${nextBtn}
      </div>
    </div>
  </div>`;
}

// Lesson handlers
function setTopic(k) { S.topicK = k; S.uIdx = 0; S.quiz = false; S.done = false; S.flipped = {}; S.sel = null; renderTab('lessons'); }
function setUnit(i) { S.uIdx = i; S.quiz = false; S.done = false; S.flipped = {}; S.sel = null; renderTab('lessons'); }
function toggleFlip(i) { S.flipped[i] = !S.flipped[i]; renderTab('lessons'); }
function startQuiz() { S.quiz = true; S.qIdx = 0; S.sel = null; S.score = 0; S.done = false; renderTab('lessons'); }
function stopQuiz() { S.quiz = false; S.flipped = {}; renderTab('lessons'); }
function nextUnit() { S.uIdx++; S.quiz = false; S.done = false; S.flipped = {}; renderTab('lessons'); }

function answerQuiz(opt) {
  if (S.sel !== null) return;
  S.sel = opt;
  const unit = getUnit(), q = unit.quiz[S.qIdx];
  const correct = opt === q.a;
  if (correct) S.score++;
  renderTab('lessons');
  setTimeout(() => {
    if (S.qIdx + 1 >= unit.quiz.length) {
      const finalScore = S.score, total = unit.quiz.length;
      const pct = Math.round((finalScore / total) * 100);
      const key = `${S.topicK}_${S.uIdx}`;
      S.completed[key] = Math.max(S.completed[key] || 0, pct);
      saveCompleted();
      addXP(pct >= 70 ? 20 : 10);
      S.done = true;
    } else { S.qIdx++; S.sel = null; }
    renderTab('lessons');
  }, 1300);
}

// ═══════════════════════════════════════════════════════════
// GÜNLÜK İÇERİK
// ═══════════════════════════════════════════════════════════
function renderDaily() {
  const today = new Date().toLocaleDateString('tr-TR', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });

  if (!S.apiKey) {
    return `<div class="fade-in">
      <div class="daily-header">
        <div>
          <h2 style="font-size:22px;font-weight:800;margin-bottom:4px">📰 Günlük İçerik</h2>
          <div class="daily-date">${today}</div>
        </div>
      </div>
      <div class="no-api-notice">
        <h3>🔑 API Key Gerekli</h3>
        <p style="margin-bottom:16px">Günlük AI içeriği için Anthropic API key'inizi ekleyin.<br><a href="https://console.anthropic.com" target="_blank">console.anthropic.com</a>'dan ücretsiz alabilirsiniz.</p>
        <button class="btn-primary" style="max-width:200px;margin:0 auto" onclick="showApiModal()">API Key Ekle</button>
      </div>
    </div>`;
  }

  const key = todayKey();
  const cached = LS.get('eh_daily_' + key, null);

  if (cached) {
    return renderDailyContent(cached, today);
  }

  if (S.dailyLoading) {
    return `<div class="fade-in">
      <div class="daily-header">
        <div><h2 style="font-size:22px;font-weight:800;margin-bottom:4px">📰 Günlük İçerik</h2><div class="daily-date">${today}</div></div>
      </div>
      <div class="ai-loading">
        <div class="ai-loading-dots"><span></span><span></span><span></span></div>
        <span>AI bugünkü içeriği hazırlıyor...</span>
      </div>
    </div>`;
  }

  return `<div class="fade-in">
    <div class="daily-header">
      <div><h2 style="font-size:22px;font-weight:800;margin-bottom:4px">📰 Günlük İçerik</h2><div class="daily-date">${today}</div></div>
      <button class="daily-generate-btn" onclick="generateDaily()">✨ Bugünkü İçeriği Oluştur</button>
    </div>
    <div style="background:var(--card);border:1px dashed var(--border);border-radius:var(--radius);padding:40px;text-align:center;color:var(--muted)">
      <div style="font-size:48px;margin-bottom:16px">🤖</div>
      <p style="font-size:14px;line-height:1.8">AI her gün yeni haberler, tıp ve veteriner terimleri üretir.<br>Bugünkü içeriği oluşturmak için butona tıkla!</p>
    </div>
  </div>`;
}

function renderDailyContent(content, today) {
  const topicColor = content.topic?.includes('Tıp') ? 'var(--red)' : content.topic?.includes('Vet') ? 'var(--orange)' : 'var(--teal)';
  const wordCards = (content.words || []).map((w, i) => {
    const saved = isSaved(w.en);
    const catColor = w.cat === 'medical' ? 'var(--red)' : w.cat === 'veterinary' ? 'var(--orange)' : w.cat === 'news' ? 'var(--teal)' : 'var(--muted)';
    return `<div class="vocab-card" onclick="">
      <div style="margin-bottom:6px">${pill(catColor, w.cat, true)}</div>
      <div class="vocab-en">${w.en}</div>
      <div class="vocab-pron">${w.pron ? '/' + w.pron + '/' : ''}</div>
      <div class="vocab-tr">${w.tr}</div>
      <div class="vocab-extra">
        <div class="vocab-ex">"${w.ex}"</div>
        ${w.tip ? `<div class="vocab-tip" style="color:${catColor};background:${catColor}18">💡 ${w.tip}</div>` : ''}
      </div>
      <div class="vocab-actions">
        <button class="vocab-speak-btn" onclick="speak('${w.en.replace(/'/g, "\\'")}')">🔊</button>
        <button class="vocab-star-btn ${saved ? 'saved' : ''}" onclick="saveWord(${JSON.stringify(w).replace(/"/g, '&quot;')}, '${w.cat === 'veterinary' ? 'vet' : 'tip'}')">${saved ? '★' : '☆'}</button>
      </div>
    </div>`;
  }).join('');

  return `<div class="fade-in">
    <div class="daily-header">
      <div><h2 style="font-size:22px;font-weight:800;margin-bottom:4px">📰 Günlük İçerik</h2><div class="daily-date">${today}</div></div>
      <button class="daily-generate-btn" onclick="generateDaily(true)">🔄 Yenile</button>
    </div>
    <div class="daily-news-card" style="border-left-color:${topicColor}">
      <div class="daily-news-source">${content.source} — ${content.topic}</div>
      <div class="daily-news-headline">${content.headline}</div>
      <div class="daily-news-body">${content.summary}</div>
      ${content.tr_summary ? `<div style="margin-top:10px;padding-top:10px;border-top:1px solid var(--border);font-size:13px;color:var(--muted);font-style:italic">🇹🇷 ${content.tr_summary}</div>` : ''}
    </div>
    <h3 style="font-size:16px;font-weight:700;margin-bottom:12px">Bugünkü Kelimeler</h3>
    <div class="daily-words-grid">${wordCards}</div>
  </div>`;
}

async function generateDaily(force = false) {
  const key = todayKey();
  if (!force) { const c = LS.get('eh_daily_' + key, null); if (c) { renderTab('daily'); return; } }
  S.dailyLoading = true; renderTab('daily');
  try {
    const today = new Date().toLocaleDateString('tr-TR', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
    const raw = await callAPI(DAILY_SYSTEM_PROMPT, [{
      role: 'user',
      content: `Bugünün tarihi: ${today}. Tıp veya veteriner tıbbıyla ilgili güncel ve ilginç bir İngilizce haber ve 5-6 yeni kelime üret. JSON formatında yanıt ver.`
    }], 1500);
    const clean = raw.replace(/```json|```/g, '').trim();
    const content = JSON.parse(clean);
    LS.set('eh_daily_' + key, content);
    addXP(10);
    showToast('Günlük içerik hazır! +10 XP 🎉', 'success');
  } catch (e) {
    if (e.message === 'NO_API_KEY') { showApiModal(); }
    else { showToast('İçerik üretilemedi: ' + e.message, 'error'); }
  }
  S.dailyLoading = false; renderTab('daily');
}

// ═══════════════════════════════════════════════════════════
// TEKRAR (SPACED REPETITION)
// ═══════════════════════════════════════════════════════════
function renderReview() {
  if (S.bank.length === 0) {
    return `<div class="fade-in empty-state">
      <div class="empty-state-icon">📖</div>
      <div class="empty-state-text">Henüz kelime yok.<br>Derslerde ☆ ile kelimelerini bankana ekle.</div>
      <button class="btn-primary" style="margin-top:16px;max-width:200px" onclick="switchTab('lessons')">Derslere Git →</button>
    </div>`;
  }

  const due = getDueWords();
  const totalDue = due.length;
  const w = S.bank[S.rIdx] || S.bank[0];
  const pct = Math.round(((S.rIdx + 1) / S.bank.length) * 100);

  // Stats
  const correct = S.bank.filter(x => x.srReps > 0 && x.srEase >= 2.5).length;
  const learning = S.bank.filter(x => x.srReps > 0 && x.srEase < 2.5).length;
  const statsHTML = `
    <div class="review-stats-row">
      <div class="review-stat"><div class="review-stat-num" style="color:var(--gold)">${totalDue}</div><div class="review-stat-lbl">Tekrar Bekliyor</div></div>
      <div class="review-stat"><div class="review-stat-num" style="color:var(--green)">${correct}</div><div class="review-stat-lbl">Öğrenildi</div></div>
      <div class="review-stat"><div class="review-stat-num" style="color:var(--red)">${learning}</div><div class="review-stat-lbl">Öğreniliyor</div></div>
      <div class="review-stat"><div class="review-stat-num" style="color:var(--teal)">${S.bank.length}</div><div class="review-stat-lbl">Toplam</div></div>
    </div>`;

  const catColor = getColor(w.cat || 'tip');
  const cardContent = !S.rFlip ? `
    <div class="fc-label">İngilizce → Türkçe ne?</div>
    <div class="fc-word">${w.en}</div>
    <div class="fc-pron">${w.pron ? '/' + w.pron + '/' : ''}</div>
    <button class="fc-speak-btn" onclick="event.stopPropagation();speak('${w.en.replace(/'/g, "\\'")}')">🔊 Sesi Dinle</button>
    <div class="fc-flip-hint">Türkçe anlamı için kartı çevir</div>
  ` : `
    <div class="fc-label">Türkçe Karşılık</div>
    <div class="fc-answer">${w.tr}</div>
    <div class="fc-ex">"${w.ex || ''}"</div>
    ${w.tip ? `<div class="fc-tip-box">💡 ${w.tip}</div>` : ''}
    <div class="fc-rating">
      <button style="background:var(--red);color:#fff" onclick="rateCard(1)">😟 Zor</button>
      <button style="background:var(--gold);color:#fff" onclick="rateCard(3)">🙂 Orta</button>
      <button style="background:var(--green);color:#fff" onclick="rateCard(5)">😄 Kolay</button>
    </div>
  `;

  return `<div class="fade-in">
    <div class="section-head"><h2>🔁 Kelime Tekrar</h2><span class="badge" style="background:var(--teal)">${totalDue > 0 ? totalDue + ' bekliyor' : 'Hepsi tamam!'}</span></div>
    ${statsHTML}
    <div class="review-progress-row">
      <div class="review-bar-wrap"><div class="review-bar-fill" style="width:${pct}%"></div></div>
      <span style="font-size:12px;color:var(--muted);white-space:nowrap">${S.rIdx + 1}/${S.bank.length}</span>
      <button class="btn-ghost" style="padding:4px 12px;font-size:12px" onclick="resetReview()">↺ Başa Dön</button>
    </div>
    <div class="flashcard" onclick="flipCard()">${cardContent}</div>
    ${!S.rFlip ? `<div class="fc-nav">
      <button class="btn-ghost" onclick="prevCard()" ${S.rIdx === 0 ? 'disabled' : ''}>← Önceki</button>
      <button style="background:var(--card);border:1.5px solid var(--border);border-radius:8px;padding:10px 18px;font-size:13px;color:var(--teal)" onclick="speak('${w.en.replace(/'/g, "\\'")}')">🔊</button>
      <button class="btn-primary" onclick="nextCard()" ${S.rIdx === S.bank.length - 1 ? 'disabled' : ''}>Sonraki →</button>
    </div>` : ''}
  </div>`;
}

function flipCard() { S.rFlip = !S.rFlip; renderTab('review'); }
function prevCard() { S.rIdx = Math.max(0, S.rIdx - 1); S.rFlip = false; renderTab('review'); }
function nextCard() { S.rIdx = Math.min(S.bank.length - 1, S.rIdx + 1); S.rFlip = false; renderTab('review'); }
function resetReview() { S.rIdx = 0; S.rFlip = false; renderTab('review'); }
function rateCard(quality) {
  const w = S.bank[S.rIdx];
  if (w) { updateSR(w, quality); addXP(quality >= 3 ? 3 : 1); }
  nextCard();
}

// ═══════════════════════════════════════════════════════════
// KELİME BANKASI
// ═══════════════════════════════════════════════════════════
function renderBank() {
  const cats = ['all', 'tip', 'vet', 'haberler', 'idioms', 'ielts', 'gramer', 'is'];
  const catLabels = { all: 'Tümü', tip: '🏥 Tıp', vet: '🐾 Vet', haberler: '📰 Haber', idioms: '🗣️ Deyim', ielts: '🎓 IELTS', gramer: '✏️ Gramer', is: '💼 İş' };

  const filtered = S.bank.filter(w => {
    const fc = S.bFil === 'all' || w.cat === S.bFil;
    const fs = !S.bSrch || w.en.toLowerCase().includes(S.bSrch.toLowerCase()) || w.tr.toLowerCase().includes(S.bSrch.toLowerCase());
    return fc && fs;
  });

  const statsHTML = [
    ['Toplam', S.bank.length, 'var(--gold)'],
    ['🏥 Tıp', S.bank.filter(w => w.cat === 'tip').length, 'var(--red)'],
    ['🐾 Vet', S.bank.filter(w => w.cat === 'vet').length, 'var(--orange)'],
    ['📰 Haber', S.bank.filter(w => w.cat === 'haberler').length, 'var(--teal)'],
    ['🗣️ Deyim', S.bank.filter(w => w.cat === 'idioms').length, 'var(--gold)'],
    ['🎓 IELTS', S.bank.filter(w => w.cat === 'ielts').length, 'var(--blue)'],
  ].map(([l, n, c]) => `<div class="bank-stat-item"><span class="bank-stat-num" style="color:${c}">${n}</span><span class="bank-stat-lbl">${l}</span></div>`).join('');

  const filterBtns = cats.map(f =>
    `<button class="filter-chip ${S.bFil === f ? 'active' : ''}" onclick="setBFil('${f}')">${catLabels[f]}</button>`
  ).join('');

  const cards = filtered.length === 0 ? `<div class="empty-state"><div class="empty-state-icon">🔍</div><div class="empty-state-text">Kelime bulunamadı.</div></div>` :
    `<div class="bank-grid">${filtered.map(w => {
      const tc = getColor(w.cat);
      const dueStr = w.srDue ? (w.srDue <= Date.now() ? `<span class="sr-badge" style="background:var(--red);color:#fff">Tekrar!</span>` :
        `<span class="sr-badge" style="background:var(--green);color:#fff">✓</span>`) : '';
      return `<div class="bank-card">
        ${pill(tc, CONTENT[w.cat]?.label || w.cat, true)}
        <div class="bank-card-en">${w.en}${dueStr}<button class="bank-card-speak" onclick="speak('${w.en.replace(/'/g, "\\'")}')">🔊</button></div>
        <div class="bank-card-pron">${w.pron ? '/' + w.pron + '/' : ''}</div>
        <div class="bank-card-tr">${w.tr}</div>
        ${w.ex ? `<div class="bank-card-ex">"${w.ex}"</div>` : ''}
        <button class="bank-card-del" onclick="deleteWord('${w.en.replace(/'/g, "\\'")}')">✕</button>
      </div>`;
    }).join('')}</div>`;

  return `<div class="fade-in">
    <div class="section-head">
      <h2>📚 Kelime Haznem</h2>
      <span class="badge" style="background:var(--teal)">${S.bank.length} kelime</span>
      ${S.bank.length > 0 ? `<button class="btn-primary" style="margin-left:auto;padding:8px 16px;font-size:12px" onclick="switchTab('review')">🔁 Tekrar Et</button>` : ''}
    </div>
    <div class="bank-stats-row">${statsHTML}</div>
    <div class="filter-row">
      <input class="search-input" placeholder="Kelime ara..." value="${S.bSrch}" oninput="setBSrch(this.value)">
      ${filterBtns}
    </div>
    ${cards}
  </div>`;
}

function setBFil(f) { S.bFil = f; renderTab('bank'); }
function setBSrch(v) { S.bSrch = v; renderTab('bank'); }
function deleteWord(en) {
  S.bank = S.bank.filter(w => w.en !== en);
  saveBank(); renderTab('bank');
  showToast('Kelime silindi', 'info');
}

// ═══════════════════════════════════════════════════════════
// İLERLEME
// ═══════════════════════════════════════════════════════════
function renderProgress() {
  const totalUnits = Object.values(CONTENT).reduce((s, t) => s + t.units.length, 0);
  const totalWords = Object.values(CONTENT).reduce((s, t) => s + t.units.reduce((s2, u) => s2 + u.vocab.length, 0), 0);
  const completedCount = Object.keys(S.completed).length;
  const saved = todaySavedCount();
  const goalPct = Math.min(100, Math.round((saved / S.dailyGoal) * 100));
  const lv = getLevel();

  // Heatmap (son 35 gün)
  const cells = Array.from({ length: 35 }, (_, i) => {
    const d = new Date(); d.setDate(d.getDate() - (34 - i));
    const k = d.toISOString().split('T')[0];
    const xp = S.activityLog[k] || 0;
    const lvl = xp >= 50 ? 4 : xp >= 30 ? 3 : xp >= 10 ? 2 : xp > 0 ? 1 : 0;
    return `<div class="heatmap-cell level-${lvl}" title="${d.toLocaleDateString('tr-TR')}: ${xp} XP"></div>`;
  }).join('');

  const statCards = [
    { icon: '📚', label: 'Toplam Kelime', val: totalWords, c: 'var(--teal)' },
    { icon: '✅', label: 'Tamamlanan', val: `${completedCount}/${totalUnits}`, c: 'var(--green)' },
    { icon: '⭐', label: 'Bankam', val: S.bank.length, c: 'var(--gold)' },
    { icon: '🔥', label: 'Gün Serisi', val: S.streak, c: 'var(--orange)' },
    { icon: '⚡', label: 'Toplam XP', val: S.xp, c: 'var(--purple)' },
    { icon: '🏆', label: 'Seviye', val: lv.level, c: 'var(--blue)' },
  ].map(s => `<div class="stat-card">
    <div class="stat-card-icon">${s.icon}</div>
    <div class="stat-card-num" style="color:${s.c}">${s.val}</div>
    <div class="stat-card-lbl">${s.label}</div>
  </div>`).join('');

  const goalChips = [3, 5, 10, 15, 20].map(n =>
    `<button class="goal-chip ${S.dailyGoal === n ? 'active' : ''}" onclick="setGoal(${n})">${n} kelime</button>`
  ).join('');

  const topicRows = TOPIC_ORDER.map(k => {
    const v = CONTENT[k], tc = getColor(k);
    const done = v.units.filter((_, i) => (S.completed[`${k}_${i}`] || 0) >= 70).length;
    const pct = Math.round((done / v.units.length) * 100);
    return `<div class="prog-topic-row">
      <div class="prog-topic-header">
        <span>${v.icon} ${v.label}</span>
        <span style="font-size:12px;color:${tc};font-weight:700">${done}/${v.units.length} ünite</span>
      </div>
      <div class="prog-bar-track"><div class="prog-bar-fill" style="width:${pct}%;background:${tc}"></div></div>
    </div>`;
  }).join('');

  return `<div class="fade-in">
    <div class="section-head"><h2>📊 İlerleme & Hedefler</h2></div>
    <div class="stat-cards">${statCards}</div>

    <div style="background:var(--card);border:1px solid var(--border);border-radius:var(--radius);padding:20px;margin-bottom:20px">
      <div style="font-weight:700;margin-bottom:6px">Seviye ${lv.level} — ${lv.xpInLevel}/100 XP</div>
      <div style="height:8px;background:var(--border);border-radius:4px;overflow:hidden;margin-bottom:8px">
        <div style="height:100%;width:${lv.xpInLevel}%;background:var(--purple);border-radius:4px;transition:width .5s"></div>
      </div>
      <div style="font-size:12px;color:var(--muted)">Kelime ekle (+5 XP) · Quiz tamamla (+10-20 XP) · Günlük içerik (+10 XP) · Tekrar yap (+1-3 XP)</div>
    </div>

    <div style="background:var(--card);border:1px solid var(--border);border-radius:var(--radius);padding:20px;margin-bottom:20px">
      <div style="font-weight:700;margin-bottom:12px;font-size:15px">🎯 Günlük Hedef</div>
      <div class="goal-set-row">${goalChips}</div>
      <div style="height:8px;background:var(--border);border-radius:4px;overflow:hidden;margin-bottom:8px">
        <div style="height:100%;width:${goalPct}%;background:${goalPct >= 100 ? 'var(--green)' : 'var(--gold)'};border-radius:4px;transition:width .5s"></div>
      </div>
      <div style="font-size:13px;color:var(--muted)">${saved}/${S.dailyGoal} kelime eklendi ${goalPct >= 100 ? '— Hedefe ulaştın! 🎉' : ''}</div>
    </div>

    <div style="background:var(--card);border:1px solid var(--border);border-radius:var(--radius);padding:20px;margin-bottom:20px">
      <div style="font-weight:700;margin-bottom:12px;font-size:15px">📅 Aktivite (Son 35 Gün)</div>
      <div class="heatmap-grid">${cells}</div>
    </div>

    <div style="font-weight:700;font-size:15px;margin-bottom:12px">Konu Bazlı İlerleme</div>
    ${topicRows}

    <div class="ai-suggestions">
      <div style="font-weight:700;margin-bottom:10px;font-size:14px">💬 AI Öğretmene Sor</div>
      <div style="font-size:13px;color:var(--muted);line-height:2.1">
        ▸ "Veteriner tıbbında zoonoz hastalıkları anlat, BBC haberinden örnek ver"<br>
        ▸ "Tıp İngilizcesinde 5 yeni terim ver, kökenlerini belirt"<br>
        ▸ "IELTS Writing Task 2 için 'yapay zeka' konusunda kelime öğret"<br>
        ▸ "Bugün öğrendiğim kelimelerle kısa bir hikaye yaz"
      </div>
    </div>
  </div>`;
}

function setGoal(n) { S.dailyGoal = n; LS.set('eh_goal', n); renderTab('progress'); updateHeader(); }

// ═══════════════════════════════════════════════════════════
// AI SOHBET
// ═══════════════════════════════════════════════════════════
function renderChat() {
  const topics = [
    { id: 'tip', label: '🏥 İnsan Tıbbı' },
    { id: 'vet', label: '🐾 Veteriner' },
    { id: 'haberler', label: '📰 Haberler' },
    { id: 'gramer', label: '✏️ Gramer' },
    { id: 'ielts', label: '🎓 IELTS' },
    { id: 'idioms', label: '🗣️ Deyimler' },
  ];

  const topicBtns = topics.map(t =>
    `<button class="chat-topic-chip ${S.chatTopic === t.id ? 'active' : ''}" onclick="setChatTopic('${t.id}')">${t.label}</button>`
  ).join('');

  const msgs = S.chatHistory.length === 0 ? `
    <div class="chat-msg ai">
      <div class="chat-avatar">📰</div>
      <div>
        <div class="chat-bubble">Merhaba! Ben The English Herald'ın AI öğretmeniyim. 🎓

Seninle birlikte İngilizce öğreneceğiz — insan tıbbı, veteriner tıbbı, gazete haberleri, IELTS ve daha fazlası.

Bir konu seç veya soru sor. Örneğin:
• "Veteriner tıbbında kullanılan 5 terim öğret"
• "BBC'den bir haber analiz et"  
• "IELTS writing için kelime ver"</div>
      </div>
    </div>` :
    S.chatHistory.map(m => renderChatMsg(m)).join('');

  const quickBtns = [
    ['🏥 Tıp terimleri', 'Tıp İngilizcesinde 5 yeni terim öğret, Latince kökenlerini belirt'],
    ['🐾 Veteriner', 'Veteriner tıbbında sık kullanılan 5 terim öğret'],
    ['📰 Haberden kelime', 'Güncel BBC Health haberinden 5 yeni kelime çıkar ve öğret'],
    ['📝 Sınav yap', 'Bana 5 soruluk kısa bir kelime sınavı yap'],
    ['✏️ Hata düzelt', 'Türklerin İngilizcede yaptığı en yaygın 3 hatayı anlat ve doğrularını öğret'],
  ].map(([l, p]) => `<button class="chat-quick-btn" onclick="sendChatMsg('${p.replace(/'/g, "\\'")}')">${l}</button>`).join('');

  if (!S.apiKey) {
    return `<div class="fade-in">
      <div class="section-head"><h2>💬 AI Öğretmen</h2></div>
      <div class="no-api-notice">
        <h3>🔑 API Key Gerekli</h3>
        <p style="margin-bottom:16px">AI sohbet için Anthropic API key'inizi ekleyin.</p>
        <button class="btn-primary" style="max-width:200px;margin:0 auto" onclick="showApiModal()">API Key Ekle</button>
      </div>
    </div>`;
  }

  return `<div class="fade-in">
    <div class="section-head"><h2>💬 AI Öğretmen</h2><span class="badge" style="background:var(--teal)">Canlı</span></div>
    <div class="chat-topic-bar">${topicBtns}</div>
    <div class="chat-container">
      <div class="chat-messages" id="chatMessages">${msgs}</div>
      <div class="chat-input-row">
        <textarea class="chat-input" id="chatInput" placeholder="Bir şey sorun, kelime isteyin, cümle kurun..." rows="1" onkeydown="if(event.key==='Enter'&&!event.shiftKey){event.preventDefault();sendChatFromInput()}"></textarea>
        <button class="chat-send-btn" id="chatSendBtn" onclick="sendChatFromInput()">Gönder →</button>
      </div>
    </div>
    <div class="chat-quick-btns">${quickBtns}</div>
  </div>`;
}

function renderChatMsg(m) {
  const isUser = m.role === 'user';
  const vocabCards = m.vocab && m.vocab.length > 0 ? `
    <div class="chat-vocab-row">${m.vocab.map(w => {
      const catColor = w.cat === 'medical' ? 'var(--red)' : w.cat === 'veterinary' ? 'var(--orange)' : w.cat === 'news' ? 'var(--teal)' : 'var(--muted)';
      const saved = isSaved(w.en);
      return `<div class="chat-vocab-mini">
        <div class="cvm-cat" style="color:${catColor}">${w.cat}</div>
        <div class="cvm-en">${w.en}</div>
        <div class="cvm-tr">${w.tr}</div>
        ${w.example ? `<div style="font-size:11px;font-style:italic;color:var(--dim);margin-top:3px">"${w.example}"</div>` : ''}
        <button class="cvm-star ${saved ? 'saved' : ''}" onclick="saveWord(${JSON.stringify(w).replace(/"/g, '&quot;')}, '${w.cat === 'veterinary' ? 'vet' : 'tip'}')">${saved ? '★' : '☆'}</button>
      </div>`;
    }).join('')}</div>` : '';
  return `<div class="chat-msg ${isUser ? 'user' : 'ai'}">
    <div class="chat-avatar">${isUser ? '👤' : '📰'}</div>
    <div>
      <div class="chat-bubble">${m.text}</div>
      ${vocabCards}
    </div>
  </div>`;
}

function setChatTopic(t) { S.chatTopic = t; renderTab('chat'); }

function sendChatFromInput() {
  const inp = document.getElementById('chatInput');
  if (!inp) return;
  const v = inp.value.trim();
  if (v) { inp.value = ''; sendChatMsg(v); }
}

async function sendChatMsg(text) {
  if (!text.trim()) return;
  const topicLabel = CONTENT[S.chatTopic]?.label || 'Genel';
  S.chatHistory.push({ role: 'user', text });
  renderTab('chat');

  // Typing indicator
  const msgs = document.getElementById('chatMessages');
  if (msgs) {
    const typing = document.createElement('div');
    typing.id = 'typingMsg';
    typing.className = 'chat-msg ai';
    typing.innerHTML = `<div class="chat-avatar">📰</div><div class="typing-indicator"><span></span><span></span><span></span></div>`;
    msgs.appendChild(typing);
    msgs.scrollTop = msgs.scrollHeight;
  }

  const sendBtn = document.getElementById('chatSendBtn');
  if (sendBtn) sendBtn.disabled = true;

  const histForAPI = S.chatHistory.slice(-10).map(m => ({
    role: m.role === 'ai' ? 'assistant' : 'user',
    content: m.role === 'ai' ? m.text : `Konu: ${topicLabel}\n\n${m.text}`
  }));

  try {
    const raw = await callAPI(CHAT_SYSTEM_PROMPT, histForAPI, 1200);
    const { clean, vocab } = parseVocab(raw);
    S.chatHistory.push({ role: 'ai', text: clean, vocab });
    addXP(2);
  } catch (e) {
    if (e.message === 'NO_API_KEY') {
      S.chatHistory.push({ role: 'ai', text: 'API key gerekli. Sağ üstteki 🔑 butonuna tıklayın.', vocab: [] });
    } else {
      S.chatHistory.push({ role: 'ai', text: 'Bir hata oluştu: ' + e.message, vocab: [] });
    }
  }

  if (sendBtn) sendBtn.disabled = false;
  renderTab('chat');
  const msgsEl = document.getElementById('chatMessages');
  if (msgsEl) msgsEl.scrollTop = msgsEl.scrollHeight;
}

// ═══════════════════════════════════════════════════════════
// BAŞLATMA
// ═══════════════════════════════════════════════════════════
window.addEventListener('DOMContentLoaded', () => {
  document.getElementById('body').className = S.dark ? 'dark' : 'light';
  document.getElementById('themeBtn').textContent = S.dark ? '🌙' : '☀️';
  updateHeader();
  renderTab('lessons');
  S.todaySaved = todaySavedCount();
  updateHeader();

  // İlk kez açılıyorsa API modal göster
  if (!S.apiKey) {
    setTimeout(() => showApiModal(), 800);
  }
});
