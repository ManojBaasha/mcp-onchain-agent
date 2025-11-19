# MCP Onchain Agent

A [Model Context Protocol (MCP)](https://modelcontextprotocol.io/) server that integrates [Coinbase AgentKit](https://github.com/coinbase/agentkit) to provide AI-driven on-chain interactions through Claude Desktop and other MCP-compatible clients.

## Features

- **MCP Server**: Exposes AgentKit tools via the Model Context Protocol
- **Comprehensive Error Handling**: Detailed logging and error messages for debugging
- **Multi-Client Support**: Works with Claude Desktop, MCP Jam, and other MCP debuggers
- **CDP Integration**: Uses Coinbase Developer Platform (CDP) for wallet management and on-chain operations
- **Testnet Utilities**: Includes a utility script for requesting testnet funds

## Project Structure

```
mcp-onchain-agent/
├── src/
│   ├── index.ts              # MCP server entry point
│   └── getAgentKit.ts        # AgentKit configuration and initialization
├── server_wallet/
│   └── main.ts               # Utility script for testnet faucet requests
├── build/                    # Compiled output (generated)
├── claude_desktop_config.json    # Claude Desktop configuration (not tracked)
├── mcp_debugger_config.example.json  # Example config for MCP debuggers
└── package.json
```

## Prerequisites

- Node.js (v22+ recommended)
- CDP API credentials:
  - `CDP_API_KEY_ID`
  - `CDP_API_KEY_SECRET`
  - `CDP_WALLET_SECRET`

## Installation

```sh
npm install
```

## Configuration

### Environment Variables

The server requires the following environment variables (set via your MCP client configuration):

**Required:**
- `CDP_API_KEY_ID` - Your CDP API key ID
- `CDP_API_KEY_SECRET` - Your CDP API key secret
- `CDP_WALLET_SECRET` - Your CDP wallet secret

**Optional:**
- `NETWORK_ID` - Network ID (default: `base-sepolia`)
- `ADDRESS` - Wallet address (if using existing wallet)
- `OWNER_ADDRESS` - Owner address for wallet
- `RPC_URL` - Custom RPC endpoint
- `PAYMASTER_URL` - Paymaster URL for sponsored transactions
- `IDEMPOTENCY_KEY` - Idempotency key for requests

## Usage

### Building the Server

```sh
npm run build
```

This compiles TypeScript to JavaScript in the `build/` directory.

### Using with Claude Desktop

1. Copy `claude_desktop_config.json` to your Claude Desktop config directory:
   ```sh
   cp claude_desktop_config.json ~/Library/Application\ Support/Claude/claude_desktop_config.json
   ```

2. Edit the config file and add your CDP credentials in the `env` section.

3. Restart Claude Desktop and start using on-chain tools!

### Using with MCP Debuggers (MCP Jam, etc.)

1. Reference `mcp_debugger_config.example.json` for the configuration format.

2. In your MCP debugger, configure the server with:
   - **Command**: `node`
   - **Args**: `["/path/to/mcp-onchain-agent/build/index.js"]`
   - **Environment Variables**: Set all required variables in the `env` section

3. The server logs detailed startup information to stderr, which MCP debuggers can capture for troubleshooting.

### Testnet Utilities

The `server_wallet/` directory contains a utility script for requesting testnet funds:

```sh
cd server_wallet
npm install
# Set up .env file with CDP credentials
npx tsx main.ts
```

This script requests testnet tokens (ETH, USDC, EURC, CB-BTC) from Base Sepolia and Ethereum Sepolia testnets.

## Development

### Code Structure

- **`src/index.ts`**: Main MCP server implementation
  - Sets up MCP server with stdio transport
  - Handles tool listing and execution
  - Provides detailed error logging

- **`src/getAgentKit.ts`**: AgentKit configuration
  - Initializes CDP Smart Wallet Provider
  - Configures action providers (ERC20, WETH, Pyth, etc.)
  - Handles environment variable validation
  - Provides helpful error messages

### Error Handling

The server includes comprehensive error handling:

- **Startup Logging**: Logs each initialization step to stderr
- **Environment Validation**: Checks for required environment variables
- **Structured Errors**: JSON-formatted error output for debuggers
- **Helpful Messages**: Clear error messages with troubleshooting guidance

### Debugging

When the server fails to start, check the stderr output for:

1. `Starting MCP server...` - Server initialization begins
2. `Initializing AgentKit...` - AgentKit configuration starts
3. `Environment check:` - Shows which environment variables are set (without exposing secrets)
4. Error messages with specific details about what went wrong

## Available Tools

The server exposes AgentKit tools via MCP, including:

- Wallet operations (balance checks, transfers)
- ERC20 token operations
- WETH operations
- Pyth price feeds
- CDP API operations
- Smart wallet operations
- X402 operations

See [AgentKit Documentation](https://docs.cdp.coinbase.com/agentkit/docs/welcome) for full tool documentation.

## Troubleshooting

### "Connection closed" Error

This usually means environment variables aren't being passed correctly:

1. Verify all required environment variables are set in your MCP client configuration
2. Check the stderr logs for the "Environment check" output
3. Ensure `ADDRESS` and `OWNER_ADDRESS` are either set correctly or left empty (not "value")

### "Smart Account with given address not found"

The wallet at the specified address doesn't exist. Either:
- Create the wallet first using CDP
- Remove the `ADDRESS` environment variable to let the provider create/find a wallet
- Use a different address where a wallet exists

### "Missing required environment variables"

Ensure all three required variables are set:
- `CDP_API_KEY_ID`
- `CDP_API_KEY_SECRET`
- `CDP_WALLET_SECRET`

## Learn More

- [Model Context Protocol Documentation](https://modelcontextprotocol.io/quickstart/server)
- [AgentKit Documentation](https://docs.cdp.coinbase.com/agentkit/docs/welcome)
- [Coinbase Developer Platform](https://docs.cdp.coinbase.com/)
- [AgentKit GitHub](https://github.com/coinbase/agentkit)

## License

Private project - see package.json for details.
