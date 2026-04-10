import { Project, SourceFile, Node } from 'ts-morph';
import { resolveDefinitionToFunction } from './resolver-flow.ast-visitor';

export function loadSourceFilesFromTsConfig(project: Project, tsConfigPath?: string): void {
  if (tsConfigPath) {
    project.addSourceFilesFromTsConfig(tsConfigPath);
  }
}

export function findSourceFile(project: Project, filePath: string): SourceFile | undefined {
  return project.getSourceFile(filePath);
}

export function findFunctionAtLine(
  sourceFile: SourceFile,
  targetLine: number
): any | undefined {
  const descendants = sourceFile.getDescendantsOfKind(122);
  const arrowFunctions = sourceFile.getDescendantsOfKind(220);
  const funcDeclarations = sourceFile.getDescendantsOfKind(254);

  const allFunctions = [...descendants, ...arrowFunctions, ...funcDeclarations];
  const inlineFunc = allFunctions.find((fn) => (fn as any).getStartLineNumber?.() === targetLine);
  if (inlineFunc) return inlineFunc;

  return resolveReferencedFunctionAtLine(sourceFile, targetLine);
}

function resolveReferencedFunctionAtLine(sourceFile: SourceFile, targetLine: number): any | undefined {
  for (const node of sourceFile.getDescendants()) {
    if (node.getStartLineNumber() !== targetLine) continue;

    if (Node.isShorthandPropertyAssignment(node)) {
      const resolved = resolveIdentifierToFunction(node.getNameNode());
      if (resolved) return resolved;
    }

    if (Node.isPropertyAssignment(node)) {
      const initializer = node.getInitializer();
      if (initializer && Node.isIdentifier(initializer)) {
        const resolved = resolveIdentifierToFunction(initializer);
        if (resolved) return resolved;
      }
    }
  }

  return undefined;
}

function resolveIdentifierToFunction(identifier: Node): any | undefined {
  try {
    const defs = (identifier as any).getDefinitionNodes?.() ?? [];
    for (const def of defs) {
      const func = resolveDefinitionToFunction(def);
      if (func) return func;
    }
  } catch {
    // ignore resolution errors
  }
  return undefined;
}
