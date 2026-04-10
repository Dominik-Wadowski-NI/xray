#!/usr/bin/env node

import { loadAllResolvers } from './resolver-map.loader';
import { classifyResolvers } from './resolver-map.classifier';
import { buildCrossServiceLinks } from './resolver-map.linker';
import { buildResolverMapReport } from './resolver-map.report-builder';
import { RESOLVER_MAP_OUTPUT } from './resolver-map.constants';
import { writeJsonReport } from '../shared/report';

async function main() {
  try {
    console.log('Loading resolvers from all services...');
    const resolvers = loadAllResolvers();

    if (resolvers.length === 0) {
      throw new Error('No resolvers found. Have you run extract:graphql for your services?');
    }

    console.log(`\nClassifying ${resolvers.length} resolvers...`);
    const { resolvers: classified, typeOwnership } = classifyResolvers(resolvers);

    console.log('Building cross-service dependency links...');
    const crossServiceDependencies = buildCrossServiceLinks(classified, typeOwnership);

    console.log('Building resolver map report...');
    const report = buildResolverMapReport(classified, typeOwnership, crossServiceDependencies);

    writeJsonReport(RESOLVER_MAP_OUTPUT, report);

    console.log(`\n📊 Summary:`);
    console.log(`  Services: ${report.services.length} (${report.services.join(', ')})`);
    console.log(`  Total resolvers: ${report.resolvers.length}`);
    console.log(`  Types with ownership: ${Object.keys(report.typeOwnership).length}`);
    console.log(`  Cross-service extensions: ${report.crossServiceDependencies.length}`);
  } catch (error) {
    console.error('Error:', error instanceof Error ? error.message : error);
    process.exit(1);
  }
}

main();
