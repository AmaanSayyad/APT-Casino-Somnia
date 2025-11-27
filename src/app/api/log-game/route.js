import { NextResponse } from 'next/server';
import { ethers } from 'ethers';

// Game Logger Contract ABI - expanded for better error handling
const GAME_LOGGER_ABI = [
  'function logGameResult(uint8 gameType, uint256 betAmount, bytes memory resultData, uint256 payout, bytes32 entropyRequestId, string memory entropyTxHash) external returns (bytes32 logId)',
  'function isAuthorizedLogger(address logger) external view returns (bool)',
  'function owner() external view returns (address)'
];

// Game type enum
const GAME_TYPES = {
  ROULETTE: 0,
  MINES: 1,
  WHEEL: 2,
  PLINKO: 3
};

/**
 * POST /api/log-game
 * Log game result to Somnia Testnet using Treasury wallet
 */
export async function POST(request) {
  try {
    const body = await request.json();
    const { gameType, playerAddress, betAmount, result, payout, entropyProof } = body;

    // Validate required fields
    if (!gameType || !playerAddress || !betAmount || !result || payout === undefined) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Get environment variables
    const rpcUrl = process.env.NEXT_PUBLIC_SOMNIA_RPC_URL || 'https://dream-rpc.somnia.network';
    const gameLoggerAddress = process.env.NEXT_PUBLIC_SOMNIA_GAME_LOGGER_ADDRESS;
    const treasuryPrivateKey = process.env.SOMNIA_TESTNET_TREASURY_PRIVATE_KEY || process.env.TREASURY_PRIVATE_KEY;

    if (!gameLoggerAddress) {
      return NextResponse.json(
        { error: 'GameLogger address not configured' },
        { status: 500 }
      );
    }

    if (!treasuryPrivateKey) {
      return NextResponse.json(
        { error: 'Treasury private key not configured' },
        { status: 500 }
      );
    }

    // Create provider and signer
    const provider = new ethers.JsonRpcProvider(rpcUrl);
    const signer = new ethers.Wallet(treasuryPrivateKey, provider);
    const signerAddress = await signer.getAddress();

    console.log('🔑 Treasury wallet address:', signerAddress);

    // Create contract instance
    const contract = new ethers.Contract(gameLoggerAddress, GAME_LOGGER_ABI, signer);

    // Check if the treasury wallet is authorized
    try {
      const isAuthorized = await contract.isAuthorizedLogger(signerAddress);
      console.log('🔐 Treasury wallet authorized:', isAuthorized);
      
      if (!isAuthorized) {
        // Check who is the owner
        try {
          const owner = await contract.owner();
          console.log('👤 Contract owner:', owner);
          console.log('⚠️ Treasury wallet is NOT authorized. Owner needs to call addAuthorizedLogger()');
        } catch (ownerError) {
          console.log('⚠️ Could not fetch owner address');
        }
        
        return NextResponse.json(
          { 
            error: 'Treasury wallet not authorized',
            message: `Treasury wallet ${signerAddress} is not authorized to log games. Contract owner needs to call addAuthorizedLogger(${signerAddress}).`,
            treasuryAddress: signerAddress
          },
          { status: 403 }
        );
      }
    } catch (authError) {
      console.warn('⚠️ Could not check authorization (contract might not have this function):', authError.message);
      // Continue anyway - the contract might not have authorization checks
    }

    // Convert game type to enum
    const gameTypeEnum = GAME_TYPES[gameType.toUpperCase()];
    if (gameTypeEnum === undefined) {
      return NextResponse.json(
        { error: `Invalid game type: ${gameType}` },
        { status: 400 }
      );
    }

    // Encode result data - AGGRESSIVELY minimize to reduce gas costs
    // On-chain storage is expensive, only store essential summary data
    let minimalResult = {};
    
    if (typeof result === 'object' && result !== null) {
      // Game-specific minimal data extraction
      switch (gameType.toUpperCase()) {
        case 'ROULETTE':
          minimalResult = {
            num: result.winningNumber ?? result.number ?? result.outcome,
            win: result.totalPayout > 0 || result.netResult > 0,
            betsCount: Array.isArray(result.bets) ? result.bets.length : 0,
            winCount: Array.isArray(result.winningBets) ? result.winningBets.length : 0
          };
          break;
        case 'MINES':
          minimalResult = {
            mines: result.mineCount ?? result.mines,
            revealed: result.revealedCount ?? result.revealed,
            win: result.won ?? result.isWin ?? (result.payout > 0),
            mult: result.multiplier
          };
          break;
        case 'WHEEL':
          minimalResult = {
            seg: result.segment ?? result.winningSegment ?? result.outcome,
            mult: result.multiplier,
            win: result.won ?? result.isWin ?? (result.payout > 0)
          };
          break;
        case 'PLINKO':
          minimalResult = {
            slot: result.slot ?? result.landingSlot ?? result.outcome,
            mult: result.multiplier,
            risk: result.risk,
            rows: result.rows
          };
          break;
        default:
          // Generic minimal result
          minimalResult = {
            win: result.won ?? result.isWin ?? result.win ?? false,
            out: result.outcome ?? result.result ?? result.number
          };
      }
      
      // Remove undefined/null values to keep it compact
      Object.keys(minimalResult).forEach(key => {
        if (minimalResult[key] === undefined || minimalResult[key] === null) {
          delete minimalResult[key];
        }
      });
    } else {
      // If result is a primitive, wrap it
      minimalResult = { out: result };
    }
    
    const resultJson = JSON.stringify(minimalResult);
    const resultData = ethers.toUtf8Bytes(resultJson);
    
    console.log('📦 Result data:', resultJson);
    console.log('📦 Result data size:', resultData.length, 'bytes (original was', JSON.stringify(result).length, 'bytes)');
    
    // Reject if still too large (> 512 bytes is excessive for on-chain storage)
    if (resultData.length > 512) {
      console.error('❌ Result data still too large after minimization');
      return NextResponse.json(
        { 
          error: 'Result data too large',
          message: 'Game result data exceeds maximum allowed size for on-chain storage.',
          size: resultData.length,
          maxSize: 512
        },
        { status: 400 }
      );
    }

    // Convert amounts to wei
    const betAmountWei = ethers.parseEther(betAmount.toString());
    const payoutWei = ethers.parseEther(payout.toString());

    // Prepare entropy proof
    const entropyRequestId = entropyProof?.requestId || ethers.ZeroHash;
    const entropyTxHash = entropyProof?.transactionHash || '';

    console.log('📝 Logging game result to Somnia:', {
      gameType,
      gameTypeEnum,
      playerAddress,
      betAmount: betAmountWei.toString(),
      payout: payoutWei.toString(),
      entropyRequestId,
      entropyTxHash,
      resultDataLength: resultData.length
    });

    // Try to estimate gas first to catch errors early
    let estimatedGas;
    try {
      estimatedGas = await contract.logGameResult.estimateGas(
        gameTypeEnum,
        betAmountWei,
        resultData,
        payoutWei,
        entropyRequestId,
        entropyTxHash
      );
      console.log('⛽ Estimated gas:', estimatedGas.toString());
      
      // Warn if gas is unusually high (might indicate large resultData)
      if (estimatedGas > 1000000n) {
        console.warn('⚠️ High gas estimate - resultData might be too large');
      }
    } catch (estimateError) {
      console.error('❌ Gas estimation failed:', estimateError);
      
      // Parse the error for more details
      let errorMessage = 'Transaction would fail';
      if (estimateError.reason) {
        errorMessage = estimateError.reason;
      } else if (estimateError.message) {
        errorMessage = estimateError.message;
      }
      
      return NextResponse.json(
        { 
          error: 'Transaction simulation failed',
          message: errorMessage,
          details: 'The transaction would revert. Check if treasury wallet is authorized and contract is properly deployed.'
        },
        { status: 400 }
      );
    }

    // Calculate gas limit with 20% buffer for safety
    const gasLimit = (estimatedGas * 120n) / 100n;
    console.log('⛽ Using gas limit:', gasLimit.toString());

    // Call contract function with estimated gas + buffer
    const tx = await contract.logGameResult(
      gameTypeEnum,
      betAmountWei,
      resultData,
      payoutWei,
      entropyRequestId,
      entropyTxHash,
      {
        gasLimit: gasLimit
      }
    );

    console.log('⏳ Transaction submitted:', tx.hash);

    // Wait for confirmation
    const receipt = await tx.wait();

    if (receipt.status === 0) {
      console.error('❌ Transaction reverted!');
      return NextResponse.json(
        { 
          error: 'Transaction reverted',
          message: 'The transaction was included in a block but reverted.',
          txHash: receipt.hash
        },
        { status: 500 }
      );
    }

    console.log('✅ Game result logged on Somnia:', {
      txHash: receipt.hash,
      blockNumber: receipt.blockNumber,
      gasUsed: receipt.gasUsed.toString()
    });

    return NextResponse.json({
      success: true,
      txHash: receipt.hash,
      blockNumber: receipt.blockNumber,
      explorerUrl: `https://shannon-explorer.somnia.network/tx/${receipt.hash}`
    });

  } catch (error) {
    console.error('❌ Failed to log game:', error);
    
    // Parse ethers errors for better messages
    let errorMessage = error.message;
    let errorDetails = error.reason || error.code || 'Unknown error';
    
    if (error.code === 'CALL_EXCEPTION') {
      errorMessage = 'Transaction reverted by contract';
      errorDetails = 'The contract rejected the transaction. Possible reasons: unauthorized caller, invalid parameters, or contract paused.';
    } else if (error.code === 'INSUFFICIENT_FUNDS') {
      errorMessage = 'Insufficient funds';
      errorDetails = 'Treasury wallet does not have enough STT to pay for gas.';
    } else if (error.code === 'NONCE_EXPIRED') {
      errorMessage = 'Nonce conflict';
      errorDetails = 'Transaction nonce issue. Please try again.';
    } else if (error.code === 'REPLACEMENT_UNDERPRICED') {
      errorMessage = 'Gas price too low';
      errorDetails = 'Please try again with higher gas price.';
    }
    
    return NextResponse.json(
      { 
        error: 'Failed to log game',
        message: errorMessage,
        details: errorDetails,
        code: error.code
      },
      { status: 500 }
    );
  }
}
