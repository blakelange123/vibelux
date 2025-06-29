// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

/**
 * @title EquipmentEscrow
 * @dev Smart escrow for equipment investment deals with 15% platform fee
 */
contract EquipmentEscrow is ReentrancyGuard, Ownable {
    uint256 public constant PLATFORM_FEE_RATE = 1500; // 15% in basis points
    uint256 public constant BASIS_POINTS = 10000;
    
    enum EscrowStatus { PENDING, FUNDED, RELEASED, REFUNDED, DISPUTED }
    
    struct Escrow {
        address investor;
        address requester;
        uint256 equipmentValue;
        uint256 platformFee;
        uint256 totalAmount;
        EscrowStatus status;
        bool equipmentDelivered;
        bool equipmentVerified;
        bool installationComplete;
        bool performanceVerified;
        uint256 createdAt;
        uint256 fundedAt;
        uint256 releasedAt;
    }
    
    struct EscrowBalance {
        uint256 funded;
        uint256 released;
        uint256 refunded;
    }
    
    mapping(bytes32 => Escrow) public escrows;
    mapping(bytes32 => EscrowBalance) public balances;
    mapping(address => uint256) public platformFees;
    
    address public platformTreasury;
    IERC20 public paymentToken; // USDC or other stablecoin
    
    event EscrowCreated(
        bytes32 indexed escrowId,
        address indexed investor,
        address indexed requester,
        uint256 equipmentValue,
        uint256 platformFee
    );
    
    event EscrowFunded(
        bytes32 indexed escrowId,
        uint256 amount
    );
    
    event ConditionUpdated(
        bytes32 indexed escrowId,
        string condition,
        bool value
    );
    
    event EscrowReleased(
        bytes32 indexed escrowId,
        uint256 toInvestor,
        uint256 toPlatform
    );
    
    event EscrowRefunded(
        bytes32 indexed escrowId,
        uint256 amount
    );
    
    event EscrowDisputed(
        bytes32 indexed escrowId,
        string reason
    );
    
    modifier onlyParties(bytes32 escrowId) {
        require(
            msg.sender == escrows[escrowId].investor || 
            msg.sender == escrows[escrowId].requester ||
            msg.sender == owner(),
            "Not authorized"
        );
        _;
    }
    
    modifier escrowExists(bytes32 escrowId) {
        require(escrows[escrowId].createdAt > 0, "Escrow does not exist");
        _;
    }
    
    constructor(address _paymentToken, address _platformTreasury) {
        paymentToken = IERC20(_paymentToken);
        platformTreasury = _platformTreasury;
    }
    
    /**
     * @dev Create a new escrow for equipment investment
     */
    function createEscrow(
        bytes32 escrowId,
        address investor,
        address requester,
        uint256 equipmentValue
    ) external onlyOwner {
        require(escrows[escrowId].createdAt == 0, "Escrow already exists");
        require(investor != address(0) && requester != address(0), "Invalid addresses");
        require(equipmentValue > 0, "Invalid equipment value");
        
        uint256 platformFee = (equipmentValue * PLATFORM_FEE_RATE) / BASIS_POINTS;
        uint256 totalAmount = equipmentValue + platformFee;
        
        escrows[escrowId] = Escrow({
            investor: investor,
            requester: requester,
            equipmentValue: equipmentValue,
            platformFee: platformFee,
            totalAmount: totalAmount,
            status: EscrowStatus.PENDING,
            equipmentDelivered: false,
            equipmentVerified: false,
            installationComplete: false,
            performanceVerified: false,
            createdAt: block.timestamp,
            fundedAt: 0,
            releasedAt: 0
        });
        
        emit EscrowCreated(escrowId, investor, requester, equipmentValue, platformFee);
    }
    
    /**
     * @dev Fund the escrow (investor deposits funds)
     */
    function fundEscrow(bytes32 escrowId) 
        external 
        nonReentrant 
        escrowExists(escrowId) 
    {
        Escrow storage escrow = escrows[escrowId];
        require(msg.sender == escrow.investor, "Only investor can fund");
        require(escrow.status == EscrowStatus.PENDING, "Invalid escrow status");
        
        uint256 remainingAmount = escrow.totalAmount - balances[escrowId].funded;
        require(remainingAmount > 0, "Escrow already fully funded");
        
        // Transfer funds from investor to contract
        require(
            paymentToken.transferFrom(msg.sender, address(this), remainingAmount),
            "Transfer failed"
        );
        
        balances[escrowId].funded += remainingAmount;
        escrow.status = EscrowStatus.FUNDED;
        escrow.fundedAt = block.timestamp;
        
        emit EscrowFunded(escrowId, remainingAmount);
    }
    
    /**
     * @dev Update verification conditions (only requester can verify)
     */
    function updateCondition(
        bytes32 escrowId,
        string memory condition,
        bool value
    ) external escrowExists(escrowId) {
        Escrow storage escrow = escrows[escrowId];
        require(msg.sender == escrow.requester, "Only requester can verify");
        require(escrow.status == EscrowStatus.FUNDED, "Escrow not funded");
        
        if (keccak256(bytes(condition)) == keccak256("equipmentDelivered")) {
            escrow.equipmentDelivered = value;
        } else if (keccak256(bytes(condition)) == keccak256("equipmentVerified")) {
            escrow.equipmentVerified = value;
        } else if (keccak256(bytes(condition)) == keccak256("installationComplete")) {
            escrow.installationComplete = value;
        } else if (keccak256(bytes(condition)) == keccak256("performanceVerified")) {
            escrow.performanceVerified = value;
        } else {
            revert("Invalid condition");
        }
        
        emit ConditionUpdated(escrowId, condition, value);
        
        // Check if all conditions are met and auto-release
        if (canRelease(escrowId)) {
            _releaseEscrow(escrowId);
        }
    }
    
    /**
     * @dev Check if escrow can be released
     */
    function canRelease(bytes32 escrowId) public view returns (bool) {
        Escrow memory escrow = escrows[escrowId];
        return (
            escrow.status == EscrowStatus.FUNDED &&
            escrow.equipmentDelivered &&
            escrow.equipmentVerified &&
            escrow.installationComplete &&
            escrow.performanceVerified
        );
    }
    
    /**
     * @dev Release escrow funds
     */
    function releaseEscrow(bytes32 escrowId) external onlyParties(escrowId) {
        require(canRelease(escrowId), "Release conditions not met");
        _releaseEscrow(escrowId);
    }
    
    /**
     * @dev Internal function to release escrow
     */
    function _releaseEscrow(bytes32 escrowId) private nonReentrant {
        Escrow storage escrow = escrows[escrowId];
        require(escrow.status == EscrowStatus.FUNDED, "Invalid escrow status");
        
        uint256 investorAmount = escrow.equipmentValue;
        uint256 platformAmount = escrow.platformFee;
        
        // Transfer equipment value to investor
        require(
            paymentToken.transfer(escrow.investor, investorAmount),
            "Investor transfer failed"
        );
        
        // Transfer platform fee to treasury
        require(
            paymentToken.transfer(platformTreasury, platformAmount),
            "Platform transfer failed"
        );
        
        balances[escrowId].released = escrow.totalAmount;
        platformFees[platformTreasury] += platformAmount;
        
        escrow.status = EscrowStatus.RELEASED;
        escrow.releasedAt = block.timestamp;
        
        emit EscrowReleased(escrowId, investorAmount, platformAmount);
    }
    
    /**
     * @dev Refund escrow to investor (only if not released)
     */
    function refundEscrow(bytes32 escrowId) 
        external 
        onlyOwner 
        nonReentrant 
        escrowExists(escrowId) 
    {
        Escrow storage escrow = escrows[escrowId];
        require(
            escrow.status == EscrowStatus.FUNDED || 
            escrow.status == EscrowStatus.DISPUTED,
            "Cannot refund"
        );
        
        uint256 refundAmount = balances[escrowId].funded;
        require(refundAmount > 0, "No funds to refund");
        
        // Transfer funds back to investor
        require(
            paymentToken.transfer(escrow.investor, refundAmount),
            "Refund transfer failed"
        );
        
        balances[escrowId].refunded = refundAmount;
        escrow.status = EscrowStatus.REFUNDED;
        
        emit EscrowRefunded(escrowId, refundAmount);
    }
    
    /**
     * @dev Dispute escrow
     */
    function disputeEscrow(bytes32 escrowId, string memory reason) 
        external 
        onlyParties(escrowId) 
    {
        Escrow storage escrow = escrows[escrowId];
        require(escrow.status == EscrowStatus.FUNDED, "Invalid escrow status");
        
        escrow.status = EscrowStatus.DISPUTED;
        emit EscrowDisputed(escrowId, reason);
    }
    
    /**
     * @dev Get escrow details
     */
    function getEscrow(bytes32 escrowId) 
        external 
        view 
        returns (
            address investor,
            address requester,
            uint256 equipmentValue,
            uint256 platformFee,
            uint256 totalAmount,
            EscrowStatus status,
            bool[4] memory conditions,
            uint256[3] memory timestamps
        ) 
    {
        Escrow memory escrow = escrows[escrowId];
        conditions = [
            escrow.equipmentDelivered,
            escrow.equipmentVerified,
            escrow.installationComplete,
            escrow.performanceVerified
        ];
        timestamps = [
            escrow.createdAt,
            escrow.fundedAt,
            escrow.releasedAt
        ];
        
        return (
            escrow.investor,
            escrow.requester,
            escrow.equipmentValue,
            escrow.platformFee,
            escrow.totalAmount,
            escrow.status,
            conditions,
            timestamps
        );
    }
    
    /**
     * @dev Update platform treasury address
     */
    function updatePlatformTreasury(address newTreasury) external onlyOwner {
        require(newTreasury != address(0), "Invalid address");
        platformTreasury = newTreasury;
    }
    
    /**
     * @dev Emergency withdrawal (only owner, for stuck funds)
     */
    function emergencyWithdraw(address token, uint256 amount) external onlyOwner {
        if (token == address(0)) {
            payable(owner()).transfer(amount);
        } else {
            IERC20(token).transfer(owner(), amount);
        }
    }
}