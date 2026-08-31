// ═══════════════════════════════════════════════════════════
// IELTS / TOEFL — GÖREV BANKASI & DEĞERLENDİRME PROMPTLARI
// ═══════════════════════════════════════════════════════════
'use strict';

// ── WRITING TASK 2 (Academic + General ortak) ────────────
const W_TASK2 = [
  { type: 'Opinion', topic: 'Health',
    q: 'Some people believe that healthcare should be entirely funded by the government, while others argue that individuals should pay for their own treatment. To what extent do you agree or disagree?' },
  { type: 'Discussion', topic: 'Technology',
    q: 'Some people think artificial intelligence will replace doctors in diagnosing disease. Others believe human judgement can never be replaced. Discuss both views and give your own opinion.' },
  { type: 'Problem–Solution', topic: 'Public health',
    q: 'Obesity rates among children are rising rapidly in many countries. What are the main causes of this problem, and what measures could be taken to address it?' },
  { type: 'Advantage–Disadvantage', topic: 'Animals',
    q: 'Testing new medicines on animals is common practice in medical research. Do the advantages of this outweigh the disadvantages?' },
  { type: 'Two-part', topic: 'Environment',
    q: 'Antibiotic use in farming contributes to drug resistance in humans. Why is this happening, and what could governments do to reduce the risk?' },
  { type: 'Opinion', topic: 'Education',
    q: 'University education should be free for all students regardless of family income. To what extent do you agree or disagree?' },
  { type: 'Discussion', topic: 'Work',
    q: 'Some believe that remote working improves employees\' quality of life, while others feel it damages teamwork and career development. Discuss both views and give your opinion.' },
  { type: 'Problem–Solution', topic: 'Cities',
    q: 'Air pollution in large cities is causing serious respiratory illness. What are the causes, and what practical steps could be taken by city authorities?' },
  { type: 'Opinion', topic: 'Media',
    q: 'Social media platforms should be legally responsible for false health information published on them. Do you agree or disagree?' },
  { type: 'Advantage–Disadvantage', topic: 'Society',
    q: 'In many countries people are living far longer than in the past. Do the benefits of an ageing population outweigh the drawbacks?' },
  { type: 'Two-part', topic: 'Veterinary',
    q: 'Zoonotic diseases — those transmitted from animals to humans — are becoming more frequent. Why might this be, and what can be done to reduce the risk?' },
  { type: 'Discussion', topic: 'Science',
    q: 'Some argue that governments should fund basic scientific research even when it has no obvious practical use; others believe funding should target immediate problems. Discuss both views.' },
];

// ── WRITING TASK 1 — Academic (veri sözel olarak verilir) ─
const W_TASK1_A = [
  { chart: 'Line graph', q: 'The line graph below shows the number of hospital admissions for respiratory illness in three cities (London, Ankara, Toronto) between 2010 and 2024.',
    data: 'London: 2010 = 12,000; 2015 = 15,500; 2020 = 24,000 (peak); 2024 = 17,000. Ankara: 2010 = 9,000; 2015 = 13,000; 2020 = 21,500; 2024 = 19,800 (still rising slowly). Toronto: 2010 = 14,000; 2015 = 12,000; 2020 = 16,000; 2024 = 10,500 (lowest of the three by 2024).' },
  { chart: 'Bar chart', q: 'The bar chart below compares the percentage of pet owners in five countries who took their animal to a vet at least once in 2023.',
    data: 'Germany 78%, UK 74%, Türkiye 41%, Brazil 55%, Japan 62%. Dog owners were consistently ~15 points higher than cat owners in every country.' },
  { chart: 'Pie charts', q: 'The two pie charts below show the causes of death in a European country in 1980 and in 2023.',
    data: '1980: cardiovascular 42%, infectious disease 21%, cancer 18%, accidents 11%, other 8%. 2023: cardiovascular 30%, cancer 29%, dementia 14%, infectious disease 6%, accidents 7%, other 14%.' },
  { chart: 'Table', q: 'The table below shows the average number of antibiotic prescriptions per 1,000 people in four regions in 2015 and 2023.',
    data: 'Northern Europe: 380 → 290. Southern Europe: 720 → 640. South Asia: 810 → 950. North America: 660 → 500.' },
  { chart: 'Process diagram', q: 'The diagram below shows the process by which a new vaccine is developed and approved.',
    data: 'Stages: laboratory research → animal testing → Phase I (20–100 volunteers, safety) → Phase II (several hundred, dosage) → Phase III (thousands, efficacy) → regulatory review → licensing → post-market surveillance. Typical total time: 8–12 years.' },
  { chart: 'Mixed charts', q: 'The chart and table below show global spending on veterinary medicine and the share of that spending by animal type in 2023.',
    data: 'Spending: 2013 = $28bn; 2018 = $41bn; 2023 = $67bn. Share in 2023: companion animals 54%, livestock 38%, equine 5%, other 3%.' },
];

