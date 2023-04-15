import { ethers } from "hardhat";

// Script for deploying test tokens on Goerli
async function main() {
  const [deployer] = await ethers.getSigners();

  // prepare and mint erc20 tokens
  const Token = await ethers.getContractFactory("TestToken");
  const tokenA = await Token.deploy("Token ABC", "ABC");
  console.log(`Token ABC deployed to ${tokenA.address}`);
  const tokenB = await Token.deploy("Token DEF", "DEF");
  console.log(`Token DEF deployed to ${tokenB.address}`);

  await tokenA.mint(deployer.address, ethers.utils.parseEther("1000"));
  console.log(`Minted Token ABC`);
  await tokenB.mint(deployer.address, ethers.utils.parseEther("1000"));
  console.log(`Minted Token DEF`);

  // prepare and mint erc721 tokens
  const NFT = await ethers.getContractFactory("TestNFT");
  const nft = await NFT.deploy("Test NFT", "NFT");
  for (let i = 0; i < 10; i++) {
    await nft.safeMint(deployer.address);
  }
  console.log(`Minted NFTs`);
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
