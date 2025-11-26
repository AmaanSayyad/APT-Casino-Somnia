#!/usr/bin/env node

/**
 * Migration Script: Somnia Testnet → Somnia Testnet
 * 
 * This script automates the conversion of all Somnia Testnet-specific code to Somnia-specific code
 * while preserving Arbitrum Sepolia configurations unchanged.
 * 
 * Requirements: 8.1, 8.2, 8.3, 8.4, 8.5, 8.6, 8.7
 */

const fs = require('fs');
const path = require('path');

// Configuration for the migration
const MIGRATION_CONFIG = {
  // Somnia Testnet → Somnia mappings
  chainIds: {
    somnia-testnet: [10143, 41454], // Old Somnia Testnet chain IDs
    somnia: 50312 // Somnia Testnet chain ID (from network.md)
  },
  
  rpcUrls: {
    somnia-testnet: [
      'https://dream-rpc.somnia.network',
      'https://dream-rpc.somnia.network'
    ],
    somnia: 'https://dream-rpc.somnia.network' // Primary RPC from network.md
  },
  
  explorerUrls: {
    somnia-testnet: [
      'https://shannon-explorer.somnia.network',
      'https://shannon-explorer.somnia.network'
    ],
    somnia: 'https://shannon-explorer.somnia.network' // Primary explorer from network.md
  },
  
  tokenSymbols: {
    old: 'STT',
    new: 'STT'
  },
  
  networkNames: {
    somnia-testnet: ['Somnia Testnet', 'Somnia Testnet', 'somnia-testnet-testnet', 'somnia-testnetTestnet'],
    somnia: 'Somnia Testnet'
  },
  
  // Files and directories to exclude from scanning
  excludePatterns: [
    'node_modules',
    '.git',
    '.next',
    'dist',
    'build',
    '.kiro',
    'deployments',
    'somnia-streams',
    // Preserve Arbitrum Sepolia files
    'arbitrumSepoliaConfig.js',
    'arbitrumTreasury.js',
    'pythEntropy.js', // Pyth Entropy stays on Arbitrum Sepolia
    // Backup and lock files
    '*.lock',
    'package-lock.json',
    'yarn.lock',
    'pnpm-lock.yaml',
    // Backup files
    '*.bak',
    '*.backup',
    '*.tmp'
  ],
  
  // File extensions to process
  includeExtensions: ['.js', '.jsx', '.ts', '.tsx', '.json', '.md', '.sol'],
  
  // Directories to scan
  scanDirectories: ['src', 'scripts', 'contracts', 'hardhat.config.js', 'package.json', 'README.md']
};

class MigrationScript {
  constructor() {
    this.changes = [];
    this.errors = [];
    this.filesScanned = 0;
    this.filesModified = 0;
  }

  /**
   * Main execution method
   */
  async execute() {
    console.log('🚀 Starting Somnia Testnet → Somnia Migration Script\n');
    console.log('=' .repeat(60));
    
    try {
      // Step 1: Scan files
      console.log('\n📂 Step 1: Scanning files for Somnia Testnet references...');
      const files = await this.scanFiles();
      console.log(`   Found ${files.length} files to process`);
      
      // Step 2: Process each file
      console.log('\n🔄 Step 2: Processing files...');
      for (const file of files) {
        await this.processFile(file);
      }
      
      // Step 3: Generate report
      console.log('\n📊 Step 3: Generating migration report...');
      const report = this.generateReport();
      
      // Step 4: Save report
      const reportPath = path.join(process.cwd(), 'migration-report.json');
      fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
      console.log(`   Report saved to: ${reportPath}`);
      
      // Step 5: Display summary
      this.displaySummary(report);
      
      console.log('\n✅ Migration completed successfully!');
      console.log('=' .repeat(60));
      
    } catch (error) {
      console.error('\n❌ Migration failed:', error.message);
      console.error(error.stack);
      process.exit(1);
    }
  }

