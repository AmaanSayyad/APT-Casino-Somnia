/**
 * ZetaChain Network Configuration
 * 
 * Configuration for ZetaChain Athens Testnet
 * Used for universal cross-chain game logging
 */

export const zetachainTestnetConfig = {
  id: 7001,
  name: 'ZetaChain Athens Testnet',
  network: 'zetachain-testnet',
  nativeCurrency: {
    name: 'ZETA',
    symbol: 'ZETA',
    decimals: 18,
  },
  rpcUrls: {
    default: {
      http: ['https://zetachain-athens-evm.blockpi.network/v1/rpc/public'],
    },
    public: {
      http: ['https://zetachain-athens-evm.blockpi.network/v1/rpc/public'],
    },
  },
  blockExplorers: {
    default: {
      name: 'ZetaChain Explorer',
      url: 'https://athens.explorer.zetachain.com',
    },
  },
  contracts: {
    universalGameLogger: process.env.NEXT_PUBLIC_ZETACHAIN_GAME_LOGGER_ADDRESS || '',
    gateway: '0x6c533f7fe93fae114d0954697069df33c9b74fd7', // ZetaChain testnet gateway
  },
  testnet: true,
};

/**
 * Get ZetaChain configuration
 * @returns {Object} ZetaChain network configuration
 */
export function getZetaChainConfig() {
  return zetachainTestnetConfig;
}

/**
 * Get ZetaChain RPC URL
 * @returns {string} RPC URL
 */
export function getZetaChainRpcUrl() {
  return process.env.NEXT_PUBLIC_ZETACHAIN_RPC || 
         zetachainTestnetConfig.rpcUrls.default.http[0];
}

/**
 * Get ZetaChain explorer URL
 * @returns {string} Explorer base URL
 */
export function getZetaChainExplorerUrl() {
  return process.env.NEXT_PUBLIC_ZETACHAIN_EXPLORER || 
         zetachainTestnetConfig.blockExplorers.default.url;
}

/**
 * Get Universal Game Logger contract address
 * @returns {string} Contract address
 */
export function getUniversalGameLoggerAddress() {
  const address = process.env.NEXT_PUBLIC_ZETACHAIN_GAME_LOGGER_ADDRESS || 
                  zetachainTestnetConfig.contracts.universalGameLogger;
  
  if (!address || address === '') {
    console.warn('ZetaChain Universal Game Logger address not configured');
  }
  
  return address;
}

/**
 * Check if ZetaChain is properly configured
 * @returns {boolean} True if all required configuration is present
 */
export function isZetaChainConfigured() {
  const address = getUniversalGameLoggerAddress();
  const rpcUrl = getZetaChainRpcUrl();
  
  return !!(address && address !== '' && rpcUrl);
}

/**
 * Get transaction explorer URL
 * @param {string} txHash - Transaction hash
 * @returns {string} Full explorer URL for the transaction
 */
export function getZetaChainTransactionUrl(txHash) {
  const explorerUrl = getZetaChainExplorerUrl();
  return `${explorerUrl}/tx/${txHash}`;
}

/**
 * Get address explorer URL
 * @param {string} address - Wallet or contract address
 * @returns {string} Full explorer URL for the address
 */
export function getZetaChainAddressUrl(address) {
  const explorerUrl = getZetaChainExplorerUrl();
  return `${explorerUrl}/address/${address}`;
}

export default zetachainTestnetConfig;
