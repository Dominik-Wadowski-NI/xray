import type { Config } from './config.types';
import { Services } from './config.types';
import { SERVICE_CONFIGS } from './config.constants';

export function getConfigForService(service: string): Partial<Config> {
  const serviceValue = Object.values(Services).find((s) => s === service) as Services;

  if (!serviceValue) {
    throw new Error(
      `Unknown service: ${service}. Available services: ${Object.values(Services).join(', ')}`
    );
  }

  const config = SERVICE_CONFIGS[serviceValue];
  if (!config) {
    throw new Error(`No configuration found for service: ${service}`);
  }

  return config;
}
