const { ethers } = require("hardhat");

const main = async () => {
    const smartWalletFabric = await ethers.getContractFactory("SmartWallet");
    const smartWalletContract = await smartWalletFabric.deploy(
        ["0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC"],
        1
    );

    await smartWalletContract.deployed();

    console.log(
        `The SmartWallet contract was successfuly deployed at ${smartWalletContract.address}`
    );
};

main()
    .then(() => {
        process.exitCode = 0;
    })
    .catch(error => {
        console.log(error);
        process.exitCode = 1;
    });
