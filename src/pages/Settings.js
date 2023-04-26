import React from "react";
import { Link } from "react-router-dom";

function Settings() {
    return (
        <main>
            <h1>settings</h1>
            <section className="settings">
                <div className="settings-section settings-wallet">
                    <h3>wallet</h3>
                    <button>pause transfers</button>
                </div>
                <div className="settings-section settings-guardians">
                    <h3>guardians</h3>

                    <div className="settings-guardians--guardian">
                        <span>0x1234...abcd</span>
                        <button>remove</button>
                    </div>
                    <div className="settings-guardians--guardian">
                        <span>0x1234...abcd</span>
                        <button>remove</button>
                    </div>
                    <div className="settings-guardians--guardian">
                        <span>0x1234...abcd</span>
                        <button>remove</button>
                    </div>
                    <div className="settings-guardians--add">
                        <input type="text" placeholder="guardian address" />
                        <button>add</button>
                    </div>
                </div>
                <div className="settings-section settings-recovery">
                    <h3>recovery</h3>

                    <div className="settings-recovery--trigger">
                        <span>recovery mode</span>
                        <button>trigger</button>
                    </div>

                    <div className="settings-recovery--confirmations">
                        <span>confirmations</span>

                        <div>
                            <select>
                                <option value="1">1</option>
                                <option value="2" selected>
                                    2
                                </option>
                                <option value="3">3</option>
                            </select>
                            <button>confirm</button>
                        </div>
                    </div>

                    <button>view history</button>
                </div>
            </section>
        </main>
    );
}

export default Settings;
