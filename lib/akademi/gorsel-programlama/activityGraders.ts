import { ValidationFeedbackItem } from '@/lib/akademi/shared';
import { getGpActivityByCode } from './curriculum';
import { GpActivityDefinition, VbaFormControl, VirtualSheetData } from './types';
import {
  hasLoopInVbaAst,
  parseVbaProgram,
  runVbaSimulation
} from './vbaSimulator';

export interface GpGradedResult {
  passed: boolean;
  summaryMessage: string;
  feedbackItems: ValidationFeedbackItem[];
  preservedState: Record<string, any>;
}

const VALID_VBA_NAME_RE = /^[A-Za-z][A-Za-z0-9_]*$/;

function checkFormBuilder(
  act: GpActivityDefinition,
  state: Record<string, any>
): GpGradedResult {
  const payload = act.formBuilderPayload;
  const controls: VbaFormControl[] = Array.isArray(state.controls)
    ? state.controls
    : act.starterForm.controls;

  const feedbackItems: ValidationFeedbackItem[] = [];
  let ok = true;

  if (!payload) {
    return {
      passed: false,
      summaryMessage: 'Form doğrulama tanımı bulunamadı.',
      feedbackItems: [],
      preservedState: state
    };
  }

  // Check unique & valid VBA names
  const seenNames = new Set<string>();
  for (const ctrl of controls) {
    const name = (ctrl.name || '').trim();
    if (!VALID_VBA_NAME_RE.test(name)) {
      ok = false;
      feedbackItems.push({
        fieldId: `name_${ctrl.id}`,
        isCorrect: false,
        message: `"${name || '(boş)'}" geçerli bir VBA bileşen adı değil. Harfle başlamalı, boşluk ve Türkçe karakter içermemelidir (ör. txtAd).`
      });
    } else if (seenNames.has(name.toUpperCase())) {
      ok = false;
      feedbackItems.push({
        fieldId: `dup_${ctrl.id}`,
        isCorrect: false,
        message: `"${name}" adı birden fazla bileşende kullanılmış. Her bileşen adı benzersiz olmalıdır.`
      });
    } else {
      seenNames.add(name.toUpperCase());
    }
  }

  for (const req of payload.requiredControls) {
    const count = controls.filter((c) => c.type === req.type).length;
    if (count < req.minCount) {
      ok = false;
      feedbackItems.push({
        fieldId: `req_${req.type}`,
        isCorrect: false,
        message: `${req.label} eksik (Şu an ${count} adet var, en az ${req.minCount} adet olmalı).`
      });
    } else {
      feedbackItems.push({
        fieldId: `req_${req.type}`,
        isCorrect: true,
        message: `${req.label} tamam (${count} adet).`
      });
    }
  }

  return {
    passed: ok,
    summaryMessage: ok
      ? 'Harika! Form bileşenleri ve VBA adlandırmaları doğru.'
      : 'Form tasarımında eksik bileşen veya adlandırma sorunu var. Maddeleri kontrol et.',
    feedbackItems,
    preservedState: { ...state, controls }
  };
}

function checkMatching(
  act: GpActivityDefinition,
  state: Record<string, any>
): GpGradedResult {
  const payload = act.matchingPayload;
  if (!payload) {
    return { passed: false, summaryMessage: 'Eşleştirme verisi yok.', feedbackItems: [], preservedState: state };
  }
  const pairs: Record<string, string> =
    state.pairs && typeof state.pairs === 'object' ? state.pairs : {};
  const feedbackItems: ValidationFeedbackItem[] = [];
  let correct = 0;

  for (const left of payload.leftItems) {
    const chosen = pairs[left.id];
    const expected = payload.correctPairs[left.id];
    if (!chosen) {
      feedbackItems.push({
        fieldId: left.id,
        isCorrect: false,
        message: `"${left.label}" için henüz bir eşleştirme seçmedin.`
      });
    } else if (chosen === expected) {
      correct++;
      feedbackItems.push({
        fieldId: left.id,
        isCorrect: true,
        message: `${left.label}: ${payload.explanations[left.id] || 'Doğru eşleştirme.'}`
      });
    } else {
      feedbackItems.push({
        fieldId: left.id,
        isCorrect: false,
        message: `"${left.label}" eşleştirmesi hatalı. ${payload.explanations[left.id] || ''}`
      });
    }
  }

  const passed = correct === payload.leftItems.length;
  return {
    passed,
    summaryMessage: passed
      ? `Tebrikler! ${correct}/${payload.leftItems.length} eşleştirme doğru.`
      : `${correct}/${payload.leftItems.length} eşleştirme doğru. Hatalı maddeleri inceleyip düzelt.`,
    feedbackItems,
    preservedState: { ...state, pairs }
  };
}

