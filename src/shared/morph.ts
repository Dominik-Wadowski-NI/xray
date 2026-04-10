import * as fs from 'fs';
import * as path from 'path';
import { Project } from 'ts-morph';
import { glob } from 'glob';

export function findNearestTsconfig(startDir: string): string | undefined {
  let current = startDir;
  while (current !== path.dirname(current)) {
    const tsconfigPath = path.join(current, 'tsconfig.json');
    if (fs.existsSync(tsconfigPath)) {
      return tsconfigPath;
    }
    current = path.dirname(current);
  }
  return undefined;
}

export function createProject(tsconfig?: string): Project {
  if (tsconfig && fs.existsSync(tsconfig)) {
    return new Project({ tsConfigFilePath: tsconfig });
  }
  return new Project({ compilerOptions: { allowJs: true, checkJs: false } });
}

export const addAllSourceFilesToProject = async (project: ReturnType<typeof createProject>, rootDir: string): Promise<string[]> => {
  const tsFiles = await glob('**/*.{ts,tsx,js,jsx}', {
    cwd: rootDir,
    ignore: ['node_modules/**', '.git/**', 'dist/**', 'build/**', 'docs/**']
  });

  const absolutePaths = tsFiles.map((file) => path.join(rootDir, file));

  for (const file of absolutePaths) {
    if (!project.getSourceFile(file)) {
      try {
        project.addSourceFileAtPath(file);
      } catch {
        // Ignore files that cannot be added
      }
    }
  }

  return absolutePaths;
};