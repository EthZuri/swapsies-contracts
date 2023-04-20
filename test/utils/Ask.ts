import { BigNumber } from "ethers";

// Define the Ask type
export type Ask = {
  asker: string;
  filler: string;
  askerERC20: ERC20Bundle;
  askerERC721: ERC721Bundle;
  fillerERC20: ERC20Bundle;
  fillerERC721: ERC721Bundle;
};

type ERC20Bundle = {
  tokens: string[];
  amounts: BigNumber[];
};

type ERC721Bundle = {
  tokens: string[];
  tokenIds: number[];
};

export const AskAbiType: string = `tuple(
  address asker,
  address filler,
  tuple(
    address[] tokens,
    uint256[] amounts
  ) askerERC20,
  tuple(
    address[] tokens,
    uint256[] tokenIds
  ) askerERC721,
  tuple(
    address[] tokens,
    uint256[] amounts
  ) fillerERC20,
  tuple(
    address[] tokens,
    uint256[] tokenIds
  ) fillerERC721
)`;