function checkFillBlanks(
  act: GpActivityDefinition,
  state: Record<string, any>
): GpGradedResult {
  const payload = act.fillBlanksPayload;
  if (!payload) {
    return { passed: false, summaryMessage: 'Boşluk doldurma verisi yok.', feedbackItems: [], preservedState: state };
  }
  const answers: Record<string, string> =
    state.answers && typeof state.answers === 'object' ? state.answers : {};
  const feedbackItems: ValidationFeedbackItem[] = [];
  let correct = 0;

  for (const blank of payload.blanks) {
    const chosen = (answers[blank.id] || '').trim();
    const isOk = blank.correctAnswers.some(
      (ans) => ans.toUpperCase() === chosen.toUpperCase()
    );
    if (!chosen) {
      feedbackItems.push({
        fieldId: blank.id,
        isCorrect: false,
        message: `${blank.label}: Henüz seçim yapılmadı.`
      });
    } else if (isOk) {
      correct++;
      feedbackItems.push({
        fieldId: blank.id,
        isCorrect: true,
        message: `${blank.label}: ${blank.explanationCorrect}`
      });
    } else {
      feedbackItems.push({
        fieldId: blank.id,
        isCorrect: false,
        message: `${blank.label}: ${blank.explanationWrong}`
      });
    }
  }

  const passed = correct === payload.blanks.length;
  return {
    passed,
    summaryMessage: passed
      ? 'Tüm boşluklar doğru ve mantığıyla tamamlandı!'
      : `${correct}/${payload.blanks.length} boşluk doğru. Açıklamaları okuyup tekrar dene.`,
    feedbackItems,
    preservedState: { ...state, answers }
  };
}

function checkCodeOrdering(
  act: GpActivityDefinition,
  state: Record<string, any>
): GpGradedResult {
  const payload = act.codeOrderingPayload;
  if (!payload) {
    return { passed: false, summaryMessage: 'Sıralama verisi yok.', feedbackItems: [], preservedState: state };
  }
  const order: string[] = Array.isArray(state.order)
    ? state.order.map(String)
    : payload.blocks.map((b) => b.id);

  const isMatch = payload.validOrders.some(
    (valid) =>
      valid.length === order.length &&
      valid.every((id, idx) => id === order[idx])
  );

  return {
    passed: isMatch,
    summaryMessage: isMatch
      ? 'Harika! Kod blokları mantıklı çalışma sırasına göre dizildi.'
      : 'Kod sırası henüz doğru değil. Önce boş kontrolü yapmalı, en son kutuyu temizlemelisin.',
    feedbackItems: [
      {
        fieldId: 'code_order',
        isCorrect: isMatch,
        message: isMatch
          ? 'Geçerli yürütme sırası doğrulandı.'
          : 'İpucu: Kutuyu temizleme satırı AddItem satırından önce gelirse boş metin eklenir.'
      }
    ],
    preservedState: { ...state, order }
  };
}

