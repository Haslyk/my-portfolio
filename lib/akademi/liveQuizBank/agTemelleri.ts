import type { LiveQuizQuestion } from '../liveQuizBank';

export const AG_LIVE_QUESTIONS: LiveQuizQuestion[] = [
  // ================= HAFTA 1 (10 Soru) =================
  {
    id: 'ag-w1-1', weekOrder: 1,
    prompt: 'Aynı yerel ağdaki (LAN) 15 bilgisayarı kabloyla birbirine bağlayıp veri çerçevelerini yalnızca hedef porta ileten cihaz hangisidir?',
    options: [
      { id: 'A', text: 'Anahtar (Switch)' },
      { id: 'B', text: 'Tekrarlayıcı (Hub)' },
      { id: 'C', text: 'DSL Modem' },
      { id: 'D', text: 'Erişim Noktası (Access Point)' }
    ],
    correctOption: 'A',
    explanation: 'Switch MAC tablosunu kullanarak çerçeveyi yalnızca hedef cihaza iletir.'
  },
  {
    id: 'ag-w1-2', weekOrder: 1,
    prompt: '"Wi-Fi Bağlı, İnternet Yok" uyarısı görüldüğünde aşağıdakilerden hangisi kesin olarak doğrudur?',
    options: [
      { id: 'A', text: 'Cihaz yerel ağa bağlanmıştır, ancak dış ağa (internete) çıkışta sorun vardır.' },
      { id: 'B', text: 'Cihazın kablosuz ağ kartı donanımsal olarak devre dışıdır.' },
      { id: 'C', text: 'Wi-Fi parolası yanlış girildiği için yerel bağlantı da kurulamamıştır.' },
      { id: 'D', text: 'Aynı ağdaki diğer cihazlara erişim tamamen imkansızdır.' }
    ],
    correctOption: 'A',
    explanation: 'Yerel kablosuz bağlantı kurulmuştur; sorun yönlendirici ötesindeki internet erişimindedir.'
  },
  {
    id: 'ag-w1-3', weekOrder: 1,
    prompt: 'Evdeki yerel ağ (LAN) ile servis sağlayıcı (İnternet) arasındaki trafiği yönlendiren temel cihaz hangisidir?',
    options: [
      { id: 'A', text: 'Switch' },
      { id: 'B', text: 'Router (Yönlendirici)' },
      { id: 'C', text: 'Access Point' },
      { id: 'D', text: 'Patch Panel' }
    ],
    correctOption: 'B',
    explanation: 'Router farklı ağlar (LAN ve WAN) arasında paket yönlendirmesi yapar.'
  },
  {
    id: 'ag-w1-4', weekOrder: 1,
    prompt: 'Telefon ve tablet gibi kablosuz cihazları mevcut kablolu yerel ağa dahil eden cihaz hangisidir?',
    options: [
      { id: 'A', text: 'Erişim Noktası (Access Point)' },
      { id: 'B', text: 'Yalnızca L2 Switch' },
      { id: 'C', text: 'RJ-45 Çoğaltıcı' },
      { id: 'D', text: 'Ağ Yazıcısı' }
    ],
    correctOption: 'A',
    explanation: 'Access Point kablosuz istemcileri kablolu yerel ağa bağlar.'
  },
  {
    id: 'ag-w1-5', weekOrder: 1,
    prompt: 'Servis sağlayıcı hattından (DSL/Kablo) gelen sinyali sayısal veriye dönüştüren cihaz hangisidir?',
    options: [
      { id: 'A', text: 'Switch' },
      { id: 'B', text: 'Modem' },
      { id: 'C', text: 'Access Point' },
      { id: 'D', text: 'Ağ Kartı (NIC)' }
    ],
    correctOption: 'B',
    explanation: 'Modem (Modulator-Demodulator) hat sinyalini sayısal veriye dönüştürür.'
  },
  {
    id: 'ag-w1-6', weekOrder: 1,
    prompt: 'İnternet kesildiğinde aynı Wi-Fi ağındaki akıllı TV’ye yerel ağ üzerinden ekran yansıtılabilmesinin nedeni nedir?',
    options: [
      { id: 'A', text: 'Yerel ağ (LAN) iletişimi dış internet hattına bağlı değildir.' },
      { id: 'B', text: 'Televizyon kendi mobil veri hattını kullanır.' },
      { id: 'C', text: 'Wi-Fi sinyali uydu üzerinden doğrudan TV’ye gider.' },
      { id: 'D', text: 'Modem internet kesilince otomatik Bluetooth’a geçer.' }
    ],
    correctOption: 'A',
    explanation: 'Aynı yerel ağdaki cihazlar internete çıkış olmadan da birbiriyle haberleşebilir.'
  },
  {
    id: 'ag-w1-7', weekOrder: 1,
    prompt: 'Bir bilgisayar ağının (network) kurulmasındaki en temel amaç nedir?',
    options: [
      { id: 'A', text: 'Cihazlar arasında veri alışverişi ve yazıcı/dosya gibi kaynak paylaşımı sağlamak' },
      { id: 'B', text: 'Bilgisayarların tekil işlemci frekansını artırmak' },
      { id: 'C', text: 'Tüm cihazlarda aynı işletim sistemini zorunlu kılmak' },
      { id: 'D', text: 'Ekran çözünürlüğünü merkezden yükseltmek' }
    ],
    correctOption: 'A',
    explanation: 'Ağlar veri iletişimi ve donanım/yazılım kaynak paylaşımı için kurulur.'
  },
  {
    id: 'ag-w1-8', weekOrder: 1,
    prompt: 'Evlerde kullanılan tek kutu "modem" cihazları genellikle hangi bileşenleri içinde barındırır?',
    options: [
      { id: 'A', text: 'Modem + Router + Küçük Switch + Access Point' },
      { id: 'B', text: 'Yalnızca DSL Modem ve Güç Kaynağı' },
      { id: 'C', text: 'Yalnızca Switch ve Yazıcı Sunucusu' },
      { id: 'D', text: 'Ekran Kartı + SSD + Router' }
    ],
    correctOption: 'A',
    explanation: 'Ev tipi cihazlar birden fazla ağ görevini tek kutuda birleştiren tümleşik cihazlardır.'
  },
  {
    id: 'ag-w1-9', weekOrder: 1,
    prompt: 'Bir ofisteki ağ yazıcısının tüm bilgisayarlar tarafından ortak kullanılabilmesi için yazıcı nereye bağlanmalıdır?',
    options: [
      { id: 'A', text: 'Aynı yerel ağdaki Switch veya Access Point’e' },
      { id: 'B', text: 'Yalnızca tek bir bilgisayarın USB portuna (paylaşımsız)' },
      { id: 'C', text: 'Doğrudan monitörün HDMI girişine' },
      { id: 'D', text: 'Komşu binadaki farklı bir ağa' }
    ],
    correctOption: 'A',
    explanation: 'Ortak kullanım için yazıcı aynı yerel ağa dahil edilmelidir.'
  },
  {
    id: 'ag-w1-10', weekOrder: 1,
    prompt: 'Aşağıdakilerden hangisi bir LAN (Yerel Alan Ağı) örneğidir?',
    options: [
      { id: 'A', text: 'Okul bilgisayar laboratuvarındaki ağ' },
      { id: 'B', text: 'Dünya genelindeki tüm web sunucuları' },
      { id: 'C', text: 'Farklı kıtalardaki şubeleri bağlayan omurga' },
      { id: 'D', text: 'Denizaltı fiber optik kıtalararası hattı' }
    ],
    correctOption: 'A',
    explanation: 'Tek bir bina veya oda içindeki ağlar Yerel Alan Ağı (LAN) kapsamındadır.'
  },

  // ================= HAFTA 2 (10 Soru) =================
  {
    id: 'ag-w2-1', weekOrder: 2,
    prompt: 'Binalar arası yüksek hızlı ve elektromanyetik parazitten etkilenmeyen bağlantıda hangi kablo tercih edilir?',
    options: [
      { id: 'A', text: 'Cat6 UTP bakır kablo' },
      { id: 'B', text: 'Fiber optik kablo' },
      { id: 'C', text: 'Koaksiyel RG-59 kablo' },
      { id: 'D', text: 'RJ-11 telefon kablosu' }
    ],
    correctOption: 'B',
    explanation: 'Fiber optik ışıkla iletim yaptığı için uzun mesafede zayıflamaya ve parazite dayanıklıdır.'
  },
  {
    id: 'ag-w2-2', weekOrder: 2,
    prompt: 'Tüm bilgisayarların merkezdeki bir Switch cihazına ayrı kablolarla bağlandığı düzen hangisidir?',
    options: [
      { id: 'A', text: 'Yıldız (Star) Topolojisi' },
      { id: 'B', text: 'Halka (Ring) Topolojisi' },
      { id: 'C', text: 'Ortak Yol (Bus) Topolojisi' },
      { id: 'D', text: 'Örgü (Mesh) Topolojisi' }
    ],
    correctOption: 'A',
    explanation: 'Merkezdeki Switch etrafında kurulan yapı Yıldız Topolojisidir.'
  },
  {
    id: 'ag-w2-3', weekOrder: 2,
    prompt: 'Yıldız topolojisinde PC1 ile Switch arasındaki kablo koparsa ne olur?',
    options: [
      { id: 'A', text: 'Ağdaki tüm bilgisayarların bağlantısı kesilir.' },
      { id: 'B', text: 'Yalnızca PC1 ağdan kopar; diğer cihazlar çalışmaya devam eder.' },
      { id: 'C', text: 'Switch otomatik olarak kablosuz moda geçer.' },
      { id: 'D', text: 'Yazıcı yalnızca PC1’den gelen işleri kabul eder.' }
    ],
    correctOption: 'B',
    explanation: 'Yıldız topolojisinde tekil kablo arızası yalnızca o cihazı etkiler.'
  },
  {
    id: 'ag-w2-4', weekOrder: 2,
    prompt: 'Fiber optik kablolar veriyi hangi fiziksel yöntemle iletir?',
    options: [
      { id: 'A', text: 'Cam veya plastik lifler içinden gönderilen ışık sinyalleriyle' },
      { id: 'B', text: 'Bakır teller içinden geçen elektrik gerilim değişimiyle' },
      { id: 'C', text: 'Koaksiyel zırh içindeki radyo dalgalarıyla' },
      { id: 'D', text: 'Kızılötesi yansıtıcı aynalarla' }
    ],
    correctOption: 'A',
    explanation: 'Fiber optik kablolar ışık darbeleri (foton) ile veri taşır.'
  },
  {
    id: 'ag-w2-5', weekOrder: 2,
    prompt: 'Kablolu yerel ağlarda (Ethernet) en yaygın kullanılan konnektör tipi hangisidir?',
    options: [
      { id: 'A', text: 'RJ-45' },
      { id: 'B', text: 'RJ-11' },
      { id: 'C', text: 'HDMI' },
      { id: 'D', text: 'USB-C' }
    ],
    correctOption: 'A',
    explanation: 'Cat5e/Cat6 Ethernet kabloları 8 pinli RJ-45 konnektörle sonlandırılır.'
  },
  {
    id: 'ag-w2-6', weekOrder: 2,
    prompt: 'Wi-Fi sinyallerinin hızını ve kalitesini en çok düşüren etken aşağıdakilerden hangisidir?',
    options: [
      { id: 'A', text: 'Kalın beton duvarlar, metal engeller ve artan mesafe' },
      { id: 'B', text: 'Bilgisayar monitörünün yenileme hızı' },
      { id: 'C', text: 'Switch üzerindeki boş portların açık kalması' },
      { id: 'D', text: 'Ethernet kablosunun rengi' }
    ],
    correctOption: 'A',
    explanation: 'Radyo dalgaları mesafe ve fiziksel engeller (beton, metal) nedeniyle zayıflar.'
  },
  {
    id: 'ag-w2-7', weekOrder: 2,
    prompt: 'Cat6 bakır kablo ile fiber optik kablo karşılaştırıldığında hangisi doğrudur?',
    options: [
      { id: 'A', text: 'Bakır kablo kısa mesafe (100 m altı) ve düşük maliyetli iç mekan bağlantılarında yaygındır.' },
      { id: 'B', text: 'Bakır kablo ışıkla iletim yaptığı için 10 km mesafede kayıpsız çalışır.' },
      { id: 'C', text: 'Fiber optik kablo elektrik akımı taşıdığı için parazitten çok etkilenir.' },
      { id: 'D', text: 'Cat6 kablo yalnızca kablosuz ağlarda kullanılır.' }
    ],
    correctOption: 'A',
    explanation: 'Bakır Ethernet kabloları ~100 metreye kadar iç mekanlarda ekonomik ve yaygındır.'
  },
  {
    id: 'ag-w2-8', weekOrder: 2,
    prompt: 'Yıldız topolojisinin en kritik tekil arıza noktası (Single Point of Failure) neresidir?',
    options: [
      { id: 'A', text: 'Merkezdeki Switch cihazı' },
      { id: 'B', text: 'Kullanıcı bilgisayarlarından birinin faresi' },
      { id: 'C', text: 'Ağdaki yedek yazıcı' },
      { id: 'D', text: 'Tek bir istemci kablosu' }
    ],
    correctOption: 'A',
    explanation: 'Merkezdeki Switch arızalanırsa ona bağlı tüm cihazların iletişimi kesilir.'
  },
  {
    id: 'ag-w2-9', weekOrder: 2,
    prompt: 'Bir mağazada kasa (POS) cihazının kesintisiz ve gecikmesiz çalışması için hangi bağlantı önceliklidir?',
    options: [
      { id: 'A', text: 'Kablolu Ethernet (Cat6) bağlantısı' },
      { id: 'B', text: 'Uzak mesafeden zayıf Wi-Fi sinyali' },
      { id: 'C', text: 'Bluetooth kulaklık paylaşımı' },
      { id: 'D', text: 'Kızılötesi port' }
    ],
    correctOption: 'A',
    explanation: 'Kablolu Ethernet parazite ve sinyal düşüşüne karşı çok daha kararlıdır.'
  },
  {
    id: 'ag-w2-10', weekOrder: 2,
    prompt: 'UTP (Unshielded Twisted Pair) kablolarda bakır tellerin çiftler halinde bükülmesinin temel amacı nedir?',
    options: [
      { id: 'A', text: 'Elektromanyetik parazit (girişim) etkisini azaltmak' },
      { id: 'B', text: 'Kabloyu daha kalın ve sert hale getirmek' },
      { id: 'C', text: 'Işık sinyallerinin kırılmasını önlemek' },
      { id: 'D', text: 'Kablo uzunluğunu iki katına çıkarmak' }
    ],
    correctOption: 'A',
    explanation: 'Bükümlü çiftler dışarıdan ve komşu tellerden gelen elektromanyetik girişimi dengeler.'
  },

  // ================= HAFTA 3 (10 Soru) =================
  {
    id: 'ag-w3-1', weekOrder: 3,
    prompt: 'Canlı ses/görüntü aktarımında kaybolan eski bir paketin yeniden istenmemesinin temel nedeni nedir?',
    options: [
      { id: 'A', text: 'Gecikmeye yol açarak canlı akışı bozması' },
      { id: 'B', text: 'Ses paketlerinin IP başlığı taşımaması' },
      { id: 'C', text: 'Switch cihazlarının ses paketlerini önbelleğe almaması' },
      { id: 'D', text: 'TCP bağlantısının kablosuz ağlarda hiç çalışmaması' }
    ],
    correctOption: 'A',
    explanation: 'Gerçek zamanlı akışta eski paketi beklemek takılmaya neden olur; hız önceliklidir.'
  },
  {
    id: 'ag-w3-2', weekOrder: 3,
    prompt: 'Gönderilen bir dosyanın paketlerine sıra numarası eklenmesinin amacı nedir?',
    options: [
      { id: 'A', text: 'Farklı yollardan karışık varan paketleri alıcıda doğru sırayla birleştirmek' },
      { id: 'B', text: 'Paketlerin internet hızını iki katına çıkarmak' },
      { id: 'C', text: 'Paketleri şifreleyerek modemden gizlemek' },
      { id: 'D', text: 'MAC adreslerini otomatik olarak IP adresine çevirmek' }
    ],
    correctOption: 'A',
    explanation: 'Paketler ağda farklı sürelerde ulaşabilir; sıra numarası verinin bütünlüğünü sağlar.'
  },
  {
    id: 'ag-w3-3', weekOrder: 3,
    prompt: 'Büyük bir dosyanın küçük paketlere bölünerek gönderilmesinin temel avantajı nedir?',
    options: [
      { id: 'A', text: 'Hata oluşursa yalnızca bozulan küçük paketin yeniden gönderilmesi' },
      { id: 'B', text: 'Kabloya hiç ihtiyaç duyulmaması' },
      { id: 'C', text: 'IP adresi olmadan iletişim kurulabilmesi' },
      { id: 'D', text: 'Switch cihazının yönlendirici gibi çalışması' }
    ],
    correctOption: 'A',
    explanation: 'Paketleme sayesinde tüm dosya yerine sadece kayıp/bozuk parça tekrar istenir.'
  },
  {
    id: 'ag-w3-4', weekOrder: 3,
    prompt: 'Farklı marka ve işletim sistemine sahip cihazların birbiriyle anlaşabilmesini sağlayan ortak kurallara ne denir?',
    options: [
      { id: 'A', text: 'Ağ Protokolleri' },
      { id: 'B', text: 'Ekran Sürücüleri' },
      { id: 'C', text: 'Donanım Şemaları' },
      { id: 'D', text: 'Kablo Renk Kodları' }
    ],
    correctOption: 'A',
    explanation: 'Protokoller (TCP/IP, HTTP vb.) farklı cihazların ortak bir dilde haberleşmesini sağlar.'
  },
  {
    id: 'ag-w3-5', weekOrder: 3,
    prompt: 'Dosya indirme gibi hiçbir bitin kaybolmaması gereken işlemlerde hangi taşıma protokolü tercih edilir?',
    options: [
      { id: 'A', text: 'TCP (Güvenilir, doğrulamalı iletim)' },
      { id: 'B', text: 'UDP (Doğrulamasız hızlı iletim)' },
      { id: 'C', text: 'ARP' },
      { id: 'D', text: 'ICMP' }
    ],
    correctOption: 'A',
    explanation: 'TCP kayıp paketleri yeniden göndererek verinin eksiksiz ulaşmasını garanti eder.'
  },
  {
    id: 'ag-w3-6', weekOrder: 3,
    prompt: 'Ağ iletişiminde görevlerin katmanlara (Uygulama, Taşıma, Ağ, Fiziksel) ayrılmasının faydası nedir?',
    options: [
      { id: 'A', text: 'Her katmanın bağımsız geliştirilmesi ve sorunların daha kolay izole edilmesi' },
      { id: 'B', text: 'Kablo uzunluğunun otomatik olarak artması' },
      { id: 'C', text: 'Tek bir programın tüm donanımı doğrudan kontrol etmesi' },
      { id: 'D', text: 'MAC adreslerine olan ihtiyacın kalkması' }
    ],
    correctOption: 'A',
    explanation: 'Katmanlı mimari karmaşıklığı böler ve standartlaşmayı kolaylaştırır.'
  },
  {
    id: 'ag-w3-7', weekOrder: 3,
    prompt: 'Web tarayıcısında bir sayfa açılırken verinin paketlenip alıcıya ulaşma sırası hangi yönde ilerler?',
    options: [
      { id: 'A', text: 'Göndericide yukarıdan aşağı (Uygulama → Fiziksel), alıcıda aşağıdan yukarı' },
      { id: 'B', text: 'Her iki tarafta da yalnızca Fiziksel katmandan başlar' },
      { id: 'C', text: 'Göndericide Ağ katmanından Uygulama katmanına doğru' },
      { id: 'D', text: 'Katmanlar rastgele sırayla çalışır' }
    ],
    correctOption: 'A',
    explanation: 'Veri gönderilirken kapsüllenerek aşağı iner, alıcıda açılarak yukarı çıkar.'
  },
  {
    id: 'ag-w3-8', weekOrder: 3,
    prompt: 'Paket başlığında (Header) aşağıdakilerden hangisi mutlaka yer alır?',
    options: [
      { id: 'A', text: 'Kaynak ve Hedef adres bilgileri' },
      { id: 'B', text: 'Kullanıcının monitör markası' },
      { id: 'C', text: 'Klavye düzeni' },
      { id: 'D', text: 'Güç kaynağının Watt değeri' }
    ],
    correctOption: 'A',
    explanation: 'Paketin doğru hedefe yönlendirilmesi için kaynak ve hedef adresleri gereklidir.'
  },
  {
    id: 'ag-w3-9', weekOrder: 3,
    prompt: 'Ağda aynı hattı paylaşan birden fazla kullanıcının sırayla/paylaşımlı veri gönderebilmesi ne sayesinde mümkün olur?',
    options: [
      { id: 'A', text: 'Verilerin küçük paketler halinde iletilmesi' },
      { id: 'B', text: 'Tüm dosyaların tek blok halinde gönderilmesi' },
      { id: 'C', text: 'Switch cihazının her seferinde kapatılıp açılması' },
      { id: 'D', text: 'Diğer kullanıcıların kablolarının sökülmesi' }
    ],
    correctOption: 'A',
    explanation: 'Paket anahtarlama hattın tek bir kullanıcı tarafından kilitlenmesini önler.'
  },
  {
    id: 'ag-w3-10', weekOrder: 3,
    prompt: 'UDP protokolü neden çevrimiçi oyunlarda ve canlı yayınlarda sıkça kullanılır?',
    options: [
      { id: 'A', text: 'Onay bekleme yükü olmadığı için çok düşük gecikme sunar.' },
      { id: 'B', text: 'Her kayıp paketi 10 kez tekrar gönderir.' },
      { id: 'C', text: 'Yalnızca kablolu ağlarda çalışır.' },
      { id: 'D', text: 'Dosyaları otomatik sıkıştırır.' }
    ],
    correctOption: 'A',
    explanation: 'UDP bağlantı ve onay beklemeleri olmadan en hızlı şekilde paket iletir.'
  },

  // ================= HAFTA 4 (10 Soru) =================
  {
    id: 'ag-w4-1', weekOrder: 4,
    prompt: 'Bir cihaz hedef IP adresini biliyor fakat aynı yerel ağdaki hedef MAC adresini bilmiyorsa hangi protokol devreye girer?',
    options: [
      { id: 'A', text: 'DNS' },
      { id: 'B', text: 'DHCP' },
      { id: 'C', text: 'ARP' },
      { id: 'D', text: 'ICMP' }
    ],
    correctOption: 'C',
    explanation: 'ARP, IP adresini yerel ağdaki MAC adresine çözer.'
  },
  {
    id: 'ag-w4-2', weekOrder: 4,
    prompt: '255.255.255.0 alt ağ maskesinde 192.168.1.10 ile aynı yerel ağda bulunan adres hangisidir?',
    options: [
      { id: 'A', text: '192.168.2.10' },
      { id: 'B', text: '192.168.1.25' },
      { id: 'C', text: '10.0.0.10' },
      { id: 'D', text: '172.16.1.10' }
    ],
    correctOption: 'B',
    explanation: 'İlk üç oktet (192.168.1) aynı olduğu için aynı yerel ağdadır.'
  },
  {
    id: 'ag-w4-3', weekOrder: 4,
    prompt: 'Cihazın ağ kartı (NIC) üzerinde fabrika çıkışı tanımlı donanım adresi hangisidir?',
    options: [
      { id: 'A', text: 'IPv4 Adresi' },
      { id: 'B', text: 'MAC Adresi' },
      { id: 'C', text: 'Varsayılan Ağ Geçidi' },
      { id: 'D', text: 'DNS Sunucu Adresi' }
    ],
    correctOption: 'B',
    explanation: 'MAC adresi ağ kartının fiziksel donanım adresidir.'
  },
  {
    id: 'ag-w4-4', weekOrder: 4,
    prompt: 'Aynı yerel ağda iki bilgisayara aynı IP adresi (ör. 192.168.1.20) verilirse ne yaşanır?',
    options: [
      { id: 'A', text: 'IP çakışması oluşur ve cihazların ağ iletişimi bozulur.' },
      { id: 'B', text: 'İki bilgisayar tek bir hızlı bağlantıda birleşir.' },
      { id: 'C', text: 'Modem otomatik olarak iki cihazın MAC adresini değiştirir.' },
      { id: 'D', text: 'Hiçbir sorun yaşanmaz, ikisi de normal çalışır.' }
    ],
    correctOption: 'A',
    explanation: 'Aynı ağda her cihaz benzersiz bir IP adresine sahip olmalıdır.'
  },
  {
    id: 'ag-w4-5', weekOrder: 4,
    prompt: 'Bilgisayar A, yazıcının MAC adresini ARP ile öğrendikten sonra neden her saniye tekrar ARP isteği göndermez?',
    options: [
      { id: 'A', text: 'Öğrendiği IP–MAC eşleşmesini geçici olarak ARP önbelleğinde (cache) saklar.' },
      { id: 'B', text: 'Yazıcı ilk paketten sonra MAC adresini siler.' },
      { id: 'C', text: 'ARP ömrü boyunca yalnızca bir kez çalışır, sonra kapanır.' },
      { id: 'D', text: 'Switch tüm IP adreslerini MAC adresine dönüştürür.' }
    ],
    correctOption: 'A',
    explanation: 'ARP tablosu/önbelleği gereksiz yayın (broadcast) trafiğini önler.'
  },
  {
    id: 'ag-w4-6', weekOrder: 4,
    prompt: 'Bir cihaz kendi yerel ağı dışındaki bir sunucuya ulaşmak istediğinde paketi ilk olarak hangi adrese yönlendirir?',
    options: [
      { id: 'A', text: 'Varsayılan Ağ Geçidi (Default Gateway / Router)' },
      { id: 'B', text: 'Yerel ağ yazıcısı' },
      { id: 'C', text: 'Kendi loopback adresi (127.0.0.1)' },
      { id: 'D', text: 'Rastgele bir istemci bilgisayarı' }
    ],
    correctOption: 'A',
    explanation: 'Farklı ağlara çıkış her zaman Varsayılan Ağ Geçidi (Router) üzerinden yapılır.'
  },
  {
    id: 'ag-w4-7', weekOrder: 4,
    prompt: 'ARP isteği (ARP Request) yerel ağda hangi yöntemle gönderilir?',
    options: [
      { id: 'A', text: 'Yayın (Broadcast) — Ağdaki tüm cihazlara sorulur' },
      { id: 'B', text: 'Yalnızca dış internetteki DNS sunucusuna' },
      { id: 'C', text: 'Sadece Bluetooth üzerinden' },
      { id: 'D', text: 'USB kablosuyla' }
    ],
    correctOption: 'A',
    explanation: 'Hedef MAC bilinmediği için "Bu IP kimin?" sorusu tüm yerel ağa yayınlanır.'
  },
  {
    id: 'ag-w4-8', weekOrder: 4,
    prompt: 'IPv4 adresleri kaç bitten oluşur ve kaçarlı gruplar halinde yazılır?',
    options: [
      { id: 'A', text: '32 bit — Noktayla ayrılmış 4 oktet (ör. 192.168.1.1)' },
      { id: 'B', text: '48 bit — İki noktayla ayrılmış 6 çift' },
      { id: 'C', text: '128 bit — 8 onaltılık grup' },
      { id: 'D', text: '16 bit — 2 grup' }
    ],
    correctOption: 'A',
    explanation: 'IPv4 32 bitliktir ve 4 adet 8 bitlik oktetten oluşur.'
  },
  {
    id: 'ag-w4-9', weekOrder: 4,
    prompt: 'Ağdaki cihazlara IP adresi, alt ağ maskesi ve ağ geçidini otomatik dağıtan servis hangisidir?',
    options: [
      { id: 'A', text: 'DHCP' },
      { id: 'B', text: 'ARP' },
      { id: 'C', text: 'HTTP' },
      { id: 'D', text: 'SMTP' }
    ],
    correctOption: 'A',
    explanation: 'DHCP (Dynamic Host Configuration Protocol) otomatik IP yapılandırması sağlar.'
  },
  {
    id: 'ag-w4-10', weekOrder: 4,
    prompt: 'Alan adlarını (ör. www.hitit.edu.tr) IP adreslerine çeviren sistem hangisidir?',
    options: [
      { id: 'A', text: 'DNS' },
      { id: 'B', text: 'ARP' },
      { id: 'C', text: 'DHCP' },
      { id: 'D', text: 'MAC' }
    ],
    correctOption: 'A',
    explanation: 'DNS (Domain Name System) alan adı–IP eşleştirmesi yapar.'
  },

  // ================= HAFTA 5 (10 Soru) =================
  {
    id: 'ag-w5-1', weekOrder: 5,
    prompt: 'Yerel ağdaki yazıcı çalışıyor ancak web siteleri açılmıyorsa ilk olarak hangi cihazın dış bağlantısı kontrol edilmelidir?',
    options: [
      { id: 'A', text: 'Yönlendirici (Router) ve WAN/Modem hattı' },
      { id: 'B', text: 'Yazıcının USB kablosu' },
      { id: 'C', text: 'Switch üzerindeki güç adaptörü' },
      { id: 'D', text: 'Bilgisayarın ekran çözünürlüğü' }
    ],
    correctOption: 'A',
    explanation: 'Yerel yazıcı çalışıyorsa LAN sağlamdır; dış ağa çıkış Router/Modem üzerinden yapılır.'
  },
  {
    id: 'ag-w5-2', weekOrder: 5,
    prompt: 'Ağ sorun gidermede fiziksel katmandan (kablo/ışık) başlamak neden doğrudur?',
    options: [
      { id: 'A', text: 'Çıkmış bir kablo gibi basit bir sorun yazılımsal işlemlerden önce hızla elenir.' },
      { id: 'B', text: 'Kablo kontrolü yapmadan işletim sistemi açılmaz.' },
      { id: 'C', text: 'IP adresleri yalnızca kablo sökülünce yenilenir.' },
      { id: 'D', text: 'Switch portları sadece format atılınca aktif olur.' }
    ],
    correctOption: 'A',
    explanation: 'Basitten karmaşığa ilerlemek gereksiz zaman kaybını önler.'
  },
  {
    id: 'ag-w5-3', weekOrder: 5,
    prompt: 'Yerel ağdaki PC1’den dış ağdaki uzak sunucuya giderken paket sırasıyla hangi yolu izler?',
    options: [
      { id: 'A', text: 'PC1 → Yazıcı → Uzak Sunucu' },
      { id: 'B', text: 'PC1 → Switch → Router → Uzak Sunucu' },
      { id: 'C', text: 'PC1 → Uzak Sunucu → Switch' },
      { id: 'D', text: 'Router → PC1 → Switch → Uzak Sunucu' }
    ],
    correctOption: 'B',
    explanation: 'Yerel paket önce Switch’e, dış ağa çıkmak için Router’a gider.'
  },
  {
    id: 'ag-w5-4', weekOrder: 5,
    prompt: 'IPv4 adreslerinin tükenmeye başlaması nedeniyle geliştirilen 128 bitlik yeni nesil protokol hangisidir?',
    options: [
      { id: 'A', text: 'IPv6' },
      { id: 'B', text: 'MACv2' },
      { id: 'C', text: 'ARP6' },
      { id: 'D', text: 'HTTP/3' }
    ],
    correctOption: 'A',
    explanation: 'IPv6 128 bitlik adres alanıyla milyarlarca cihaz için yeni adresler sunar.'
  },
  {
    id: 'ag-w5-5', weekOrder: 5,
    prompt: 'Hedef cihazın ağda ulaşılabilir olup olmadığını test etmek için kullanılan temel komut hangisidir?',
    options: [
      { id: 'A', text: 'ping' },
      { id: 'B', text: 'format' },
      { id: 'C', text: 'mkdir' },
      { id: 'D', text: 'cls' }
    ],
    correctOption: 'A',
    explanation: 'ping komutu ICMP paketleriyle hedef cihaza erişimi ve gecikmeyi ölçer.'
  },
  {
    id: 'ag-w5-6', weekOrder: 5,
    prompt: 'Router arızalandığında aynı Switch’e bağlı yerel yazıcıya çıktı gönderilebilir mi?',
    options: [
      { id: 'A', text: 'Evet, yerel ağ (Switch) üzerindeki iletişim Router’a ihtiyaç duymaz.' },
      { id: 'B', text: 'Hayır, her yerel paket mutlaka internete çıkıp geri döner.' },
      { id: 'C', text: 'Yalnızca yazıcı Bluetooth ile bağlıysa çalışır.' },
      { id: 'D', text: 'Switch cihazı da Router ile birlikte kapanır.' }
    ],
    correctOption: 'A',
    explanation: 'Aynı alt ağdaki cihazlar Switch üzerinden doğrudan haberleşir.'
  },
  {
    id: 'ag-w5-7', weekOrder: 5,
    prompt: 'Bir bilgisayarın IP adresi 169.254.x.x olarak görünüyorsa bu genellikle neye işaret eder?',
    options: [
      { id: 'A', text: 'Cihaz DHCP sunucusundan otomatik IP alamamıştır.' },
      { id: 'B', text: 'Cihaz fiber optik hıza geçmiştir.' },
      { id: 'C', text: 'DNS sunucusu çok hızlı yanıt veriyordur.' },
      { id: 'D', text: 'Bilgisayar IPv6 moduna geçmiştir.' }
    ],
    correctOption: 'A',
    explanation: '169.254.x.x (APIPA) adresi DHCP başarısız olduğunda işletim sistemi tarafından atanır.'
  },
  {
    id: 'ag-w5-8', weekOrder: 5,
    prompt: 'Bilgisayar kendi IP adresine (127.0.0.1) ping atabiliyorsa ne doğrulanmış olur?',
    options: [
      { id: 'A', text: 'Cihazın kendi TCP/IP ağ yığını ve ağ yazılımı düzgün çalışmaktadır.' },
      { id: 'B', text: 'İnternet bağlantısı kesinlikle açıktır.' },
      { id: 'C', text: 'Switch kablosu sağlamdır.' },
      { id: 'D', text: 'Modem şifresi doğrudur.' }
    ],
    correctOption: 'A',
    explanation: '127.0.0.1 loopback adresi yerel TCP/IP protokol yığınını test eder.'
  },
  {
    id: 'ag-w5-9', weekOrder: 5,
    prompt: 'IP adresiyle ping başarılı ama alan adıyla (google.com) site açılmıyorsa sorun büyük ihtimalle nerededir?',
    options: [
      { id: 'A', text: 'DNS (Alan Adı Çözümleme) ayarlarında' },
      { id: 'B', text: 'Ethernet kablosunun ucunda' },
      { id: 'C', text: 'Monitör parlaklığında' },
      { id: 'D', text: 'Switch MAC tablosunda' }
    ],
    correctOption: 'A',
    explanation: 'IP ile erişim varsa bağlantı sağlamdır; isim çözme hatası DNS kaynaklıdır.'
  },
  {
    id: 'ag-w5-10', weekOrder: 5,
    prompt: 'Bir ofis ağında dış internet kesildiğinde hangi işlemler çalışmaya devam eder?',
    options: [
      { id: 'A', text: 'Yerel dosya paylaşımı ve ağ yazıcısı kullanımı' },
      { id: 'B', text: 'Bulut depolamaya dosya yükleme' },
      { id: 'C', text: 'Uzak web sunucularına bağlanma' },
      { id: 'D', text: 'Çevrimiçi video konferans' }
    ],
    correctOption: 'A',
    explanation: 'İç ağ (LAN) hizmetleri dış internet kesintisinden etkilenmez.'
  }
];
