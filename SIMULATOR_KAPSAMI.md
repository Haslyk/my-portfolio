# VBA Eğitim Simülatörü Kapsamı (`SIMULATOR_KAPSAMI.md`)

Bu belge, **Görsel Programlama Atölyesi** içindeki tarayıcı + sunucu tabanlı **VBA Eğitim Simülatörü**nün desteklediği ve desteklemediği özellikleri açıklar.

> **Önemli İlke:** Simülatör tarayıcıda gerçek Excel VBA çalıştırdığını iddia etmez. Kullanıcı kodu hiçbir zaman `eval` veya `new Function` ile çalıştırılmaz; özel **Tokenizer → Parser → AST Yorumlayıcısı** üzerinden yürütülür ve tarayıcıda Web Worker içinde, sunucuda ise adım/zaman/döngü sınırlarıyla çalıştırılır.

---

## 1. Desteklenen VBA Söz Dizimi ve Özellikler

- **Genel:** Büyük/küçük harfe duyarsız tanımlayıcılar, `'` ile başlayan yorumlar, `Option Explicit`.
- **Değişkenler ve Sabitler:** `Dim ... As String / Long / Double / Boolean / Worksheet`, `Const`, `Set ws = Worksheets("...")`.
- **Operatörler:** `+`, `-`, `*`, `/`, `Mod`, `&` (metin birleştirme), `=`, `<>`, `<`, `>`, `<=`, `>=`, `And`, `Or`, `Not`.
- **Kontrol Yapıları:** Çok satırlı `If ... Then / ElseIf ... Then / Else / End If`, tek satırlı `If ... Then ...`, `Exit Sub`.
- **Döngüler:** `For ... = ... To ... [Step ...] / Next`, sınırlı `Do While ... / Loop`.
- **Yerleşik Fonksiyonlar:** `Trim`, `IsNumeric`, `CLng`, `CDbl`, `CStr`, `Len`, `UCase`, `LCase`, `Val`.
- **Çıktı:** `MsgBox`.
- **Bileşen Özellikleri:** `Caption`, `Value` (`Text`), `BackColor`, `ForeColor`, `Font.Size`, `Width`, `Height` (H5-E3 `shpDurum` göstergesi dahil).
- **Renk Sabitleri:** `vbRed`, `vbGreen`, `vbBlue`, `vbYellow`, `vbWhite`, `vbBlack`, `vbGray`.
- **ListBox:** `AddItem`, `RemoveItem` (0-tabanlı indeks), `Clear`, `ListIndex` (seçimsiz `-1`), `ListCount`, `List(idx)`.
- **Olaylar:** `Click`, `Enter`, `Exit` (klavye olayları ise H5-E1 içinde eğitim örneği olarak anlatılır).
- **Sanal Çalışma Sayfası:** `Cells(satır, sütun).Value`, `Worksheets("...")`, `ws.Rows.Count`, `ws.Cells(ws.Rows.Count, col).End(xlUp).Row`.

---

## 2. Güvenlik ve Kaynak Sınırları

- **Maksimum Adım:** 5.000 (sunucuda 4.000)
- **Maksimum Döngü Yinelemesi:** 1.000 (sunucuda 500)
- **Maksimum Çalışma Süresi:** 1.500 ms (Web Worker zaman aşımı 2.000 ms)
- **Maksimum MsgBox Çıktısı:** 200
- Ağ, dosya sistemi, işletim sistemi veya gerçek Excel dosyası erişimi yoktur.

---

## 3. Bilinçli Olarak Desteklenmeyen Özellikler

Aşağıdaki ifadeler simülatörde sessizce yok sayılmaz; ilgili satır numarasıyla birlikte *"Bu komut bu eğitim simülatöründe desteklenmiyor. Bu bölümü Excel VBA’da deneyebilirsin."* mesajı verilir:

- `On Error GoTo` / `Resume` (H5-E3 kapsamında öğretmen gösterimi ve gerçek Excel görevi olarak sunulur)
- `Select Case`, `With ... End With`, `Function`, `Class`, `ReDim`
- `CreateObject`, `GetObject`, `Shell`, `Open / Close / Print / Write` (dosya G/Ç)
- Genel `Shapes` nesne modeli (yalnızca H5-E3 içindeki önceden tanımlı `shpDurum` desteklenir)
- Gerçek `.xlsm` makro çalıştırma (Excel görevleri öğrenci beyanı kontrol listesi ve öğretmen doğrulaması ile yönetilir)
