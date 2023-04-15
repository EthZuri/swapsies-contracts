import { ethers } from "hardhat";

async function main() {
  const SwapsiesV1 = await ethers.getContractFactory("SwapsiesV1");
  const swapsiesV1 = await SwapsiesV1.deploy();

  await swapsiesV1.deployed();

  console.log(
    `SwapsiesV1 deployed to ${swapsiesV1.address}`
  );
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