  /**
   * Scan files recursively
   */
  async scanFiles() {
    const files = [];
    
    for (const target of MIGRATION_CONFIG.scanDirectories) {
      const targetPath = path.join(process.cwd(), target);
      
      if (!fs.existsSync(targetPath)) {
        console.log(`   ⚠️  Skipping non-existent path: ${target}`);
        continue;
      }
      
      const stat = fs.statSync(targetPath);
      
      if (stat.isFile()) {
        if (this.shouldProcessFile(targetPath)) {
          files.push(targetPath);
        }
      } else if (stat.isDirectory()) {
        this.scanDirectory(targetPath, files);
      }
    }
    
    return files;
  }

  /**
   * Recursively scan a directory
   */
  scanDirectory(dirPath, files) {
    const entries = fs.readdirSync(dirPath, { withFileTypes: true });
    
    for (const entry of entries) {
      const fullPath = path.join(dirPath, entry.name);
      
      // Check if should be excluded
      if (this.shouldExclude(fullPath, entry.name)) {
        continue;
      }
      
      if (entry.isDirectory()) {
        this.scanDirectory(fullPath, files);
      } else if (entry.isFile() && this.shouldProcessFile(fullPath)) {
        files.push(fullPath);
      }
    }
  }

  /**
   * Check if a path should be excluded
   */
  shouldExclude(fullPath, name) {
    for (const pattern of MIGRATION_CONFIG.excludePatterns) {
      if (pattern.includes('*')) {
        // Wildcard pattern
        const regex = new RegExp(pattern.replace('*', '.*'));
        if (regex.test(name)) return true;
      } else if (fullPath.includes(pattern) || name === pattern) {
        return true;
      }
    }
    return false;
  }

  /**
   * Check if a file should be processed
   */
  shouldProcessFile(filePath) {
    const ext = path.extname(filePath);
    return MIGRATION_CONFIG.includeExtensions.includes(ext);
  }

  /**
   * Process a single file
   */
  async processFile(filePath) {
    this.filesScanned++;
    
    try {
      let content = fs.readFileSync(filePath, 'utf8');
      const originalContent = content;
      const fileChanges = [];
      
      // Apply all replacements
      content = this.replaceChainIds(content, filePath, fileChanges);
      content = this.replaceRPCUrls(content, filePath, fileChanges);
      content = this.replaceExplorerUrls(content, filePath, fileChanges);
      content = this.replaceTokenSymbols(content, filePath, fileChanges);
      content = this.replaceNetworkNames(content, filePath, fileChanges);
      
      // If content changed, write back to file
      if (content !== originalContent) {
        fs.writeFileSync(filePath, content, 'utf8');
        this.filesModified++;
        
        this.changes.push({
          file: path.relative(process.cwd(), filePath),
          changes: fileChanges
        });
        
        console.log(`   ✓ Modified: ${path.relative(process.cwd(), filePath)} (${fileChanges.length} changes)`);
      }
      
    } catch (error) {
      this.errors.push({
        file: path.relative(process.cwd(), filePath),
        error: error.message
      });
      console.error(`   ✗ Error processing ${path.relative(process.cwd(), filePath)}: ${error.message}`);
    }
  }

  /**
   * Replace Somnia Testnet chain IDs with Somnia chain ID
   */
  replaceChainIds(content, filePath, fileChanges) {
    let modified = content;
    
    for (const somnia-testnetChainId of MIGRATION_CONFIG.chainIds.somnia-testnet) {
      // Match chain ID in various contexts
      const patterns = [
        // Direct number: id: 50312
        new RegExp(`(id\\s*:\\s*)${somnia-testnetChainId}\\b`, 'g'),
        // chainId: 50312
        new RegExp(`(chainId\\s*:\\s*)${somnia-testnetChainId}\\b`, 'g'),
        // chain_id: 50312
        new RegExp(`(chain_id\\s*:\\s*)${somnia-testnetChainId}\\b`, 'g'),
        // CHAIN_ID: 50312
        new RegExp(`(CHAIN_ID\\s*:\\s*)${somnia-testnetChainId}\\b`, 'g'),
        // === 50312 or == 50312
        new RegExp(`(===?\\s*)${somnia-testnetChainId}\\b`, 'g'),
        // Hex format: 0x27a7 (10143 in hex)
        new RegExp(`(['"]?)0x${somnia-testnetChainId.toString(16)}\\b`, 'gi'),
      ];
      
      for (const pattern of patterns) {
        if (pattern.test(modified)) {
          modified = modified.replace(pattern, (match, group1) => {
            if (match.includes('0x')) {
              return `${group1 || ''}0x${MIGRATION_CONFIG.chainIds.somnia.toString(16)}`;
            }
            return `${group1}${MIGRATION_CONFIG.chainIds.somnia}`;
          });
          
          fileChanges.push({
            type: 'chainId',
            from: somnia-testnetChainId,
            to: MIGRATION_CONFIG.chainIds.somnia
          });
        }
      }
    }
    
    return modified;
  }