// ── WRITING TASK 1 — General Training (mektup) ───────────
const W_TASK1_G = [
  { tone: 'Formal', q: 'You recently stayed in a hospital and were unhappy with the discharge process. Write a letter to the hospital manager. In your letter: explain when you were treated, describe what went wrong, and say what action you would like them to take.' },
  { tone: 'Semi-formal', q: 'You are studying abroad and need to postpone an exam for medical reasons. Write a letter to your course tutor. Explain the situation, say what evidence you can provide, and suggest an alternative date.' },
  { tone: 'Informal', q: 'A friend is thinking of adopting a rescue dog. Write a letter to your friend. Tell them about your own experience, warn them about the costs involved, and offer to help.' },
  { tone: 'Formal', q: 'You saw an advertisement for a veterinary nursing course. Write a letter to the college. Ask about entry requirements, the cost and duration, and the placement opportunities offered.' },
];

// ── SPEAKING ─────────────────────────────────────────────
const SPK_PART1 = [
  { topic: 'Work & Study', qs: ['Do you work or are you a student?', 'What do you like most about your work or studies?', 'Is it a popular choice in your country?', 'What would you change about it?'] },
  { topic: 'Health', qs: ['Do you think you have a healthy lifestyle?', 'How often do you exercise?', 'Has your diet changed in the last few years?', 'Do people in your country worry about health?'] },
  { topic: 'Animals', qs: ['Do you have a pet, or did you have one as a child?', 'Are pets popular in your country?', 'Do you think children should look after animals?', 'How do people feel about wild animals in cities?'] },
  { topic: 'Hometown', qs: ['Where is your hometown?', 'What do you like about it?', 'Has it changed much in recent years?', 'Would you like to live there in the future?'] },
  { topic: 'Technology', qs: ['How often do you use your phone?', 'What app do you use most?', 'Has technology changed how you study?', 'Do you think people spend too much time online?'] },
  { topic: 'Food', qs: ['What is a typical meal in your country?', 'Do you prefer eating at home or out?', 'Have your tastes changed since childhood?', 'Do you enjoy cooking?'] },
  { topic: 'Reading & News', qs: ['How do you usually get the news?', 'Do you prefer reading or watching the news?', 'Do you trust the news in your country?', 'Did you read much as a child?'] },
  { topic: 'Sleep', qs: ['How many hours do you usually sleep?', 'Do you nap during the day?', 'Has your sleep pattern changed?', 'What helps you sleep well?'] },
];

const SPK_PART2 = [
  { cue: 'Describe a time when you had to explain something complicated to someone.',
    bullets: ['what you had to explain', 'who you explained it to', 'how you made it clearer', 'and explain how you felt afterwards'],
    part3: ['Why do experts sometimes struggle to explain their work?', 'Should scientists be trained in communication?', 'How has the internet changed the way information is explained to the public?'] },
  { cue: 'Describe an animal that is important in your country.',
    bullets: ['what the animal is', 'where it is usually found', 'why it matters to people', 'and explain whether its situation is changing'],
    part3: ['Should governments spend money protecting endangered species?', 'How has the relationship between humans and animals changed?', 'Is it acceptable to keep animals in zoos?'] },
  { cue: 'Describe a time you or someone you know received good medical care.',
    bullets: ['when it happened', 'what the problem was', 'what the staff did', 'and explain why you thought the care was good'],
    part3: ['What makes a good doctor?', 'Should healthcare be free at the point of use?', 'How might technology change hospitals in the next 20 years?'] },
  { cue: 'Describe a skill you would like to learn.',
    bullets: ['what the skill is', 'why you want to learn it', 'how you would learn it', 'and explain how it would change your life'],
    part3: ['Are some skills better learned young?', 'Should schools teach practical skills?', 'Do people learn differently online?'] },
  { cue: 'Describe a piece of news that interested you recently.',
    bullets: ['what the news was about', 'where you saw or heard it', 'who you discussed it with', 'and explain why it interested you'],
    part3: ['Why do people follow bad news more closely?', 'How reliable is news on social media?', 'Should news be regulated?'] },
  { cue: 'Describe a change you would like to see in your city.',
    bullets: ['what the change is', 'why it is needed', 'who it would affect', 'and explain how it could be achieved'],
    part3: ['Who should be responsible for improving cities?', 'Are cities becoming better or worse to live in?', 'How can cities be made healthier?'] },
  { cue: 'Describe a person who has influenced your career choice.',
    bullets: ['who the person is', 'how you know them', 'what they did or said', 'and explain how they influenced you'],
    part3: ['Do young people get enough career advice?', 'Is it common to change career in your country?', 'How important is job satisfaction compared with salary?'] },
  { cue: 'Describe a time you had to make a difficult decision quickly.',
    bullets: ['what the situation was', 'what options you had', 'what you decided', 'and explain whether it was the right decision'],
    part3: ['Are quick decisions usually worse than slow ones?', 'How do professionals train to decide under pressure?', 'Should important decisions be made by groups?'] },
];

