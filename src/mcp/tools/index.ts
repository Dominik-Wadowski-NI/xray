import { McpServer } from "@modelcontextprotocol/sdk/server/mcp";
import { handleGetResolverFlow } from "./get-resolver-flow";
import getResolverFlowConfig from "./get-resolver-flow.config";
import { handleGetResolverFlowCode } from "./get-resolver-flow-code";
import getResolverFlowCodeConfig from "./get-resolver-flow-code.config";

export function registerTools(server: McpServer): void {
  server.registerTool(
    getResolverFlowConfig.name,
    getResolverFlowConfig.options,
    handleGetResolverFlow
  );

  server.registerTool(
    getResolverFlowCodeConfig.name,
    getResolverFlowCodeConfig.options,
    handleGetResolverFlowCode
  );
}
