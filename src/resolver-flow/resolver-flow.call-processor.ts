import { CallExpression, Node, SourceFile } from 'ts-morph';
import { ScannerContext, ExternalCall, FunctionCall, ApiRequest, DatabaseCall } from './resolver-flow.types';
import { resolvePackageForCall } from './resolver-flow.import-map';
import { classifyPackage, inferPackageFromPath, isInNodeModules } from './resolver-flow.package-classifier';
import { extractUrl } from './resolver-flow.url-extractor';
import { getCallName, getSnippet } from './resolver-flow.call-analyzer';
import { resolveFunctionName } from './resolver-flow.function-utils';
import { resolveDefinitionToFunction } from './resolver-flow.ast-visitor';
import { HTTP_CATEGORY, DATABASE_CATEGORY } from './resolver-flow.constants';
import { scanFunction } from './resolver-flow.traverser';
import { isBuiltinCall, isDatabaseCallPattern, isApiCallPattern } from './resolver-flow.builtins-filter';

export function processCall(
  call: CallExpression,
  sourceFile: SourceFile,
  importMap: Map<string, string>,
  context: ScannerContext
): void {
  const callFile = call.getSourceFile().getFilePath();
  const callLine = call.getStartLineNumber();
  const { symbol, method } = getCallName(call);
  const snippet = getSnippet(call);

  const packageName = resolvePackageForCall(call, importMap);
  const isSameRepoImport = packageName !== null && isSameRepoPath(packageName);

  if (packageName && !isSameRepoImport) {
    processExternalPackageCall(packageName, symbol, method, callFile, callLine, snippet, context);
  } else {
    processUnresolvedCall(call, symbol, method, callFile, callLine, snippet, context);
  }
}

function isSameRepoPath(packageName: string): boolean {
  return packageName.startsWith('./') || packageName.startsWith('../');
}

function processExternalPackageCall(
  packageName: string,
  symbol: string,
  method: string,
  callFile: string,
  callLine: number,
  snippet: string,
  context: ScannerContext
): void {
  const category = classifyPackage(packageName, context.categories);

  if (category === HTTP_CATEGORY) {
    addApiRequest(packageName, symbol, method, callFile, callLine, snippet, context);
  } else if (category === DATABASE_CATEGORY) {
    addDatabaseCall(packageName, symbol, method, callFile, callLine, snippet, context);
  } else {
    addExternalCall(packageName, symbol, method, callFile, callLine, snippet, context);
  }
}

function addApiRequest(
  packageName: string,
  symbol: string,
  method: string,
  callFile: string,
  callLine: number,
  snippet: string,
  context: ScannerContext
): void {
  const apiReq: ApiRequest = {
    order: context.callOrder++,
    package: packageName,
    symbol,
    method,
    file: callFile,
    line: callLine,
    snippet,
    url: undefined,
    urlResolved: false,
  };
  context.apiRequests.push(apiReq);
}

function addDatabaseCall(
  packageName: string,
  symbol: string,
  method: string,
  callFile: string,
  callLine: number,
  snippet: string,
  context: ScannerContext
): void {
  const dbCall: DatabaseCall = {
    order: context.callOrder++,
    package: packageName,
    symbol,
    method,
    file: callFile,
    line: callLine,
    snippet,
  };
  context.databaseCalls.push(dbCall);
}

function addExternalCall(
  packageName: string,
  symbol: string,
  method: string,
  callFile: string,
  callLine: number,
  snippet: string,
  context: ScannerContext
): void {
  const extCall: ExternalCall = {
    order: context.callOrder++,
    package: packageName,
    symbol,
    method,
    file: callFile,
    line: callLine,
    snippet,
  };
  context.externalCalls.push(extCall);
}

function processUnresolvedCall(
  call: CallExpression,
  symbol: string,
  method: string,
  callFile: string,
  callLine: number,
  snippet: string,
  context: ScannerContext
): void {
  if (isApiCallPattern(symbol, method)) {
    addApiRequest(symbol === 'unknown' ? method : symbol, symbol, method, callFile, callLine, snippet, context);
    return;
  }

  if (isDatabaseCallPattern(symbol, method)) {
    addDatabaseCall(symbol, symbol, method, callFile, callLine, snippet, context);
    return;
  }

  const targetDefs = tryResolveDefinition(call);

  if (targetDefs.length === 0) {
    addUnknownExternalCall(symbol, method, callFile, callLine, snippet, context);
  } else {
    processResolvedDefinitions(targetDefs, symbol, method, callFile, callLine, snippet, context);
  }
}

function tryResolveDefinition(call: CallExpression): Node[] {
  try {
    const expr = call.getExpression();
    if (Node.isIdentifier(expr)) {
      return expr.getDefinitionNodes();
    }
    if (Node.isPropertyAccessExpression(expr)) {
      return expr.getNameNode().getDefinitionNodes();
    }
  } catch {
    // ignore
  }
  return [];
}

function addUnknownExternalCall(
  symbol: string,
  method: string,
  callFile: string,
  callLine: number,
  snippet: string,
  context: ScannerContext
): void {
  if (isBuiltinCall(symbol, method)) return;

  const extCall: ExternalCall = {
    order: context.callOrder++,
    package: 'unknown',
    symbol,
    method,
    file: callFile,
    line: callLine,
    snippet,
  };
  context.externalCalls.push(extCall);
}

function processResolvedDefinitions(
  targetDefs: Node[],
  symbol: string,
  method: string,
  callFile: string,
  callLine: number,
  snippet: string,
  context: ScannerContext
): void {
  for (const def of targetDefs) {
    const defSourceFile = def.getSourceFile();
    const defFilePath = defSourceFile.getFilePath();
    const defFunc = resolveDefinitionToFunction(def);

    if (isInNodeModules(defFilePath)) {
      addNodeModuleCall(defFilePath, symbol, method, callFile, callLine, snippet, def, context);
    } else if (defFunc) {
      addProjectFunctionCall(defFunc, defFilePath, symbol, method, callFile, callLine, snippet, defSourceFile, context);
    }
  }
}

function addNodeModuleCall(
  defFilePath: string,
  symbol: string,
  method: string,
  callFile: string,
  callLine: number,
  snippet: string,
  def: Node,
  context: ScannerContext
): void {
  if (isBuiltinCall(symbol, method)) return;

  const inferredPkg = inferPackageFromPath(defFilePath) ?? 'node_modules';
  const extCall: ExternalCall = {
    order: context.callOrder++,
    package: inferredPkg,
    symbol,
    method,
    file: defFilePath,
    line: def.getStartLineNumber(),
    snippet,
  };
  context.externalCalls.push(extCall);
}

function addProjectFunctionCall(
  defFunc: any,
  defFilePath: string,
  symbol: string,
  method: string,
  callFile: string,
  callLine: number,
  snippet: string,
  defSourceFile: SourceFile,
  context: ScannerContext
): void {
  const funcName = resolveFunctionName(defFunc);
  const funcDefLine = defFunc.getStartLineNumber?.();
  const funcDefLineEnd = defFunc.getEndLineNumber?.();

  if (funcDefLine) {
    const funcCall: FunctionCall = {
      order: context.callOrder++,
      name: funcName,
      file: defFilePath,
      line: funcDefLine,
      lineEnd: funcDefLineEnd ?? funcDefLine,
      calledFrom: { file: callFile, line: callLine },
    };
    context.functions.push(funcCall);

    scanFunction(defFunc as any, defSourceFile, context);
  }
}
