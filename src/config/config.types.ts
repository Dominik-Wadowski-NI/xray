export interface Config {
  tsconfig?: string;
  rootDir: string;
  gqlResolver: {
    entrypoint: string;
  },
  exitPoints: {
    ignorePatterns?: string[];
    categories: Record<string, string[]>;
  },
  flowTracer: {
    resolver?: string;
  },
  reports: {
    exitPoints: string;
    resolvers: string;
    flows: string;
  }
}

export enum Services {
  PRODUCT_RTS = 'product-rts',
  CONTENT_ELEMENT_RTS = 'content-element-rts',
}