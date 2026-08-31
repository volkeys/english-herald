# The English Herald 📰

AI destekli İngilizce öğretim platformu — İnsan Tıbbı, Veteriner Tıbbı, Haber İngilizcesi, IELTS/TOEFL.
Sunucusuz, kurulumsuz, tek sayfalık bir web uygulaması. Tüm veriler tarayıcında kalır.

🔗 **Canlı:** https://volkeys.github.io/english-herald

---

## ✨ Neler var?

| Bölüm | Açıklama |
|---|---|
| 📖 **Dersler** | 7 konu, 15 ünite, 138+ kelime · çevrilebilir kartlar, telaffuz, karışık sıralı sınavlar, yanlışların özeti |
| 📰 **Günlük** | AI her gün yeni bir haber, özet, 6 kelime ve 3 soruluk mini quiz üretir |
| 🔁 **Tekrar** | SM-2 aralıklı tekrar algoritması · "bekleyen" kartlar önce gelir, klavye kısayolları |
| 📚 **Haznem** | Arama, kategori filtresi, sıralama, tekrar tarihi, CSV dışa aktarma |
| 🎓 **IELTS / TOEFL** | Writing · Speaking · Reading · Listening — hepsi AI değerlendirmeli (aşağıda) |
| 📊 **İlerleme** | XP, seviye ve unvan, gün serisi, 90 günlük aktivite haritası, 12 rozet |
| 💬 **AI Öğretmen** | Streaming (canlı akan) yanıt, sesli konuşma, anlık hata düzeltme, rol yapma senaryoları |

---

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
