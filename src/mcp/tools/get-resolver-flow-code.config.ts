import { z } from "zod";

const inputSchema = z.object({
  service: z.string().describe("Service name (e.g. 'product-rts')"),
  resolverName: z.string().describe("Resolver name to trace"),
});

const outputSchema = z.object({
  content: z.array(z.object({ type: z.literal("text"), text: z.string() })),
});

const options = {
  title: "Get resolver flow with code",
  description: "Get resolver flow with actual code snippets from functions and stripped snippets from external calls",
  inputSchema,
  outputSchema,
};

export default {
  name: "get-resolver-flow-code",
  options,
};
