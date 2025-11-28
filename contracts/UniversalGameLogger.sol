// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title UniversalGameLogger
 * @dev Universal cross-chain game logger for ZetaChain
 * Logs game results from APT Casino for universal verification
 * Supports Roulette, Mines, Wheel, and Plinko games
 */
contract UniversalGameLogger is Ownable {
    event UniversalGameLogged(
        bytes32 indexed logId,
        address indexed player,
        uint8 indexed gameType,
        uint256 betAmount,
        uint256 payout,
        bytes32 entropyRequestId,
        uint256 timestamp
    );

    enum GameType {
        ROULETTE,
        MINES,
        WHEEL,
        PLINKO
    }

    struct GameLog {
        bytes32 logId;
        address player;
        uint8 gameType;
        uint256 betAmount;
        bytes resultData;
        uint256 payout;
        bytes32 entropyRequestId;
        uint256 timestamp;
        uint256 blockNumber;
    }

    // Mapping from log ID to game log
    mapping(bytes32 => GameLog) public gameLogs;
    
    // Mapping from player to their log IDs
    mapping(address => bytes32[]) public playerLogs;
    
    // Array of all log IDs
    bytes32[] public allLogIds;
    
    // Game type counters for analytics
    mapping(uint8 => uint256) public gameTypeCounts;
    
    // Total stats
    uint256 public totalGamesLogged;
    uint256 public totalBetAmount;
    uint256 public totalPayoutAmount;
    
    // Authorized loggers (treasury and game contracts)
    mapping(address => bool) public authorizedLoggers;

    modifier onlyAuthorized() {
        require(
            authorizedLoggers[msg.sender] || msg.sender == owner(),
            "Not authorized to log games"
        );
        _;
    }

    constructor() Ownable(msg.sender) {
        // Owner is authorized by default
        authorizedLoggers[msg.sender] = true;
    }

    /**
     * @dev Log a game result to ZetaChain
     * @param gameType Type of game (0=ROULETTE, 1=MINES, 2=WHEEL, 3=PLINKO)
     * @param betAmount Bet amount in wei
     * @param resultData Encoded game result data
     * @param payout Payout amount in wei
     * @param entropyRequestId Pyth Entropy request ID from Arbitrum Sepolia
     * @return logId Unique identifier for this game log
     */
    function logGameResult(
        uint8 gameType,
        uint256 betAmount,
        bytes memory resultData,
        uint256 payout,
        bytes32 entropyRequestId
    ) external onlyAuthorized returns (bytes32 logId) {
        require(gameType <= 3, "Invalid game type");
        
        // Generate unique log ID
        logId = keccak256(abi.encodePacked(
            msg.sender,
            gameType,
            betAmount,
            block.timestamp,
            block.number,
            allLogIds.length
        ));

        // Store game log
        gameLogs[logId] = GameLog({
            logId: logId,
            player: msg.sender,
            gameType: gameType,
            betAmount: betAmount,
            resultData: resultData,
            payout: payout,
            entropyRequestId: entropyRequestId,
            timestamp: block.timestamp,
            blockNumber: block.number
        });

        // Update indexes
        playerLogs[msg.sender].push(logId);
        allLogIds.push(logId);
        
        // Update stats
        gameTypeCounts[gameType]++;
        totalGamesLogged++;
        totalBetAmount += betAmount;
        totalPayoutAmount += payout;

        // Emit event for universal verification
        emit UniversalGameLogged(
            logId,
            msg.sender,
            gameType,
            betAmount,
            payout,
            entropyRequestId,
            block.timestamp
        );

        return logId;
    }

    /**
     * @dev Get game log by ID
     * @param logId Log identifier
     * @return Game log details
     */
    function getGameLog(bytes32 logId) external view returns (GameLog memory) {
        require(gameLogs[logId].player != address(0), "Game log not found");
        return gameLogs[logId];
    }

    /**
     * @dev Get player's game history
     * @param player Player address
     * @param limit Maximum number of logs to return (0 for all)
     * @return Array of log IDs
     */
    function getPlayerHistory(address player, uint256 limit) 
        external 
        view 
        returns (bytes32[] memory) 
    {
        bytes32[] memory logs = playerLogs[player];
        
        if (limit == 0 || limit >= logs.length) {
            return logs;
        }
        
        // Return most recent logs
        bytes32[] memory recentLogs = new bytes32[](limit);
        uint256 startIndex = logs.length - limit;
        
        for (uint256 i = 0; i < limit; i++) {
            recentLogs[i] = logs[startIndex + i];
        }
        
        return recentLogs;
    }

    /**
     * @dev Get logs by game type
     * @param gameType Game type to filter by
     * @param limit Maximum number of logs to return (0 for all)
     * @return Array of log IDs
     */
    function getLogsByGameType(uint8 gameType, uint256 limit) 
        external 
        view 
        returns (bytes32[] memory) 
    {
        require(gameType <= 3, "Invalid game type");
        
        // Count matching logs
        uint256 count = 0;
        for (uint256 i = 0; i < allLogIds.length; i++) {
            if (gameLogs[allLogIds[i]].gameType == gameType) {
                count++;
                if (limit > 0 && count >= limit) break;
            }
        }
        
        // Create result array
        bytes32[] memory result = new bytes32[](count);
        uint256 index = 0;
        
        for (uint256 i = 0; i < allLogIds.length && index < count; i++) {
            if (gameLogs[allLogIds[i]].gameType == gameType) {
                result[index] = allLogIds[i];
                index++;
            }
        }
        
        return result;
    }

    /**
     * @dev Get contract statistics
     * @return totalGames Total games logged
     * @return totalBets Total bet amount
     * @return totalPayouts Total payout amount
     * @return rouletteCount Roulette games count
     * @return minesCount Mines games count
     * @return wheelCount Wheel games count
     * @return plinkoCount Plinko games count
     */
    function getStats() external view returns (
        uint256 totalGames,
        uint256 totalBets,
        uint256 totalPayouts,
        uint256 rouletteCount,
        uint256 minesCount,
        uint256 wheelCount,
        uint256 plinkoCount
    ) {
        return (
            totalGamesLogged,
            totalBetAmount,
            totalPayoutAmount,
            gameTypeCounts[0], // ROULETTE
            gameTypeCounts[1], // MINES
            gameTypeCounts[2], // WHEEL
            gameTypeCounts[3]  // PLINKO
        );
    }

    /**
     * @dev Add authorized logger (only owner)
     * @param logger Address to authorize
     */
    function addAuthorizedLogger(address logger) external onlyOwner {
        require(logger != address(0), "Invalid logger address");
        authorizedLoggers[logger] = true;
    }

    /**
     * @dev Remove authorized logger (only owner)
     * @param logger Address to remove authorization
     */
    function removeAuthorizedLogger(address logger) external onlyOwner {
        authorizedLoggers[logger] = false;
    }

    /**
     * @dev Check if address is authorized logger
     * @param logger Address to check
     * @return True if authorized
     */
    function isAuthorizedLogger(address logger) external view returns (bool) {
        return authorizedLoggers[logger] || logger == owner();
    }

    /**
     * @dev Get total number of logs
     * @return Total log count
     */
    function getTotalLogs() external view returns (uint256) {
        return allLogIds.length;
    }

    /**
     * @dev Get player's total games
     * @param player Player address
     * @return Total games played by player
     */
    function getPlayerGameCount(address player) external view returns (uint256) {
        return playerLogs[player].length;
    }
}
