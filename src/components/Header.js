import React from "react";
import { Link } from "react-router-dom";
import phoenixLogo from "../imgs/phoenix.png";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPowerOff } from "@fortawesome/free-solid-svg-icons";

function Header({ account, connect }) {
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
            <button className="btn-connect" onClick={connect}>
                {account
                    ? `0x...${account.slice(account.length - 4)}`
                    : "connect"}
            </button>
        </header>
    );
}

export default Header;
