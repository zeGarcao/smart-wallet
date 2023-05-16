import React from "react";
import ethLogo from "../imgs/eth-logo.png";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCopy } from "@fortawesome/free-solid-svg-icons";
import { faRepeat } from "@fortawesome/free-solid-svg-icons";
import {
    WALLET_CONTRACT_ADDRESS,
    getWalletBalance,
    removeOnDepositListener,
    removeOnTransferListener,
    sendTransaction,
    setOnDepositListener,
    setOnTransferListener,
} from "../web3/web3-utils";

function Dashboard({ showLoading, hideLoading }) {
    const [balance, setBalance] = React.useState(0);
    const [tx, setTx] = React.useState({
        recipient: "",
        asset: "ETH",
        amount: "",
    });
    const [isDeposit, setIsDeposit] = React.useState(false);

    React.useEffect(() => {
        const setup = async () => {
            showLoading();
            await updatedBalance();
            setOnDepositListener(updatedBalance);
            setOnTransferListener(updatedBalance);
            hideLoading();
        };

        setup();

        return () => {
            removeOnDepositListener(updatedBalance);
            removeOnTransferListener(updatedBalance);
        };
    }, []);

    React.useEffect(() => {
        setTx(prevTx => {
            return {
                ...prevTx,
                recipient: isDeposit ? WALLET_CONTRACT_ADDRESS : "",
            };
        });
    }, [isDeposit]);

    const copy = () => {
        navigator.clipboard.writeText(WALLET_CONTRACT_ADDRESS);
    };

    const toggleTransferMode = () => {
        setIsDeposit(prevIsDeposit => !prevIsDeposit);
    };

    const updatedBalance = async () => {
        const updatedBalance = await getWalletBalance();
        setBalance(updatedBalance);
    };

    const handleChange = event => {
        const { name, value } = event.target;
        setTx(prevTx => {
            return {
                ...prevTx,
                [name]: value,
            };
        });
    };

    const handleTxSubmit = async () => {
        showLoading();
        const response = await sendTransaction(tx);

        setTx({
            recipient: isDeposit ? WALLET_CONTRACT_ADDRESS : "",
            asset: "ETH",
            amount: "",
        });
        hideLoading();
        if (!response.success) {
            alert(response.error);
            hideLoading();
        }
    };

    return (
        <main>
            <h1>dashboard</h1>
            <section className="wallet">
                <div className="wallet-info">
                    <div className="wallet-info--img">
                        <img src={ethLogo} alt="eth-logo" />
                    </div>
                    <div className="wallet-info--balance">
                        <div>
                            <h3>address</h3>
                            <span>
                                {`${WALLET_CONTRACT_ADDRESS.slice(
                                    0,
                                    6
                                )}...${WALLET_CONTRACT_ADDRESS.slice(
                                    WALLET_CONTRACT_ADDRESS.length - 4
                                )}`}
                                <FontAwesomeIcon
                                    icon={faCopy}
                                    className="icon"
                                    onClick={copy}
                                />
                            </span>
                        </div>
                        <div>
                            <h3>balance</h3>
                            <span>{`${balance} ETH`}</span>
                        </div>
                    </div>
                </div>

                <div className="wallet-transfer">
                    <input
                        type="checkbox"
                        id="isDeposit"
                        name="isDeposit"
                        hidden
                        checked={isDeposit}
                        onChange={toggleTransferMode}
                    />
                    <h3>
                        <span className="wallet-transfer-mode">transfer</span>{" "}
                        <label htmlFor="isDeposit">
                            <FontAwesomeIcon icon={faRepeat} className="icon" />
                        </label>{" "}
                        <span className="wallet-deposit-mode">deposit</span>
                    </h3>
                    <input
                        type="text"
                        placeholder="recipient"
                        id="recipient"
                        name="recipient"
                        value={tx.recipient}
                        onChange={handleChange}
                        disabled={isDeposit}
                    />
                    <select
                        id="asset"
                        name="asset"
                        value={tx.asset}
                        onChange={handleChange}>
                        <option value="ETH">ether</option>
                    </select>
                    <input
                        type="number"
                        placeholder="amount"
                        id="amount"
                        name="amount"
                        value={tx.amount}
                        onChange={handleChange}
                    />
                    <hr />
                    <button onClick={handleTxSubmit}>
                        {isDeposit ? "deposit" : "send"}
                    </button>
                </div>
            </section>
        </main>
    );
}

export default Dashboard;
