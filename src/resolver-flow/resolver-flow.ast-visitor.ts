import { CallExpression, FunctionLikeDeclaration, NewExpression, Node, SyntaxKind } from 'ts-morph';

export function collectDirectCallExpressions(funcNode: FunctionLikeDeclaration): CallExpression[] {
  const body = getBodyNode(funcNode);
  if (!body) return [];

  const calls: CallExpression[] = [];
  const startDepth = Node.isBlock(body) ? 0 : 1;
  collectCallsRecursive(body, calls, startDepth);
  return calls;
}

function getBodyNode(funcNode: FunctionLikeDeclaration): Node | undefined {
  return (funcNode as any).getBody?.();
}

function collectCallsRecursive(node: Node, calls: CallExpression[], depth: number): void {
  if (depth > 0 && Node.isCallExpression(node)) {
    calls.push(node as CallExpression);
  }

  if (shouldSkipNestedFunction(node, depth)) {
    return;
  }

  node.getChildren().forEach((child) => collectCallsRecursive(child, calls, depth + 1));
}

function shouldSkipNestedFunction(node: Node, depth: number): boolean {
  if (depth === 0) return false;
  return Node.isFunctionDeclaration(node);
}

export function collectNewExpressions(funcNode: FunctionLikeDeclaration): NewExpression[] {
  const body = getBodyNode(funcNode);
  if (!body) return [];

  const newExprs: NewExpression[] = [];
  const startDepth = Node.isBlock(body) ? 0 : 1;
  collectNewExprsRecursive(body, newExprs, startDepth);
  return newExprs;
}

function collectNewExprsRecursive(node: Node, exprs: NewExpression[], depth: number): void {
  if (Node.isNewExpression(node)) {
    exprs.push(node as NewExpression);
  }

  if (shouldSkipNestedFunction(node, depth)) {
    return;
  }

  node.getChildren().forEach((child) => collectNewExprsRecursive(child, exprs, depth + 1));
}

export function resolveDefinitionToFunction(def: Node): FunctionLikeDeclaration | null {
  if (isFunctionLike(def)) {
    return def as unknown as FunctionLikeDeclaration;
  }

  if (Node.isVariableDeclaration(def)) {
    return extractFunctionFromVariableDeclaration(def);
  }

  if (Node.isImportSpecifier(def)) {
    return resolveImportSpecifier(def);
  }

  return null;
}

function resolveImportSpecifier(def: Node): FunctionLikeDeclaration | null {
  if (!Node.isImportSpecifier(def)) return null;
  try {
    const aliased = def.getSymbol()?.getAliasedSymbol();
    const decl = aliased?.getValueDeclaration();
    if (decl) return resolveDefinitionToFunction(decl as Node);
  } catch {
  }
  return null;
}

function isFunctionLike(def: Node): boolean {
  return Node.isArrowFunction(def) || Node.isFunctionExpression(def) || Node.isFunctionDeclaration(def);
}

function extractFunctionFromVariableDeclaration(def: Node): FunctionLikeDeclaration | null {
  if (!Node.isVariableDeclaration(def)) return null;

  const initializer = def.getInitializer?.();
  if (initializer && (Node.isArrowFunction(initializer) || Node.isFunctionExpression(initializer))) {
    return initializer as unknown as FunctionLikeDeclaration;
  }

  return null;
}
