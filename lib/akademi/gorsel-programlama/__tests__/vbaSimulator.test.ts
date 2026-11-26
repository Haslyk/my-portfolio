import test from 'node:test';
import assert from 'node:assert/strict';
import {
  runVbaSimulation,
  parseVbaProgram,
  hasLoopInVbaAst
} from '../vbaSimulator';
import { gradeGpActivitySubmission } from '../activityGraders';
import { GP_CURRICULUM_WEEKS, exportGpCurriculumToMarkdown } from '../curriculum';

test('Curriculum has 5 weeks and 25 activities with required durations and difficulties', () => {
  assert.equal(GP_CURRICULUM_WEEKS.length, 5);
  const expectedDurations = [10, 15, 20, 40, 40];
  const expectedDifficulties = ['Basit', 'Basit–orta', 'Orta', 'Orta–zor', 'Zor'];

  let total = 0;
  for (const w of GP_CURRICULUM_WEEKS) {
    assert.equal(w.activities.length, 5);
    w.activities.forEach((act, idx) => {
      total++;
      assert.equal(act.durationMinutes, expectedDurations[idx]);
      assert.equal(act.difficulty, expectedDifficulties[idx]);
    });
  }
  assert.equal(total, 25);
});

test('VBA semantics: & concatenation, IsNumeric, CLng, And/Or, case-insensitivity', () => {
  const code = `
Option Explicit
Private Sub btnTest_Click()
  Dim a As String, b As String
  Dim n As Long
  a = "10"
  b = "5"
  If isnumeric(a) And Not (CLng(b) < 0) Then
    n = clng(a) + clng(b)
    lblSonuc.Caption = a & b & " / " & CStr(n)
  End If
End Sub
`;
  const res = runVbaSimulation({
    code,
    controls: [{ id: '1', type: 'Label', name: 'lblSonuc', caption: '' }],
    eventSubName: 'btntest_click'
  });
  assert.equal(res.ok, true);
  assert.equal(res.controls[0].caption, '105 / 15');
});

test('VBA ListBox: 0-based indexing, RemoveItem protection, Clear', () => {
  const code = `
Private Sub btnRun_Click()
  lst.Clear
  lst.AddItem "A"
  lst.AddItem "B"
  lst.RemoveItem 0
  lblCount.Caption = CStr(lst.ListCount)
End Sub
`;
  const res = runVbaSimulation({
    code,
    controls: [
      { id: '1', type: 'ListBox', name: 'lst', items: ['Eski'], listIndex: -1 },
      { id: '2', type: 'Label', name: 'lblCount', caption: '0' }
    ],
    eventSubName: 'btnRun_Click'
  });
  assert.equal(res.ok, true);
  assert.deepEqual(res.controls[0].items, ['B']);
  assert.equal(res.controls[1].caption, '1');
});

test('Safety limits: infinite loop terminates cleanly without hanging', () => {
  const code = `
Private Sub btnLoop_Click()
  Dim x As Long
  x = 1
  Do While x > 0
    x = x + 1
  Loop
End Sub
`;
  const res = runVbaSimulation({
    code,
    controls: [],
    eventSubName: 'btnLoop_Click',
    maxLoopIterations: 200
  });
  assert.equal(res.ok, false);
  assert.equal(res.error?.isLimitExceeded, true);
});

test('Unsupported command reports clear Turkish message and line number', () => {
  const code = `
Private Sub btnErr_Click()
  On Error GoTo Hata
  MsgBox "Merhaba"
End Sub
`;
  const res = runVbaSimulation({
    code,
    controls: [],
    eventSubName: 'btnErr_Click'
  });
  assert.equal(res.ok, false);
  assert.equal(res.error?.isUnsupported, true);
  assert.equal(res.error?.line, 3);
});

test('H3-E5 grading: rejects empty, text, out-of-range and passes valid solution', () => {
  const validCode = `
Option Explicit
Private Sub btnHesapla_Click()
  Dim vize As Double, finalNot As Double, ort As Double
  If Not IsNumeric(txtVize.Value) Or Not IsNumeric(txtFinal.Value) Then Exit Sub
  vize = CDbl(txtVize.Value)
  finalNot = CDbl(txtFinal.Value)
  If vize < 0 Or vize > 100 Or finalNot < 0 Or finalNot > 100 Then Exit Sub
  ort = vize * 0.4 + finalNot * 0.6
  lblOrtalama.Caption = CStr(ort)
  If ort >= 50 Then
    lblDurum.Caption = "Geçti"
  Else
    lblDurum.Caption = "Kaldı"
  End If
End Sub
`;
  const res = gradeGpActivitySubmission('H3-E5', {
    code: validCode,
    excelChecklist: { '0': true, '1': true }
  });
  assert.equal(res.passed, true);
});

test('H4-E5 grading: requires loop in AST and does not duplicate items on reload', () => {
  const buggyNoClear = `
Option Explicit
Private Sub btnYukle_Click()
  Dim ws As Worksheet, sonSatir As Long, i As Long
  Set ws = Worksheets("Urunler")
  sonSatir = ws.Cells(ws.Rows.Count, 1).End(xlUp).Row
  For i = 2 To sonSatir
    lstUrunler.AddItem ws.Cells(i, 1).Value
  Next i
End Sub
`;
  const failRes = gradeGpActivitySubmission('H4-E5', {
    code: buggyNoClear,
    excelChecklist: { '0': true, '1': true }
  });
  assert.equal(failRes.passed, false);

  const parsed = parseVbaProgram(buggyNoClear);
  assert.equal(hasLoopInVbaAst(parsed.program!), true);

  const goodWithClear = buggyNoClear.replace(
    'Set ws = Worksheets("Urunler")',
    'Set ws = Worksheets("Urunler")\n  lstUrunler.Clear'
  );
  const passRes = gradeGpActivitySubmission('H4-E5', {
    code: goodWithClear,
    excelChecklist: { '0': true, '1': true }
  });
  assert.equal(passRes.passed, true);
});

test('H5-E4 grading: writes 3 consecutive records to rows 2, 3, and 4', () => {
  const code = `
Option Explicit
Private Sub btnKaydet_Click()
  Dim ws As Worksheet
  Dim yeniSatir As Long
  Set ws = Worksheets("Kayitlar")
  yeniSatir = ws.Cells(ws.Rows.Count, 1).End(xlUp).Row + 1
  ws.Cells(yeniSatir, 1).Value = txtAd.Value
  ws.Cells(yeniSatir, 2).Value = txtNot.Value
  txtAd.Value = ""
  txtNot.Value = ""
End Sub
`;
  const res = gradeGpActivitySubmission('H5-E4', { code });
  assert.equal(res.passed, true);
});

test('Markdown export includes all 5 weeks and H1-E1..H5-E5', () => {
  const md = exportGpCurriculumToMarkdown();
  assert.ok(md.includes('H1-E1'));
  assert.ok(md.includes('H5-E5'));
});
