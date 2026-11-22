import { ValidationFeedbackItem } from '@/lib/akademi/shared';

export interface ActivityValidationResult {
  passed: boolean;
  summaryMessage: string;
  feedbackItems: ValidationFeedbackItem[];
}

function normalizeEdgeKey(a: string, b: string, connectionType: string): string {
  const [first, second] = [a, b].sort();
  return `${first}--${second}:${connectionType}`;
}

function validateNetworkEdges(
  rawEdges: unknown,
  expectedEdges: { from: string; to: string; connectionType: 'wired' | 'wireless'; label: string }[],
  checkConnectionType: boolean
): ActivityValidationResult {
  const edges = Array.isArray(rawEdges) ? rawEdges : [];
  const feedbackItems: ValidationFeedbackItem[] = [];

  if (edges.length === 0) {
    return {
      passed: false,
      summaryMessage: 'Henüz hiçbir cihaz bağlantısı kurmadın. İki cihaza sırayla tıklayarak bağlantı ekleyebilirsin.',
      feedbackItems: [
        {
          fieldId: 'network_canvas',
          isCorrect: false,
          message: 'Şemada en az 4 bağlantı kurulmalıdır.'
        }
      ]
    };
  }

  const submittedMap = new Map<string, { from: string; to: string; connectionType: string }>();
  const pairOnlyMap = new Map<string, string>();

  for (const item of edges) {
    if (!item || typeof item !== 'object') continue;
    const from = String((item as Record<string, unknown>).from || '');
    const to = String((item as Record<string, unknown>).to || '');
    const connectionType = String((item as Record<string, unknown>).connectionType || 'wired');
    if (!from || !to || from === to) continue;

    const [first, second] = [from, to].sort();
    const pairKey = `${first}--${second}`;
    const fullKey = checkConnectionType ? normalizeEdgeKey(from, to, connectionType) : pairKey;
    submittedMap.set(fullKey, { from: first, to: second, connectionType });
    pairOnlyMap.set(pairKey, connectionType);
  }

  let allExpectedFound = true;
  const expectedKeys = new Set<string>();

  for (const exp of expectedEdges) {
    const [first, second] = [exp.from, exp.to].sort();
    const pairKey = `${first}--${second}`;
    const fullKey = checkConnectionType
      ? normalizeEdgeKey(exp.from, exp.to, exp.connectionType)
      : pairKey;
    expectedKeys.add(fullKey);

    if (submittedMap.has(fullKey)) {
      feedbackItems.push({
        fieldId: pairKey,
        isCorrect: true,
        message: `${exp.label} bağlantısı doğru kuruldu.`
      });
    } else if (checkConnectionType && pairOnlyMap.has(pairKey)) {
      allExpectedFound = false;
      const usedType = pairOnlyMap.get(pairKey) === 'wireless' ? 'Kablosuz' : 'Kablolu';
      const rightType = exp.connectionType === 'wireless' ? 'Kablosuz (Kesik Çizgi)' : 'Kablolu (Düz Çizgi)';
      feedbackItems.push({
        fieldId: pairKey,
        isCorrect: false,
        message: `${exp.label} arasında bağlantı var ancak türü "${usedType}" seçilmiş. Bu bağlantıyı silip "${rightType}" olarak yeniden kurmalısın.`
      });
    } else {
      allExpectedFound = false;
      feedbackItems.push({
        fieldId: pairKey,
        isCorrect: false,
        message: `${exp.label} arasındaki bağlantı eksik.`
      });
    }
  }

  // Check for extra unexpected edges
  let extraEdgeCount = 0;
  for (const [key, edge] of submittedMap.entries()) {
    if (!expectedKeys.has(key)) {
      const pairKey = `${edge.from}--${edge.to}`;
      // If it wasn't already flagged as a wrong connectionType on an expected pair
      const isExpectedPairWithWrongType =
        checkConnectionType &&
        expectedEdges.some((e) => {
          const [f, s] = [e.from, e.to].sort();
          return `${f}--${s}` === pairKey;
        });

      if (!isExpectedPairWithWrongType) {
        extraEdgeCount++;
        feedbackItems.push({
          fieldId: `extra_${pairKey}`,
          isCorrect: false,
          message: `Fazladan veya hatalı bağlantı tespit edildi (${edge.from.toUpperCase()} ↔ ${edge.to.toUpperCase()}). Lütfen bu çizgiye tıklayıp "Bağlantıyı Sil" düğmesiyle kaldır.`
        });
      }
    }
  }

  const passed = allExpectedFound && extraEdgeCount === 0 && submittedMap.size === expectedEdges.length;

  return {
    passed,
    summaryMessage: passed
      ? 'Harika! Ağ şemasındaki tüm bağlantılar eksiksiz ve doğru türde kuruldu.'
      : extraEdgeCount > 0
      ? 'Beklenen bağlantıların dışında fazladan/hatalı bağlantılar var. Aşağıdaki geri bildirimlere göre fazladan çizgileri silip eksik olanları tamamla.'
      : 'Bazı bağlantılar eksik veya bağlantı türü (kablolu/kablosuz) hatalı. Aşağıdaki maddeleri kontrol et.',
    feedbackItems
  };
}

