import React from "react";
import {
    NULL_ADDRESS,
    cancelRecovery,
    currentRecoveryRound,
    executeRecovery,
    getGuardians,
    getRecoveryRoundVotes,
    inRecovery,
    supportRecovery,
} from "../web3/web3-utils";

function RecoveryStats({ showLoading, hideLoading }) {
    const [recoveryRound, setRecoveryRound] = React.useState(0);
    const [votes, setVotes] = React.useState([]);
    const [candidate, setCandidate] = React.useState("");
    const [executeRecoveryForm, setExecuteRecoveryForm] = React.useState({
        newOwner: "",
    });

    React.useEffect(() => {
        const setup = async () => {
            const isRecoveryActive = await inRecovery();
            if (isRecoveryActive) {
                showLoading();
                const recoveryRoundVal = await currentRecoveryRound();
                setRecoveryRound(recoveryRoundVal);
                const guardians = await getGuardians();

                for (const guardian of guardians) {
                    setExecuteRecoveryForm(prevExecuteRecoveryForm => {
                        return {
                            ...prevExecuteRecoveryForm,
                            [guardian]: false,
                        };
                    });
                }
                await updateVotes();
                hideLoading();
            } else {
                window.location.replace("/");
            }
        };

        setup();
    }, []);

    const updateVotes = async () => {
        const currentVotes = await getRecoveryRoundVotes();
        setVotes(currentVotes);
    };

    const handleCandidateChange = event => {
        setCandidate(event.target.value);
    };

    const handleExecuteRecoveryFormChange = event => {
        const { name, value, type, checked } = event.target;
        setExecuteRecoveryForm(prevExecuteRecoveryForm => {
            return {
                ...prevExecuteRecoveryForm,
                [name]: type === "checkbox" ? checked : value,
            };
        });
    };

    const handleVote = async () => {
        showLoading();
        const response = await supportRecovery(candidate);
        await updateVotes();
        setCandidate("");
        hideLoading();
        if (response.error) {
            alert(response.error);
        }
    };

    const handleRevoke = async () => {
        showLoading();
        const response = await supportRecovery(NULL_ADDRESS);
        await updateVotes();
        hideLoading();
        if (response.error) {
            alert(response.error);
        }
    };

    const handleExecuteRecovery = async () => {
        showLoading();
        const guardianList = Object.keys(executeRecoveryForm)
            .slice(1)
            .filter(guardian => executeRecoveryForm[guardian]);
        const response = await executeRecovery(
            executeRecoveryForm.newOwner,
            guardianList
        );
        setExecuteRecoveryForm(prevExecuteRecoveryForm => {
            return { ...prevExecuteRecoveryForm, newOwner: "" };
        });
        for (const guardian of guardianList) {
            setExecuteRecoveryForm(prevExecuteRecoveryForm => {
                return {
                    ...prevExecuteRecoveryForm,
                    [guardian]: false,
                };
            });
        }
        hideLoading();
        if (response.error) {
            alert(response.error);
        } else {
            window.location.replace("/");
        }
    };

    const handleCancelRound = async () => {
        showLoading();
        const response = await cancelRecovery();
        hideLoading();
        if (response.error) {
            alert(response.error);
        } else {
            window.location.replace("/");
        }
    };

    const votesElms = votes.map(vote => {
        const { guardian, candidate } = vote;
        return (
            <tr key={guardian}>
                <td>{`${guardian.slice(0, 6)}...${guardian.slice(
                    guardian.length - 4
                )}`}</td>
                <td>{`${candidate.slice(0, 6)}...${candidate.slice(
                    candidate.length - 4
                )}`}</td>
            </tr>
        );
    });

    const guardianElms = votes.map(vote => {
        const { guardian } = vote;
        return (
            <label htmlFor={guardian} key={guardian}>
                {`${guardian.slice(0, 6)}...${guardian.slice(
                    guardian.length - 4
                )}`}
                <input
                    id={guardian}
                    className="checkbox"
                    type="checkbox"
                    name={guardian}
                    onChange={handleExecuteRecoveryFormChange}
                    checked={executeRecoveryForm[guardian]}
                />
            </label>
        );
    });

    return (
        <main>
            <h1>recovery - round {recoveryRound}</h1>
            <section className="recovery">
                <div className="recovery-section recovery-result">
                    <h3>result</h3>
                    <table>
                        <thead>
                            <tr>
                                <th className="recovery-result--guardian-header">
                                    guardian
                                </th>
                                <th className="recovery-result--vote-header">
                                    vote
                                </th>
                            </tr>
                        </thead>
                        <tbody>{votesElms}</tbody>
                    </table>
                </div>

                <div className="recovery-section recovery-vote">
                    <h3>vote</h3>
                    <div className="recovery-vote--candidate">
                        <input
                            type="text"
                            placeholder="candidate address"
                            value={candidate}
                            onChange={handleCandidateChange}
                        />
                        <button onClick={handleVote}>vote</button>
                    </div>
                    <button onClick={handleRevoke}>revoke</button>
                </div>

                <div className="recovery-section recovery-execute">
                    <h3>execute</h3>
                    <div className="recovery-execute--execute">
                        <span>select new owner</span>
                        <input
                            type="text"
                            placeholder="address of new owner"
                            name="newOwner"
                            value={executeRecoveryForm.newOwner}
                            onChange={handleExecuteRecoveryFormChange}
                        />
                        <span>select list of guardians</span>
                        {guardianElms}
                        <hr />
                        <button onClick={handleExecuteRecovery}>execute</button>
                    </div>
                    <button onClick={handleCancelRound}>cancel round</button>
                </div>
            </section>
        </main>
    );
}

export default RecoveryStats;
