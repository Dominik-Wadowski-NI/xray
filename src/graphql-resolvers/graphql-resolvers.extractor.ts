import {
  Project,
  Node,
  SourceFile,
  ObjectLiteralExpression,
  ShorthandPropertyAssignment,
  PropertyAssignment,
  FunctionLikeDeclaration,
  ParameterDeclaration,
} from 'ts-morph';
import type { Parameter, ResolverEntry, NodeLocation, FunctionDefinition } from './graphql-resolvers.types';

function getNodeLocation(node: Node): NodeLocation {
  return {
    file: node.getSourceFile().getFilePath(),
    line: node.getStartLineNumber(),
    column: node.getStart(),
  };
}

function asFunctionLike(node: Node): FunctionLikeDeclaration | null {
  if (Node.isArrowFunction(node) || Node.isFunctionExpression(node) || Node.isFunctionDeclaration(node)) {
    return node as unknown as FunctionLikeDeclaration;
  }
  return null;
}

function extractParameterType(param: ParameterDeclaration): string {
  try {
    const typeNode = param.getTypeNode();
    if (typeNode) return typeNode.getText();

    const typeText = param.getType().getText();
    if (typeText) return typeText;
  } catch {
    // ignore
  }
  return 'unknown';
}

function extractParameters(funcNode: FunctionLikeDeclaration): Parameter[] {
  try {
    return funcNode.getParameters().map((param) => ({
      name: param.getName(),
      type: extractParameterType(param),
    }));
  } catch {
    return [];
  }
}

function resolveToFunctionDefinition(node: Node): FunctionDefinition | null {
  try {
    const definitions = (node as any).getDefinitionNodes?.() as Node[] | undefined;
    if (!definitions?.length) return null;

    const def = definitions[0];
    if (!def) return null;

    const parent = def.getParent();

    if (Node.isVariableDeclaration(parent)) {
      const initializer = parent.getInitializer();
      const asFunc = initializer ? asFunctionLike(initializer) : null;
      if (asFunc) {
        return { ...getNodeLocation(initializer!), func: asFunc };
      }
    }

    const asFunc = asFunctionLike(def);
    if (asFunc) return { ...getNodeLocation(def), func: asFunc };
  } catch {
    // ignore
  }
  return null;
}

function resolveIdentifierToObjectLiteral(expression: Node): ObjectLiteralExpression | null {
  const definitions = (expression as any).getDefinitionNodes?.() as Node[] | undefined;
  const def = definitions?.[0];
  if (def && Node.isVariableDeclaration(def)) {
    const init = def.getInitializer();
    if (init && Node.isObjectLiteralExpression(init)) return init;
  }
  return null;
}

function findRootObjectLiteral(sourceFile: SourceFile): ObjectLiteralExpression | null {
  const exportAssignments = sourceFile.getExportAssignments();
  if (exportAssignments.length > 0) {
    const expression = exportAssignments[0]?.getExpression();
    if (expression) {
      if (Node.isObjectLiteralExpression(expression)) return expression;
      if (Node.isIdentifier(expression)) return resolveIdentifierToObjectLiteral(expression);
    }
  }

  const statements = sourceFile.getStatements();
  for (const stmt of statements) {
    if (Node.isExpressionStatement(stmt)) {
      const expr = stmt.getExpression();
      if (Node.isBinaryExpression(expr)) {
        const operator = expr.getOperatorToken().getText();
        if (operator === '=') {
          const left = expr.getLeft();
          const right = expr.getRight();
          
          if (Node.isPropertyAccessExpression(left)) {
            const objName = left.getExpression().getText();
            const propName = left.getName();
            if (objName === 'module' && propName === 'exports') {
              if (Node.isObjectLiteralExpression(right)) return right;
              if (Node.isIdentifier(right)) return resolveIdentifierToObjectLiteral(right);
            }
          }
        }
      }
    }
  }

  return null;
}

