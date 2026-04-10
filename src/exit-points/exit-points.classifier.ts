function matchesPattern(pkgName: string, pattern: string): boolean {
  if (pattern.endsWith('*')) {
    const prefix = pattern.slice(0, -1);
    return pkgName.startsWith(prefix);
  }
  return pkgName === pattern;
}

export function classifyPackage(pkgName: string, categories: Record<string, string[]>): string | null {
  for (const [category, patterns] of Object.entries(categories)) {
    for (const pattern of patterns) {
      if (matchesPattern(pkgName, pattern)) {
        return category;
      }
    }
  }
  return null;
}

export function extractPackageName(moduleSpecifier: string): string {
  if (moduleSpecifier.startsWith('@')) {
    const parts = moduleSpecifier.split('/');
    return parts.slice(0, 2).join('/');
  }
  const parts = moduleSpecifier.split('/');
  return parts[0];
}
