import { GpWeekDefinition } from '../types';

export const GP_WEEK_2: GpWeekDefinition = {
  order: 2,
  title: 'Bilgiler ve Hesaplamalar',
  shortTitle: 'Hafta 2',
  description:
    'Değişken türleri (String, Long, Double, Boolean), tür dönüşümleri (CLng, CDbl, CStr) ve temel aritmetik hesaplamalar.',
  objectives: [
    'Metin, tam sayı, ondalıklı sayı ve mantıksal veriler için doğru VBA veri türünü seçmek.',
    'TextBox’tan gelen metni CLng / CDbl ile sayıya dönüştürmeden toplama yapmanın riskini görmek.',
    'Kırtasiye ve alışveriş fişi hesaplamalarını doğru biçimde kodlamak.'
  ],
  activities: [
    {
      id: 'H2-E1',
      code: 'H2-E1',
      week: 2,
      orderInWeek: 1,
      title: 'Bilgiyi Doğru Kutuya Koy',
      difficulty: 'Basit',
      durationMinutes: 10,
      expectedSeconds: 300,
      allocatedSeconds: 600,
      objectives: ['Veri örneklerini uygun VBA değişken türleriyle eşleştirmek.'],
      environment: 'web',
      prerequisites: [],
      instructions: {
        whatToDo: 'Soldaki dört veri örneğini sağdaki doğru VBA değişken türüyle eşleştir.',
        whereToStart: 'Tam sayı mı, ondalıklı fiyat mı, yoksa metin mi olduğuna bak.',
        whichData: '"Ayşe Yılmaz", 45, 19.75, True örnekleri.',
        expectedResult: 'Her veri türü doğru örnekle eşleşir.',
        howToKnowDone: '4/4 doğru eşleştirme sonrası tamamlanır.',
        steps: [
          'Soldaki veri kartına tıkla.',
          'Sağdaki uygun VBA türüne (String, Long, Double, Boolean) tıkla.',
          '"Kontrol Et" butonuna bas.'
        ]
      },
      sampleInputs: ['"Ayşe Yılmaz", 45, 19.75, True'],
      expectedBehavior: 'Tam sayılar Long, ondalıklı sayılar Double, yazılar String, Doğru/Yanlış Boolean olur.',
      completionCriteria: ['4/4 doğru eşleştirme'],
      hints: [
        'Kuruşlu/ondalıklı fiyatlar için tam sayı türü kullanılmaz.',
        'Long tam sayıları, Double virgüllü/ondalıklı sayıları tutar.',
        'Örnek: Dim fiyat As Double : fiyat = 19.75'
      ],
      widgetType: 'matching',
      starterCode: '',
      starterForm: { title: 'Veri Türleri', controls: [] },
      tests: [],
      excelChecklist: ['Değişken türlerini defterime not ettim.'],
      teacherNotes: 'Integer yerine modern VBA’da neden Long tercih edildiğini kısaca açıklayın.',
      teacherSolution: 'String -> "Ayşe Yılmaz", Long -> 45, Double -> 19.75, Boolean -> True.',
      extensionTask: 'Öğrenci numarasıyla matematiksel işlem yapılmayacaksa neden String tutulur?',
      contentVersion: 1,
      matchingPayload: {
        leftItems: [
          { id: 'v_str', label: '"Ayşe Yılmaz"', subtitle: 'Öğrenci adı' },
          { id: 'v_lng', label: '45', subtitle: 'Adet / tam sayı' },
          { id: 'v_dbl', label: '19.75', subtitle: 'Birim fiyat' },
          { id: 'v_bool', label: 'True', subtitle: 'Onay durumu' }
        ],
        rightTargets: [
          { id: 't_lng', text: 'Long — Tam sayılar için kullanılır.' },
          { id: 't_bool', text: 'Boolean — Yalnızca True veya False değeri alır.' },
          { id: 't_str', text: 'String — Metin (yazı) verilerini saklar.' },
          { id: 't_dbl', text: 'Double — Ondalıklı/kuruşlu sayıları saklar.' }
        ],
        correctPairs: {
          v_str: 't_str',
          v_lng: 't_lng',
          v_dbl: 't_dbl',
          v_bool: 't_bool'
        },
        explanations: {
          v_str: 'Metin verileri String türünde tutulur.',
          v_lng: 'Tam sayılar için Long kullanılır.',
          v_dbl: 'Ondalıklı değerler için Double seçilir.',
          v_bool: 'Evet/Hayır veya Doğru/Yanlış durumları Boolean olur.'
        }
      }
    },
    {
      id: 'H2-E2',
      code: 'H2-E2',
      week: 2,
      orderInWeek: 2,
      title: 'Hesaplamayı Tamamla',
      difficulty: 'Basit–orta',
      durationMinutes: 15,
      expectedSeconds: 450,
      allocatedSeconds: 900,
      objectives: ['Eksik tür dönüşümü ve çarpma/yazdırma ifadelerini tamamlamak.'],
      environment: 'web',
      prerequisites: ['H2-E1'],
      instructions: {
        whatToDo: 'Kod içindeki üç boşluğu doğru VBA ifadeleriyle doldur.',
        whereToStart: 'İlk boşlukta adet bilgisini tam sayıya çeviren fonksiyonu seç.',
        whichData: 'txtAdet (tam sayı), txtFiyat (ondalıklı sayı), lblToplam (etiket).',
        expectedResult: 'Her boşluğun altında neden doğru veya yanlış olduğuna dair açıklama görürsün.',
        howToKnowDone: '3/3 boşluk doğru doldurulduğunda tamamlanır.',
        steps: [
          'Her boşluk için en uygun VBA parçasını seç.',
          '"Kontrol Et" butonuna bas ve geri bildirimleri oku.'
        ]
      },
      sampleInputs: ['adet = 3, fiyat = 12.5'],
      expectedBehavior: 'toplam = adet * fiyat hesaplanır ve CStr(toplam) ile yazdırılır.',
      completionCriteria: ['Tüm boşlukların doğru tamamlanması'],
      hints: [
        'Tam sayıya dönüştürmek için CLng, ondalıklı sayı için CDbl kullanılır.',
        'Etiketin görünen yazısı için Caption özelliğini kullan.',
        'Örnek: adet = CLng(txtAdet.Value)'
      ],
      widgetType: 'fill_blanks',
      starterCode: '',
      starterForm: { title: 'Hesaplama', controls: [] },
      tests: [],
      excelChecklist: ['CLng ve CDbl farkını örnek üzerinde denedim.'],
      teacherNotes: 'TextBox’tan okunan her verinin başlangıçta metin olduğunu vurgulayın.',
      teacherSolution: '1) CLng, 2) CDbl, 3) Caption',
      extensionTask: 'Fiyat kuruşlu olmasaydı CDbl yerine ne kullanabilirdik?',
      contentVersion: 1,
      fillBlanksPayload: {
        templateLines: [
          'Dim adet As Long, fiyat As Double, toplam As Double',
          'adet = {{b1}}(txtAdet.Value)',
          'fiyat = {{b2}}(txtFiyat.Value)',
          'toplam = adet * fiyat',
          'lblToplam.{{b3}} = "Toplam: " & CStr(toplam) & " TL"'
        ],
        blanks: [
          {
            id: 'b1',
            label: 'Boşluk 1 (Tam sayı dönüşümü)',
            options: ['CLng', 'CStr', 'Trim'],
            correctAnswers: ['CLng'],
            explanationCorrect: 'Doğru! CLng metni tam sayıya (Long) dönüştürür.',
            explanationWrong: 'Adet bir tam sayıdır; metni tam sayıya çevirmek için CLng kullanmalısın.'
          },
          {
            id: 'b2',
            label: 'Boşluk 2 (Ondalıklı dönüşüm)',
            options: ['CDbl', 'CLng', 'Boolean'],
            correctAnswers: ['CDbl'],
            explanationCorrect: 'Doğru! Fiyat kuruşlu olabileceği için CDbl kullanılır.',
            explanationWrong: 'CLng küsuratı yuvarlar; ondalıklı fiyat için CDbl seçmelisin.'
          },
          {
            id: 'b3',
            label: 'Boşluk 3 (Etiket özelliği)',
            options: ['Caption', 'Value', 'AddItem'],
            correctAnswers: ['Caption'],
            explanationCorrect: 'Doğru! Label metni Caption özelliği ile değiştirilir.',
            explanationWrong: 'Label bileşeninde Value değil Caption özelliği kullanılır.'
          }
        ]
      }
    },
    {
      id: 'H2-E3',
      code: 'H2-E3',
      week: 2,
      orderInWeek: 3,
      title: 'Sonucu Önce Sen Bul',
      difficulty: 'Orta',
      durationMinutes: 20,
      expectedSeconds: 600,
      allocatedSeconds: 1200,
      objectives: ['& ile + operatörleri arasındaki farkı önceden tahmin etmek.'],
      environment: 'web',
      prerequisites: ['H2-E2'],
      instructions: {
        whatToDo: 'Verilen kodda a = "10" ve b = "5" iken MsgBox çıktısının ne olacağını tahmin et.',
        whereToStart: 'Değişkenlerin String olarak tanımlandığına ve & kullanıldığına dikkat et.',
        whichData: 'a = "10", b = "5"',
        expectedResult: 'Tahminini gönderdikten sonra simülatörde çalıştırıp doğrula.',
        howToKnowDone: 'Doğru tahmini seçip karşılaştırdığında tamamlanır.',
        steps: [
          'Kod satırlarını oku.',
          'Seçeneklerden tahminini işaretle ve gönder.',
          'Simülatörde çalıştırarak sonucu gör.'
        ]
      },
      sampleInputs: ['a = "10", b = "5"'],
      expectedBehavior: '& işareti metin birleştirme yaptığı için "105" yazar.',
      completionCriteria: ['Doğru çıktı tahmini'],
      hints: [
        '& operatörü her zaman metin birleştirir, matematiksel toplama yapmaz.',
        '"10" ve "5" yan yana gelince kaç basamaklı bir yazı oluşur?',
        'Toplama yapmak isteseydik CLng(a) + CLng(b) yazmalıydık.'
      ],
      widgetType: 'output_prediction',
      starterCode: `Option Explicit

Private Sub btnTest_Click()
  Dim a As String, b As String
  a = "10"
  b = "5"
  MsgBox a & b
End Sub`,
      starterForm: {
        title: 'Metin mi Sayı mı?',
        controls: [{ id: 'b1', type: 'CommandButton', name: 'btnTest', caption: 'Çalıştır' }]
      },
      tests: [],
      excelChecklist: ['Excel’de a & b ile CLng(a) + CLng(b) farkını test ettim.'],
      teacherNotes: 'Öğrencilerin en sık yaptığı hata: iki TextBox değerini & ile birleştirip toplama sanmak.',
      teacherSolution: '105',
      extensionTask: 'Sonucun 15 çıkması için satırı nasıl değiştirirdin?',
      contentVersion: 1,
      outputPredictionPayload: {
        codeToRead: `Option Explicit

Private Sub btnTest_Click()
  Dim a As String, b As String
  a = "10"
  b = "5"
  MsgBox a & b
End Sub`,
        question: 'btnTest butonuna basıldığında MsgBox penceresinde ne yazar?',
        options: ['15', '105', '10 + 5', 'Hata verir'],
        correctAnswer: '105',
        explanation: '& operatörü metin birleştirme operatörüdür. "10" ile "5" yan yana gelerek "105" olur.',
        simEvent: 'btnTest_Click'
      }
    },
    {
      id: 'H2-E4',
      code: 'H2-E4',
      week: 2,
      orderInWeek: 4,
      title: 'Kırtasiye Hesaplayıcısı',
      difficulty: 'Orta–zor',
      durationMinutes: 40,
      expectedSeconds: 1200,
      allocatedSeconds: 2400,
      objectives: ['Birim fiyat ve adet alıp toplam tutarı hesaplayan VBA kodu yazmak.'],
      environment: 'web',
      prerequisites: ['H2-E3'],
      instructions: {
        whatToDo: 'btnHesapla_Click olayında txtFiyat ve txtAdet değerlerini sayıya çevirip çarp ve lblTutar.Caption içine yaz.',
        whereToStart: 'Dim fiyat As Double, adet As Long, tutar As Double tanımlarıyla başla.',
        whichData: 'txtFiyat (ör. 12.5) ve txtAdet (ör. 4).',
        expectedResult: 'lblTutar.Caption içinde hesaplanan tutar ("50") görünür.',
        howToKnowDone: 'Tüm test senaryoları geçtiğinde tamamlanır.',
        steps: [
          'Değişkenleri Dim ile tanımla.',
          'CDbl(txtFiyat.Value) ve CLng(txtAdet.Value) ile sayıları al.',
          'tutar = fiyat * adet hesapla ve lblTutar.Caption = CStr(tutar) yaz.'
        ]
      },
      sampleInputs: ['Fiyat: 12.5, Adet: 4 -> 50', 'Fiyat: 7.5, Adet: 3 -> 22.5'],
      expectedBehavior: 'lblTutar.Caption hesaplanan tutarı gösterir.',
      completionCriteria: [
        'Test 1: 12.5 * 4 = 50',
        'Test 2: 7.5 * 3 = 22.5'
      ],
      hints: [
        'TextBox değerini doğrudan çarpmadan önce CDbl ve CLng ile dönüştür.',
        'Sonucu lblTutar.Caption özelliğine CStr(tutar) olarak ata.',
        'Örnek: tutar = CDbl(txtFiyat.Value) * CLng(txtAdet.Value)'
      ],
      widgetType: 'code_editor',
      quickCommands: ['Dim fiyat As Double', 'CDbl(txtFiyat.Value)', 'CLng(txtAdet.Value)', 'lblTutar.Caption = '],
      supportedEvents: ['btnHesapla_Click'],
      starterCode: `Option Explicit

Private Sub btnHesapla_Click()
  Dim fiyat As Double
  Dim adet As Long
  Dim tutar As Double
  
  ' Fiyat ve adet değerlerini dönüştür, çarp ve lblTutar.Caption'a yaz
  
End Sub`,
      starterForm: {
        title: 'Kırtasiye Hesaplayıcısı',
        controls: [
          { id: 'l1', type: 'Label', name: 'lbl1', caption: 'Birim Fiyat:' },
          { id: 't1', type: 'TextBox', name: 'txtFiyat', value: '12.5' },
          { id: 'l2', type: 'Label', name: 'lbl2', caption: 'Adet:' },
          { id: 't2', type: 'TextBox', name: 'txtAdet', value: '4' },
          { id: 'b1', type: 'CommandButton', name: 'btnHesapla', caption: 'Hesapla' },
          { id: 'l3', type: 'Label', name: 'lblTutar', caption: '0' }
        ]
      },
      tests: [
        {
          id: 't1',
          label: '12.5 x 4 = 50',
          eventTarget: 'btnHesapla_Click',
          inputs: { txtFiyat: '12.5', txtAdet: '4' },
          expectedControlProps: { lblTutar: { Caption: '50' } },
          description: '12.5 fiyat ve 4 adet için lblTutar.Caption "50" içermelidir.'
        },
        {
          id: 't2',
          label: '7.5 x 3 = 22.5',
          eventTarget: 'btnHesapla_Click',
          inputs: { txtFiyat: '7.5', txtAdet: '3' },
          expectedControlProps: { lblTutar: { Caption: '22.5' } },
          description: '7.5 fiyat ve 3 adet için lblTutar.Caption "22.5" içermelidir.'
        }
      ],
      excelChecklist: ['Excel’de aynı hesaplamayı yapıp sonucu formatladım.'],
      teacherNotes: 'Ondalık ayracı olarak simülatör hem nokta hem virgülü kabul eder.',
      teacherSolution: `Option Explicit

Private Sub btnHesapla_Click()
  Dim fiyat As Double
  Dim adet As Long
  Dim tutar As Double
  fiyat = CDbl(txtFiyat.Value)
  adet = CLng(txtAdet.Value)
  tutar = fiyat * adet
  lblTutar.Caption = CStr(tutar)
End Sub`,
      extensionTask: '%20 KDV ekleyerek genel toplamı da ikinci bir etikette göster.',
      contentVersion: 1
    },
    {
      id: 'H2-E5',
      code: 'H2-E5',
      week: 2,
      orderInWeek: 5,
      title: 'Alışveriş Fişi Hazırla',
      difficulty: 'Zor',
      durationMinutes: 40,
      expectedSeconds: 1200,
      allocatedSeconds: 2400,
      objectives: ['Ürün adı, fiyat, adet ve %10 KDV hesabını yapıp fiş özeti üretmek.'],
      environment: 'web+excel',
      prerequisites: ['H2-E4'],
      instructions: {
        whatToDo: 'Ürün adı, fiyat ve adet alıp ara toplamı, %10 KDV tutarını ve genel toplamı hesaplayarak lblFis.Caption ve MsgBox ile göster.',
        whereToStart: 'Const KDV_ORANI As Double = 0.1 sabiti tanımlayarak başla.',
        whichData: 'txtUrun ("Defter"), txtFiyat ("20"), txtAdet ("3").',
        expectedResult: 'Ara toplam 60, KDV 6, Genel toplam 66 hesaplanır ve lblFis.Caption içinde ürün adıyla birlikte görünür.',
        howToKnowDone: 'Web testleri geçip Excel kontrol listesini işaretlediğinde tamamlanır.',
        steps: [
          'fiyat ve adet değerlerini sayıya çevirip araToplam = fiyat * adet hesapla.',
          'kdv = araToplam * 0.1 ve genelToplam = araToplam + kdv hesapla.',
          'lblFis.Caption içine ürün adını ve genelToplam değerini yaz.',
          'MsgBox ile fiş özetini göster.'
        ]
      },
      sampleInputs: ['Defter, 20 TL, 3 adet -> Genel Toplam: 66'],
      expectedBehavior: 'lblFis.Caption ürün adını ve genel toplamı (66) içerir; MsgBox tetiklenir.',
      completionCriteria: [
        'Defter, 20, 3 girdisinde lblFis.Caption "Defter" ve "66" içermeli',
        'MsgBox çıktısı üretilmeli'
      ],
      hints: [
        '%10 KDV hesaplamak için araToplam * 0.10 kullanabilirsin.',
        'lblFis.Caption = txtUrun.Value & " | Toplam: " & CStr(genelToplam)',
        'Örnek: genelToplam = araToplam + (araToplam * 0.1)'
      ],
      widgetType: 'code_editor',
      quickCommands: ['Const KDV As Double = 0.1', 'lblFis.Caption = ', 'MsgBox '],
      supportedEvents: ['btnFis_Click'],
      starterCode: `Option Explicit

Private Sub btnFis_Click()
  Const KDV_ORANI As Double = 0.1
  Dim fiyat As Double, adet As Long
  Dim araToplam As Double, genelToplam As Double
  
  ' Hesaplamayı yap, lblFis.Caption'a yaz ve MsgBox göster
  
End Sub`,
      starterForm: {
        title: 'Alışveriş Fişi',
        controls: [
          { id: 'l1', type: 'Label', name: 'lbl1', caption: 'Ürün:' },
          { id: 't1', type: 'TextBox', name: 'txtUrun', value: 'Defter' },
          { id: 'l2', type: 'Label', name: 'lbl2', caption: 'Fiyat:' },
          { id: 't2', type: 'TextBox', name: 'txtFiyat', value: '20' },
          { id: 'l3', type: 'Label', name: 'lbl3', caption: 'Adet:' },
          { id: 't3', type: 'TextBox', name: 'txtAdet', value: '3' },
          { id: 'b1', type: 'CommandButton', name: 'btnFis', caption: 'Fiş Oluştur' },
          { id: 'l4', type: 'Label', name: 'lblFis', caption: 'Fiş bekleniyor...' }
        ]
      },
      tests: [
        {
          id: 't1',
          label: 'Defter fişi (20 TL x 3 + %10 KDV = 66)',
          eventTarget: 'btnFis_Click',
          inputs: { txtUrun: 'Defter', txtFiyat: '20', txtAdet: '3' },
          expectedControlProps: { lblFis: { Caption: '66' } },
          expectedMsgBoxContains: ['66'],
          description: 'lblFis.Caption ve MsgBox içinde 66 değeri yer almalıdır.'
        }
      ],
      excelChecklist: [
        'Excel’de Alışveriş Fişi UserForm’unu hazırladım.',
        'Farklı ürün ve fiyatlarla genel toplamın doğru hesaplandığını doğruladım.'
      ],
      teacherNotes: 'Sabit (Const) kullanımının kod okunabilirliğini nasıl artırdığını gösterin.',
      teacherSolution: `Option Explicit

Private Sub btnFis_Click()
  Const KDV_ORANI As Double = 0.1
  Dim fiyat As Double, adet As Long
  Dim araToplam As Double, genelToplam As Double
  fiyat = CDbl(txtFiyat.Value)
  adet = CLng(txtAdet.Value)
  araToplam = fiyat * adet
  genelToplam = araToplam + (araToplam * KDV_ORANI)
  lblFis.Caption = txtUrun.Value & " - Genel Toplam: " & CStr(genelToplam) & " TL"
  MsgBox lblFis.Caption
End Sub`,
      extensionTask: 'Temizle butonu ekleyip tüm kutuları sıfırla.',
      contentVersion: 1
    }
  ]
};
