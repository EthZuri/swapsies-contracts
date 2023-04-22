// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC721/IERC721.sol";

// With bundles
contract SwapsiesV2 {
    struct Ask {
        address asker;
        address filler;
        ERC20Bundle askerERC20;
        ERC721Bundle askerERC721;
        ERC20Bundle fillerERC20;
        ERC721Bundle fillerERC721;
    }

    struct ERC20Bundle {
        address[] tokens;
        uint256[] amounts;
    }

    struct ERC721Bundle {
        address[] tokens;
        uint256[] tokenIds;
    }

    mapping(bytes32 => Ask) private asks;
    mapping(bytes32 => bool) private activeAsks;

    function createAsk(
        bytes32 askHash,
        address asker,
        address filler,
        ERC20Bundle calldata askerERC20,
        ERC721Bundle calldata askerERC721,
        ERC20Bundle calldata fillerERC20,
        ERC721Bundle calldata fillerERC721
    ) external {
        require(
            !activeAsks[askHash],
            "The ask you are trying to submit is already active"
        );
        require(asker == msg.sender, "The asker has to be the sender");
        // Ensure the lengths of the arrays in the bundles are the same
        require(
            askerERC20.tokens.length == askerERC20.amounts.length,
            "Asker's ERC20 tokens and amounts arrays must have the same length"
        );
        require(
            fillerERC20.tokens.length == fillerERC20.amounts.length,
            "Filler's ERC20 tokens and amounts arrays must have the same length"
        );
        require(
            askerERC721.tokens.length == askerERC721.tokenIds.length,
            "Asker's ERC721 tokens and tokenIds arrays must have the same length"
        );
        require(
            fillerERC721.tokens.length == fillerERC721.tokenIds.length,
            "Filler's ERC721 tokens and tokenIds arrays must have the same length"
        );
        Ask storage ask = asks[askHash];
        ask.asker = msg.sender;
        ask.filler = filler;
        ask.askerERC20 = askerERC20;
        ask.askerERC721 = askerERC721;
        ask.fillerERC20 = fillerERC20;
        ask.fillerERC721 = fillerERC721;
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
        require(
            ask.filler == msg.sender,
            "Only the designated filler can fill the ask"
        );

        // Handle ERC20 tokens
        for (uint256 i = 0; i < ask.askerERC20.tokens.length; i++) {
            IERC20 askerToken = IERC20(ask.askerERC20.tokens[i]);
            require(
                askerToken.allowance(ask.asker, address(this)) >=
                    ask.askerERC20.amounts[i],
                "Insufficient allowance for asker's ERC20 token"
            );
            askerToken.transferFrom(
                ask.asker,
                ask.filler,
                ask.askerERC20.amounts[i]
            );
        }

        for (uint256 i = 0; i < ask.fillerERC20.tokens.length; i++) {
            IERC20 fillerToken = IERC20(ask.fillerERC20.tokens[i]);
            require(
                fillerToken.allowance(ask.filler, address(this)) >=
                    ask.fillerERC20.amounts[i],
                "Insufficient allowance for filler's ERC20 token"
            );
            fillerToken.transferFrom(
                ask.filler,
                ask.asker,
                ask.fillerERC20.amounts[i]
            );
        }

        // Handle ERC721 tokens
        for (uint256 i = 0; i < ask.askerERC721.tokens.length; i++) {
            IERC721 askerToken = IERC721(ask.askerERC721.tokens[i]);
            require(
                askerToken.ownerOf(ask.askerERC721.tokenIds[i]) == ask.asker,
                "Asker is not the owner of the specified ERC721 token"
            );
            require(
                askerToken.isApprovedForAll(ask.asker, address(this)) ||
                    askerToken.getApproved(ask.askerERC721.tokenIds[i]) ==
                    address(this),
                "The contract has not been approved to transfer the asker's ERC721 token"
            );
            askerToken.safeTransferFrom(
                ask.asker,
                ask.filler,
                ask.askerERC721.tokenIds[i]
            );
        }

        for (uint256 i = 0; i < ask.fillerERC721.tokens.length; i++) {
            IERC721 fillerToken = IERC721(ask.fillerERC721.tokens[i]);
            require(
                fillerToken.ownerOf(ask.fillerERC721.tokenIds[i]) == ask.filler,
                "Filler is not the owner of the specified ERC721 token"
            );
            require(
                fillerToken.isApprovedForAll(ask.filler, address(this)) ||
                    fillerToken.getApproved(ask.fillerERC721.tokenIds[i]) ==
                    address(this),
                "The contract has not been approved to transfer the filler's ERC721 token"
            );
            fillerToken.safeTransferFrom(
                ask.filler,
                ask.asker,
                ask.fillerERC721.tokenIds[i]
            );
        }

        delete activeAsks[askHash];
    }
}
