//SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.0;

import "./LPT.sol";
import "./SpaceCoin.sol";
import "hardhat/console.sol";
import "@openzeppelin/contracts/utils/math/Math.sol";
import "@uniswap/lib/contracts/libraries/Babylonian.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract LiquidityPool is Ownable {
    LPT lpToken;
    SpaceCoin spaceCoin;
    uint256 ethReserve;
    uint256 spcReserve;
    uint32 lastBlockTimestamp;
    bytes4 private constant SELECTOR =
        bytes4(keccak256(bytes("transfer(address,uint256)")));

    function setLPTAddress(LPT _lpToken) external onlyOwner {
        require(address(lpToken) == address(0), "WRITE_ONCE");
        lpToken = _lpToken;
    }

    function setSpaceCoinAddress(SpaceCoin _spaceCoin) external onlyOwner {
        require(address(spaceCoin) == address(0), "WRITE_ONCE");
        spaceCoin = _spaceCoin;
    }

    function deposit(uint256 spcAmount) external payable {
        _update();
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

        lpToken.mint(msg.sender, liquidity);
    }

    function withdraw() external {
        uint256 liquidity = lpToken.balanceOf(msg.sender);
        require(liquidity != 0, "NO_AVAILABLE_TOKENS");

        uint256 totalSupply = lpToken.totalSupply();
        uint256 amount0 = (liquidity / totalSupply) * ethReserve;
        uint256 amount1 = (liquidity / totalSupply) * spcReserve;

        lpToken.burn(msg.sender, liquidity);

        (bool ethTransferSuccess, ) = msg.sender.call{value: amount0}("");
        (bool spcTransferSuccess, ) = address(spaceCoin).call(
            abi.encodeWithSelector(SELECTOR, msg.sender, amount1)
        );

        require(ethTransferSuccess && spcTransferSuccess);
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
