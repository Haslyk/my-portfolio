import { GpWeekDefinition } from '../types';

export const GP_WEEK_5: GpWeekDefinition = {
  order: 5,
  title: 'Olaylar ve Mini Proje',
  shortTitle: 'Hafta 5',
  description:
    'Form olayları (Click, Enter, Exit, klavye örnekleri), hata tanıma ve görsel gösterge düzeltme, sanal kayıt defterine alt alta satır ekleme ve Öğrenci Not Takip Mini Projesi.',
  objectives: [
    'Click, Enter, Exit ve klavye olaylarının ne zaman tetiklendiğini ayırt etmek.',
    'H5-E3 üzerinde hata tanıma ve dikdörtgen gösterge (BackColor, Width, Height) özelliklerini düzeltmek.',
    'Cells(Rows.Count, 1).End(xlUp).Row + 1 ile ardışık kayıtları farklı satırlara eklemek.'
  ],
  activities: [
    {
      id: 'H5-E1',
      code: 'H5-E1',
      week: 5,
      orderInWeek: 1,
      title: 'Hangi Hareket Hangi Olay?',
      difficulty: 'Basit',
      durationMinutes: 10,
      expectedSeconds: 300,
      allocatedSeconds: 600,
      objectives: ['Kullanıcı hareketlerini ilgili VBA olaylarıyla eşleştirmek.'],
      environment: 'web',
      prerequisites: [],
      instructions: {
        whatToDo: 'Soldaki dört kullanıcı hareketini sağdaki doğru VBA olayıyla eşleştir.',
        whereToStart: 'Odaklanma (Enter) ile odaktan çıkma (Exit) farkına dikkat et.',
        whichData: 'Click, Enter, Exit ve KeyPress (eğitim örneği).',
        expectedResult: '4/4 doğru eşleştirme ve açıklama.',
        howToKnowDone: 'Tüm eşleştirmeler doğru olduğunda tamamlanır.',
        steps: [
          'Soldaki hareketi seç, sağdaki olay kartına tıkla.',
          '"Kontrol Et" butonuna bas.'
        ]
      },
      sampleInputs: ['Click, Enter, Exit, KeyPress'],
      expectedBehavior: 'Her hareket doğru VBA olayına bağlanır.',
      completionCriteria: ['4/4 doğru eşleştirme'],
      hints: [
        'Bir kutunun içine tıklandığında veya Tab ile girildiğinde Enter olayı çalışır.',
        'Kutudan başka bir yere geçildiğinde Exit olayı tetiklenir.',
        'Örnek: Butona basma -> Click, Tuşa basma -> KeyPress.'
      ],
      widgetType: 'matching',
      starterCode: '',
      starterForm: { title: 'Olaylar', controls: [] },
      tests: [],
      excelChecklist: ['Excel VBA kod penceresinin sağ üst açılır menüsünden olay listesini inceledim.'],
      teacherNotes: 'Klavye olayları (KeyPress) bu simülatörde önceden tanımlı eğitim örneği olarak öğretilir.',
      teacherSolution: 'Butona basma -> Click, Kutuya odaklanma -> Enter, Kutudan ayrılma -> Exit, Klavye tuşu -> KeyPress.',
      extensionTask: 'UserForm_Initialize olayı ne zaman çalışır?',
      contentVersion: 1,
      matchingPayload: {
        leftItems: [
          { id: 'm_click', label: 'Kullanıcı butona tıkladığında', subtitle: 'Eylem başlatma' },
          { id: 'm_enter', label: 'Metin kutusuna odaklanıldığında', subtitle: 'İçeri girme' },
          { id: 'm_exit', label: 'Metin kutusundan çıkıldığında', subtitle: 'Alanın dışına geçme' },
          { id: 'm_key', label: 'Klavyeden bir tuşa basıldığında', subtitle: 'Tuş yakalama (eğitim örneği)' }
        ],
        rightTargets: [
          { id: 'e_exit', text: 'Exit — Kontrolden ayrılırken doğrulama yapmak için kullanılır.' },
          { id: 'e_click', text: 'Click — Butona veya öğeye tıklandığında çalışır.' },
          { id: 'e_key', text: 'KeyPress — Klavye tuş girişini denetlemek için kullanılır.' },
          { id: 'e_enter', text: 'Enter — Kontrole odaklanıldığında rehber mesajı gösterebilir.' }
        ],
        correctPairs: {
          m_click: 'e_click',
          m_enter: 'e_enter',
          m_exit: 'e_exit',
          m_key: 'e_key'
        },
        explanations: {
          m_click: 'Tıklama hareketi Click olayını tetikler.',
          m_enter: 'Kutuya odaklanıldığında Enter olayı çalışır.',
          m_exit: 'Kutudan çıkıldığında Exit olayı çalışır.',
          m_key: 'Klavye tuşları KeyPress olayıyla izlenir.'
        }
      }
    },
    {
      id: 'H5-E2',
      code: 'H5-E2',
      week: 5,
      orderInWeek: 2,
      title: 'Form Sana Yol Göstersin',
      difficulty: 'Basit–orta',
      durationMinutes: 15,
      expectedSeconds: 450,
      allocatedSeconds: 900,
      objectives: ['Enter ve Exit olaylarını kullanarak kullanıcıya canlı rehberlik göstermek.'],
      environment: 'web',
      prerequisites: ['H5-E1'],
      instructions: {
        whatToDo: 'txtNot_Enter olayında lblYardim.Caption = "0 ile 100 arasında bir sayı girin" yaz; txtNot_Exit olayında sayı değilse lblYardim.Caption = "Uyarı: Yalnızca sayı girin!" yaz.',
        whereToStart: 'İki hazır Sub bloğunun içini doldur.',
        whichData: 'txtNot ve lblYardim bileşenleri.',
        expectedResult: 'Önizlemede txtNot kutusuna girince rehber mesajı, hatalı çıkınca uyarı mesajı görünür.',
        howToKnowDone: 'Enter ve Exit testleri geçtiğinde tamamlanır.',
        steps: [
          'txtNot_Enter içinde lblYardim.Caption değerini ayarla.',
          'txtNot_Exit içinde If Not IsNumeric(txtNot.Value) Then ... Else lblYardim.Caption = "Hazır" End If yaz.',
          '"Kontrol Et" butonuna bas.'
        ]
      },
      sampleInputs: ['Enter -> "0 ile 100 arasında bir sayı girin"', 'Exit ("abc") -> Uyarı'],
      expectedBehavior: 'Enter ve Exit olayları farklı durumlarda doğru mesajı verir.',
      completionCriteria: [
        'txtNot_Enter olayında yardım mesajı görünmesi',
        'txtNot_Exit olayında hatalı girdide uyarı verilmesi'
      ],
      hints: [
        'Enter olayı kullanıcı kutuya girdiğinde çalışır.',
        'Exit olayında IsNumeric(txtNot.Value) kontrolü yap.',
        'Örnek: Private Sub txtNot_Enter() : lblYardim.Caption = "0 ile 100 arasında bir sayı girin" : End Sub'
      ],
      widgetType: 'code_editor',
      quickCommands: ['lblYardim.Caption = ', 'If Not IsNumeric(txtNot.Value) Then', 'Exit Sub'],
      supportedEvents: ['txtNot_Enter', 'txtNot_Exit'],
      starterCode: `Option Explicit

Private Sub txtNot_Enter()
  ' Kullanıcı kutuya girdiğinde yol gösterici mesaj yaz
  
End Sub

Private Sub txtNot_Exit()
  ' Kutudan çıkarken sayı değilse uyar
  
End Sub`,
      starterForm: {
        title: 'Yol Gösteren Form',
        controls: [
          { id: 'l1', type: 'Label', name: 'lbl1', caption: 'Not:' },
          { id: 't1', type: 'TextBox', name: 'txtNot', value: '' },
          { id: 'l2', type: 'Label', name: 'lblYardim', caption: 'Başlamak için kutuya tıkla' }
        ]
      },
      tests: [
        {
          id: 't_enter',
          label: 'Enter olayı rehber mesajı',
          eventTarget: 'txtNot_Enter',
          expectedControlProps: { lblYardim: { Caption: '100' } },
          description: 'txtNot_Enter çalıştığında lblYardim.Caption içinde "100" (0-100 aralığı bilgisi) geçmelidir.'
        },
        {
          id: 't_exit_bad',
          label: 'Exit olayı hatalı girdi uyarısı',
          eventTarget: 'txtNot_Exit',
          inputs: { txtNot: 'abc' },
          expectedControlProps: { lblYardim: { Caption: 'sayı' } },
          description: 'txtNot = "abc" ile çıkıldığında lblYardim.Caption içinde "sayı" uyarısı yer almalıdır.'
        }
      ],
      excelChecklist: ['Excel’de TextBox Enter ve Exit olaylarını çalıştırdım.'],
      teacherNotes: 'Gerçek Excel’de Exit olayının Cancel parametresi vardır; simülatörde sadeleştirilmiş txtNot_Exit() kullanılır.',
      teacherSolution: `Option Explicit

Private Sub txtNot_Enter()
  lblYardim.Caption = "0 ile 100 arasında bir sayı girin."
End Sub

Private Sub txtNot_Exit()
  If Not IsNumeric(txtNot.Value) Then
    lblYardim.Caption = "Uyarı: Geçerli bir sayı girin."
  Else
    lblYardim.Caption = "Giriş uygun."
  End If
End Sub`,
      extensionTask: 'Hatalı çıkışta lblYardim.ForeColor = vbRed yap.',
      contentVersion: 1
    },
    {
      id: 'H5-E3',
      code: 'H5-E3',
      week: 5,
      orderInWeek: 3,
      title: 'Hatayı Bul, Göstergeyi Düzelt',
      difficulty: 'Orta',
      durationMinutes: 20,
      expectedSeconds: 600,
      allocatedSeconds: 1200,
      objectives: [
        'Hatalı satırı bulup düzeltmek ve önceden tanımlı dikdörtgen göstergeyi (shpDurum) puanla güncellemek.',
        'On Error GoTo kavramını öğretmen gösterimi olarak tanımak.'
      ],
      environment: 'web+excel',
      prerequisites: ['H5-E2'],
      instructions: {
        whatToDo: 'Koddaki mantık hatasını düzelt: Puan >= 50 ise shpDurum.BackColor = vbGreen ve shpDurum.Width = 200; değilse vbRed ve Width = 80 olsun.',
        whereToStart: 'Başlangıç kodunda hem renk hem genişlik ters/eksik ayarlanmış. Ayrıca sayı kontrolü yok.',
        whichData: 'txtPuan ve önceden tanımlı shpDurum dikdörtgeni (BackColor, Width, Height).',
        expectedResult: 'Puan 80 için gösterge yeşil ve geniş (200), 30 için kırmızı ve dar (80) olur.',
        howToKnowDone: 'Tüm testler geçtiğinde ve Excel notu incelendiğinde tamamlanır.',
        steps: [
          'IsNumeric kontrolünü ekle.',
          'puan >= 50 dalında shpDurum.BackColor = vbGreen ve shpDurum.Width = 200 yap.',
          'Else dalında shpDurum.BackColor = vbRed ve shpDurum.Width = 80 yap.',
          '"Kontrol Et"e bas.'
        ]
      },
      sampleInputs: ['80 -> vbGreen, Width 200', '30 -> vbRed, Width 80'],
      expectedBehavior: 'Dikdörtgen göstergenin rengi ve genişliği puana göre doğru güncellenir.',
      completionCriteria: [
        '80 puanında shpDurum yeşil ve Width = 200',
        '30 puanında shpDurum kırmızı ve Width = 80',
        'Hatalı girdide durma'
      ],
      hints: [
        'On Error GoTo bu simülatörde desteklenmez; bunun yerine IsNumeric ve If ile önleyici kontrol yaz.',
        'shpDurum.BackColor ve shpDurum.Width özelliklerini >= 50 ve Else dallarında kontrol et.',
        'Örnek: shpDurum.BackColor = vbGreen : shpDurum.Width = 200'
      ],
      widgetType: 'bug_hunt',
      quickCommands: ['shpDurum.BackColor = vbGreen', 'shpDurum.Width = 200', 'shpDurum.Height = 24'],
      supportedEvents: ['btnGosterge_Click'],
      starterCode: `Option Explicit

Private Sub btnGosterge_Click()
  Dim puan As Long
  ' HATA 1: Sayı kontrolü eksik
  puan = CLng(txtPuan.Value)
  
  ' HATA 2: Renkler ters verilmiş ve Width güncellenmemiş
  If puan >= 50 Then
    shpDurum.BackColor = vbRed
    shpDurum.Width = 80
  Else
    shpDurum.BackColor = vbGreen
    shpDurum.Width = 200
  End If
End Sub`,
      starterForm: {
        title: 'Gösterge Paneli',
        controls: [
          { id: 'l1', type: 'Label', name: 'lbl1', caption: 'Başarı Puanı:' },
          { id: 't1', type: 'TextBox', name: 'txtPuan', value: '80' },
          { id: 'b1', type: 'CommandButton', name: 'btnGosterge', caption: 'Güncelle' },
          { id: 's1', type: 'Shape', name: 'shpDurum', caption: 'Gösterge', backColor: '#64748b', width: 120, height: 24 }
        ]
      },
      tests: [
        {
          id: 't_bad',
          label: 'Sayısal olmayan girdide durmalı',
          eventTarget: 'btnGosterge_Click',
          inputs: { txtPuan: 'yok' },
          expectStopOnError: true,
          description: 'Metin girildiğinde kod çökmeden durmalıdır.'
        },
        {
          id: 't_high',
          label: '80 puan -> Yeşil ve Geniş (200)',
          eventTarget: 'btnGosterge_Click',
          inputs: { txtPuan: '80' },
          expectedControlProps: {
            shpDurum: { BackColor: '#16a34a', Width: 200 }
          },
          description: '80 puanı için shpDurum.BackColor vbGreen (#16a34a) ve Width 200 olmalıdır.'
        },
        {
          id: 't_low',
          label: '30 puan -> Kırmızı ve Dar (80)',
          eventTarget: 'btnGosterge_Click',
          inputs: { txtPuan: '30' },
          expectedControlProps: {
            shpDurum: { BackColor: '#dc2626', Width: 80 }
          },
          description: '30 puanı için shpDurum.BackColor vbRed (#dc2626) ve Width 80 olmalıdır.'
        }
      ],
      excelChecklist: [
        'Gerçek Excel’de On Error GoTo HataYakalayici yapısını öğretmen gösteriminden inceledim.',
        'Excel’de bir şeklin (Shape) rengini ve genişliğini kodla değiştirmeyi denedim.'
      ],
      teacherNotes: 'On Error GoTo simülatörde bilinçli olarak desteklenmez; gerçek Excel görevi ve öğretmen gösterimi olarak sunulur.',
      teacherSolution: `Option Explicit

Private Sub btnGosterge_Click()
  Dim puan As Long
  If Not IsNumeric(txtPuan.Value) Then Exit Sub
  puan = CLng(txtPuan.Value)
  If puan >= 50 Then
    shpDurum.BackColor = vbGreen
    shpDurum.Width = 200
  Else
    shpDurum.BackColor = vbRed
    shpDurum.Width = 80
  End If
End Sub`,
      extensionTask: 'shpDurum.Height değerini de 32 yaparak yüksekliği artır.',
      contentVersion: 1
    },
    {
      id: 'H5-E4',
      code: 'H5-E4',
      week: 5,
      orderInWeek: 4,
      title: 'Kayıt Defterine Yeni Satır Ekle',
      difficulty: 'Orta–zor',
      durationMinutes: 40,
      expectedSeconds: 1200,
      allocatedSeconds: 2400,
      objectives: [
        'Sanal çalışma sayfasında en son dolu satırı bulup yeni kaydı bir sonraki boş satıra yazmak.',
        'Ardışık kayıtların önceki kayıtların üzerine yazılmamasını sağlamak.'
      ],
      environment: 'web',
      prerequisites: ['H5-E3'],
      instructions: {
        whatToDo: 'Kayitlar sayfasındaki son dolu satırı End(xlUp).Row ile bul, bir alt satıra (yeniSatir = sonSatir + 1) txtAd ve txtNot değerlerini yaz, ardından kutuları temizle.',
        whereToStart: 'Set ws = Worksheets("Kayitlar") ile sayfayı seç.',
        whichData: 'Kayitlar sayfasında 1. satırda başlıklar (Ad, Not) vardır.',
        expectedResult: 'Art arda 3 kayıt eklendiğinde 2., 3. ve 4. satırlara alt alta yazılır.',
        howToKnowDone: 'Ardışık 3 kayıt testi geçtiğinde tamamlanır.',
        steps: [
          'Set ws = Worksheets("Kayitlar") tanımla.',
          'yeniSatir = ws.Cells(ws.Rows.Count, 1).End(xlUp).Row + 1 hesapla.',
          'ws.Cells(yeniSatir, 1).Value = txtAd.Value ve ws.Cells(yeniSatir, 2).Value = txtNot.Value yaz.',
          'txtAd.Value = "" ve txtNot.Value = "" ile formu temizle.'
        ]
      },
      sampleInputs: ['Kayıt 1 -> Satır 2', 'Kayıt 2 -> Satır 3', 'Kayıt 3 -> Satır 4'],
      expectedBehavior: 'Her buton tıklamasında yeni kayıt bir sonraki boş satıra yazılır.',
      completionCriteria: [
        'Art arda 3 kaydın farklı satırlara (2, 3, 4) yazılması',
        'Kayıt sonrası form kutularının temizlenmesi'
      ],
      hints: [
        'Sabit 2. satıra yazarsan her kayıt eskisini siler. End(xlUp).Row + 1 kullanmalısın.',
        '1. sütuna ad (Cells(yeniSatir, 1)), 2. sütuna not (Cells(yeniSatir, 2)) yaz.',
        'Örnek: yeniSatir = ws.Cells(ws.Rows.Count, 1).End(xlUp).Row + 1'
      ],
      widgetType: 'code_editor',
      quickCommands: ['Set ws = Worksheets("Kayitlar")', 'ws.Cells(ws.Rows.Count, 1).End(xlUp).Row + 1', 'ws.Cells(yeniSatir, 1).Value = '],
      supportedEvents: ['btnKaydet_Click'],
      starterCode: `Option Explicit

Private Sub btnKaydet_Click()
  Dim ws As Worksheet
  Dim yeniSatir As Long
  If Trim(txtAd.Value) = "" Or Not IsNumeric(txtNot.Value) Then Exit Sub
  
  Set ws = Worksheets("Kayitlar")
  ' 1) Son satırın bir altını bul
  ' 2) 1. ve 2. sütuna ad ve notu yaz
  ' 3) Kutuları temizle
  
End Sub`,
      starterForm: {
        title: 'Kayıt Defteri',
        controls: [
          { id: 'l1', type: 'Label', name: 'lbl1', caption: 'Öğrenci Adı:' },
          { id: 't1', type: 'TextBox', name: 'txtAd', value: 'Ali' },
          { id: 'l2', type: 'Label', name: 'lbl2', caption: 'Not:' },
          { id: 't2', type: 'TextBox', name: 'txtNot', value: '85' },
          { id: 'b1', type: 'CommandButton', name: 'btnKaydet', caption: 'Kaydet' }
        ]
      },
      starterSheet: {
        name: 'Kayitlar',
        columns: ['A', 'B'],
        rows: 8,
        cells: {
          '1,1': 'Ad',
          '1,2': 'Not'
        }
      },
      tests: [
        {
          id: 't_row1',
          label: '1. Kayıt -> Satır 2',
          eventTarget: 'btnKaydet_Click',
          inputs: { txtAd: 'Ali', txtNot: '85' },
          expectedSheetCells: { '2,1': 'Ali', '2,2': '85' },
          expectedControlProps: { txtAd: { Value: '' }, txtNot: { Value: '' } },
          description: 'İlk kayıt 2. satıra yazılmalı ve kutular temizlenmelidir.'
        },
        {
          id: 't_row2',
          label: '2. Kayıt -> Satır 3 (önceki silinmeden)',
          eventTarget: 'btnKaydet_Click',
          inputs: { txtAd: 'Veli', txtNot: '70' },
          expectedSheetCells: { '2,1': 'Ali', '3,1': 'Veli', '3,2': '70' },
          description: 'İkinci kayıt 3. satıra yazılmalı, 2. satır korunmalıdır.'
        },
        {
          id: 't_row3',
          label: '3. Kayıt -> Satır 4',
          eventTarget: 'btnKaydet_Click',
          inputs: { txtAd: 'Ayşe', txtNot: '95' },
          expectedSheetCells: { '2,1': 'Ali', '3,1': 'Veli', '4,1': 'Ayşe', '4,2': '95' },
          description: 'Üçüncü kayıt 4. satıra yazılmalıdır.'
        }
      ],
      excelChecklist: ['Excel’de 3 farklı kayıt ekleyip alt alta satırlara yazıldığını gördüm.'],
      teacherNotes: 'Kabul ölçütü #11: H5-E4 art arda üç kaydı farklı satırlara yazar.',
      teacherSolution: `Option Explicit

Private Sub btnKaydet_Click()
  Dim ws As Worksheet
  Dim yeniSatir As Long
  If Trim(txtAd.Value) = "" Or Not IsNumeric(txtNot.Value) Then Exit Sub
  Set ws = Worksheets("Kayitlar")
  yeniSatir = ws.Cells(ws.Rows.Count, 1).End(xlUp).Row + 1
  ws.Cells(yeniSatir, 1).Value = Trim(txtAd.Value)
  ws.Cells(yeniSatir, 2).Value = CLng(txtNot.Value)
  txtAd.Value = ""
  txtNot.Value = ""
End Sub`,
      extensionTask: 'Aynı sayfaya 3. sütun olarak "Tarih" veya "Durum" bilgisi ekle.',
      contentVersion: 1
    },
    {
      id: 'H5-E5',
      code: 'H5-E5',
      week: 5,
      orderInWeek: 5,
      title: 'Öğrenci Not Takip Mini Projesi',
      difficulty: 'Zor',
      durationMinutes: 40,
      expectedSeconds: 1200,
      allocatedSeconds: 2400,
      objectives: [
        'Doğrulama, ortalama hesaplama, Geçti/Kaldı kararı, ListBox özeti ve sanal çalışma sayfasına kayıt işlemlerini tek projede birleştirmek.'
      ],
      environment: 'web+excel',
      prerequisites: ['H5-E4'],
      instructions: {
        whatToDo: 'Öğrenci adı, vize ve final notlarını doğrula; ortalamayı hesapla; Geçti/Kaldı durumunu belirle; Notlar sayfasının yeni satırına (Ad, Ortalama, Durum) yaz ve lstOzet listesine ekle.',
        whereToStart: 'Ad boşsa veya vize/final 0–100 sayı değilse Exit Sub ile dur.',
        whichData: 'txtAd, txtVize, txtFinal, lstOzet, Notlar sayfası.',
        expectedResult: 'Hatalı girdide kayıt eklenmez; geçerli girdide hem sayfaya yeni satır eklenir hem ListBox güncellenir.',
        howToKnowDone: 'Tüm doğrulama ve kayıt testleri geçip Excel kontrol listesi işaretlendiğinde tamamlanır.',
        steps: [
          'Ad boşsa veya vize/final geçersiz sayıysa (0–100 dışı) Exit Sub yap.',
          'ort = vize * 0.4 + finalNot * 0.6 ve durum = "Geçti" / "Kaldı" belirle.',
          'Notlar sayfasında End(xlUp).Row + 1 satırına Ad, ort, durum yaz.',
          'lstOzet.AddItem ile özet satırı ekle ve kutuları temizle.'
        ]
      },
      sampleInputs: ['Zeynep, Vize 70, Final 80 -> Ort 76, Geçti'],
      expectedBehavior: 'Hatalı girdi engellenir, geçerli kayıt hem sanal Excel’e hem ListBox’a eklenir.',
      completionCriteria: [
        'Hatalı girdide hesaplamanın ve kaydın durması',
        'Geçerli girdide Notlar sayfasına yeni satır yazılması',
        'lstOzet içine özet satır eklenmesi'
      ],
      hints: [
        'İlk olarak Trim(txtAd.Value) = "" ve IsNumeric kontrollerini yap.',
        'Sayfaya 3 sütun yaz: 1=Ad, 2=Ortalama, 3=Durum.',
        'Örnek: lstOzet.AddItem txtAd.Value & " - " & CStr(ort) & " (" & durum & ")"'
      ],
      widgetType: 'code_editor',
      quickCommands: ['Set ws = Worksheets("Notlar")', 'yeniSatir = ws.Cells(ws.Rows.Count, 1).End(xlUp).Row + 1', 'lstOzet.AddItem '],
      supportedEvents: ['btnEkle_Click'],
      starterCode: `Option Explicit

Private Sub btnEkle_Click()
  Dim ws As Worksheet
  Dim vize As Double, finalNot As Double, ort As Double
  Dim durum As String
  Dim yeniSatir As Long
  
  ' 1) Ad ve not doğrulaması (boş, metin, 0-100 dışı -> Exit Sub)
  ' 2) Ortalama ve Geçti/Kaldı hesabı
  ' 3) Notlar sayfasının yeni satırına yaz
  ' 4) lstOzet listesine ekle ve kutuları temizle
  
End Sub`,
      starterForm: {
        title: 'Öğrenci Not Takip Mini Projesi',
        controls: [
          { id: 'l1', type: 'Label', name: 'lbl1', caption: 'Öğrenci Adı:' },
          { id: 't1', type: 'TextBox', name: 'txtAd', value: 'Zeynep' },
          { id: 'l2', type: 'Label', name: 'lbl2', caption: 'Vize:' },
          { id: 't2', type: 'TextBox', name: 'txtVize', value: '70' },
          { id: 'l3', type: 'Label', name: 'lbl3', caption: 'Final:' },
          { id: 't3', type: 'TextBox', name: 'txtFinal', value: '80' },
          { id: 'b1', type: 'CommandButton', name: 'btnEkle', caption: 'Kaydet ve Listele' },
          { id: 'lb1', type: 'ListBox', name: 'lstOzet', items: [], listIndex: -1 }
        ]
      },
      starterSheet: {
        name: 'Notlar',
        columns: ['A', 'B', 'C'],
        rows: 8,
        cells: {
          '1,1': 'Ad',
          '1,2': 'Ortalama',
          '1,3': 'Durum'
        }
      },
      tests: [
        {
          id: 't_invalid',
          label: 'Hatalı girdide kayıt yapılmamalı',
          eventTarget: 'btnEkle_Click',
          inputs: { txtAd: 'Zeynep', txtVize: '120', txtFinal: '80' },
          expectStopOnError: true,
          expectedListItems: { lstOzet: [] },
          description: '100 üstü notta kayıt eklenmemeli ve lstOzet boş kalmalıdır.'
        },
        {
          id: 't_valid',
          label: 'Geçerli kayıt -> Sayfa + ListBox',
          eventTarget: 'btnEkle_Click',
          inputs: { txtAd: 'Zeynep', txtVize: '70', txtFinal: '80' },
          expectedSheetCells: { '2,1': 'Zeynep', '2,2': 76, '2,3': 'Geçti' },
          description: 'Notlar sayfası 2. satıra Zeynep, 76, Geçti yazılmalı ve lstOzet güncellenmelidir.'
        }
      ],
      excelChecklist: [
        'Öğrenci Not Takip Mini Projesini Excel VBA (.xlsm) dosyası olarak tamamladım.',
        'Form üzerinden en az 3 öğrenci kaydını Excel sayfasına ekledim.'
      ],
      teacherNotes: 'Dönem sonu mini projesidir; öğrenci beyanı sonrası öğretmen doğrulaması ile onaylanır.',
      teacherSolution: `Option Explicit

Private Sub btnEkle_Click()
  Dim ws As Worksheet
  Dim vize As Double, finalNot As Double, ort As Double
  Dim durum As String
  Dim yeniSatir As Long
  If Trim(txtAd.Value) = "" Or Not IsNumeric(txtVize.Value) Or Not IsNumeric(txtFinal.Value) Then Exit Sub
  vize = CDbl(txtVize.Value)
  finalNot = CDbl(txtFinal.Value)
  If vize < 0 Or vize > 100 Or finalNot < 0 Or finalNot > 100 Then Exit Sub
  ort = vize * 0.4 + finalNot * 0.6
  If ort >= 50 Then
    durum = "Geçti"
  Else
    durum = "Kaldı"
  End If
  Set ws = Worksheets("Notlar")
  yeniSatir = ws.Cells(ws.Rows.Count, 1).End(xlUp).Row + 1
  ws.Cells(yeniSatir, 1).Value = Trim(txtAd.Value)
  ws.Cells(yeniSatir, 2).Value = ort
  ws.Cells(yeniSatir, 3).Value = durum
  lstOzet.AddItem Trim(txtAd.Value) & " - " & CStr(ort) & " (" & durum & ")"
  txtAd.Value = ""
  txtVize.Value = ""
  txtFinal.Value = ""
End Sub`,
      extensionTask: 'Listeden seçilen öğrenciyi silen veya ortalaması en yüksek öğrenciyi gösteren buton ekle.',
      contentVersion: 1
    }
  ]
};
