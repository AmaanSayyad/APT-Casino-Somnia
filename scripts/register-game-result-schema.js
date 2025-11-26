/**
 * Register GameResultLogged Event Schema on Somnia Data Streams
 * 
 * This script:
 * 1. Initializes the Somnia Streams SDK
 * 2. Defines the GameResultLogged event schema
 * 3. Registers the schema on Somnia Testnet
 * 4. Stores the schema ID for future subscriptions
 */

require('dotenv').config();
const { createPublicClient, createWalletClient, http, parseEther } = require('viem');
const { privateKeyToAccount } = require('viem/accounts');
const { SDK } = require('../somnia-streams/dist/index.cjs');

// Somnia Testnet configuration
const SOMNIA_TESTNET_CHAIN = {
  id: 50312,
  name: 'Somnia Testnet',
  network: 'somnia-testnet',
  nativeCurrency: {
    decimals: 18,
    name: 'STT',
    symbol: 'STT',
  },
  rpcUrls: {
    default: {
      http: ['https://dream-rpc.somnia.network'],
    },
    public: {
      http: ['https://dream-rpc.somnia.network'],
    },
  },
  blockExplorers: {
    default: {
      name: 'Somnia Shannon Explorer',
      url: 'https://shannon-explorer.somnia.network',
    },
  },
  testnet: true,
};

// GameResultLogged event schema definition
// Event signature: GameResultLogged(address indexed player, string gameType, uint256 betAmount, uint256 payout, bytes32 entropyRequestId, uint256 timestamp)
const GAME_RESULT_EVENT_SCHEMA = {
  params: [
    {
      name: 'player',
      paramType: 'address',
      isIndexed: true
    },
    {
      name: 'gameType',
      paramType: 'string',
      isIndexed: false
    },
    {
      name: 'betAmount',
      paramType: 'uint256',
      isIndexed: false
    },
    {
      name: 'payout',
      paramType: 'uint256',
      isIndexed: false
    },
    {
      name: 'entropyRequestId',
      paramType: 'bytes32',
      isIndexed: false
    },
    {
      name: 'timestamp',
      paramType: 'uint256',
      isIndexed: false
    }
  ],
  eventTopic: 'GameResultLogged(address,string,uint256,uint256,bytes32,uint256)'
};

const EVENT_SCHEMA_ID = 'apt-casino-game-result-logged';

