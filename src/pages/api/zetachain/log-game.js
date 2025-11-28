/**
 * ZetaChain Game Logging API Endpoint
 * 
 * This endpoint receives game results from the frontend and logs them to ZetaChain
 * using the backend wallet (which is authorized on the Universal Game Logger contract)
 */

import { ethers } from 'ethers';
import { 
  getZetaChainRpcUrl, 
  getUniversalGameLoggerAddress,
  getZetaChainTransactionUrl,
  isZetaChainConfigured 
} from '../../../config/zetachainConfig';

// Universal Game Logger Contract ABI (minimal interface)
const UNIVERSAL_GAME_LOGGER_ABI = [
  'function logGameResult(uint8 gameType, uint256 betAmount, bytes memory resultData, uint256 payout, bytes32 entropyRequestId) external returns (bytes32 logId)',
  'event UniversalGameLogged(bytes32 indexed logId, address indexed player, uint8 indexed gameType, uint256 betAmount, uint256 payout, bytes32 entropyRequestId, uint256 timestamp)'
];

// Game type enum mapping
const GAME_TYPES = {
  ROULETTE: 0,
  MINES: 1,
  WHEEL: 2,
  PLINKO: 3
};

export default async function handler(req, res) {
  // Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Check if ZetaChain is configured
    if (!isZetaChainConfigured()) {
      console.warn('⚠️ ZetaChain not configured');
      return res.status(503).json({ 
        success: false, 
        error: 'ZetaChain logging not configured' 
      });
    }

    const { gameType, playerAddress, betAmount, result, payout, entropyProof } = req.body;

    // Validate required fields
    if (!gameType || !playerAddress || betAmount === undefined || !result || payout === undefined) {
      return res.status(400).json({ 
        success: false, 
        error: 'Missing required fields' 
      });
    }

    // Validate player address
    if (!ethers.isAddress(playerAddress)) {
      return res.status(400).json({ 
        success: false, 
        error: 'Invalid player address' 
      });
    }

    // Validate game type
    const gameTypeEnum = GAME_TYPES[gameType.toUpperCase()];
    if (gameTypeEnum === undefined) {
      return res.status(400).json({ 
        success: false, 
        error: `Invalid game type: ${gameType}` 
      });
    }

    // Get backend wallet private key from environment (use ZETA_TREASURY)
    const backendPrivateKey = process.env.ZETA_TREASURY_PRIVATE_KEY;
    if (!backendPrivateKey) {
      console.error('❌ ZETA_TREASURY_PRIVATE_KEY not configured');
      return res.status(503).json({ 
        success: false, 
        error: 'Backend wallet not configured' 
      });
    }

    // Connect to ZetaChain
    const rpcUrl = getZetaChainRpcUrl();
    const provider = new ethers.JsonRpcProvider(rpcUrl);
    
    // Create wallet from private key
    const wallet = new ethers.Wallet(backendPrivateKey, provider);
    
    // Get contract instance
    const contractAddress = getUniversalGameLoggerAddress();
    const contract = new ethers.Contract(
      contractAddress,
      UNIVERSAL_GAME_LOGGER_ABI,
      wallet
    );

    // Encode result data
    const resultData = ethers.toUtf8Bytes(JSON.stringify(result));

    // Convert amounts to wei
    const betAmountWei = ethers.parseEther(betAmount.toString());
    const payoutWei = ethers.parseEther(payout.toString());

    // Prepare entropy proof
    const entropyRequestId = entropyProof?.requestId || ethers.ZeroHash;

    console.log('📝 Logging game to ZetaChain via backend:', {
      gameType,
      playerAddress,
      betAmount: betAmountWei.toString(),
      payout: payoutWei.toString(),
      backendWallet: wallet.address
    });

    // Call contract function (backend wallet signs the transaction)
    const tx = await contract.logGameResult(
      gameTypeEnum,
      betAmountWei,
      resultData,
      payoutWei,
      entropyRequestId
    );

    console.log('⏳ ZetaChain transaction submitted:', tx.hash);

    // Wait for confirmation
    const receipt = await tx.wait();

    console.log('✅ Game logged to ZetaChain:', {
      txHash: receipt.hash,
      blockNumber: receipt.blockNumber,
      gasUsed: receipt.gasUsed.toString()
    });

    // Return success response
    return res.status(200).json({
      success: true,
      txHash: receipt.hash,
      blockNumber: receipt.blockNumber,
      explorerUrl: getZetaChainTransactionUrl(receipt.hash),
      gasUsed: receipt.gasUsed.toString()
    });

  } catch (error) {
    console.error('❌ Failed to log game to ZetaChain:', error);
    
    // Return error response (but don't expose sensitive details)
    return res.status(500).json({
      success: false,
      error: 'Failed to log game to ZetaChain',
      message: error.message || 'Unknown error'
    });
  }
}