function checkOutputPrediction(
  act: GpActivityDefinition,
  state: Record<string, any>
): GpGradedResult {
  const payload = act.outputPredictionPayload;
  if (!payload) {
    return { passed: false, summaryMessage: 'Tahmin verisi yok.', feedbackItems: [], preservedState: state };
  }
  const prediction = String(state.prediction || '').trim();
  const isOk =
    prediction.toUpperCase() === payload.correctAnswer.trim().toUpperCase();

  return {
    passed: isOk,
    summaryMessage: isOk
      ? `Doğru tahmin! ${payload.explanation}`
      : prediction
      ? `Tahminin ("${prediction}") beklenen çıktı ile eşleşmedi. Kodu çalıştırıp adımları inceleyebilirsin.`
      : 'Önce çıktı tahminini seç veya yaz.',
    feedbackItems: [
      {
        fieldId: 'prediction',
        isCorrect: isOk,
        message: isOk
          ? payload.explanation
          : 'Kodu yukarıdan aşağı takip ederek değişken veya özellik değerini tekrar kontrol et.'
      }
    ],
    preservedState: { ...state, prediction }
  };
}

function checkCodeTests(
  act: GpActivityDefinition,
  state: Record<string, any>
): GpGradedResult {
  const code = typeof state.code === 'string' ? state.code : act.starterCode;
  const parsed = parseVbaProgram(code);

  if (parsed.error || !parsed.program) {
    return {
      passed: false,
      summaryMessage: parsed.error?.message || 'Kodda sözdizimi hatası var.',
      feedbackItems: [
        {
          fieldId: 'syntax',
          isCorrect: false,
          message: parsed.error?.message || 'Sözdizimi hatası.'
        }
      ],
      preservedState: { ...state, code }
    };
  }

  const feedbackItems: ValidationFeedbackItem[] = [];

  if (act.requireLoopInAst && !hasLoopInVbaAst(parsed.program)) {
    return {
      passed: false,
      summaryMessage: 'Bu görevde tekrarlı işlem için For veya Do While döngüsü kullanmalısın.',
      feedbackItems: [
        {
          fieldId: 'ast_loop',
          isCorrect: false,
          message: 'Kodunda For...Next veya Do While...Loop döngüsü bulunamadı.'
        }
      ],
      preservedState: { ...state, code }
    };
  }

  // Sequential state for multi-step stateful activities like H5-E4 (3 consecutive rows) or H4-E5 (reload twice)
  const isSequential = act.code === 'H5-E4' || act.code === 'H4-E5';
  let currentControls: VbaFormControl[] = act.starterForm.controls.map((c) => ({
    ...c,
    items: c.items ? [...c.items] : undefined
  }));
  let currentSheet: VirtualSheetData | undefined = act.starterSheet
    ? {
        ...act.starterSheet,
        columns: [...act.starterSheet.columns],
        cells: { ...act.starterSheet.cells }
      }
    : undefined;

  let allPassed = true;

  for (const tc of act.tests) {
    const baseControls = (isSequential ? currentControls : act.starterForm.controls).map((c) => ({
      ...c,
      items: c.items ? [...c.items] : undefined
    }));
    const baseSheet = (isSequential ? currentSheet : act.starterSheet)
      ? {
          ...(isSequential ? currentSheet! : act.starterSheet!),
          columns: [...(isSequential ? currentSheet! : act.starterSheet!).columns],
          cells: { ...(isSequential ? currentSheet! : act.starterSheet!).cells }
        }
      : undefined;

    if (tc.inputs) {
      for (const [ctrlName, val] of Object.entries(tc.inputs)) {
        const target = baseControls.find(
          (c) => c.name.toUpperCase() === ctrlName.toUpperCase()
        );
        if (target) {
          target.value = val as any;
        }
      }
    }

    const runRes = runVbaSimulation({
      code,
      controls: baseControls,
      sheet: baseSheet,
      eventSubName: tc.eventTarget,
      listSelections: tc.listSelections,
      maxSteps: 4000,
      maxLoopIterations: 500,
      maxTimeMs: 1200,
      captureTrace: false
    });

    if (isSequential && runRes.ok) {
      currentControls = runRes.controls;
      currentSheet = runRes.sheet;
    }

    // For H4-E5, run a second time on the evolved state to ensure items do NOT duplicate
    if (act.code === 'H4-E5' && runRes.ok) {
      const secondRun = runVbaSimulation({
        code,
        controls: runRes.controls,
        sheet: runRes.sheet,
        eventSubName: tc.eventTarget,
        maxSteps: 4000,
        maxLoopIterations: 500,
        maxTimeMs: 1200,
        captureTrace: false
      });
      if (!secondRun.ok) {
        allPassed = false;
        feedbackItems.push({
          fieldId: tc.id,
          isCorrect: false,
          message: `${tc.label}: İkinci yüklemede hata: ${secondRun.error?.message}`
        });
        continue;
      }
      runRes.controls = secondRun.controls;
    }

    if (!runRes.ok) {
      allPassed = false;
      feedbackItems.push({
        fieldId: tc.id,
        isCorrect: false,
        message: `${tc.label}: ${runRes.error?.message || 'Çalıştırma hatası.'}`
      });
      continue;
    }

    let tcOk = true;
    let tcMsg = `${tc.label}: Başarılı.`;

    // Check expectedControlProps (substring match for Caption/Value strings, exact for colors/numbers)
    if (tc.expectedControlProps) {
      for (const [ctrlName, props] of Object.entries(tc.expectedControlProps)) {
        const ctrl = runRes.controls.find(
          (c) => c.name.toUpperCase() === ctrlName.toUpperCase()
        );
        if (!ctrl) {
          tcOk = false;
          tcMsg = `${tc.label}: '${ctrlName}' bileşeni bulunamadı.`;
          break;
        }
        for (const [propKey, expectedVal] of Object.entries(props)) {
          const p = propKey.toUpperCase();
          let actual: any;
          if (p === 'CAPTION') actual = ctrl.caption ?? '';
          else if (p === 'VALUE') actual = ctrl.value ?? '';
          else if (p === 'FORECOLOR') actual = ctrl.foreColor ?? '';
          else if (p === 'BACKCOLOR') actual = ctrl.backColor ?? '';
          else if (p === 'WIDTH') actual = ctrl.width ?? 0;
          else if (p === 'HEIGHT') actual = ctrl.height ?? 0;

          if (typeof expectedVal === 'string' && (p === 'CAPTION' || p === 'VALUE')) {
            if (expectedVal === '') {
              if (String(actual).trim() !== '') {
                tcOk = false;
                tcMsg = `${tc.label}: ${ctrlName}.${propKey} temizlenmemiş ("${actual}").`;
              }
            } else if (!String(actual).toLocaleLowerCase('tr-TR').includes(expectedVal.toLocaleLowerCase('tr-TR'))) {
              tcOk = false;
              tcMsg = `${tc.label}: ${ctrlName}.${propKey} içinde "${expectedVal}" bekleniyordu, "${actual}" bulundu.`;
            }
          } else if (String(actual).toUpperCase() !== String(expectedVal).toUpperCase()) {
            tcOk = false;
            tcMsg = `${tc.label}: ${ctrlName}.${propKey} için ${expectedVal} bekleniyordu, ${actual} bulundu.`;
          }
        }
      }
    }

    // Check MsgBox
    if (tcOk && tc.expectedMsgBoxContains) {
      for (const needle of tc.expectedMsgBoxContains) {
        if (runRes.msgBoxes.length === 0) {
          tcOk = false;
          tcMsg = `${tc.label}: MsgBox çıktısı bekleniyordu ancak hiç MsgBox gösterilmedi.`;
          break;
        }
        if (
          needle &&
          !runRes.msgBoxes.some((m) =>
            m.toLocaleLowerCase('tr-TR').includes(needle.toLocaleLowerCase('tr-TR'))
          )
        ) {
          tcOk = false;
          tcMsg = `${tc.label}: MsgBox içinde "${needle}" bilgisi bekleniyordu.`;
          break;
        }
      }
    }

    // Check ListBox items
    if (tcOk && tc.expectedListItems) {
      for (const [lbName, expectedItems] of Object.entries(tc.expectedListItems)) {
        const lb = runRes.controls.find(
          (c) => c.name.toUpperCase() === lbName.toUpperCase()
        );
        const actualItems = lb?.items || [];
        const same =
          actualItems.length === expectedItems.length &&
          actualItems.every((it, i) => it === expectedItems[i]);
        if (!same) {
          tcOk = false;
          tcMsg = `${tc.label}: ${lbName} listesi [${expectedItems.join(', ')}] olmalıydı, [${actualItems.join(', ')}] bulundu.`;
          break;
        }
      }
    }

    // Check Sheet cells
    if (tcOk && tc.expectedSheetCells) {
      for (const [cellKey, expectedVal] of Object.entries(tc.expectedSheetCells)) {
        const actual = runRes.sheet?.cells[cellKey];
        if (String(actual ?? '').trim() !== String(expectedVal).trim()) {
          tcOk = false;
          tcMsg = `${tc.label}: Hücre (${cellKey}) değeri "${expectedVal}" olmalıydı, "${actual ?? ''}" bulundu.`;
          break;
        }
      }
    }

    if (!tcOk) allPassed = false;
    feedbackItems.push({
      fieldId: tc.id,
      isCorrect: tcOk,
      message: tcMsg
    });
  }

  return {
    passed: allPassed,
    summaryMessage: allPassed
      ? `Tebrikler! ${act.tests.length}/${act.tests.length} test senaryosu başarıyla geçti.`
      : 'Bazı test senaryoları başarısız oldu. Aşağıdaki geri bildirimleri inceleyip kodunu düzenle.',
    feedbackItems,
    preservedState: { ...state, code }
  };
}

