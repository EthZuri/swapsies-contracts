// SPDX-License-Identifier: MIT
pragma solidity ^0.8.9;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract TestToken is ERC20, Ownable {
    constructor(string memory name, string memory ticker) ERC20(name, ticker) {}

    function mint(address to, uint256 amount) public onlyOwner {
        _mint(to, amount);
    }
}
