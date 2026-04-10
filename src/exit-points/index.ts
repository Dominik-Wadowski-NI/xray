#!/usr/bin/env node

/* eslint-disable import/no-extraneous-dependencies */
import * as fs from 'fs';
import * as path from 'path';
import { parseServiceArg } from '../shared/cli';
import { getConfigForService } from '../config';
import { createProject, addAllSourceFilesToProject } from '../shared/morph';
import { writeJsonReport } from '../shared/report';
import { scanImports, scanCallSites } from './exit-points.scanner';
import type { ExtractionResult, ImportEntry } from './exit-points.types';
import { Config } from '../config/config.types';
import { buildSummary } from './exit-points.summary';

const hasAllRequiredConfig = (config: Partial<Config>): config is Config => {
  return !!(
    config?.rootDir &&
    config?.exitPoints?.categories &&
    config?.exitPoints?.ignorePatterns
  );
};

async function main() {
  try {
    const service = parseServiceArg();
    const config = getConfigForService(service);

    if (!hasAllRequiredConfig(config)) {
      throw new Error('Config: all required fields are not present');
    }

    const tsconfigPath = config.tsconfig;
    const project = createProject(tsconfigPath);
    if (tsconfigPath) {
      project.addSourceFilesFromTsConfig(tsconfigPath);
    }
    const tsFiles = addAllSourceFilesToProject(project, config.rootDir);

    console.log(`Scanning ${tsFiles.length} source files...`);

    const { importMap, importsByPackage } = scanImports(
      project,
      config.rootDir,
      config.exitPoints.categories,
      config.exitPoints.ignorePatterns || []
    );

    console.log(`Found ${importMap.size} external imports`);

    const callSites = scanCallSites(project, config.rootDir, importMap, importsByPackage, config.exitPoints.ignorePatterns || []);

    console.log(`Found ${callSites.length} call sites`);

    const summary = buildSummary(importsByPackage, callSites);

    const imports: ImportEntry[] = Array.from(importsByPackage.entries()).map(([pkgName, entry]) => ({
      category: entry.category,
      package: pkgName,
      symbols: Array.from(entry.symbols).sort(),
      files: Array.from(entry.files).sort(),
    }));

    const result: ExtractionResult = {
      generatedAt: new Date().toISOString(),
      rootDir: config.rootDir,
      summary,
      callSites,
      imports,
    };

    writeJsonReport(config.reports.exitPoints, result);
    console.log(`✅ Analysis complete. Results written to: ${config.reports.exitPoints}`);
  } catch (error) {
    console.error('Error:', error instanceof Error ? error.message : error);
    process.exit(1);
  }
}

main();
