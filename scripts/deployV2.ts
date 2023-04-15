import { ethers } from "hardhat";

async function main() {
  const SwapsiesV2 = await ethers.getContractFactory("SwapsiesV2");
  const swapsiesV2 = await SwapsiesV2.deploy();

  await swapsiesV2.deployed();

  console.log(
    `SwapsiesV2 deployed to ${swapsiesV2.address}`
  );
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
