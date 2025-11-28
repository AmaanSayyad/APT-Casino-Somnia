const hre = require("hardhat");

async function main() {
  const contractAddress = process.env.NEXT_PUBLIC_ZETACHAIN_GAME_LOGGER_ADDRESS;
  
  if (!contractAddress) {
    console.error("Error: NEXT_PUBLIC_ZETACHAIN_GAME_LOGGER_ADDRESS not set in .env");
    process.exit(1);
  }

  console.log("Verifying UniversalGameLogger contract...");
  console.log("Contract address:", contractAddress);
  console.log("Network: ZetaChain Athens Testnet");

  try {
    // Get the contract instance
    const UniversalGameLogger = await hre.ethers.getContractFactory("UniversalGameLogger");
    const contract = UniversalGameLogger.attach(contractAddress);

    // Get deployer
    const [deployer] = await hre.ethers.getSigners();
    console.log("\nVerifying with account:", deployer.address);

    // Check owner
    const owner = await contract.owner();
    console.log("Contract owner:", owner);

    // Check if deployer is authorized
    const isAuthorized = await contract.isAuthorizedLogger(deployer.address);
    console.log("Deployer is authorized logger:", isAuthorized);

    // Get contract stats
    const stats = await contract.getStats();
    console.log("\nContract Statistics:");
    console.log("- Total games logged:", stats[0].toString());
    console.log("- Total bet amount:", hre.ethers.formatEther(stats[1]), "ZETA");
    console.log("- Total payout amount:", hre.ethers.formatEther(stats[2]), "ZETA");
    console.log("- Roulette games:", stats[3].toString());
    console.log("- Mines games:", stats[4].toString());
    console.log("- Wheel games:", stats[5].toString());
    console.log("- Plinko games:", stats[6].toString());

    // Get total logs
    const totalLogs = await contract.getTotalLogs();
    console.log("- Total logs:", totalLogs.toString());

    console.log("\n✅ Contract verification successful!");
    console.log("Explorer URL:", `https://athens.explorer.zetachain.com/address/${contractAddress}`);

  } catch (error) {
    console.error("Verification failed:", error.message);
    process.exit(1);
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