// ── READING / LISTENING TEMALARI ─────────────────────────
const PASSAGE_THEMES = [
  'Tıp & halk sağlığı', 'Veteriner hekimlik & zoonoz', 'Çevre & iklim', 'Teknoloji & yapay zekâ',
  'Tarih & arkeoloji', 'Psikoloji & davranış', 'Ekonomi & çalışma hayatı', 'Biyoloji & evrim',
];
const LISTEN_TYPES = [
  { id: 'monologue', label: 'Konuşma (Section 4 — akademik ders)' },
  { id: 'dialogue', label: 'Diyalog (Section 1 — günlük durum)' },
  { id: 'consult', label: 'Klinik görüşme (doktor–hasta)' },
  { id: 'lecture', label: 'Kısa seminer (veteriner/bilim)' },
];

// ── PROMPTLAR ────────────────────────────────────────────
const BAND_RULES = `IELTS band tanımlayıcılarını gerçekçi ve KATİ biçimde uygula. Yaygın hata: her yazıya 7 vermek. Gerçek dağılım şöyledir:
- Band 5: sınırlı kelime, sık dilbilgisi hatası, zayıf yapı, göreve kısmen cevap.
- Band 6: anlaşılır ama hatalı; genel ifadeler; bağlaçlar mekanik.
- Band 7: net konumlanma, iyi paragraf yapısı, bazı az rastlanan kelimeler, hatalar var ama iletişimi bozmuyor.
- Band 8: tam gelişmiş fikirler, esnek kelime kullanımı, çoğu cümle hatasız.
- Band 9: nadir. Ancak neredeyse kusursuz metinlere ver.
Kelime sayısı yetersizse (Task 1 < 150, Task 2 < 250) Task Achievement/Response bandını en fazla 5 ver ve nedenini belirt.`;

const WRITING_EVAL_PROMPT = `Sen deneyimli bir IELTS Writing sınav görevlisisin (examiner). Öğrenci Türk; geri bildirimi TÜRKÇE yaz, dil örneklerini İngilizce ver.

${BAND_RULES}

YALNIZCA şu JSON'u döndür, başka hiçbir şey yazma:
{
  "overall": 6.5,
  "criteria": [
    {"key":"Task Response","band":6.5,"comment":"Türkçe 2-3 cümle: ne iyi, ne eksik"},
    {"key":"Coherence & Cohesion","band":6,"comment":"..."},
    {"key":"Lexical Resource","band":6.5,"comment":"..."},
    {"key":"Grammatical Range & Accuracy","band":6,"comment":"..."}
  ],
  "wordCount": 268,
  "strengths": ["Türkçe madde", "..."],
  "improvements": ["Türkçe, somut ve uygulanabilir madde", "..."],
  "errors": [
    {"original":"öğrencinin yazdığı hatalı parça","corrected":"düzeltilmiş hâli","type":"grammar|vocabulary|cohesion|spelling","why":"Türkçe kısa açıklama"}
  ],
  "upgrades": [
    {"basic":"öğrencinin kullandığı basit ifade","better":"band 7-8 seviyesinde alternatif","note":"Türkçe not"}
  ],
  "modelParagraph": "Öğrencinin en zayıf paragrafının band 8 seviyesinde yeniden yazılmış hâli (İngilizce).",
  "nextStep": "Bir sonraki denemede odaklanması gereken TEK şey (Türkçe, tek cümle)."
}
errors en fazla 8, upgrades en fazla 6 madde olsun. Bantlar 0.5 adımlarla olmalı.`;

