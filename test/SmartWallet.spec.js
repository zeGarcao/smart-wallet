const { expect, assert } = require("chai");
const { ethers } = require("hardhat");
const { loadFixture } = require("@nomicfoundation/hardhat-network-helpers");

describe("Smart Wallet W/ Social Recovery", () => {
    const deployWalletsFixture = async () => {
        const [owner, guardian1, guardian2, guardian3, addr1] =
            await ethers.getSigners();

        const WalletFactory = await ethers.getContractFactory("SmartWallet");

        const wallet1of1 = await WalletFactory.connect(owner).deploy(
            [guardian1.address],
            1
        );
        const wallet3of3 = await WalletFactory.connect(owner).deploy(
            [guardian1.address, guardian2.address, guardian3.address],
            3
        );
        const wallet2of3 = await WalletFactory.connect(owner).deploy(
            [guardian1.address, guardian2.address, guardian3.address],
            2
        );

        await wallet1of1.deployed(),
            wallet3of3.deployed(),
            wallet2of3.deployed();

        return {
            wallet1of1,
            wallet3of3,
            wallet2of3,
            owner,
            guardian1,
            guardian2,
            guardian3,
            addr1,
        };
    };

    const deployWalletsWithFundsFixture = async () => {
        const {
            wallet1of1,
            wallet3of3,
            wallet2of3,
            owner,
            guardian1,
            guardian2,
            guardian3,
            addr1,
        } = await loadFixture(deployWalletsFixture);

        const funds = ethers.utils.parseEther("5.0");

        const wallet1of1DepositTx = await owner.sendTransaction({
            to: wallet1of1.address,
            value: funds,
        });
        const wallet3of3DepositTx = await owner.sendTransaction({
            to: wallet3of3.address,
            value: funds,
        });
        const wallet2of3DepositTx = await owner.sendTransaction({
            to: wallet2of3.address,
            value: funds,
        });

        await wallet1of1DepositTx.wait(),
            wallet3of3DepositTx.wait(),
            wallet2of3DepositTx.wait();

        return {
            wallet1of1,
            wallet3of3,
            wallet2of3,
            owner,
            guardian1,
            guardian2,
            guardian3,
            addr1,
        };
    };

    describe("Deployment", () => {
        describe("On success", () => {
            it("Should set the right owner", async () => {
                const { wallet1of1, wallet3of3, wallet2of3, owner } =
                    await loadFixture(deployWalletsFixture);

                expect(await wallet1of1.owner()).to.equal(owner.address);
                expect(await wallet3of3.owner()).to.equal(owner.address);
                expect(await wallet2of3.owner()).to.equal(owner.address);
            });

            it("Should set the right required votes", async () => {
                const { wallet1of1, wallet3of3, wallet2of3 } =
                    await loadFixture(deployWalletsFixture);
                expect(await wallet1of1.requiredVotes()).to.equal(1);
                expect(await wallet3of3.requiredVotes()).to.equal(3);
                expect(await wallet2of3.requiredVotes()).to.equal(2);
            });

            it("Should set the right guardians", async () => {
                const {
                    wallet1of1,
                    wallet3of3,
                    wallet2of3,
                    guardian1,
                    guardian2,
                    guardian3,
                } = await loadFixture(deployWalletsFixture);

                expect(await wallet1of1.getGuardians()).to.eql([
                    guardian1.address,
                ]);
                expect(await wallet3of3.getGuardians()).to.eql([
                    guardian1.address,
                    guardian2.address,
                    guardian3.address,
                ]);
                expect(await wallet2of3.getGuardians()).to.eql([
                    guardian1.address,
                    guardian2.address,
                    guardian3.address,
                ]);
            });

            it("Sould start with [pause-mode=false; recovery-mode=false; recovery-round=0]", async () => {
                const { wallet1of1, wallet3of3, wallet2of3 } =
                    await loadFixture(deployWalletsFixture);

                assert(
                    !(await wallet1of1.isPaused()) &&
                        !(await wallet1of1.inRecovery()) &&
                        (await wallet1of1.currentRecoveryRound()) == 0 &&
                        !(await wallet3of3.isPaused()) &&
                        !(await wallet3of3.inRecovery()) &&
                        (await wallet3of3.currentRecoveryRound()) == 0 &&
                        !(await wallet2of3.isPaused()) &&
                        !(await wallet2of3.inRecovery()) &&
                        (await wallet2of3.currentRecoveryRound()) == 0
                );
            });
        });

        describe("On failure", () => {
            it("Should revert if required votes exceeds guardians length", async () => {
                const [owner, guardian1, guardian2, guardian3] =
                    await ethers.getSigners();

                const WalletFactory = await ethers.getContractFactory(
                    "SmartWallet"
                );

                await expect(
                    WalletFactory.connect(owner).deploy([], 1)
                ).to.be.revertedWith("required votes exceeds guardians length");

                await expect(
                    WalletFactory.connect(owner).deploy(
                        [
                            guardian1.address,
                            guardian2.address,
                            guardian3.address,
                        ],
                        4
                    )
                ).to.be.revertedWith("required votes exceeds guardians length");
            });

            it("Should revert if required votes are not greater than zero", async () => {
                const [owner, guardian1, guardian2, guardian3] =
                    await ethers.getSigners();

                const WalletFactory = await ethers.getContractFactory(
                    "SmartWallet"
                );

                await expect(
                    WalletFactory.connect(owner).deploy([], 0)
                ).to.be.revertedWith(
                    "required votes must be greater than zero"
                );

                await expect(
                    WalletFactory.connect(owner).deploy(
                        [
                            guardian1.address,
                            guardian2.address,
                            guardian3.address,
                        ],
                        0
                    )
                ).to.be.revertedWith(
                    "required votes must be greater than zero"
                );
            });

            it("Should revert if duplicate guardians are set", async () => {
                const [owner, guardian1, guardian2, guardian3] =
                    await ethers.getSigners();

                const WalletFactory = await ethers.getContractFactory(
                    "SmartWallet"
                );

                await expect(
                    WalletFactory.connect(owner).deploy(
                        [guardian1.address, guardian1.address],
                        1
                    )
                ).to.be.revertedWith("duplicate guardian");

                await expect(
                    WalletFactory.connect(owner).deploy(
                        [
                            guardian1.address,
                            guardian2.address,
                            guardian3.address,
                            guardian2.address,
                        ],
                        3
                    )
                ).to.be.revertedWith("duplicate guardian");
            });

            it("Should revert if a guardian address is the zero address", async () => {
                const [owner, guardian1, guardian2, guardian3] =
                    await ethers.getSigners();

                const WalletFactory = await ethers.getContractFactory(
                    "SmartWallet"
                );

                await expect(
                    WalletFactory.connect(owner).deploy(
                        ["0x0000000000000000000000000000000000000000"],
                        1
                    )
                ).to.be.revertedWith("guardian can not be the zero address");

                await expect(
                    WalletFactory.connect(owner).deploy(
                        [
                            guardian1.address,
                            "0x0000000000000000000000000000000000000000",
                            guardian2.address,
                        ],
                        3
                    )
                ).to.be.revertedWith("guardian can not be the zero address");

                await expect(
                    WalletFactory.connect(owner).deploy(
                        [
                            guardian1.address,
                            "0x0000000000000000000000000000000000000000",
                            guardian2.address,
                            "0x0000000000000000000000000000000000000000",
                            guardian3.address,
                        ],
                        3
                    )
                ).to.be.revertedWith("guardian can not be the zero address");
            });

            it("Should revert if owner is set to be a guardian", async () => {
                const [owner, guardian1, guardian2] = await ethers.getSigners();

                const WalletFactory = await ethers.getContractFactory(
                    "SmartWallet"
                );

                await expect(
                    WalletFactory.connect(owner).deploy([owner.address], 1)
                ).to.be.revertedWith("owner can not be a guardian");

                await expect(
                    WalletFactory.connect(owner).deploy(
                        [guardian1.address, guardian2.address, owner.address],
                        2
                    )
                ).to.be.revertedWith("owner can not be a guardian");
            });
        });
    });

    describe("Basic functionalities", () => {
        describe("#getBalance", () => {
            it("Should return the current balance", async () => {
                const { wallet1of1, wallet3of3, wallet2of3 } =
                    await loadFixture(deployWalletsWithFundsFixture);

                const expectedBalance = ethers.utils.parseEther("5.0");

                expect(await wallet1of1.getBalance()).to.equal(expectedBalance);
                expect(await wallet3of3.getBalance()).to.equal(expectedBalance);
                expect(await wallet2of3.getBalance()).to.equal(expectedBalance);
            });
        });
        describe("#pauseTransfers", () => {
            describe("On success", () => {
                it("Should set 'isPaused' to true", async () => {
                    const { wallet1of1, wallet3of3, wallet2of3, owner } =
                        await loadFixture(deployWalletsFixture);

                    const wallet1of1PauseTransfersTx = await wallet1of1
                        .connect(owner)
                        .pauseTransfers();
                    const wallet3of3PauseTransfersTx = await wallet3of3
                        .connect(owner)
                        .pauseTransfers();
                    const wallet2of3PauseTransfersTx = await wallet2of3
                        .connect(owner)
                        .pauseTransfers();

                    await wallet1of1PauseTransfersTx.wait(),
                        wallet3of3PauseTransfersTx.wait(),
                        wallet2of3PauseTransfersTx.wait();

                    expect(await wallet1of1.isPaused()).to.equal(true);
                    expect(await wallet3of3.isPaused()).to.equal(true);
                    expect(await wallet2of3.isPaused()).to.equal(true);
                });
            });
            describe("On failure", () => {
                it("Should revert if caller is not the owner", async () => {
                    const { wallet1of1, guardian1, addr1 } = await loadFixture(
                        deployWalletsFixture
                    );

                    await expect(
                        wallet1of1.connect(guardian1).pauseTransfers()
                    ).to.be.revertedWith("caller is not owner");
                    await expect(
                        wallet1of1.connect(addr1).pauseTransfers()
                    ).to.be.revertedWith("caller is not owner");
                });

                it("Should revert if transfers are already paused", async () => {
                    const { wallet1of1, owner } = await loadFixture(
                        deployWalletsFixture
                    );

                    const tx = await wallet1of1.connect(owner).pauseTransfers();
                    await tx.wait();

                    await expect(
                        wallet1of1.connect(owner).pauseTransfers()
                    ).to.be.revertedWith("transfers are paused");
                });
            });
        });
        describe("#resumeTransfers", () => {
            describe("On success", () => {
                it("Should set 'isPaused' to false", async () => {
                    const { wallet1of1, owner } = await loadFixture(
                        deployWalletsFixture
                    );

                    const pauseTx = await wallet1of1
                        .connect(owner)
                        .pauseTransfers();
                    await pauseTx.wait();

                    const resumeTx = await wallet1of1
                        .connect(owner)
                        .resumeTransfers();
                    await resumeTx.wait();

                    assert.isFalse(await wallet1of1.isPaused());
                });
            });
            describe("On failure", () => {
                it("Should rvert if caller is not the owner", async () => {
                    const { wallet1of1, owner, addr1 } = await loadFixture(
                        deployWalletsFixture
                    );

                    const pauseTx = await wallet1of1
                        .connect(owner)
                        .pauseTransfers();
                    await pauseTx.wait();

                    await expect(
                        wallet1of1.connect(addr1).resumeTransfers()
                    ).to.be.revertedWith("caller is not owner");
                });
                it("Should revert if transfers are already resumed", async () => {
                    const { wallet1of1, owner } = await loadFixture(
                        deployWalletsFixture
                    );

                    await expect(
                        wallet1of1.connect(owner).resumeTransfers()
                    ).to.be.revertedWith("transfers are not paused");
                });
            });
        });
        describe("#receive", () => {
            it("Should update the balance after deposit", async () => {
                const { wallet1of1, owner, guardian1, addr1 } =
                    await loadFixture(deployWalletsFixture);

                const initialBalance = await wallet1of1.getBalance();

                const ownerDeposit = ethers.utils.parseEther("0.5");
                const guardian1Deposit = ethers.utils.parseEther("0.75");
                const addr1Deposit = ethers.utils.parseEther("1.5");

                const ownerTx = await owner.sendTransaction({
                    to: wallet1of1.address,
                    value: ownerDeposit,
                });

                const guardian1Tx = await guardian1.sendTransaction({
                    to: wallet1of1.address,
                    value: guardian1Deposit,
                });

                const addr1Tx = await addr1.sendTransaction({
                    to: wallet1of1.address,
                    value: addr1Deposit,
                });

                await ownerTx.wait(), guardian1Tx.wait(), addr1Tx.wait();

                const balanceAfterDeposits = await wallet1of1.getBalance();

                expect(initialBalance).to.equal(ethers.BigNumber.from(0));
                expect(balanceAfterDeposits).to.equal(
                    ownerDeposit.add(guardian1Deposit).add(addr1Deposit)
                );
            });

            it("Should emit Deposit event", async () => {
                const { wallet1of1, owner, guardian1, addr1 } =
                    await loadFixture(deployWalletsFixture);

                const ownerDeposit = ethers.utils.parseEther("0.5");
                const guardian1Deposit = ethers.utils.parseEther("0.75");
                const addr1Deposit = ethers.utils.parseEther("1.5");

                const ownerTx = await owner.sendTransaction({
                    to: wallet1of1.address,
                    value: ownerDeposit,
                });

                const guardian1Tx = await guardian1.sendTransaction({
                    to: wallet1of1.address,
                    value: guardian1Deposit,
                });

                const addr1Tx = await addr1.sendTransaction({
                    to: wallet1of1.address,
                    value: addr1Deposit,
                });

                await ownerTx.wait(), guardian1Tx.wait(), addr1Tx.wait();

                expect(ownerTx)
                    .to.emit(wallet1of1, "Deposit")
                    .withArgs(owner.address, ownerDeposit);

                expect(guardian1Tx)
                    .to.emit(wallet1of1, "Deposit")
                    .withArgs(guardian1.address, guardian1Deposit);

                expect(addr1Tx)
                    .to.emit(wallet1of1, "Deposit")
                    .withArgs(addr1.address, addr1Deposit);
            });
        });
        describe("#transferTo", () => {
            describe("On success", () => {
                it("Should update the balances after transfer", async () => {
                    const { wallet1of1, owner, addr1 } = await loadFixture(
                        deployWalletsWithFundsFixture
                    );

                    const walletInitialBalance = await wallet1of1.getBalance();
                    const ownerInitialBalance = await owner.getBalance();
                    const addr1InitialBalance = await addr1.getBalance();
                    const transferToOwnerValue = ethers.utils.parseEther("1.0");
                    const transferToAddr1Value =
                        ethers.utils.parseEther("2.115");

                    const transferToOwnerTx = await wallet1of1
                        .connect(owner)
                        .transferTo(owner.address, transferToOwnerValue);
                    const transferToAddr1Tx = await wallet1of1
                        .connect(owner)
                        .transferTo(addr1.address, transferToAddr1Value);

                    const transferToOwnerReceipt =
                        await transferToOwnerTx.wait();
                    const transferToAddr1Receipt =
                        await transferToAddr1Tx.wait();

                    const walletFinalBalance = await wallet1of1.getBalance();
                    const ownerFinalBalance = await owner.getBalance();
                    const addr1FinalBalance = await addr1.getBalance();
                    const gasCost = transferToOwnerReceipt.gasUsed
                        .mul(transferToOwnerReceipt.effectiveGasPrice)
                        .add(
                            transferToAddr1Receipt.gasUsed.mul(
                                transferToAddr1Receipt.effectiveGasPrice
                            )
                        );

                    expect(walletFinalBalance).to.equal(
                        walletInitialBalance
                            .sub(transferToAddr1Value)
                            .sub(transferToOwnerValue)
                    );

                    expect(addr1FinalBalance).to.equal(
                        addr1InitialBalance.add(transferToAddr1Value)
                    );

                    expect(ownerFinalBalance).to.equal(
                        ownerInitialBalance
                            .add(transferToOwnerValue)
                            .sub(gasCost)
                    );
                });

                it("Should emit Transfer event", async () => {
                    const { wallet1of1, owner, addr1 } = await loadFixture(
                        deployWalletsWithFundsFixture
                    );

                    const value = ethers.utils.parseEther("1.0");

                    const tx = await wallet1of1
                        .connect(owner)
                        .transferTo(addr1.address, value);

                    await tx.wait();

                    expect(tx)
                        .to.emit(wallet1of1, "Transfer")
                        .withArgs(addr1.address, value);
                });

                it("Should return true", async () => {
                    const { wallet1of1, owner, addr1 } = await loadFixture(
                        deployWalletsWithFundsFixture
                    );

                    const res = await wallet1of1
                        .connect(owner)
                        .callStatic.transferTo(
                            addr1.address,
                            ethers.utils.parseEther("1.0")
                        );

                    assert.isTrue(res);
                });
            });

            describe("On failure", () => {
                it("Should revert if caller is not the owner", async () => {
                    const { wallet1of1, addr1 } = await loadFixture(
                        deployWalletsWithFundsFixture
                    );

                    await expect(
                        wallet1of1
                            .connect(addr1)
                            .transferTo(
                                addr1.address,
                                ethers.utils.parseEther("1.0")
                            )
                    ).revertedWith("caller is not owner");
                });

                it("Should revert if wallet is paused", async () => {
                    const { wallet1of1, owner } = await loadFixture(
                        deployWalletsWithFundsFixture
                    );

                    const pauseWalletTx = await wallet1of1
                        .connect(owner)
                        .pauseTransfers();
                    await pauseWalletTx.wait();

                    await expect(
                        wallet1of1
                            .connect(owner)
                            .transferTo(
                                owner.address,
                                ethers.utils.parseEther("1.0")
                            )
                    ).to.be.revertedWith("transfers are paused");
                });

                it("Should revert if receiver is the zero address", async () => {
                    const { wallet1of1, owner } = await loadFixture(
                        deployWalletsWithFundsFixture
                    );

                    await expect(
                        wallet1of1
                            .connect(owner)
                            .transferTo(
                                "0x0000000000000000000000000000000000000000",
                                ethers.utils.parseEther("1.0")
                            )
                    ).to.be.revertedWith(
                        "receiver can not be the zero address"
                    );
                });

                it("Should revert if insufficient balance", async () => {
                    const { wallet3of3, owner } = await loadFixture(
                        deployWalletsWithFundsFixture
                    );

                    await expect(
                        wallet3of3
                            .connect(owner)
                            .transferTo(
                                owner.address,
                                ethers.utils.parseEther("10.0")
                            )
                    ).to.be.revertedWith("insufficient balance");
                });
            });
        });
    });

    describe("Guardians management", () => {
        describe("#addGuardian", () => {
            describe("On success", () => {
                it("Should successfully add new guardian to guardians list", async () => {
                    const { wallet1of1, owner, guardian1, addr1 } =
                        await loadFixture(deployWalletsFixture);

                    const tx = await wallet1of1
                        .connect(owner)
                        .addGuardian(addr1.address);
                    await tx.wait();

                    assert.isTrue(await wallet1of1.isGuardian(addr1.address));
                    expect(await wallet1of1.getGuardians()).to.include.members([
                        guardian1.address,
                        addr1.address,
                    ]);
                });
                it("Should return true", async () => {
                    const { wallet1of1, owner, addr1 } = await loadFixture(
                        deployWalletsFixture
                    );

                    const res = await wallet1of1
                        .connect(owner)
                        .callStatic.addGuardian(addr1.address);

                    assert.isTrue(res);
                });
            });
            describe("On failure", () => {
                it("Should revert if caller is not the owner", async () => {
                    const { wallet1of1, guardian1, addr1 } = await loadFixture(
                        deployWalletsFixture
                    );

                    await expect(
                        wallet1of1.connect(guardian1).addGuardian(addr1.address)
                    ).to.be.revertedWith("caller is not owner");
                });
                it("Should revert if wallet is in recovery mode", async () => {
                    const { wallet1of1, owner, guardian1, addr1 } =
                        await loadFixture(deployWalletsFixture);

                    const tx = await wallet1of1
                        .connect(guardian1)
                        .triggerRecovery(addr1.address);

                    await tx.wait();

                    await expect(
                        wallet1of1.connect(owner).addGuardian(addr1.address)
                    ).to.be.revertedWith("wallet is in recovery mode");
                });
                it("Should revert if new guardian is already a guardian", async () => {
                    const { wallet2of3, owner, guardian1 } = await loadFixture(
                        deployWalletsFixture
                    );

                    await expect(
                        wallet2of3.connect(owner).addGuardian(guardian1.address)
                    ).to.be.revertedWith("duplicate guardian");
                });
                it("Should revert if new guardian is the zero address", async () => {
                    const { wallet2of3, owner } = await loadFixture(
                        deployWalletsFixture
                    );

                    await expect(
                        wallet2of3
                            .connect(owner)
                            .addGuardian(
                                "0x0000000000000000000000000000000000000000"
                            )
                    ).to.be.revertedWith(
                        "guardian can not be the zero address"
                    );
                });
                it("Should revert if new guardian is the owner", async () => {
                    const { wallet2of3, owner } = await loadFixture(
                        deployWalletsFixture
                    );

                    await expect(
                        wallet2of3.connect(owner).addGuardian(owner.address)
                    ).to.be.revertedWith("owner can not be a guardian");
                });
            });
        });
        describe("#removeGuardian", () => {
            describe("On success", () => {
                it("Should successfully remove guardian from guardians list", async () => {
                    const { wallet2of3, owner, guardian1 } = await loadFixture(
                        deployWalletsFixture
                    );

                    const tx = await wallet2of3
                        .connect(owner)
                        .removeGuardian(guardian1.address);
                    await tx.wait();

                    assert.isFalse(
                        await wallet2of3.isGuardian(guardian1.address)
                    );
                    expect(
                        await wallet2of3.getGuardians()
                    ).to.not.include.members([guardian1.address]);
                });
                it("Should return true", async () => {
                    const { wallet2of3, owner, guardian1 } = await loadFixture(
                        deployWalletsFixture
                    );

                    const res = await wallet2of3
                        .connect(owner)
                        .callStatic.removeGuardian(guardian1.address);

                    assert.isTrue(res);
                });
            });
            describe("On failure", () => {
                it("Should revert if caller is not the owner", async () => {
                    const { wallet2of3, guardian1, addr1 } = await loadFixture(
                        deployWalletsFixture
                    );

                    await expect(
                        wallet2of3
                            .connect(addr1)
                            .removeGuardian(guardian1.address)
                    ).to.be.revertedWith("caller is not owner");
                });
                it("Should revert if wallet is in recovery mode", async () => {
                    const { wallet2of3, owner, guardian1, addr1 } =
                        await loadFixture(deployWalletsFixture);

                    const tx = await wallet2of3
                        .connect(guardian1)
                        .triggerRecovery(addr1.address);
                    await tx.wait();

                    await expect(
                        wallet2of3
                            .connect(owner)
                            .removeGuardian(guardian1.address)
                    ).to.be.revertedWith("wallet is in recovery mode");
                });
                it("Should revert if the guardian to be removed is the zero address", async () => {
                    const { wallet2of3, owner } = await loadFixture(
                        deployWalletsFixture
                    );

                    await expect(
                        wallet2of3
                            .connect(owner)
                            .removeGuardian(
                                "0x0000000000000000000000000000000000000000"
                            )
                    ).to.be.revertedWith("address can not be the zero address");
                });
                it("Should revert if guardian does not exist", async () => {
                    const { wallet2of3, owner, addr1 } = await loadFixture(
                        deployWalletsFixture
                    );

                    await expect(
                        wallet2of3.connect(owner).removeGuardian(addr1.address)
                    ).to.be.revertedWith("guardian does not exist");
                });
                it("Should revert if required votes greater than guardians length", async () => {
                    const { wallet3of3, owner, guardian2 } = await loadFixture(
                        deployWalletsFixture
                    );

                    await expect(
                        wallet3of3
                            .connect(owner)
                            .removeGuardian(guardian2.address)
                    ).to.be.revertedWith(
                        "required votes must be less than the number of guardians"
                    );
                });
            });
        });
        describe("#changeGuardian", () => {
            describe("On success", () => {
                it("Should successfully change a guardian to a new one", async () => {
                    const { wallet1of1, owner, guardian1, addr1 } =
                        await loadFixture(deployWalletsFixture);

                    const tx = await wallet1of1
                        .connect(owner)
                        .changeGuardian(guardian1.address, addr1.address);
                    await tx.wait();

                    assert.isTrue(await wallet1of1.isGuardian(addr1.address));
                    assert.isFalse(
                        await wallet1of1.isGuardian(guardian1.address)
                    );
                    expect(await wallet1of1.getGuardians()).to.include.members([
                        addr1.address,
                    ]);
                    expect(
                        await wallet1of1.getGuardians()
                    ).to.not.include.members([guardian1.address]);
                });
                it("Should return true", async () => {
                    const { wallet1of1, owner, guardian1, addr1 } =
                        await loadFixture(deployWalletsFixture);

                    const res = await wallet1of1
                        .connect(owner)
                        .callStatic.changeGuardian(
                            guardian1.address,
                            addr1.address
                        );
                    assert.isTrue(res);
                });
            });
            describe("On failure", () => {
                it("Should revert if caller is not the owner", async () => {
                    const { wallet1of1, guardian1, guardian2, addr1 } =
                        await loadFixture(deployWalletsFixture);

                    await expect(
                        wallet1of1
                            .connect(guardian2)
                            .changeGuardian(guardian1.address, addr1.address)
                    ).to.be.revertedWith("caller is not owner");
                });
                it("Should revert if wallet is in recovery mode", async () => {
                    const { wallet1of1, owner, guardian1, addr1 } =
                        await loadFixture(deployWalletsFixture);

                    const tx = await wallet1of1
                        .connect(guardian1)
                        .triggerRecovery(addr1.address);
                    await tx.wait();

                    await expect(
                        wallet1of1
                            .connect(owner)
                            .changeGuardian(guardian1.address, addr1.address)
                    ).to.be.revertedWith("wallet is in recovery mode");
                });
                it("Should revert if guardian to be removed does not exist", async () => {
                    const { wallet1of1, owner, guardian2, addr1 } =
                        await loadFixture(deployWalletsFixture);

                    await expect(
                        wallet1of1
                            .connect(owner)
                            .changeGuardian(guardian2.address, addr1.address)
                    ).to.be.revertedWith("guardian does not exist");
                });
                it("Should revert if new guardian is the zero address", async () => {
                    const { wallet1of1, owner, guardian1 } = await loadFixture(
                        deployWalletsFixture
                    );

                    await expect(
                        wallet1of1
                            .connect(owner)
                            .changeGuardian(
                                guardian1.address,
                                "0x0000000000000000000000000000000000000000"
                            )
                    ).to.be.revertedWith(
                        "guardian can not be the zero address"
                    );
                });
                it("Should revert if new guardian is the owner", async () => {
                    const { wallet1of1, owner, guardian1 } = await loadFixture(
                        deployWalletsFixture
                    );

                    await expect(
                        wallet1of1
                            .connect(owner)
                            .changeGuardian(guardian1.address, owner.address)
                    ).to.be.revertedWith("guardian can not be the owner");
                });
            });
        });
        describe("#getGuardians", () => {
            it("Should retrive the guardian list successfully", async () => {
                const {
                    wallet1of1,
                    wallet3of3,
                    wallet2of3,
                    guardian1,
                    guardian2,
                    guardian3,
                } = await loadFixture(deployWalletsFixture);

                expect(await wallet1of1.getGuardians()).to.include.members([
                    guardian1.address,
                ]);
                expect(await wallet3of3.getGuardians()).to.include.members([
                    guardian1.address,
                    guardian2.address,
                    guardian3.address,
                ]);
                expect(await wallet2of3.getGuardians()).to.include.members([
                    guardian1.address,
                    guardian2.address,
                    guardian3.address,
                ]);
            });
        });
    });

    describe("Recovery", () => {
        describe("#setRequiredVotes", () => {});
        describe("#triggerRecovery", () => {});
        describe("#supportRecovery", () => {});
        describe("#executeRecovery", () => {});
        describe("#cancelRecovery", () => {});
    });
});
