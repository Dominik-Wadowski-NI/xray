// Re-export all scanner functions from specialized modules for backward compatibility
export { buildImportMap, resolvePackageForCall } from './resolver-flow.import-map';
export { extractUrl } from './resolver-flow.url-extractor';
export { classifyPackage, inferPackageFromPath, isInNodeModules } from './resolver-flow.package-classifier';
export { getCallName, getSnippet } from './resolver-flow.call-analyzer';
export { collectDirectCallExpressions, collectNewExpressions, resolveDefinitionToFunction } from './resolver-flow.ast-visitor';
export { scanFunction } from './resolver-flow.traverser';
