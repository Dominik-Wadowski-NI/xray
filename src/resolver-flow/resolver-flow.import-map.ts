import { SourceFile, ImportDeclaration } from 'ts-morph';

export function buildImportMap(sourceFile: SourceFile): Map<string, string> {
  const importMap = new Map<string, string>();
  const imports = sourceFile.getImportDeclarations();

  for (const importDecl of imports) {
    addImportToMap(importMap, importDecl);
  }

  return importMap;
}

function addImportToMap(importMap: Map<string, string>, importDecl: ImportDeclaration): void {
  const moduleSpecifier = importDecl.getModuleSpecifierValue();

  addDefaultImport(importMap, importDecl, moduleSpecifier);
  addNamespaceImport(importMap, importDecl, moduleSpecifier);
  addNamedImports(importMap, importDecl, moduleSpecifier);
}

function addDefaultImport(
  importMap: Map<string, string>,
  importDecl: ImportDeclaration,
  moduleSpecifier: string
): void {
  const defaultImport = importDecl.getDefaultImport();
  if (defaultImport) {
    importMap.set(defaultImport.getText(), moduleSpecifier);
  }
}

function addNamespaceImport(
  importMap: Map<string, string>,
  importDecl: ImportDeclaration,
  moduleSpecifier: string
): void {
  const namespaceImport = importDecl.getNamespaceImport();
  if (namespaceImport) {
    importMap.set(namespaceImport.getText(), moduleSpecifier);
  }
}

function addNamedImports(
  importMap: Map<string, string>,
  importDecl: ImportDeclaration,
  moduleSpecifier: string
): void {
  const namedImports = importDecl.getNamedImports();
  for (const namedImport of namedImports) {
    const importedName = namedImport.getAliasNode()?.getText() ?? namedImport.getName();
    importMap.set(importedName, moduleSpecifier);
  }
}

export function resolvePackageForCall(
  callExpression: any,
  importMap: Map<string, string>
): string | null {
  const rootIdentifier = extractRootIdentifier(callExpression);
  return rootIdentifier ? importMap.get(rootIdentifier) ?? null : null;
}

function extractRootIdentifier(callExpression: any): string {
  const expr = callExpression.getExpression();
  
  if (expr?.getText) {
    const text = expr.getText();
    const firstPart = text.split('.')[0];
    return firstPart || '';
  }
  
  return '';
}
