import React from "react";
import ethLogo from "../imgs/eth-logo.png";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCopy } from "@fortawesome/free-solid-svg-icons";

function Dashboard() {
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
                                0x1234...AbCd
                                <FontAwesomeIcon
                                    icon={faCopy}
                                    className="icon"
                                />
                            </span>
                        </div>
                        <div>
                            <h3>balance</h3>
                            <span>10.012442 ETH</span>
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
