import { ValidationFeedbackItem } from './types';

export interface GraderOutput {
  passed: boolean;
  summaryMessage: string;
  items: ValidationFeedbackItem[];
  preservedState: Record<string, unknown>;
}

function isObject(val: unknown): val is Record<string, any> {
  return typeof val === 'object' && val !== null && !Array.isArray(val);
}

/**
 * HAFTA 1 — W1-A1: Donanım mı, Yazılım mı?
 * Başarı anahtarı: Klavye, fare, monitör → Donanım. Diğer üçü → Yazılım.
 */
function gradeW1A1(state: Record<string, any>): GraderOutput {
  const placements = isObject(state.placements) ? state.placements : {};
  const expected: Record<string, { category: string; label: string; reason: string }> = {
    klavye: {
      category: 'donanim',
      label: 'Klavye',
      reason: 'Klavye elle tutulabilen fiziksel bir giriş parçasıdır (Donanım).',
    },
    fare: {
      category: 'donanim',
      label: 'Fare',
      reason: 'Fare fiziksel bir işaretleme parçasıdır (Donanım).',
    },
    monitor: {
      category: 'donanim',
      label: 'Monitör',
      reason: 'Monitör görüntüyü gösteren fiziksel bir ekrandır (Donanım).',
    },
    isletim_sistemi: {
      category: 'yazilim',
      label: 'İşletim Sistemi',
      reason: 'İşletim sistemi bilgisayar donanımını yöneten ana programdır (Yazılım).',
    },
    internet_tarayicisi: {
      category: 'yazilim',
      label: 'İnternet Tarayıcısı',
      reason: 'İnternet tarayıcısı web sayfalarını görüntüleyen bir programdır (Yazılım).',
    },
    kelime_islemci: {
      category: 'yazilim',
      label: 'Kelime İşlemci',
      reason: 'Kelime işlemci yazı ve belge hazırlamak için çalışan bir programdır (Yazılım).',
    },
  };

  const items: ValidationFeedbackItem[] = [];
  const preservedPlacements: Record<string, string> = {};
  let correctCount = 0;

  for (const [id, spec] of Object.entries(expected)) {
    const chosen = placements[id];
    if (chosen === spec.category) {
      correctCount++;
      preservedPlacements[id] = chosen;
      items.push({
        itemId: id,
        correct: true,
        message: `${spec.label}: Doğru yerleştirildi. ${spec.reason}`,
      });
    } else if (!chosen) {
      items.push({
        itemId: id,
        correct: false,
        message: `${spec.label} kartını henüz bir kutuya yerleştirmedin. Fiziksel parça mı yoksa program mı olduğunu düşünerek seç.`,
      });
    } else {
      preservedPlacements[id] = chosen;
      items.push({
        itemId: id,
        correct: false,
        message: `${spec.label} kartının kutusunu değiştir: ${spec.reason}`,
      });
    }
  }

  const passed = correctCount === 6;
  return {
    passed,
    summaryMessage: passed
      ? 'Tebrikler! 6/6 kartı Donanım ve Yazılım kutularına doğru yerleştirdin.'
      : `${correctCount}/6 kart doğru. Açıklamalara bakarak işaretli kartların kutusunu düzelt.`,
    items,
    preservedState: {
      ...state,
      placements: preservedPlacements,
    },
  };
}

/**
 * HAFTA 1 — W1-A2: Kasanın İçini Keşfet
 * Başarı: Dört bilgi kartı incelenmiş (inspectedParts) ve dört etiket doğru eşleştirilmiş (labels).
 */
function gradeW1A2(state: Record<string, any>): GraderOutput {
  const inspected: string[] = Array.isArray(state.inspectedParts) ? state.inspectedParts : [];
  const labels = isObject(state.labels) ? state.labels : {};
  const requiredParts: Record<string, { name: string; role: string }> = {
    anakart: { name: 'Anakart', role: 'Anakart parçaları bağlar.' },
    islemci: { name: 'İşlemci', role: 'İşlemci komutları işler.' },
    ram: { name: 'RAM', role: 'RAM o anki çalışma alanıdır.' },
    ssd: { name: 'SSD', role: 'SSD kaydedilen dosyaları saklar.' },
  };

  const items: ValidationFeedbackItem[] = [];
  let allInspected = true;
  let correctLabels = 0;

  for (const [partId, info] of Object.entries(requiredParts)) {
    const isInspected = inspected.includes(partId);
    if (!isInspected) {
      allInspected = false;
      items.push({
        itemId: `inspect_${partId}`,
        correct: false,
        message: `${info.name} alanına tıklayarak görev kartını henüz incelemedin.`,
      });
    }

    const assignedLabel = labels[partId];
    if (assignedLabel === partId) {
      correctLabels++;
      items.push({
        itemId: partId,
        correct: true,
        message: `${info.name}: Doğru etiketlendi (${info.role})`,
      });
    } else if (!assignedLabel) {
      items.push({
        itemId: partId,
        correct: false,
        message: `${info.name} bölgesi için henüz bir isim kartı yerleştirmedin.`,
      });
    } else {
      items.push({
        itemId: partId,
        correct: false,
        message: `Bu bölgedeki etiketi düzelt: ${info.role}`,
      });
    }
  }

  const passed = allInspected && correctLabels === 4;
  return {
    passed,
    summaryMessage: passed
      ? 'Harika! Dört temel parçanın görev kartlarını inceledin ve etiketlerini doğru yerleştirdin.'
      : !allInspected
      ? 'Önce kasa görselindeki dört parçanın tamamına tıklayıp görev kartlarını incelemeli, ardından dört etiketi doğru yerleştirmelisin.'
      : `${correctLabels}/4 etiket doğru. Görev açıklamalarına göre yanlış etiketleri düzelt.`,
    items,
    preservedState: state,
  };
}

/**
 * HAFTA DEĞERLENDİRMELERİ (W1-Q, W2-Q, W3-Q, W4-Q, W5-Q)
 */
const QUIZ_KEYS: Record<
  string,
  Record<string, { answer: 'A' | 'B' | 'C'; reason: string }>
