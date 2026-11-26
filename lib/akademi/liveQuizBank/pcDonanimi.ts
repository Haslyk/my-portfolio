import type { LiveQuizQuestion } from '../liveQuizBank';

export const PC_LIVE_QUESTIONS: LiveQuizQuestion[] = [
  // ================= HAFTA 1 (10 Soru) =================
  {
    id: 'pc-w1-1', weekOrder: 1,
    prompt: 'Bilgisayardaki tüm parçaların üzerine takıldığı ve birbiriyle veri iletişimi kurduğu ana devre kartı hangisidir?',
    options: [
      { id: 'A', text: 'İşlemci (CPU)' },
      { id: 'B', text: 'Anakart (Motherboard)' },
      { id: 'C', text: 'Güç Kaynağı (PSU)' },
      { id: 'D', text: 'Ekran Kartı (GPU)' }
    ],
    correctOption: 'B',
    explanation: 'Anakart tüm donanım birimlerini birbirine bağlayan ana platformdur.'
  },
  {
    id: 'pc-w1-2', weekOrder: 1,
    prompt: 'Programlardan gelen aritmetik ve mantıksal komutları işleyen temel donanım hangisidir?',
    options: [
      { id: 'A', text: 'SSD' },
      { id: 'B', text: 'RAM' },
      { id: 'C', text: 'İşlemci (CPU)' },
      { id: 'D', text: 'Kasa Fanı' }
    ],
    correctOption: 'C',
    explanation: 'İşlemci (CPU) bilgisayarın komutları yürüten temel işlem birimidir.'
  },
  {
    id: 'pc-w1-3', weekOrder: 1,
    prompt: 'Aşağıdakilerden hangisi fiziksel bir donanım parçası DEĞİLDİR?',
    options: [
      { id: 'A', text: 'İşletim Sistemi' },
      { id: 'B', text: 'Klavye' },
      { id: 'C', text: 'Monitör' },
      { id: 'D', text: 'Anakart' }
    ],
    correctOption: 'A',
    explanation: 'İşletim sistemi bir yazılımdır; diğerleri elle tutulabilen fiziksel donanımdır.'
  },
  {
    id: 'pc-w1-4', weekOrder: 1,
    prompt: 'O anda açık olan programların ve geçici çalışma verilerinin hızlıca tutulduğu bellek birimi hangisidir?',
    options: [
      { id: 'A', text: 'RAM' },
      { id: 'B', text: 'HDD' },
      { id: 'C', text: 'Optik Sürücü' },
      { id: 'D', text: 'Güç Kaynağı' }
    ],
    correctOption: 'A',
    explanation: 'RAM açık uygulamaların geçici çalışma alanıdır.'
  },
  {
    id: 'pc-w1-5', weekOrder: 1,
    prompt: 'Bilgisayar kapatılsa bile işletim sistemi ve belgelerin kalıcı olarak saklandığı birim hangisidir?',
    options: [
      { id: 'A', text: 'RAM' },
      { id: 'B', text: 'SSD / Kalıcı Depolama' },
      { id: 'C', text: 'CPU Önbelleği' },
      { id: 'D', text: 'Monitör' }
    ],
    correctOption: 'B',
    explanation: 'SSD/HDD verileri elektrik kesilse bile kalıcı olarak saklar.'
  },
  {
    id: 'pc-w1-6', weekOrder: 1,
    prompt: 'Her gün okula taşınan, yerleşik ekran ve klavyeye sahip bilgisayar türü hangisidir?',
    options: [
      { id: 'A', text: 'Masaüstü Bilgisayar' },
      { id: 'B', text: 'Dizüstü Bilgisayar (Laptop)' },
      { id: 'C', text: 'Raf Tipi Sunucu' },
      { id: 'D', text: 'Oyun Konsolu' }
    ],
    correctOption: 'B',
    explanation: 'Dizüstü bilgisayarlar taşınabilirlik için ekran, klavye ve pili tek gövdede toplar.'
  },
  {
    id: 'pc-w1-7', weekOrder: 1,
    prompt: 'Çok sayıda kullanıcıya aynı anda web veya veritabanı hizmeti sunmak için tasarlanan sistem hangisidir?',
    options: [
      { id: 'A', text: 'Tablet' },
      { id: 'B', text: 'Sunucu (Server)' },
      { id: 'C', text: 'Akıllı Saat' },
      { id: 'D', text: 'Barkod Okuyucu' }
    ],
    correctOption: 'B',
    explanation: 'Sunucular kesintisiz ve yüksek eşzamanlı istekleri karşılamak için tasarlanır.'
  },
  {
    id: 'pc-w1-8', weekOrder: 1,
    prompt: 'İnternet tarayıcısı ve kelime işlemci gibi programlar bilgisayarın hangi katmanına girer?',
    options: [
      { id: 'A', text: 'Donanım' },
      { id: 'B', text: 'Yazılım' },
      { id: 'C', text: 'Güç Birimi' },
      { id: 'D', text: 'Soğutma' }
    ],
    correctOption: 'B',
    explanation: 'Programlar elle tutulamayan yazılım bileşenleridir.'
  },
  {
    id: 'pc-w1-9', weekOrder: 1,
    prompt: 'USB belleğin içindeki fotoğraf dosyası için aşağıdakilerden hangisi doğrudur?',
    options: [
      { id: 'A', text: 'USB bellek donanım, içindeki fotoğraf ise veridir.' },
      { id: 'B', text: 'Fotoğraf fiziksel bir donanım parçasıdır.' },
      { id: 'C', text: 'USB bellek yalnızca yazılım olarak kabul edilir.' },
      { id: 'D', text: 'Fotoğraf silinince USB bellek fiziksel olarak küçülür.' }
    ],
    correctOption: 'A',
    explanation: 'Fiziksel aygıt donanımdır; içinde saklanan dosyalar veridir.'
  },
  {
    id: 'pc-w1-10', weekOrder: 1,
    prompt: 'Sabit masada kullanılan, parça yükseltmeye en elverişli ayrı kasa ve monitörlü sistem hangisidir?',
    options: [
      { id: 'A', text: 'Masaüstü Bilgisayar' },
      { id: 'B', text: 'Tablet' },
      { id: 'C', text: 'E-Kitap Okuyucu' },
      { id: 'D', text: 'Akıllı Bileklik' }
    ],
    correctOption: 'A',
    explanation: 'Masaüstü kasalar geniş iç hacmiyle parça değişimi ve soğutmada avantajlıdır.'
  },

  // ================= HAFTA 2 (10 Soru) =================
  {
    id: 'pc-w2-1', weekOrder: 2,
    prompt: 'Elektrik kesildiğinde veya bilgisayar kapatıldığında kaydedilmemiş açık çalışma verilerinin silindiği birim hangisidir?',
    options: [
      { id: 'A', text: 'NVMe SSD' },
      { id: 'B', text: 'SATA HDD' },
      { id: 'C', text: 'RAM (Geçici Bellek)' },
      { id: 'D', text: 'USB Flash Bellek' }
    ],
    correctOption: 'C',
    explanation: 'RAM geçici bellektir; güç kesilince içeriği silinir.'
  },
  {
    id: 'pc-w2-2', weekOrder: 2,
    prompt: 'RAM modülü yuvaya ters yönde görünüyorsa doğru davranış nedir?',
    options: [
      { id: 'A', text: 'Çentik yönü ve yuva uyumu kontrol edilmeli, zorlanmamalıdır.' },
      { id: 'B', text: 'Mandal kapatılıp daha güçlü bastırılmalıdır.' },
      { id: 'C', text: 'Yan yuvaya çapraz şekilde takılmalıdır.' },
      { id: 'D', text: 'Bilgisayar açıkken takılıp BIOS’tan düzeltilmelidir.' }
    ],
    correctOption: 'A',
    explanation: 'RAM çentiği yuva çıkıntısıyla eşleşmeden asla bastırılmamalıdır.'
  },
  {
    id: 'pc-w2-3', weekOrder: 2,
    prompt: 'Hareketli mekanik diske sahip olmayan, hızlı kalıcı depolama birimi hangisidir?',
    options: [
      { id: 'A', text: 'HDD' },
      { id: 'B', text: 'SSD' },
      { id: 'C', text: 'Optik Sürücü (DVD)' },
      { id: 'D', text: 'RAM' }
    ],
    correctOption: 'B',
    explanation: 'SSD yarı iletken bellek yongaları kullandığı için mekanik parça içermez.'
  },
  {
    id: 'pc-w2-4', weekOrder: 2,
    prompt: 'RAM kapasitesini 8 GB’tan 16 GB’a çıkarmak aşağıdakilerden hangisini doğrudan artırır?',
    options: [
      { id: 'A', text: 'Aynı anda akıcı çalıştırılabilecek program ve sekme kapasitesini' },
      { id: 'B', text: 'SSD içindeki fotoğraf depolama alanını' },
      { id: 'C', text: 'Monitörün inç boyutunu' },
      { id: 'D', text: 'İnternet servis sağlayıcı hızını' }
    ],
    correctOption: 'A',
    explanation: 'RAM geçici çalışma alanıdır; kalıcı disk alanını büyütmez.'
  },
  {
    id: 'pc-w2-5', weekOrder: 2,
    prompt: 'Masaüstü kasadan RAM sökmeden önce güvenlik için ilk yapılması gereken işlem nedir?',
    options: [
      { id: 'A', text: 'Bilgisayarı kapatıp güç kablosunu prizden çekmek' },
      { id: 'B', text: 'Monitör parlaklığını sıfırlamak' },
      { id: 'C', text: 'SSD’yi biçimlendirmek' },
      { id: 'D', text: 'Klavye ve fareyi kasa açıkken söküp takmak' }
    ],
    correctOption: 'A',
    explanation: 'İç donanıma müdahale öncesi güç tamamen kesilmelidir.'
  },
  {
    id: 'pc-w2-6', weekOrder: 2,
    prompt: 'Dönen manyetik plakalar ve okuma/yazma kafası kullanan geleneksel depolama birimi hangisidir?',
    options: [
      { id: 'A', text: 'HDD (Sabit Disk)' },
      { id: 'B', text: 'NVMe M.2 SSD' },
      { id: 'C', text: 'SD Kart' },
      { id: 'D', text: 'RAM' }
    ],
    correctOption: 'A',
    explanation: 'HDD mekanik dönen diskler kullandığı için darbelere karşı daha hassastır.'
  },
  {
    id: 'pc-w2-7', weekOrder: 2,
    prompt: 'Kamera ve fotoğraf makinelerinde yaygın olarak kullanılan küçük taşınabilir hafıza birimi hangisidir?',
    options: [
      { id: 'A', text: 'SD / microSD Kart' },
      { id: 'B', text: 'DIMM RAM Modülü' },
      { id: 'C', text: '3.5 inç HDD' },
      { id: 'D', text: 'Güç Kaynağı' }
    ],
    correctOption: 'A',
    explanation: 'SD kartlar kompakt cihazlar için tasarlanmış flash depolama kartlarıdır.'
  },
  {
    id: 'pc-w2-8', weekOrder: 2,
    prompt: 'RAM yuvasına tam oturduğunda bunu fiziksel olarak nasıl anlarız?',
    options: [
      { id: 'A', text: 'Yanlardaki kilitleme mandalları "tık" sesiyle kapanır.' },
      { id: 'B', text: 'Kasa fanları hemen durur.' },
      { id: 'C', text: 'Monitörde yeşil renk yanar.' },
      { id: 'D', text: 'USB portları kapanır.' }
    ],
    correctOption: 'A',
    explanation: 'Doğru hizalanıp oturan RAM modülünde yan mandallar yerine kilitlenir.'
  },
  {
    id: 'pc-w2-9', weekOrder: 2,
    prompt: 'DDR4 destekli bir anakarta DDR5 RAM takmaya çalışırsak ne olur?',
    options: [
      { id: 'A', text: 'Çentik konumu ve elektriksel yapı farklı olduğu için yuvaya uymaz.' },
      { id: 'B', text: 'Otomatik olarak iki kat hızlı çalışır.' },
      { id: 'C', text: 'SSD gibi kalıcı depolamaya dönüşür.' },
      { id: 'D', text: 'Anakart kendi kendine DDR5’e güncellenir.' }
    ],
    correctOption: 'A',
    explanation: 'Her DDR neslinin fiziksel çentik yeri ve voltajı farklıdır.'
  },
  {
    id: 'pc-w2-10', weekOrder: 2,
    prompt: 'İşletim sisteminin ve programların saniyeler içinde açılması için en etkili yükseltme hangisidir?',
    options: [
      { id: 'A', text: 'Mekanik HDD yerine SSD kullanmak' },
      { id: 'B', text: 'Daha büyük monitör almak' },
      { id: 'C', text: 'Kablolu fareyi kablosuzla değiştirmek' },
      { id: 'D', text: 'DVD sürücü eklemek' }
    ],
    correctOption: 'A',
    explanation: 'SSD okuma/yazma hızları HDD’ye göre katbekat yüksektir.'
  },

  // ================= HAFTA 3 (10 Soru) =================
  {
    id: 'pc-w3-1', weekOrder: 3,
    prompt: 'Bilgisayar kasası çalışıyor (fanlar dönüyor) fakat monitörde hiç görüntü yoksa ilk kontrol edilecek adım hangisidir?',
    options: [
      { id: 'A', text: 'İşlemciyi söküp termal macunu kazımak' },
      { id: 'B', text: 'Monitör gücü, görüntü kablosu ve monitör kaynak (HDMI/DP) seçimini kontrol etmek' },
      { id: 'C', text: 'SSD içindeki işletim sistemini sıfırlamak' },
      { id: 'D', text: 'Kasa fanlarının yönünü ters çevirmek' }
    ],
    correctOption: 'B',
    explanation: 'Basit fiziksel bağlantılar her zaman donanım sökümünden önce kontrol edilir.'
  },
  {
    id: 'pc-w3-2', weekOrder: 3,
    prompt: 'Monitör etiketindeki "1920 × 1080" ifadesi neyi gösterir?',
    options: [
      { id: 'A', text: 'Ekranın köşegen boyutunu' },
      { id: 'B', text: 'Ekran çözünürlüğünü (yatay ve dikey piksel sayısını)' },
      { id: 'C', text: 'Yenileme hızını (Hz)' },
      { id: 'D', text: 'Güç tüketimini (Watt)' }
    ],
    correctOption: 'B',
    explanation: '1920 × 1080 piksel cinsinden ekran çözünürlüğünü (Full HD) belirtir.'
  },
  {
    id: 'pc-w3-3', weekOrder: 3,
    prompt: 'Kasa içi hava akışında ön fanların ve arka/üst fanların ideal görevi nedir?',
    options: [
      { id: 'A', text: 'Önden serin hava alıp arkadan/üstten sıcak havayı dışarı atmak' },
      { id: 'B', text: 'Tüm fanların havayı dışarı üflemesi' },
      { id: 'C', text: 'Tüm fanların havayı içeri üflemesi' },
      { id: 'D', text: 'Yalnızca ekran kartı kapalıyken dönmesi' }
    ],
    correctOption: 'A',
    explanation: 'Düzenli giriş-çıkış akışı sıcak havanın kasa içinde birikmesini engeller.'
  },
  {
    id: 'pc-w3-4', weekOrder: 3,
    prompt: 'Bilgisayardaki tüm parçalara uygun voltajda elektrik sağlayan birim hangisidir?',
    options: [
      { id: 'A', text: 'Güç Kaynağı (PSU)' },
      { id: 'B', text: 'Anakart Pili (CMOS)' },
      { id: 'C', text: 'Ekran Kartı' },
      { id: 'D', text: 'Kasa Ön Paneli' }
    ],
    correctOption: 'A',
    explanation: 'PSU şebekeden gelen AC elektriği bileşenlerin kullandığı DC voltajlara çevirir.'
  },
  {
    id: 'pc-w3-5', weekOrder: 3,
    prompt: 'Monitör özelliklerindeki "144 Hz" değeri neyi ifade eder?',
    options: [
      { id: 'A', text: 'Ekranın saniyede 144 kez görüntüyü yenileyebildiğini' },
      { id: 'B', text: 'Ekran genişliğinin 144 cm olduğunu' },
      { id: 'C', text: 'Monitörün 144 Watt elektrik harcadığını' },
      { id: 'D', text: 'İçinde 144 adet hoparlör bulunduğunu' }
    ],
    correctOption: 'A',
    explanation: 'Hz (Hertz) ekranın saniyedeki yenileme hızını belirtir.'
  },
  {
    id: 'pc-w3-6', weekOrder: 3,
    prompt: 'Monitör özelliklerindeki "24 inç" değeri neyin ölçüsüdür?',
    options: [
      { id: 'A', text: 'Ekranın köşeden köşeye (diyagonal) uzunluğunun' },
      { id: 'B', text: 'Ekranın yalnızca kalınlığının' },
      { id: 'C', text: 'Piksel yoğunluğunun' },
      { id: 'D', text: 'Kablo uzunluğunun' }
    ],
    correctOption: 'A',
    explanation: 'Ekran boyutları köşegen (diyagonal) olarak inç cinsinden ölçülür.'
  },
  {
    id: 'pc-w3-7', weekOrder: 3,
    prompt: 'Kasa önündeki hava girişi tozla tıkanırsa fanlar dönse bile neden sistem ısınır?',
    options: [
      { id: 'A', text: 'İçeri yeterince taze serin hava giremediği için sıcak hava içeride devridaim yapar.' },
      { id: 'B', text: 'Toz elektrik akımını hızlandırır.' },
      { id: 'C', text: 'RAM kapasitesi yarıya düşer.' },
      { id: 'D', text: 'Monitör çözünürlüğü yükselir.' }
    ],
    correctOption: 'A',
    explanation: 'Hava akışının sürekliliği için hem giriş hem çıkış kanalları açık olmalıdır.'
  },
  {
    id: 'pc-w3-8', weekOrder: 3,
    prompt: 'Daha büyük inç boyutuna sahip bir monitör her zaman daha net görüntü verir mi?',
    options: [
      { id: 'A', text: 'Hayır; çözünürlük düşükse büyük ekranda pikseller belirginleşebilir.' },
      { id: 'B', text: 'Evet, boyut büyüdükçe çözünürlük otomatik artar.' },
      { id: 'C', text: 'Evet, 32 inç ekranlar her zaman 4K’dır.' },
      { id: 'D', text: 'Netlik yalnızca güç kablosuna bağlıdır.' }
    ],
    correctOption: 'A',
    explanation: 'Netlik ekran boyutu ile çözünürlüğün (piksel yoğunluğu / PPI) dengesine bağlıdır.'
  },
  {
    id: 'pc-w3-9', weekOrder: 3,
    prompt: 'Grafik ve 3D görüntü hesaplamalarını işleyip monitöre aktaran temel birim hangisidir?',
    options: [
      { id: 'A', text: 'Grafik İşlemci / Ekran Kartı (GPU)' },
      { id: 'B', text: 'Ses Kartı' },
      { id: 'C', text: 'Ağ Kartı' },
      { id: 'D', text: 'SSD' }
    ],
    correctOption: 'A',
    explanation: 'GPU görüntü verilerini işleyip monitör çıkışlarına gönderir.'
  },
  {
    id: 'pc-w3-10', weekOrder: 3,
    prompt: 'Harici ekran kartı takılı bir kasada monitör kablosu yanlışlıkla anakart çıkışına takılırsa ne olabilir?',
    options: [
      { id: 'A', text: 'Görüntü gelmeyebilir; kablo harici ekran kartı çıkışına takılmalıdır.' },
      { id: 'B', text: 'Bilgisayar iki kat daha hızlı açılır.' },
      { id: 'C', text: 'SSD verileri silinir.' },
      { id: 'D', text: 'Klavye devre dışı kalır.' }
    ],
    correctOption: 'A',
    explanation: 'Harici GPU varken görüntü çıkışı genellikle ekran kartı portlarından alınır.'
  },

  // ================= HAFTA 4 (10 Soru) =================
  {
    id: 'pc-w4-1', weekOrder: 4,
    prompt: 'Hem kullanıcıdan dokunma verisi alan hem de kullanıcıya görüntü sunan donanım hangisidir?',
    options: [
      { id: 'A', text: 'Barkod okuyucu' },
      { id: 'B', text: 'Dokunmatik ekran' },
      { id: 'C', text: 'Lazer yazıcı' },
      { id: 'D', text: 'Mikrofon' }
    ],
    correctOption: 'B',
    explanation: 'Dokunmatik ekran hem giriş hem çıkış birimi olarak çalışır.'
  },
  {
    id: 'pc-w4-2', weekOrder: 4,
    prompt: 'Kağıt üzerindeki fiziksel bir belgeyi tarayarak bilgisayara dijital görsel olarak aktaran birim hangisidir?',
    options: [
      { id: 'A', text: 'Yazıcı (Printer)' },
      { id: 'B', text: 'Tarayıcı (Scanner)' },
      { id: 'C', text: 'Çizici (Plotter)' },
      { id: 'D', text: 'Hoparlör' }
    ],
    correctOption: 'B',
    explanation: 'Tarayıcı fiziksel belgeleri dijitale aktaran bir giriş birimidir.'
  },
  {
    id: 'pc-w4-3', weekOrder: 4,
    prompt: 'Aşağıdaki bağlantı uçlarından hangisi yüksek çözünürlüklü görüntü ve sesi tek kablodan taşır?',
    options: [
      { id: 'A', text: 'HDMI' },
      { id: 'B', text: 'RJ-45' },
      { id: 'C', text: '3.5 mm Ses Jakı' },
      { id: 'D', text: 'PS/2' }
    ],
    correctOption: 'A',
    explanation: 'HDMI hem dijital video hem dijital ses sinyalini aynı kablodan taşır.'
  },
  {
    id: 'pc-w4-4', weekOrder: 4,
    prompt: 'Büyük boyutlu mimari proje ve teknik çizimlerin kağıda basılması için hangi çıkış birimi kullanılır?',
    options: [
      { id: 'A', text: 'Çizici (Plotter)' },
      { id: 'B', text: 'Barkod Okuyucu' },
      { id: 'C', text: 'Web Kamerası' },
      { id: 'D', text: 'Mikrofon' }
    ],
    correctOption: 'A',
    explanation: 'Plotter (çizici) büyük ebatlı teknik çizimler için tasarlanmıştır.'
  },
  {
    id: 'pc-w4-5', weekOrder: 4,
    prompt: 'Dijital bir 3D tasarımdan katman katman fiziksel plastik model üreten aygıt hangisidir?',
    options: [
      { id: 'A', text: '3D Yazıcı' },
      { id: 'B', text: 'Düz Yataklı Tarayıcı' },
      { id: 'C', text: 'Nokta Vuruşlu Yazıcı' },
      { id: 'D', text: 'Projeksiyon' }
    ],
    correctOption: 'A',
    explanation: '3D yazıcı dijital modeli fiziksel nesneye dönüştüren çıkış birimidir.'
  },
  {
    id: 'pc-w4-6', weekOrder: 4,
    prompt: 'Mikrofon ve web kamerası bilgisayar açısından hangi grupta yer alır?',
    options: [
      { id: 'A', text: 'Giriş (Input) Birimleri' },
      { id: 'B', text: 'Çıkış (Output) Birimleri' },
      { id: 'C', text: 'Kalıcı Depolama Birimleri' },
      { id: 'D', text: 'Soğutma Birimleri' }
    ],
    correctOption: 'A',
    explanation: 'Ses ve görüntüyü dış dünyadan bilgisayara aktardıkları için giriş birimidirler.'
  },
  {
    id: 'pc-w4-7', weekOrder: 4,
    prompt: 'Kablolu Ethernet ağ bağlantısı için bilgisayar kasasındaki RJ-45 portuna hangi kablo takılır?',
    options: [
      { id: 'A', text: 'Cat5e / Cat6 Ağ Kablosu' },
      { id: 'B', text: 'HDMI Kablosu' },
      { id: 'C', text: '3.5 mm Aux Kablosu' },
      { id: 'D', text: 'SATA Güç Kablosu' }
    ],
    correctOption: 'A',
    explanation: 'RJ-45 portu Ethernet ağ kabloları içindir.'
  },
  {
    id: 'pc-w4-8', weekOrder: 4,
    prompt: 'Kulaklıklar bilgisayara yalnızca 3.5 mm jak ile mi bağlanır?',
    options: [
      { id: 'A', text: 'Hayır; 3.5 mm jak yanında USB veya kablosuz (Bluetooth) ile de bağlanabilir.' },
      { id: 'B', text: 'Evet, başka hiçbir bağlantı türü yoktur.' },
      { id: 'C', text: 'Yalnızca RJ-45 portu üzerinden çalışır.' },
      { id: 'D', text: 'Sadece anakart içine lehimlenir.' }
    ],
    correctOption: 'A',
    explanation: 'Kulaklıklar farklı arayüzlerle (3.5mm, USB, Bluetooth) kullanılabilir.'
  },
  {
    id: 'pc-w4-9', weekOrder: 4,
    prompt: 'Oyun kolu (Gamepad) ve barkod okuyucu hangi kategoriye girer?',
    options: [
      { id: 'A', text: 'Giriş Birimi' },
      { id: 'B', text: 'Çıkış Birimi' },
      { id: 'C', text: 'İşlem Birimi' },
      { id: 'D', text: 'Güç Birimi' }
    ],
    correctOption: 'A',
    explanation: 'Kullanıcıdan veya etiketten bilgisayara veri aktardıkları için giriş birimidirler.'
  },
  {
    id: 'pc-w4-10', weekOrder: 4,
    prompt: 'Projeksiyon cihazı ve hoparlör hangi donanım grubuna girer?',
    options: [
      { id: 'A', text: 'Çıkış Birimi' },
      { id: 'B', text: 'Giriş Birimi' },
      { id: 'C', text: 'Geçici Bellek' },
      { id: 'D', text: 'Ağ Anahtarı' }
    ],
    correctOption: 'A',
    explanation: 'Bilgisayardan kullanıcıya görüntü ve ses çıktısı verirler.'
  },

  // ================= HAFTA 5 (10 Soru) =================
  {
    id: 'pc-w5-1', weekOrder: 5,
    prompt: 'Aynı yerel ağdaki iki bilgisayara yanlışlıkla aynı IP adresi (192.168.1.25) atanırsa ne olur?',
    options: [
      { id: 'A', text: 'İki cihazın internet hızı otomatik olarak iki katına çıkar.' },
      { id: 'B', text: 'IP çakışması oluşur ve ağ bağlantısı kararsızlaşır veya kesilir.' },
      { id: 'C', text: 'Switch cihazı otomatik olarak ikinci cihaza yeni MAC adresi üretir.' },
      { id: 'D', text: 'Monitör yenileme hızı 60 Hz değerine düşer.' }
    ],
    correctOption: 'B',
    explanation: 'Aynı ağda her cihazın benzersiz bir IP adresi olmalıdır.'
  },
  {
    id: 'pc-w5-2', weekOrder: 5,
    prompt: 'Çok sayıda program aynı anda açıldığında sistem aşırı yavaşlıyorsa ilk hangi donanım kapasitesi incelenmelidir?',
    options: [
      { id: 'A', text: 'RAM kapasitesi' },
      { id: 'B', text: 'Optik sürücü hızı' },
      { id: 'C', text: 'Monitör inç boyutu' },
      { id: 'D', text: 'Klavye kablo uzunluğu' }
    ],
    correctOption: 'A',
    explanation: 'Açık programlar RAM’de tutulur; yetersiz RAM takılmalara yol açar.'
  },
  {
    id: 'pc-w5-3', weekOrder: 5,
    prompt: 'Bilgisayarın kablolu yerel ağa bağlanmasını sağlayan donanım bileşeni hangisidir?',
    options: [
      { id: 'A', text: 'Ağ Kartı (NIC / Ethernet)' },
      { id: 'B', text: 'Ses Kartı' },
      { id: 'C', text: 'Soğutucu Blok' },
      { id: 'D', text: 'Güç Kablosu' }
    ],
    correctOption: 'A',
    explanation: 'Ağ kartı (NIC) RJ-45 portu üzerinden kablolu ağ iletişimini sağlar.'
  },
  {
    id: 'pc-w5-4', weekOrder: 5,
    prompt: 'Wi-Fi’ye bağlı olmak internetin kesinlikle çalıştığını gösterir mi?',
    options: [
      { id: 'A', text: 'Hayır; cihaz yerel ağa bağlı olup dış internet hattı kesik olabilir.' },
      { id: 'B', text: 'Evet, Wi-Fi simgesi varsa internet %100 açıktır.' },
      { id: 'C', text: 'Yalnızca bilgisayar masaüstü ise doğrudur.' },
      { id: 'D', text: 'Wi-Fi sadece internet varsa açılır.' }
    ],
    correctOption: 'A',
    explanation: 'Yerel ağ bağlantısı ile dış internet erişimi farklı aşamalardır.'
  },
  {
    id: 'pc-w5-5', weekOrder: 5,
    prompt: 'Fotoğraf ve video arşivi nedeniyle depolama alanı dolan bir bilgisayarda hangi birim yükseltilmelidir?',
    options: [
      { id: 'A', text: 'SSD / HDD (Kalıcı Depolama)' },
      { id: 'B', text: 'RAM' },
      { id: 'C', text: 'İşlemci Fanı' },
      { id: 'D', text: 'Ağ Kartı' }
    ],
    correctOption: 'A',
    explanation: 'Kalıcı dosya arşivi SSD/HDD üzerinde saklanır.'
  },
  {
    id: 'pc-w5-6', weekOrder: 5,
    prompt: 'Baş hareketleriyle sanal ortamı çevreye bakarak deneyimlemeye dayalı sistem hangisidir?',
    options: [
      { id: 'A', text: 'Sanal Gerçeklik (VR) Başlığı' },
      { id: 'B', text: 'Çizici (Plotter)' },
      { id: 'C', text: 'Nokta Vuruşlu Yazıcı' },
      { id: 'D', text: 'Switch' }
    ],
    correctOption: 'A',
    explanation: 'VR başlıkları kafa takibi ve stereo ekranla sanal ortam deneyimi sunar.'
  },
  {
    id: 'pc-w5-7', weekOrder: 5,
    prompt: 'Televizyona bağlanıp oyun koluyla salon oyunları oynamak için tasarlanan özel sistem hangisidir?',
    options: [
      { id: 'A', text: 'Oyun Konsolu' },
      { id: 'B', text: 'Raf Tipi Sunucu' },
      { id: 'C', text: 'Tarayıcı' },
      { id: 'D', text: 'Modem' }
    ],
    correctOption: 'A',
    explanation: 'Oyun konsolları TV ve gamepad odaklı optimize edilmiş sistemlerdir.'
  },
  {
    id: 'pc-w5-8', weekOrder: 5,
    prompt: 'Bir bilgisayarın "herkes için en iyi" olması mümkün müdür?',
    options: [
      { id: 'A', text: 'Hayır; kullanım amacına (ofis, oyun, taşınabilirlik, sunucu) göre ideal donanım değişir.' },
      { id: 'B', text: 'Evet, en pahalı parça her işte tek başına en iyisidir.' },
      { id: 'C', text: 'Tüm bilgisayarların işlemcisi aynıdır.' },
      { id: 'D', text: 'Yalnızca kasa rengi fark yaratır.' }
    ],
    correctOption: 'A',
    explanation: 'Donanım seçimi kullanım senaryosuna ve bütçeye göre dengelenir.'
  },
  {
    id: 'pc-w5-9', weekOrder: 5,
    prompt: 'Aynı Switch’e bağlı iki bilgisayar birbirine veri gönderebiliyorsa hangisi kesinleşir?',
    options: [
      { id: 'A', text: 'Yerel ağ bağlantıları ve IP yapılandırmaları uyumludur.' },
      { id: 'B', text: 'İkisi de internete kesinlikle bağlıdır.' },
      { id: 'C', text: 'Monitörleri aynı markadır.' },
      { id: 'D', text: 'RAM kapasiteleri eşittir.' }
    ],
    correctOption: 'A',
    explanation: 'Yerel ağ iletişimi internetten bağımsız olarak çalışabilir.'
  },
  {
    id: 'pc-w5-10', weekOrder: 5,
    prompt: 'Görüntü gelmeyen bir bilgisayarda ilk kontrol edilmemesi gereken, en son düşünülecek ağır müdahale hangisidir?',
    options: [
      { id: 'A', text: 'Hemen işlemciyi değiştirmek veya SSD’yi biçimlendirmek' },
      { id: 'B', text: 'Monitör güç kablosunu kontrol etmek' },
      { id: 'C', text: 'HDMI/DisplayPort kablosunun tam oturduğuna bakmak' },
      { id: 'D', text: 'Monitör giriş kaynağını (Input) kontrol etmek' }
    ],
    correctOption: 'A',
    explanation: 'Sorun giderme basit kontrollerden karmaşık müdahalelere doğru ilerler.'
  }
];
