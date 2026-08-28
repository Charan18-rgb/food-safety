/**
 * Splits an ingredient string by top-level commas and semicolons,
 * respecting nesting within parentheses `()`, brackets `[]`, and curly braces `{}`.
 */
export function tokenizeIngredientList(rawText: string): string[] {
  if (!rawText || typeof rawText !== 'string') return [];

  const tokens: string[] = [];
  let currentToken = '';
  let parenDepth = 0;
  let bracketDepth = 0;
  let braceDepth = 0;

  for (let i = 0; i < rawText.length; i++) {
    const char = rawText[i];

    if (char === '(') parenDepth++;
    else if (char === ')') parenDepth = Math.max(0, parenDepth - 1);
    else if (char === '[') bracketDepth++;
    else if (char === ']') bracketDepth = Math.max(0, bracketDepth - 1);
    else if (char === '{') braceDepth++;
    else if (char === '}') braceDepth = Math.max(0, braceDepth - 1);

    // Split on comma or semicolon only if outside all nested delimiters
    const isTopLevelSeparator = (char === ',' || char === ';') && parenDepth === 0 && bracketDepth === 0 && braceDepth === 0;

    if (isTopLevelSeparator) {
      const clean = cleanToken(currentToken);
      if (clean) tokens.push(clean);
      currentToken = '';
    } else {
      currentToken += char;
    }
  }

  // Push remaining trailing token
  const cleanTrailing = cleanToken(currentToken);
  if (cleanTrailing) tokens.push(cleanTrailing);

  return tokens;
}

/**
 * Cleans individual ingredient tokens (removing bullet points, numbering, trailing punctuation).
 */
function cleanToken(token: string): string {
  let t = token.trim();
  // Remove leading numbers or bullets (e.g. "1. ", "• ", "- ")
  t = t.replace(/^[\d+.)\-•*·\s]+/, '');
  // Remove trailing periods and semicolons
  t = t.replace(/[.;]+$/, '');
  return t.trim();
}
