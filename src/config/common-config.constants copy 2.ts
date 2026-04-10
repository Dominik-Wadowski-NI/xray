import type { CommonConfig } from './common-config.types';

export const DEFAULT_CONFIG: Partial<CommonConfig> = {
  output: 'report.json',
  ignorePatterns: ['**/*.test.ts', '**/*.test.js', '**/*.spec.ts'],
};