> = {
  'W1-Q': {
    'W1-Q1': { answer: 'A', reason: 'Klavye fiziksel bir parçadır.' },
    'W1-Q2': { answer: 'B', reason: 'Anakart parçalar arasında bağlantı sağlar.' },
    'W1-Q3': { answer: 'C', reason: 'İşlemci komutları işler.' },
  },
  'W2-Q': {
    'W2-Q1': { answer: 'B', reason: 'RAM çalışan programlar için geçici çalışma alanıdır.' },
    'W2-Q2': { answer: 'C', reason: 'Dosya kalıcı depolamaya kaydedilmiştir.' },
    'W2-Q3': { answer: 'A', reason: 'Çentik ile yuva uyumlu olmalı; parça zorlanmaz.' },
  },
  'W3-Q': {
    'W3-Q1': { answer: 'B', reason: 'Güç kaynağı parçaların elektrik ihtiyacını karşılar.' },
    'W3-Q2': { answer: 'C', reason: 'Görüntü oluşturma ve gösterme farklı görevlerdir.' },
    'W3-Q3': { answer: 'A', reason: 'Çözünürlük görüntüyü oluşturan nokta sayısıyla ilgilidir.' },
  },
  'W4-Q': {
    'W4-Q1': { answer: 'A', reason: 'Sesi bilgisayara aktarır.' },
    'W4-Q2': { answer: 'B', reason: 'Dokunmayı alır ve görüntü gösterir.' },
    'W4-Q3': { answer: 'C', reason: 'Belgeyi sayısallaştırır.' },
  },
  'W5-Q': {
    'W5-Q1': { answer: 'B', reason: 'Ağ kartı kablolu veya kablosuz ağ bağlantısını sağlar.' },
    'W5-Q2': { answer: 'C', reason: 'Yerel kablosuz bağlantı ile internet erişimi farklıdır.' },
    'W5-Q3': { answer: 'A', reason: 'Bu örnekte cihazlara farklı adres verilmelidir.' },
  },
};

function gradeQuiz(code: string, state: Record<string, any>): GraderOutput {
  const keyMap = QUIZ_KEYS[code];
  const answers = isObject(state.answers) ? state.answers : {};
  const lockedCorrect = isObject(state.lockedCorrect) ? { ...state.lockedCorrect } : {};

  const items: ValidationFeedbackItem[] = [];
  const preservedAnswers: Record<string, string> = {};
  let correctCount = 0;

  for (const [qCode, spec] of Object.entries(keyMap)) {
    const studentChoice = lockedCorrect[qCode] ? spec.answer : answers[qCode];
    if (studentChoice === spec.answer) {
      correctCount++;
      preservedAnswers[qCode] = spec.answer;
      lockedCorrect[qCode] = true;
      items.push({
        itemId: qCode,
        correct: true,
        message: `Doğru! Gerekçe: ${spec.reason}`,
      });
    } else if (!studentChoice) {
      items.push({
        itemId: qCode,
        correct: false,
        message: 'Bu soru için bir seçenek işaretle.',
      });
    } else {
      preservedAnswers[qCode] = studentChoice;
      items.push({
        itemId: qCode,
        correct: false,
        message: `Seçimini gözden geçir: ${spec.reason}`,
      });
    }
  }

  const passed = correctCount === 3;
  return {
    passed,
    summaryMessage: passed
      ? '3/3 soruyu doğru yanıtladın. Hafta değerlendirmesi tamamlandı!'
      : `${correctCount}/3 soru doğru. Doğru cevapların korundu; açıklamaları okuyarak kalan soruları düzelt.`,
    items,
    preservedState: {
      ...state,
      answers: preservedAnswers,
      lockedCorrect,
    },
  };
}

/**
 * HAFTA 1 — W1-H: Hangi Bilgisayar Kime Uygun?
 */
function gradeW1H(state: Record<string, any>): GraderOutput {
  const selections = isObject(state.selections) ? state.selections : {};
  const expected: Record<string, { answer: string; reason: string }> = {
    s1: {
      answer: 'masaustu',
      reason: 'Sabit masada ayrı kasa ve monitör düzeni için baskın seçim Masaüstü bilgisayardır.',
    },
    s2: {
      answer: 'dizustu',
      reason: 'Her gün okula taşınan, yerleşik klavyeli ve bataryalı kullanım için Dizüstü uygundur.',
    },
    s3: {
      answer: 'tablet',
      reason: 'Hafif dokunmatik ekranda kalemle not alma senaryosunda baskın seçim Tablettir.',
    },
    s4: {
      answer: 'sunucu',
      reason: 'Çok sayıda kullanıcıya kesintisiz web hizmeti sunmak için Sunucu kullanılır.',
    },
  };

  return gradeScenarioMap(state, selections, expected, '4/4 kullanım senaryosunu doğru eşleştirdin. Ödev tamamlandı!');
}

/**
 * HAFTA 2 — W2-A1: RAM mi, Depolama mı?
 */
function gradeW2A1(state: Record<string, any>): GraderOutput {
  const placements = isObject(state.placements) ? state.placements : {};
  const expected: Record<string, { category: string; reason: string }> = {
    acik_program: {
      category: 'ram',
      reason: 'Açık programın o anda kullandığı çalışma alanı geçici ve hızlı bellek olan RAM’dir.',
    },
    elektrik_kesilince: {
      category: 'ram',
      reason: 'Elektrik kesilince korunmayan geçici çalışma içeriği RAM’de tutulur.',
    },
    kaydedilmis_fotograflar: {
      category: 'depolama',
      reason: 'Kaydedilmiş fotoğraflar bilgisayar kapansa da silinmemesi için kalıcı Depolama’da (SSD/HDD) durur.',
    },
    kapatip_acinca_belge: {
      category: 'depolama',
      reason: 'Bilgisayarı kapatıp açınca duran kaydedilmiş belge kalıcı Depolama’da saklanır.',
    },
  };

  const items: ValidationFeedbackItem[] = [];
  let correctCount = 0;

  for (const [id, spec] of Object.entries(expected)) {
    const chosen = placements[id];
    if (chosen === spec.category) {
      correctCount++;
      items.push({ itemId: id, correct: true, message: `Doğru! ${spec.reason}` });
    } else if (!chosen) {
      items.push({ itemId: id, correct: false, message: 'Bu durum kartı için RAM veya Depolama seç.' });
    } else {
      items.push({ itemId: id, correct: false, message: `Seçimi düzelt: ${spec.reason}` });
    }
  }

  const passed = correctCount === 4;
  return {
    passed,
    summaryMessage: passed
      ? '4/4 durumu doğru ayırdın! Geçici çalışma alanı (RAM) ile kalıcı depolama farkı tamam.'
      : `${correctCount}/4 durum doğru. Gerekçeleri okuyarak yanlış seçimleri düzelt.`,
    items,
    preservedState: state,
  };
}

