import type { FunctionLikeDeclaration } from 'ts-morph';

export interface Parameter {
  name: string;
  type: string;
}

export interface NodeLocation {
  file: string;
  line: number;
  column: number;
}

export interface FunctionDefinition extends NodeLocation {
  func?: FunctionLikeDeclaration;
}

export interface ResolverEntry {
  name: string;
  parentType: string;
  params: Parameter[];
  definitionFile: string;
  line: number;
  column: number;
}

export interface ExtractionResult {
  resolvers: ResolverEntry[];
  generatedAt: string;
  resolverFile: string;
}
