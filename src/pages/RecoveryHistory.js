import React from "react";

function RecoveryHistory() {
    return (
        <main>
            <h1>recovery history</h1>
            <section className="recovery-history">
                <div className="recovery-round round-1">
                    <div className="recovery-round--state">
                        <h4 className="recovery-round--round">round 1</h4>
                        <h4>close</h4>
                    </div>
                    <div className="recovery-round--date">
                        <div>
                            <p>
                                <strong>start:</strong> dec 23, 2023 - 4pm
                            </p>
                            <p className="recovery-round--by">
                                by 0x1234...abcd
                            </p>
                        </div>
                        <div>
                            <p>
                                <strong>close:</strong> dec 23, 2023 - 4pm
                            </p>
                            <p className="recovery-round--by">
                                by 0x1234...abcd
                            </p>
                        </div>
                    </div>
                    <p className="recovery-round--ownership">
                        from <span>0x1234...abcd</span> to{" "}
                        <span>0x1234...abcd</span>
                    </p>
                    <hr />
                    <input type="checkbox" id="toggle" />
                    <label htmlFor="toggle" className="recovery-round--votes">
                        votes
                    </label>
                    <table>
                        <thead>
                            <th className="recovery-round--guardian-header">
                                guardian
                            </th>
                            <th className="recovery-round--vote-header">
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

                <div className="recovery-round round-1">
                    <div className="recovery-round--state">
                        <h4 className="recovery-round--round">round 1</h4>
                        <h4>close</h4>
                    </div>
                    <div className="recovery-round--date">
                        <div>
                            <p>
                                <strong>start:</strong> dec 23, 2023 - 4pm
                            </p>
                            <p className="recovery-round--by">
                                by 0x1234...abcd
                            </p>
                        </div>
                        <div>
                            <p>
                                <strong>close:</strong> dec 23, 2023 - 4pm
                            </p>
                            <p className="recovery-round--by">
                                by 0x1234...abcd
                            </p>
                        </div>
                    </div>
                    <p className="recovery-round--ownership">
                        from <span>0x1234...abcd</span> to{" "}
                        <span>0x1234...abcd</span>
                    </p>
                    <hr />
                    <input type="checkbox" id="toggle-2" />
                    <label htmlFor="toggle-2" className="recovery-round--votes">
                        votes
                    </label>
                    <table>
                        <thead>
                            <th className="recovery-round--guardian-header">
                                guardian
                            </th>
                            <th className="recovery-round--vote-header">
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
            </section>
        </main>
    );
}

export default RecoveryHistory;
