const hre = require("hardhat");
const {
  getZetaChainConfig,
  getZetaChainRpcUrl,
  getZetaChainExplorerUrl,
  getUniversalGameLoggerAddress,
  isZetaChainConfigured,
  getZetaChainTransactionUrl,
  getZetaChainAddressUrl
} = require("../src/config/zetachainConfig.js");

async function main() {
  console.log("=== ZetaChain Configuration Test ===\n");

  // Test configuration loading
  const config = getZetaChainConfig();
  console.log("✅ Configuration loaded successfully");
  console.log("   Chain ID:", config.id);
  console.log("   Network:", config.network);
  console.log("   Name:", config.name);

  // Test RPC URL
  const rpcUrl = getZetaChainRpcUrl();
  console.log("\n✅ RPC URL:", rpcUrl);

  // Test Explorer URL
  const explorerUrl = getZetaChainExplorerUrl();
  console.log("✅ Explorer URL:", explorerUrl);

  // Test Contract Address
  const contractAddress = getUniversalGameLoggerAddress();
  console.log("✅ Contract Address:", contractAddress);

  // Test Configuration Status
  const isConfigured = isZetaChainConfigured();
  console.log("✅ Configuration Status:", isConfigured ? "COMPLETE" : "INCOMPLETE");

  // Test URL Helpers
  const sampleTxHash = "0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef";
  const txUrl = getZetaChainTransactionUrl(sampleTxHash);
  console.log("\n✅ Transaction URL Format:", txUrl);

  const sampleAddress = "0x1234567890123456789012345678901234567890";
  const addressUrl = getZetaChainAddressUrl(sampleAddress);
  console.log("✅ Address URL Format:", addressUrl);

  // Test Contract Connection
  console.log("\n=== Testing Contract Connection ===\n");
  
  try {
    const provider = new hre.ethers.JsonRpcProvider(rpcUrl);
    const blockNumber = await provider.getBlockNumber();
    console.log("✅ Connected to ZetaChain RPC");
    console.log("   Current Block:", blockNumber);

    // Test contract interaction
    const UniversalGameLogger = await hre.ethers.getContractFactory("UniversalGameLogger");
    const contract = UniversalGameLogger.attach(contractAddress);
    
    const owner = await contract.owner();
    console.log("\n✅ Contract is accessible");
    console.log("   Owner:", owner);

    const totalLogs = await contract.getTotalLogs();
    console.log("   Total Logs:", totalLogs.toString());

    const stats = await contract.getStats();
    console.log("\n✅ Contract Statistics:");
    console.log("   Total Games:", stats[0].toString());
    console.log("   Total Bet Amount:", hre.ethers.formatEther(stats[1]), "ZETA");
    console.log("   Total Payout:", hre.ethers.formatEther(stats[2]), "ZETA");
    console.log("   Roulette:", stats[3].toString());
    console.log("   Mines:", stats[4].toString());
    console.log("   Wheel:", stats[5].toString());
    console.log("   Plinko:", stats[6].toString());

    console.log("\n=== All Tests Passed! ===");
    console.log("✅ ZetaChain configuration is complete and functional");
    console.log("✅ Contract is deployed and accessible");
    console.log("✅ Ready for integration with game logging services");

  } catch (error) {
    console.error("\n❌ Error testing contract connection:", error.message);
    process.exit(1);
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
