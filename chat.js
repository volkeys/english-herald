// ═══════════════════════════════════════════════════════════
// CANLI AI ÖĞRETMEN
// Streaming yanıt · Sesli konuşma · Anlık hata düzeltme · Rol-play
// ═══════════════════════════════════════════════════════════
'use strict';

const CHAT_TOPICS = [
  { id: 'tip', label: '🏥 İnsan Tıbbı' },
  { id: 'vet', label: '🐾 Veteriner' },
  { id: 'haberler', label: '📰 Haberler' },
  { id: 'gramer', label: '✏️ Gramer' },
  { id: 'ielts', label: '🎓 IELTS' },
  { id: 'idioms', label: '🗣️ Deyimler' },
  { id: 'is', label: '💼 İş' },
];

const ROLEPLAYS = [
  { id: 'doctor', icon: '🩺', name: 'Doktor & Hasta', you: 'hasta', desc: 'Şikâyetini anlat, doktorun sorularını yanıtla.',
    setup: 'You are a GP in a UK clinic. The learner is your patient. Ask about symptoms, duration, medication, allergies. Use natural clinical English, one question at a time.' },
  { id: 'vetclinic', icon: '🐕', name: 'Veteriner Kliniği', you: 'hayvan sahibi',
    desc: 'Evcil hayvanınla ilgili sorunu anlat.',
    setup: 'You are a veterinary surgeon. The learner brings in a pet. Take a history, explain likely diagnoses and treatment in plain clinical English.' },
  { id: 'conference', icon: '🎤', name: 'Tıp Kongresi', you: 'katılımcı',
    desc: 'Poster sunumu yap, sorulara cevap ver.',
    setup: 'You are a senior researcher at an international medical conference chatting to the learner about their poster. Ask about methods, sample size, limitations.' },
  { id: 'interview', icon: '💼', name: 'İş Görüşmesi', you: 'aday',
    desc: 'İngilizce mülakat pratiği.',
    setup: 'You are a hiring manager interviewing the learner in English. Ask competency-based questions one at a time and give short feedback.' },
  { id: 'airport', icon: '✈️', name: 'Havalimanı & Seyahat', you: 'yolcu',
    desc: 'Check-in, pasaport, otel.',
    setup: 'You play airport/hotel staff. Handle check-in, passport control and hotel reception scenarios with the learner, one exchange at a time.' },
  { id: 'ieltsexaminer', icon: '🎓', name: 'IELTS Sınav Görevlisi', you: 'aday',
    desc: 'Speaking sınavı simülasyonu.',
    setup: 'You are an IELTS speaking examiner. Follow the real Part 1 → 2 → 3 structure. Ask one question at a time, stay in role, and only give band feedback when the learner asks.' },
];

const Chat = {
  history: LS.get('eh_chat', []),
  topic: LS.get('eh_chat_topic', 'tip'),
  mode: 'normal',           // normal | roleplay
  roleplay: null,
  voiceMode: false,
  streaming: false,
  controller: null,
  draft: '',
};
window.Chat = Chat;

// ── SİSTEM PROMPTU ───────────────────────────────────────
Chat.systemPrompt = function () {
  const topicLabel = CONTENT[this.topic]?.label || 'Genel İngilizce';
  const recent = S.bank.slice(-12).map(w => w.en).join(', ');
  let p = `Sen "The English Herald" platformunun AI İngilizce öğretmenisin. Öğrencin Türk, seviyesi ${S.cfg.level}, hedef IELTS bandı ${S.cfg.targetBand}.

TEMEL KURALLAR
- Açıklamaları TÜRKÇE yap, öğretilen dil malzemesi (kelime, cümle, örnek) İNGİLİZCE olsun.
- Kısa ve net ol: en fazla 250 kelime. Uzun listeler yerine 3-5 güçlü örnek.
- Her yeni kelimede: anlam + telaffuz + gerçek bir örnek cümle + Türkçe'ye özgü bir ipucu (yanlış dost, kalıp farkı, etimoloji).
- Öğrenciyi konuşturacak tek bir soruyla bitir.
- Uydurma bilgi verme; emin değilsen belirt.
- Odak konu: ${topicLabel}.`;

  if (recent) p += `\n- Öğrencinin son öğrendiği kelimeler (mümkünse doğal biçimde tekrar et): ${recent}.`;

  if (S.cfg.autoCorrect) {
    p += `

HATA DÜZELTME
Öğrenci İngilizce yazdıysa ve hata varsa, cevabının EN BAŞINA şu bloğu koy (hata yoksa hiç koyma):
###FIX###
{"original":"öğrencinin cümlesi","corrected":"düzeltilmiş hâli","notes":["kısa Türkçe açıklama","..."],"level":"minor|major"}
###END###`;
  }

  if (this.mode === 'roleplay' && this.roleplay) {
    p += `

ROL YAPMA MODU — ${this.roleplay.name}
${this.roleplay.setup}
- Rolünde kal, İngilizce konuş, kısa tut (2-4 cümle) ve her seferinde tek soru sor.
- Öğrenci "stop" veya "çıkış" derse role son ver ve kısa bir Türkçe geri bildirim + 5 faydalı ifade ver.`;
  }

  p += `

YENİ KELİME KARTLARI
Cevabında öğrettiğin kelimeler varsa, cevabının EN SONUNA ekle (yoksa ekleme):
###VOCAB###
[{"en":"word","tr":"Türkçe","pron":"telaffuz","cat":"medical|veterinary|news|grammar|business|ielts|idiom","example":"English example sentence","tip":"Türkçe ipucu"}]
###END###`;
  return p;
};

