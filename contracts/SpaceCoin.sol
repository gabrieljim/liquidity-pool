//SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "./LiquidityPool.sol";
import "hardhat/console.sol";

contract SpaceCoin is ERC20 {
    event TokensBought(address indexed _account, uint256 amount);
    event OwnerAction();

    enum Phase {
        SEED,
        GENERAL,
        OPEN
    }
    Phase public currentPhase = Phase.SEED;

    uint256 public MAX_SUPPLY;
    uint256 public constant TAX = 2; // 0.02, 2% of the tx;
    uint256 public totalContributed;
    bool public isContractPaused = false;
    bool public isTaxOn = true;
    address public owner;
    address payable public treasuryWallet;
    address public spaceRouter;

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

    modifier routerOnly() {
        require(msg.sender == spaceRouter, "ROUTER_ONLY");
        _;
    }

    function setRouterAddress(address _spaceRouter) external {
        require(address(spaceRouter) == address(0), "WRITE_ONCE");
        spaceRouter = _spaceRouter;
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
        uint256 tokenAmount = msg.value * 5;
        balancesToClaim[msg.sender] += tokenAmount;
        contributionsOf[msg.sender] += msg.value;
        totalContributed += msg.value;

        emit TokensBought(msg.sender, tokenAmount);
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

        super._transfer(address(this), msg.sender, tokensToClaim);
    }

    function advancePhase() external ownerOnly {
        require(currentPhase != Phase.OPEN, "LAST_PHASE");
        currentPhase = Phase(uint256(currentPhase) + 1);
        emit OwnerAction();
    }

    function togglePauseContract() external ownerOnly {
        isContractPaused = !isContractPaused;
        emit OwnerAction();
    }

    function toggleTax() external ownerOnly {
        isTaxOn = !isTaxOn;
        emit OwnerAction();
    }

    function addToWhitelist(address account) external ownerOnly {
        isWhitelisted[account] = true;
    }

    function canUserContribute(address account) public view returns (bool) {
        return isWhitelisted[account] || currentPhase != Phase.SEED;
    }

    function _transfer(
        address sender,
        address recipient,
        uint256 amount
    ) internal override {
        uint256 amountToTake;
        if (isTaxOn) {
            amountToTake = (TAX * amount) / 100;
        }
        uint256 amountToTransfer = amount - amountToTake;

        super._transfer(sender, recipient, amountToTransfer);
        super._transfer(sender, treasuryWallet, amountToTake);
    }

    function mint(address account, uint256 amount) external ownerOnly {
        require(account != address(0), "ERC20: mint to the zero address");
        require(totalSupply() + amount <= MAX_SUPPLY, "ABOVE_MAX_SUPPLY");

        _mint(account, amount * 10**decimals());
    }

    function burn(address account, uint256 amount) external ownerOnly {
        _burn(account, amount * 10**decimals());
    }

    function increaseContractAllowance(
        address _owner,
        address _spender,
        uint256 _amount
    ) public routerOnly returns (bool) {
        _approve(
            _owner,
            _spender,
            allowance(msg.sender, address(this)) + _amount
        );

        return true;
    }

    function sendLiquidityToLPContract(LiquidityPool liquidityPool)
        external
        ownerOnly
    {
        require(currentPhase == Phase.OPEN, "NOT_LAST_PHASE");

        /*
         *  Max supply is 500,000 tokens, max total accepted contributions is 30,000 eth
         *  The maximum value spaceCoinAmountToTransfer can be is 30k eth * 5, so 150,000 tokens
         *  If 30k eth is reached, we'd have 350,000 available tokens, so we can count on
         *  this function sending the appropiate amount
         */
        uint256 spaceCoinAmountToTransfer = totalContributed * 5;

        super._transfer(
            address(this),
            address(liquidityPool),
            spaceCoinAmountToTransfer
        );

        liquidityPool.deposit{value: totalContributed}(
            spaceCoinAmountToTransfer,
            address(this)
        );
    }
}
