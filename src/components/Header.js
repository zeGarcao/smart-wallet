import React from "react";
import { Link } from "react-router-dom";

function Header() {
    return (
        <div>
            <Link to="/">dashboard</Link>
            <br />
            <Link to="/transactions">transactions</Link>
            <br />
            <Link to="/settings">settings</Link>
            <br />
        </div>
    );
}

export default Header;
