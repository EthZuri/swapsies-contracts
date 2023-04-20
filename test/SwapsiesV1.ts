import { expect } from "chai";
import { ethers } from "hardhat";

describe("SwapsiesV1", function () {
  async function deploySwapsiesFixture() {
    // Deploy the Swapsies contract
    const Swapsies = await ethers.getContractFactory("SwapsiesV1");
    const swapsies = await Swapsies.deploy();
    const [deployer, alice, bob] = await ethers.getSigners();

    // tokens for testing
    const Token = await ethers.getContractFactory("TestToken");
    const tokenA = await Token.deploy("TokenA", "TKA");
    const tokenB = await Token.deploy("TokenB", "TKB");
    //mint to alice and bob
    await tokenA.mint(alice.address, ethers.utils.parseEther("100"));
    await tokenB.mint(bob.address, ethers.utils.parseEther("100"));

    return { swapsies, tokenA, tokenB, alice, bob };
  }

  describe("Deployment", function () {
    it("Should deploy successfully", async function () {
      const { swapsies } = await deploySwapsiesFixture();
      expect(swapsies.address).to.be.properAddress;
    });
  });

  describe("Create Ask", function () {
    it("Should create an ask successfully", async function () {
      const { swapsies, tokenA, tokenB, alice, bob } =
        await deploySwapsiesFixture();

      // Add the necessary parameters for the createAsk function
      const askerAmount = ethers.utils.parseEther("0.25");
      const fillerAmount = ethers.utils.parseEther("0.5");

      // create ask object

      const data = {
        asker: alice.address,
        filler: bob.address,
        askerToken: tokenA.address,
        askerAmount: askerAmount,
        fillerToken: tokenB.address,
        fillerAmount: fillerAmount,
      };

      // compute hash

      const askHash = ethers.utils.id(JSON.stringify(data));

      // give approval? Should the smart contract expect approval before the Ask is posted?

      // Call the createAsk function and check for success (e.g., using events, or checking the asks mapping)
      expect(
        await swapsies
          .connect(alice)
          .createAsk(
            askHash,
            alice.address,
            bob.address,
            tokenA.address,
            askerAmount,
            tokenB.address,
            fillerAmount
          )
      ).to.be.ok;
      expect(await swapsies.isActive(askHash)).to.be.true;
    });

    it("Should fail if the askHash already exists", async function () {
      const { swapsies, tokenA, tokenB, alice, bob } = await deploySwapsiesFixture();

      const askerAmount = ethers.utils.parseEther("0.25");
      const fillerAmount = ethers.utils.parseEther("0.5");

      // create ask object
      const data = {
        asker: alice.address,
        filler: bob.address,
        askerToken: tokenA.address,
        askerAmount: askerAmount,
        fillerToken: tokenB.address,
        fillerAmount: fillerAmount,
      };

      // compute hash
      const askHash = ethers.utils.id(JSON.stringify(data));

      // Call the createAsk function again with the same askHash and expect it to be reverted
      expect( await swapsies
        .connect(alice)
        .createAsk(
          askHash,
          alice.address,
          bob.address,
          tokenA.address,
          askerAmount,
          tokenB.address,
          fillerAmount
        )
      ).to.be.revertedWith("Ask hash already exists");
    });
  });

  
  describe("Cancel Ask", function () {
    it("Should cancel an ask successfully", async function () {
      const { swapsies, tokenA, tokenB, alice, bob  } = await deploySwapsiesFixture();
      const askerAmount = ethers.utils.parseEther("0.25");
      const fillerAmount = ethers.utils.parseEther("0.5");

      const data = {
        asker: alice.address,
        filler: bob.address,
        askerToken: tokenA.address,
        askerAmount: askerAmount,
        fillerToken: tokenB.address,
        fillerAmount: fillerAmount,
      };

      const askHash = ethers.utils.id(JSON.stringify(data));


      await swapsies
      .connect(alice)
      .createAsk(
        askHash,
        alice.address,
        bob.address,
        tokenA.address,
        askerAmount,
        tokenB.address,
        fillerAmount
      );
    
      expect(await swapsies.isActive(askHash)).to.be.true;

      const tx = await swapsies
      .connect(alice)
      .cancelAsk(askHash);

      expect(tx)
        .to.emit(swapsies, "AskCancelled")
        .withArgs(alice.address, askHash, askerAmount, tokenB.address, fillerAmount);

      const isActive = await swapsies.isActive(askHash);
      expect(isActive).to.be.false;
    });

    it("Should fail if the ask is not active", async function () {
      const { swapsies, tokenA, tokenB, alice, bob  } = await deploySwapsiesFixture();
      const askerAmount = ethers.utils.parseEther("0.251");
      const fillerAmount = ethers.utils.parseEther("0.5");

      const data = {
        asker: alice.address,
        filler: bob.address,
        askerToken: tokenA.address,
        askerAmount: askerAmount,
        fillerToken: tokenB.address,
        fillerAmount: fillerAmount,
      };

      const askHash = ethers.utils.id(JSON.stringify(data));

      expect(await swapsies.isActive(askHash)).to.be.false;

      await expect(swapsies
        .connect(alice)
        .cancelAsk(askHash)).to.be.revertedWith(
        "Ask is not active"
      );
    });

    it("Should fail if the asker is not the sender", async function () {
      const { swapsies, tokenA, tokenB, alice, bob  } = await deploySwapsiesFixture();
      const askerAmount = ethers.utils.parseEther("0.251");
      const fillerAmount = ethers.utils.parseEther("0.5");

      const data = {
        asker: alice.address,
        filler: bob.address,
        askerToken: tokenA.address,
        askerAmount: askerAmount,
        fillerToken: tokenB.address,
        fillerAmount: fillerAmount,
      };

      const askHash = ethers.utils.id(JSON.stringify(data));
      await swapsies
      .connect(alice)
      .createAsk(
        askHash,
        alice.address,
        bob.address,
        tokenA.address,
        askerAmount,
        tokenB.address,
        fillerAmount
      );

      await expect(swapsies
        .connect(bob)
        .cancelAsk(askHash)).to.be.revertedWith(
        "Only the asker can cancel the ask"
      );
    });
  });

  describe("Fill Ask", function () {
    it("Should fill an ask successfully", async function () {
      const { swapsies, tokenA, tokenB, alice, bob } =
        await deploySwapsiesFixture();

      // Add the necessary parameters for the createAsk function
      const askerAmount = ethers.utils.parseEther("0.25");
      const fillerAmount = ethers.utils.parseEther("0.5");

      // create ask object

      const data = {
        asker: alice.address,
        filler: bob.address,
        askerToken: tokenA.address,
        askerAmount: askerAmount,
        fillerToken: tokenB.address,
        fillerAmount: fillerAmount,
      };

      // compute hash
      const askHash = ethers.utils.id(JSON.stringify(data));

      // approve for ask
      expect(await tokenA.connect(alice).approve(swapsies.address, askerAmount))
        .to.be.ok;
      // Call the createAsk function and check for success (e.g., using events, or checking the asks mapping)
      expect(
        await swapsies
          .connect(alice)
          .createAsk(
            askHash,
            alice.address,
            bob.address,
            tokenA.address,
            askerAmount,
            tokenB.address,
            fillerAmount
          )
      ).to.be.ok;

      // approve for fill
      expect(tokenB.connect(bob).approve(swapsies.address, fillerAmount)).to.be
        .ok;

      // fill
      expect(await swapsies.connect(bob).fillAsk(askHash)).to.be.ok;
      expect(await swapsies.isActive(askHash)).to.be.false;
      expect(await tokenB.balanceOf(alice.address)).to.equal(fillerAmount);
      expect(await tokenA.balanceOf(bob.address)).to.equal(askerAmount);
    });

    it("Should fail if the ask is not active", async function () {
      const { swapsies, tokenA, tokenB, alice, bob } =
        await deploySwapsiesFixture();

      // Add the necessary parameters for the createAsk function
      const askerAmount = ethers.utils.parseEther("0.25");
      const fillerAmount = ethers.utils.parseEther("0.5");

      // create ask object

      const data = {
        asker: alice.address,
        filler: bob.address,
        askerToken: tokenA.address,
        askerAmount: askerAmount,
        fillerToken: tokenB.address,
        fillerAmount: fillerAmount,
      };

      // compute hash
      const askHash = ethers.utils.id(JSON.stringify(data));

      // approve for ask
      expect(await tokenA.connect(alice).approve(swapsies.address, askerAmount))
        .to.be.ok;
    
      // approve for fill
      expect(tokenB.connect(bob).approve(swapsies.address, fillerAmount)).to.be
        .ok;

      // fill
      expect(await swapsies.isActive(askHash)).to.be.false;
      await expect(swapsies.connect(bob).fillAsk(askHash)).to.be.revertedWith('Ask is not active');
    });

    it("Should fail if the filler is not the sender", async function () {
      const { swapsies, tokenA, tokenB, alice, bob } =
      await deploySwapsiesFixture();

      // Add the necessary parameters for the createAsk function
      const askerAmount = ethers.utils.parseEther("0.25");
      const fillerAmount = ethers.utils.parseEther("0.5");

      // create ask object

      const data = {
        asker: alice.address,
        filler: bob.address,
        askerToken: tokenA.address,
        askerAmount: askerAmount,
        fillerToken: tokenB.address,
        fillerAmount: fillerAmount,
      };
      const askHash = ethers.utils.id(JSON.stringify(data));

      // Call the createAsk function
      // approve for ask
      expect(await tokenA.connect(alice).approve(swapsies.address, askerAmount))
      .to.be.ok;
      // Call the createAsk function and check for success (e.g., using events, or checking the asks mapping)
      expect(
        await swapsies
          .connect(alice)
          .createAsk(
            askHash,
            alice.address,
            bob.address,
            tokenA.address,
            askerAmount,
            tokenB.address,
            fillerAmount
          )
      ).to.be.ok;

      // Call the fillAsk function with a different sender and expect it to be reverted
      // approve for fill
      expect(tokenB.connect(bob).approve(swapsies.address, fillerAmount)).to.be
      .ok;
    
      // fill
      await expect(swapsies.connect(alice).fillAsk(askHash)).to.be.revertedWith('Only the designated filler can fill the ask');
    });
  });
});
