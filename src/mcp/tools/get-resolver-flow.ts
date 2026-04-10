import { z } from "zod";
import { getConfigForService } from "../../config/index.js";
import { loadResolversFromFile, filterResolvers } from "../../resolver-flow/resolver-flow.resolver-loader.js";
import { createProject, addAllSourceFilesToProject } from "../../shared/morph.js";
import { loadSourceFilesFromTsConfig, findSourceFile, findFunctionAtLine } from "../../resolver-flow/resolver-flow.project-loader.js";
import { scanFunction } from "../../resolver-flow/resolver-flow.traverser.js";
import { buildResolverFlowReport } from "../../resolver-flow/resolver-flow.report-builder.js";
import type { ScannerContext, ResolverFlowReport } from "../../resolver-flow/resolver-flow.types.js";
import type { Config } from "../../config/config.types.js";

const inputSchema = z.object({
  service: z.string().describe("Service name (e.g. 'product-rts')"),
  resolverName: z.string().describe("Resolver name to trace"),
});

type GetResolverFlowInput = z.infer<typeof inputSchema>;

function createScannerContext(config: Config): ScannerContext {
  return {
    project: null as any,
    categories: config.exitPoints.categories,
    visited: new Set(),
    callOrder: 0,
    functions: [],
    externalCalls: [],
    apiRequests: [],
    databaseCalls: [],
    classInstantiations: [],
    currentFile: "",
    currentLine: 0,
  };
}

function isNodeModulesPath(filePath: string): boolean {
  return filePath.includes("node_modules");
}

function extractFilesFromReport(report: ResolverFlowReport): Set<string> {
  const files = new Set<string>();

  files.add(report.resolver.file);

  report.functions.forEach((fn) => {
    if (!isNodeModulesPath(fn.file)) {
      files.add(fn.file);
    }
  });

  report.externalPackages.forEach((call) => {
    if (!isNodeModulesPath(call.file)) {
      files.add(call.file);
    }
  });

  report.apiRequests.forEach((req) => {
    if (!isNodeModulesPath(req.file)) {
      files.add(req.file);
    }
  });

  report.databaseCalls.forEach((call) => {
    if (!isNodeModulesPath(call.file)) {
      files.add(call.file);
    }
  });

  report.classInstantiations.forEach((inst) => {
    if (!isNodeModulesPath(inst.file)) {
      files.add(inst.file);
    }
    if (inst.definitionFile && !isNodeModulesPath(inst.definitionFile)) {
      files.add(inst.definitionFile);
    }
  });

  return files;
}

async function getResolverFlow(input: GetResolverFlowInput): Promise<string> {
  const config = getConfigForService(input.service);

  if (!config.rootDir || !config.gqlResolver?.entrypoint || !config.reports?.resolvers) {
    throw new Error("Config: missing required fields (rootDir, gqlResolver.entrypoint, reports.resolvers)");
  }

  const typedConfig = config as Config;

  let resolvers = loadResolversFromFile(typedConfig.reports.resolvers);
  resolvers = filterResolvers(resolvers, input.resolverName);

  if (resolvers.length === 0) {
    throw new Error(`No resolvers found for name: ${input.resolverName}`);
  }

  const resolver = resolvers[0]!;

  const project = createProject(typedConfig.tsconfig);
  loadSourceFilesFromTsConfig(project, typedConfig.tsconfig);
  await addAllSourceFilesToProject(project, typedConfig.rootDir);

  const sourceFile = findSourceFile(project, resolver.definitionFile);
  if (!sourceFile) {
    throw new Error(`Source file not found: ${resolver.definitionFile}`);
  }

  const funcNode = findFunctionAtLine(sourceFile, resolver.line);
  if (!funcNode) {
    throw new Error(`Function not found at line ${resolver.line} in ${resolver.definitionFile}`);
  }

  const context = createScannerContext(typedConfig);
  scanFunction(funcNode, sourceFile, context);

  const report = buildResolverFlowReport(resolver, context);
  const files = extractFilesFromReport(report);

  const sortedFiles = Array.from(files).sort();
  return sortedFiles.join("\n");
}

export async function handleGetResolverFlow(
  input: unknown
): Promise<{
  content: Array<{ type: "text"; text: string }>;
  structuredContent?: { content: Array<{ type: "text"; text: string }> };
}> {
  try {
    const parsed = inputSchema.parse(input);
    const result = await getResolverFlow(parsed);

    const contentBlock = {
      type: "text" as const,
      text: result,
    };

    const response = {
      content: [contentBlock],
      structuredContent: {
        content: [contentBlock],
      },
    };

    return response;
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    const errorContentBlock = {
      type: "text" as const,
      text: `Error: ${message}`,
    };
    return {
      content: [errorContentBlock],
      structuredContent: {
        content: [errorContentBlock],
      },
    };
  }
}