/**
 * HAFTA 2 — W2-A2: RAM’i Güvenle Sök ve Tak
 * Backend durum makinesi:
 * güç kapalı + fiş çekili → mandallar açık → RAM çıkarılmış → doğru yön → yerleştirilmiş → mandallar kapalı
 */
export interface RamMachineState {
  powerOff: boolean;
  unplugged: boolean;
  leftLatchOpen: boolean;
  rightLatchOpen: boolean;
  ramRemoved: boolean;
  notchAligned: boolean;
  ramInserted: boolean;
  latchesClosedAfterInsert: boolean;
  stepLog: string[];
}

export function validateAndApplyRamState(prevState: Record<string, any>, nextState: Record<string, any>): {
  valid: boolean;
  errorMessage?: string;
  sanitizedState: Record<string, any>;
} {
  // Check step transitions to ensure no illegal shortcut was taken
  const powerOff = Boolean(nextState.powerOff);
  const unplugged = Boolean(nextState.unplugged);
  const leftLatchOpen = Boolean(nextState.leftLatchOpen);
  const rightLatchOpen = Boolean(nextState.rightLatchOpen);
  const ramRemoved = Boolean(nextState.ramRemoved);
  const notchAligned = Boolean(nextState.notchAligned);
  const ramInserted = Boolean(nextState.ramInserted);
  const latchesClosedAfterInsert = Boolean(nextState.latchesClosedAfterInsert);
  const stepLog: string[] = Array.isArray(nextState.stepLog)
    ? nextState.stepLog.filter((s: unknown) => typeof s === 'string').slice(0, 50)
    : [];

  // Rule 1: Cannot open latches or remove RAM while power is on or cable is plugged
  if ((ramRemoved || ramInserted || latchesClosedAfterInsert) && (!powerOff || !unplugged)) {
    return {
      valid: false,
      errorMessage: 'Güvenlik Uyarısı: Gücü kapatmadan ve elektrik fişini çekmeden RAM sökülemez veya takılamaz.',
      sanitizedState: prevState,
    };
  }

  // Rule 2: Cannot remove RAM before both latches are opened (or before having opened them in log)
  if (ramRemoved && !ramInserted && (!leftLatchOpen || !rightLatchOpen)) {
    return {
      valid: false,
      errorMessage: 'RAM’i çıkarmadan önce yuvanın iki yanındaki mandalları açmalısın.',
      sanitizedState: prevState,
    };
  }

  // Rule 3: Cannot insert RAM if it was not removed or if notch is reversed
  if (ramInserted && (!ramRemoved || !notchAligned)) {
    return {
      valid: false,
      errorMessage: !ramRemoved
        ? 'Önce mevcut RAM’i güvenli adımlarla çıkarmalısın.'
        : 'Çentik yönü yuvayla uyumlu değil! Parçayı zorlama; önce Yönü Çevir düğmesiyle çentiği hizala.',
      sanitizedState: prevState,
    };
  }

  // Rule 4: Latches closed after insert requires ramInserted
  if (latchesClosedAfterInsert && !ramInserted) {
    return {
      valid: false,
      errorMessage: 'Mandalları kapatmadan önce RAM’i doğru yönde yuvaya yerleştirmelisin.',
      sanitizedState: prevState,
    };
  }

  return {
    valid: true,
    sanitizedState: {
      ...nextState,
      powerOff,
      unplugged,
      leftLatchOpen,
      rightLatchOpen,
      ramRemoved,
      notchAligned,
      ramInserted,
      latchesClosedAfterInsert,
      stepLog,
    },
  };
}

function gradeW2A2(state: Record<string, any>): GraderOutput {
  const stepLog: string[] = Array.isArray(state.stepLog) ? state.stepLog : [];

  const requiredSequence = [
    'POWER_OFF',
    'UNPLUG',
    'LATCHES_OPEN',
    'REMOVE_RAM',
    'ALIGN_NOTCH',
    'INSERT_RAM',
    'CLOSE_LATCHES',
  ];

  // Verify chronological order in stepLog so simply sending final booleans cannot bypass the sequence
  let seqIdx = 0;
  for (const entry of stepLog) {
    if (entry === requiredSequence[seqIdx]) {
      seqIdx++;
    } else if (
      // Allow POWER_OFF and UNPLUG in either order before LATCHES_OPEN
      seqIdx === 0 &&
      entry === 'UNPLUG' &&
      stepLog.includes('POWER_OFF') &&
      stepLog.indexOf('POWER_OFF') < stepLog.indexOf('LATCHES_OPEN')
    ) {
      // handled below via explicit index check
    }
  }

  const idxPower = stepLog.indexOf('POWER_OFF');
  const idxUnplug = stepLog.indexOf('UNPLUG');
  const idxLatchesOpen = stepLog.indexOf('LATCHES_OPEN');
  const idxRemove = stepLog.lastIndexOf('REMOVE_RAM');
  const idxAlign = stepLog.lastIndexOf('ALIGN_NOTCH');
  const idxInsert = stepLog.lastIndexOf('INSERT_RAM');
  const idxClose = stepLog.lastIndexOf('CLOSE_LATCHES');

  const energySafe = Boolean(state.powerOff && state.unplugged) && idxPower !== -1 && idxUnplug !== -1;
  const openedAfterEnergy =
    energySafe && idxLatchesOpen > idxPower && idxLatchesOpen > idxUnplug;
  const removedSafely =
    openedAfterEnergy && Boolean(state.ramRemoved) && idxRemove > idxLatchesOpen;
  const alignedProperly =
    removedSafely && Boolean(state.notchAligned) && idxAlign > idxRemove;
  const insertedProperly =
    alignedProperly && Boolean(state.ramInserted) && idxInsert > idxAlign;
  const closedProperly =
    insertedProperly &&
    Boolean(state.latchesClosedAfterInsert) &&
    !state.leftLatchOpen &&
    !state.rightLatchOpen &&
    idxClose > idxInsert;

  const items: ValidationFeedbackItem[] = [
    {
      itemId: 'step_energy',
      correct: energySafe,
      message: energySafe
        ? '1. Enerji kesildi: Güç kapatıldı ve fiş çekildi.'
        : '1. Önce Gücü Kapat ve Fişi Çek düğmelerine basarak elektriği tamamen kesmelisin.',
    },
    {
      itemId: 'step_open_latches',
      correct: openedAfterEnergy,
      message: openedAfterEnergy
        ? '2. İki mandal enerji kesildikten sonra açıldı.'
        : '2. Enerjiyi kestikten sonra yuvanın iki yanındaki mandala tıklayarak açmalısın.',
    },
    {
      itemId: 'step_remove_ram',
      correct: removedSafely,
      message: removedSafely
        ? '3. RAM mandallar açıkken güvenle çıkarıldı.'
        : '3. Mandalları açtıktan sonra RAM’i seçip Çıkar düğmesine basmalısın.',
    },
    {
      itemId: 'step_align_notch',
      correct: alignedProperly,
      message: alignedProperly
        ? '4. Çentik yönü incelendi ve yuvayla hizalandı.'
        : '4. RAM çentiğini yuvadaki çıkıntıyla hizalamak için Yönü Çevir düğmesine basmalısın.',
    },
    {
      itemId: 'step_insert_close',
      correct: closedProperly,
      message: closedProperly
        ? '5. RAM doğru yönde yerleştirildi ve mandallar kapatıldı.'
        : '5. RAM’i ve yuvayı seçip Yerleştir’e basmalı, ardından mandalları kapatmalısın.',
    },
  ];

  const passed = closedProperly;
  return {
    passed,
    summaryMessage: passed
      ? 'Tebrikler! Enerjiyi kesme, mandalları açma, çıkarma, çentiği hizalama, yerleştirme ve mandalları kapatma adımlarını güvenli sırayla tamamladın.'
      : 'Bazı güvenlik veya montaj adımları eksik. Aşağıdaki adım listesinden sıradaki işlemi uygula.',
    items,
    preservedState: state,
  };
}

