import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';
import { ResolverEntry } from './resolver-flow.types';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export interface ResolversData {
  resolvers: ResolverEntry[];
}

export function loadResolversFromFile(filePath: string): ResolverEntry[] {
  try {
    const absolutePath = getAbsolutePath(filePath);
    const data: ResolversData = JSON.parse(fs.readFileSync(absolutePath, 'utf-8'));
    return data.resolvers;
  } catch (error) {
    throw new Error(`Failed to load resolvers from ${filePath}: ${getErrorMessage(error)}`);
  }
}

function getAbsolutePath(filePath: string): string {
  if (path.isAbsolute(filePath)) {
    return filePath;
  }
  
  const projectRoot = findProjectRoot();
  return path.join(projectRoot, filePath);
}

function findProjectRoot(): string {
  let currentDir = __dirname;
  
  while (currentDir !== '/') {
    if (fs.existsSync(path.join(currentDir, 'package.json'))) {
      return currentDir;
    }
    currentDir = path.dirname(currentDir);
  }
  
  return process.cwd();
}

function getErrorMessage(error: unknown): string {
  if (error instanceof Error) return error.message;
  return String(error);
}

export function filterResolvers(
  resolvers: ResolverEntry[],
  resolverName?: string
): ResolverEntry[] {
  if (!resolverName) {
    return resolvers;
  }

  const filtered = resolvers.filter((r) => r.name === resolverName);

  if (filtered.length === 0) {
    throw new Error(`Resolver "${resolverName}" not found`);
  }

  return filtered;
}
