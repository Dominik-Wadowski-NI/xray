import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { registerTools } from "./tools/index.js";

const version = "1.0.0";

export function createServer(): McpServer {
  const server = new McpServer({
    name: "xray",
    version,
  });

  registerTools(server);

  return server;
}
