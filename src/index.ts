import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { CallToolRequestSchema, ListToolsRequestSchema } from "@modelcontextprotocol/sdk/types.js";
import { getMcpTools } from "@coinbase/agentkit-model-context-protocol";
import { getAgentKit } from "./getAgentKit.js";

/**
 * This is the main entry point for the MCP agent.
 * It creates a new agent and starts the server.
 */
async function main() {
  // Log startup to stderr (MCP debuggers can capture this)
  process.stderr.write("Starting MCP server...\n");
  
  try {
    process.stderr.write("Initializing AgentKit...\n");
    const agentKit = await getAgentKit();
    process.stderr.write("AgentKit initialized successfully\n");

    process.stderr.write("Loading MCP tools...\n");
    const { tools, toolHandler } = await getMcpTools(agentKit);
    process.stderr.write(`Loaded ${tools.length} tools\n`);

    const server = new Server(
      {
        name: "agentkit",
        version: "0.1.0",
      },
      {
        capabilities: {
          tools: {},
        },
      },
    );

    server.setRequestHandler(ListToolsRequestSchema, async () => {
      return {
        tools,
      };
    });

    server.setRequestHandler(CallToolRequestSchema, async request => {
      try {
        return toolHandler(request.params.name, request.params.arguments);
      } catch (error) {
        throw new Error(`Tool ${request.params.name} failed: ${error}`);
      }
    });

    process.stderr.write("Connecting to stdio transport...\n");
    const transport = new StdioServerTransport();

    await server.connect(transport);
    process.stderr.write("MCP server connected and ready\n");
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    process.stderr.write(`Error in main(): ${errorMessage}\n`);
    throw error;
  }
}

main().catch((error) => {
  // Write error to stderr so MCP debuggers can capture it
  const errorMessage = error instanceof Error ? error.message : String(error);
  const errorStack = error instanceof Error ? error.stack : undefined;
  process.stderr.write(
    JSON.stringify({
      error: "Failed to start MCP server",
      message: errorMessage,
      stack: errorStack,
    }) + "\n"
  );
  // Exit with error code
  process.exit(1);
});