/**
 * HAFTA 2 — W2-H: Depolama Aygıtlarını Tanıyorum
 */
function gradeW2H(state: Record<string, any>): GraderOutput {
  const selections = isObject(state.selections) ? state.selections : {};
  const expected: Record<string, { answer: string; reason: string }> = {
    d1: {
      answer: 'hdd',
      reason: 'İçinde dönen manyetik plakalar bulunan depolama birimi HDD’dir (Sabit Disk).',
    },
    d2: {
      answer: 'ssd',
      reason: 'İçinde hareketli mekanik parça bulunmayan hızlı elektronik depolama birimi SSD’dir.',
    },
    d3: {
      answer: 'usb_bellek',
      reason: 'USB portuna doğrudan takılan küçük taşınabilir depolama aygıtı USB bellektir.',
    },
    d4: {
      answer: 'hafiza_karti',
      reason: 'Fotoğraf makinesi, kamera ve telefon gibi cihazlarda kullanılan küçük kart Hafıza kartıdır.',
    },
    d5: {
      answer: 'cd_dvd',
      reason: 'Optik sürücüdeki lazer ile okunan yuvarlak disk CD/DVD’dir.',
    },
  };

  return gradeScenarioMap(state, selections, expected, '5/5 depolama aygıtını doğru eşleştirdin. Ödev tamamlandı!');
}

/**
 * HAFTA 3 — W3-A1: Hava Yolunu Aç
 */
function gradeW3A1(state: Record<string, any>): GraderOutput {
  const airflowShown = Boolean(state.airflowShown);
  const laptopMovedToHardSurface = Boolean(state.laptopMovedToHardSurface);
  const caseObstacleRemoved = Boolean(state.caseObstacleRemoved);
  const fanAnswer = state.fanQuestionAnswer;

  const items: ValidationFeedbackItem[] = [
    {
      itemId: 'airflow_shown',
      correct: airflowShown,
      message: airflowShown
        ? 'Hava akışı okları incelendi.'
        : 'Önce "Hava Akışını Göster" düğmesine basarak hava akış oklarını incele.',
    },
    {
      itemId: 'laptop_surface',
      correct: laptopMovedToHardSurface,
      message: laptopMovedToHardSurface
        ? 'Dizüstü bilgisayar yatak üzerinden sert zemine taşındı; alt hava kanalları açıldı.'
        : 'Yatak üzerindeki dizüstünü seçip "Sert Zemine Taşı" düğmesine bas.',
    },
    {
      itemId: 'case_obstacle',
      correct: caseObstacleRemoved,
      message: caseObstacleRemoved
        ? 'Kasa önündeki hava girişini kapatan engel kaldırıldı.'
        : 'Kasadaki hava girişini kapatan nesneyi seçip "Engeli Kaldır" düğmesine bas.',
    },
    {
      itemId: 'fan_question',
      correct: fanAnswer === 'hava_dolasimina_yardim',
      message:
        fanAnswer === 'hava_dolasimina_yardim'
          ? 'Doğru! Fanın görevi kasa içindeki hava dolaşımına yardım etmektir.'
          : '“Fanın görevi nedir?” sorusunda “Hava dolaşımına yardım etmek” seçeneğini işaretle.',
    },
  ];

  const passed =
    airflowShown &&
    laptopMovedToHardSurface &&
    caseObstacleRemoved &&
    fanAnswer === 'hava_dolasimina_yardim';

  return {
    passed,
    summaryMessage: passed
      ? 'Harika! İki hava akışı engelini giderdin ve fanın görevini doğru yanıtladın.'
      : 'Hava akışını açmak için eksik kalan adımları aşağıdan kontrol ederek tamamla.',
    items,
    preservedState: state,
  };
}

/**
 * HAFTA 3 — W3-A2: Görüntü Yok: Nereden Başlarım?
 */
