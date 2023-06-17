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
First, under the project root directory, create a `.env` file according to the specifications for the Hardhat network contained in the `.env.example` file.

Example `.env`:
```bash
# HARDHAT NETWORK
REACT_APP_HARDHAT_CHAIN_ID = "31337"
REACT_APP_HARDHAT_CHAIN_ID_HEX = "0x7a69"
REACT_APP_HARDHAT_NETWORK_NAME = "Hardhat Network"
REACT_APP_HARDHAT_SYMBOL = "ETH"
REACT_APP_HARDHAT_DECIMALS = "18"
REACT_APP_LOCAL_ENDPOINT = "http://127.0.0.1:8545/"
LOCAL_ENDPOINT = "http://127.0.0.1:8545/"
```

After you have created the `.env` file, comment out the Sepolia network settings contained in the `hardhat.config.js` file.

Example `hardhat.config.js`:
```bash
module.exports = {
    solidity: "0.8.18",
    networks: {
        hardhat: {},
        // sepolia: {
        //     url: INFURA_ENDPOINT,
        //     accounts: [PRIVATE_KEY],
        // },
    },
};
```

Go to the `web3-utils.js` file in the `./src/web3` folder, comment out the lines related to the Sepolia network and uncomment the lines related to the Hardhat network.

Example `web3-utils.js`:
```bash
/* || FOR HARDHAT NETWORK || */
const CHAIN_ID = parseInt(process.env.REACT_APP_HARDHAT_CHAIN_ID);
const CHAIN_ID_HEX = process.env.REACT_APP_HARDHAT_CHAIN_ID_HEX;
const RPC_ENDPOINT = process.env.REACT_APP_LOCAL_ENDPOINT;
const NETWORK_NAME = process.env.REACT_APP_HARDHAT_NETWORK_NAME;
const SYMBOL = process.env.REACT_APP_HARDHAT_SYMBOL;
const DECIMALS = parseInt(process.env.REACT_APP_HARDHAT_DECIMALS);
/* || FOR HARDHAT NETWORK - END || */

/* || FOR SEPOLIA TEST NETWORK || */
// const CHAIN_ID = parseInt(process.env.REACT_APP_SEPOLIA_CHAIN_ID);
// const CHAIN_ID_HEX = process.env.REACT_APP_SEPOLIA_CHAIN_ID_HEX;
// const RPC_ENDPOINT = process.env.REACT_APP_INFURA_ENDPOINT;
// const NETWORK_NAME = process.env.REACT_APP_SEPOLIA_NETWORK_NAME;
// const SYMBOL = process.env.REACT_APP_SEPOLIA_SYMBOL;
// const DECIMALS = parseInt(process.env.REACT_APP_SEPOLIA_DECIMALS);
/* || FOR SEPOLIA TEST NETWORK - END || */
```

After these settings are made, run the following command to run the Hardhat network:

```bash
npx hardhat node
```

After the Hardhat network is up and running, add the first five Hardhat accounts to your MetaMask using their private keys that appear in the console, and then add the Hardhat Network to your MetaMask:

- Network Name: Hardhat Network
- New RPC URL: http://127.0.0.1:8545/
- Chain ID: 31337
- Currency symbol: ETH

Then, Change the current network to "Hardhat Network".

Next, you need to deploy the smart contract in your local blockchain. To do so, run the following command:

```bash
npx hardhat run ./scripts/deploy.js --network localhost
```

After you deployed the contract, copy the smart contract address from your console and add it to the `.env` file (see `.env.example` file).

Example `.env`:
```bash
# WALLET ADDRESS
REACT_APP_WALLET_CONTRACT_ADDRESS = "YOUR WALLET CONTRACT ADDRESS"
```

Run the following command below to start the app and you are ready to go:

```bash
npm start
```
**Note**
The default original owner is Hardhat account #0, the default guardian is Hardhat account #2 and the default number of required votes is 1. If you want to change the original owner, guardians and number of required votes, go to the `deploy.js` file in the `./scripts` folder and change it before you deploy the contract.

Different configuration example (`deploy.js`):
```bash
/* || TO DEPLOY WITH ANOTHER SETTINGS (HARDHAT) */
const accounts = await ethers.getSigners();

const smartWalletContract = await smartWalletFabric
    .connect(accounts[1])
    .deploy(
        [accounts[0].address, accounts[2].address, accounts[3].address],
        2 
    );
|| TO DEPLOY WITH ANOTHER SETTINGS (HARDHAT) - END */
```

