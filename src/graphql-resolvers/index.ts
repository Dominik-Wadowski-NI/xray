#!/usr/bin/env node

/* eslint-disable import/no-extraneous-dependencies */
import { parseServiceArg } from '../shared/cli';
import { getConfigForService } from '../config';
import { createProject } from '../shared/morph';
import { writeJsonReport } from '../shared/report';
import { extractResolversFromMap } from './graphql-resolvers.extractor';
import type { ExtractionResult } from './graphql-resolvers.types';
import type { Config } from '../config/config.types';

const hasAllRequiredConfig = (config: Partial<Config>): config is Config => {
  return !!(
    config?.gqlResolver?.entrypoint &&
    config?.reports?.resolvers
  );
};

async function main() {
  try {
    const service = parseServiceArg();
    const config = getConfigForService(service);

    if (!hasAllRequiredConfig(config)) {
      throw new Error('Config: all required fields are not present');
    }

    const project = createProject(config.tsconfig);
    project.addSourceFileAtPath(config.gqlResolver.entrypoint);

    const resolvers = extractResolversFromMap(project, config.gqlResolver.entrypoint);

    const result: ExtractionResult = {
      resolvers,
      generatedAt: new Date().toISOString(),
      resolverFile: config?.gqlResolver?.entrypoint,
    };

    writeJsonReport(config.reports?.resolvers, result);
  } catch (error) {
    console.error('Error:', error instanceof Error ? error.message : error);
    process.exit(1);
  }
}

main();
