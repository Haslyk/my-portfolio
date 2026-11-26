# Proje Haritası (`PROJECT_MAP.md`) — Görsel Programlama Atölyesi Entegrasyonu

Bu belge, **Görsel Programlama Atölyesi (Excel VBA)** dersinin mevcut Akademi sistemine nasıl entegre edildiğini özetler.

## Önemli Klasörler ve Dosyalar

- **Ders Katalogu & Ortak Yapı:**
  - `lib/akademi/shared/index.ts` — `gorsel-programlama` dersinin aktif katalog kaydı (`isReady: true`).
  - `lib/akademi/services/seedService.ts` — 5 hafta ve 25 etkinliğin (`H1-E1` .. `H5-E5`) veritabanına tohumlanması.
- **VBA Eğitim Simülatörü (`lib/akademi/gorsel-programlama/vbaSimulator/`):**
  - `tokenizer.ts` — VBA sözcük çözümleyici (büyük/küçük harf duyarsız).
  - `parser.ts` — Özyinelemeli iniş (recursive-descent) AST ayrıştırıcısı.
  - `interpreter.ts` — Sınırlı, güvenli AST yorumlayıcısı, yürütme izi (`trace`) ve AST kontrol yardımcıları.
  - `vbaWorker.ts` & `workerRunner.ts` — Tarayıcıyı kilitlemeyen Web Worker çalıştırıcısı.
- **Müfredat & Değerlendirme (`lib/akademi/gorsel-programlama/`):**
  - `types.ts` — Yapılandırılmış etkinlik, form, sanal sayfa ve test şemaları.
  - `curriculum/week1.ts` .. `week5.ts` — 5 hafta, 25 etkinlik (zorluk ve süre kademeleriyle).
  - `curriculum/index.ts` — `exportGpCurriculumToMarkdown` sunum dışa aktarıcısı.
  - `activityGraders.ts` — Sunucu tarafı doğrulama ve test değerlendiricisi.
- **API Uçları (`app/api/akademi/`):**
  - `weeks/route.ts` — `course=gorsel-programlama` hafta ve etkinlik listesi.
  - `activities/[activityId]/start/route.ts` — Etkinlik başlatma ve taslak yükleme.
  - `attempts/[attemptId]/check/route.ts` — Sunucu tarafında yeniden çalıştırılan doğrulama.
  - `admin/gp-review/route.ts` — Öğretmen Excel doğrulaması, geri bildirim ve yeniden deneme açma.
- **Arayüz Bileşenleri (`components/akademi/gorsel-programlama/` & `app/akademi/gorsel-programlama/`):**
  - `GpActivityWorkspace.tsx` — Masaüstünde 3 sütunlu, mobilde sekmeli çalışma alanı.
  - `VbaCodeEditor.tsx`, `UserFormPreview.tsx`, `VirtualSheetPreview.tsx`, `TraceViewerPanel.tsx`.
  - `widgets/` — `MatchingWidget`, `FormBuilderWidget`, `FillBlanksWidget`, `CodeOrderingWidget`, `OutputPredictionWidget`.
  - `app/akademi/gorsel-programlama/page.tsx` — Ders ana ekranı.
  - `app/akademi/gorsel-programlama/sunum/page.tsx` — Öğretmen Sunum Modu.
