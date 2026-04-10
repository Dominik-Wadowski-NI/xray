import { DATABASE_CALL_PATTERNS, API_CALL_SYMBOLS } from './resolver-flow.constants';

const JS_GLOBAL_NAMESPACES = new Set([
  'Array', 'Object', 'Math', 'JSON', 'Promise', 'console',
  'Number', 'String', 'Boolean', 'Map', 'Set', 'Date', 'RegExp',
  'Error', 'Symbol', 'BigInt', 'Proxy', 'Reflect', 'WeakMap', 'WeakSet',
  'WeakRef', 'Int8Array', 'Uint8Array', 'Uint16Array', 'Uint32Array',
  'Float32Array', 'Float64Array', 'Buffer',
]);

// Standalone global functions: called as identifiers (symbol === 'unknown'), e.g. String(x), parseFloat(x)
const JS_GLOBAL_FUNCTIONS = new Set([
  'String', 'Number', 'Boolean', 'BigInt', 'Symbol',
  'parseInt', 'parseFloat', 'isNaN', 'isFinite',
  'encodeURI', 'decodeURI', 'encodeURIComponent', 'decodeURIComponent',
  'setTimeout', 'setInterval', 'clearTimeout', 'clearInterval', 'queueMicrotask',
  'structuredClone',
]);

const NATIVE_PROTOTYPE_METHODS = new Set([
  'map', 'filter', 'reduce', 'reduceRight', 'forEach', 'find', 'findIndex',
  'findLast', 'findLastIndex', 'some', 'every', 'flat', 'flatMap',
  'push', 'pop', 'shift', 'unshift', 'slice', 'splice', 'concat', 'fill',
  'join', 'reverse', 'sort', 'at', 'copyWithin',
  'includes', 'indexOf', 'lastIndexOf',
  'keys', 'values', 'entries',
  'toString', 'toLocaleString', 'valueOf',
  'trim', 'trimStart', 'trimEnd', 'padStart', 'padEnd',
  'replace', 'replaceAll', 'match', 'matchAll', 'search',
  'startsWith', 'endsWith', 'charAt', 'charCodeAt', 'codePointAt',
  'substring', 'slice', 'toUpperCase', 'toLowerCase', 'normalize',
  'then', 'catch', 'finally',
]);

export function isDatabaseCallPattern(symbol: string, method: string): boolean {
  return DATABASE_CALL_PATTERNS.some((p) => p.symbol === symbol && p.method === method);
}

export function isApiCallPattern(symbol: string, method: string): boolean {
  if (symbol === 'unknown' && API_CALL_SYMBOLS.has(method)) return true;
  if (API_CALL_SYMBOLS.has(symbol)) return true;
  return false;
}

export function isBuiltinClass(className: string): boolean {
  return JS_GLOBAL_NAMESPACES.has(className);
}

export function isBuiltinCall(symbol: string, method: string): boolean {
  const baseSymbol = symbol.replace(/\?+$/g, '');
  if (JS_GLOBAL_NAMESPACES.has(baseSymbol)) return true;
  if (NATIVE_PROTOTYPE_METHODS.has(method)) return true;
  // Standalone global function calls have symbol === 'unknown' (plain identifier, no object prefix)
  if (baseSymbol === 'unknown' && JS_GLOBAL_FUNCTIONS.has(method)) return true;
  return false;
}