function gradeW3A2(state: Record<string, any>): GraderOutput {
  const powerChecked = Boolean(state.powerChecked);
  const cableChecked = Boolean(state.cableChecked);
  const selectedInput = state.selectedInput;
  const creatorChoice = state.creatorChoice;
  const displayerChoice = state.displayerChoice;

  const items: ValidationFeedbackItem[] = [
    {
      itemId: 'power_check',
      correct: powerChecked,
      message: powerChecked
        ? 'Monitör gücü kontrol edildi (Açık).'
        : '“Monitörün Gücünü Kontrol Et” düğmesine bas.',
    },
    {
      itemId: 'cable_check',
      correct: cableChecked,
      message: cableChecked
        ? 'Görüntü kablosu kontrol edildi (HDMI takılı).'
        : '“Kabloyu Kontrol Et” düğmesine basarak hangi kablonun takılı olduğuna bak.',
    },
    {
      itemId: 'input_source',
      correct: selectedInput === 'HDMI',
      message:
        selectedInput === 'HDMI'
          ? 'Giriş Kaynağı menüsünden HDMI seçildi ve görüntü geldi.'
          : 'Monitörde HDMI kablosu takılı olduğu için Giriş Kaynağı menüsünü açıp HDMI’ı seç.',
    },
    {
      itemId: 'role_creator',
      correct: creatorChoice === 'grafik_birimi',
      message:
        creatorChoice === 'grafik_birimi'
          ? 'Doğru: Görüntüyü oluşturan parça Grafik birimidir.'
          : '“Görüntüyü oluşturan” için Grafik birimi seçmelisin.',
    },
    {
      itemId: 'role_displayer',
      correct: displayerChoice === 'monitor',
      message:
        displayerChoice === 'monitor'
          ? 'Doğru: Oluşturulan görüntüyü gösteren birim Monitördür.'
          : '“Görüntüyü gösteren” için Monitör seçmelisin.',
    },
  ];

  const passed =
    powerChecked &&
    cableChecked &&
    selectedInput === 'HDMI' &&
    creatorChoice === 'grafik_birimi' &&
    displayerChoice === 'monitor';

  return {
    passed,
    summaryMessage: passed
      ? 'Tebrikler! Güç ve kablo kontrolünü yaptın, doğru giriş kaynağını (HDMI) seçtin ve görevleri doğru eşleştirdin.'
      : 'Bazı kontrol veya eşleştirme adımları eksik. Açıklamalara göre eksikleri tamamla.',
    items,
    preservedState: state,
  };
}

/**
 * HAFTA 3 — W3-H: Ekran Etiketini Anlıyorum
 */
function gradeW3H(state: Record<string, any>): GraderOutput {
  const selections = isObject(state.selections) ? state.selections : {};
  const expected: Record<string, { answer: string; reason: string }> = {
    label_24inc: {
      answer: 'ekran_boyutu',
      reason: '24 inç ifadesi ekranın köşeden köşeye fiziksel boyutunu (Ekran boyutu) gösterir.',
    },
    label_1920x1080: {
      answer: 'cozunurluk',
      reason: '1920 × 1080 ifadesi yatay ve dikey piksel sayısını (Çözünürlük) gösterir.',
    },
    label_75hz: {
      answer: 'yenileme_hizi',
      reason: '75 Hz ifadesi ekran görüntüsünün saniyedeki yenilenme sayısını (Yenileme hızı) gösterir.',
    },
    bigger_sharper: {
      answer: 'hayir',
      reason: 'Hayır; ekran büyüdüğünde çözünürlük aynı kalırsa pikseller daha geniş alana yayılır, bu yüzden büyük ekran her zaman daha net demek değildir.',
    },
  };

  return gradeScenarioMap(state, selections, expected, 'Ekran etiketindeki tüm bilgileri ve kontrol sorusunu doğru yanıtladın!');
}

/**
 * HAFTA 4 — W4-A1: Bilgi İçeri mi, Dışarı mı?
 */
function gradeW4A1(state: Record<string, any>): GraderOutput {
  const placements = isObject(state.placements) ? state.placements : {};
  const expected: Record<string, { category: string; label: string; reason: string }> = {
    klavye: {
      category: 'giris',
      label: 'Klavye',
      reason: 'Klavye bastığımız tuş bilgilerini bilgisayara gönderdiği için Giriş birimidir.',
    },
    mikrofon: {
      category: 'giris',
      label: 'Mikrofon',
      reason: 'Mikrofon dışarıdaki sesi bilgisayara aktardığı için Giriş birimidir.',
    },
    monitor: {
      category: 'cikis',
      label: 'Monitör',
      reason: 'Monitör bilgisayarda oluşan görüntüyü dışarıya gösterdiği için Çıkış birimidir.',
    },
    hoparlor: {
      category: 'cikis',
      label: 'Hoparlör',
      reason: 'Hoparlör bilgisayardaki sesi dışarıya verdiği için Çıkış birimidir.',
    },
    dokunmatik_ekran: {
      category: 'ikisi_de',
      label: 'Dokunmatik Ekran',
      reason: 'Dokunmatik ekran hem görüntüyü gösterir (Çıkış) hem de parmak dokunuşunu algılar (Giriş); bu yüzden İkisi de grubundadır.',
    },
  };

  const items: ValidationFeedbackItem[] = [];
  let correctCount = 0;

  for (const [id, spec] of Object.entries(expected)) {
    const chosen = placements[id];
    if (chosen === spec.category) {
      correctCount++;
      items.push({ itemId: id, correct: true, message: `${spec.label}: Doğru! ${spec.reason}` });
    } else if (!chosen) {
      items.push({ itemId: id, correct: false, message: `${spec.label} kartını Giriş, Çıkış veya İkisi de kutusuna yerleştir.` });
    } else {
      items.push({ itemId: id, correct: false, message: `${spec.label} seçimini düzelt: ${spec.reason}` });
    }
  }

  const passed = correctCount === 5;
  return {
    passed,
    summaryMessage: passed
      ? '5/5 cihazı bilginin akış yönüne göre doğru sınıflandırdın!'
      : `${correctCount}/5 cihaz doğru. Bilgi akışı açıklamalarını okuyarak yanlış kutudaki kartları düzelt.`,
    items,
    preservedState: state,
  };
}

/**
 * HAFTA 4 — W4-A2: Doğru Kabloyu Bul
 * Dört doğru bağlantı ve fazladan yanlış bağlantı olmaması, aynı port veya kablonun iki kez kullanılmaması.
 */
