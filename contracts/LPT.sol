//SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract LPT is ERC20 {
    address LIQUIDITY_POOL_ADDRESS;

    constructor(address _lpAdress) ERC20("Liquidity Pool Token", "LPT") {
        LIQUIDITY_POOL_ADDRESS = _lpAdress;
    }

    modifier onlyLPContract() {
        require(msg.sender == LIQUIDITY_POOL_ADDRESS, "NOT_ALLOWED");
        _;
    }

    function mint(address account, uint256 amount) external onlyLPContract {
        _mint(account, amount);
    }

    function burn(address account, uint256 amount) external onlyLPContract {
        _burn(account, amount);
    }
}
