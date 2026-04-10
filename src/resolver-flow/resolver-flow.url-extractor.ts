import { CallExpression, Node, StringLiteral, SyntaxKind } from 'ts-morph';

export function extractUrl(callExpr: CallExpression): { url?: string; urlResolved: boolean } {
  const firstArg = getFirstArgument(callExpr);
  if (!firstArg) {
    return { urlResolved: false };
  }

  return extractUrlFromArgument(firstArg);
}

function getFirstArgument(callExpr: CallExpression): Node | undefined {
  const args = callExpr.getArguments();
  return args.length > 0 ? args[0] : undefined;
}

function extractUrlFromArgument(arg: Node): { url?: string; urlResolved: boolean } {
  if (Node.isStringLiteral(arg)) {
    return { url: arg.getLiteralValue(), urlResolved: true };
  }

  if (isTemplateLiteral(arg)) {
    return extractUrlFromTemplate(arg);
  }

  if (Node.isIdentifier(arg)) {
    return extractUrlFromIdentifier(arg);
  }

  return { urlResolved: false };
}

function isTemplateLiteral(node: Node): boolean {
  const kind = node.getKind?.();
  return kind === SyntaxKind.TemplateExpression || kind === SyntaxKind.NoSubstitutionTemplateLiteral;
}

function extractUrlFromTemplate(arg: Node): { url?: string; urlResolved: boolean } {
  try {
    const text = arg.getText();
    const literalValue = text.slice(1, -1);
    return { url: literalValue, urlResolved: true };
  } catch {
    return { urlResolved: false };
  }
}

function extractUrlFromIdentifier(arg: any): { url?: string; urlResolved: boolean } {
  try {
    const defs = arg.getDefinitionNodes?.() ?? [];
    for (const def of defs) {
      if (Node.isVariableDeclaration(def)) {
        const init = def.getInitializer();
        if (init && Node.isStringLiteral(init)) {
          return { url: init.getLiteralValue(), urlResolved: true };
        }
      }
    }
  } catch {
    // ignore
  }
  return { urlResolved: false };
}
