import * as path from 'path';
import { Project, Node, SyntaxKind, CallExpression } from 'ts-morph';
import type { CallSiteEntry, ImportsByPackage, ImportMap, ResolvedCall, UrlResult } from './exit-points.types';
import { classifyPackage, extractPackageName } from './exit-points.classifier';

export function shouldIgnoreFile(filePath: string, ignorePatterns: string[], rootDir: string): boolean {
  if (!ignorePatterns.length) return false;

  const relativePath = path.relative(rootDir, filePath);
  return ignorePatterns.some((pattern) => {
    const regex = new RegExp(`^${pattern.replace(/\*\*/g, '.*').replace(/\*/g, '[^/]*').replace(/\./g, '\\.')}$`);
    return regex.test(relativePath);
  });
}

export function extractUrlFromArgument(arg: Node | undefined): UrlResult {
  if (!arg) return { urlResolved: false };

  if (Node.isStringLiteral(arg) || Node.isNoSubstitutionTemplateLiteral(arg)) {
    return { url: arg.getLiteralValue(), urlResolved: true };
  }

  const isResolved = !Node.isTemplateExpression(arg) && !Node.isIdentifier(arg);
  return { url: arg.getText(), urlResolved: isResolved };
}

export function scanImports(
  project: Project,
  rootDir: string,
  categories: Record<string, string[]>,
  ignorePatterns: string[]
): { importMap: ImportMap; importsByPackage: ImportsByPackage } {
  const importMap: ImportMap = new Map();
  const importsByPackage: ImportsByPackage = new Map();

  for (const sourceFile of project.getSourceFiles()) {
    const filePath = sourceFile.getFilePath();
    if (shouldIgnoreFile(filePath, ignorePatterns, rootDir)) continue;

    const relativePath = path.relative(rootDir, filePath);

    for (const importDecl of sourceFile.getImportDeclarations()) {
      const moduleSpecifier = importDecl.getModuleSpecifierValue();
      if (moduleSpecifier.startsWith('.')) continue;

      const pkgName = extractPackageName(moduleSpecifier);
      const category = classifyPackage(pkgName, categories);
      if (!category) continue;

      const symbols = extractImportedSymbols(importDecl, pkgName);

      for (const symbol of symbols) {
        const key = `${pkgName}::${symbol}`;
        if (!importMap.has(key)) importMap.set(key, new Set());
        importMap.get(key)!.add(relativePath);
      }

      if (!importsByPackage.has(pkgName)) {
        importsByPackage.set(pkgName, { category, files: new Set(), symbols: new Set() });
      }

      const entry = importsByPackage.get(pkgName)!;
      entry.files.add(relativePath);
      symbols.forEach((s) => entry.symbols.add(s));
    }
  }

  return { importMap, importsByPackage };
}

function extractImportedSymbols(importDecl: ReturnType<ReturnType<Project['getSourceFiles']>[0]['getImportDeclarations']>[0], pkgName: string): Set<string> {
  const symbols = new Set<string>();

  try {
    importDecl.getNamedImports().forEach((n) => symbols.add(n.getName()));

    const defaultImport = importDecl.getDefaultImport();
    if (defaultImport) symbols.add(defaultImport.getText());

    const namespaceImport = importDecl.getNamespaceImport();
    if (namespaceImport) {
      const name = (namespaceImport as any).name?.getText?.() ?? (namespaceImport as any).getText?.();
      if (name) symbols.add(name);
    }
  } catch {
    // ignore
  }

  if (!symbols.size) symbols.add(pkgName);
  return symbols;
}

interface PackageMatch {
  matchedPackage: string;
  matchedCategory: string;
}

function findMatchingPackage(
  symbol: string,
  importMap: ImportMap,
  importsByPackage: ImportsByPackage
): PackageMatch | null {
  for (const key of importMap.keys()) {
    const [pkgName, importedSymbol] = key.split('::');
    if (importedSymbol === symbol && pkgName) {
      const category = importsByPackage.get(pkgName)?.category;
      if (category) return { matchedPackage: pkgName, matchedCategory: category };
    }
  }
  return null;
}

function findPackageByTypeDeclaration(
  node: Node,
  importsByPackage: ImportsByPackage
): PackageMatch | null {
  try {
    const typeSymbol = node.getType().getSymbol();
    if (!typeSymbol) return null;

    for (const decl of typeSymbol.getDeclarations()) {
      const filePath = decl.getSourceFile().getFilePath();
      for (const [pkgName, entry] of importsByPackage.entries()) {
        if (filePath.includes(`node_modules/${pkgName.replace(/\//g, '\\/')}`)) {
          return { matchedPackage: pkgName, matchedCategory: entry.category };
        }
      }
    }
  } catch {
    // ignore
  }
  return null;
}

function resolveCallExpression(
  callExpr: CallExpression,
  importMap: ImportMap,
  importsByPackage: ImportsByPackage
): ResolvedCall | null {
  const expression = callExpr.getExpression();

  if (Node.isIdentifier(expression)) {
    const symbol = expression.getText();
    const match = findMatchingPackage(symbol, importMap, importsByPackage);
    if (!match) return null;
    return { symbol, method: null, ...match };
  }

  if (Node.isPropertyAccessExpression(expression)) {
    const method = expression.getNameNode()?.getText() ?? null;
    const left = expression.getExpression();

    if (Node.isIdentifier(left)) {
      const symbol = left.getText();
      const match =
        findMatchingPackage(symbol, importMap, importsByPackage) ??
        findPackageByTypeDeclaration(left, importsByPackage);
      if (!match) return null;
      return { symbol, method, ...match };
    }
  }

  return null;
}

function buildCallSiteEntry(
  callExpr: CallExpression,
  resolved: ResolvedCall,
  relativePath: string
): CallSiteEntry {
  const { symbol, method, matchedPackage, matchedCategory } = resolved;
  const line = callExpr.getStartLineNumber();
  const column = callExpr.getStart();
  const rawSnippet = callExpr.getText();
  const snippet = rawSnippet.length > 200 ? `${rawSnippet.substring(0, 200)}...` : rawSnippet;

  const baseEntry = {
    category: matchedCategory,
    package: matchedPackage,
    symbol: symbol || '',
    method: method || 'call',
    file: relativePath,
    line,
    column,
    snippet,
  };

  if (matchedCategory === 'http') {
    const args = callExpr.getArguments();
    if (args.length > 0) {
      const result = extractUrlFromArgument(args[0]);
      return { ...baseEntry, ...result };
    }
  }

  return baseEntry as CallSiteEntry;
}

export function scanCallSites(
  project: Project,
  rootDir: string,
  importMap: ImportMap,
  importsByPackage: ImportsByPackage,
  ignorePatterns: string[]
): CallSiteEntry[] {
  const callSites: CallSiteEntry[] = [];

  for (const sourceFile of project.getSourceFiles()) {
    const filePath = sourceFile.getFilePath();
    if (shouldIgnoreFile(filePath, ignorePatterns, rootDir)) continue;

    const relativePath = path.relative(rootDir, filePath);

    for (const call of sourceFile.getDescendantsOfKind(SyntaxKind.CallExpression)) {
      const callExpr = call as CallExpression;
      const resolved = resolveCallExpression(callExpr, importMap, importsByPackage);
      if (!resolved) continue;

      const entry = buildCallSiteEntry(callExpr, resolved, relativePath);
      callSites.push(entry);
    }
  }

  return callSites;
}
