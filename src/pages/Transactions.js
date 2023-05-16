import React from "react";
import { getTxEvents } from "../web3/web3-utils";

function Transactions({ showLoading, hideLoading }) {
    const [txEvents, setTxEvents] = React.useState([]);

    React.useEffect(() => {
        const setup = async () => {
            showLoading();
            const allTxEvents = await getTxEvents();
            setTxEvents(allTxEvents);
            hideLoading();
        };
        setup();
    }, []);

    const txEventsElms = txEvents.map(event => {
        const date = event.timestamp.toLocaleString("en-US", {
            month: "short",
            day: "numeric",
            year: "numeric",
            hour: "numeric",
            minute: "2-digit",
            hour12: true,
        });
        return (
            <div className="tx" key={event.id}>
                <div className="tx-data">
                    <span>{event.operation}</span>
                    <span>{`${event.amount} eth`}</span>
                </div>
                <div className="tx-info">
                    <span>{`${
                        event.operation == "receive" ? "from" : "to"
                    } ${event.addr.slice(0, 6)}...${event.addr.slice(
                        event.addr.length - 4
                    )}`}</span>
                    <span>{date}</span>
                </div>
            </div>
        );
    });

    return (
        <main>
            <h1>transactions</h1>
            <section className="txs">{txEventsElms}</section>
        </main>
    );
}

export default Transactions;
