// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

/**
 * @title SomniaTreasury
 * @dev Treasury contract for managing STT deposits and withdrawals on Somnia Testnet
 */
contract SomniaTreasury is Ownable, ReentrancyGuard {
    event Deposit(address indexed user, uint256 amount, uint256 timestamp);
    event Withdrawal(address indexed user, uint256 amount, uint256 timestamp);
    event EmergencyWithdrawal(address indexed owner, uint256 amount, uint256 timestamp);

    // User balances
    mapping(address => uint256) public balances;
    
    // Total deposits and withdrawals for analytics
    uint256 public totalDeposits;
    uint256 public totalWithdrawals;
    uint256 public totalUsers;
    
    // Track unique users
    mapping(address => bool) public hasDeposited;

    // Minimum deposit amount (0.001 STT)
    uint256 public minDeposit = 0.001 ether;
    
    // Maximum deposit amount (100 STT)
    uint256 public maxDeposit = 100 ether;

    constructor() Ownable(msg.sender) {
        // Constructor initializes Ownable with deployer as owner
    }

    /**
     * @dev Deposit STT to the treasury
     */
    function deposit() external payable nonReentrant {
        require(msg.value >= minDeposit, "Deposit amount too low");
        require(msg.value <= maxDeposit, "Deposit amount too high");
        
        if (!hasDeposited[msg.sender]) {
            hasDeposited[msg.sender] = true;
            totalUsers++;
        }
        
        balances[msg.sender] += msg.value;
        totalDeposits += msg.value;
        
        emit Deposit(msg.sender, msg.value, block.timestamp);
    }

    /**
     * @dev Withdraw STT from the treasury
     * @param amount Amount to withdraw in wei
     */
    function withdraw(uint256 amount) external nonReentrant {
        require(amount > 0, "Withdrawal amount must be greater than 0");
        require(balances[msg.sender] >= amount, "Insufficient balance");
        require(address(this).balance >= amount, "Insufficient treasury balance");
        
        balances[msg.sender] -= amount;
        totalWithdrawals += amount;
        
        (bool success, ) = payable(msg.sender).call{value: amount}("");
        require(success, "Withdrawal transfer failed");
        
        emit Withdrawal(msg.sender, amount, block.timestamp);
    }

    /**
     * @dev Get user balance
     * @param user User address
     * @return User balance in wei
     */
    function getBalance(address user) external view returns (uint256) {
        return balances[user];
    }

    /**
     * @dev Get treasury statistics
     * @return contractBalance Total STT in treasury
     * @return totalDeposited Total STT deposited
     * @return totalWithdrawn Total STT withdrawn
     * @return userCount Total unique users
     */
    function getTreasuryStats() external view returns (
        uint256 contractBalance,
        uint256 totalDeposited,
        uint256 totalWithdrawn,
        uint256 userCount
    ) {
        return (
            address(this).balance,
            totalDeposits,
            totalWithdrawals,
            totalUsers
        );
    }

    /**
     * @dev Update minimum deposit amount (only owner)
     * @param newMinDeposit New minimum deposit in wei
     */
    function updateMinDeposit(uint256 newMinDeposit) external onlyOwner {
        require(newMinDeposit > 0, "Min deposit must be greater than 0");
        minDeposit = newMinDeposit;
    }

    /**
     * @dev Update maximum deposit amount (only owner)
     * @param newMaxDeposit New maximum deposit in wei
     */
    function updateMaxDeposit(uint256 newMaxDeposit) external onlyOwner {
        require(newMaxDeposit > minDeposit, "Max deposit must be greater than min deposit");
        maxDeposit = newMaxDeposit;
    }

    /**
     * @dev Emergency withdrawal by owner (only in case of critical issues)
     * @param to Address to send funds to
     * @param amount Amount to withdraw
     */
    function emergencyWithdraw(address to, uint256 amount) external onlyOwner {
        require(to != address(0), "Invalid recipient address");
        require(amount <= address(this).balance, "Insufficient balance");
        
        (bool success, ) = payable(to).call{value: amount}("");
        require(success, "Emergency withdrawal failed");
        
        emit EmergencyWithdrawal(to, amount, block.timestamp);
    }

    /**
     * @dev Receive function to accept direct STT transfers
     */
    receive() external payable {
        if (msg.value >= minDeposit && msg.value <= maxDeposit) {
            if (!hasDeposited[msg.sender]) {
                hasDeposited[msg.sender] = true;
                totalUsers++;
            }
            balances[msg.sender] += msg.value;
            totalDeposits += msg.value;
            emit Deposit(msg.sender, msg.value, block.timestamp);
        }
    }
}