function gradeW4A2(state: Record<string, any>): GraderOutput {
  const rawConnections: Array<{ from: string; to: string }> = Array.isArray(state.connections)
    ? state.connections
    : [];

  const expectedPairs: Record<string, { port: string; label: string; reason: string }> = {
    cable_usb_a: {
      port: 'port_usb_a',
      label: 'USB-A klavye fişi → USB-A Portu',
      reason: 'USB-A klavye fişi düz dikdörtgen yapısıyla USB-A portuna takılır.',
    },
    cable_hdmi: {
      port: 'port_hdmi',
      label: 'HDMI monitör kablosu → HDMI Portu',
      reason: 'HDMI monitör kablosu görüntü aktarımı için HDMI portuna takılır.',
    },
    cable_rj45: {
      port: 'port_rj45',
      label: 'RJ45 ağ kablosu → Ağ Portu (RJ45)',
      reason: 'Mandallı RJ45 ağ kablosu kablolu ağ portuna takılır.',
    },
    cable_jack35: {
      port: 'port_jack35',
      label: '3,5 mm kulaklık fişi → Kulaklık Çıkışı (3,5 mm)',
      reason: 'Yuvarlak 3,5 mm ses fişi kulaklık çıkış yuvasına takılır.',
    },
  };

  const items: ValidationFeedbackItem[] = [];
  const usedCables = new Map<string, number>();
  const usedPorts = new Map<string, number>();

  for (const conn of rawConnections) {
    if (!conn || typeof conn.from !== 'string' || typeof conn.to !== 'string') continue;
    usedCables.set(conn.from, (usedCables.get(conn.from) || 0) + 1);
    usedPorts.set(conn.to, (usedPorts.get(conn.to) || 0) + 1);
  }

  let correctCount = 0;
  let hasExtraOrDuplicate = false;

  for (const [cableId, spec] of Object.entries(expectedPairs)) {
    const matches = rawConnections.filter((c) => c.from === cableId);
    if (matches.length === 1 && matches[0].to === spec.port && (usedPorts.get(spec.port) || 0) === 1) {
      correctCount++;
      items.push({
        itemId: cableId,
        correct: true,
        message: `Doğru bağlantı: ${spec.label}. ${spec.reason}`,
      });
    } else if (matches.length === 0) {
      items.push({
        itemId: cableId,
        correct: false,
        message: `Bu kablo ucu henüz bağlanmadı: ${spec.reason}`,
      });
    } else if (matches.length > 1) {
      hasExtraOrDuplicate = true;
      items.push({
        itemId: cableId,
        correct: false,
        message: `Bir kablo ucundan birden fazla bağlantı çizilmiş. Yanlış çizgiyi seçip "Bağlantıyı Sil" ile kaldır.`,
      });
    } else {
      hasExtraOrDuplicate = true;
      items.push({
        itemId: cableId,
        correct: false,
        message: `Yanlış port seçildi veya aynı porta birden çok kablo takıldı. Çizgiyi seçip "Bağlantıyı Sil" ile kaldır: ${spec.reason}`,
      });
    }
  }

  if (rawConnections.length > 4) {
    hasExtraOrDuplicate = true;
  }

  const passed = correctCount === 4 && rawConnections.length === 4 && !hasExtraOrDuplicate;
  return {
    passed,
    summaryMessage: passed
      ? '4/4 kabloyu doğru portlara fazladan yanlış çizgi olmadan bağladın!'
      : 'Bazı kablo bağlantıları eksik, yanlış porta takılı veya fazladan çizgi var. Yanlış çizgiye tıklayıp "Bağlantıyı Sil" ile düzeltebilirsin.',
    items,
    preservedState: state,
  };
}

/**
 * HAFTA 4 — W4-H: Hangi Cihaz İşimi Görür?
 */
function gradeW4H(state: Record<string, any>): GraderOutput {
  const selections = isObject(state.selections) ? state.selections : {};
  const expected: Record<string, { answer: string; reason: string }> = {
    j1: {
      answer: 'yazici',
      reason: 'Bilgisayardaki belgeyi kağıda dökmek için Yazıcı kullanılır.',
    },
    j2: {
      answer: 'tarayici',
      reason: 'Kağıttaki fotoğraf veya belgeyi bilgisayara dijital olarak aktarmak için Tarayıcı kullanılır.',
    },
    j3: {
      answer: 'cizici',
      reason: 'Büyük boy mimari/mühendislik teknik çizim çıktıları almak için Çizici (Plotter) kullanılır.',
    },
    j4: {
      answer: '3d_yazici',
      reason: 'Dijital tasarımdan katman katman küçük fiziksel model üretmek için 3D Yazıcı kullanılır.',
    },
  };

  return gradeScenarioMap(state, selections, expected, '4/4 iş kartını doğru çıkış/giriş cihazıyla eşleştirdin!');
}

/**
 * HAFTA 5 — W5-A1: İki Bilgisayarı Bağla ve Adres Ver
 * Başarı: PC1=192.168.1.10, PC2=192.168.1.11; iki ayrı switch portuna doğru kablolu bağlantı,
 * yanlış fazladan kenar yok, aynı port iki kez kullanılmamış, .0 ve .255 reddedilir.
 */
function isValidHostIpIn1921681Slash24(ip: unknown): ip is string {
  if (typeof ip !== 'string') return false;
  const match = /^192\.168\.1\.(\d{1,3})$/.exec(ip.trim());
  if (!match) return false;
  const hostOctet = Number(match[1]);
  // .0 network address and .255 broadcast address are not valid host addresses in /24
  return Number.isInteger(hostOctet) && hostOctet >= 1 && hostOctet <= 254;
}

function normalizeEndpointPair(a: string, b: string): [string, string] {
  return a < b ? [a, b] : [b, a];
}

