const { expect, assert } = require("chai");
const { ethers } = require("hardhat");
const { loadFixture } = require("@nomicfoundation/hardhat-network-helpers");

describe("Smart Wallet W/ Social Recovery", () => {
    let wallet, owner, guardian1;

    beforeEach(async () => {
        [owner, guardian1] = await ethers.getSigners();

        const WalletFactory = await ethers.getContractFactory("SmartWallet");
        wallet = await WalletFactory.deploy([guardian1.address], 1);

        await wallet.deployed();
    });

    describe("Deployment", () => {
        it("Should set the right owner", async () => {
            const currentOwner = await wallet.owner();
            expect(currentOwner).to.equal(owner.address);
        });
    });
});
