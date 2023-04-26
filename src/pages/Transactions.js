import React from "react";

function Transactions() {
    return (
        <main>
            <h1>transactions</h1>
            <section className="txs">
                <div className="tx">
                    <div className="tx-data">
                        <span className="tx-op">sent</span>
                        <span className="tx-amount">-0.01 ETH</span>
                    </div>
                    <span className="tx-date">Dec 24, 2022 - 6:00 PM</span>
                </div>

                <div className="tx">
                    <div className="tx-data">
                        <span className="tx-op">sent</span>
                        <span className="tx-amount">-0.01 ETH</span>
                    </div>
                    <span className="tx-date">Dec 24, 2022 - 6:00 PM</span>
                </div>

                <div className="tx">
                    <div className="tx-data">
                        <span className="tx-op">sent</span>
                        <span className="tx-amount">-0.01 ETH</span>
                    </div>
                    <span className="tx-date">Dec 24, 2022 - 6:00 PM</span>
                </div>
            </section>
        </main>
    );
}

export default Transactions;
