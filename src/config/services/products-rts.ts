import type { Config } from '../config.types';

const ROOT_DIR = '/Users/dominikwadowski/ni/services/products-monorepo/services/product-rts';

export default <Config>{
  tsconfig: `${ROOT_DIR}/tsconfig.json`,
  rootDir: ROOT_DIR,
  gqlResolver: {
    entrypoint: `${ROOT_DIR}/lib/graphql/resolvers/resolvers.ts`,
  },
  flowTracer: {
    // resolver: 'productList',
  },
  reports: {
    exitPoints: 'bin/product-rts/exit-points.json',
    resolvers: 'bin/product-rts/graphql-resolvers.json',
    flows: 'bin/product-rts/resolver-flows.{resolver}.json',
  },
};
