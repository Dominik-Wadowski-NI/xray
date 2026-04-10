import { z } from "zod";

const inputSchema = z.object({
  service: z.string().describe("Service name (e.g. 'product-rts')"),
  resolverName: z.string().describe("Resolver name to trace"),
});

const outputSchema = z.object({
  content: z.array(z.object({ type: z.literal("text"), text: z.string() })),
});

const options = {
  title: "Get resolver flow",
  description: "Get all source files related to a resolver based on resolver flow tracing",
  inputSchema,
  outputSchema,
};

export default {
  name: "get-resolver-flow",
  options,
};
