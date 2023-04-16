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

## Notes 

1. Currently the contracts keep the Asks on-chain. This choice was made for the hackathon for ease-of-use, as it lacks in efficiency. We recognize that (since the swap matching happens off-chain) we could only be storing the hashes of the Asks instead of the full object, while keeping the latter off-chain.
2. Our createAsk & createFill methods proved to be too complex for the Biconomy server to be able to handle it in a batch transaction. This was verified to us on their Discord. It needs to be investigated further how to mitigate this. Of course, the contracts don't require batching of transactions to work; nevertheless, we managed to commit some batched transactions (with paymaster support) as explained in our devfolio submission.

## License

Swapsies smart contracts are released under the [UNLICENSED](https://choosealicense.com/licenses/unlicense/) license.
