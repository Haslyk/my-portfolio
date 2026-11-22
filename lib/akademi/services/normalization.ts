/**
 * Türkçe karakterleri destekleyen ad/soyad temizleme ve normalizasyon yardımcıları.
 */

export function cleanWhitespace(input: string): string {
  return input.trim().replace(/\s+/g, ' ');
}

export function normalizeTurkishText(input: string): string {
  return cleanWhitespace(input).toLocaleLowerCase('tr-TR');
}

export function buildNormalizedFullName(firstName: string, lastName: string): string {
  return `${normalizeTurkishText(firstName)} ${normalizeTurkishText(lastName)}`;
}

const NAME_REGEX = /^[a-zA-ZçğıöşüÇĞİÖŞÜ\s'.-]+$/;

export function isValidTurkishName(input: string): boolean {
  const cleaned = cleanWhitespace(input);
  if (cleaned.length < 2 || cleaned.length > 60) return false;
  return NAME_REGEX.test(cleaned);
}