export function gradeGpActivitySubmission(
  activityCode: string,
  rawState: unknown
): GpGradedResult {
  const act = getGpActivityByCode(activityCode);
  const state = (rawState && typeof rawState === 'object' ? rawState : {}) as Record<string, any>;

  if (!act) {
    return {
      passed: false,
      summaryMessage: `Etkinlik bulunamadı (${activityCode}).`,
      feedbackItems: [],
      preservedState: state
    };
  }

  let result: GpGradedResult;
  switch (act.widgetType) {
    case 'matching':
      result = checkMatching(act, state);
      break;
    case 'form_builder':
      result = checkFormBuilder(act, state);
      break;
    case 'fill_blanks':
      result = checkFillBlanks(act, state);
      break;
    case 'code_ordering':
      result = checkCodeOrdering(act, state);
      break;
    case 'output_prediction':
    case 'trace_viewer':
      result = checkOutputPrediction(act, state);
      break;
    case 'bug_hunt':
    case 'code_editor':
    default:
      result = checkCodeTests(act, state);
      break;
  }

  // If activity has web+excel environment, also check if student marked required excelChecklist items
  if (result.passed && act.environment === 'web+excel' && act.excelChecklist.length > 0) {
    const checkedMap = (state.excelChecklist && typeof state.excelChecklist === 'object'
      ? state.excelChecklist
      : {}) as Record<string, boolean>;
    const allChecked = act.excelChecklist.every((_, idx) => Boolean(checkedMap[String(idx)]));
    if (!allChecked) {
      result.passed = false;
      result.summaryMessage =
        'Web doğrulaması başarılı! Etkinliği tamamlamak için sağ/alt bölümdeki Excel Uygulaması Kontrol Listesi maddelerini de işaretlemelisin.';
      result.feedbackItems.push({
        fieldId: 'excel_checklist',
        isCorrect: false,
        message: 'Excel Uygulaması Kontrol Listesi (öğrenci beyanı) henüz tam işaretlenmedi.'
      });
    }
  }

  return result;
}
