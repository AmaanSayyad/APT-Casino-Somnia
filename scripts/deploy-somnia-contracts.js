const { ethers } = require("hardhat");
const fs = require('fs');

async function main() {
  console.log("🚀 Deploying Somnia Testnet Contracts...");
  console.log("=" .repeat(60));

  // Get the deployer account
  const signers = await ethers.getSigners();
  if (signers.length === 0) {
    throw new Error("No signers available. Please check your private key configuration.");
  }
  const deployer = signers[0];
  console.log("Deploying contracts with account:", deployer.address);
  
  const balance = await deployer.provider.getBalance(deployer.address);
  console.log("Account balance:", ethers.formatEther(balance), "STT");

  const network = await ethers.provider.getNetwork();
  console.log("Network:", network.name);
  console.log("Chain ID:", network.chainId.toString());
  console.log("=" .repeat(60));

  // Verify we're on Somnia Testnet
  if (network.chainId !== 50311n && network.chainId !== 50312n) {
    console.log("⚠️  Warning: Not on Somnia Testnet (expected chain ID 50311 or 50312)");
    console.log("Current chain ID:", network.chainId.toString());
    console.log("Proceeding anyway...");
  }

  const deploymentResults = {
    network: network.name,
    chainId: network.chainId.toString(),
    deployer: deployer.address,
    deploymentTime: new Date().toISOString(),
    contracts: {}
  };

  // Deploy SomniaTreasury
  console.log("\n📦 Deploying SomniaTreasury...");
  const SomniaTreasury = await ethers.getContractFactory("SomniaTreasury");
  const treasury = await SomniaTreasury.deploy();
  await treasury.waitForDeployment();
  const treasuryAddress = await treasury.getAddress();
  console.log("✅ SomniaTreasury deployed to:", treasuryAddress);

  deploymentResults.contracts.treasury = {
    address: treasuryAddress,
    transactionHash: treasury.deploymentTransaction()?.hash
  };

  // Test Treasury
  console.log("\n🧪 Testing SomniaTreasury...");
  try {
    const stats = await treasury.getTreasuryStats();
    console.log("Treasury Stats:", {
      contractBalance: ethers.formatEther(stats.contractBalance),
      totalDeposited: ethers.formatEther(stats.totalDeposited),
      totalWithdrawn: ethers.formatEther(stats.totalWithdrawn),
      userCount: stats.userCount.toString()
    });

    const minDeposit = await treasury.minDeposit();
    const maxDeposit = await treasury.maxDeposit();
    console.log("Deposit Limits:", {
      minDeposit: ethers.formatEther(minDeposit) + " STT",
      maxDeposit: ethers.formatEther(maxDeposit) + " STT"
    });

    console.log("✅ Treasury test passed");
  } catch (error) {
    console.log("❌ Treasury test failed:", error.message);
  }

  // Deploy SomniaGameLogger
  console.log("\n📦 Deploying SomniaGameLogger...");
  const SomniaGameLogger = await ethers.getContractFactory("SomniaGameLogger");
  const gameLogger = await SomniaGameLogger.deploy();
  await gameLogger.waitForDeployment();
  const gameLoggerAddress = await gameLogger.getAddress();
  console.log("✅ SomniaGameLogger deployed to:", gameLoggerAddress);

  deploymentResults.contracts.gameLogger = {
    address: gameLoggerAddress,
    transactionHash: gameLogger.deploymentTransaction()?.hash
  };

  // Test Game Logger
  console.log("\n🧪 Testing SomniaGameLogger...");
  try {
    const stats = await gameLogger.getStats();
    console.log("Game Logger Stats:", {
      totalGames: stats.totalGames.toString(),
      totalBets: ethers.formatEther(stats.totalBets),
      totalPayouts: ethers.formatEther(stats.totalPayouts),
      rouletteCount: stats.rouletteCount.toString(),
      minesCount: stats.minesCount.toString(),
      wheelCount: stats.wheelCount.toString(),
      plinkoCount: stats.plinkoCount.toString()
    });

    const isAuthorized = await gameLogger.isAuthorizedLogger(deployer.address);
    console.log("Deployer is authorized logger:", isAuthorized);

    // Authorize treasury to log games
    console.log("\n🔐 Authorizing treasury to log games...");
    const authTx = await gameLogger.addAuthorizedLogger(treasuryAddress);
    await authTx.wait();
    console.log("✅ Treasury authorized");

    const isTreasuryAuthorized = await gameLogger.isAuthorizedLogger(treasuryAddress);
    console.log("Treasury is authorized logger:", isTreasuryAuthorized);

    console.log("✅ Game Logger test passed");
  } catch (error) {
    console.log("❌ Game Logger test failed:", error.message);
  }

  // Test logging a game result
  console.log("\n🎲 Testing game result logging...");
  try {
    const testEntropyRequestId = ethers.keccak256(ethers.toUtf8Bytes("test_entropy_" + Date.now()));
    const testEntropyTxHash = "0x" + "1".repeat(64); // Mock Arbitrum tx hash
    const testResultData = ethers.toUtf8Bytes("test_result");
    
    const logTx = await gameLogger.logGameResult(
      0, // GameType.ROULETTE
      ethers.parseEther("0.1"), // 0.1 STT bet
      testResultData,
      ethers.parseEther("0.2"), // 0.2 STT payout
      testEntropyRequestId,
      testEntropyTxHash
    );
    
    const receipt = await logTx.wait();
    console.log("Game logged in transaction:", receipt.hash);
    console.log("Block number:", receipt.blockNumber);

    // Get the log ID from events
    const event = receipt.logs.find(log => {
      try {
        const parsed = gameLogger.interface.parseLog(log);
        return parsed.name === 'GameResultLogged';
      } catch (e) {
        return false;
      }
    });

    if (event) {
      const parsedEvent = gameLogger.interface.parseLog(event);
      const logId = parsedEvent.args.logId;
      console.log("Log ID:", logId);
      
      // Retrieve the log
      const gameLog = await gameLogger.getGameLog(logId);
      console.log("Game Log:", {
        player: gameLog.player,
        gameType: gameLog.gameType.toString(),
        betAmount: ethers.formatEther(gameLog.betAmount),
        payout: ethers.formatEther(gameLog.payout),
        timestamp: new Date(Number(gameLog.timestamp) * 1000).toISOString()
      });
    }

    console.log("✅ Game logging test passed");
  } catch (error) {
    console.log("❌ Game logging test failed:", error.message);
  }

  // Print deployment summary
  console.log("\n" + "=".repeat(60));
  console.log("📋 DEPLOYMENT SUMMARY");
  console.log("=".repeat(60));
  console.log("\nNetwork Information:");
  console.log("  Network:", network.name);
  console.log("  Chain ID:", network.chainId.toString());
  console.log("  Deployer:", deployer.address);
  console.log("\nDeployed Contracts:");
  console.log("  SomniaTreasury:", treasuryAddress);
  console.log("  SomniaGameLogger:", gameLoggerAddress);
  console.log("\nNext Steps:");
  console.log("  1. Update .env file with contract addresses:");
  console.log(`     NEXT_PUBLIC_SOMNIA_TREASURY_ADDRESS=${treasuryAddress}`);
  console.log(`     NEXT_PUBLIC_SOMNIA_GAME_LOGGER_ADDRESS=${gameLoggerAddress}`);
  console.log("  2. Verify contracts on Somnia block explorer");
  console.log("  3. Test deposit/withdrawal functionality");
  console.log("  4. Test game logging from frontend");
  console.log("=".repeat(60));

  // Save deployment info to file
  const deploymentsDir = './deployments';
  if (!fs.existsSync(deploymentsDir)) {
    fs.mkdirSync(deploymentsDir);
  }
  
  const filename = `${deploymentsDir}/somnia-contracts-${Date.now()}.json`;
  fs.writeFileSync(filename, JSON.stringify(deploymentResults, null, 2));
  console.log("\n💾 Deployment info saved to:", filename);

  // Generate .env update script
  const envUpdate = `
# Somnia Testnet Contract Addresses (deployed ${new Date().toISOString()})
NEXT_PUBLIC_SOMNIA_TREASURY_ADDRESS=${treasuryAddress}
NEXT_PUBLIC_SOMNIA_GAME_LOGGER_ADDRESS=${gameLoggerAddress}
`;

  const envUpdateFile = `${deploymentsDir}/somnia-env-update.txt`;
  fs.writeFileSync(envUpdateFile, envUpdate.trim());
  console.log("📝 Environment variable updates saved to:", envUpdateFile);

  console.log("\n🎉 Deployment completed successfully!");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("\n❌ Deployment failed:");
    console.error(error);
    process.exit(1);
  });
