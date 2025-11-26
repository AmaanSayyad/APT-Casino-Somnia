// Network utilities for Monad Testnet
import { monadTestnet } from '@/config/chains';

export const MONAD_TESTNET_CONFIG = {
  chainId: '0x279f', // 10143 in hex
  chainName: 'Monad Testnet',
  nativeCurrency: {
    name: 'Monad',
    symbol: 'MON',
    decimals: 18,
  },
  rpcUrls: ['https://testnet-rpc.monad.xyz'],
  blockExplorerUrls: ['https://testnet.monadexplorer.com'],
};

export const switchToMonadTestnet = async () => {
  if (!window.ethereum) {
    throw new Error('MetaMask is not installed');
  }

  try {
    // Try to switch to Monad Testnet
    await window.ethereum.request({
      method: 'wallet_switchEthereumChain',
      params: [{ chainId: MONAD_TESTNET_CONFIG.chainId }],
    });
  } catch (switchError) {
    // If the chain is not added, add it
    if (switchError.code === 4902) {
      try {
        await window.ethereum.request({
          method: 'wallet_addEthereumChain',
          params: [MONAD_TESTNET_CONFIG],
        });
      } catch (addError) {
        throw new Error('Failed to add Monad Testnet to MetaMask');
      }
    } else {
      throw new Error('Failed to switch to Monad Testnet');
    }
  }
};

export const isMonadTestnet = (chainId) => {
  return chainId === 10143 || chainId === '0x279f';
};

export const formatMonBalance = (balance, decimals = 5) => {
  const numBalance = parseFloat(balance || '0');
  return `${numBalance.toFixed(decimals)} MON`;
};

export const getMonadTestnetExplorerUrl = (txHash) => {
  return `https://testnet.monadexplorer.com/tx/${txHash}`;
};