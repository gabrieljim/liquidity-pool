//SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.0;

import "./SpaceCoin.sol";
import "./LiquidityPool.sol";

contract SpaceRouter {
    LiquidityPool liquidityPool;
    SpaceCoin spaceCoin;

    constructor(LiquidityPool _liquidityPool, SpaceCoin _spaceCoin) {
        liquidityPool = _liquidityPool;
        spaceCoin = _spaceCoin;
    }

    function addLiquidity(uint256 _spcAmount) external payable {
        require(spaceCoin.balanceOf(msg.sender) > 0, "NO_AVAILABLE_TOKENS");

        bool success = spaceCoin.increaseContractAllowance(
            msg.sender,
            address(this),
            _spcAmount
        );
        require(success);

        spaceCoin.transferFrom(msg.sender, address(liquidityPool), _spcAmount);
        liquidityPool.deposit{value: msg.value}(_spcAmount, msg.sender);
    }

    function pullLiquidity() external {
        liquidityPool.withdraw();
    }
}
