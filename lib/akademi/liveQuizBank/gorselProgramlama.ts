import type { LiveQuizQuestion } from '../liveQuizBank';

export const GP_LIVE_QUESTIONS: LiveQuizQuestion[] = [
  // ================= HAFTA 1 (10 Soru) =================
  {
    id: 'gp-w1-1', weekOrder: 1,
    prompt: 'UserForm üzerindeki bir CommandButton’ın ekranda görünen yazısını kod ile değiştirmek için hangi özellik kullanılır?',
    options: [
      { id: 'A', text: 'Name' },
      { id: 'B', text: 'Caption' },
      { id: 'C', text: 'Value' },
      { id: 'D', text: 'ListIndex' }
    ],
    correctOption: 'B',
    explanation: 'Name kod içindeki kimlik adıdır; görünen metin için Caption kullanılır.'
  },
  {
    id: 'gp-w1-2', weekOrder: 1,
    prompt: 'Kullanıcıdan klavyeyle ad veya sayı girişi almak için UserForm üzerine hangi bileşen yerleştirilir?',
    options: [
      { id: 'A', text: 'Label' },
      { id: 'B', text: 'TextBox' },
      { id: 'C', text: 'CommandButton' },
      { id: 'D', text: 'Image' }
    ],
    correctOption: 'B',
    explanation: 'TextBox metin/veri girişi içindir; Label ise yalnızca bilgi gösterir.'
  },
  {
    id: 'gp-w1-3', weekOrder: 1,
    prompt: 'lblSonuc.Caption = "Merhaba " & txtAd.Value kodunda txtAd = "Ali" ise sonuç ne olur?',
    options: [
      { id: 'A', text: 'MerhabaAli' },
      { id: 'B', text: 'Merhaba Ali' },
      { id: 'C', text: 'Merhaba txtAd' },
      { id: 'D', text: 'Hata verir' }
    ],
    correctOption: 'B',
    explanation: '"Merhaba " sonundaki boşlukla birlikte "Ali" metnini & operatörü birleştirir.'
  },
  {
    id: 'gp-w1-4', weekOrder: 1,
    prompt: 'VBA kod penceresinde Name özelliği ile Caption özelliği arasındaki fark nedir?',
    options: [
      { id: 'A', text: 'Name bileşenin kod içindeki adıdır; Caption ekranda görünen başlığıdır.' },
      { id: 'B', text: 'İkisi de yalnızca butonun rengini değiştirir.' },
      { id: 'C', text: 'Name boşluk içerebilir, Caption içeremez.' },
      { id: 'D', text: 'Caption yalnızca sayısal değer alır.' }
    ],
    correctOption: 'A',
    explanation: 'Kodda btnGoster.Caption = "Tamam" yazarken btnGoster Name, "Tamam" Caption’dır.'
  },
  {
    id: 'gp-w1-5', weekOrder: 1,
    prompt: 'Aşağıdaki VBA bileşen adlarından hangisi geçerli ve iyi bir adlandırma örneğidir?',
    options: [
      { id: 'A', text: 'txtOgrenciAd' },
      { id: 'B', text: 'txt Öğrenci Adı' },
      { id: 'C', text: '1txtAd' },
      { id: 'D', text: 'buton-goster!' }
    ],
    correctOption: 'A',
    explanation: 'VBA adları harfle başlamalı, boşluk ve özel karakter içermemelidir.'
  },
  {
    id: 'gp-w1-6', weekOrder: 1,
    prompt: 'Bir Label’ın yazı rengini yeşil yapmak için hangi atama doğrudur?',
    options: [
      { id: 'A', text: 'lblSonuc.ForeColor = vbGreen' },
      { id: 'B', text: 'lblSonuc.Caption = vbGreen' },
      { id: 'C', text: 'lblSonuc.Name = "Green"' },
      { id: 'D', text: 'lblSonuc.Font.Size = vbGreen' }
    ],
    correctOption: 'A',
    explanation: 'Yazı rengi ForeColor, arka plan rengi BackColor ile değiştirilir.'
  },
  {
    id: 'gp-w1-7', weekOrder: 1,
    prompt: 'Kullanıcıya açılır pencere ile kısa bilgi mesajı göstermek için hangi komut kullanılır?',
    options: [
      { id: 'A', text: 'MsgBox' },
      { id: 'B', text: 'InputLabel' },
      { id: 'C', text: 'ShowText' },
      { id: 'D', text: 'Dim' }
    ],
    correctOption: 'A',
    explanation: 'MsgBox ekranda uyarı/bilgi penceresi açar.'
  },
  {
    id: 'gp-w1-8', weekOrder: 1,
    prompt: 'UserForm tasarımında "btnTamam" butonuna basıldığında çalışacak olay yordamı hangisidir?',
    options: [
      { id: 'A', text: 'Private Sub btnTamam_Click()' },
      { id: 'B', text: 'Private Sub btnTamam_Dim()' },
      { id: 'C', text: 'Private Sub Click_btnTamam()' },
      { id: 'D', text: 'Public Text btnTamam()' }
    ],
    correctOption: 'A',
    explanation: 'Olay yordamları KontrolAdı_OlayAdı() biçiminde adlandırılır.'
  },
  {
    id: 'gp-w1-9', weekOrder: 1,
    prompt: 'TextBox başındaki ve sonundaki gereksiz boşlukları temizlemek için hangi fonksiyon kullanılır?',
    options: [
      { id: 'A', text: 'Trim' },
      { id: 'B', text: 'CLng' },
      { id: 'C', text: 'MsgBox' },
      { id: 'D', text: 'BackColor' }
    ],
    correctOption: 'A',
    explanation: 'Trim(metin) baş ve sondaki boşlukları siler.'
  },
  {
    id: 'gp-w1-10', weekOrder: 1,
    prompt: 'VBA kodlarında tek tırnak (\') ile başlayan satırlar ne işe yarar?',
    options: [
      { id: 'A', text: 'Açıklama (yorum) satırıdır, çalıştırılmaz.' },
      { id: 'B', text: 'Değişken tanımlar.' },
      { id: 'C', text: 'Formu kapatır.' },
      { id: 'D', text: 'Hata fırlatır.' }
    ],
    correctOption: 'A',
    explanation: 'Tek tırnak kodun anlaşılması için yazılan yorumları belirtir.'
  },

  // ================= HAFTA 2 (10 Soru) =================
  {
    id: 'gp-w2-1', weekOrder: 2,
    prompt: 'a = "10" ve b = "5" (String) iken MsgBox a & b ifadesinin çıktısı nedir?',
    options: [
      { id: 'A', text: '15' },
      { id: 'B', text: '105' },
      { id: 'C', text: '50' },
      { id: 'D', text: '10 + 5' }
    ],
    correctOption: 'B',
    explanation: '& operatörü toplama değil metin birleştirme yapar.'
  },
  {
    id: 'gp-w2-2', weekOrder: 2,
    prompt: 'Birim fiyat (ör. 19.75 TL) gibi ondalıklı sayıları saklamak için hangi VBA veri türü uygundur?',
    options: [
      { id: 'A', text: 'Long' },
      { id: 'B', text: 'Double' },
      { id: 'C', text: 'Boolean' },
      { id: 'D', text: 'String' }
    ],
    correctOption: 'B',
    explanation: 'Long tam sayıları, Double ise ondalıklı sayıları tutar.'
  },
  {
    id: 'gp-w2-3', weekOrder: 2,
    prompt: 'TextBox’tan okunan "12" metnini tam sayıya çevirmek için hangi fonksiyon kullanılır?',
    options: [
      { id: 'A', text: 'CStr' },
      { id: 'B', text: 'CLng' },
      { id: 'C', text: 'Trim' },
      { id: 'D', text: 'IsNumeric' }
    ],
    correctOption: 'B',
    explanation: 'CLng metni Long (tam sayı) türüne dönüştürür.'
  },
  {
    id: 'gp-w2-4', weekOrder: 2,
    prompt: 'Yalnızca True veya False değerlerini tutabilen veri türü hangisidir?',
    options: [
      { id: 'A', text: 'Boolean' },
      { id: 'B', text: 'String' },
      { id: 'C', text: 'Long' },
      { id: 'D', text: 'Double' }
    ],
    correctOption: 'A',
    explanation: 'Mantıksal doğru/yanlış durumları Boolean değişkenlerde tutulur.'
  },
  {
    id: 'gp-w2-5', weekOrder: 2,
    prompt: 'Modülün en üstüne "Option Explicit" yazmanın amacı nedir?',
    options: [
      { id: 'A', text: 'Tüm değişkenlerin Dim/Const ile tanımlanmasını zorunlu kılarak yazım hatalarını önlemek' },
      { id: 'B', text: 'Formun arka plan rengini otomatik değiştirmek' },
      { id: 'C', text: 'Döngüleri iki kat hızlandırmak' },
      { id: 'D', text: 'Excel dosyasını şifrelemek' }
    ],
    correctOption: 'A',
    explanation: 'Option Explicit tanımsız değişken kullanımını derleme/çalışma öncesinde yakalar.'
  },
  {
    id: 'gp-w2-6', weekOrder: 2,
    prompt: 'Kod boyunca değeri hiç değişmeyecek %10 KDV oranı nasıl tanımlanmalıdır?',
    options: [
      { id: 'A', text: 'Const KDV_ORANI As Double = 0.1' },
      { id: 'B', text: 'Dim KDV_ORANI As Boolean' },
      { id: 'C', text: 'MsgBox KDV = 0.1' },
      { id: 'D', text: 'Set KDV = 0.1' }
    ],
    correctOption: 'A',
    explanation: 'Sabit değerler Const ile tanımlanır.'
  },
  {
    id: 'gp-w2-7', weekOrder: 2,
    prompt: 'Sayısal bir sonucu metinle birleştirip Label’a yazdırırken sayısal değeri metne çeviren fonksiyon hangisidir?',
    options: [
      { id: 'A', text: 'CStr' },
      { id: 'B', text: 'CDbl' },
      { id: 'C', text: 'CLng' },
      { id: 'D', text: 'IsNumeric' }
    ],
    correctOption: 'A',
    explanation: 'CStr (Convert to String) sayıyı metne çevirir.'
  },
  {
    id: 'gp-w2-8', weekOrder: 2,
    prompt: 'fiyat = 12.5 ve adet = 4 ise tutar = fiyat * adet sonucu nedir?',
    options: [
      { id: 'A', text: '50' },
      { id: 'B', text: '16.5' },
      { id: 'C', text: '12.54' },
      { id: 'D', text: '48' }
    ],
    correctOption: 'A',
    explanation: '12.5 × 4 = 50 olur.'
  },
  {
    id: 'gp-w2-9', weekOrder: 2,
    prompt: 'Ondalıklı bir sayıyı CLng ile tam sayıya çevirirsek ne olur?',
    options: [
      { id: 'A', text: 'En yakın tam sayıya yuvarlanır (ondalık kısım kaybolur).' },
      { id: 'B', text: 'Metne dönüşür.' },
      { id: 'C', text: 'Her zaman 0 olur.' },
      { id: 'D', text: 'Ondalık kısım iki katına çıkar.' }
    ],
    correctOption: 'A',
    explanation: 'CLng yalnızca tam sayı tutar; kuruşlu fiyatlar için CDbl kullanılmalıdır.'
  },
  {
    id: 'gp-w2-10', weekOrder: 2,
    prompt: '"Ayşe Yılmaz" gibi metinsel veriler hangi veri türünde saklanır?',
    options: [
      { id: 'A', text: 'String' },
      { id: 'B', text: 'Long' },
      { id: 'C', text: 'Double' },
      { id: 'D', text: 'Boolean' }
    ],
    correctOption: 'A',
    explanation: 'Metin (karakter dizisi) verileri String türünde tutulur.'
  },

  // ================= HAFTA 3 (10 Soru) =================
  {
    id: 'gp-w3-1', weekOrder: 3,
    prompt: '0 ile 100 aralığı DIŞINDAKİ hatalı notları yakalamak için hangi mantıksal bağlaç doğru olur?',
    options: [
      { id: 'A', text: 'If puan < 0 And puan > 100 Then' },
      { id: 'B', text: 'If puan < 0 Or puan > 100 Then' },
      { id: 'C', text: 'If puan >= 0 Or puan <= 100 Then' },
      { id: 'D', text: 'If Not puan = 50 Then' }
    ],
    correctOption: 'B',
    explanation: 'Bir sayı aynı anda hem 0’dan küçük hem 100’den büyük olamayacağı için Or bağlacı kullanılır.'
  },
  {
    id: 'gp-w3-2', weekOrder: 3,
    prompt: 'Hatalı girdi tespit edildiğinde alt yordamın devamındaki hesaplamayı durdurmak için ne yazılır?',
    options: [
      { id: 'A', text: 'End If' },
      { id: 'B', text: 'Exit Sub' },
      { id: 'C', text: 'Next i' },
      { id: 'D', text: 'Option Explicit' }
    ],
    correctOption: 'B',
    explanation: 'Exit Sub çalışmakta olan Sub yordamını o noktada sonlandırır.'
  },
  {
    id: 'gp-w3-3', weekOrder: 3,
    prompt: '50 ve üzeri puanların geçer sayıldığı bir sistemde hangi karşılaştırma doğrudur?',
    options: [
      { id: 'A', text: 'If puan > 50 Then' },
      { id: 'B', text: 'If puan >= 50 Then' },
      { id: 'C', text: 'If puan <= 50 Then' },
      { id: 'D', text: 'If puan <> 50 Then' }
    ],
    correctOption: 'B',
    explanation: '50 puanı da geçer olduğu için >= (büyük veya eşit) kullanılmalıdır.'
  },
  {
    id: 'gp-w3-4', weekOrder: 3,
    prompt: 'Kullanıcının girdiği değerin sayıya dönüştürülebilir olup olmadığını kontrol eden VBA fonksiyonu hangisidir?',
    options: [
      { id: 'A', text: 'IsNumeric' },
      { id: 'B', text: 'CStr' },
      { id: 'C', text: 'Trim' },
      { id: 'D', text: 'MsgBox' }
    ],
    correctOption: 'A',
    explanation: 'IsNumeric("abc") False, IsNumeric("75") True döndürür.'
  },
  {
    id: 'gp-w3-5', weekOrder: 3,
    prompt: 'VBA’da "eşit değildir" karşılaştırma operatörü hangisidir?',
    options: [
      { id: 'A', text: '<>' },
      { id: 'B', text: '!=' },
      { id: 'C', text: '=/=' },
      { id: 'D', text: '><' }
    ],
    correctOption: 'A',
    explanation: 'VBA’da eşit olmama durumu <> ile yazılır.'
  },
  {
    id: 'gp-w3-6', weekOrder: 3,
    prompt: 'If/ElseIf/Else yapısında puan = 90 ise ilk hangi dal doğru çıkar? (If >= 85 ... ElseIf >= 50 ... Else)',
    options: [
      { id: 'A', text: 'İlk dal (>= 85) çalışır, diğer ElseIf dallarına geçilmez.' },
      { id: 'B', text: 'Hem >= 85 hem >= 50 dalları birlikte çalışır.' },
      { id: 'C', text: 'Yalnızca Else dalı çalışır.' },
      { id: 'D', text: 'Kod hata verir.' }
    ],
    correctOption: 'A',
    explanation: 'If/ElseIf zincirinde ilk doğru koşulun bloğu çalışır ve blok sonlanır.'
  },
  {
    id: 'gp-w3-7', weekOrder: 3,
    prompt: 'IsNumeric("") ifadesinin (boş metin) VBA’daki sonucu nedir?',
    options: [
      { id: 'A', text: 'False (Boş metin sayı değildir)' },
      { id: 'B', text: 'True (0 olarak sayılır)' },
      { id: 'C', text: '100 döndürür' },
      { id: 'D', text: 'Hata fırlatır' }
    ],
    correctOption: 'A',
    explanation: 'VBA’da boş metin "" IsNumeric için False verir.'
  },
  {
    id: 'gp-w3-8', weekOrder: 3,
    prompt: 'Vize (%40) ve Final (%60) ortalamasını doğru hesaplayan formül hangisidir?',
    options: [
      { id: 'A', text: 'vize * 0.4 + finalNot * 0.6' },
      { id: 'B', text: '(vize + finalNot) / 4' },
      { id: 'C', text: 'vize * 40 + finalNot * 60' },
      { id: 'D', text: 'vize * 0.6 + finalNot * 0.4' }
    ],
    correctOption: 'A',
    explanation: 'Ağırlıklı ortalama vize × 0.4 + final × 0.6 ile hesaplanır.'
  },
  {
    id: 'gp-w3-9', weekOrder: 3,
    prompt: 'puan >= 0 And puan <= 100 koşulu puan = 105 için hangi sonucu üretir?',
    options: [
      { id: 'A', text: 'False' },
      { id: 'B', text: 'True' },
      { id: 'C', text: '105' },
      { id: 'D', text: '0' }
    ],
    correctOption: 'A',
    explanation: 'And bağlacında iki koşul da doğru olmalıdır; 105 <= 100 yanlıştır.'
  },
  {
    id: 'gp-w3-10', weekOrder: 3,
    prompt: 'Çok satırlı bir If bloğunun sonunda mutlaka hangi ifade bulunmalıdır?',
    options: [
      { id: 'A', text: 'End If' },
      { id: 'B', text: 'End Sub' },
      { id: 'C', text: 'Next' },
      { id: 'D', text: 'Loop' }
    ],
    correctOption: 'A',
    explanation: 'Çok satırlı If blokları End If ile kapatılır.'
  },

  // ================= HAFTA 4 (10 Soru) =================
  {
    id: 'gp-w4-1', weekOrder: 4,
    prompt: 'Excel’den ListBox’a ürünleri yükleyen butona 2. kez basıldığında ürünlerin çoğalmaması için döngüden önce ne çağrılmalıdır?',
    options: [
      { id: 'A', text: 'lstUrunler.RemoveItem 0' },
      { id: 'B', text: 'lstUrunler.Clear' },
      { id: 'C', text: 'lstUrunler.ListIndex = 0' },
      { id: 'D', text: 'Exit Sub' }
    ],
    correctOption: 'B',
    explanation: 'Clear metodu eski öğeleri temizleyerek listenin mükerrer dolmasını önler.'
  },
  {
    id: 'gp-w4-2', weekOrder: 4,
    prompt: 'ListBox üzerinde hiçbir öğe seçili değilken ListIndex değeri kaç olur?',
    options: [
      { id: 'A', text: '0' },
      { id: 'B', text: '-1' },
      { id: 'C', text: '1' },
      { id: 'D', text: 'ListCount' }
    ],
    correctOption: 'B',
    explanation: 'VBA ListBox indeksleri 0’dan başlar; seçim yokken ListIndex = -1 olur.'
  },
  {
    id: 'gp-w4-3', weekOrder: 4,
    prompt: 'For i = 1 To 4 döngüsünde toplam = toplam + i işlemi sonunda toplam kaç olur? (Başlangıç: 0)',
    options: [
      { id: 'A', text: '4' },
      { id: 'B', text: '6' },
      { id: 'C', text: '10' },
      { id: 'D', text: '14' }
    ],
    correctOption: 'C',
    explanation: '1 + 2 + 3 + 4 = 10 olur.'
  },
  {
    id: 'gp-w4-4', weekOrder: 4,
    prompt: 'Ödeme türü (Nakit / Kart) gibi yalnızca TEK bir seçeneğin seçilebildiği durumlarda hangi bileşen uygundur?',
    options: [
      { id: 'A', text: 'OptionButton' },
      { id: 'B', text: 'CheckBox' },
      { id: 'C', text: 'Label' },
      { id: 'D', text: 'TextBox' }
    ],
    correctOption: 'A',
    explanation: 'OptionButton aynı grup içinden yalnızca tek seçim yapılmasını sağlar.'
  },
  {
    id: 'gp-w4-5', weekOrder: 4,
    prompt: 'Birden fazla özelliğin aynı anda işaretlenebildiği (ekstra soslar gibi) durumlarda hangi bileşen kullanılır?',
    options: [
      { id: 'A', text: 'CheckBox' },
      { id: 'B', text: 'OptionButton' },
      { id: 'C', text: 'CommandButton' },
      { id: 'D', text: 'Shape' }
    ],
    correctOption: 'A',
    explanation: 'CheckBox birden çok bağımsız onay seçeneği için kullanılır.'
  },
  {
    id: 'gp-w4-6', weekOrder: 4,
    prompt: 'ListBox içindeki toplam öğe sayısını veren özellik hangisidir?',
    options: [
      { id: 'A', text: 'ListCount' },
      { id: 'B', text: 'ListIndex' },
      { id: 'C', text: 'Caption' },
      { id: 'D', text: 'Rows.Count' }
    ],
    correctOption: 'A',
    explanation: 'ListCount listedeki öğe sayısını döndürür.'
  },
  {
    id: 'gp-w4-7', weekOrder: 4,
    prompt: 'Seçili öğeyi silmeden önce ListIndex = -1 kontrolü yapılmazsa ne olur?',
    options: [
      { id: 'A', text: 'RemoveItem -1 geçersiz indeks hatası verir ve kod durur.' },
      { id: 'B', text: 'Listedeki son öğe otomatik silinir.' },
      { id: 'C', text: 'Yeni öğe eklenir.' },
      { id: 'D', text: 'Form kapanır.' }
    ],
    correctOption: 'A',
    explanation: 'ListIndex = -1 iken RemoveItem çağrılmamalıdır.'
  },
  {
    id: 'gp-w4-8', weekOrder: 4,
    prompt: 'ListBox’a yeni bir ürün eklemek için hangi metot kullanılır?',
    options: [
      { id: 'A', text: 'AddItem' },
      { id: 'B', text: 'InsertRow' },
      { id: 'C', text: 'AppendText' },
      { id: 'D', text: 'Push' }
    ],
    correctOption: 'A',
    explanation: 'lstSepet.AddItem "Ürün" komutu listeye yeni satır ekler.'
  },
  {
    id: 'gp-w4-9', weekOrder: 4,
    prompt: 'For i = 2 To 10 Step 2 döngüsü kaç kez çalışır?',
    options: [
      { id: 'A', text: '5 kez (2, 4, 6, 8, 10)' },
      { id: 'B', text: '9 kez' },
      { id: 'C', text: '10 kez' },
      { id: 'D', text: '2 kez' }
    ],
    correctOption: 'A',
    explanation: 'Step 2 sayacı ikişer artırır: 2, 4, 6, 8, 10 -> 5 adım.'
  },
  {
    id: 'gp-w4-10', weekOrder: 4,
    prompt: 'Urunler sayfasındaki A sütununun son dolu satırını bulan klasik VBA ifadesi hangisidir?',
    options: [
      { id: 'A', text: 'ws.Cells(ws.Rows.Count, 1).End(xlUp).Row' },
      { id: 'B', text: 'ws.Cells(1, 1).Clear' },
      { id: 'C', text: 'ws.Rows.Count + 1' },
      { id: 'D', text: 'lstUrunler.ListCount' }
    ],
    correctOption: 'A',
    explanation: 'En alt satırdan yukarı çıkarak son dolu hücrenin satır numarasını verir.'
  },

  // ================= HAFTA 5 (10 Soru) =================
  {
    id: 'gp-w5-1', weekOrder: 5,
    prompt: 'Kayıt Defteri’nde art arda eklenen kayıtların hep 2. satırın üzerine yazılmasını önlemek için yeni satır nasıl bulunur?',
    options: [
      { id: 'A', text: 'ws.Cells(ws.Rows.Count, 1).End(xlUp).Row + 1' },
      { id: 'B', text: 'ws.Cells(1, 1).Row' },
      { id: 'C', text: 'ws.Rows.Count - 1' },
      { id: 'D', text: 'lstOzet.ListCount' }
    ],
    correctOption: 'A',
    explanation: 'End(xlUp).Row en son dolu satırı verir; + 1 ile bir altındaki ilk boş satır bulunur.'
  },
  {
    id: 'gp-w5-2', weekOrder: 5,
    prompt: 'Kullanıcı bir TextBox’ın içine tıklayıp odaklandığında rehber mesajı göstermek için hangi olay kullanılır?',
    options: [
      { id: 'A', text: 'Enter' },
      { id: 'B', text: 'Exit' },
      { id: 'C', text: 'Clear' },
      { id: 'D', text: 'RemoveItem' }
    ],
    correctOption: 'A',
    explanation: 'Enter olayı kontrole odaklanıldığında, Exit ise kontrolden çıkıldığında çalışır.'
  },
  {
    id: 'gp-w5-3', weekOrder: 5,
    prompt: 'Bir kayıt sayfasına eklendikten sonra TextBox kutularının temizlenmesi neden önemlidir?',
    options: [
      { id: 'A', text: 'Yeni kayıt için hazır hale getirmek ve aynı kaydın yanlışlıkla tekrar eklenmesini önlemek için' },
      { id: 'B', text: 'Excel sayfasındaki önceki satırları silmek için' },
      { id: 'C', text: 'Option Explicit hatasını kapatmak için' },
      { id: 'D', text: 'Formun arka plan rengini sıfırlamak için' }
    ],
    correctOption: 'A',
    explanation: 'Kayıt sonrası giriş kutularını boşaltmak veri doğruluğunu korur.'
  },
  {
    id: 'gp-w5-4', weekOrder: 5,
    prompt: 'Kullanıcı bir metin kutusundan başka bir alana geçtiğinde doğrulama yapmak için hangi olay tetiklenir?',
    options: [
      { id: 'A', text: 'Exit' },
      { id: 'B', text: 'Enter' },
      { id: 'C', text: 'Click' },
      { id: 'D', text: 'AddItem' }
    ],
    correctOption: 'A',
    explanation: 'Exit olayı kontrolden ayrılırken çalışır.'
  },
  {
    id: 'gp-w5-5', weekOrder: 5,
    prompt: 'Bir çalışma sayfası nesnesini değişkene atarken neden "Set ws = Worksheets(...)" kullanılır?',
    options: [
      { id: 'A', text: 'Worksheet bir nesne (Object) türüdür; nesne atamaları Set anahtar sözcüğü ile yapılır.' },
      { id: 'B', text: 'Sayfadaki tüm verileri silmek için.' },
      { id: 'C', text: 'Yalnızca sayısal değişkenlerde Set kullanılır.' },
      { id: 'D', text: 'MsgBox göstermek için.' }
    ],
    correctOption: 'A',
    explanation: 'VBA’da nesne referansları Set ile atanır.'
  },
  {
    id: 'gp-w5-6', weekOrder: 5,
    prompt: 'Cells(3, 2).Value ifadesi Excel sayfasında hangi hücreyi gösterir?',
    options: [
      { id: 'A', text: '3. satır, 2. sütun (B3)' },
      { id: 'B', text: '2. satır, 3. sütun (C2)' },
      { id: 'C', text: '3. satır, 3. sütun (C3)' },
      { id: 'D', text: '1. satır, 2. sütun (B1)' }
    ],
    correctOption: 'A',
    explanation: 'Cells(satır, sütun) sırasını izler: 3. satır, 2. sütun = B3.'
  },
  {
    id: 'gp-w5-7', weekOrder: 5,
    prompt: 'Klavyeden basılan her tuşu yakalamak için Excel VBA’da hangi olay kullanılır?',
    options: [
      { id: 'A', text: 'KeyPress' },
      { id: 'B', text: 'Click' },
      { id: 'C', text: 'Enter' },
      { id: 'D', text: 'Clear' }
    ],
    correctOption: 'A',
    explanation: 'KeyPress olayı klavye tuş girişini denetlemek için kullanılır.'
  },
  {
    id: 'gp-w5-8', weekOrder: 5,
    prompt: 'H5-E3 etkinliğindeki gösterge dikdörtgeninin (shpDurum) genişliğini 200 yapmak için ne yazılır?',
    options: [
      { id: 'A', text: 'shpDurum.Width = 200' },
      { id: 'B', text: 'shpDurum.Caption = 200' },
      { id: 'C', text: 'shpDurum.ListCount = 200' },
      { id: 'D', text: 'shpDurum.Font.Size = 200' }
    ],
    correctOption: 'A',
    explanation: 'Genişlik özelliği Width, yükseklik Height, arka plan BackColor’dır.'
  },
  {
    id: 'gp-w5-9', weekOrder: 5,
    prompt: 'Öğrenci Not Takip Mini Projesinde hatalı girdi geldiğinde hem sayfa kaydını hem ListBox eklemesini engellemek için en temiz yol nedir?',
    options: [
      { id: 'A', text: 'Kodun en başında doğrulama yapıp hatalıysa Exit Sub ile çıkmak' },
      { id: 'B', text: 'Önce sayfaya yazıp sonra silmek' },
      { id: 'C', text: 'Option Explicit’i silmek' },
      { id: 'D', text: 'ListBox’ı gizlemek' }
    ],
    correctOption: 'A',
    explanation: 'Erken doğrulama + Exit Sub kirli verinin kaydedilmesini önler.'
  },
  {
    id: 'gp-w5-10', weekOrder: 5,
    prompt: 'Excel’de çalışma zamanı hatalarını yakalamak için kullanılan "On Error GoTo" ifadesi eğitim simülatöründe nasıl ele alınır?',
    options: [
      { id: 'A', text: 'Desteklenmediği açıkça belirtilir; gerçek Excel görevi ve öğretmen gösterimi olarak işlenir.' },
      { id: 'B', text: 'Sessizce yok sayılıp başarılı gösterilir.' },
      { id: 'C', text: 'Otomatik olarak JavaScript eval ile çalıştırılır.' },
      { id: 'D', text: 'Sadece Hafta 1’de kullanılır.' }
    ],
    correctOption: 'A',
    explanation: 'Simülatör desteklemediği komutları sessizce geçmez, kullanıcıyı bilgilendirir.'
  }
];
