/**
 * Verification script for Task 14: Update game history components with Somnia transaction links
 * 
 * This script verifies that all game history components have been updated to:
 * 1. Display Somnia Testnet transaction hashes
 * 2. Open correct Somnia Testnet block explorer URLs
 * 3. Maintain Pyth Entropy links on Arbitrum Sepolia
 */

const fs = require('fs');
const path = require('path');

console.log('🔍 Verifying game history components for Somnia transaction links...\n');

const historyComponents = [
  {
    name: 'MinesHistory',
    path: 'src/app/game/mines/components/MinesHistory.jsx'
  },
  {
    name: 'RouletteHistory',
    path: 'src/app/game/roulette/components/RouletteHistory.jsx'
  },
  {
    name: 'WheelHistory',
    path: 'src/app/game/wheel/components/WheelHistory.jsx'
  },
  {
    name: 'PlinkoHistory (GameHistory)',
    path: 'src/app/game/plinko/components/GameHistory.jsx'
  }
];

const requiredPatterns = {
  somniaExplorerUrl: /shannon-explorer\.somnia\.network\/tx/,
  somniaFunction: /openSomniaTestnetExplorer/,
  entropyExplorerUrl: /entropy-explorer\.pyth\.network/,
  entropyChain: /chain=arbitrum-sepolia/,
  somniaTxHash: /somniaTxHash/
};

let allPassed = true;

historyComponents.forEach(component => {
  console.log(`\n📄 Checking ${component.name}...`);
  
  try {
    const filePath = path.join(process.cwd(), component.path);
    const content = fs.readFileSync(filePath, 'utf8');
    
    let componentPassed = true;
    
    // Check for Somnia explorer URL
    if (requiredPatterns.somniaExplorerUrl.test(content)) {
      console.log('  ✅ Somnia Testnet explorer URL found');
    } else {
      console.log('  ❌ Somnia Testnet explorer URL NOT found');
      componentPassed = false;
    }
    
    // Check for Somnia explorer function
    if (requiredPatterns.somniaFunction.test(content)) {
      console.log('  ✅ openSomniaTestnetExplorer function found');
    } else {
      console.log('  ❌ openSomniaTestnetExplorer function NOT found');
      componentPassed = false;
    }
    
    // Check for Entropy explorer URL
    if (requiredPatterns.entropyExplorerUrl.test(content)) {
      console.log('  ✅ Entropy explorer URL found');
    } else {
      console.log('  ❌ Entropy explorer URL NOT found');
      componentPassed = false;
    }
    
    // Check for Arbitrum Sepolia chain in Entropy URL
    if (requiredPatterns.entropyChain.test(content)) {
      console.log('  ✅ Entropy explorer uses Arbitrum Sepolia chain');
    } else {
      console.log('  ⚠️  Entropy explorer chain parameter not found or incorrect');
      componentPassed = false;
    }
    
    // Check for somniaTxHash reference
    if (requiredPatterns.somniaTxHash.test(content)) {
      console.log('  ✅ somniaTxHash property referenced');
    } else {
      console.log('  ⚠️  somniaTxHash property not found (may use alternative approach)');
    }
    
    if (componentPassed) {
      console.log(`  ✅ ${component.name} PASSED all checks`);
    } else {
      console.log(`  ❌ ${component.name} FAILED some checks`);
      allPassed = false;
    }
    
  } catch (error) {
    console.log(`  ❌ Error reading file: ${error.message}`);
    allPassed = false;
  }
});

console.log('\n' + '='.repeat(60));
if (allPassed) {
  console.log('✅ ALL COMPONENTS PASSED VERIFICATION');
  console.log('\nTask 14 Implementation Summary:');
  console.log('- ✅ MinesHistory updated with Somnia TX links');
  console.log('- ✅ RouletteHistory updated with Somnia TX links');
  console.log('- ✅ WheelHistory updated with Somnia TX links');
  console.log('- ✅ PlinkoHistory updated with Somnia TX links');
  console.log('- ✅ All components use correct Somnia Testnet explorer URL');
  console.log('- ✅ Entropy links maintained on Arbitrum Sepolia');
  process.exit(0);
} else {
  console.log('❌ SOME COMPONENTS FAILED VERIFICATION');
  console.log('\nPlease review the failed checks above.');
  process.exit(1);
}
