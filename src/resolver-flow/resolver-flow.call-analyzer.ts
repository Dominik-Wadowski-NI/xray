import { CallExpression, Node } from 'ts-morph';

export function getCallName(callExpr: CallExpression): { symbol: string; method: string } {
  const expr = callExpr.getExpression();
  
  if (Node.isIdentifier(expr)) {
    return { symbol: 'unknown', method: expr.getText() };
  }

  if (Node.isPropertyAccessExpression(expr)) {
    return parsePropertyAccess(expr.getText());
  }

  return { symbol: 'unknown', method: 'unknown' };
}

function parsePropertyAccess(propText: string): { symbol: string; method: string } {
  const parts = propText.split('.');
  
  if (parts.length >= 2) {
    return {
      symbol: parts[0] ?? 'unknown',
      method: parts[parts.length - 1] ?? 'unknown',
    };
  }

  return {
    symbol: 'unknown',
    method: propText || 'unknown',
  };
}

export function getSnippet(callExpr: CallExpression): string {
  try {
    let text = callExpr.getText();
    if (text.length > 100) {
      text = text.substring(0, 97) + '...';
    }
    return text;
  } catch {
    return 'unknown call';
  }
}
