import { GpWeekDefinition } from '../types';

export const GP_WEEK_1: GpWeekDefinition = {
  order: 1,
  title: 'İlk Formum',
  shortTitle: 'Hafta 1',
  description:
    'UserForm bileşenlerini tanıma, tasarım ekranına bileşen yerleştirme, temel özellikleri değiştirme ve ilk buton olayını çalıştırma.',
  objectives: [
    'Label, TextBox ve CommandButton bileşenlerinin görevlerini ayırt etmek.',
    'UserForm üzerinde bileşen adı (Name) ve görünen yazı (Caption) arasındaki farkı uygulamak.',
    'Butonun Click olayına yazılan VBA kodunun çalışmasını gözlemlemek.'
  ],
  activities: [
    {
      id: 'H1-E1',
      code: 'H1-E1',
      week: 1,
      orderInWeek: 1,
      title: 'Ekrandaki Parçaları Tanı',
      difficulty: 'Basit',
      durationMinutes: 10,
      expectedSeconds: 300,
      allocatedSeconds: 600,
      objectives: [
        'UserForm üzerindeki temel bileşenleri görevleriyle eşleştirmek.'
      ],
      environment: 'web',
      prerequisites: [],
      instructions: {
        whatToDo: 'Soldaki dört UserForm bileşenini sağdaki doğru görev açıklamalarıyla eşleştir.',
        whereToStart: 'Önce "Label (Etiket)" kartını seçip açıklamasını oku.',
        whichData: 'Ekranda verilen dört bileşen kartı ve dört görev kutusu.',
        expectedResult: 'Tüm kartlar doğru görevle eşleştiğinde yeşil onay ve açıklama görürsün.',
        howToKnowDone: '"Kontrol Et" butonuna bastığında 4/4 doğru mesajı görünür.',
        steps: [
          'Soldan bir bileşen kartına tıkla (veya sürükle).',
          'Sağdaki uygun görev kutusuna tıkla.',
          'Dört eşleştirmeyi tamamladıktan sonra "Kontrol Et" butonuna bas.'
        ]
      },
      sampleInputs: ['Label, TextBox, CommandButton, UserForm'],
      expectedBehavior: 'Her bileşen yalnızca kendi gerçek göreviyle eşleşir.',
      completionCriteria: ['4/4 doğru eşleştirme yapılması'],
      hints: [
        'Kullanıcıdan veri almak için kullanılan kutu ile sadece yazı gösteren etiketi birbirinden ayır.',
        'TextBox içine yazı yazılabilir; Label ise sadece bilgi gösterir.',
        'Örnek: "Adınız:" yazısı bir Label, yanındaki boş kutu ise TextBox bileşenidir.'
      ],
      widgetType: 'matching',
      starterCode: '',
      starterForm: { title: 'İlk Formum', controls: [] },
      tests: [],
      excelChecklist: [
        'Excel’de Geliştirici (Developer) sekmesini açtım.',
        'Alt+F11 ile VBA penceresini açıp Insert > UserForm ekledim.'
      ],
      teacherNotes: 'Öğrencilere Name ve Caption farkını günlük hayattan (kimlik no vs. takma ad) örnekle.',
      teacherSolution: 'Label -> Bilgi/başlık yazısı gösterir; TextBox -> Kullanıcıdan metin alır; CommandButton -> Tıklandığında kodu çalıştırır; UserForm -> Bileşenlerin üzerinde durduğu penceredir.',
      extensionTask: 'Properties (F4) penceresinden UserForm arka plan rengini değiştirmeyi dene.',
      contentVersion: 1,
      matchingPayload: {
        leftItems: [
          { id: 'lbl', label: 'Label (Etiket)', subtitle: 'Sabit bilgi yazısı' },
          { id: 'txt', label: 'TextBox (Metin Kutusu)', subtitle: 'Veri giriş alanı' },
          { id: 'btn', label: 'CommandButton (Buton)', subtitle: 'Eylem tetikleyici' },
          { id: 'frm', label: 'UserForm (Form Penceresi)', subtitle: 'Ana arayüz yüzeyi' }
        ],
        rightTargets: [
          { id: 't_txt', text: 'Kullanıcının klavyeden ad, sayı veya mesaj girmesini sağlar.' },
          { id: 't_frm', text: 'Tüm form bileşenlerini üzerinde taşıyan özel penceredir.' },
          { id: 't_lbl', text: 'Ekranda başlık, açıklama veya hesaplama sonucunu gösterir.' },
          { id: 't_btn', text: 'Kullanıcı tıkladığında arkadaki VBA kodunu çalıştırır.' }
        ],
        correctPairs: {
          lbl: 't_lbl',
          txt: 't_txt',
          btn: 't_btn',
          frm: 't_frm'
        },
        explanations: {
          lbl: 'Label yalnızca ekranda metin göstermek için kullanılır.',
          txt: 'TextBox kullanıcıdan metin veya sayı almak için kullanılır.',
          btn: 'CommandButton tıklandığında Click olayını tetikler.',
          frm: 'UserForm diğer tüm bileşenlerin yerleştirildiği penceredir.'
        }
      }
    },
    {
      id: 'H1-E2',
      code: 'H1-E2',
      week: 1,
      orderInWeek: 2,
      title: 'Formunu Yerleştir',
      difficulty: 'Basit–orta',
      durationMinutes: 15,
      expectedSeconds: 450,
      allocatedSeconds: 900,
      objectives: [
        'Form yüzeyine Label, TextBox ve CommandButton eklemek.',
        'Bileşenlere VBA kurallarına uygun benzersiz Name ve anlaşılır Caption vermek.'
      ],
      environment: 'web',
      prerequisites: ['H1-E1'],
      instructions: {
        whatToDo: 'Boş UserForm üzerine 1 Label, 1 TextBox ve 1 CommandButton ekle ve özelliklerini düzenle.',
        whereToStart: 'Araç kutusundan "Label ekle" butonuna basarak başla.',
        whichData: 'Label için "Adınız:", CommandButton için "Göster" başlığı kullan.',
        expectedResult: 'Tasarım modunda üç bileşen görünür; çalıştırma moduna geçince kutuya yazı yazılabilir.',
        howToKnowDone: 'Tüm zorunlu bileşenler eklendiğinde ve "Kontrol Et" onay verdiğinde tamamlanır.',
        steps: [
          'Forma bir Label ekle, Name değerini lblAd, Caption değerini "Adınız:" yap.',
          'Forma bir TextBox ekle, Name değerini txtAd yap.',
          'Forma bir CommandButton ekle, Name değerini btnGoster, Caption değerini "Göster" yap.',
          'Çalıştırma moduna geçip formu test et ve "Kontrol Et"e bas.'
        ]
      },
      sampleInputs: ['lblAd ("Adınız:")', 'txtAd', 'btnGoster ("Göster")'],
      expectedBehavior: 'Bileşen adları benzersiz olmalı ve boşluk içermemelidir.',
      completionCriteria: [
        'En az 1 Label, 1 TextBox ve 1 CommandButton bulunması',
        'Tüm bileşen adlarının geçerli ve benzersiz VBA adı olması'
      ],
      hints: [
        'VBA’da bileşen adları (Name) boşluk veya Türkçe özel karakterle başlamamalıdır.',
        'Özellikler panelinde Name yerine Caption alanına "Göster" yazmalısın.',
        'Örnek adlandırma: lblAd, txtAd, btnGoster.'
      ],
      widgetType: 'form_builder',
      starterCode: '',
      starterForm: {
        title: 'Öğrenci Bilgi Formu',
        controls: []
      },
      tests: [],
      excelChecklist: [
        'Toolbox’tan form üzerine Label, TextBox ve CommandButton çizdim.',
        'Properties penceresinden Name ve Caption değerlerini güncelledim.'
      ],
      teacherNotes: 'Piksel hizalaması değil bileşen türü ve doğru adlandırma ölçülür.',
      teacherSolution: 'Label (lblAd, Caption: Adınız:), TextBox (txtAd), CommandButton (btnGoster, Caption: Göster).',
      extensionTask: 'Forma ikinci bir Label ekleyip Font.Size özelliğini 14 yap.',
      contentVersion: 1,
      formBuilderPayload: {
        allowedControls: ['Label', 'TextBox', 'CommandButton'],
        requiredControls: [
          { type: 'Label', minCount: 1, label: 'En az 1 Label (Etiket)' },
          { type: 'TextBox', minCount: 1, label: 'En az 1 TextBox (Metin Kutusu)' },
          { type: 'CommandButton', minCount: 1, label: 'En az 1 CommandButton (Buton)' }
        ],
        allowRunPreview: true
      }
    },
    {
      id: 'H1-E3',
      code: 'H1-E3',
      week: 1,
      orderInWeek: 3,
      title: 'Bu Buton Ne Yapar?',
      difficulty: 'Orta',
      durationMinutes: 20,
      expectedSeconds: 600,
      allocatedSeconds: 1200,
      objectives: [
        'Basit bir Click olayındaki atama ve metin birleştirme kodunu okuyup çıktıyı tahmin etmek.'
      ],
      environment: 'web',
      prerequisites: ['H1-E2'],
      instructions: {
        whatToDo: 'Verilen VBA kodunu oku, buton tıklandığında lblMesaj etiketinde ne yazacağını tahmin et.',
        whereToStart: 'Private Sub btnSelam_Click() içindeki satırları yukarıdan aşağı oku.',
        whichData: 'txtAd kutusunun içinde "Ayşe" yazdığını varsay.',
        expectedResult: 'Tahminini gönderdikten sonra kodu simülatörde çalıştırıp karşılaştırabilirsin.',
        howToKnowDone: 'Doğru tahmini seçip kontrol ettiğinde tamamlanır.',
        steps: [
          'Kodu dikkatlice oku; & işaretinin metinleri birleştirdiğine dikkat et.',
          'Tahmin seçeneğini işaretle ve "Tahmini Gönder"e bas.',
          '"Çalıştır ve Karşılaştır" ile sonucu simülatörde gör.'
        ]
      },
      sampleInputs: ['txtAd.Value = "Ayşe"'],
      expectedBehavior: 'lblMesaj.Caption değeri "Merhaba Ayşe!" olur.',
      completionCriteria: ['Doğru çıktı tahmininin seçilmesi'],
      hints: [
        '& operatörü iki metni yan yana birleştirir.',
        '"Merhaba " metninin sonunda bir boşluk olduğuna dikkat et.',
        'Örnek: "Selam " & "Ali" sonucu "Selam Ali" olur.'
      ],
      widgetType: 'output_prediction',
      starterCode: `Private Sub btnSelam_Click()
  lblMesaj.Caption = "Merhaba " & txtAd.Value & "!"
End Sub`,
      starterForm: {
        title: 'Selamlama Formu',
        controls: [
          { id: 'c1', type: 'TextBox', name: 'txtAd', value: 'Ayşe' },
          { id: 'c2', type: 'CommandButton', name: 'btnSelam', caption: 'Selamla' },
          { id: 'c3', type: 'Label', name: 'lblMesaj', caption: 'Henüz mesaj yok' }
        ]
      },
      tests: [],
      excelChecklist: [
        'Butona çift tıklayıp Click olayını açtım.',
        'F5 ile formu çalıştırıp sonucu gözlemledim.'
      ],
      teacherNotes: 'Boşluk karakterinin tırnak içinde kaldığını vurgulayın.',
      teacherSolution: 'Merhaba Ayşe!',
      extensionTask: 'Sonuna " Hoş geldin!" eklenirse çıktı nasıl değişir?',
      contentVersion: 1,
      outputPredictionPayload: {
        codeToRead: `Private Sub btnSelam_Click()
  lblMesaj.Caption = "Merhaba " & txtAd.Value & "!"
End Sub`,
        question: 'txtAd kutusunda "Ayşe" yazılıyken btnSelam butonuna basılırsa lblMesaj.Caption ne olur?',
        options: [
          'MerhabaAyşe!',
          'Merhaba Ayşe!',
          'Merhaba "Ayşe"!',
          'txtAd.Value'
        ],
        correctAnswer: 'Merhaba Ayşe!',
        explanation: '"Merhaba " sonundaki boşlukla birlikte txtAd.Value ("Ayşe") ve "!" metinleri & ile birleşir.',
        simInputs: { txtAd: 'Ayşe' },
        simEvent: 'btnSelam_Click'
      }
    },
    {
      id: 'H1-E4',
      code: 'H1-E4',
      week: 1,
      orderInWeek: 4,
      title: 'Karşılama Ekranını Yap',
      difficulty: 'Orta–zor',
      durationMinutes: 40,
      expectedSeconds: 1200,
      allocatedSeconds: 2400,
      objectives: [
        'TextBox’tan alınan metni Label üzerine yazdıran bir Click olayı kodlamak.'
      ],
      environment: 'web',
      prerequisites: ['H1-E3'],
      instructions: {
        whatToDo: 'btnKarsila_Click olayının içine, txtAd değerini okuyup lblSonuc etiketine "Hoş geldin, <Ad>!" yazan kodu yaz.',
        whereToStart: 'Editörde Private Sub btnKarsila_Click() ile End Sub arasındaki boş satıra odaklan.',
        whichData: 'Formda txtAd (TextBox), btnKarsila (Button) ve lblSonuc (Label) bileşenleri hazırdır.',
        expectedResult: 'Kutuya "Mehmet" yazılıp butona basıldığında lblSonuc üzerinde "Hoş geldin, Mehmet!" yazmalıdır.',
        howToKnowDone: 'Tüm test senaryoları yeşil olduğunda etkinlik tamamlanır.',
        steps: [
          'lblSonuc.Caption = "Hoş geldin, " & Trim(txtAd.Value) & "!" satırını yaz.',
          'Sağdaki önizlemede ad yazıp "Çalıştır"a bas.',
          '"Kontrol Et" ile otomatik testleri çalıştır.'
        ]
      },
      sampleInputs: ['"Mehmet"', '"Zeynep"'],
      expectedBehavior: 'lblSonuc.Caption içinde "Hoş geldin, " ve girilen ad yer almalıdır.',
      completionCriteria: [
        'Test 1: "Mehmet" girdisinde lblSonuc.Caption = "Hoş geldin, Mehmet!"',
        'Test 2: "Zeynep" girdisinde lblSonuc.Caption = "Hoş geldin, Zeynep!"'
      ],
      hints: [
        'Label bileşeninin görünen yazısını değiştirmek için Caption özelliğini kullan.',
        'txtAd.Value değerini "Hoş geldin, " metniyle & kullanarak birleştir.',
        'Örnek: lblSonuc.Caption = "Hoş geldin, " & txtAd.Value & "!"'
      ],
      widgetType: 'code_editor',
      quickCommands: ['lblSonuc.Caption = ', 'txtAd.Value', '& "!"', 'Trim('],
      supportedEvents: ['btnKarsila_Click'],
      starterCode: `Option Explicit

Private Sub btnKarsila_Click()
  ' Buraya kodunu yaz: lblSonuc.Caption değerini güncelle
  
End Sub`,
      starterForm: {
        title: 'Karşılama Ekranı',
        controls: [
          { id: 'l1', type: 'Label', name: 'lblBaslik', caption: 'Adınızı Girin:' },
          { id: 't1', type: 'TextBox', name: 'txtAd', value: 'Mehmet' },
          { id: 'b1', type: 'CommandButton', name: 'btnKarsila', caption: 'Karşıla' },
          { id: 'l2', type: 'Label', name: 'lblSonuc', caption: '...' }
        ]
      },
      tests: [
        {
          id: 't1',
          label: 'Mehmet için karşılama',
          eventTarget: 'btnKarsila_Click',
          inputs: { txtAd: 'Mehmet' },
          expectedControlProps: { lblSonuc: { Caption: 'Hoş geldin, Mehmet!' } },
          description: 'txtAd = "Mehmet" iken lblSonuc.Caption "Hoş geldin, Mehmet!" olmalı.'
        },
        {
          id: 't2',
          label: 'Zeynep için karşılama',
          eventTarget: 'btnKarsila_Click',
          inputs: { txtAd: 'Zeynep' },
          expectedControlProps: { lblSonuc: { Caption: 'Hoş geldin, Zeynep!' } },
          description: 'txtAd = "Zeynep" iken lblSonuc.Caption "Hoş geldin, Zeynep!" olmalı.'
        }
      ],
      excelChecklist: [
        'Excel VBA’da aynı UserForm’u oluşturup kodu çalıştırdım.',
        'Farklı isimler girerek etiketin güncellendiğini gördüm.'
      ],
      teacherNotes: 'Butonun görünen yazısı için Caption, metin kutusu değeri için Value kullanıldığını pekiştirin.',
      teacherSolution: `Option Explicit

Private Sub btnKarsila_Click()
  lblSonuc.Caption = "Hoş geldin, " & Trim(txtAd.Value) & "!"
End Sub`,
      extensionTask: 'btnTemizle butonu ekleyip txtAd.Value = "" ile kutuyu temizlemeyi dene.',
      contentVersion: 1
    },
    {
      id: 'H1-E5',
      code: 'H1-E5',
      week: 1,
      orderInWeek: 5,
      title: 'Kendi Karşılama Ekranın',
      difficulty: 'Zor',
      durationMinutes: 40,
      expectedSeconds: 1200,
      allocatedSeconds: 2400,
      objectives: [
        'Ad ve bölüm bilgisi alan, renk değiştiren ve mesaj gösteren tam bir karşılama formu kodlamak.'
      ],
      environment: 'web+excel',
      prerequisites: ['H1-E4'],
      instructions: {
        whatToDo: 'Ad ve bölüm kutularını okuyup lblSonuc etiketine yazan ve rengini yeşile (vbGreen) çeviren kodu tamamla.',
        whereToStart: 'btnTamam_Click içinde önce lblSonuc.Caption, ardından lblSonuc.ForeColor satırını yaz.',
        whichData: 'txtAd, txtBolum, lblSonuc ve btnTamam bileşenleri formda mevcuttur.',
        expectedResult: 'Butona basıldığında lblSonuc üzerinde ad ve bölüm bilgisi yeşil renkte görünür; MsgBox ile tebrik mesajı çıkar.',
        howToKnowDone: 'Web testleri geçip aşağıdaki Excel kontrol listesini işaretlediğinde tamamlanır.',
        steps: [
          'lblSonuc.Caption içine txtAd.Value ve txtBolum.Value değerlerini birleştir.',
          'lblSonuc.ForeColor = vbGreen satırını ekle.',
          'MsgBox "Kayıt hazır!" ile kullanıcıya bildirim ver.',
          'Çalıştırıp test ettikten sonra Excel kontrol listesini tamamla.'
        ]
      },
      sampleInputs: ['txtAd = "Deniz"', 'txtBolum = "Bilgisayar"'],
      expectedBehavior: 'lblSonuc.Caption içinde hem ad hem bölüm geçer, ForeColor vbGreen olur ve MsgBox gösterilir.',
      completionCriteria: [
        'lblSonuc.Caption değerinin ad ve bölümü içermesi',
        'lblSonuc.ForeColor değerinin vbGreen (#16a34a) olması',
        'MsgBox çıktısı üretilmesi'
      ],
      hints: [
        'Yazı rengini değiştirmek için ForeColor özelliğine vbGreen atayabilirsin.',
        'İki metin kutusunu " - " ile birleştirmek için: txtAd.Value & " - " & txtBolum.Value',
        'Örnek: lblSonuc.Caption = txtAd.Value & " (" & txtBolum.Value & ")"'
      ],
      widgetType: 'code_editor',
      quickCommands: ['lblSonuc.Caption = ', 'lblSonuc.ForeColor = vbGreen', 'MsgBox "Kayıt hazır!"'],
      supportedEvents: ['btnTamam_Click'],
      starterCode: `Option Explicit

Private Sub btnTamam_Click()
  ' 1) lblSonuc.Caption içine ad ve bölümü yaz
  ' 2) lblSonuc.ForeColor = vbGreen yap
  ' 3) MsgBox ile kısa bilgi ver
  
End Sub`,
      starterForm: {
        title: 'Bölüm Karşılama Ekranı',
        controls: [
          { id: 'l1', type: 'Label', name: 'lbl1', caption: 'Ad Soyad:' },
          { id: 't1', type: 'TextBox', name: 'txtAd', value: 'Deniz' },
          { id: 'l2', type: 'Label', name: 'lbl2', caption: 'Bölüm:' },
          { id: 't2', type: 'TextBox', name: 'txtBolum', value: 'Bilgisayar' },
          { id: 'b1', type: 'CommandButton', name: 'btnTamam', caption: 'Göster' },
          { id: 'l3', type: 'Label', name: 'lblSonuc', caption: 'Sonuç bekleniyor' }
        ]
      },
      tests: [
        {
          id: 't1',
          label: 'Ad, bölüm, renk ve MsgBox kontrolü',
          eventTarget: 'btnTamam_Click',
          inputs: { txtAd: 'Deniz', txtBolum: 'Bilgisayar' },
          expectedControlProps: {
            lblSonuc: { ForeColor: '#16a34a' }
          },
          expectedMsgBoxContains: [''],
          description: 'lblSonuc.Caption "Deniz" ve "Bilgisayar" içermeli, ForeColor vbGreen olmalı ve MsgBox gösterilmeli.'
        }
      ],
      excelChecklist: [
        'Excel’de kendi UserForm tasarımımı yapıp .xlsm olarak kaydettim.',
        'Kodun en az bir Label rengini ve bir MsgBox mesajını çalıştırdığını doğruladım.'
      ],
      teacherNotes: 'Bu etkinlikte hem web testleri hem de Excel kontrol listesi (öğrenci beyanı) gereklidir.',
      teacherSolution: `Option Explicit

Private Sub btnTamam_Click()
  lblSonuc.Caption = txtAd.Value & " - " & txtBolum.Value
  lblSonuc.ForeColor = vbGreen
  MsgBox "Hoş geldin " & txtAd.Value
End Sub`,
      extensionTask: 'Formun başlangıç arka plan rengini BackColor ile özelleştir.',
      contentVersion: 1
    }
  ]
};
