import React from "react";
import { Link } from "react-router-dom";

function Settings() {
    return (
        <div>
            Settings <br />
            <Link to="/recovery-stats">recovery stats</Link>
            <br />
            <Link to="/recovery-history">recovery history</Link>
            <br />
        </div>
    );
}

export default Settings;
