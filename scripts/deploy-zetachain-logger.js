const hre = require("hardhat");
const fs = require("fs");
const path = require("path");

async function main() {
  console.log("Deploying UniversalGameLogger to ZetaChain Athens Testnet...");

  // Get the deployer account
  const [deployer] = await hre.ethers.getSigners();
  console.log("Deploying with account:", deployer.address);

  // Get account balance
  const balance = await deployer.provider.getBalance(deployer.address);
  console.log("Account balance:", hre.ethers.formatEther(balance), "ZETA");

  // Deploy UniversalGameLogger
  const UniversalGameLogger = await hre.ethers.getContractFactory("UniversalGameLogger");
  const universalGameLogger = await UniversalGameLogger.deploy();

  await universalGameLogger.waitForDeployment();
  const contractAddress = await universalGameLogger.getAddress();

  console.log("UniversalGameLogger deployed to:", contractAddress);

  // Save deployment info
  const deploymentInfo = {
    network: "zetachain-testnet",
    chainId: 7001,
    contractAddress: contractAddress,
    deployer: deployer.address,
    deploymentTime: new Date().toISOString(),
    transactionHash: universalGameLogger.deploymentTransaction()?.hash,
    blockNumber: universalGameLogger.deploymentTransaction()?.blockNumber,
  };

  // Save to deployments folder
  const deploymentsDir = path.join(__dirname, "..", "deployments");
  if (!fs.existsSync(deploymentsDir)) {
    fs.mkdirSync(deploymentsDir, { recursive: true });
  }

  const timestamp = Date.now();
  const filename = `zetachain-universal-logger-${timestamp}.json`;
  const filepath = path.join(deploymentsDir, filename);

  fs.writeFileSync(filepath, JSON.stringify(deploymentInfo, null, 2));
  console.log("Deployment info saved to:", filename);

  // Print environment variable to add
  console.log("\n=== Add this to your .env file ===");
  console.log(`NEXT_PUBLIC_ZETACHAIN_GAME_LOGGER_ADDRESS=${contractAddress}`);
  console.log(`NEXT_PUBLIC_ZETACHAIN_RPC=https://zetachain-athens-evm.blockpi.network/v1/rpc/public`);
  console.log(`NEXT_PUBLIC_ZETACHAIN_CHAIN_ID=7001`);
  console.log(`NEXT_PUBLIC_ZETACHAIN_EXPLORER=https://athens.explorer.zetachain.com`);
  console.log("===================================\n");

  // Wait for a few block confirmations before verifying
  console.log("Waiting for block confirmations...");
  await universalGameLogger.deploymentTransaction()?.wait(5);

  // Verify contract on ZetaChain explorer
  console.log("Verifying contract on ZetaChain explorer...");
  try {
    await hre.run("verify:verify", {
      address: contractAddress,
      constructorArguments: [],
    });
    console.log("Contract verified successfully!");
  } catch (error) {
    console.log("Verification failed:", error.message);
    console.log("You can verify manually at:");
    console.log(`https://athens.explorer.zetachain.com/address/${contractAddress}#code`);
  }

  return deploymentInfo;
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
