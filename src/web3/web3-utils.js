import detectEthereumProvider from "@metamask/detect-provider";
import { ethers } from "ethers";
import SmartWalletArtifact from "./SmartWallet.json";

/* || FOR HARDHAT NETWORK || */
const CHAIN_ID = parseInt(process.env.REACT_APP_HARDHAT_CHAIN_ID);
const CHAIN_ID_HEX = process.env.REACT_APP_HARDHAT_CHAIN_ID_HEX;
const RPC_ENDPOINT = process.env.REACT_APP_LOCAL_ENDPOINT;
const NETWORK_NAME = process.env.REACT_APP_HARDHAT_NETWORK_NAME;
const SYMBOL = process.env.REACT_APP_HARDHAT_SYMBOL;
const DECIMALS = parseInt(process.env.REACT_APP_HARDHAT_DECIMALS);

/* || FOR SEPOLIA TEST NETWORK || */
// const CHAIN_ID = parseInt(process.env.REACT_APP_SEPOLIA_CHAIN_ID);
// const CHAIN_ID_HEX = process.env.REACT_APP_SEPOLIA_CHAIN_ID_HEX;
// const RPC_ENDPOINT = process.env.REACT_APP_INFURA_ENDPOINT;
// const NETWORK_NAME = process.env.REACT_APP_SEPOLIA_NETWORK_NAME;
// const SYMBOL = process.env.REACT_APP_SEPOLIA_SYMBOL;
// const DECIMALS = parseInt(process.env.REACT_APP_SEPOLIA_DECIMALS);

const PROVIDER = new ethers.providers.JsonRpcProvider(RPC_ENDPOINT, CHAIN_ID);

const WALLET_CONTRACT_ADDRESS = process.env.REACT_APP_WALLET_CONTRACT_ADDRESS;
const WALLET_CONTRACT_ABI = SmartWalletArtifact.abi;
const WALLET_CONTRACT = new ethers.Contract(
    WALLET_CONTRACT_ADDRESS,
    WALLET_CONTRACT_ABI,
    PROVIDER
);

const WALLET_CONNECTION_ERROR = "Unable to connect to wallet contract";
const METAMASK_CONNECTION_ERROR = "Your metamask is not connected";
const USER_REJECTION = "User rejected transaction";

const NULL_ADDRESS = "0x0000000000000000000000000000000000000000";

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

            response.success = false;
            response.error =
                reason == "unknown account #0"
                    ? METAMASK_CONNECTION_ERROR
                    : reason == "user rejected transaction"
                    ? USER_REJECTION
                    : reason.match(/'([^']+)'/)[1];
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

const getTxEvents = async () => {
    const rawTransferEvents = await WALLET_CONTRACT.queryFilter("Transfer");
    const rawDepositEvents = await WALLET_CONTRACT.queryFilter("Deposit");
    const txEvents = await Promise.all(
        [...rawTransferEvents, ...rawDepositEvents].map(async event => {
            const id = event.transactionHash;
            const operation = event.event == "Deposit" ? "receive" : "sent";
            const addr =
                event.event == "Deposit" ? event.args.from : event.args.to;
            const amount = ethers.utils.formatEther(event.args.amount);
            const txBlock = await PROVIDER.getBlock(event.blockHash);
            const timestamp = new Date(txBlock.timestamp * 1000);

            return {
                id: id,
                operation: operation,
                addr: addr,
                amount: amount,
                timestamp: timestamp,
            };
        })
    );
    txEvents.sort((tx1, tx2) => tx2.timestamp - tx1.timestamp);
    return txEvents;
};

const isPaused = async () => {
    return await WALLET_CONTRACT.isPaused();
};

const pauseTransfers = async () => {
    const wallet = await getWallet();
    const response = { success: false, error: WALLET_CONNECTION_ERROR };

    if (wallet) {
        try {
            const tx = await wallet.pauseTransfers();
            await tx.wait();

            response.success = true;
            response.error = "";
        } catch (error) {
            const stringifyError = JSON.stringify(error);
            const objectError = JSON.parse(stringifyError);
            const reason = objectError.reason;
            console.log(reason);
            response.success = false;
            response.error =
                reason == "unknown account #0"
                    ? METAMASK_CONNECTION_ERROR
                    : reason == "user rejected transaction"
                    ? USER_REJECTION
                    : reason.match(/'([^']+)'/)[1];
        }
    }
    return response;
};

const resumeTransfers = async () => {
    const wallet = await getWallet();
    const response = { success: false, error: WALLET_CONNECTION_ERROR };

    if (wallet) {
        try {
            const tx = await wallet.resumeTransfers();
            await tx.wait();

            response.success = true;
            response.error = "";
        } catch (error) {
            const stringifyError = JSON.stringify(error);
            const objectError = JSON.parse(stringifyError);
            const reason = objectError.reason;

            response.success = false;
            response.error =
                reason == "unknown account #0"
                    ? METAMASK_CONNECTION_ERROR
                    : reason == "user rejected transaction"
                    ? USER_REJECTION
                    : reason.match(/'([^']+)'/)[1];
        }
    }
    return response;
};

