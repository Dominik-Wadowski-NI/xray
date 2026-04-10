import * as fs from 'fs';
import * as path from 'path';
import { Services } from '../config/config.types';
import { getConfigForService } from '../config';
import type { ServiceResolverEntry } from './resolver-map.types';
import type { ExtractionResult } from '../graphql-resolvers/graphql-resolvers.types';

export function loadAllResolvers(): ServiceResolverEntry[] {
  const allResolvers: ServiceResolverEntry[] = [];

  for (const service of Object.values(Services)) {
    try {
      const config = getConfigForService(service);

      if (!config.reports?.resolvers) {
        console.warn(`⚠️  No resolvers report path configured for service: ${service}`);
        continue;
      }

      const resolversPath = path.resolve(config.reports.resolvers);

      if (!fs.existsSync(resolversPath)) {
        console.warn(`⚠️  Resolvers report not found for service ${service}: ${resolversPath}`);
        continue;
      }

      const content = fs.readFileSync(resolversPath, 'utf-8');
      const result: ExtractionResult = JSON.parse(content);

      const serviceResolvers: ServiceResolverEntry[] = result.resolvers.map((resolver) => ({
        ...resolver,
        service,
        kind: 'ownField',
        typeOwnedBy: undefined,
      }));

      allResolvers.push(...serviceResolvers);
      console.log(`✅ Loaded ${serviceResolvers.length} resolvers from ${service}`);
    } catch (error) {
      console.error(
        `❌ Error loading resolvers for service ${service}: ${error instanceof Error ? error.message : error}`
      );
    }
  }

  return allResolvers;
}