### Sepolia
To use Sepolia network, you first need to create an [Infura](https://www.infura.io/) account and get your API key and the Sepolia network endpoint URL.

Next, in MetaMask, go to `Settings>Advanced` and turn on "Show test networks". Then, change the current network to "Sepolia test network".

After you have set up the account, get some ETH from the [Infura faucet](https://www.infura.io/faucet/sepolia).

Next, under the project root directory, create a `.env` file (if you haven't created it yet) according to the specifications for the Sepolia network contained in the `.env.example` file. You will need to put your API key and a private key from one of your MetaMask accounts, to deploy the contract later on.

Example `.env`:
```bash
# SEPOLIA NETWORK
REACT_APP_SEPOLIA_CHAIN_ID = "11155111"
REACT_APP_SEPOLIA_CHAIN_ID_HEX = "0xaa36a7"
REACT_APP_SEPOLIA_NETWORK_NAME = "Sepolia test network"
REACT_APP_SEPOLIA_SYMBOL = "ETH"
REACT_APP_SEPOLIA_DECIMALS = "18"
REACT_APP_INFURA_ENDPOINT = "https://sepolia.infura.io/v3/<API_KEY>"
INFURA_ENDPOINT = "https://sepolia.infura.io/v3/<API_KEY>"
PRIVATE_KEY = "YOUR PRIVATE KEY TO DEPLOY THE CONTRACT"
```

After you have created the `.env` file, uncomment the Sepolia network settings contained in the `hardhat.config.js` file.

Example `hardhat.config.js`:
```bash
module.exports = {
    solidity: "0.8.18",
    networks: {
        hardhat: {},
        sepolia: {
            url: INFURA_ENDPOINT,
            accounts: [PRIVATE_KEY],
        },
    },
};
```

Go to the `web3-utils.js` file in the `./src/web3` folder, comment out the lines related to the Hardhat network and uncomment the lines related to the Sepolia network.

Example `web3-utils.js`:
```bash
/* || FOR HARDHAT NETWORK || */
// const CHAIN_ID = parseInt(process.env.REACT_APP_HARDHAT_CHAIN_ID);
// const CHAIN_ID_HEX = process.env.REACT_APP_HARDHAT_CHAIN_ID_HEX;
// const RPC_ENDPOINT = process.env.REACT_APP_LOCAL_ENDPOINT;
// const NETWORK_NAME = process.env.REACT_APP_HARDHAT_NETWORK_NAME;
// const SYMBOL = process.env.REACT_APP_HARDHAT_SYMBOL;
// const DECIMALS = parseInt(process.env.REACT_APP_HARDHAT_DECIMALS);
/* || FOR HARDHAT NETWORK - END || */

/* || FOR SEPOLIA TEST NETWORK || */
const CHAIN_ID = parseInt(process.env.REACT_APP_SEPOLIA_CHAIN_ID);
const CHAIN_ID_HEX = process.env.REACT_APP_SEPOLIA_CHAIN_ID_HEX;
const RPC_ENDPOINT = process.env.REACT_APP_INFURA_ENDPOINT;
const NETWORK_NAME = process.env.REACT_APP_SEPOLIA_NETWORK_NAME;
const SYMBOL = process.env.REACT_APP_SEPOLIA_SYMBOL;
const DECIMALS = parseInt(process.env.REACT_APP_SEPOLIA_DECIMALS);
/* || FOR SEPOLIA TEST NETWORK - END || */
```

Before deploy the contract, change the `deploy.js` file under the `./scripts` folder, in order to define your guardians and the number of required votes.

Configuration example (`deploy.js`):
```bash
/* || TO DEPLOY WITH ANOTHER SETTINGS (SEPOLIA) */
const smartWalletContract = await smartWalletFabric
    .deploy(
        [[list of guardian addresses]],
        [number of required votes]
    );
|| TO DEPLOY WITH ANOTHER SETTINGS (SEPOLIA) - END */
```

**Note**
Replace `[list of guardian addresses]` and `[number of required votes]` with your guardian addresses and the number of required votes, respectively.

Next, you need to deploy the smart contract in the Sepolia network. To do so, run the following command:

```bash
npx hardhat run ./scripts/deploy.js --network sepolia
```

After you deployed the contract, copy the smart contract address from your console and add it the `.env` file (see `.env.example` file).

Example `.env`:
```bash
# WALLET ADDRESS
REACT_APP_WALLET_CONTRACT_ADDRESS = "YOUR WALLET CONTRACT ADDRESS"
```

**Note**
Go to [Sepolia Etherscan](https://sepolia.etherscan.io/) and search for your contract address to check if the smart contract was deployed successfuly.

Next, run the following command below to start the app and you are ready to go:

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

For more info, read the [Hardhat Documentation](https://hardhat.org/docs).
