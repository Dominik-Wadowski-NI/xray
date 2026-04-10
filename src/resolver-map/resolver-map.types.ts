import type { ResolverEntry, Parameter } from '../graphql-resolvers/graphql-resolvers.types';

export type ResolverKind = 'rootQuery' | 'resolveReference' | 'fieldExtension' | 'ownField';

export interface ServiceResolverEntry extends ResolverEntry {
  service: string;
  kind: ResolverKind;
  typeOwnedBy?: string;
}

export interface TypeOwnershipMap {
  [typeName: string]: string;
}

export interface CrossServiceExtension {
  service: string;
  resolvers: string[];
}

export interface CrossServiceLink {
  type: string;
  ownedBy: string;
  extendedBy: CrossServiceExtension[];
}

export interface ResolverMapReport {
  generatedAt: string;
  services: string[];
  typeOwnership: TypeOwnershipMap;
  crossServiceDependencies: CrossServiceLink[];
  resolvers: ServiceResolverEntry[];
}