export function validateActivitySubmission(
  activityCode: string,
  rawState: unknown
): ActivityValidationResult {
  const state = (rawState && typeof rawState === 'object' ? rawState : {}) as Record<string, any>;

  switch (activityCode) {
    // ========================================================================
    // HAFTA 1
    // ========================================================================
    case 'W1-A1': {
      // Cihazı Göreviyle Eşleştir
      const pairs = (state.pairs && typeof state.pairs === 'object' ? state.pairs : {}) as Record<string, string>;
      const expected: Record<string, { target: string; label: string; fixMsg: string }> = {
        dev_modem: {
          target: 'role_modem',
          label: 'Modem',
          fixMsg: 'Modem, servis sağlayıcı hattından (DSL/kablo) gelen sinyali sayısal veriye dönüştüren cihazdır.'
        },
        dev_router: {
          target: 'role_router',
          label: 'Yönlendirici (Router)',
          fixMsg: 'Yönlendirici, farklı ağlar arasında (yerel ağ ile internet arasında) veri paketlerini ileten cihazdır.'
        },
        dev_switch: {
          target: 'role_switch',
          label: 'Anahtar (Switch)',
          fixMsg: 'Switch, aynı yerel ağdaki (LAN) kablolu cihazların birbiriyle iletişim kurmasını sağlayan cihazdır.'
        },
        dev_ap: {
          target: 'role_ap',
          label: 'Erişim Noktası (Access Point)',
          fixMsg: 'Erişim noktası, kablosuz cihazları yerel ağa bağlayan cihazdır.'
        }
      };

      const feedbackItems: ValidationFeedbackItem[] = [];
      let correctCount = 0;

      for (const [devId, info] of Object.entries(expected)) {
        const chosen = pairs[devId];
        if (!chosen) {
          feedbackItems.push({
            fieldId: devId,
            isCorrect: false,
            message: `${info.label} için henüz bir görev seçmedin.`
          });
        } else if (chosen === info.target) {
          correctCount++;
          feedbackItems.push({
            fieldId: devId,
            isCorrect: true,
            message: `${info.label} doğru görevle eşleştirildi.`
          });
        } else {
          feedbackItems.push({
            fieldId: devId,
            isCorrect: false,
            message: `${info.label} eşleştirmesini düzeltmelisin: ${info.fixMsg}`
          });
        }
      }

      const passed = correctCount === 4;
      return {
        passed,
        summaryMessage: passed
          ? 'Tebrikler! Dört ağ cihazının tamamını doğru görevleriyle eşleştirdin.'
          : `${correctCount}/4 eşleştirme doğru. Doğru eşleştirmelerin korundu; açıklama kutularındaki ipuçlarına göre kalanları düzelt.`,
        feedbackItems
      };
    }

    case 'W1-A2': {
      // Wi-Fi Var, İnternet Var mı?
      const answers = (state.answers && typeof state.answers === 'object' ? state.answers : {}) as Record<string, string>;
      const reasons = (state.reasons && typeof state.reasons === 'object' ? state.reasons : {}) as Record<string, string>;

      const rules = [
        {
          id: 'w1_a2_q1',
          expectedAnswer: 'NO',
          expectedReason: 'r1_correct',
          title: '1. Soru (Wi-Fi simgesi interneti garanti eder mi?)',
          hintMsg: 'Wi-Fi bağlantısı yalnızca yerel erişim noktasına bağlı olduğunu gösterir; servis sağlayıcı hattı kesikse internet çalışmayabilir. Cevap "Hayır" ve yerel bağlantı/servis sağlayıcı ayrımını anlatan gerekçe olmalıdır.'
        },
        {
          id: 'w1_a2_q2',
          expectedAnswer: 'NO',
          expectedReason: 'r2_correct',
          title: '2. Soru (Yerel ağ yazıcısı için internet şart mı?)',
          hintMsg: 'Bilgisayar ve yazıcı aynı yerel ağda (LAN) olduğu için dış internete çıkmadan haberleşir. Cevap "Hayır" ve yerel ağ içi iletişimi belirten gerekçe olmalıdır.'
        },
        {
          id: 'w1_a2_q3',
          expectedAnswer: 'NO',
          expectedReason: 'r3_correct',
          title: '3. Soru (İnternet için Wi-Fi şart mı?)',
          hintMsg: 'Bilgisayarlar Ethernet ağ kablosuyla da internete bağlanabilir. Cevap "Hayır" ve kablolu Ethernet bağlantısını belirten gerekçe olmalıdır.'
        }
      ];

      const feedbackItems: ValidationFeedbackItem[] = [];
      let correctCount = 0;

      for (const r of rules) {
        const ans = answers[r.id];
        const reas = reasons[r.id];
        if (ans === r.expectedAnswer && reas === r.expectedReason) {
          correctCount++;
          feedbackItems.push({
            fieldId: r.id,
            isCorrect: true,
            message: `${r.title}: Cevabın ve teknik gerekçen doğru.`
          });
        } else {
          feedbackItems.push({
            fieldId: r.id,
            isCorrect: false,
            message: `${r.title}: ${r.hintMsg}`
          });
        }
      }

      const passed = correctCount === 3;
      return {
        passed,
        summaryMessage: passed
          ? 'Mükemmel! Yerel ağ bağlantısı (Wi-Fi/LAN) ile internet erişimi arasındaki farkı üç senaryoda da doğru açıkladın.'
          : `${correctCount}/3 senaryo tamamlandı. Eksik veya hatalı senaryolardaki açıklamaları kontrol et.`,
        feedbackItems
      };
    }

    case 'W1-Q': {
      return validateQuiz(state, [
        {
          id: 'w1_q1',
          correct: 'b',
          okMsg: '1. Soru Doğru: Ağların temel amacı cihazlar arası veri alışverişi ve kaynak paylaşımıdır.',
          errMsg: '1. Soru: Bir bilgisayar ağının temel amacı cihazların veri alışverişi yapması ve yazıcı/dosya gibi kaynakları paylaşmasıdır.'
        },
        {
          id: 'w1_q2',
          correct: 'a',
          okMsg: '2. Soru Doğru: Aynı yerel ağdaki kablolu cihazları birbirine bağlamak için Anahtar (Switch) kullanılır.',
          errMsg: '2. Soru: Laboratuvardaki çok sayıda kablolu bilgisayarı ve yazıcıyı aynı yerel ağda buluşturan çok portlu cihaz Anahtar (Switch) cihazıdır.'
        },
        {
          id: 'w1_q3',
          correct: 'b',
          okMsg: '3. Soru Doğru: Yerel Wi-Fi bağlantısı kurulmuştur ancak dış internet hattına erişilememektedir.',
          errMsg: '3. Soru: "Wi-Fi Bağlı, İnternet Yok" uyarısı bilgisayarın evdeki kablosuz cihaza (yerel ağa) bağlandığını ancak dış internet hattına çıkamadığını gösterir.'
        }
      ]);
    }

    case 'W1-H': {
      // Evimin Bağlantılarını Tanıyorum
      const prefs = (state.devicePreferences && typeof state.devicePreferences === 'object'
        ? state.devicePreferences
        : {}) as Record<string, string>;
      const sameLanAnswer = state.sameLanAnswer;

      const devices = ['phone', 'tv', 'desktop'];
      const feedbackItems: ValidationFeedbackItem[] = [];
      let allChosen = true;

      for (const dev of devices) {
        const val = prefs[dev];
        if (val === 'wired' || val === 'wireless') {
          feedbackItems.push({
            fieldId: dev,
            isCorrect: true,
            message: `Cihaz bağlantı tercihi kaydedildi (${val === 'wired' ? 'Kablolu' : 'Kablosuz'}).`
          });
        } else {
          allChosen = false;
          feedbackItems.push({
            fieldId: dev,
            isCorrect: false,
            message: 'Lütfen bu cihaz için Kablolu veya Kablosuz tercihlerinden birini seç.'
          });
        }
      }

      const lanOk = sameLanAnswer === 'YES';
      feedbackItems.push({
        fieldId: 'sameLanAnswer',
        isCorrect: lanOk,
        message: lanOk
          ? 'Doğru! Bazıları kablolu, bazıları kablosuz bağlansa bile aynı ev yönlendiricisine bağlı cihazlar aynı yerel ağda (LAN) haberleşebilir.'
          : 'Aynı ev yönlendiricisine kablolu veya kablosuz bağlanan cihazların tamamı aynı yerel ağa (LAN) dahil olur. Son sorunun cevabı "Evet" olmalıdır.'
      });

      const passed = allChosen && lanOk;
      return {
        passed,
        summaryMessage: passed
          ? '1. Hafta uygulama ödevini başarıyla tamamladın!'
          : 'Tüm cihazlar için bir bağlantı tercihi yapmalı ve yerel ağ sorusunu doğru yanıtlamalısın.',
        feedbackItems
      };
    }

    // ========================================================================
    // HAFTA 2
    // ========================================================================
    case 'W2-A1': {
      // Bağlantıyı Seç
      const answers = (state.answers && typeof state.answers === 'object' ? state.answers : {}) as Record<string, string>;
      const rules = [
        {
          id: 'w2_a1_s1',
          expected: 'WIFI',
          title: 'Senaryo 1 (Dolaşan telefon)',
          fixMsg: 'Hareket hâlindeki akıllı telefon için kablo takılamayacağından "Wi-Fi (Kablosuz Ağ)" seçilmelidir.'
        },
        {
          id: 'w2_a1_s2',
          expected: 'COPPER_ETHERNET',
          title: 'Senaryo 2 (Switch yanındaki sabit bilgisayar)',
          fixMsg: 'Switch yanındaki Ethernet girişli sabit masaüstü bilgisayar için "Bakır Ethernet Kablosu" seçilmelidir.'
        },
        {
          id: 'w2_a1_s3',
          expected: 'FIBER',
          title: 'Senaryo 3 (Binalar arası ışıkla iletim)',
          fixMsg: 'Binalar arasında metal veri kablosu olmadan ışıkla iletim için "Fiber Optik Kablo" seçilmelidir.'
        }
      ];

      const feedbackItems: ValidationFeedbackItem[] = [];
      let correctCount = 0;

      for (const r of rules) {
        if (answers[r.id] === r.expected) {
          correctCount++;
          feedbackItems.push({
            fieldId: r.id,
            isCorrect: true,
            message: `${r.title}: Doğru bağlantı türü seçildi.`
          });
        } else {
          feedbackItems.push({
            fieldId: r.id,
            isCorrect: false,
            message: `${r.title}: ${r.fixMsg}`
          });
        }
      }

      const passed = correctCount === 3;
      return {
        passed,
        summaryMessage: passed
          ? 'Tebrikler! Her üç senaryo için de en uygun bağlantı ortamını seçtin.'
          : `${correctCount}/3 senaryo doğru. Açıklamalara göre kalan seçimleri düzelt.`,
        feedbackItems
      };
    }

    case 'W2-A2': {
      // Küçük Ofis Ağını Kur: PC1, PC2, PC3, printer1 <-> switch1 (4 wired edges)
      return validateNetworkEdges(
        state.edges,
        [
          { from: 'pc1', to: 'switch1', connectionType: 'wired', label: 'PC 1 ↔ Ofis Switch' },
          { from: 'pc2', to: 'switch1', connectionType: 'wired', label: 'PC 2 ↔ Ofis Switch' },
          { from: 'pc3', to: 'switch1', connectionType: 'wired', label: 'PC 3 ↔ Ofis Switch' },
          { from: 'printer1', to: 'switch1', connectionType: 'wired', label: 'Ağ Yazıcısı ↔ Ofis Switch' }
        ],
        false
      );
    }

    case 'W2-Q': {
      return validateQuiz(state, [
        {
          id: 'w2_q1',
          correct: 'a',
          okMsg: '1. Soru Doğru: Fiber optik kablolar veriyi cam/plastik lifler içinden ışık sinyalleriyle taşır.',
          errMsg: '1. Soru: Fiber optik kablolar elektrik veya ses değil, cam/plastik lifler içinden ışık sinyalleri kullanır.'
        },
        {
          id: 'w2_q2',
          correct: 'a',
          okMsg: '2. Soru Doğru: Wi-Fi sinyalleri mesafe, kalın duvarlar ve metal engellerden etkilenir.',
          errMsg: '2. Soru: Kablosuz (Wi-Fi) sinyallerinde mesafe arttıkça ve araya duvar/engel girdikçe sinyal gücü düşer.'
        },
        {
          id: 'w2_q3',
          correct: 'a',
          okMsg: '3. Soru Doğru: Merkezde bir Switch cihazına tüm uç cihazların bağlandığı yapı Yıldız (Star) topolojisidir.',
          errMsg: '3. Soru: Uç cihazların merkezdeki bir Switch cihazına ayrı kablolarla bağlandığı düzen Yıldız (Star) topolojisidir.'
        }
      ]);
    }

    case 'W2-H': {
      // Kafenin Ağını Tamamla
      return validateNetworkEdges(
        state.edges,
        [
          { from: 'pos1', to: 'switch1', connectionType: 'wired', label: 'Kasa Bilgisayarı ↔ Kafe Switch (Kablolu)' },
          { from: 'ap1', to: 'switch1', connectionType: 'wired', label: 'Erişim Noktası ↔ Kafe Switch (Kablolu)' },
          { from: 'phone1', to: 'ap1', connectionType: 'wireless', label: 'Müşteri Telefon 1 ↔ Erişim Noktası (Kablosuz)' },
          { from: 'phone2', to: 'ap1', connectionType: 'wireless', label: 'Müşteri Telefon 2 ↔ Erişim Noktası (Kablosuz)' }
        ],
        true
      );
    }

    // ========================================================================
    // HAFTA 3
    // ========================================================================
    case 'W3-A1': {
      // Fotoğrafın Yolculuğunu Sırala
      const order = Array.isArray(state.cardOrder) ? state.cardOrder.map(String) : [];
      const expected = ['step_select', 'step_segment', 'step_transport', 'step_reassemble'];
      const labels: Record<string, string> = {
        step_select: '1. Adım: Fotoğraf Seçilir',
        step_segment: '2. Adım: Parçalara Ayrılır ve Bilgiler Eklenir',
        step_transport: '3. Adım: Ağda Taşınır',
        step_reassemble: '4. Adım: Alıcıda Birleştirilir ve Görüntülenir'
      };

      const feedbackItems: ValidationFeedbackItem[] = [];
      let correctPositions = 0;

      for (let i = 0; i < expected.length; i++) {
        const expId = expected[i];
        const actualId = order[i];
        if (actualId === expId) {
          correctPositions++;
          feedbackItems.push({
            fieldId: `pos_${i + 1}`,
            isCorrect: true,
            message: `${i + 1}. sıradaki kart doğru (${labels[expId]}).`
          });
        } else {
          feedbackItems.push({
            fieldId: `pos_${i + 1}`,
            isCorrect: false,
            message: `${i + 1}. sırada "${labels[expId]}" kartı bulunmalıdır.`
          });
        }
      }

      const passed = correctPositions === 4;
      return {
        passed,
        summaryMessage: passed
          ? 'Tebrikler! Bir fotoğrafın ağdaki yolculuğunu baştan sona doğru sıraladın.'
          : `${correctPositions}/4 adım doğru sırada. Yukarı/Aşağı düğmeleriyle hatalı sıradaki kartları düzelt.`,
        feedbackItems
      };
    }

    case 'W3-A2': {
      // Eksik Parçayı Bul (1,2,4 var; 3 eksik -> seç -> yeniden iste -> konum 3'e koy -> birleştir)
      const selectedMissing = Number(state.selectedMissingNumber);
      const requestedRetransmit = Boolean(state.requestedRetransmit);
      const placedSlotIndex = Number(state.placedSlotIndex); // expected 2 (0-based index for 3rd position) or 3 (1-based)
      const isMerged = Boolean(state.isMerged);

      const step1Ok = selectedMissing === 3;
      const step2Ok = step1Ok && requestedRetransmit;
      const step3Ok = step2Ok && (placedSlotIndex === 3 || placedSlotIndex === 2);
      const step4Ok = step3Ok && isMerged;

      const feedbackItems: ValidationFeedbackItem[] = [
        {
          fieldId: 'step_identify',
          isCorrect: step1Ok,
          message: step1Ok
            ? 'Adım 1 Doğru: Eksik olan 3 numaralı parçayı tespit ettin.'
            : 'Adım 1: Elimizde 1, 2 ve 4 numaralı parçalar var. Eksik olan parça numarasını (3) seçmelisin.'
        },
        {
          fieldId: 'step_request',
          isCorrect: step2Ok,
          message: step2Ok
            ? 'Adım 2 Doğru: TCP mantığıyla eksik parçayı göndericiden yeniden istedin.'
            : 'Adım 2: Eksik numarayı seçtikten sonra "Eksik Parçayı Yeniden İste" düğmesine basmalısın.'
        },
        {
          fieldId: 'step_place',
          isCorrect: step3Ok,
          message: step3Ok
            ? 'Adım 3 Doğru: Gelen 3 numaralı parçayı 2 ile 4 arasındaki 3. konuma yerleştirdin.'
            : 'Adım 3: Gelen 3 numaralı parçayı dizideki 3. Konuma (2 ile 4 arasına) yerleştirmelisin.'
        },
        {
          fieldId: 'step_merge',
          isCorrect: step4Ok,
          message: step4Ok
            ? 'Adım 4 Doğru: Tüm parçalar (1-2-3-4) sırayla birleştirildi ve fotoğraf görüntülendi.'
            : 'Adım 4: Parçayı doğru konuma yerleştirdikten sonra "Fotoğrafı Birleştir" düğmesine basmalısın.'
        }
      ];

      const passed = step1Ok && step2Ok && step3Ok && step4Ok;
      return {
        passed,
        summaryMessage: passed
          ? 'Harika! TCP güvenilir iletim örneğindeki eksik parçayı bulup yeniden istedin ve fotoğrafı doğru sırayla birleştirdin.'
          : 'Bazı adımlar henüz tamamlanmadı. Aşağıdaki 4 adım listesine göre eksik adımı tamamla.',
        feedbackItems
      };
    }

    case 'W3-Q': {
      return validateQuiz(state, [
        {
          id: 'w3_q1',
          correct: 'a',
          okMsg: '1. Soru Doğru: Ağdaki cihazların anlaşmak için uyduğu ortak kurallar bütününe Protokol denir.',
          errMsg: '1. Soru: Farklı cihazların ağ üzerinden anlaşabilmesini sağlayan ortak iletişim kurallarına "Protokol" denir.'
        },
        {
          id: 'w3_q2',
          correct: 'a',
          okMsg: '2. Soru Doğru: Katmanlı iş bölümü her katmanın kendi görevine odaklanmasını ve sorunların kolay çözülmesini sağlar.',
          errMsg: '2. Soru: Ağ iletişiminde katmanlı iş bölümü, bir katman değiştiğinde (ör. kablo yerine Wi-Fi) diğer katmanların bozulmadan çalışmasını ve kolay arıza tespitini sağlar.'
        },
        {
          id: 'w3_q3',
          correct: 'a',
          okMsg: '3. Soru Doğru: Sıra numarası sayesinde parçalar alıcıda doğru sırayla birleştirilir ve eksik parça fark edilir.',
          errMsg: '3. Soru: Paketlere sıra numarası eklenmesinin amacı alıcının parçaları doğru sırada birleştirmesi ve eksik parçayı tespit edebilmesidir.'
        }
      ]);
    }

    case 'W3-H': {
      // İletişimin Üç Kuralı
      const answers = (state.answers && typeof state.answers === 'object' ? state.answers : {}) as Record<string, string>;
      const rules = [
        {
          id: 'w3_h_q1',
          expected: 'COMMON_FORMAT',
          title: 'Sorun 1 (Farklı Biçimler)',
          fixMsg: 'Farklı biçimlerdeki verilerin anlaşılabilmesi için "Ortak Biçim" kuralı seçilmelidir.'
        },
        {
          id: 'w3_h_q2',
          expected: 'SEQUENCE_INFO',
          title: 'Sorun 2 (Karışık Sıra)',
          fixMsg: 'Karışık sırada gelen parçaların düzgün birleştirilmesi için "Sıra Bilgisi" kuralı seçilmelidir.'
        },
        {
          id: 'w3_h_q3',
          expected: 'TARGET_INFO',
          title: 'Sorun 3 (Belirsiz Hedef)',
          fixMsg: 'Paketin kime teslim edileceğinin bilinmesi için "Hedef Bilgisi" kuralı seçilmelidir.'
        }
      ];

      const feedbackItems: ValidationFeedbackItem[] = [];
      let correctCount = 0;

      for (const r of rules) {
        if (answers[r.id] === r.expected) {
          correctCount++;
          feedbackItems.push({
            fieldId: r.id,
            isCorrect: true,
            message: `${r.title}: Doğru protokol kuralı seçildi.`
          });
        } else {
          feedbackItems.push({
            fieldId: r.id,
            isCorrect: false,
            message: `${r.title}: ${r.fixMsg}`
          });
        }
      }

      const passed = correctCount === 3;
      return {
        passed,
        summaryMessage: passed
          ? 'Tebrikler! İletişimin üç temel kuralını doğru eşleştirdin.'
          : `${correctCount}/3 kural doğru. Hatalı seçimleri açıklamaya göre düzelt.`,
        feedbackItems
      };
    }

    // ========================================================================
    // HAFTA 4
    // ========================================================================
    case 'W4-A1': {
      // Cihazlara IP Ver (192.168.1.1 gateway, mask 255.255.255.0)
      const assignments = (state.ipAssignments && typeof state.ipAssignments === 'object'
        ? state.ipAssignments
        : {}) as Record<string, string>;

      return validateIpAssignmentForThreeDevices(
        assignments,
        [
          { id: 'dev_pc1', label: 'Bilgisayar 1' },
          { id: 'dev_pc2', label: 'Bilgisayar 2' },
          { id: 'dev_printer', label: 'Ağ Yazıcısı' }
        ]
      );
    }

    case 'W4-A2': {
      // Yazıcının MAC Adresini Bul
      const broadcastSent = Boolean(state.broadcastSent);
      const selectedTargetId = String(state.selectedTargetId || '');
      const selectedMacCardId = String(state.selectedMacCardId || '');

      const step1Ok = broadcastSent;
      const step2Ok = step1Ok && selectedTargetId === 'host_printer';
      const step3Ok =
        step2Ok &&
        (selectedMacCardId === 'mac_20' || selectedMacCardId === '02:00:00:00:00:20');

      const feedbackItems: ValidationFeedbackItem[] = [
        {
          fieldId: 'arp_step1',
          isCorrect: step1Ok,
          message: step1Ok
            ? 'Adım 1 Doğru: Bilgisayar A yerel ağa ARP yayın (broadcast) isteğini gönderdi.'
            : 'Adım 1: Önce "ARP Yayın İsteğini Başlat" düğmesine tıklamalısın.'
        },
        {
          fieldId: 'arp_step2',
          isCorrect: step2Ok,
          message: step2Ok
            ? 'Adım 2 Doğru: 192.168.1.20 IP adresine sahip olan Ağ Yazıcısını seçtin.'
            : selectedTargetId === 'host_b'
            ? 'Adım 2: Bilgisayar B’nin IP adresi 192.168.1.30’dur; oysa biz 192.168.1.20 adresli Yazıcıyı arıyoruz.'
            : 'Adım 2: ARP isteğine yanıt verecek olan 192.168.1.20 IP adresli cihazı (Ağ Yazıcısı) seçmelisin.'
        },
        {
          fieldId: 'arp_step3',
          isCorrect: step3Ok,
          message: step3Ok
            ? 'Adım 3 Doğru: Yazıcının MAC adresi olan 02:00:00:00:00:20 kartını ARP tablosuna eşleştirdin.'
            : 'Adım 3: Yazıcının (192.168.1.20) kendi donanım adresi olan "02:00:00:00:00:20" MAC kartını seçmelisin.'
        }
      ];

      const passed = step1Ok && step2Ok && step3Ok;
      return {
        passed,
        summaryMessage: passed
          ? 'Tebrikler! ARP yayın isteği ve tekil (unicast) yanıt sürecini tamamlayarak yazıcının MAC adresini buldun.'
          : 'ARP adımlarından bazıları eksik veya yanlış seçildi. Aşağıdaki yönlendirmeleri takip et.',
        feedbackItems
      };
    }

    case 'W4-Q': {
      return validateQuiz(state, [
        {
          id: 'w4_q1',
          correct: 'a',
          okMsg: '1. Soru Doğru: Bağlanılan ağa göre değişebilen mantıksal ağ adresi IP adresidir.',
          errMsg: '1. Soru: Cihazın hangi ağda bulunduğunu gösteren ve ağ değiştikçe değişebilen mantıksal adres IP adresidir.'
        },
        {
          id: 'w4_q2',
          correct: 'a',
          okMsg: '2. Soru Doğru: Ağ kartı üzerindeki fiziksel/donanım adresi MAC adresidir.',
          errMsg: '2. Soru: Ağ kartına (NIC) ait olan ve yerel ağ içi çerçeve teslimatında kullanılan donanım adresi MAC adresidir.'
        },
        {
          id: 'w4_q3',
          correct: 'a',
          okMsg: '3. Soru Doğru: IPv4 yerel ağında bilinen IP adresinin MAC karşılığını bulan protokol ARP’tır.',
          errMsg: '3. Soru: "Bu IP adresi kimde?" diye yerel ağa sorarak MAC adresini öğrenen protokol ARP (Address Resolution Protocol) protokolüdür.'
        }
      ]);
    }

    case 'W4-H': {
      // Adres Karışıklığını Düzelt
      const assignments = (state.ipAssignments && typeof state.ipAssignments === 'object'
        ? state.ipAssignments
        : {}) as Record<string, string>;
      const reasonAnswer = String(state.followUpAnswer || '');

      const ipCheck = validateIpAssignmentForThreeDevices(
        assignments,
        [
          { id: 'conflict_pc1', label: 'Muhasebe PC 1' },
          { id: 'conflict_pc2', label: 'Muhasebe PC 2' },
          { id: 'conflict_printer', label: 'Ofis Yazıcısı' }
        ]
      );

      const reasonOk = reasonAnswer === 'REASON_UNIQUE_DELIVERY';
      const feedbackItems: ValidationFeedbackItem[] = [
        ...ipCheck.feedbackItems,
        {
          fieldId: 'followUpAnswer',
          isCorrect: reasonOk,
          message: reasonOk
            ? 'Kontrol Sorusu Doğru: Her cihazın benzersiz IP adresi olması paketlerin karışmadan doğru hedefe ulaşmasını sağlar.'
            : 'Kontrol Sorusu: Cihazlara farklı IP adresi verilmesinin nedeni veri paketlerinin karışmadan doğru cihaza teslim edilmesidir.'
        }
      ];

      const passed = ipCheck.passed && reasonOk;
      return {
        passed,
        summaryMessage: passed
          ? 'Tebrikler! IP adres çakışmasını giderdin ve kontrol sorusunu doğru yanıtladın.'
          : 'IP çakışmasını gidermeli (üç cihaza üç farklı 192.168.1.x adresi vermeli) ve kontrol sorusunu doğru işaretlemelisin.',
        feedbackItems
      };
    }

    // ========================================================================
    // HAFTA 5
    // ========================================================================
    case 'W5-A1': {
      // Doğru Yolu Göster
      const paths = (state.paths && typeof state.paths === 'object' ? state.paths : {}) as Record<string, string[]>;
      const localPath = Array.isArray(paths.local_path) ? paths.local_path.map(String) : [];
      const externalPath = Array.isArray(paths.external_path) ? paths.external_path.map(String) : [];

      const expectedLocal = ['pc', 'switch', 'printer'];
      // Accept either ['pc', 'switch', 'router', 'remote_server'] or with cloud_wan in between
      const expectedExternalDirect = ['pc', 'switch', 'router', 'remote_server'];
      const expectedExternalWithCloud = ['pc', 'switch', 'router', 'cloud_wan', 'remote_server'];

      const localOk = arraysEqual(localPath, expectedLocal);
      const externalOk =
        arraysEqual(externalPath, expectedExternalDirect) ||
        arraysEqual(externalPath, expectedExternalWithCloud);

      const feedbackItems: ValidationFeedbackItem[] = [
        {
          fieldId: 'local_path',
          isCorrect: localOk,
          message: localOk
            ? '1. Görev (Yerel Ağ Yolu) Doğru: Bilgisayar → Switch → Yerel Yazıcı.'
            : localPath.includes('router')
            ? '1. Görev (Yerel Ağ Yolu): Yerel ağdaki yazıcıya giderken Yönlendiriciye (Router) çıkılmaz! Sıralama "Bilgisayar → Switch → Yerel Yazıcı" olmalıdır.'
            : '1. Görev (Yerel Ağ Yolu): Sırasıyla "Bilgisayar → Switch → Yerel Yazıcı" cihazlarını seçmelisin.'
        },
        {
          fieldId: 'external_path',
          isCorrect: externalOk,
          message: externalOk
            ? '2. Görev (Dış Ağ Yolu) Doğru: Bilgisayar → Switch → Yönlendirici → Uzak Sunucu.'
            : '2. Görev (Dış Ağ Yolu): Başka bir ağdaki Uzak Sunucuya çıkarken sırasıyla "Bilgisayar → Switch → Yönlendirici → Uzak Sunucu" yolunu seçmelisin.'
        }
      ];

      const passed = localOk && externalOk;
      return {
        passed,
        summaryMessage: passed
          ? 'Mükemmel! Hem yerel ağ içi yolu hem de yönlendirici üzerinden dış ağa çıkış yolunu doğru gösterdin.'
          : 'Yollardan biri veya ikisi hatalı. Yerel ağda sadece Switch kullanıldığını, dış ağa çıkarken ise Switch’ten sonra Yönlendiriciye gidildiğini hatırla.',
        feedbackItems
      };
    }

    case 'W5-A2': {
      // İlk Neyi Kontrol Edersin?
      const answers = (state.answers && typeof state.answers === 'object' ? state.answers : {}) as Record<string, string>;
      const rules = [
        {
          id: 'w5_a2_s1',
          expected: 'CHECK_CABLE',
          title: 'Durum 1 (Çıkmış Ethernet kablosu)',
          fixMsg: 'Bilgisayarda kablo takılı değil uyarısı varsa ilk kontrol adımı Ethernet kablosunun iki ucunun da yuvasına tam oturduğunu kontrol etmektir.'
        },
        {
          id: 'w5_a2_s2',
          expected: 'CHECK_WIFI',
          title: 'Durum 2 (Wi-Fi’ye bağlı olmayan telefon)',
          fixMsg: 'Diğer cihazlar çalışırken tek bir telefonda Wi-Fi simgesi yoksa ilk adım telefonun Wi-Fi ayarını ve ağ bağlantısını kontrol etmektir.'
        },
        {
          id: 'w5_a2_s3',
          expected: 'CHECK_WAN_ISP',
          title: 'Durum 3 (Yerel yazıcı çalışıyor ama tüm cihazlarda internet yok)',
          fixMsg: 'Yerel ağ çalışıyor ancak hiçbir cihaz internete çıkamıyorsa ilk adım yönlendirici/modem cihazının dış internet (WAN/servis sağlayıcı) bağlantısını kontrol etmektir.'
        }
      ];

      const feedbackItems: ValidationFeedbackItem[] = [];
      let correctCount = 0;

      for (const r of rules) {
        if (answers[r.id] === r.expected) {
          correctCount++;
          feedbackItems.push({
            fieldId: r.id,
            isCorrect: true,
            message: `${r.title}: En mantıklı ilk kontrol adımını seçtin.`
          });
        } else {
          feedbackItems.push({
            fieldId: r.id,
            isCorrect: false,
            message: `${r.title}: ${r.fixMsg}`
          });
        }
      }

      const passed = correctCount === 3;
      return {
        passed,
        summaryMessage: passed
          ? 'Tebrikler! Üç ağ sorununda da uygulanması gereken ilk kontrol adımlarını doğru belirledin.'
          : `${correctCount}/3 durum doğru. Açıklamalara göre hatalı seçimleri düzelt.`,
        feedbackItems
      };
    }

    case 'W5-Q': {
      return validateQuiz(state, [
        {
          id: 'w5_q1',
          correct: 'a',
          okMsg: '1. Soru Doğru: Yerel ağdan dış ağlara (internete) çıkış kapısı Yönlendiricidir (Router).',
          errMsg: '1. Soru: Yerel ağdaki bir cihazın başka bir ağa/internete çıkması için paketleri Yönlendiriciye (Router / Varsayılan Ağ Geçidi) göndermesi gerekir.'
        },
        {
          id: 'w5_q2',
          correct: 'a',
          okMsg: '2. Soru Doğru: IPv6, IPv4 adreslerinin yetersiz kalması nedeniyle çok daha geniş bir adres alanı sunmak için geliştirilmiştir.',
          errMsg: '2. Soru: IPv6 protokolünün temel amacı, artan cihaz sayısı karşısında yetersiz kalan IPv4 adres alanını 128-bit ile çok geniş bir adres alanına taşımaktır.'
        },
        {
          id: 'w5_q3',
          correct: 'a',
          okMsg: '3. Soru Doğru: İnternet kesilse bile aynı yerel ağdaki (LAN) cihazlar yerel yazıcıyı kullanmaya devam edebilir.',
          errMsg: '3. Soru: Dış internet kesildiğinde bile yerel ağ (Switch/LAN) çalışmaya devam eder; yerel yazıcı ve dosya paylaşımı kullanılabilir.'
        }
      ]);
    }

    case 'W5-H': {
      // Küçük Ağımı Tamamlıyorum (4 Adımlı Capstone)
      // 1. Edges: pc1-switch, pc2-switch, printer-switch, switch-router
      const edgeResult = validateNetworkEdges(
        state.edges,
        [
          { from: 'pc1', to: 'switch', connectionType: 'wired', label: 'PC 1 ↔ Switch' },
          { from: 'pc2', to: 'switch', connectionType: 'wired', label: 'PC 2 ↔ Switch' },
          { from: 'printer', to: 'switch', connectionType: 'wired', label: 'Yazıcı ↔ Switch' },
          { from: 'switch', to: 'router', connectionType: 'wired', label: 'Switch ↔ Yönlendirici' }
        ],
        false
      );

      // 2. IP assignments: pc1, pc2, printer -> 3 distinct valid 192.168.1.x
      const ipResult = validateIpAssignmentForThreeDevices(
        (state.ipAssignments && typeof state.ipAssignments === 'object' ? state.ipAssignments : {}) as Record<string, string>,
        [
          { id: 'pc1', label: 'PC 1' },
          { id: 'pc2', label: 'PC 2' },
          { id: 'printer', label: 'Yazıcı' }
        ]
      );

      // 3. Local printer path: pc1 -> switch -> printer
      const localPath = Array.isArray(state.localPath) ? state.localPath.map(String) : [];
      const step3Ok = arraysEqual(localPath, ['pc1', 'switch', 'printer']);

      // 4. External path: pc1 -> switch -> router -> remote_server
      const externalPath = Array.isArray(state.externalPath) ? state.externalPath.map(String) : [];
      const step4Ok = arraysEqual(externalPath, ['pc1', 'switch', 'router', 'remote_server']);

      const feedbackItems: ValidationFeedbackItem[] = [
        {
          fieldId: 'step1_topology',
          isCorrect: edgeResult.passed,
          message: edgeResult.passed
            ? 'Adım 1 (Ağ Bağlantıları) Tamamlandı: PC 1, PC 2, Yazıcı ↔ Switch ve Switch ↔ Yönlendirici bağlantıları doğru.'
            : `Adım 1 (Ağ Bağlantıları): ${edgeResult.summaryMessage}`
        },
        {
          fieldId: 'step2_ip',
          isCorrect: ipResult.passed,
          message: ipResult.passed
            ? 'Adım 2 (IP Adresleme) Tamamlandı: Üç cihaza da çakışmayan uygun 192.168.1.x adresleri verildi.'
            : `Adım 2 (IP Adresleme): ${ipResult.summaryMessage}`
        },
        {
          fieldId: 'step3_local_path',
          isCorrect: step3Ok,
          message: step3Ok
            ? 'Adım 3 (Yerel Yazıcı Yolu) Tamamlandı: PC 1 → Switch → Yazıcı.'
            : 'Adım 3 (Yerel Yazıcı Yolu): Sırasıyla "PC 1 → Switch → Yazıcı" cihazlarını seçmelisin.'
        },
        {
          fieldId: 'step4_external_path',
          isCorrect: step4Ok,
          message: step4Ok
            ? 'Adım 4 (Dış Ağ Çıkış Yolu) Tamamlandı: PC 1 → Switch → Yönlendirici → Uzak Sunucu.'
            : 'Adım 4 (Dış Ağ Çıkış Yolu): Sırasıyla "PC 1 → Switch → Yönlendirici → Uzak Sunucu" cihazlarını seçmelisin.'
        }
      ];

      const passed = edgeResult.passed && ipResult.passed && step3Ok && step4Ok;
      return {
        passed,
        summaryMessage: passed
          ? 'Tebrikler! 5 haftalık Ağ Atölyem final öncesi uygulama ödevinin 4 adımını da başarıyla tamamladın!'
          : 'Tamamlanan adımların kaydedildi. Henüz tamamlanmayan adımları aşağıdaki listeye göre düzeltebilirsin.',
        feedbackItems
      };
    }

    default:
      return {
        passed: false,
        summaryMessage: 'Bilinmeyen etkinlik kodu.',
        feedbackItems: []
      };
  }
}

