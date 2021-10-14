//SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.0;

import "./LPT.sol";
import "./SpaceCoin.sol";
import "hardhat/console.sol";
import "@openzeppelin/contracts/utils/math/Math.sol";
import "@uniswap/lib/contracts/libraries/Babylonian.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract LiquidityPool is Ownable {
    event LiquidityAdded(address indexed _account);
    event LiquidityRemoved(address indexed _account);
    event TradedTokens(
        address indexed _account,
        uint256 _ethTraded,
        uint256 _spcTraded
    );

    LPT lpToken;
    SpaceCoin spaceCoin;
    uint256 ethReserve;
    uint256 spcReserve;
    uint32 lastBlockTimestamp;

    function setLPTAddress(LPT _lpToken) external onlyOwner {
        require(address(lpToken) == address(0), "WRITE_ONCE");
        lpToken = _lpToken;
    }

    function getReserves() external view returns (uint256, uint256) {
        return (ethReserve, spcReserve);
    }

    function setSpaceCoinAddress(SpaceCoin _spaceCoin) external onlyOwner {
        require(address(spaceCoin) == address(0), "WRITE_ONCE");
        spaceCoin = _spaceCoin;
    }

    function swap(address account, uint256 _spcAmount) external payable {
        uint256 product = ethReserve * spcReserve;
        uint256 amountToTransfer;
        uint256 amountToTake;
        uint256 totalAmountToTransfer;

        if (msg.value == 0) {
            uint256 currentSPCBalance = spaceCoin.balanceOf(address(this));
            uint256 _spcAmountMinusTax = _spcAmount - ((2 * _spcAmount) / 100);
            uint256 addedBalance = spcReserve + _spcAmountMinusTax;

            require(addedBalance == currentSPCBalance, "DID_NOT_TRANSFER");

            /*
             *
             * 100 eth   * 500 spc = 50000
             *      x    * 600 spc = 50000
             *
             *  x = 50000 / 600 = 83,33
             *  user gets 100 - x = 16.67
             */

            uint256 x = product / (spcReserve + _spcAmountMinusTax);
            amountToTransfer = ethReserve - x;

            amountToTake = (1 * amountToTransfer) / 100;
            totalAmountToTransfer = amountToTransfer - amountToTake;

            (bool success, ) = account.call{value: totalAmountToTransfer}("");

            require(success, "TRANSFER_FAILED");
        } else {
            /*
             *
             * 100 eth   * 500 spc = 50000
             * 105 eth * y     = 50000
             *
             *  y = 50000 / 105 = 476,19
             *  user gets 500 - y = 23,81
             */

            uint256 y = product / (ethReserve + msg.value);
            amountToTransfer = spcReserve - y;

            amountToTake = (1 * amountToTransfer) / 100;
            totalAmountToTransfer = amountToTransfer - amountToTake;

            spaceCoin.transfer(account, totalAmountToTransfer);
        }
        emit TradedTokens(account, msg.value, _spcAmount);
        _update();
    }

    function deposit(uint256 spcAmount, address account) external payable {
        uint256 liquidity;
        uint256 totalSupply = lpToken.totalSupply();
        uint256 ethAmount = msg.value;

        if (totalSupply > 0) {
            liquidity = Math.min(
                (ethAmount * totalSupply) / ethReserve,
                (spcAmount * totalSupply) / spcReserve
            );
        } else {
            liquidity = Babylonian.sqrt(ethAmount * spcAmount);
        }

        lpToken.mint(account, liquidity);
        emit LiquidityAdded(account);
        _update();
    }

    function withdraw(address account) external {
        uint256 liquidity = lpToken.balanceOf(account);
        require(liquidity != 0, "NO_AVAILABLE_TOKENS");

        uint256 totalSupply = lpToken.totalSupply();

        uint256 ethAmount = (ethReserve * liquidity) / totalSupply;
        uint256 spcAmount = (spcReserve * liquidity) / totalSupply;

        lpToken.burn(account, liquidity);

        (bool ethTransferSuccess, ) = account.call{value: ethAmount}("");
        bool spcTransferSuccess = spaceCoin.transfer(account, spcAmount);

        require(ethTransferSuccess && spcTransferSuccess, "FAILED_TRANSFER");
        emit LiquidityRemoved(account);
        _update();
    }

    function _update() private {
        uint32 blockTimestamp = uint32(block.timestamp % 2**32);
        uint32 timeElapsed;
        unchecked {
            timeElapsed = blockTimestamp - lastBlockTimestamp; // If new block, overflows
        }

        if (timeElapsed > 0) {
            ethReserve = address(this).balance;
            spcReserve = spaceCoin.balanceOf(address(this));
            lastBlockTimestamp = blockTimestamp;
        }
    }
}
