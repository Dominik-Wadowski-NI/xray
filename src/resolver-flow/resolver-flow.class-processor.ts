import { FunctionLikeDeclaration, NewExpression, Node, SourceFile } from 'ts-morph';
import { ClassInstantiation, ScannerContext } from './resolver-flow.types';
import { collectNewExpressions } from './resolver-flow.ast-visitor';
import { isBuiltinClass } from './resolver-flow.builtins-filter';

export function processClassInstantiations(
  funcNode: FunctionLikeDeclaration,
  sourceFile: SourceFile,
  context: ScannerContext
): void {
  const newExprs = collectNewExpressions(funcNode);
  const sourceFilePath = sourceFile.getFilePath();

  for (const newExpr of newExprs) {
    const classInst = extractClassInstantiation(newExpr, sourceFilePath, context);
    if (!isBuiltinClass(classInst.className)) {
      context.classInstantiations.push(classInst);
    }
  }
}

function extractClassInstantiation(
  newExpr: NewExpression,
  sourceFilePath: string,
  context: ScannerContext
): ClassInstantiation {
  const expr = newExpr.getExpression();
  const className = extractClassName(expr);
  const definitionFile = tryFindDefinitionFile(expr);

  return {
    order: context.callOrder++,
    className,
    file: sourceFilePath,
    line: newExpr.getStartLineNumber(),
    definitionFile,
  };
}

function extractClassName(expr: Node): string {
  if (Node.isIdentifier(expr)) {
    return expr.getText();
  }
  return 'UnknownClass';
}

function tryFindDefinitionFile(expr: Node): string | undefined {
  try {
    const defs = (expr as any).getDefinitionNodes?.() ?? [];
    if (defs.length > 0) {
      return defs[0].getSourceFile().getFilePath();
    }
  } catch {
    // ignore
  }
  return undefined;
}
