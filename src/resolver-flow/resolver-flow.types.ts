import { Project } from 'ts-morph';

export interface ResolverEntry {
  name: string;
  parentType: string;
  params: Array<{ name: string; type: string }>;
  definitionFile: string;
  line: number;
  column: number;
}

export interface FunctionCall {
  order: number;
  name: string;
  file: string;
  line: number;
  lineEnd: number;
  calledFrom: { file: string; line: number };
}

export interface ExternalCall {
  order: number;
  package: string;
  symbol: string;
  method: string;
  file: string;
  line: number;
  snippet: string;
}

export interface ApiRequest extends ExternalCall {
  url?: string | undefined;
  urlResolved: boolean;
}

export interface DatabaseCall extends ExternalCall {}

export interface ClassInstantiation {
  order: number;
  className: string;
  file: string;
  line: number;
  definitionFile?: string | undefined;
}

export interface ResolverFlowReport {
  generatedAt: string;
  resolver: { name: string; parentType: string; file: string; line: number };
  summary: Record<string, number>;
  functions: FunctionCall[];
  externalPackages: ExternalCall[];
  apiRequests: ApiRequest[];
  databaseCalls: DatabaseCall[];
  classInstantiations: ClassInstantiation[];
}

export interface ScannerContext {
  project: Project;
  categories: Record<string, string[]>;
  visited: Set<string>;
  callOrder: number;
  functions: FunctionCall[];
  externalCalls: ExternalCall[];
  apiRequests: ApiRequest[];
  databaseCalls: DatabaseCall[];
  classInstantiations: ClassInstantiation[];
  currentFile: string;
  currentLine: number;
}
