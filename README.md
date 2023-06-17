# Social Recovery Wallet

Implementation, as a proof of concept, of a smart contract wallet with the integration of adapted [social recovery](https://vitalik.ca/general/2021/01/11/recovery.html).

## Prerequisites

- [Node JS](https://nodejs.org/en) installed
- [MetaMask](https://metamask.io/) installed

## Usage

First, clone this repository on your local machine.

After cloning it, open the terminal in the project folder and run the command below to install all dependencies:

```bash
npm install
```

After the dependencies are all installed, you can run the project [locally](#local) or on Ethereum's [Sepolia](#sepolia) testing network. See below the required configurations.

### Local
First, create a `.env` file according to the specifications for the Hardhat network contained in the `.env.example` file.

After you have created the `.env` file, comment out the Sepolia network settings contained in the `hardhat.config.js` file.

Go to the `web3-utils.js` file in the `./src/web3` folder, comment out the lines related to the Sepolia network and uncomment the lines related to the Hardhat network.

After these settings are made, run the following command to run the Hardhat network:

```bash
npx hardhat node
```

After the Hardhat network is up and running, add the first five Hardhat accounts to your MetaMask using their private keys that appear in the console.

Next, you need to deploy the smart contract in your local blockchain. To do so, run the following command:

```bash
npx hardhat run ./scripts/deploy.js --network localhost
```

After you deployed the contract, copy the smart contract address from your console and add it the `.env` file (see `.env.example` file).

Run the following command below to start the app and you are ready to go:

```bash
npm start
```
**Note**
If you want to change the original owner, guardians and number of required votes, go to the `deploy.js` file in the `./scripts` folder and change it before you deploy the contract.

### Sepolia
To use Sepolia network, you first need to create an [Infura](https://www.infura.io/) account and get your API key and the Sepolia network endpoint URL.

After you have set up the account, get some ETH from the [Infura faucet](https://www.infura.io/faucet/sepolia).

Next, create a `.env` file according to the specifications for the Sepolia network contained in the `.env.example` file. You will need to put a private key from one of your MetaMask accounts, to deploy the contract later on.

After you have created the `.env` file, uncomment the Sepolia network settings contained in the `hardhat.config.js` file.

Go to the `web3-utils.js` file in the `./src/web3` folder, comment out the lines related to the Hardhat network and uncomment the lines related to the Sepolia network.

Next, you need to deploy the smart contract in the Sepolia network. To do so, run the following command:

```bash
npx hardhat run ./scripts/deploy.js --network sepolia
```
After you deployed the contract, copy the smart contract address from your console and add it the `.env` file (see `.env.example` file).

Run the following command below to start the app and you are ready to go:

```bash
npm start
```

## Tests
In order to run the unit tests, run the following command:

```bash
npx hardhat test
```

**Note**
If you want to add some additional tests, go to the `SmartWallet.spec.js` file under the `./test` folder and add it.

If you want to learn more, read the [Hardhat Documentation](https://hardhat.org/docs).