async function registerGameResultSchema() {
  console.log('🚀 Starting GameResultLogged Event Schema Registration...\n');

  try {
    // Load private key from environment
    const privateKey = process.env.SOMNIA_TESTNET_TREASURY_PRIVATE_KEY || process.env.TREASURY_PRIVATE_KEY;
    if (!privateKey) {
      throw new Error('SOMNIA_TESTNET_TREASURY_PRIVATE_KEY or TREASURY_PRIVATE_KEY not found in environment');
    }

    // Create account from private key
    const account = privateKeyToAccount(privateKey);
    console.log(`📝 Using account: ${account.address}\n`);

    // Create public client
    const publicClient = createPublicClient({
      chain: SOMNIA_TESTNET_CHAIN,
      transport: http(SOMNIA_TESTNET_CHAIN.rpcUrls.default.http[0])
    });

    // Create wallet client
    const walletClient = createWalletClient({
      account,
      chain: SOMNIA_TESTNET_CHAIN,
      transport: http(SOMNIA_TESTNET_CHAIN.rpcUrls.default.http[0])
    });

    // Check account balance
    const balance = await publicClient.getBalance({ address: account.address });
    console.log(`💰 Account balance: ${(Number(balance) / 1e18).toFixed(4)} STT\n`);

    if (balance === 0n) {
      console.warn('⚠️  Warning: Account has zero balance. You may need STT tokens to register the schema.\n');
    }

    // Initialize Somnia Streams SDK
    console.log('🔧 Initializing Somnia Streams SDK...');
    const sdk = new SDK({
      public: publicClient,
      wallet: walletClient
    });
    console.log('✅ SDK initialized\n');

    // Get protocol info
    console.log('📡 Fetching Somnia Data Streams protocol info...');
    const protocolInfo = await sdk.streams.getSomniaDataStreamsProtocolInfo();
    
    if (protocolInfo instanceof Error) {
      throw protocolInfo;
    }
    
    if (!protocolInfo) {
      throw new Error('Failed to get protocol info');
    }

    console.log(`✅ Protocol Address: ${protocolInfo.address}`);
    console.log(`✅ Chain ID: ${protocolInfo.chainId}\n`);

    // Check if schema is already registered
    console.log('🔍 Checking if event schema is already registered...');
    let existingSchemas = null;
    try {
      existingSchemas = await sdk.streams.getEventSchemasById([EVENT_SCHEMA_ID]);
    } catch (error) {
      // getEventSchemasById reverts if schema is not registered, which is expected
      if (error.message && error.message.includes('EventSchemaNotRegistered')) {
        console.log('📝 Schema not found, proceeding with registration...\n');
      } else {
        throw error;
      }
    }
    
    if (existingSchemas && existingSchemas.length > 0) {
      console.log('✅ Event schema already registered!');
      console.log(`📋 Schema ID: ${EVENT_SCHEMA_ID}`);
      console.log(`📋 Event Topic: ${existingSchemas[0].eventTopic}`);
      console.log('\n✨ Registration complete (schema already exists)\n');
      return {
        schemaId: EVENT_SCHEMA_ID,
        eventTopic: existingSchemas[0].eventTopic,
        alreadyRegistered: true
      };
    }

    // Register the event schema
    console.log('📤 Registering GameResultLogged event schema...');
    console.log(`   Schema ID: ${EVENT_SCHEMA_ID}`);
    console.log(`   Event Signature: ${GAME_RESULT_EVENT_SCHEMA.eventTopic}`);
    console.log(`   Parameters: ${GAME_RESULT_EVENT_SCHEMA.params.length}`);
    
    const txHash = await sdk.streams.registerEventSchemas(
      [EVENT_SCHEMA_ID],
      [GAME_RESULT_EVENT_SCHEMA]
    );

    if (txHash instanceof Error) {
      throw txHash;
    }

    if (!txHash) {
      throw new Error('Failed to register event schema - no transaction hash returned');
    }

    console.log(`\n✅ Event schema registered successfully!`);
    console.log(`📋 Transaction Hash: ${txHash}`);
    console.log(`📋 Schema ID: ${EVENT_SCHEMA_ID}`);
    console.log(`🔗 View on Explorer: ${SOMNIA_TESTNET_CHAIN.blockExplorers.default.url}/tx/${txHash}\n`);

    // Wait for transaction confirmation
    console.log('⏳ Waiting for transaction confirmation...');
    const receipt = await publicClient.waitForTransactionReceipt({ hash: txHash });
    console.log(`✅ Transaction confirmed in block ${receipt.blockNumber}\n`);

    // Verify registration
    console.log('🔍 Verifying schema registration...');
    const verifySchemas = await sdk.streams.getEventSchemasById([EVENT_SCHEMA_ID]);
    
    if (verifySchemas && verifySchemas.length > 0) {
      console.log('✅ Schema registration verified!');
      console.log(`   Event Topic: ${verifySchemas[0].eventTopic}`);
      console.log(`   Parameters: ${verifySchemas[0].params.length}`);
    } else {
      console.warn('⚠️  Warning: Could not verify schema registration');
    }

    console.log('\n✨ Registration complete!\n');
    console.log('📝 Next steps:');
    console.log('   1. Use this schema ID in your subscription: ' + EVENT_SCHEMA_ID);
    console.log('   2. Emit events using the GameLogger contract');
    console.log('   3. Subscribe to events using the Somnia Streams SDK\n');

    return {
      schemaId: EVENT_SCHEMA_ID,
      transactionHash: txHash,
      blockNumber: receipt.blockNumber,
      eventTopic: GAME_RESULT_EVENT_SCHEMA.eventTopic,
      alreadyRegistered: false
    };

  } catch (error) {
    console.error('\n❌ Error registering event schema:');
    console.error(error);
    
    if (error.message) {
      console.error(`\nError message: ${error.message}`);
    }
    
    if (error.cause) {
      console.error(`\nCause: ${error.cause}`);
    }
    
    process.exit(1);
  }
}

// Run the registration
if (require.main === module) {
  registerGameResultSchema()
    .then((result) => {
      console.log('✅ Script completed successfully');
      process.exit(0);
    })
    .catch((error) => {
      console.error('❌ Script failed:', error);
      process.exit(1);
    });
}

module.exports = { registerGameResultSchema, EVENT_SCHEMA_ID, GAME_RESULT_EVENT_SCHEMA };
