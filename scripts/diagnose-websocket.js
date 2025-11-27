/**
 * Diagnose WebSocket Connection Issues
 * 
 * This script tests the WebSocket connection to Somnia Testnet
 * and helps identify subscription issues.
 */

require('dotenv').config();
const { createPublicClient, webSocket } = require('viem');
const { SDK } = require('../somnia-streams/dist/index.cjs');

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
      webSocket: ['wss://dream-rpc.somnia.network'],
    },
    public: {
      http: ['https://dream-rpc.somnia.network'],
      webSocket: ['wss://dream-rpc.somnia.network'],
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

const EVENT_SCHEMA_ID = 'apt-casino-game-result-logged';

async function diagnoseWebSocket() {
  console.log('🔍 Diagnosing WebSocket Connection...\n');

  try {
    // Test 1: Create WebSocket client
    console.log('Test 1: Creating WebSocket client...');
    const wsClient = createPublicClient({
      chain: SOMNIA_TESTNET_CHAIN,
      transport: webSocket(SOMNIA_TESTNET_CHAIN.rpcUrls.default.webSocket[0])
    });
    console.log('✅ WebSocket client created');
    console.log(`   Transport type: ${wsClient.transport.type}`);
    console.log(`   Chain ID: ${wsClient.chain.id}\n`);

    // Test 2: Get chain ID to verify connection
    console.log('Test 2: Testing WebSocket connection...');
    const chainId = await wsClient.getChainId();
    console.log(`✅ WebSocket connection working`);
    console.log(`   Chain ID: ${chainId}\n`);

    // Test 3: Initialize SDK
    console.log('Test 3: Initializing SDK with WebSocket client...');
    const sdk = new SDK({
      public: wsClient
    });
    console.log('✅ SDK initialized\n');

    // Test 4: Get protocol info
    console.log('Test 4: Getting protocol info...');
    const protocolInfo = await sdk.streams.getSomniaDataStreamsProtocolInfo();
    
    if (protocolInfo instanceof Error) {
      throw protocolInfo;
    }
    
    if (!protocolInfo) {
      throw new Error('Failed to get protocol info');
    }

    console.log(`✅ Protocol info retrieved`);
    console.log(`   Address: ${protocolInfo.address}`);
    console.log(`   Chain ID: ${protocolInfo.chainId}\n`);

    // Test 5: Get event schema
    console.log('Test 5: Getting event schema...');
    const eventSchemas = await sdk.streams.getEventSchemasById([EVENT_SCHEMA_ID]);
    
    if (!eventSchemas || eventSchemas.length === 0) {
      throw new Error('Event schema not found');
    }

    console.log(`✅ Event schema retrieved`);
    console.log(`   Schema ID: ${EVENT_SCHEMA_ID}`);
    console.log(`   Event Topic: ${eventSchemas[0].eventTopic}`);
    console.log(`   Parameters: ${eventSchemas[0].params.length}\n`);

    // Test 6: Attempt subscription
    console.log('Test 6: Attempting subscription...');
    console.log('   This will test if the SDK can create a subscription');
    console.log('   (Will timeout after 10 seconds if no events)\n');

    let subscriptionCreated = false;
    let subscriptionError = null;

    const subscription = await sdk.streams.subscribe({
      somniaStreamsEventId: EVENT_SCHEMA_ID,
      ethCalls: [],
      context: '',
      onlyPushChanges: false,
      onData: (data) => {
        console.log('📬 Event received:', data);
      },
      onError: (error) => {
        console.error('❌ Subscription error:', error);
        subscriptionError = error;
      }
    });

    if (!subscription) {
      console.error('❌ Subscription failed - SDK returned undefined');
      console.error('   This usually means:');
      console.error('   1. WebSocket transport is not properly configured');
      console.error('   2. The schema ID is invalid');
      console.error('   3. There was an error in the SDK (check console)');
      console.error('\n   Check the SDK logs above for more details\n');
      process.exit(1);
    }

    subscriptionCreated = true;
    console.log('✅ Subscription created successfully!');
    console.log(`   Subscription ID: ${subscription.subscriptionId}\n`);

    // Wait for 10 seconds to see if any events come through
    console.log('⏳ Waiting 10 seconds for events...');
    await new Promise(resolve => setTimeout(resolve, 10000));

    // Unsubscribe
    console.log('\n🔌 Unsubscribing...');
    if (subscription.unsubscribe) {
      subscription.unsubscribe();
      console.log('✅ Unsubscribed successfully\n');
    }

    console.log('✅ All diagnostic tests passed!\n');
    console.log('📝 Summary:');
    console.log('   - WebSocket connection is working');
    console.log('   - SDK can be initialized');
    console.log('   - Event schema is registered');
    console.log('   - Subscription can be created');
    console.log('\n   If you\'re still seeing errors in the browser,');
    console.log('   the issue might be browser-specific or related to');
    console.log('   the React component lifecycle.\n');

    process.exit(0);

  } catch (error) {
    console.error('\n❌ Diagnostic test failed:');
    console.error(error);
    
    if (error.message) {
      console.error(`\nError message: ${error.message}`);
    }
    
    if (error.cause) {
      console.error(`\nCause: ${error.cause}`);
    }

    console.error('\n📝 Troubleshooting tips:');
    console.error('   1. Check if the WebSocket URL is accessible');
    console.error('   2. Verify the event schema is registered');
    console.error('   3. Check if there are any network/firewall issues');
    console.error('   4. Try running: node scripts/verify-schema-registration.js\n');
    
    process.exit(1);
  }
}

// Run the diagnostic
diagnoseWebSocket();
