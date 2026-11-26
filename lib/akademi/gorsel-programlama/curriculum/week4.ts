import { GpWeekDefinition } from '../types';

export const GP_WEEK_4: GpWeekDefinition = {
  order: 4,
  title: 'Seçimler, Listeler ve Döngüler',
  shortTitle: 'Hafta 4',
  description:
    'CheckBox, OptionButton ve ListBox bileşenleri, For...Next döngüsüyle tekrarlı işlemler ve sanal Excel sayfasından ListBox’a veri yükleme.',
  objectives: [
    'Çoklu seçim (CheckBox), tekli seçim (OptionButton) ve dinamik liste (ListBox) arasındaki farkı bilmek.',
    'ListBox AddItem, RemoveItem, Clear, ListIndex ve ListCount özelliklerini kullanmak.',
    'For...Next döngüsünün adım adım nasıl çalıştığını izlemek ve Excel’den tekrarlı veri çekmek.'
  ],
  activities: [
    {
      id: 'H4-E1',
      code: 'H4-E1',
      week: 4,
      orderInWeek: 1,
      title: 'Doğru Seçim Aracı',
      difficulty: 'Basit',
      durationMinutes: 10,
      expectedSeconds: 300,
      allocatedSeconds: 600,
      objectives: ['Senaryolara göre CheckBox, OptionButton ve ListBox seçmek.'],
      environment: 'web',
      prerequisites: [],
      instructions: {
        whatToDo: 'Soldaki üç kullanıcı senaryosunu sağdaki en uygun seçim bileşeniyle eşleştir.',
        whereToStart: 'Aynı anda birden fazla seçim yapılıp yapılamadığına dikkat et.',
        whichData: 'Ödeme türü, Ekstra soslar, Sipariş sepeti listesi.',
        expectedResult: '3/3 doğru eşleştirme ve açıklama.',
        howToKnowDone: 'Tüm eşleştirmeler doğru olduğunda tamamlanır.',
        steps: [
          'Soldaki senaryoyu seç.',
          'Sağdaki doğru bileşene tıkla ve "Kontrol Et"e bas.'
        ]
      },
      sampleInputs: ['CheckBox, OptionButton, ListBox'],
      expectedBehavior: 'Tekli seçim OptionButton, çoklu onay CheckBox, dinamik liste ListBox olur.',
      completionCriteria: ['3/3 doğru eşleştirme'],
      hints: [
        'Nakit veya Kart gibi birbirini dışlayan seçeneklerde tekli seçim gerekir.',
        'Ekstra peynir, ketçap gibi birden fazla seçilebilenlerde onay kutusu kullanılır.',
        'Örnek: OptionButton (Nakit/Kart), CheckBox (Ekstra Sos), ListBox (Sepet).'
      ],
      widgetType: 'matching',
      starterCode: '',
      starterForm: { title: 'Seçim Araçları', controls: [] },
      tests: [],
      excelChecklist: ['Üç bileşeni Excel UserForm üzerinde inceledim.'],
      teacherNotes: 'OptionButton’ların aynı anda yalnızca birinin seçilebildiğini vurgulayın.',
      teacherSolution: 'Ödeme -> OptionButton, Ekstralar -> CheckBox, Sepet -> ListBox.',
      extensionTask: 'Neden 30 ürünlük bir listeyi CheckBox yerine ListBox ile gösteririz?',
      contentVersion: 1,
      matchingPayload: {
        leftItems: [
          { id: 's_tek', label: 'Ödeme Türü (Nakit / Kart)', subtitle: 'Yalnızca biri seçilebilir' },
          { id: 's_cok', label: 'Ekstra Malzemeler', subtitle: 'Birden fazlası işaretlenebilir' },
          { id: 's_lst', label: 'Sipariş Sepeti', subtitle: 'Ekleme ve silme yapılan liste' }
        ],
        rightTargets: [
          { id: 'c_chk', text: 'CheckBox — Birden fazla seçenek aynı anda işaretlenebilir.' },
          { id: 'c_lst', text: 'ListBox — Öğeler AddItem/RemoveItem ile dinamik yönetilir.' },
          { id: 'c_opt', text: 'OptionButton — Grup içinden yalnızca tek bir seçenek seçilir.' }
        ],
        correctPairs: {
          s_tek: 'c_opt',
          s_cok: 'c_chk',
          s_lst: 'c_lst'
        },
        explanations: {
          s_tek: 'Ödeme türü tekil bir seçimdir, OptionButton kullanılır.',
          s_cok: 'Ekstra malzemeler çoklu seçilebilir, CheckBox uygundur.',
          s_lst: 'Sepete ürün ekleyip çıkarmak için ListBox kullanılır.'
        }
      }
    },
    {
      id: 'H4-E2',
      code: 'H4-E2',
      week: 4,
      orderInWeek: 2,
      title: 'Siparişi Listeye Ekle',
      difficulty: 'Basit–orta',
      durationMinutes: 15,
      expectedSeconds: 450,
      allocatedSeconds: 900,
      objectives: ['Boş kontrolü yaparak ListBox’a ürün ekleyen ve kutuyu temizleyen kodu sıralamak.'],
      environment: 'web',
      prerequisites: ['H4-E1'],
      instructions: {
        whatToDo: 'Verilen kod bloklarını mantıklı çalışma sırasına göre diz.',
        whereToStart: 'Önce boş girdi kontrolü (If Trim(...) = "") yapılmalıdır.',
        whichData: '4 kod bloğu.',
        expectedResult: 'Doğru sıralama sonrası her adımın mantığı onaylanır.',
        howToKnowDone: 'Geçerli sıralamayla "Kontrol Et"e bastığında tamamlanır.',
        steps: [
          'Blokları yukarı/aşağı taşıyarak doğru sırayı oluştur.',
          '"Kontrol Et" butonuna bas.'
        ]
      },
      sampleInputs: ['4 kod bloğu'],
      expectedBehavior: 'Önce boş kontrolü, sonra AddItem, sonra kutuyu temizleme.',
      completionCriteria: ['Geçerli sıralamayı oluşturmak'],
      hints: [
        'Listeye eklemeden önce metin kutusunun boş olup olmadığını kontrol etmelisin.',
        'Kutuyu (txtUrun.Value = "") ekleme işleminden SONRA temizlemelisin; önce temizlersen boş metin eklenir!',
        'Sıra: 1) Boşsa Exit Sub, 2) AddItem, 3) Kutuyu temizle.'
      ],
      widgetType: 'code_ordering',
      starterCode: '',
      starterForm: { title: 'Kod Sıralama', controls: [] },
      tests: [],
      excelChecklist: ['Kodu sıraladıktan sonra mantığını kendi cümlemle açıkladım.'],
      teacherNotes: 'txtUrun.Value = "" ile lblSayi güncellemesinin yer değiştirebileceğini (alternatif geçerli sıralama) kabul ediyoruz.',
      teacherSolution: '1) Boş kontrolü -> 2) AddItem -> 3) Kutuyu temizle & Sayıyı güncelle.',
      extensionTask: 'Aynı ürünün iki kez eklenmesini nasıl engellerdin?',
      contentVersion: 1,
      codeOrderingPayload: {
        prompt: 'Ürün ekleme butonunun kod bloklarını doğru sıraya koy:',
        blocks: [
          { id: 'b_check', code: 'If Trim(txtUrun.Value) = "" Then Exit Sub', note: 'Boş girdi kontrolü' },
          { id: 'b_add', code: 'lstSepet.AddItem Trim(txtUrun.Value)', note: 'Listeye ekleme' },
          { id: 'b_clear', code: 'txtUrun.Value = ""', note: 'Kutuyu temizleme' },
          { id: 'b_count', code: 'lblSayi.Caption = "Ürün: " & CStr(lstSepet.ListCount)', note: 'Adet güncelleme' }
        ],
        validOrders: [
          ['b_check', 'b_add', 'b_clear', 'b_count'],
          ['b_check', 'b_add', 'b_count', 'b_clear']
        ]
      }
    },
    {
      id: 'H4-E3',
      code: 'H4-E3',
      week: 4,
      orderInWeek: 3,
      title: 'Döngüyü Adım Adım İzle',
      difficulty: 'Orta',
      durationMinutes: 20,
      expectedSeconds: 600,
      allocatedSeconds: 1200,
      objectives: ['For...Next döngüsünde sayaç (i) ve toplam değişkeninin her adımdaki değerini izlemek.'],
      environment: 'web',
      prerequisites: ['H4-E2'],
      instructions: {
        whatToDo: 'Döngü kodunu gerçek yürütme iziyle adım adım çalıştır ve 4. adımdaki toplam değerini gözlemle.',
        whereToStart: '"Adım Adım Çalıştır" butonuna basıp Sonraki Adım ile ilerle.',
        whichData: 'i = 1 To 4 döngüsü.',
        expectedResult: 'Her adımda aktif satır, i sayacı ve toplam değişkeni gerçek yürütme izinden güncellenir.',
        howToKnowDone: 'Döngüyü sonuna kadar izleyip soruyu doğru yanıtladığında tamamlanır.',
        steps: [
          '"Yürütme İzini Oluştur" / "Adım Adım" butonuna bas.',
          'İleri/Geri butonlarıyla i = 1, 2, 3, 4 adımlarını incele.',
          'Döngü bittiğinde toplam değişkeninin son değerini seç ve "Kontrol Et"e bas.'
        ]
      },
      sampleInputs: ['For i = 1 To 4: toplam = toplam + i'],
      expectedBehavior: 'i=1->1, i=2->3, i=3->6, i=4->10.',
      completionCriteria: ['Yürütme izinin incelenmesi ve toplam = 10 yanıtının verilmesi'],
      hints: [
        'toplam başlangıçta 0 değerindedir.',
        'Her adımda toplam üzerine o anki i değeri eklenir: 0+1=1, 1+2=3, 3+3=6...',
        '4. adımda 6 + 4 = 10 olur.'
      ],
      widgetType: 'trace_viewer',
      starterCode: `Option Explicit

Private Sub btnDongu_Click()
  Dim i As Long
  Dim toplam As Long
  toplam = 0
  For i = 1 To 4
    toplam = toplam + i
  Next i
  lblSonuc.Caption = "Toplam: " & CStr(toplam)
End Sub`,
      starterForm: {
        title: 'Döngü İzleyici',
        controls: [
          { id: 'b1', type: 'CommandButton', name: 'btnDongu', caption: 'Başlat' },
          { id: 'l1', type: 'Label', name: 'lblSonuc', caption: '0' }
        ]
      },
      tests: [],
      excelChecklist: ['Excel VBA’da F8 tuşuyla adım adım (Step Into) çalıştırmayı denedim.'],
      teacherNotes: 'Bu görünüm gerçek AST yürütme izinden üretilir; hazır animasyon değildir.',
      teacherSolution: '10',
      extensionTask: 'Step 2 eklenseydi toplam kaç olurdu?',
      contentVersion: 1,
      outputPredictionPayload: {
        codeToRead: `For i = 1 To 4
  toplam = toplam + i
Next i`,
        question: 'Döngü tamamlandığında toplam değişkeninin değeri kaç olur?',
        options: ['4', '6', '10', '14'],
        correctAnswer: '10',
        explanation: '1 + 2 + 3 + 4 = 10 olur.',
        simEvent: 'btnDongu_Click'
      }
    },
    {
      id: 'H4-E4',
      code: 'H4-E4',
      week: 4,
      orderInWeek: 4,
      title: 'Kantin Sipariş Ekranı',
      difficulty: 'Orta–zor',
      durationMinutes: 40,
      expectedSeconds: 1200,
      allocatedSeconds: 2400,
      objectives: ['ListBox’a öğe ekleme, seçili öğeyi ListIndex kontrolüyle silme ve ListCount güncelleme.'],
      environment: 'web',
      prerequisites: ['H4-E3'],
      instructions: {
        whatToDo: 'btnEkle_Click olayında txtUrun değerini lstSepet’e ekle; btnSil_Click olayında seçili öğe varsa (ListIndex >= 0) kaldır, yoksa uyarı ver.',
        whereToStart: 'İki Sub bloğunu (btnEkle_Click ve btnSil_Click) ayrı ayrı tamamla.',
        whichData: 'txtUrun, lstSepet, lblAdet, btnEkle, btnSil.',
        expectedResult: 'Eklemede liste büyür, seçili öğe silinir, seçim yokken silmeye basılırsa hata vermez ve uyarır.',
        howToKnowDone: 'Tüm ekleme ve silme testleri geçtiğinde tamamlanır.',
        steps: [
          'btnEkle_Click içinde boş değilse lstSepet.AddItem ve lblAdet güncelle.',
          'btnSil_Click içinde If lstSepet.ListIndex = -1 Then uyar ve Exit Sub.',
          'Seçili öğe varsa lstSepet.RemoveItem lstSepet.ListIndex ile sil.'
        ]
      },
      sampleInputs: ['"Tost" ekle', 'Seçili olmadan sil -> Uyar', 'Index 0 sil'],
      expectedBehavior: 'ListBox 0-tabanlı ListIndex kullanır; seçimsiz durum -1’dir.',
      completionCriteria: [
        'Ürün eklendiğinde lstSepet içinde görünmesi',
        'Seçim yokken silmede programın çökmemesi',
        'Seçili öğenin RemoveItem ile kaldırılması'
      ],
      hints: [
        'Listeden öğe kaldırmadan önce bir öğe seçmelisin (ListIndex = -1 ise seçim yoktur).',
        'Silme komutu: lstSepet.RemoveItem lstSepet.ListIndex',
        'Örnek: If lstSepet.ListIndex < 0 Then MsgBox "Önce ürün seçin" : Exit Sub'
      ],
      widgetType: 'code_editor',
      quickCommands: ['lstSepet.AddItem ', 'lstSepet.RemoveItem lstSepet.ListIndex', 'lstSepet.ListIndex = -1', 'lstSepet.ListCount'],
      supportedEvents: ['btnEkle_Click', 'btnSil_Click'],
      starterCode: `Option Explicit

Private Sub btnEkle_Click()
  If Trim(txtUrun.Value) = "" Then Exit Sub
  ' lstSepet'e ekle ve lblAdet.Caption'ı güncelle
  
End Sub

Private Sub btnSil_Click()
  ' Seçili öğe yoksa (ListIndex = -1) uyar ve Exit Sub
  ' Seçili öğeyi RemoveItem ile sil
  
End Sub`,
      starterForm: {
        title: 'Kantin Sipariş Ekranı',
        controls: [
          { id: 'l1', type: 'Label', name: 'lbl1', caption: 'Ürün Adı:' },
          { id: 't1', type: 'TextBox', name: 'txtUrun', value: 'Tost' },
          { id: 'b1', type: 'CommandButton', name: 'btnEkle', caption: 'Sepete Ekle' },
          { id: 'b2', type: 'CommandButton', name: 'btnSil', caption: 'Seçiliyi Sil' },
          { id: 'lb1', type: 'ListBox', name: 'lstSepet', items: ['Ayran'], listIndex: -1 },
          { id: 'l2', type: 'Label', name: 'lblAdet', caption: '1' }
        ]
      },
      tests: [
        {
          id: 't_add',
          label: 'Sepete Tost ekleme',
          eventTarget: 'btnEkle_Click',
          inputs: { txtUrun: 'Tost' },
          expectedListItems: { lstSepet: ['Ayran', 'Tost'] },
          description: '"Tost" eklendiğinde lstSepet içinde ["Ayran", "Tost"] olmalıdır.'
        },
        {
          id: 't_del_none',
          label: 'Seçim yokken silme koruması',
          eventTarget: 'btnSil_Click',
          listSelections: { lstSepet: -1 },
          expectedListItems: { lstSepet: ['Ayran'] },
          description: 'Seçim yokken (-1) silmeye basıldığında liste bozulmamalı ve hata vermemelidir.'
        },
        {
          id: 't_del_sel',
          label: 'Seçili öğeyi (index 0) silme',
          eventTarget: 'btnSil_Click',
          listSelections: { lstSepet: 0 },
          expectedListItems: { lstSepet: [] },
          description: 'İlk öğe seçiliyken (ListIndex = 0) silindiğinde liste boşalmalıdır.'
        }
      ],
      excelChecklist: ['Excel’de ListBox’a ekleme ve silme butonlarını test ettim.'],
      teacherNotes: 'ListBox indekslerinin 0’dan başladığını (0, 1, 2...) ve seçimsiz durumun -1 olduğunu vurgulayın.',
      teacherSolution: `Option Explicit

Private Sub btnEkle_Click()
  If Trim(txtUrun.Value) = "" Then Exit Sub
  lstSepet.AddItem Trim(txtUrun.Value)
  txtUrun.Value = ""
  lblAdet.Caption = CStr(lstSepet.ListCount)
End Sub

Private Sub btnSil_Click()
  If lstSepet.ListIndex < 0 Then
    MsgBox "Listeden öğe kaldırmadan önce bir öğe seçmelisin."
    Exit Sub
  End If
  lstSepet.RemoveItem lstSepet.ListIndex
  lblAdet.Caption = CStr(lstSepet.ListCount)
End Sub`,
      extensionTask: 'Sepeti tamamen boşaltan btnTemizle butonu ekle (lstSepet.Clear).',
      contentVersion: 1
    },
    {
      id: 'H4-E5',
      code: 'H4-E5',
      week: 4,
      orderInWeek: 5,
      title: 'Excel’den Ürünleri Getir',
      difficulty: 'Zor',
      durationMinutes: 40,
      expectedSeconds: 1200,
      allocatedSeconds: 2400,
      requireLoopInAst: true,
      objectives: [
        'Sanal çalışma sayfasındaki ürün listesini For döngüsüyle okuyup ListBox’a aktarmak.',
        'Tekrar yüklemede ürünlerin çoğalmasını önlemek için Clear kullanmak.'
      ],
      environment: 'web+excel',
      prerequisites: ['H4-E4'],
      instructions: {
        whatToDo: 'Urunler sayfasındaki 2. satırdan son dolu satıra kadar olan ürünleri For döngüsüyle lstUrunler içine yükle. Tekrar basıldığında liste çoğalmamalıdır!',
        whereToStart: 'Önce lstUrunler.Clear yaz, ardından End(xlUp).Row ile son satırı bul.',
        whichData: 'Sanal Urunler sayfasında A2:A4 hücrelerinde Kalem, Silgi, Defter vardır.',
        expectedResult: 'Liste bir kez yüklenir (3 ürün). İki kez tıklansa da 6 ürün olmaz, yine 3 ürün kalır.',
        howToKnowDone: 'Döngü kullanıldığı doğrulanıp tekrar yükleme testi geçtiğinde ve Excel kontrol listesi işaretlendiğinde tamamlanır.',
        steps: [
          'Set ws = Worksheets("Urunler") tanımla.',
          'lstUrunler.Clear ile listeyi temizle.',
          'sonSatir = ws.Cells(ws.Rows.Count, 1).End(xlUp).Row ile son satırı bul.',
          'For i = 2 To sonSatir döngüsüyle lstUrunler.AddItem ws.Cells(i, 1).Value yaz.'
        ]
      },
      sampleInputs: ['Urunler!A2:A4 = Kalem, Silgi, Defter'],
      expectedBehavior: 'Liste yalnızca 3 ürünü içerir; başlangıçta listede eski ürün varsa bile temizlenir.',
      completionCriteria: [
        'AST içinde For veya Do While döngüsü kullanılması',
        'Tekrar yüklemede listenin çoğalmaması (lstUrunler.Clear)',
        'Urunler sayfasındaki 3 ürünün ListBox’a yüklenmesi'
      ],
      hints: [
        'Listeyi temizlemeden yüklediğin için ürünler tekrar eklenebilir; döngüden önce .Clear çağır.',
        'Son satırı bulmak için: sonSatir = ws.Cells(ws.Rows.Count, 1).End(xlUp).Row',
        'Örnek: For i = 2 To sonSatir : lstUrunler.AddItem ws.Cells(i, 1).Value : Next i'
      ],
      widgetType: 'code_editor',
      quickCommands: ['Set ws = Worksheets("Urunler")', 'lstUrunler.Clear', 'ws.Cells(ws.Rows.Count, 1).End(xlUp).Row', 'For i = 2 To sonSatir'],
      supportedEvents: ['btnYukle_Click'],
      starterCode: `Option Explicit

Private Sub btnYukle_Click()
  Dim ws As Worksheet
  Dim sonSatir As Long, i As Long
  Set ws = Worksheets("Urunler")
  
  ' 1) Listeyi temizle (tekrar yüklemede çoğalmasın!)
  ' 2) Son dolu satırı bul
  ' 3) For döngüsü ile 2. satırdan sonSatir'a kadar lstUrunler'e ekle
  
End Sub`,
      starterForm: {
        title: 'Ürün Listesi Yükleyici',
        controls: [
          { id: 'b1', type: 'CommandButton', name: 'btnYukle', caption: 'Ürünleri Getir' },
          { id: 'lb1', type: 'ListBox', name: 'lstUrunler', items: ['Eski Kayıt'], listIndex: -1 }
        ]
      },
      starterSheet: {
        name: 'Urunler',
        columns: ['A', 'B'],
        rows: 8,
        cells: {
          '1,1': 'Ürün Adı',
          '1,2': 'Fiyat',
          '2,1': 'Kalem',
          '2,2': 15,
          '3,1': 'Silgi',
          '3,2': 10,
          '4,1': 'Defter',
          '4,2': 45
        }
      },
      tests: [
        {
          id: 't_load',
          label: 'Ürünleri getir ve eski listeyi çoğaltma',
          eventTarget: 'btnYukle_Click',
          expectedListItems: { lstUrunler: ['Kalem', 'Silgi', 'Defter'] },
          description: 'Başlangıçtaki "Eski Kayıt" temizlenmeli ve yalnızca ["Kalem", "Silgi", "Defter"] listelenmelidir.'
        }
      ],
      excelChecklist: [
        'Excel’de Urunler adlı sayfa açıp 2. satırdan itibaren ürün ekledim.',
        'Butona iki kez bastığımda listenin çoğalmadığını doğruladım.'
      ],
      teacherNotes: 'Kabul ölçütü #10: H4-E5 tekrar yüklemede listeyi çoğaltmaz. Sanal sayfa gerçek Excel dosyası değildir.',
      teacherSolution: `Option Explicit

Private Sub btnYukle_Click()
  Dim ws As Worksheet
  Dim sonSatir As Long, i As Long
  Set ws = Worksheets("Urunler")
  lstUrunler.Clear
  sonSatir = ws.Cells(ws.Rows.Count, 1).End(xlUp).Row
  For i = 2 To sonSatir
    lstUrunler.AddItem ws.Cells(i, 1).Value
  Next i
End Sub`,
      extensionTask: 'Ürün adıyla birlikte B sütunundaki fiyatı da "Kalem - 15 TL" şeklinde listeye ekle.',
      contentVersion: 1
    }
  ]
};
