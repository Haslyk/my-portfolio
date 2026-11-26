import { GpWeekDefinition } from '../types';

export const GP_WEEK_3: GpWeekDefinition = {
  order: 3,
  title: 'Koşullar ve Kontroller',
  shortTitle: 'Hafta 3',
  description:
    'If / ElseIf / Else karar yapıları, karşılaştırma operatörleri, And / Or mantıksal bağlaçları, IsNumeric ve Exit Sub ile güvenli veri doğrulama.',
  objectives: [
    'If / ElseIf / Else bloklarının çalışma sırasını takip etmek.',
    'Sınır değerlerde (>=, <=) doğru karşılaştırma işaretini seçmek.',
    'Boş, metin veya 0–100 dışı hatalı girdilerde hesaplamayı Exit Sub ile durdurmak.'
  ],
  activities: [
    {
      id: 'H3-E1',
      code: 'H3-E1',
      week: 3,
      orderInWeek: 1,
      title: 'Hangi Yol Seçilir?',
      difficulty: 'Basit',
      durationMinutes: 10,
      expectedSeconds: 300,
      allocatedSeconds: 600,
      objectives: ['If / ElseIf / Else yapısında hangi dalın çalışacağını belirlemek.'],
      environment: 'web',
      prerequisites: [],
      instructions: {
        whatToDo: 'notDegeri = 50 iken hangi If/ElseIf dalının çalışacağını ve lblSonuc.Caption değerini tahmin et.',
        whereToStart: 'Koşulları yukarıdan aşağı tek tek kontrol et.',
        whichData: 'notDegeri = 50',
        expectedResult: 'Tahminini gönderip simülatörde çalıştırarak doğrula.',
        howToKnowDone: 'Doğru seçeneği işaretleyip kontrol ettiğinde tamamlanır.',
        steps: [
          'Kodda >= 85, >= 50 ve Else dallarını incele.',
          '50 sayısı için hangi koşulun ilk kez Doğru (True) olduğuna karar ver.',
          'Tahminini seç ve "Çalıştır ve Karşılaştır"a bas.'
        ]
      },
      sampleInputs: ['notDegeri = 50'],
      expectedBehavior: '50 >= 50 doğru olduğu için "Geçti" yazar.',
      completionCriteria: ['Doğru dalın tahmin edilmesi'],
      hints: [
        'If/ElseIf zincirinde ilk doğru olan dal çalışır, diğerlerine bakılmaz.',
        '>= işareti "büyük veya eşit" anlamına gelir.',
        '50 >= 85 Yanlış, 50 >= 50 Doğru!'
      ],
      widgetType: 'output_prediction',
      starterCode: `Option Explicit

Private Sub btnKontrol_Click()
  Dim notDegeri As Long
  notDegeri = 50
  If notDegeri >= 85 Then
    lblSonuc.Caption = "Pekiyi"
  ElseIf notDegeri >= 50 Then
    lblSonuc.Caption = "Geçti"
  Else
    lblSonuc.Caption = "Kaldı"
  End If
End Sub`,
      starterForm: {
        title: 'Karar Yolu',
        controls: [
          { id: 'b1', type: 'CommandButton', name: 'btnKontrol', caption: 'Kontrol Et' },
          { id: 'l1', type: 'Label', name: 'lblSonuc', caption: '...' }
        ]
      },
      tests: [],
      excelChecklist: ['ElseIf sırasının önemini derste örnekledim.'],
      teacherNotes: 'Sınır değeri olan 50’nin > 50 ile >= 50 arasındaki farkını vurgulayın.',
      teacherSolution: 'Geçti',
      extensionTask: 'İlk satır If notDegeri >= 50 olsaydı 90 notu ne yazardı?',
      contentVersion: 1,
      outputPredictionPayload: {
        codeToRead: `Dim notDegeri As Long
notDegeri = 50
If notDegeri >= 85 Then
  lblSonuc.Caption = "Pekiyi"
ElseIf notDegeri >= 50 Then
  lblSonuc.Caption = "Geçti"
Else
  lblSonuc.Caption = "Kaldı"
End If`,
        question: 'Bu kod çalıştığında lblSonuc.Caption ne olur?',
        options: ['Pekiyi', 'Geçti', 'Kaldı', 'Boş kalır'],
        correctAnswer: 'Geçti',
        explanation: '50 >= 85 yanlıştır; bir sonraki ElseIf 50 >= 50 doğru olduğu için "Geçti" atanır.',
        simEvent: 'btnKontrol_Click'
      }
    },
    {
      id: 'H3-E2',
      code: 'H3-E2',
      week: 3,
      orderInWeek: 2,
      title: 'Karar Kodunu Tamamla',
      difficulty: 'Basit–orta',
      durationMinutes: 15,
      expectedSeconds: 450,
      allocatedSeconds: 900,
      objectives: ['Boş bırakılan koşul ve mantıksal bağlaçları tamamlamak.'],
      environment: 'web',
      prerequisites: ['H3-E1'],
      instructions: {
        whatToDo: '0–100 aralığını ve geçme sınırını kontrol eden koddaki üç boşluğu doldur.',
        whereToStart: 'İlk boşlukta sayısal kontrol yapan VBA fonksiyonunu seç.',
        whichData: 'Geçerli not 0 ile 100 arasında (dahil) olmalı, geçme notu 50 ve üzeridir.',
        expectedResult: 'Her boşluğun altında açıklayıcı geri bildirim görünür.',
        howToKnowDone: '3/3 doğru cevap verildiğinde tamamlanır.',
        steps: [
          'IsNumeric, Or ve >= ifadelerinden uygun olanları yerleştir.',
          '"Kontrol Et" butonuna bas.'
        ]
      },
      sampleInputs: ['puan = 50 -> Geçti'],
      expectedBehavior: 'IsNumeric kontrolü ve 0–100 aralık kontrolü doğru çalışır.',
      completionCriteria: ['3/3 boşluğun doğru doldurulması'],
      hints: [
        'Bir değerin sayı olup olmadığını IsNumeric() ile kontrol ederiz.',
        '0’dan küçük VEYA 100’den büyükse hatalıdır: burada Or bağlacı kullanılır.',
        '50 değeri koşula dahil olmalı; karşılaştırma işaretini >= seç.'
      ],
      widgetType: 'fill_blanks',
      starterCode: '',
      starterForm: { title: 'Karar Kodu', controls: [] },
      tests: [],
      excelChecklist: ['And ile Or farkını kendi örneğimde denedim.'],
      teacherNotes: '50 değerinin geçer not olduğuna ve < 0 Or > 100 mantığına dikkat çekin.',
      teacherSolution: '1) IsNumeric, 2) Or, 3) >=',
      extensionTask: 'Aynı aralık kontrolünü Not (puan >= 0 And puan <= 100) ile nasıl yazardın?',
      contentVersion: 1,
      fillBlanksPayload: {
        templateLines: [
          'If Not {{b1}}(txtNot.Value) Then Exit Sub',
          'puan = CLng(txtNot.Value)',
          'If puan < 0 {{b2}} puan > 100 Then Exit Sub',
          'If puan {{b3}} 50 Then',
          '  lblSonuc.Caption = "Geçti"',
          'End If'
        ],
        blanks: [
          {
            id: 'b1',
            label: 'Boşluk 1 (Sayısal kontrol)',
            options: ['IsNumeric', 'Trim', 'CStr'],
            correctAnswers: ['IsNumeric'],
            explanationCorrect: 'Doğru! IsNumeric, girilen değerin sayıya dönüştürülebilir olup olmadığını kontrol eder.',
            explanationWrong: 'Metin kutusunda harf olup olmadığını anlamak için IsNumeric kullanmalısın.'
          },
          {
            id: 'b2',
            label: 'Boşluk 2 (Aralık dışı bağlacı)',
            options: ['Or', 'And', 'Not'],
            correctAnswers: ['Or'],
            explanationCorrect: 'Doğru! Bir sayı hem 0’dan küçük hem 100’den büyük olamaz; ikisinden biri yeterlidir (Or).',
            explanationWrong: 'And seçersen bir sayının aynı anda hem < 0 hem > 100 olmasını beklersin ki bu imkansızdır. Or kullan.'
          },
          {
            id: 'b3',
            label: 'Boşluk 3 (50 dahil)',
            options: ['>=', '>', '='],
            correctAnswers: ['>='],
            explanationCorrect: 'Doğru! 50 alan öğrenci de geçeceği için >= kullanılmalıdır.',
            explanationWrong: '50 değeri koşula dahil olmalı; karşılaştırma işaretini kontrol et.'
          }
        ]
      }
    },
    {
      id: 'H3-E3',
      code: 'H3-E3',
      week: 3,
      orderInWeek: 3,
      title: 'Hatalı Girdiyi Yakala',
      difficulty: 'Orta',
      durationMinutes: 20,
      expectedSeconds: 600,
      allocatedSeconds: 1200,
      objectives: ['Kod içindeki mantık hatasını bulup düzeltmek.'],
      environment: 'web',
      prerequisites: ['H3-E2'],
      instructions: {
        whatToDo: 'Verilen kodda 50 alan öğrenci "Kaldı" görünüyor ve boş bırakılınca hata veriyor. Hatalı satırı bul ve düzelt.',
        whereToStart: 'IsNumeric kontrolü ekle ve > 50 karşılaştırmasını >= 50 yap.',
        whichData: 'txtPuan kutusuna "" (boş), "abc" veya "50" girilerek test edilecek.',
        expectedResult: '50 girildiğinde "Geçti", "abc" veya "" girildiğinde uyarı verilip Exit Sub ile durmalıdır.',
        howToKnowDone: 'Tüm test senaryoları geçtiğinde tamamlanır.',
        steps: [
          'Başlangıç kodunu çalıştırıp hatayı gözlemle.',
          'Sayısal olmayan veya boş girişte Exit Sub ekle.',
          'puan > 50 ifadesini puan >= 50 olarak düzelt ve "Kontrol Et"e bas.'
        ]
      },
      sampleInputs: ['"" -> Durmalı', '"abc" -> Durmalı', '50 -> Geçti', '49 -> Kaldı'],
      expectedBehavior: 'Hatalı girdide hesaplama durur, 50 değerinde "Geçti" yazar.',
      completionCriteria: [
        'Boş ve metin girdide hesaplamanın durması',
        '50 girdisinde "Geçti" sonucunun verilmesi'
      ],
      hints: [
        '50 değeri koşula dahil olmalı; karşılaştırma işaretini kontrol et.',
        'CLng(txtPuan.Value) satırından önce If Trim(txtPuan.Value) = "" Or Not IsNumeric(txtPuan.Value) Then kontrolü ekle.',
        'Örnek: If Not IsNumeric(txtPuan.Value) Then lblSonuc.Caption = "Sayı girin" : Exit Sub'
      ],
      widgetType: 'bug_hunt',
      quickCommands: ['IsNumeric(txtPuan.Value)', 'Exit Sub', '>= 50'],
      supportedEvents: ['btnHesapla_Click'],
      starterCode: `Option Explicit

Private Sub btnHesapla_Click()
  Dim puan As Long
  ' HATA 1: Sayı kontrolü yok! Boş veya harf girilirse çöker.
  puan = CLng(txtPuan.Value)
  
  ' HATA 2: 50 alan öğrenci de geçmeli!
  If puan > 50 Then
    lblSonuc.Caption = "Geçti"
  Else
    lblSonuc.Caption = "Kaldı"
  End If
End Sub`,
      starterForm: {
        title: 'Hata Avı',
        controls: [
          { id: 'l1', type: 'Label', name: 'lbl1', caption: 'Puan:' },
          { id: 't1', type: 'TextBox', name: 'txtPuan', value: '50' },
          { id: 'b1', type: 'CommandButton', name: 'btnHesapla', caption: 'Hesapla' },
          { id: 'l2', type: 'Label', name: 'lblSonuc', caption: '...' }
        ]
      },
      tests: [
        {
          id: 't_empty',
          label: 'Boş girdi durdurulmalı',
          eventTarget: 'btnHesapla_Click',
          inputs: { txtPuan: '' },
          expectStopOnError: true,
          description: 'Boş girdi verildiğinde kod çökmeden uyarı vermeli ve Geçti/Kaldı yazmamalı.'
        },
        {
          id: 't_text',
          label: 'Metin ("abc") girdi durdurulmalı',
          eventTarget: 'btnHesapla_Click',
          inputs: { txtPuan: 'abc' },
          expectStopOnError: true,
          description: '"abc" girildiğinde sayı hatası vermeden kullanıcıyı uyarmalı.'
        },
        {
          id: 't_50',
          label: 'Sınır değer 50 -> Geçti',
          eventTarget: 'btnHesapla_Click',
          inputs: { txtPuan: '50' },
          expectedControlProps: { lblSonuc: { Caption: 'Geçti' } },
          description: '50 puanı için lblSonuc.Caption "Geçti" olmalıdır.'
        },
        {
          id: 't_49',
          label: '49 -> Kaldı',
          eventTarget: 'btnHesapla_Click',
          inputs: { txtPuan: '49' },
          expectedControlProps: { lblSonuc: { Caption: 'Kaldı' } },
          description: '49 puanı için lblSonuc.Caption "Kaldı" olmalıdır.'
        }
      ],
      excelChecklist: ['Hatalı girdiyi yakalayan kodu Excel’de denedim.'],
      teacherNotes: 'Bu giriş henüz sayıya dönüştürülmedi veya 50 sınırı mesajlarını tartışın.',
      teacherSolution: `Option Explicit

Private Sub btnHesapla_Click()
  Dim puan As Long
  If Not IsNumeric(txtPuan.Value) Then
    lblSonuc.Caption = "Lütfen geçerli bir sayı girin."
    Exit Sub
  End If
  puan = CLng(txtPuan.Value)
  If puan >= 50 Then
    lblSonuc.Caption = "Geçti"
  Else
    lblSonuc.Caption = "Kaldı"
  End If
End Sub`,
      extensionTask: '0–100 aralığı dışındaki sayıları da reddet.',
      contentVersion: 1
    },
    {
      id: 'H3-E4',
      code: 'H3-E4',
      week: 3,
      orderInWeek: 4,
      title: 'Not Sonucunu Hesapla',
      difficulty: 'Orta–zor',
      durationMinutes: 40,
      expectedSeconds: 1200,
      allocatedSeconds: 2400,
      objectives: ['Vize (%40) ve Final (%60) ortalamasını hesaplayıp Geçti/Kaldı kararı vermek.'],
      environment: 'web',
      prerequisites: ['H3-E3'],
      instructions: {
        whatToDo: 'txtVize ve txtFinal değerlerinden ortalama hesapla; ortalama >= 50 ise lblDurum.Caption = "Geçti" ve rengi vbGreen, değilse "Kaldı" ve vbRed yap.',
        whereToStart: 'Vize ve final için sayı kontrolü yaptıktan sonra ort = vize * 0.4 + final * 0.6 hesapla.',
        whichData: 'txtVize, txtFinal, lblOrtalama, lblDurum.',
        expectedResult: 'Vize 60, Final 70 için ortalama 66, durum "Geçti" (yeşil) görünür.',
        howToKnowDone: 'Tüm test senaryoları geçtiğinde tamamlanır.',
        steps: [
          'vize ve final değerlerini CDbl ile al.',
          'ort = vize * 0.4 + final * 0.6 hesapla ve lblOrtalama.Caption = CStr(ort) yaz.',
          'If ort >= 50 Then ... Else ... End If ile lblDurum yazısını ve ForeColor rengini ayarla.'
        ]
      },
      sampleInputs: ['Vize 60, Final 70 -> 66, Geçti', 'Vize 30, Final 40 -> 36, Kaldı'],
      expectedBehavior: 'Ortalama doğru hesaplanır ve Geçti/Kaldı ile renk güncellenir.',
      completionCriteria: [
        'Vize 60, Final 70 -> Ortalama 66, Geçti (vbGreen)',
        'Vize 30, Final 40 -> Ortalama 36, Kaldı (vbRed)'
      ],
      hints: [
        'Ağırlıklı ortalama: vize * 0.4 + final * 0.6',
        'Geçti durumunda lblDurum.ForeColor = vbGreen, Kaldı durumunda vbRed kullan.',
        'Örnek: If ort >= 50 Then lblDurum.Caption = "Geçti"'
      ],
      widgetType: 'code_editor',
      quickCommands: ['ort = vize * 0.4 + final * 0.6', 'If ort >= 50 Then', 'vbGreen', 'vbRed'],
      supportedEvents: ['btnHesapla_Click'],
      starterCode: `Option Explicit

Private Sub btnHesapla_Click()
  Dim vize As Double, finalNot As Double, ort As Double
  vize = CDbl(txtVize.Value)
  finalNot = CDbl(txtFinal.Value)
  
  ' Ortalama hesapla ve Geçti/Kaldı durumunu yazdır
  
End Sub`,
      starterForm: {
        title: 'Vize-Final Hesaplayıcı',
        controls: [
          { id: 'l1', type: 'Label', name: 'lbl1', caption: 'Vize (%40):' },
          { id: 't1', type: 'TextBox', name: 'txtVize', value: '60' },
          { id: 'l2', type: 'Label', name: 'lbl2', caption: 'Final (%60):' },
          { id: 't2', type: 'TextBox', name: 'txtFinal', value: '70' },
          { id: 'b1', type: 'CommandButton', name: 'btnHesapla', caption: 'Hesapla' },
          { id: 'l3', type: 'Label', name: 'lblOrtalama', caption: '0' },
          { id: 'l4', type: 'Label', name: 'lblDurum', caption: 'Durum' }
        ]
      },
      tests: [
        {
          id: 't1',
          label: 'Vize 60, Final 70 -> 66 Geçti',
          eventTarget: 'btnHesapla_Click',
          inputs: { txtVize: '60', txtFinal: '70' },
          expectedControlProps: {
            lblOrtalama: { Caption: '66' },
            lblDurum: { Caption: 'Geçti', ForeColor: '#16a34a' }
          },
          description: 'Ortalama 66 ve lblDurum "Geçti" (yeşil) olmalı.'
        },
        {
          id: 't2',
          label: 'Vize 30, Final 40 -> 36 Kaldı',
          eventTarget: 'btnHesapla_Click',
          inputs: { txtVize: '30', txtFinal: '40' },
          expectedControlProps: {
            lblOrtalama: { Caption: '36' },
            lblDurum: { Caption: 'Kaldı', ForeColor: '#dc2626' }
          },
          description: 'Ortalama 36 ve lblDurum "Kaldı" (kırmızı) olmalı.'
        }
      ],
      excelChecklist: ['Excel’de Vize-Final formunu tasarlayıp renkli sonuç gösterdim.'],
      teacherNotes: 'final kelimesi VBA’da sorun çıkarmasa da finalNot gibi açıklayıcı adlar önerilir.',
      teacherSolution: `Option Explicit

Private Sub btnHesapla_Click()
  Dim vize As Double, finalNot As Double, ort As Double
  vize = CDbl(txtVize.Value)
  finalNot = CDbl(txtFinal.Value)
  ort = vize * 0.4 + finalNot * 0.6
  lblOrtalama.Caption = CStr(ort)
  If ort >= 50 Then
    lblDurum.Caption = "Geçti"
    lblDurum.ForeColor = vbGreen
  Else
    lblDurum.Caption = "Kaldı"
    lblDurum.ForeColor = vbRed
  End If
End Sub`,
      extensionTask: 'Final notu 50’nin altındaysa ortalama 50 üstü olsa bile "Kaldı" yazdır.',
      contentVersion: 1
    },
    {
      id: 'H3-E5',
      code: 'H3-E5',
      week: 3,
      orderInWeek: 5,
      title: 'Güvenilir Not Formu',
      difficulty: 'Zor',
      durationMinutes: 40,
      expectedSeconds: 1200,
      allocatedSeconds: 2400,
      objectives: [
        'Boş, metin, 0–100 sınır dışı ve geçerli girdilerin tamamını güvenle yöneten not formu yazmak.'
      ],
      environment: 'web+excel',
      prerequisites: ['H3-E4'],
      instructions: {
        whatToDo: 'txtVize ve txtFinal girdilerini doğrula: boşsa, sayı değilse veya 0–100 dışındaysa hesaplamayı Exit Sub ile durdur ve uyarı ver; geçerliyse ortalamayı ve Geçti/Kaldı sonucunu göster.',
        whereToStart: 'Önce Trim ve IsNumeric ile boş/metin kontrolü yap, ardından < 0 Or > 100 kontrolü ekle.',
        whichData: 'Boş (""), metin ("abc"), sınır dışı (-5, 105) ve geçerli (50, 50 / 40, 45) girdilerle test edilir.',
        expectedResult: 'Hatalı girdilerde lblOrtalama değişmez ve lblDurum uyarı verir; geçerli girdide doğru sonuç yazar.',
        howToKnowDone: 'Tüm test senaryoları (boş, metin, sınır dışı, geçerli) geçip Excel kontrol listesi işaretlendiğinde tamamlanır.',
        steps: [
          'txtVize ve txtFinal için IsNumeric kontrolü yaz, hatalıysa lblDurum uyarısı verip Exit Sub yap.',
          'vize < 0 Or vize > 100 Or finalNot < 0 Or finalNot > 100 ise uyar ve Exit Sub yap.',
          'Geçerli girdilerde ort = vize * 0.4 + finalNot * 0.6 hesapla, lblOrtalama ve lblDurum’u güncelle.'
        ]
      },
      sampleInputs: ['""', '"abc"', '-5 / 105', '50 / 50 -> Geçti', '40 / 45 -> Kaldı'],
      expectedBehavior: 'Hatalı girdide hesaplama durur (lblOrtalama güncellenmez). Geçerlide Geçti/Kaldı yazar.',
      completionCriteria: [
        'Boş girdide hesaplamanın durması',
        'Metin girdide hesaplamanın durması',
        'Sınır dışı (-5 veya 105) girdide hesaplamanın durması',
        'Geçerli girdilerde doğru Geçti/Kaldı sonucu'
      ],
      hints: [
        'Hatalı durumda lblOrtalama.Caption değerini değiştirmeden önce Exit Sub kullan.',
        'Aralık kontrolü: If vize < 0 Or vize > 100 Or finalNot < 0 Or finalNot > 100 Then ... Exit Sub',
        'Örnek: If Not IsNumeric(txtVize.Value) Or Not IsNumeric(txtFinal.Value) Then lblDurum.Caption = "Sayı girin" : Exit Sub'
      ],
      widgetType: 'code_editor',
      quickCommands: ['If Not IsNumeric(', 'Or vize < 0 Or vize > 100', 'Exit Sub', 'If ort >= 50 Then'],
      supportedEvents: ['btnHesapla_Click'],
      starterCode: `Option Explicit

Private Sub btnHesapla_Click()
  Dim vize As Double, finalNot As Double, ort As Double
  
  ' 1) Boş veya sayısal olmayan girdi kontrolü -> Exit Sub
  ' 2) Sayıya çevir ve 0-100 aralığını kontrol et -> Exit Sub
  ' 3) Ortalama hesapla, lblOrtalama ve lblDurum'u güncelle
  
End Sub`,
      starterForm: {
        title: 'Güvenilir Not Formu',
        controls: [
          { id: 'l1', type: 'Label', name: 'lbl1', caption: 'Vize:' },
          { id: 't1', type: 'TextBox', name: 'txtVize', value: '50' },
          { id: 'l2', type: 'Label', name: 'lbl2', caption: 'Final:' },
          { id: 't2', type: 'TextBox', name: 'txtFinal', value: '50' },
          { id: 'b1', type: 'CommandButton', name: 'btnHesapla', caption: 'Hesapla' },
          { id: 'l3', type: 'Label', name: 'lblOrtalama', caption: '-' },
          { id: 'l4', type: 'Label', name: 'lblDurum', caption: 'Hazır' }
        ]
      },
      tests: [
        {
          id: 't_empty',
          label: 'Boş girdi durdurulmalı',
          eventTarget: 'btnHesapla_Click',
          inputs: { txtVize: '', txtFinal: '60' },
          expectStopOnError: true,
          expectedControlProps: { lblOrtalama: { Caption: '-' } },
          description: 'Boş girdide hesaplama durmalı ve lblOrtalama "-" olarak kalmalıdır.'
        },
        {
          id: 't_text',
          label: 'Metin ("abc") girdi durdurulmalı',
          eventTarget: 'btnHesapla_Click',
          inputs: { txtVize: 'abc', txtFinal: '60' },
          expectStopOnError: true,
          expectedControlProps: { lblOrtalama: { Caption: '-' } },
          description: 'Metin girdide hesaplama durmalı ve lblOrtalama "-" olarak kalmalıdır.'
        },
        {
          id: 't_neg',
          label: 'Negatif (-5) girdi durdurulmalı',
          eventTarget: 'btnHesapla_Click',
          inputs: { txtVize: '-5', txtFinal: '60' },
          expectStopOnError: true,
          expectedControlProps: { lblOrtalama: { Caption: '-' } },
          description: '0’dan küçük notta hesaplama durmalı ve lblOrtalama "-" olarak kalmalıdır.'
        },
        {
          id: 't_over',
          label: '100 üstü (105) girdi durdurulmalı',
          eventTarget: 'btnHesapla_Click',
          inputs: { txtVize: '70', txtFinal: '105' },
          expectStopOnError: true,
          expectedControlProps: { lblOrtalama: { Caption: '-' } },
          description: '100’den büyük notta hesaplama durmalı ve lblOrtalama "-" olarak kalmalıdır.'
        },
        {
          id: 't_pass',
          label: 'Geçerli sınır (50, 50) -> 50 Geçti',
          eventTarget: 'btnHesapla_Click',
          inputs: { txtVize: '50', txtFinal: '50' },
          expectedControlProps: {
            lblOrtalama: { Caption: '50' },
            lblDurum: { Caption: 'Geçti' }
          },
          description: '50 ve 50 için ortalama 50, durum "Geçti" olmalıdır.'
        },
        {
          id: 't_fail',
          label: 'Geçerli kalma (40, 45) -> 43 Kaldı',
          eventTarget: 'btnHesapla_Click',
          inputs: { txtVize: '40', txtFinal: '45' },
          expectedControlProps: {
            lblOrtalama: { Caption: '43' },
            lblDurum: { Caption: 'Kaldı' }
          },
          description: '40 ve 45 için ortalama 43, durum "Kaldı" olmalıdır.'
        }
      ],
      excelChecklist: [
        'Excel’de boş, metin, -5 ve 105 değerlerini tek tek girip formun çökmediğini doğruladım.',
        'Geçerli notlarla Geçti/Kaldı sonucunun çalıştığını gördüm.'
      ],
      teacherNotes: 'Kabul ölçütü #9: H3-E5 boş, metin, sınır dışı ve geçerli girdilerle test edilir.',
      teacherSolution: `Option Explicit

Private Sub btnHesapla_Click()
  Dim vize As Double, finalNot As Double, ort As Double
  If Not IsNumeric(txtVize.Value) Or Not IsNumeric(txtFinal.Value) Then
    lblDurum.Caption = "Lütfen geçerli sayı girin."
    Exit Sub
  End If
  vize = CDbl(txtVize.Value)
  finalNot = CDbl(txtFinal.Value)
  If vize < 0 Or vize > 100 Or finalNot < 0 Or finalNot > 100 Then
    lblDurum.Caption = "Notlar 0 ile 100 arasında olmalıdır."
    Exit Sub
  End If
  ort = vize * 0.4 + finalNot * 0.6
  lblOrtalama.Caption = CStr(ort)
  If ort >= 50 Then
    lblDurum.Caption = "Geçti"
    lblDurum.ForeColor = vbGreen
  Else
    lblDurum.Caption = "Kaldı"
    lblDurum.ForeColor = vbRed
  End If
End Sub`,
      extensionTask: 'Harf notu (AA, BA, BB, FF) hesaplaması da ekle.',
      contentVersion: 1
    }
  ]
};
