import type { ServiceResolverEntry, CrossServiceLink, TypeOwnershipMap } from './resolver-map.types';

export function buildCrossServiceLinks(
  resolvers: ServiceResolverEntry[],
  typeOwnership: TypeOwnershipMap
): CrossServiceLink[] {
  const linksByType: Record<string, CrossServiceLink> = {};

  const typesByService: Record<string, Set<string>> = {};
  for (const resolver of resolvers) {
    if (resolver.parentType === 'Query') continue;

    if (!typesByService[resolver.service]) {
      typesByService[resolver.service] = new Set();
    }
    typesByService[resolver.service].add(resolver.parentType);
  }

  const uniqueTypes = new Set<string>();
  for (const types of Object.values(typesByService)) {
    for (const type of types) {
      uniqueTypes.add(type);
    }
  }

  for (const type of uniqueTypes) {
    const ownedBy = typeOwnership[type];

    if (!ownedBy) {
      continue;
    }

    const resolversForType = resolvers.filter((r) => r.parentType === type);
    const serviceExtending = new Set<string>();

    for (const resolver of resolversForType) {
      if (resolver.service !== ownedBy) {
        serviceExtending.add(resolver.service);
      }
    }

    if (serviceExtending.size > 0) {
      linksByType[type] = {
        type,
        ownedBy,
        extendedBy: Array.from(serviceExtending)
          .sort()
          .map((service) => ({
            service,
            resolvers: resolversForType
              .filter((r) => r.service === service)
              .map((r) => r.name)
              .sort(),
          })),
      };
    }
  }

  return Object.values(linksByType);
}
