// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "hardhat/console.sol";

contract SwapsiesV1 {
    struct Ask {
        address asker;
        address filler;
        address askerToken;
        uint256 askerAmount;
        address fillerToken;
        uint256 fillerAmount;
    }

    mapping(bytes32 => Ask) private asks;
    mapping(bytes32 => bool) private activeAsks;

    function createAsk(
        bytes32 askHash,
        address asker,
        address filler,
        address askerToken,
        uint256 askerAmount,
        address fillerToken,        
        uint256 fillerAmount
    ) external {
        require(
            !activeAsks[askHash],
            "The ask you are trying to submit is already active"
        );
        require(asker == msg.sender, "The asker has to be the sender");
        Ask storage ask = asks[askHash];
        ask.asker = msg.sender;
        ask.filler = filler;
        ask.askerToken = askerToken;
        ask.fillerToken = fillerToken;
        ask.askerAmount = askerAmount;
        ask.fillerAmount = fillerAmount;
        activeAsks[askHash] = true;
    }

    modifier isAskActive(bytes32 askHash) {
        require(activeAsks[askHash], "Ask is not active");
        _;
    }

    function getAsk(bytes32 askHash) public view returns (Ask memory) {
        return asks[askHash];
    }

    function isActive(bytes32 askHash) public view returns (bool) {
        return activeAsks[askHash];
    }

    function cancelAsk(bytes32 askHash) external isAskActive(askHash) {
        Ask memory ask = asks[askHash];
        require(ask.asker == msg.sender, "Only the asker can cancel the ask");

        delete activeAsks[askHash];
    }

    function fillAsk(bytes32 askHash) external isAskActive(askHash) {
        Ask memory ask = asks[askHash];
        console.log("Expected Filler: ", ask.filler, " - actual sender: ", msg.sender);
        require(ask.filler == msg.sender, "Only party B can fill the ask");

        IERC20 askerToken = IERC20(ask.askerToken);
        IERC20 fillerToken = IERC20(ask.fillerToken);

        require(
            askerToken.allowance(ask.asker, address(this)) >= ask.askerAmount,
            "Insufficient allowance for token A"
        );
        require(
            fillerToken.allowance(ask.filler, address(this)) >=
                ask.fillerAmount,
            "Insufficient allowance for token B"
        );

        askerToken.transferFrom(ask.asker, ask.filler, ask.askerAmount);
        fillerToken.transferFrom(ask.filler, ask.asker, ask.fillerAmount);

        delete activeAsks[askHash];
    }
}
