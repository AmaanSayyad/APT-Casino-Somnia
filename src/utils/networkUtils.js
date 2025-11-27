// Network utilities for Somnia Testnet
import { somniaTestnet } from '@/config/chains';

export const SOMNIA_TESTNET_CONFIG = {
  chainId: '0xc488', // 50312 in hex
  chainName: 'Somnia Testnet',
  nativeCurrency: {
    name: 'Somnia Testnet',
    symbol: 'STT',
    decimals: 18,
  },
  rpcUrls: ['https://dream-rpc.somnia.network'],
  blockExplorerUrls: ['https://shannon-explorer.somnia.network'],
};

export const switchToSomniaTestnet = async () => {
  if (!window.ethereum) {
    throw new Error('MetaMask is not installed');
  }

  try {
    // Try to switch to Somnia Testnet
    await window.ethereum.request({
      method: 'wallet_switchEthereumChain',
      params: [{ chainId: SOMNIA_TESTNET_CONFIG.chainId }],
    });
  } catch (switchError) {
    // If the chain is not added, add it
    if (switchError.code === 4902) {
      try {
        await window.ethereum.request({
          method: 'wallet_addEthereumChain',
          params: [SOMNIA_TESTNET_CONFIG],
        });
      } catch (addError) {
        throw new Error('Failed to add Somnia Testnet to MetaMask');
      }
    } else {
      throw new Error('Failed to switch to Somnia Testnet');
    }
  }
};

export const isSomniaTestnet = (chainId) => {
  return chainId === 50312 || chainId === '0xc488';
};

export const formatMonBalance = (balance, decimals = 5) => {
  const numBalance = parseFloat(balance || '0');
  return `${numBalance.toFixed(decimals)} STT`;
};

export const getSomniaTestnetExplorerUrl = (txHash) => {
  return `https://shannon-explorer.somnia.network/tx/${txHash}`;
};
