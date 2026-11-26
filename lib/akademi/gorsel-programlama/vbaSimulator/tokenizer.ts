import { VbaSimError, VbaToken } from './types';

const KEYWORDS = new Set([
  'OPTION',
  'EXPLICIT',
  'PRIVATE',
  'PUBLIC',
  'SUB',
  'END',
  'DIM',
  'CONST',
  'AS',
  'SET',
  'IF',
  'THEN',
  'ELSEIF',
  'ELSE',
  'FOR',
  'TO',
  'STEP',
  'NEXT',
  'DO',
  'WHILE',
  'LOOP',
  'EXIT',
  'AND',
  'OR',
  'NOT',
  'MOD',
  'TRUE',
  'FALSE',
  'MSGBOX',
  'CALL'
]);

const UNSUPPORTED_KEYWORDS = new Set([
  'ON',
  'GOTO',
  'RESUME',
  'SELECT',
  'CASE',
  'WITH',
  'FUNCTION',
  'CLASS',
  'TYPE',
  'ENUM',
  'REDIM',
  'OPEN',
  'CLOSE',
  'PRINT',
  'WRITE',
  'SHELL',
  'DOEVENTS',
  'CREATEOBJECT',
  'GETOBJECT',
  'DECLARE',
  'PTRSAFE',
  'WHILE' // standalone While..Wend without Do
]);

export function tokenizeVba(source: string): {
  tokens: VbaToken[];
  error?: VbaSimError;
} {
  const tokens: VbaToken[] = [];
  const normalized = source.replace(/\r\n/g, '\n').replace(/\r/g, '\n');
  const lines = normalized.split('\n');

  for (let lineIdx = 0; lineIdx < lines.length; lineIdx++) {
    const lineNum = lineIdx + 1;
    const rawLine = lines[lineIdx];
    let i = 0;

    while (i < rawLine.length) {
      const ch = rawLine[i];

      // Whitespace
      if (ch === ' ' || ch === '\t') {
        i++;
        continue;
      }

      // Comment starting with single quote
      if (ch === "'") {
        break;
      }

      // Colon statement separator -> treat as NEWLINE
      if (ch === ':') {
        tokens.push({ type: 'NEWLINE', value: ':', line: lineNum, col: i + 1 });
        i++;
        continue;
      }

      // String literal
      if (ch === '"') {
        const startCol = i + 1;
        i++;
        let strVal = '';
        let closed = false;
        while (i < rawLine.length) {
          if (rawLine[i] === '"') {
            // Escaped quote "" in VBA
            if (i + 1 < rawLine.length && rawLine[i + 1] === '"') {
              strVal += '"';
              i += 2;
              continue;
            }
            closed = true;
            i++;
            break;
          }
          strVal += rawLine[i];
          i++;
        }
        if (!closed) {
          return {
            tokens,
            error: {
              line: lineNum,
              message: `Satır ${lineNum}: Kapatılmamış metin tırnağı (") bulundu.`
            }
          };
        }
        tokens.push({ type: 'STRING', value: strVal, line: lineNum, col: startCol });
        continue;
      }

      // Numbers
      if (/[0-9]/.test(ch)) {
        const startCol = i + 1;
        let numStr = '';
        let hasDot = false;
        while (i < rawLine.length && (/[0-9]/.test(rawLine[i]) || (rawLine[i] === '.' && !hasDot))) {
          if (rawLine[i] === '.') hasDot = true;
          numStr += rawLine[i];
          i++;
        }
        tokens.push({ type: 'NUMBER', value: numStr, line: lineNum, col: startCol });
        continue;
      }

      // Identifiers & Keywords
      if (/[a-zA-Z_ğüşöçıİĞÜŞÖÇ]/.test(ch)) {
        const startCol = i + 1;
        let ident = '';
        while (i < rawLine.length && /[a-zA-Z0-9_ğüşöçıİĞÜŞÖÇ]/.test(rawLine[i])) {
          ident += rawLine[i];
          i++;
        }
        const upper = ident.toUpperCase();
        if (upper === 'REM' && (i === rawLine.length || rawLine[i] === ' ' || rawLine[i] === '\t')) {
          break; // REM comment
        }
        if (KEYWORDS.has(upper)) {
          tokens.push({ type: 'KEYWORD', value: upper, line: lineNum, col: startCol });
        } else {
          tokens.push({ type: 'IDENT', value: ident, line: lineNum, col: startCol });
        }
        continue;
      }

      // Multi-char operators
      const twoChar = rawLine.slice(i, i + 2);
      if (twoChar === '<>' || twoChar === '<=' || twoChar === '>=') {
        tokens.push({ type: 'OP', value: twoChar, line: lineNum, col: i + 1 });
        i += 2;
        continue;
      }

      // Single-char operators & punctuation
      if ('+-*/&=<>'.includes(ch)) {
        tokens.push({ type: 'OP', value: ch, line: lineNum, col: i + 1 });
        i++;
        continue;
      }
      if (ch === '(') {
        tokens.push({ type: 'LPAREN', value: '(', line: lineNum, col: i + 1 });
        i++;
        continue;
      }
      if (ch === ')') {
        tokens.push({ type: 'RPAREN', value: ')', line: lineNum, col: i + 1 });
        i++;
        continue;
      }
      if (ch === ',') {
        tokens.push({ type: 'COMMA', value: ',', line: lineNum, col: i + 1 });
        i++;
        continue;
      }
      if (ch === '.') {
        tokens.push({ type: 'DOT', value: '.', line: lineNum, col: i + 1 });
        i++;
        continue;
      }

      return {
        tokens,
        error: {
          line: lineNum,
          message: `Satır ${lineNum}: Tanınmayan karakter '${ch}'.`
        }
      };
    }

    tokens.push({ type: 'NEWLINE', value: '\n', line: lineNum, col: rawLine.length + 1 });
  }

  tokens.push({ type: 'EOF', value: '', line: lines.length, col: 1 });
  return { tokens };
}

export function isUnsupportedKeyword(word: string): boolean {
  return UNSUPPORTED_KEYWORDS.has(word.toUpperCase());
}
