# The English Herald 📰

AI destekli İngilizce öğretim platformu — İnsan Tıbbı, Veteriner Tıbbı, Haber İngilizcesi, IELTS/TOEFL.
Sunucusuz, kurulumsuz, tek sayfalık bir web uygulaması. Tüm veriler tarayıcında kalır.

🔗 **Canlı:** https://volkeys.github.io/english-herald

---

## ✨ Neler var?

| Bölüm | Açıklama |
|---|---|
| 📖 **Dersler** | 7 konu, 15 ünite, 138 ders kelimesi (+ **1 962 kelimelik kürasyonlu sözlük**) · çevrilebilir kartlar, telaffuz, karışık sıralı sınavlar, yanlışların özeti |
| 📰 **Günlük** | **Her gün otomatik yenilenen brifing** — aşağıda |
| 🔁 **Tekrar** | SM-2 aralıklı tekrar algoritması · "bekleyen" kartlar önce gelir, klavye kısayolları |
| 📚 **Haznem** | Üç mod: ⭐ *Haznem* (arama, filtre, sıralama, tekrar tarihi, CSV dışa aktarma) · 📕 **Tüm sözlük — 2 084 kelime** · ⚡ *Üret & içe aktar* (AI paket üreticisi + CSV içe aktarma) |
| 🎓 **IELTS / TOEFL** | Writing · Speaking · Reading · Listening — hepsi AI değerlendirmeli (aşağıda) |
| 📊 **İlerleme** | XP, seviye ve unvan, gün serisi, 90 günlük aktivite haritası, 12 rozet |
| 💬 **AI Öğretmen** | Streaming (canlı akan) yanıt, sesli konuşma, anlık hata düzeltme, rol yapma senaryoları |

---

## 📰 Günlük — her gün değişen brifing

Uygulamayı günde ilk kez açtığında brifing **kendiliğinden** hazırlanır:

**🔤 Günün kelimeleri** — 5 kelime, **API'siz çalışır**. Tarihe göre deterministik döner: aynı gün hep aynı,
ertesi gün başka. Havuzun tamamı bitmeden hiçbir kelime tekrarlanmaz; tur bittiğinde sıra yeniden karılır.

**🤖 Günün AI haberi + kelimeleri** — AI o gün için haber, Türkçe özet, 6 kelime ve 3 soruluk quiz üretir.
Son 14 günün konularını hatırlar ve tekrarlamaz.

**✏️ Günün grameri · 🗣️ Günün deyimi · 🩺 Günün mesleki ifadesi** — her gün biri. Mesleki ifadeler
vaka sunumu, muayene notu, reçete, kötü haber verme gibi gerçek klinik bağlamlardan. Tek tıkla hazneye eklenir.

**⚡ Günlük özel promptun** — ⚙️ Ayarlar → Çalışma → *Günlük özel prompt* alanına Cowork'te her gün
çalıştırdığın promptu yapıştır. Uygulama her gün **bir kez** onu çalıştırıp sonucu burada gösterir.

**🔁 Dünün tekrarı** — dün gördüğün kelimelerden 3 soruluk hızlı test. Tamamen yerel, API gerektirmez.

---

## 📕 Sözlük — 2 084 kelime, 10 000'e giden yol

**Haznem** sekmesi artık üç modlu:

| Mod | Ne yapar |
|---|---|
| ⭐ **Haznem** | Yıldızladığın kelimeler — tekrar programına giren, SM-2 ile takip edilen liste |
| 📕 **Tüm sözlük** | **2 084 kelime.** İngilizce, Türkçe ve örnek cümlelerde arama · konu filtresi · CEFR seviye filtresi · kaynak filtresi (ders / sözlük / kendi kelimelerin) |
| ⚡ **Üret & içe aktar** | AI'a konu + seviye + adet verip yeni paket ürettirirsin, ya da hazır CSV'ni yüklersin |

### Sözlük nereden geliyor?

Üç kaynak `dict()` içinde birleşir, `en` alanına göre tekilleştirilir:

1. **Ders kelimeleri** — 138 kelime, ünitelerin içinden
2. **Kürasyonlu sözlük** (`vocab.js`) — **1 962 kelime**, elle yazıldı ve tek tek kontrol edildi.
   Konu dağılımı: tıp 300 · veteriner 255 · haber & bilim 290 · IELTS akademik + speaking 284 ·
   deyim & phrasal verb 148 · gramer (karıştırılan çiftler, kelime aileleri, eş dizim) 428 · iş & klinik iletişim 257
