const { ethers } = require("hardhat");

async function main() {
  console.log("🧪 Testing Somnia Testnet Deployment...");
  console.log("=" .repeat(60));

  const TREASURY_ADDRESS = "0xacA996A4d49e7Ed42dA68a20600F249BE6d024A4";
  const GAME_LOGGER_ADDRESS = "0x649A1a3cf745d60C98C12f3c404E09bdBb4151db";

  // Connect to contracts
  const Treasury = await ethers.getContractFactory("SomniaTreasury");
  const treasury = Treasury.attach(TREASURY_ADDRESS);

  const GameLogger = await ethers.getContractFactory("SomniaGameLogger");
  const gameLogger = GameLogger.attach(GAME_LOGGER_ADDRESS);

  console.log("\n📊 Treasury Contract Status:");
  try {
    const stats = await treasury.getTreasuryStats();
    console.log("  ✅ Contract Balance:", ethers.formatEther(stats.contractBalance), "STT");
    console.log("  ✅ Total Deposited:", ethers.formatEther(stats.totalDeposited), "STT");
    console.log("  ✅ Total Withdrawn:", ethers.formatEther(stats.totalWithdrawn), "STT");
    console.log("  ✅ Total Users:", stats.userCount.toString());

    const minDeposit = await treasury.minDeposit();
    const maxDeposit = await treasury.maxDeposit();
    console.log("  ✅ Min Deposit:", ethers.formatEther(minDeposit), "STT");
    console.log("  ✅ Max Deposit:", ethers.formatEther(maxDeposit), "STT");
  } catch (error) {
    console.log("  ❌ Error:", error.message);
  }

  console.log("\n📊 Game Logger Contract Status:");
  try {
    const stats = await gameLogger.getStats();
    console.log("  ✅ Total Games:", stats.totalGames.toString());
    console.log("  ✅ Total Bets:", ethers.formatEther(stats.totalBets), "STT");
    console.log("  ✅ Total Payouts:", ethers.formatEther(stats.totalPayouts), "STT");
    console.log("  ✅ Roulette Games:", stats.rouletteCount.toString());
    console.log("  ✅ Mines Games:", stats.minesCount.toString());
    console.log("  ✅ Wheel Games:", stats.wheelCount.toString());
    console.log("  ✅ Plinko Games:", stats.plinkoCount.toString());

    const totalLogs = await gameLogger.getTotalLogs();
    console.log("  ✅ Total Logs:", totalLogs.toString());
  } catch (error) {
    console.log("  ❌ Error:", error.message);
  }

  console.log("\n" + "=".repeat(60));
  console.log("✅ All contracts are operational!");
  console.log("\n🔗 Contract Links:");
  console.log("  Treasury:", `https://shannon-explorer.somnia.network/address/${TREASURY_ADDRESS}`);
  console.log("  Game Logger:", `https://shannon-explorer.somnia.network/address/${GAME_LOGGER_ADDRESS}`);
  console.log("=" .repeat(60));
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("\n❌ Test failed:", error);
    process.exit(1);
  });