function validateQuiz(
  state: Record<string, any>,
  rules: { id: string; correct: string; okMsg: string; errMsg: string }[]
): ActivityValidationResult {
  const answers = (state.answers && typeof state.answers === 'object' ? state.answers : {}) as Record<string, string>;
  const feedbackItems: ValidationFeedbackItem[] = [];
  let correctCount = 0;

  for (const r of rules) {
    const chosen = answers[r.id];
    if (chosen === r.correct) {
      correctCount++;
      feedbackItems.push({
        fieldId: r.id,
        isCorrect: true,
        message: r.okMsg
      });
    } else if (!chosen) {
      feedbackItems.push({
        fieldId: r.id,
        isCorrect: false,
        message: 'Lütfen bu soru için bir seçenek işaretle.'
      });
    } else {
      feedbackItems.push({
        fieldId: r.id,
        isCorrect: false,
        message: r.errMsg
      });
    }
  }

  const passed = correctCount === rules.length;
  return {
    passed,
    summaryMessage: passed
      ? 'Tebrikler! Hafta değerlendirmesindeki 3 sorunun tamamını doğru yanıtladın.'
      : `${correctCount}/${rules.length} soru doğru. Doğru cevapların korundu; açıklamalara göre diğer soruları tekrar dene.`,
    feedbackItems
  };
}

