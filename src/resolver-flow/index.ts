#!/usr/bin/env node

import * as fs from 'fs';
import { parseServiceArg } from '../shared/cli';
import { getConfigForService } from '../config';
import { loadSourceFilesFromTsConfig, findSourceFile, findFunctionAtLine } from './resolver-flow.project-loader';
import { writeJsonReport } from '../shared/report';
import { scanFunction } from './resolver-flow.traverser';
import { buildResolverFlowReport, buildAggregateOutput } from './resolver-flow.report-builder';
import { loadResolversFromFile, filterResolvers } from './resolver-flow.resolver-loader';
import type { ScannerContext, ResolverEntry, ResolverFlowReport } from './resolver-flow.types';
import type { Config } from '../config/config.types';
import { addAllSourceFilesToProject, createProject } from '../shared/morph';

const hasAllRequiredConfig = (config: Partial<Config>): config is Config => {
  return !!(
    config?.rootDir &&
    config?.gqlResolver?.entrypoint &&
    config?.reports?.resolvers &&
    config?.reports?.flows
  );
};

async function main() {
  try {
    const service = parseServiceArg();
    const config = getConfigForService(service);

    if (!hasAllRequiredConfig(config)) {
      throw new Error('Config: all required fields are not present');
    }

    let resolvers = loadResolversFromFile(config.reports.resolvers);

    const resolverName = config.flowTracer.resolver;
    if (resolverName) {
      resolvers = filterResolvers(resolvers, resolverName);
    }

    const reportsList = await traceResolvers(resolvers, config);

    const reportsByResolver = reportsList.reduce(
      (acc, report) => {
        const name = report.resolver.name;
        if (!acc[name]) {
          acc[name] = [];
        }
        acc[name].push(report);
        return acc;
      },
      {} as Record<string, ResolverFlowReport[]>
    );

    for (const [name, reports] of Object.entries(reportsByResolver)) {
      const typedReports = reports as ResolverFlowReport[];
      const output = buildAggregateOutput(typedReports, typedReports.length);
      writeJsonReport(config.reports.flows, output, { resolver: name });
    }
  } catch (error) {
    console.error('Error:', error instanceof Error ? error.message : error);
    process.exit(1);
  }
}

async function traceResolvers(resolvers: ResolverEntry[], config: Config): Promise<any[]> {
  const project = createProject(config.tsconfig);
  loadSourceFilesFromTsConfig(project, config.tsconfig);
  const tsFiles = await addAllSourceFilesToProject(project, config.rootDir);
  console.log(`Scanning ${tsFiles.length} source files...`);
  
  const reportsList = [];

  for (const resolver of resolvers) {
    try {
      const report = traceResolver(resolver, project, config);
      if (report) {
        reportsList.push(report);
      }
    } catch (error) {
      console.error(
        `  ❌ Error tracing resolver ${resolver.name}: ${error instanceof Error ? error.message : error}`
      );
    }
  }

  return reportsList;
}

function traceResolver(resolver: ResolverEntry, project: any, config: Config): any {
  const sourceFile = findSourceFile(project, resolver.definitionFile);
  if (!sourceFile) {
    console.warn(`  ⚠️ Source file not found: ${resolver.definitionFile}`);
    return null;
  }

  const funcNode = findFunctionAtLine(sourceFile, resolver.line);
  if (!funcNode) {
    console.warn(`  ⚠️ Function not found at line ${resolver.line}`);
    return null;
  }

  const context = createScannerContext(config);
  scanFunction(funcNode, sourceFile, context);

  const report = buildResolverFlowReport(resolver, context);
  logResolverStats(report);

  return report;
}

function createScannerContext(config: Config): ScannerContext {
  return {
    project: null as any,
    categories: config.exitPoints.categories,
    visited: new Set(),
    callOrder: 0,
    functions: [],
    externalCalls: [],
    apiRequests: [],
    databaseCalls: [],
    classInstantiations: [],
    currentFile: '',
    currentLine: 0,
  };
}

function logResolverStats(report: any): void {
  const { functions, externalPackages, apiRequests, databaseCalls } = report.summary;
  console.log(
    `  ✅ Traced: ${functions} functions, ${externalPackages} external calls, ${apiRequests} API requests, ${databaseCalls} DB calls`
  );
}

main();
