export function parseServiceArg(): string {
  const serviceArg = process.argv.find((arg, i) => i > 0 && process.argv[i - 1] === '--service');

  if (!serviceArg) {
    throw new Error('Missing required --service argument');
  }

  return serviceArg;
}
