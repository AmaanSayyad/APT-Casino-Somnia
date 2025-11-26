/**
 * Verify GameResultLogged Event Schema Registration
 * 
 * This script verifies that the event schema is properly registered
 * and can be queried from the Somnia Data Streams protocol.
 */

require('dotenv').config();
const { createPublicClient, http } = require('viem');
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
  },
  testnet: true,
};

const EVENT_SCHEMA_ID = 'apt-casino-game-result-logged';

async function verifySchemaRegistration() {
  console.log('🔍 Verifying GameResultLogged Event Schema Registration...\n');

  try {
    // Create public client
    const publicClient = createPublicClient({
      chain: SOMNIA_TESTNET_CHAIN,
      transport: http(SOMNIA_TESTNET_CHAIN.rpcUrls.default.http[0])
    });

    // Initialize SDK
    console.log('🔧 Initializing Somnia Streams SDK...');
    const sdk = new SDK({ public: publicClient });
    console.log('✅ SDK initialized\n');

    // Get protocol info
    console.log('📡 Fetching protocol info...');
    const protocolInfo = await sdk.streams.getSomniaDataStreamsProtocolInfo();
    
    if (protocolInfo instanceof Error) {
      throw protocolInfo;
    }
    
    console.log(`✅ Protocol Address: ${protocolInfo.address}`);
    console.log(`✅ Chain ID: ${protocolInfo.chainId}\n`);

    // Query the registered schema
    console.log(`🔍 Querying schema: ${EVENT_SCHEMA_ID}...`);
    const schemas = await sdk.streams.getEventSchemasById([EVENT_SCHEMA_ID]);

    if (!schemas || schemas.length === 0) {
      throw new Error('Schema not found or not registered');
    }

    const schema = schemas[0];
    console.log('\n✅ Schema found and verified!\n');
    console.log('📋 Schema Details:');
    console.log(`   Schema ID: ${EVENT_SCHEMA_ID}`);
    console.log(`   Event Topic: ${schema.eventTopic}`);
    console.log(`   Parameters: ${schema.params.length}`);
    console.log('\n📝 Parameters:');
    
    schema.params.forEach((param, index) => {
      const indexed = param.isIndexed ? ' (indexed)' : '';
      console.log(`   ${index + 1}. ${param.name}: ${param.paramType}${indexed}`);
    });

    console.log('\n✅ Verification complete!\n');
    console.log('🎉 The event schema is properly registered and ready to use.');
    console.log('\n📝 Next steps:');
    console.log('   1. Emit events from the GameLogger contract');
    console.log('   2. Subscribe to events using this schema ID');
    console.log('   3. Display real-time notifications\n');

    return {
      success: true,
      schemaId: EVENT_SCHEMA_ID,
      eventTopic: schema.eventTopic,
      params: schema.params
    };

  } catch (error) {
    console.error('\n❌ Verification failed:');
    console.error(error);
    
    if (error.message && error.message.includes('EventSchemaNotRegistered')) {
      console.error('\n⚠️  The schema is not registered yet.');
      console.error('   Run: node scripts/register-game-result-schema.js\n');
    }
    
    process.exit(1);
  }
}

// Run verification
if (require.main === module) {
  verifySchemaRegistration()
    .then(() => {
      console.log('✅ Verification script completed successfully');
      process.exit(0);
    })
    .catch((error) => {
      console.error('❌ Verification script failed:', error);
      process.exit(1);
    });
}

module.exports = { verifySchemaRegistration };