  /**
   * Replace Somnia Testnet RPC URLs with Somnia RPC URL
   */
  replaceRPCUrls(content, filePath, fileChanges) {
    let modified = content;
    
    for (const somnia-testnetRpcUrl of MIGRATION_CONFIG.rpcUrls.somnia-testnet) {
      if (modified.includes(somnia-testnetRpcUrl)) {
        modified = modified.replace(new RegExp(somnia-testnetRpcUrl.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g'), 
          MIGRATION_CONFIG.rpcUrls.somnia);
        
        fileChanges.push({
          type: 'rpcUrl',
          from: somnia-testnetRpcUrl,
          to: MIGRATION_CONFIG.rpcUrls.somnia
        });
      }
    }
    
    return modified;
  }

  /**
   * Replace Somnia Testnet explorer URLs with Somnia explorer URL
   */
  replaceExplorerUrls(content, filePath, fileChanges) {
    let modified = content;
    
    for (const somnia-testnetExplorerUrl of MIGRATION_CONFIG.explorerUrls.somnia-testnet) {
      if (modified.includes(somnia-testnetExplorerUrl)) {
        modified = modified.replace(new RegExp(somnia-testnetExplorerUrl.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g'), 
          MIGRATION_CONFIG.explorerUrls.somnia);
        
        fileChanges.push({
          type: 'explorerUrl',
          from: somnia-testnetExplorerUrl,
          to: MIGRATION_CONFIG.explorerUrls.somnia
        });
      }
    }
    
    return modified;
  }

  /**
   * Replace MON token symbol with STT
   */
  replaceTokenSymbols(content, filePath, fileChanges) {
    let modified = content;
    const oldSymbol = MIGRATION_CONFIG.tokenSymbols.old;
    const newSymbol = MIGRATION_CONFIG.tokenSymbols.new;
    
    // Patterns to match MON but not in words like "COMMON", "MONITOR", etc.
    const patterns = [
      // 'STT' or "STT" (quoted)
      new RegExp(`(['"])${oldSymbol}\\1`, 'g'),
      // symbol: 'STT'
      new RegExp(`(symbol\\s*:\\s*['"])${oldSymbol}(['"])`, 'gi'),
      // Symbol: STT (in comments or docs)
      new RegExp(`(Symbol:\\s*)${oldSymbol}\\b`, 'g'),
      // currency: MON
      new RegExp(`(currency\\s*:\\s*['"])${oldSymbol}(['"])`, 'gi'),
      // {STT} or ${STT}
      new RegExp(`([{$])${oldSymbol}(})`, 'g'),
    ];
    
    for (const pattern of patterns) {
      if (pattern.test(modified)) {
        modified = modified.replace(pattern, (match) => {
          // Reconstruct the match with STT
          return match.replace(oldSymbol, newSymbol);
        });
        
        fileChanges.push({
          type: 'tokenSymbol',
          from: oldSymbol,
          to: newSymbol
        });
      }
    }
    
    return modified;
  }

  /**
   * Replace Somnia Testnet network names with Somnia
   */
  replaceNetworkNames(content, filePath, fileChanges) {
    let modified = content;
    
    for (const somnia-testnetName of MIGRATION_CONFIG.networkNames.somnia-testnet) {
      // Create case-insensitive pattern but preserve original case in non-code contexts
      const pattern = new RegExp(somnia-testnetName.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'gi');
      
      if (pattern.test(modified)) {
        modified = modified.replace(pattern, (match) => {
          // Preserve case style
          if (match === match.toLowerCase()) {
            return 'somnia-testnet';
          } else if (match === match.toUpperCase()) {
            return 'SOMNIA_TESTNET';
          } else if (match.includes('-')) {
            return 'somnia-testnet';
          } else if (match[0] === match[0].toLowerCase()) {
            return 'somniaTestnet';
          } else {
            return MIGRATION_CONFIG.networkNames.somnia;
          }
        });
        
        fileChanges.push({
          type: 'networkName',
          from: somnia-testnetName,
          to: 'Somnia Testnet'
        });
      }
    }
    
    return modified;
  }

  /**
   * Generate migration report
   */
  generateReport() {
    const report = {
      timestamp: new Date().toISOString(),
      summary: {
        filesScanned: this.filesScanned,
        filesModified: this.filesModified,
        totalChanges: this.changes.reduce((sum, file) => sum + file.changes.length, 0),
        errors: this.errors.length
      },
      changes: this.changes,
      errors: this.errors,
      configuration: {
        chainIdMapping: {
          from: MIGRATION_CONFIG.chainIds.somnia-testnet,
          to: MIGRATION_CONFIG.chainIds.somnia
        },
        rpcUrlMapping: {
          from: MIGRATION_CONFIG.rpcUrls.somnia-testnet,
          to: MIGRATION_CONFIG.rpcUrls.somnia
        },
        explorerUrlMapping: {
          from: MIGRATION_CONFIG.explorerUrls.somnia-testnet,
          to: MIGRATION_CONFIG.explorerUrls.somnia
        },
        tokenSymbolMapping: {
          from: MIGRATION_CONFIG.tokenSymbols.old,
          to: MIGRATION_CONFIG.tokenSymbols.new
        }
      },
      preservedFiles: [
        'src/config/arbitrumSepoliaConfig.js',
        'src/config/arbitrumTreasury.js',
        'src/config/pythEntropy.js'
      ]
    };
    
    return report;
  }

  /**
   * Display summary of migration
   */
  displaySummary(report) {
    console.log('\n' + '='.repeat(60));
    console.log('📋 MIGRATION SUMMARY');
    console.log('='.repeat(60));
    console.log(`Files Scanned:    ${report.summary.filesScanned}`);
    console.log(`Files Modified:   ${report.summary.filesModified}`);
    console.log(`Total Changes:    ${report.summary.totalChanges}`);
    console.log(`Errors:           ${report.summary.errors}`);
    
    if (report.changes.length > 0) {
      console.log('\n📝 Modified Files:');
      for (const change of report.changes) {
        console.log(`   • ${change.file} (${change.changes.length} changes)`);
      }
    }
    
    if (report.errors.length > 0) {
      console.log('\n⚠️  Errors:');
      for (const error of report.errors) {
        console.log(`   • ${error.file}: ${error.error}`);
      }
    }
    
    console.log('\n🔒 Preserved Files (Arbitrum Sepolia):');
    for (const file of report.preservedFiles) {
      console.log(`   • ${file}`);
    }
    
    console.log('\n🔄 Configuration Changes:');
    console.log(`   Chain ID:      ${report.configuration.chainIdMapping.from.join(', ')} → ${report.configuration.chainIdMapping.to}`);
    console.log(`   RPC URL:       ${report.configuration.rpcUrlMapping.from[0]} → ${report.configuration.rpcUrlMapping.to}`);
    console.log(`   Explorer:      ${report.configuration.explorerUrlMapping.from[0]} → ${report.configuration.explorerUrlMapping.to}`);
    console.log(`   Token Symbol:  ${report.configuration.tokenSymbolMapping.from} → ${report.configuration.tokenSymbolMapping.to}`);
  }
}

// Execute migration if run directly
if (require.main === module) {
  const migration = new MigrationScript();
  migration.execute().catch(error => {
    console.error('Fatal error:', error);
    process.exit(1);
  });
}

module.exports = MigrationScript;
