import { ResolverEntry, ResolverFlowReport, ScannerContext } from './resolver-flow.types';

export function buildResolverFlowReport(
  resolver: ResolverEntry,
  context: ScannerContext
): ResolverFlowReport {
  const summary = buildSummary(context);

  return {
    generatedAt: new Date().toISOString(),
    resolver: {
      name: resolver.name,
      parentType: resolver.parentType,
      file: resolver.definitionFile,
      line: resolver.line,
    },
    summary,
    functions: context.functions,
    externalPackages: context.externalCalls,
    apiRequests: context.apiRequests,
    databaseCalls: context.databaseCalls,
    classInstantiations: context.classInstantiations,
  };
}

function buildSummary(context: ScannerContext): Record<string, number> {
  return {
    functions: context.functions.length,
    externalPackages: context.externalCalls.length,
    apiRequests: context.apiRequests.length,
    databaseCalls: context.databaseCalls.length,
    classInstantiations: context.classInstantiations.length,
  };
}

export function buildAggregateOutput(
  reportsList: ResolverFlowReport[],
  resolversCount: number
): { generatedAt: string; resolversCount: number; resolvers: ResolverFlowReport[] } {
  return {
    generatedAt: new Date().toISOString(),
    resolversCount,
    resolvers: reportsList,
  };
}