const getGuardians = async () => {
    return await WALLET_CONTRACT.getGuardians();
};

const addGuardian = async guardian => {
    const wallet = await getWallet();
    const response = { success: false, error: WALLET_CONNECTION_ERROR };

    if (wallet) {
        try {
            if (ethers.utils.isAddress(guardian)) {
                const tx = await wallet.addGuardian(guardian);
                await tx.wait();

                response.success = true;
                response.error = "";
            } else {
                response.success = false;
                response.error = "invalid address";
            }
        } catch (error) {
            const stringifyError = JSON.stringify(error);
            const objectError = JSON.parse(stringifyError);
            const reason = objectError.reason;

            response.success = false;
            response.error =
                reason == "unknown account #0"
                    ? METAMASK_CONNECTION_ERROR
                    : reason == "user rejected transaction"
                    ? USER_REJECTION
                    : reason.match(/'([^']+)'/)[1];
        }
    }
    return response;
};

const removeGuardian = async guardian => {
    const wallet = await getWallet();
    const response = { success: false, error: WALLET_CONNECTION_ERROR };
    console.log(guardian);
    if (wallet) {
        try {
            const tx = await wallet.removeGuardian(guardian);
            await tx.wait();

            response.success = true;
            response.error = "";
        } catch (error) {
            const stringifyError = JSON.stringify(error);
            const objectError = JSON.parse(stringifyError);
            const reason = objectError.reason;

            response.success = false;
            response.error =
                reason == "unknown account #0"
                    ? METAMASK_CONNECTION_ERROR
                    : reason == "user rejected transaction"
                    ? USER_REJECTION
                    : reason.match(/'([^']+)'/)[1];
        }
    }
    return response;
};

const inRecovery = async () => {
    return await WALLET_CONTRACT.inRecovery();
};

const triggerRecovery = async candidate => {
    const wallet = await getWallet();
    const response = { success: false, error: WALLET_CONNECTION_ERROR };

    if (wallet) {
        try {
            if (ethers.utils.isAddress(candidate)) {
                const tx = await wallet.triggerRecovery(candidate);
                await tx.wait();

                response.success = true;
                response.error = "";
            } else {
                response.success = false;
                response.error = "invalid address";
            }
        } catch (error) {
            const stringifyError = JSON.stringify(error);
            const objectError = JSON.parse(stringifyError);
            const reason = objectError.reason;

            response.success = false;
            response.error =
                reason == "unknown account #0"
                    ? METAMASK_CONNECTION_ERROR
                    : reason == "user rejected transaction"
                    ? USER_REJECTION
                    : reason.match(/'([^']+)'/)[1];
        }
    }
    return response;
};

const requiredVotes = async () => {
    return ethers.utils.formatUnits(await WALLET_CONTRACT.requiredVotes(), 0);
};

const setRequiredVotes = async newRequiredVotes => {
    const wallet = await getWallet();
    const response = { success: false, error: WALLET_CONNECTION_ERROR };

    if (wallet) {
        try {
            const tx = await wallet.setRequiredVotes(newRequiredVotes);
            await tx.wait();

            response.success = true;
            response.error = "";
        } catch (error) {
            const stringifyError = JSON.stringify(error);
            const objectError = JSON.parse(stringifyError);
            const reason = objectError.reason;

            response.success = false;
            response.error =
                reason == "unknown account #0"
                    ? METAMASK_CONNECTION_ERROR
                    : reason == "user rejected transaction"
                    ? USER_REJECTION
                    : reason.match(/'([^']+)'/)[1];
        }
    }
    return response;
};

const currentRecoveryRound = async () => {
    return ethers.utils.formatUnits(
        await WALLET_CONTRACT.currentRecoveryRound(),
        0
    );
};

const getRecoveryRoundVotes = async () => {
    const votes = [];
    const guardians = await getGuardians();
    const recoveryRound = await currentRecoveryRound();
    for (const guardian of guardians) {
        const recovery = await WALLET_CONTRACT.guardianToRecovery(guardian);
        const round = ethers.utils.formatUnits(recovery.recoveryRound, 0);
        const vote = {
            guardian: guardian,
            candidate:
                round == recoveryRound ? recovery.candidate : NULL_ADDRESS,
        };
        votes.push(vote);
    }

    return votes;
};

const supportRecovery = async candidate => {
    const wallet = await getWallet();
    const response = { success: false, error: WALLET_CONNECTION_ERROR };

    if (wallet) {
        try {
            if (ethers.utils.isAddress(candidate)) {
                const tx = await wallet.supportRecovery(candidate);
                await tx.wait();

                response.success = true;
                response.error = "";
            } else {
                response.success = false;
                response.error = "invalid address";
            }
        } catch (error) {
            const stringifyError = JSON.stringify(error);
            const objectError = JSON.parse(stringifyError);
            const reason = objectError.reason;

            response.success = false;
            response.error =
                reason == "unknown account #0"
                    ? METAMASK_CONNECTION_ERROR
                    : reason == "user rejected transaction"
                    ? USER_REJECTION
                    : reason.match(/'([^']+)'/)[1];
        }
    }
    return response;
};

