import type { Summary, CallSiteEntry, ImportsByPackage } from './exit-points.types';

export const buildSummary = (importsByPackage: ImportsByPackage, callSites: CallSiteEntry[]): Summary => {
  const summary: Summary = {};

  for (const [pkgName, entry] of importsByPackage.entries()) {
    if (!summary[entry.category]) {
      summary[entry.category] = {
        callSiteCount: 0,
        packages: [],
      };
    }
    const summaryEntry = summary[entry.category];
    if (summaryEntry && !summaryEntry.packages.includes(pkgName)) {
      summaryEntry.packages.push(pkgName);
    }
  }

  for (const callSite of callSites) {
    if (!summary[callSite.category]) {
      summary[callSite.category] = {
        callSiteCount: 0,
        packages: [],
      };
    }
    const summaryEntry = summary[callSite.category];
    if (summaryEntry) {
      summaryEntry.callSiteCount += 1;
      if (!summaryEntry.packages.includes(callSite.package)) {
        summaryEntry.packages.push(callSite.package);
      }
    }
  }

  return summary;
};
