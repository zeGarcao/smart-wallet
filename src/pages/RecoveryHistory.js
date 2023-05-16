import React from "react";
import { getRecoveryHistory } from "../web3/web3-utils";

function RecoveryHistory({ showLoading, hideLoading }) {
    const [recoveryHistory, setRecoveryHistory] = React.useState([]);

    React.useEffect(() => {
        const setup = async () => {
            showLoading();
            const recoveryRounds = await getRecoveryHistory();
            setRecoveryHistory(recoveryRounds);
            hideLoading();
        };

        setup();
    }, []);

    const recoveryRoundElms = recoveryHistory.map(round => {
        const voteElms = [];
        Object.keys(round.votes).forEach(guardian => {
            voteElms.push(
                <tr>
                    <td>{`${guardian.slice(0, 6)}...${guardian.slice(
                        guardian.length - 4
                    )}`}</td>
                    <td>{`${round.votes[guardian].slice(0, 6)}...${round.votes[
                        guardian
                    ].slice(round.votes[guardian].length - 4)}`}</td>
                </tr>
            );
        });
        return (
            <div className="recovery-round" key={round.round}>
                <div className="recovery-round--state">
                    <h4 className="recovery-round--round">
                        round {round.round}
                    </h4>
                    <h4>{round.status}</h4>
                </div>

                <div className="recovery-round--date">
                    <div>
                        <p>
                            <strong>start:</strong>{" "}
                            {round.startAt.toLocaleString("en-US", {
                                month: "short",
                                day: "numeric",
                                year: "numeric",
                                hour: "numeric",
                                minute: "2-digit",
                                hour12: true,
                            })}
                        </p>
                        <p className="recovery-round--by">
                            by{" "}
                            {`${round.startBy.slice(
                                0,
                                6
                            )}...${round.startBy.slice(
                                round.startBy.length - 4
                            )}`}
                        </p>
                    </div>
                    <div>
                        <p>
                            <strong>close:</strong>{" "}
                            {round.closeAt.toLocaleString("en-US", {
                                month: "short",
                                day: "numeric",
                                year: "numeric",
                                hour: "numeric",
                                minute: "2-digit",
                                hour12: true,
                            })}
                        </p>
                        <p className="recovery-round--by">
                            by{" "}
                            {`${round.closeBy.slice(
                                0,
                                6
                            )}...${round.closeBy.slice(
                                round.closeBy.length - 4
                            )}`}
                        </p>
                    </div>
                </div>

                <p className="recovery-round--ownership">
                    from{" "}
                    <span>{`${round.oldOwner.slice(
                        0,
                        6
                    )}...${round.oldOwner.slice(
                        round.oldOwner.length - 4
                    )}`}</span>{" "}
                    to{" "}
                    <span>{`${round.newOwner.slice(
                        0,
                        6
                    )}...${round.newOwner.slice(
                        round.newOwner.length - 4
                    )}`}</span>
                </p>

                <hr />

                <input type="checkbox" id={`toggle-round-${round.round}`} />

                <label
                    htmlFor={`toggle-round-${round.round}`}
                    className="recovery-round--votes">
                    votes
                </label>

                <table>
                    <thead>
                        <tr>
                            <th className="recovery-round--guardian-header">
                                guardian
                            </th>
                            <th className="recovery-round--vote-header">
                                vote
                            </th>
                        </tr>
                    </thead>
                    <tbody>{voteElms}</tbody>
                </table>
            </div>
        );
    });

    return (
        <main>
            <h1>recovery history</h1>
            <section className="recovery-history">{recoveryRoundElms}</section>
        </main>
    );
}

export default RecoveryHistory;
