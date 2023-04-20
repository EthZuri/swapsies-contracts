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
  amounts: number[];
};

type ERC721Bundle = {
  tokens: string[];
  tokenIds: number[];
};
