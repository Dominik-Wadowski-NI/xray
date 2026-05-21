import type { Config } from '../config.types';

const ROOT_DIR = '/Users/dominikwadowski/ni/services/content-element-rts';

export default <Config>{
  rootDir: ROOT_DIR,
  gqlResolver: {
    entrypoint: `${ROOT_DIR}/lib/graphql/resolvers/resolvers.js`,
  },
  flowTracer: {
    // resolver: 'productList',
  },
  reports: {
    exitPoints: 'bin/content-element-rts/exit-points.json',
    resolvers: 'bin/content-element-rts/graphql-resolvers.json',
    flows: 'bin/content-element-rts/resolver-flows.{resolver}.json',
  },
};
