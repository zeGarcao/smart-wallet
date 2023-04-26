import React from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faGithubSquare, faLinkedin } from "@fortawesome/free-brands-svg-icons";

function Footer() {
    return (
        <footer>
            <div>
                made by <span className="author-ens">zegarcao.eth</span>
            </div>
            <div className="social">
                <FontAwesomeIcon
                    icon={faGithubSquare}
                    className="social-icon"
                />{" "}
                <FontAwesomeIcon icon={faLinkedin} className="social-icon" />
            </div>
        </footer>
    );
}

export default Footer;
