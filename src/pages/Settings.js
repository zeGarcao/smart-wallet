import React from "react";
import { Link } from "react-router-dom";
import {
    addGuardian,
    getGuardians,
    isPaused,
    pauseTransfers,
    removeGuardian,
    resumeTransfers,
    triggerRecovery,
    inRecovery,
    requiredVotes,
    setRequiredVotes,
} from "../web3/web3-utils";

function Settings({ showLoading, hideLoading }) {
    const [isTransfersPaused, setIsTransfersPaused] = React.useState(false);
    const [guardians, setGuardians] = React.useState([]);
    const [guardian, setGuardian] = React.useState("");
    const [isInRecovery, setIsInRecovery] = React.useState(false);
    const [candidate, setCandidate] = React.useState("");
    const [requiredConfirmations, setRequiredConfirmations] = React.useState(1);

    React.useEffect(() => {
        const setup = async () => {
            showLoading();
            await updateIsTransfersPaused();
            await updateGuardians();
            await updateInRecovery();
            await updateRequiredConfirmations();
            hideLoading();
        };

        setup();
    }, []);

    const updateIsTransfersPaused = async () => {
        const transfersState = await isPaused();
        setIsTransfersPaused(transfersState);
    };

    const updateGuardians = async () => {
        const currentGuardians = await getGuardians();
        setGuardians(currentGuardians);
    };

    const updateInRecovery = async () => {
        const recoveryMode = await inRecovery();
        setIsInRecovery(recoveryMode);
    };

    const updateRequiredConfirmations = async () => {
        const currentRequiredVotes = await requiredVotes();
        setRequiredConfirmations(currentRequiredVotes);
    };

    const handleGuardianChange = event => {
        setGuardian(event.target.value);
    };

    const handleCandidateChange = event => {
        setCandidate(event.target.value);
    };

    const handleRequiredConfirmationsChange = event => {
        setRequiredConfirmations(event.target.value);
    };

    const handlePauseTransfers = async () => {
        showLoading();
        const response = isTransfersPaused
            ? await resumeTransfers()
            : await pauseTransfers();
        await updateIsTransfersPaused();
        hideLoading();
        if (response.error) {
            alert(response.error);
        }
    };

    const handleAddGuardian = async () => {
        showLoading();
        const response = await addGuardian(guardian);
        setGuardian("");
        await updateGuardians();
        hideLoading();
        if (response.error) {
            alert(response.error);
        }
    };

    const handleRemoveGuardian = async guardian => {
        showLoading();
        const response = await removeGuardian(guardian);
        await updateGuardians();
        hideLoading();
        if (response.error) {
            alert(response.error);
        }
    };

    const handleTriggerRecovery = async () => {
        showLoading();
        const response = await triggerRecovery(candidate);
        await updateInRecovery();
        setCandidate("");
        hideLoading();
        if (response.error) {
            alert(response.error);
        }
    };

    const handleRequiredConfirmations = async () => {
        showLoading();
        const response = await setRequiredVotes(requiredConfirmations);
        await updateRequiredConfirmations();
        hideLoading();
        if (response.error) {
            alert(response.error);
        }
    };

    const guardianElms = guardians.map(guardian => {
        return (
            <div className="settings-guardians--guardian" key={guardian}>
                <span>{`${guardian.slice(0, 6)}...${guardian.slice(
                    guardian.length - 4
                )}`}</span>
                <button onClick={() => handleRemoveGuardian(guardian)}>
                    remove
                </button>
            </div>
        );
    });

    const requiredVotesElms = () => {
        const elms = [];
        for (let i = 0; i < guardians.length; ++i) {
            elms.push(
                <option value={i + 1} key={i + 1}>
                    {i + 1}
                </option>
            );
        }
        return elms;
    };

    return (
        <main>
            <h1>settings</h1>
            <section className="settings">
                <div className="settings-section settings-wallet">
                    <h3>wallet</h3>
                    <button onClick={handlePauseTransfers}>
                        {isTransfersPaused ? "resume" : "pause"} transfers
                    </button>
                </div>

                <div className="settings-section settings-guardians">
                    <h3>guardians</h3>

                    {guardianElms}

                    <div className="settings-guardians--add">
                        <input
                            type="text"
                            placeholder="guardian address"
                            value={guardian}
                            onChange={handleGuardianChange}
                        />
                        <button onClick={handleAddGuardian}>add</button>
                    </div>
                </div>

                <div className="settings-section settings-recovery">
                    <h3>recovery</h3>

                    <div className="settings-recovery--trigger">
                        <span>recovery mode</span>
                        <div className="settings-recovery--trigger-inputs">
                            {!isInRecovery && (
                                <input
                                    type="text"
                                    placeholder="candidate address"
                                    value={candidate}
                                    onChange={handleCandidateChange}
                                />
                            )}
                            <button
                                onClick={
                                    isInRecovery
                                        ? () => {}
                                        : handleTriggerRecovery
                                }>
                                {isInRecovery ? (
                                    <Link to="/recovery-stats">stats</Link>
                                ) : (
                                    "trigger"
                                )}
                            </button>
                        </div>
                    </div>

                    <div className="settings-recovery--confirmations">
                        <span>confirmations</span>

                        <div>
                            <select
                                value={requiredConfirmations}
                                onChange={handleRequiredConfirmationsChange}>
                                {requiredVotesElms()}
                            </select>
                            <button onClick={handleRequiredConfirmations}>
                                confirm
                            </button>
                        </div>
                    </div>

                    <button className="settings-recovery--history">
                        <Link to="/recovery-history">view history</Link>
                    </button>
                </div>
            </section>
        </main>
    );
}

export default Settings;
