//SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "hardhat/console.sol";

contract SpaceCoin is ERC20 {
    enum Phase {
        SEED,
        GENERAL,
        OPEN
    }
    Phase public currentPhase = Phase.SEED;

    uint256 public MAX_SUPPLY;
    uint256 public constant TAX = 2; // 0.02, 2% of the tx;
    uint256 public totalContributed;
    bool isContractPaused = false;
    bool public isTaxOn = true;
    address public owner;
    address payable public treasuryWallet;

    mapping(address => uint256) public balancesToClaim;
    mapping(address => uint256) public contributionsOf;
    mapping(address => bool) public isWhitelisted;

    constructor(address payable treasury) ERC20("Space Coin", "SC") {
        MAX_SUPPLY = 500000 * 10**decimals();
        _mint(address(this), MAX_SUPPLY);
        owner = msg.sender;
        treasuryWallet = treasury;
        isWhitelisted[owner] = true;
    }

    modifier ownerOnly() {
        require(msg.sender == owner, "OWNER_ONLY");
        _;
    }

    modifier isPaused() {
        require(!isContractPaused, "CONTRACT_PAUSED");
        _;
    }

    function contribute() external payable isPaused {
        require(canUserContribute(msg.sender), "NOT_ALLOWED");
        require(
            contributionsOf[msg.sender] + msg.value <= getIndividualLimit(),
            "ABOVE_MAX_INDIVIDUAL_CONTRIBUTION"
        );
        require(
            totalContributed + msg.value <= getPhaseLimit(),
            "ABOVE_MAX_CONTRIBUTION"
        );

        /*
         * The spec says that the exchange rate must be 5 tokens to 1 ether, so give the sender 5 times the ether they sent
         */
        balancesToClaim[msg.sender] += msg.value * 5;
        contributionsOf[msg.sender] += msg.value;
        totalContributed += msg.value;
    }

    function getIndividualLimit() private view returns (uint256) {
        if (currentPhase == Phase.SEED) {
            return 1500 ether;
        } else if (currentPhase == Phase.GENERAL) {
            return 1000 ether;
        } else {
            // No limit, just make it the same value so the tx goes through
            return msg.value;
        }
    }

    function getPhaseLimit() private view returns (uint256 limit) {
        if (currentPhase == Phase.SEED) {
            limit = 15000 ether;
        } else if (
            currentPhase == Phase.GENERAL || currentPhase == Phase.OPEN
        ) {
            limit = 30000 ether;
        }
    }

    function claimTokens() external isPaused {
        require(currentPhase == Phase.OPEN, "NOT_LAST_PHASE");
        require(balancesToClaim[msg.sender] > 0, "NO_AVAILABLE_FUNDS");
        uint256 tokensToClaim = balancesToClaim[msg.sender];
        balancesToClaim[msg.sender] = 0;

        _transfer(address(this), msg.sender, tokensToClaim);
    }

    function advancePhase() external ownerOnly {
        require(currentPhase != Phase.OPEN, "LAST_PHASE");
        currentPhase = Phase(uint256(currentPhase) + 1);
    }

    function togglePauseContract() external ownerOnly {
        isContractPaused = !isContractPaused;
    }

    function toggleTax() external ownerOnly {
        isTaxOn = !isTaxOn;
    }

    function addToWhitelist(address account) external ownerOnly {
        isWhitelisted[account] = true;
    }

    function canUserContribute(address account) public view returns (bool) {
        return isWhitelisted[account] || currentPhase != Phase.SEED;
    }

    function transfer(address recipient, uint256 amount)
        public
        override
        returns (bool)
    {
        uint256 amountToTake;
        if (isTaxOn) {
            amountToTake = (TAX * amount) / 100;
        }
        uint256 amountToTransfer = amount - amountToTake;

        _transfer(msg.sender, recipient, amountToTransfer);
        _transfer(msg.sender, treasuryWallet, amountToTake);
        return true;
    }

    function mint(address account, uint256 amount) external ownerOnly {
        require(account != address(0), "ERC20: mint to the zero address");
        require(totalSupply() + amount <= MAX_SUPPLY, "ABOVE_MAX_SUPPLY");

        _mint(account, amount * 10**decimals());
    }

    function burn(address account, uint256 amount) external ownerOnly {
        _burn(account, amount * 10**decimals());
    }
}
