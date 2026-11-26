import { GpActivityDefinition, GpWeekDefinition } from '../types';
import { GP_WEEK_1 } from './week1';
import { GP_WEEK_2 } from './week2';
import { GP_WEEK_3 } from './week3';
import { GP_WEEK_4 } from './week4';
import { GP_WEEK_5 } from './week5';

export const GP_CURRICULUM_WEEKS: GpWeekDefinition[] = [
  GP_WEEK_1,
  GP_WEEK_2,
  GP_WEEK_3,
  GP_WEEK_4,
  GP_WEEK_5
];

export function getGpActivityByCode(code: string): GpActivityDefinition | undefined {
  for (const w of GP_CURRICULUM_WEEKS) {
    const found = w.activities.find((a) => a.code === code || a.id === code);
    if (found) return found;
  }
  return undefined;
}

export function exportGpCurriculumToMarkdown(weekOrder?: number): string {
  const weeks = weekOrder
    ? GP_CURRICULUM_WEEKS.filter((w) => w.order === weekOrder)
    : GP_CURRICULUM_WEEKS;

  const lines: string[] = [
    '# Görsel Programlama Atölyesi — Sunum ve Ders Yönergesi',
    '',
    '> Bu dosya paneldeki yapılandırılmış müfredat verisinden otomatik olarak dışa aktarılmıştır.',
    ''
  ];

  for (const w of weeks) {
    lines.push(`## Hafta ${w.order}: ${w.title}`);
    lines.push('');
    lines.push(w.description);
    lines.push('');
    lines.push('**Haftalık Hedefler:**');
    for (const obj of w.objectives) {
      lines.push(`- ${obj}`);
    }
    lines.push('');

    for (const act of w.activities) {
      lines.push(`### ${act.code} — ${act.title}`);
      lines.push(
        `- **Zorluk:** ${act.difficulty} | **Süre:** ${act.durationMinutes} dk | **Ortam:** ${
          act.environment === 'web+excel' ? 'Web + Excel' : 'Web'
        }`
      );
      lines.push(`- **Ne yapacağım?** ${act.instructions.whatToDo}`);
      lines.push(`- **Nereden başlayacağım?** ${act.instructions.whereToStart}`);
      lines.push(`- **Hangi verileri kullanacağım?** ${act.instructions.whichData}`);
      lines.push(`- **Nasıl bir sonuç görmeliyim?** ${act.instructions.expectedResult}`);
      lines.push(`- **Tamamlandığını nasıl anlayacağım?** ${act.instructions.howToKnowDone}`);
      if (act.teacherNotes) {
        lines.push(`- **Öğretmen Notu:** ${act.teacherNotes}`);
      }
      lines.push('');
    }
  }

  return lines.join('\n');
}
