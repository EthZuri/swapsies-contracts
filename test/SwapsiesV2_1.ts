import { expect } from "chai";
import { ethers } from "hardhat";
import { Ask, AskAbiType } from "./utils/Ask";

describe("SwapsiesV2_1", function () {
  async function deploySwapsiesFixture() {
    // Deploy the Swapsies contract
    const Swapsies = await ethers.getContractFactory("SwapsiesV2_1");
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
      // Create an Ask object
      const ask: Ask = {
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
      const askHash = ethers.utils.keccak256(ethers.utils.defaultAbiCoder.encode([AskAbiType], [ask]));
    
      console.log(askHash);

      // give approval? Should the smart contract expect approval before the Ask is posted?

      // Call the createAsk function and check for success (e.g., using events, or checking the asks mapping)
      // Call the createAsk function and check for success (e.g., using events, or checking the asks mapping)
      expect(await swapsies.connect(alice).createAsk(ask)).to.be.ok;

      expect(await swapsies.isActive(askHash)).to.be.true;
    });

    it("Should fail if the askHash already exists", async function () {
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

      // Call the createAsk function once
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

      // Call the createAsk function again with the same askHash and expect it to be reverted
      await expect(
        swapsies
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
      ).to.be.revertedWith(
        "The ask you are trying to submit is already active"
      );
    });
  });

  describe("Cancel Ask", function () {
    it("Should cancel an ask successfully", async function () {
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
      // Call the cancelAsk function and check for success (e.g., using events, or checking the activeAsks mapping)
      await expect(swapsies.connect(alice).cancelAsk(askHash)).to.be.ok;
    });

    it("Should fail if the ask is not active", async function () {
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

      expect(await swapsies.isActive(askHash)).to.be.false;

      // Call the cancelAsk function and expect it to be reverted
      await expect(
        swapsies.connect(alice).cancelAsk(askHash)
      ).to.be.revertedWith("Ask is not active");
    });

    it("Should fail if the asker is not the sender", async function () {
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
      // Call the cancelAsk function with a different sender and expect it to be reverted
      await expect(swapsies.connect(bob).cancelAsk(askHash)).to.be.revertedWith(
        "Only the asker can cancel the ask"
      );
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

      expect(await swapsies.connect(bob).fillAsk(askHash)).to.be.ok;
      // Check ERC20 token balances after filling the ask
      expect(await tokenA.balanceOf(alice.address)).to.equal(
        ethers.utils.parseEther("100").sub(askerAmount)
      );
      expect(await tokenA.balanceOf(bob.address)).to.equal(askerAmount);
      expect(await tokenB.balanceOf(alice.address)).to.equal(fillerAmount);
      expect(await tokenB.balanceOf(bob.address)).to.equal(
        ethers.utils.parseEther("100").sub(fillerAmount)
      );
      expect(await tokenC.balanceOf(alice.address)).to.equal(
        ethers.utils.parseEther("500").sub(askerAmount)
      );
      expect(await tokenC.balanceOf(bob.address)).to.equal(
        ethers.utils.parseEther("500").add(askerAmount)
      );

      // Check ERC721 token ownership after filling the ask
      expect(await nftA.ownerOf(0)).to.equal(bob.address);
      expect(await nftA.ownerOf(1)).to.equal(alice.address);
      expect(await nftB.ownerOf(0)).to.equal(bob.address);
      expect(await nftB.ownerOf(1)).to.equal(alice.address);
    });

    it("Should fail if the ask is not active", async function () {
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

      // Call the fillAsk function and expect it to be reverted
      expect(await swapsies.isActive(askHash)).to.be.false;
      await expect(swapsies.connect(bob).fillAsk(askHash)).to.be.ok;
    });

    it("Should fail if the filler is not the sender", async function () {
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

      // Call the fillAsk function with a different sender and expect it to be reverted
      await expect(swapsies.connect(alice).fillAsk(askHash)).to.be.revertedWith(
        "Only the designated filler can fill the ask"
      );
    });
  });
});