3. **Kendi kelimelerin** — ürettiğin paketler ve içe aktardığın CSV'ler (tarayıcında saklanır, yedeğe dahil)

Her kelimede **IPA telaffuz ve kelime türü zorunlu**: `verb: bear – bore – borne`,
`noun: criterion – criteria (irregular pl.)`, `phrasal verb: separable`.
İpucu alanı Türkçedir: yanlış dost, kelimenin aldığı edat, İngiliz/Amerikan yazım farkı,
sınavda nerede kullanılacağı ya da Türklerin sık yaptığı hata (*"do a mistake" ✗*).

### 10 000'e nasıl çıkarsın?

Sana 1 962 doğru kelime yazdım — 10 000 kelimenin tamamını elle yazıp her birinin IPA'sını ve
düzensiz hâllerini garanti edemem, ve **yanlış bir telaffuz eksik kelimeden kötüdür**: yıllarca
tekrarlarsın. O yüzden mimari şöyle: sağlam bir çekirdek + kendi büyütme aracın.

**⚡ Üret** ile: konu (ya da serbest metin — *"orthopaedic surgery"*, *"IELTS Task 1"*),
seviye ve adet (15 / 25 / 50) seç. AI paketi üretir, **kaydetmeden önce listeyi görürsün** —
telaffuzu ya da çevirisi şüpheli görüneni işaretten çıkarırsın. Sözlükte zaten olanlar otomatik elenir.
Promptta açık kural var: *"IPA'sından ya da düzensiz hâlinden emin değilsen BAŞKA BİR KELİME SEÇ."*

Günde iki 50'lik paket = ayda ~3 000 kelime. Üç ayda 10 000'i geçersin, hem de kendi mesleğinin
kelimeleriyle. **📄 CSV** ile de elindeki hazır listeyi doğrudan yükleyebilirsin
(`en,tr` zorunlu; `form, pron, ex, tip, cat, lvl` isteğe bağlı — örnek şablonu indirebilirsin).

Sözlüğe giren her kelime **her yerde** kullanılır: günün kelimeleri, tekrar programı, arama, filtreler.

## 🎓 IELTS / TOEFL Çalışma Alanı

**✍️ Writing** — Task 2 (deneme), Task 1 Academic (grafik/tablo/süreç) ve Task 1 General (mektup).
Görev bankası + AI'ın ürettiği yeni görevler · gerçek sınav süresi sayacı · canlı kelime sayacı ·
gönderdiğinde 4 IELTS kriterine göre band puanı, hata listesi ve düzeltmeleri, band yükselten
kelime alternatifleri, en zayıf paragrafının band 8 seviyesinde yeniden yazılmış hâli.

**🎙️ Speaking** — Part 1 / Part 2 (cue card + 1 dk hazırlık) / Part 3 / tam sınav.
Sorular sesli okunur, mikrofonla İngilizce cevap verirsin, tarayıcı konuşmanı yazıya çevirir,
AI 4 kritere göre puanlar ve band 8 örnek cevap verir. *(Transkript otomatik olduğu için
telaffuz bandı tahminidir — arayüzde de böyle işaretlenir.)* Mikrofonun yoksa yazarak da cevaplayabilirsin.

**📖 Reading** — AI seçtiğin temada özgün akademik pasaj üretir; 4× True/False/Not Given,
3× çoktan seçmeli, 3× boşluk doldurma. 20 dakika süre, otomatik puanlama, her soru için
paragraf referanslı açıklama, soru tipi bazında başarı dökümü ve parçadaki zor kelimeler.

**🎧 Listening** — AI diyalog/ders metni üretir, tarayıcının sesiyle okunur (hız ayarlanabilir).
Not tamamlama ve çoktan seçmeli sorular, otomatik puanlama, sonunda metnin tamamı.

**📈 Sonuçlar** — Tüm denemelerin band geçmişi, bölüm ortalamaları, trend grafiği ve
kriterlerin en zayıftan en güçlüye sıralanması.

> Ham skor → band dönüşümü resmi IELTS tablosuna göre yapılır. Writing/Speaking puanları
> AI tahminidir; gerçek sınav sonucu yerine geçmez, zayıf yönlerini görmek için kullanılır.

---

## 💬 Canlı AI Öğretmen

