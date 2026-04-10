export const HTTP_CATEGORY = 'http';
export const DATABASE_CATEGORY = 'database';
export const CACHE_CATEGORY = 'cache';
export const PLATFORM_CATEGORY = 'platform';

export const HTTP_METHODS = [
  'get',
  'post',
  'put',
  'patch',
  'delete',
  'request',
  'fetch',
  'head',
  'options',
];

export const DATABASE_CALL_PATTERNS: Array<{ symbol: string; method: string }> = [
  { symbol: 'connection', method: 'model' },
];

export const API_CALL_SYMBOLS = new Set(['requestHelper']);

export const DATABASE_METHODS = [
  'query',
  'execute',
  'run',
  'findAll',
  'find',
  'findOne',
  'create',
  'save',
  'update',
  'delete',
  'destroy',
  'select',
  'insert',
  'exec',
];