const executeRecovery = async (newOwner, guardians) => {
    const wallet = await getWallet();
    const response = { success: false, error: WALLET_CONNECTION_ERROR };

    if (wallet) {
        try {
            if (ethers.utils.isAddress(newOwner)) {
                const tx = await wallet.executeRecovery(newOwner, guardians);
                await tx.wait();

                response.success = true;
                response.error = "";
            } else {
                response.success = false;
                response.error = "invalid address";
            }
        } catch (error) {
            const stringifyError = JSON.stringify(error);
            const objectError = JSON.parse(stringifyError);
            const reason = objectError.reason;

            response.success = false;
            response.error =
                reason == "unknown account #0"
                    ? METAMASK_CONNECTION_ERROR
                    : reason == "user rejected transaction"
                    ? USER_REJECTION
                    : reason.match(/'([^']+)'/)[1];
        }
    }
    return response;
};

const cancelRecovery = async () => {
    const wallet = await getWallet();
    const response = { success: false, error: WALLET_CONNECTION_ERROR };

    if (wallet) {
        try {
            const tx = await wallet.cancelRecovery();
            await tx.wait();

            response.success = true;
            response.error = "";
        } catch (error) {
            const stringifyError = JSON.stringify(error);
            const objectError = JSON.parse(stringifyError);
            const reason = objectError.reason;

            response.success = false;
            response.error =
                reason == "unknown account #0"
                    ? METAMASK_CONNECTION_ERROR
                    : reason == "user rejected transaction"
                    ? USER_REJECTION
                    : reason.match(/'([^']+)'/)[1];
        }
    }
    return response;
};

const getRecoveryHistory = async () => {
    const currentRound = await currentRecoveryRound();
    const recoveryHistory = [];

    for (let round = currentRound; round > 0; --round) {
        const recoveryRound = {
            round: round,
            status: "",
            startAt: "",
            startBy: "",
            closeAt: "",
            closeBy: "",
            oldOwner: "",
            newOwner: "",
            votes: {},
        };

        const trigger = await WALLET_CONTRACT.queryFilter(
            WALLET_CONTRACT.filters.RecoveryInitiated(round)
        );
        const execute = await WALLET_CONTRACT.queryFilter(
            WALLET_CONTRACT.filters.RecoveryExecuted(round)
        );
        const cancel = await WALLET_CONTRACT.queryFilter(
            WALLET_CONTRACT.filters.RecoveryCancelled(round)
        );
        const supports = await WALLET_CONTRACT.queryFilter(
            WALLET_CONTRACT.filters.RecoverySupported(round)
        );

        recoveryRound.status =
            execute.length > 0
                ? "closed"
                : cancel.length > 0
                ? "cancelled"
                : "active";

        const triggerBlock = await PROVIDER.getBlock(trigger[0].blockNumber);
        recoveryRound.startAt = new Date(triggerBlock.timestamp * 1000);
        recoveryRound.startBy = trigger[0].args.by;

        const closeBlockNumber =
            execute.length > 0
                ? execute[0].blockNumber
                : cancel.length > 0
                ? cancel[0].blockNumber
                : -1;
        if (closeBlockNumber != -1) {
            const closeBlock = await PROVIDER.getBlock(closeBlockNumber);
            recoveryRound.closeAt = new Date(closeBlock.timestamp * 1000);
            recoveryRound.closeBy =
                execute.length > 0
                    ? execute[0].args.by
                    : await WALLET_CONTRACT.owner();
        }

        recoveryRound.oldOwner =
            execute.length > 0 ? execute[0].args.oldOwner : "";
        recoveryRound.newOwner =
            execute.length > 0 ? execute[0].args.newOwner : "";

        recoveryRound.votes[trigger[0].args.by] = trigger[0].args.candidate;
        const voteTimestamps = { [trigger[0].args.by]: triggerBlock.timestamp };

        for (const support of supports) {
            const { by, candidate } = support.args;
            const voteBlock = await PROVIDER.getBlock(trigger[0].blockNumber);
            const voteTimestamp = voteBlock.timestamp;

            if (!(by in recoveryRound.votes)) {
                recoveryRound.votes[by] = candidate;
                voteTimestamps[by] = voteTimestamp;
                continue;
            }

            if (voteTimestamp > voteTimestamps[by]) {
                recoveryRound.votes[by] = candidate;
            }
        }
        recoveryHistory.push(recoveryRound);
    }

    return recoveryHistory;
};

export {
    WALLET_CONTRACT_ADDRESS,
    CHAIN_ID_HEX,
    NULL_ADDRESS,
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
    getTxEvents,
    isPaused,
    pauseTransfers,
    resumeTransfers,
    getGuardians,
    addGuardian,
    removeGuardian,
    inRecovery,
    triggerRecovery,
    requiredVotes,
    setRequiredVotes,
    currentRecoveryRound,
    getRecoveryRoundVotes,
    supportRecovery,
    executeRecovery,
    cancelRecovery,
    getRecoveryHistory,
};