function resolveShorthandToObjectLiteral(prop: ShorthandPropertyAssignment): ObjectLiteralExpression | null {
  const defs = prop.getNameNode().getDefinitionNodes();
  const def = defs[0];
  if (def && Node.isVariableDeclaration(def)) {
    const init = def.getInitializer();
    if (init && Node.isObjectLiteralExpression(init)) return init;
  }
  return null;
}

function resolveParentType(prop: Node): { parentType: string; parentObject: ObjectLiteralExpression } | null {
  if (Node.isPropertyAssignment(prop)) {
    const parentType = prop.getName();
    const value = prop.getInitializer();
    if (!parentType || !value) return null;

    if (Node.isObjectLiteralExpression(value)) {
      return { parentType, parentObject: value };
    }

    if (Node.isIdentifier(value)) {
      const parentObject = resolveIdentifierToObjectLiteral(value);
      if (parentObject) return { parentType, parentObject };
    }
  }

  if (Node.isShorthandPropertyAssignment(prop)) {
    const parentType = prop.getName();
    const parentObject = resolveShorthandToObjectLiteral(prop);
    if (parentType && parentObject) return { parentType, parentObject };
  }

  return null;
}

function extractResolverFromInlineFunction(
  prop: PropertyAssignment,
  value: FunctionLikeDeclaration,
  name: string,
  parentType: string
): ResolverEntry {
  const loc = getNodeLocation(value as unknown as Node);
  return { name, parentType, params: extractParameters(value), definitionFile: loc.file, line: loc.line, column: loc.column };
}

function extractResolverFromReference(
  prop: PropertyAssignment,
  value: Node,
  name: string,
  parentType: string
): ResolverEntry {
  const fallback = getNodeLocation(prop);
  const resolved = resolveToFunctionDefinition(value);
  return {
    name,
    parentType,
    params: resolved?.func ? extractParameters(resolved.func) : [],
    definitionFile: resolved?.file ?? fallback.file,
    line: resolved?.line ?? fallback.line,
    column: resolved?.column ?? fallback.column,
  };
}

function extractFromPropertyAssignment(prop: Node, parentType: string): ResolverEntry | null {
  if (!Node.isPropertyAssignment(prop)) return null;

  const name = prop.getName();
  const value = prop.getInitializer();
  if (!name || !value) return null;

  const asFunc = asFunctionLike(value);
  if (asFunc) return extractResolverFromInlineFunction(prop, asFunc, name, parentType);

  if (Node.isIdentifier(value) || Node.isPropertyAccessExpression(value)) {
    return extractResolverFromReference(prop, value, name, parentType);
  }

  return null;
}

function extractFromShorthandAssignment(prop: Node, parentType: string): ResolverEntry | null {
  if (!Node.isShorthandPropertyAssignment(prop)) return null;

  const name = prop.getNameNode().getText();
  if (!name) return null;

  const resolved = resolveToFunctionDefinition(prop.getNameNode());
  const fallback = getNodeLocation(prop);

  return {
    name,
    parentType,
    params: resolved?.func ? extractParameters(resolved.func) : [],
    definitionFile: resolved?.file ?? fallback.file,
    line: resolved?.line ?? fallback.line,
    column: resolved?.column ?? fallback.column,
  };
}

function extractResolversFromParentType(parentObject: ObjectLiteralExpression, parentType: string): ResolverEntry[] {
  return parentObject
    .getProperties()
    .map((prop) => extractFromPropertyAssignment(prop, parentType) ?? extractFromShorthandAssignment(prop, parentType))
    .filter((entry): entry is ResolverEntry => entry !== null);
}

export function extractResolversFromMap(project: Project, resolverFilePath: string): ResolverEntry[] {
  try {
    const sourceFile = project.getSourceFileOrThrow(resolverFilePath);
    const rootObject = findRootObjectLiteral(sourceFile);

    if (!rootObject) {
      console.warn('Could not find default export or module.exports object literal');
      return [];
    }

    return rootObject.getProperties().flatMap((prop) => {
      const resolved = resolveParentType(prop);
      return resolved ? extractResolversFromParentType(resolved.parentObject, resolved.parentType) : [];
    });
  } catch (error) {
    console.error('Error extracting resolvers:', error);
    return [];
  }
}
