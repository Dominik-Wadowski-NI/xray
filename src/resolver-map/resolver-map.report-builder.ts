import type { ServiceResolverEntry, ResolverMapReport, TypeOwnershipMap, CrossServiceLink } from './resolver-map.types';

export function buildResolverMapReport(
  resolvers: ServiceResolverEntry[],
  typeOwnership: TypeOwnershipMap,
  crossServiceDependencies: CrossServiceLink[]
): ResolverMapReport {
  const uniqueServices = Array.from(new Set(resolvers.map((r) => r.service))).sort();

  return {
    generatedAt: new Date().toISOString(),
    services: uniqueServices,
    typeOwnership,
    crossServiceDependencies,
    resolvers,
  };
}
