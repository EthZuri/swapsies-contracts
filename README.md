# Swapsies: Decentralized Asset Swap Protocol

Swapsies is a decentralized asset swap protocol built on Ethereum that allows users to swap ERC20 tokens and ERC721 tokens (including bundles of tokens) in a trustless manner. The repository contains two versions of the Swapsies smart contract: SwapsiesV1 for simple ERC20 token swaps and SwapsiesV2 for advanced token swaps, including ERC20 and ERC721 token bundles.

## SwapsiesV1

SwapsiesV1 is the first version of the Swapsies smart contract. It supports basic ERC20 token swaps between two parties.

Key features of SwapsiesV1 include:

- Create an ask (order) for a token swap
- Query an ask by its hash
- Cancel an ask
- Fill an ask to execute the token swap

## SwapsiesV2

SwapsiesV2 extends the functionality of SwapsiesV1 to support the swapping of ERC721 tokens and bundles of ERC20 and ERC721 tokens. This version provides a more flexible and advanced token swapping experience.

Key features of SwapsiesV2 include:

- Create an ask (order) for a token swap, including ERC20 and ERC721 token bundles
- Query an ask by its hash
- Cancel an ask
- Fill an ask to execute the token swap, including ERC20 and ERC721 token bundles

## Getting Started

To get started with Swapsies, you'll need to clone the repository and install the required dependencies:

1. Clone the repository:

git clone https://github.com/yourusername/swapsies.git

2. Install dependencies:

yarn install

## License

Swapsies smart contracts are released under the [UNLICENSED](https://choosealicense.com/licenses/unlicense/) license.