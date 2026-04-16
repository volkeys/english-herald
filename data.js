// ═══════════════════════════════════════════════════════════
// THE ENGLISH HERALD — DERS İÇERİĞİ
// ═══════════════════════════════════════════════════════════

const COLORS = {
  red:"#e05c6a", teal:"#38c9b8", green:"#3fc87a",
  purple:"#a07de8", gold:"#e8c24a", blue:"#5b9cf6", orange:"#f0944d"
};

const CONTENT = {
  tip:{label:"İnsan Tıbbı",icon:"🏥",color:"red",units:[
    {title:"Semptomlar & Tanı",source:"BBC Health",
     headline:'"Doctors warn that early diagnosis of inflammatory diseases significantly improves patient outcomes and reduces long-term complications."',
     vocab:[
      {en:"diagnosis",tr:"teşhis",pron:"daɪ.əɡˈnoʊ.sɪs",ex:"Early diagnosis saves lives.",tip:"Latince 'diagignoskein'. Prognosis ≠ Diagnosis!"},
      {en:"symptom",tr:"belirti, semptom",pron:"ˈsɪmp.təm",ex:"Fever is a common symptom of infection.",tip:"Yunanca 'symptoma' — birlikte düşmek"},
      {en:"inflammation",tr:"iltihaplanma",pron:"ɪn.flæ.məˈteɪ.ʃən",ex:"Inflammation causes redness, heat and swelling.",tip:"'Inflame' kökünden — ateşlemek"},
      {en:"chronic",tr:"kronik, uzun süreli",pron:"ˈkrɒn.ɪk",ex:"Chronic pain affects millions worldwide.",tip:"Yunanca 'chronos' — zaman. Karşıtı: acute"},
      {en:"prognosis",tr:"hastalığın seyri",pron:"prɒɡˈnoʊ.sɪs",ex:"The prognosis for recovery is excellent.",tip:"Diagnosis=teşhis, Prognosis=gelecek tahmini"},
      {en:"acute",tr:"akut, ani başlayan",pron:"əˈkjuːt",ex:"She was admitted with acute abdominal pain.",tip:"Chronic'in karşıtı: kısa süreli, şiddetli"},
      {en:"benign",tr:"iyi huylu",pron:"bɪˈnaɪn",ex:"Fortunately the tumour was benign.",tip:"Malignant=kötü huylu; Benign=iyi huylu"},
      {en:"malignant",tr:"kötü huylu, habis",pron:"məˈlɪɡ.nənt",ex:"A malignant tumour requires immediate treatment.",tip:"Latince 'malignus' — kötü doğumlu"},
     ],
     quiz:[
      {q:"'Teşhis' İngilizce?",a:"diagnosis",o:["diagnosis","prognosis","symptom","chronic"]},
      {q:'"The patient has a ___ cough for 3 months."',a:"chronic",o:["acute","chronic","mild","severe"]},
      {q:"'Benign' ne demek?",a:"iyi huylu",o:["kötü huylu","iyi huylu","iltihaplanmış","kronik"]},
      {q:"Malignant ≠ ?",a:"Benign",o:["Acute","Benign","Chronic","Severe"]},
     ]},
    {title:"Hastane & Servisler",source:"Reuters Health",
     headline:'"Emergency departments face unprecedented patient volumes as winter respiratory infections surge to record levels."',
     vocab:[
      {en:"emergency dept.",tr:"acil servis",pron:"ɪˈmɜːdʒ.ən.si",ex:"She was rushed to the emergency department.",tip:"Kısaltma: ED veya ER (emergency room)"},
      {en:"outpatient",tr:"ayakta tedavi hastası",pron:"ˈaʊt.peɪ.ʃənt",ex:"He is an outpatient at the cardiology clinic.",tip:"Karşıtı: inpatient = yatarak tedavi"},
      {en:"triage",tr:"triaj, önceliklendirme",pron:"ˈtriː.ɑːʒ",ex:"Nurses perform triage to prioritise patients.",tip:"Fransızcadan: sıralama, ayıklama"},
      {en:"discharge",tr:"taburcu etmek",pron:"dɪsˈtʃɑːrdʒ",ex:"The doctor discharged her after 3 days.",tip:"Hem fiil hem isim olarak kullanılır"},
      {en:"referral",tr:"sevk",pron:"rɪˈfɜː.rəl",ex:"I need a referral to see a specialist.",tip:"Refer → referral: uzman yönlendirmesi"},
      {en:"ward",tr:"servis, koğuş",pron:"wɔːrd",ex:"The patient is in the surgical ward.",tip:"ICU = Intensive Care Unit = Yoğun Bakım"},
      {en:"anaesthesia",tr:"anestezi",pron:"æn.əsˈθiː.zi.ə",ex:"General anaesthesia was used during surgery.",tip:"An=yok, aisthesis=hissetme"},
      {en:"suture",tr:"dikiş, sütür",pron:"ˈsuː.tʃər",ex:"The wound required five sutures.",tip:"Latince 'sutura' — dikiş"},
     ],
     quiz:[
      {q:"Acil servis kısaltması?",a:"ER",o:["ER","ICU","OPD","GP"]},
      {q:"'Triage' Türkçesi?",a:"triaj, önceliklendirme",o:["taburcu","ameliyat","triaj, önceliklendirme","sevk"]},
      {q:'"The doctor ___ the patient after recovery."',a:"discharged",o:["discharged","referred","admitted","examined"]},
      {q:"Anaesthesia kökü?",a:"An=yok + aisthesis=hissetme",o:["An=yok + aisthesis=hissetme","Ana=yukarı","Anti=karşı","Angio=damar"]},
     ]},
    {title:"Organ Sistemleri",source:"The Lancet",
     headline:'"New research reveals the liver\'s central role in metabolic disorders is far more complex than previously thought."',
     vocab:[
      {en:"cardiovascular",tr:"kalp-damar sistemi",pron:"kɑːr.di.oʊˈvæs.kjə.lər",ex:"Cardiovascular disease is the leading cause of death.",tip:"Cardio=kalp, vascular=damar"},
      {en:"respiratory",tr:"solunum sistemi",pron:"rɪˈspɪr.ə.tɔːr.i",ex:"COVID causes respiratory complications.",tip:"Respire = nefes almak"},
      {en:"gastrointestinal",tr:"sindirim sistemi",pron:"ɡæs.troʊ.ɪnˈtes.tɪ.nəl",ex:"She has gastrointestinal issues.",tip:"Gastro=mide, intestinal=bağırsak"},
      {en:"neurological",tr:"nörolojik",pron:"njʊər.əˈlɒdʒ.ɪ.kəl",ex:"A neurological exam was performed.",tip:"Neuro=sinir, logy=bilim"},
      {en:"renal",tr:"böbreklere ait",pron:"ˈriː.nəl",ex:"He was diagnosed with renal failure.",tip:"Latince 'renes' — böbrekler"},
      {en:"hepatic",tr:"karaciğere ait",pron:"hɪˈpæt.ɪk",ex:"Hepatic function tests were abnormal.",tip:"Yunanca 'hepar' — karaciğer"},
      {en:"pulmonary",tr:"akciğerlere ait",pron:"ˈpʌl.mə.ner.i",ex:"Pulmonary embolism is a life-threatening condition.",tip:"Latince 'pulmo' — akciğer"},
      {en:"musculoskeletal",tr:"kas-iskelet sistemi",pron:"mʌs.kjʊ.loʊˈskel.ɪ.təl",ex:"Arthritis is a musculoskeletal disorder.",tip:"Muscul=kas, skeletal=iskelet"},
     ],
     quiz:[
      {q:"'Hepatic' hangi organla?",a:"Karaciğer",o:["Böbrek","Karaciğer","Akciğer","Kalp"]},
      {q:"'Pulmonary' Türkçesi?",a:"akciğerlere ait",o:["böbreklere ait","akciğerlere ait","karaciğere ait","kalbe ait"]},
      {q:"'Renal failure' = ?",a:"Böbrek yetmezliği",o:["Kalp yetmezliği","Böbrek yetmezliği","Karaciğer yetmezliği","Solunum yetmezliği"]},
      {q:"Cardio + vascular = ?",a:"Kalp + damar",o:["Beyin+sinir","Kalp + damar","Mide+bağırsak","Kas+kemik"]},
     ]},
    {title:"İlaç & Tedavi",source:"BMJ",
     headline:'"Researchers call for stricter antibiotic prescription guidelines to combat the growing global threat of antimicrobial resistance."',
     vocab:[
      {en:"prescription",tr:"reçete",pron:"prɪˈskrɪp.ʃən",ex:"The doctor wrote a prescription.",tip:"Prescribe fiilinden: önceden yazmak"},
      {en:"dosage",tr:"doz, dozaj",pron:"ˈdoʊ.sɪdʒ",ex:"Follow the prescribed dosage carefully.",tip:"Dose + -age eki"},
      {en:"contraindication",tr:"kontrendikasyon",pron:"kɒn.trə.ɪn.dɪˈkeɪ.ʃən",ex:"Aspirin has contraindications in children.",tip:"Contra=karşı: kullanılmaması gereken durum"},
      {en:"placebo",tr:"plasebo",pron:"pləˈsiː.boʊ",ex:"The control group received a placebo.",tip:"Latince 'placebo' = memnun edeceğim"},
      {en:"adverse reaction",tr:"yan etki, advers reaksiyon",pron:"ˈæd.vɜːrs",ex:"Report any adverse reactions immediately.",tip:"Adverse=olumsuz etki"},
      {en:"prophylactic",tr:"koruyucu, profilaktik",pron:"prɒf.ɪˈlæk.tɪk",ex:"Prophylactic antibiotics prevent infection.",tip:"Yunanca 'prophylax' — önceden korumak"},
      {en:"intravenous (IV)",tr:"damar içi (IV)",pron:"ɪn.trəˈviː.nəs",ex:"The patient received intravenous fluids.",tip:"Intra=içine, venous=damar"},
      {en:"sedative",tr:"sakinleştirici, sedatif",pron:"ˈsed.ə.tɪv",ex:"A mild sedative was given before surgery.",tip:"Latince 'sedare' — yatıştırmak"},
     ],
     quiz:[
      {q:"'Contraindication' = ?",a:"Kullanılmaması gereken durum",o:["İlaç dozu","Kullanılmaması gereken durum","Yan etki","Tedavi süresi"]},
      {q:"'Prophylactic' Türkçesi?",a:"koruyucu, profilaktik",o:["tedavi edici","koruyucu, profilaktik","ameliyatla ilgili","acil"]},
      {q:"IV = ?",a:"Intravenous = damar içi",o:["Intensive Vital","Intravenous = damar içi","Internal Volume","Inter-Vein"]},
      {q:"'Placebo' ne işe yarar?",a:"Kontrol grubu için etkisiz madde",o:["Ağrı kesici","Kontrol grubu için etkisiz madde","Antibiyotik","Vitamin"]},
     ]},
  ]},

  vet:{label:"Veteriner Tıbbı",icon:"🐾",color:"orange",units:[
    {title:"Temel Veteriner Terimleri",source:"Veterinary Record / JAVMA",
     headline:'"Advances in veterinary diagnostics are bringing human medicine techniques to animal care, improving outcomes for companion and livestock animals alike."',
     vocab:[
      {en:"auscultation",tr:"oskültasyon, dinleme",pron:"ɔː.skʌlˈteɪ.ʃən",ex:"Auscultation of the heart revealed a murmur.",tip:"Latince 'auscultare' — dikkatle dinlemek"},
      {en:"palpation",tr:"palpasyon, elle muayene",pron:"pælˈpeɪ.ʃən",ex:"Palpation of the abdomen showed discomfort.",tip:"Latince 'palpare' — dokunmak"},
      {en:"zoonosis",tr:"zoonoz (hayvan-insan hastalığı)",pron:"zoʊ.əˈnoʊ.sɪs",ex:"Rabies is a classic example of a zoonosis.",tip:"Zoo=hayvan, nosos=hastalık. Çoğul: zoonoses"},
      {en:"neuter / spay",tr:"kısırlaştırma (erkek/dişi)",pron:"ˈnjuː.tər / speɪ",ex:"We recommend spaying female dogs at 6 months.",tip:"Neuter=genel, spay=dişi, castrate=erkek"},
      {en:"anamnesis",tr:"anamnez, hasta geçmişi",pron:"æn.æmˈniː.sɪs",ex:"A thorough anamnesis is vital in veterinary practice.",tip:"Ana=yukarı, mnesis=hafıza"},
      {en:"euthanasia",tr:"ötanazi",pron:"juː.θəˈneɪ.zi.ə",ex:"Euthanasia was performed to end the animal's suffering.",tip:"Eu=iyi, thanatos=ölüm — iyi ölüm"},
      {en:"hematology",tr:"hematoloji, kan bilimi",pron:"hiː.məˈtɒl.ə.dʒi",ex:"Hematology panel showed low platelet count.",tip:"Hema=kan, logy=bilim"},
      {en:"parenteral",tr:"parenteral (ağız dışı yol)",pron:"pəˈren.tər.əl",ex:"The drug was given parenterally by injection.",tip:"Para=yanında, enteron=bağırsak — ağız dışı"},
     ],
     quiz:[
      {q:"'Zoonosis' ne demek?",a:"Hayvan-insan geçişli hastalık",o:["Hayvan hastalığı","Hayvan-insan geçişli hastalık","Parazit","Aşı"]},
      {q:"'Spay' ne anlama gelir?",a:"Dişi hayvanı kısırlaştırmak",o:["Erkek kısırlaştırma","Dişi hayvanı kısırlaştırmak","Aşı uygulamak","Ameliyat"]},
      {q:"Euthanasia kök anlamı?",a:"Eu=iyi + thanatos=ölüm",o:["Eu=iyi + thanatos=ölüm","Anti=karşı + bios=yaşam","Neo=yeni + pathy=hastalık","Para=yanı + medic=ilaç"]},
      {q:"'Auscultation' nasıl yapılır?",a:"Stetoskopla dinleme",o:["Elle muayene","Stetoskopla dinleme","Kan testi","Röntgen"]},
     ]},
    {title:"Hayvan Hastalıkları",source:"Veterinary Clinics / AVA",
     headline:'"Emerging infectious diseases in domestic and wild animal populations pose increasing risks to both animal welfare and human health globally."',
     vocab:[
      {en:"parvovirus",tr:"parvovirus (köpek parvosu)",pron:"ˈpɑːr.voʊ.vaɪ.rəs",ex:"Canine parvovirus is highly contagious in puppies.",tip:"Parvus=küçük — çok küçük DNA virüsü"},
      {en:"distemper",tr:"distemper (köpek kızamığı)",pron:"dɪsˈtem.pər",ex:"Distemper vaccination is essential for dogs.",tip:"Köpeklerde ciddi viral hastalık"},
      {en:"feline",tr:"kediye ait, kedi",pron:"ˈfiː.laɪn",ex:"Feline leukemia virus affects cats' immune systems.",tip:"Latince 'felis' — kedi. Canine=köpeğe ait"},
      {en:"canine",tr:"köpeğe ait, köpek",pron:"ˈkeɪ.naɪn",ex:"Canine influenza is spreading in shelters.",tip:"Latince 'canis' — köpek"},
      {en:"mange",tr:"uyuz, deri hastalığı",pron:"meɪndʒ",ex:"Sarcoptic mange is highly contagious.",tip:"Fransızcadan: kaşınmak — akar parazitinden"},
      {en:"leptospirosis",tr:"leptospiroz",pron:"lep.toʊ.spaɪˈroʊ.sɪs",ex:"Leptospirosis is transmitted through contaminated water.",tip:"Zoonoz: hem hayvana hem insana geçer"},
      {en:"brucellosis",tr:"bruselloz",pron:"bruː.sɪˈloʊ.sɪs",ex:"Brucellosis in cattle can infect farm workers.",tip:"Önemli zoonoz; çiftlik hayvanlarını etkiler"},
      {en:"parasite",tr:"parazit",pron:"ˈpær.ə.saɪt",ex:"Regular deworming removes intestinal parasites.",tip:"Para=yanında, sitos=yiyecek — başkasından beslenen"},
     ],
     quiz:[
      {q:"'Feline' ne anlama gelir?",a:"Kediye ait",o:["Köpeğe ait","Kediye ait","Kuşa ait","Ata ait"]},
      {q:"Leptospirosis nasıl bulaşır?",a:"Kirli su yoluyla",o:["Hava yoluyla","Kirli su yoluyla","Doğrudan temas","Böcek sokması"]},
      {q:"'Canine' Türkçesi?",a:"Köpeğe ait",o:["Kediye ait","Köpeğe ait","İneklere ait","Atlara ait"]},
      {q:"'Mange' ne demek?",a:"Uyuz, deri hastalığı",o:["Mantar","Uyuz, deri hastalığı","Virüs","Bakteriyel enfeksiyon"]},
     ]},
    {title:"Veteriner Anatomi",source:"Veterinary Anatomy Textbook",
     headline:'"Understanding comparative anatomy between species helps veterinarians apply human medicine principles while recognising key anatomical differences."',
     vocab:[
      {en:"equine",tr:"ata ait, at",pron:"ˈiː.kwaɪn",ex:"Equine veterinarians specialise in horse medicine.",tip:"Latince 'equus' — at"},
      {en:"bovine",tr:"sığıra ait, sığır",pron:"ˈboʊ.vaɪn",ex:"Bovine respiratory disease affects cattle herds.",tip:"Latince 'bos' — sığır"},
      {en:"avian",tr:"kuşa ait, kuş",pron:"ˈeɪ.vi.ən",ex:"Avian influenza can spread to humans.",tip:"Latince 'avis' — kuş. Avian flu = kuş gribi"},
      {en:"ruminant",tr:"geviş getiren hayvan",pron:"ˈruː.mɪ.nənt",ex:"Cattle, sheep and goats are ruminants.",tip:"Rumen=mide bölmesi — inek, koyun, keçi"},
      {en:"tachycardia",tr:"taşikardi, hızlı kalp",pron:"tæk.ɪˈkɑːr.di.ə",ex:"The cat showed signs of tachycardia after stress.",tip:"Tachy=hızlı, cardia=kalp"},
      {en:"bradycardia",tr:"bradikardi, yavaş kalp",pron:"bræd.ɪˈkɑːr.di.ə",ex:"Bradycardia can occur under deep anaesthesia.",tip:"Brady=yavaş, cardia=kalp — Tachy'nin karşıtı"},
      {en:"colic",tr:"kolik, karın ağrısı",pron:"ˈkɒl.ɪk",ex:"Equine colic is a leading cause of death in horses.",tip:"Colon'dan — özellikle atlarda kritik"},
      {en:"abscess",tr:"apse, irin birikimi",pron:"ˈæb.ses",ex:"The dog had a dental abscess.",tip:"Latince 'abscessus' — uzaklaşma"},
     ],
     quiz:[
      {q:"'Equine' hangi hayvana ait?",a:"At",o:["İnek","At","Koyun","Köpek"]},
      {q:"'Avian influenza' = ?",a:"Kuş gribi",o:["Domuz gribi","Kuş gribi","At gribi","Kedi gribi"]},
      {q:"'Ruminant' Türkçesi?",a:"Geviş getiren hayvan",o:["Etçil hayvan","Geviş getiren hayvan","Otçul hayvan","Yırtıcı hayvan"]},
      {q:"Tachycardia ≠ ?",a:"Bradycardia",o:["Tachypnea","Bradycardia","Arrhythmia","Tachyphagia"]},
     ]},
    {title:"Veteriner Farmakoloji",source:"Veterinary Pharmacology Handbook",
     headline:'"Antimicrobial stewardship in veterinary medicine is increasingly critical as resistance patterns threaten both animal and human health outcomes."',
     vocab:[
      {en:"anthelmintic",tr:"antiparaziter, kurt ilacı",pron:"æn.θelˈmɪn.tɪk",ex:"Regular anthelmintic treatment prevents worm infections.",tip:"Anti=karşı, helminth=solucan"},
      {en:"antiparasitic",tr:"antiparazitik",pron:"æn.ti.pær.əˈsɪt.ɪk",ex:"Antiparasitic drugs treat internal and external parasites.",tip:"Anti=karşı, parasitic=parazitik"},
      {en:"analgesic",tr:"ağrı kesici, analjezik",pron:"æn.əlˈdʒiː.zɪk",ex:"Post-operative analgesics are essential for animal welfare.",tip:"An=yok, algesis=ağrı duyusu"},
      {en:"antimicrobial",tr:"antimikrobiyal",pron:"æn.ti.maɪˈkroʊ.bi.əl",ex:"Antimicrobial resistance is a global health threat.",tip:"Anti=karşı, micro=küçük, bial=yaşam"},
      {en:"immunosuppressant",tr:"bağışıklık baskılayıcı",pron:"ɪm.juː.noʊ.səˈpres.ənt",ex:"Immunosuppressants treat autoimmune conditions in pets.",tip:"Immuno=bağışıklık, suppress=bastırmak"},
      {en:"corticosteroid",tr:"kortikosteroid",pron:"kɔːr.tɪ.koʊˈstɪər.ɔɪd",ex:"Corticosteroids reduce inflammation rapidly.",tip:"Cortex=kabuk (böbreküstü), steroid=hormon"},
      {en:"diuretic",tr:"idrar söktürücü, diüretik",pron:"daɪ.jʊˈret.ɪk",ex:"Diuretics help manage heart failure in dogs.",tip:"Dia=yoluyla, uretikos=idrar"},
      {en:"vaccine",tr:"aşı",pron:"vækˈsiːn",ex:"Annual vaccines protect pets from deadly diseases.",tip:"Latince 'vacca'=inek. Cowpox'tan ilk aşı geldi"},
     ],
     quiz:[
      {q:"'Anthelmintic' ne işe yarar?",a:"Bağırsak kurdu ilacı",o:["Ağrı kesici","Bağırsak kurdu ilacı","Antibiyotik","Aşı"]},
      {q:"'Analgesic' Türkçesi?",a:"Ağrı kesici",o:["Ağrı kesici","Antibiyotik","Aşı","Vitamin"]},
      {q:"'Corticosteroid' ne yapar?",a:"İltihap azaltır",o:["Ağrı keser","İltihap azaltır","Parazit öldürür","İdrar söker"]},
      {q:"'Vaccine' nereden gelir?",a:"Latince vacca = inek",o:["Yunanca vaktos","Latince vacca = inek","Arapça vaksin","Fransızca vaquer"]},
     ]},
  ]},

  haberler:{label:"Gazete İngilizcesi",icon:"📰",color:"teal",units:[
    {title:"Siyaset & Ekonomi",source:"The Guardian / FT",
     headline:'"Government unveils sweeping economic reforms amid growing coalition tensions and unprecedented public pressure over the cost-of-living crisis."',
     vocab:[
      {en:"unveil",tr:"açıklamak, ortaya koymak",pron:"ʌnˈveɪl",ex:"The government unveiled a bold new policy.",tip:"Örtüyü kaldırmak → mecazi: açıklamak"},
      {en:"amid",tr:"ortasında, arasında",pron:"əˈmɪd",ex:"Talks continued amid rising tensions.",tip:"'amid controversy' = tartışmalar ortasında"},
      {en:"austerity",tr:"kemer sıkma politikası",pron:"ɒˈster.ɪ.ti",ex:"Years of austerity measures hurt public services.",tip:"Austere=sert → harcama kısıtlaması"},
      {en:"sanctions",tr:"yaptırımlar",pron:"ˈsæŋk.ʃənz",ex:"New sanctions were imposed on exports.",tip:"Genellikle çoğul kullanılır"},
      {en:"referendum",tr:"referandum, halk oylaması",pron:"ref.əˈren.dəm",ex:"They called a referendum on independence.",tip:"Latince: karar verilecek şey"},
      {en:"incumbent",tr:"görevi süren, mevcut",pron:"ɪnˈkʌm.bənt",ex:"The incumbent prime minister won re-election.",tip:"In+cumbere: üstüne yatmak → görevi üstlenen"},
      {en:"bipartisan",tr:"iki partili, ortak",pron:"baɪˈpɑːr.tɪ.zən",ex:"The bill received bipartisan support.",tip:"Bi=iki, partisan=taraftar"},
      {en:"coalition",tr:"koalisyon",pron:"koʊ.əˈlɪʃ.ən",ex:"The coalition government collapsed.",tip:"Latince 'coalescere' — birleşmek"},
     ],
     quiz:[
      {q:"'Austerity' Türkçesi?",a:"kemer sıkma politikası",o:["refah politikası","kemer sıkma politikası","vergi indirimi","seçim kampanyası"]},
      {q:"'Incumbent' = ?",a:"görevi süren, mevcut",o:["aday","görevi süren, mevcut","muhalefet","emekli"]},
      {q:"'Bipartisan' = ?",a:"iki partiden destek alan",o:["tek parti kararı","iki partiden destek alan","uluslararası","seçmenler"]},
      {q:'"The ___ government collapsed."',a:"coalition",o:["referendum","coalition","bipartisan","incumbent"]},
     ]},
    {title:"Teknoloji & AI",source:"BBC Technology / Wired",
     headline:'"Artificial intelligence breakthrough could revolutionize healthcare diagnostics within a decade, transforming how doctors identify and treat rare diseases."',
     vocab:[
      {en:"breakthrough",tr:"çığır açan gelişme",pron:"ˈbreɪk.θruː",ex:"Scientists announced a major breakthrough.",tip:"Break+through: engeli aşmak"},
      {en:"disruptive",tr:"dönüştürücü, sektörü sarsan",pron:"dɪsˈrʌp.tɪv",ex:"AI is a disruptive technology.",tip:"Disrupt=bozmak, parçalamak"},
      {en:"algorithm",tr:"algoritma",pron:"ˈæl.ɡə.rɪ.ðəm",ex:"The algorithm detects cancer with 95% accuracy.",tip:"El-Harezmi matematikçisinden geliyor"},
      {en:"data breach",tr:"veri ihlali",pron:"ˈdeɪ.tə briːtʃ",ex:"Millions affected by the data breach.",tip:"Breach=ihlal, gedik açmak"},
      {en:"generative AI",tr:"üretici yapay zeka",pron:"ˈdʒen.ər.ə.tɪv",ex:"Generative AI can write, draw and compose music.",tip:"Generate=üretmek → içerik üreten AI"},
      {en:"autonomous",tr:"özerk, bağımsız işleyen",pron:"ɔːˈtɒn.ə.məs",ex:"Autonomous vehicles are being tested on roads.",tip:"Auto=kendi, nomos=yasa → kendi kendine"},
      {en:"hallucination",tr:"halüsinasyon (AI hatası)",pron:"hə.luː.sɪˈneɪ.ʃən",ex:"AI hallucinations are a major safety concern.",tip:"AI bağlamında: modelin uydurduğu bilgi"},
      {en:"encryption",tr:"şifreleme",pron:"ɪnˈkrɪp.ʃən",ex:"End-to-end encryption protects your messages.",tip:"En+crypt(gizli)+ion"},
     ],
     quiz:[
      {q:"AI 'hallucination' = ?",a:"AI'nin uydurduğu bilgi",o:["Gerçek veri","AI'nin uydurduğu bilgi","Görüntü tanıma","Ses analizi"]},
      {q:"'Disruptive technology' = ?",a:"sektörü sarsan teknoloji",o:["eski teknoloji","sektörü sarsan teknoloji","pahalı teknoloji","savunma teknolojisi"]},
      {q:"'Autonomous' Türkçesi?",a:"özerk, bağımsız işleyen",o:["otomatik","özerk, bağımsız işleyen","manuel","uzaktan kontrollü"]},
      {q:"'Data breach' = ?",a:"veri ihlali",o:["veri yedek","veri ihlali","veri tabanı","veri aktarımı"]},
     ]},
    {title:"Sağlık & Çevre",source:"The Independent / Nature",
     headline:'"Scientists issue urgent warning: carbon emissions must peak before 2025 to avoid catastrophic and irreversible climate tipping points."',
     vocab:[
      {en:"tipping point",tr:"dönüm noktası, eşik",pron:"ˈtɪp.ɪŋ pɔɪnt",ex:"Climate scientists fear irreversible tipping points.",tip:"Dengeyi bozan kritik an"},
      {en:"pandemic",tr:"pandemi, küresel salgın",pron:"pænˈdem.ɪk",ex:"The pandemic reshaped global healthcare.",tip:"Pan=tüm, demos=halk"},
      {en:"mortality rate",tr:"ölüm oranı",pron:"mɔːrˈtæl.ɪ.ti reɪt",ex:"The mortality rate dropped significantly.",tip:"Mortal=ölümlü; morbidity=hastalık oranı"},
      {en:"biodiversity",tr:"biyoçeşitlilik",pron:"baɪ.oʊ.daɪˈvɜːr.sɪ.ti",ex:"Biodiversity loss threatens entire ecosystems.",tip:"Bio=yaşam, diversity=çeşitlilik"},
      {en:"drought",tr:"kuraklık",pron:"draʊt",ex:"The prolonged drought devastated crops.",tip:"DİKKAT: 'gh' sessiz! → draʊt"},
      {en:"net zero",tr:"net sıfır emisyon hedefi",pron:"net ˈzɪər.oʊ",ex:"The UK aims to reach net zero by 2050.",tip:"Salınan karbon = emilen karbon"},
      {en:"outbreak",tr:"salgın, patlak verme",pron:"ˈaʊt.breɪk",ex:"An outbreak of measles spread through the school.",tip:"Out=dışarı, break=kırılmak"},
      {en:"heatwave",tr:"sıcak hava dalgası",pron:"ˈhiːt.weɪv",ex:"The summer heatwave broke all records.",tip:"Heat=sıcak, wave=dalga"},
     ],
     quiz:[
      {q:"'Tipping point' = ?",a:"dönüm noktası, eşik",o:["başlangıç noktası","dönüm noktası, eşik","bitiş noktası","denge noktası"]},
      {q:"'Drought' nasıl okunur?",a:"draʊt — gh sessiz!",o:["drɒɡt","drɔːt","draʊt — gh sessiz!","drʌɡt"]},
      {q:"Pan+demos = ?",a:"tüm halk = pandemi",o:["yarı halk","tüm halk = pandemi","eski halk","şehir halkı"]},
      {q:"'Outbreak' = ?",a:"Salgın patlak vermesi",o:["Kırılma","Salgın patlak vermesi","Bitiş","Müdahale"]},
     ]},
  ]},

  gramer:{label:"Gramer",icon:"✏️",color:"purple",units:[
    {title:"Present Perfect vs Past Simple",source:"Gramer Rehberi",
     headline:'💡 Türklerin en sık yaptığı hata! "I have seen" mi, "I saw" mi? Bir kez anla, bir daha karıştırma.',
     vocab:[
      {en:"Present Perfect",tr:"Etkisi şimdi devam eden geçmiş",pron:"hæv/hæz + V3",ex:"I have seen that film. → Hâlâ öneririm",tip:"Zaman belirtilmez — şimdiki etkisi önemli"},
      {en:"Past Simple",tr:"Geçmişte kalmış eylem",pron:"V2 (saw/went)",ex:"I saw that film yesterday. → Bitti, geçti",tip:"Zaman belirtilince MUTLAKA Past Simple"},
      {en:"for / since",tr:"süre / başlangıç noktası",pron:"fɔːr / sɪns",ex:"I have lived here for 3 years / since 2021.",tip:"for+süre, since+başlangıç zamanı"},
      {en:"already / yet",tr:"zaten / henüz",pron:"ɔːl.redi / jet",ex:"I've already eaten. / Have you eaten yet?",tip:"already=olumlu cümle, yet=soru/olumsuz"},
      {en:"ever / never",tr:"hiç / hiçbir zaman",pron:"ˈev.ər / ˈnev.ər",ex:"Have you ever been to Tokyo?",tip:"PP sinyalleri: ever, never, just, already, yet"},
      {en:"used to",tr:"eskiden yapardım",pron:"juːst tuː",ex:"I used to smoke. (Artık içmiyorum)",tip:"was used to = alışkındım — FARKLI anlam!"},
     ],
     quiz:[
      {q:'"I ___ him yesterday."',a:"saw",o:["have seen","saw","have saw","seen"]},
      {q:'"I ___ here ___ 5 years."',a:"have lived / for",o:["lived / since","have lived / for","live / for","have lived / since 5 years"]},
      {q:'"___ you ever been to Paris?"',a:"Have",o:["Did","Have","Do","Were"]},
      {q:'"I\'ve ___ finished! Let\'s go."',a:"just",o:["yet","already","just","ever"]},
     ]},
    {title:"Türklerin 6 Yaygın Hatası",source:"EFL Araştırmaları",
     headline:"💡 Bu hataları öğren, bir daha yapma! İngilizce öğrenen Türklerin en yaygın hatalarından kaçınmanın kısa yolu:",
     vocab:[
      {en:"I am boring ✗ → I am bored ✓",tr:"Boring=şey sıkıcı, Bored=kişi sıkılmış",pron:"",ex:"The lecture is boring. / I am bored.",tip:"-ing=nesne sıfatı, -ed=kişi hissi"},
      {en:"He don't ✗ → He doesn't ✓",tr:"3. tekil: does, don't değil",pron:"",ex:"She doesn't like coffee at all.",tip:"He/She/It → does/doesn't"},
      {en:"I want that you come ✗",tr:"I want you to come ✓",pron:"",ex:"I want you to attend the meeting.",tip:"'İstemek ki' yapısı İngilizceye geçmez"},
      {en:"Since 3 years ✗ → For 3 years ✓",tr:"for+süre, since+başlangıç",pron:"",ex:"I've worked here for 3 years.",tip:"'3 yıldır' = for 3 years, since 2021"},
      {en:"I am agree ✗ → I agree ✓",tr:"agree zaten fiil — 'am' gerekmez",pron:"",ex:"I agree with everything you said.",tip:"agree/disagree fiil, isim/sıfat DEĞİL"},
      {en:"I didn't went ✗ → I didn't go ✓",tr:"Did'den sonra fiil yalın hâlde",pron:"",ex:"I didn't go to the party last night.",tip:"Did/does/doesn't'tan sonra fiil 1. hâl!"},
     ],
     quiz:[
      {q:'"The lecture is ___." (Sıkıcı konuşma)',a:"boring",o:["bored","boring","boredom","boringly"]},
      {q:'"She ___ like coffee."',a:"doesn't",o:["don't","doesn't","isn't","aren't"]},
      {q:'"I ___ go to school yesterday."',a:"didn't",o:["didn't went","didn't","don't","wasn't"]},
      {q:'"I\'ve lived here ___ 3 years."',a:"for",o:["since","for","during","while"]},
     ]},
  ]},

  idioms:{label:"Deyimler",icon:"🗣️",color:"gold",units:[
    {title:"Günlük Hayat Deyimleri",source:"Oxford Idioms Dictionary",
     headline:"💡 İngilizce konuşanların her gün kullandığı deyimler — bunları bilmeden akıcı konuşamazsın!",
     vocab:[
      {en:"under the weather",tr:"keyifsiz, hasta hissetmek",pron:"ˈʌn.dər ðə ˈweð.ər",ex:"I'm feeling a bit under the weather today.",tip:"Havadan etkilenmek → hasta hissetmek"},
      {en:"break the ice",tr:"ortamı yumuşatmak",pron:"breɪk ðə aɪs",ex:"He told a joke to break the ice.",tip:"Donmuş suyu kırmak → ilk adımı atmak"},
      {en:"bite the bullet",tr:"dişini sıkıp katlanmak",pron:"baɪt ðə ˈbʊl.ɪt",ex:"Just bite the bullet and get it done.",tip:"Eskiden ameliyatta kurşunu ısırırlardı"},
      {en:"cost an arm and a leg",tr:"çok pahalıya mal olmak",pron:"kɒst ən ɑːrm ænd ə leɡ",ex:"That car cost an arm and a leg.",tip:"Kol ve bacak fiyatı → inanılmaz pahalı"},
      {en:"once in a blue moon",tr:"çok nadir, ayda yılda bir",pron:"wʌns ɪn ə bluː muːn",ex:"She visits once in a blue moon.",tip:"Mavi ay çok nadir görülür"},
      {en:"the tip of the iceberg",tr:"buzdağının görünen kısmı",pron:"ðə tɪp əv ðə ˈaɪs.bɜːrɡ",ex:"These cases are just the tip of the iceberg.",tip:"Asıl büyük sorunun küçük görünen kısmı"},
      {en:"catch-22",tr:"çıkmaz, kısır döngü",pron:"kætʃ twen.ti ˈtuː",ex:"It's a catch-22: no experience, no job.",tip:"Joseph Heller romanından: kurtarılamayan döngü"},
      {en:"burn the midnight oil",tr:"gece geç çalışmak",pron:"bɜːrn ðə ˈmɪd.naɪt ɔɪl",ex:"She burned the midnight oil to finish the report.",tip:"Mum/gaz lambası bitmeden çalışmak"},
     ],
     quiz:[
      {q:"'Under the weather' = ?",a:"Hasta/keyifsiz hissetmek",o:["Hava altında","Hasta/keyifsiz hissetmek","Yağmurda olmak","Üzgün olmak"]},
      {q:"'Break the ice' = ?",a:"Ortamı yumuşatmak",o:["Buz kırmak","Ortamı yumuşatmak","Soğuk davranmak","Kavga etmek"]},
      {q:"'The tip of the iceberg' = ?",a:"Sorunun küçük görünen kısmı",o:["En büyük kısım","Sorunun küçük görünen kısmı","Buz tutmak","Çözüm"]},
      {q:"'Catch-22' = ?",a:"Kısır döngü, çıkmaz",o:["Kolay çözüm","Kısır döngü, çıkmaz","22. madde","Başarı"]},
     ]},
    {title:"Tıp & Bilim Deyimleri",source:"Medical English in Context",
     headline:"💡 Tıp ve bilim haberlerinde sık karşılaşacağın deyimler ve mecazi ifadeler:",
     vocab:[
      {en:"a bitter pill to swallow",tr:"kabullenmesi zor gerçek",pron:"ə ˈbɪt.ər pɪl",ex:"Losing the trial was a bitter pill.",tip:"Acı hapı yutmak → zor gerçeği kabullenmek"},
      {en:"on the mend",tr:"iyileşme sürecinde",pron:"ɒn ðə mend",ex:"She's on the mend after surgery.",tip:"Tıbbi bağlamda çok kullanılır"},
      {en:"back to square one",tr:"başa dönmek",pron:"bæk tə skweər wʌn",ex:"The trial failed; we're back to square one.",tip:"Kutu oyununda 1. kareye dönmek"},
      {en:"groundbreaking",tr:"çığır açan, devrim niteliğinde",pron:"ˈɡraʊnd.breɪ.kɪŋ",ex:"This is a groundbreaking study.",tip:"Yer açmak → yeni alan açmak"},
      {en:"cutting-edge",tr:"son teknoloji, en ileri",pron:"ˈkʌt.ɪŋ edʒ",ex:"Cutting-edge cancer research.",tip:"Keskin kenar → en son, en ileri"},
      {en:"trial and error",tr:"deneme yanılma",pron:"ˈtraɪ.əl ænd ˈer.ər",ex:"Science progresses through trial and error.",tip:"Bilimsel metodun özü"},
     ],
     quiz:[
      {q:"'A bitter pill to swallow' = ?",a:"Kabullenmesi zor gerçek",o:["İlaç içmek","Kabullenmesi zor gerçek","Acı tatmak","Üzülmek"]},
      {q:"'On the mend' = ?",a:"İyileşme sürecinde",o:["Hasta olmak","İyileşme sürecinde","Ameliyatta","Taburcu"]},
      {q:"'Cutting-edge' = ?",a:"Son teknoloji, en ileri",o:["Kesik","Son teknoloji, en ileri","Eski","Pahalı"]},
      {q:"'Back to square one' = ?",a:"Başa dönmek",o:["İlerleme","Başa dönmek","Yarı yolda","Bitirmek"]},
     ]},
  ]},

  ielts:{label:"IELTS / TOEFL",icon:"🎓",color:"blue",units:[
    {title:"Akademik Kelime Listesi (AWL)",source:"IELTS Cambridge / ETS TOEFL",
     headline:"💡 IELTS Band 7+ ve TOEFL 100+ için gereken akademik kelimeler — AWL'den en kritik seçmeler:",
     vocab:[
      {en:"albeit",tr:"her ne kadar, bununla birlikte",pron:"ɔːlˈbiː.ɪt",ex:"The results, albeit preliminary, are promising.",tip:"Formal: 'although' yerine kullanılır"},
      {en:"ambiguous",tr:"belirsiz, çift anlamlı",pron:"æmˈbɪɡ.ju.əs",ex:"The data is ambiguous and needs further study.",tip:"Ambi=iki taraf → iki anlama gelen"},
      {en:"coherent",tr:"tutarlı, mantıklı",pron:"koʊˈhɪər.ənt",ex:"Present a coherent argument in your essay.",tip:"Co+haerere=birlikte yapışmak"},
      {en:"paradigm",tr:"paradigma, düşünce kalıbı",pron:"ˈpær.ə.daɪm",ex:"This research challenges the existing paradigm.",tip:"Para=yanında, deigma=örnek → model"},
      {en:"empirical",tr:"ampirik, gözlem temelli",pron:"ɪmˈpɪr.ɪ.kəl",ex:"We need empirical evidence to prove the theory.",tip:"Empeiria=deneyim → deneye dayalı"},
      {en:"unprecedented",tr:"benzeri görülmemiş",pron:"ʌnˈpres.ɪ.den.tɪd",ex:"An unprecedented number of people voted.",tip:"Un+precedent: daha önce görülmemiş"},
      {en:"mitigate",tr:"hafifletmek, azaltmak",pron:"ˈmɪt.ɪ.ɡeɪt",ex:"We must mitigate the effects of climate change.",tip:"Mitis=yumuşak → şiddetini azaltmak"},
      {en:"catalyst",tr:"katalizör, tetikleyici",pron:"ˈkæt.ə.lɪst",ex:"The pandemic was a catalyst for digital change.",tip:"Kimyadan alınmış: tepkiyi hızlandıran"},
     ],
     quiz:[
      {q:"'Albeit' = ?",a:"Her ne kadar, bununla birlikte",o:["Ayrıca","Her ne kadar, bununla birlikte","Sonuç olarak","Aksine"]},
      {q:"'Empirical evidence' = ?",a:"Gözlem/deney temelli kanıt",o:["Teorik kanıt","Gözlem/deney temelli kanıt","Tarihsel kanıt","Varsayım"]},
      {q:"'Mitigate' Türkçesi?",a:"Hafifletmek, azaltmak",o:["Kötüleştirmek","Hafifletmek, azaltmak","Engellemek","Ölçmek"]},
      {q:"'Catalyst' mecazi anlamı?",a:"Değişimi tetikleyen şey",o:["Kimyasal madde","Değişimi tetikleyen şey","Engel","Çözüm"]},
     ]},
    {title:"IELTS Writing & Speaking",source:"IELTS Cambridge Official Guide",
     headline:"💡 IELTS Writing Task 2 ve Speaking Part 3'te Band 7+ almak için kullanman gereken ifadeler:",
     vocab:[
      {en:"Furthermore / Moreover",tr:"Bunun yanı sıra, üstelik",pron:"ˈfɜːr.ðər.mɔːr",ex:"Furthermore, the data supports this conclusion.",tip:"'Also'dan daha akademik ve güçlü"},
      {en:"Nevertheless",tr:"Bununla birlikte, yine de",pron:"nev.ər.ðəˈles",ex:"Nevertheless, the risks cannot be ignored.",tip:"However ile aynı ama daha güçlü"},
      {en:"In contrast / Conversely",tr:"Buna karşın, öte yandan",pron:"ɪn ˈkɒn.træst",ex:"In contrast, rural areas saw a decline.",tip:"Karşıt fikirler için kullan"},
      {en:"It could be argued that",tr:"Şunu savunmak mümkün ki",pron:"ɪt kʊd biː ˈɑːɡ.juːd",ex:"It could be argued that technology creates jobs.",tip:"Hem fikir bildirme hem mesafe koyma"},
      {en:"The evidence suggests",tr:"Kanıtlar şunu göstermekte",pron:"ðə ˈev.ɪ.dəns",ex:"The evidence suggests a strong correlation.",tip:"IELTS Writing'de altın ifade"},
      {en:"To a certain extent",tr:"Belirli bir ölçüde",pron:"tə ə ˈsɜːr.tən",ex:"To a certain extent, I agree with this view.",tip:"Agree/disagree sorusunda mükemmel başlangıç"},
      {en:"A double-edged sword",tr:"İki tarafı keskin kılıç",pron:"ə ˈdʌb.l edʒd sɔːrd",ex:"Social media is a double-edged sword.",tip:"Hem yararı hem zararı olan şey"},
      {en:"This is not to say that",tr:"Bu şunu söylemek değildir",pron:"ðɪs ɪz nɒt",ex:"This is not to say that technology is bad.",tip:"Yanlış anlaşılmayı önlemek için"},
     ],
     quiz:[
      {q:"'Furthermore' ile 'Also' farkı?",a:"Furthermore daha akademik/güçlü",o:["Aynı anlam","Furthermore daha akademik/güçlü","Also daha güçlü","İkisi de aynı"]},
      {q:"IELTS'te 'To a certain extent' ne işe yarar?",a:"Kısmi katılım ifadesi",o:["Tam katılım","Kısmi katılım ifadesi","Red ifadesi","Soru sormak için"]},
      {q:"'The evidence suggests' neden kullanılır?",a:"Kanıta dayalı güçlü ifade",o:["Şüpheli ifade","Kanıta dayalı güçlü ifade","Kişisel görüş","Varsayım"]},
      {q:"'A double-edged sword' = ?",a:"İki tarafı da etkileyen şey",o:["Tek yönlü etki","İki tarafı da etkileyen şey","Keskin argüman","Güçlü silah"]},
     ]},
  ]},

  is:{label:"İş İngilizcesi",icon:"💼",color:"green",units:[
    {title:"Toplantı & E-posta",source:"Harvard Business Review / FT",
     headline:'"Corporate leaders increasingly prioritize clear communication and emotional intelligence over technical skills in senior hiring decisions."',
     vocab:[
      {en:"agenda",tr:"gündem",pron:"əˈdʒen.də",ex:"Let's stick to the agenda.",tip:"Latince: yapılacaklar listesi"},
      {en:"stakeholder",tr:"paydaş, ilgili taraf",pron:"ˈsteɪk.hoʊl.dər",ex:"All key stakeholders must sign off on this.",tip:"Stake=pay + holder=tutan"},
      {en:"deliverable",tr:"teslim edilecek çıktı",pron:"dɪˈlɪv.ər.ə.bəl",ex:"What are the key deliverables for Q3?",tip:"Deliver=teslim etmek → teslim edilecek şey"},
      {en:"bottleneck",tr:"darboğaz",pron:"ˈbɒt.l.nek",ex:"The approval process is a major bottleneck.",tip:"Şişe boynu → iş sürecindeki engel"},
      {en:"bandwidth",tr:"kapasite, zaman/enerji",pron:"ˈbænd.wɪdθ",ex:"I don't have the bandwidth for this project.",tip:"Teknik→mecazi: zaman/enerji kapasitesi"},
      {en:"leverage",tr:"avantaj olarak kullanmak",pron:"ˈlev.ər.ɪdʒ",ex:"We can leverage our network for growth.",tip:"Kaldıraç etkisi → avantajı kullanmak"},
      {en:"scalable",tr:"ölçeklenebilir",pron:"ˈskeɪ.lə.bəl",ex:"We need a scalable business model.",tip:"Scale=ölçek → büyüdükçe işleyen"},
      {en:"KPI",tr:"Temel Performans Göstergesi",pron:"keɪ piː aɪ",ex:"What are your KPIs for this quarter?",tip:"Key Performance Indicator = ölçüm kriteri"},
     ],
     quiz:[
      {q:"'Deliverable' = ?",a:"Teslim edilecek çıktı",o:["Teslimat adresi","Teslim edilecek çıktı","Bütçe","Takvim"]},
      {q:"'I don't have the bandwidth.' = ?",a:"Zamanım/kapasitem yok",o:["İnternet yok","Zamanım/kapasitem yok","Bütçem yok","Ekibim yok"]},
      {q:"'Scalable' = ?",a:"Ölçeklenebilir",o:["Pahalı","Ölçeklenebilir","Karmaşık","Küçük"]},
      {q:"KPI açılımı?",a:"Key Performance Indicator",o:["Key Project Index","Key Performance Indicator","Key Planning Initiative","Key Process Input"]},
     ]},
  ]},
};

