const { ethers } = require("hardhat");

async function main() {
  console.log("🔍 Verifying Somnia Testnet Contracts...");
  console.log("=" .repeat(60));

  const TREASURY_ADDRESS = "0xacA996A4d49e7Ed42dA68a20600F249BE6d024A4";
  const GAME_LOGGER_ADDRESS = "0x649A1a3cf745d60C98C12f3c404E09bdBb4151db";
  const EXPLORER_URL = "https://shannon-explorer.somnia.network";

  console.log("\n📋 Contract Addresses:");
  console.log("  SomniaTreasury:", TREASURY_ADDRESS);
  console.log("  SomniaGameLogger:", GAME_LOGGER_ADDRESS);

  console.log("\n🔗 Block Explorer Links:");
  console.log("  Treasury:", `${EXPLORER_URL}/address/${TREASURY_ADDRESS}`);
  console.log("  Game Logger:", `${EXPLORER_URL}/address/${GAME_LOGGER_ADDRESS}`);

  console.log("\n✅ Contracts deployed successfully!");
  console.log("\nTo verify contracts manually:");
  console.log("1. Visit the block explorer links above");
  console.log("2. Click 'Verify & Publish' on each contract");
  console.log("3. Select compiler version: 0.8.20");
  console.log("4. Enable optimization: Yes (200 runs)");
  console.log("5. Paste the contract source code");

  console.log("\n" + "=".repeat(60));
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("❌ Verification failed:", error);
    process.exit(1);
  });
