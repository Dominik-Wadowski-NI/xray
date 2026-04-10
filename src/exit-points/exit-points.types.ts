export interface Parameter {
  name: string;
  type: string;
}

export interface CallSiteEntry {
  category: string;
  package: string;
  symbol: string;
  method: string;
  url?: string;
  urlResolved?: boolean;
  file: string;
  line: number;
  column: number;
  snippet: string;
}

export interface PackageEntry {
  category: string;
  files: Set<string>;
  symbols: Set<string>;
}

export interface ImportEntry {
  category: string;
  package: string;
  symbols: string[];
  files: string[];
}

export interface Summary {
  [category: string]: {
    callSiteCount: number;
    packages: string[];
  };
}

export interface ExtractionResult {
  generatedAt: string;
  rootDir: string;
  summary: Summary;
  callSites: CallSiteEntry[];
  imports: ImportEntry[];
}

export type ImportsByPackage = Map<string, PackageEntry>;
export type ImportMap = Map<string, Set<string>>;

export interface ResolvedCall {
  symbol: string | null;
  method: string | null;
  matchedPackage: string;
  matchedCategory: string;
}

export interface UrlResult {
  url?: string;
  urlResolved: boolean;
}