const TOPIC_ORDER = ["tip","vet","haberler","gramer","idioms","ielts","is"];

const CHAT_SYSTEM_PROMPT = `Sen "The English Herald" adlı Türkçe-İngilizce öğretim platformunun yapay zeka öğretmenisin.

GÖREVIN: Türk kullanıcılara İngilizce öğretmek. Gazete haberleri, tıp İngilizcesi ve veteriner tıbbına öncelik ver.

KURALLAR:
1. Türkçe açıkla, İngilizce öğret
2. Her yanıtta 3-5 yeni kelime öğret
3. Kelimeleri yanıtın SONUNA şu JSON ile ekle (ZORUNLU):

###VOCAB###
[{"en":"inflammation","tr":"iltihaplanma","cat":"medical","example":"Inflammation causes pain."}]
###END###

Kategoriler: "medical", "veterinary", "daily", "news", "grammar", "business", "ielts"
4. BBC/Reuters/Guardian/JAVMA gibi gerçek kaynaklardan örnek ver
5. Tıp ve veteriner terimlerinde Latince/Yunanca kökenini belirt
6. Yıldız (*) kullanma — düz metin yaz
7. Kısa tut, max 3 paragraf
8. Cevabın sonunda bir sonraki adımı öner`;

const DAILY_SYSTEM_PROMPT = `Sen İngilizce öğretim platformu için günlük içerik üreticisisin. 
Türk kullanıcılar için günlük İngilizce haberi ve yeni kelimeler üret.

KURAL: Yanıtın TAM OLARAK şu JSON formatında olsun, başka hiçbir şey yazma:

{
  "source": "BBC Health",
  "topic": "Tıp",
  "headline": "İngilizce haber başlığı",
  "summary": "2-3 cümle İngilizce özet",
  "tr_summary": "Türkçe özet",
  "words": [
    {"en": "kelime", "tr": "çeviri", "cat": "medical", "pron": "telaffuz", "ex": "örnek cümle", "tip": "ipucu"}
  ]
}

Kategoriler: medical, veterinary, news, daily, grammar, business, ielts
Her gün farklı bir konu seç. Bugünkü tarih için güncel ve ilginç bir haber seç.
5-6 kelime ekle. Tıp veya veteriner terimleri olursa etimoloji belirt.`;
