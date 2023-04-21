import React from "react";
import { Link } from "react-router-dom";
import phoenixLogo from "../imgs/phoenix.gif";

function Header() {
    return (
        <header>
            <div className="brand">
                <img src={phoenixLogo} alt="logo" className="brand-logo" />
                <h2 className="brand-name">wallet</h2>
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
            <button>connect</button>
            <label className="navbar-toggler" htmlFor="toggle">
                <span className="bar"></span>
                <span className="bar"></span>
                <span className="bar"></span>
            </label>
            <input type="checkbox" id="toggle" />
        </header>
    );
}

export default Header;