// ── AYRIŞTIRMA ───────────────────────────────────────────
function splitBlocks(raw) {
  let text = raw, vocab = [], fix = null;
  const vm = text.match(/###VOCAB###([\s\S]*?)(?:###END###|$)/);
  if (vm) {
    text = text.replace(vm[0], '').trim();
    try { const v = parseJSONLoose(vm[1]); if (Array.isArray(v)) vocab = v; } catch {}
  }
  const fm = text.match(/###FIX###([\s\S]*?)(?:###END###|$)/);
  if (fm) {
    text = text.replace(fm[0], '').trim();
    try { fix = parseJSONLoose(fm[1]); } catch {}
  }
  return { text: text.trim(), vocab, fix };
}

// ── RENDER ───────────────────────────────────────────────
Chat.render = function () {
  if (!S.cfg.apiKey) {
    return `<div class="fade-in"><div class="section-head"><h2>💬 AI Öğretmen</h2></div>${noApiNotice('Canlı AI sohbeti')}</div>`;
  }

  const topicBtns = CHAT_TOPICS.map(t =>
    `<button class="chat-topic-chip ${this.topic === t.id && this.mode === 'normal' ? 'active' : ''}" data-act="chatTopic" data-t="${t.id}">${t.label}</button>`).join('');

  const rpBtns = ROLEPLAYS.map(r =>
    `<button class="rp-chip ${this.roleplay?.id === r.id ? 'active' : ''}" data-act="chatRoleplay" data-r="${r.id}" title="${attr(r.desc)}">${r.icon} ${esc(r.name)}</button>`).join('');

  const msgs = this.history.length ? this.history.map((m, i) => this.msgHTML(m, i)).join('') : this.welcomeHTML();

  const quick = [
    ['🏥 Tıp terimleri', 'Tıp İngilizcesinde 5 yeni terim öğret, Latince/Yunanca köklerini açıkla'],
    ['🐾 Veteriner', 'Veteriner pratiğinde en sık kullanılan 5 terimi örnek cümlelerle öğret'],
    ['📰 Haberden kelime', 'Güncel bir sağlık haberi yaz ve içinden 5 yeni kelime öğret'],
    ['📝 Mini sınav', 'Bana son öğrendiğim kelimelerden 5 soruluk kısa bir sınav yap'],
    ['✏️ Yaygın hatalar', 'Türklerin İngilizcede yaptığı en yaygın 3 hatayı anlat ve doğrusunu göster'],
    ['🗣️ Telaffuz', 'Türklerin zorlandığı 5 İngilizce sesi ve alıştırma kelimelerini ver'],
  ].map(([l, p]) => `<button class="chat-quick-btn" data-act="chatQuick" data-q="${attr(p)}">${l}</button>`).join('');

  const rpBanner = this.mode === 'roleplay' && this.roleplay ? `<div class="rp-banner">
    <span>${this.roleplay.icon} <b>${esc(this.roleplay.name)}</b> — sen ${esc(this.roleplay.you)} rolündesin. İngilizce konuş!</span>
    <button class="btn-ghost btn-xs" data-act="chatEndRoleplay">Rolden çık</button>
  </div>` : '';

  return `<div class="fade-in">
    <div class="section-head">
      <h2>💬 AI Öğretmen</h2>
      <span class="badge badge-live">● Canlı</span>
      <button class="btn-ghost btn-xs" style="margin-left:auto" data-act="chatClear">🗑 Sohbeti temizle</button>
    </div>

    <div class="chat-topic-bar">${topicBtns}</div>
    <details class="rp-details" ${this.mode === 'roleplay' ? 'open' : ''}>
      <summary>🎭 Rol yapma senaryoları — gerçek konuşma pratiği</summary>
      <div class="rp-grid">${rpBtns}</div>
    </details>
    ${rpBanner}

    <div class="chat-container">
      <div class="chat-messages" id="chatMessages">${msgs}</div>
      <div class="chat-input-row">
        <button class="mic-btn ${this.voiceMode ? 'on' : ''}" id="micBtn" data-act="chatMic" title="Sesli konuş (mikrofon)" aria-label="Mikrofon">🎙️</button>
        <textarea class="chat-input" id="chatInput" placeholder="${this.mode === 'roleplay' ? 'Reply in English…' : 'Bir şey sor, kelime iste, cümle kur…'}" rows="1">${esc(this.draft)}</textarea>
        <button class="chat-send-btn" id="chatSendBtn" data-act="chatSend">${this.streaming ? '■ Durdur' : 'Gönder →'}</button>
      </div>
      <div class="mic-status hidden" id="micStatus"></div>
    </div>
    <div class="chat-quick-btns">${quick}</div>
    <p class="flip-hint">💡 Mikrofon simgesine bas → İngilizce konuş → AI hem yazıp hem sesli cevaplasın. Ses ayarları ⚙️ menüsünde.</p>
  </div>`;
};

Chat.welcomeHTML = function () {
  return `<div class="chat-msg ai"><div class="chat-avatar">📰</div><div>
    <div class="chat-bubble">${md(`Merhaba! Ben **The English Herald**'ın AI öğretmeniyim. 🎓

Birlikte tıp, veteriner hekimlik, haber İngilizcesi ve IELTS çalışacağız.

**Deneyebileceklerin:**
- "Veteriner tıbbında 5 terim öğret"
- "Bu cümlem doğru mu: I have been to hospital yesterday"
- 🎭 Rol yapma senaryolarından birini seç
- 🎙️ Mikrofona basıp İngilizce konuş

Ne çalışmak istersin?`)}</div></div></div>`;
};

Chat.msgHTML = function (m, i) {
  if (m.role === 'user') {
    return `<div class="chat-msg user"><div class="chat-avatar">👤</div><div><div class="chat-bubble">${esc(m.text)}</div></div></div>`;
  }
  REG.chat[i] = m.vocab || [];
  const fix = m.fix ? this.fixHTML(m.fix) : '';
  const vocab = (m.vocab || []).length ? `<div class="chat-vocab-row">${m.vocab.map((w, vi) => {
    const saved = isSaved(w.en);
    return `<div class="chat-vocab-mini">
      <div class="cvm-cat">${esc(w.cat || '')}</div>
      <div class="cvm-en">${esc(w.en)}</div>
      <div class="cvm-tr">${esc(w.tr)}</div>
      ${w.pron ? `<div class="cvm-pron">/${esc(w.pron)}/</div>` : ''}
      ${w.example ? `<div class="cvm-ex">"${esc(w.example)}"</div>` : ''}
      <div class="cvm-actions">
        <button class="cvm-speak" data-act="speak" data-text="${attr(w.en)}">🔊</button>
        <button class="cvm-star ${saved ? 'saved' : ''}" data-act="saveWord" data-src="chat" data-m="${i}" data-i="${vi}" data-cat="${attr(mapCat(w.cat))}">${saved ? '★' : '☆'}</button>
      </div>
    </div>`;
  }).join('')}</div>` : '';
  return `<div class="chat-msg ai"><div class="chat-avatar">📰</div><div>
    ${fix}
    <div class="chat-bubble">${md(m.text)}</div>
    <div class="bubble-tools"><button class="bt" data-act="speakMsg" data-i="${i}">🔊 Dinle</button><button class="bt" data-act="copyMsg" data-i="${i}">📋 Kopyala</button></div>
    ${vocab}
  </div></div>`;
};

Chat.fixHTML = function (f) {
  return `<div class="fix-card ${f.level === 'major' ? 'major' : ''}">
    <div class="fix-head">✏️ Düzeltme</div>
    <div class="fix-line old">${esc(f.original || '')}</div>
    <div class="fix-line new">${esc(f.corrected || '')}</div>
    ${(f.notes || []).length ? `<ul class="fix-notes">${f.notes.map(n => `<li>${esc(n)}</li>`).join('')}</ul>` : ''}
  </div>`;
};

Chat.afterRender = function () {
  const el = document.getElementById('chatMessages');
  if (el) el.scrollTop = el.scrollHeight;
  const inp = document.getElementById('chatInput');
  if (inp) {
    inp.addEventListener('input', () => { Chat.draft = inp.value; autoGrow(inp); });
    inp.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); Chat.sendFromInput(); }
    });
    autoGrow(inp);
  }
};

