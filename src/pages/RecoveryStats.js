import React from "react";

function RecoveryStats() {
    return (
        <main>
            <h1>recovery - round n</h1>
            <section className="recovery">
                <div className="recovery-section recovery-result">
                    <h3>result</h3>
                    <table>
                        <thead>
                            <th className="recovery-result--guardian-header">
                                guardian
                            </th>
                            <th className="recovery-result--vote-header">
                                vote
                            </th>
                        </thead>
                        <tbody>
                            <tr>
                                <td>0x1234...abcd</td>
                                <td>0x1234...abcd</td>
                            </tr>
                            <tr>
                                <td>0x1234...abcd</td>
                                <td>0x1234...abcd</td>
                            </tr>
                            <tr>
                                <td>0x1234...abcd</td>
                                <td>0x1234...abcd</td>
                            </tr>
                        </tbody>
                    </table>
                </div>
                <div className="recovery-section recovery-vote">
                    <h3>vote</h3>
                    <div className="recovery-vote--candidate">
                        <input type="text" placeholder="candidate address" />
                        <button>vote</button>
                    </div>
                    <button>revoke</button>
                </div>
                <div className="recovery-section recovery-execute">
                    <h3>execute</h3>
                    <div className="recovery-execute--execute">
                        <span>select new owner</span>
                        <input type="text" placeholder="address of new owner" />
                        <span>select list of guardians</span>
                        <label htmlFor="1">
                            0x1234...abcd
                            <input
                                id="1"
                                className="checkbox"
                                type="checkbox"
                            />
                        </label>
                        <label htmlFor="2">
                            0x1234...abcd
                            <input
                                id="2"
                                className="checkbox"
                                type="checkbox"
                            />
                        </label>
                        <label htmlFor="3">
                            0x1234...abcd
                            <input
                                id="3"
                                className="checkbox"
                                type="checkbox"
                            />
                        </label>
                        <hr />
                        <button>execute</button>
                    </div>
                    <button>cancel round</button>
                </div>
            </section>
        </main>
    );
}

export default RecoveryStats;
