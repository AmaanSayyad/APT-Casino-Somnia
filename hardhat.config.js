require("@nomicfoundation/hardhat-toolbox");
require("dotenv").config({ path: '.env.local' });
require("dotenv").config({ path: '.env' });

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  solidity: {
    compilers: [
      {
        version: "0.8.20",
        settings: {
          optimizer: {
            enabled: true,
            runs: 200,
          },
        },
      },
      {
        version: "0.8.19",
        settings: {
          optimizer: {
            enabled: true,
            runs: 200,
          },
        },
      }
    ]
  },
  networks: {
    'arbitrum-sepolia': {
      url: process.env.NEXT_PUBLIC_ARBITRUM_SEPOLIA_RPC || "https://sepolia-rollup.arbitrum.io/rpc",
      accounts: ["0x080c0b0dc7aa27545fab73d29b06f33e686d1491aef785bf5ced325a32c14506"],
      chainId: 421614,
      timeout: 120000, // 2 minutes
      httpHeaders: {
        "User-Agent": "hardhat"
      }
    },
    'arbitrum-one': {
      url: process.env.NEXT_PUBLIC_ARBITRUM_ONE_RPC || "https://arb1.arbitrum.io/rpc",
      accounts: process.env.TREASURY_PRIVATE_KEY ? [process.env.TREASURY_PRIVATE_KEY] : [],
      chainId: 42161,
      timeout: 120000,
      httpHeaders: {
        "User-Agent": "hardhat"
      }
    },
    'somnia-testnet-testnet': {
      url: process.env.NEXT_PUBLIC_SOMNIA_TESTNET_TESTNET_RPC || "https://dream-rpc.somnia.network",
      accounts: process.env.TREASURY_PRIVATE_KEY ? [process.env.TREASURY_PRIVATE_KEY] : [],
      chainId: 50312,
      timeout: 120000,
      httpHeaders: {
        "User-Agent": "hardhat"
      }
    },
    localhost: {
      url: "http://127.0.0.1:8545",
      chainId: 31337,
    },
  },
  etherscan: {
    apiKey: {
      arbitrumSepolia: process.env.ARBISCAN_API_KEY || "",
      arbitrumOne: process.env.ARBISCAN_API_KEY || "",
      'somnia-testnet-testnet': "abc" // Blockscout doesn't require API key
    },
    customChains: [
      {
        network: "somnia-testnet-testnet",
        chainId: 50312,
        urls: {
          apiURL: "https://shannon-explorer.somnia.network/api",
          browserURL: "https://shannon-explorer.somnia.network"
        }
      }
    ]
  },
  paths: {
    sources: "./contracts",
    tests: "./test",
    cache: "./cache",
    artifacts: "./artifacts",
  },
};