function autoGrow(el) { el.style.height = 'auto'; el.style.height = Math.min(160, el.scrollHeight) + 'px'; }

Chat.onLeave = function () { Mic.stop(); TTS.stop(); this.voiceMode = false; if (this.controller) { this.controller.abort(); this.streaming = false; } };

// ── GÖNDERME ─────────────────────────────────────────────
Chat.sendFromInput = function () {
  const inp = document.getElementById('chatInput');
  if (!inp) return;
  const v = inp.value.trim();
  if (!v) return;
  inp.value = ''; this.draft = ''; autoGrow(inp);
  this.send(v);
};

Chat.appendNode = function (html) {
  const box = document.getElementById('chatMessages');
  if (!box) return null;
  if (box.querySelector('.chat-msg') && this.history.length <= 1) {
    // hoşgeldin mesajını temizle
    if (this.history.length === 1) box.innerHTML = '';
  }
  const wrap = document.createElement('div');
  wrap.innerHTML = html;
  const node = wrap.firstElementChild;
  box.appendChild(node);
  box.scrollTop = box.scrollHeight;
  return node;
};

Chat.send = async function (text) {
  if (!text || !text.trim()) return;
  if (this.streaming) return;
  if (!S.cfg.apiKey) { openSettings(); return; }

  TTS.stop();
  this.history.push({ role: 'user', text: text.trim() });
  const uIdx = this.history.length - 1;
  this.appendNode(this.msgHTML(this.history[uIdx], uIdx));

  // AI kabarcığı (streaming hedefi)
  const aiWrap = this.appendNode(`<div class="chat-msg ai"><div class="chat-avatar">📰</div><div>
    <div class="chat-bubble streaming" id="liveBubble"><span class="typing-indicator"><span></span><span></span><span></span></span></div>
  </div></div>`);
  const bubble = aiWrap.querySelector('#liveBubble');
  const box = document.getElementById('chatMessages');

  this.streaming = true;
  this.controller = new AbortController();
  const btn = document.getElementById('chatSendBtn');
  if (btn) btn.textContent = '■ Durdur';

  const apiMsgs = this.history.slice(-14).map(m => ({ role: m.role === 'ai' ? 'assistant' : 'user', content: m.text }));

  let raw = '';
  try {
    raw = await callAPIStream(this.systemPrompt(), apiMsgs, {
      maxTokens: 1400,
      signal: this.controller.signal,
      onDelta: (_, full) => {
        const shown = full.replace(/###(FIX|VOCAB)###[\s\S]*$/, '').trim();
        bubble.innerHTML = md(shown) || '<span class="typing-indicator"><span></span><span></span><span></span></span>';
        const near = box.scrollHeight - box.scrollTop - box.clientHeight < 140;
        if (near) box.scrollTop = box.scrollHeight;
      },
    });
  } catch (e) {
    if (e.name === 'AbortError') { raw = raw || '_(durduruldu)_'; }
    else {
      this.streaming = false;
      if (btn) btn.textContent = 'Gönder →';
      bubble.classList.remove('streaming');
      bubble.innerHTML = md('⚠️ ' + (e.message === 'NO_API_KEY' ? 'API anahtarı gerekli — ⚙️ Ayarlar' : e.message));
      this.history.push({ role: 'ai', text: '⚠️ ' + e.message, vocab: [] });
      this.save();
      return;
    }
  }

  const { text: clean, vocab, fix } = splitBlocks(raw);
  this.history.push({ role: 'ai', text: clean, vocab, fix });
  this.save();
  addXP(2);

  // Kabarcığı tam sürümle değiştir
  const idx = this.history.length - 1;
  const finalWrap = document.createElement('div');
  finalWrap.innerHTML = this.msgHTML(this.history[idx], idx);
  aiWrap.replaceWith(finalWrap.firstElementChild);
  box.scrollTop = box.scrollHeight;

  this.streaming = false;
  this.controller = null;
  if (btn) btn.textContent = 'Gönder →';

  if (S.cfg.autoSpeak || this.voiceMode) {
    TTS.speak(englishOnly(clean), {
      onEnd: () => { if (this.voiceMode && S.cfg.autoListen) this.startMic(); },
    });
  } else if (this.voiceMode && S.cfg.autoListen) this.startMic();
};

/** Seslendirme için: Türkçe açıklamalardan çok İngilizce cümleleri okumaya çalış */
function englishOnly(t) {
  const quoted = t.match(/"([^"]{8,})"/g);
  if (quoted && quoted.length >= 2) return quoted.map(q => q.replace(/"/g, '')).join('. ');
  return t.replace(/\*\*/g, '').slice(0, 700);
}

Chat.save = function () {
  this.history = this.history.slice(-60);
  LS.set('eh_chat', this.history);
};

// ── MİKROFON ─────────────────────────────────────────────
Chat.startMic = function () {
  const status = document.getElementById('micStatus');
  const btn = document.getElementById('micBtn');
  const inp = document.getElementById('chatInput');
  if (!Mic.supported) { showToast('Bu tarayıcı mikrofon tanımayı desteklemiyor (Chrome/Edge dene)', 'error'); return; }
  LS.set('eh_voice_used', true); checkBadges();
  btn?.classList.add('listening');
  if (status) { status.classList.remove('hidden'); status.innerHTML = '<span class="rec-dot"></span> Dinliyorum… İngilizce konuş, bitince mikrofona tekrar bas.'; }
  Mic.start({
    lang: 'en-US',
    onResult: (fin, interim) => {
      if (inp) { inp.value = (fin + ' ' + interim).trim(); autoGrow(inp); }
      if (status) status.innerHTML = '<span class="rec-dot"></span> ' + esc((fin + ' ' + interim).trim() || 'Dinliyorum…');
    },
    onEnd: (fin) => {
      btn?.classList.remove('listening');
      if (status) status.classList.add('hidden');
      const t = (inp?.value || fin || '').trim();
      if (t) { if (inp) inp.value = ''; Chat.send(t); }
    },
    onError: () => { btn?.classList.remove('listening'); if (status) status.classList.add('hidden'); },
  });
};

// ── AKSİYONLAR ───────────────────────────────────────────
Object.assign(ACTIONS, {
  chatSend: () => {
    if (Chat.streaming) { Chat.controller?.abort(); return; }
    Chat.sendFromInput();
  },
  chatQuick: (d) => Chat.send(d.q),
  chatTopic: (d) => { Chat.topic = d.t; LS.set('eh_chat_topic', d.t); Chat.mode = 'normal'; Chat.roleplay = null; renderTab('chat'); },
  chatRoleplay: (d) => {
    const r = ROLEPLAYS.find(x => x.id === d.r); if (!r) return;
    Chat.roleplay = r; Chat.mode = 'roleplay';
    renderTab('chat');
    Chat.send(`Rol yapmaya başlayalım: ${r.name}. Sen rolündesin, ben ${r.you} rolündeyim. İlk repliği sen ver (İngilizce, kısa).`);
  },
  chatEndRoleplay: () => {
    Chat.mode = 'normal';
    const r = Chat.roleplay; Chat.roleplay = null;
    renderTab('chat');
    if (r) Chat.send('Rol yapmayı bitirelim. Konuşmam hakkında Türkçe kısa geri bildirim ver: güçlü yanlar, 3 hata ve düzeltmesi, 5 faydalı ifade.');
  },
  chatClear: () => {
    if (!confirm('Sohbet geçmişi silinsin mi?')) return;
    Chat.history = []; Chat.save(); REG.chat = {}; renderTab('chat');
  },
  chatMic: () => {
    if (Mic.listening) { Mic.stop(); return; }
    Chat.voiceMode = true;
    Chat.startMic();
  },
  speakMsg: (d) => { const m = Chat.history[+d.i]; if (m) TTS.speak(englishOnly(m.text)); },
  copyMsg: (d) => {
    const m = Chat.history[+d.i]; if (!m) return;
    navigator.clipboard?.writeText(m.text).then(() => showToast('Kopyalandı', 'success')).catch(() => showToast('Kopyalanamadı', 'error'));
  },
});
