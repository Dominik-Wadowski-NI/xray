import * as fs from 'fs';
import * as path from 'path';

export function writeJsonReport(outputPath: string, data: object, options?: Record<string, string>): void {
  let resolvedPath = outputPath;
  
  if (options) {
    for (const [key, value] of Object.entries(options)) {
      resolvedPath = resolvedPath.replace(`{${key}}`, value);
    }
  }
  
  const dir = path.dirname(resolvedPath);
  fs.mkdirSync(dir, { recursive: true });
  
  fs.writeFileSync(resolvedPath, JSON.stringify(data, null, 2), 'utf-8');
  console.log(`✅ Report written to: ${resolvedPath}`);
}
