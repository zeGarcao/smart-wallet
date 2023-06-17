const { ethers } = require("hardhat");

const main = async () => {
    const smartWalletFabric = await ethers.getContractFactory("SmartWallet");

    // Default owner: account #0
    // Guardian: account #2
    // Required votes: 1
    const smartWalletContract = await smartWalletFabric.deploy(
        ["0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC"],
        1
    );

    /* || TO DEPLOY WITH ANOTHER SETTINGS */
    // const accounts = await ethers.getSigners();
    // Owner: account #1
    // const smartWalletContract = await smartWalletFabric
    //     .connect(accounts[1].address)
    //     .deploy(
    //         [accounts[0].address, accounts[2].address, accounts[3].address],
    //         2
    //     );
    /* || TO DEPLOY WITH ANOTHER SETTINGS - END */

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
