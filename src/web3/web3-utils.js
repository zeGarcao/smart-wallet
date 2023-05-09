import detectEthereumProvider from "@metamask/detect-provider";
import { ethers } from "ethers";
import SmartWalletArtifact from "./SmartWallet.json";

const HARDHAT_CHAIN_ID = 31337;
const HARDHAT_CHAIN_ID_HEX = "0x7a69";
const HARDHAT_NETWORK_NAME = "Hardhat Network";
const HARDHAT_SYMBOL = "ETH";
const HARDHAT_DECIMALS = 18;

const LOCAL_ENDPOINT = "http://127.0.0.1:8545/";

const CHAIN_ID = HARDHAT_CHAIN_ID;
const CHAIN_ID_HEX = HARDHAT_CHAIN_ID_HEX;
const RPC_ENDPOINT = LOCAL_ENDPOINT;
const NETWORK_NAME = HARDHAT_NETWORK_NAME;
const SYMBOL = HARDHAT_SYMBOL;
const DECIMALS = HARDHAT_DECIMALS;
const PROVIDER = new ethers.providers.JsonRpcProvider(RPC_ENDPOINT, CHAIN_ID);

const WALLET_CONTRACT_ADDRESS = "0x5FbDB2315678afecb367f032d93F642f64180aa3";
const WALLET_CONTRACT_ABI = SmartWalletArtifact.abi;
const WALLET_CONTRACT = new ethers.Contract(
    WALLET_CONTRACT_ADDRESS,
    WALLET_CONTRACT_ABI,
    PROVIDER
);

const WALLET_CONNECTION_ERROR = "Unable to connect to wallet contract";
const METAMASK_CONNECTION_ERROR = "Your metamask is not connected";

const connectWallet = async () => {
    const metamask = await detectEthereumProvider();
    let account = undefined;

    if (metamask) {
        try {
            const accounts = await metamask.request({
                method: "eth_requestAccounts",
            });
            account = accounts[0];
        } catch (error) {
            account = undefined;
        }
    }
    return account;
};

const getConnectedAccount = async () => {
    const metamask = await detectEthereumProvider();
    let account = undefined;

    if (metamask) {
        try {
            const accounts = await metamask.request({
                method: "eth_accounts",
            });
            account = accounts[0];
        } catch (error) {
            account = undefined;
        }
    }
    return account;
};

const getChainId = async () => {
    const metamask = await detectEthereumProvider();
    let chainId = undefined;

    if (metamask) {
        try {
            chainId = await metamask.request({ method: "eth_chainId" });
        } catch (error) {
            chainId = undefined;
        }
    }
    return chainId;
};

const setOnAccountsChangedListener = async listener => {
    const metamask = await detectEthereumProvider();

    if (metamask) {
        metamask.on("accountsChanged", listener);
    }
};

const setOnChainChangedListener = async listener => {
    const metamask = await detectEthereumProvider();

    if (metamask) {
        metamask.on("chainChanged", listener);
    }
};

const setOnDepositListener = async listener => {
    WALLET_CONTRACT.on("Deposit", listener);
};

const setOnTransferListener = async listener => {
    WALLET_CONTRACT.on("Transfer", listener);
};

const removeOnDepositListener = async listener => {
    WALLET_CONTRACT.off("Deposit", listener);
};

const removeOnTransferListener = async listener => {
    WALLET_CONTRACT.off("Transfer", listener);
};

const changeChain = async () => {
    const metamask = await detectEthereumProvider();

    if (metamask) {
        try {
            await metamask.request({
                method: "wallet_switchEthereumChain",
                params: [{ chainId: CHAIN_ID_HEX }],
            });
        } catch (switchError) {
            if (switchError.code === 4902) {
                try {
                    await metamask.request({
                        method: "wallet_addEthereumChain",
                        params: [
                            {
                                chainName: NETWORK_NAME,
                                chainId: CHAIN_ID_HEX,
                                rpcUrls: [RPC_ENDPOINT],
                                symbol: SYMBOL,
                                decimals: DECIMALS,
                            },
                        ],
                    });
                } catch (addError) {
                    console.log(addError);
                }
            }
        }
    }
};

const getWalletBalance = async () => {
    const rawBalance = await WALLET_CONTRACT.getBalance();
    const balance = ethers.utils.formatEther(rawBalance.toString());
    return balance;
};

const sendTransaction = async txInfo => {
    const wallet = await getWallet();
    const response = { success: false, error: WALLET_CONNECTION_ERROR };

    if (wallet) {
        try {
            const recipient = txInfo.recipient;
            const amount = ethers.utils.parseEther(txInfo.amount);
            const tx =
                recipient == WALLET_CONTRACT_ADDRESS
                    ? await wallet.deposit({ value: amount })
                    : await wallet.transferTo(recipient, amount);
            await tx.wait();

            response.success = true;
            response.error = "";
        } catch (error) {
            const stringifyError = JSON.stringify(error);
            const objectError = JSON.parse(stringifyError);
            const reason = objectError.reason;

            response.error =
                reason == "unknown account #0"
                    ? METAMASK_CONNECTION_ERROR
                    : objectError.reason;
        }
    }

    return response;
};

const getWallet = async () => {
    let wallet = undefined;
    const metamask = await detectEthereumProvider();

    if (metamask) {
        const metamaskProvider = new ethers.providers.Web3Provider(metamask);
        const signer = metamaskProvider.getSigner();
        if (signer) {
            wallet = new ethers.Contract(
                WALLET_CONTRACT_ADDRESS,
                WALLET_CONTRACT_ABI,
                signer
            );
        }
    }
    return wallet;
};

export {
    WALLET_CONTRACT_ADDRESS,
    CHAIN_ID_HEX,
    connectWallet,
    getConnectedAccount,
    getChainId,
    changeChain,
    setOnAccountsChangedListener,
    setOnChainChangedListener,
    setOnDepositListener,
    setOnTransferListener,
    removeOnTransferListener,
    removeOnDepositListener,
    getWalletBalance,
    sendTransaction,
};