- **Streaming yanıt** — cevap harf harf akar, beklemezsin; istediğin an durdurabilirsin
- **Sesli konuşma** — 🎙️ tuşuna bas, İngilizce konuş; AI cevabı yazar ve sesli okur.
  Ayarlardan "AI bitince mikrofonu aç" seçersen kesintisiz sohbet olur
- **Anlık hata düzeltme** — İngilizce yazdığında önce hatanı düzeltir (eski hâli üstü çizili,
  doğrusu yeşil, nedeni Türkçe), sonra cevap verir
- **Rol yapma** — Doktor & Hasta, Veteriner Kliniği, Tıp Kongresi, İş Görüşmesi,
  Havalimanı & Seyahat, IELTS Sınav Görevlisi. Rolden çıkınca konuşmanın geri bildirimini alırsın
- Öğrettiği her kelimeyi tek tıkla haznene ekler, sohbet geçmişi saklanır

---

## 🔑 Kurulum

1. https://console.anthropic.com/settings/keys → **Create Key**
2. Uygulamayı aç → ⚙️ → **API** sekmesi → anahtarı yapıştır → Kaydet
3. Model seç: **Haiku** günlük sohbet için hızlı ve ucuz, **Sonnet** sınav puanlaması için daha isabetli

API anahtarın yalnızca senin tarayıcının `localStorage`'ında durur; hiçbir sunucuya gönderilmez,
aldığın yedeklere de dahil edilmez. İstekler doğrudan tarayıcından Anthropic'e gider.

**API anahtarı olmadan da:** tüm dersler, sınavlar, kelime haznesi, tekrar sistemi ve
Writing/Speaking görevleri çalışır. Yalnızca AI puanlaması ve içerik üretimi anahtar ister.

---

## ⚙️ Ayarlar

| Sekme | İçerik |
|---|---|
| 🔑 API | Anahtar, model seçimi |
| 🔊 Ses | TTS sesi, konuşma hızı, otomatik seslendirme, otomatik dinleme |
| 🎯 Çalışma | Günlük kelime hedefi, İngilizce seviyen (AI buna göre konuşur), hedef IELTS bandı, otomatik düzeltme |
| 💾 Veri | JSON yedek al / geri yükle, kelime haznesini CSV olarak indir, her şeyi sil |

---

## ⌨️ Kısayollar

`1`–`7` sekmeler · `Space` kartı çevir · `1/2/3` tekrar kartını değerlendir · `←` `→` kart gezinme · `Esc` kapat / sesi durdur

---

## 📱 Çevrimdışı & mobil

Service worker sayesinde dersler, kelime haznen ve tekrar sistemi internet olmadan da çalışır
(AI özellikleri doğal olarak bağlantı ister). Telefonda "Ana ekrana ekle" dersen uygulama gibi açılır.

---

## 🛠️ Teknik

Bağımlılık yok, derleme adımı yok — düz HTML/CSS/JS.

| Dosya | İçerik |
|---|---|
| `index.html` | İskelet, ayarlar modalı, sekmeler |
| `style.css` | Tüm stiller, açık/koyu tema |
| `data.js` | Ders içeriği (7 konu, 15 ünite) ve günlük içerik promptu |
| `vocab.js` | **Kürasyonlu sözlük — 1 962 kelime**, hepsi IPA telaffuzlu, düzensiz hâlleriyle, örnek cümleli |
| `ordlista.js` | Sözlük katmanı: `dict()` birleştirme, göz atma/arama/filtre, AI paket üreticisi, CSV içe aktarma |
| `exam-data.js` | IELTS görev bankası ve değerlendirme promptları |
| `app.js` | Çekirdek: depolama, durum, streaming API, ses, sekmeler, dersler, tekrar, hazne, ilerleme |
| `chat.js` | Canlı AI öğretmen |
| `exam.js` | IELTS/TOEFL çalışma alanı |
| `sw.js`, `manifest.json` | Çevrimdışı çalışma ve PWA |

Tüm dinamik içerik `esc()` ile kaçırılır; AI çıktısı hiçbir zaman ham HTML olarak eklenmez.
Kullanıcı etkileşimleri `data-act` öznitelikleri ve tek bir olay dinleyicisi üzerinden yürür.

### Yayınlama
Repo → Settings → Pages → Source: *Deploy from a branch* → `roots` / `root` → Save.
(Bu deponun varsayılan dalı `main` değil, **`roots`** — dosyaları oraya yükle.)

---

*The English Herald — Türkçe'den İngilizce'ye, Konu Konu, Gün Gün*
