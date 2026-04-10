import type { ServiceResolverEntry, TypeOwnershipMap, ResolverKind } from './resolver-map.types';

export interface ClassificationResult {
  resolvers: ServiceResolverEntry[];
  typeOwnership: TypeOwnershipMap;
}

function toCamelCase(pascalCase: string): string {
  if (pascalCase.length === 0) return '';
  return pascalCase.charAt(0).toLowerCase() + pascalCase.slice(1);
}

function classifyResolverKind(
  resolver: ServiceResolverEntry,
  allResolvers: ServiceResolverEntry[]
): ResolverKind {
  if (resolver.name === '__resolveReference') {
    return 'resolveReference';
  }

  if (resolver.parentType === 'Query') {
    return 'rootQuery';
  }

  const resolverDefinedInThisService = allResolvers.some(
    (r) =>
      r.service === resolver.service &&
      r.parentType === resolver.parentType &&
      r.name !== resolver.name
  );

  const parentTypeExistsInOtherService = allResolvers.some(
    (r) => r.service !== resolver.service && r.parentType === resolver.parentType
  );

  if (parentTypeExistsInOtherService && !resolverDefinedInThisService) {
    return 'fieldExtension';
  }

  return 'ownField';
}

export function classifyResolvers(
  resolvers: ServiceResolverEntry[]
): ClassificationResult {
  const classified = resolvers.map((resolver) => ({
    ...resolver,
    kind: classifyResolverKind(resolver, resolvers),
  }));

  const typeOwnership = buildTypeOwnershipMap(classified);

  classified.forEach((resolver) => {
    if (resolver.typeOwnedBy === undefined && typeOwnership[resolver.parentType]) {
      resolver.typeOwnedBy = typeOwnership[resolver.parentType];
    }
  });

  return {
    resolvers: classified,
    typeOwnership,
  };
}

function buildTypeOwnershipMap(resolvers: ServiceResolverEntry[]): TypeOwnershipMap {
  const ownership: TypeOwnershipMap = {};

  const allTypes = new Set<string>();
  for (const resolver of resolvers) {
    if (resolver.parentType !== 'Query') {
      allTypes.add(resolver.parentType);
    }
  }

  for (const type of allTypes) {
    const queryResolver = resolvers.find(
      (r) => r.parentType === 'Query' && r.name === toCamelCase(type)
    );

    if (queryResolver) {
      ownership[type] = queryResolver.service;
      continue;
    }

    const serviceResolvingThisType = resolvers.filter((r) => r.parentType === type);
    if (serviceResolvingThisType.length > 0) {
      const serviceWithMostResolvers = Object.entries(
        serviceResolvingThisType.reduce(
          (acc, r) => {
            acc[r.service] = (acc[r.service] || 0) + 1;
            return acc;
          },
          {} as Record<string, number>
        )
      ).sort(([, a], [, b]) => b - a)[0];

      if (serviceWithMostResolvers) {
        ownership[type] = serviceWithMostResolvers[0];
      }
    }
  }

  return ownership;
}