function gradeW5A1(state: Record<string, any>): GraderOutput {
  const rawConnections: Array<{ from: string; to: string; type?: string }> = Array.isArray(state.connections)
    ? state.connections
    : [];
  const pc1Ip = state.pc1Ip;
  const pc2Ip = state.pc2Ip;

  const validDevicePorts = new Set(['pc1_eth0', 'pc2_eth0']);
  const validSwitchPorts = new Set(['sw_port1', 'sw_port2']);

  const portUsage = new Map<string, number>();
  let pc1ConnectedPort: string | null = null;
  let pc2ConnectedPort: string | null = null;
  let invalidOrExtraEdges = 0;
  let wrongCableType = false;

  for (const edge of rawConnections) {
    if (!edge || typeof edge.from !== 'string' || typeof edge.to !== 'string') {
      invalidOrExtraEdges++;
      continue;
    }
    if (edge.from === edge.to) {
      invalidOrExtraEdges++;
      continue;
    }
    if (edge.type && edge.type !== 'wired') {
      wrongCableType = true;
    }

    portUsage.set(edge.from, (portUsage.get(edge.from) || 0) + 1);
    portUsage.set(edge.to, (portUsage.get(edge.to) || 0) + 1);

    const [pA, pB] = normalizeEndpointPair(edge.from, edge.to);
    // Check if one endpoint is PC1/PC2 and the other is a switch port
    const devPort = validDevicePorts.has(pA) ? pA : validDevicePorts.has(pB) ? pB : null;
    const swPort = validSwitchPorts.has(pA) ? pA : validSwitchPorts.has(pB) ? pB : null;

    if (!devPort || !swPort) {
      // Direct PC1-PC2 without switch or switch-to-switch edge
      invalidOrExtraEdges++;
      continue;
    }

    if (devPort === 'pc1_eth0') {
      pc1ConnectedPort = swPort;
    } else if (devPort === 'pc2_eth0') {
      pc2ConnectedPort = swPort;
    }
  }

  const anyPortReused = Array.from(portUsage.values()).some((count) => count > 1);
  const separateSwitchPorts =
    pc1ConnectedPort !== null &&
    pc2ConnectedPort !== null &&
    pc1ConnectedPort !== pc2ConnectedPort;

  const cablesOk =
    rawConnections.length === 2 &&
    invalidOrExtraEdges === 0 &&
    !wrongCableType &&
    !anyPortReused &&
    separateSwitchPorts;

  const pc1IpValid = isValidHostIpIn1921681Slash24(pc1Ip) && pc1Ip === '192.168.1.10';
  const pc2IpValidHost = isValidHostIpIn1921681Slash24(pc2Ip);
  const ipConflict = Boolean(pc1Ip && pc2Ip && pc1Ip === pc2Ip);
  const pc2IpCorrect = pc2IpValidHost && !ipConflict && pc2Ip === '192.168.1.11';

  const items: ValidationFeedbackItem[] = [
    {
      itemId: 'cable_pc1',
      correct: pc1ConnectedPort !== null && (portUsage.get('pc1_eth0') || 0) === 1,
      message:
        pc1ConnectedPort !== null && (portUsage.get('pc1_eth0') || 0) === 1
          ? `PC1 ağ portu switch üzerindeki ${pc1ConnectedPort === 'sw_port1' ? '1. porta' : '2. porta'} kabloyla bağlandı.`
          : 'PC1’in ağ portunu seçip switch üzerindeki boş bir porta bağla.',
    },
    {
      itemId: 'cable_pc2',
      correct:
        pc2ConnectedPort !== null &&
        (portUsage.get('pc2_eth0') || 0) === 1 &&
        separateSwitchPorts,
      message:
        pc2ConnectedPort !== null &&
        (portUsage.get('pc2_eth0') || 0) === 1 &&
        separateSwitchPorts
          ? `PC2 ağ portu switch üzerindeki diğer porta (${pc2ConnectedPort === 'sw_port2' ? '2. port' : '1. port'}) kabloyla bağlandı.`
          : anyPortReused
          ? 'Aynı switch portuna iki kablo takılamaz. Yanlış bağlantıyı seçip "Bağlantıyı Sil" ile kaldır ve ayrı port kullan.'
          : 'PC2’nin ağ portunu switch üzerindeki diğer boş porta bağla.',
    },
    {
      itemId: 'no_extra_edges',
      correct: invalidOrExtraEdges === 0 && !wrongCableType && rawConnections.length <= 2,
      message:
        invalidOrExtraEdges === 0 && !wrongCableType && rawConnections.length <= 2
          ? 'Bağlantı şemasında fazladan veya geçersiz kenar yok.'
          : wrongCableType
          ? 'Bu etkinlikte switch bağlantıları kablolu (düz çizgi) olmalıdır.'
          : 'Şemada fazladan veya doğrudan PC1-PC2 arası yanlış bağlantı var. Çizgiyi seçip "Bağlantıyı Sil" ile kaldır.',
    },
    {
      itemId: 'ip_addresses',
      correct: pc1IpValid && pc2IpCorrect,
      message:
        pc1IpValid && pc2IpCorrect
          ? 'IP adresleri doğru ve benzersiz: PC1 = 192.168.1.10, PC2 = 192.168.1.11 (255.255.255.0 maskeli yerel ağ örneğinde çakışma yok).'
          : ipConflict
          ? 'Adres çakışması! Aynı yerel ağda iki bilgisayara aynı IP (192.168.1.10) verilemez. PC2 için 192.168.1.11 seç.'
          : !pc2IpValidHost && typeof pc2Ip === 'string' && (pc2Ip.endsWith('.0') || pc2Ip.endsWith('.255'))
          ? '255.255.255.0 (/24) ağında .0 ağ adresidir, .255 ise broadcast adresidir; cihazlara verilemez.'
          : 'PC1 için 192.168.1.10, PC2 için ise farklı olan 192.168.1.11 adresini seç.',
    },
  ];

  const passed = cablesOk && pc1IpValid && pc2IpCorrect;
  return {
    passed,
    summaryMessage: passed
      ? 'Tebrikler! İki bilgisayarı switch üzerinden ayrı portlara bağladın ve çakışmayan IP adresleri (192.168.1.10 ve 192.168.1.11) verdin.'
      : 'Bağlantı kablolarını veya IP adresi seçimlerini aşağıdaki açıklamalara göre düzelt.',
    items,
    preservedState: state,
  };
}

/**
 * HAFTA 5 — W5-A2: İhtiyaca Uygun Cihazı Seç
 */
function gradeW5A2(state: Record<string, any>): GraderOutput {
  const selections = isObject(state.selections) ? state.selections : {};
  const expected: Record<string, { answer: string; reason: string }> = {
    u1: {
      answer: 'tablet',
      reason: 'Hafif cihazda dokunarak veya kalemle not alma senaryosuna en uygun seçim Tablettir.',
    },
    u2: {
      answer: 'oyun_konsolu',
      reason: 'Televizyona bağlanıp oyun koluyla konsol oyunları oynamak için Oyun konsolu seçilir.',
    },
    u3: {
      answer: 'vr_basligi',
      reason: 'Baş hareketleriyle sanal ortamı çevreye bakarak deneyimlemek için VR başlığı kullanılır.',
    },
    u4: {
      answer: 'yeterli_ram',
      reason: 'RAM yetersizliği tespit edilmiş bilgisayarda çoklu program çalıştırmak için Yeterli RAM yükseltmesi seçilmelidir; büyük monitör çalışma belleğini artırmaz.',
    },
  };

  return gradeScenarioMap(state, selections, expected, '4/4 kullanıcı senaryosuna en uygun cihaz ve yükseltmeyi seçtin!');
}

/**
 * HAFTA 5 — W5-H: Bilgisayarımı Tanıyorum
 * Altı görev eşleştirmesi ve üç senaryo doğru.
 */
