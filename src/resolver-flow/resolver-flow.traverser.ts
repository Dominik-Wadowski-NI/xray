import { FunctionLikeDeclaration, SourceFile } from 'ts-morph';
import { ScannerContext } from './resolver-flow.types';
import { buildImportMap } from './resolver-flow.import-map';
import { collectDirectCallExpressions } from './resolver-flow.ast-visitor';
import { processCall } from './resolver-flow.call-processor';
import { processClassInstantiations } from './resolver-flow.class-processor';

export function scanFunction(
  funcNode: FunctionLikeDeclaration,
  sourceFile: SourceFile,
  context: ScannerContext
): void {
  const sourceFilePath = sourceFile.getFilePath();
  const startLine = (funcNode as any).getStartLineNumber?.();

  if (!startLine || isAlreadyVisited(sourceFilePath, startLine, context)) {
    return;
  }

  markAsVisited(sourceFilePath, startLine, context);

  processFunctionBody(funcNode, sourceFile, context);
}

function isAlreadyVisited(filePath: string, line: number, context: ScannerContext): boolean {
  const visitKey = `${filePath}:${line}`;
  return context.visited.has(visitKey);
}

function markAsVisited(filePath: string, line: number, context: ScannerContext): void {
  const visitKey = `${filePath}:${line}`;
  context.visited.add(visitKey);
}

function processFunctionBody(
  funcNode: FunctionLikeDeclaration,
  sourceFile: SourceFile,
  context: ScannerContext
): void {
  const importMap = buildImportMap(sourceFile);
  processCalls(funcNode, sourceFile, importMap, context);
  processClassInstantiations(funcNode, sourceFile, context);
}

function processCalls(
  funcNode: FunctionLikeDeclaration,
  sourceFile: SourceFile,
  importMap: Map<string, string>,
  context: ScannerContext
): void {
  const calls = collectDirectCallExpressions(funcNode);

  for (const call of calls) {
    processCall(call, sourceFile, importMap, context);
  }
}

