import type { Config } from './config.types';
import { Services } from './config.types';

import productRtsConfig from './services/products-rts';
import contentElementRtsConfig from './services/content-element-rts';

export const SERVICE_CONFIGS: Record<Services, Partial<Config>> = {
  [Services.PRODUCT_RTS]: productRtsConfig,
  [Services.CONTENT_ELEMENT_RTS]: contentElementRtsConfig,
};