const SPEAKING_EVAL_PROMPT = `Sen deneyimli bir IELTS Speaking sınav görevlisisin. Sana öğrencinin konuşmasının OTOMATİK YAZIYA DÖKÜLMÜŞ hâli verilecek.

ÖNEMLİ: Transkript otomatik üretildiği için telaffuz bandı ancak TAHMİNİ olabilir; kelime seçimi, akıcılık ve dilbilgisi güvenilir biçimde değerlendirilebilir. Telaffuz yorumunda bunu belirt.
${BAND_RULES}

YALNIZCA şu JSON'u döndür:
{
  "overall": 6.5,
  "criteria": [
    {"key":"Fluency & Coherence","band":6.5,"comment":"Türkçe yorum"},
    {"key":"Lexical Resource","band":6,"comment":"..."},
    {"key":"Grammatical Range & Accuracy","band":6,"comment":"..."},
    {"key":"Pronunciation (tahmini)","band":6,"comment":"Transkriptten tahmin edildiğini belirt"}
  ],
  "wordCount": 180,
  "fillerWords": ["um","like"],
  "strengths": ["..."],
  "improvements": ["..."],
  "errors": [{"original":"...","corrected":"...","type":"grammar|vocabulary","why":"Türkçe açıklama"}],
  "upgrades": [{"basic":"...","better":"...","note":"Türkçe not"}],
  "modelAnswer": "Aynı soruya band 8 seviyesinde örnek cevap (İngilizce, 150-200 kelime, doğal konuşma dili).",
  "nextStep": "Tek cümlelik Türkçe öneri."
}`;

const READING_GEN_PROMPT = `Sen IELTS Academic Reading materyali hazırlayan bir sınav yazarısın.

Verilen tema ve zorluk için özgün bir okuma parçası ve GERÇEK IELTS soru tipleriyle 10 soru üret.

KURALLAR
- Parça 380-480 kelime, akademik dergi/gazete üslubunda, 4-6 paragraf; her paragraf A, B, C… harfiyle etiketlenir.
- Sorular sırasıyla parçayı takip etsin. Soru tipleri: 4 adet True/False/Not Given, 3 adet çoktan seçmeli (4 şık), 3 adet cümle/özet tamamlama (parçadan EN FAZLA İKİ KELİME).
- "Not Given" gerçekten parçada bulunmayan bilgi olsun; "False" ise parçayla ÇELİŞSİN. Bu ayrımı özenle kur.
- Her sorunun açıklamasında (why) cevabın geçtiği paragraf harfini belirt.
- glossary: parçadaki 6 zor kelimenin Türkçe karşılığı.

YALNIZCA şu JSON'u döndür:
{
  "title":"Parça başlığı",
  "paragraphs":[{"label":"A","text":"..."}],
  "questions":[
    {"n":1,"type":"tfng","q":"İfade cümlesi (İngilizce)","o":["True","False","Not Given"],"a":"True","why":"Türkçe açıklama + paragraf harfi"},
    {"n":5,"type":"mcq","q":"Soru (İngilizce)","o":["A şıkkı","B","C","D"],"a":"B şıkkı","why":"..."},
    {"n":8,"type":"gap","q":"Cümle ... ile tamamlanır (NO MORE THAN TWO WORDS)","o":[],"a":"exact answer","why":"..."}
  ],
  "glossary":[{"en":"word","tr":"Türkçe","pron":"telaffuz","example":"cümle"}]
}`;

const LISTENING_GEN_PROMPT = `Sen IELTS Listening materyali hazırlayan bir sınav yazarısın. Ses, tarayıcının konuşma sentezleyicisiyle okunacak; bu yüzden metni okunmaya uygun yaz (kısaltma yok, sayılar yazıyla veya net biçimde).

KURALLAR
- 220-320 kelimelik doğal bir konuşma metni üret (istenen türe göre monolog veya iki kişilik diyalog).
- Diyalogsa satırları "A:" ve "B:" ile başlat.
- 8 soru üret: 4 not/form tamamlama (EN FAZLA İKİ KELİME veya bir sayı), 4 çoktan seçmeli (3 şık).
- Cevaplar metinde AÇIKÇA geçsin; tuzak (distractor) kullan ama adil ol.

YALNIZCA şu JSON'u döndür:
{
  "title":"Başlık",
  "context":"Türkçe tek cümle: dinleyeceğin durum",
  "script":"Okunacak tam metin",
  "questions":[
    {"n":1,"type":"gap","q":"The patient's appointment is at ______.","o":[],"a":"half past four","why":"Türkçe açıklama"},
    {"n":5,"type":"mcq","q":"Why did the caller phone?","o":["...","...","..."],"a":"...","why":"..."}
  ],
  "glossary":[{"en":"word","tr":"Türkçe","pron":"telaffuz","example":"cümle"}]
}`;

const TASK_GEN_PROMPT = `Sen IELTS sınav yazarısın. İstenen görev tipi için özgün, güncel ve sınavda çıkabilecek gerçekçilikte TEK bir görev üret.
YALNIZCA şu JSON'u döndür: {"q":"görev metni (İngilizce)","type":"görev alt tipi","topic":"konu","data":"Task 1 Academic ise grafikteki verilerin sözel dökümü, değilse boş string"}`;