function validateIpAssignmentForThreeDevices(
  assignments: Record<string, string>,
  devices: { id: string; label: string }[]
): ActivityValidationResult {
  const validSubnetIps = new Set(['192.168.1.10', '192.168.1.20', '192.168.1.30']);
  const countByIp = new Map<string, string[]>();

  for (const d of devices) {
    const ip = assignments[d.id];
    if (ip) {
      const list = countByIp.get(ip) || [];
      list.push(d.label);
      countByIp.set(ip, list);
    }
  }

  const feedbackItems: ValidationFeedbackItem[] = [];
  let validAndUniqueCount = 0;

  for (const d of devices) {
    const ip = assignments[d.id];
    if (!ip) {
      feedbackItems.push({
        fieldId: d.id,
        isCorrect: false,
        message: `${d.label} için henüz bir IP adresi seçmedin.`
      });
      continue;
    }

    if (ip === '192.168.1.1') {
      feedbackItems.push({
        fieldId: d.id,
        isCorrect: false,
        message: `${d.label}: 192.168.1.1 adresi Yönlendiriciye (Ağ Geçidine) aittir! Uç cihazlara yönlendiriciyle aynı IP verilemez.`
      });
      continue;
    }

    if (!validSubnetIps.has(ip)) {
      feedbackItems.push({
        fieldId: d.id,
        isCorrect: false,
        message: `${d.label}: Seçilen ${ip} adresi 255.255.255.0 maskesine göre farklı bir ağdadır (192.168.2.x). Adres 192.168.1.x ile başlamalıdır.`
      });
      continue;
    }

    const users = countByIp.get(ip) || [];
    if (users.length > 1) {
      feedbackItems.push({
        fieldId: d.id,
        isCorrect: false,
        message: `${d.label}: IP Çakışması! ${ip} adresi hem ${users.join(' hem de ')} cihazına verilmiş. Aynı ağda iki cihaz aynı IP adresini kullanamaz.`
      });
      continue;
    }

    validAndUniqueCount++;
    feedbackItems.push({
      fieldId: d.id,
      isCorrect: true,
      message: `${d.label}: ${ip} adresi uygun ve benzersiz.`
    });
  }

  const passed = validAndUniqueCount === devices.length;
  return {
    passed,
    summaryMessage: passed
      ? 'Harika! Tüm cihazlara aynı yerel ağda (192.168.1.0/24) çakışmayan geçerli IP adresleri atadın.'
      : 'IP adreslerinde çakışma, eksik seçim veya farklı alt ağ (192.168.2.10) hatası var. Aşağıdaki uyarıları incele.',
    feedbackItems
  };
}

function arraysEqual(a: string[], b: string[]): boolean {
  if (a.length !== b.length) return false;
  for (let i = 0; i < a.length; i++) {
    if (a[i] !== b[i]) return false;
  }
  return true;
}
