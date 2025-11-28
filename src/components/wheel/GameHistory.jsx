"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import Image from "next/image";
// Using Next.js public asset reference instead of import
import { FaExternalLinkAlt } from "react-icons/fa";

const GameHistory = ({ gameHistory }) => {
  const [activeTab, setActiveTab] = useState("my-bet");
  const [entriesShown, setEntriesShown] = useState(10);
  
  // Format transaction hash for display
  const formatTxHash = (hash) => {
    if (!hash) return 'N/A';
    return `${hash.slice(0, 6)}...${hash.slice(-4)}`;
  };
  
  // Open Arbiscan link
  const openArbiscan = (hash) => {
    if (hash) {
      const network = process.env.NEXT_PUBLIC_NETWORK || 'arbitrum-sepolia';
      let explorerUrl;
      
      if (network === 'arbitrum-sepolia') {
        explorerUrl = `https://sepolia.arbiscan.io/tx/${hash}`;
      } else if (network === 'arbitrum-one') {
        explorerUrl = `https://arbiscan.io/tx/${hash}`;
      } else {
        explorerUrl = `https://sepolia.etherscan.io/tx/${hash}`;
      }
      
      window.open(explorerUrl, '_blank');
    }
  };

  // Open Somnia Testnet Explorer link
  const openSomniaTestnetExplorer = (txHash) => {
    if (txHash && txHash !== 'unknown') {
      const somniaExplorerUrl = `https://shannon-explorer.somnia.network/tx/${txHash}`;
      window.open(somniaExplorerUrl, '_blank');
    }
  };

  // Open ZetaChain Explorer link
  const openZetaChainExplorer = (txHash) => {
    if (txHash && txHash !== 'unknown') {
      const zetaExplorerUrl = `https://testnet.zetascan.com/tx/${txHash}`;
      window.open(zetaExplorerUrl, '_blank');
    }
  };
  
  return (
    <div className="bg-[#070005] w-full rounded-xl overflow-hidden mt-0">
      <div className="flex flex-row justify-between items-center">

        <div className="flex mb-4 w-[70%] md:w-[30%] bg-[#120521] border border-[#333947] rounded-3xl p-2 gap-2 overflow-hidden">
          <div className={cn("w-1/2", activeTab === "my-bet" && "gradient-borderb")}>
            <button
              className={cn(
                "flex-1 py-0 md:py-3 px-4 w-full h-full text-center rounded-2xl transition-colors",
                activeTab === "my-bet" ? "bg-[#290023] text-white" : "text-[#333947]"
              )}
              onClick={() => setActiveTab("my-bet")}
            >
              My Bet
            </button>
          </div>
          <div className={cn("w-1/2", activeTab === "game-description" && "gradient-borderb")}>
            <button
              className={cn(
                "flex-1 py-0 md:py-3 px-4 w-full h-full text-center rounded-2xl transition-colors",
                activeTab === "game-description" ? "bg-[#290023] text-white" : "text-[#333947]"
              )}
              onClick={() => setActiveTab("game-description")}
            >
              Game Description
            </button>
          </div>
        </div>

        <div className="flex gradient-border mb-5 md:mb-0">
          <div className="flex space-x-4">
            <select 
              className="bg-[#120521] text-white text-md p-3 px-2 md:px-6 rounded border border-purple-900/30"
              value={entriesShown}
              onChange={(e) => setEntriesShown(Number(e.target.value))}
            >
              <option value={10}>10</option>
              <option value={20}>20</option>
              <option value={50}>50</option>
            </select>
          </div>
        </div>

      </div>

      
      {activeTab === "my-bet" && (
        <div className="overflow-x-auto">
          <table className="w-full mt-4 text-md">
            <thead className=" text-left">
              <tr>
                <th className="py-6 px-4 font-medium">Game</th>
                <th className="py-6 px-4 font-medium">Time</th>
                <th className="py-6 px-4 font-medium">Bet amount</th>
                <th className="py-6 px-4 font-medium">Multiplier</th>
                <th className="py-6 px-4 font-medium">Payout</th>
                <th className="py-6 px-4 font-medium">Pyth Entropy</th>
              </tr>
            </thead>
            <tbody>
              {gameHistory.length > 0 ? (
                gameHistory.slice(0, entriesShown).map((item, index) => (
                  <tr
                    key={item.id}
                    className={index % 2 === 0 ? "bg-[#290023]" : ""}
                  >
                    <td className="py-6 px-4">{item.game}</td>
                    <td className="py-6 px-4">{item.time}</td>
                    <td className="py-6 px-4">
                      <span className="flex items-center">
                        {item.betAmount.toFixed(10)}
                        <Image
                          src="/coin.png"
                          width={20}
                          height={20}
                          alt="coin"
                          className=""
                        />  
                      </span>
                    </td>
                    <td className="py-6 px-4">{item.multiplier}</td>
                    <td className="py-6 px-4">
                      <span className="flex items-center">
                        {item.payout.toFixed(10)}
                        <Image
                          src="/coin.png"
                          width={20}
                          height={20}
                          alt="coin"
                          className=""
                        />  
                      </span>
                    </td>
                    <td className="py-6 px-4">
                      {item.entropyProof || item.somniaTxHash || item.zetachainTxHash ? (
                        <div className="text-xs text-gray-300 font-mono">
                          <div className="text-yellow-400 font-bold">{item.entropyProof?.sequenceNumber && item.entropyProof.sequenceNumber !== '0' ? String(item.entropyProof.sequenceNumber) : ''}</div>
                          <div className="flex gap-1 mt-1 flex-wrap">
                            {item.somniaTxHash && (
                              <button
                                onClick={() => openSomniaTestnetExplorer(item.somniaTxHash)}
                                className="flex items-center gap-1 px-2 py-1 bg-[#8B2398]/10 border border-[#8B2398]/30 rounded text-[#8B2398] text-xs hover:bg-[#8B2398]/20 transition-colors"
                                title="View on Somnia Testnet Explorer"
                              >
                                <FaExternalLinkAlt size={8} />
                                Somnia
                              </button>
                            )}
                            {item.entropyProof?.arbiscanUrl && (
                              <button
                                onClick={() => window.open(item.entropyProof.arbiscanUrl, '_blank')}
                                className="flex items-center gap-1 px-2 py-1 bg-blue-500/10 border border-blue-500/30 rounded text-blue-400 text-xs hover:bg-blue-500/20 transition-colors"
                                title="View on Arbitrum Sepolia Explorer"
                              >
                                <FaExternalLinkAlt size={8} />
                                Arbiscan
                              </button>
                            )}
                            {item.entropyProof?.transactionHash && (
                              <button
                                onClick={() => window.open(`https://entropy-explorer.pyth.network/tx/${item.entropyProof.transactionHash}`, '_blank')}
                                className="flex items-center gap-1 px-2 py-1 bg-[#681DDB]/10 border border-[#681DDB]/30 rounded text-[#681DDB] text-xs hover:bg-[#681DDB]/20 transition-colors"
                                title="View on Pyth Entropy Explorer"
                              >
                                <FaExternalLinkAlt size={8} />
                                Entropy
                              </button>
                            )}
                            {item.zetachainTxHash && item.zetachainTxHash !== 'pending' && (
                              <button
                                onClick={() => openZetaChainExplorer(item.zetachainTxHash)}
                                className="flex items-center gap-1 px-2 py-1 bg-[#00FF87]/10 border border-[#00FF87]/30 rounded text-[#00FF87] text-xs hover:bg-[#00FF87]/20 transition-colors"
                                title="View on ZetaChain Universal Explorer"
                              >
                                <FaExternalLinkAlt size={8} />
                                ZetaChain
                              </button>
                            )}
                            {item.zetachainTxHash === 'pending' && (
                              <div
                                className="flex items-center gap-1 px-2 py-1 bg-[#FFC107]/10 border border-[#FFC107]/30 rounded text-[#FFC107] text-xs"
                                title="ZetaChain transaction pending"
                              >
                                <div className="w-3 h-3 border-2 border-[#FFC107] border-t-transparent rounded-full animate-spin"></div>
                                ZetaChain
                              </div>
                            )}
                          </div>
                        </div>
                      ) : (
                        <div className="flex items-center gap-2">
                          <div className="w-4 h-4 border-2 border-purple-500 border-t-transparent rounded-full animate-spin"></div>
                          <span className="text-purple-400 text-xs">Generating...</span>
                        </div>
                      )}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-gray-400">
                    No game history yet. Place your first bet!
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
      
      {activeTab === "game-description" && (
        <div className="p-4 text-sm text-gray-300">
          <h3 className="font-medium mb-2">Crazy Times</h3>
          <p>
            Crazy Times is an exciting game of chance where you place bets on a spinning wheel. 
            Select your bet amount, risk level, and the number of segments on the wheel.
            The wheel will spin and land on a multiplier, which determines your payout.
            Higher risk levels can lead to higher multipliers but may be less likely to hit.
          </p>
          <h4 className="font-medium mt-4 mb-2">How to play:</h4>
          <ol className="list-decimal pl-5 space-y-1">
            <li>Enter your bet amount</li>
            <li>Select your risk level (Low, Medium, High)</li>
            <li>Choose the number of segments for the wheel</li>
            <li>Click the &quot;Bet&quot; button to spin the wheel</li>
            <li>If the wheel lands on a multiplier, your bet amount will be multiplied accordingly</li>
          </ol>
        </div>
      )}
    </div>
  );
};

export default GameHistory;
