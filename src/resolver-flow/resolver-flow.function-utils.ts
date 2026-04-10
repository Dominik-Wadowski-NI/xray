import { FunctionLikeDeclaration, Node } from 'ts-morph';

export function resolveFunctionName(funcNode: FunctionLikeDeclaration): string {
  try {
    const nameFromParent = tryExtractNameFromParent(funcNode);
    if (nameFromParent) return nameFromParent;

    const nameFromNode = tryExtractNameFromNode(funcNode);
    if (nameFromNode) return nameFromNode;
  } catch {
    // ignore
  }
  return 'anonymous';
}

function tryExtractNameFromParent(funcNode: FunctionLikeDeclaration): string | null {
  const parent = (funcNode as any).getParent?.();
  if (!parent) return null;

  if (Node.isPropertyAssignment(parent)) {
    return parent.getChildAtIndex(0).getText();
  }

  if (Node.isVariableDeclaration(parent)) {
    return parent.getNameNode().getText();
  }

  return null;
}

function tryExtractNameFromNode(funcNode: FunctionLikeDeclaration): string | null {
  const nameNode = (funcNode as any).getNameNode?.();
  return nameNode ? nameNode.getText() : null;
}
