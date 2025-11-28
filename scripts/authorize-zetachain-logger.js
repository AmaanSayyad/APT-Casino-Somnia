const hre = require("hardhat");

async function main() {
  const contractAddress = process.env.NEXT_PUBLIC_ZETACHAIN_GAME_LOGGER_ADDRESS;
  const somniaTreasuryAddress = process.env.SOMNIA_TESTNET_TREASURY_ADDRESS;
  
  if (!contractAddress) {
    console.error("Error: NEXT_PUBLIC_ZETACHAIN_GAME_LOGGER_ADDRESS not set in .env");
    process.exit(1);
  }

  if (!somniaTreasuryAddress) {
    console.error("Error: SOMNIA_TESTNET_TREASURY_ADDRESS not set in .env");
    process.exit(1);
  }

  console.log("Authorizing logger for UniversalGameLogger contract...");
  console.log("Contract address:", contractAddress);
  console.log("Logger to authorize:", somniaTreasuryAddress);

  try {
    // Get the contract instance
    const UniversalGameLogger = await hre.ethers.getContractFactory("UniversalGameLogger");
    const contract = UniversalGameLogger.attach(contractAddress);

    // Get deployer
    const [deployer] = await hre.ethers.getSigners();
    console.log("Authorizing with account:", deployer.address);

    // Check if already authorized
    const isAlreadyAuthorized = await contract.isAuthorizedLogger(somniaTreasuryAddress);
    
    if (isAlreadyAuthorized) {
      console.log("✅ Address is already authorized!");
      return;
    }

    // Authorize the logger
    console.log("\nAuthorizing logger...");
    const tx = await contract.addAuthorizedLogger(somniaTreasuryAddress);
    console.log("Transaction hash:", tx.hash);
    
    console.log("Waiting for confirmation...");
    await tx.wait();
    
    // Verify authorization
    const isAuthorized = await contract.isAuthorizedLogger(somniaTreasuryAddress);
    
    if (isAuthorized) {
      console.log("✅ Logger authorized successfully!");
    } else {
      console.log("❌ Authorization failed!");
      process.exit(1);
    }

  } catch (error) {
    console.error("Authorization failed:", error.message);
    process.exit(1);
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
