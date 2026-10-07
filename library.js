// ═══════════════════════════════════════════════════════════
// LIBRARY (English Herald) — her şey sayfa içinde çalar, yeni sekme açılmaz
// - Podcastlar: iTunes Search API → Apple Podcasts resmî gömülü oynatıcısı
// - Sesli kitaplar: LibriVox (kamu malı) → Internet Archive gömülü oynatıcısı
// ═══════════════════════════════════════════════════════════
(function () {
  function jsonp(url) {
    return new Promise((res, rej) => {
      const cb = '__jp' + Math.random().toString(36).slice(2), s = document.createElement('script');
      const done = (v, e) => { clearTimeout(tm); delete window[cb]; s.remove(); e ? rej(e) : res(v); };
      const tm = setTimeout(() => done(null, new Error('timeout')), 9000);
      window[cb] = v => done(v); s.onerror = () => done(null, new Error('jsonp'));
      s.src = url + (url.includes('?') ? '&' : '?') + 'callback=' + cb; document.head.appendChild(s);
    });
  }
  const norm = s => String(s || '').toLowerCase().replace(/&/g, 'and').replace(/[^a-z0-9]+/g, '');
  function closeOthers(box) { document.querySelectorAll('.lib-inl').forEach(b => { if (b !== box) { b.innerHTML = ''; b.dataset.on = ''; } }); }

  async function appleLoad(boxId, q, alt) {
    const box = document.getElementById(boxId); if (!box) return;
    if (box.dataset.on) { box.innerHTML = ''; box.dataset.on = ''; return; }
    closeOthers(box); box.dataset.on = '1'; box.innerHTML = '<div class="lib-note">Oynatıcı yükleniyor…</div>';
    try {
      const d = await jsonp('https://itunes.apple.com/search?media=podcast&limit=8&term=' + encodeURIComponent(q));
      const R = d?.results || [], names = [q].concat(alt || []).map(norm);
      const r = R.find(x => names.includes(norm(x.collectionName))) || R.find(x => names.some(n => norm(x.collectionName).startsWith(n))) || R.find(x => names.some(n => norm(x.collectionName).includes(n))) || R[0];
      if (!r?.collectionViewUrl) throw new Error('none');
      const src = r.collectionViewUrl.split('?')[0].replace(/^https:\/\/podcasts\.apple\.com\//, 'https://embed.podcasts.apple.com/');
      box.innerHTML = `<iframe class="ap-frame" title="${attr(r.collectionName)}" src="${attr(src)}" allow="autoplay *; encrypted-media *; clipboard-write"
        sandbox="allow-forms allow-popups allow-same-origin allow-scripts allow-top-navigation-by-user-activation" loading="lazy"></iframe>
        <div class="au-c">${esc(r.collectionName)} · ${esc(r.artistName || '')} · oynatıcı: Apple Podcasts</div>`;
    } catch (e) { box.dataset.on = ''; box.innerHTML = '<div class="lib-note">Oynatıcı yüklenemedi. Biraz sonra tekrar dene.</div>'; }
  }
  async function archiveLoad(boxId, q, author) {
    const box = document.getElementById(boxId); if (!box) return;
    if (box.dataset.on) { box.innerHTML = ''; box.dataset.on = ''; return; }
    closeOthers(box); box.dataset.on = '1'; box.innerHTML = '<div class="lib-note">Sesli kitap yükleniyor…</div>';
    try {
      const k = 'eh_ia_' + norm(q); let id = LS.get(k, null);
      if (!id) {
        const query = `collection:librivoxaudio AND title:(${q}) AND creator:(${author})`;
        const url = 'https://archive.org/advancedsearch.php?q=' + encodeURIComponent(query) + '&fl[]=identifier&fl[]=title&fl[]=downloads&sort[]=downloads+desc&rows=5&output=json';
        let d; try { d = await (await fetch(url)).json(); } catch { d = await jsonp(url); }
        id = d?.response?.docs?.[0]?.identifier; if (!id) throw new Error('none');
        LS.set(k, id);
      }
      box.innerHTML = `<iframe class="ia-frame" title="${attr(q)}" src="https://archive.org/embed/${encodeURIComponent(id)}?playlist=1&list_height=180" allowfullscreen loading="lazy"></iframe>
        <div class="au-c">${esc(q)} · LibriVox gönüllü okuması (kamu malı) · oynatıcı: Internet Archive</div>`;
    } catch (e) { box.dataset.on = ''; box.innerHTML = '<div class="lib-note">Sesli kitap yüklenemedi. Biraz sonra tekrar dene.</div>'; }
  }
  Object.assign(ACTIONS, {
    libApple: (d) => appleLoad(d.box, d.q, d.alt ? d.alt.split('|') : []),
    libBook: (d) => archiveLoad(d.box, d.q, d.a),
    libJump: (d) => { const el = document.getElementById('lib-' + d.k); if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' }); },
  });

  // ── VERİ ──────────────────────────────────────────────────
  // [ad (Apple'da aranan), seviye, Türkçe açıklama, alternatif adlar]
  const LEARN = [
    ['6 Minute English', 'B1', 'BBC Learning English: iki sunucu, her bölümde tek konu ve 6 yeni kelime. Sitede metni ve kelime listesi var.', ['BBC Learning English 6 Minute English']],
    ['Learning English Broadcast', 'A2–B1', 'VOA Learning English: yavaş ve sade Amerikan İngilizcesiyle haber ve hikâyeler.', ['VOA Learning English', 'Learning English Broadcast - VOA Learning English']],
    ['English Learning for Curious Minds', 'B1–B2', 'Leonardo English: ilginç konular, standart İngiliz İngilizcesi, biraz yavaş anlatım.', []],
    ['Thinking in English', 'B2', 'Yaklaşık 20 dakikalık düzenli bölümler; İngilizce düşünmeyi öğretiyor.', []],
    ["Luke's English Podcast", 'B2–C1', 'Hızlı, doğal İngiliz İngilizcesi; mizah ve konuklar.', ["Luke's ENGLISH Podcast - Learn British English with Luke Thompson"]],
  ];
  const IELTS = [
    ['IELTS Energy English Podcast', 'B2', 'All Ears English: IELTS Speaking ve Writing için strateji ve örnek cevaplar.', ['IELTS Energy']],
    ['All Ears English Podcast', 'B2', 'Doğal konuşma kalıpları ve gündelik Amerikan İngilizcesi.', []],
    ['The Rest Is History', 'C1', 'Tarih sohbeti; IELTS Listening Section 4 tarzı uzun anlatı pratiği.', []],
  ];
  const MED = [
    ['VETgirl Veterinary Continuing Education Podcasts', 'C1', 'Klinik veteriner hekimlik sürekli eğitim — gerçek meslek İngilizcesi.', ['VETgirl']],
    ['The Cone of Shame Veterinary Podcast', 'C1', 'Dr. Andy Roark: klinik konular ve hasta sahibiyle iletişim.', ['Cone of Shame']],
    ['Veterinary Vertex', 'C1', 'AVMA\'nın resmî podcastı: JAVMA ve AJVR\'deki yeni araştırmalar.', []],
    ['Inside Health', 'B2–C1', 'BBC Radio 4: sağlık ve tıp haberleri, anlaşılır dille.', []],
    ['ZOE Science & Nutrition', 'B2–C1', 'Beslenme ve sağlık bilimi; İngiltere\'de çok dinleniyor.', []],
  ];
  // Edison Podcast Metrics UK, Q1 2026 (haftalık dinleyiciler arasında erişim) — ilk 10
  const TOP = [
    ['The Joe Rogan Experience', 'Uzun söyleşiler (Amerikan İngilizcesi).'],
    ['The Diary Of A CEO with Steven Bartlett', 'İş, sağlık ve psikoloji üzerine röportajlar.'],
    ['The Rest Is Politics', 'İngiliz siyaseti; tartışma ve fikir bildirme dili (IELTS Writing Task 2 için iyi).'],
    ['The Rest Is History', 'Tarih anlatısı.'],
    ['Newscast', 'BBC News günlük haber podcastı.'],
    ['The Rest Is Football', 'Futbol sohbeti.'],
    ['That Peter Crouch Podcast', 'Mizah ve futbol.'],
    ['The News Agents', 'Güncel haber ve analiz.'],
    ['Americast', 'BBC: Amerikan siyaseti.'],
    ['Crime Junkie', 'Gerçek suç hikâyeleri.'],
  ];
  // LibriVox (kamu malı) — öğrenen için uygun klasikler; hayvanlarla ilgili olanlar işaretli
  const BOOKS = [
    ['Black Beauty', 'Anna Sewell', 'B1', '🐴 Bir atın gözünden hayvan refahı — veteriner için ideal.'],
    ['The Call of the Wild', 'London', 'B2', '🐕 Kızak köpeği Buck\'ın hikâyesi.'],
    ['White Fang', 'London', 'B2', '🐺 Yarı kurt yarı köpek bir hayvanın hikâyesi.'],
    ["Alice's Adventures in Wonderland", 'Carroll', 'B1', 'Kısa bölümler, sade dil.'],
    ['A Christmas Carol', 'Dickens', 'B2', 'Kısa klasik roman.'],
    ['The Adventures of Sherlock Holmes', 'Doyle', 'B2', 'Her bölüm ayrı bir kısa hikâye.'],
    ['The Jungle Book', 'Kipling', 'B2', 'Hayvan hikâyeleri.'],
    ['Pride and Prejudice', 'Austen', 'C1', 'Klasik İngiliz İngilizcesi.'],
  ];

  // ── GÖRÜNÜM ───────────────────────────────────────────────
  let uid = 0;
  function podRow([n, lvl, d, alt]) {
    const id = 'ap-en-' + (uid++);
    return `<div class="lib-row"><div class="lib-row-main"><b>${esc(n)}</b>${lvl ? ` <span class="lib-lvl">${esc(lvl)}</span>` : ''}<div class="lib-desc">${esc(d)}</div></div>
      <button class="lib-btn" data-act="libApple" data-box="${id}" data-q="${attr(n)}" data-alt="${attr((alt || []).join('|'))}">▶ Dinle</button></div><div id="${id}" class="lib-inl"></div>`;
  }
  function sec(id, icon, title, sub, body) {
    return `<section class="panel lib-sec" id="lib-${id}"><div class="lib-h"><span class="lib-ic">${icon}</span><div><div class="lib-t">${esc(title)}</div>${sub ? `<div class="lib-sub">${sub}</div>` : ''}</div></div>${body}</section>`;
  }
  function render() {
    uid = 0;
    const nav = [['learn', '🎓 Öğrenenler için'], ['ielts', '📝 IELTS'], ['med', '🩺 Tıp & Veteriner'], ['top', '🔥 En çok dinlenenler'], ['books', '📚 Sesli kitaplar']]
      .map(([k, t]) => `<a href="#lib-${k}" data-act="libJump" data-k="${k}">${t}</a>`).join('');
    return `<div class="fade-in lib">
      <div class="section-head"><h2 class="pane-h2">🎧 Kütüphane</h2><span class="lib-sub">Dinle — podcastlar ve sesli kitaplar, sayfanın içinde</span></div>
      <div class="lib-nav">${nav}</div>
      <div class="lib-callout">▶ Her şey <b>bu sayfanın içinde</b> çalar; yeni sayfa açılmaz. Podcastlarda bölüm listesi oynatıcının içinde. Önerilen sıra: önce <b>Öğrenenler için</b> bölümünden seviyene uygun bir podcast, sonra IELTS ve meslek podcastları.</div>
      ${sec('learn', '🎓', 'Öğrenenler için podcastlar', 'Yavaş, net konuşma; çoğunun sitesinde metin de var', `<div class="lib-list">${LEARN.map(podRow).join('')}</div>`)}
      ${sec('ielts', '📝', 'IELTS ve akademik dinleme', 'Speaking/Writing stratejileri ve uzun anlatı pratiği', `<div class="lib-list">${IELTS.map(podRow).join('')}</div>`)}
      ${sec('med', '🩺', 'Tıp ve veteriner hekimlik', 'Meslek İngilizcesi — klinik konular, araştırma, hasta sahibiyle iletişim', `<div class="lib-list">${MED.map(podRow).join('')}</div>`)}
      ${sec('top', '🔥', 'İngiltere\'de en çok dinlenen podcastlar', 'Edison Podcast Metrics UK, 2026 1. çeyrek — ilk 10 (öneri)',
        `<p class="lib-p">İngilizlerin en çok dinlediği programlar: doğal, hızlı günlük İngilizce. B2 ve üstü için iyi bir hedef.</p>
         <div class="lib-list">${TOP.map(([n, d], i) => podRow([n, '', `${i + 1}. ${d}`, []])).join('')}</div>`)}
      ${sec('books', '📚', 'Sesli kitaplar — LibriVox', 'Kamu malı klasikler, gönüllü okumalar; ücretsiz',
        `<p class="lib-p">Oynatıcıda bölüm listesi var; her gün bir bölüm dinlemek iyi bir alışkanlık. Hayvanlarla ilgili kitaplar (🐴🐕🐺) mesleğine yakın kelimeler içerir.</p>
         <div class="lib-list">${BOOKS.map(([t, a, lvl, d], i) => `<div class="lib-row"><div class="lib-row-main"><b>${esc(t)}</b> <span class="lib-lvl">${esc(lvl)}</span><div class="lib-desc">${esc(d)}</div></div>
           <button class="lib-btn" data-act="libBook" data-box="ia-${i}" data-q="${attr(t)}" data-a="${attr(a)}">▶ Dinle</button></div><div id="ia-${i}" class="lib-inl"></div>`).join('')}</div>`)}
    </div>`;
  }
  window.Library = { render };
})();
