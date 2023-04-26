import React from "react";
import { Link } from "react-router-dom";
import phoenixLogo from "../imgs/phoenix.png";

function Header() {
    return (
        <header>
            <div className="brand">
                <img src={phoenixLogo} alt="phoenix" className="brand-logo" />
                <h3 className="brand-name">
                    phoenix
                    <br />
                    <span>wallet</span>
                </h3>
            </div>

            <nav>
                <ul>
                    <li>
                        <Link to="/">dashboard</Link>
                    </li>
                    <li>
                        <Link to="/transactions">transactions</Link>
                    </li>
                    <li>
                        <Link to="/settings">settings</Link>
                    </li>
                </ul>
            </nav>

            <button className="btn-connect">connect</button>
        </header>
    );
}

export default Header;
