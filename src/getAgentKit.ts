import {
  AgentKit,
  cdpApiActionProvider,
  cdpSmartWalletActionProvider,
  erc20ActionProvider,
  pythActionProvider,
  CdpSmartWalletProvider,
  walletActionProvider,
  wethActionProvider,
  x402ActionProvider,
} from "@coinbase/agentkit";

/**
 * Get the AgentKit instance.
 *
 * @returns {Promise<AgentKit>} The AgentKit instance
 */
export async function getAgentKit(): Promise<AgentKit> {
  try {
    // Helper to convert env var to address or undefined (handles empty strings)
    const toAddress = (value: string | undefined): `0x${string}` | undefined => {
      if (!value || value.trim() === "") return undefined;
      return value as `0x${string}`;
    };

    // Debug: Log environment variables (without secrets)
    console.error("Environment check:", {
      hasApiKeyId: !!process.env.CDP_API_KEY_ID,
      hasApiKeySecret: !!process.env.CDP_API_KEY_SECRET,
      hasWalletSecret: !!process.env.CDP_WALLET_SECRET,
      networkId: process.env.NETWORK_ID || "base-sepolia",
      address: process.env.ADDRESS || "(not set)",
      hasOwnerAddress: !!process.env.OWNER_ADDRESS && process.env.OWNER_ADDRESS.trim() !== "",
      hasPaymasterUrl: !!process.env.PAYMASTER_URL,
      hasRpcUrl: !!process.env.RPC_URL,
    });

    // Initialize WalletProvider: https://docs.cdp.coinbase.com/agentkit/docs/wallet-management
    const walletProvider = await CdpSmartWalletProvider.configureWithWallet({
      apiKeyId: process.env.CDP_API_KEY_ID,
      apiKeySecret: process.env.CDP_API_KEY_SECRET,
      walletSecret: process.env.CDP_WALLET_SECRET,
      networkId: process.env.NETWORK_ID || "base-sepolia",
      address: toAddress(process.env.ADDRESS),
      owner: toAddress(process.env.OWNER_ADDRESS),
      paymasterUrl: process.env.PAYMASTER_URL, // Sponsor transactions: https://docs.cdp.coinbase.com/paymaster/docs/welcome
      rpcUrl: process.env.RPC_URL,
      idempotencyKey: process.env.IDEMPOTENCY_KEY || undefined,
    });

    // Initialize AgentKit: https://docs.cdp.coinbase.com/agentkit/docs/agent-actions
    const agentkit = await AgentKit.from({
      walletProvider,
      actionProviders: [
        wethActionProvider(),
        pythActionProvider(),
        walletActionProvider(),
        erc20ActionProvider(),
        cdpApiActionProvider(),
        cdpSmartWalletActionProvider(),
        x402ActionProvider(),
      ],
    });

    return agentkit;
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error("Error initializing agent:", errorMessage);
    
    // Provide more helpful error message for missing env vars
    if (errorMessage.includes("Missing required environment variables")) {
      throw new Error(
        `Failed to initialize agent: ${errorMessage}. ` +
        `Please ensure all required environment variables (CDP_API_KEY_ID, CDP_API_KEY_SECRET, CDP_WALLET_SECRET) ` +
        `are set in your MCP debugger configuration.`
      );
    }
    
    throw new Error(`Failed to initialize agent: ${errorMessage}`);
  }
}
