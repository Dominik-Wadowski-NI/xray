export function classifyPackage(
  packageName: string,
  categories: Record<string, string[]>
): string | null {
  for (const [category, packages] of Object.entries(categories)) {
    if (packages.includes(packageName)) {
      return category;
    }
  }
  return null;
}

export function inferPackageFromPath(filePath: string): string | null {
  const nmIndex = filePath.indexOf('node_modules');
  if (nmIndex === -1) return null;

  const afterNm = filePath.substring(nmIndex + 'node_modules'.length + 1);
  const parts = afterNm.split(/[/\\]/);

  if (parts.length === 0 || !parts[0]) return null;

  return extractPackageName(parts);
}

function extractPackageName(parts: string[]): string {
  if (parts[0]?.startsWith('@')) {
    return parts[0] + '/' + (parts[1] ?? 'unknown');
  }
  return parts[0] || 'unknown';
}

export function isInNodeModules(filePath: string): boolean {
  return filePath.includes('node_modules');
}