function gradeW5H(state: Record<string, any>): GraderOutput {
  const partRoles = isObject(state.partRoles) ? state.partRoles : {};
  const scenarios = isObject(state.scenarios) ? state.scenarios : {};

  const expectedParts: Record<string, { answer: string; label: string; reason: string }> = {
    anakart: {
      answer: 'parcalari_baglar',
      label: 'Anakart',
      reason: 'Anakart donanım parçalarını birbirine bağlar.',
    },
    islemci: {
      answer: 'komut_isler',
      label: 'İşlemci',
      reason: 'İşlemci program komutlarını işler.',
    },
    ram: {
      answer: 'calisma_alani',
      label: 'RAM',
      reason: 'RAM açık programlar için o anki geçici çalışma alanıdır.',
    },
    ssd: {
      answer: 'dosya_saklar',
      label: 'SSD',
      reason: 'SSD dosyaları kalıcı olarak saklar.',
    },
    grafik_birimi: {
      answer: 'goruntu_olusturur',
      label: 'Grafik birimi',
      reason: 'Grafik birimi ekranda gösterilecek görüntüyü oluşturur.',
    },
    ag_karti: {
      answer: 'aga_baglar',
      label: 'Ağ kartı',
      reason: 'Ağ kartı bilgisayarı yerel ağa veya internete bağlar.',
    },
  };

  const expectedScenarios: Record<string, { answer: string; reason: string }> = {
    case_storage_full: {
      answer: 'ssd_depolama',
      reason: '“Fotoğraf saklama alanı doldu” durumunda kalıcı saklama alanı olan SSD/depolama kapasitesi ilgilidir.',
    },
    case_ram_low: {
      answer: 'ram',
      reason: '“RAM yetersizliği tespit edildi” durumunda geçici çalışma belleği olan RAM seçilmelidir.',
    },
    case_no_display: {
      answer: 'kontrol_guc_kablo_giris',
      reason: '“Görüntü gelmiyor” durumunda parça değiştirmeden önce ilk olarak güç, kablo ve monitör giriş kaynağı kontrol edilmelidir.',
    },
  };

  const items: ValidationFeedbackItem[] = [];
  let correctParts = 0;
  let correctScenarios = 0;

  for (const [partId, spec] of Object.entries(expectedParts)) {
    const chosen = partRoles[partId];
    if (chosen === spec.answer) {
      correctParts++;
      items.push({ itemId: `part_${partId}`, correct: true, message: `${spec.label}: Doğru! ${spec.reason}` });
    } else if (!chosen) {
      items.push({ itemId: `part_${partId}`, correct: false, message: `${spec.label} için bir görev seç.` });
    } else {
      items.push({ itemId: `part_${partId}`, correct: false, message: `${spec.label} görevini düzelt: ${spec.reason}` });
    }
  }

  for (const [scId, spec] of Object.entries(expectedScenarios)) {
    const chosen = scenarios[scId];
    if (chosen === spec.answer) {
      correctScenarios++;
      items.push({ itemId: scId, correct: true, message: `Doğru! ${spec.reason}` });
    } else if (!chosen) {
      items.push({ itemId: scId, correct: false, message: 'Bu durum için uygun seçeneği işaretle.' });
    } else {
      items.push({ itemId: scId, correct: false, message: `Seçimi düzelt: ${spec.reason}` });
    }
  }

  const passed = correctParts === 6 && correctScenarios === 3;
  return {
    passed,
    summaryMessage: passed
      ? 'Tebrikler! 6 temel parçanın görevini ve 3 sorun/ihtiyaç senaryosunu eksiksiz tamamladın.'
      : `Parça görevleri: ${correctParts}/6, Senaryolar: ${correctScenarios}/3 doğru. Açıklamalara bakarak eksikleri düzelt.`,
    items,
    preservedState: state,
  };
}

function gradeScenarioMap(
  state: Record<string, any>,
  selections: Record<string, any>,
  expected: Record<string, { answer: string; reason: string }>,
  successText: string
): GraderOutput {
  const items: ValidationFeedbackItem[] = [];
  let correctCount = 0;
  const total = Object.keys(expected).length;

  for (const [id, spec] of Object.entries(expected)) {
    const chosen = selections[id];
    if (chosen === spec.answer) {
      correctCount++;
      items.push({
        itemId: id,
        correct: true,
        message: `Doğru! ${spec.reason}`,
      });
    } else if (!chosen) {
      items.push({
        itemId: id,
        correct: false,
        message: 'Bu madde için henüz bir seçim yapmadın.',
      });
    } else {
      items.push({
        itemId: id,
        correct: false,
        message: `Seçimini düzelt: ${spec.reason}`,
      });
    }
  }

  const passed = correctCount === total;
  return {
    passed,
    summaryMessage: passed
      ? successText
      : `${correctCount}/${total} eşleştirme doğru. Açıklamaları okuyup yanlış seçimleri düzelt.`,
    items,
    preservedState: state,
  };
}

export function gradeActivitySubmission(
  code: string,
  contentVersion: string,
  rawState: unknown
): GraderOutput {
  const state = isObject(rawState) ? rawState : {};
  const cleanCode = code.replace(/^D-/, '');

  switch (cleanCode) {
    case 'W1-A1':
      return gradeW1A1(state);
    case 'W1-A2':
      return gradeW1A2(state);
    case 'W1-Q':
    case 'W2-Q':
    case 'W3-Q':
    case 'W4-Q':
    case 'W5-Q':
      return gradeQuiz(cleanCode, state);
    case 'W1-H':
      return gradeW1H(state);
    case 'W2-A1':
      return gradeW2A1(state);
    case 'W2-A2':
      return gradeW2A2(state);
    case 'W2-H':
      return gradeW2H(state);
    case 'W3-A1':
      return gradeW3A1(state);
    case 'W3-A2':
      return gradeW3A2(state);
    case 'W3-H':
      return gradeW3H(state);
    case 'W4-A1':
      return gradeW4A1(state);
    case 'W4-A2':
      return gradeW4A2(state);
    case 'W4-H':
      return gradeW4H(state);
    case 'W5-A1':
      return gradeW5A1(state);
    case 'W5-A2':
      return gradeW5A2(state);
    case 'W5-H':
      return gradeW5H(state);
    default:
      throw new Error(`Bilinmeyen etkinlik kodu: ${code} (v=${contentVersion})`);
  }
}
