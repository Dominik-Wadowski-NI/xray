import type { Config } from '../config.types';

const ROOT_DIR = '/Users/dominikwadowski/ni/services/content-element-rts';

export default <Config>{
  rootDir: ROOT_DIR,
  gqlResolver: {
    entrypoint: `${ROOT_DIR}/lib/graphql/resolvers/resolvers.js`,
  },
  exitPoints: {
    ignorePatterns: ['**/*.test.ts', '**/*.test.js', '**/*.spec.ts'],
    categories: {
      http: ["ni-http", "axios", "node-fetch", "got", "superagent", "cross-fetch"],
      database: ["ni-core-entities-provider-rt", "ni-entities", "xsite-data-access-mongo", "mongoose", "prisma", "@prisma/client", "typeorm", "knex", "pg"],
      cache: ["ni-cache", "xsite-ni-shared-cache", "ioredis", "redis"],
      events: ["@products-monorepo/utils"],
      vendors: ["@ni-products/vendors"],
      discovery: ["ni-discovery-service"],
      platform: ["ni-rts-helper", "ni-chart-rt", "ni-feature-toggle", "ni-manipulator", "ni-node-configuration", "ni-service-contracts", "ni-http-server", "ni-feature-entity-provider-rt", "xsite-modern-context"]
    },
  },
  flowTracer: {
    // resolver: 'productList',
  },
  reports: {
    exitPoints: 'docs/content-element-rts/exit-points.json',
    resolvers: 'docs/content-element-rts/graphql-resolvers.json',
    flows: 'docs/content-element-rts/resolver-flows.{resolver}.json',
  },
};
