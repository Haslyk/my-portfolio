import { WeekCurriculumItem } from './types';

export const CURRICULUM_WEEKS: WeekCurriculumItem[] = [
  // ==========================================================================
  // HAFTA 1: Bilgisayar Ağları ve Ağ Cihazları
  // ==========================================================================
  {
    order: 1,
    title: 'Bilgisayar Ağları ve Ağ Cihazları',
    shortDescription: 'Temel ağ kavramlarını, yerel ağ (LAN) ile internet arasındaki farkı ve temel ağ cihazlarının görevlerini öğreniyoruz.',
    learningObjectives: [
      'Modem, yönlendirici (router), anahtar (switch) ve erişim noktasının (access point) temel görevlerini ayırt edebilmek.',
      'Yerel ağ bağlantısı (Wi-Fi veya kablo) ile internet erişimi arasındaki farkı günlük yaşam örnekleriyle açıklayabilmek.'
    ],
    activities: [
      {
        code: 'W1-A1',
        weekOrder: 1,
        orderInWeek: 1,
        title: 'Cihazı Göreviyle Eşleştir',
        shortPurpose: 'Ev ve ofis ağlarında gördüğümüz dört temel ağ cihazını doğru görevleriyle eşleştir.',
        category: 'REQUIRED_ACTIVITY',
        required: true,
        expectedSeconds: 300,
        allocatedSeconds: 600,
        contentVersion: 1,
        config: {
          widgetType: 'CARD_MATCHING',
          instructions: [
            'Sol taraftan bir ağ cihazı kartına tıkla.',
            'Sağ taraftaki görev açıklamalarından bu cihaza en uygun olanına tıklayarak eşleştirmeyi tamamla.',
            'Dört cihazın tamamını eşleştirdikten sonra "Kontrol Et" düğmesine bas.'
          ],
          hint: 'Aynı yerel ağ içindeki kablolu cihazları birbirine bağlayan cihaz ile farklı ağları (örneğin ev ağını servis sağlayıcı ağına) bağlayan cihazı birbirinden ayır.',
          earlyFinisherPrompt: {
            question: 'Evimizdeki "modem" dediğimiz tek kutu aslında birden fazla cihazın işini aynı anda yapıyor olabilir mi?',
            explanation: 'Evet! Ev tipi cihazların çoğu tek bir kutu içinde hem modem, hem yönlendirici (router), hem 4 portlu küçük bir switch hem de kablosuz erişim noktası (Wi-Fi) barındıran birleşik cihazlardır.'
          },
          matching: {
            leftItems: [
              {
                id: 'dev_modem',
                label: 'Modem',
                subtitle: 'Servis sağlayıcı hattı girişi',
                iconName: 'Radio'
              },
              {
                id: 'dev_router',
                label: 'Yönlendirici (Router)',
                subtitle: 'Ağlar arası trafik yöneticisi',
                iconName: 'Compass'
              },
              {
                id: 'dev_switch',
                label: 'Anahtar (Switch)',
                subtitle: 'Çok portlu yerel bağlantı kutusu',
                iconName: 'Network'
              },
              {
                id: 'dev_ap',
                label: 'Erişim Noktası (Access Point)',
                subtitle: 'Kablosuz kapsama cihazı',
                iconName: 'Wifi'
              }
            ],
            rightTargets: [
              {
                id: 'role_switch',
                text: 'Aynı yerel ağdaki (LAN) kablolu bilgisayar ve yazıcı gibi cihazların birbiriyle iletişim kurmasını sağlar.'
              },
              {
                id: 'role_modem',
                text: 'DSL veya kablo internet hattından gelen sinyalleri ağ cihazlarının anlayacağı sayısal veriye dönüştürür (sinyal dönüşümü sağlar).'
              },
              {
                id: 'role_ap',
                text: 'Telefon ve dizüstü bilgisayar gibi kablosuz cihazları kablolu yerel ağa bağlar.'
              },
              {
                id: 'role_router',
                text: 'Farklı ağlar arasında (örneğin ev/ofis yerel ağı ile dış internet ağı arasında) veri paketlerini iletir.'
              }
            ]
          }
        }
      },
      {
        code: 'W1-A2',
        weekOrder: 1,
        orderInWeek: 2,
        title: 'Wi-Fi Var, İnternet Var mı?',
        shortPurpose: 'Kablosuz yerel ağ bağlantısı (Wi-Fi) ile internet erişiminin aynı şey olup olmadığını üç senaryoyla test et.',
        category: 'REQUIRED_ACTIVITY',
        required: true,
        expectedSeconds: 300,
        allocatedSeconds: 600,
        contentVersion: 1,
        config: {
          widgetType: 'SCENARIO_CHOICE',
          instructions: [
            'Aşağıdaki üç durum için önce "Evet" veya "Hayır" cevabını seç.',
            'Ardından seçtiğin cevabı destekleyen doğru teknik gerekçeyi işaretle.',
            'Üç soruyu da yanıtladıktan sonra "Kontrol Et" düğmesine bas.'
          ],
          hint: 'Wi-Fi yalnızca cihazın ile yakındaki erişim noktası arasındaki kablosuz yerel bağlantıdır. İnternet ise binanın dışındaki servis sağlayıcı hattıyla ulaşılan küresel ağdır.',
          earlyFinisherPrompt: {
            question: 'İnternet kesildiğinde telefonundan aynı Wi-Fi ağındaki akıllı televizyona ekran yansıtabilir misin?',
            explanation: 'Çoğu durumda evet! Çünkü telefon ve televizyon aynı yerel ağda (LAN) bulunur; yerel iletişim için dış internet hattına çıkmaları gerekmez.'
          },
          scenarios: {
            questions: [
              {
                id: 'w1_a2_q1',
                prompt: '1. Telefonunda Wi-Fi simgesinin tam dolu görünmesi internetin kesinlikle çalıştığını garanti eder mi?',
                context: 'Telefonun sınıftaki kablosuz ağa bağlı görünüyor ancak web sayfaları açılmıyor.',
                options: [
                  { id: 'YES', label: 'Evet, garanti eder' },
                  { id: 'NO', label: 'Hayır, garanti etmez' }
                ],
                followUpReasons: [
                  { id: 'r1_wrong_1', text: 'Wi-Fi simgesi doğrudan uydu üzerinden internete bağlandığımızı gösterir.' },
                  { id: 'r1_correct', text: 'Wi-Fi yalnızca erişim noktasına/yönlendiriciye kablosuz bağlı olduğumuzu gösterir; servis sağlayıcı (internet) hattı kesik olabilir.' },
                  { id: 'r1_wrong_2', text: 'Wi-Fi şifresi doğru girildiyse tüm internet siteleri her zaman açılır.' }
                ]
              },
              {
                id: 'w1_a2_q2',
                prompt: '2. Aynı odadaki yerel ağ yazıcısından çıktı almak için internet bağlantısı her zaman gerekli midir?',
                context: 'Bilgisayar ve ağ yazıcısı ofisteki aynı switch veya Wi-Fi ağına bağlıdır.',
                options: [
                  { id: 'YES', label: 'Evet, her zaman gereklidir' },
                  { id: 'NO', label: 'Hayır, gerekli değildir' }
                ],
                followUpReasons: [
                  { id: 'r2_correct', text: 'Bilgisayar ve yazıcı aynı yerel ağda (LAN) olduğu için veriler dış internete çıkmadan doğrudan yerel ağ üzerinden yazıcıya ulaşır.' },
                  { id: 'r2_wrong_1', text: 'Yazdırılacak tüm belgeler önce yurt dışındaki sunuculara gidip sonra yazıcıya döner.' },
                  { id: 'r2_wrong_2', text: 'Yazıcılar yalnızca internet servis sağlayıcısı izin verdiğinde çalışır.' }
                ]
              },
              {
                id: 'w1_a2_q3',
                prompt: '3. Bir bilgisayarın internete bağlanabilmesi için Wi-Fi (kablosuz bağlantı) şart mıdır?',
                context: 'Laboratuvardaki masaüstü bilgisayarlarda kablosuz ağ kartı bulunmuyor.',
                options: [
                  { id: 'YES', label: 'Evet, Wi-Fi şarttır' },
                  { id: 'NO', label: 'Hayır, şart değildir' }
                ],
                followUpReasons: [
                  { id: 'r3_wrong_1', text: 'Günümüzde internet yalnızca radyo dalgalarıyla taşınabilir.' },
                  { id: 'r3_wrong_2', text: 'Kablolu bağlantılar yalnızca elektrik taşır, internet verisi taşıyamaz.' },
                  { id: 'r3_correct', text: 'Cihazlar Ethernet ağ kablosuyla switch veya yönlendiriciye bağlanarak da internete çıkabilir.' }
                ]
              }
            ]
          }
        }
      },
      {
        code: 'W1-Q',
        weekOrder: 1,
        orderInWeek: 3,
        title: '1. Hafta Değerlendirmesi',
        shortPurpose: 'Bilgisayar ağlarının amacı, switch cihazının görevi ve Wi-Fi ile internet farkı hakkındaki 3 soruyu yanıtla.',
        category: 'QUIZ',
        required: true,
        expectedSeconds: 180,
        allocatedSeconds: 300,
        contentVersion: 1,
        config: {
          widgetType: 'WEEK_QUIZ',
          instructions: [
            'Her soru için doğru seçeneği işaretle.',
            'Yanlış yaptığın sorularda açıklamayı okuyup dilediğin kadar tekrar deneyebilirsin.',
            'Üç sorunun tamamı doğru olduğunda değerlendirme tamamlanır.'
          ],
          hint: 'Cihazların aynı yerel ağda kaynak paylaşması ile dış internete çıkması arasındaki farkı hatırla.',
          quiz: {
            questions: [
              {
                id: 'w1_q1',
                number: 1,
                question: 'Bir bilgisayar ağının (network) kurulmasındaki en temel amaç aşağıdakilerden hangisidir?',
                options: [
                  { id: 'a', text: 'Bilgisayarların tekil işlemci ve bellek kapasitesini yazılımla artırmak' },
                  { id: 'b', text: 'İki veya daha fazla cihazın birbiriyle veri alışverişi yapmasını ve yazıcı/dosya gibi kaynakları paylaşmasını sağlamak' },
                  { id: 'c', text: 'Tüm cihazların yalnızca tek bir işletim sistemi sürümüne geçmesini zorunlu kılmak' },
                  { id: 'd', text: 'Her bilgisayara ayrı bir harici sabit disk bağlayarak internet ihtiyacını kaldırmak' }
                ]
              },
              {
                id: 'w1_q2',
                number: 2,
                question: 'Bir laboratuvardaki 20 masaüstü bilgisayarı ve 1 ağ yazıcısını aynı yerel ağ (LAN) içinde kabloyla birbirine bağlamak için hangi cihaz kullanılır?',
                options: [
                  { id: 'a', text: 'Anahtar (Switch)' },
                  { id: 'b', text: 'DSL Modem' },
                  { id: 'c', text: 'Yalnızca Erişim Noktası (Access Point)' },
                  { id: 'd', text: 'Güvenlik Duvarı (Firewall) Cihazı' }
                ]
              },
              {
                id: 'w1_q3',
                number: 3,
                question: 'Evdeki Wi-Fi ağına bağlı bir dizüstü bilgisayarda "Wi-Fi Bağlı, İnternet Yok" uyarısı görülüyorsa bunun anlamı nedir?',
                options: [
                  { id: 'a', text: 'Bilgisayarın kablosuz ağ kartı donanımsal olarak devre dışı kalmıştır.' },
                  { id: 'b', text: 'Bilgisayar evdeki kablosuz cihaza (yerel ağa) bağlanmıştır ancak modem/yönlendirici dış servis sağlayıcıya (internete) ulaşamamaktadır.' },
                  { id: 'c', text: 'Wi-Fi şifresi yanlış girilmiştir ve yerel ağ bağlantısı hiç kurulmamıştır.' },
                  { id: 'd', text: 'Modem ile bilgisayar arasındaki Wi-Fi sinyali tamamen kesilmiştir.' }
                ]
              }
            ]
          }
        }
      },
      {
        code: 'W1-H',
        weekOrder: 1,
        orderInWeek: 4,
        title: 'Uygulama Ödevi: Evimin Bağlantılarını Tanıyorum',
        shortPurpose: 'Evdeki üç farklı cihaz için bağlantı türünü planla ve yerel ağ iletişim durumunu değerlendir.',
        category: 'HOMEWORK',
        required: false,
        expectedSeconds: 240,
        allocatedSeconds: 600,
        contentVersion: 1,
        config: {
          widgetType: 'MULTI_STEP_HOMEWORK',
          instructions: [
            'Telefon, Akıllı TV ve Masaüstü Bilgisayar için evinde tercih edeceğin bağlantı türünü (Kablolu veya Kablosuz) seç.',
            'Not: Her cihaz için uygun port veya kablosuz adaptör bulunduğu varsayılmaktadır; kablolu veya kablosuz tercihlerinden herhangi birini seçebilirsin.',
            'Son adımda bu cihazların aynı yerel ağda buluşup buluşamayacağını yanıtla ve "Kontrol Et" düğmesine bas.'
          ],
          hint: 'Bir cihaz kabloyla, diğer cihaz Wi-Fi ile aynı ev yönlendiricisine bağlansa bile ikisi de aynı yerel ağın (LAN) parçası olur.',
          multiStepHomework: {
            weekCode: 'W1-H',
            assumptionNote: 'Varsayım: Tüm cihazlarda hem kablolu (Ethernet portu veya dönüştürücü adaptör) hem de kablosuz (Wi-Fi adaptörü) bağlantı imkânı bulunduğu kabul edilmektedir. Kendi kullanım senaryona göre tercih yapabilirsin.',
            homeDevices: [
              {
                id: 'phone',
                label: 'Akıllı Telefon',
                iconName: 'Smartphone',
                description: 'Ev içinde odadan odaya taşınan mobil cihaz'
              },
              {
                id: 'tv',
                label: 'Akıllı Televizyon (Smart TV)',
                iconName: 'Tv',
                description: 'Salonda sabit duran medya cihazı'
              },
              {
                id: 'desktop',
                label: 'Masaüstü Bilgisayar',
                iconName: 'Monitor',
                description: 'Çalışma masasında sabit kullanılan bilgisayar'
              }
            ],
            finalQuestion: {
              prompt: 'Bazıları kablolu, bazıları kablosuz bağlansa bile aynı ev yönlendiricisine bağlı bu üç cihaz aynı yerel ağ (LAN) içinde birbirleriyle iletişim kurabilir mi?',
              options: [
                { id: 'YES', label: 'Evet, aynı yerel ağa bağlanabilirler' },
                { id: 'NO', label: 'Hayır, kablolu ve kablosuz cihazlar asla aynı ağda olamaz' }
              ]
            }
          }
        }
      }
    ]
  },

  // ==========================================================================
  // HAFTA 2: Cihazlar Nasıl Bağlanır?
  // ==========================================================================
  {
    order: 2,
    title: 'Cihazlar Nasıl Bağlanır?',
    shortDescription: 'Bakır Ethernet kablosu, fiber optik ve Wi-Fi bağlantı ortamlarını karşılaştırıyor ve ilk yerel ağ şemalarımızı kuruyoruz.',
    learningObjectives: [
      'Duruma göre Bakır Ethernet, Fiber Optik ve Wi-Fi bağlantı ortamlarından en uygun olanını seçebilmek.',
      'Merkezde anahtar (switch) ve erişim noktası kullanarak yıldız topolojisinde küçük bir ofis veya kafe yerel ağı kurabilmek.'
    ],
    activities: [
      {
        code: 'W2-A1',
        weekOrder: 2,
        orderInWeek: 1,
        title: 'Bağlantıyı Seç',
        shortPurpose: 'Üç farklı gerçek hayat senaryosu için en uygun veri iletim ortamını (Wi-Fi, Bakır Ethernet, Fiber Optik) belirle.',
        category: 'REQUIRED_ACTIVITY',
        required: true,
        expectedSeconds: 300,
        allocatedSeconds: 600,
        contentVersion: 1,
        config: {
          widgetType: 'SCENARIO_CHOICE',
          instructions: [
            'Her senaryoyu dikkatle oku ve hareketlilik, mesafe veya iletim yöntemine dikkat et.',
            'Senaryoya en uygun bağlantı türünü seç.',
            'Üç senaryoyu da tamamladıktan sonra "Kontrol Et" düğmesine bas.'
          ],
          hint: 'Hareketli cihazlar için kablosuz (Wi-Fi), oda içi sabit kısa mesafe için bakır ağ kablosu (Ethernet), binalar arası ışıkla yüksek hızlı iletim için Fiber Optik tercih edilir.',
          earlyFinisherPrompt: {
            question: 'Neden binalar arasında bakır kablo yerine fiber optik kablo tercih edilir?',
            explanation: 'Fiber optik kablolar veriyi elektrik yerine ışık darbeleriyle taşıdığı için çok uzun mesafelerde sinyal kaybı çok düşüktür ve yıldırım veya elektromanyetik parazitlerden etkilenmez.'
          },
          scenarios: {
            questions: [
              {
                id: 'w2_a1_s1',
                prompt: 'Senaryo 1: Kampüs içinde yürürken veya kantinde dolaşırken kullanılan akıllı telefonun ağa bağlanması',
                context: 'Kullanıcı sürekli hareket hâlindedir ve cihaza kablo takılması pratik değildir.',
                options: [
                  { id: 'WIFI', label: 'Wi-Fi (Kablosuz Ağ)' },
                  { id: 'COPPER_ETHERNET', label: 'Bakır Ethernet Kablosu (UTP/RJ-45)' },
                  { id: 'FIBER', label: 'Fiber Optik Kablo' }
                ]
              },
              {
                id: 'w2_a1_s2',
                prompt: 'Senaryo 2: Switch cihazının hemen yanındaki masada duran, Ethernet (RJ-45) girişli sabit masaüstü bilgisayarın kabloyla bağlanması',
                context: 'Mesafe yalnızca birkaç metredir; ekonomik, kararlı ve standart bir kablolu bağlantı istenmektedir.',
                options: [
                  { id: 'WIFI', label: 'Wi-Fi (Kablosuz Ağ)' },
                  { id: 'COPPER_ETHERNET', label: 'Bakır Ethernet Kablosu (UTP/RJ-45)' },
                  { id: 'FIBER', label: 'Fiber Optik Kablo' }
                ]
              },
              {
                id: 'w2_a1_s3',
                prompt: 'Senaryo 3: Kampüsteki iki fakülte binası arasında metal veri kablosu kullanmadan, veriyi cam lifler içinden ışıkla yüksek hızda iletme',
                context: 'Binalar arası mesafe uzundur ve elektriksel parazitten etkilenmeyen ışık tabanlı iletim gerekmektedir.',
                options: [
                  { id: 'WIFI', label: 'Wi-Fi (Kablosuz Ağ)' },
                  { id: 'COPPER_ETHERNET', label: 'Bakır Ethernet Kablosu (UTP/RJ-45)' },
                  { id: 'FIBER', label: 'Fiber Optik Kablo' }
                ]
              }
            ]
          }
        }
      },
      {
        code: 'W2-A2',
        weekOrder: 2,
        orderInWeek: 2,
        title: 'Küçük Ofis Ağını Kur',
        shortPurpose: 'Üç bilgisayar ve bir yazıcıyı merkezdeki switch cihazına kablolu olarak bağlayarak yıldız topolojisinde bir yerel ağ kur.',
        category: 'REQUIRED_ACTIVITY',
        required: true,
        expectedSeconds: 300,
        allocatedSeconds: 600,
        contentVersion: 1,
        config: {
          widgetType: 'NETWORK_BUILDER',
          instructions: [
            'Bağlantı kurmak için önce birinci cihaza, ardından ikinci cihaza tıkla.',
            'PC1, PC2, PC3 ve Yazıcı cihazlarının her birini merkezdeki Switch cihazına kablolu (düz çizgi) olarak bağla.',
            'Bilgisayarları doğrudan birbirine veya yazıcıya bağlama! Yanlış bir çizgi çizersen çizginin üzerine tıklayıp "Bağlantıyı Sil" düğmesini kullan.',
            'Tam olarak 4 doğru kablolu bağlantı kurduğunda "Kontrol Et" düğmesine bas.'
          ],
          hint: 'Yıldız topolojisinde uç cihazlar (PC ve yazıcı) doğrudan birbirine bağlanmaz; her uç cihaz yalnızca merkezdeki Switch cihazına bağlanır.',
          earlyFinisherPrompt: {
            question: 'Bu ağda PC1 ile PC2 arasındaki kablo kopsaydı, PC3 yine de yazıcıdan çıktı alabilir miydi?',
            explanation: 'Evet! Yıldız topolojisinin en büyük avantajı budur: Her cihaz merkezdeki switch’e ayrı bir kabloyla bağlı olduğu için bir kablonun kopması yalnızca o cihazı etkiler, ağın geri kalanı çalışmaya devam eder.'
          },
          networkBuilder: {
            allowedConnectionTypes: ['wired'],
            defaultConnectionType: 'wired',
            helperNote: 'Bu görevde yalnızca yerel ofis ağı kuruyoruz; yönlendirici veya internet bağlantısı bulunmamaktadır.',
            nodes: [
              { id: 'pc1', label: 'PC 1', deviceType: 'pc', x: 110, y: 90, mobileX: 75, mobileY: 90 },
              { id: 'pc2', label: 'PC 2', deviceType: 'pc', x: 110, y: 310, mobileX: 285, mobileY: 90 },
              { id: 'switch1', label: 'Ofis Switch', deviceType: 'switch', x: 350, y: 200, mobileX: 180, mobileY: 260 },
              { id: 'pc3', label: 'PC 3', deviceType: 'pc', x: 590, y: 90, mobileX: 75, mobileY: 430 },
              { id: 'printer1', label: 'Ağ Yazıcısı', deviceType: 'printer', x: 590, y: 310, mobileX: 285, mobileY: 430 }
            ]
          }
        }
      },
      {
        code: 'W2-Q',
        weekOrder: 2,
        orderInWeek: 3,
        title: '2. Hafta Değerlendirmesi',
        shortPurpose: 'Fiber optik iletim, kablosuz sinyalleri etkileyen engeller ve yıldız topolojisi hakkındaki 3 soruyu yanıtla.',
        category: 'QUIZ',
        required: true,
        expectedSeconds: 180,
        allocatedSeconds: 300,
        contentVersion: 1,
        config: {
          widgetType: 'WEEK_QUIZ',
          instructions: [
            'Her soru için doğru seçeneği işaretle.',
            'Açıklamaları okuyarak hatalarını düzeltebilirsin.',
            'Üç soruyu da doğru yanıtladığında hafta değerlendirmesi tamamlanır.'
          ],
          hint: 'Kablolu, fiber ve kablosuz bağlantıların fiziksel özelliklerini ve switch merkezli yıldız yapısını düşün.',
          quiz: {
            questions: [
              {
                id: 'w2_q1',
                number: 1,
                question: 'Fiber optik kablolar veriyi hangi fiziksel yöntemle iletir?',
                options: [
                  { id: 'a', text: 'Cam veya plastik lifler içinden gönderilen ışık sinyalleriyle' },
                  { id: 'b', text: 'Bükümlü bakır çiftler üzerinden geçen elektrik gerilim değişimleriyle' },
                  { id: 'c', text: 'Eş eksenli (koaksiyel) metal zırh içindeki radyo dalgalarıyla' },
                  { id: 'd', text: 'Kablosuz erişim noktasından yansıtılan kızılötesi dalgalarla' }
                ]
              },
              {
                id: 'w2_q2',
                number: 2,
                question: 'Wi-Fi (kablosuz) ağ bağlantısıyla ilgili aşağıdaki ifadelerden hangisi doğrudur?',
                options: [
                  { id: 'a', text: 'Mesafe arttıkça ve araya kalın beton duvarlar veya metal engeller girdikçe sinyal gücü ve hız düşebilir.' },
                  { id: 'b', text: '2.4 GHz ve 5 GHz bantları aynı duvar geçirgenliğine ve aynı menzile sahiptir.' },
                  { id: 'c', text: 'Wi-Fi bağlantısı yalnızca tek bir cihaz bağlıyken çalışır, ikinci cihazda kabloya geçer.' },
                  { id: 'd', text: 'Kablosuz ağlarda veri güvenliği şifreleme olmadan fiziksel kablo ile sağlanır.' }
                ]
              },
              {
                id: 'w2_q3',
                number: 3,
                question: 'Bilgisayarların ve yazıcının merkezdeki bir Switch cihazına ayrı kablolarla bağlandığı yaygın yerel ağ düzenine ne ad verilir?',
                options: [
                  { id: 'a', text: 'Yıldız (Star) Topolojisi' },
                  { id: 'b', text: 'Halka (Ring) Topolojisi' },
                  { id: 'c', text: 'Ortak Yol (Bus) Topolojisi' },
                  { id: 'd', text: 'Örgü (Mesh) Topolojisi' }
                ]
              }
            ]
          }
        }
      },
      {
        code: 'W2-H',
        weekOrder: 2,
        orderInWeek: 4,
        title: 'Uygulama Ödevi: Kafenin Ağını Tamamla',
        shortPurpose: 'Hem kablolu hem kablosuz cihazların bulunduğu bir kafede doğru bağlantı türlerini (kablolu/kablosuz) seçerek ağı kur.',
        category: 'HOMEWORK',
        required: false,
        expectedSeconds: 300,
        allocatedSeconds: 600,
        contentVersion: 1,
        config: {
          widgetType: 'NETWORK_BUILDER',
          instructions: [
            'Üstteki bağlantı türü seçicisinden önce "Kablolu (Düz Çizgi)" veya "Kablosuz (Kesik Çizgi)" modunu seç.',
            '1) Kasa Bilgisayarını ↔ Switch cihazına KABLOLU bağla.',
            '2) Erişim Noktasını (Access Point) ↔ Switch cihazına KABLOLU bağla.',
            '3) Bağlantı türünü "Kablosuz" yap; Telefon 1 ve Telefon 2 cihazlarını ↔ Erişim Noktasına KABLOSUZ bağla.',
            'Tam olarak bu 4 bağlantıyı doğru türlerle kurduktan sonra "Kontrol Et" düğmesine bas.'
          ],
          hint: 'Telefonlar doğrudan Switch’e bağlanmaz; kablosuz olarak Erişim Noktasına bağlanır. Erişim Noktası ve Kasa ise Switch’e kabloyla bağlanır.',
          networkBuilder: {
            allowedConnectionTypes: ['wired', 'wireless'],
            defaultConnectionType: 'wired',
            helperNote: 'Düz çizgi Kablolu (Ethernet), kesik çizgi Kablosuz (Wi-Fi) bağlantıyı temsil eder. Bağlantı kurmadan önce üstten doğru bağlantı türünü seçtiğinden emin ol.',
            nodes: [
              { id: 'pos1', label: 'Kasa Bilgisayarı', deviceType: 'pos', x: 110, y: 120, mobileX: 80, mobileY: 95 },
              { id: 'switch1', label: 'Kafe Switch', deviceType: 'switch', x: 280, y: 220, mobileX: 260, mobileY: 95 },
              { id: 'ap1', label: 'Erişim Noktası (AP)', deviceType: 'ap', x: 460, y: 220, mobileX: 180, mobileY: 270 },
              { id: 'phone1', label: 'Müşteri Telefon 1', deviceType: 'phone', x: 610, y: 100, mobileX: 80, mobileY: 440 },
              { id: 'phone2', label: 'Müşteri Telefon 2', deviceType: 'phone', x: 610, y: 330, mobileX: 280, mobileY: 440 }
            ]
          }
        }
      }
    ]
  },

  // ==========================================================================
  // HAFTA 3: Bir Fotoğrafın Ağdaki Yolculuğu
  // ==========================================================================
  {
    order: 3,
    title: 'Bir Fotoğrafın Ağdaki Yolculuğu',
    shortDescription: 'Verilerin ağda tek parça hâlinde değil paketlere bölünerek taşındığını, protokol kurallarını ve eksik parçaların nasıl tamamlandığını inceliyoruz.',
    learningObjectives: [
      'Bir dosyanın göndericiden alıcıya giderken parçalara ayrılma, adres/sıra bilgisi eklenme, taşınma ve yeniden birleştirilme adımlarını sıralayabilmek.',
      'Eksik kalan bir veri paketinin yeniden istenmesi (TCP güvenilir iletim örneği) ve protokol kurallarının önemini açıklayabilmek.'
    ],
    animation: {
      code: 'ANIM-W3',
      title: 'Öğretici Animasyon: Fotoğrafın Yolculuğu',
      subtitle: 'Büyük bir fotoğraf dosyası ağ kablosundan tek seferde nasıl geçer? Paketleme ve birleştirme sürecini adım adım izle.',
      totalDurationSeconds: 68,
      keyTakeaways: [
        'Veriler ağ üzerinde küçük parçalara (paketlere) bölünerek taşınır.',
        'Her parçaya kime gideceği (hedef), kimden geldiği (kaynak) ve kaçıncı parça olduğu (sıra numarası) bilgisi eklenir.',
        'IP tek başına paketlerin sırayla veya eksiksiz ulaşacağını garanti etmez; sıralama ve eksik parçayı yeniden isteme işi TCP gibi üst katman protokolleriyle sağlanır.'
      ],
      steps: [
        {
          id: 1,
          title: '1. Gönderilecek Fotoğraf Seçilir',
          caption: 'Ayşe, bilgisayarındaki yüksek çözünürlüklü kampüs fotoğrafını arkadaşı Ali’ye göndermek için seçer.',
          technicalNote: 'Uygulama katmanında veri henüz bütün bir dosyadır.',
          durationMs: 16000
        },
        {
          id: 2,
          title: '2. Parçalara Ayrılır ve Başlık Bilgileri Eklenir',
          caption: 'Fotoğraf 4 küçük parçaya bölünür. Her parçanın üzerine sıra numarası (1/4, 2/4...) ve gönderici/alıcı adres bilgileri eklenir.',
          technicalNote: 'Bu işleme kapsülleme (encapsulation) denir. Sıra numarası sayesinde alıcı parçaları doğru birleştirebilir.',
          durationMs: 18000
        },
        {
          id: 3,
          title: '3. Paketler Ağ Üzerinde Taşınır',
          caption: 'Her bir parça ağ cihazlarından (Switch ve Yönlendiricilerden) geçerek hedefe doğru ilerler.',
          technicalNote: 'Ağdaki yoğunluğa göre bazı parçalar farklı gecikmelerle ulaşabilir veya yolda kaybolabilir.',
          durationMs: 17000
        },
        {
          id: 4,
          title: '4. Alıcıda Kontrol Edilir ve Birleştirilir',
          caption: 'Ali’nin bilgisayarı gelen parçaları sıra numarasına göre (1-2-3-4) dizip birleştirir ve fotoğraf ekranda eksiksiz görüntülenir.',
          technicalNote: 'TCP kullanıldığında eksik parça varsa yeniden istenir; tüm parçalar tamamlanınca uygulamaya teslim edilir.',
          durationMs: 17000
        }
      ]
    },
    activities: [
      {
        code: 'W3-A1',
        weekOrder: 3,
        orderInWeek: 1,
        title: 'Fotoğrafın Yolculuğunu Sırala',
        shortPurpose: 'Bir fotoğrafın göndericiden çıkıp alıcının ekranında görünmesine kadar geçen 4 temel aşamayı doğru sıraya diz.',
        category: 'REQUIRED_ACTIVITY',
        required: true,
        expectedSeconds: 300,
        allocatedSeconds: 600,
        contentVersion: 1,
        config: {
          widgetType: 'ORDERING',
          instructions: [
            'Aşağıdaki 4 kart başlangıçta karışık sırada verilmiştir.',
            'Kartların yanındaki "Yukarı Taşı" ve "Aşağı Taşı" düğmelerini kullanarak olayları ilk adımdan son adıma (1 → 4) doğru sırala.',
            'Sıralamadan emin olduğunda "Kontrol Et" düğmesine bas.'
          ],
          hint: 'Önce göndereceğimiz fotoğrafı seçmeliyiz; ağa çıkmadan önce parçalanıp etiketlenmeli, sonra ağda taşınmalı ve en son alıcıda birleştirilmelidir.',
          earlyFinisherPrompt: {
            question: 'Fotoğrafı hiç parçalamadan tek bir dev veri bloğu olarak gönderseydik ne olurdu?',
            explanation: 'Tek bir büyük veri bloğu hattı uzun süre meşgul ederdi ve küçük bir hatada tüm fotoğrafı baştan göndermek gerekirdi. Parçalara bölmek hem hattın adil paylaşılmasını hem de sadece bozulan parçanın tekrar gönderilmesini sağlar.'
          },
          ordering: {
            initialCards: [
              {
                id: 'step_transport',
                title: 'Ağda Taşınır',
                description: 'Hazırlanan veri paketleri kablolu veya kablosuz ağ cihazları üzerinden alıcıya doğru iletilir.'
              },
              {
                id: 'step_reassemble',
                title: 'Alıcıda Birleştirilir ve Görüntülenir',
                description: 'Hedef cihaz gelen parçaları sıra numaralarına göre birleştirir ve fotoğrafı ekranda gösterir.'
              },
              {
                id: 'step_select',
                title: 'Fotoğraf Seçilir',
                description: 'Kullanıcı göndermek istediği fotoğraf dosyasını uygulamasında seçer ve gönder komutunu verir.'
              },
              {
                id: 'step_segment',
                title: 'Parçalara Ayrılır ve Bilgiler Eklenir',
                description: 'Dosya küçük paketlere bölünür; her parçaya sıra numarası ve adres bilgileri eklenir.'
              }
            ]
          }
        }
      },
      {
        code: 'W3-A2',
        weekOrder: 3,
        orderInWeek: 2,
        title: 'Eksik Parçayı Bul (TCP Güvenilir İletim)',
        shortPurpose: '4 parçalık bir fotoğrafta yolda kaybolan parçayı tespit et, yeniden iste, doğru sıraya yerleştir ve fotoğrafı birleştir.',
        category: 'REQUIRED_ACTIVITY',
        required: true,
        expectedSeconds: 300,
        allocatedSeconds: 600,
        contentVersion: 1,
        config: {
          widgetType: 'ORDERING',
          instructions: [
            'Alıcıya 1, 2 ve 4 numaralı parçalar ulaştı ancak bir parça eksik!',
            'Adım 1: Hangi numaralı parçanın eksik olduğunu seç.',
            'Adım 2: "Eksik Parçayı Yeniden İste" düğmesine basarak göndericiden o parçayı talep et.',
            'Adım 3: Gelen parçayı dizideki doğru boşluğa (2 ile 4 arasına) yerleştir ve "Fotoğrafı Birleştir" adımını tamamla.',
            'Son olarak "Kontrol Et" düğmesine bas.'
          ],
          hint: '1, 2 ve 4 numaralı parçalar elimizde olduğuna göre eksik olan 3 numaralı parçadır. TCP protokolü eksik parçayı fark edip göndericiden tekrar ister.',
          earlyFinisherPrompt: {
            question: 'Canlı bir sesli görüşmede veya çevrimiçi oyunda 3 saniye önceki kayıp bir ses paketini beklemek mantıklı olur muydu?',
            explanation: 'Hayır! Canlı ses/görüntü yayınlarında genellikle gecikme olmaması için kayıp parçayı beklemeyen UDP protokolü kullanılır; ancak dosya, web sayfası ve fotoğraf indirirken eksiksiz veri şart olduğu için TCP kullanılır.'
          },
          missingPacket: {
            receivedPackets: [1, 2, 4],
            totalPackets: 4,
            candidateMissingNumbers: [1, 2, 3, 4],
            slotLabels: ['1. Konum (Başlangıç)', '2. Konum', '3. Konum (Eksik Boşluk)', '4. Konum (Son)'],
            protocolNote: 'Bu etkinlik TCP (Transmission Control Protocol) mantığını gösterir: TCP her parçaya sıra numarası verir, alıcıda eksik parça varsa göndericiden yalnızca o parçayı yeniden ister ve tam sırada birleştirir.'
          }
        }
      },
      {
        code: 'W3-Q',
        weekOrder: 3,
        orderInWeek: 3,
        title: '3. Hafta Değerlendirmesi',
        shortPurpose: 'Protokol kavramı, ağ katmanlarının iş bölümü ve sıra bilgisinin önemi hakkındaki 3 soruyu yanıtla.',
        category: 'QUIZ',
        required: true,
        expectedSeconds: 180,
        allocatedSeconds: 300,
        contentVersion: 1,
        config: {
          widgetType: 'WEEK_QUIZ',
          instructions: [
            'Her soru için doğru seçeneği işaretle.',
            'Yanlış cevaplarda geri bildirimi okuyarak tekrar deneyebilirsin.',
            'Üç soruyu da doğru yanıtladığında hafta değerlendirmesi tamamlanır.'
          ],
          hint: 'Cihazların anlaşması için ortak kurallara (protokol), iş bölümüne ve paketlerin karışmaması için sıra numarasına ihtiyaç vardır.',
          quiz: {
            questions: [
              {
                id: 'w3_q1',
                number: 1,
                question: 'Ağdaki farklı marka ve işletim sistemine sahip cihazların birbirini anlayabilmesi için uydukları ortak iletişim kuralları bütününe ne ad verilir?',
                options: [
                  { id: 'a', text: 'Protokol' },
                  { id: 'b', text: 'Ekran Koruyucu' },
                  { id: 'c', text: 'Güç Adaptörü' },
                  { id: 'd', text: 'Klavye Düzeni' }
                ]
              },
              {
                id: 'w3_q2',
                number: 2,
                question: 'Ağ iletişiminde görevlerin "uygulama, paketleme/sıralama, adresleme ve fiziksel iletim" gibi katmanlara ayrılmasının (iş bölümünün) temel faydası nedir?',
                options: [
                  { id: 'a', text: 'Her katmanın kendi görevine odaklanmasını, sorunların kolay bulunmasını ve bir katman değiştiğinde (örneğin Wi-Fi yerine kablo takıldığında) uygulamanın bozulmadan çalışmasını sağlar.' },
                  { id: 'b', text: 'Verilerin ağda taşınmasını tamamen engeller.' },
                  { id: 'c', text: 'Sadece aynı marka bilgisayarların birbiriyle konuşmasına izin verir.' },
                  { id: 'd', text: 'Kablo uzunluğunu otomatik olarak kısaltır.' }
                ]
              },
              {
                id: 'w3_q3',
                number: 3,
                question: 'Gönderilen bir fotoğrafın parçalarına (paketlerine) "sıra numarası" eklenmesinin temel nedeni aşağıdakilerden hangisidir?',
                options: [
                  { id: 'a', text: 'Alıcı cihazın gelen parçaları doğru sırayla birleştirebilmesi ve arada eksik parça olup olmadığını anlayabilmesi' },
                  { id: 'b', text: 'Fotoğrafın renklerini siyah-beyaza çevirmek' },
                  { id: 'c', text: 'Switch cihazının elektrik tüketimini azaltmak' },
                  { id: 'd', text: 'Bilgisayarın fan hızını artırmak' }
                ]
              }
            ]
          }
        }
      },
      {
        code: 'W3-H',
        weekOrder: 3,
        orderInWeek: 4,
        title: 'Uygulama Ödevi: İletişimin Üç Kuralı',
        shortPurpose: 'İletişimde yaşanan üç temel sorunu, onları çözen protokol kurallarıyla eşleştir.',
        category: 'HOMEWORK',
        required: false,
        expectedSeconds: 240,
        allocatedSeconds: 600,
        contentVersion: 1,
        config: {
          widgetType: 'SCENARIO_CHOICE',
          instructions: [
            'Aşağıdaki üç iletişim sorununu oku.',
            'Her sorunun çözümü için protokollerin sağladığı en uygun kuralı seç.',
            'Üç seçimi de tamamladıktan sonra "Kontrol Et" düğmesine bas.'
          ],
          hint: 'Biçim uyuşmazlığı ortak biçimle, karışan parçalar sıra bilgisiyle, kime gideceği belli olmayan mesajlar ise hedef bilgisiyle çözülür.',
          scenarios: {
            questions: [
              {
                id: 'w3_h_q1',
                prompt: 'Sorun 1: Farklı Biçimler — Gönderici ve alıcı veriyi tamamen farklı dil ve dosya yapısında yorumluyor, mesaj anlamsız karakterler olarak görünüyor.',
                options: [
                  { id: 'COMMON_FORMAT', label: 'Ortak Biçim (Standart veri formatı ve kodlama kuralı)' },
                  { id: 'SEQUENCE_INFO', label: 'Sıra Bilgisi (Paket numaralandırma kuralı)' },
                  { id: 'TARGET_INFO', label: 'Hedef Bilgisi (Alıcı adresleme kuralı)' }
                ]
              },
              {
                id: 'w3_h_q2',
                prompt: 'Sorun 2: Karışık Sıra — Parçalara ayrılan mesajın son parçası ilk parçadan önce ulaşıyor ve görüntü bozuk birleşiyor.',
                options: [
                  { id: 'COMMON_FORMAT', label: 'Ortak Biçim (Standart veri formatı ve kodlama kuralı)' },
                  { id: 'SEQUENCE_INFO', label: 'Sıra Bilgisi (Paket numaralandırma kuralı)' },
                  { id: 'TARGET_INFO', label: 'Hedef Bilgisi (Alıcı adresleme kuralı)' }
                ]
              },
              {
                id: 'w3_h_q3',
                prompt: 'Sorun 3: Belirsiz Hedef — Ağda birden fazla cihaz var ancak gönderilen paketin hangi cihaza teslim edileceği üzerinde yazmıyor.',
                options: [
                  { id: 'COMMON_FORMAT', label: 'Ortak Biçim (Standart veri formatı ve kodlama kuralı)' },
                  { id: 'SEQUENCE_INFO', label: 'Sıra Bilgisi (Paket numaralandırma kuralı)' },
                  { id: 'TARGET_INFO', label: 'Hedef Bilgisi (Alıcı adresleme kuralı)' }
                ]
              }
            ]
          }
        }
      }
    ]
  },

  // ==========================================================================
  // HAFTA 4: IP, MAC ve ARP
  // ==========================================================================
  {
    order: 4,
    title: 'IP, MAC ve ARP',
    shortDescription: 'Mantıksal ağ adresini (IP), fiziksel donanım adresini (MAC) ve yerel ağda IP adresinden MAC adresini bulan ARP mekanizmasını öğreniyoruz.',
    learningObjectives: [
      'Aynı yerel ağdaki cihazlara alt ağ maskesine (255.255.255.0) uygun ve çakışmayan IPv4 adresleri atayabilmek.',
      'IPv4 yerel ağında hedef IP adresinin MAC karşılığını bulmak için ARP yayın (broadcast) isteği ve yanıtı sürecini uygulayabilmek.'
    ],
    animation: {
      code: 'ANIM-W4',
      title: 'Öğretici Animasyon: Bu IP Kimde? (ARP)',
      subtitle: 'Bilgisayar A, aynı yerel ağdaki 192.168.1.20 IP adresli yazıcıya veri göndermek istiyor ama yazıcının MAC adresini bilmiyor. Ne yapar?',
      totalDurationSeconds: 72,
      keyTakeaways: [
        'ARP (Address Resolution Protocol), IPv4 yerel ağında (LAN) bilinen bir IP adresinin MAC (donanım) adresini öğrenmek için kullanılır.',
        'ARP İsteği yerel ağdaki tüm cihazlara yayın (broadcast) olarak sorulur: "192.168.1.20 kimde?"',
        'Yalnızca o IP adresine sahip olan cihaz (Yazıcı) kendi MAC adresiyle doğrudan (unicast) yanıt verir.'
      ],
      steps: [
        {
          id: 1,
          title: '1. Hedef IP Biliniyor, MAC Adresi Eksik',
          caption: 'Bilgisayar A (192.168.1.10), aynı ağdaki Yazıcıya (192.168.1.20) belge göndermek ister. Ancak yerel ağ çerçevesini oluşturmak için yazıcının MAC adresine ihtiyacı vardır.',
          technicalNote: 'ARP tablosuna bakılır; henüz 192.168.1.20 için kayıt yoktur.',
          durationMs: 18000
        },
        {
          id: 2,
          title: '2. ARP Yayın İsteği (Broadcast): "192.168.1.20 Kimde?"',
          caption: 'Bilgisayar A, Switch üzerinden yerel ağdaki tüm cihazlara seslenir: "192.168.1.20 IP adresi kimdeyse MAC adresini bana bildirsin!"',
          technicalNote: 'ARP Request çerçevesi FF:FF:FF:FF:FF:FF yayın MAC adresiyle aynı yerel ağdaki tüm portlara iletilir.',
          durationMs: 18000
        },
        {
          id: 3,
          title: '3. Diğer Cihazlar Yoksayar, Yazıcı Yanıt Verir (Unicast)',
          caption: 'Bilgisayar B (192.168.1.30) "Bu benim IP adresim değil" diyerek isteği yoksayar. Yazıcı (192.168.1.20) ise doğrudan Bilgisayar A’ya yanıt döner: "192.168.1.20 benim, MAC adresim 02:00:00:00:00:20".',
          technicalNote: 'ARP Reply tüm ağa değil, yalnızca soruyu soran Bilgisayar A’ya doğrudan (unicast) gönderilir.',
          durationMs: 18000
        },
        {
          id: 4,
          title: '4. ARP Tablosuna Kayıt ve Veri İletimi',
          caption: 'Bilgisayar A öğrendiği MAC adresini ARP tablosuna not eder ve yazdırılacak belgeyi artık doğrudan yazıcıya gönderir.',
          technicalNote: 'Not: ARP yalnızca IPv4 yerel ağında çalışır; yönlendiricinin ötesindeki dış internet ağlarına ARP yayını çıkmaz.',
          durationMs: 18000
        }
      ]
    },
    activities: [
      {
        code: 'W4-A1',
        weekOrder: 4,
        orderInWeek: 1,
        title: 'Cihazlara IP Ver',
        shortPurpose: 'Yönlendiricisi 192.168.1.1 (maske 255.255.255.0) olan yerel ağdaki üç uç cihaza uygun ve benzersiz IP adresleri ata.',
        category: 'REQUIRED_ACTIVITY',
        required: true,
        expectedSeconds: 300,
        allocatedSeconds: 600,
        contentVersion: 1,
        config: {
          widgetType: 'IP_ASSIGNMENT',
          instructions: [
            'Ağımızdaki yönlendirici (ağ geçidi) 192.168.1.1 adresini kullanmaktadır ve alt ağ maskemiz 255.255.255.0’dır.',
            'Bu maskeye göre aynı yerel ağdaki tüm cihazların IP adresi "192.168.1." ile başlamalı, son hanesi ise her cihazda farklı olmalıdır.',
            'Listeden Bilgisayar 1, Bilgisayar 2 ve Yazıcı için uygun IP adreslerini seç ve "Kontrol Et" düğmesine bas.'
          ],
          hint: '192.168.2.10 adresi farklı bir ağa (192.168.2.x) aittir! Ayrıca iki cihaza aynı IP adresini verirsen IP çakışması yaşanır.',
          earlyFinisherPrompt: {
            question: 'İki bilgisayara yanlışlıkla aynı IP adresini (örneğin ikisine de 192.168.1.10) verirsek ne olur?',
            explanation: 'Buna "IP Çakışması (IP Conflict)" denir. Ağdaki paketlerin hangisine gideceği karışır ve her iki cihazda da ağ bağlantısı kararsızlaşır veya kesilir.'
          },
          ipAssignment: {
            gatewayIp: '192.168.1.1',
            subnetMask: '255.255.255.0',
            ipPool: ['192.168.1.10', '192.168.1.20', '192.168.1.30', '192.168.2.10'],
            devices: [
              { id: 'dev_pc1', label: 'Bilgisayar 1', deviceType: 'pc' },
              { id: 'dev_pc2', label: 'Bilgisayar 2', deviceType: 'pc' },
              { id: 'dev_printer', label: 'Ağ Yazıcısı', deviceType: 'printer' }
            ]
          }
        }
      },
      {
        code: 'W4-A2',
        weekOrder: 4,
        orderInWeek: 2,
        title: 'Yazıcının MAC Adresini Bul (ARP Uygulaması)',
        shortPurpose: 'Bilgisayar A’dan ARP isteği başlatarak 192.168.1.20 IP adresli yazıcıyı bul ve doğru MAC adresi kartıyla eşleştir.',
        category: 'REQUIRED_ACTIVITY',
        required: true,
        expectedSeconds: 300,
        allocatedSeconds: 600,
        contentVersion: 1,
        config: {
          widgetType: 'ARP_SIMULATION',
          instructions: [
            'Adım 1: Bilgisayar A (192.168.1.10), 192.168.1.20 IP adresli cihazın MAC adresini öğrenmek istiyor. "1. ARP Yayın İsteğini Başlat" düğmesine tıkla.',
            'Adım 2: Ağdaki cihazlardan hangisinin bu ARP isteğine yanıt vereceğini (192.168.1.20 sahibi olan cihazı) seç.',
            'Adım 3: Seçtiğin cihazın döndürdüğü doğru MAC adresi kartını seçerek ARP tablosunu tamamla ve "Kontrol Et" düğmesine bas.'
          ],
          hint: 'ARP isteği tüm yerel ağa sorulur (kesik turuncu yayın okları), ancak yalnızca hedef IP olan 192.168.1.20 (Yazıcı) kendi MAC adresi olan 02:00:00:00:00:20 ile doğrudan yanıt verir.',
          earlyFinisherPrompt: {
            question: 'Bilgisayar A yazıcının MAC adresini bir kez öğrendikten sonra, her saniye tekrar ARP yayını yapmak zorunda mıdır?',
            explanation: 'Hayır! Öğrenilen IP-MAC eşleşmesi cihazın "ARP Önbelleği (ARP Cache/Tablosu)" içinde belirli bir süre saklanır; böylece sonraki paketler doğrudan gönderilir.'
          },
          arpSimulation: {
            subnetInfo: 'Yerel Ağ: 192.168.1.0/24 (Maske: 255.255.255.0)',
            targetIpToFind: '192.168.1.20',
            sender: {
              id: 'host_a',
              label: 'Bilgisayar A (Gönderici)',
              ip: '192.168.1.10',
              mac: '02:00:00:00:00:10'
            },
            targets: [
              {
                id: 'host_b',
                label: 'Bilgisayar B',
                deviceType: 'pc',
                ip: '192.168.1.30'
              },
              {
                id: 'host_printer',
                label: 'Ağ Yazıcısı',
                deviceType: 'printer',
                ip: '192.168.1.20'
              }
            ],
            macCards: [
              { id: 'mac_10', mac: '02:00:00:00:00:10', hintLabel: 'Bilgisayar A ağ kartı (02:00:00:00:00:10)' },
              { id: 'mac_20', mac: '02:00:00:00:00:20', hintLabel: 'Yazıcı ağ kartı (02:00:00:00:00:20)' },
              { id: 'mac_30', mac: '02:00:00:00:00:30', hintLabel: 'Bilgisayar B ağ kartı (02:00:00:00:00:30)' }
            ]
          }
        }
      },
      {
        code: 'W4-Q',
        weekOrder: 4,
        orderInWeek: 3,
        title: '4. Hafta Değerlendirmesi',
        shortPurpose: 'IP adresi, MAC adresi ve ARP protokolünün görevleri hakkındaki 3 soruyu yanıtla.',
        category: 'QUIZ',
        required: true,
        expectedSeconds: 180,
        allocatedSeconds: 300,
        contentVersion: 1,
        config: {
          widgetType: 'WEEK_QUIZ',
          instructions: [
            'Her soru için doğru seçeneği işaretle.',
            'Yanlış cevaplarda açıklamayı okuyup tekrar deneyebilirsin.',
            'Üç soruyu da doğru yanıtladığında hafta değerlendirmesi tamamlanır.'
          ],
          hint: 'IP bağlandığın ağa göre değişebilen mantıksal adrestir; MAC ağ kartına ait donanım adresidir; ARP ise yerel ağda IP’den MAC adresini bulur.',
          quiz: {
            questions: [
              {
                id: 'w4_q1',
                number: 1,
                question: 'Bir cihazın hangi ağda bulunduğunu gösteren ve cihaz farklı bir ağa (örneğin evden okula) taşındığında değişebilen mantıksal adres aşağıdakilerden hangisidir?',
                options: [
                  { id: 'a', text: 'IP Adresi' },
                  { id: 'b', text: 'MAC (Fiziksel Donanım) Adresi' },
                  { id: 'c', text: 'USB Port Numarası' },
                  { id: 'd', text: 'Monitör Seri Numarası' }
                ]
              },
              {
                id: 'w4_q2',
                number: 2,
                question: 'Ağ kartı (NIC) üzerinde tanımlı olan ve aynı yerel ağ (LAN) içindeki çerçeve teslimatında kullanılan donanım adresi hangisidir?',
                options: [
                  { id: 'a', text: 'MAC Adresi' },
                  { id: 'b', text: 'Web Sitesi Alan Adı' },
                  { id: 'c', text: 'Alt Ağ Maskesi' },
                  { id: 'd', text: 'E-posta Adresi' }
                ]
              },
              {
                id: 'w4_q3',
                number: 3,
                question: 'IPv4 yerel ağında hedef cihazın IP adresi biliniyor ancak MAC adresi bilinmiyorsa, "Bu IP adresi kimde?" diye sorarak MAC adresini öğrenen protokol hangisidir?',
                options: [
                  { id: 'a', text: 'ARP (Address Resolution Protocol)' },
                  { id: 'b', text: 'HTML' },
                  { id: 'c', text: 'MP3' },
                  { id: 'd', text: 'JPEG' }
                ]
              }
            ]
          }
        }
      },
      {
        code: 'W4-H',
        weekOrder: 4,
        orderInWeek: 4,
        title: 'Uygulama Ödevi: Adres Karışıklığını Düzelt',
        shortPurpose: 'Aynı ağdaki IP çakışmasını (.10 ve .10) gider ve neden her cihazın benzersiz adrese ihtiyaç duyduğunu açıkla.',
        category: 'HOMEWORK',
        required: false,
        expectedSeconds: 240,
        allocatedSeconds: 600,
        contentVersion: 1,
        config: {
          widgetType: 'IP_ASSIGNMENT',
          instructions: [
            'Aşağıdaki ağda Cihaz 1 ve Cihaz 2’ye yanlışlıkla aynı IP adresi (192.168.1.10) verilmiş, Cihaz 3 ise 192.168.1.30 kullanıyor.',
            'Çakışan cihazlardan birinin IP adresini boşta olan uygun bir yerel ağ adresiyle değiştirerek üç cihazın da benzersiz ve doğru ağda (192.168.1.x) olmasını sağla.',
            'Alt kısımdaki "Neden farklı adres?" kontrol sorusunu doğru yanıtla ve "Kontrol Et" düğmesine bas.'
          ],
          hint: '192.168.1.10 ve 192.168.1.30 zaten kullanımda. Çakışan cihazlardan birine 192.168.1.20 verebilirsin.',
          ipAssignment: {
            gatewayIp: '192.168.1.1',
            subnetMask: '255.255.255.0',
            ipPool: ['192.168.1.10', '192.168.1.20', '192.168.1.30', '192.168.2.10'],
            devices: [
              { id: 'conflict_pc1', label: 'Muhasebe PC 1', deviceType: 'pc', initialIp: '192.168.1.10' },
              { id: 'conflict_pc2', label: 'Muhasebe PC 2 (Çakışan)', deviceType: 'laptop', initialIp: '192.168.1.10' },
              { id: 'conflict_printer', label: 'Ofis Yazıcısı', deviceType: 'printer', initialIp: '192.168.1.30' }
            ],
            followUpQuestion: {
              prompt: 'Kontrol Sorusu: Aynı yerel ağdaki her cihazın neden birbirinden farklı (benzersiz) bir IP adresine sahip olması gerekir?',
              options: [
                {
                  id: 'REASON_UNIQUE_DELIVERY',
                  text: 'Ağdaki veri paketlerinin karışmadan doğru hedef cihaza teslim edilebilmesi ve adres çakışması yaşanmaması için'
                },
                {
                  id: 'REASON_SCREEN_BRIGHTNESS',
                  text: 'Bilgisayar ekranlarının aynı parlaklıkta çalışabilmesi için'
                },
                {
                  id: 'REASON_CABLE_COLOR',
                  text: 'Takılan Ethernet kablolarının renklerini ayırt edebilmek için'
                }
              ]
            }
          }
        }
      }
    ]
  },

  // ==========================================================================
  // HAFTA 5: Ağlar Arası İletişim ve Sorun Çözme
  // ==========================================================================
  {
    order: 5,
    title: 'Ağlar Arası İletişim ve Sorun Çözme',
    shortDescription: 'Yerel ağ içi trafik ile dış ağ (internet) trafiğinin izlediği yolları karşılaştırıyor, temel ağ sorunlarında ilk kontrol adımlarını öğreniyoruz.',
    learningObjectives: [
      'Aynı yerel ağdaki bir cihaza giderken kullanılan yol (Switch üzerinden) ile başka bir ağa/internete çıkarken kullanılan yolu (Yönlendirici üzerinden) ayırt edebilmek.',
      'Yaygın bağlantı sorunlarında (çıkmış kablo, kapalı Wi-Fi, yerel ağ var ama internet yok) uygulanacak ilk kontrol adımını seçebilmek.'
    ],
    animation: {
      code: 'ANIM-W5',
      title: 'Öğretici Animasyon: Aynı Ağ mı, Başka Ağ mı?',
      subtitle: 'Bilgisayarımız ne zaman sadece Switch üzerinden hedefe ulaşır, ne zaman Yönlendirici (Varsayılan Ağ Geçidi) kapısını kullanır?',
      totalDurationSeconds: 76,
      keyTakeaways: [
        'Yerel yazıcı trafiği aynı ağda (192.168.1.0/24) olduğu için Yönlendiriciye veya internete çıkmaz; doğrudan Switch üzerinden yazıcıya gider.',
        'Başka bir ağdaki Uzak Sunucuya giderken paketler önce Switch üzerinden Yönlendiriciye (Varsayılan Ağ Geçidi - 192.168.1.1) teslim edilir.',
        'Alt katman çerçevesi (Layer 2 MAC başlığı) tüm internet boyunca değişmeden gitmez; her yönlendirici geçişinde (hop) çerçeve yenilenir.'
      ],
      steps: [
        {
          id: 1,
          title: '1. Hedef Aynı Ağda mı Kontrolü',
          caption: 'Bilgisayar (192.168.1.10), kendi IP adresini ve alt ağ maskesini (255.255.255.0) hedef IP adresiyle karşılaştırır.',
          technicalNote: 'İlk üç oktet (192.168.1) aynıysa hedef yerel ağdadır; farklıysa hedef dış ağdadır.',
          durationMs: 18000
        },
        {
          id: 2,
          title: '2. Durum A: Yerel Yazıcıya İletim (Aynı Ağ)',
          caption: 'Hedef 192.168.1.20 (Yazıcı) aynı yerel ağdadır. Veri; Bilgisayar → Switch → Yazıcı yolunu izler. Yönlendiriciye ve internete hiç çıkmaz!',
          technicalNote: 'Yerel ağ trafiği LAN içinde kalır; internet kesik olsa bile bu yol çalışır.',
          durationMs: 19000
        },
        {
          id: 3,
          title: '3. Durum B: Uzak Sunucuya İletim (Başka Ağ)',
          caption: 'Hedef uzaktaki bir web sunucusudur (başka ağ). Bilgisayar paketi kendi ağının çıkış kapısı olan Yönlendiriciye (192.168.1.1) gönderir.',
          technicalNote: 'İlk çerçeve Bilgisayar’dan Yönlendirici’nin MAC adresine gönderilir.',
          durationMs: 19000
        },
        {
          id: 4,
          title: '4. Yönlendiriciden Dış Ağlara ve Uzak Sunucuya Geçiş',
          caption: 'Yönlendirici paketi alır, diğer ağlar (internet bulutu) üzerinden Uzak Sunucuya yönlendirir. Yol: Bilgisayar → Switch → Yönlendirici → Uzak Sunucu.',
          technicalNote: 'Her yönlendirici geçişinde (hop) yerel çerçeve başlığı değişir, kaynak ve hedef IP bilgisi ise uçtan uca yönlendirmeye rehberlik eder.',
          durationMs: 20000
        }
      ]
    },
    activities: [
      {
        code: 'W5-A1',
        weekOrder: 5,
        orderInWeek: 1,
        title: 'Doğru Yolu Göster',
        shortPurpose: 'Önce yerel ağdaki yazıcıya giden yolu, ardından diğer ağlardaki uzak sunucuya giden yolu sırasıyla cihazlara tıklayarak göster.',
        category: 'REQUIRED_ACTIVITY',
        required: true,
        expectedSeconds: 300,
        allocatedSeconds: 600,
        contentVersion: 1,
        config: {
          widgetType: 'PATH_TRACKER',
          instructions: [
            'Bu etkinlikte iki ayrı yol görevi bulunmaktadır.',
            'Görev 1 (Yerel Yol): Bilgisayardan başlayarak aynı yerel ağdaki Yazıcıya giden yol üzerindeki cihazları sırayla seç.',
            'Görev 2 (Dış Ağ Yolu): Bilgisayardan başlayarak diğer ağlardaki (bulut arkasındaki) Uzak Sunucuya giden yol üzerindeki cihazları sırayla seç.',
            'Her iki yolu da tamamladıktan sonra "Kontrol Et" düğmesine bas.'
          ],
          hint: 'Yerel ağda Yönlendiriciye gerek yoktur (Bilgisayar → Switch → Yazıcı). Dış ağa çıkarken ise Switch üzerinden Yönlendiriciye, oradan Uzak Sunucuya geçilir.',
          earlyFinisherPrompt: {
            question: 'Yönlendirici (Router) arızalanırsa Görev 1’deki yerel yazıcı yolu çalışmaya devam eder mi?',
            explanation: 'Evet! Bilgisayar ve yazıcı aynı yerel ağda (Switch üzerinde) olduğu için sabit IP veya mevcut yerel yapılandırmayla yönlendiriciye uğramadan haberleşebilirler.'
          },
          pathTracker: {
            nodes: [
              { id: 'pc', label: 'Bilgisayar', deviceType: 'pc', x: 90, y: 200, mobileX: 180, mobileY: 70, ipHint: '192.168.1.10' },
              { id: 'switch', label: 'Switch', deviceType: 'switch', x: 260, y: 200, mobileX: 180, mobileY: 190 },
              { id: 'printer', label: 'Yerel Yazıcı', deviceType: 'printer', x: 260, y: 340, mobileX: 70, mobileY: 310, ipHint: '192.168.1.20' },
              { id: 'router', label: 'Yönlendirici', deviceType: 'router', x: 430, y: 200, mobileX: 280, mobileY: 310, ipHint: '192.168.1.1' },
              { id: 'cloud_wan', label: 'Diğer Ağlar (Bulut)', deviceType: 'cloud', x: 545, y: 200, mobileX: 280, mobileY: 410 },
              { id: 'remote_server', label: 'Uzak Sunucu', deviceType: 'server', x: 640, y: 200, mobileX: 180, mobileY: 490, ipHint: 'Dış Ağ' }
            ],
            staticEdges: [
              { from: 'pc', to: 'switch', connectionType: 'wired' },
              { from: 'switch', to: 'printer', connectionType: 'wired' },
              { from: 'switch', to: 'router', connectionType: 'wired' },
              { from: 'router', to: 'remote_server', connectionType: 'wan' }
            ],
            missions: [
              {
                id: 'local_path',
                title: '1. Görev: Yerel Ağ Yolu (Bilgisayar → Yazıcı)',
                description: 'Bilgisayardan yerel ağ yazıcısına belge gönderirken paketin uğradığı cihazları sırasıyla seç.',
                startNodeId: 'pc',
                targetNodeId: 'printer'
              },
              {
                id: 'external_path',
                title: '2. Görev: Dış Ağ Yolu (Bilgisayar → Uzak Sunucu)',
                description: 'Bilgisayardan diğer ağlardaki Uzak Sunucuya bağlanırken paketin uğradığı temel ağ cihazlarını sırasıyla seç.',
                startNodeId: 'pc',
                targetNodeId: 'remote_server'
              }
            ]
          }
        }
      },
      {
        code: 'W5-A2',
        weekOrder: 5,
        orderInWeek: 2,
        title: 'İlk Neyi Kontrol Edersin?',
        shortPurpose: 'Karşılaşılan üç temel ağ sorununda kesin arıza teşhisinden önce yapılması gereken en mantıklı ilk kontrol adımını seç.',
        category: 'REQUIRED_ACTIVITY',
        required: true,
        expectedSeconds: 300,
        allocatedSeconds: 600,
        contentVersion: 1,
        config: {
          widgetType: 'SCENARIO_CHOICE',
          instructions: [
            'Not: Bu adımlar kesin arıza teşhisi değil, sorun çözmeye başlarken uygulanacak en hızlı ve mantıklı İLK kontrol adımlarıdır.',
            'Üç durum için de ilk kontrol edeceğin noktayı seç ve "Kontrol Et" düğmesine bas.'
          ],
          hint: 'Sorun tek bir kablolu cihazdaysa kabloya, kablosuz telefonda ağ yoksa telefonun Wi-Fi ayarına, yerel yazıcı çalışırken tüm ofiste internet yoksa yönlendirici/modem internet çıkış tarafına bakılır.',
          earlyFinisherPrompt: {
            question: 'Sorun çözerken neden hemen işletim sistemini yeniden kurmak yerine fiziksel kabloyu veya Wi-Fi düğmesini kontrol ederek başlarız?',
            explanation: 'Sorun gidermede en basit ve en sık rastlanan fiziksel/bağlantı kontrollerinden başlamak hem zaman kazandırır hem de çalışan ayarların gereksiz yere bozulmasını önler.'
          },
          scenarios: {
            note: 'Önemli Not: Aşağıdaki seçenekler kesin arıza teşhisi değil, pratik sorun gidermede uygulanacak İLK kontrol adımlarıdır.',
            questions: [
              {
                id: 'w5_a2_s1',
                prompt: 'Durum 1: Masaüstü bilgisayarda "Ağ kablosu takılı değil" uyarısı var ve kasanın arkasındaki Ethernet kablosunun klipsi yerinden çıkmış görünüyor.',
                options: [
                  { id: 'CHECK_CABLE', label: 'İlk Adım: Bilgisayar ile switch arasındaki Ethernet kablosunun iki ucunun da yuvasına tam oturup oturmadığını kontrol etmek' },
                  { id: 'CHECK_WIFI', label: 'İlk Adım: Telefonun Wi-Fi ayarını açıp kapatmak' },
                  { id: 'CHECK_WAN_ISP', label: 'İlk Adım: Tüm binanın internet aboneliğini iptal etmek' }
                ]
              },
              {
                id: 'w5_a2_s2',
                prompt: 'Durum 2: Sınıftaki diğer tüm telefonlar ve bilgisayarlar kablosuz ağa sorunsuz giriyor ancak senin telefonunun üst çubuğunda Wi-Fi simgesi hiç görünmüyor.',
                options: [
                  { id: 'CHECK_CABLE', label: 'İlk Adım: Laboratuvardaki yazıcının elektrik fişini çekmek' },
                  { id: 'CHECK_WIFI', label: 'İlk Adım: Telefonun Wi-Fi özelliğinin açık olup olmadığını ve doğru kablosuz ağa (SSID) bağlanıp bağlanmadığını kontrol etmek' },
                  { id: 'CHECK_WAN_ISP', label: 'İlk Adım: Sunucu odasındaki fiber optik kabloları değiştirmek' }
                ]
              },
              {
                id: 'w5_a2_s3',
                prompt: 'Durum 3: Ofisteki bilgisayarlar yerel ağ yazıcısından çıktı alabiliyor (yerel ağ çalışıyor), ancak ofisteki hiçbir cihaz dış internet sitelerine erişemiyor.',
                options: [
                  { id: 'CHECK_CABLE', label: 'İlk Adım: Çalışan yazıcının kablosunu sökmek' },
                  { id: 'CHECK_WIFI', label: 'İlk Adım: Bilgisayarların fare ve klavyesini değiştirmek' },
                  { id: 'CHECK_WAN_ISP', label: 'İlk Adım: Yönlendirici/modem cihazının dış hat (İnternet/WAN) bağlantısını, ışıklarını ve servis sağlayıcı erişimini kontrol etmek' }
                ]
              }
            ]
          }
        }
      },
      {
        code: 'W5-Q',
        weekOrder: 5,
        orderInWeek: 3,
        title: '5. Hafta Değerlendirmesi',
        shortPurpose: 'Yönlendiricinin görevi, IPv6 adres alanı ihtiyacı ve yerel ağ–internet ayrımı hakkındaki 3 soruyu yanıtla.',
        category: 'QUIZ',
        required: true,
        expectedSeconds: 180,
        allocatedSeconds: 300,
        contentVersion: 1,
        config: {
          widgetType: 'WEEK_QUIZ',
          instructions: [
            'Her soru için doğru seçeneği işaretle.',
            'Yanlış cevaplarda açıklamayı okuyarak tekrar deneyebilirsin.',
            'Üç soruyu da doğru yanıtladığında 5. hafta değerlendirmesi tamamlanır.'
          ],
          hint: 'Yönlendirici farklı ağları birbirine bağlar, IPv6 çok daha geniş adres alanı sunar ve yerel ağ iletişimi internetten bağımsız çalışabilir.',
          quiz: {
            questions: [
              {
                id: 'w5_q1',
                number: 1,
                question: 'Ev veya okul yerel ağındaki (LAN) bir bilgisayarın başka bir ağdaki uzak sunucuya (internete) paket gönderebilmesi için çıkış kapısı olarak kullandığı cihaz hangisidir?',
                options: [
                  { id: 'a', text: 'Yönlendirici (Router / Varsayılan Ağ Geçidi)' },
                  { id: 'b', text: 'Yalnızca Yerel Ağ Yazıcısı' },
                  { id: 'c', text: 'Bilgisayar Hoparlörü' },
                  { id: 'd', text: 'Barkod Yazıcısı' }
                ]
              },
              {
                id: 'w5_q2',
                number: 2,
                question: 'IPv4 adreslerinin yanında yeni nesil IPv6 protokolünün geliştirilmesinin en temel nedeni aşağıdakilerden hangisidir?',
                options: [
                  { id: 'a', text: 'Dünyada internete bağlanan cihaz sayısının hızla artmasıyla IPv4 adreslerinin yetersiz kalması ve IPv6’nın çok daha geniş (128-bit) bir adres alanı sunması' },
                  { id: 'b', text: 'IPv6 kullanıldığında bilgisayarların elektrik kablosuna ihtiyaç duymaması' },
                  { id: 'c', text: 'IPv6’nın yalnızca yerel yazıcılarda çalışması' },
                  { id: 'd', text: 'IPv4 adreslerinin yalnızca harflerden oluşması' }
                ]
              },
              {
                id: 'w5_q3',
                number: 3,
                question: 'Bir ofiste dış internet hattı kesildiğinde yerel ağ (LAN) içindeki iletişim hakkında ne söylenebilir?',
                options: [
                  { id: 'a', text: 'Aynı switch/yerel ağ üzerinde bulunan bilgisayarlar yerel ağ yazıcısını ve yerel dosya paylaşımını kullanmaya devam edebilir.' },
                  { id: 'b', text: 'Switch üzerindeki tüm kablolar otomatik olarak devre dışı kalır.' },
                  { id: 'c', text: 'Bilgisayarların MAC adresleri silinir.' },
                  { id: 'd', text: 'Yerel yazıcıya giden her paket önce başka kıtadaki sunucuya gitmek zorundadır.' }
                ]
              }
            ]
          }
        }
      },
      {
        code: 'W5-H',
        weekOrder: 5,
        orderInWeek: 4,
        title: 'Final Öncesi Uygulama Ödevi: Küçük Ağımı Tamamlıyorum',
        shortPurpose: '5 hafta boyunca öğrendiğin bağlantı kurma, IP verme ve yerel/dış yol seçimi adımlarını tek bir bütünleşik ağ projesinde tamamla.',
        category: 'HOMEWORK',
        required: false,
        expectedSeconds: 420,
        allocatedSeconds: 600,
        contentVersion: 1,
        config: {
          widgetType: 'MULTI_STEP_HOMEWORK',
          instructions: [
            'Bu final öncesi ödev 4 adımdan oluşur; tamamladığın her adım otomatik kaydedilir.',
            'Adım 1 (Bağlantılar): PC 1, PC 2 ve Yazıcıyı ↔ Switch’e; Switch’i de ↔ Yönlendiriciye kablolu olarak bağla (toplam 4 bağlantı).',
            'Adım 2 (IP Adresleme): Yönlendirici 192.168.1.1 (maske 255.255.255.0) olduğuna göre PC 1, PC 2 ve Yazıcıya üç farklı uygun 192.168.1.x adresi ata.',
            'Adım 3 (Yerel Yazıcı Yolu): PC 1’den Yerel Yazıcıya giden yolu sırayla seç.',
            'Adım 4 (Dış Ağ Çıkış Yolu): PC 1’den Yönlendirici üzerinden Uzak Sunucuya giden dış ağ yolunu sırayla seç ve "Kontrol Et" düğmesine bas.'
          ],
          hint: 'Her adımda önceki haftalarda uyguladığın kurallar geçerlidir: Yıldız bağlantısı, 192.168.1.x benzersiz IP adresleri, yerel ağda Switch üzerinden yazıcıya, dış ağda ise Yönlendirici üzerinden Uzak Sunucuya geçiş.',
          multiStepHomework: {
            weekCode: 'W5-H',
            capstone: {
              subnetMask: '255.255.255.0',
              gatewayIp: '192.168.1.1',
              nodes: [
                { id: 'pc1', label: 'PC 1', deviceType: 'pc', x: 95, y: 100, mobileX: 75, mobileY: 85 },
                { id: 'pc2', label: 'PC 2', deviceType: 'pc', x: 95, y: 300, mobileX: 285, mobileY: 85 },
                { id: 'switch', label: 'Switch', deviceType: 'switch', x: 310, y: 200, mobileX: 180, mobileY: 235 },
                { id: 'printer', label: 'Yazıcı', deviceType: 'printer', x: 310, y: 350, mobileX: 75, mobileY: 390 },
                { id: 'router', label: 'Yönlendirici (.1)', deviceType: 'router', x: 525, y: 200, mobileX: 285, mobileY: 390 },
                { id: 'remote_server', label: 'Uzak Sunucu', deviceType: 'server', x: 650, y: 200, mobileX: 180, mobileY: 500 }
              ],
              ipDevices: [
                { id: 'pc1', label: 'PC 1', deviceType: 'pc' },
                { id: 'pc2', label: 'PC 2', deviceType: 'pc' },
                { id: 'printer', label: 'Yazıcı', deviceType: 'printer' }
              ],
              ipPool: ['192.168.1.10', '192.168.1.20', '192.168.1.30', '192.168.2.10'],
              localMission: {
                title: 'Adım 3: Yerel Yazıcı Yolu',
                description: 'PC 1’den Yazıcıya giden yol üzerindeki cihazları sırayla seç (PC 1 → Switch → Yazıcı).'
              },
              externalMission: {
                title: 'Adım 4: Dış Ağa Çıkış Yolu',
                description: 'PC 1’den Yönlendirici üzerinden Uzak Sunucuya giden yolu sırayla seç (PC 1 → Switch → Yönlendirici → Uzak Sunucu).'
              }
            }
          }
        }
      }
    ]
  }
];

// Assign Kolay / Orta / Zor difficulty levels for Weeks 2..5 (Week 1 has no difficulty badge)
for (const week of CURRICULUM_WEEKS) {
  if (week.order >= 2) {
    week.activities.forEach((act, idx) => {
      if (!act.difficulty) {
        act.difficulty =
          idx === 0 ? 'Kolay' : idx === 1 || idx === 2 ? 'Orta' : 'Zor';
      }
    });
  }
}

export function getCurriculumWeekByOrder(order: number): WeekCurriculumItem | undefined {
  return CURRICULUM_WEEKS.find((w) => w.order === order);
}

export function getCurriculumActivityByCode(code: string) {
  for (const week of CURRICULUM_WEEKS) {
    const act = week.activities.find((a) => a.code === code);
    if (act) return { week, activity: act };
  }
  return undefined;
}
