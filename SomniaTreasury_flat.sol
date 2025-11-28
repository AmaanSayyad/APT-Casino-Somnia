// Sources flattened with hardhat v2.26.3 https://hardhat.org

// SPDX-License-Identifier: MIT

// File @openzeppelin/contracts/utils/Context.sol@v5.4.0

// Original license: SPDX_License_Identifier: MIT
// OpenZeppelin Contracts (last updated v5.0.1) (utils/Context.sol)

pragma solidity ^0.8.20;

abstract contract Context {
    function _msgSender() internal view virtual returns (address) {
        return msg.sender;
    }

    function _msgData() internal view virtual returns (bytes calldata) {
        return msg.data;
    }

    function _contextSuffixLength() internal view virtual returns (uint256) {
        return 0;
    }
}


// File @openzeppelin/contracts/access/Ownable.sol@v5.4.0

// Original license: SPDX_License_Identifier: MIT
// OpenZeppelin Contracts (last updated v5.0.0) (access/Ownable.sol)

pragma solidity ^0.8.20;

abstract contract Ownable is Context {
    address private _owner;

    error OwnableUnauthorizedAccount(address account);
    error OwnableInvalidOwner(address owner);

    event OwnershipTransferred(address indexed previousOwner, address indexed newOwner);

    constructor(address initialOwner) {
        if (initialOwner == address(0)) {
            revert OwnableInvalidOwner(address(0));
        }
        _transferOwnership(initialOwner);
    }

    modifier onlyOwner() {
        _checkOwner();
        _;
    }

    function owner() public view virtual returns (address) {
        return _owner;
    }

    function _checkOwner() internal view virtual {
        if (owner() != _msgSender()) {
            revert OwnableUnauthorizedAccount(_msgSender());
        }
    }

    function renounceOwnership() public virtual onlyOwner {
        _transferOwnership(address(0));
    }

    function transferOwnership(address newOwner) public virtual onlyOwner {
        if (newOwner == address(0)) {
            revert OwnableInvalidOwner(address(0));
        }
        _transferOwnership(newOwner);
    }

    function _transferOwnership(address newOwner) internal virtual {
        address oldOwner = _owner;
        _owner = newOwner;
        emit OwnershipTransferred(oldOwner, newOwner);
    }
}


// File @openzeppelin/contracts/utils/ReentrancyGuard.sol@v5.4.0

// Original license: SPDX_License_Identifier: MIT
// OpenZeppelin Contracts (last updated v5.1.0) (utils/ReentrancyGuard.sol)

pragma solidity ^0.8.20;

abstract contract ReentrancyGuard {
    uint256 private constant NOT_ENTERED = 1;
    uint256 private constant ENTERED = 2;

    uint256 private _status;

    error ReentrancyGuardReentrantCall();

    constructor() {
        _status = NOT_ENTERED;
    }

    modifier nonReentrant() {
        _nonReentrantBefore();
        _;
        _nonReentrantAfter();
    }

    function _nonReentrantBefore() private {
        if (_status == ENTERED) {
            revert ReentrancyGuardReentrantCall();
        }
        _status = ENTERED;
    }

    function _nonReentrantAfter() private {
        _status = NOT_ENTERED;
    }

    function _reentrancyGuardEntered() internal view returns (bool) {
        return _status == ENTERED;
    }
}


// File contracts/SomniaTreasury.sol

// Original license: SPDX_License_Identifier: MIT
pragma solidity ^0.8.20;

contract SomniaTreasury is Ownable, ReentrancyGuard {
    event Deposit(address indexed user, uint256 amount, uint256 timestamp);
    event Withdrawal(address indexed user, uint256 amount, uint256 timestamp);
    event EmergencyWithdrawal(address indexed owner, uint256 amount, uint256 timestamp);

    mapping(address => uint256) public balances;
    uint256 public totalDeposits;
    uint256 public totalWithdrawals;
    uint256 public totalUsers;
    mapping(address => bool) public hasDeposited;
    uint256 public minDeposit = 0.001 ether;
    uint256 public maxDeposit = 100 ether;

    constructor() Ownable(msg.sender) {}

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

    function getBalance(address user) external view returns (uint256) {
        return balances[user];
    }

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

    function updateMinDeposit(uint256 newMinDeposit) external onlyOwner {
        require(newMinDeposit > 0, "Min deposit must be greater than 0");
        minDeposit = newMinDeposit;
    }

    function updateMaxDeposit(uint256 newMaxDeposit) external onlyOwner {
        require(newMaxDeposit > minDeposit, "Max deposit must be greater than min deposit");
        maxDeposit = newMaxDeposit;
    }

    function emergencyWithdraw(address to, uint256 amount) external onlyOwner {
        require(to != address(0), "Invalid recipient address");
        require(amount <= address(this).balance, "Insufficient balance");
        (bool success, ) = payable(to).call{value: amount}("");
        require(success, "Emergency withdrawal failed");
        emit EmergencyWithdrawal(to, amount, block.timestamp);
    }

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
