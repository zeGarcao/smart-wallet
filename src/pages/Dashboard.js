import React from "react";
import ethLogo from "../imgs/eth-logo.png";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCopy } from "@fortawesome/free-solid-svg-icons";
import { WALLET_CONTRACT_ADDRESS, getWalletBalance } from "../web3/web3-utils";

function Dashboard() {
    const [balance, setBalance] = React.useState(0);

    React.useEffect(() => {
        const setup = async () => {
            await updateBalance();
        };

        const updateBalance = async () => {
            const updatedBalance = await getWalletBalance();
            setBalance(updatedBalance);
        };

        setup();
        const balanceJob = setInterval(updateBalance, 10000);

        return () => {
            clearInterval(balanceJob);
        };
    }, []);

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
                    <h3>transfer</h3>
                    <input type="text" placeholder="recipient" />
                    <select>
                        <option value="ETH" selected>
                            ethereum
                        </option>
                        <option value="ETH">ethereum</option>
                        <option value="ETH">ethereum</option>
                    </select>
                    <input type="number" placeholder="amount" />
                    <hr />
                    <button>send</button>
                </div>
            </section>
        </main>
    );
}

export default Dashboard;
