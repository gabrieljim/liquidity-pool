//SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.0;

import "./LPT.sol";
import "./SpaceCoin.sol";
import "@openzeppelin/contracts/utils/math/Math.sol";
import "@uniswap/lib/contracts/libraries/Babylonian.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract LiquidityPool is Ownable {
    LPT lpToken;
    SpaceCoin spaceCoin;
    uint256 ethReserve;
    uint256 spcReserve;
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

    function deposit(uint256 ethAmount, uint256 spcAmount) external {
        uint256 liquidity;
        uint256 totalSupply = lpToken.totalSupply();

        if (totalSupply > 0) {
            liquidity = Math.min(
                //   2 ETH *                100LP   /  10 ETH     = 20 LP
                (ethAmount * lpToken.totalSupply()) / ethReserve,
                //    10🚀 *                100LP   /     50🚀    = 20 LP
                (spcAmount * lpToken.totalSupply()) / spcReserve
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
}
