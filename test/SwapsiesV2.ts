import { expect } from "chai";
import { ethers } from "hardhat";

describe("SwapsiesV2", function () {
  async function deploySwapsiesFixture() {
    // Deploy the Swapsies contract
    const Swapsies = await ethers.getContractFactory("SwapsiesV2");
    const swapsies = await Swapsies.deploy();
    const [deployer, alice, bob] = await ethers.getSigners();

    // tokens for testing
    const Token = await ethers.getContractFactory("TestToken");
    const tokenA = await Token.deploy("TokenA", "TKA");
    const tokenB = await Token.deploy("TokenB", "TKB");
    const tokenC = await Token.deploy("TokenC", "TKC");
    const NFT = await ethers.getContractFactory("TestNFT");
    const nftA = await NFT.deploy("NFTA", "NFTA");
    const nftB = await NFT.deploy("NFTB", "NFTB");
    //mint to alice and bob
    await tokenA.mint(alice.address, ethers.utils.parseEther("100"));
    await tokenB.mint(bob.address, ethers.utils.parseEther("100"));
    await tokenC.mint(alice.address, ethers.utils.parseEther("500"));
    await tokenC.mint(bob.address, ethers.utils.parseEther("500"));
    await tokenC.mint(bob.address, ethers.utils.parseEther("500"));
    await tokenC.mint(bob.address, ethers.utils.parseEther("500"));
    await nftA.safeMint(alice.address);
    await nftA.safeMint(bob.address);
    await nftB.safeMint(alice.address);
    await nftB.safeMint(bob.address);

    return { swapsies, tokenA, tokenB, tokenC, nftA, nftB, alice, bob };
  }

  describe("Deployment", function () {
    it("Should deploy successfully", async function () {
      const { swapsies } = await deploySwapsiesFixture();
      expect(swapsies.address).to.be.properAddress;
    });
  });

  describe("Create Ask", function () {
    it("Should create an ask successfully", async function () {
      const { swapsies, tokenA, tokenB, tokenC, nftA, nftB, alice, bob } =
        await deploySwapsiesFixture();

      // Add the necessary parameters for the createAsk function
      const askerAmount = ethers.utils.parseEther("0.25");
      const fillerAmount = ethers.utils.parseEther("0.5");

      // create ask object

      const data = {
        asker: alice.address,
        filler: bob.address,
        askerERC20: {
          tokens: [tokenA.address, tokenC.address],
          amounts: [askerAmount, askerAmount],
        },
        askerERC721: {
          tokens: [nftA.address, nftB.address],
          tokenIds: [0, 0],
        },
        fillerERC20: {
          tokens: [tokenB.address],
          amounts: [fillerAmount],
        },
        fillerERC721: {
          tokens: [nftA.address, nftB.address],
          tokenIds: [1, 1],
        },
      };

      // compute hash
      const askHash = ethers.utils.id(JSON.stringify(data));

      // give approval? Should the smart contract expect approval before the Ask is posted?

      // Call the createAsk function and check for success (e.g., using events, or checking the asks mapping)
      // Call the createAsk function and check for success (e.g., using events, or checking the asks mapping)
      expect(
        await swapsies
          .connect(alice)
          .createAsk(
            askHash,
            data.asker,
            data.filler,
            data.askerERC20,
            data.askerERC721,
            data.fillerERC20,
            data.fillerERC721
          )
      ).to.be.ok;

      expect(await swapsies.isActive(askHash)).to.be.true;
    });

    it("Should fail if the askHash already exists", async function () {
      const { swapsies } = await deploySwapsiesFixture();

      // Add the necessary parameters for the createAsk function
      // ...

      // Call the createAsk function once
      // Call the createAsk function again with the same askHash and expect it to be reverted
    });
  });

  describe("Cancel Ask", function () {
    it("Should cancel an ask successfully", async function () {
      const { swapsies } = await deploySwapsiesFixture();

      // Add the necessary parameters for the createAsk function
      // ...

      // Call the createAsk function
      // Call the cancelAsk function and check for success (e.g., using events, or checking the activeAsks mapping)
    });

    it("Should fail if the ask is not active", async function () {
      const { swapsies } = await deploySwapsiesFixture();

      // Add the necessary parameters for the cancelAsk function
      // ...

      // Call the cancelAsk function and expect it to be reverted
    });

    it("Should fail if the asker is not the sender", async function () {
      const { swapsies } = await deploySwapsiesFixture();

      // Add the necessary parameters for the createAsk and cancelAsk functions
      // ...

      // Call the createAsk function
      // Call the cancelAsk function with a different sender and expect it to be reverted
    });
  });

  describe("Fill Ask", function () {
    it("Should fill an ask successfully", async function () {
      const { swapsies, tokenA, tokenB, tokenC, nftA, nftB, alice, bob } =
        await deploySwapsiesFixture();

      // Add the necessary parameters for the createAsk function
      const askerAmount = ethers.utils.parseEther("0.25");
      const fillerAmount = ethers.utils.parseEther("0.5");

      // create ask object
      const data = {
        asker: alice.address,
        filler: bob.address,
        askerERC20: {
          tokens: [tokenA.address, tokenC.address],
          amounts: [askerAmount, askerAmount],
        },
        askerERC721: {
          tokens: [nftA.address, nftB.address],
          tokenIds: [0, 0],
        },
        fillerERC20: {
          tokens: [tokenB.address],
          amounts: [fillerAmount],
        },
        fillerERC721: {
          tokens: [nftA.address, nftB.address],
          tokenIds: [1, 1],
        },
      };

      // compute hash
      const askHash = ethers.utils.id(JSON.stringify(data));

      // Approve token transfers for both ERC20 and ERC721 tokens
      await tokenA.connect(alice).approve(swapsies.address, askerAmount);
      await tokenC.connect(alice).approve(swapsies.address, askerAmount);
      await tokenB.connect(bob).approve(swapsies.address, fillerAmount);
      await nftA.connect(alice).approve(swapsies.address, 0);
      await nftB.connect(alice).approve(swapsies.address, 0);
      await nftA.connect(bob).approve(swapsies.address, 1);
      await nftB.connect(bob).approve(swapsies.address, 1);

      // Call the createAsk function and check for success (e.g., using events, or checking the asks mapping)
      expect(
        await swapsies
          .connect(alice)
          .createAsk(
            askHash,
            data.asker,
            data.filler,
            data.askerERC20,
            data.askerERC721,
            data.fillerERC20,
            data.fillerERC721
          )
      ).to.be.ok;

      
    });

    it("Should fail if the ask is not active", async function () {
      const { swapsies } = await deploySwapsiesFixture();

      // Add the necessary parameters for the fillAsk function
      // ...

      // Call the fillAsk function and expect it to be reverted
    });

    it("Should fail if the filler is not the sender", async function () {
      const { swapsies } = await deploySwapsiesFixture();

      // Add the necessary parameters for the createAsk and fillAsk functions
      // ...

      // Call the createAsk function
      // Call the fillAsk function with a different sender and expect it to be reverted
    });
  });
});
